using System.Threading;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Represents a queue for processing notifications asynchronously.
/// This allows notification sending to be decoupled from business logic operations.
/// </summary>
public interface INotificationQueue
{
    /// <summary>
    /// Adds a notification message to the queue for processing.
    /// </summary>
    /// <param name="message">The notification message to queue.</param>
    void QueueNotification(NotificationMessage message);

    /// <summary>
    /// Adds a notification message to the queue with priority.
    /// </summary>
    /// <param name="message">The notification message to queue.</param>
    /// <param name="priority">The priority level of the notification.</param>
    void QueueNotification(NotificationMessage message, NotificationPriority priority);

    /// <summary>
    /// Dequeues a notification message for processing.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token to cancel the operation.</param>
    /// <returns>The next notification message from the queue, or null if empty.</returns>
    Task<NotificationMessage?> DequeueAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the number of messages currently in the queue.
    /// </summary>
    int Count { get; }

    /// <summary>
    /// Clears all messages from the queue.
    /// </summary>
    void Clear();
}

/// <summary>
/// Represents a notification message to be sent.
/// </summary>
public class NotificationMessage
{
    /// <summary>
    /// Unique identifier for the notification.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// The type of notification.
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the user who should receive this notification.
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// The title of the notification.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// The message body of the notification.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Optional URL link for the notification.
    /// </summary>
    public string? Link { get; set; }

    /// <summary>
    /// When the notification was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional related entity ID (e.g., invoice ID, approval request ID).
    /// </summary>
    public int? RelatedEntityId { get; set; }

    /// <summary>
    /// Optional related entity type (e.g., "Invoice", "ApprovalRequest").
    /// </summary>
    public string? RelatedEntityType { get; set; }

    /// <summary>
    /// Priority level of the notification.
    /// </summary>
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;

    /// <summary>
    /// Number of retry attempts made.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Maximum number of retry attempts before marking as failed.
    /// </summary>
    public int MaxRetries { get; set; } = 3;
}

/// <summary>
/// Priority levels for notifications.
/// </summary>
public enum NotificationPriority
{
    /// <summary>
    /// Low priority notifications.
    /// </summary>
    Low = 0,

    /// <summary>
    /// Normal/default priority notifications.
    /// </summary>
    Normal = 1,

    /// <summary>
    /// High priority notifications requiring prompt attention.
    /// </summary>
    High = 2,

    /// <summary>
    /// Urgent notifications requiring immediate attention.
    /// </summary>
    Urgent = 3
}
