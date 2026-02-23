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
    Task<WarehouseOrderRequest> UpdateOrderStatusAsync(int orderId, UpdateWarehouseOrderStatusRequest request, int userId);

    /// <summary>
    /// Generate a unique barcode
    /// </summary>
    Task<string> GenerateBarcodeAsync(int orderId);

    #region Marketplace Order Methods

    /// <summary>
    /// Create a marketplace order from the public marketplace
    /// </summary>
    Task<MarketplaceOrderDto> CreateMarketplaceOrderAsync(int customerId, CreateMarketplaceOrderDto dto);

    /// <summary>
    /// Get orders for a customer
    /// </summary>
    Task<IEnumerable<MarketplaceOrderDto>> GetCustomerOrdersAsync(int customerId, string? status = null);

    /// <summary>
    /// Get orders for a vendor/warehouse
    /// </summary>
    Task<IEnumerable<MarketplaceOrderDto>> GetVendorOrdersAsync(int vendorCompanyId, string? status = null);

    /// <summary>
    /// Update order status (vendor operation)
    /// </summary>
    Task<MarketplaceOrderDto> UpdateOrderStatusAsync(int orderId, int vendorCompanyId, string status, string? notes = null);

    /// <summary>
    /// Cancel an order (customer operation)
    /// </summary>
    Task<MarketplaceOrderDto> CancelOrderAsync(int orderId, int customerId, string? reason = null);

    /// <summary>
    /// Confirm delivery (customer operation)
    /// </summary>
    Task<MarketplaceOrderDto> ConfirmDeliveryAsync(int orderId, int customerId);

    #endregion
}

/// <summary>
/// DTO for marketplace orders
/// </summary>
public class MarketplaceOrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal Total { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentStatus { get; set; }
    public string? DeliveryAddress { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
}

public class CreateMarketplaceOrderDto
{
    public int VendorId { get; set; }
    public List<CreateOrderItemDto> Items { get; set; } = new();
    public string? DeliveryAddress { get; set; }
    public double? DeliveryLatitude { get; set; }
    public double? DeliveryLongitude { get; set; }
    public string? Notes { get; set; }
    public string? PaymentMethod { get; set; }
}

public class CreateOrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
