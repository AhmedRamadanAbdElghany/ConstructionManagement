namespace ConstructionManagement.Domain.Entities
{
    public class CompanySettings : BaseEntity, ITenantEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public string TenantId { get; set; } = "ConstructionDB";

        // All the same settings as ProjectSettings
        public bool EnableDelayNotification { get; set; } = true;
        public bool DelayNotificationIsOneTimeOnly { get; set; } = false;
        public int DelayNotificationIntervalDays { get; set; } = 7;
        public bool DelayNotificationSendEmail { get; set; } = true;
        public int DelayGracePeriodDays { get; set; } = 3;

        public bool EnablePhotoUpload { get; set; } = true;
        public bool RequirePhotoReview { get; set; } = true;
        public string PhotoApproverRole { get; set; } = "MediaReviewer";

        public bool EnableInvoiceReview { get; set; } = true;
        public bool EnableInvoiceAggregation { get; set; } = true;

        public int? MaxPhotosPerUpload { get; set; } = 10;

        // You can add more global defaults here later
    }
}

