using System;
using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    // Payment Transaction DTOs
    public class PaymentTransactionDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public int? ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public int? ItemInvoiceId { get; set; }
        public string? InvoiceNumber { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string Channel { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionReference { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? RecordedByName { get; set; }
        public string? Notes { get; set; }
        public string? ReceiptUrl { get; set; }
    }

    public class CreateOnlinePaymentRequest
    {
        public int? ProjectId { get; set; }
        public int? ItemInvoiceId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentMethod { get; set; } = string.Empty; // CreditCard, PayPal, BankTransfer
        public string? Notes { get; set; }
        
        // For credit card payments (will be handled by Stripe on frontend)
        public string? PaymentMethodId { get; set; } // Stripe PaymentMethod ID
    }

    public class RecordOfflinePaymentRequest
    {
        public int? ProjectId { get; set; }
        public int? ItemInvoiceId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentMethod { get; set; } = string.Empty; // Cash, Cheque, BankTransfer
        public string TransactionReference { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public string? Notes { get; set; }
        public string? ReceiptUrl { get; set; }
    }

    public class PaymentResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public PaymentTransactionDto? Transaction { get; set; }
        public string? RedirectUrl { get; set; } // For payment gateway redirects
        public string? ClientSecret { get; set; } // For Stripe
    }

    public class GatewayPaymentHistoryDto
    {
        public List<PaymentTransactionDto> Transactions { get; set; } = new();
        public int TotalCount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal CompletedAmount { get; set; }
    }

    public class PaymentSettingsDto
    {
        public bool EnableOnlinePayments { get; set; }
        public bool EnableStripe { get; set; }
        public bool EnablePayPal { get; set; }
        public bool EnableBankTransfer { get; set; }
        public string? StripePublicKey { get; set; }
        public string? Currency { get; set; }
        public decimal? MinimumPaymentAmount { get; set; }
        public bool RequirePaymentApproval { get; set; }
    }

    public class UpdatePaymentSettingsRequest
    {
        public bool EnableOnlinePayments { get; set; }
        public bool EnableStripe { get; set; }
        public bool EnablePayPal { get; set; }
        public bool EnableBankTransfer { get; set; }
        public string? StripeSecretKey { get; set; }
        public string? StripePublicKey { get; set; }
        public string? PayPalClientId { get; set; }
        public string? PayPalSecret { get; set; }
        public string Currency { get; set; } = "USD";
        public decimal MinimumPaymentAmount { get; set; } = 1;
        public bool RequirePaymentApproval { get; set; }
    }

    public class RefundPaymentRequest
    {
        public int TransactionId { get; set; }
        public decimal? Amount { get; set; } // Partial refund if specified
        public string Reason { get; set; } = string.Empty;
    }

    // Payment Summary for Dashboard
    public class PaymentSummaryDto
    {
        public decimal TotalReceived { get; set; }
        public decimal TotalPending { get; set; }
        public decimal TotalRefunded { get; set; }
        public int CompletedPayments { get; set; }
        public int PendingPayments { get; set; }
        public int FailedPayments { get; set; }
        public List<RecentPaymentDto> RecentPayments { get; set; } = new();
    }

    public class RecentPaymentDto
    {
        public int Id { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? ProjectName { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
