using ConstructionManagement.Application.DTOs.Notfification;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces;

public interface INotificationService
{
    /// <summary>
    /// إرسال إشعار بسيط (للاستخدام السريع)
    /// </summary>
    Task SendAsync(int userId, string message);

    /// <summary>
    /// إنشاء وإرسال إشعار كامل (مع عنوان، رابط، نوع، إلخ)
    /// </summary>
    Task CreateAndSendAsync(
        int userId,
        string title,
        string message,
        string? link = null,
        NotificationType type = NotificationType.General
    );
    
    /// <summary>
    /// إنشاء إشعار للموافقة على مستند
    /// </summary>
    Task CreateNotificationAsync(
        string notificationType,
        string message,
        int? companyId,
        int? projectId,
        int referenceId,
        string referenceType,
        string? roleName = null
    );

    Task SendApprovalNeededNotificationAsync(ApprovalRequest request, ApprovalStep step);
    Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
    Task MarkAsReadAsync(int notificationId, int userId);
    Task MarkAllAsReadAsync(int userId);
}
