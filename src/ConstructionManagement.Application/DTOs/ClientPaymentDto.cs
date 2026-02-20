namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for client payment list item.
/// </summary>
public record ClientPaymentListItemDto(
    int Id,
    int ProjectId,
    string ProjectName,
    string PaymentType,
    string PaymentTypeDisplayName,
    decimal Amount,
    string Currency,
    DateTime PaymentDate,
    string? ReceiptNumber,
    string PaymentMethod,
    string PaymentMethodDisplayName,
    string Status,
    string StatusDisplayName,
    string? Notes,
    int? ProgressInvoiceId,
    string? ProgressInvoiceNumber,
    string? CreatedByFullName,
    DateTime CreatedAt
);

/// <summary>
/// DTO for full client payment details.
/// Compatible with both ClientPaymentService and ClientPortalService.
/// </summary>
public class ClientPaymentDto
{
    public ClientPaymentDto() { }

    public ClientPaymentDto(
        int id,
        int projectId,
        string projectName,
        string paymentType,
        string paymentTypeDisplayName,
        decimal amount,
        string currency,
        DateTime paymentDate,
        string? receiptNumber,
        string paymentMethod,
        string paymentMethodDisplayName,
        string? bankName,
        string? checkNumber,
        DateTime? checkDueDate,
        int? progressInvoiceId,
        string? progressInvoiceNumber,
        string? notes,
        string? attachmentPath,
        string status,
        string statusDisplayName,
        int? confirmedByUserId,
        string? confirmedByFullName,
        DateTime? confirmedAt,
        int createdByUserId,
        string? createdByFullName,
        DateTime createdAt)
    {
        Id = id;
        ProjectId = projectId;
        ProjectName = projectName;
        PaymentType = paymentType;
        PaymentTypeDisplayName = paymentTypeDisplayName;
        Amount = amount;
        Currency = currency;
        PaymentDate = paymentDate;
        ReceiptNumber = receiptNumber;
        PaymentMethod = paymentMethod;
        PaymentMethodDisplayName = paymentMethodDisplayName;
        BankName = bankName;
        CheckNumber = checkNumber;
        CheckDueDate = checkDueDate;
        ProgressInvoiceId = progressInvoiceId;
        ProgressInvoiceNumber = progressInvoiceNumber;
        Notes = notes;
        AttachmentPath = attachmentPath;
        Status = status;
        StatusDisplayName = statusDisplayName;
        ConfirmedByUserId = confirmedByUserId;
        ConfirmedByFullName = confirmedByFullName;
        ConfirmedAt = confirmedAt;
        CreatedByUserId = createdByUserId;
        CreatedByFullName = createdByFullName;
        CreatedAt = createdAt;
        
        // Aliases for compatibility with older code/portal
        InvoiceNumber = receiptNumber ?? "";
        InvoiceDate = paymentDate;
        PaidAmount = status == "Confirmed" ? amount : 0;
        PaidDate = confirmedAt;
    }

    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string PaymentType { get; set; } = string.Empty;
    public string PaymentTypeDisplayName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EGP";
    public DateTime PaymentDate { get; set; }
    public string? ReceiptNumber { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentMethodDisplayName { get; set; } = string.Empty;
    public string? BankName { get; set; }
    public string? CheckNumber { get; set; }
    public DateTime? CheckDueDate { get; set; }
    public int? ProgressInvoiceId { get; set; }
    public string? ProgressInvoiceNumber { get; set; }
    public string? Notes { get; set; }
    public string? AttachmentPath { get; set; }
    public string Status { get; set; } = string.Empty;
    public string StatusDisplayName { get; set; } = string.Empty;
    public int? ConfirmedByUserId { get; set; }
    public string? ConfirmedByFullName { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public string? CreatedByFullName { get; set; }
    public DateTime CreatedAt { get; set; }

    // Portal Compatibility Properties
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal? PaidAmount { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? PaidDate { get; set; }
}

/// <summary>
/// DTO for updating a client payment.
/// </summary>
public record UpdateClientPaymentRequest(
    string? PaymentType = null,
    decimal? Amount = null,
    string? Currency = null,
    DateTime? PaymentDate = null,
    string? ReceiptNumber = null,
    string? PaymentMethod = null,
    string? BankName = null,
    string? CheckNumber = null,
    DateTime? CheckDueDate = null,
    int? ProgressInvoiceId = null,
    string? Notes = null,
    string? AttachmentPath = null
);

/// <summary>
/// DTO for confirming a payment.
/// </summary>
public record ConfirmPaymentRequest(
    string? ReceiptNumber = null,
    string? Notes = null
);

/// <summary>
/// DTO for client payment filter.
/// </summary>
public record ClientPaymentFilterRequest(
    int? ProjectId = null,
    string? PaymentType = null,
    string? Status = null,
    string? PaymentMethod = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null,
    string? SearchTerm = null,
    int PageNumber = 1,
    int PageSize = 20,
    string SortBy = "PaymentDate",
    bool SortDescending = true
);

/// <summary>
/// Paged result for client payment list.
/// </summary>
public record PagedClientPaymentResult(
    IReadOnlyList<ClientPaymentListItemDto> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
);

/// <summary>
/// DTO for client payment statistics.
/// </summary>
public record ClientPaymentStatisticsDto(
    int TotalPayments,
    int PendingPayments,
    int ConfirmedPayments,
    decimal TotalAmount,
    decimal PendingAmount,
    decimal ConfirmedAmount,
    decimal AdvancePaymentsTotal,
    decimal ProgressPaymentsTotal,
    decimal OnAccountPaymentsTotal,
    decimal FinalPaymentsTotal
);
