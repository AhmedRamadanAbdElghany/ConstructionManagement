namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for progress invoice list item.
/// </summary>
public record ProgressInvoiceListItemDto(
    int Id,
    int ProjectId,
    string ProjectName,
    string InvoiceNumber,
    int InvoiceSequence,
    DateTime InvoiceDate,
    DateTime? PeriodFrom,
    DateTime? PeriodTo,
    decimal CurrentWorkValue,
    decimal RetentionAmount,
    decimal NetAmount,
    string Currency,
    string Status,
    string StatusDisplayName,
    decimal PaidAmount,
    decimal RemainingAmount,
    string? CreatedByFullName,
    DateTime CreatedAt
);

/// <summary>
/// DTO for full progress invoice details.
/// </summary>
public record ProgressInvoiceDto(
    int Id,
    int ProjectId,
    string ProjectName,
    string InvoiceNumber,
    int InvoiceSequence,
    DateTime InvoiceDate,
    DateTime? PeriodFrom,
    DateTime? PeriodTo,
    decimal TotalWorkValue,
    decimal PreviousInvoicesTotal,
    decimal CurrentWorkValue,
    decimal RetentionPercentage,
    decimal RetentionAmount,
    decimal PreviousRetention,
    decimal TotalRetention,
    decimal AdvanceDeduction,
    decimal OtherDeductions,
    decimal NetAmount,
    string Currency,
    string Status,
    string StatusDisplayName,
    decimal PaidAmount,
    decimal RemainingAmount,
    string? Notes,
    int? ApprovedByUserId,
    string? ApprovedByFullName,
    DateTime? ApprovedAt,
    int CreatedByUserId,
    string? CreatedByFullName,
    DateTime CreatedAt,
    IReadOnlyList<ClientPaymentDto> Payments
);

/// <summary>
/// DTO for creating a new progress invoice.
/// </summary>
public record CreateProgressInvoiceRequest(
    int ProjectId,
    string? InvoiceNumber = null,
    DateTime? InvoiceDate = null,
    DateTime? PeriodFrom = null,
    DateTime? PeriodTo = null,
    decimal TotalWorkValue = 0,
    decimal CurrentWorkValue = 0,
    decimal RetentionPercentage = 0,
    decimal AdvanceDeduction = 0,
    decimal OtherDeductions = 0,
    string? Currency = null,
    string? Notes = null
);

/// <summary>
/// DTO for updating a progress invoice.
/// </summary>
public record UpdateProgressInvoiceRequest(
    string? InvoiceNumber = null,
    DateTime? InvoiceDate = null,
    DateTime? PeriodFrom = null,
    DateTime? PeriodTo = null,
    decimal? TotalWorkValue = null,
    decimal? CurrentWorkValue = null,
    decimal? RetentionPercentage = null,
    decimal? AdvanceDeduction = null,
    decimal? OtherDeductions = null,
    string? Notes = null
);

/// <summary>
/// DTO for progress invoice filter.
/// </summary>
public record ProgressInvoiceFilterRequest(
    int? ProjectId = null,
    string? Status = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null,
    string? SearchTerm = null,
    int PageNumber = 1,
    int PageSize = 20,
    string SortBy = "InvoiceDate",
    bool SortDescending = true
);

/// <summary>
/// Paged result for progress invoice list.
/// </summary>
public record PagedProgressInvoiceResult(
    IReadOnlyList<ProgressInvoiceListItemDto> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
);

/// <summary>
/// DTO for project financial summary.
/// </summary>
public record ProjectFinancialSummaryDto(
    int ProjectId,
    string ProjectName,
    decimal? TotalContractValue,
    
    // Expenses
    decimal TotalExpenses,
    decimal ConfirmedExpenses,
    decimal PendingExpenses,
    decimal DraftExpenses,
    
    // Client Payments
    decimal TotalClientPayments,
    decimal AdvancePayments,
    decimal ProgressPayments,
    decimal OnAccountPayments,
    decimal FinalPayments,
    decimal PendingPayments,
    decimal ConfirmedPayments,
    
    // Balance
    decimal Balance, // ClientPayments - Expenses
    string BalanceStatus, // "Surplus", "Deficit", "Balanced"
    decimal BalancePercentage, // (Balance / TotalClientPayments) * 100
    
    // Alerts
    string AlertLevel, // "None", "Warning", "Critical", "Emergency"
    string? AlertMessage,
    
    // Progress Invoices
    int TotalInvoices,
    int PaidInvoices,
    int PendingInvoices,
    decimal TotalInvoiced,
    decimal TotalCollected
);
