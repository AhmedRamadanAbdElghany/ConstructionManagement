public record ReviewInvoiceRequest(
    string Status,                       // "Approved" or "Rejected"
    string? RejectionReason);