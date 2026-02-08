using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a category for organizing materials (e.g., Concrete, Steel, Wood, Electrical, Plumbing)
/// </summary>
public class MaterialCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string? Icon { get; set; }
    
    public int? ParentCategoryId { get; set; }
    [ForeignKey(nameof(ParentCategoryId))]
    public virtual MaterialCategory? ParentCategory { get; set; }
    
    public virtual ICollection<MaterialCategory> SubCategories { get; set; }
        = new List<MaterialCategory>();
    
    public virtual ICollection<Material> Materials { get; set; }
        = new List<Material>();
}
