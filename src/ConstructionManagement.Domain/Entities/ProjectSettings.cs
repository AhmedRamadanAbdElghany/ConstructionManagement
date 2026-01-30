using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Project-specific configuration settings (1:1 relationship with Project)
/// Uses shared primary key (ProjectId = PK + FK)
/// </summary>
public class ProjectSettings : BaseEntity, ITenantEntity
{
    public virtual Project Project { get; set; } = null!;

    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public string TenantId { get; set; } = "ConstructionDB";

    // All fields are now nullable ? null means "use global default"
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
}
