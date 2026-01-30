public record CreateClientPaymentRequest(
    DateTime PaymentDate,
    decimal Amount,
    string? PaymentType,
    string? Description,
    string? AttachmentPath);
