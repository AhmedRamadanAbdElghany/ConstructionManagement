using ConstructionManagement.Application.DTOs.Marketplace;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for managing product categories in the marketplace
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductCategoriesController : ControllerBase
{
    private readonly IProductCategoryService _categoryService;
    private readonly ILogger<ProductCategoriesController> _logger;

    public ProductCategoriesController(
        IProductCategoryService categoryService,
        ILogger<ProductCategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    /// <summary>
    /// Get all approved product categories
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductCategoryDto>>> GetCategories()
    {
        var categories = await _categoryService.GetCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>
    /// Get category tree (hierarchical structure)
    /// </summary>
    [HttpGet("tree")]
    public async Task<ActionResult<IEnumerable<ProductCategoryDto>>> GetCategoryTree()
    {
        var tree = await _categoryService.GetCategoryTreeAsync();
        return Ok(tree);
    }

    /// <summary>
    /// Get main categories (root level)
    /// </summary>
    [HttpGet("main")]
    public async Task<ActionResult<IEnumerable<ProductCategoryDto>>> GetMainCategories()
    {
        var categories = await _categoryService.GetMainCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>
    /// Get category by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductCategoryDto>> GetCategory(int id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null)
            return NotFound();

        return Ok(category);
    }

    /// <summary>
    /// Get sub-categories of a parent category
    /// </summary>
    [HttpGet("{id}/subcategories")]
    public async Task<ActionResult<IEnumerable<ProductCategoryDto>>> GetSubCategories(int id)
    {
        var categories = await _categoryService.GetSubCategoriesAsync(id);
        return Ok(categories);
    }

    /// <summary>
    /// Create a new category (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ProductCategoryDto>> CreateCategory([FromBody] CreateProductCategoryRequest request)
    {
        try
        {
            var category = await _categoryService.CreateCategoryAsync(request);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update a category (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<ProductCategoryDto>> UpdateCategory(int id, [FromBody] UpdateProductCategoryRequest request)
    {
        try
        {
            var category = await _categoryService.UpdateCategoryAsync(id, request);
            return Ok(category);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a category (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        try
        {
            var result = await _categoryService.DeleteCategoryAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // ── Category Requests ─────────────────────────────────────────────────────

    /// <summary>
    /// Request a new category (Any authenticated user)
    /// </summary>
    [HttpPost("request")]
    [Authorize]
    public async Task<ActionResult<CategoryRequestDto>> RequestCategory([FromBody] CreateCategoryRequestRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var userId = int.Parse(userIdClaim);

        try
        {
            var categoryRequest = await _categoryService.CreateCategoryRequestAsync(userId, request);
            return Ok(categoryRequest);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Get all category requests (Admin only)
    /// </summary>
    [HttpGet("requests")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<IEnumerable<CategoryRequestDto>>> GetCategoryRequests([FromQuery] string? status = null)
    {
        var requests = await _categoryService.GetCategoryRequestsAsync(status);
        return Ok(requests);
    }

    /// <summary>
    /// Get category request by ID (Admin only)
    /// </summary>
    [HttpGet("requests/{id}")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<CategoryRequestDto>> GetCategoryRequest(int id)
    {
        var request = await _categoryService.GetCategoryRequestByIdAsync(id);
        if (request == null)
            return NotFound();

        return Ok(request);
    }

    /// <summary>
    /// Review a category request - approve or reject (Admin only)
    /// </summary>
    [HttpPut("requests/{id}/review")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<CategoryRequestDto>> ReviewCategoryRequest(int id, [FromBody] ReviewCategoryRequestRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var reviewerUserId = int.Parse(userIdClaim);

        try
        {
            var result = await _categoryService.ReviewCategoryRequestAsync(id, reviewerUserId, request);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
