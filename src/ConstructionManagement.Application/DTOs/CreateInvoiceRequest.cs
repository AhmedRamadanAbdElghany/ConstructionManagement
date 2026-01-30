namespace ConstructionManagement.Application.DTOs;

public record CreateInvoiceRequest(
    DateTime InvoiceDate,
    DateTime? DueDate,
    decimal SubTotal,
    decimal? TaxRate,
    decimal? TaxAmount,
    decimal? RetentionRate,
    decimal? RetentionAmount,
    decimal? NetAmount,
    string? Currency,
    string? Description,
    string? SupplierVendor,
    string? AttachmentPath
);
