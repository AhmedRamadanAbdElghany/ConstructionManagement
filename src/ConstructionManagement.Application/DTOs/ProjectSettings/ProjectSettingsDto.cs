namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for returning project-specific settings to the client/application layer.
/// Contains all configurable settings from ProjectSettings entity.
/// </summary>
public record ProjectSettingsDto
{
    /// <summary>
    /// Whether delay notifications are enabled for this project
    /// </summary>
    public bool EnableDelayNotification { get; init; } = true;

    /// <summary>
    /// If true, delay notification is sent only once; if false — recurring
    /// </summary>
    public bool DelayNotificationIsOneTimeOnly { get; init; } = true;

    /// <summary>
    /// Recurrence interval in days (used when not one-time-only)
    /// </summary>
    public int DelayNotificationIntervalDays { get; init; } = 7;

    /// <summary>
    /// Send delay notifications via email (in addition to in-app)
    /// </summary>
    public bool DelayNotificationSendEmail { get; init; } = false;

    /// <summary>
    /// Grace period (days) before sending the first delay alert
    /// </summary>
    public int DelayGracePeriodDays { get; init; } = 0;

    /// <summary>
    /// Allow uploading photos/media for progress/documentation
    /// </summary>
    public bool EnablePhotoUpload { get; init; } = true;

    /// <summary>
    /// Require review/approval of uploaded photos before they are considered valid
    /// </summary>
    public bool RequirePhotoReview { get; init; } = true;

    /// <summary>
    /// Role name (from ProjectRole) that is allowed to review/approve photos
    /// </summary>
    public string PhotoApproverRole { get; init; } = "MediaReviewer";

    /// <summary>
    /// Require review/approval of invoices before they are processed
    /// </summary>
    public bool EnableInvoiceReview { get; init; } = true;

    /// <summary>
    /// Group/aggregate invoices by supplier/vendor for easier reporting
    /// </summary>
    public bool EnableInvoiceAggregation { get; init; } = true;

    /// <summary>
    /// Maximum number of photos allowed per single upload
    /// null = no limit
    /// </summary>
    public int? MaxPhotosPerUpload { get; init; } = 10;
    
    public bool ClientCanSeeFinancials { get; init; } = false;
    public bool ClientCanSeeMedia { get; init; } = true;
    public bool ClientCanSeeBOQ { get; init; } = true;
    public string MoneyCalculationMethod { get; init; } = "Measured";

    // ── Daily Log ─────────────────────────────────────────────────────────────
    public bool AllowAddProgressEntry { get; init; } = true;
    public bool AllowReopenClosedDay { get; init; } = false;
    public bool AutoCloseDay { get; init; } = false;
    public TimeSpan? AutoCloseDayTime { get; init; }
}
