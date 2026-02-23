using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a default design category at the company level.
/// These are used as templates for new projects.
/// </summary>
public class CompanyDefaultDesignCategory : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company Company { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; } = 0;

    // Self-referential parent (null for root categories)
    public int? ParentCategoryId { get; set; }
    [ForeignKey(nameof(ParentCategoryId))]
    public virtual CompanyDefaultDesignCategory? ParentCategory { get; set; }

    // Child categories
    public virtual ICollection<CompanyDefaultDesignCategory> ChildCategories { get; set; } = new List<CompanyDefaultDesignCategory>();

    // Default designs in this category
    public virtual ICollection<CompanyDefaultDesign> Designs { get; set; } = new List<CompanyDefaultDesign>();

    // Computed helpers
    [NotMapped]
    public bool IsRootCategory => ParentCategoryId == null;

    [NotMapped]
    public bool IsLeafCategory => !ChildCategories.Any();
}
