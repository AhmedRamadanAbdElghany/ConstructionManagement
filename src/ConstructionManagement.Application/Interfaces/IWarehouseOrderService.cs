using ConstructionManagement.Application.DTOs.WarehousePartner;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for warehouse order operations
/// </summary>
public interface IWarehouseOrderService
{
    /// <summary>
    /// Create a new warehouse order
    /// </summary>
    Task<WarehouseOrderRequest> CreateOrderAsync(CreateOrderRequest request, int companyUserId);

    /// <summary>
    /// Get order by ID
    /// </summary>
    Task<WarehouseOrderRequest?> GetOrderByIdAsync(int orderId);

    /// <summary>
    /// Get order by barcode
    /// </summary>
    Task<WarehouseOrderRequest?> GetOrderByBarcodeAsync(string barcode);

    /// <summary>
    /// Get orders for a company user
    /// </summary>
    Task<List<WarehouseOrderRequest>> GetOrdersForCompanyUserAsync(int companyUserId);

    /// <summary>
    /// Get orders for a warehouse owner
    /// </summary>
    Task<List<WarehouseOrderRequest>> GetOrdersForWarehouseOwnerAsync(int warehouseOwnerId);

    /// <summary>
    /// Update order status
    /// </summary>
    Task<WarehouseOrderRequest> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request, int userId);

    /// <summary>
    /// Generate a unique barcode
    /// </summary>
    Task<string> GenerateBarcodeAsync(int orderId);
}
