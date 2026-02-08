using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a design category in a construction project.
/// Categories can be nested (parent-child relationship) to create a hierarchical structure.
/// Designs belong to categories.
/// </summary>
public class DesignCategory : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; } = 0;  // For ordering within parent
    
    // Project relationship (null for company-wide templates)
    public int? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }
    
    // Self-referential parent (null for root categories)
    public int? ParentCategoryId { get; set; }
    [ForeignKey(nameof(ParentCategoryId))]
    public virtual DesignCategory? ParentCategory { get; set; }
    
    // Child categories
    public virtual ICollection<DesignCategory> ChildCategories { get; set; } = new List<DesignCategory>();
    
    // Designs in this category
    public virtual ICollection<Design> Designs { get; set; } = new List<Design>();
    
    // Computed helpers
    [NotMapped]
    public bool IsRootCategory => ParentCategoryId == null;
    
    [NotMapped]
    public bool IsLeafCategory => !ChildCategories.Any();
}
