using ConstructionManagement.Application.DTOs.Notfification;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

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
        NotificationType type = NotificationType.General,
        string? titleKey = null,
        string? messageKey = null,
        object[]? messageArgs = null
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
        string? roleName = null,
        string? titleKey = null,
        string? messageKey = null,
        object[]? messageArgs = null
    );

    Task SendApprovalNeededNotificationAsync(ApprovalRequest request, ApprovalStep step);
    Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
    
    /// <summary>
    /// الحصول على الإشعارات من الأنواع السابقة للمستخدم (للحصول على الإشعارات المعلقة عند تغيير نوع المستخدم)
    /// </summary>
    Task<List<NotificationDto>> GetNotificationsFromPreviousUserTypesAsync(int userId, bool unreadOnly = false);
    
    Task MarkAsReadAsync(int notificationId, int userId);
    Task MarkAllAsReadAsync(int userId);

    // New methods for company/join requests
    Task NotifyCompanyRequestApprovedAsync(int userId, string companyName);
    Task NotifyCompanyRequestRejectedAsync(int userId, string reason);
    Task NotifyJoinRequestApprovedAsync(int userId, string companyName);
    Task NotifyJoinRequestRejectedAsync(int userId, string reason);
    Task NotifyNewCompanyRequestAsync(int SystemAdminUserId, string companyName, int requestId);
    Task NotifyNewJoinRequestAsync(int companyAdminUserId, string userName, int requestId);
}
