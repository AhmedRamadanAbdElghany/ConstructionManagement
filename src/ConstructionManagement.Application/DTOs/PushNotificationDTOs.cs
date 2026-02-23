using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    /// <summary>
    /// Request to register a device for push notifications
    /// </summary>
    public class RegisterDeviceRequest
    {
        public string DeviceToken { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty; // Web, Android, iOS
        public string? DeviceName { get; set; }
    }

    /// <summary>
    /// Request to send a push notification
    /// </summary>
    public class SendPushNotificationRequest
    {
        public List<int> UserIds { get; set; } = new();
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Image { get; set; }
        public string? Link { get; set; }
        public Dictionary<string, string>? Data { get; set; }
        public string? NotificationType { get; set; }
        public int? NotificationId { get; set; }
    }

    /// <summary>
    /// Request to send push to a single user
    /// </summary>
    public class SendUserPushRequest
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Image { get; set; }
        public string? Link { get; set; }
        public Dictionary<string, string>? Data { get; set; }
        public string? NotificationType { get; set; }
    }

    /// <summary>
    /// Device token information
    /// </summary>
    public class DeviceTokenDto
    {
        public int Id { get; set; }
        public string Platform { get; set; } = string.Empty;
        public string? DeviceName { get; set; }
        public DateTime LastUsedAt { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Push notification history
    /// </summary>
    public class PushNotificationLogDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public DateTime SentAt { get; set; }
        public DateTime? OpenedAt { get; set; }
        public string? DeviceName { get; set; }
    }

    /// <summary>
    /// Push notification settings for user
    /// </summary>
    public class PushNotificationSettingsDto
    {
        public bool EnablePushNotifications { get; set; } = true;
        public bool NotifyOnPaymentReceived { get; set; } = true;
        public bool NotifyOnInvoiceApproval { get; set; } = true;
        public bool NotifyOnProjectUpdate { get; set; } = true;
        public bool NotifyOnTaskAssignment { get; set; } = true;
        public bool NotifyOnLocationAlert { get; set; } = true;
        public bool NotifyOnMessage { get; set; } = true;
        public bool NotifyOnApprovalRequest { get; set; } = true;
        public bool NotifyOnDelayAlert { get; set; } = true;
    }

    /// <summary>
    /// Result of a push notification send operation
    /// </summary>
    public class PushResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string>? Errors { get; set; }
    }

    /// <summary>
    /// FCM message payload
    /// </summary>
    public class FcmMessage
    {
        public FcmNotification? Notification { get; set; }
        public Dictionary<string, string>? Data { get; set; }
        public string? Token { get; set; }
        public AndroidConfig? Android { get; set; }
        public ApnsConfig? Apns { get; set; }
    }

    public class FcmNotification
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Image { get; set; }
        public string? ClickAction { get; set; }
    }

    public class AndroidConfig
    {
        public AndroidNotification? Notification { get; set; }
        public string? Priority { get; set; } = "high";
    }

    public class AndroidNotification
    {
        public string? ChannelId { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public string? ClickAction { get; set; }
    }

    public class ApnsConfig
    {
        public ApnsPayload? Payload { get; set; }
    }

    public class ApnsPayload
    {
        public ApnsAps? Aps { get; set; }
    }

    public class ApnsAps
    {
        public string? Alert { get; set; }
        public int? Badge { get; set; }
        public string? Sound { get; set; } = "default";
    }
}
