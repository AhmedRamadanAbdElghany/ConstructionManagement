using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents promotional discount codes
/// </summary>
public class SpecialPromotion : BaseEntity
{
    /// <summary>
    /// Supplier/Inventory Owner who created the promotion
    /// </summary>
    public int SupplierUserId { get; set; }
    [ForeignKey(nameof(SupplierUserId))]
    public virtual User? SupplierUser { get; set; }

    /// <summary>
    /// Promotion name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Discount code (e.g., "SUMMER2024")
    /// </summary>
    public string DiscountCode { get; set; } = string.Empty;

    /// <summary>
    /// Discount percentage
    /// </summary>
    public decimal DiscountPercent { get; set; }

    /// <summary>
    /// Maximum discount amount cap
    /// </summary>
    public decimal? MaxDiscountAmount { get; set; }

    /// <summary>
    /// Maximum total usage count (null = unlimited)
    /// </summary>
    public int? MaxUsageCount { get; set; }

    /// <summary>
    /// Current usage count
    /// </summary>
    public int CurrentUsageCount { get; set; } = 0;

    /// <summary>
    /// Maximum usage per customer
    /// </summary>
    public int? MaxUsagePerCustomer { get; set; }

    /// <summary>
    /// Promotion start date
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Promotion end date
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Apply to all items (true) or specific items (false)
    /// </summary>
    public bool ApplyToAllItems { get; set; } = false;

    /// <summary>
    /// Comma-separated applicable material types
    /// </summary>
    public string? ApplicableMaterialTypes { get; set; }

    /// <summary>
    /// Is promotion active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
