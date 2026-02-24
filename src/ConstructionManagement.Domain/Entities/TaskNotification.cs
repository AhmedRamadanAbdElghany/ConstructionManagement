using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Notification for task state transitions and other task-related events
/// Sent to relevant users when tasks change status
/// </summary>
public class TaskNotification : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    // -- Task Relationship ------------------------------------------------------
    public int ProjectItemTaskId { get; set; }
    
    [ForeignKey(nameof(ProjectItemTaskId))]
    public virtual ProjectItemTask Task { get; set; } = null!;
    
    // -- Notification Type ------------------------------------------------------
    /// <summary>
    /// Type of notification
    /// </summary>
    public TaskNotificationType Type { get; set; }
    
    /// <summary>
    /// Notification title
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Notification message body
    /// </summary>
    public string Message { get; set; } = string.Empty;
    
    // -- State Transition Info --------------------------------------------------
    /// <summary>
    /// Previous status (if this is a status change notification)
    /// </summary>
    public Domain.Enums.ProjectTaskStatus? PreviousStatus { get; set; }
    
    /// <summary>
    /// New status (if this is a status change notification)
    /// </summary>
    public Domain.Enums.ProjectTaskStatus? NewStatus { get; set; }
    
    // -- Recipients -------------------------------------------------------------
    /// <summary>
    /// User IDs who should receive this notification (JSON array)
    /// </summary>
    public string RecipientUserIds { get; set; } = "[]";
    
    /// <summary>
    /// User IDs who have read this notification (JSON array)
    /// </summary>
    public string ReadByUserIds { get; set; } = "[]";
    
    // -- Delivery Channels ------------------------------------------------------
    /// <summary>
    /// Send in-app notification
    /// </summary>
    public bool SendInApp { get; set; } = true;
    
    /// <summary>
    /// Send push notification
    /// </summary>
    public bool SendPush { get; set; } = true;
    
    /// <summary>
    /// Send email notification
    /// </summary>
    public bool SendEmail { get; set; } = false;
    
    /// <summary>
    /// Send SMS notification
    /// </summary>
    public bool SendSms { get; set; } = false;
    
    // -- Delivery Status --------------------------------------------------------
    /// <summary>
    /// Whether in-app notification was sent
    /// </summary>
    public bool InAppSent { get; set; } = false;
    
    /// <summary>
    /// Whether push notification was sent
    /// </summary>
    public bool PushSent { get; set; } = false;
    
    /// <summary>
    /// Whether email was sent
    /// </summary>
    public bool EmailSent { get; set; } = false;
    
    /// <summary>
    /// Whether SMS was sent
    /// </summary>
    public bool SmsSent { get; set; } = false;
    
    // -- Timestamps -------------------------------------------------------------

    
    /// <summary>
    /// When the notification was sent
    /// </summary>
    public DateTime? SentAt { get; set; }
    
    /// <summary>
    /// When all recipients have read the notification
    /// </summary>
    public DateTime? AllReadAt { get; set; }
    
    // -- Additional Data --------------------------------------------------------
    /// <summary>
    /// Additional data as JSON (for deep linking, etc.)
    /// </summary>
    public string? AdditionalData { get; set; }
    
    /// <summary>
    /// Priority of the notification
    /// </summary>
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    
    /// <summary>
    /// Whether this notification requires action
    /// </summary>
    public bool RequiresAction { get; set; } = false;
    
    /// <summary>
    /// Action URL (deep link)
    /// </summary>
    public string? ActionUrl { get; set; }
    
    /// <summary>
    /// Action button text
    /// </summary>
    public string? ActionText { get; set; }
}

/// <summary>
/// Types of task notifications
/// </summary>
public enum TaskNotificationType
{
    /// <summary>
    /// Task created
    /// </summary>
    TaskCreated = 0,
    
    /// <summary>
    /// Task assigned to user
    /// </summary>
    TaskAssigned = 1,
    
    /// <summary>
    /// Task started
    /// </summary>
    TaskStarted = 2,
    
    /// <summary>
    /// Task submitted for review
    /// </summary>
    TaskSubmittedForReview = 3,
    
    /// <summary>
    /// Task approved
    /// </summary>
    TaskApproved = 4,
    
    /// <summary>
    /// Task rejected
    /// </summary>
    TaskRejected = 5,
    
    /// <summary>
    /// Revision requested
    /// </summary>
    RevisionRequested = 6,
    
    /// <summary>
    /// Task put on hold
    /// </summary>
    TaskOnHold = 7,
    
    /// <summary>
    /// Task resumed
    /// </summary>
    TaskResumed = 8,
    
    /// <summary>
    /// Task cancelled
    /// </summary>
    TaskCancelled = 9,
    
    /// <summary>
    /// Task overdue
    /// </summary>
    TaskOverdue = 10,
    
    /// <summary>
    /// Task due soon
    /// </summary>
    TaskDueSoon = 11,
    
    /// <summary>
    /// Pre-start confirmation reminder
    /// </summary>
    PreStartConfirmationReminder = 12,
    
    /// <summary>
    /// Pre-start confirmed
    /// </summary>
    PreStartConfirmed = 13,
    
    /// <summary>
    /// Forced start authorized
    /// </summary>
    ForcedStartAuthorized = 14,
    
    /// <summary>
    /// Comment added
    /// </summary>
    CommentAdded = 15,
    
    /// <summary>
    /// Attachment added
    /// </summary>
    AttachmentAdded = 16,
    
    /// <summary>
    /// Escalation created
    /// </summary>
    EscalationCreated = 17,
    
    /// <summary>
    /// Escalation resolved
    /// </summary>
    EscalationResolved = 18
}
