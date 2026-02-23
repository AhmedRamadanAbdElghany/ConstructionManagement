using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.Marketplace;
using ConstructionManagement.Application.DTOs.Vendor;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

// Alias to resolve ambiguity
using MarketplaceOrderDto = ConstructionManagement.Application.Interfaces.MarketplaceOrderDto;
using CreateMarketplaceOrderDto = ConstructionManagement.Application.Interfaces.CreateMarketplaceOrderDto;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MarketplaceController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly IProductCategoryService _categoryService;
    private readonly ILocationService _locationService;
    private readonly IWarehouseOrderService _orderService;
    private readonly ICompanyContext _companyContext;

    public MarketplaceController(
        IVendorService vendorService,
        IProductCategoryService categoryService,
        ILocationService locationService,
        IWarehouseOrderService orderService,
        ICompanyContext companyContext)
    {
        _vendorService = vendorService;
        _categoryService = categoryService;
        _locationService = locationService;
        _orderService = orderService;
        _companyContext = companyContext;
    }

    #region Categories

    /// <summary>
    /// Get all active product categories (public marketplace view)
    /// </summary>
    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProductCategoryDto>>> GetCategories()
    {
        var categories = await _categoryService.GetCategoriesAsync(includeUnapproved: false);
        return Ok(categories);
    }

    /// <summary>
    /// Get category tree (hierarchical view)
    /// </summary>
    [HttpGet("categories/tree")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProductCategoryTreeDto>>> GetCategoryTree()
    {
        var tree = await _categoryService.GetCategoryTreeAsync();
        return Ok(tree);
    }

    #endregion

    #region Products

    /// <summary>
    /// Search products in marketplace with filters
    /// </summary>
    [HttpGet("products")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> SearchProducts(
        [FromQuery] int? categoryId = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] int? vendorId = null,
        [FromQuery] string? sortBy = "relevance",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (products, totalCount) = await _vendorService.SearchProductsAsync(
            categoryId, searchTerm, minPrice, maxPrice, vendorId, sortBy, page, pageSize);

        return Ok(new
        {
            products,
            pagination = new
            {
                currentPage = page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            }
        });
    }

    /// <summary>
    /// Get product details
    /// </summary>
    [HttpGet("products/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<VendorProductDetailDto>> GetProduct(int id)
    {
        var product = await _vendorService.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        return Ok(product);
    }

    /// <summary>
    /// Get products by category
    /// </summary>
    [HttpGet("categories/{categoryId}/products")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetProductsByCategory(
        int categoryId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (products, totalCount) = await _vendorService.GetProductsByCategoryAsync(categoryId, page, pageSize);

        return Ok(new
        {
            products,
            pagination = new
            {
                currentPage = page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            }
        });
    }

    #endregion

    #region Vendors

    /// <summary>
    /// Search nearby vendors/warehouses by location
    /// </summary>
    [HttpGet("vendors/nearby")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<NearbyVendorDto>>> GetNearbyVendors(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] double radiusKm = 10,
        [FromQuery] int? categoryId = null)
    {
        if (radiusKm < 0.1 || radiusKm > 100)
        {
            return BadRequest(new { message = "Radius must be between 0.1 and 100 km" });
        }

        var vendors = await _vendorService.GetNearbyVendorsAsync(latitude, longitude, radiusKm, categoryId);
        return Ok(vendors);
    }

    /// <summary>
    /// Get vendor/warehouse profile with products
    /// </summary>
    [HttpGet("vendors/{vendorId}")]
    [AllowAnonymous]
    public async Task<ActionResult<VendorProfileDto>> GetVendorProfile(int vendorId)
    {
        var vendor = await _vendorService.GetVendorProfileAsync(vendorId);
        if (vendor == null)
        {
            return NotFound(new { message = "Vendor not found" });
        }

        return Ok(vendor);
    }

    /// <summary>
    /// Get vendor's products
    /// </summary>
    [HttpGet("vendors/{vendorId}/products")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetVendorProducts(
        int vendorId,
        [FromQuery] int? categoryId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (products, totalCount) = await _vendorService.GetVendorProductsAsync(vendorId, categoryId, page, pageSize);

        return Ok(new
        {
            products,
            pagination = new
            {
                currentPage = page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            }
        });
    }

    /// <summary>
    /// Get vendor statistics (orders count, rating, etc.)
    /// </summary>
    [HttpGet("vendors/{vendorId}/stats")]
    [AllowAnonymous]
    public async Task<ActionResult<MarketplaceVendorStatsDto>> GetVendorStats(int vendorId)
    {
        var stats = await _vendorService.GetVendorStatsAsync(vendorId);
        return Ok(stats);
    }

    /// <summary>
    /// Get vendor reviews
    /// </summary>
    [HttpGet("vendors/{vendorId}/reviews")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetVendorReviews(
        int vendorId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var (reviews, totalCount) = await _vendorService.GetVendorReviewsAsync(vendorId, page, pageSize);

        return Ok(new
        {
            reviews,
            pagination = new
            {
                currentPage = page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            }
        });
    }

    #endregion

    #region Orders

    /// <summary>
    /// Create a new order from marketplace
    /// </summary>
    [HttpPost("orders")]
    public async Task<ActionResult<MarketplaceOrderDto>> CreateOrder([FromBody] CreateMarketplaceOrderDto dto)
    {
        var userId = GetCurrentUserId();

        try
        {
            var order = await _orderService.CreateMarketplaceOrderAsync(userId, dto);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get order details
    /// </summary>
    [HttpGet("orders/{id}")]
    public async Task<ActionResult<MarketplaceOrderDto>> GetOrder(int id)
    {
        var userId = GetCurrentUserId();
        var order = await _orderService.GetOrderByIdAsync(id);

        if (order == null)
        {
            return NotFound(new { message = "Order not found" });
        }

        // Authorization: Only buyer or vendor can view
        var companyId = _companyContext.CompanyId;
        // WarehouseOrderRequest has WarehouseId and RequestedByUserId properties
        if (order.RequestedByUserId != userId && order.WarehouseId != companyId)
        {
            var userRoles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
            if (!userRoles.Contains("SuperAdmin"))
            {
                return Forbid();
            }
        }

        return Ok(order);
    }

    /// <summary>
    /// Get current user's orders as customer
    /// </summary>
    [HttpGet("orders/my-orders")]
    public async Task<ActionResult<IEnumerable<MarketplaceOrderDto>>> GetMyOrders([FromQuery] string? status = null)
    {
        var userId = GetCurrentUserId();
        var orders = await _orderService.GetCustomerOrdersAsync(userId, status);
        return Ok(orders);
    }

    /// <summary>
    /// Get orders for vendor's warehouse
    /// </summary>
    [HttpGet("orders/vendor-orders")]
    [Authorize(Roles = "InventoryOwner,CompanyAdmin")]
    public async Task<ActionResult<IEnumerable<MarketplaceOrderDto>>> GetVendorOrders([FromQuery] string? status = null)
    {
        var companyId = _companyContext.CompanyId;
        if (companyId == null)
        {
            return BadRequest(new { message = "No company context found" });
        }

        var orders = await _orderService.GetVendorOrdersAsync(companyId.Value, status);
        return Ok(orders);
    }

    /// <summary>
    /// Update order status (Vendor only)
    /// </summary>
    [HttpPut("orders/{id}/status")]
    [Authorize(Roles = "InventoryOwner,CompanyAdmin")]
    public async Task<ActionResult<MarketplaceOrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var companyId = _companyContext.CompanyId;
        if (companyId == null)
        {
            return BadRequest(new { message = "No company context found" });
        }

        try
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, companyId.Value, dto.Status, dto.Notes);
            return Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Cancel order (Customer only, before delivery)
    /// </summary>
    [HttpPost("orders/{id}/cancel")]
    public async Task<ActionResult<MarketplaceOrderDto>> CancelOrder(int id, [FromBody] CancelOrderDto? dto = null)
    {
        var userId = GetCurrentUserId();

        try
        {
            var order = await _orderService.CancelOrderAsync(id, userId, dto?.Reason);
            return Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Confirm order delivery (Customer only)
    /// </summary>
    [HttpPost("orders/{id}/confirm-delivery")]
    public async Task<ActionResult<MarketplaceOrderDto>> ConfirmDelivery(int id)
    {
        var userId = GetCurrentUserId();

        try
        {
            var order = await _orderService.ConfirmDeliveryAsync(id, userId);
            return Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    #endregion

    #region Reviews

    /// <summary>
    /// Submit a review for a completed order
    /// </summary>
    [HttpPost("orders/{orderId}/review")]
    public async Task<ActionResult<VendorReviewDto>> SubmitReview(int orderId, [FromBody] CreateVendorReviewDto dto)
    {
        var userId = GetCurrentUserId();

        try
        {
            var review = await _vendorService.CreateReviewAsync(userId, orderId, dto);
            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get review details
    /// </summary>
    [HttpGet("reviews/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<VendorReviewDto>> GetReview(int id)
    {
        var review = await _vendorService.GetReviewByIdAsync(id);
        if (review == null)
        {
            return NotFound(new { message = "Review not found" });
        }

        return Ok(review);
    }

    #endregion

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }
        return userId;
    }
}

#region DTOs

// Using DTOs from IVendorService and VendorProductDto

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CancelOrderDto
{
    public string? Reason { get; set; }
}

#endregion
