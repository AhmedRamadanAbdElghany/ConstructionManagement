using ConstructionManagement.Application.DTOs.Portfolio;

namespace ConstructionManagement.Application.Interfaces;

public interface IPortfolioService
{
    // Category Operations
    Task<int> CreateCategoryAsync(CreatePortfolioCategoryRequest request);
    Task UpdateCategoryAsync(int categoryId, UpdatePortfolioCategoryRequest request);
    Task DeleteCategoryAsync(int categoryId);
    Task<PortfolioCategoryDto> GetCategoryAsync(int categoryId);
    
    // Gets the full tree for a company
    Task<IEnumerable<PortfolioCategoryDto>> GetCompanyPortfolioStructureAsync(int companyId);
    
    // Item Operations
    Task<int> CreateItemAsync(CreatePortfolioItemRequest request);
    Task UpdateItemAsync(int itemId, UpdatePortfolioItemRequest request);
    Task DeleteItemAsync(int itemId);
    Task<PortfolioItemDto> GetItemAsync(int itemId);
    Task<IEnumerable<PortfolioItemDto>> GetItemsByCategoryAsync(int categoryId);
}
