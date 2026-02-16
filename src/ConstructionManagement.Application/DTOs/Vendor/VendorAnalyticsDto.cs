namespace ConstructionManagement.Application.DTOs.Vendor
{
    public class VendorSpendReportDto
    {
        public List<VendorSpendItem> TopVendors { get; set; } = new();
        public List<SpendByDateItem> SpendTrends { get; set; } = new();
        public decimal TotalSpend { get; set; }
        public int TotalInvoices { get; set; }
    }

    public class VendorSpendItem
    {
        public int VendorId { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int InvoiceCount { get; set; }
    }

    public class SpendByDateItem
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    public class VendorSearchRequest
    {
        public string? Material { get; set; }
        public string? Name { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double RadiusKm { get; set; } = 50;
        public int? ProjectId { get; set; }
    }

    public class PublicVendorDto : VendorDto
    {
        public double? DistanceKm { get; set; }
        public List<VendorProductDto> TopProducts { get; set; } = new();
    }
}
