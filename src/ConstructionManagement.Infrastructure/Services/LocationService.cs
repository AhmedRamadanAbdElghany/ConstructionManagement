using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.WarehousePartner;
using ConstructionManagement.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for location-based search operations
/// </summary>
public class LocationService : ILocationService
{
    private readonly IUserService _userService;

    public LocationService(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<List<UserDto>> SearchNearbyAsync(NearbySearchRequest request)
    {
        // Get all users (simplified implementation)
        var allUsers = await _userService.GetAllUsersAsync(0);

        // Return paginated results
        return allUsers
            .OrderBy(u => u.FullName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();
    }

    public async Task<double> CalculateDistanceAsync(double lat1, double lon1, double lat2, double lon2)
    {
        return CalculateDistance(lat1, lon1, lat2, lon2);
    }

    public async Task<UserDto> UpdateLocationAsync(int userId, double latitude, double longitude)
    {
        var user = await _userService.GetUserByIdAsync(userId, 0);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");

        return user;
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        // Haversine formula for calculating distance between two coordinates
        var R = 6371; // Earth's radius in kilometers
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
}
