using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using System.Net.Http;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;

namespace ConstructionManagement.Infrastructure.Services
{
    public class PushNotificationService : IPushNotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PushNotificationService> _logger;
        private readonly HttpClient _httpClient;

        public PushNotificationService(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<PushNotificationService> logger,
            HttpClient httpClient)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClient;
        }

        #region Device Management

        public async Task<DeviceTokenDto> RegisterDeviceAsync(int userId, RegisterDeviceRequest request)
        {
            // Check if token already exists
            var existingToken = await _context.PushDeviceTokens
                .FirstOrDefaultAsync(t => t.UserId == userId && t.DeviceToken == request.DeviceToken);

            if (existingToken != null)
            {
                existingToken.LastUsedAt = DateTime.UtcNow;
                existingToken.IsActive = true;
                existingToken.DeviceName = request.DeviceName ?? existingToken.DeviceName;
                await _context.SaveChangesAsync();
                return MapToDeviceTokenDto(existingToken);
            }

            var platform = Enum.Parse<DevicePlatform>(request.Platform, true);
            var newToken = new PushDeviceToken
            {
                UserId = userId,
                DeviceToken = request.DeviceToken,
                Platform = platform,
                DeviceName = request.DeviceName,
                LastUsedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.PushDeviceTokens.Add(newToken);
            await _context.SaveChangesAsync();

            return MapToDeviceTokenDto(newToken);
        }

        public async Task<List<DeviceTokenDto>> GetUserDevicesAsync(int userId)
        {
            var devices = await _context.PushDeviceTokens
                .Where(t => t.UserId == userId && t.IsActive)
                .OrderByDescending(t => t.LastUsedAt)
                .ToListAsync();

            return devices.Select(MapToDeviceTokenDto).ToList();
        }

        public async Task UnregisterDeviceAsync(int userId, string deviceToken)
        {
            var token = await _context.PushDeviceTokens
                .FirstOrDefaultAsync(t => t.UserId == userId && t.DeviceToken == deviceToken);

            if (token != null)
            {
                token.IsActive = false;
                await _context.SaveChangesAsync();
            }
        }

        #endregion

        #region Send Push Notifications

        public async Task<PushResultDto> SendPushAsync(SendPushNotificationRequest request)
        {
            return await SendPushToUsersAsync(
                request.UserIds,
                request.Title,
                request.Body,
                request.Link,
                request.Data);
        }

        public async Task<PushResultDto> SendPushToUserAsync(SendUserPushRequest request)
        {
            return await SendPushToUsersAsync(
                new List<int> { request.UserId },
                request.Title,
                request.Body,
                request.Link,
                request.Data);
        }

        public async Task<PushResultDto> SendNotificationAsync(int userId, string title, string body, Dictionary<string, string>? data = null)
        {
            return await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        public async Task<PushResultDto> SendNotificationAsync(List<int> userIds, string title, string body, Dictionary<string, string>? data = null)
        {
            return await SendPushToUsersAsync(userIds, title, body, null, data);
        }

        public async Task<PushResultDto> SendPushToUsersAsync(
            List<int> userIds,
            string title,
            string body,
            string? link = null,
            Dictionary<string, string>? data = null)
        {
            var result = new PushResultDto
            {
                Success = true,
                Message = "Push notifications sent",
                Errors = new List<string>()
            };

            // Get all active device tokens for the users
            var deviceTokens = await _context.PushDeviceTokens
                .Where(t => userIds.Contains(t.UserId) && t.IsActive)
                .ToListAsync();

            if (!deviceTokens.Any())
            {
                result.Message = "No active devices found for the specified users";
                return result;
            }

            // Prepare data payload
            var dataPayload = data ?? new Dictionary<string, string>();
            if (!string.IsNullOrEmpty(link))
            {
                dataPayload["link"] = link;
            }
            dataPayload["timestamp"] = DateTime.UtcNow.ToString("o");

            var successCount = 0;
            var failureCount = 0;

            foreach (var deviceToken in deviceTokens)
            {
                try
                {
                    var pushLog = new PushNotificationLog
                    {
                        UserId = deviceToken.UserId,
                        DeviceTokenId = deviceToken.Id,
                        Title = title,
                        Body = body,
                        Data = JsonSerializer.Serialize(dataPayload),
                        Status = PushDeliveryStatus.Pending,
                        SentAt = DateTime.UtcNow
                    };

                    _context.PushNotificationLogs.Add(pushLog);
                    await _context.SaveChangesAsync();

                    // Send via FCM
                    var sent = await SendViaFcmAsync(deviceToken.DeviceToken, title, body, dataPayload, deviceToken.Platform);

                    if (sent)
                    {
                        pushLog.Status = PushDeliveryStatus.Sent;
                        successCount++;
                    }
                    else
                    {
                        pushLog.Status = PushDeliveryStatus.Failed;
                        pushLog.ErrorMessage = "FCM send failed";
                        failureCount++;
                        result.Errors!.Add($"Failed to send to device {deviceToken.Id}");
                    }

                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending push to device {DeviceId}", deviceToken.Id);
                    failureCount++;
                    result.Errors!.Add($"Error: {ex.Message}");
                }
            }

            result.SuccessCount = successCount;
            result.FailureCount = failureCount;
            result.Success = failureCount == 0;

            return result;
        }

        #endregion

        #region Notification-triggered pushes

        public async Task SendNotificationPushAsync(Notification notification)
        {
            var settings = await GetUserSettingsAsync(notification.UserId);
            if (!settings.EnablePushNotifications)
            {
                return;
            }

            // Check if this notification type should trigger push
            var shouldPush = notification.Type switch
            {
                NotificationType.PaymentReceived => settings.NotifyOnPaymentReceived,
                NotificationType.InvoiceReview => settings.NotifyOnInvoiceApproval,
                NotificationType.ProjectDelay => settings.NotifyOnDelayAlert,
                NotificationType.ItemDelay => settings.NotifyOnDelayAlert,
                NotificationType.TeamMemberAssigned => settings.NotifyOnTaskAssignment,
                NotificationType.General => true,
                _ => true
            };

            if (!shouldPush) return;

            var data = new Dictionary<string, string>
            {
                ["notificationId"] = notification.Id.ToString(),
                ["type"] = notification.Type.ToString()
            };

            if (!string.IsNullOrEmpty(notification.Link))
            {
                data["link"] = notification.Link;
            }

            await SendPushToUsersAsync(
                new List<int> { notification.UserId },
                notification.Title,
                notification.Message,
                notification.Link,
                data);
        }

        public async Task SendPaymentNotificationAsync(int userId, string title, string body, int? paymentId = null)
        {
            var settings = await GetUserSettingsAsync(userId);
            if (!settings.NotifyOnPaymentReceived) return;

            var data = new Dictionary<string, string>();
            if (paymentId.HasValue)
            {
                data["paymentId"] = paymentId.Value.ToString();
                data["link"] = $"/payments/{paymentId}";
            }

            await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        public async Task SendInvoiceNotificationAsync(int userId, string title, string body, int? invoiceId = null)
        {
            var settings = await GetUserSettingsAsync(userId);
            if (!settings.NotifyOnInvoiceApproval) return;

            var data = new Dictionary<string, string>();
            if (invoiceId.HasValue)
            {
                data["invoiceId"] = invoiceId.Value.ToString();
                data["link"] = $"/invoices/{invoiceId}";
            }

            await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        public async Task SendProjectNotificationAsync(int userId, string title, string body, int? projectId = null)
        {
            var settings = await GetUserSettingsAsync(userId);
            if (!settings.NotifyOnProjectUpdate) return;

            var data = new Dictionary<string, string>();
            if (projectId.HasValue)
            {
                data["projectId"] = projectId.Value.ToString();
                data["link"] = $"/projects/{projectId}";
            }

            await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        public async Task SendTaskNotificationAsync(int userId, string title, string body, int? taskId = null)
        {
            var settings = await GetUserSettingsAsync(userId);
            if (!settings.NotifyOnTaskAssignment) return;

            var data = new Dictionary<string, string>();
            if (taskId.HasValue)
            {
                data["taskId"] = taskId.Value.ToString();
            }

            await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        public async Task SendLocationAlertAsync(int userId, string title, string body, int? workerId = null)
        {
            var settings = await GetUserSettingsAsync(userId);
            if (!settings.NotifyOnLocationAlert) return;

            var data = new Dictionary<string, string>();
            if (workerId.HasValue)
            {
                data["workerId"] = workerId.Value.ToString();
                data["link"] = $"/workers/{workerId}/location";
            }

            await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        public async Task SendMessageNotificationAsync(int userId, string title, string body, int? conversationId = null)
        {
            var settings = await GetUserSettingsAsync(userId);
            if (!settings.NotifyOnMessage) return;

            var data = new Dictionary<string, string>();
            if (conversationId.HasValue)
            {
                data["conversationId"] = conversationId.Value.ToString();
                data["link"] = $"/messages/{conversationId}";
            }

            await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        public async Task SendApprovalNotificationAsync(int userId, string title, string body, int? approvalId = null)
        {
            var settings = await GetUserSettingsAsync(userId);
            if (!settings.NotifyOnApprovalRequest) return;

            var data = new Dictionary<string, string>();
            if (approvalId.HasValue)
            {
                data["approvalId"] = approvalId.Value.ToString();
                data["link"] = $"/approvals/{approvalId}";
            }

            await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        public async Task SendDelayAlertAsync(int userId, string title, string body, int? projectId = null, int? itemId = null)
        {
            var settings = await GetUserSettingsAsync(userId);
            if (!settings.NotifyOnDelayAlert) return;

            var data = new Dictionary<string, string>();
            if (projectId.HasValue)
            {
                data["projectId"] = projectId.Value.ToString();
            }
            if (itemId.HasValue)
            {
                data["itemId"] = itemId.Value.ToString();
            }

            await SendPushToUsersAsync(new List<int> { userId }, title, body, null, data);
        }

        #endregion

        #region History

        public async Task<List<PushNotificationLogDto>> GetPushHistoryAsync(int userId, int count = 50)
        {
            var logs = await _context.PushNotificationLogs
                .Include(l => l.DeviceToken)
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.SentAt)
                .Take(count)
                .ToListAsync();

            return logs.Select(l => new PushNotificationLogDto
            {
                Id = l.Id,
                Title = l.Title,
                Body = l.Body,
                Status = l.Status.ToString(),
                ErrorMessage = l.ErrorMessage,
                SentAt = l.SentAt,
                OpenedAt = l.OpenedAt,
                DeviceName = l.DeviceToken?.DeviceName
            }).ToList();
        }

        #endregion

        #region Settings

        public async Task<PushNotificationSettingsDto> GetUserSettingsAsync(int userId)
        {
            var settings = await _context.UserPushNotificationSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                // Return default settings if user has no saved settings
                return new PushNotificationSettingsDto
                {
                    EnablePushNotifications = true,
                    NotifyOnPaymentReceived = true,
                    NotifyOnInvoiceApproval = true,
                    NotifyOnProjectUpdate = true,
                    NotifyOnTaskAssignment = true,
                    NotifyOnLocationAlert = true,
                    NotifyOnMessage = true,
                    NotifyOnApprovalRequest = true,
                    NotifyOnDelayAlert = true
                };
            }

            return new PushNotificationSettingsDto
            {
                EnablePushNotifications = settings.EnablePushNotifications,
                NotifyOnPaymentReceived = settings.NotifyOnPaymentReceived,
                NotifyOnInvoiceApproval = settings.NotifyOnInvoiceApproval,
                NotifyOnProjectUpdate = settings.NotifyOnProjectUpdate,
                NotifyOnTaskAssignment = settings.NotifyOnTaskAssignment,
                NotifyOnLocationAlert = settings.NotifyOnLocationAlert,
                NotifyOnMessage = settings.NotifyOnMessage,
                NotifyOnApprovalRequest = settings.NotifyOnApprovalRequest,
                NotifyOnDelayAlert = settings.NotifyOnDelayAlert
            };
        }

        public async Task<PushNotificationSettingsDto> UpdateUserSettingsAsync(int userId, PushNotificationSettingsDto settings)
        {
            var entity = await _context.UserPushNotificationSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (entity == null)
            {
                entity = new UserPushNotificationSetting
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserPushNotificationSettings.Add(entity);
            }

            entity.EnablePushNotifications = settings.EnablePushNotifications;
            entity.NotifyOnPaymentReceived = settings.NotifyOnPaymentReceived;
            entity.NotifyOnInvoiceApproval = settings.NotifyOnInvoiceApproval;
            entity.NotifyOnProjectUpdate = settings.NotifyOnProjectUpdate;
            entity.NotifyOnTaskAssignment = settings.NotifyOnTaskAssignment;
            entity.NotifyOnLocationAlert = settings.NotifyOnLocationAlert;
            entity.NotifyOnMessage = settings.NotifyOnMessage;
            entity.NotifyOnApprovalRequest = settings.NotifyOnApprovalRequest;
            entity.NotifyOnDelayAlert = settings.NotifyOnDelayAlert;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetUserSettingsAsync(userId);
        }

        #endregion

        #region Badge Count

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();
        }

        public async Task MarkAsOpenedAsync(int pushLogId)
        {
            var log = await _context.PushNotificationLogs.FindAsync(pushLogId);
            if (log != null)
            {
                log.OpenedAt = DateTime.UtcNow;
                log.Status = PushDeliveryStatus.Opened;
                await _context.SaveChangesAsync();
            }
        }

        #endregion

        #region Private Methods

        private async Task<bool> SendViaFcmAsync(
            string deviceToken,
            string title,
            string body,
            Dictionary<string, string> data,
            DevicePlatform platform)
        {
            var fcmServerKey = _configuration["Firebase:ServerKey"];
            var fcmSenderId = _configuration["Firebase:SenderId"];

            if (string.IsNullOrEmpty(fcmServerKey))
            {
                _logger.LogWarning("Firebase Server Key not configured. Push notification not sent.");
                return false;
            }

            var message = new FcmMessage
            {
                Token = deviceToken,
                Notification = new FcmNotification
                {
                    Title = title,
                    Body = body,
                    Icon = "notification_icon",
                    ClickAction = "FLUTTER_NOTIFICATION_CLICK"
                },
                Data = data,
                Android = new AndroidConfig
                {
                    Priority = "high",
                    Notification = new AndroidNotification
                    {
                        ChannelId = "default",
                        Icon = "notification_icon",
                        Color = "#2196F3",
                        ClickAction = "FLUTTER_NOTIFICATION_CLICK"
                    }
                },
                Apns = new ApnsConfig
                {
                    Payload = new ApnsPayload
                    {
                        Aps = new ApnsAps
                        {
                            Sound = "default"
                        }
                    }
                }
            };

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, "https://fcm.googleapis.com/fcm/send");
                request.Headers.Add("Authorization", $"key={fcmServerKey}");
                request.Headers.Add("Sender", $"id={fcmSenderId}");
                request.Content = JsonContent.Create(message);

                var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Push notification sent successfully to device");
                    return true;
                }
                else
                {
                    // Log status code only, not the response content which may contain sensitive data
                    _logger.LogError("Failed to send push notification. Status: {StatusCode}", (int)response.StatusCode);
                    return false;
                }
            }
            catch (Exception ex)
            {
                // Don't log exception details that might contain sensitive data
                _logger.LogError("Error sending FCM push notification: {ErrorMessage}", ex.Message);
                return false;
            }
        }

        private static DeviceTokenDto MapToDeviceTokenDto(PushDeviceToken token)
        {
            return new DeviceTokenDto
            {
                Id = token.Id,
                Platform = token.Platform.ToString(),
                DeviceName = token.DeviceName,
                LastUsedAt = token.LastUsedAt,
                IsActive = token.IsActive
            };
        }

        #endregion
    }
}
