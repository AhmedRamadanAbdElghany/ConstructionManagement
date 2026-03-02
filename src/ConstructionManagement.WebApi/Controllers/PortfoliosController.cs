using ConstructionManagement.Application.DTOs.Portfolio;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PortfoliosController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;

    public PortfoliosController(IPortfolioService portfolioService)
    {
        _portfolioService = portfolioService;
    }

    [HttpGet("company/{companyId}")]
    public async Task<ActionResult<IEnumerable<PortfolioCategoryDto>>> GetCompanyPortfolio(int companyId)
    {
        var portfolio = await _portfolioService.GetCompanyPortfolioStructureAsync(companyId);
        return Ok(portfolio);
    }

    [HttpGet("categories/{id}")]
    public async Task<ActionResult<PortfolioCategoryDto>> GetCategory(int id)
    {
        var category = await _portfolioService.GetCategoryAsync(id);
        return Ok(category);
    }

    [HttpPost("categories")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult<int>> CreateCategory(CreatePortfolioCategoryRequest request)
    {
        var id = await _portfolioService.CreateCategoryAsync(request);
        return CreatedAtAction(nameof(GetCategory), new { id }, id);
    }

    [HttpPut("categories/{id}")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> UpdateCategory(int id, UpdatePortfolioCategoryRequest request)
    {
        await _portfolioService.UpdateCategoryAsync(id, request);
        return NoContent();
    }

    [HttpDelete("categories/{id}")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        await _portfolioService.DeleteCategoryAsync(id);
        return NoContent();
    }

    [HttpGet("items/{id}")]
    public async Task<ActionResult<PortfolioItemDto>> GetItem(int id)
    {
        var item = await _portfolioService.GetItemAsync(id);
        return Ok(item);
    }

    [HttpPost("items")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult<int>> CreateItem([FromForm] CreatePortfolioItemRequest request)
    {
        var id = await _portfolioService.CreateItemAsync(request);
        return CreatedAtAction(nameof(GetItem), new { id }, id);
    }

    [HttpPut("items/{id}")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> UpdateItem(int id, [FromForm] UpdatePortfolioItemRequest request)
    {
        await _portfolioService.UpdateItemAsync(id, request);
        return NoContent();
    }

    [HttpDelete("items/{id}")]
    [Authorize(Roles = "CompanyAdmin,SystemAdmin")]
    public async Task<ActionResult> DeleteItem(int id)
    {
        await _portfolioService.DeleteItemAsync(id);
        return NoContent();
    }
}

