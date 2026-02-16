using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an item within a material request
/// </summary>
public class MaterialRequestItem : BaseEntity
{
    /// <summary>
    /// Parent request
    /// </summary>
    public int MaterialRequestId { get; set; }
    [ForeignKey(nameof(MaterialRequestId))]
    public virtual MaterialRequest? MaterialRequest { get; set; }
    
    /// <summary>
    /// Material being requested
    /// </summary>
    public int? MaterialId { get; set; }
    [ForeignKey(nameof(MaterialId))]
    public virtual Material? Material { get; set; }
    
    /// <summary>
    /// Quantity requested
    /// </summary>
    public decimal RequestedQuantity { get; set; }
    
    /// <summary>
    /// Quantity approved
    /// </summary>
    public decimal ApprovedQuantity { get; set; }
    
    /// <summary>
    /// Quantity fulfilled
    /// </summary>
    public decimal FulfilledQuantity { get; set; }
    
    /// <summary>
    /// Unit of measurement
    /// </summary>
    public string Unit { get; set; } = string.Empty;
    
    /// <summary>
    /// Notes for this item
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Cost per unit
    /// </summary>
    public decimal? UnitCost { get; set; }
    
    /// <summary>
    /// Total cost for this item
    /// </summary>
    public decimal? TotalCost => UnitCost * FulfilledQuantity;
}
