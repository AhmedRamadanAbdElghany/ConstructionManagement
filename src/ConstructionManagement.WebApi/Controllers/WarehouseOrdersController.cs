using ConstructionManagement.Application.DTOs.WarehousePartner;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// Controller for warehouse order operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class WarehouseOrdersController : ControllerBase
{
    private readonly IWarehouseOrderService _orderService;

    public WarehouseOrdersController(IWarehouseOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Create a new warehouse order
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetCurrentUserId();
        var order = await _orderService.CreateOrderAsync(request, userId);
        return Ok(order);
    }

    /// <summary>
    /// Get order by barcode
    /// </summary>
    [HttpGet("barcode/{barcode}")]
    public async Task<IActionResult> GetOrderByBarcode(string barcode)
    {
        var order = await _orderService.GetOrderByBarcodeAsync(barcode);
        if (order == null) return NotFound();
        return Ok(order);
    }

    /// <summary>
    /// Get order by ID
    /// </summary>
    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrder(int orderId)
    {
        var order = await _orderService.GetOrderByIdAsync(orderId);
        if (order == null) return NotFound();
        return Ok(order);
    }

    /// <summary>
    /// Update order status
    /// </summary>
    [HttpPut("{orderId}/status")]
    public async Task<IActionResult> UpdateStatus(int orderId, [FromBody] UpdateWarehouseOrderStatusRequest request)
    {
        var userId = GetCurrentUserId();
        var order = await _orderService.UpdateOrderStatusAsync(orderId, request, userId);
        return Ok(order);
    }

    /// <summary>
    /// Get orders for current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetCurrentUserId();
        var orders = await _orderService.GetOrdersForCompanyUserAsync(userId);
        return Ok(orders);
    }

    private int GetCurrentUserId()
    {
        // Implementation would get user ID from claims
        return 1;
    }
}
