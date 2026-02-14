namespace ConstructionManagement.Application.DTOs.Vendor
{
    public class VendorTransactionDto
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public int VendorProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalAmount => Quantity * UnitPrice;
        public DateTime TransactionDate { get; set; }
        public string? Notes { get; set; }
        public string? ReferenceNumber { get; set; }
    }

    public class CreateVendorTransactionRequest
    {
        public int VendorProductId { get; set; }
        public string TransactionType { get; set; } = string.Empty; // "Sale", "Purchase", "Adjustment"
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Notes { get; set; }
        public string? ReferenceNumber { get; set; }
    }
}
