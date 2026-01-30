using ConstructionManagement.Domain.Entities; // for TransactionType
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.Transaction;

/// <summary>
/// Request DTO for creating a new transaction (expense/payment).
/// Supports both BOQ-item-specific and general project-level expenses.
/// </summary>
// إذا غيرت التعريف لهذا الشكل، سيعمل كود التست القديم الخاص بك
public record CreateTransactionRequest(
    int? BOQItemId,
    TransactionType Type,
    decimal Amount,
    string? Description,
    string? InvoiceNumber,
    string? SupplierName,
    IFormFile? InvoiceAttachment
);
