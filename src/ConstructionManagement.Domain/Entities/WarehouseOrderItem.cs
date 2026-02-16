using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an item line in a warehouse order
/// </summary>
public class WarehouseOrderItem : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Parent order
    /// </summary>
    public int OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public virtual WarehouseOrderRequest? Order { get; set; }

    /// <summary>
    /// Item name/material name
    /// </summary>
    public string ItemName { get; set; } = string.Empty;

    /// <summary>
    /// Item description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Quantity ordered
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// Unit of measurement (kg, meter, piece, etc.)
    /// </summary>
    public string? Unit { get; set; }

    /// <summary>
    /// Price per unit
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Total price for this line
    /// </summary>
    /// <summary>
    /// Total price for this line
    /// </summary>
    public decimal TotalPrice { get; set; }

    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
