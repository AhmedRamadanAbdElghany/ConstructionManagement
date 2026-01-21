// Application/DTOs/InvoiceDto.cs
public record InvoiceDto(
    int InvoiceID,
    int ItemID,
    string? InvoiceNumber,
    DateTime InvoiceDate,
    decimal Amount,
    string? Description,
    string? SupplierVendor,
    string Status,
    string? RejectionReason,
    DateTime? ReviewDate,
    string? AccountantFullName,
    string? AttachmentPath,
    DateTime CreatedAt);