using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Project-specific configuration settings (1:1 relationship with Project)
/// Uses shared primary key (ProjectId = PK + FK)
/// </summary>
public class ProjectSettings : BaseEntity, ICompanyEntity
{
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Project Project { get; set; } = null!;


    public int? CompanyId { get; set; }

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

    public bool? ClientCanSeeFinancials { get; set; }
    public bool? ClientCanSeeMedia { get; set; }
    public bool? ClientCanSeeBOQ { get; set; }

    public ConstructionManagement.Domain.Enums.CalculationMethod? MoneyCalculationMethod { get; set; }

    // Daily Log Settings (null = inherit from Company)
    public bool? AllowAddProgressEntry { get; set; }
    public bool? AllowReopenClosedDay { get; set; }
    public bool? AutoCloseDay { get; set; }
    public TimeSpan? AutoCloseDayTime { get; set; }
}
