namespace ConstructionManagement.Application.DTOs.Vendor
{
    public class VendorProductDto
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public decimal QuantityInStock { get; set; }
        public decimal LowStockThreshold { get; set; }
        public decimal PurchasePrice { get; set; }
        public bool IsActive { get; set; }
        public int SalesCount { get; set; }
        public string? ImageUrl { get; set; }
        public string? SKU { get; set; }
        public decimal? AverageRating { get; set; }
        public int TotalReviews { get; set; }
    }

    public class VendorProductDetailDto
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public decimal QuantityInStock { get; set; }
        public decimal LowStockThreshold { get; set; }
        public decimal PurchasePrice { get; set; }
        public bool IsActive { get; set; }
        public int SalesCount { get; set; }
        public string? ImageUrl { get; set; }
        public string? SKU { get; set; }
        public decimal? AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public double? VendorLatitude { get; set; }
        public double? VendorLongitude { get; set; }
        public string? VendorAddress { get; set; }
    }

    public class CreateVendorProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public decimal QuantityInStock { get; set; }
        public decimal LowStockThreshold { get; set; }
        public decimal PurchasePrice { get; set; }
        public string? ImageUrl { get; set; }
        public string? SKU { get; set; }
    }

    public class UpdateVendorProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public decimal QuantityInStock { get; set; }
        public decimal LowStockThreshold { get; set; }
        public decimal PurchasePrice { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
        public string? SKU { get; set; }
    }

    // Marketplace DTOs
    public class NearbyVendorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Distance { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int TotalOrders { get; set; }
        public int ProductCount { get; set; }
        public List<string> Categories { get; set; } = new();
    }

    public class VendorProfileDto
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int TotalOrders { get; set; }
        public int ProductCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MarketplaceVendorStatsDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CancelledOrders { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalProducts { get; set; }
    }

    public class VendorReviewDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int VendorId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVendorReviewDto
    {
        public int Rating { get; set; } // 1-5
        public string? Comment { get; set; }
    }

    // Marketplace Order DTOs
    public class MarketplaceOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public int VendorId { get; set; }
        public string? VendorName { get; set; }
        public string Status { get; set; } = "Pending";
        public string PaymentStatus { get; set; } = "Pending";
        public string PaymentMethod { get; set; } = "Cash";
        public DateTime OrderDate { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public decimal SubTotal { get; set; }
        public decimal? DeliveryFee { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? DeliveryNotes { get; set; }
        public string? Notes { get; set; }
        public List<MarketplaceOrderItemDto> Items { get; set; } = new();
    }

    public class MarketplaceOrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public decimal Quantity { get; set; }
        public string? Unit { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CreateMarketplaceOrderDto
    {
        public int VendorId { get; set; }
        public List<CreateMarketplaceOrderItemDto> Items { get; set; } = new();
        public string? DeliveryAddress { get; set; }
        public string? DeliveryNotes { get; set; }
        public string? Notes { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
        public DateTime? ExpectedDeliveryDate { get; set; }
    }

    public class CreateMarketplaceOrderItemDto
    {
        public int ProductId { get; set; }
        public decimal Quantity { get; set; }
    }
}
