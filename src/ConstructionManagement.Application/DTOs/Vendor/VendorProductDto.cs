namespace ConstructionManagement.Application.DTOs.Vendor
{
    public class VendorProductDto
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public decimal QuantityInStock { get; set; }
        public decimal LowStockThreshold { get; set; }
        public decimal PurchasePrice { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateVendorProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public decimal QuantityInStock { get; set; }
        public decimal LowStockThreshold { get; set; }
        public decimal PurchasePrice { get; set; }
    }

    public class UpdateVendorProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public decimal QuantityInStock { get; set; }
        public decimal LowStockThreshold { get; set; }
        public decimal PurchasePrice { get; set; }
        public bool IsActive { get; set; }
    }
}
