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
/// Service implementation for task notifications
/// </summary>
public class TaskNotificationService : ITaskNotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TaskNotificationService> _logger;

    public TaskNotificationService(
        ApplicationDbContext context,
        ILogger<TaskNotificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    // -- Notification Creation -------------------------------------------------
    public async Task<TaskNotification> CreateNotificationAsync(int companyId, int taskId,
        TaskNotificationType type, string title, string message,
        IEnumerable<int> recipientUserIds, ProjectTaskStatus? previousStatus = null,
        ProjectTaskStatus? newStatus = null, NotificationPriority priority = NotificationPriority.Normal,
        bool sendInApp = true, bool sendPush = true, bool sendEmail = false, bool sendSms = false,
        string? actionUrl = null, string? actionText = null, string? additionalData = null)
    {
        var notification = new TaskNotification
        {
            CompanyId = companyId,
            ProjectItemTaskId = taskId,
            Type = type,
            Title = title,
            Message = message,
            RecipientUserIds = JsonSerializer.Serialize(recipientUserIds.ToList()),
            PreviousStatus = previousStatus,
            NewStatus = newStatus,
            Priority = priority,
            SendInApp = sendInApp,
            SendPush = sendPush,
            SendEmail = sendEmail,
            SendSms = sendSms,
            ActionUrl = actionUrl,
            ActionText = actionText,
            AdditionalData = additionalData
        };

        _context.TaskNotifications.Add(notification);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification created: {Title} for {Count} recipients", title, recipientUserIds.Count());
        return notification;
    }

    // -- Notification Retrieval ------------------------------------------------
    public async Task<TaskNotification?> GetNotificationByIdAsync(int notificationId)
    {
        return await _context.TaskNotifications
            .Include(n => n.Task)
            .FirstOrDefaultAsync(n => n.Id == notificationId);
    }

    public async Task<IEnumerable<TaskNotification>> GetNotificationsByTaskIdAsync(int taskId)
    {
        return await _context.TaskNotifications
            .Where(n => n.ProjectItemTaskId == taskId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskNotification>> GetUnreadNotificationsForUserAsync(int userId)
    {
        var notifications = await _context.TaskNotifications
            .Where(n => n.RecipientUserIds.Contains(userId.ToString()) &&
                        !n.ReadByUserIds.Contains(userId.ToString()))
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return notifications.Where(n =>
        {
            var recipients = JsonSerializer.Deserialize<List<int>>(n.RecipientUserIds) ?? new List<int>();
            var readBy = JsonSerializer.Deserialize<List<int>>(n.ReadByUserIds) ?? new List<int>();
            return recipients.Contains(userId) && !readBy.Contains(userId);
        });
    }

    public async Task<IEnumerable<TaskNotification>> GetNotificationsForUserAsync(int userId, int limit = 50)
    {
        var notifications = await _context.TaskNotifications
            .Include(n => n.Task)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();

        return notifications.Where(n =>
        {
            var recipients = JsonSerializer.Deserialize<List<int>>(n.RecipientUserIds) ?? new List<int>();
            return recipients.Contains(userId);
        });
    }

    public async Task<int> GetUnreadNotificationCountAsync(int userId)
    {
        var notifications = await _context.TaskNotifications
            .Where(n => n.RecipientUserIds.Contains(userId.ToString()))
            .ToListAsync();

        return notifications.Count(n =>
        {
            var recipients = JsonSerializer.Deserialize<List<int>>(n.RecipientUserIds) ?? new List<int>();
            var readBy = JsonSerializer.Deserialize<List<int>>(n.ReadByUserIds) ?? new List<int>();
            return recipients.Contains(userId) && !readBy.Contains(userId);
        });
    }

    // -- Notification Status ---------------------------------------------------
    public async Task MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _context.TaskNotifications.FindAsync(notificationId);
        if (notification == null) return;

        var readBy = JsonSerializer.Deserialize<List<int>>(notification.ReadByUserIds) ?? new List<int>();
        if (!readBy.Contains(userId))
        {
            readBy.Add(userId);
            notification.ReadByUserIds = JsonSerializer.Serialize(readBy);
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadForUserAsync(int userId)
    {
        var notifications = await _context.TaskNotifications
            .Where(n => n.RecipientUserIds.Contains(userId.ToString()) &&
                        !n.ReadByUserIds.Contains(userId.ToString()))
            .ToListAsync();

        foreach (var notification in notifications)
        {
            var readBy = JsonSerializer.Deserialize<List<int>>(notification.ReadByUserIds) ?? new List<int>();
            if (!readBy.Contains(userId))
            {
                readBy.Add(userId);
                notification.ReadByUserIds = JsonSerializer.Serialize(readBy);
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("All notifications marked as read for user {UserId}", userId);
    }

    public async Task MarkAsSentAsync(int notificationId)
    {
        var notification = await _context.TaskNotifications.FindAsync(notificationId);
        if (notification == null) return;

        notification.SentAt = DateTime.UtcNow;
        notification.InAppSent = true;
        await _context.SaveChangesAsync();
    }

    // -- Notification Delivery -------------------------------------------------
    public async Task SendNotificationAsync(int notificationId)
    {
        var notification = await GetNotificationByIdAsync(notificationId);
        if (notification == null) return;

        if (notification.SendInApp)
            await SendInAppNotificationAsync(notificationId);
        if (notification.SendPush)
            await SendPushNotificationAsync(notificationId);
        if (notification.SendEmail)
            await SendEmailNotificationAsync(notificationId);
        if (notification.SendSms)
            await SendSmsNotificationAsync(notificationId);

        notification.SentAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task SendPendingNotificationsAsync()
    {
        var pendingNotifications = await _context.TaskNotifications
            .Where(n => n.SentAt == null)
            .ToListAsync();

        foreach (var notification in pendingNotifications)
        {
            try
            {
                await SendNotificationAsync(notification.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification {Id}", notification.Id);
            }
        }
    }

    public async Task SendInAppNotificationAsync(int notificationId)
    {
        var notification = await _context.TaskNotifications.FindAsync(notificationId);
        if (notification == null) return;

        // In-app notifications are stored in the database and retrieved by the frontend
        notification.InAppSent = true;
        await _context.SaveChangesAsync();
        _logger.LogDebug("In-app notification sent: {Id}", notificationId);
    }

    public async Task SendPushNotificationAsync(int notificationId)
    {
        var notification = await _context.TaskNotifications.FindAsync(notificationId);
        if (notification == null) return;

        // TODO: Integrate with push notification service (Firebase, etc.)
        notification.PushSent = true;
        await _context.SaveChangesAsync();
        _logger.LogDebug("Push notification sent: {Id}", notificationId);
    }

    public async Task SendEmailNotificationAsync(int notificationId)
    {
        var notification = await _context.TaskNotifications.FindAsync(notificationId);
        if (notification == null) return;

        // TODO: Integrate with email service
        notification.EmailSent = true;
        await _context.SaveChangesAsync();
        _logger.LogDebug("Email notification sent: {Id}", notificationId);
    }

    public async Task SendSmsNotificationAsync(int notificationId)
    {
        var notification = await _context.TaskNotifications.FindAsync(notificationId);
        if (notification == null) return;

        // TODO: Integrate with SMS service
        notification.SmsSent = true;
        await _context.SaveChangesAsync();
        _logger.LogDebug("SMS notification sent: {Id}", notificationId);
    }

    // -- Task State Transition Notifications -----------------------------------
    public async Task SendTaskCreatedNotificationAsync(ProjectItemTask task)
    {
        var recipients = await GetProjectManagersAsync(task.ProjectId);
        if (!recipients.Any()) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskCreated,
            $"New Task Created: {task.Title}",
            $"A new task '{task.Title}' has been created for project item {task.ProjectItem?.ItemName ?? "Unknown"}.",
            recipients,
            newStatus: ProjectTaskStatus.Pending,
            priority: NotificationPriority.Normal,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskAssignedNotificationAsync(ProjectItemTask task, int assignedByUserId)
    {
        if (!task.AssignedToUserId.HasValue) return;

        var assignedBy = await _context.Users.FindAsync(assignedByUserId);

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskAssigned,
            $"Task Assigned: {task.Title}",
            $"You have been assigned to task '{task.Title}' by {assignedBy?.FullName ?? "Unknown"}.",
            new[] { task.AssignedToUserId.Value },
            newStatus: task.Status,
            priority: NotificationPriority.Normal,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskStartedNotificationAsync(ProjectItemTask task)
    {
        var recipients = await GetProjectManagersAsync(task.ProjectId);
        if (!recipients.Any()) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskStarted,
            $"Task Started: {task.Title}",
            $"Task '{task.Title}' has been started.",
            recipients,
            previousStatus: ProjectTaskStatus.Pending,
            newStatus: ProjectTaskStatus.InProgress,
            priority: NotificationPriority.Normal,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskSubmittedForReviewNotificationAsync(ProjectItemTask task)
    {
        var recipients = await GetProjectManagersAsync(task.ProjectId);
        if (!recipients.Any()) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskSubmittedForReview,
            $"Task Ready for Review: {task.Title}",
            $"Task '{task.Title}' has been submitted for review.",
            recipients,
            previousStatus: ProjectTaskStatus.InProgress,
            newStatus: ProjectTaskStatus.ReadyForReview,
            priority: NotificationPriority.High,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "Review Task"
        );
    }

    public async Task SendTaskApprovedNotificationAsync(ProjectItemTask task, int reviewerUserId)
    {
        if (!task.AssignedToUserId.HasValue) return;

        var reviewer = await _context.Users.FindAsync(reviewerUserId);

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskApproved,
            $"Task Approved: {task.Title}",
            $"Your task '{task.Title}' has been approved by {reviewer?.FullName ?? "Reviewer"}.",
            new[] { task.AssignedToUserId.Value },
            previousStatus: ProjectTaskStatus.ReadyForReview,
            newStatus: ProjectTaskStatus.Approved,
            priority: NotificationPriority.Normal,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskRejectedNotificationAsync(ProjectItemTask task, int reviewerUserId, string? reason)
    {
        if (!task.AssignedToUserId.HasValue) return;

        var reviewer = await _context.Users.FindAsync(reviewerUserId);

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskRejected,
            $"Task Rejected: {task.Title}",
            $"Your task '{task.Title}' has been rejected by {reviewer?.FullName ?? "Reviewer"}.{(string.IsNullOrEmpty(reason) ? "" : $" Reason: {reason}")}",
            new[] { task.AssignedToUserId.Value },
            previousStatus: ProjectTaskStatus.ReadyForReview,
            newStatus: ProjectTaskStatus.Rejected,
            priority: NotificationPriority.High,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendRevisionRequestedNotificationAsync(ProjectItemTask task, int reviewerUserId, string instructions)
    {
        if (!task.AssignedToUserId.HasValue) return;

        var reviewer = await _context.Users.FindAsync(reviewerUserId);

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.RevisionRequested,
            $"Revision Requested: {task.Title}",
            $"Revision requested for task '{task.Title}' by {reviewer?.FullName ?? "Reviewer"}. Instructions: {instructions}",
            new[] { task.AssignedToUserId.Value },
            previousStatus: ConstructionManagement.Domain.Enums.ProjectTaskStatus.ReadyForReview,
            newStatus: ConstructionManagement.Domain.Enums.ProjectTaskStatus.RevisionRequested,
            priority: NotificationPriority.High,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskOnHoldNotificationAsync(ProjectItemTask task, string? reason)
    {
        var recipients = new List<int>();
        if (task.AssignedToUserId.HasValue)
            recipients.Add(task.AssignedToUserId.Value);
        
        var managers = await GetProjectManagersAsync(task.ProjectId);
        recipients.AddRange(managers);
        recipients = recipients.Distinct().ToList();

        if (!recipients.Any()) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskOnHold,
            $"Task On Hold: {task.Title}",
            $"Task '{task.Title}' has been put on hold.{(string.IsNullOrEmpty(reason) ? "" : $" Reason: {reason}")}",
            recipients,
            newStatus: ConstructionManagement.Domain.Enums.ProjectTaskStatus.OnHold,
            priority: NotificationPriority.Normal,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskResumedNotificationAsync(ProjectItemTask task)
    {
        if (!task.AssignedToUserId.HasValue) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskResumed,
            $"Task Resumed: {task.Title}",
            $"Task '{task.Title}' has been resumed.",
            new[] { task.AssignedToUserId.Value },
            previousStatus: ConstructionManagement.Domain.Enums.ProjectTaskStatus.OnHold,
            newStatus: ConstructionManagement.Domain.Enums.ProjectTaskStatus.InProgress,
            priority: NotificationPriority.Normal,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskCancelledNotificationAsync(ProjectItemTask task, string? reason)
    {
        var recipients = new List<int>();
        if (task.AssignedToUserId.HasValue)
            recipients.Add(task.AssignedToUserId.Value);
        
        var managers = await GetProjectManagersAsync(task.ProjectId);
        recipients.AddRange(managers);
        recipients = recipients.Distinct().ToList();

        if (!recipients.Any()) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskCancelled,
            $"Task Cancelled: {task.Title}",
            $"Task '{task.Title}' has been cancelled.{(string.IsNullOrEmpty(reason) ? "" : $" Reason: {reason}")}",
            recipients,
            newStatus: ConstructionManagement.Domain.Enums.ProjectTaskStatus.Cancelled,
            priority: NotificationPriority.Normal,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskOverdueNotificationAsync(ProjectItemTask task)
    {
        var recipients = new List<int>();
        if (task.AssignedToUserId.HasValue)
            recipients.Add(task.AssignedToUserId.Value);
        
        var managers = await GetProjectManagersAsync(task.ProjectId);
        recipients.AddRange(managers);
        recipients = recipients.Distinct().ToList();

        if (!recipients.Any()) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskOverdue,
            $"Task Overdue: {task.Title}",
            $"Task '{task.Title}' is overdue. Due date was {task.DueDate:yyyy-MM-dd}.",
            recipients,
            priority: NotificationPriority.Urgent,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendTaskDueSoonNotificationAsync(ProjectItemTask task, int daysRemaining)
    {
        if (!task.AssignedToUserId.HasValue) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.TaskDueSoon,
            $"Task Due Soon: {task.Title}",
            $"Task '{task.Title}' is due in {daysRemaining} day(s). Due date: {task.DueDate:yyyy-MM-dd}.",
            new[] { task.AssignedToUserId.Value },
            priority: NotificationPriority.High,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendPreStartConfirmationReminderAsync(ProjectItemTask task)
    {
        if (!task.AssignedToUserId.HasValue) return;

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.PreStartConfirmationReminder,
            $"Pre-Start Confirmation Required: {task.Title}",
            $"Please confirm materials and equipment are ready for task '{task.Title}' scheduled to start at {task.ScheduledStartDate:yyyy-MM-dd HH:mm}.",
            new[] { task.AssignedToUserId.Value },
            priority: NotificationPriority.High,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "Confirm"
        );
    }

    public async Task SendPreStartConfirmedNotificationAsync(ProjectItemTask task, int confirmedByUserId)
    {
        var recipients = await GetProjectManagersAsync(task.ProjectId);
        if (!recipients.Any()) return;

        var confirmedBy = await _context.Users.FindAsync(confirmedByUserId);

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.PreStartConfirmed,
            $"Pre-Start Confirmed: {task.Title}",
            $"Pre-start confirmation completed for task '{task.Title}' by {confirmedBy?.FullName ?? "User"}.",
            recipients,
            priority: NotificationPriority.Normal,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendForcedStartAuthorizedNotificationAsync(ProjectItemTask task, int authorizedByUserId, string reason)
    {
        var recipients = await GetProjectManagersAsync(task.ProjectId);
        if (!recipients.Any()) return;

        var authorizedBy = await _context.Users.FindAsync(authorizedByUserId);

        await CreateNotificationAsync(
            task.CompanyId ?? 0,
            task.Id,
            TaskNotificationType.ForcedStartAuthorized,
            $"Forced Start Authorized: {task.Title}",
            $"Forced start authorized for task '{task.Title}' by {authorizedBy?.FullName ?? "User"}. Reason: {reason}",
            recipients,
            priority: NotificationPriority.Urgent,
            actionUrl: $"/tasks/{task.Id}",
            actionText: "View Task"
        );
    }

    public async Task SendEscalationResolvedNotificationAsync(ProjectItemEscalation escalation)
    {
        var recipients = await GetProjectManagersAsync(escalation.ProjectId);
        if (escalation.ReportedByUserId.HasValue)
        {
            recipients.Add(escalation.ReportedByUserId.Value);
        }
        recipients = recipients.Distinct().ToList();

        if (!recipients.Any()) return;

        await CreateNotificationAsync(
            escalation.CompanyId ?? 0,
            escalation.ProjectItemTaskId ?? 0,
            TaskNotificationType.EscalationResolved,
            $"Escalation Resolved: {escalation.Title}",
            $"The escalation '{escalation.Title}' has been resolved.",
            recipients,
            priority: NotificationPriority.Normal,
            actionUrl: $"/escalations/{escalation.Id}",
            actionText: "View Escalation"
        );
    }

    // -- Cleanup ---------------------------------------------------------------
    public async Task DeleteOldNotificationsAsync(int daysOld = 90)
    {
        var threshold = DateTime.UtcNow.AddDays(-daysOld);
        var oldNotifications = await _context.TaskNotifications
            .Where(n => n.CreatedAt < threshold && n.AllReadAt != null)
            .ToListAsync();

        _context.TaskNotifications.RemoveRange(oldNotifications);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Deleted {Count} old notifications", oldNotifications.Count);
    }

    // -- Helper Methods --------------------------------------------------------
    private async Task<List<int>> GetProjectManagersAsync(int projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Company)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return new List<int>();

        var managers = new List<int>();

        // Add project owner
        managers.Add(project.OwnerUserId);

        // Add general manager if assigned
        if (project.GeneralManagerUserId.HasValue)
        {
            managers.Add(project.GeneralManagerUserId.Value);
        }

        // Add users with manager role in the project team
        var projectTeam = await _context.ProjectTeamMembers
            .Where(pt => pt.ProjectId == projectId)
            .Select(pt => pt.UserId)
            .ToListAsync();

        // TODO: Check user roles for manager permission

        return managers.Distinct().ToList();
    }
}
