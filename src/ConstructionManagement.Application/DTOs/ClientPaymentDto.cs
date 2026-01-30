// Application/DTOs/ClientPaymentDto.cs
public record ClientPaymentDto(
    int PaymentID,
    DateTime PaymentDate,
    decimal Amount,
    string? PaymentType,
    string? Description,
    bool IsConfirmed,
    string? AttachmentPath,
    DateTime CreatedAt);
