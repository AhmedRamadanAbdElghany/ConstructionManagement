namespace ConstructionManagement.Application.DTOs.Design;

/// <summary>
/// Data transfer object for DesignCategory entity.
/// </summary>
public class DesignCategoryDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int? CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
    public int? Order { get; set; }
    public int DesignCount { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties for tree structure
    public virtual ICollection<DesignCategoryDto>? ChildCategories { get; set; }
    public virtual ICollection<DesignDto>? Designs { get; set; }
}
