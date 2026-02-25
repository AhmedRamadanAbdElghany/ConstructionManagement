using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public class ItemInvoice : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    [Required]
    public int ProjectItemId { get; set; }

    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem ProjectItem { get; set; } = null!;

    [Required]
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    /// <summary>
    /// Type of invoice: Disbursement Authorization (اذن صرف) or Purchase Invoice (فاتورة شراء)
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string InvoiceType { get; set; } = "PurchaseInvoice";

    /// <summary>
    /// Type-safe invoice type enum for business logic operations.
    /// </summary>
    [NotMapped]
    public InvoiceType InvoiceTypeEnum
    {
        get => InvoiceTypeExtensions.FromString(InvoiceType) ?? Enums.InvoiceType.PurchaseInvoice;
        set => InvoiceType = value.ToDatabaseString();
    }

    [Required]
    [MaxLength(20)]
    public string InvoiceNumber { get; set; } = string.Empty;

    [Required]
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    public DateTime? DueDate { get; set; }

    [Required]
    public decimal SubTotal { get; set; }

    public decimal? TaxRate { get; set; }

    public decimal? TaxAmount { get; set; }

    public decimal? RetentionRate { get; set; }

    public decimal? RetentionAmount { get; set; }

    [Required]
    public decimal NetAmount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "EGP";

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(200)]
    public string? SupplierVendor { get; set; }

    /// <summary>
    /// ID of the vendor from the system. 
    /// If null, ExternalVendorName should be used.
    /// </summary>
    public int? VendorId { get; set; }

    [ForeignKey(nameof(VendorId))]
    public virtual Vendor? Vendor { get; set; }

    /// <summary>
    /// Name of an external vendor not registered in the system.
    /// Used when VendorId is null.
    /// </summary>
    [MaxLength(200)]
    public string? ExternalVendorName { get; set; }

    [MaxLength(500)]
    public string? AttachmentPath { get; set; }

    /// <summary>
    /// Database-stored status as string for backward compatibility.
    /// Use StatusEnum for type-safe operations.
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = InvoiceStatus.Pending.ToDatabaseString();

    /// <summary>
    /// Type-safe status enum for business logic operations.
    /// </summary>
    [NotMapped]
    public InvoiceStatus StatusEnum
    {
        get => InvoiceStatusExtensions.FromString(Status) ?? InvoiceStatus.Draft;
        set => Status = value.ToDatabaseString();
    }

    [MaxLength(500)]
    public string? RejectionReason { get; set; }

    public int? ReviewerUserId { get; set; }

    [ForeignKey(nameof(ReviewerUserId))]
    public virtual User? Reviewer { get; set; }

    public DateTime? ReviewDate { get; set; }

    [Required]
    public int CreatedByUserId { get; set; }

    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User CreatedBy { get; set; } = null!;

    /// <summary>
    /// Collection of images attached to this invoice.
    /// Supports multiple images for documentation purposes.
    /// </summary>
    public virtual ICollection<InvoiceImage> Images { get; set; } = new List<InvoiceImage>();
}
