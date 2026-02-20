using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for managing progress invoices (مستخلصات).
/// </summary>
public interface IProgressInvoiceService
{
    // CRUD Operations
    Task<int> CreateInvoiceAsync(CreateProgressInvoiceRequest request, int createdByUserId, int companyId);
    Task<ProgressInvoiceDto?> GetInvoiceByIdAsync(int invoiceId);
    Task<bool> UpdateInvoiceAsync(int invoiceId, UpdateProgressInvoiceRequest request, int userId);
    Task<bool> DeleteInvoiceAsync(int invoiceId, int userId);
    
    // Listing
    Task<PagedProgressInvoiceResult> GetInvoicesAsync(ProgressInvoiceFilterRequest filter, int companyId);
    Task<List<ProgressInvoiceListItemDto>> GetInvoicesForProjectAsync(int projectId, string? status = null);
    
    // Workflow
    Task<bool> SubmitInvoiceAsync(int invoiceId, int userId);
    Task<bool> ApproveInvoiceAsync(int invoiceId, int approvedByUserId);
    Task<bool> CancelInvoiceAsync(int invoiceId, int userId, string? reason = null);
    
    // Payment Recording
    Task<bool> RecordPaymentAsync(int invoiceId, int paymentId);
    
    // Calculations
    Task<decimal> CalculateCurrentWorkValueAsync(int projectId);
    Task<int> GetNextInvoiceSequenceAsync(int projectId);
}

/// <summary>
/// Service interface for project financial summary.
/// </summary>
public interface IFinancialSummaryService
{
    Task<ProjectFinancialSummaryDto> GetProjectFinancialSummaryAsync(int projectId);
    Task<List<ProjectFinancialSummaryDto>> GetCompanyFinancialSummaryAsync(int companyId);
    Task CheckAndTriggerAlertsAsync(int projectId);
}
