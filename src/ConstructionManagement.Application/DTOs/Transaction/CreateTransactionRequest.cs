using ConstructionManagement.Domain.Entities; // for TransactionType
using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.DTOs.Transaction;

/// <summary>
/// Request DTO for creating a new transaction (expense/payment).
/// Supports both ProjectItem-specific and general project-level expenses.
/// </summary>
public record CreateTransactionRequest(
    int? ProjectItemId,
    TransactionType Type,
    decimal Amount,
    string? Description,
    string? InvoiceNumber,
    string? SupplierName,
    IFormFile? InvoiceAttachment
);
