using ConstructionManagement.Application.DTOs.Design;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("")]
[Authorize]
public class DesignsController : ControllerBase
{
    private readonly IDesignService _designService;

    public DesignsController(IDesignService designService)
    {
        _designService = designService;
    }

    #region Design Operations

    /// <summary>
    /// Get all designs for a project
    /// </summary>
    [HttpGet("api/projects/{projectId}/designs")]
    public async Task<IActionResult> GetProjectDesigns(int projectId)
    {
        var designs = await _designService.GetProjectDesignsAsync(projectId);
        return Ok(designs);
    }

    /// <summary>
    /// Get designs filtered by category
    /// </summary>
    [HttpGet("api/projects/{projectId}/designs/category/{categoryId?}")]
    public async Task<IActionResult> GetProjectDesignsByCategory(int projectId, int? categoryId)
    {
        var designs = await _designService.GetProjectDesignsByCategoryAsync(projectId, categoryId);
        return Ok(designs);
    }

    /// <summary>
    /// Get a specific design by ID
    /// </summary>
    [HttpGet("api/designs/{designId}")]
    public async Task<IActionResult> GetDesign(int designId)
    {
        var design = await _designService.GetDesignAsync(designId);
        return Ok(design);
    }

    /// <summary>
    /// Create a new design for a project
    /// </summary>
    [HttpPost("api/projects/{projectId}/designs")]
    [Authorize(Policy = "CanAddDesign")]
    public async Task<IActionResult> CreateDesign(int projectId, [FromForm] CreateDesignRequest request)
    {
        var designId = await _designService.CreateDesignAsync(projectId, request);
        return Ok(new { id = designId });
    }

    /// <summary>
    /// Update an existing design
    /// </summary>
    [HttpPut("api/designs/{designId}")]
    [Authorize(Policy = "CanAddDesign")]
    public async Task<IActionResult> UpdateDesign(int designId, [FromForm] UpdateDesignRequest request)
    {
        await _designService.UpdateDesignAsync(designId, request);
        return NoContent();
    }

    /// <summary>
    /// Delete a design
    /// </summary>
    [HttpDelete("api/designs/{designId}")]
    [Authorize(Policy = "CanAddDesign")]
    public async Task<IActionResult> DeleteDesign(int designId)
    {
        await _designService.DeleteDesignAsync(designId);
        return NoContent();
    }

    /// <summary>
    /// Get all versions of a design
    /// </summary>
    [HttpGet("api/designs/{designId}/versions")]
    public async Task<IActionResult> GetDesignVersions(int designId)
    {
        var versions = await _designService.GetDesignVersionsAsync(designId);
        return Ok(versions);
    }

    #endregion

    #region Category Operations

    /// <summary>
    /// Get the category tree for a project
    /// </summary>
    [HttpGet("api/projects/{projectId}/designs/categories/tree")]
    public async Task<IActionResult> GetCategoryTree(int projectId)
    {
        var categories = await _designService.GetCategoryTreeAsync(projectId);
        return Ok(categories);
    }

    /// <summary>
    /// Get all root categories for a project
    /// </summary>
    [HttpGet("api/projects/{projectId}/designs/categories")]
    public async Task<IActionResult> GetProjectCategories(int projectId)
    {
        var categories = await _designService.GetProjectCategoriesAsync(projectId);
        return Ok(categories);
    }

    /// <summary>
    /// Get a specific category by ID
    /// </summary>
    [HttpGet("api/designs/categories/{categoryId}")]
    public async Task<IActionResult> GetCategory(int categoryId)
    {
        var category = await _designService.GetCategoryAsync(categoryId);
        return Ok(category);
    }

    /// <summary>
    /// Create a new category for a project
    /// </summary>
    [HttpPost("api/projects/{projectId}/designs/categories")]
    [Authorize(Policy = "CanAddDesign")]
    public async Task<IActionResult> CreateCategory(int projectId, [FromForm] CreateCategoryRequest request)
    {
        request.ProjectId = projectId;
        var categoryId = await _designService.CreateCategoryAsync(request);
        return Ok(new { id = categoryId });
    }

    /// <summary>
    /// Update an existing category
    /// </summary>
    [HttpPut("api/designs/categories/{categoryId}")]
    [Authorize(Policy = "CanAddDesign")]
    public async Task<IActionResult> UpdateCategory(int categoryId, [FromForm] UpdateCategoryRequest request)
    {
        await _designService.UpdateCategoryAsync(categoryId, request);
        return NoContent();
    }

    #endregion

    /// <summary>
    /// Delete all categories and designs for a project (Start Over)
    /// </summary>
    [HttpDelete("api/projects/{projectId}/designs/categories")]
    [Authorize(Policy = "CanAddDesign")]
    public async Task<IActionResult> DeleteProjectCategories(int projectId)
    {
        await _designService.ClearProjectCategoriesAsync(projectId);
        return NoContent();
    }

    #region Template Operations

    /// <summary>
    /// Get company design templates (for import)
    /// </summary>
    [HttpGet("api/companies/{companyId}/design-templates")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> GetCompanyTemplates(int companyId)
    {
        var templates = await _designService.GetCompanyDesignTemplatesAsync(companyId);
        return Ok(templates);
    }

    /// <summary>
    /// Create a new company design template category
    /// </summary>
    [HttpPost("api/companies/{companyId}/design-templates")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> CreateCompanyTemplate(int companyId, [FromForm] CreateCategoryRequest request)
    {
        request.CompanyId = companyId;
        request.ProjectId = null;
        var categoryId = await _designService.CreateTemplateCategoryAsync(request);
        return Ok(new { id = categoryId });
    }

    /// <summary>
    /// Update a company design template category
    /// </summary>
    [HttpPut("api/companies/design-templates/{templateId}")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> UpdateCompanyTemplate(int templateId, [FromForm] UpdateCategoryRequest request)
    {
        await _designService.UpdateTemplateCategoryAsync(templateId, request);
        return NoContent();
    }

    /// <summary>
    /// Delete a company design template category
    /// </summary>
    [HttpDelete("api/companies/design-templates/{templateId}")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> DeleteCompanyTemplate(int templateId)
    {
        await _designService.DeleteTemplateCategoryAsync(templateId);
        return NoContent();
    }

    /// <summary>
    /// Import a design template to a project
    /// </summary>
    [HttpPost("api/projects/{projectId}/designs/templates/{templateId}/import")]
    [Authorize(Policy = "CanAddDesign")]
    public async Task<IActionResult> ImportTemplate(int projectId, int templateId)
    {
        await _designService.ImportDesignTemplateAsync(templateId, projectId);
        return NoContent();
    }

    #endregion
}
