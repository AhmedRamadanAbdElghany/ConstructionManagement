using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[Route("api/notifications")]
[ApiController]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// جلب كل الإشعارات الخاصة بالمستخدم الحالي
    /// </summary>
    /// <param name="unreadOnly">true = جلب الإشعارات غير المقروءة فقط</param>
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var notifications = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly);

        return Ok(notifications);
    }

    /// <summary>
    /// جلب عدد الإشعارات غير المقروءة (للـ badge في الـ header)
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var count = await _notificationService.GetUserNotificationsAsync(userId, true);
        return Ok(new { UnreadCount = count.Count });
    }

    /// <summary>
    /// وضع إشعار معين كمقروء
    /// </summary>
    [HttpPost("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(int notificationId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        await _notificationService.MarkAsReadAsync(notificationId, userId);
        return Ok();
    }

    /// <summary>
    /// وضع كل الإشعارات كمقروءة
    /// </summary>
    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok();
    }

    // NOTE: Add tests for unread count and mark read/all.
}