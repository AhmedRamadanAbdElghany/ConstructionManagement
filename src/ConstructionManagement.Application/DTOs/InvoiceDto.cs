namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for invoice image information
/// </summary>
public record InvoiceImageDto(
    int Id,
    string ImagePath,
    string? OriginalFileName,
    long? FileSize,
    string? ContentType,
    int DisplayOrder,
    string? Description
);

/// <summary>
/// DTO for invoice list item (lightweight)
/// </summary>
public record InvoiceListItemDto(
    int Id,
    int ProjectId,
    string ProjectName,
    int ProjectItemId,
    string ItemName,
    string InvoiceType,
    string InvoiceTypeDisplayName,
    string InvoiceNumber,
    DateTime InvoiceDate,
    decimal NetAmount,
    string Currency,
    string Status,
    string StatusDisplayName,
    string? Description,
    int? VendorId,
    string? VendorName,
    string? ExternalVendorName,
    int ImageCount,
    string? CreatedByFullName,
    DateTime CreatedAt
);

/// <summary>
/// DTO for full invoice details
/// </summary>
public record InvoiceDto(
    int Id,
    int ProjectId,
    string ProjectName,
    int ProjectItemId,
    string ItemName,
    string InvoiceType,
    string InvoiceTypeDisplayName,
    string InvoiceNumber,
    DateTime InvoiceDate,
    DateTime? DueDate,
    decimal SubTotal,
    decimal? TaxRate,
    decimal? TaxAmount,
    decimal? RetentionRate,
    decimal? RetentionAmount,
    decimal NetAmount,
    string Currency,
    string? Description,
    string? SupplierVendor,
    int? VendorId,
    string? VendorName,
    string? ExternalVendorName,
    string Status,
    string StatusDisplayName,
    string? RejectionReason,
    DateTime? ReviewDate,
    string? ReviewerFullName,
    string? AttachmentPath,
    int CreatedByUserId,
    string? CreatedByFullName,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<InvoiceImageDto> Images
);

/// <summary>
/// DTO for creating a new invoice
/// Simplified: Only ProjectItemId and NetAmount are required.
/// All other fields are optional with default values.
/// Invoice status will be Draft if no images, Pending if images are uploaded.
/// </summary>
public record CreateInvoiceRequest(
    int ProjectItemId,           // Required - The project item for this invoice
    decimal NetAmount,           // Required - Total invoice amount
    string? InvoiceType = null,  // Optional - Default: PurchaseInvoice
    string? InvoiceNumber = null, // Optional - Auto-generated if not provided
    DateTime? InvoiceDate = null, // Optional - Default: Current date
    DateTime? DueDate = null,    // Optional
    decimal? SubTotal = null,    // Optional - Default: Same as NetAmount
    decimal? TaxRate = null,     // Optional - Default: 0
    decimal? TaxAmount = null,   // Optional - Default: 0
    decimal? RetentionRate = null, // Optional - Default: 0
    decimal? RetentionAmount = null, // Optional - Default: 0
    string? Currency = null,     // Optional - Default: EGP
    string? Description = null,  // Optional
    string? SupplierVendor = null, // Optional
    int? VendorId = null,
    string? ExternalVendorName = null,
    string? AttachmentPath = null // Optional
);

/// <summary>
/// DTO for updating an existing invoice
/// </summary>
public record UpdateInvoiceRequest(
    string? InvoiceNumber,
    DateTime? InvoiceDate,
    DateTime? DueDate,
    decimal? SubTotal,
    decimal? TaxRate,
    decimal? TaxAmount,
    decimal? RetentionRate,
    decimal? RetentionAmount,
    decimal? NetAmount,
    string? Currency,
    string? Description,
    string? SupplierVendor,
    int? VendorId,
    string? ExternalVendorName,
    string? AttachmentPath
);

/// <summary>
/// DTO for reviewing (approving/rejecting) an invoice
/// </summary>
public record ReviewInvoiceRequest(
    string Status, // "Approved" or "Rejected"
    string? RejectionReason
);

/// <summary>
/// DTO for invoice filters
/// </summary>
public record InvoiceFilterRequest(
    int? ProjectId = null,
    int? ProjectItemId = null,
    string? InvoiceType = null,
    string? Status = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null,
    string? SearchTerm = null,
    int PageNumber = 1,
    int PageSize = 20,
    string SortBy = "InvoiceDate",
    bool SortDescending = true
);

/// <summary>
/// Paged result for invoice list
/// </summary>
public record PagedInvoiceResult(
    IReadOnlyList<InvoiceListItemDto> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
);

/// <summary>
/// DTO for invoice statistics
/// </summary>
public record InvoiceStatisticsDto(
    int TotalInvoices,
    int PendingInvoices,
    int ApprovedInvoices,
    int RejectedInvoices,
    decimal TotalAmount,
    decimal PendingAmount,
    decimal ApprovedAmount,
    int DisbursementAuthorizationCount,
    int PurchaseInvoiceCount
);
