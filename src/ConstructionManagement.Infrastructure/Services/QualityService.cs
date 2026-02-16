using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services
{
    public class QualityService : IQualityService
    {
        private readonly ApplicationDbContext _context;

        public QualityService(ApplicationDbContext context)
        {
            _context = context;
        }

        #region Quality Standards

        public async Task<IEnumerable<QualityStandardDto>> GetQualityStandardsAsync(int companyId)
        {
            var standards = await _context.QualityStandards
                .Where(s => s.CompanyId == companyId)
                .OrderBy(s => s.Category).ThenBy(s => s.Name)
                .ToListAsync();

            return standards.Select(MapToStandardDto);
        }

        public async Task<QualityStandardDto?> GetQualityStandardByIdAsync(int id, int companyId)
        {
            var standard = await _context.QualityStandards
                .FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == companyId);

            return standard == null ? null : MapToStandardDto(standard);
        }

        public async Task<QualityStandardDto> CreateQualityStandardAsync(CreateQualityStandardRequest request, int companyId, string userId)
        {
            var standard = new QualityStandard
            {
                CompanyId = companyId,
                Name = request.Name,
                Description = request.Description,
                Category = request.Category,
                StandardCode = request.StandardCode,
                Criteria = request.Criteria,
                AcceptanceCriteria = request.AcceptanceCriteria,
                IsActive = true,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.QualityStandards.Add(standard);
            await _context.SaveChangesAsync();

            return MapToStandardDto(standard);
        }

        public async Task<QualityStandardDto> UpdateQualityStandardAsync(UpdateQualityStandardRequest request, int companyId, string userId)
        {
            var standard = await _context.QualityStandards
                .FirstOrDefaultAsync(s => s.Id == request.Id && s.CompanyId == companyId);

            if (standard == null)
                throw new KeyNotFoundException("Quality standard not found");

            standard.Name = request.Name;
            standard.Description = request.Description;
            standard.Category = request.Category;
            standard.StandardCode = request.StandardCode;
            standard.Criteria = request.Criteria;
            standard.AcceptanceCriteria = request.AcceptanceCriteria;
            standard.IsActive = request.IsActive;
            standard.UpdatedBy = userId;
            standard.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToStandardDto(standard);
        }

        public async Task<bool> DeleteQualityStandardAsync(int id, int companyId)
        {
            var standard = await _context.QualityStandards
                .FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == companyId);

            if (standard == null)
                return false;

            _context.QualityStandards.Remove(standard);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<QualityStandardDto>> GetActiveQualityStandardsByCategoryAsync(int companyId, string category)
        {
            var standards = await _context.QualityStandards
                .Where(s => s.CompanyId == companyId && s.IsActive && s.Category == category)
                .OrderBy(s => s.Name)
                .ToListAsync();

            return standards.Select(MapToStandardDto);
        }

        private static QualityStandardDto MapToStandardDto(QualityStandard standard) => new()
        {
            Id = standard.Id,
            CompanyId = standard.CompanyId ?? 0,
            Name = standard.Name,
            Description = standard.Description,
            Category = standard.Category,
            StandardCode = standard.StandardCode,
            Criteria = standard.Criteria,
            AcceptanceCriteria = standard.AcceptanceCriteria,
            IsActive = standard.IsActive,
            CreatedAt = standard.CreatedAt,
            CreatedBy = standard.CreatedBy
        };

        #endregion

        #region Quality Inspections

        public async Task<IEnumerable<QualityInspectionDto>> GetInspectionsAsync(int companyId, int? projectId = null, int? phaseId = null, string? status = null)
        {
            var query = _context.QualityInspections
                .Include(i => i.Project)
                .Include(i => i.Phase)
                .Where(i => i.CompanyId == companyId);

            if (projectId.HasValue)
                query = query.Where(i => i.ProjectId == projectId);
            if (phaseId.HasValue)
                query = query.Where(i => i.PhaseId == phaseId);
            if (!string.IsNullOrEmpty(status))
                query = query.Where(i => i.Status == status);

            var inspections = await query
                .OrderByDescending(i => i.ScheduledDate)
                .ToListAsync();

            return inspections.Select(MapToInspectionDto);
        }

        public async Task<QualityInspectionDto?> GetInspectionByIdAsync(int id, int companyId)
        {
            var inspection = await _context.QualityInspections
                .Include(i => i.Project)
                .Include(i => i.Phase)
                .Include(i => i.InspectionItems).ThenInclude(item => item.Standard)
                .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);

            return inspection == null ? null : MapToInspectionDto(inspection);
        }

        public async Task<QualityInspectionDto> CreateInspectionAsync(CreateQualityInspectionRequest request, int companyId, string userId)
        {
            var inspectionNumber = $"INS-{DateTime.UtcNow:yyyyMM}-{await GenerateInspectionNumberAsync(companyId)}";

            var inspection = new QualityInspection
            {
                CompanyId = companyId,
                ProjectId = request.ProjectId,
                PhaseId = request.PhaseId,
                InspectionNumber = inspectionNumber,
                Title = request.Title,
                Description = request.Description,
                InspectionType = request.InspectionType,
                Status = "Scheduled",
                ScheduledDate = request.ScheduledDate,
                InspectorName = request.InspectorName,
                Location = request.Location,
                WeatherConditions = request.WeatherConditions,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.QualityInspections.Add(inspection);
            await _context.SaveChangesAsync();

            // Add inspection items if provided
            if (request.Items != null && request.Items.Any())
            {
                int order = 1;
                foreach (var itemRequest in request.Items)
                {
                    var standard = await _context.QualityStandards.FindAsync(itemRequest.StandardId);
                    var item = new QualityInspectionItem
                    {
                        InspectionId = inspection.Id,
                        StandardId = itemRequest.StandardId,
                        CompanyId = companyId,
                        OrderNumber = itemRequest.OrderNumber > 0 ? itemRequest.OrderNumber : order++,
                        ItemDescription = !string.IsNullOrEmpty(itemRequest.ItemDescription) 
                            ? itemRequest.ItemDescription 
                            : standard?.Name ?? string.Empty,
                        CheckMethod = itemRequest.CheckMethod,
                        ExpectedResult = itemRequest.ExpectedResult,
                        CreatedBy = userId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.QualityInspectionItems.Add(item);
                }
                await _context.SaveChangesAsync();
            }

            return await GetInspectionByIdAsync(inspection.Id, companyId) ?? MapToInspectionDto(inspection);
        }

        public async Task<QualityInspectionDto> UpdateInspectionAsync(UpdateQualityInspectionRequest request, int companyId, string userId)
        {
            var inspection = await _context.QualityInspections
                .FirstOrDefaultAsync(i => i.Id == request.Id && i.CompanyId == companyId);

            if (inspection == null)
                throw new KeyNotFoundException("Inspection not found");

            inspection.Title = request.Title;
            inspection.Description = request.Description;
            inspection.InspectionType = request.InspectionType;
            inspection.Status = request.Status ?? inspection.Status;
            inspection.ScheduledDate = request.ScheduledDate;
            inspection.ActualStartDate = request.ActualStartDate;
            inspection.ActualEndDate = request.ActualEndDate;
            inspection.InspectorName = request.InspectorName;
            inspection.Location = request.Location;
            inspection.WeatherConditions = request.WeatherConditions;
            inspection.OverallResult = request.OverallResult;
            inspection.Score = request.Score;
            inspection.Notes = request.Notes;
            inspection.RequiresFollowUp = request.RequiresFollowUp;
            inspection.FollowUpDate = request.FollowUpDate;
            inspection.UpdatedBy = userId;
            inspection.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetInspectionByIdAsync(inspection.Id, companyId) ?? MapToInspectionDto(inspection);
        }

        public async Task<bool> DeleteInspectionAsync(int id, int companyId)
        {
            var inspection = await _context.QualityInspections
                .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);

            if (inspection == null)
                return false;

            // Delete related items and defects
            var items = await _context.QualityInspectionItems.Where(i => i.InspectionId == id).ToListAsync();
            _context.QualityInspectionItems.RemoveRange(items);

            _context.QualityInspections.Remove(inspection);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<QualityInspectionDto> StartInspectionAsync(int id, int companyId, string userId)
        {
            var inspection = await _context.QualityInspections
                .FirstOrDefaultAsync(i => i.Id == id && i.CompanyId == companyId);

            if (inspection == null)
                throw new KeyNotFoundException("Inspection not found");

            if (inspection.Status != "Scheduled")
                throw new InvalidOperationException("Inspection cannot be started");

            inspection.Status = "InProgress";
            inspection.ActualStartDate = DateTime.UtcNow;
            inspection.UpdatedBy = userId;
            inspection.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetInspectionByIdAsync(id, companyId) ?? MapToInspectionDto(inspection);
        }

        public async Task<QualityInspectionDto> CompleteInspectionAsync(CompleteInspectionRequest request, int companyId, string userId)
        {
            var inspection = await _context.QualityInspections
                .Include(i => i.InspectionItems)
                .FirstOrDefaultAsync(i => i.Id == request.Id && i.CompanyId == companyId);

            if (inspection == null)
                throw new KeyNotFoundException("Inspection not found");

            if (inspection.Status != "InProgress")
                throw new InvalidOperationException("Inspection is not in progress");

            inspection.Status = "Completed";
            inspection.ActualEndDate = DateTime.UtcNow;
            inspection.OverallResult = request.OverallResult;
            inspection.Score = request.Score;
            inspection.Notes = request.Notes;
            inspection.TotalItems = inspection.InspectionItems.Count;
            inspection.PassedItems = inspection.InspectionItems.Count(i => i.Result == "Pass");
            inspection.FailedItems = inspection.InspectionItems.Count(i => i.Result == "Fail");
            inspection.NcItems = inspection.InspectionItems.Count(i => i.Result == "Fail");
            inspection.RequiresFollowUp = inspection.FailedItems > 0;
            inspection.UpdatedBy = userId;
            inspection.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetInspectionByIdAsync(inspection.Id, companyId) ?? MapToInspectionDto(inspection);
        }

        public async Task<QualityInspectionItemDto> UpdateInspectionItemResultAsync(UpdateInspectionItemResultRequest request, int companyId, string userId)
        {
            var item = await _context.QualityInspectionItems
                .Include(i => i.Inspection)
                .FirstOrDefaultAsync(i => i.Id == request.Id && i.CompanyId == companyId);

            if (item == null)
                throw new KeyNotFoundException("Inspection item not found");

            item.ActualResult = request.ActualResult;
            item.Result = request.Result;
            item.Deviation = request.Deviation;
            item.Remarks = request.Remarks;
            item.PhotoEvidence = request.PhotoEvidence;

            await _context.SaveChangesAsync();

            return MapToInspectionItemDto(item);
        }

        public async Task<IEnumerable<QualityInspectionDto>> GetUpcomingInspectionsAsync(int companyId, int days = 7)
        {
            var endDate = DateTime.UtcNow.AddDays(days);
            var inspections = await _context.QualityInspections
                .Include(i => i.Project)
                .Include(i => i.Phase)
                .Where(i => i.CompanyId == companyId && i.Status == "Scheduled" && i.ScheduledDate <= endDate)
                .OrderBy(i => i.ScheduledDate)
                .ToListAsync();

            return inspections.Select(MapToInspectionDto);
        }

        public async Task<IEnumerable<QualityInspectionDto>> GetRecentInspectionsAsync(int companyId, int count = 10)
        {
            var inspections = await _context.QualityInspections
                .Include(i => i.Project)
                .Include(i => i.Phase)
                .Where(i => i.CompanyId == companyId)
                .OrderByDescending(i => i.CreatedAt)
                .Take(count)
                .ToListAsync();

            return inspections.Select(MapToInspectionDto);
        }

        private async Task<int> GenerateInspectionNumberAsync(int companyId)
        {
            var count = await _context.QualityInspections
                .CountAsync(i => i.CompanyId == companyId && i.CreatedAt.Year == DateTime.UtcNow.Year && i.CreatedAt.Month == DateTime.UtcNow.Month);
            return count + 1;
        }

        private static QualityInspectionDto MapToInspectionDto(QualityInspection inspection) => new()
        {
            Id = inspection.Id,
            CompanyId = inspection.CompanyId ?? 0,
            ProjectId = inspection.ProjectId ?? 0,
            PhaseId = inspection.PhaseId ?? 0,
            ProjectName = inspection.Project?.Name,
            PhaseName = inspection.Phase?.Name,
            InspectionNumber = inspection.InspectionNumber,
            Title = inspection.Title,
            Description = inspection.Description,
            InspectionType = inspection.InspectionType,
            Status = inspection.Status,
            ScheduledDate = inspection.ScheduledDate,
            ActualStartDate = inspection.ActualStartDate,
            ActualEndDate = inspection.ActualEndDate,
            InspectorName = inspection.InspectorName,
            Location = inspection.Location,
            WeatherConditions = inspection.WeatherConditions,
            OverallResult = inspection.OverallResult,
            Score = inspection.Score,
            TotalItems = inspection.TotalItems,
            PassedItems = inspection.PassedItems,
            FailedItems = inspection.FailedItems,
            NcItems = inspection.NcItems,
            Notes = inspection.Notes,
            RequiresFollowUp = inspection.RequiresFollowUp,
            FollowUpDate = inspection.FollowUpDate,
            CreatedAt = inspection.CreatedAt,
            CreatedBy = inspection.CreatedBy
        };

        private static QualityInspectionItemDto MapToInspectionItemDto(QualityInspectionItem item) => new()
        {
            Id = item.Id,
            InspectionId = item.InspectionId,
            StandardId = item.StandardId,
            OrderNumber = item.OrderNumber,
            ItemDescription = item.ItemDescription,
            CheckMethod = item.CheckMethod,
            ExpectedResult = item.ExpectedResult,
            ActualResult = item.ActualResult,
            Result = item.Result,
            Deviation = item.Deviation,
            Remarks = item.Remarks,
            PhotoEvidence = item.PhotoEvidence
        };

        #endregion

        #region Defects

        public async Task<IEnumerable<DefectDto>> GetDefectsAsync(int companyId, int? projectId = null, int? phaseId = null, string? status = null, string? severity = null)
        {
            var query = _context.Defects
                .Include(d => d.Project)
                .Include(d => d.Phase)
                .Where(d => d.CompanyId == companyId);

            if (projectId.HasValue)
                query = query.Where(d => d.ProjectId == projectId);
            if (phaseId.HasValue)
                query = query.Where(d => d.PhaseId == phaseId);
            if (!string.IsNullOrEmpty(status))
                query = query.Where(d => d.Status == status);
            if (!string.IsNullOrEmpty(severity))
                query = query.Where(d => d.Severity == severity);

            var defects = await query.OrderByDescending(d => d.ReportedDate).ToListAsync();

            return defects.Select(MapToDefectDto);
        }

        public async Task<DefectDto?> GetDefectByIdAsync(int id, int companyId)
        {
            var defect = await _context.Defects
                .Include(d => d.Project)
                .Include(d => d.Phase)
                .Include(d => d.Resolutions)
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);

            return defect == null ? null : MapToDefectDto(defect);
        }

        public async Task<DefectDto> CreateDefectAsync(CreateDefectRequest request, int companyId, string userId, string reporterId)
        {
            var defectNumber = $"DEF-{DateTime.UtcNow:yyyyMM}-{await GenerateDefectNumberAsync(companyId)}";

            var defect = new Defect
            {
                CompanyId = companyId,
                ProjectId = request.ProjectId,
                PhaseId = request.PhaseId,
                InspectionId = request.InspectionId,
                DefectNumber = defectNumber,
                Title = request.Title,
                Description = request.Description,
                Category = request.Category,
                Severity = request.Severity,
                Status = "Open",
                Priority = request.Priority,
                Location = request.Location,
                Element = request.Element,
                ReportedBy = userId,
                ReportedById = reporterId,
                ReportedDate = DateTime.UtcNow,
                DiscoveryDate = request.DiscoveryDate,
                TargetResolutionDate = request.TargetResolutionDate,
                AssignedToId = request.AssignedToId ?? "",
                IsSafetyRelated = request.IsSafetyRelated,
                RequiresRebork = request.RequiresRebork,
                PhotoBefore = request.PhotoBefore,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Defects.Add(defect);
            await _context.SaveChangesAsync();

            return await GetDefectByIdAsync(defect.Id, companyId) ?? MapToDefectDto(defect);
        }

        public async Task<DefectDto> UpdateDefectAsync(UpdateDefectRequest request, int companyId, string userId)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(d => d.Id == request.Id && d.CompanyId == companyId);

            if (defect == null)
                throw new KeyNotFoundException("Defect not found");

            defect.Title = request.Title;
            defect.Description = request.Description;
            defect.Category = request.Category;
            defect.Severity = request.Severity;
            defect.Status = request.Status ?? defect.Status;
            defect.Priority = request.Priority;
            defect.Location = request.Location;
            defect.Element = request.Element;
            defect.TargetResolutionDate = request.TargetResolutionDate;
            defect.AssignedToId = request.AssignedToId ?? "";
            defect.RootCause = request.RootCause;
            defect.CorrectiveAction = request.CorrectiveAction;
            defect.PreventiveAction = request.PreventiveAction;
            defect.EstimatedCost = request.EstimatedCost;
            defect.IsSafetyRelated = request.IsSafetyRelated;
            defect.RequiresRebork = request.RequiresRebork;
            defect.UpdatedBy = userId;
            defect.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetDefectByIdAsync(defect.Id, companyId) ?? MapToDefectDto(defect);
        }

        public async Task<bool> DeleteDefectAsync(int id, int companyId)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);

            if (defect == null)
                return false;

            _context.Defects.Remove(defect);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<DefectDto> AssignDefectAsync(AssignDefectRequest request, int companyId, string userId)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(d => d.Id == request.Id && d.CompanyId == companyId);

            if (defect == null)
                throw new KeyNotFoundException("Defect not found");

            defect.AssignedToId = request.AssignedToId ?? "";
            defect.TargetResolutionDate = request.TargetResolutionDate ?? defect.TargetResolutionDate;
            if (defect.Status == "Open")
                defect.Status = "InProgress";
            defect.UpdatedBy = userId;
            defect.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetDefectByIdAsync(defect.Id, companyId) ?? MapToDefectDto(defect);
        }

        public async Task<DefectDto> ResolveDefectAsync(ResolveDefectRequest request, int companyId, string userId)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(d => d.Id == request.Id && d.CompanyId == companyId);

            if (defect == null)
                throw new KeyNotFoundException("Defect not found");

            defect.RootCause = request.RootCause;
            defect.CorrectiveAction = request.CorrectiveAction;
            defect.PreventiveAction = request.PreventiveAction;
            defect.ActualCost = request.ActualCost;
            defect.PhotoAfter = request.PhotoAfter;
            defect.ClosureNotes = request.ClosureNotes;
            defect.Status = "Resolved";
            defect.ActualResolutionDate = DateTime.UtcNow;
            defect.UpdatedBy = userId;
            defect.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetDefectByIdAsync(defect.Id, companyId) ?? MapToDefectDto(defect);
        }

        public async Task<DefectDto> CloseDefectAsync(int id, int companyId, string userId, string closureNotes)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);

            if (defect == null)
                throw new KeyNotFoundException("Defect not found");

            if (defect.Status != "Resolved")
                throw new InvalidOperationException("Defect must be resolved before closing");

            defect.Status = "Closed";
            defect.ClosureNotes = closureNotes;
            defect.VerifiedBy = userId;
            defect.VerifiedDate = DateTime.UtcNow;
            defect.UpdatedBy = userId;
            defect.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetDefectByIdAsync(defect.Id, companyId) ?? MapToDefectDto(defect);
        }

        public async Task<DefectDto> ReopenDefectAsync(int id, int companyId, string userId, string reason)
        {
            var defect = await _context.Defects
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId);

            if (defect == null)
                throw new KeyNotFoundException("Defect not found");

            if (defect.Status != "Closed")
                throw new InvalidOperationException("Only closed defects can be reopened");

            defect.Status = "Reopened";
            defect.ClosureNotes = $"Reopened: {reason}. Previous: {defect.ClosureNotes}";
            defect.UpdatedBy = userId;
            defect.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetDefectByIdAsync(defect.Id, companyId) ?? MapToDefectDto(defect);
        }

        public async Task<IEnumerable<DefectDto>> GetOpenDefectsAsync(int companyId, int? projectId = null)
        {
            var query = _context.Defects
                .Include(d => d.Project)
                .Include(d => d.Phase)
                .Where(d => d.CompanyId == companyId && (d.Status == "Open" || d.Status == "InProgress"));

            if (projectId.HasValue)
                query = query.Where(d => d.ProjectId == projectId);

            var defects = await query.OrderByDescending(d => d.Priority).ThenBy(d => d.ReportedDate).ToListAsync();

            return defects.Select(MapToDefectDto);
        }

        public async Task<IEnumerable<DefectDto>> GetOverdueDefectsAsync(int companyId)
        {
            var defects = await _context.Defects
                .Include(d => d.Project)
                .Include(d => d.Phase)
                .Where(d => d.CompanyId == companyId && 
                           d.Status != "Closed" && 
                           d.Status != "Resolved" && 
                           d.TargetResolutionDate.HasValue && 
                           d.TargetResolutionDate < DateTime.UtcNow)
                .OrderBy(d => d.TargetResolutionDate)
                .ToListAsync();

            return defects.Select(MapToDefectDto);
        }

        public async Task<IEnumerable<DefectDto>> GetCriticalDefectsAsync(int companyId)
        {
            var defects = await _context.Defects
                .Include(d => d.Project)
                .Include(d => d.Phase)
                .Where(d => d.CompanyId == companyId && d.Severity == "Critical" && d.Status != "Closed")
                .OrderByDescending(d => d.ReportedDate)
                .ToListAsync();

            return defects.Select(MapToDefectDto);
        }

        public async Task<IEnumerable<DefectDto>> GetSafetyRelatedDefectsAsync(int companyId)
        {
            var defects = await _context.Defects
                .Include(d => d.Project)
                .Include(d => d.Phase)
                .Where(d => d.CompanyId == companyId && d.IsSafetyRelated && d.Status != "Closed")
                .OrderByDescending(d => d.ReportedDate)
                .ToListAsync();

            return defects.Select(MapToDefectDto);
        }

        private async Task<int> GenerateDefectNumberAsync(int companyId)
        {
            var count = await _context.Defects
                .CountAsync(d => d.CompanyId == companyId && d.CreatedAt.Year == DateTime.UtcNow.Year && d.CreatedAt.Month == DateTime.UtcNow.Month);
            return count + 1;
        }

        private static DefectDto MapToDefectDto(Defect defect) => new()
        {
            Id = defect.Id,
            CompanyId = defect.CompanyId ?? 0,
            ProjectId = defect.ProjectId ?? 0,
            PhaseId = defect.PhaseId ?? 0,
            InspectionId = defect.InspectionId ?? 0,
            ProjectName = defect.Project?.Name,
            PhaseName = defect.Phase?.Name,
            DefectNumber = defect.DefectNumber,
            Title = defect.Title,
            Description = defect.Description,
            Category = defect.Category,
            Severity = defect.Severity,
            Status = defect.Status,
            Priority = defect.Priority,
            Location = defect.Location,
            Element = defect.Element,
            ReportedBy = defect.ReportedBy,
            ReportedDate = defect.ReportedDate,
            DiscoveryDate = defect.DiscoveryDate,
            TargetResolutionDate = defect.TargetResolutionDate,
            ActualResolutionDate = defect.ActualResolutionDate,
            AssignedTo = defect.AssignedTo,
            RootCause = defect.RootCause,
            CorrectiveAction = defect.CorrectiveAction,
            PreventiveAction = defect.PreventiveAction,
            EstimatedCost = defect.EstimatedCost,
            ActualCost = defect.ActualCost,
            PhotoBefore = defect.PhotoBefore,
            PhotoAfter = defect.PhotoAfter,
            PunchListCount = defect.PunchListCount,
            IsSafetyRelated = defect.IsSafetyRelated,
            RequiresRebork = defect.RequiresRebork,
            ClosureNotes = defect.ClosureNotes,
            VerifiedBy = defect.VerifiedBy,
            VerifiedDate = defect.VerifiedDate,
            CreatedAt = defect.CreatedAt,
            CreatedBy = defect.CreatedBy,
            Resolutions = defect.Resolutions?.Select(MapToResolutionDto).ToList()
        };

        private static DefectResolutionDto MapToResolutionDto(DefectResolution r) => new()
        {
            Id = r.Id,
            DefectId = r.DefectId,
            SequenceNumber = r.SequenceNumber,
            ActionTaken = r.ActionTaken,
            ActionType = r.ActionType,
            PerformedBy = r.PerformedBy,
            ActionDate = r.ActionDate,
            LaborHours = r.LaborHours,
            MaterialCost = r.MaterialCost,
            Description = r.Description,
            PhotoEvidence = r.PhotoEvidence,
            IsSatisfactory = r.IsSatisfactory,
            Remarks = r.Remarks,
            CreatedAt = r.CreatedAt
        };

        #endregion

        #region Punch List Items

        public async Task<IEnumerable<PunchListItemDto>> GetPunchListItemsAsync(int companyId, int? projectId = null, int? phaseId = null, string? status = null)
        {
            var query = _context.PunchListItems
                .Include(p => p.Project)
                .Include(p => p.Phase)
                .Where(p => p.CompanyId == companyId);

            if (projectId.HasValue)
                query = query.Where(p => p.ProjectId == projectId);
            if (phaseId.HasValue)
                query = query.Where(p => p.PhaseId == phaseId);
            if (!string.IsNullOrEmpty(status))
                query = query.Where(p => p.Status == status);

            var items = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

            return items.Select(MapToPunchListItemDto);
        }

        public async Task<PunchListItemDto?> GetPunchListItemByIdAsync(int id, int companyId)
        {
            var item = await _context.PunchListItems
                .Include(p => p.Project)
                .Include(p => p.Phase)
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId);

            return item == null ? null : MapToPunchListItemDto(item);
        }

        public async Task<PunchListItemDto> CreatePunchListItemAsync(CreatePunchListItemRequest request, int companyId, string userId)
        {
            var itemNumber = $"PL-{DateTime.UtcNow:yyyyMM}-{await GeneratePunchListNumberAsync(companyId)}";

            var item = new PunchListItem
            {
                CompanyId = companyId,
                ProjectId = request.ProjectId,
                PhaseId = request.PhaseId,
                DefectId = request.DefectId,
                ItemNumber = itemNumber,
                Description = request.Description,
                Location = request.Location,
                Area = request.Area,
                Category = request.Category,
                Priority = request.Priority,
                Status = "Pending",
                AssignedToId = request.AssignedToId ?? "",
                DueDate = request.DueDate,
                CostEstimate = request.CostEstimate,
                IsSafetyItem = request.IsSafetyItem,
                RequiresReinspection = request.RequiresReinspection,
                PhotoBefore = request.PhotoBefore,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.PunchListItems.Add(item);
            await _context.SaveChangesAsync();

            return await GetPunchListItemByIdAsync(item.Id, companyId) ?? MapToPunchListItemDto(item);
        }

        public async Task<PunchListItemDto> UpdatePunchListItemAsync(UpdatePunchListItemRequest request, int companyId, string userId)
        {
            var item = await _context.PunchListItems
                .FirstOrDefaultAsync(p => p.Id == request.Id && p.CompanyId == companyId);

            if (item == null)
                throw new KeyNotFoundException("Punch list item not found");

            item.Description = request.Description;
            item.Location = request.Location;
            item.Area = request.Area;
            item.Category = request.Category;
            item.Priority = request.Priority;
            item.Status = request.Status ?? item.Status;
            item.AssignedToId = request.AssignedToId ?? "";
            item.DueDate = request.DueDate;
            item.CompletedDate = request.CompletedDate;
            item.CompletionNotes = request.CompletionNotes;
            item.CostEstimate = request.CostEstimate;
            item.ActualCost = request.ActualCost;
            item.IsSafetyItem = request.IsSafetyItem;
            item.RequiresReinspection = request.RequiresReinspection;
            item.ReinspectionDate = request.ReinspectionDate;
            item.UpdatedBy = userId;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPunchListItemByIdAsync(item.Id, companyId) ?? MapToPunchListItemDto(item);
        }

        public async Task<bool> DeletePunchListItemAsync(int id, int companyId)
        {
            var item = await _context.PunchListItems
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId);

            if (item == null)
                return false;

            _context.PunchListItems.Remove(item);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<PunchListItemDto> CompletePunchListItemAsync(CompletePunchListItemRequest request, int companyId, string userId)
        {
            var item = await _context.PunchListItems
                .FirstOrDefaultAsync(p => p.Id == request.Id && p.CompanyId == companyId);

            if (item == null)
                throw new KeyNotFoundException("Punch list item not found");

            if (item.Status != "InProgress")
                throw new InvalidOperationException("Item must be in progress to complete");

            item.Status = "Completed";
            item.CompletedDate = DateTime.UtcNow;
            item.CompletionNotes = request.CompletionNotes;
            item.PhotoAfter = request.PhotoAfter;
            item.ActualCost = request.ActualCost;
            item.UpdatedBy = userId;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPunchListItemByIdAsync(item.Id, companyId) ?? MapToPunchListItemDto(item);
        }

        public async Task<PunchListItemDto> VerifyPunchListItemAsync(VerifyPunchListItemRequest request, int companyId, string userId)
        {
            var item = await _context.PunchListItems
                .FirstOrDefaultAsync(p => p.Id == request.Id && p.CompanyId == companyId);

            if (item == null)
                throw new KeyNotFoundException("Punch list item not found");

            if (item.Status != "Completed")
                throw new InvalidOperationException("Item must be completed before verification");

            item.ReinspectionResult = request.Result;
            item.AcceptanceNotes = request.AcceptanceNotes;
            item.ReinspectionDate = request.ReinspectionDate ?? item.ReinspectionDate;
            
            if (request.Result == "Accepted")
                item.Status = "Verified";
            else if (request.Result == "Rejected")
                item.Status = "InProgress";
            
            item.VerifiedBy = userId;
            item.VerifiedDate = DateTime.UtcNow;
            item.UpdatedBy = userId;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPunchListItemByIdAsync(item.Id, companyId) ?? MapToPunchListItemDto(item);
        }

        public async Task<PunchListItemDto> AcceptPunchListItemAsync(int id, int companyId, string userId, string? notes)
        {
            var item = await _context.PunchListItems
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId);

            if (item == null)
                throw new KeyNotFoundException("Punch list item not found");

            item.Status = "Accepted";
            item.AcceptanceNotes = notes ?? string.Empty;
            item.VerifiedBy = userId;
            item.VerifiedDate = DateTime.UtcNow;
            item.UpdatedBy = userId;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPunchListItemByIdAsync(item.Id, companyId) ?? MapToPunchListItemDto(item);
        }

        public async Task<IEnumerable<PunchListItemDto>> GetPendingPunchListItemsAsync(int companyId, int? projectId = null)
        {
            var query = _context.PunchListItems
                .Include(p => p.Project)
                .Include(p => p.Phase)
                .Where(p => p.CompanyId == companyId && (p.Status == "Pending" || p.Status == "InProgress"));

            if (projectId.HasValue)
                query = query.Where(p => p.ProjectId == projectId);

            var items = await query.OrderBy(p => p.Priority).ThenBy(p => p.DueDate).ToListAsync();

            return items.Select(MapToPunchListItemDto);
        }

        public async Task<IEnumerable<PunchListItemDto>> GetPunchListItemsByDefectAsync(int defectId, int companyId)
        {
            var items = await _context.PunchListItems
                .Include(p => p.Project)
                .Include(p => p.Phase)
                .Where(p => p.DefectId == defectId && p.CompanyId == companyId)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync();

            return items.Select(MapToPunchListItemDto);
        }

        private async Task<int> GeneratePunchListNumberAsync(int companyId)
        {
            var count = await _context.PunchListItems
                .CountAsync(p => p.CompanyId == companyId && p.CreatedAt.Year == DateTime.UtcNow.Year && p.CreatedAt.Month == DateTime.UtcNow.Month);
            return count + 1;
        }

        private static PunchListItemDto MapToPunchListItemDto(PunchListItem item) => new()
        {
            Id = item.Id,
            CompanyId = item.CompanyId ?? 0,
            ProjectId = item.ProjectId ?? 0,
            PhaseId = item.PhaseId ?? 0,
            DefectId = item.DefectId ?? 0,
            ProjectName = item.Project?.Name,
            PhaseName = item.Phase?.Name,
            ItemNumber = item.ItemNumber,
            Description = item.Description,
            Location = item.Location,
            Area = item.Area,
            Category = item.Category,
            Priority = item.Priority,
            Status = item.Status,
            AssignedTo = item.AssignedTo,
            DueDate = item.DueDate,
            CompletedDate = item.CompletedDate,
            CompletionNotes = item.CompletionNotes,
            PhotoBefore = item.PhotoBefore,
            PhotoAfter = item.PhotoAfter,
            CostEstimate = item.CostEstimate,
            ActualCost = item.ActualCost,
            IsSafetyItem = item.IsSafetyItem,
            RequiresReinspection = item.RequiresReinspection,
            ReinspectionDate = item.ReinspectionDate,
            ReinspectionResult = item.ReinspectionResult,
            VerifiedBy = item.VerifiedBy,
            VerifiedDate = item.VerifiedDate,
            AcceptanceNotes = item.AcceptanceNotes,
            CreatedAt = item.CreatedAt,
            CreatedBy = item.CreatedBy
        };

        #endregion

        #region Defect Resolutions

        public async Task<IEnumerable<DefectResolutionDto>> GetDefectResolutionsAsync(int defectId, int companyId)
        {
            var resolutions = await _context.DefectResolutions
                .Where(r => r.DefectId == defectId && r.CompanyId == companyId)
                .OrderBy(r => r.SequenceNumber)
                .ToListAsync();

            return resolutions.Select(MapToResolutionDto);
        }

        public async Task<DefectResolutionDto> AddDefectResolutionAsync(AddDefectResolutionRequest request, int companyId, string userId)
        {
            var defect = await _context.Defects.FindAsync(request.DefectId);
            if (defect == null || defect.CompanyId != companyId)
                throw new KeyNotFoundException("Defect not found");

            var sequenceNumber = await _context.DefectResolutions
                .CountAsync(r => r.DefectId == request.DefectId) + 1;

            var resolution = new DefectResolution
            {
                CompanyId = companyId,
                DefectId = request.DefectId,
                SequenceNumber = sequenceNumber,
                ActionTaken = request.ActionTaken,
                ActionType = request.ActionType,
                ActionDate = request.ActionDate,
                LaborHours = request.LaborHours,
                MaterialCost = request.MaterialCost,
                Description = request.Description,
                PhotoEvidence = request.PhotoEvidence,
                IsSatisfactory = request.IsSatisfactory,
                Remarks = request.Remarks,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.DefectResolutions.Add(resolution);
            await _context.SaveChangesAsync();

            return MapToResolutionDto(resolution);
        }

        #endregion

        #region Statistics

        public async Task<QualityStatisticsDto> GetQualityStatisticsAsync(int companyId, int? projectId = null)
        {
            var query = _context.QualityInspections.Where(i => i.CompanyId == companyId);
            if (projectId.HasValue)
                query = query.Where(i => i.ProjectId == projectId);

            var inspections = await query.ToListAsync();

            var defectQuery = _context.Defects.Where(d => d.CompanyId == companyId);
            if (projectId.HasValue)
                defectQuery = defectQuery.Where(d => d.ProjectId == projectId);
            var defects = await defectQuery.ToListAsync();

            var punchQuery = _context.PunchListItems.Where(p => p.CompanyId == companyId);
            if (projectId.HasValue)
                punchQuery = punchQuery.Where(p => p.ProjectId == projectId);
            var punchItems = await punchQuery.ToListAsync();

            var completedInspections = inspections.Where(i => i.Status == "Completed").ToList();

            return new QualityStatisticsDto
            {
                TotalInspections = inspections.Count,
                CompletedInspections = completedInspections.Count,
                ScheduledInspections = inspections.Count(i => i.Status == "Scheduled"),
                TotalDefects = defects.Count,
                OpenDefects = defects.Count(d => d.Status == "Open" || d.Status == "InProgress"),
                ResolvedDefects = defects.Count(d => d.Status == "Resolved" || d.Status == "Closed"),
                CriticalDefects = defects.Count(d => d.Severity == "Critical" && d.Status != "Closed"),
                MajorDefects = defects.Count(d => d.Severity == "Major" && d.Status != "Closed"),
                MinorDefects = defects.Count(d => d.Severity == "Minor" && d.Status != "Closed"),
                TotalPunchListItems = punchItems.Count,
                PendingPunchListItems = punchItems.Count(p => p.Status == "Pending" || p.Status == "InProgress"),
                CompletedPunchListItems = punchItems.Count(p => p.Status == "Verified" || p.Status == "Accepted"),
                AverageInspectionScore = completedInspections.Any() ? completedInspections.Average(i => i.Score) : 0,
                DefectResolutionRate = defects.Any() ? (decimal)defects.Count(d => d.Status == "Closed") / defects.Count * 100 : 0,
                PunchListCompletionRate = punchItems.Any() ? (decimal)punchItems.Count(p => p.Status == "Accepted") / punchItems.Count * 100 : 0
            };
        }

        public async Task<QualityStatisticsDto> GetProjectQualityStatisticsAsync(int companyId, int projectId)
        {
            return await GetQualityStatisticsAsync(companyId, projectId);
        }

        public async Task<IEnumerable<InspectionTypeSummary>> GetInspectionsByTypeAsync(int companyId, int? projectId = null)
        {
            var query = _context.QualityInspections
                .Where(i => i.CompanyId == companyId && i.Status == "Completed");
            
            if (projectId.HasValue)
                query = query.Where(i => i.ProjectId == projectId);

            var inspections = await query.ToListAsync();

            return inspections
                .GroupBy(i => i.InspectionType)
                .Select(g => new InspectionTypeSummary
                {
                    Type = g.Key,
                    Count = g.Count(),
                    AverageScore = g.Average(i => i.Score)
                })
                .OrderByDescending(s => s.Count);
        }

        public async Task<IEnumerable<CategorySummary>> GetDefectsByCategoryAsync(int companyId, int? projectId = null)
        {
            var query = _context.Defects.Where(d => d.CompanyId == companyId);
            
            if (projectId.HasValue)
                query = query.Where(d => d.ProjectId == projectId);

            var defects = await query.ToListAsync();
            var total = defects.Count;

            return defects
                .GroupBy(d => d.Category)
                .Select(g => new CategorySummary
                {
                    Category = g.Key,
                    Count = g.Count(),
                    Percentage = total > 0 ? (decimal)g.Count() / total * 100 : 0
                })
                .OrderByDescending(s => s.Count);
        }

        public async Task<IEnumerable<MonthlyTrend>> GetMonthlyQualityTrendsAsync(int companyId, int months = 12)
        {
            var trends = new List<MonthlyTrend>();
            var startDate = DateTime.UtcNow.AddMonths(-months);

            for (int i = 0; i < months; i++)
            {
                var monthStart = startDate.AddMonths(i);
                var monthEnd = monthStart.AddMonths(1);

                var inspections = await _context.QualityInspections
                    .Where(i => i.CompanyId == companyId && 
                               i.ScheduledDate >= monthStart && 
                               i.ScheduledDate < monthEnd)
                    .ToListAsync();

                var completedInspections = inspections.Where(i => i.Status == "Completed").ToList();

                var defects = await _context.Defects
                    .Where(d => d.CompanyId == companyId && 
                               d.ReportedDate >= monthStart && 
                               d.ReportedDate < monthEnd)
                    .ToListAsync();

                trends.Add(new MonthlyTrend
                {
                    Month = monthStart.Month,
                    Year = monthStart.Year,
                    MonthName = monthStart.ToString("MMM yyyy"),
                    Inspections = inspections.Count,
                    Defects = defects.Count,
                    Resolutions = defects.Count(d => d.Status == "Resolved" || d.Status == "Closed"),
                    Score = completedInspections.Any() ? completedInspections.Average(i => i.Score) : 0
                });
            }

            return trends;
        }

        #endregion
    }
}
