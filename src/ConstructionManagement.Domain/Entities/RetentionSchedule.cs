using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Status of a retention schedule.
/// </summary>
public enum RetentionStatus
{
    /// <summary>
    /// Retention is currently held (محتجز).
    /// </summary>
    Held = 1,
    
    /// <summary>
    /// Retention is due for release (مستحق للإطلاق).
    /// </summary>
    DueForRelease = 2,
    
    /// <summary>
    /// Retention has been fully released (تم الإطلاق).
    /// </summary>
    Released = 3,
    
    /// <summary>
    /// Retention has been partially released (تم الإطلاق جزئياً).
    /// </summary>
    PartiallyReleased = 4,
    
    /// <summary>
    /// Retention was cancelled (ملغى).
    /// </summary>
    Cancelled = 5
}

/// <summary>
/// Represents a retention schedule for progress invoices.
/// Tracks withheld retention amounts and their release dates.
/// </summary>
public class RetentionSchedule : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation.
    /// </summary>
    public int? CompanyId { get; set; }
    
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// The project this retention belongs to.
    /// </summary>
    [Required]
    public int ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    /// <summary>
    /// The progress invoice this retention is from.
    /// </summary>
    [Required]
    public int ProgressInvoiceId { get; set; }
    
    [ForeignKey(nameof(ProgressInvoiceId))]
    public virtual ProgressInvoice ProgressInvoice { get; set; } = null!;

    /// <summary>
    /// The amount of retention withheld.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal RetentionAmount { get; set; }

    /// <summary>
    /// Currency code.
    /// </summary>
    [MaxLength(10)]
    public string Currency { get; set; } = "EGP";

    /// <summary>
    /// Date when retention was withheld.
    /// </summary>
    [Required]
    public DateTime RetentionDate { get; set; }

    /// <summary>
    /// Expected release date (RetentionDate + RetentionPeriodMonths).
    /// </summary>
    [Required]
    public DateTime ReleaseDate { get; set; }

    /// <summary>
    /// Actual date when retention was released.
    /// </summary>
    public DateTime? ActualReleaseDate { get; set; }

    /// <summary>
    /// Retention period in months (default 6 months for maintenance period).
    /// </summary>
    public int RetentionPeriodMonths { get; set; } = 6;

    /// <summary>
    /// Current status of the retention.
    /// </summary>
    public RetentionStatus Status { get; set; } = RetentionStatus.Held;

    /// <summary>
    /// Amount that has been released (for partial releases).
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal ReleasedAmount { get; set; } = 0;

    /// <summary>
    /// Remaining amount to be released.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal RemainingAmount { get; set; }

    /// <summary>
    /// Additional notes.
    /// </summary>
    [MaxLength(500)]
    public string? Notes { get; set; }

    /// <summary>
    /// User who released the retention.
    /// </summary>
    public int? ReleasedByUserId { get; set; }
    
    [ForeignKey(nameof(ReleasedByUserId))]
    public virtual User? ReleasedByUser { get; set; }

    /// <summary>
    /// Number of reminder notifications sent.
    /// </summary>
    public int ReminderCount { get; set; } = 0;

    /// <summary>
    /// Last reminder date.
    /// </summary>
    public DateTime? LastReminderDate { get; set; }
}
