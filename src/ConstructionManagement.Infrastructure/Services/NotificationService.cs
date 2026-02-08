using ConstructionManagement.Application.DTOs.Notfification;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
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
    private readonly IRepository<Notification> _notificationRepository;
    private readonly IRepository<UserRole> _userRoleRepository;
    private readonly IRepository<ProjectTeamRole> _projectTeamRoleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IRepository<Notification> notificationRepository,
        IRepository<UserRole> userRoleRepository,
        IRepository<ProjectTeamRole> projectTeamRoleRepository,
        IUnitOfWork unitOfWork,
        ILogger<NotificationService> logger)
    {
        // Null validation for required dependencies
        _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
        _userRoleRepository = userRoleRepository ?? throw new ArgumentNullException(nameof(userRoleRepository));
        _projectTeamRoleRepository = projectTeamRoleRepository ?? throw new ArgumentNullException(nameof(projectTeamRoleRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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

        // حفظ التغييرات عبر Unit of Work
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Notification {NotificationId} saved for user {UserId}. Type: {Type}", 
            notification.Id, userId, type);

        // ملاحظة: هنا يتم استدعاء SignalR أو Firebase لاحقاً (خارج نطاق الـ DB Transaction)
        _logger.LogDebug("Notification {NotificationId} created successfully. Real-time delivery pending.", notification.Id);
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

        // This method is implemented for backward compatibility
        // The actual implementation would find users by role and send notifications
        _logger.LogDebug("Notification creation requested - type: {Type}, reference: {ReferenceType}-{ReferenceId}",
            notificationType, referenceType, referenceId);
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
    {
        _logger.LogDebug("Fetching notifications for user {UserId}. UnreadOnly: {UnreadOnly}", userId, unreadOnly);

        var query = _notificationRepository.AsQueryable()
            .Where(n => n.UserId == userId);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        _logger.LogDebug("Found {Count} notifications for user {UserId}", notifications.Count, userId);

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

        var notification = await _notificationRepository.AsQueryable()
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

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
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Notification {NotificationId} marked as read", notificationId);
    }

    public async Task SendApprovalNeededNotificationAsync(ApprovalRequest request, ApprovalStep step)
    {
        _logger.LogInformation(
            "Sending approval notification for request {RequestId} in project {ProjectId}. Approver role: {Role}",
            request.Id, request.ProjectId, step.ApproverRole);

        var title = $"موافقة مطلوبة - {request.Source}";
        var message = $"يوجد {request.Source} جديد يحتاج موافقة في الخطوة {step.StepOrder} ({step.ApproverRole})";

        _logger.LogDebug("Looking for approvers with role {Role} for project {ProjectId}", 
            step.ApproverRole, request.ProjectId);

        // Find users with the required role in the project via ProjectTeamRole
        var approverUserIds = await _projectTeamRoleRepository.AsQueryable()
            .Include(ptr => ptr.ProjectTeamMember)
            .Include(ptr => ptr.ProjectRole)
            .Where(ptr => ptr.ProjectRole.Name == step.ApproverRole && 
                         ptr.ProjectTeamMember.ProjectId == request.ProjectId)
            .Select(ptr => ptr.ProjectTeamMember.UserId)
            .Distinct()
            .ToListAsync();

        _logger.LogDebug("Found {Count} project-specific approvers for role {Role}", 
            approverUserIds.Count, step.ApproverRole);

        // If not found in project team, fall back to company-wide roles
        if (!approverUserIds.Any())
        {
            _logger.LogDebug("No project-specific approvers found. Searching company-wide roles...");
            
            approverUserIds = await _userRoleRepository.AsQueryable()
                .Include(ur => ur.Role)
                .Where(ur => ur.Role.Name == step.ApproverRole)
                .Select(ur => ur.UserId)
                .Distinct()
                .ToListAsync();

            _logger.LogDebug("Found {Count} company-wide approvers for role {Role}", 
                approverUserIds.Count, step.ApproverRole);
        }

        if (!approverUserIds.Any())
        {
            _logger.LogWarning(
                "No users found with role {Role} for project {ProjectId}. Approval request {RequestId} has no approvers.",
                step.ApproverRole, request.ProjectId, request.Id);
            return;
        }

        _logger.LogInformation(
            "Sending approval notifications to {ApproverCount} users for request {RequestId}",
            approverUserIds.Count, request.Id);

        // Send notification to all approvers
        foreach (var approverUserId in approverUserIds)
        {
            await CreateAndSendAsync(
                userId: approverUserId,
                title: title,
                message: message,
                link: $"/projects/{request.ProjectId}/approvals/{request.Id}",
                type: NotificationType.MediaReview
            );
        }

        _logger.LogInformation(
            "Approval notifications sent successfully for request {RequestId}. Notified {ApproverCount} users.",
            request.Id, approverUserIds.Count);
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        _logger.LogDebug("Marking all notifications as read for user {UserId}", userId);

        var unreadNotifications = await _notificationRepository.AsQueryable()
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

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
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Successfully marked {Count} notifications as read for user {UserId}", 
            unreadNotifications.Count, userId);
    }
}
