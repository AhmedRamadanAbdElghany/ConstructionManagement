namespace ConstructionManagement.Application.DTOs;

public record InvoiceDto(
    int InvoiceID,
    int ItemID,
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
    string Status,
    string? RejectionReason,
    DateTime? ReviewDate,
    string? ReviewerFullName,
    string? AttachmentPath,
    int CreatedByUserId,
    string? CreatedByFullName,
    DateTime CreatedAt
);
