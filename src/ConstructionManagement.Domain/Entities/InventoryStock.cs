using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents stock/inventory items available for order
/// </summary>
public class InventoryStock : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Warehouse where stock is located
    /// </summary>
    public int WarehouseId { get; set; }
    [ForeignKey(nameof(WarehouseId))]
    public virtual InventoryWarehouse? Warehouse { get; set; }

    /// <summary>
    /// Material type (cement, sand, steel, etc.)
    /// </summary>
    public string MaterialType { get; set; } = string.Empty;

    /// <summary>
    /// Material name/description
    /// </summary>
    public string MaterialName { get; set; } = string.Empty;

    /// <summary>
    /// Unit of measurement (Ton, CubicMeter, Sack, etc.)
    /// </summary>
    public string Unit { get; set; } = string.Empty;

    // Stock Levels
    /// <summary>
    /// Current quantity in stock
    /// </summary>
    public decimal CurrentQuantity { get; set; }

    /// <summary>
    /// Reserved quantity (allocated to orders)
    /// </summary>
    public decimal ReservedQuantity { get; set; }

    /// <summary>
    /// Available quantity (Current - Reserved)
    /// </summary>
    public decimal AvailableQuantity => CurrentQuantity - ReservedQuantity;

    /// <summary>
    /// Minimum stock level threshold
    /// </summary>
    public decimal MinLevel { get; set; }

    // Auto-Reorder Settings
    /// <summary>
    /// Enable automatic reorder when below threshold
    /// </summary>
    public bool AutoReorderEnabled { get; set; } = false;

    /// <summary>
    /// Quantity at which to trigger reorder
    /// </summary>
    public decimal? ReorderPoint { get; set; }

    /// <summary>
    /// Quantity to order when reordering
    /// </summary>
    public decimal? ReorderQuantity { get; set; }

    /// <summary>
    /// Default supplier for auto-reorder
    /// </summary>
    public int? DefaultSupplierUserId { get; set; }

    // Pricing
    /// <summary>
    /// Base price per unit
    /// </summary>
    public decimal PricePerUnit { get; set; }

    /// <summary>
    /// Discounted price (promotional)
    /// </summary>
    public decimal? DiscountedPrice { get; set; }

    // Additional Info
    /// <summary>
    /// Bin/shelf location in warehouse
    /// </summary>
    public string? BinLocation { get; set; }

    /// <summary>
    /// Batch number for tracking
    /// </summary>
    public string? BatchNumber { get; set; }

    /// <summary>
    /// Expiration date (for perishable materials)
    /// </summary>
    public DateTime? ExpirationDate { get; set; }

    // Navigation Properties
    public virtual ICollection<StockDiscountTier> DiscountTiers { get; set; } = new List<StockDiscountTier>();
    public virtual ICollection<InventoryOrderItem> OrderItems { get; set; } = new List<InventoryOrderItem>();
    public virtual ICollection<RecurringOrderItem> RecurringItems { get; set; } = new List<RecurringOrderItem>();

    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
