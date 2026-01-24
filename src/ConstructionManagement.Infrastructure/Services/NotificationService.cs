using ConstructionManagement.Application.DTOs.Notfification;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IRepository<Notification> notificationRepository,
        IUnitOfWork unitOfWork,
        ILogger<NotificationService> logger)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
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
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Link = link,
            Type = type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);

        // حفظ التغييرات عبر Unit of Work
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Notification {Id} saved for user {UserId}", notification.Id, userId);

        // ملاحظة: هنا يتم استدعاء SignalR أو Firebase لاحقاً (خارج نطاق الـ DB Transaction)
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
    {
        var query = _notificationRepository.AsQueryable()
            .Where(n => n.UserId == userId);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

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
        var notification = await _notificationRepository.AsQueryable()
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null || notification.IsRead) return;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;

        await _notificationRepository.UpdateAsync(notification);
        await _unitOfWork.SaveChangesAsync();
    }
    public async Task SendApprovalNeededNotificationAsync(ApprovalRequest request, ApprovalStep step)
    {
        var title = $"موافقة مطلوبة - {request.Source}";
        var message = $"يوجد {request.Source} جديد يحتاج موافقة في الخطوة {step.StepOrder} ({step.ApproverRole})";

        // ابعت لكل المستخدمين اللي ليهم الدور ده في المشروع
        // (هنا مجرد مثال بسيط – يفضل تستخدم UserRoles أو ProjectTeamRoles لتحديد المستلمين)
        await CreateAndSendAsync(
            userId: 1, // ← استبدل بقائمة المستلمين الحقيقية
            title: title,
            message: message,
            link: $"/projects/{request.ProjectId}/approvals/{request.Id}",
            type: NotificationType.MediaReview
        );
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var unreadNotifications = await _notificationRepository.AsQueryable()
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        if (!unreadNotifications.Any()) return;

        foreach (var n in unreadNotifications)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
        }

        await _notificationRepository.UpdateRangeAsync(unreadNotifications);
        await _unitOfWork.SaveChangesAsync();
    }
}