namespace ConstructionManagement.Application.DTOs.WarehousePartner;

/// <summary>
/// Request to create a new warehouse order
/// </summary>
public record CreateOrderRequest(
    int WarehouseOwnerId,
    int? ProjectId,
    string DeliveryAddress,
    double DeliveryLatitude,
    double DeliveryLongitude,
    List<OrderItemRequest> Items,
    string? Notes
);

/// <summary>
/// Order item request
/// </summary>
public record OrderItemRequest(
    string ItemName,
    int Quantity,
    decimal UnitPrice,
    string? Unit,
    string? Description
);
