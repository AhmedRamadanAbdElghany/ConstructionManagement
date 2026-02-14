using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.Vendor
{
    public class VendorInvoiceDto
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public string? FileUrl { get; set; }
        public string? OriginalFileName { get; set; }
        public string? MaterialType { get; set; }
        public string ApprovalStatus { get; set; } = string.Empty;
        public int? ApprovedByUserId { get; set; }
        public string? ApprovedByUserName { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectionReason { get; set; }
        public int CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVendorInvoiceRequest
    {
        public int CreatedByUserId { get; set; }
        public int? VendorId { get; set; }
        public string? NewVendorName { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public string? MaterialType { get; set; }
        public int? ProjectId { get; set; }
        public IFormFile? File { get; set; }
    }

    public class ReviewVendorInvoiceRequest
    {
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class VendorInvoiceSummary
    {
        public int VendorId { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public int TotalInvoices { get; set; }
        public decimal TotalAmount { get; set; }
        public int PendingApprovals { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
    }
}
