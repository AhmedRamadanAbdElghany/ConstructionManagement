using ConstructionManagement.Application.DTOs.Design;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Interface for design-related operations including version management.
/// </summary>
public interface IDesignService
{
    // Design CRUD operations - matching existing DesignService signatures
    Task<int> CreateDesignAsync(int projectId, CreateDesignRequest request);
    Task<DesignDto> GetDesignAsync(int designId);
    Task<IEnumerable<DesignDto>> GetProjectDesignsAsync(int projectId);
    Task<IEnumerable<DesignDto>> GetProjectDesignsByCategoryAsync(int projectId, int? categoryId);
    Task UpdateDesignAsync(int designId, UpdateDesignRequest request);
    Task DeleteDesignAsync(int designId);
    
    // Version management
    Task<IEnumerable<DesignDto>> GetDesignVersionsAsync(int designId);
    
    // Category management - matching existing DesignService signatures
    Task<int> CreateCategoryAsync(CreateCategoryRequest request);
    Task<DesignCategoryDto> GetCategoryAsync(int categoryId);
    Task<IEnumerable<DesignCategoryDto>> GetProjectCategoriesAsync(int projectId);
    Task<IEnumerable<DesignCategoryDto>> GetCategoryTreeAsync(int projectId);
    Task UpdateCategoryAsync(int categoryId, UpdateCategoryRequest request);
    Task DeleteCategoryAsync(int categoryId);
    
    // Template operations
    Task<IEnumerable<DesignCategoryDto>> GetCompanyDesignTemplatesAsync(int companyId);
    Task<int> CreateTemplateCategoryAsync(CreateCategoryRequest request);
    Task UpdateTemplateCategoryAsync(int categoryId, UpdateCategoryRequest request);
    Task DeleteTemplateCategoryAsync(int categoryId);
    Task ImportDesignTemplateAsync(int templateId, int targetProjectId);
    Task ClearProjectCategoriesAsync(int projectId);
}

