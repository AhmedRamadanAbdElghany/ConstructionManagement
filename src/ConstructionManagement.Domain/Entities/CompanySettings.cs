using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    public class CompanySettings : BaseEntity, ICompanyEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
            
        public int? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Company { get; set; } = null!;

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
        
        // Client Visibility Options
        public bool ClientCanSeeFinancials { get; set; } = false;
        public bool ClientCanSeeMedia { get; set; } = true;
        public bool ClientCanSeeBOQ { get; set; } = true;

        // Project Money Calculation Options
        public string DefaultMoneyCalculationMethod { get; set; } = "Measured"; // Measured, Supervision, Mixed

        // You can add more global defaults here later
    }
}

