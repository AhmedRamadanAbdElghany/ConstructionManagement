using System.Text;
using System.Text.Json;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// PayMob Payment Gateway Service Interface
/// Documentation: https://docs.paymob.com/
/// </summary>
public interface IPayMobService
{
    /// <summary>
    /// Get authentication token from PayMob
    /// </summary>
    Task<string> GetAuthTokenAsync();

    /// <summary>
    /// Create an order in PayMob
    /// </summary>
    Task<PayMobOrderResponse> CreateOrderAsync(string authToken, int amountCents, string merchantOrderId, List<PayMobOrderItem> items);

    /// <summary>
    /// Get payment key for a specific order
    /// </summary>
    Task<string> GetPaymentKeyAsync(string authToken, int orderId, int amountCents, PayMobBillingData billingData, string currency = "EGP");

    /// <summary>
    /// Create a payment link for card payment
    /// </summary>
    Task<PayMobPaymentResponse> CreatePaymentLinkAsync(decimal amount, string currency, string merchantOrderId, PayMobBillingData billingData, List<PayMobOrderItem> items, string callbackUrl, string successUrl);

    /// <summary>
    /// Create a wallet payment (Vodafone Cash, Orange Money, Etisalat Cash)
    /// </summary>
    Task<PayMobWalletResponse> CreateWalletPaymentAsync(string paymentKey, string phoneNumber, string walletProvider);

    /// <summary>
    /// Process callback from PayMob
    /// </summary>
    Task<PayMobCallbackData> ProcessCallbackAsync(Dictionary<string, object> callbackData);

    /// <summary>
    /// Refund a payment
    /// </summary>
    Task<PayMobRefundResponse> RefundPaymentAsync(string authToken, int transactionId, int amountCents);

    /// <summary>
    /// Get transaction status
    /// </summary>
    Task<PayMobTransactionResponse> GetTransactionAsync(string authToken, int transactionId);
}

#region PayMob DTOs

public class PayMobOrderItem
{
    public string Name { get; set; } = string.Empty;
    public int AmountCents { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Currency { get; set; } = "EGP";
}

public class PayMobBillingData
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Country { get; set; } = "EG";
    public string City { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Building { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public string Apartment { get; set; } = string.Empty;
}

public class PayMobOrderResponse
{
    public int Id { get; set; }
    public string? MerchantOrderId { get; set; }
    public int AmountCents { get; set; }
    public string? Currency { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PayMobPaymentResponse
{
    public bool Success { get; set; }
    public string? PaymentKey { get; set; }
    public string? PaymentUrl { get; set; }
    public int? OrderId { get; set; }
    public string? ErrorMessage { get; set; }
}

public class PayMobWalletResponse
{
    public bool Success { get; set; }
    public string? RedirectUrl { get; set; }
    public string? ErrorMessage { get; set; }
}

public class PayMobCallbackData
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public int OrderId { get; set; }
    public int TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime ProcessedAt { get; set; }
    public Dictionary<string, object>? RawData { get; set; }
}

public class PayMobRefundResponse
{
    public bool Success { get; set; }
    public int? RefundId { get; set; }
    public string? ErrorMessage { get; set; }
}

public class PayMobTransactionResponse
{
    public int Id { get; set; }
    public bool Success { get; set; }
    public bool IsRefunded { get; set; }
    public decimal AmountCents { get; set; }
    public string? Currency { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime CreatedAt { get; set; }
}

#endregion
