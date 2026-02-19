using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Application.DTOs.Portfolio;

public class UpdatePortfolioCategoryRequest
{
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string? Name { get; set; }
    
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }
    
    [Range(0, int.MaxValue, ErrorMessage = "Order must be a non-negative number")]
    public int? Order { get; set; }
    
    public int? ParentCategoryId { get; set; }
}
