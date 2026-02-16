using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Items in a recurring/subscription order
/// </summary>
public class RecurringOrderItem : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Parent recurring order
    /// </summary>
    public int RecurringOrderId { get; set; }
    [ForeignKey(nameof(RecurringOrderId))]
    public virtual RecurringOrder? RecurringOrder { get; set; }

    /// <summary>
    /// Stock item
    /// </summary>
    public int StockId { get; set; }
    [ForeignKey(nameof(StockId))]
    public virtual InventoryStock? Stock { get; set; }

    /// <summary>
    /// Material name (denormalized)
    /// </summary>
    public string MaterialName { get; set; } = string.Empty;

    /// <summary>
    /// Material type (denormalized)
    /// </summary>
    public string MaterialType { get; set; } = string.Empty;

    /// <summary>
    /// Unit of measurement
    /// </summary>
    public string Unit { get; set; } = string.Empty;

    /// <summary>
    /// Quantity to order each time
    /// </summary>
    public decimal Quantity { get; set; }

    /// <summary>
    /// Price per unit at subscription creation
    /// </summary>
    public decimal PricePerUnit { get; set; }

    /// <summary>
    /// Apply quantity-based discount
    /// </summary>
    public bool ApplyBulkDiscount { get; set; } = true;

    /// <summary>
    /// Notes for this item
    /// </summary>
    public string? Notes { get; set; }

    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
