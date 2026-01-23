using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs.Transaction
{
    public record TransactionDto(
      int TransactionId,
      int ProjectId,
      int? BOQItemId,
      string? BOQItemName,
      TransactionType Type,
      decimal Amount,
      DateTime TransactionDate,
      int CreatedByUserId,
      string CreatedByName,
      string? Description,
      string? InvoiceNumber,
      string? SupplierName,
      string? AttachmentUrl,
      TransactionStatus Status,
      int? ReviewedByUserId,
      string? ReviewedByName,
      string? ReviewNotes,
      DateTime CreatedAt);
}
