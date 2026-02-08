using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    public class SafetyService : ISafetyChecklistService, ISafetyInspectionService, 
        ISafetyIncidentService, ISafetyTrainingService, ISafetyComplianceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SafetyService> _logger;

        public SafetyService(ApplicationDbContext context, ILogger<SafetyService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Safety Checklist

        public async Task<IEnumerable<SafetyChecklistDto>> GetChecklistsAsync()
        {
            var checklists = await _context.SafetyChecklists
                .Include(sc => sc.Items)
                .Where(sc => sc.IsActive)
                .OrderBy(sc => sc.Name)
                .AsNoTracking()
                .ToListAsync();

            return checklists.Select(sc => new SafetyChecklistDto
            {
                Id = sc.Id,
                Name = sc.Name,
                Description = sc.Description,
                Category = (int)sc.Category,
                CategoryName = sc.Category.ToString(),
                IsActive = sc.IsActive,
                ItemsCount = sc.Items.Count,
                CreatedAt = sc.CreatedAt
            });
        }

        public async Task<SafetyChecklistDto?> GetChecklistByIdAsync(int id)
        {
            var sc = await _context.SafetyChecklists
                .Include(sc => sc.Items)
                .AsNoTracking()
                .FirstOrDefaultAsync(sc => sc.Id == id);

            if (sc == null) return null;

            return new SafetyChecklistDto
            {
                Id = sc.Id,
                Name = sc.Name,
                Description = sc.Description,
                Category = (int)sc.Category,
                CategoryName = sc.Category.ToString(),
                IsActive = sc.IsActive,
                ItemsCount = sc.Items.Count,
                CreatedAt = sc.CreatedAt
            };
        }

        public async Task<SafetyChecklistDto> CreateChecklistAsync(CreateSafetyChecklistRequest request)
        {
            var checklist = new SafetyChecklist
            {
                Name = request.Name,
                Description = request.Description,
                Category = (SafetyCategory)request.Category,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = 1 // TODO: Get from current user
            };

            _context.SafetyChecklists.Add(checklist);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created safety checklist {ChecklistId}", checklist.Id);

            return await GetChecklistByIdAsync(checklist.Id) ?? throw new InvalidOperationException();
        }

        public async Task<SafetyChecklistDto> UpdateChecklistAsync(int id, UpdateSafetyChecklistRequest request)
        {
            var checklist = await _context.SafetyChecklists.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety checklist {id} not found");

            checklist.Name = request.Name;
            checklist.Description = request.Description;
            checklist.Category = (SafetyCategory)request.Category;
            checklist.IsActive = request.IsActive;
            checklist.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated safety checklist {ChecklistId}", checklist.Id);

            return await GetChecklistByIdAsync(checklist.Id) ?? throw new InvalidOperationException();
        }

        public async Task<bool> DeleteChecklistAsync(int id)
        {
            var checklist = await _context.SafetyChecklists.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety checklist {id} not found");

            checklist.IsActive = false;
            checklist.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted safety checklist {ChecklistId}", id);

            return true;
        }

        public async Task<IEnumerable<SafetyChecklistItemDto>> GetChecklistItemsAsync(int checklistId)
        {
            var items = await _context.SafetyChecklistItems
                .Where(i => i.SafetyChecklistId == checklistId)
                .OrderBy(i => i.OrderIndex)
                .AsNoTracking()
                .ToListAsync();

            return items.Select(i => new SafetyChecklistItemDto
            {
                Id = i.Id,
                SafetyChecklistId = i.SafetyChecklistId,
                Description = i.Description,
                OrderIndex = i.OrderIndex,
                IsCritical = i.IsCritical,
                ComplianceStandard = i.ComplianceStandard
            });
        }

        public async Task<SafetyChecklistItemDto> AddChecklistItemAsync(CreateSafetyChecklistItemRequest request)
        {
            var item = new SafetyChecklistItem
            {
                SafetyChecklistId = request.SafetyChecklistId,
                Description = request.Description,
                OrderIndex = request.OrderIndex,
                IsCritical = request.IsCritical,
                ComplianceStandard = request.ComplianceStandard,
                CreatedAt = DateTime.UtcNow
            };

            _context.SafetyChecklistItems.Add(item);
            await _context.SaveChangesAsync();

            return new SafetyChecklistItemDto
            {
                Id = item.Id,
                SafetyChecklistId = item.SafetyChecklistId,
                Description = item.Description,
                OrderIndex = item.OrderIndex,
                IsCritical = item.IsCritical,
                ComplianceStandard = item.ComplianceStandard
            };
        }

        public async Task<bool> UpdateChecklistItemAsync(int itemId, CreateSafetyChecklistItemRequest request)
        {
            var item = await _context.SafetyChecklistItems.FindAsync(itemId)
                ?? throw new KeyNotFoundException($"Checklist item {itemId} not found");

            item.Description = request.Description;
            item.OrderIndex = request.OrderIndex;
            item.IsCritical = request.IsCritical;
            item.ComplianceStandard = request.ComplianceStandard;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteChecklistItemAsync(int itemId)
        {
            var item = await _context.SafetyChecklistItems.FindAsync(itemId)
                ?? throw new KeyNotFoundException($"Checklist item {itemId} not found");

            _context.SafetyChecklistItems.Remove(item);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Safety Inspection

        public async Task<IEnumerable<SafetyInspectionDto>> GetInspectionsAsync(SafetyInspectionQueryParams? queryParams = null)
        {
            var query = _context.SafetyInspections
                .Include(si => si.SafetyChecklist)
                .Include(si => si.Project)
                .AsNoTracking()
                .AsQueryable();

            if (queryParams?.ProjectId.HasValue == true)
                query = query.Where(si => si.ProjectId == queryParams.ProjectId.Value);

            if (queryParams?.ChecklistId.HasValue == true)
                query = query.Where(si => si.SafetyChecklistId == queryParams.ChecklistId.Value);

            if (queryParams?.FromDate.HasValue == true)
                query = query.Where(si => si.InspectionDate >= queryParams.FromDate.Value);

            if (queryParams?.ToDate.HasValue == true)
                query = query.Where(si => si.InspectionDate <= queryParams.ToDate.Value);

            if (queryParams?.RequiresFollowUp.GetValueOrDefault() == true)
                query = query.Where(si => si.RequiresFollowUp == true);

            var inspections = await query
                .OrderByDescending(si => si.InspectionDate)
                .ToListAsync();

            return inspections.Select(si => new SafetyInspectionDto
            {
                Id = si.Id,
                SafetyChecklistId = si.SafetyChecklistId,
                SafetyChecklistName = si.SafetyChecklist?.Name ?? "",
                ProjectId = si.ProjectId ?? 0,
                ProjectName = si.Project?.Name,
                InspectorUserId = si.InspectorUserId,
                InspectorName = "", // TODO: Get from user service
                InspectionDate = si.InspectionDate,
                Location = si.Location,
                TotalItems = si.TotalItems,
                PassedItems = si.PassedItems,
                FailedItems = si.FailedItems,
                NAItems = si.NAItems,
                PassRate = si.TotalItems > 0 ? Math.Round((double)si.PassedItems / si.TotalItems * 100, 2) : 0,
                Notes = si.Notes,
                RequiresFollowUp = si.RequiresFollowUp,
                FollowUpNotes = si.FollowUpNotes,
                FollowUpDate = si.FollowUpDate,
                CreatedAt = si.CreatedAt
            });
        }

        public async Task<SafetyInspectionDto?> GetInspectionByIdAsync(int id)
        {
            var si = await _context.SafetyInspections
                .Include(si => si.SafetyChecklist)
                .Include(si => si.Project)
                .Include(si => si.ItemResults)
                .ThenInclude(r => r.SafetyChecklistItem)
                .AsNoTracking()
                .FirstOrDefaultAsync(si => si.Id == id);

            if (si == null) return null;

            return new SafetyInspectionDto
            {
                Id = si.Id,
                SafetyChecklistId = si.SafetyChecklistId,
                SafetyChecklistName = si.SafetyChecklist?.Name ?? "",
                ProjectId = si.ProjectId,
                ProjectName = si.Project?.Name,
                InspectorUserId = si.InspectorUserId,
                InspectorName = "",
                InspectionDate = si.InspectionDate,
                Location = si.Location,
                TotalItems = si.TotalItems,
                PassedItems = si.PassedItems,
                FailedItems = si.FailedItems,
                NAItems = si.NAItems,
                PassRate = si.TotalItems > 0 ? Math.Round((double)si.PassedItems / si.TotalItems * 100, 2) : 0,
                Notes = si.Notes,
                RequiresFollowUp = si.RequiresFollowUp,
                FollowUpNotes = si.FollowUpNotes,
                FollowUpDate = si.FollowUpDate,
                CreatedAt = si.CreatedAt
            };
        }

        public async Task<SafetyInspectionDto> CreateInspectionAsync(CreateSafetyInspectionRequest request)
        {
            var inspection = new SafetyInspection
            {
                SafetyChecklistId = request.SafetyChecklistId,
                ProjectId = request.ProjectId,
                InspectorUserId = 1, // TODO: Get from current user
                InspectionDate = request.InspectionDate,
                Location = request.Location,
                Notes = request.Notes,
                TotalItems = request.ItemResults.Count,
                PassedItems = request.ItemResults.Count(r => r.Result == (int)InspectionResult.Pass),
                FailedItems = request.ItemResults.Count(r => r.Result == (int)InspectionResult.Fail),
                NAItems = request.ItemResults.Count(r => r.Result == (int)InspectionResult.NotApplicable),
                RequiresFollowUp = request.ItemResults.Any(r => r.Result == (int)InspectionResult.Fail),
                CreatedAt = DateTime.UtcNow
            };

            _context.SafetyInspections.Add(inspection);
            await _context.SaveChangesAsync();

            // Add item results
            foreach (var result in request.ItemResults)
            {
                var itemResult = new SafetyInspectionItemResult
                {
                    SafetyInspectionId = inspection.Id,
                    SafetyChecklistItemId = result.SafetyChecklistItemId,
                    Result = (InspectionResult)result.Result,
                    Notes = result.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.SafetyInspectionItemResults.Add(itemResult);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Created safety inspection {InspectionId}", inspection.Id);

            return await GetInspectionByIdAsync(inspection.Id) ?? throw new InvalidOperationException();
        }

        public async Task<SafetyInspectionDto> UpdateInspectionAsync(int id, CreateSafetyInspectionRequest request)
        {
            var inspection = await _context.SafetyInspections.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety inspection {id} not found");

            inspection.SafetyChecklistId = request.SafetyChecklistId;
            inspection.ProjectId = request.ProjectId;
            inspection.InspectionDate = request.InspectionDate;
            inspection.Location = request.Location;
            inspection.Notes = request.Notes;
            inspection.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetInspectionByIdAsync(inspection.Id) ?? throw new InvalidOperationException();
        }

        public async Task<bool> DeleteInspectionAsync(int id)
        {
            var inspection = await _context.SafetyInspections.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety inspection {id} not found");

            _context.SafetyInspections.Remove(inspection);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<SafetyInspectionDto>> GetInspectionsByProjectAsync(int projectId)
        {
            return await GetInspectionsAsync(new SafetyInspectionQueryParams { ProjectId = projectId });
        }

        public async Task<SafetyDashboardDto> GetDashboardStatsAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var inspectionsThisMonth = await _context.SafetyInspections
                .CountAsync(si => si.InspectionDate >= startOfMonth);

            var incidentsThisMonth = await _context.SafetyIncidents
                .CountAsync(si => si.IncidentDate >= startOfMonth);

            var totalInspections = await _context.SafetyInspections.CountAsync();
            var passedInspections = await _context.SafetyInspections
                .SumAsync(si => si.PassedItems);
            var totalItems = await _context.SafetyInspections
                .SumAsync(si => si.TotalItems);

            var allIncidents = await _context.SafetyIncidents.ToListAsync();
            var criticalIncidents = allIncidents.Count(i => i.Severity == IncidentSeverity.Critical);
            var pendingInvestigations = allIncidents.Count(i => i.InvestigationStatus == InvestigationStatus.Pending);

            var allTrainings = await _context.SafetyTrainings.ToListAsync();
            var upcomingTrainings = allTrainings.Count(t => t.Status == TrainingStatus.Scheduled && t.ScheduledDate > now);
            var completedTrainings = allTrainings.Count(t => t.Status == TrainingStatus.Completed);
            var expiringCertifications = allTrainings
                .Count(t => t.CertificationExpiryDate.HasValue && t.CertificationExpiryDate > now && 
                           t.CertificationExpiryDate <= now.AddDays(30));

            var recentIncidents = allIncidents
                .OrderByDescending(i => i.IncidentDate)
                .Take(5)
                .Select(i => new SafetyIncidentDto
                {
                    Id = i.Id,
                    ProjectId = i.ProjectId,
                    Severity = (int)i.Severity,
                    SeverityName = i.Severity.ToString(),
                    Title = i.Title,
                    Description = i.Description,
                    IncidentDate = i.IncidentDate,
                    InvestigationStatus = (int)i.InvestigationStatus,
                    InvestigationStatusName = i.InvestigationStatus.ToString(),
                    CreatedAt = i.CreatedAt
                }).ToList();

            return new SafetyDashboardDto
            {
                TotalChecklists = await _context.SafetyChecklists.CountAsync(sc => sc.IsActive),
                TotalInspections = totalInspections,
                TotalIncidents = allIncidents.Count,
                TotalTrainings = allTrainings.Count,
                AveragePassRate = totalItems > 0 ? Math.Round((double)passedInspections / totalItems * 100, 2) : 0,
                InspectionsThisMonth = inspectionsThisMonth,
                InspectionsPassed = passedInspections,
                InspectionsFailed = await _context.SafetyInspections.SumAsync(si => si.FailedItems),
                IncidentsThisMonth = incidentsThisMonth,
                CriticalIncidents = criticalIncidents,
                PendingInvestigations = pendingInvestigations,
                TrainingsCompleted = completedTrainings,
                UpcomingTrainings = upcomingTrainings,
                ExpiringCertifications = expiringCertifications,
                RecentIncidents = recentIncidents,
                RecentInspections = (await GetInspectionsAsync(new SafetyInspectionQueryParams())).Take(5).ToList(),
                UpcomingTrainingsList = allTrainings
                    .Where(t => t.Status == TrainingStatus.Scheduled && t.ScheduledDate > now)
                    .OrderBy(t => t.ScheduledDate)
                    .Take(5)
                    .Select(t => new SafetyTrainingDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        TrainingType = t.TrainingType,
                        ScheduledDate = t.ScheduledDate,
                        Status = (int)t.Status,
                        StatusName = t.Status.ToString()
                    }).ToList()
            };
        }

        #endregion

        #region Safety Incident

        public async Task<IEnumerable<SafetyIncidentDto>> GetIncidentsAsync(SafetyIncidentQueryParams? queryParams = null)
        {
            var query = _context.SafetyIncidents
                .Include(si => si.Project)
                .AsNoTracking()
                .AsQueryable();

            if (queryParams?.ProjectId.HasValue == true)
                query = query.Where(si => si.ProjectId == queryParams.ProjectId.Value);

            if (queryParams?.Severity.HasValue == true)
                query = query.Where(si => si.Severity == (IncidentSeverity)queryParams.Severity.Value);

            if (queryParams?.InvestigationStatus.HasValue == true)
                query = query.Where(si => si.InvestigationStatus == (InvestigationStatus)queryParams.InvestigationStatus.Value);

            if (queryParams?.FromDate.HasValue == true)
                query = query.Where(si => si.IncidentDate >= queryParams.FromDate.Value);

            if (queryParams?.ToDate.HasValue == true)
                query = query.Where(si => si.IncidentDate <= queryParams.ToDate.Value);

            var incidents = await query
                .OrderByDescending(si => si.IncidentDate)
                .ToListAsync();

            return incidents.Select(i => new SafetyIncidentDto
            {
                Id = i.Id,
                ProjectId = i.ProjectId ?? 0,
                ProjectName = i.Project?.Name,
                ReportedByUserId = i.ReportedByUserId ?? 0,
                ReporterName = "",
                Severity = (int)i.Severity,
                SeverityName = i.Severity.ToString(),
                Title = i.Title,
                Description = i.Description,
                IncidentDate = i.IncidentDate,
                Location = i.Location,
                InvolvedPersons = ParseJsonList(i.InvolvedPersons),
                Witnesses = ParseJsonList(i.Witnesses),
                ImmediateActions = i.ImmediateActions,
                RequiredMedicalAttention = i.RequiredMedicalAttention,
                EstimatedCost = i.EstimatedCost,
                InvestigationStatus = (int)i.InvestigationStatus,
                InvestigationStatusName = i.InvestigationStatus.ToString(),
                RootCauseAnalysis = i.RootCauseAnalysis,
                CorrectiveActions = i.CorrectiveActions,
                FollowUpDate = i.FollowUpDate,
                CreatedAt = i.CreatedAt
            });
        }

        public async Task<SafetyIncidentDto?> GetIncidentByIdAsync(int id)
        {
            var i = await _context.SafetyIncidents
                .Include(si => si.Project)
                .AsNoTracking()
                .FirstOrDefaultAsync(si => si.Id == id);

            if (i == null) return null;

            return new SafetyIncidentDto
            {
                Id = i.Id,
                ProjectId = i.ProjectId,
                ProjectName = i.Project?.Name,
                ReportedByUserId = i.ReportedByUserId,
                ReporterName = "",
                Severity = (int)i.Severity,
                SeverityName = i.Severity.ToString(),
                Title = i.Title,
                Description = i.Description,
                IncidentDate = i.IncidentDate,
                Location = i.Location,
                InvolvedPersons = ParseJsonList(i.InvolvedPersons),
                Witnesses = ParseJsonList(i.Witnesses),
                ImmediateActions = i.ImmediateActions,
                RequiredMedicalAttention = i.RequiredMedicalAttention,
                EstimatedCost = i.EstimatedCost,
                InvestigationStatus = (int)i.InvestigationStatus,
                InvestigationStatusName = i.InvestigationStatus.ToString(),
                RootCauseAnalysis = i.RootCauseAnalysis,
                CorrectiveActions = i.CorrectiveActions,
                FollowUpDate = i.FollowUpDate,
                CreatedAt = i.CreatedAt
            };
        }

        public async Task<SafetyIncidentDto> CreateIncidentAsync(CreateSafetyIncidentRequest request)
        {
            var incident = new SafetyIncident
            {
                ProjectId = request.ProjectId,
                ReportedByUserId = 1, // TODO: Get from current user
                Severity = (IncidentSeverity)request.Severity,
                Title = request.Title,
                Description = request.Description,
                IncidentDate = request.IncidentDate,
                Location = request.Location,
                InvolvedPersons = request.InvolvedPersons,
                Witnesses = request.Witnesses,
                ImmediateActions = request.ImmediateActions,
                RequiredMedicalAttention = request.RequiredMedicalAttention,
                EstimatedCost = request.EstimatedCost,
                InvestigationStatus = InvestigationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.SafetyIncidents.Add(incident);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created safety incident {IncidentId}", incident.Id);

            return await GetIncidentByIdAsync(incident.Id) ?? throw new InvalidOperationException();
        }

        public async Task<SafetyIncidentDto> UpdateIncidentAsync(int id, UpdateSafetyIncidentRequest request)
        {
            var incident = await _context.SafetyIncidents.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety incident {id} not found");

            incident.Severity = (IncidentSeverity)request.Severity;
            incident.Title = request.Title;
            incident.Description = request.Description;
            incident.ImmediateActions = request.ImmediateActions;
            incident.RequiredMedicalAttention = request.RequiredMedicalAttention;
            incident.InvestigationStatus = (InvestigationStatus)request.InvestigationStatus;
            incident.RootCauseAnalysis = request.RootCauseAnalysis;
            incident.CorrectiveActions = request.CorrectiveActions;
            incident.FollowUpDate = request.FollowUpDate;
            incident.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetIncidentByIdAsync(incident.Id) ?? throw new InvalidOperationException();
        }

        public async Task<bool> DeleteIncidentAsync(int id)
        {
            var incident = await _context.SafetyIncidents.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety incident {id} not found");

            _context.SafetyIncidents.Remove(incident);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<SafetyIncidentDto>> GetIncidentsByProjectAsync(int projectId)
        {
            return await GetIncidentsAsync(new SafetyIncidentQueryParams { ProjectId = projectId });
        }

        public async Task<IEnumerable<SafetyIncidentDto>> GetCriticalIncidentsAsync()
        {
            return await GetIncidentsAsync(new SafetyIncidentQueryParams { Severity = (int)IncidentSeverity.Critical });
        }

        public async Task<SafetyIncidentDto> UpdateInvestigationAsync(int id, string rootCause, string correctiveActions)
        {
            var incident = await _context.SafetyIncidents.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety incident {id} not found");

            incident.RootCauseAnalysis = rootCause;
            incident.CorrectiveActions = correctiveActions;
            incident.InvestigationStatus = InvestigationStatus.Completed;
            incident.InvestigationCompletedDate = DateTime.UtcNow;
            incident.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetIncidentByIdAsync(incident.Id) ?? throw new InvalidOperationException();
        }

        #endregion

        #region Safety Training

        public async Task<IEnumerable<SafetyTrainingDto>> GetTrainingsAsync(SafetyTrainingQueryParams? queryParams = null)
        {
            var query = _context.SafetyTrainings
                .AsNoTracking()
                .AsQueryable();

            if (queryParams?.Status.HasValue == true)
                query = query.Where(t => t.Status == (TrainingStatus)queryParams.Status.Value);

            if (!string.IsNullOrEmpty(queryParams?.TrainingType))
                query = query.Where(t => t.TrainingType == queryParams.TrainingType);

            if (queryParams?.FromDate.HasValue == true)
                query = query.Where(t => t.ScheduledDate >= queryParams.FromDate.Value);

            if (queryParams?.ToDate.HasValue == true)
                query = query.Where(t => t.ScheduledDate <= queryParams.ToDate.Value);

            var trainings = await query
                .OrderBy(t => t.ScheduledDate)
                .ToListAsync();

            return trainings.Select(t => new SafetyTrainingDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                TrainingType = t.TrainingType,
                ScheduledDate = t.ScheduledDate,
                CompletedDate = t.CompletedDate,
                Status = (int)t.Status,
                StatusName = t.Status.ToString(),
                TrainerName = t.TrainerName,
                DurationMinutes = t.DurationMinutes,
                RequiresCertification = t.RequiresCertification,
                CertificationExpiryDate = t.CertificationExpiryDate,
                MaxParticipants = t.MaxParticipants ?? 0,
                CurrentParticipants = ParseJsonList(t.Participants).Count,
                CreatedAt = t.CreatedAt
            });
        }

        public async Task<SafetyTrainingDto?> GetTrainingByIdAsync(int id)
        {
            var t = await _context.SafetyTrainings
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (t == null) return null;

            return new SafetyTrainingDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                TrainingType = t.TrainingType,
                ScheduledDate = t.ScheduledDate,
                CompletedDate = t.CompletedDate,
                Status = (int)t.Status,
                StatusName = t.Status.ToString(),
                TrainerName = t.TrainerName,
                DurationMinutes = t.DurationMinutes,
                RequiresCertification = t.RequiresCertification,
                CertificationExpiryDate = t.CertificationExpiryDate,
                MaxParticipants = t.MaxParticipants,
                CurrentParticipants = ParseJsonList(t.Participants).Count,
                CreatedAt = t.CreatedAt
            };
        }

        public async Task<SafetyTrainingDto> CreateTrainingAsync(CreateSafetyTrainingRequest request)
        {
            var training = new SafetyTraining
            {
                Title = request.Title,
                Description = request.Description,
                TrainingType = request.TrainingType,
                ScheduledDate = request.ScheduledDate,
                Status = TrainingStatus.Scheduled,
                TrainerName = request.TrainerName,
                DurationMinutes = request.DurationMinutes,
                RequiresCertification = request.RequiresCertification,
                CertificationExpiryDate = request.CertificationExpiryDate,
                MaxParticipants = request.MaxParticipants,
                CreatedAt = DateTime.UtcNow
            };

            _context.SafetyTrainings.Add(training);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created safety training {TrainingId}", training.Id);

            return await GetTrainingByIdAsync(training.Id) ?? throw new InvalidOperationException();
        }

        public async Task<SafetyTrainingDto> UpdateTrainingAsync(int id, UpdateSafetyTrainingRequest request)
        {
            var training = await _context.SafetyTrainings.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety training {id} not found");

            training.Title = request.Title;
            training.Description = request.Description;
            training.TrainingType = request.TrainingType;
            training.ScheduledDate = request.ScheduledDate;
            training.CompletedDate = request.CompletedDate;
            training.Status = (TrainingStatus)request.Status;
            training.TrainerName = request.TrainerName;
            training.DurationMinutes = request.DurationMinutes;
            training.RequiresCertification = request.RequiresCertification;
            training.CertificationExpiryDate = request.CertificationExpiryDate;
            training.MaxParticipants = request.MaxParticipants;
            training.Participants = request.Participants;
            training.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetTrainingByIdAsync(training.Id) ?? throw new InvalidOperationException();
        }

        public async Task<bool> DeleteTrainingAsync(int id)
        {
            var training = await _context.SafetyTrainings.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety training {id} not found");

            _context.SafetyTrainings.Remove(training);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<SafetyTrainingDto> CompleteTrainingAsync(int id, CompleteTrainingRequest request)
        {
            var training = await _context.SafetyTrainings.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety training {id} not found");

            training.Status = TrainingStatus.Completed;
            training.CompletedDate = request.CompletedDate;
            training.Participants = request.Participants;
            training.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetTrainingByIdAsync(training.Id) ?? throw new InvalidOperationException();
        }

        public async Task<SafetyTrainingDto> AddParticipantAsync(int trainingId, int userId)
        {
            var training = await _context.SafetyTrainings.FindAsync(trainingId)
                ?? throw new KeyNotFoundException($"Safety training {trainingId} not found");

            var participants = ParseJsonList(training.Participants);
            if (!participants.Contains(userId.ToString()))
            {
                participants.Add(userId.ToString());
                training.Participants = $"[{string.Join(",", participants.Select(p => $"\"{p}\""))}]";
            }

            await _context.SaveChangesAsync();

            return await GetTrainingByIdAsync(trainingId) ?? throw new InvalidOperationException();
        }

        public async Task<SafetyTrainingDto> RemoveParticipantAsync(int trainingId, int userId)
        {
            var training = await _context.SafetyTrainings.FindAsync(trainingId)
                ?? throw new KeyNotFoundException($"Safety training {trainingId} not found");

            var participants = ParseJsonList(training.Participants);
            participants.Remove(userId.ToString());
            training.Participants = $"[{string.Join(",", participants.Select(p => $"\"{p}\""))}]";

            await _context.SaveChangesAsync();

            return await GetTrainingByIdAsync(trainingId) ?? throw new InvalidOperationException();
        }

        public async Task<IEnumerable<SafetyTrainingDto>> GetUpcomingTrainingsAsync()
        {
            return await GetTrainingsAsync(new SafetyTrainingQueryParams { Status = (int)TrainingStatus.Scheduled });
        }

        public async Task<IEnumerable<SafetyTrainingDto>> GetExpiringCertificationsAsync(int daysAhead = 30)
        {
            var now = DateTime.UtcNow;
            var endDate = now.AddDays(daysAhead);

            var trainings = await _context.SafetyTrainings
                .Where(t => t.CertificationExpiryDate.HasValue && 
                           t.CertificationExpiryDate > now && 
                           t.CertificationExpiryDate <= endDate)
                .OrderBy(t => t.CertificationExpiryDate)
                .AsNoTracking()
                .ToListAsync();

            return trainings.Select(t => new SafetyTrainingDto
            {
                Id = t.Id,
                Title = t.Title,
                TrainingType = t.TrainingType,
                ScheduledDate = t.ScheduledDate,
                Status = (int)t.Status,
                StatusName = t.Status.ToString(),
                CertificationExpiryDate = t.CertificationExpiryDate
            });
        }

        #endregion

        #region Safety Compliance

        public async Task<IEnumerable<SafetyComplianceDto>> GetComplianceRecordsAsync(int projectId)
        {
            var records = await _context.SafetyCompliances
                .Where(sc => sc.ProjectId == projectId)
                .OrderByDescending(sc => sc.ComplianceDate)
                .AsNoTracking()
                .ToListAsync();

            return records.Select(sc => new SafetyComplianceDto
            {
                Id = sc.Id,
                ProjectId = sc.ProjectId,
                ComplianceDate = sc.ComplianceDate,
                StandardName = sc.StandardName,
                Description = sc.Description,
                IsCompliant = sc.IsCompliant,
                NonComplianceNotes = sc.NonComplianceNotes,
                NextReviewDate = sc.NextReviewDate,
                CreatedAt = sc.CreatedAt
            });
        }

        public async Task<SafetyComplianceDto?> GetComplianceByIdAsync(int id)
        {
            var sc = await _context.SafetyCompliances
                .AsNoTracking()
                .FirstOrDefaultAsync(sc => sc.Id == id);

            if (sc == null) return null;

            return new SafetyComplianceDto
            {
                Id = sc.Id,
                ProjectId = sc.ProjectId,
                ComplianceDate = sc.ComplianceDate,
                StandardName = sc.StandardName,
                Description = sc.Description,
                IsCompliant = sc.IsCompliant,
                NonComplianceNotes = sc.NonComplianceNotes,
                NextReviewDate = sc.NextReviewDate,
                CreatedAt = sc.CreatedAt
            };
        }

        public async Task<SafetyComplianceDto> CreateComplianceRecordAsync(CreateSafetyComplianceRequest request)
        {
            var compliance = new SafetyCompliance
            {
                ProjectId = request.ProjectId,
                ComplianceDate = request.ComplianceDate,
                StandardName = request.StandardName,
                Description = request.Description,
                IsCompliant = request.IsCompliant,
                NonComplianceNotes = request.NonComplianceNotes,
                NextReviewDate = request.NextReviewDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.SafetyCompliances.Add(compliance);
            await _context.SaveChangesAsync();

            return await GetComplianceByIdAsync(compliance.Id) ?? throw new InvalidOperationException();
        }

        public async Task<SafetyComplianceDto> UpdateComplianceRecordAsync(int id, CreateSafetyComplianceRequest request)
        {
            var compliance = await _context.SafetyCompliances.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety compliance record {id} not found");

            compliance.ComplianceDate = request.ComplianceDate;
            compliance.StandardName = request.StandardName;
            compliance.Description = request.Description;
            compliance.IsCompliant = request.IsCompliant;
            compliance.NonComplianceNotes = request.NonComplianceNotes;
            compliance.NextReviewDate = request.NextReviewDate;
            compliance.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetComplianceByIdAsync(compliance.Id) ?? throw new InvalidOperationException();
        }

        public async Task<bool> DeleteComplianceRecordAsync(int id)
        {
            var compliance = await _context.SafetyCompliances.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety compliance record {id} not found");

            _context.SafetyCompliances.Remove(compliance);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<SafetyComplianceDto> MarkAsCompliantAsync(int id, string notes)
        {
            var compliance = await _context.SafetyCompliances.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety compliance record {id} not found");

            compliance.IsCompliant = true;
            compliance.NonComplianceNotes = notes;
            compliance.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetComplianceByIdAsync(compliance.Id) ?? throw new InvalidOperationException();
        }

        public async Task<SafetyComplianceDto> MarkAsNonCompliantAsync(int id, string notes)
        {
            var compliance = await _context.SafetyCompliances.FindAsync(id)
                ?? throw new KeyNotFoundException($"Safety compliance record {id} not found");

            compliance.IsCompliant = false;
            compliance.NonComplianceNotes = notes;
            compliance.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetComplianceByIdAsync(compliance.Id) ?? throw new InvalidOperationException();
        }

        #endregion

        #region Helpers

        private static List<string> ParseJsonList(string? json)
        {
            if (string.IsNullOrEmpty(json)) return new List<string>();

            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        #endregion
    }
}
