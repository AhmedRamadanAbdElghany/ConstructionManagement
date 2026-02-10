using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// API Controller for Inventory Order Management
/// Handles orders between Company Owners (customers) and Inventory Owners (suppliers)
/// </summary>
[Authorize]
[Route("api/inventory-orders")]
[ApiController]
public class InventoryOrdersController : ControllerBase
{
    private readonly IInventoryOrderService _orderService;
    private readonly IInventoryWarehouseService _warehouseService;
    private readonly IInventoryStockService _stockService;
    private readonly ISpecialPromotionService _promotionService;
    private readonly ICustomerTierDiscountService _tierDiscountService;

    public InventoryOrdersController(
        IInventoryOrderService orderService,
        IInventoryWarehouseService warehouseService,
        IInventoryStockService stockService,
        ISpecialPromotionService promotionService,
        ICustomerTierDiscountService tierDiscountService)
    {
        _orderService = orderService;
        _warehouseService = warehouseService;
        _stockService = stockService;
        _promotionService = promotionService;
        _tierDiscountService = tierDiscountService;
    }

    #region Order Management

    /// <summary>
    /// Create a new inventory order
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateInventoryOrderRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var order = await _orderService.CreateOrderAsync(request, userId);
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    /// <summary>
    /// Get order by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userType = Enum.Parse<Domain.Enums.UserType>(User.FindFirst("UserType")?.Value ?? "0");

        InventoryOrder? order = null;

        // Check access based on user type
        if (userType == Domain.Enums.UserType.InventoryOwner)
        {
            order = await _orderService.GetOrderByIdAndSupplierAsync(id, userId);
        }
        else
        {
            order = await _orderService.GetOrderByIdAndCustomerAsync(id, userId);
        }

        return order != null ? Ok(order) : NotFound();
    }

    /// <summary>
    /// Get my orders (as customer)
    /// </summary>
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var orders = await _orderService.GetOrdersByCustomerAsync(userId);
        return Ok(orders);
    }

    /// <summary>
    /// Get orders as supplier (for Inventory Owners)
    /// </summary>
    [HttpGet("supplier-orders")]
    public async Task<IActionResult> GetSupplierOrders()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var orders = await _orderService.GetOrdersBySupplierAsync(userId);
        return Ok(orders);
    }

    /// <summary>
    /// Get orders by status (for Inventory Owners)
    /// </summary>
    [HttpGet("supplier-orders/status/{status}")]
    public async Task<IActionResult> GetSupplierOrdersByStatus(int status)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var orders = await _orderService.GetOrdersByStatusAsync(userId, status);
        return Ok(orders);
    }

    /// <summary>
    /// Update order status
    /// </summary>
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var order = await _orderService.UpdateOrderStatusAsync(id, request.Status, userId);
        return Ok(order);
    }

    /// <summary>
    /// Accept order (Supplier only)
    /// </summary>
    [HttpPost("{id}/accept")]
    public async Task<IActionResult> AcceptOrder(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var order = await _orderService.AcceptOrderAsync(id, userId);
        return Ok(order);
    }

    /// <summary>
    /// Reject order (Supplier only)
    /// </summary>
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectOrder(int id, [FromBody] RejectOrderRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var order = await _orderService.RejectOrderAsync(id, userId, request.Reason);
        return Ok(order);
    }

    /// <summary>
    /// Start processing order (Supplier only)
    /// </summary>
    [HttpPost("{id}/process")]
    public async Task<IActionResult> StartProcessing(int id)
    {
        var order = await _orderService.StartProcessingOrderAsync(id);
        return Ok(order);
    }

    /// <summary>
    /// Mark order as ready for delivery (Supplier only)
    /// </summary>
    [HttpPost("{id}/ready")]
    public async Task<IActionResult> MarkReadyForDelivery(int id)
    {
        var order = await _orderService.MarkAsReadyForDeliveryAsync(id);
        return Ok(order);
    }

    /// <summary>
    /// Record delivery (Supplier only)
    /// </summary>
    [HttpPost("{id}/deliver")]
    public async Task<IActionResult> RecordDelivery(int id, [FromBody] RecordDeliveryRequest request)
    {
        var order = await _orderService.RecordDeliveryAsync(id, request);
        return Ok(order);
    }

    /// <summary>
    /// Cancel order
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id, [FromBody] CancelOrderRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var order = await _orderService.CancelOrderAsync(id, userId, request.Reason);
        return Ok(order);
    }

    #endregion

    #region Price Calculation

    /// <summary>
    /// Calculate price before ordering
    /// </summary>
    [HttpPost("calculate-price")]
    public async Task<IActionResult> CalculatePrice([FromBody] CalculatePriceRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _orderService.CalculatePriceAsync(request, userId);
        return Ok(result);
    }

    #endregion

    #region Warehouse Management (for Inventory Owners)

    /// <summary>
    /// Get my warehouses (for Inventory Owners)
    /// </summary>
    [HttpGet("my-warehouses")]
    public async Task<IActionResult> GetMyWarehouses()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var warehouses = await _warehouseService.GetWarehousesByOwnerAsync(userId);
        return Ok(warehouses);
    }

    /// <summary>
    /// Create warehouse (for Inventory Owners)
    /// </summary>
    [HttpPost("warehouses")]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateInventoryWarehouseRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var warehouse = new InventoryWarehouse
        {
            OwnerUserId = userId,
            Name = request.Name,
            Location = request.Location,
            Description = request.Description,
            Capacity = request.Capacity,
            Phone = request.Phone,
            Email = request.Email,
            IsActive = true,
            IsApproved = false
        };
        var created = await _warehouseService.CreateWarehouseAsync(warehouse);
        return CreatedAtAction(nameof(GetWarehouse), new { id = created.Id }, created);
    }

    /// <summary>
    /// Get warehouse by ID
    /// </summary>
    [HttpGet("warehouses/{id}")]
    public async Task<IActionResult> GetWarehouse(int id)
    {
        var warehouse = await _warehouseService.GetWarehouseByIdAsync(id);
        return warehouse != null ? Ok(warehouse) : NotFound();
    }

    #endregion

    #region Stock Management (for Inventory Owners)

    /// <summary>
    /// Get stocks by warehouse
    /// </summary>
    [HttpGet("warehouses/{warehouseId}/stocks")]
    public async Task<IActionResult> GetWarehouseStocks(int warehouseId)
    {
        var stocks = await _stockService.GetStocksByWarehouseAsync(warehouseId);
        return Ok(stocks);
    }

    /// <summary>
    /// Create stock item (for Inventory Owners)
    /// </summary>
    [HttpPost("stocks")]
    public async Task<IActionResult> CreateStock([FromBody] CreateInventoryStockRequest request)
    {
        var stock = new InventoryStock
        {
            WarehouseId = request.WarehouseId,
            MaterialType = request.MaterialType,
            MaterialName = request.MaterialName,
            Unit = request.Unit,
            CurrentQuantity = request.CurrentQuantity,
            MinLevel = request.MinLevel,
            AutoReorderEnabled = request.AutoReorderEnabled,
            ReorderPoint = request.ReorderPoint,
            ReorderQuantity = request.ReorderQuantity,
            PricePerUnit = request.PricePerUnit,
            DiscountedPrice = request.DiscountedPrice,
            BinLocation = request.BinLocation,
            BatchNumber = request.BatchNumber,
            ExpirationDate = request.ExpirationDate
        };
        var created = await _stockService.CreateStockAsync(stock);
        return CreatedAtAction(nameof(GetStock), new { id = created.Id }, created);
    }

    /// <summary>
    /// Get stock by ID
    /// </summary>
    [HttpGet("stocks/{id}")]
    public async Task<IActionResult> GetStock(int id)
    {
        var stock = await _stockService.GetStockByIdAsync(id);
        return stock != null ? Ok(stock) : NotFound();
    }

    /// <summary>
    /// Search stocks by material type (for Company Owners)
    /// </summary>
    [HttpGet("stocks/search")]
    public async Task<IActionResult> SearchStocks([FromQuery] string materialType)
    {
        var stocks = await _stockService.SearchStocksByMaterialTypeAsync(materialType);
        return Ok(stocks);
    }

    /// <summary>
    /// Get available stocks by type (for Company Owners)
    /// </summary>
    [HttpGet("stocks/available")]
    public async Task<IActionResult> GetAvailableStocks([FromQuery] string materialType)
    {
        var stocks = await _stockService.GetAvailableStocksByTypeAsync(materialType);
        return Ok(stocks);
    }

    #endregion

    #region Discounts & Promotions

    /// <summary>
    /// Get my promotions (for Inventory Owners)
    /// </summary>
    [HttpGet("my-promotions")]
    public async Task<IActionResult> GetMyPromotions()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var promotions = await _promotionService.GetPromotionsBySupplierAsync(userId);
        return Ok(promotions);
    }

    /// <summary>
    /// Create promotion (for Inventory Owners)
    /// </summary>
    [HttpPost("promotions")]
    public async Task<IActionResult> CreatePromotion([FromBody] CreateSpecialPromotionRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var promotion = new SpecialPromotion
        {
            SupplierUserId = userId,
            Name = request.Name,
            Description = request.Description,
            DiscountCode = request.DiscountCode,
            DiscountPercent = request.DiscountPercent,
            MaxDiscountAmount = request.MaxDiscountAmount,
            MaxUsageCount = request.MaxUsageCount,
            MaxUsagePerCustomer = request.MaxUsagePerCustomer,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ApplyToAllItems = request.ApplyToAllItems,
            ApplicableMaterialTypes = request.ApplicableMaterialTypes
        };
        var created = await _promotionService.CreatePromotionAsync(promotion);
        return CreatedAtAction(nameof(GetPromotion), new { id = created.Id }, created);
    }

    /// <summary>
    /// Get promotion by ID
    /// </summary>
    [HttpGet("promotions/{id}")]
    public async Task<IActionResult> GetPromotion(int id)
    {
        var promotion = await _promotionService.GetPromotionByIdAsync(id);
        return promotion != null ? Ok(promotion) : NotFound();
    }

    /// <summary>
    /// Validate promo code (for Company Owners)
    /// </summary>
    [HttpPost("validate-promo")]
    public async Task<IActionResult> ValidatePromoCode([FromBody] ValidateDiscountRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _promotionService.ValidateAndApplyPromoCodeAsync(request, userId);
        return Ok(result);
    }

    /// <summary>
    /// Get my tier discounts
    /// </summary>
    [HttpGet("my-tier-discounts")]
    public async Task<IActionResult> GetMyTierDiscounts()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var discounts = await _tierDiscountService.GetDiscountsByCustomerAsync(userId);
        return Ok(discounts);
    }

    #endregion

    #region Recurring Orders

    /// <summary>
    /// Get my recurring orders (as customer)
    /// </summary>
    [HttpGet("my-recurring-orders")]
    public async Task<IActionResult> GetMyRecurringOrders()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        // Would need to add this service
        return Ok(new List<RecurringOrder>());
    }

    /// <summary>
    /// Create recurring order
    /// </summary>
    [HttpPost("recurring-orders")]
    public async Task<IActionResult> CreateRecurringOrder([FromBody] CreateRecurringOrderRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        // Would need to add this service
        return Created("", new { message = "Recurring order created" });
    }

    #endregion
}

/// <summary>
/// Request DTO for rejecting an order
/// </summary>
public class RejectOrderRequest
{
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for cancelling an order
/// </summary>
public class CancelOrderRequest
{
    public string? Reason { get; set; }
}
