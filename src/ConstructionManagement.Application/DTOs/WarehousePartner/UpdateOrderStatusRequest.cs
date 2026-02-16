using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs.WarehousePartner;

/// <summary>
/// Request to update warehouse order status
/// </summary>
public record UpdateWarehouseOrderStatusRequest(
    OrderStatus NewStatus,
    string? Notes,
    double? Latitude,
    double? Longitude
);
