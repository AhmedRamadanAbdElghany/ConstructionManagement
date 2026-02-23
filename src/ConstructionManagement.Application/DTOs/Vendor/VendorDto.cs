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
        public bool IsRegistered { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsPublic { get; set; }
        public int? CompanyId { get; set; }
        public int? UserId { get; set; }
        public bool IsExternalVendor { get; set; }
        public string? ExternalVendorSource { get; set; }
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
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsPublic { get; set; }
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
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsPublic { get; set; }
    }

    public class VendorStatsDto
    {
        public int TotalSales { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalProfit { get; set; }
        public int TotalProducts { get; set; }
        public int LowStockCount { get; set; }
        public int PendingOrders { get; set; }
        public List<VendorTransactionDto> RecentTransactions { get; set; } = new();
    }

    public class UpdateVendorLocationRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class VendorSpendSummary
    {
        public string VendorName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int InvoiceCount { get; set; }
    }

    public class DateSpendSummary
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    /// <summary>
    /// Vendor with statistics for the finance page
    /// </summary>
    public class VendorWithStatsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? VendorType { get; set; }
        public bool IsExternalVendor { get; set; }
        public bool IsActive { get; set; }
        public int TotalInvoices { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
        public int ProjectCount { get; set; }
        public DateTime? LastInvoiceDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Project associated with a vendor
    /// </summary>
    public class VendorProjectDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int TotalInvoices { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
        public DateTime? LastInvoiceDate { get; set; }
        public DateTime? FirstInvoiceDate { get; set; }
    }

    /// <summary>
    /// Dashboard data for company owner to view vendor relationships
    /// </summary>
    public class VendorDashboardDto
    {
        public int TotalVendors { get; set; }
        public int ExternalVendors { get; set; }
        public int RegisteredVendors { get; set; }
        public decimal TotalSpend { get; set; }
        public decimal PendingApprovals { get; set; }
        public List<VendorWithStatsDto> TopVendors { get; set; } = new();
        public List<VendorWithStatsDto> RecentVendors { get; set; } = new();
    }
}
