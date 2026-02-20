using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Types of client payments in construction projects.
/// </summary>
public enum ClientPaymentType
{
    /// <summary>
    /// Advance payment before work starts (دفعة مقدمة).
    /// </summary>
    Advance = 1,
    
    /// <summary>
    /// Payment on account without specific invoice (دفعة على الحساب).
    /// </summary>
    OnAccount = 2,
    
    /// <summary>
    /// Payment against progress invoice (دفعة مستخلص).
    /// </summary>
    Progress = 3,
    
    /// <summary>
    /// Final payment at project handover (دفعة نهائية).
    /// </summary>
    Final = 4
}

/// <summary>
/// Payment methods for client payments.
/// </summary>
public enum ClientPaymentMethod
{
    Cash = 1,
    BankTransfer = 2,
    Check = 3,
    CreditCard = 4
}

/// <summary>
/// Status of a client payment.
/// </summary>
public enum ClientPaymentStatus
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Bounced = 4 // For bounced checks
}

/// <summary>
/// Represents a payment received from a client for a project.
/// Supports advance payments, progress payments, and final payments.
/// </summary>
public class ClientPayment : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation.
    /// </summary>
    public int? CompanyId { get; set; }
    
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// The project this payment is for.
    /// </summary>
    [Required]
    public int ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    /// <summary>
    /// Type of payment: Advance, OnAccount, Progress, Final.
    /// </summary>
    [Required]
    public ClientPaymentType PaymentType { get; set; } = ClientPaymentType.OnAccount;

    /// <summary>
    /// Payment amount.
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Currency code (EGP, USD, etc.).
    /// </summary>
    [MaxLength(10)]
    public string Currency { get; set; } = "EGP";

    /// <summary>
    /// Date the payment was received.
    /// </summary>
    [Required]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Due date for the payment (if applicable).
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Unique payment number or identifier.
    /// </summary>
    [MaxLength(50)]
    public string? PaymentNumber { get; set; }

    /// <summary>
    /// Receipt number for the payment.
    /// </summary>
    [MaxLength(50)]
    public string? ReceiptNumber { get; set; }

    /// <summary>
    /// Method of payment: Cash, BankTransfer, Check, CreditCard.
    /// </summary>
    public ClientPaymentMethod PaymentMethod { get; set; } = ClientPaymentMethod.Cash;

    /// <summary>
    /// Bank name for bank transfers and checks.
    /// </summary>
    [MaxLength(100)]
    public string? BankName { get; set; }

    /// <summary>
    /// Check number for check payments.
    /// </summary>
    [MaxLength(50)]
    public string? CheckNumber { get; set; }

    /// <summary>
    /// Due date for checks (when the check can be cashed).
    /// </summary>
    public DateTime? CheckDueDate { get; set; }

    /// <summary>
    /// Reference to the progress invoice if this is a progress payment.
    /// </summary>
    public int? ProgressInvoiceId { get; set; }
    
    [ForeignKey(nameof(ProgressInvoiceId))]
    public virtual ProgressInvoice? ProgressInvoice { get; set; }

    /// <summary>
    /// Additional notes about the payment.
    /// </summary>
    [MaxLength(500)]
    public string? Notes { get; set; }

    /// <summary>
    /// Path to attachment (receipt, check copy, etc.).
    /// </summary>
    [MaxLength(500)]
    public string? AttachmentPath { get; set; }

    /// <summary>
    /// Status of the payment.
    /// </summary>
    public ClientPaymentStatus Status { get; set; } = ClientPaymentStatus.Pending;

    /// <summary>
    /// User who confirmed the payment.
    /// </summary>
    public int? ConfirmedByUserId { get; set; }
    
    [ForeignKey(nameof(ConfirmedByUserId))]
    public virtual User? ConfirmedByUser { get; set; }

    /// <summary>
    /// Date the payment was confirmed.
    /// </summary>
    public DateTime? ConfirmedAt { get; set; }

    /// <summary>
    /// User who created this payment record.
    /// </summary>
    [Required]
    public int CreatedByUserId { get; set; }
    
    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User CreatedByUser { get; set; } = null!;

    /// <summary>
    /// Helper property to check if payment is confirmed.
    /// </summary>
    [NotMapped]
    public bool IsConfirmed => Status == ClientPaymentStatus.Confirmed;
}
