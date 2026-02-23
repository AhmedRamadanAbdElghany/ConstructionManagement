using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Payment record for marketplace orders
    /// Supports Egyptian payment methods: PayMob, Fawry, Mobile Wallets, Cash on Delivery
    /// </summary>
    [Table("MarketplacePayments")]
    public class MarketplacePayment
    {
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// The order this payment is for
        /// </summary>
        public int OrderId { get; set; }

        /// <summary>
        /// Navigation property to the order
        /// </summary>
        [ForeignKey(nameof(OrderId))]
        public InventoryOrder? Order { get; set; }

        /// <summary>
        /// Payment ID from payment gateway (PayMob order ID, Fawry reference, etc.)
        /// </summary>
        [MaxLength(100)]
        public string? PaymentId { get; set; }

        /// <summary>
        /// Transaction ID from the payment gateway
        /// </summary>
        [MaxLength(100)]
        public string? TransactionId { get; set; }

        /// <summary>
        /// Reference number for the payment (Fawry ref number, etc.)
        /// </summary>
        [MaxLength(100)]
        public string? ReferenceNumber { get; set; }

        /// <summary>
        /// Payment method as integer (1=Card, 2=PayMob, 3=Fawry, 4=VodafoneCash, 5=OrangeMoney, 6=EtisalatCash, 7=CashOnDelivery)
        /// </summary>
        public int PaymentMethodValue { get; set; }

        /// <summary>
        /// Payment status as integer (0=Pending, 1=Processing, 2=Completed, 3=Failed, 4=Cancelled, 5=Refunded, 6=Expired)
        /// </summary>
        public int StatusValue { get; set; }

        /// <summary>
        /// Amount paid
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        /// <summary>
        /// Currency code (EGP, USD, etc.)
        /// </summary>
        [MaxLength(10)]
        public string? Currency { get; set; }

        /// <summary>
        /// URL to redirect user for payment completion
        /// </summary>
        [MaxLength(500)]
        public string? PaymentUrl { get; set; }

        /// <summary>
        /// Phone number used for mobile wallet payments
        /// </summary>
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Wallet provider for mobile wallet payments
        /// </summary>
        [MaxLength(50)]
        public string? WalletProvider { get; set; }

        /// <summary>
        /// When the payment was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When the payment was completed
        /// </summary>
        public DateTime? PaidAt { get; set; }

        /// <summary>
        /// When the payment expires (for pending payments)
        /// </summary>
        public DateTime? ExpiresAt { get; set; }

        /// <summary>
        /// Raw response from payment gateway
        /// </summary>
        public string? GatewayResponse { get; set; }

        /// <summary>
        /// Error message if payment failed
        /// </summary>
        [MaxLength(500)]
        public string? ErrorMessage { get; set; }

        /// <summary>
        /// Error code from payment gateway
        /// </summary>
        [MaxLength(50)]
        public string? ErrorCode { get; set; }

        /// <summary>
        /// Refund ID if payment was refunded
        /// </summary>
        [MaxLength(100)]
        public string? RefundId { get; set; }

        /// <summary>
        /// Amount refunded (for partial refunds)
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal? RefundedAmount { get; set; }

        /// <summary>
        /// When the payment was refunded
        /// </summary>
        public DateTime? RefundedAt { get; set; }

        /// <summary>
        /// Reason for refund
        /// </summary>
        [MaxLength(500)]
        public string? RefundReason { get; set; }
    }
}
