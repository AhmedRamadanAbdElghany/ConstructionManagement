using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Status of an overtime request.
/// </summary>
public enum OvertimeStatus
{
    /// <summary>
    /// Pending approval (معلق).
    /// </summary>
    Pending = 1,
    
    /// <summary>
    /// Approved (موافق عليه).
    /// </summary>
    Approved = 2,
    
    /// <summary>
    /// Rejected (مرفوض).
    /// </summary>
    Rejected = 3,
    
    /// <summary>
    /// Paid (مدفوع).
    /// </summary>
    Paid = 4,
    
    /// <summary>
    /// Cancelled (ملغى).
    /// </summary>
    Cancelled = 5
}

/// <summary>
/// Rule for calculating overtime pay.
/// Different multipliers for different days/times.
/// </summary>
public class OvertimeRule : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation.
    /// </summary>
    public int? CompanyId { get; set; }
    
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// Name of the rule (e.g., "عادي", "جمعة", "عيد").
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of when this rule applies.
    /// </summary>
    [MaxLength(200)]
    public string? Description { get; set; }

    /// <summary>
    /// Pay multiplier (1.5 for normal overtime, 2.0 for weekends, 3.0 for holidays).
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(5,2)")]
    public decimal Multiplier { get; set; } = 1.5m;

    /// <summary>
    /// Day of week this rule applies to (null means any day).
    /// </summary>
    public DayOfWeek? ApplicableDay { get; set; }

    /// <summary>
    /// Start time for this rule (e.g., 5 PM for after-hours).
    /// </summary>
    public TimeSpan? StartTime { get; set; }

    /// <summary>
    /// End time for this rule.
    /// </summary>
    public TimeSpan? EndTime { get; set; }

    /// <summary>
    /// Whether this rule is currently active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Priority of this rule (higher priority rules are checked first).
    /// </summary>
    public int Priority { get; set; } = 0;
}

/// <summary>
/// Record of overtime worked by an employee.
/// </summary>
public class OvertimeRecord : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation.
    /// </summary>
    public int? CompanyId { get; set; }
    
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// The user who worked overtime.
    /// </summary>
    [Required]
    public int UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// The project the overtime was worked on.
    /// </summary>
    public int? ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }

    /// <summary>
    /// Date the overtime was worked.
    /// </summary>
    [Required]
    public DateTime Date { get; set; }

    /// <summary>
    /// Start time of overtime.
    /// </summary>
    [Required]
    public TimeSpan StartTime { get; set; }

    /// <summary>
    /// End time of overtime.
    /// </summary>
    [Required]
    public TimeSpan EndTime { get; set; }

    /// <summary>
    /// Number of overtime hours worked.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(6,2)")]
    public decimal Hours { get; set; }

    /// <summary>
    /// The overtime rule applied (determines multiplier).
    /// </summary>
    public int? OvertimeRuleId { get; set; }
    
    [ForeignKey(nameof(OvertimeRuleId))]
    public virtual OvertimeRule? OvertimeRule { get; set; }

    /// <summary>
    /// Pay multiplier applied.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(5,2)")]
    public decimal Multiplier { get; set; } = 1.5m;

    /// <summary>
    /// User's hourly rate at the time of overtime.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal HourlyRate { get; set; }

    /// <summary>
    /// Calculated overtime amount (Hours * HourlyRate * Multiplier).
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CalculatedAmount { get; set; }

    /// <summary>
    /// Currency code.
    /// </summary>
    [MaxLength(10)]
    public string Currency { get; set; } = "EGP";

    /// <summary>
    /// Current status of the overtime record.
    /// </summary>
    public OvertimeStatus Status { get; set; } = OvertimeStatus.Pending;

    /// <summary>
    /// Reason for overtime work.
    /// </summary>
    [MaxLength(500)]
    public string? Reason { get; set; }

    /// <summary>
    /// User who approved the overtime.
    /// </summary>
    public int? ApprovedByUserId { get; set; }
    
    [ForeignKey(nameof(ApprovedByUserId))]
    public virtual User? ApprovedByUser { get; set; }

    /// <summary>
    /// Date approved.
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// Rejection reason if rejected.
    /// </summary>
    [MaxLength(500)]
    public string? RejectionReason { get; set; }

    /// <summary>
    /// Payroll period this overtime is included in.
    /// </summary>
    public int? PayrollId { get; set; }
    
    [ForeignKey(nameof(PayrollId))]
    public virtual Payroll? Payroll { get; set; }
}
