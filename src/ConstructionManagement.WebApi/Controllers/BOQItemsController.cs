using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[Route("api/projects/{projectId}/items")]
[ApiController]
public class BOQItemsController : ControllerBase
{
    private readonly IBOQItemService _service;

    public BOQItemsController(IBOQItemService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create(int projectId, [FromBody] CreateBOQItemRequest request)
    {
        var itemId = await _service.CreateBOQItemAsync(projectId, request, int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value));
        return CreatedAtAction(nameof(Get), new { projectId, itemId }, new { itemId });
    }

    [HttpGet("{itemId}")]
    public async Task<IActionResult> Get(int projectId, int itemId)
    {
        var item = await _service.GetBOQItemWithProgressAsync(itemId);
        return item != null ? Ok(item) : NotFound();
    }
}