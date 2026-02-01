namespace ConstructionManagement.Application.DTOs;

public class UpdateCompanySettingsRequest
{
    // All fields are nullable so partial updates are possible
    // (only send the fields you want to change)

    public bool? EnableDelayNotification { get; set; }
    public bool? DelayNotificationIsOneTimeOnly { get; set; }
    public int? DelayNotificationIntervalDays { get; set; }
    public bool? DelayNotificationSendEmail { get; set; }
    public int? DelayGracePeriodDays { get; set; }

    public bool? EnablePhotoUpload { get; set; }
    public bool? RequirePhotoReview { get; set; }
    public string? PhotoApproverRole { get; set; }

    public bool? EnableInvoiceReview { get; set; }
    public bool? EnableInvoiceAggregation { get; set; }

    public int? MaxPhotosPerUpload { get; set; }

    public bool? ClientCanSeeFinancials { get; set; }
    public bool? ClientCanSeeMedia { get; set; }
    public bool? ClientCanSeeBOQ { get; set; }
    public string? DefaultMoneyCalculationMethod { get; set; }
}
