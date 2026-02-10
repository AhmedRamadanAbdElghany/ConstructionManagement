using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an item line in an inventory order
/// </summary>
public class InventoryOrderItem : BaseEntity
{
    /// <summary>
    /// Parent order
    /// </summary>
    public int OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public virtual InventoryOrder? Order { get; set; }

    /// <summary>
    /// Source stock item
    /// </summary>
    public int StockId { get; set; }
    [ForeignKey(nameof(StockId))]
    public virtual InventoryStock? Stock { get; set; }

    /// <summary>
    /// Material name (denormalized for history)
    /// </summary>
    public string MaterialName { get; set; } = string.Empty;

    /// <summary>
    /// Material type (denormalized for history)
    /// </summary>
    public string MaterialType { get; set; } = string.Empty;

    /// <summary>
    /// Unit of measurement
    /// </summary>
    public string Unit { get; set; } = string.Empty;

    /// <summary>
    /// Ordered quantity
    /// </summary>
    public decimal Quantity { get; set; }

    /// <summary>
    /// Delivered quantity
    /// </summary>
    public decimal? DeliveredQuantity { get; set; }

    // Pricing
    /// <summary>
    /// Original price per unit
    /// </summary>
    public decimal OriginalPrice { get; set; }

    /// <summary>
    /// Negotiated price per unit
    /// </summary>
    public decimal? NegotiatedPrice { get; set; }

    /// <summary>
    /// Applied tier discount percentage
    /// </summary>
    public decimal? AppliedDiscountPercent { get; set; }

    /// <summary>
    /// Total price for this line
    /// </summary>
    public decimal TotalPrice { get; set; }

    /// <summary>
    /// Item notes
    /// </summary>
    public string? Notes { get; set; }
}
