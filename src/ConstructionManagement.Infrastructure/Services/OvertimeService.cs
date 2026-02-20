using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for managing overtime requests and calculations.
/// </summary>
public class OvertimeService : IOvertimeService
{
    private readonly IRepository<OvertimeRule> _ruleRepository;
    private readonly IRepository<OvertimeRecord> _recordRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OvertimeService> _logger;

    public OvertimeService(
        IRepository<OvertimeRule> ruleRepository,
        IRepository<OvertimeRecord> recordRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork,
        ILogger<OvertimeService> logger)
    {
        _ruleRepository = ruleRepository;
        _recordRepository = recordRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    #region Rules

    public async Task<int> CreateOvertimeRuleAsync(CreateOvertimeRuleRequest request, int companyId)
    {
        var rule = new OvertimeRule
        {
            CompanyId = companyId,
            Name = request.Name,
            Description = request.Description,
            Multiplier = request.Multiplier,
            ApplicableDay = request.ApplicableDay,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Priority = request.Priority,
            IsActive = true
        };

        await _ruleRepository.AddAsync(rule);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Overtime rule {Id} created: {Name}", rule.Id, rule.Name);
        return rule.Id;
    }

    public async Task<List<OvertimeRuleDto>> GetOvertimeRulesAsync(int companyId)
    {
        var rules = await _ruleRepository.AsQueryable()
            .Where(r => r.CompanyId == companyId && r.IsActive)
            .OrderByDescending(r => r.Priority)
            .ToListAsync();

        return rules.Select(MapRuleToDto).ToList();
    }

    public async Task<OvertimeRuleDto?> GetApplicableRuleAsync(DateTime date, TimeSpan startTime, int companyId)
    {
        var dayOfWeek = date.DayOfWeek;
        var rules = await _ruleRepository.AsQueryable()
            .Where(r => r.CompanyId == companyId && r.IsActive)
            .OrderByDescending(r => r.Priority)
            .ToListAsync();

        // Find the most specific rule that applies
        OvertimeRule? applicableRule = null;

        foreach (var rule in rules)
        {
            // Check if rule applies to this day
            if (rule.ApplicableDay.HasValue && rule.ApplicableDay.Value != dayOfWeek)
                continue;

            // Check if rule applies to this time
            if (rule.StartTime.HasValue && rule.EndTime.HasValue)
            {
                if (startTime >= rule.StartTime.Value && startTime <= rule.EndTime.Value)
                {
                    applicableRule = rule;
                    break;
                }
            }
            else if (rule.ApplicableDay == dayOfWeek)
            {
                applicableRule = rule;
                break;
            }
            else if (!rule.ApplicableDay.HasValue && !rule.StartTime.HasValue)
            {
                // General rule (applies to any day/time)
                if (applicableRule == null)
                    applicableRule = rule;
            }
        }

        return applicableRule != null ? MapRuleToDto(applicableRule) : null;
    }

    #endregion

    #region Records

    public async Task<int> SubmitOvertimeRequestAsync(CreateOvertimeRequest request, int createdByUserId, int companyId)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
            throw new ArgumentException("User not found");

        // Calculate hours
        var hours = CalculateHours(request.StartTime, request.EndTime);
        if (hours <= 0)
            throw new ArgumentException("Invalid time range");

        // Get applicable rule
        var rule = await GetApplicableRuleAsync(request.Date, request.StartTime, companyId);
        var multiplier = rule?.Multiplier ?? 1.5m;

        // Get hourly rate
        var hourlyRate = await GetUserHourlyRateAsync(request.UserId);
        var calculatedAmount = hours * hourlyRate * multiplier;

        var record = new OvertimeRecord
        {
            CompanyId = companyId,
            UserId = request.UserId,
            ProjectId = request.ProjectId,
            Date = request.Date,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Hours = hours,
            OvertimeRuleId = rule != null ? int.Parse(rule.Id.ToString()) : null,
            Multiplier = multiplier,
            HourlyRate = hourlyRate,
            CalculatedAmount = calculatedAmount,
            Status = OvertimeStatus.Pending,
            Reason = request.Reason
        };

        await _recordRepository.AddAsync(record);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Overtime request {Id} submitted for user {UserId}", record.Id, request.UserId);
        return record.Id;
    }

    public async Task<OvertimeDto?> GetOvertimeByIdAsync(int overtimeId)
    {
        var record = await _recordRepository.AsQueryable()
            .Include(o => o.User)
            .Include(o => o.Project)
            .Include(o => o.OvertimeRule)
            .Include(o => o.ApprovedByUser)
            .FirstOrDefaultAsync(o => o.Id == overtimeId);

        return record == null ? null : MapToDto(record);
    }

    public async Task<List<OvertimeListItemDto>> GetOvertimeForUserAsync(int userId, DateTime? from = null, DateTime? to = null)
    {
        var query = _recordRepository.AsQueryable()
            .Include(o => o.User)
            .Include(o => o.Project)
            .Where(o => o.UserId == userId);

        if (from.HasValue)
            query = query.Where(o => o.Date >= from.Value);
        if (to.HasValue)
            query = query.Where(o => o.Date <= to.Value);

        var records = await query.OrderByDescending(o => o.Date).ToListAsync();
        return records.Select(MapToListItem).ToList();
    }

    public async Task<OvertimeSummaryDto> GetOvertimeSummaryAsync(int? projectId = null, int? companyId = null)
    {
        var query = _recordRepository.AsQueryable();

        if (projectId.HasValue)
            query = query.Where(o => o.ProjectId == projectId.Value);
        if (companyId.HasValue)
            query = query.Where(o => o.CompanyId == companyId.Value);

        var records = await query.ToListAsync();

        var pendingApprovals = records
            .Where(o => o.Status == OvertimeStatus.Pending)
            .Select(MapToListItem)
            .ToList();

        return new OvertimeSummaryDto(
            TotalRecords: records.Count,
            PendingCount: records.Count(o => o.Status == OvertimeStatus.Pending),
            ApprovedCount: records.Count(o => o.Status == OvertimeStatus.Approved),
            RejectedCount: records.Count(o => o.Status == OvertimeStatus.Rejected),
            TotalHours: records.Sum(o => o.Hours),
            TotalAmount: records.Sum(o => o.CalculatedAmount),
            PendingAmount: records.Where(o => o.Status == OvertimeStatus.Pending).Sum(o => o.CalculatedAmount),
            ApprovedAmount: records.Where(o => o.Status == OvertimeStatus.Approved).Sum(o => o.CalculatedAmount),
            PendingApprovals: pendingApprovals
        );
    }

    #endregion

    #region Approval

    public async Task<bool> ApproveOvertimeAsync(int overtimeId, int approverId, string? notes = null)
    {
        var record = await _recordRepository.GetByIdAsync(overtimeId);
        if (record == null) return false;

        if (record.Status != OvertimeStatus.Pending)
            return false;

        record.Status = OvertimeStatus.Approved;
        record.ApprovedByUserId = approverId;
        record.ApprovedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Overtime {Id} approved by {ApproverId}", overtimeId, approverId);
        return true;
    }

    public async Task<bool> RejectOvertimeAsync(int overtimeId, int rejectorId, string reason)
    {
        var record = await _recordRepository.GetByIdAsync(overtimeId);
        if (record == null) return false;

        if (record.Status != OvertimeStatus.Pending)
            return false;

        record.Status = OvertimeStatus.Rejected;
        record.ApprovedByUserId = rejectorId;
        record.ApprovedAt = DateTime.UtcNow;
        record.RejectionReason = reason;

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Overtime {Id} rejected by {RejectorId}: {Reason}", overtimeId, rejectorId, reason);
        return true;
    }

    public async Task<List<OvertimeListItemDto>> GetPendingApprovalsAsync(int managerId)
    {
        // TODO: Filter by manager's team
        var records = await _recordRepository.AsQueryable()
            .Include(o => o.User)
            .Include(o => o.Project)
            .Where(o => o.Status == OvertimeStatus.Pending)
            .OrderBy(o => o.Date)
            .ToListAsync();

        return records.Select(MapToListItem).ToList();
    }

    #endregion

    #region Calculation

    public async Task<OvertimeCalculationDto> CalculateOvertimeAsync(int userId, DateTime date, TimeSpan startTime, TimeSpan endTime)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new ArgumentException("User not found");

        var hours = CalculateHours(startTime, endTime);
        var hourlyRate = await GetUserHourlyRateAsync(userId);
        
        // Get applicable rule (need company ID)
        var companyId = user.CompanyId ?? 0;
        var rule = await GetApplicableRuleAsync(date, startTime, companyId);
        var multiplier = rule?.Multiplier ?? 1.5m;
        var ruleName = rule?.Name ?? "عادي";

        var calculatedAmount = hours * hourlyRate * multiplier;

        return new OvertimeCalculationDto(
            Hours: hours,
            Multiplier: multiplier,
            HourlyRate: hourlyRate,
            CalculatedAmount: calculatedAmount,
            AppliedRule: ruleName
        );
    }

    public async Task<decimal> GetUserHourlyRateAsync(int userId)
    {
        var user = await _userRepository.AsQueryable()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || !user.BaseSalary.HasValue)
            return 0;

        // Assuming 22 working days per month, 8 hours per day
        var monthlyHours = 22m * 8m;
        return user.BaseSalary.Value / monthlyHours;
    }

    private static decimal CalculateHours(TimeSpan start, TimeSpan end)
    {
        var diff = end - start;
        if (diff < TimeSpan.Zero)
            diff = diff.Add(TimeSpan.FromHours(24)); // Overnight shift

        return (decimal)diff.TotalHours;
    }

    #endregion

    #region Mapping

    private static OvertimeRuleDto MapRuleToDto(OvertimeRule r) => new(
        Id: r.Id,
        Name: r.Name,
        Description: r.Description,
        Multiplier: r.Multiplier,
        ApplicableDay: r.ApplicableDay?.ToString(),
        StartTime: r.StartTime?.ToString(@"hh\:mm"),
        EndTime: r.EndTime?.ToString(@"hh\:mm"),
        IsActive: r.IsActive,
        Priority: r.Priority
    );

    private static OvertimeDto MapToDto(OvertimeRecord r) => new(
        Id: r.Id,
        UserId: r.UserId,
        UserFullName: r.User?.FullName ?? "",
        ProjectId: r.ProjectId,
        ProjectName: r.Project?.Name,
        Date: r.Date,
        StartTime: r.StartTime,
        EndTime: r.EndTime,
        Hours: r.Hours,
        OvertimeRuleId: r.OvertimeRuleId,
        RuleName: r.OvertimeRule?.Name,
        Multiplier: r.Multiplier,
        HourlyRate: r.HourlyRate,
        CalculatedAmount: r.CalculatedAmount,
        Currency: r.Currency,
        Status: r.Status.ToString(),
        StatusDisplayName: GetStatusDisplayName(r.Status),
        Reason: r.Reason,
        ApprovedByUserId: r.ApprovedByUserId,
        ApprovedByFullName: r.ApprovedByUser?.FullName,
        ApprovedAt: r.ApprovedAt,
        RejectionReason: r.RejectionReason,
        PayrollId: r.PayrollId
    );

    private static OvertimeListItemDto MapToListItem(OvertimeRecord r) => new(
        Id: r.Id,
        UserId: r.UserId,
        UserFullName: r.User?.FullName ?? "",
        ProjectId: r.ProjectId,
        ProjectName: r.Project?.Name,
        Date: r.Date,
        Hours: r.Hours,
        Multiplier: r.Multiplier,
        CalculatedAmount: r.CalculatedAmount,
        Currency: r.Currency,
        Status: r.Status.ToString(),
        StatusDisplayName: GetStatusDisplayName(r.Status),
        Reason: r.Reason
    );

    private static string GetStatusDisplayName(OvertimeStatus status) => status switch
    {
        OvertimeStatus.Pending => "معلق",
        OvertimeStatus.Approved => "موافق عليه",
        OvertimeStatus.Rejected => "مرفوض",
        OvertimeStatus.Paid => "مدفوع",
        OvertimeStatus.Cancelled => "ملغى",
        _ => status.ToString()
    };

    #endregion
}
