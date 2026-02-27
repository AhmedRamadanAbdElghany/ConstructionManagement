using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs.LocationTracking;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for worker location tracking operations
/// </summary>
[ApiController]
[Route("api/location-tracking")]
[Authorize]
public class LocationTrackingController : BaseApiController
{
    private readonly ILocationTrackingService _locationTrackingService;

    public LocationTrackingController(ILocationTrackingService locationTrackingService)
    {
        _locationTrackingService = locationTrackingService;
    }

    #region Company Settings (Admin)

    /// <summary>
    /// Gets the location tracking settings for the current company
    /// </summary>
    [HttpGet("settings")]
    [Authorize(Policy = "CanViewLocation")]
    public async Task<ActionResult<CompanyLocationSettingsDto>> GetSettings()
    {
        var settings = await _locationTrackingService.GetSettingsAsync();
        return Ok(settings);
    }

    /// <summary>
    /// Updates the location tracking settings for the current company
    /// </summary>
    [HttpPut("settings")]
    [Authorize(Policy = "CanViewLocation")]
    public async Task<ActionResult<CompanyLocationSettingsDto>> UpdateSettings([FromBody] UpdateLocationSettingsRequest request)
    {
        var settings = await _locationTrackingService.UpdateSettingsAsync(request);
        return Ok(settings);
    }

    #endregion

    #region Location Submission (Worker)

    /// <summary>
    /// Submits a location from a worker
    /// </summary>
    [HttpPost("submit")]
    public async Task<ActionResult<WorkerLocationDto>> SubmitLocation([FromBody] SubmitLocationRequest request)
    {
        var location = await _locationTrackingService.SubmitLocationAsync(request);
        return Ok(location);
    }

    /// <summary>
    /// Gets pending location requests for the current worker
    /// </summary>
    [HttpGet("my-requests")]
    public async Task<ActionResult<List<PendingLocationRequestDto>>> GetMyPendingRequests()
    {
        var requests = await _locationTrackingService.GetMyPendingRequestsAsync();
        return Ok(requests);
    }

    /// <summary>
    /// Gets location history for the current worker
    /// </summary>
    [HttpGet("my-history")]
    public async Task<ActionResult<WorkerLocationHistoryDto>> GetMyHistory(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var history = await _locationTrackingService.GetMyHistoryAsync(fromDate, toDate, page, pageSize);
        return Ok(history);
    }

    #endregion

    #region Location Management (Admin)

    /// <summary>
    /// Creates an on-demand location request for specified workers
    /// </summary>
    [HttpPost("request")]
    [Authorize(Policy = "CanViewLocation")]
    public async Task<ActionResult<LocationRequestDto>> CreateLocationRequest([FromBody] RequestLocationRequest request)
    {
        var locationRequest = await _locationTrackingService.CreateLocationRequestAsync(request);
        return Ok(locationRequest);
    }

    /// <summary>
    /// Gets all location requests for the company
    /// </summary>
    [HttpGet("requests")]
    [Authorize(Policy = "CanViewLocation")]
    public async Task<ActionResult<List<LocationRequestDto>>> GetLocationRequests(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int? status)
    {
        var requests = await _locationTrackingService.GetLocationRequestsAsync(fromDate, toDate, status);
        return Ok(requests);
    }

    /// <summary>
    /// Cancels a location request
    /// </summary>
    [HttpPut("requests/{id}/cancel")]
    [Authorize(Policy = "CanViewLocation")]
    public async Task<ActionResult> CancelLocationRequest(int id)
    {
        var result = await _locationTrackingService.CancelLocationRequestAsync(id);
        if (!result)
        {
            return NotFound(new { message = "Location request not found or cannot be cancelled" });
        }
        return Ok(new { message = "Location request cancelled successfully" });
    }

    /// <summary>
    /// Gets location status for all workers today
    /// </summary>
    [HttpGet("today")]
    [Authorize(Policy = "CanViewLocation")]
    public async Task<ActionResult<TodayLocationSummaryDto>> GetTodaySummary()
    {
        var summary = await _locationTrackingService.GetTodaySummaryAsync();
        return Ok(summary);
    }

    /// <summary>
    /// Gets location history for a specific worker
    /// </summary>
    [HttpGet("workers/{userId}/history")]
    [Authorize(Policy = "CanViewLocation")]
    public async Task<ActionResult<WorkerLocationHistoryDto>> GetWorkerHistory(
        int userId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var history = await _locationTrackingService.GetWorkerHistoryAsync(userId, fromDate, toDate, page, pageSize);
        return Ok(history);
    }

    /// <summary>
    /// Gets location status for a specific worker
    /// </summary>
    [HttpGet("workers/{userId}/status")]
    [Authorize(Policy = "CanViewLocation")]
    public async Task<ActionResult<WorkerLocationStatusDto>> GetWorkerStatus(int userId)
    {
        var status = await _locationTrackingService.GetWorkerStatusAsync(userId);
        return Ok(status);
    }

    #endregion
}
