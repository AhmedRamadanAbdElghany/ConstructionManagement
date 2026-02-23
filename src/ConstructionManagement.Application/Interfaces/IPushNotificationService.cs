using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IPushNotificationService
    {
        // Device Management
        Task<DeviceTokenDto> RegisterDeviceAsync(int userId, RegisterDeviceRequest request);
        Task<List<DeviceTokenDto>> GetUserDevicesAsync(int userId);
        Task UnregisterDeviceAsync(int userId, string deviceToken);
        
        // Send Push Notifications
        Task<PushResultDto> SendPushAsync(SendPushNotificationRequest request);
        Task<PushResultDto> SendPushToUserAsync(SendUserPushRequest request);
        Task<PushResultDto> SendPushToUsersAsync(List<int> userIds, string title, string body, string? link = null, Dictionary<string, string>? data = null);
        
        // Generic notification method
        Task<PushResultDto> SendNotificationAsync(int userId, string title, string body, Dictionary<string, string>? data = null);
        Task<PushResultDto> SendNotificationAsync(List<int> userIds, string title, string body, Dictionary<string, string>? data = null);
        
        // Notification-triggered pushes
        Task SendNotificationPushAsync(Notification notification);
        Task SendPaymentNotificationAsync(int userId, string title, string body, int? paymentId = null);
        Task SendInvoiceNotificationAsync(int userId, string title, string body, int? invoiceId = null);
        Task SendProjectNotificationAsync(int userId, string title, string body, int? projectId = null);
        Task SendTaskNotificationAsync(int userId, string title, string body, int? taskId = null);
        Task SendLocationAlertAsync(int userId, string title, string body, int? workerId = null);
        Task SendMessageNotificationAsync(int userId, string title, string body, int? conversationId = null);
        Task SendApprovalNotificationAsync(int userId, string title, string body, int? approvalId = null);
        Task SendDelayAlertAsync(int userId, string title, string body, int? projectId = null, int? itemId = null);
        
        // History
        Task<List<PushNotificationLogDto>> GetPushHistoryAsync(int userId, int count = 50);
        
        // Settings
        Task<PushNotificationSettingsDto> GetUserSettingsAsync(int userId);
        Task<PushNotificationSettingsDto> UpdateUserSettingsAsync(int userId, PushNotificationSettingsDto settings);
        
        // Badge count
        Task<int> GetUnreadCountAsync(int userId);
        Task MarkAsOpenedAsync(int pushLogId);
    }
}
