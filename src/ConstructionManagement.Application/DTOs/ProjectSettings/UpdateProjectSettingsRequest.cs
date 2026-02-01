using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// Request DTO for updating project-specific settings.
/// All fields are optional — only provided values will be updated.
/// </summary>
public record UpdateProjectSettingsRequest
{
    // ── Delay Notifications ───────────────────────────────────────────────────
    /// <summary>
    /// Enable/disable delay notifications for this project
    /// </summary>
    public bool? EnableDelayNotification { get; init; }

    /// <summary>
    /// If true → send notification only once; if false → recurring
    /// </summary>
    public bool? DelayNotificationIsOneTimeOnly { get; init; }

    /// <summary>
    /// Recurrence interval in days (used when not one-time-only)
    /// </summary>
    [Range(1, 365, ErrorMessage = "Interval days must be between 1 and 365")]
    public int? DelayNotificationIntervalDays { get; init; }

    /// <summary>
    /// Send delay notifications via email (in addition to in-app)
    /// </summary>
    public bool? DelayNotificationSendEmail { get; init; }

    /// <summary>
    /// Grace period (days) before sending the first delay alert
    /// </summary>
    [Range(0, 90, ErrorMessage = "Grace period must be between 0 and 90 days")]
    public int? DelayGracePeriodDays { get; init; }

    // ── Photo Upload & Review ─────────────────────────────────────────────────
    /// <summary>
    /// Allow uploading photos/media for progress/documentation
    /// </summary>
    public bool? EnablePhotoUpload { get; init; }

    /// <summary>
    /// Require review/approval of uploaded photos
    /// </summary>
    public bool? RequirePhotoReview { get; init; }

    /// <summary>
    /// Role name that can approve/review photos (from ProjectRole)
    /// </summary>
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Role name must be 1–100 characters")]
    public string? PhotoApproverRole { get; init; }

    // ── Invoice Workflow ──────────────────────────────────────────────────────
    /// <summary>
    /// Require review/approval of invoices
    /// </summary>
    public bool? EnableInvoiceReview { get; init; }

    /// <summary>
    /// Aggregate/group invoices by supplier for reporting
    /// </summary>
    public bool? EnableInvoiceAggregation { get; init; }

    // ── General Limits ────────────────────────────────────────────────────────
    /// <summary>
    /// Maximum photos allowed per upload (null = no limit)
    /// </summary>
    [Range(1, 100, ErrorMessage = "Max photos must be between 1 and 100")]
    public int? MaxPhotosPerUpload { get; init; }

    public bool? ClientCanSeeFinancials { get; init; }
    public bool? ClientCanSeeMedia { get; init; }
    public bool? ClientCanSeeBOQ { get; init; }
    public string? MoneyCalculationMethod { get; init; }
}
