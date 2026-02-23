namespace ConstructionManagement.Application.DTOs.Marketplace;

/// <summary>
/// DTO for product category
/// </summary>
public class ProductCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
    public bool IsApproved { get; set; }
    public bool IsSystemCategory { get; set; }
    public int SortOrder { get; set; }
    public int ProductCount { get; set; }
    public List<ProductCategoryDto> SubCategories { get; set; } = new();
}

/// <summary>
/// DTO for category tree view
/// </summary>
public class ProductCategoryTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int ProductCount { get; set; }
    public List<ProductCategoryTreeDto> Children { get; set; } = new();
}

/// <summary>
/// Request to create a new product category
/// </summary>
public class CreateProductCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int? ParentCategoryId { get; set; }
}

/// <summary>
/// Request to update a product category
/// </summary>
public class UpdateProductCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int? ParentCategoryId { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for category request (user requesting a new category)
/// </summary>
public class CategoryRequestDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public string? Description { get; set; }
    public int? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
    public string Status { get; set; } = "Pending";
    public int? ReviewedByUserId { get; set; }
    public string? ReviewedByName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? Notes { get; set; }
    public int? CreatedCategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request to create a new category request
/// </summary>
public class CreateCategoryRequestRequest
{
    public string Name { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public string? Description { get; set; }
    public int? ParentCategoryId { get; set; }
}

/// <summary>
/// Request to review a category request (approve/reject)
/// </summary>
public class ReviewCategoryRequestRequest
{
    public bool IsApproved { get; set; }
    public string? Notes { get; set; }
    public int? ExistingCategoryId { get; set; } // If pointing to existing category
}
