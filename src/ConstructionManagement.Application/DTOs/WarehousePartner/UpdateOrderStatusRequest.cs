using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs.WarehousePartner;

/// <summary>
/// Request to update order status
/// </summary>
public record UpdateOrderStatusRequest(
    OrderStatus NewStatus,
    string? Notes,
    double? Latitude,
    double? Longitude
);
