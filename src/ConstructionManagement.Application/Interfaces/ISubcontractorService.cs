using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    /// <summary>
    /// Service interface for Subcontractor Management operations
    /// </summary>
    public interface ISubcontractorService
    {
        // Subcontractor CRUD
        Task<IEnumerable<SubcontractorDto>> GetSubcontractorsAsync(int? companyId = null);
        Task<SubcontractorDto?> GetSubcontractorByIdAsync(int id);
        Task<SubcontractorDto> CreateSubcontractorAsync(CreateSubcontractorRequest request);
        Task<SubcontractorDto> UpdateSubcontractorAsync(int id, UpdateSubcontractorRequest request);
        Task<bool> DeleteSubcontractorAsync(int id);
        Task<SubcontractorDto> ApproveSubcontractorAsync(int id, ApproveSubcontractorRequest request);

        // Contract Management
        Task<IEnumerable<SubcontractorContractDto>> GetContractsAsync(int subcontractorId);
        Task<SubcontractorContractDto?> GetContractByIdAsync(int id);
        Task<SubcontractorContractDto> CreateContractAsync(CreateContractRequest request);
        Task<SubcontractorContractDto> UpdateContractAsync(int id, UpdateContractRequest request);
        Task<bool> DeleteContractAsync(int id);
        Task<SubcontractorContractDto> UpdateContractStatusAsync(int id, ContractStatusUpdateRequest request);
        Task<IEnumerable<SubcontractorContractDto>> GetActiveContractsAsync();

        // Payment Management
        Task<IEnumerable<SubcontractorPaymentDto>> GetPaymentsAsync(int subcontractorId);
        Task<SubcontractorPaymentDto?> GetPaymentByIdAsync(int id);
        Task<SubcontractorPaymentDto> CreatePaymentAsync(CreatePaymentRequest request);
        Task<SubcontractorPaymentDto> UpdatePaymentStatusAsync(int id, UpdatePaymentStatusRequest request);
        Task<IEnumerable<SubcontractorPaymentDto>> GetPendingPaymentsAsync();

        // Rating Management
        Task<IEnumerable<SubcontractorRatingDto>> GetRatingsAsync(int subcontractorId);
        Task<SubcontractorRatingDto?> GetRatingByIdAsync(int id);
        Task<SubcontractorRatingDto> CreateRatingAsync(CreateRatingRequest request);
        Task<SubcontractorRatingDto> FinalizeRatingAsync(int id);
        Task<RatingSummaryDto> GetRatingSummaryAsync(int subcontractorId);

        // Summary & Analytics
        Task<SubcontractorSummaryDto> GetSummaryAsync();
        Task RecalculateSubcontractorMetricsAsync(int subcontractorId);
        Task<IEnumerable<SubcontractorDto>> GetTopRatedSubcontractorsAsync(int count = 5);
        Task<IEnumerable<SubcontractorDto>> GetSubcontractorsByTradeAsync(string trade);
        Task<IEnumerable<SubcontractorDto>> GetSubcontractorsWithExpiringInsuranceAsync(int daysAhead = 30);
    }
}
