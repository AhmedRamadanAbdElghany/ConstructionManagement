using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an image attached to an invoice.
/// Supports multiple images per invoice for documentation purposes.
/// </summary>
public class InvoiceImage : BaseEntity
{
    /// <summary>
    /// Reference to the parent invoice
    /// </summary>
    [Required]
    public int ItemInvoiceId { get; set; }

    [ForeignKey(nameof(ItemInvoiceId))]
    public virtual ItemInvoice Invoice { get; set; } = null!;

    /// <summary>
    /// Path to the image file in storage
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string ImagePath { get; set; } = string.Empty;

    /// <summary>
    /// Original file name as uploaded by user
    /// </summary>
    [MaxLength(255)]
    public string? OriginalFileName { get; set; }

    /// <summary>
    /// Size of the file in bytes
    /// </summary>
    public long? FileSize { get; set; }

    /// <summary>
    /// MIME type of the image (e.g., image/jpeg, image/png)
    /// </summary>
    [MaxLength(100)]
    public string? ContentType { get; set; }

    /// <summary>
    /// Order for displaying images (0-based)
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Optional description/caption for the image
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }
}
