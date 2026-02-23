using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTOs for Egyptian Payment Methods
/// Supports: PayMob, Fawry, Mobile Wallets (Vodafone Cash, Orange Money, Etisalat Cash), Cash on Delivery
/// </summary>

#region Payment Initiation

public class InitiatePaymentRequest
{
    [Required]
    public int OrderId { get; set; }
    
    [Required]
    public MarketplacePaymentMethod PaymentMethod { get; set; }
    
    /// <summary>
    /// Required for mobile wallet payments
    /// </summary>
    public string? PhoneNumber { get; set; }
    
    /// <summary>
    /// Required for mobile wallet - specifies which wallet provider
    /// </summary>
    public WalletProvider? WalletProvider { get; set; }
    
    /// <summary>
    /// Required for card payments - callback URL after payment
    /// </summary>
    public string? CallbackUrl { get; set; }
    
    /// <summary>
    /// Success redirect URL
    /// </summary>
    public string? SuccessUrl { get; set; }
    
    /// <summary>
    /// Failure redirect URL
    /// </summary>
    public string? FailureUrl { get; set; }
}

public class InitiatePaymentResponse
{
    public bool Success { get; set; }
    public string? PaymentId { get; set; }
    public string? PaymentUrl { get; set; }
    public string? ReferenceNumber { get; set; }
    public MarketplacePaymentMethod PaymentMethod { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorCode { get; set; }
}

#endregion

#region Payment Methods Enum

public enum MarketplacePaymentMethod
{
    /// <summary>
    /// Credit/Debit Card (Visa, Mastercard) via PayMob
    /// </summary>
    Card = 1,
    
    /// <summary>
    /// PayMob wallet payment
    /// </summary>
    PayMob = 2,
    
    /// <summary>
    /// Fawry payment (cash at Fawry outlets or card)
    /// </summary>
    Fawry = 3,
    
    /// <summary>
    /// Vodafone Cash mobile wallet
    /// </summary>
    VodafoneCash = 4,
    
    /// <summary>
    /// Orange Money mobile wallet
    /// </summary>
    OrangeMoney = 5,
    
    /// <summary>
    /// Etisalat Cash mobile wallet
    /// </summary>
    EtisalatCash = 6,
    
    /// <summary>
    /// Cash on Delivery
    /// </summary>
    CashOnDelivery = 7
}

public enum WalletProvider
{
    VodafoneCash = 1,
    OrangeMoney = 2,
    EtisalatCash = 3
}

public enum MarketplacePaymentStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4,
    Refunded = 5,
    Expired = 6
}

#endregion

#region Payment Callback

public class PaymentCallbackRequest
{
    public string? PaymentId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? MerchantRefNumber { get; set; }
    public bool Success { get; set; }
    public string? Message { get; set; }
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Signature { get; set; }
    public Dictionary<string, object>? AdditionalData { get; set; }
}

public class PaymentCallbackResponse
{
    public bool Success { get; set; }
    public int OrderId { get; set; }
    public string? TransactionId { get; set; }
    public MarketplacePaymentStatus Status { get; set; }
    public string? Message { get; set; }
}

#endregion

#region Payment Status

public class PaymentStatusResponse
{
    public string? PaymentId { get; set; }
    public string? ReferenceNumber { get; set; }
    public int OrderId { get; set; }
    public MarketplacePaymentStatus Status { get; set; }
    public MarketplacePaymentMethod PaymentMethod { get; set; }
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? PaymentUrl { get; set; }
    public string? ErrorMessage { get; set; }
}

#endregion

#region Refund

public class MarketplaceRefundRequest
{
    [Required]
    public string PaymentId { get; set; } = string.Empty;
    
    [Required]
    public decimal Amount { get; set; }
    
    public string? Reason { get; set; }
}

public class MarketplaceRefundResponse
{
    public bool Success { get; set; }
    public string? RefundId { get; set; }
    public decimal RefundedAmount { get; set; }
    public string? ErrorMessage { get; set; }
}

#endregion

#region Marketplace Order Payment

public class MarketplacePaymentRequest
{
    [Required]
    public int OrderId { get; set; }
    
    [Required]
    public MarketplacePaymentMethod PaymentMethod { get; set; }
    
    /// <summary>
    /// Customer billing information
    /// </summary>
    public BillingInfo BillingInfo { get; set; } = new();
    
    /// <summary>
    /// For mobile wallet payments
    /// </summary>
    public string? PhoneNumber { get; set; }
    
    public WalletProvider? WalletProvider { get; set; }
    
    /// <summary>
    /// Delivery address for Cash on Delivery
    /// </summary>
    public DeliveryAddress? DeliveryAddress { get; set; }
}

public class BillingInfo
{
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;
    
    public string? City { get; set; }
    public string? Street { get; set; }
    public string? Building { get; set; }
    public string? Floor { get; set; }
    public string? Apartment { get; set; }
}

public class DeliveryAddress
{
    [Required]
    public string Address { get; set; } = string.Empty;
    
    [Required]
    public string City { get; set; } = string.Empty;
    
    [Required]
    public string Area { get; set; } = string.Empty;
    
    public string? Landmark { get; set; }
    
    public string? BuildingNumber { get; set; }
    
    public string? Floor { get; set; }
    
    public string? Apartment { get; set; }
    
    public double? Latitude { get; set; }
    
    public double? Longitude { get; set; }
}

public class MarketplacePaymentResponse
{
    public bool Success { get; set; }
    public string? PaymentId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? PaymentUrl { get; set; }
    public MarketplacePaymentMethod PaymentMethod { get; set; }
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? ErrorMessage { get; set; }
}

#endregion

#region Payment History

public class PaymentHistoryItem
{
    public int Id { get; set; }
    public string? PaymentId { get; set; }
    public string? ReferenceNumber { get; set; }
    public int OrderId { get; set; }
    public MarketplacePaymentMethod PaymentMethod { get; set; }
    public MarketplacePaymentStatus Status { get; set; }
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? VendorName { get; set; }
}

public class PaymentHistoryResponse
{
    public List<PaymentHistoryItem> Payments { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

#endregion
