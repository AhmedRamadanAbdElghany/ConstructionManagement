using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

public class Transaction : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    // Required relationship - every transaction belongs to a project
    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // Optional relationship - can be linked to a specific Project item
    public int? ProjectItemId { get; set; }
    
    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem? ProjectItem { get; set; }

    public TransactionType Type { get; set; }

    public decimal Amount { get; set; }

    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

    // Who created this transaction record
    public int CreatedByUserId { get; set; }
    public virtual User CreatedBy { get; set; } = null!;

    // Optional: who reviewed/approved it
    public int? ReviewedByUserId { get; set; }
    public virtual User? ReviewedBy { get; set; }

    public DateTime? ReviewDate { get; set; }
    public string? ReviewNotes { get; set; }

    // Business / document fields
    public string? Description { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? SupplierName { get; set; }
    public string? AttachmentPath { get; set; }

    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
}

public enum TransactionType
{
    MaterialPurchase,
    LaborPayment,
    EquipmentRental,
    Overhead,
    SubcontractorPayment,
    Other
}

public enum TransactionStatus
{
    Pending,
    Approved,
    Rejected
}
