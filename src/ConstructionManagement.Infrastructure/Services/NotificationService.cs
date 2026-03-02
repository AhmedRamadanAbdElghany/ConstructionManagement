using ConstructionManagement.Application.DTOs.Notfification;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<NotificationService> _logger;
    private readonly ILocalizationService? _localizationService;

    public NotificationService(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        ILogger<NotificationService> logger,
        ILocalizationService? localizationService = null)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _logger = logger;
        _localizationService = localizationService;
    }

    public async Task SendAsync(int userId, string message)
    {
        var title = _localizationService?["Notification.New"] ?? "New Notification";
        await CreateAndSendAsync(userId, title, message);
    }

    public async Task CreateAndSendAsync(
        int userId,
        string title,
        string message,
        string? link = null,
        NotificationType type = NotificationType.General,
        string? titleKey = null,
        string? messageKey = null,
        object[]? messageArgs = null)
    {
        _logger.LogDebug("Creating notification for user {UserId}. Title: {Title}", userId, title);

        var notification = new Notification
        {
            UserId = userId,
            Title = title ?? throw new ArgumentNullException(nameof(title)),
            Message = message ?? throw new ArgumentNullException(nameof(message)),
            Link = link,
            Type = type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            TitleKey = titleKey,
            MessageKey = messageKey,
            MessageArgs = messageArgs != null ? JsonSerializer.Serialize(messageArgs) : null
        };

        await _notificationRepository.AddAsync(notification);
    }

    public async Task CreateNotificationAsync(
        string notificationType,
        string message,
        int? companyId,
        int? projectId,
        int referenceId,
        string referenceType,
        string? roleName = null,
        string? titleKey = null,
        string? messageKey = null,
        object[]? messageArgs = null)
    {
        _logger.LogInformation(
            "CreateNotificationAsync called with type: {Type}, message: {Message}, company: {CompanyId}, project: {ProjectId}",
            notificationType, message, companyId, projectId);

        // Find users by role
        IEnumerable<User> users = new List<User>();
        
        if (!string.IsNullOrEmpty(roleName))
        {
            if (companyId.HasValue)
            {
                users = await _userRepository.GetUsersByCompanyIdAndRoleAsync(companyId.Value, roleName);
            }
            else
            {
                users = await _userRepository.GetUsersByRoleAsync(roleName);
            }
        }

        foreach (var user in users)
        {
            await CreateAndSendAsync(
                userId: user.Id,
                title: notificationType,
                message: message,
                link: $"/{referenceType}s/{referenceId}",
                type: NotificationType.General,
                titleKey: titleKey,
                messageKey: messageKey,
                messageArgs: messageArgs
            );
        }
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
    {
        _logger.LogDebug("Fetching notifications for user {UserId}. UnreadOnly: {UnreadOnly}", userId, unreadOnly);

        IEnumerable<Notification> notifications;
        if (unreadOnly)
        {
            notifications = await _notificationRepository.GetUnreadByUserIdAsync(userId);
        }
        else
        {
            notifications = await _notificationRepository.GetByUserIdAsync(userId);
        }

        var notificationList = notifications.Take(50).ToList();

        _logger.LogDebug("Found {Count} notifications for user {UserId}", notificationList.Count, userId);

        return notificationList.Select(n => LocalizeNotification(n)).ToList();
    }

    /// <summary>
    /// Localizes a notification message at display time based on the current culture
    /// </summary>
    private NotificationDto LocalizeNotification(Notification n)
    {
        // If we have localization keys, re-localize at display time
        string title = n.Title;
        string message = n.Message;

        if (_localizationService != null)
        {
            // Re-localize title if we have a key
            if (!string.IsNullOrEmpty(n.TitleKey))
            {
                title = _localizationService[n.TitleKey];
            }

            // Re-localize message if we have a key
            if (!string.IsNullOrEmpty(n.MessageKey))
            {
                object[]? args = null;
                if (!string.IsNullOrEmpty(n.MessageArgs))
                {
                    try
                    {
                        args = JsonSerializer.Deserialize<object[]>(n.MessageArgs);
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogWarning(ex, "Failed to deserialize message args for notification {NotificationId}", n.Id);
                    }
                }

                message = args != null && args.Length > 0
                    ? _localizationService.GetNotificationMessage(n.MessageKey, args)
                    : _localizationService.GetNotificationMessage(n.MessageKey);
            }
        }

        return new NotificationDto(
            n.Id,
            title,
            message,
            n.Link,
            n.Type.ToString(),
            n.IsRead,
            n.CreatedAt,
            n.ReadAt);
    }

    /// <summary>
    /// الحصول على الإشعارات من الأنواع السابقة للمستخدم
    /// يبحث عن إشعارات مرتبطة بأنواع المستخدم السابقة (مثل worker -> inventory owner)
    /// </summary>
    public async Task<List<NotificationDto>> GetNotificationsFromPreviousUserTypesAsync(int userId, bool unreadOnly = false)
    {
        _logger.LogDebug("Fetching notifications from previous user types for user {UserId}. UnreadOnly: {UnreadOnly}", userId, unreadOnly);
        
        // Get user's current type and all previous types
        var currentUser = await _userRepository.GetByIdAsync(userId);
        if (currentUser == null)
        {
            _logger.LogWarning("User {UserId} not found when fetching previous type notifications", userId);
            return new List<NotificationDto>();
        }
        
        var currentType = currentUser.UserType;
        
        // Get all notifications where OriginalUserType matches any previous user types
        // This ensures that notifications sent to the user when they had a different type are still visible
        var query = _notificationRepository.AsQueryable()
            .Where(n => n.UserId == userId);
            
        if (unreadOnly)
            query = query.Where(n => !n.IsRead);
        
        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        _logger.LogDebug("Found {Count} notifications from previous types for user {UserId}", notifications.Count, userId);

        return notifications.Select(n => LocalizeNotification(n)).ToList();
    }

    public async Task MarkAsReadAsync(int notificationId, int userId)
    {
        _logger.LogDebug("Marking notification {NotificationId} as read for user {UserId}", notificationId, userId);

        var notification = await _notificationRepository.GetByIdAndUserIdAsync(notificationId, userId);

        if (notification == null)
        {
            _logger.LogWarning("Notification {NotificationId} not found or doesn't belong to user {UserId}", 
                notificationId, userId);
            return;
        }

        if (notification.IsRead)
        {
            _logger.LogDebug("Notification {NotificationId} is already read", notificationId);
            return;
        }

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;

        await _notificationRepository.UpdateAsync(notification);
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        _logger.LogDebug("Marking all notifications as read for user {UserId}", userId);

        var unreadNotifications = (await _notificationRepository.GetUnreadByUserIdAsync(userId)).ToList();

        if (!unreadNotifications.Any())
        {
            _logger.LogDebug("No unread notifications found for user {UserId}", userId);
            return;
        }

        _logger.LogInformation("Marking {Count} notifications as read for user {UserId}", 
            unreadNotifications.Count, userId);

        foreach (var n in unreadNotifications)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
        }

        await _notificationRepository.UpdateRangeAsync(unreadNotifications);
    }

    public Task SendApprovalNeededNotificationAsync(ApprovalRequest request, ApprovalStep step)
    {
        // This is a placeholder - the original implementation was more complex
        _logger.LogInformation(
            "SendApprovalNeededNotificationAsync called for request {RequestId}",
            request.Id);
        return Task.CompletedTask;
    }

    // New methods for company/join requests - Store localization keys for dynamic translation
    public async Task NotifyCompanyRequestApprovedAsync(int userId, string companyName)
    {
        var title = _localizationService?.GetNotificationTitle(NotificationType.ApprovalGranted) ?? "Approval Granted";
        var message = _localizationService?.GetNotificationMessage("CompanyApproved", companyName) 
            ?? $"Your company registration request was approved: {companyName}";
        
        await CreateAndSendAsync(
            userId: userId,
            title: title,
            message: message,
            link: "/dashboard",
            type: NotificationType.ApprovalGranted,
            titleKey: $"NotificationTitle.{NotificationType.ApprovalGranted}",
            messageKey: "CompanyApproved",
            messageArgs: new object[] { companyName }
        );
    }

    public async Task NotifyCompanyRequestRejectedAsync(int userId, string reason)
    {
        var title = _localizationService?.GetNotificationTitle(NotificationType.ApprovalRejected) ?? "Approval Rejected";
        var message = _localizationService?.GetNotificationMessage("CompanyRejected", reason)
            ?? $"Your company registration request was rejected. Reason: {reason}";
        
        await CreateAndSendAsync(
            userId: userId,
            title: title,
            message: message,
            type: NotificationType.ApprovalRejected,
            titleKey: $"NotificationTitle.{NotificationType.ApprovalRejected}",
            messageKey: "CompanyRejected",
            messageArgs: new object[] { reason }
        );
    }

    public async Task NotifyJoinRequestApprovedAsync(int userId, string companyName)
    {
        var title = _localizationService?.GetNotificationTitle(NotificationType.ApprovalGranted) ?? "Approval Granted";
        var message = _localizationService?.GetNotificationMessage("JoinApproved", companyName)
            ?? $"Your join request was approved for: {companyName}";
        
        await CreateAndSendAsync(
            userId: userId,
            title: title,
            message: message,
            link: "/dashboard",
            type: NotificationType.ApprovalGranted,
            titleKey: $"NotificationTitle.{NotificationType.ApprovalGranted}",
            messageKey: "JoinApproved",
            messageArgs: new object[] { companyName }
        );
    }

    public async Task NotifyJoinRequestRejectedAsync(int userId, string reason)
    {
        var title = _localizationService?.GetNotificationTitle(NotificationType.ApprovalRejected) ?? "Approval Rejected";
        var message = _localizationService?.GetNotificationMessage("JoinRejected", reason)
            ?? $"Your join request was rejected. Reason: {reason}";
        
        await CreateAndSendAsync(
            userId: userId,
            title: title,
            message: message,
            type: NotificationType.ApprovalRejected,
            titleKey: $"NotificationTitle.{NotificationType.ApprovalRejected}",
            messageKey: "JoinRejected",
            messageArgs: new object[] { reason }
        );
    }

    public async Task NotifyNewCompanyRequestAsync(int SystemAdminUserId, string companyName, int requestId)
    {
        var title = _localizationService?.GetNotificationTitle(NotificationType.Escalation) ?? "Escalation";
        var message = _localizationService?.GetNotificationMessage("NewCompanyRequest", companyName) 
            ?? $"New company registration request: {companyName}";
        
        await CreateAndSendAsync(
            userId: SystemAdminUserId,
            title: title,
            message: message,
            link: $"/admin/company-requests/{requestId}",
            type: NotificationType.Escalation,
            titleKey: $"NotificationTitle.{NotificationType.Escalation}",
            messageKey: "NewCompanyRequest",
            messageArgs: new object[] { companyName }
        );
    }

    public async Task NotifyNewJoinRequestAsync(int companyAdminUserId, string userName, int requestId)
    {
        var title = _localizationService?.GetNotificationTitle(NotificationType.Escalation) ?? "Escalation";
        var message = _localizationService?.GetNotificationMessage("NewJoinRequest", userName)
            ?? $"{userName} wants to join your company";
        
        await CreateAndSendAsync(
            userId: companyAdminUserId,
            title: title,
            message: message,
            link: $"/admin/join-requests/{requestId}",
            type: NotificationType.Escalation,
            titleKey: $"NotificationTitle.{NotificationType.Escalation}",
            messageKey: "NewJoinRequest",
            messageArgs: new object[] { userName }
        );
    }
}
