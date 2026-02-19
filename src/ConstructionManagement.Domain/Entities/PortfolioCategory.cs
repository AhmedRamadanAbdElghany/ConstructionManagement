using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a category in the company's portfolio showcase.
/// </summary>
public class PortfolioCategory : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; } = 0;
    
    // Self-referential parent (null for root categories)
    public int? ParentCategoryId { get; set; }
    [ForeignKey(nameof(ParentCategoryId))]
    public virtual PortfolioCategory? ParentCategory { get; set; }
    
    // Child categories
    public virtual ICollection<PortfolioCategory> ChildCategories { get; set; } = new List<PortfolioCategory>();
    
    // Items in this category
    public virtual ICollection<PortfolioItem> Items { get; set; } = new List<PortfolioItem>();
    
    [NotMapped]
    public bool IsRootCategory => ParentCategoryId == null;
}
