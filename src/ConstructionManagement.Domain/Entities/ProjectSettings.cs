using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Project-specific configuration settings (1:1 relationship with Project)
/// Uses shared primary key (ProjectId = PK + FK)
/// </summary>
public class ProjectSettings : BaseEntity
{
    [Key]
    [ForeignKey(nameof(Project))]
    public int Id { get; set; }   // ← must be named Id (convention + clarity)

    public virtual Project Project { get; set; } = null!;

    // ── Delay Notifications ───────────────────────────────────────
    public bool EnableDelayNotification { get; set; } = true;
    public bool DelayNotificationIsOneTimeOnly { get; set; } = true;
    public int DelayNotificationIntervalDays { get; set; } = 7;
    public bool DelayNotificationSendEmail { get; set; } = false;
    public int DelayGracePeriodDays { get; set; } = 0;           // days before sending first delay alert

    // ── Photo Upload & Review ─────────────────────────────────────
    public bool EnablePhotoUpload { get; set; } = true;
    public bool RequirePhotoReview { get; set; } = true;
    public string PhotoApproverRole { get; set; } = "MediaReviewer";

    // ── Invoice Workflow ──────────────────────────────────────────
    public bool EnableInvoiceReview { get; set; } = true;
    public bool EnableInvoiceAggregation { get; set; } = true;

    // ── General Limits ────────────────────────────────────────────
    public int? MaxPhotosPerUpload { get; set; } = 10;

    // You can add more settings later, for example:
    // public bool EnableDailyProgressReminder { get; set; } = false;
    // public int DailyProgressReminderHour { get; set; } = 18;
    // public string DefaultCurrency { get; set; } = "EGP";
    // public decimal? BudgetOverrunWarningThreshold { get; set; } = 0.85m; // 85%
}