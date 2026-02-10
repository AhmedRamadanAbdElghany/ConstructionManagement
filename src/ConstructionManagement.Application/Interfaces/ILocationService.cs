using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.WarehousePartner;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for location-based search operations
/// </summary>
public interface ILocationService
{
    /// <summary>
    /// Search for nearby service providers
    /// </summary>
    Task<List<UserDto>> SearchNearbyAsync(NearbySearchRequest request);

    /// <summary>
    /// Calculate distance between two coordinates
    /// </summary>
    Task<double> CalculateDistanceAsync(double lat1, double lon1, double lat2, double lon2);

    /// <summary>
    /// Update user location
    /// </summary>
    Task<UserDto> UpdateLocationAsync(int userId, double latitude, double longitude);
}
