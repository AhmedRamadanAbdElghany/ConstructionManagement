using System.Text.Json;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NotificationPriority = ConstructionManagement.Domain.Entities.NotificationPriority;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service implementation for managing escalations
/// </summary>
public class EscalationService : IEscalationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EscalationService> _logger;
    private readonly ITaskNotificationService _notificationService;

    public EscalationService(
        ApplicationDbContext context,
        ILogger<EscalationService> logger,
        ITaskNotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    // -- Escalation CRUD -------------------------------------------------------
    public async Task<ProjectItemEscalation> CreateEscalationAsync(int companyId, int projectId,
        EscalationType escalationType, EscalationSeverity severity, string title, string description,
        int? projectItemId = null, int? taskId = null, int? reportedByUserId = null,
        string? triggerReason = null, decimal? estimatedCostImpact = null, int? estimatedDelayDays = null,
        bool affectsCriticalPath = false)
    {
        var escalation = new ProjectItemEscalation
        {
            CompanyId = companyId,
            ProjectId = projectId,
            ProjectItemId = projectItemId,
            ProjectItemTaskId = taskId,
            EscalationType = escalationType,
            Severity = severity,
            Title = title,
            Description = description,
            ReportedByUserId = reportedByUserId,
            TriggerReason = triggerReason,
            EstimatedCostImpact = estimatedCostImpact,
            EstimatedDelayDays = estimatedDelayDays,
            AffectsCriticalPath = affectsCriticalPath,
            Status = EscalationStatus.Open
        };

        _context.ProjectItemEscalations.Add(escalation);
        await _context.SaveChangesAsync();

        _logger.LogWarning("Escalation created: {Title} (Type: {Type}, Severity: {Severity})",
            title, escalationType, severity);

        // Send notification
        await SendEscalationNotificationAsync(escalation.Id);

        return escalation;
    }

    public async Task<ProjectItemEscalation?> GetEscalationByIdAsync(int escalationId)
    {
        return await _context.ProjectItemEscalations
            .Include(e => e.Project)
            .Include(e => e.ProjectItem)
            .Include(e => e.Task)
            .Include(e => e.ReportedByUser)
            .Include(e => e.AssignedToUser)
            .Include(e => e.ResolvedByUser)
            .Include(e => e.Actions)
            .FirstOrDefaultAsync(e => e.Id == escalationId);
    }

    public async Task<IEnumerable<ProjectItemEscalation>> GetEscalationsByProjectIdAsync(int projectId)
    {
        return await _context.ProjectItemEscalations
            .Include(e => e.ProjectItem)
            .Include(e => e.Task)
            .Include(e => e.AssignedToUser)
            .Where(e => e.ProjectId == projectId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemEscalation>> GetEscalationsByProjectItemIdAsync(int projectItemId)
    {
        return await _context.ProjectItemEscalations
            .Include(e => e.Task)
            .Include(e => e.AssignedToUser)
            .Where(e => e.ProjectItemId == projectItemId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemEscalation>> GetEscalationsByTaskIdAsync(int taskId)
    {
        return await _context.ProjectItemEscalations
            .Include(e => e.AssignedToUser)
            .Where(e => e.ProjectItemTaskId == taskId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemEscalation>> GetOpenEscalationsAsync(int companyId)
    {
        return await _context.ProjectItemEscalations
            .Include(e => e.Project)
            .Include(e => e.ProjectItem)
            .Include(e => e.Task)
            .Include(e => e.AssignedToUser)
            .Where(e => e.CompanyId == companyId && e.Status == EscalationStatus.Open)
            .OrderBy(e => e.Severity)
            .ThenBy(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemEscalation>> GetEscalationsByStatusAsync(int companyId, EscalationStatus status)
    {
        return await _context.ProjectItemEscalations
            .Include(e => e.Project)
            .Include(e => e.ProjectItem)
            .Include(e => e.Task)
            .Where(e => e.CompanyId == companyId && e.Status == status)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemEscalation>> GetEscalationsBySeverityAsync(int companyId, EscalationSeverity severity)
    {
        return await _context.ProjectItemEscalations
            .Include(e => e.Project)
            .Include(e => e.ProjectItem)
            .Where(e => e.CompanyId == companyId && e.Severity == severity)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItemEscalation>> GetEscalationsAssignedToUserAsync(int userId)
    {
        return await _context.ProjectItemEscalations
            .Include(e => e.Project)
            .Include(e => e.ProjectItem)
            .Include(e => e.Task)
            .Where(e => e.AssignedToUserId == userId && e.Status != EscalationStatus.Resolved && e.Status != EscalationStatus.Closed)
            .OrderBy(e => e.Severity)
            .ThenBy(e => e.CreatedAt)
            .ToListAsync();
    }

    // -- Escalation Workflow ---------------------------------------------------
    public async Task<ProjectItemEscalation> AcknowledgeEscalationAsync(int escalationId, int acknowledgedByUserId)
    {
        var escalation = await _context.ProjectItemEscalations.FindAsync(escalationId);
        if (escalation == null)
            throw new InvalidOperationException($"Escalation with ID {escalationId} not found");

        escalation.Status = EscalationStatus.InProgress;
        escalation.AcknowledgedAt = DateTime.UtcNow;
        escalation.AssignedToUserId = acknowledgedByUserId;

        await AddActionAsync(escalationId, EscalationActionType.Acknowledged, acknowledgedByUserId,
            "Escalation acknowledged");

        await _context.SaveChangesAsync();
        _logger.LogInformation("Escalation {Id} acknowledged by user {UserId}", escalationId, acknowledgedByUserId);

        return escalation;
    }

    public async Task<ProjectItemEscalation> AssignEscalationAsync(int escalationId, int assignedToUserId, int assignedByUserId)
    {
        var escalation = await _context.ProjectItemEscalations.FindAsync(escalationId);
        if (escalation == null)
            throw new InvalidOperationException($"Escalation with ID {escalationId} not found");

        escalation.AssignedToUserId = assignedToUserId;

        await AddActionAsync(escalationId, EscalationActionType.Assigned, assignedByUserId,
            $"Escalation assigned to user {assignedToUserId}");

        await _context.SaveChangesAsync();
        _logger.LogInformation("Escalation {Id} assigned to user {UserId}", escalationId, assignedToUserId);

        return escalation;
    }

    public async Task<ProjectItemEscalation> ResolveEscalationAsync(int escalationId, int resolvedByUserId,
        string resolutionNotes, string? resolutionAction = null)
    {
        var escalation = await _context.ProjectItemEscalations.FindAsync(escalationId);
        if (escalation == null)
            throw new InvalidOperationException($"Escalation with ID {escalationId} not found");

        escalation.Status = EscalationStatus.Resolved;
        escalation.ResolvedByUserId = resolvedByUserId;
        escalation.ResolvedAt = DateTime.UtcNow;
        escalation.ResolutionNotes = resolutionNotes;
        escalation.ResolutionAction = resolutionAction;

        await AddActionAsync(escalationId, EscalationActionType.Resolved, resolvedByUserId,
            resolutionNotes, isResolution: true);

        await _context.SaveChangesAsync();
        
        await _notificationService.SendEscalationResolvedNotificationAsync(escalation);
        _logger.LogInformation("Escalation {Id} resolved by user {UserId}", escalationId, resolvedByUserId);

        return escalation;
    }

    public async Task<ProjectItemEscalation> CloseEscalationAsync(int escalationId, int closedByUserId, string? notes = null)
    {
        var escalation = await _context.ProjectItemEscalations.FindAsync(escalationId);
        if (escalation == null)
            throw new InvalidOperationException($"Escalation with ID {escalationId} not found");

        escalation.Status = EscalationStatus.Closed;

        await AddActionAsync(escalationId, EscalationActionType.Closed, closedByUserId,
            notes ?? "Escalation closed");

        await _context.SaveChangesAsync();
        _logger.LogInformation("Escalation {Id} closed by user {UserId}", escalationId, closedByUserId);

        return escalation;
    }

    public async Task<ProjectItemEscalation> EscalateToNextLevelAsync(int escalationId, int escalatedByUserId, string reason)
    {
        var escalation = await _context.ProjectItemEscalations.FindAsync(escalationId);
        if (escalation == null)
            throw new InvalidOperationException($"Escalation with ID {escalationId} not found");

        var previousLevel = escalation.EscalationLevel;
        escalation.EscalationLevel++;
        escalation.Status = EscalationStatus.Escalated;

        // Create new escalation record for the escalated level
        var newEscalation = new ProjectItemEscalation
        {
            CompanyId = escalation.CompanyId,
            ProjectId = escalation.ProjectId,
            ProjectItemId = escalation.ProjectItemId,
            ProjectItemTaskId = escalation.ProjectItemTaskId,
            EscalationType = escalation.EscalationType,
            Severity = escalation.Severity,
            Title = $"[Level {escalation.EscalationLevel}] {escalation.Title}",
            Description = escalation.Description,
            PreviousEscalationId = escalationId,
            EscalationLevel = escalation.EscalationLevel,
            Status = EscalationStatus.Open
        };

        _context.ProjectItemEscalations.Add(newEscalation);
        await AddActionAsync(escalationId, EscalationActionType.Escalated, escalatedByUserId,
            $"Escalated to level {escalation.EscalationLevel}. Reason: {reason}");

        await _context.SaveChangesAsync();
        
        await SendEscalationNotificationAsync(newEscalation.Id);
        _logger.LogWarning("Escalation {Id} escalated to level {Level} by user {UserId}",
            escalationId, escalation.EscalationLevel, escalatedByUserId);

        return newEscalation;
    }

    public async Task<ProjectItemEscalation> ReopenEscalationAsync(int escalationId, int reopenedByUserId, string reason)
    {
        var escalation = await _context.ProjectItemEscalations.FindAsync(escalationId);
        if (escalation == null)
            throw new InvalidOperationException($"Escalation with ID {escalationId} not found");

        escalation.Status = EscalationStatus.Open;
        escalation.ResolvedByUserId = null;
        escalation.ResolvedAt = null;
        escalation.ResolutionNotes = null;

        await AddActionAsync(escalationId, EscalationActionType.Reopened, reopenedByUserId,
            $"Escalation reopened. Reason: {reason}");

        await _context.SaveChangesAsync();
        _logger.LogInformation("Escalation {Id} reopened by user {UserId}", escalationId, reopenedByUserId);

        return escalation;
    }

    // -- Escalation Actions ----------------------------------------------------
    public async Task<EscalationAction> AddActionAsync(int escalationId, EscalationActionType actionType,
        int actionByUserId, string description, bool isResolution = false)
    {
        var action = new EscalationAction
        {
            ProjectItemEscalationId = escalationId,
            ActionType = actionType,
            Description = description,
            ActionByUserId = actionByUserId,
            IsResolution = isResolution
        };

        _context.EscalationActions.Add(action);
        await _context.SaveChangesAsync();
        return action;
    }

    public async Task<IEnumerable<EscalationAction>> GetEscalationActionsAsync(int escalationId)
    {
        return await _context.EscalationActions
            .Include(a => a.ActionByUser)
            .Where(a => a.ProjectItemEscalationId == escalationId)
            .OrderBy(a => a.ActionAt)
            .ToListAsync();
    }

    // -- Follow-up -------------------------------------------------------------
    public async Task<ProjectItemEscalation> ScheduleFollowUpAsync(int escalationId, DateTime followUpDate, string? notes = null)
    {
        var escalation = await _context.ProjectItemEscalations.FindAsync(escalationId);
        if (escalation == null)
            throw new InvalidOperationException($"Escalation with ID {escalationId} not found");

        escalation.RequiresFollowUp = true;
        escalation.FollowUpDate = followUpDate;
        escalation.FollowUpNotes = notes;

        await AddActionAsync(escalationId, EscalationActionType.FollowUpScheduled, 0,
            $"Follow-up scheduled for {followUpDate:yyyy-MM-dd}");

        await _context.SaveChangesAsync();
        return escalation;
    }

    public async Task<IEnumerable<ProjectItemEscalation>> GetPendingFollowUpsAsync(int companyId)
    {
        var now = DateTime.UtcNow;
        return await _context.ProjectItemEscalations
            .Include(e => e.Project)
            .Where(e => e.CompanyId == companyId &&
                        e.RequiresFollowUp &&
                        e.FollowUpDate.HasValue &&
                        e.FollowUpDate.Value <= now &&
                        e.Status != EscalationStatus.Resolved &&
                        e.Status != EscalationStatus.Closed)
            .OrderBy(e => e.FollowUpDate)
            .ToListAsync();
    }

    public async Task<ProjectItemEscalation> CompleteFollowUpAsync(int escalationId, string notes)
    {
        var escalation = await _context.ProjectItemEscalations.FindAsync(escalationId);
        if (escalation == null)
            throw new InvalidOperationException($"Escalation with ID {escalationId} not found");

        escalation.RequiresFollowUp = false;
        escalation.FollowUpDate = null;
        escalation.FollowUpNotes = notes;

        await _context.SaveChangesAsync();
        return escalation;
    }

    // -- Notifications ---------------------------------------------------------
    public async Task SendEscalationNotificationAsync(int escalationId)
    {
        var escalation = await GetEscalationByIdAsync(escalationId);
        if (escalation == null) return;

        // Get notification recipients based on escalation level
        var config = await _context.WorkflowConfigurations
            .FirstOrDefaultAsync(c => c.CompanyId == escalation.CompanyId && c.ProjectId == null);

        if (config == null) return;

        var recipientUserIdsJson = escalation.EscalationLevel switch
        {
            1 => config.EscalationLevel1UserIds,
            2 => config.EscalationLevel2UserIds,
            _ => config.EscalationLevel3UserIds
        };

        if (string.IsNullOrEmpty(recipientUserIdsJson)) return;

        var recipientUserIds = JsonSerializer.Deserialize<List<int>>(recipientUserIdsJson);
        if (recipientUserIds == null || !recipientUserIds.Any()) return;

        // Create notification
        var notification = new TaskNotification
        {
            CompanyId = escalation.CompanyId,
            ProjectItemTaskId = escalation.ProjectItemTaskId ?? 0,
            Type = TaskNotificationType.EscalationCreated,
            Title = $"Escalation: {escalation.Title}",
            Message = escalation.Description,
            RecipientUserIds = JsonSerializer.Serialize(recipientUserIds),
            Priority = escalation.Severity == EscalationSeverity.Critical ? NotificationPriority.Urgent :
                       escalation.Severity == EscalationSeverity.High ? NotificationPriority.High :
                       NotificationPriority.Normal,
            ActionUrl = $"/escalations/{escalation.Id}"
        };

        _context.TaskNotifications.Add(notification);
        await _context.SaveChangesAsync();

        escalation.NotificationSent = true;
        escalation.NotificationSentAt = DateTime.UtcNow;
        escalation.NotifiedUserIds = JsonSerializer.Serialize(recipientUserIds);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Escalation notification sent for {Id}", escalationId);
    }

    public async Task SendEscalationReminderAsync(int escalationId)
    {
        var escalation = await GetEscalationByIdAsync(escalationId);
        if (escalation == null || escalation.Status == EscalationStatus.Resolved || escalation.Status == EscalationStatus.Closed)
            return;

        // Send reminder to assigned user or escalation recipients
        var recipientUserIds = new List<int>();
        if (escalation.AssignedToUserId.HasValue)
        {
            recipientUserIds.Add(escalation.AssignedToUserId.Value);
        }

        if (!recipientUserIds.Any() && !string.IsNullOrEmpty(escalation.NotifiedUserIds))
        {
            recipientUserIds = JsonSerializer.Deserialize<List<int>>(escalation.NotifiedUserIds) ?? new List<int>();
        }

        if (!recipientUserIds.Any()) return;

        var notification = new TaskNotification
        {
            CompanyId = escalation.CompanyId,
            ProjectItemTaskId = escalation.ProjectItemTaskId ?? 0,
            Type = TaskNotificationType.EscalationCreated,
            Title = $"Escalation Reminder: {escalation.Title}",
            Message = $"This escalation is still pending. Status: {escalation.Status}",
            RecipientUserIds = JsonSerializer.Serialize(recipientUserIds),
            Priority = NotificationPriority.High,
            ActionUrl = $"/escalations/{escalation.Id}"
        };

        _context.TaskNotifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    // -- Statistics ------------------------------------------------------------
    public async Task<Dictionary<EscalationType, int>> GetEscalationTypeCountsAsync(int companyId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.ProjectItemEscalations
            .Where(e => e.CompanyId == companyId);

        if (fromDate.HasValue)
            query = query.Where(e => e.CreatedAt >= fromDate);
        if (toDate.HasValue)
            query = query.Where(e => e.CreatedAt <= toDate);

        var escalations = await query
            .GroupBy(e => e.EscalationType)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync();

        return escalations.ToDictionary(e => e.Type, e => e.Count);
    }

    public async Task<Dictionary<EscalationStatus, int>> GetEscalationStatusCountsAsync(int companyId)
    {
        var escalations = await _context.ProjectItemEscalations
            .Where(e => e.CompanyId == companyId)
            .GroupBy(e => e.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return escalations.ToDictionary(e => e.Status, e => e.Count);
    }

    public async Task<Dictionary<EscalationSeverity, int>> GetEscalationSeverityCountsAsync(int companyId)
    {
        var escalations = await _context.ProjectItemEscalations
            .Where(e => e.CompanyId == companyId)
            .GroupBy(e => e.Severity)
            .Select(g => new { Severity = g.Key, Count = g.Count() })
            .ToListAsync();

        return escalations.ToDictionary(e => e.Severity, e => e.Count);
    }

    public async Task<decimal> GetAverageResolutionTimeAsync(int companyId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.ProjectItemEscalations
            .Where(e => e.CompanyId == companyId &&
                        e.Status == EscalationStatus.Resolved &&
                        e.ResolvedAt.HasValue);

        if (fromDate.HasValue)
            query = query.Where(e => e.CreatedAt >= fromDate);
        if (toDate.HasValue)
            query = query.Where(e => e.CreatedAt <= toDate);

        var escalations = await query
            .Select(e => new { e.CreatedAt, e.ResolvedAt })
            .ToListAsync();

        if (!escalations.Any())
            return 0;

        var totalHours = escalations.Sum(e => (e.ResolvedAt!.Value - e.CreatedAt).TotalHours);
        return (decimal)(totalHours / escalations.Count);
    }

    public async Task<int> GetEscalationsCountByProjectAsync(int projectId)
    {
        return await _context.ProjectItemEscalations
            .CountAsync(e => e.ProjectId == projectId);
    }

    // -- Search & Filter -------------------------------------------------------
    public async Task<IEnumerable<ProjectItemEscalation>> SearchEscalationsAsync(int companyId, string searchTerm,
        int? projectId = null, EscalationType? type = null, EscalationStatus? status = null,
        EscalationSeverity? severity = null, int? assignedToUserId = null,
        DateTime? createdFrom = null, DateTime? createdTo = null)
    {
        var query = _context.ProjectItemEscalations
            .Include(e => e.Project)
            .Include(e => e.ProjectItem)
            .Include(e => e.Task)
            .Include(e => e.AssignedToUser)
            .Where(e => e.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(e => e.Title.Contains(searchTerm) ||
                                     e.Description.Contains(searchTerm));
        }

        if (projectId.HasValue)
            query = query.Where(e => e.ProjectId == projectId);
        if (type.HasValue)
            query = query.Where(e => e.EscalationType == type);
        if (status.HasValue)
            query = query.Where(e => e.Status == status);
        if (severity.HasValue)
            query = query.Where(e => e.Severity == severity);
        if (assignedToUserId.HasValue)
            query = query.Where(e => e.AssignedToUserId == assignedToUserId);
        if (createdFrom.HasValue)
            query = query.Where(e => e.CreatedAt >= createdFrom);
        if (createdTo.HasValue)
            query = query.Where(e => e.CreatedAt <= createdTo);

        return await query.OrderByDescending(e => e.CreatedAt).ToListAsync();
    }

    // -- Auto-Escalation -------------------------------------------------------
    public async Task CheckAndEscalateStaleEscalationsAsync(int companyId)
    {
        var config = await _context.WorkflowConfigurations
            .FirstOrDefaultAsync(c => c.CompanyId == companyId && c.ProjectId == null);

        if (config == null || config.AutoEscalateHours <= 0)
            return;

        var threshold = DateTime.UtcNow.AddHours(-config.AutoEscalateHours);
        var staleEscalations = await _context.ProjectItemEscalations
            .Where(e => e.CompanyId == companyId &&
                        e.Status == EscalationStatus.Open &&
                        e.CreatedAt < threshold &&
                        e.EscalationLevel < config.MaxEscalationLevel)
            .ToListAsync();

        foreach (var escalation in staleEscalations)
        {
            try
            {
                await EscalateToNextLevelAsync(escalation.Id, 0, "Auto-escalated due to no acknowledgment");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-escalate escalation {Id}", escalation.Id);
            }
        }
    }

    public async Task<int> AutoEscalateUnacknowledgedAsync(int companyId)
    {
        var config = await _context.WorkflowConfigurations
            .FirstOrDefaultAsync(c => c.CompanyId == companyId && c.ProjectId == null);

        if (config == null || config.AutoEscalateHours <= 0)
            return 0;

        var threshold = DateTime.UtcNow.AddHours(-config.AutoEscalateHours);
        var count = await _context.ProjectItemEscalations
            .Where(e => e.CompanyId == companyId &&
                        e.Status == EscalationStatus.Open &&
                        e.CreatedAt < threshold &&
                        e.EscalationLevel < config.MaxEscalationLevel)
            .CountAsync();

        await CheckAndEscalateStaleEscalationsAsync(companyId);
        return count;
    }
}
