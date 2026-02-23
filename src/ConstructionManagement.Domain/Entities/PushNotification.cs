using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Device token for push notifications (FCM/APNs)
/// </summary>
public class PushDeviceToken : BaseEntity
{
    /// <summary>
    /// User who owns this device
    /// </summary>
    public int UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Device platform: Web, Android, iOS
    /// </summary>
    public DevicePlatform Platform { get; set; }

    /// <summary>
    /// FCM registration token or APNs device token
    /// </summary>
    public string DeviceToken { get; set; } = string.Empty;

    /// <summary>
    /// User-friendly device name (e.g., "Ahmed's iPhone", "Chrome on Windows")
    /// </summary>
    public string? DeviceName { get; set; }

    /// <summary>
    /// When the token was last refreshed
    /// </summary>
    public DateTime LastUsedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Whether this token is still valid
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Push notification delivery record
/// </summary>
public class PushNotificationLog : BaseEntity
{
    /// <summary>
    /// Reference to the in-app notification (if any)
    /// </summary>
    public int? NotificationId { get; set; }
    
    [ForeignKey(nameof(NotificationId))]
    public virtual Notification? Notification { get; set; }

    /// <summary>
    /// User who received the push notification
    /// </summary>
    public int UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Device that received the notification
    /// </summary>
    public int? DeviceTokenId { get; set; }
    
    [ForeignKey(nameof(DeviceTokenId))]
    public virtual PushDeviceToken? DeviceToken { get; set; }

    /// <summary>
    /// Push notification title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Push notification body
    /// </summary>
    public string Body { get; set; } = string.Empty;

    /// <summary>
    /// Additional data as JSON
    /// </summary>
    public string? Data { get; set; }

    /// <summary>
    /// Delivery status
    /// </summary>
    public PushDeliveryStatus Status { get; set; }

    /// <summary>
    /// Error message if failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// When the push was sent
    /// </summary>
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the user tapped/opened the notification
    /// </summary>
    public DateTime? OpenedAt { get; set; }
}

public enum DevicePlatform
{
    Web = 1,
    Android = 2,
    iOS = 3
}

public enum PushDeliveryStatus
{
    Pending = 1,
    Sent = 2,
    Delivered = 3,
    Failed = 4,
    Opened = 5
}
