using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("")]
[Authorize]
public class PhasesController : ControllerBase
{
    private readonly IPhaseService _phaseService;

    public PhasesController(IPhaseService phaseService)
    {
        _phaseService = phaseService;
    }

    // --- Project Phases ---

    [HttpGet("api/projects/{projectId}/phases")]
    public async Task<IActionResult> GetProjectPhases(int projectId)
    {
        var phases = await _phaseService.GetProjectPhasesAsync(projectId);
        return Ok(phases);
    }

    [HttpPost("api/projects/{projectId}/phases")]
    public async Task<IActionResult> CreateProjectPhase(int projectId, [FromBody] CreatePhaseRequest request)
    {
        var phaseId = await _phaseService.CreateProjectPhaseAsync(projectId, request);
        return Ok(new { id = phaseId });
    }

    [HttpPut("api/phases/{phaseId}")]
    public async Task<IActionResult> UpdateProjectPhase(int phaseId, [FromBody] UpdatePhaseRequest request)
    {
        await _phaseService.UpdatePhaseAsync(phaseId, request);
        return NoContent();
    }

    [HttpDelete("api/phases/{phaseId}")]
    public async Task<IActionResult> DeleteProjectPhase(int phaseId)
    {
        await _phaseService.DeletePhaseAsync(phaseId);
        return NoContent();
    }

    [HttpPost("api/projects/{projectId}/phases/initialize-from-defaults")]
    public async Task<IActionResult> InitializePhases(int projectId, [FromBody] InitializePhasesRequest request)
    {
        if (request?.CompanyId == null) return BadRequest("CompanyId is required");
        
        await _phaseService.InitializeProjectPhasesAsync(projectId, request.CompanyId.Value);
        return Ok();
    }

    [HttpDelete("api/projects/{projectId}/phases")]
    public async Task<IActionResult> ClearProjectPhases(int projectId)
    {
        await _phaseService.ClearProjectPhasesAsync(projectId);
        return NoContent();
    }

    // --- Company Default Phases (Templates) ---

    [HttpGet("api/companies/{companyId}/default-phases")]
    [Authorize(Policy = "CanManageUsers")] // Assuming CompanyAdmin/SystemAdmin can manage settings
    public async Task<IActionResult> GetDefaultPhases(int companyId)
    {
        var phases = await _phaseService.GetDefaultPhasesAsync(companyId);
        return Ok(phases);
    }

    [HttpPost("api/companies/{companyId}/default-phases")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> CreateDefaultPhase(int companyId, [FromBody] CreatePhaseRequest request)
    {
        var phaseId = await _phaseService.CreateDefaultPhaseAsync(companyId, request);
        return Ok(new { id = phaseId });
    }

    [HttpPut("api/default-phases/{defaultPhaseId}")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> UpdateDefaultPhase(int defaultPhaseId, [FromBody] UpdatePhaseRequest request)
    {
        await _phaseService.UpdateDefaultPhaseAsync(defaultPhaseId, request);
        return NoContent();
    }

    [HttpDelete("api/default-phases/{defaultPhaseId}")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> DeleteDefaultPhase(int defaultPhaseId)
    {
        await _phaseService.DeleteDefaultPhaseAsync(defaultPhaseId);
        return NoContent();
    }

    [HttpDelete("api/companies/{companyId}/default-phases/clear")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> ClearDefaultPhases(int companyId)
    {
        await _phaseService.ClearDefaultPhasesAsync(companyId);
        return NoContent();
    }

    [HttpPost("api/default-phases/{defaultPhaseId}/reorder")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> ReorderDefaultPhase(int defaultPhaseId, [FromQuery] int direction)
    {
        await _phaseService.ReorderDefaultPhaseAsync(defaultPhaseId, direction);
        return NoContent();
    }

    [HttpPost("api/default-phases/{defaultPhaseId}/items")]
    [Authorize(Policy = "CanManageUsers")]
    public async Task<IActionResult> AddItemsToDefaultPhase(int defaultPhaseId, [FromBody] int[] catalogItemIds)
    {
        await _phaseService.AddItemsToDefaultPhaseAsync(defaultPhaseId, catalogItemIds);
        return Ok();
    }
}

