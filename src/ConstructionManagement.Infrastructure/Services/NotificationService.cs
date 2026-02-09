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
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        ILogger<NotificationService> logger)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task SendAsync(int userId, string message)
    {
        await CreateAndSendAsync(userId, "إشعار جديد", message);
    }

    public async Task CreateAndSendAsync(
        int userId,
        string title,
        string message,
        string? link = null,
        NotificationType type = NotificationType.General)
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
            CreatedAt = DateTime.UtcNow
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
        string? roleName = null)
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
                type: NotificationType.General
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

        return notificationList.Select(n => new NotificationDto(
            n.Id,
            n.Title,
            n.Message,
            n.Link,
            n.Type.ToString(),
            n.IsRead,
            n.CreatedAt,
            n.ReadAt)).ToList();
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

        return notifications.Select(n => new NotificationDto(
            n.Id,
            n.Title,
            n.Message,
            n.Link,
            n.Type.ToString(),
            n.IsRead,
            n.CreatedAt,
            n.ReadAt)).ToList();
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

    public async Task SendApprovalNeededNotificationAsync(ApprovalRequest request, ApprovalStep step)
    {
        // This is a placeholder - the original implementation was more complex
        _logger.LogInformation(
            "SendApprovalNeededNotificationAsync called for request {RequestId}",
            request.Id);
    }

    // New methods for company/join requests
    public async Task NotifyCompanyRequestApprovedAsync(int userId, string companyName)
    {
        await CreateAndSendAsync(
            userId: userId,
            title: "Company Approved",
            message: $"Your company '{companyName}' has been approved!",
            link: "/dashboard",
            type: NotificationType.ApprovalGranted
        );
    }

    public async Task NotifyCompanyRequestRejectedAsync(int userId, string reason)
    {
        await CreateAndSendAsync(
            userId: userId,
            title: "Company Request Rejected",
            message: $"Your company request was rejected. Reason: {reason}",
            type: NotificationType.ApprovalRejected
        );
    }

    public async Task NotifyJoinRequestApprovedAsync(int userId, string companyName)
    {
        await CreateAndSendAsync(
            userId: userId,
            title: "Join Request Approved",
            message: $"You have been approved to join '{companyName}'!",
            link: "/dashboard",
            type: NotificationType.ApprovalGranted
        );
    }

    public async Task NotifyJoinRequestRejectedAsync(int userId, string reason)
    {
        await CreateAndSendAsync(
            userId: userId,
            title: "Join Request Rejected",
            message: $"Your join request was rejected. Reason: {reason}",
            type: NotificationType.ApprovalRejected
        );
    }

    public async Task NotifyNewCompanyRequestAsync(int superAdminUserId, string companyName, int requestId)
    {
        await CreateAndSendAsync(
            userId: superAdminUserId,
            title: "New Company Request",
            message: $"New company creation request: {companyName}",
            link: $"/admin/company-requests/{requestId}",
            type: NotificationType.Escalation
        );
    }

    public async Task NotifyNewJoinRequestAsync(int companyAdminUserId, string userName, int requestId)
    {
        await CreateAndSendAsync(
            userId: companyAdminUserId,
            title: "New Join Request",
            message: $"{userName} wants to join your company",
            link: $"/admin/join-requests/{requestId}",
            type: NotificationType.Escalation
        );
    }
}
