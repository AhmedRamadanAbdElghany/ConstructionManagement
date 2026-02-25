using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using EscalationType = ConstructionManagement.Domain.Enums.EscalationType;
using EscalationSeverity = ConstructionManagement.Domain.Enums.EscalationSeverity;
using EscalationStatus = ConstructionManagement.Domain.Enums.EscalationStatus;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for managing escalations
/// </summary>
public interface IEscalationService
{
    // -- Escalation CRUD -------------------------------------------------------
    Task<ProjectItemEscalation> CreateEscalationAsync(int companyId, int projectId,
        EscalationType escalationType, EscalationSeverity severity, string title, string description,
        int? projectItemId = null, int? taskId = null, int? reportedByUserId = null,
        string? triggerReason = null, decimal? estimatedCostImpact = null, int? estimatedDelayDays = null,
        bool affectsCriticalPath = false);
    
    Task<ProjectItemEscalation?> GetEscalationByIdAsync(int escalationId);
    Task<IEnumerable<ProjectItemEscalation>> GetEscalationsByProjectIdAsync(int projectId);
    Task<IEnumerable<ProjectItemEscalation>> GetEscalationsByProjectItemIdAsync(int projectItemId);
    Task<IEnumerable<ProjectItemEscalation>> GetEscalationsByTaskIdAsync(int taskId);
    Task<IEnumerable<ProjectItemEscalation>> GetOpenEscalationsAsync(int companyId);
    Task<IEnumerable<ProjectItemEscalation>> GetEscalationsByStatusAsync(int companyId, EscalationStatus status);
    Task<IEnumerable<ProjectItemEscalation>> GetEscalationsBySeverityAsync(int companyId, EscalationSeverity severity);
    Task<IEnumerable<ProjectItemEscalation>> GetEscalationsAssignedToUserAsync(int userId);
    
    // -- Escalation Workflow ---------------------------------------------------
    Task<ProjectItemEscalation> AcknowledgeEscalationAsync(int escalationId, int acknowledgedByUserId);
    Task<ProjectItemEscalation> AssignEscalationAsync(int escalationId, int assignedToUserId, int assignedByUserId);
    Task<ProjectItemEscalation> ResolveEscalationAsync(int escalationId, int resolvedByUserId,
        string resolutionNotes, string? resolutionAction = null);
    Task<ProjectItemEscalation> CloseEscalationAsync(int escalationId, int closedByUserId, string? notes = null);
    Task<ProjectItemEscalation> EscalateToNextLevelAsync(int escalationId, int escalatedByUserId, string reason);
    Task<ProjectItemEscalation> ReopenEscalationAsync(int escalationId, int reopenedByUserId, string reason);
    
    // -- Escalation Actions ----------------------------------------------------
    Task<EscalationAction> AddActionAsync(int escalationId, EscalationActionType actionType,
        int actionByUserId, string description, bool isResolution = false);
    Task<IEnumerable<EscalationAction>> GetEscalationActionsAsync(int escalationId);
    
    // -- Follow-up -------------------------------------------------------------
    Task<ProjectItemEscalation> ScheduleFollowUpAsync(int escalationId, DateTime followUpDate, string? notes = null);
    Task<IEnumerable<ProjectItemEscalation>> GetPendingFollowUpsAsync(int companyId);
    Task<ProjectItemEscalation> CompleteFollowUpAsync(int escalationId, string notes);
    
    // -- Notifications ---------------------------------------------------------
    Task SendEscalationNotificationAsync(int escalationId);
    Task SendEscalationReminderAsync(int escalationId);
    
    // -- Statistics ------------------------------------------------------------
    Task<Dictionary<EscalationType, int>> GetEscalationTypeCountsAsync(int companyId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<Dictionary<EscalationStatus, int>> GetEscalationStatusCountsAsync(int companyId);
    Task<Dictionary<EscalationSeverity, int>> GetEscalationSeverityCountsAsync(int companyId);
    Task<decimal> GetAverageResolutionTimeAsync(int companyId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<int> GetEscalationsCountByProjectAsync(int projectId);
    
    // -- Search & Filter -------------------------------------------------------
    Task<IEnumerable<ProjectItemEscalation>> SearchEscalationsAsync(int companyId, string searchTerm,
        int? projectId = null, EscalationType? type = null, EscalationStatus? status = null,
        EscalationSeverity? severity = null, int? assignedToUserId = null,
        DateTime? createdFrom = null, DateTime? createdTo = null);
    
    // -- Auto-Escalation -------------------------------------------------------
    Task CheckAndEscalateStaleEscalationsAsync(int companyId);
    Task<int> AutoEscalateUnacknowledgedAsync(int companyId);
}

/// <summary>
/// Service interface for task notifications
/// </summary>
public interface ITaskNotificationService
{
    // -- Notification Creation -------------------------------------------------
    Task<TaskNotification> CreateNotificationAsync(int companyId, int taskId,
        TaskNotificationType type, string title, string message,
        IEnumerable<int> recipientUserIds, ProjectTaskStatus? previousStatus = null,
        ProjectTaskStatus? newStatus = null, ConstructionManagement.Domain.Entities.NotificationPriority priority = ConstructionManagement.Domain.Entities.NotificationPriority.Normal,
        bool sendInApp = true, bool sendPush = true, bool sendEmail = false, bool sendSms = false,
        string? actionUrl = null, string? actionText = null, string? additionalData = null);
    
    // -- Notification Retrieval ------------------------------------------------
    Task<TaskNotification?> GetNotificationByIdAsync(int notificationId);
    Task<IEnumerable<TaskNotification>> GetNotificationsByTaskIdAsync(int taskId);
    Task<IEnumerable<TaskNotification>> GetUnreadNotificationsForUserAsync(int userId);
    Task<IEnumerable<TaskNotification>> GetNotificationsForUserAsync(int userId, int limit = 50);
    Task<int> GetUnreadNotificationCountAsync(int userId);
    
    // -- Notification Status ---------------------------------------------------
    Task MarkAsReadAsync(int notificationId, int userId);
    Task MarkAllAsReadForUserAsync(int userId);
    Task MarkAsSentAsync(int notificationId);
    
    // -- Notification Delivery -------------------------------------------------
    Task SendNotificationAsync(int notificationId);
    Task SendPendingNotificationsAsync();
    Task SendInAppNotificationAsync(int notificationId);
    Task SendPushNotificationAsync(int notificationId);
    Task SendEmailNotificationAsync(int notificationId);
    Task SendSmsNotificationAsync(int notificationId);
    
    // -- Task State Transition Notifications -----------------------------------
    Task SendTaskCreatedNotificationAsync(ProjectItemTask task);
    Task SendTaskAssignedNotificationAsync(ProjectItemTask task, int assignedByUserId);
    Task SendTaskStartedNotificationAsync(ProjectItemTask task);
    Task SendTaskSubmittedForReviewNotificationAsync(ProjectItemTask task);
    Task SendTaskApprovedNotificationAsync(ProjectItemTask task, int reviewerUserId);
    Task SendTaskRejectedNotificationAsync(ProjectItemTask task, int reviewerUserId, string? reason);
    Task SendRevisionRequestedNotificationAsync(ProjectItemTask task, int reviewerUserId, string instructions);
    Task SendTaskOnHoldNotificationAsync(ProjectItemTask task, string? reason);
    Task SendTaskResumedNotificationAsync(ProjectItemTask task);
    Task SendTaskCancelledNotificationAsync(ProjectItemTask task, string? reason);
    Task SendTaskOverdueNotificationAsync(ProjectItemTask task);
    Task SendTaskDueSoonNotificationAsync(ProjectItemTask task, int daysRemaining);
    Task SendPreStartConfirmationReminderAsync(ProjectItem item);
    Task SendPreStartConfirmationReminderAsync(ProjectItemTask task);
    Task SendPreStartConfirmedNotificationAsync(ProjectItemTask task, int confirmedByUserId);
    Task SendForcedStartAuthorizedNotificationAsync(ProjectItemTask task, int authorizedByUserId, string reason);
    Task SendEscalationResolvedNotificationAsync(ProjectItemEscalation escalation);
    
    // -- Cleanup ---------------------------------------------------------------
    Task DeleteOldNotificationsAsync(int daysOld = 90);
}
