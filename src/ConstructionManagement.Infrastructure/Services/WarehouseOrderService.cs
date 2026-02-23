using ConstructionManagement.Application.DTOs.WarehousePartner;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for warehouse order operations
/// </summary>
public class WarehouseOrderService : IWarehouseOrderService
{
    private readonly IUserService _userService;
    private readonly IProjectService _projectService;
    private readonly IRepository<InventoryOrder> _orderRepository;
    private readonly IRepository<VendorProduct> _productRepository;
    private readonly IRepository<Vendor> _vendorRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public WarehouseOrderService(
        IUserService userService, 
        IProjectService projectService,
        IRepository<InventoryOrder> orderRepository,
        IRepository<VendorProduct> productRepository,
        IRepository<Vendor> vendorRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork)
    {
        _userService = userService;
        _projectService = projectService;
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _vendorRepository = vendorRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
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

    #region Marketplace Order Implementation

    public async Task<MarketplaceOrderDto> CreateMarketplaceOrderAsync(int customerId, CreateMarketplaceOrderDto dto)
    {
        // Validate customer
        var customer = await _userRepository.GetByIdAsync(customerId);
        if (customer == null)
            throw new InvalidOperationException("Customer not found");

        // Validate vendor
        var vendor = await _vendorRepository.GetByIdAsync(dto.VendorId);
        if (vendor == null || !vendor.IsActive)
            throw new InvalidOperationException("Vendor not found or inactive");

        // Validate products and calculate totals
        var orderItems = new List<InventoryOrderItem>();
        decimal subtotal = 0;

        foreach (var item in dto.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null || !product.IsActive)
                throw new InvalidOperationException($"Product {item.ProductId} not found or inactive");

            if (product.VendorId != dto.VendorId)
                throw new InvalidOperationException($"Product {item.ProductId} does not belong to vendor {dto.VendorId}");

            if (product.QuantityInStock < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}");

            var unitPrice = product.Price;
            var totalPrice = unitPrice * item.Quantity;
            subtotal += totalPrice;

            orderItems.Add(new InventoryOrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = totalPrice,
                Unit = product.Unit
            });

            // Update stock
            product.QuantityInStock -= item.Quantity;
            product.SalesCount += item.Quantity;
        }

        // Create order
        var order = new InventoryOrder
        {
            OrderNumber = await GenerateOrderNumberAsync(),
            VendorId = dto.VendorId,
            CustomerId = customerId,
            Status = InventoryOrder.OrderStatus.Pending,
            Subtotal = subtotal,
            SubTotal = subtotal,
            DeliveryFee = 0, // Could be calculated based on distance
            Total = subtotal,
            TotalAmount = subtotal,
            DeliveryAddress = dto.DeliveryAddress,
            DeliveryLatitude = dto.DeliveryLatitude,
            DeliveryLongitude = dto.DeliveryLongitude,
            Notes = dto.Notes,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = Domain.Enums.PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in orderItems)
        {
            order.Items.Add(item);
        }

        await _orderRepository.AddAsync(order);
        await _unitOfWork.SaveChangesAsync();

        return await MapToMarketplaceOrderDto(order, vendor, customer);
    }

    public async Task<IEnumerable<MarketplaceOrderDto>> GetCustomerOrdersAsync(int customerId, string? status = null)
    {
        var query = _orderRepository.AsQueryable()
            .Include(o => o.Vendor)
            .Include(o => o.Items)
            .Where(o => o.CustomerId == customerId);

        if (!string.IsNullOrEmpty(status))
        {
            if (Enum.TryParse<InventoryOrder.OrderStatus>(status, out var orderStatus))
            {
                query = query.Where(o => o.Status == orderStatus);
            }
        }

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        var customer = await _userRepository.GetByIdAsync(customerId);

        return orders.Select(o => MapToMarketplaceOrderDto(o, o.Vendor, customer).Result);
    }

    public async Task<IEnumerable<MarketplaceOrderDto>> GetVendorOrdersAsync(int vendorCompanyId, string? status = null)
    {
        var vendor = await _vendorRepository.AsQueryable()
            .FirstOrDefaultAsync(v => v.CompanyId == vendorCompanyId);

        if (vendor == null)
            return Enumerable.Empty<MarketplaceOrderDto>();

        var query = _orderRepository.AsQueryable()
            .Include(o => o.Vendor)
            .Include(o => o.Items)
            .Where(o => o.VendorId == vendor.Id);

        if (!string.IsNullOrEmpty(status))
        {
            if (Enum.TryParse<InventoryOrder.OrderStatus>(status, out var orderStatus))
            {
                query = query.Where(o => o.Status == orderStatus);
            }
        }

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();

        return orders.Select(async o =>
        {
            var customer = await _userRepository.GetByIdAsync(o.CustomerId);
            return await MapToMarketplaceOrderDto(o, o.Vendor, customer);
        }).Select(t => t.Result);
    }

    public async Task<MarketplaceOrderDto> UpdateOrderStatusAsync(int orderId, int vendorCompanyId, string status, string? notes = null)
    {
        var order = await _orderRepository.AsQueryable()
            .Include(o => o.Vendor)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new InvalidOperationException("Order not found");

        var vendor = await _vendorRepository.AsQueryable()
            .FirstOrDefaultAsync(v => v.CompanyId == vendorCompanyId);

        if (vendor == null || vendor.Id != order.VendorId)
            throw new UnauthorizedAccessException("You are not authorized to update this order");

        // Validate status transition
        if (!Enum.TryParse<InventoryOrder.OrderStatus>(status, out var newStatus))
            throw new InvalidOperationException($"Invalid status: {status}");

        order.Status = newStatus;
        order.Notes = notes ?? order.Notes;

        if (newStatus == InventoryOrder.OrderStatus.Delivered)
        {
            order.DeliveredAt = DateTime.UtcNow;
            order.PaymentStatus = Domain.Enums.PaymentStatus.Paid;
        }

        await _unitOfWork.SaveChangesAsync();

        var customer = await _userRepository.GetByIdAsync(order.CustomerId);
        return await MapToMarketplaceOrderDto(order, order.Vendor, customer);
    }

    public async Task<MarketplaceOrderDto> CancelOrderAsync(int orderId, int customerId, string? reason = null)
    {
        var order = await _orderRepository.AsQueryable()
            .Include(o => o.Vendor)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new InvalidOperationException("Order not found");

        if (order.CustomerId != customerId)
            throw new UnauthorizedAccessException("You are not authorized to cancel this order");

        if (order.Status != InventoryOrder.OrderStatus.Pending && order.Status != InventoryOrder.OrderStatus.Confirmed)
            throw new InvalidOperationException("Cannot cancel order that is already being processed");

        // Restore stock
        foreach (var item in order.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product != null)
            {
                product.QuantityInStock += item.Quantity;
                product.SalesCount -= (int)item.Quantity;
            }
        }

        order.Status = InventoryOrder.OrderStatus.Cancelled;
        order.Notes = reason ?? order.Notes;
        order.PaymentStatus = Domain.Enums.PaymentStatus.Refunded;

        await _unitOfWork.SaveChangesAsync();

        var customer = await _userRepository.GetByIdAsync(order.CustomerId);
        return await MapToMarketplaceOrderDto(order, order.Vendor, customer);
    }

    public async Task<MarketplaceOrderDto> ConfirmDeliveryAsync(int orderId, int customerId)
    {
        var order = await _orderRepository.AsQueryable()
            .Include(o => o.Vendor)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new InvalidOperationException("Order not found");

        if (order.CustomerId != customerId)
            throw new UnauthorizedAccessException("You are not authorized to confirm this order");

        if (order.Status != InventoryOrder.OrderStatus.Shipped)
            throw new InvalidOperationException("Order must be shipped before confirming delivery");

        order.Status = InventoryOrder.OrderStatus.Delivered;
        order.DeliveredAt = DateTime.UtcNow;
        order.PaymentStatus = Domain.Enums.PaymentStatus.Paid;

        await _unitOfWork.SaveChangesAsync();

        var customer = await _userRepository.GetByIdAsync(order.CustomerId);
        return await MapToMarketplaceOrderDto(order, order.Vendor, customer);
    }

    private async Task<MarketplaceOrderDto> MapToMarketplaceOrderDto(InventoryOrder order, Vendor? vendor, User? customer)
    {
        return new MarketplaceOrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            VendorId = order.VendorId,
            VendorName = vendor?.Name ?? string.Empty,
            CustomerId = order.CustomerId,
            CustomerName = customer?.FullName ?? string.Empty,
            Status = order.Status.ToString(),
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = (int)i.Quantity,
                UnitPrice = i.UnitPrice,
                Total = i.TotalPrice
            }).ToList(),
            Subtotal = order.Subtotal,
            DeliveryFee = order.DeliveryFee,
            Total = order.Total,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus.ToString(),
            DeliveryAddress = order.DeliveryAddress,
            CreatedAt = order.CreatedAt,
            DeliveredAt = order.DeliveredAt
        };
    }

    #endregion
}
