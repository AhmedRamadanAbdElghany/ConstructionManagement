public record CreateInvoiceRequest(
    string? InvoiceNumber,
    DateTime InvoiceDate,
    decimal Amount,
    string? Description,
    string? SupplierVendor,
    string? AttachmentPath);