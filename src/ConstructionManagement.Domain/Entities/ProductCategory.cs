using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Product category for warehouse/marketplace products
/// Building materials, finishing materials, doors, windows, etc.
/// </summary>
public class ProductCategory : BaseEntity
{
    /// <summary>
    /// Category name in English
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Category name in Arabic
    /// </summary>
    public string NameAr { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional description
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Icon name for UI display
    /// </summary>
    public string? Icon { get; set; }
    
    /// <summary>
    /// Parent category for hierarchical structure
    /// </summary>
    public int? ParentCategoryId { get; set; }
    [ForeignKey(nameof(ParentCategoryId))]
    public virtual ProductCategory? ParentCategory { get; set; }
    
    /// <summary>
    /// Child categories
    /// </summary>
    public virtual ICollection<ProductCategory> SubCategories { get; set; } = new List<ProductCategory>();
    
    /// <summary>
    /// Whether this category is approved and visible to all
    /// </summary>
    public bool IsApproved { get; set; } = true;
    
    /// <summary>
    /// Whether this is a system-defined category (cannot be deleted)
    /// </summary>
    public bool IsSystemCategory { get; set; } = false;
    
    /// <summary>
    /// Sort order for display
    /// </summary>
    public int SortOrder { get; set; } = 0;
    
    /// <summary>
    /// Products in this category
    /// </summary>
    public virtual ICollection<VendorProduct> Products { get; set; } = new List<VendorProduct>();
}
