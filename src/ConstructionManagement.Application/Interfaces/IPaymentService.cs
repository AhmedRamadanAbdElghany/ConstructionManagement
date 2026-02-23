using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IPaymentService
    {
        // Payment Transactions
        Task<PaymentTransactionDto?> GetTransactionByIdAsync(int id);
        Task<GatewayPaymentHistoryDto> GetPaymentHistoryAsync(int companyId, int? projectId = null, int page = 1, int pageSize = 20);
        Task<PaymentSummaryDto> GetPaymentSummaryAsync(int companyId);
        
        // Online Payments (Client initiates)
        Task<PaymentResultDto> InitiateOnlinePaymentAsync(int userId, CreateOnlinePaymentRequest request);
        Task<PaymentResultDto> ConfirmOnlinePaymentAsync(int transactionId, string paymentIntentId);
        Task<PaymentResultDto> HandleWebhookAsync(string payload, string signature);
        
        // Offline Payments (Admin records)
        Task<PaymentTransactionDto> RecordOfflinePaymentAsync(int userId, int companyId, RecordOfflinePaymentRequest request);
        Task<PaymentTransactionDto> UpdatePaymentStatusAsync(int transactionId, Domain.Entities.PaymentStatus status, string? notes = null);
        
        // Refunds
        Task<PaymentResultDto> RefundPaymentAsync(int userId, RefundPaymentRequest request);
        
        // Payment Settings
        Task<PaymentSettingsDto> GetPaymentSettingsAsync(int companyId);
        Task<PaymentSettingsDto> UpdatePaymentSettingsAsync(int companyId, UpdatePaymentSettingsRequest request);
        
        // Client Portal
        Task<GatewayPaymentHistoryDto> GetClientPaymentHistoryAsync(int userId);
        Task<List<PaymentTransactionDto>> GetProjectPaymentsAsync(int projectId, int? companyId = null, bool isSuperAdmin = false);

        #region Marketplace Payments

        /// <summary>
        /// Get order details for payment processing
        /// </summary>
        Task<dynamic?> GetOrderForPaymentAsync(int orderId, int userId);

        /// <summary>
        /// Create a payment record for marketplace order
        /// </summary>
        Task CreatePaymentRecordAsync(CreatePaymentRecordRequest request);

        /// <summary>
        /// Update order payment status after callback
        /// </summary>
        Task UpdateOrderPaymentStatusAsync(int orderId, string transactionId, Domain.Entities.PaymentStatus status, object? additionalData = null);

        /// <summary>
        /// Update order payment status by merchant reference number
        /// </summary>
        Task UpdateOrderPaymentStatusByReferenceAsync(string? merchantRefNumber, string? referenceNumber, Domain.Entities.PaymentStatus status, object? additionalData = null);

        /// <summary>
        /// Get marketplace payment status for an order
        /// </summary>
        Task<PaymentStatusResponse?> GetMarketplacePaymentStatusAsync(int orderId, int userId);

        /// <summary>
        /// Get payment history for marketplace user
        /// </summary>
        Task<PaymentHistoryResponse> GetMarketplacePaymentHistoryAsync(int userId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get payment by payment ID
        /// </summary>
        Task<PaymentHistoryItem?> GetPaymentByPaymentIdAsync(string paymentId);

        #endregion
    }

    /// <summary>
    /// Request for creating a payment record
    /// </summary>
    public class CreatePaymentRecordRequest
    {
        public int OrderId { get; set; }
        public string? PaymentId { get; set; }
        public string? ReferenceNumber { get; set; }
        public DTOs.MarketplacePaymentMethod PaymentMethod { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
    }
}
