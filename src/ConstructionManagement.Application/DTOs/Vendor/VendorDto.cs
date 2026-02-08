namespace ConstructionManagement.Application.DTOs.Vendor
{
    public class VendorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? Notes { get; set; }
        public string? VendorType { get; set; }
        public decimal? CurrentBalance { get; set; }
        public decimal? TotalPaid { get; set; }
        public decimal? TotalInvoiced { get; set; }
        public bool IsActive { get; set; }
        public int InvoiceCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVendorRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? Notes { get; set; }
        public string? VendorType { get; set; }
    }

    public class UpdateVendorRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? Notes { get; set; }
        public string? VendorType { get; set; }
        public bool IsActive { get; set; }
    }
}
