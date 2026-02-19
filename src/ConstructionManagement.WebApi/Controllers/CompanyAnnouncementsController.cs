using ConstructionManagement.Application.DTOs.CompanyAnnouncement;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CompanyAnnouncementsController : ControllerBase
{
    private readonly ICompanyAnnouncementService _service;

    public CompanyAnnouncementsController(ICompanyAnnouncementService service)
    {
        _service = service;
    }

    // ── Public: Anyone can view announcements / subscribe ────────────────────

    [HttpGet("company/{companyId}")]
    public async Task<ActionResult<IEnumerable<CompanyAnnouncementDto>>> GetByCompany(int companyId)
    {
        var result = await _service.GetCompanyAnnouncementsAsync(companyId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyAnnouncementDto>> GetById(int id)
    {
        var result = await _service.GetAnnouncementAsync(id);
        return Ok(result);
    }

    [HttpGet("company/{companyId}/subscribed")]
    public async Task<ActionResult<bool>> IsSubscribed(int companyId)
    {
        var result = await _service.IsSubscribedAsync(companyId);
        return Ok(result);
    }

    [HttpGet("company/{companyId}/subscribers")]
    public async Task<ActionResult<int>> SubscriberCount(int companyId)
    {
        var result = await _service.GetSubscriberCountAsync(companyId);
        return Ok(result);
    }

    [HttpPost("company/{companyId}/subscribe")]
    public async Task<ActionResult> Subscribe(int companyId)
    {
        await _service.SubscribeAsync(companyId);
        return Ok();
    }

    [HttpDelete("company/{companyId}/subscribe")]
    public async Task<ActionResult> Unsubscribe(int companyId)
    {
        await _service.UnsubscribeAsync(companyId);
        return NoContent();
    }

    // ── Company Admin: manage announcements ─────────────────────────────────
    
    [HttpPost]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult<int>> Create([FromForm] CreateAnnouncementRequest request)
    {
        var id = await _service.CreateAnnouncementAsync(request);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult> Update(int id, [FromForm] UpdateAnnouncementRequest request)
    {
        await _service.UpdateAnnouncementAsync(id, request);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "CompanyAdmin,SuperAdmin")]
    public async Task<ActionResult> Delete(int id)
    {
        await _service.DeleteAnnouncementAsync(id);
        return NoContent();
    }
}
