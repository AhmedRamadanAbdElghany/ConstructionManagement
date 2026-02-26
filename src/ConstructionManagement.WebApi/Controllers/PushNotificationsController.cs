using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PushNotificationsController : BaseApiController
    {
        private readonly IPushNotificationService _pushService;

        public PushNotificationsController(IPushNotificationService pushService)
        {
            _pushService = pushService;
        }

        /// <summary>
        /// Register a device for push notifications
        /// </summary>
        [HttpPost("devices/register")]
        public async Task<ActionResult<DeviceTokenDto>> RegisterDevice([FromBody] RegisterDeviceRequest request)
        {
            var userId = GetUserId();
            var result = await _pushService.RegisterDeviceAsync(userId, request);
            return Ok(result);
        }

        /// <summary>
        /// Get user's registered devices
        /// </summary>
        [HttpGet("devices")]
        public async Task<ActionResult<List<DeviceTokenDto>>> GetDevices()
        {
            var userId = GetUserId();
            var devices = await _pushService.GetUserDevicesAsync(userId);
            return Ok(devices);
        }

        /// <summary>
        /// Unregister a device
        /// </summary>
        [HttpDelete("devices/{deviceToken}")]
        public async Task<IActionResult> UnregisterDevice(string deviceToken)
        {
            var userId = GetUserId();
            await _pushService.UnregisterDeviceAsync(userId, deviceToken);
            return Ok(new { message = "Device unregistered successfully" });
        }

        /// <summary>
        /// Send push notification to specific users (Admin only)
        /// </summary>
        [HttpPost("send")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PushResultDto>> SendPush([FromBody] SendPushNotificationRequest request)
        {
            var result = await _pushService.SendPushAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// Get push notification history
        /// </summary>
        [HttpGet("history")]
        public async Task<ActionResult<List<PushNotificationLogDto>>> GetHistory([FromQuery] int count = 50)
        {
            var userId = GetUserId();
            var history = await _pushService.GetPushHistoryAsync(userId, count);
            return Ok(history);
        }

        /// <summary>
        /// Get unread notification count
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userId = GetUserId();
            var count = await _pushService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        /// <summary>
        /// Mark push notification as opened
        /// </summary>
        [HttpPost("{pushLogId}/opened")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<IActionResult> MarkAsOpened(int pushLogId)
        {
            await _pushService.MarkAsOpenedAsync(pushLogId);
            return Ok(new { message = "Marked as opened" });
        }

        /// <summary>
        /// Get push notification settings
        /// </summary>
        [HttpGet("settings")]
        public async Task<ActionResult<PushNotificationSettingsDto>> GetSettings()
        {
            var userId = GetUserId();
            var settings = await _pushService.GetUserSettingsAsync(userId);
            return Ok(settings);
        }

        /// <summary>
        /// Update push notification settings
        /// </summary>
        [HttpPut("settings")]
        public async Task<ActionResult<PushNotificationSettingsDto>> UpdateSettings([FromBody] PushNotificationSettingsDto settings)
        {
            var userId = GetUserId();
            var result = await _pushService.UpdateUserSettingsAsync(userId, settings);
            return Ok(result);
        }

        /// <summary>
        /// Test push notification (sends to current user)
        /// </summary>
        [HttpPost("test")]
        public async Task<ActionResult<PushResultDto>> TestPush()
        {
            var userId = GetUserId();
            var result = await _pushService.SendPushToUsersAsync(
                new List<int> { userId },
                "Test Notification",
                "This is a test push notification from Construction Management System",
                "/dashboard");
            return Ok(result);
        }


    }
}
