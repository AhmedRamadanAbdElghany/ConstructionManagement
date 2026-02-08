namespace ConstructionManagement.Application.DTOs.Design;

/// <summary>
/// Request to update an existing design category.
/// </summary>
public class UpdateCategoryRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? ParentCategoryId { get; set; }
    public int? Order { get; set; }
}
