using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for managing client payments.
/// </summary>
public interface IClientPaymentService
{
    // CRUD Operations
    Task<int> CreatePaymentAsync(CreateClientPaymentRequest request, int createdByUserId, int companyId);
    Task<ClientPaymentDto?> GetPaymentByIdAsync(int paymentId);
    Task<bool> UpdatePaymentAsync(int paymentId, UpdateClientPaymentRequest request, int userId);
    Task<bool> DeletePaymentAsync(int paymentId, int userId);
    
    // Listing
    Task<PagedClientPaymentResult> GetPaymentsAsync(ClientPaymentFilterRequest filter, int companyId);
    Task<List<ClientPaymentListItemDto>> GetPaymentsForProjectAsync(int projectId, string? status = null);
    
    // Confirmation
    Task<bool> ConfirmPaymentAsync(int paymentId, int confirmedByUserId, ConfirmPaymentRequest? request = null);
    Task<bool> CancelPaymentAsync(int paymentId, int userId, string? reason = null);
    
    // Statistics
    Task<ClientPaymentStatisticsDto> GetStatisticsAsync(int? projectId = null, int? companyId = null);
}
