using System;

namespace ConstructionManagement.Domain.Entities
{
    public class PaymentTransaction : BaseEntity, ICompanyEntity
    {
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public int? ItemInvoiceId { get; set; }
        public int? ClientPaymentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public PaymentChannel Channel { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionReference { get; set; } = string.Empty;
        public string? GatewayResponse { get; set; }
        public PaymentStatus Status { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? RecordedBy { get; set; }
        public string? Notes { get; set; }
        public string? ReceiptUrl { get; set; }

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
        public virtual ItemInvoice? ItemInvoice { get; set; }
        public virtual ClientPayment? ClientPayment { get; set; }
        public virtual User? Recorder { get; set; }
    }

    public enum PaymentChannel
    {
        Online = 1,   // Paid through system (credit card, online bank transfer)
        Offline = 2   // Paid at company office, recorded by admin
    }

    public enum PaymentStatus
    {
        Pending = 1,
        Processing = 2,
        Completed = 3,
        Failed = 4,
        Refunded = 5,
        Cancelled = 6
    }
}
