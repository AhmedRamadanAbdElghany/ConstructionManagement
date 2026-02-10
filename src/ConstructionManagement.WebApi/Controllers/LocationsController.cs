using ConstructionManagement.Application.DTOs.WarehousePartner;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for location-based search operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly ILocationService _locationService;

    public LocationsController(ILocationService locationService)
    {
        _locationService = locationService;
    }

    /// <summary>
    /// Search for nearby service providers
    /// </summary>
    [HttpPost("search")]
    public async Task<IActionResult> SearchNearby([FromBody] NearbySearchRequest request)
    {
        var results = await _locationService.SearchNearbyAsync(request);
        return Ok(results);
    }

    /// <summary>
    /// Update user location
    /// </summary>
    [HttpPut("update-location")]
    public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationRequest request)
    {
        var result = await _locationService.UpdateLocationAsync(request.UserId, request.Latitude, request.Longitude);
        return Ok(result);
    }
}
