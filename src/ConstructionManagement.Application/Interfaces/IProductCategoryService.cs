using ConstructionManagement.Application.DTOs.Marketplace;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service for managing product categories in the marketplace
/// </summary>
public interface IProductCategoryService
{
    // Categories
    Task<IEnumerable<ProductCategoryDto>> GetCategoriesAsync(bool includeUnapproved = false);
    Task<IEnumerable<ProductCategoryDto>> GetCategoryTreeAsync();
    Task<ProductCategoryDto?> GetCategoryByIdAsync(int id);
    Task<ProductCategoryDto> CreateCategoryAsync(CreateProductCategoryRequest request);
    Task<ProductCategoryDto> UpdateCategoryAsync(int id, UpdateProductCategoryRequest request);
    Task<bool> DeleteCategoryAsync(int id);
    
    // Category Requests (User requests for new categories)
    Task<IEnumerable<CategoryRequestDto>> GetCategoryRequestsAsync(string? status = null);
    Task<CategoryRequestDto?> GetCategoryRequestByIdAsync(int id);
    Task<CategoryRequestDto> CreateCategoryRequestAsync(int userId, CreateCategoryRequestRequest request);
    Task<CategoryRequestDto> ReviewCategoryRequestAsync(int requestId, int reviewerUserId, ReviewCategoryRequestRequest request);
    
    // Helper methods
    Task<IEnumerable<ProductCategoryDto>> GetSubCategoriesAsync(int parentCategoryId);
    Task<IEnumerable<ProductCategoryDto>> GetMainCategoriesAsync();
    Task<bool> CategoryExistsAsync(string name, string? nameAr = null);
}
