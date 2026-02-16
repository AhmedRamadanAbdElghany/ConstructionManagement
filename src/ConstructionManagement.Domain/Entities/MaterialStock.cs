using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents the stock level of a material at a specific warehouse/location
/// </summary>
public class MaterialStock : BaseEntity, ICompanyEntity
{
    public int MaterialId { get; set; }
    [ForeignKey(nameof(MaterialId))]
    public virtual Material? Material { get; set; }
    
    /// <summary>
    /// Warehouse or storage location identifier (Link to Warehouse entity)
    /// </summary>
    public int? WarehouseId { get; set; }
    [ForeignKey(nameof(WarehouseId))]
    public virtual Warehouse? Warehouse { get; set; }

    /// <summary>
    /// Legacy warehouse identifier or code
    /// </summary>
    public string WarehouseCode { get; set; } = "main";
    
    /// <summary>
    /// Warehouse/location name
    /// </summary>
    public string WarehouseName { get; set; } = "Main Warehouse";
    
    /// <summary>
    /// Current quantity in stock
    /// </summary>
    public decimal CurrentQuantity { get; set; }
    
    /// <summary>
    /// Reserved quantity (allocated to requests but not yet consumed)
    /// </summary>
    public decimal ReservedQuantity { get; set; }
    
    /// <summary>
    /// Available quantity (Current - Reserved)
    /// </summary>
    public decimal AvailableQuantity => CurrentQuantity - ReservedQuantity;
    
    /// <summary>
    /// Location within the warehouse (e.g., aisle, shelf)
    /// </summary>
    public string? BinLocation { get; set; }
    
    /// <summary>
    /// Expiration date for this batch (if applicable)
    /// </summary>
    public DateTime? ExpirationDate { get; set; }
    
    /// <summary>
    /// Batch number for tracking
    /// </summary>
    public string? BatchNumber { get; set; }
    
    /// <summary>
    /// Last restock date
    /// </summary>
    public DateTime? LastRestockDate { get; set; }
    
    /// <summary>
    /// Cost per unit at current stock
    /// </summary>
    public decimal? UnitCost { get; set; }
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
