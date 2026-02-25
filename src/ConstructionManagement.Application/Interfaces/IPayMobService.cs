using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces;

public interface IPayMobService
{
    Task<string> GetAuthenticationTokenAsync();
    Task<string> GetAuthTokenAsync();
    Task<int> CreateOrderAsync(string authToken, PayMobOrderRequest request);
    Task<string> GetPaymentKeyAsync(string authToken, PayMobPaymentKeyRequest request);
    Task<PayMobWalletResponse> InitiateWalletPaymentAsync(string paymentKey, string phoneNumber);
    bool ValidateHmac(IDictionary<string, string> queryParams, string hmac);
    Task<PayMobCallbackResult> ProcessCallbackAsync(Dictionary<string, object> callbackData);
    Task<PayMobRefundResult> RefundPaymentAsync(string authToken, int transactionId, int amountCents);
    Task<PayMobPaymentLinkResult> CreatePaymentLinkAsync(decimal amount, string currency, 
        string merchantOrderId, PayMobBillingData billingData, List<PayMobOrderItem> items,
        string callbackUrl, string returnUrl);
    Task<PayMobWalletPaymentResult> CreateWalletPaymentAsync(string paymentKey, string phoneNumber, string walletProvider);
}

public class PayMobOrderRequest
{
    public string AmountCents { get; set; } = string.Empty;
    public string Currency { get; set; } = "EGP";
    public string MerchantOrderId { get; set; } = string.Empty;
    public object? Items { get; set; }
}

public class PayMobPaymentKeyRequest
{
    public string AmountCents { get; set; } = string.Empty;
    public int Expiration { get; set; } = 3600;
    public int OrderId { get; set; }
    public PayMobBillingData BillingData { get; set; } = new();
    public string Currency { get; set; } = "EGP";
    public int IntegrationId { get; set; }
}

public class PayMobBillingData
{
    public string FirstName { get; set; } = "NA";
    public string LastName { get; set; } = "NA";
    public string Email { get; set; } = "NA";
    public string PhoneNumber { get; set; } = "NA";
    public string Apartment { get; set; } = "NA";
    public string Floor { get; set; } = "NA";
    public string Street { get; set; } = "NA";
    public string Building { get; set; } = "NA";
    public string ShippingMethod { get; set; } = "NA";
    public string PostalCode { get; set; } = "NA";
    public string City { get; set; } = "NA";
    public string Country { get; set; } = "NA";
    public string State { get; set; } = "NA";
}

public class PayMobWalletResponse
{
    public string RedirectUrl { get; set; } = string.Empty;
    public string? Pending { get; set; }
    public string? Success { get; set; }
}

public class PayMobOrderItem
{
    public string Name { get; set; } = string.Empty;
    public int AmountCents { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
}

public class PayMobCallbackResult
{
    public bool Success { get; set; }
    public int OrderId { get; set; }
    public int TransactionId { get; set; }
    public string? Message { get; set; }
    public string? RawData { get; set; }
}

public class PayMobRefundResult
{
    public bool Success { get; set; }
    public int? RefundId { get; set; }
    public string? ErrorMessage { get; set; }
}

public class PayMobPaymentLinkResult
{
    public bool Success { get; set; }
    public string? PaymentKey { get; set; }
    public string? PaymentUrl { get; set; }
    public int? OrderId { get; set; }
    public string? ErrorMessage { get; set; }
}

public class PayMobWalletPaymentResult
{
    public bool Success { get; set; }
    public string? RedirectUrl { get; set; }
    public string? ErrorMessage { get; set; }
}
