using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a material item in the inventory system
/// </summary>
public class Material : BaseEntity, ICompanyEntity
{
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string? SKU { get; set; }
    
    public string? Barcode { get; set; }
    
    public int CategoryId { get; set; }
    [ForeignKey(nameof(CategoryId))]
    public virtual MaterialCategory? Category { get; set; }
    
    /// <summary>
    /// Unit of measurement (e.g., kg, m, piece, bag)
    /// </summary>
    public string Unit { get; set; } = "piece";
    
    /// <summary>
    /// Weight per unit in kg (for shipping calculations)
    /// </summary>
    public decimal? WeightPerUnit { get; set; }
    
    /// <summary>
    /// Dimensions (LxWxH) for storage calculations
    /// </summary>
    public string? Dimensions { get; set; }
    
    /// <summary>
    /// Minimum stock level before reordering
    /// </summary>
    public decimal MinStockLevel { get; set; }
    
    /// <summary>
    /// Reorder quantity when stock reaches minimum
    /// </summary>
    public decimal ReorderQuantity { get; set; }
    
    /// <summary>
    /// Standard cost per unit
    /// </summary>
    public decimal? StandardCost { get; set; }
    
    /// <summary>
    /// Average cost per unit (calculated)
    /// </summary>
    public decimal? AverageCost { get; set; }
    
    /// <summary>
    /// Supplier/manufacturer information
    /// </summary>
    public string? SupplierName { get; set; }
    public string? SupplierContact { get; set; }
    public string? SupplierPhone { get; set; }
    
    /// <summary>
    /// Is this material active/available
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Is this material tracked in inventory
    /// </summary>
    public bool IsTracked { get; set; } = true;
    
    /// <summary>
    /// Expiration tracking enabled
    /// </summary>
    public bool TrackExpiration { get; set; } = false;
    
    /// <summary>
    /// Shelf life in days (if applicable)
    /// </summary>
    public int? ShelfLifeDays { get; set; }
    
    /// <summary>
    /// Storage location description
    /// </summary>
    public string? StorageLocation { get; set; }
    
    /// <summary>
    /// Notes or special instructions
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Image URL for the material
    /// </summary>
    public string? ImageUrl { get; set; }
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
    
    public virtual ICollection<MaterialStock> Stocks { get; set; }
        = new List<MaterialStock>();
    
    public virtual ICollection<MaterialRequest> Requests { get; set; }
        = new List<MaterialRequest>();
    
    public virtual ICollection<MaterialConsumption> Consumptions { get; set; }
        = new List<MaterialConsumption>();
}
