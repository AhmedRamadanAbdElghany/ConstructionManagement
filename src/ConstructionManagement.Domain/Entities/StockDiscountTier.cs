using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents quantity-based discount tiers for stock items
/// </summary>
public class StockDiscountTier : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Associated stock item
    /// </summary>
    public int StockId { get; set; }
    [ForeignKey(nameof(StockId))]
    public virtual InventoryStock? Stock { get; set; }

    /// <summary>
    /// Tier name (e.g., "Bulk 50+", "Wholesale 100+")
    /// </summary>
    public string TierName { get; set; } = string.Empty;

    /// <summary>
    /// Minimum quantity required for this tier
    /// </summary>
    public decimal MinQuantity { get; set; }

    /// <summary>
    /// Maximum quantity (null = unlimited)
    /// </summary>
    public decimal? MaxQuantity { get; set; }

    /// <summary>
    /// Discount percentage (e.g., 5 for 5%)
    /// </summary>
    public decimal DiscountPercent { get; set; }

    /// <summary>
    /// Fixed discount amount instead of percentage
    /// </summary>
    public decimal? DiscountAmount { get; set; }

    /// <summary>
    /// Start date for this tier (optional)
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// End date for this tier (optional)
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Is this tier currently active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Priority (higher priority tiers applied first)
    /// </summary>
    /// <summary>
    /// Priority (higher priority tiers applied first)
    /// </summary>
    public int Priority { get; set; } = 0;

    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
