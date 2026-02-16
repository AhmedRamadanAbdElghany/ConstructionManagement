using ConstructionManagement.Application.DTOs.WarehousePartner;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for warehouse order operations
/// </summary>
public class WarehouseOrderService : IWarehouseOrderService
{
    private readonly IUserService _userService;
    private readonly IProjectService _projectService;

    public WarehouseOrderService(IUserService userService, IProjectService projectService)
    {
        _userService = userService;
        _projectService = projectService;
    }

    public async Task<WarehouseOrderRequest> CreateOrderAsync(CreateOrderRequest request, int companyUserId)
    {
        var order = new WarehouseOrderRequest
        {
            OrderNumber = await GenerateOrderNumberAsync(),
            Barcode = await GenerateBarcodeAsync(0),
            RequestedByUserId = companyUserId,
            WarehouseOwnerId = request.WarehouseOwnerId,
            ProjectId = request.ProjectId ?? 0,
            DeliveryAddress = request.DeliveryAddress,
            DeliveryLatitude = request.DeliveryLatitude,
            DeliveryLongitude = request.DeliveryLongitude,
            Status = OrderStatus.Pending,
            RequestDate = DateTime.UtcNow
        };

        foreach (var item in request.Items)
        {
            order.Items.Add(new WarehouseOrderItem
            {
                ItemName = item.ItemName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.Quantity * item.UnitPrice,
                Unit = item.Unit,
                Description = item.Description
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.TotalPrice);

        // Regenerate barcode with order ID
        order.Barcode = await GenerateBarcodeAsync(order.Id);

        return order;
    }

    public Task<WarehouseOrderRequest?> GetOrderByIdAsync(int orderId)
    {
        // Implementation would use repository
        return Task.FromResult<WarehouseOrderRequest?>(null);
    }

    public Task<WarehouseOrderRequest?> GetOrderByBarcodeAsync(string barcode)
    {
        // Implementation would use repository
        return Task.FromResult<WarehouseOrderRequest?>(null);
    }

    public Task<List<WarehouseOrderRequest>> GetOrdersForCompanyUserAsync(int companyUserId)
    {
        // Implementation would use repository
        return Task.FromResult(new List<WarehouseOrderRequest>());
    }

    public Task<List<WarehouseOrderRequest>> GetOrdersForWarehouseOwnerAsync(int warehouseOwnerId)
    {
        // Implementation would use repository
        return Task.FromResult(new List<WarehouseOrderRequest>());
    }

    public async Task<WarehouseOrderRequest> UpdateOrderStatusAsync(int orderId, UpdateWarehouseOrderStatusRequest request, int userId)
    {
        var order = await GetOrderByIdAsync(orderId);
        if (order == null)
            throw new KeyNotFoundException($"Order with ID {orderId} not found");

        var previousStatus = order.Status;
        order.Status = request.NewStatus;

        // Add status history
        order.StatusHistory.Add(new OrderStatusHistory
        {
            OrderId = orderId,
            PreviousStatus = previousStatus,
            NewStatus = request.NewStatus,
            ChangedByUserId = userId,
            Notes = request.Notes,
            ChangedAt = DateTime.UtcNow,
            Latitude = request.Latitude,
            Longitude = request.Longitude
        });

        // Update delivered date if delivered
        if (request.NewStatus == OrderStatus.Delivered)
        {
            order.DeliveredAt = DateTime.UtcNow;
        }

        return order;
    }

    public Task<string> GenerateBarcodeAsync(int orderId)
    {
        // Generate unique barcode: ORD-YYYYMMDD-XXXXXXXX
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
        var uniqueId = Guid.NewGuid().ToString("N")[..8].ToUpper();
        return Task.FromResult($"ORD-{timestamp}-{uniqueId}");
    }

    private Task<string> GenerateOrderNumberAsync()
    {
        // Generate order number: ORD-YYYYMMDD-XXXX
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
        var random = new Random().Next(1000, 9999);
        return Task.FromResult($"ORD-{timestamp}-{random}");
    }
}
