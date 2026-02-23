using System;
using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// User-specific push notification settings
    /// </summary>
    public class UserPushNotificationSetting : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        /// <summary>
        /// Master toggle for push notifications
        /// </summary>
        public bool EnablePushNotifications { get; set; } = true;

        /// <summary>
        /// Notify when payment is received
        /// </summary>
        public bool NotifyOnPaymentReceived { get; set; } = true;

        /// <summary>
        /// Notify when invoice is approved
        /// </summary>
        public bool NotifyOnInvoiceApproval { get; set; } = true;

        /// <summary>
        /// Notify on project updates
        /// </summary>
        public bool NotifyOnProjectUpdate { get; set; } = true;

        /// <summary>
        /// Notify when assigned to a task
        /// </summary>
        public bool NotifyOnTaskAssignment { get; set; } = true;

        /// <summary>
        /// Notify on location-based alerts
        /// </summary>
        public bool NotifyOnLocationAlert { get; set; } = true;

        /// <summary>
        /// Notify on new messages
        /// </summary>
        public bool NotifyOnMessage { get; set; } = true;

        /// <summary>
        /// Notify on approval requests
        /// </summary>
        public bool NotifyOnApprovalRequest { get; set; } = true;

        /// <summary>
        /// Notify on delay alerts
        /// </summary>
        public bool NotifyOnDelayAlert { get; set; } = true;

        /// <summary>
        /// Quiet hours start (hour of day, 0-23, null = disabled)
        /// </summary>
        public int? QuietHoursStart { get; set; }

        /// <summary>
        /// Quiet hours end (hour of day, 0-23, null = disabled)
        /// </summary>
        public int? QuietHoursEnd { get; set; }

        /// <summary>
        /// User's timezone for quiet hours
        /// </summary>
        [MaxLength(50)]
        public string? TimeZone { get; set; }
    }
}
