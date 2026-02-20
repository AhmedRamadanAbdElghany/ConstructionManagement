using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Status of a progress invoice (مستخلص).
/// </summary>
public enum ProgressInvoiceStatus
{
    /// <summary>
    /// Invoice is being prepared (مسودة).
    /// </summary>
    Draft = 1,
    
    /// <summary>
    /// Invoice submitted for review (مقدم للمراجعة).
    /// </summary>
    Submitted = 2,
    
    /// <summary>
    /// Invoice approved by client (معتمد من العميل).
    /// </summary>
    Approved = 3,
    
    /// <summary>
    /// Invoice partially paid (مدفوع جزئياً).
    /// </summary>
    PartiallyPaid = 4,
    
    /// <summary>
    /// Invoice fully paid (مدفوع بالكامل).
    /// </summary>
    Paid = 5,
    
    /// <summary>
    /// Invoice cancelled (ملغى).
    /// </summary>
    Cancelled = 6
}

/// <summary>
/// Represents a progress invoice (مستخلص) for a construction project.
/// Progress invoices are issued periodically based on work completed.
/// </summary>
public class ProgressInvoice : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation.
    /// </summary>
    public int? CompanyId { get; set; }
    
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// The project this invoice is for.
    /// </summary>
    [Required]
    public int ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    /// <summary>
    /// Invoice number (auto-generated or manual).
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string InvoiceNumber { get; set; } = string.Empty;

    /// <summary>
    /// Date the invoice was issued.
    /// </summary>
    [Required]
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Start of the billing period.
    /// </summary>
    public DateTime? PeriodFrom { get; set; }

    /// <summary>
    /// End of the billing period.
    /// </summary>
    public DateTime? PeriodTo { get; set; }

    /// <summary>
    /// Sequential number of this invoice (1st, 2nd, 3rd...).
    /// </summary>
    public int InvoiceSequence { get; set; } = 1;

    /// <summary>
    /// Total value of work completed to date.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalWorkValue { get; set; }

    /// <summary>
    /// Total of previous invoices.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal PreviousInvoicesTotal { get; set; } = 0;

    /// <summary>
    /// Value of work in this invoice period.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentWorkValue { get; set; }

    /// <summary>
    /// Retention percentage (نسبة الاستقطاع).
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal RetentionPercentage { get; set; } = 0;

    /// <summary>
    /// Retention amount deducted from this invoice.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal RetentionAmount { get; set; } = 0;

    /// <summary>
    /// Retention period in months (default 6 months for maintenance period).
    /// </summary>
    public int RetentionPeriodMonths { get; set; } = 6;

    /// <summary>
    /// Expected release date for retention.
    /// </summary>
    public DateTime? RetentionReleaseDate { get; set; }

    /// <summary>
    /// Whether the retention from this invoice has been released.
    /// </summary>
    public bool RetentionReleased { get; set; } = false;

    /// <summary>
    /// Previous retention already held.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal PreviousRetention { get; set; } = 0;

    /// <summary>
    /// Total retention held to date.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalRetention { get; set; } = 0;

    /// <summary>
    /// Advance payment deduction (خصم الدفعة المقدمة).
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal AdvanceDeduction { get; set; } = 0;

    /// <summary>
    /// Other deductions.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal OtherDeductions { get; set; } = 0;

    /// <summary>
    /// Net amount due for this invoice.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal NetAmount { get; set; }

    /// <summary>
    /// Currency code.
    /// </summary>
    [MaxLength(10)]
    public string Currency { get; set; } = "EGP";

    /// <summary>
    /// Status of the invoice.
    /// </summary>
    public ProgressInvoiceStatus Status { get; set; } = ProgressInvoiceStatus.Draft;

    /// <summary>
    /// Amount paid against this invoice.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal PaidAmount { get; set; } = 0;

    /// <summary>
    /// Remaining amount to be paid.
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal RemainingAmount { get; set; } = 0;

    /// <summary>
    /// Notes and comments.
    /// </summary>
    [MaxLength(1000)]
    public string? Notes { get; set; }

    /// <summary>
    /// User who approved the invoice.
    /// </summary>
    public int? ApprovedByUserId { get; set; }
    
    [ForeignKey(nameof(ApprovedByUserId))]
    public virtual User? ApprovedByUser { get; set; }

    /// <summary>
    /// Date the invoice was approved.
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// User who created this invoice.
    /// </summary>
    [Required]
    public int CreatedByUserId { get; set; }
    
    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User CreatedByUser { get; set; } = null!;

    /// <summary>
    /// Payments received for this invoice.
    /// </summary>
    public virtual ICollection<ClientPayment> Payments { get; set; } = new List<ClientPayment>();
}
