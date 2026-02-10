namespace ConstructionManagement.Application.DTOs.WarehousePartner;

/// <summary>
/// Request to update user location
/// </summary>
public record UpdateLocationRequest(
    int UserId,
    double Latitude,
    double Longitude
);
