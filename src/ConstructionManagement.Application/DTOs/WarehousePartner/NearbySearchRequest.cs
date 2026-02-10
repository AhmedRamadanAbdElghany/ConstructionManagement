using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs.WarehousePartner;

/// <summary>
/// Request for searching nearby service providers
/// </summary>
public record NearbySearchRequest(
    double Latitude,
    double Longitude,
    double RadiusKm,
    UserType? UserType = null,
    string? Specialization = null,
    decimal? MinRating = null,
    int Page = 1,
    int PageSize = 20
);
