using System;

namespace ConstructionManagement.Application.DTOs;

public record CreateClientPaymentRequest(
    int ProjectId,
    decimal Amount,
    string? Currency = "EGP",
    DateTime? PaymentDate = null,
    string? PaymentType = null,
    string? PaymentMethod = null,
    string? ReceiptNumber = null,
    string? BankName = null,
    string? CheckNumber = null,
    DateTime? CheckDueDate = null,
    int? ProgressInvoiceId = null,
    string? Description = null,
    string? Notes = null,
    string? AttachmentPath = null);
