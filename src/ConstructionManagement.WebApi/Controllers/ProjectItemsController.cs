using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[Route("api/projects/{projectId}/items")]
[ApiController]
public class ProjectItemsController : ControllerBase
{
    private readonly IProjectItemService _service;

    public ProjectItemsController(IProjectItemService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create(int projectId, [FromBody] CreateProjectItemRequest request)
    {
        var itemId = await _service.CreateProjectItemAsync(projectId, request, int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value));
        return CreatedAtAction(nameof(Get), new { projectId, itemId }, new { itemId });
    }

    [HttpGet("{itemId}")]
    public async Task<IActionResult> Get(int projectId, int itemId)
    {
        var item = await _service.GetProjectItemWithProgressAsync(itemId);
        return item != null ? Ok(item) : NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetProjectItems(int projectId)
    {
        var items = await _service.GetProjectItemsAsync(projectId);
        return Ok(items);
    }

    [HttpPut("{itemId}")]
    public async Task<IActionResult> Update(int projectId, int itemId, [FromBody] UpdateProjectItemRequest request)
    {
        await _service.UpdateProjectItemAsync(projectId, itemId, request);
        return NoContent();
    }

    [HttpDelete("{itemId}")]
    public async Task<IActionResult> Delete(int projectId, int itemId)
    {
        await _service.DeleteProjectItemAsync(projectId, itemId);
        return NoContent();
    }
}
