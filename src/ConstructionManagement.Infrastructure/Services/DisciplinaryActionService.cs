using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    public class DisciplinaryActionService : IDisciplinaryActionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DisciplinaryActionService> _logger;

        public DisciplinaryActionService(
            ApplicationDbContext context,
            ILogger<DisciplinaryActionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Action Types

        public async Task<List<DisciplinaryActionTypeDto>> GetActionTypesAsync(int? companyId, bool? isActive = null)
        {
            var query = _context.DisciplinaryActionTypes
                .Where(t => t.CompanyId == companyId);

            if (isActive.HasValue)
                query = query.Where(t => t.IsActive == isActive);

            var types = await query.OrderBy(t => t.SeverityLevel).ThenBy(t => t.Name).ToListAsync();

            var usageCounts = await _context.DisciplinaryActions
                .Where(a => a.CompanyId == companyId)
                .GroupBy(a => a.ActionTypeId)
                .Select(g => new { ActionTypeId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ActionTypeId, x => x.Count);

            return types.Select(t => new DisciplinaryActionTypeDto
            {
                Id = t.Id,
                CompanyId = t.CompanyId,
                Name = t.Name,
                Description = t.Description,
                SeverityLevel = t.SeverityLevel,
                Points = t.Points,
                ValidityPeriodDays = t.ValidityPeriodDays,
                IsActive = t.IsActive,
                UsageCount = usageCounts.GetValueOrDefault(t.Id, 0)
            }).ToList();
        }

        public async Task<DisciplinaryActionTypeDto> GetActionTypeByIdAsync(int id)
        {
            var type = await _context.DisciplinaryActionTypes.FindAsync(id);
            if (type == null) return null!;

            var usageCount = await _context.DisciplinaryActions.CountAsync(a => a.ActionTypeId == id);

            return new DisciplinaryActionTypeDto
            {
                Id = type.Id,
                CompanyId = type.CompanyId,
                Name = type.Name,
                Description = type.Description,
                SeverityLevel = type.SeverityLevel,
                Points = type.Points,
                ValidityPeriodDays = type.ValidityPeriodDays,
                IsActive = type.IsActive,
                UsageCount = usageCount
            };
        }

        public async Task<DisciplinaryActionTypeDto> CreateActionTypeAsync(CreateDisciplinaryActionTypeRequest request, int? companyId)
        {
            var type = new DisciplinaryActionType
            {
                CompanyId = companyId,
                Name = request.Name,
                Description = request.Description,
                SeverityLevel = request.SeverityLevel,
                Points = request.Points,
                ValidityPeriodDays = request.ValidityPeriodDays,
                IsActive = true
            };

            _context.DisciplinaryActionTypes.Add(type);
            await _context.SaveChangesAsync();

            return await GetActionTypeByIdAsync(type.Id);
        }

        public async Task<DisciplinaryActionTypeDto> UpdateActionTypeAsync(int id, UpdateDisciplinaryActionTypeRequest request)
        {
            var type = await _context.DisciplinaryActionTypes.FindAsync(id);
            if (type == null) return null!;

            type.Name = request.Name;
            type.Description = request.Description;
            type.SeverityLevel = request.SeverityLevel;
            type.Points = request.Points;
            type.ValidityPeriodDays = request.ValidityPeriodDays;
            type.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return await GetActionTypeByIdAsync(id);
        }

        public async Task DeleteActionTypeAsync(int id)
        {
            var type = await _context.DisciplinaryActionTypes.FindAsync(id);
            if (type == null) return;

            _context.DisciplinaryActionTypes.Remove(type);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Actions

        public async Task<List<DisciplinaryActionDto>> GetActionsAsync(int? companyId, int? employeeId = null, string? status = null)
        {
            var query = _context.DisciplinaryActions
                .Include(a => a.Employee)
                .Include(a => a.ActionType)
                .Include(a => a.IssuedByUser)
                .Include(a => a.Appeals)
                .Where(a => a.CompanyId == companyId);

            if (employeeId.HasValue)
                query = query.Where(a => a.EmployeeId == employeeId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(a => a.Status == status);

            var actions = await query.OrderByDescending(a => a.IssueDate).ToListAsync();

            return actions.Select(a => MapActionToDto(a)).ToList();
        }

        public async Task<DisciplinaryActionDto> GetActionByIdAsync(int id)
        {
            var action = await _context.DisciplinaryActions
                .Include(a => a.Employee)
                .Include(a => a.ActionType)
                .Include(a => a.IssuedByUser)
                .Include(a => a.Appeals)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (action == null) return null!;

            return MapActionToDto(action);
        }

        public async Task<DisciplinaryActionDto> CreateActionAsync(CreateDisciplinaryActionRequest request, int? companyId, int issuedByUserId)
        {
            var actionType = await _context.DisciplinaryActionTypes.FindAsync(request.ActionTypeId);
            if (actionType == null) return null!;

            var action = new DisciplinaryAction
            {
                CompanyId = companyId,
                EmployeeId = request.EmployeeId,
                ActionTypeId = request.ActionTypeId,
                Reason = request.Reason,
                Description = request.Description,
                IncidentDate = request.IncidentDate,
                IssueDate = request.IssueDate,
                IssuedByUserId = issuedByUserId,
                Status = "Active",
                ExpiryDate = actionType.ValidityPeriodDays.HasValue
                    ? request.IssueDate.AddDays(actionType.ValidityPeriodDays.Value)
                    : null
            };

            _context.DisciplinaryActions.Add(action);
            await _context.SaveChangesAsync();

            // Update employee disciplinary record
            await UpdateEmployeeRecordAsync(request.EmployeeId, companyId);

            return await GetActionByIdAsync(action.Id);
        }

        public async Task<DisciplinaryActionDto> UpdateActionAsync(int id, UpdateDisciplinaryActionRequest request)
        {
            var action = await _context.DisciplinaryActions.FindAsync(id);
            if (action == null) return null!;

            action.Reason = request.Reason;
            action.Description = request.Description;
            action.Status = request.Status;

            await _context.SaveChangesAsync();

            return await GetActionByIdAsync(id);
        }

        public async Task DeleteActionAsync(int id)
        {
            var action = await _context.DisciplinaryActions.FindAsync(id);
            if (action == null) return;

            var employeeId = action.EmployeeId;
            var companyId = action.CompanyId;

            _context.DisciplinaryActions.Remove(action);
            await _context.SaveChangesAsync();

            // Update employee disciplinary record
            await UpdateEmployeeRecordAsync(employeeId, companyId);
        }

        public async Task<DisciplinaryActionDto> AttachDocumentAsync(int id, string documentPath)
        {
            var action = await _context.DisciplinaryActions.FindAsync(id);
            if (action == null) return null!;

            action.DocumentPath = documentPath;
            await _context.SaveChangesAsync();

            return await GetActionByIdAsync(id);
        }

        #endregion

        #region Appeals

        public async Task<DisciplinaryAppealDto> SubmitAppealAsync(CreateDisciplinaryAppealRequest request)
        {
            var action = await _context.DisciplinaryActions.FindAsync(request.DisciplinaryActionId);
            if (action == null) return null!;

            var appeal = new DisciplinaryAppeal
            {
                DisciplinaryActionId = request.DisciplinaryActionId,
                Reason = request.Reason,
                SubmittedAt = DateTime.UtcNow,
                Status = "Pending"
            };

            action.Status = "Appealed";

            _context.DisciplinaryAppeals.Add(appeal);
            await _context.SaveChangesAsync();

            return await GetAppealByIdAsync(appeal.Id);
        }

        public async Task<DisciplinaryAppealDto> ReviewAppealAsync(int appealId, ReviewAppealRequest request, int reviewerId)
        {
            var appeal = await _context.DisciplinaryAppeals
                .Include(a => a.Action)
                .FirstOrDefaultAsync(a => a.Id == appealId);

            if (appeal == null) return null!;

            appeal.Status = request.Approve ? "Approved" : "Rejected";
            appeal.ReviewedByUserId = reviewerId;
            appeal.ReviewedAt = DateTime.UtcNow;
            appeal.ReviewNotes = request.Notes;

            // Update action status
            if (appeal.Action != null)
            {
                appeal.Action.Status = request.Approve ? "Rescinded" : "Active";
            }

            await _context.SaveChangesAsync();

            // Update employee record
            if (appeal.Action != null)
            {
                await UpdateEmployeeRecordAsync(appeal.Action.EmployeeId, appeal.Action.CompanyId);
            }

            return await GetAppealByIdAsync(appealId);
        }

        public async Task<List<DisciplinaryAppealDto>> GetPendingAppealsAsync(int? companyId)
        {
            var appeals = await _context.DisciplinaryAppeals
                .Include(a => a.Action)
                    .ThenInclude(ac => ac.Employee)
                .Include(a => a.Action)
                    .ThenInclude(ac => ac.ActionType)
                .Where(a => a.Status == "Pending" && a.Action.CompanyId == companyId)
                .OrderBy(a => a.SubmittedAt)
                .ToListAsync();

            return appeals.Select(a => new DisciplinaryAppealDto
            {
                Id = a.Id,
                DisciplinaryActionId = a.DisciplinaryActionId,
                Reason = a.Reason,
                SubmittedAt = a.SubmittedAt,
                Status = a.Status
            }).ToList();
        }

        private async Task<DisciplinaryAppealDto> GetAppealByIdAsync(int id)
        {
            var appeal = await _context.DisciplinaryAppeals
                .Include(a => a.Action)
                    .ThenInclude(ac => ac.Employee)
                .Include(a => a.ReviewedByUser)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appeal == null) return null!;

            return new DisciplinaryAppealDto
            {
                Id = appeal.Id,
                DisciplinaryActionId = appeal.DisciplinaryActionId,
                Reason = appeal.Reason,
                SubmittedAt = appeal.SubmittedAt,
                Status = appeal.Status,
                ReviewedByUserId = appeal.ReviewedByUserId,
                ReviewedByName = appeal.ReviewedByUser?.FullName,
                ReviewedAt = appeal.ReviewedAt,
                ReviewNotes = appeal.ReviewNotes
            };
        }

        #endregion

        #region Records

        public async Task<EmployeeDisciplinaryRecordDto> GetEmployeeRecordAsync(int employeeId)
        {
            var record = await _context.EmployeeDisciplinaryRecords
                .Include(r => r.Employee)
                .FirstOrDefaultAsync(r => r.EmployeeId == employeeId);

            if (record == null)
            {
                // Create record if doesn't exist
                var employee = await _context.Users.FindAsync(employeeId);
                if (employee == null) return null!;

                record = new EmployeeDisciplinaryRecord
                {
                    CompanyId = employee.CompanyId,
                    EmployeeId = employeeId,
                    TotalPoints = 0,
                    ActiveWarnings = 0
                };

                _context.EmployeeDisciplinaryRecords.Add(record);
                await _context.SaveChangesAsync();
            }

            var recentActions = await _context.DisciplinaryActions
                .Include(a => a.ActionType)
                .Include(a => a.IssuedByUser)
                .Where(a => a.EmployeeId == employeeId && a.Status == "Active")
                .OrderByDescending(a => a.IssueDate)
                .Take(5)
                .ToListAsync();

            return new EmployeeDisciplinaryRecordDto
            {
                Id = record.Id,
                EmployeeId = record.EmployeeId,
                EmployeeName = record.Employee?.FullName ?? "",
                TotalPoints = record.TotalPoints,
                ActiveWarnings = record.ActiveWarnings,
                LastWarningDate = record.LastWarningDate,
                NextExpiryDate = record.NextExpiryDate,
                RecentActions = recentActions.Select(a => MapActionToDto(a)).ToList()
            };
        }

        public async Task<List<EmployeeDisciplinaryRecordDto>> GetEmployeeRecordsAsync(int? companyId)
        {
            var records = await _context.EmployeeDisciplinaryRecords
                .Include(r => r.Employee)
                .Where(r => r.CompanyId == companyId)
                .OrderBy(r => r.Employee.FullName)
                .ToListAsync();

            return records.Select(r => new EmployeeDisciplinaryRecordDto
            {
                Id = r.Id,
                EmployeeId = r.EmployeeId,
                EmployeeName = r.Employee?.FullName ?? "",
                TotalPoints = r.TotalPoints,
                ActiveWarnings = r.ActiveWarnings,
                LastWarningDate = r.LastWarningDate,
                NextExpiryDate = r.NextExpiryDate
            }).ToList();
        }

        private async Task UpdateEmployeeRecordAsync(int employeeId, int? companyId)
        {
            var now = DateTime.UtcNow;

            var activeActions = await _context.DisciplinaryActions
                .Include(a => a.ActionType)
                .Where(a => a.EmployeeId == employeeId && a.Status == "Active")
                .ToListAsync();

            var record = await _context.EmployeeDisciplinaryRecords
                .FirstOrDefaultAsync(r => r.EmployeeId == employeeId);

            if (record == null)
            {
                record = new EmployeeDisciplinaryRecord
                {
                    CompanyId = companyId,
                    EmployeeId = employeeId
                };
                _context.EmployeeDisciplinaryRecords.Add(record);
            }

            record.TotalPoints = activeActions
                .Where(a => a.ActionType?.Points.HasValue == true)
                .Sum(a => a.ActionType!.Points!.Value);

            record.ActiveWarnings = activeActions.Count;
            record.LastWarningDate = activeActions.Any()
                ? activeActions.Max(a => a.IssueDate)
                : null;
            record.NextExpiryDate = activeActions
                .Where(a => a.ExpiryDate.HasValue && a.ExpiryDate > now)
                .Min(a => a.ExpiryDate as DateTime?);

            await _context.SaveChangesAsync();
        }

        #endregion

        #region Dashboard

        public async Task<DisciplinaryDashboardDto> GetDashboardAsync(int? companyId)
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var actions = await _context.DisciplinaryActions
                .Include(a => a.Employee)
                .Include(a => a.ActionType)
                .Include(a => a.IssuedByUser)
                .Where(a => a.CompanyId == companyId)
                .ToListAsync();

            var pendingAppeals = await _context.DisciplinaryAppeals
                .CountAsync(a => a.Status == "Pending" && a.Action.CompanyId == companyId);

            var expiringThisMonth = actions.Count(a =>
                a.Status == "Active" &&
                a.ExpiryDate.HasValue &&
                a.ExpiryDate.Value.Month == now.Month &&
                a.ExpiryDate.Value.Year == now.Year);

            var recentActions = actions
                .OrderByDescending(a => a.IssueDate)
                .Take(10)
                .Select(a => MapActionToDto(a))
                .ToList();

            return new DisciplinaryDashboardDto
            {
                TotalActiveActions = actions.Count(a => a.Status == "Active"),
                PendingAppeals = pendingAppeals,
                ActionsThisMonth = actions.Count(a => a.IssueDate >= startOfMonth),
                ExpiringThisMonth = expiringThisMonth,
                RecentActions = recentActions
            };
        }

        #endregion

        #region Maintenance

        public async Task ProcessExpiredActionsAsync()
        {
            var now = DateTime.UtcNow;

            var expiredActions = await _context.DisciplinaryActions
                .Where(a => a.Status == "Active" && a.ExpiryDate.HasValue && a.ExpiryDate <= now)
                .ToListAsync();

            foreach (var action in expiredActions)
            {
                action.Status = "Expired";
            }

            await _context.SaveChangesAsync();

            // Update records for affected employees
            var affectedEmployeeIds = expiredActions.Select(a => a.EmployeeId).Distinct();
            foreach (var employeeId in affectedEmployeeIds)
            {
                var action = expiredActions.First(a => a.EmployeeId == employeeId);
                await UpdateEmployeeRecordAsync(employeeId, action.CompanyId);
            }
        }

        #endregion

        #region Helpers

        private DisciplinaryActionDto MapActionToDto(DisciplinaryAction a)
        {
            return new DisciplinaryActionDto
            {
                Id = a.Id,
                CompanyId = a.CompanyId,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee?.FullName ?? "",
                ActionTypeId = a.ActionTypeId,
                ActionTypeName = a.ActionType?.Name ?? "",
                SeverityLevel = a.ActionType?.SeverityLevel ?? 0,
                Reason = a.Reason,
                Description = a.Description,
                IncidentDate = a.IncidentDate,
                IssueDate = a.IssueDate,
                IssuedByUserId = a.IssuedByUserId,
                IssuedByName = a.IssuedByUser?.FullName ?? "",
                Status = a.Status,
                ExpiryDate = a.ExpiryDate,
                DocumentPath = a.DocumentPath,
                HasAppeal = a.Appeals?.Any() ?? false,
                CreatedAt = a.CreatedAt
            };
        }

        #endregion
    }
}
