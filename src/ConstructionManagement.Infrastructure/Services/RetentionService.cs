using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for managing retention schedules.
/// </summary>
public class RetentionService : IRetentionService
{
    private readonly IRepository<RetentionSchedule> _retentionRepository;
    private readonly IRepository<ProgressInvoice> _invoiceRepository;
    private readonly IRepository<Project> _projectRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RetentionService> _logger;

    public RetentionService(
        IRepository<RetentionSchedule> retentionRepository,
        IRepository<ProgressInvoice> invoiceRepository,
        IRepository<Project> projectRepository,
        IUnitOfWork unitOfWork,
        ILogger<RetentionService> logger)
    {
        _retentionRepository = retentionRepository;
        _invoiceRepository = invoiceRepository;
        _projectRepository = projectRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<int> CreateRetentionScheduleAsync(CreateRetentionRequest request, int createdByUserId, int companyId)
    {
        var invoice = await _invoiceRepository.AsQueryable()
            .Include(i => i.Project)
            .FirstOrDefaultAsync(i => i.Id == request.ProgressInvoiceId);

        if (invoice == null)
            throw new ArgumentException("Invoice not found");

        var retentionDate = request.RetentionDate ?? invoice.InvoiceDate;
        var releaseDate = retentionDate.AddMonths(request.RetentionPeriodMonths);

        var retention = new RetentionSchedule
        {
            CompanyId = companyId,
            ProjectId = request.ProjectId,
            ProgressInvoiceId = request.ProgressInvoiceId,
            RetentionAmount = request.RetentionAmount,
            Currency = request.Currency ?? invoice.Currency,
            RetentionDate = retentionDate,
            ReleaseDate = releaseDate,
            RetentionPeriodMonths = request.RetentionPeriodMonths,
            Status = RetentionStatus.Held,
            RemainingAmount = request.RetentionAmount,
            Notes = request.Notes
        };

        await _retentionRepository.AddAsync(retention);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Retention schedule {Id} created for invoice {InvoiceId}", retention.Id, request.ProgressInvoiceId);
        return retention.Id;
    }

    public async Task<RetentionDto?> GetRetentionByIdAsync(int retentionId)
    {
        var retention = await _retentionRepository.AsQueryable()
            .Include(r => r.Project)
            .Include(r => r.ProgressInvoice)
            .Include(r => r.ReleasedByUser)
            .FirstOrDefaultAsync(r => r.Id == retentionId);

        return retention == null ? null : MapToDto(retention);
    }

    public async Task<List<RetentionListItemDto>> GetRetentionsForProjectAsync(int projectId)
    {
        var retentions = await _retentionRepository.AsQueryable()
            .Include(r => r.Project)
            .Include(r => r.ProgressInvoice)
            .Where(r => r.ProjectId == projectId)
            .OrderByDescending(r => r.RetentionDate)
            .ToListAsync();

        return retentions.Select(MapToListItem).ToList();
    }

    public async Task<RetentionSummaryDto> GetRetentionSummaryAsync(int companyId)
    {
        var retentions = await _retentionRepository.AsQueryable()
            .Where(r => r.CompanyId == companyId)
            .ToListAsync();

        var dueForRelease = retentions
            .Where(r => r.Status == RetentionStatus.DueForRelease || 
                       (r.Status == RetentionStatus.Held && r.ReleaseDate <= DateTime.UtcNow))
            .Select(MapToListItem)
            .ToList();

        return new RetentionSummaryDto(
            TotalRetentions: retentions.Count,
            HeldCount: retentions.Count(r => r.Status == RetentionStatus.Held),
            DueForReleaseCount: retentions.Count(r => r.Status == RetentionStatus.DueForRelease),
            ReleasedCount: retentions.Count(r => r.Status == RetentionStatus.Released),
            TotalHeldAmount: retentions.Where(r => r.Status == RetentionStatus.Held).Sum(r => r.RetentionAmount),
            TotalReleasedAmount: retentions.Where(r => r.Status == RetentionStatus.Released).Sum(r => r.ReleasedAmount),
            TotalPendingAmount: retentions.Where(r => r.Status == RetentionStatus.Held || r.Status == RetentionStatus.DueForRelease).Sum(r => r.RemainingAmount),
            DueForRelease: dueForRelease
        );
    }

    public async Task<bool> ReleaseRetentionAsync(int retentionId, ReleaseRetentionRequest request, int releasedByUserId)
    {
        var retention = await _retentionRepository.GetByIdAsync(retentionId);
        if (retention == null) return false;

        var releaseAmount = request.Amount ?? retention.RemainingAmount;

        if (releaseAmount > retention.RemainingAmount)
            throw new ArgumentException("Release amount exceeds remaining amount");

        retention.ReleasedAmount += releaseAmount;
        retention.RemainingAmount -= releaseAmount;
        retention.ReleasedByUserId = releasedByUserId;
        retention.ActualReleaseDate = DateTime.UtcNow;

        if (retention.RemainingAmount == 0)
        {
            retention.Status = RetentionStatus.Released;
        }
        else
        {
            retention.Status = RetentionStatus.PartiallyReleased;
        }

        if (request.Notes != null)
        {
            retention.Notes = string.IsNullOrEmpty(retention.Notes)
                ? request.Notes
                : $"{retention.Notes}\n{request.Notes}";
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Retention {Id} released. Amount: {Amount}", retentionId, releaseAmount);
        return true;
    }

    public async Task<bool> CancelRetentionAsync(int retentionId, string reason, int userId)
    {
        var retention = await _retentionRepository.GetByIdAsync(retentionId);
        if (retention == null) return false;

        if (retention.Status == RetentionStatus.Released)
            throw new InvalidOperationException("Cannot cancel a released retention");

        retention.Status = RetentionStatus.Cancelled;
        retention.Notes = string.IsNullOrEmpty(retention.Notes)
            ? $"Cancelled: {reason}"
            : $"{retention.Notes}\nCancelled: {reason}";

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task CheckDueRetentionsAsync()
    {
        var today = DateTime.UtcNow.Date;
        
        var dueRetentions = await _retentionRepository.AsQueryable()
            .Where(r => r.Status == RetentionStatus.Held && r.ReleaseDate.Date <= today)
            .ToListAsync();

        foreach (var retention in dueRetentions)
        {
            retention.Status = RetentionStatus.DueForRelease;
            _logger.LogInformation("Retention {Id} is now due for release", retention.Id);
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task SendRetentionRemindersAsync()
    {
        var today = DateTime.UtcNow.Date;
        var reminderDate = today.AddDays(7); // Remind 7 days before

        var retentionsToRemind = await _retentionRepository.AsQueryable()
            .Where(r => r.Status == RetentionStatus.Held && 
                       r.ReleaseDate.Date <= reminderDate &&
                       r.ReleaseDate.Date > today)
            .ToListAsync();

        foreach (var retention in retentionsToRemind)
        {
            // TODO: Send actual notification
            retention.ReminderCount++;
            retention.LastReminderDate = DateTime.UtcNow;
            _logger.LogInformation("Retention reminder sent for retention {Id}", retention.Id);
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<RetentionListItemDto>> GetDueForReleaseAsync(int companyId)
    {
        var retentions = await _retentionRepository.AsQueryable()
            .Include(r => r.Project)
            .Include(r => r.ProgressInvoice)
            .Where(r => r.CompanyId == companyId &&
                       (r.Status == RetentionStatus.DueForRelease || 
                        (r.Status == RetentionStatus.Held && r.ReleaseDate <= DateTime.UtcNow)))
            .OrderBy(r => r.ReleaseDate)
            .ToListAsync();

        return retentions.Select(MapToListItem).ToList();
    }

    public async Task<List<RetentionListItemDto>> GetOverdueRetentionsAsync(int companyId)
    {
        var today = DateTime.UtcNow.Date;

        var retentions = await _retentionRepository.AsQueryable()
            .Include(r => r.Project)
            .Include(r => r.ProgressInvoice)
            .Where(r => r.CompanyId == companyId &&
                       r.Status == RetentionStatus.DueForRelease &&
                       r.ReleaseDate.Date < today)
            .OrderBy(r => r.ReleaseDate)
            .ToListAsync();

        return retentions.Select(MapToListItem).ToList();
    }

    #region Private Methods

    private static RetentionDto MapToDto(RetentionSchedule r) => new(
        Id: r.Id,
        ProjectId: r.ProjectId,
        ProjectName: r.Project?.Name ?? "",
        ProgressInvoiceId: r.ProgressInvoiceId,
        InvoiceNumber: r.ProgressInvoice?.InvoiceNumber ?? "",
        RetentionAmount: r.RetentionAmount,
        Currency: r.Currency,
        RetentionDate: r.RetentionDate,
        RetentionPeriodMonths: r.RetentionPeriodMonths,
        ReleaseDate: r.ReleaseDate,
        ActualReleaseDate: r.ActualReleaseDate,
        Status: r.Status.ToString(),
        StatusDisplayName: GetStatusDisplayName(r.Status),
        ReleasedAmount: r.ReleasedAmount,
        RemainingAmount: r.RemainingAmount,
        Notes: r.Notes,
        ReleasedByUserId: r.ReleasedByUserId,
        ReleasedByFullName: r.ReleasedByUser?.FullName,
        ReleasedAt: r.ActualReleaseDate,
        ReminderCount: r.ReminderCount,
        LastReminderDate: r.LastReminderDate
    );

    private static RetentionListItemDto MapToListItem(RetentionSchedule r) => new(
        Id: r.Id,
        ProjectId: r.ProjectId,
        ProjectName: r.Project?.Name ?? "",
        ProgressInvoiceId: r.ProgressInvoiceId,
        InvoiceNumber: r.ProgressInvoice?.InvoiceNumber ?? "",
        RetentionAmount: r.RetentionAmount,
        Currency: r.Currency,
        RetentionDate: r.RetentionDate,
        ReleaseDate: r.ReleaseDate,
        Status: r.Status.ToString(),
        StatusDisplayName: GetStatusDisplayName(r.Status),
        ReleasedAmount: r.ReleasedAmount,
        RemainingAmount: r.RemainingAmount,
        DaysUntilRelease: Math.Max(0, (r.ReleaseDate - DateTime.UtcNow).Days),
        IsOverdue: r.ReleaseDate < DateTime.UtcNow && r.Status != RetentionStatus.Released
    );

    private static string GetStatusDisplayName(RetentionStatus status) => status switch
    {
        RetentionStatus.Held => "محتجز",
        RetentionStatus.DueForRelease => "مستحق للإطلاق",
        RetentionStatus.Released => "تم الإطلاق",
        RetentionStatus.PartiallyReleased => "إطلاق جزئي",
        RetentionStatus.Cancelled => "ملغى",
        _ => status.ToString()
    };

    #endregion
}
