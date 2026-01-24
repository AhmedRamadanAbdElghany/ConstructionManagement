using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

public class ItemInvoice : BaseEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int BOQItemId { get; set; }

    [ForeignKey(nameof(BOQItemId))]
    public virtual BOQItem BOQItem { get; set; } = null!;

    [Required]
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

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

    [MaxLength(500)]
    public string? AttachmentPath { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

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
}