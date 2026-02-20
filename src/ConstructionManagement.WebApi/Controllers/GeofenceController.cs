using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs.LocationTracking;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for managing geofence zones and tracking worker presence
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GeofenceController : BaseApiController
{
    private readonly IGeofenceService _geofenceService;

    public GeofenceController(IGeofenceService geofenceService)
    {
        _geofenceService = geofenceService;
    }

    #region Zone Management

    /// <summary>
    /// Gets all geofence zones for the company
    /// </summary>
    [HttpGet("zones")]
    [Authorize(Policy = "RequireCompanyUser")]
    public async Task<ActionResult<List<GeofenceZoneDto>>> GetZones([FromQuery] bool? activeOnly = null)
    {
        var zones = await _geofenceService.GetZonesAsync(activeOnly);
        return Ok(zones);
    }

    /// <summary>
    /// Gets a specific geofence zone
    /// </summary>
    [HttpGet("zones/{zoneId}")]
    [Authorize(Policy = "RequireCompanyUser")]
    public async Task<ActionResult<GeofenceZoneDto>> GetZone(int zoneId)
    {
        var zone = await _geofenceService.GetZoneAsync(zoneId);
        if (zone == null)
        {
            return NotFound(new { message = "Zone not found" });
        }
        return Ok(zone);
    }

    /// <summary>
    /// Creates a new geofence zone
    /// </summary>
    [HttpPost("zones")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<ActionResult<GeofenceZoneDto>> CreateZone([FromBody] CreateGeofenceZoneRequest request)
    {
        try
        {
            var zone = await _geofenceService.CreateZoneAsync(request);
            return CreatedAtAction(nameof(GetZone), new { zoneId = zone.Id }, zone);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Updates a geofence zone
    /// </summary>
    [HttpPut("zones/{zoneId}")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<ActionResult<GeofenceZoneDto>> UpdateZone(int zoneId, [FromBody] UpdateGeofenceZoneRequest request)
    {
        try
        {
            var zone = await _geofenceService.UpdateZoneAsync(zoneId, request);
            return Ok(zone);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deletes a geofence zone
    /// </summary>
    [HttpDelete("zones/{zoneId}")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<ActionResult> DeleteZone(int zoneId)
    {
        var deleted = await _geofenceService.DeleteZoneAsync(zoneId);
        if (!deleted)
        {
            return NotFound(new { message = "Zone not found" });
        }
        return NoContent();
    }

    #endregion

    #region Worker Assignments

    /// <summary>
    /// Assigns workers to a zone
    /// </summary>
    [HttpPost("zones/{zoneId}/workers")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<ActionResult<List<WorkerZoneAssignmentDto>>> AssignWorkers(int zoneId, [FromBody] AssignWorkersToZoneRequest request)
    {
        try
        {
            var assignments = await _geofenceService.AssignWorkersAsync(zoneId, request);
            return Ok(assignments);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Removes a worker from a zone
    /// </summary>
    [HttpDelete("zones/{zoneId}/workers/{userId}")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<ActionResult> RemoveWorker(int zoneId, int userId)
    {
        var removed = await _geofenceService.RemoveWorkerAsync(zoneId, userId);
        if (!removed)
        {
            return NotFound(new { message = "Assignment not found" });
        }
        return NoContent();
    }

    /// <summary>
    /// Gets workers assigned to a zone
    /// </summary>
    [HttpGet("zones/{zoneId}/workers")]
    [Authorize(Policy = "RequireCompanyUser")]
    public async Task<ActionResult<List<WorkerZoneAssignmentDto>>> GetZoneWorkers(int zoneId)
    {
        var workers = await _geofenceService.GetZoneWorkersAsync(zoneId);
        return Ok(workers);
    }

    /// <summary>
    /// Gets zones assigned to the current worker
    /// </summary>
    [HttpGet("my-zones")]
    [Authorize(Policy = "RequireWorker")]
    public async Task<ActionResult<List<WorkerAssignedZoneDto>>> GetMyZones()
    {
        // Get current user ID from claims
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new { message = "Invalid user context" });
        }

        try
        {
            var zones = await _geofenceService.GetWorkerZonesAsync(userId);
            return Ok(zones);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Gets zones assigned to a specific worker (admin view)
    /// </summary>
    [HttpGet("workers/{userId}/zones")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<ActionResult<List<WorkerAssignedZoneDto>>> GetWorkerZones(int userId)
    {
        try
        {
            var zones = await _geofenceService.GetWorkerZonesAsync(userId);
            return Ok(zones);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Events

    /// <summary>
    /// Gets geofence events history
    /// </summary>
    [HttpGet("events")]
    [Authorize(Policy = "RequireCompanyUser")]
    public async Task<ActionResult<GeofenceEventHistoryDto>> GetEvents(
        [FromQuery] int? zoneId = null,
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var events = await _geofenceService.GetEventsAsync(zoneId, userId, fromDate, toDate, page, pageSize);
        return Ok(events);
    }

    /// <summary>
    /// Gets today's geofence events
    /// </summary>
    [HttpGet("events/today")]
    [Authorize(Policy = "RequireCompanyUser")]
    public async Task<ActionResult<List<GeofenceEventDto>>> GetTodayEvents([FromQuery] int? zoneId = null)
    {
        var events = await _geofenceService.GetTodayEventsAsync(zoneId);
        return Ok(events);
    }

    #endregion

    #region Worker Status

    /// <summary>
    /// Gets all workers' zone status
    /// </summary>
    [HttpGet("workers/status")]
    [Authorize(Policy = "RequireCompanyUser")]
    public async Task<ActionResult<WorkersZoneSummaryDto>> GetWorkersZoneStatus()
    {
        var status = await _geofenceService.GetWorkersZoneStatusAsync();
        return Ok(status);
    }

    /// <summary>
    /// Gets a specific worker's zone status
    /// </summary>
    [HttpGet("workers/{userId}/status")]
    [Authorize(Policy = "RequireCompanyUser")]
    public async Task<ActionResult<WorkerZoneStatusDto>> GetWorkerZoneStatus(int userId)
    {
        try
        {
            var status = await _geofenceService.GetWorkerZoneStatusAsync(userId);
            return Ok(status);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Gets the current worker's zone status
    /// </summary>
    [HttpGet("my-status")]
    [Authorize(Policy = "RequireWorker")]
    public async Task<ActionResult<WorkerZoneStatusDto>> GetMyZoneStatus()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new { message = "Invalid user context" });
        }

        try
        {
            var status = await _geofenceService.GetWorkerZoneStatusAsync(userId);
            return Ok(status);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    #endregion
}
