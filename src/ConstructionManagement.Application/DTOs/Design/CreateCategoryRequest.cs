namespace ConstructionManagement.Application.DTOs.Design;

/// <summary>
/// Request DTO for creating a new design category.
/// </summary>
public class CreateCategoryRequest
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentCategoryId { get; set; }
    public int? Order { get; set; }
}
