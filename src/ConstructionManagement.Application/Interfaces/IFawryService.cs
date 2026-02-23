using System.Text;
using System.Text.Json;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Fawry Payment Gateway Service Interface
/// Documentation: https://www.fawry.com/developer/
/// </summary>
public interface IFawryService
{
    /// <summary>
    /// Create a charge request for card payment
    /// </summary>
    Task<FawryChargeResponse> CreateChargeAsync(FawryChargeRequest request);

    /// <summary>
    /// Create a cash on delivery order
    /// </summary>
    Task<FawryCashOnDeliveryResponse> CreateCashOnDeliveryAsync(FawryCashOnDeliveryRequest request);

    /// <summary>
    /// Get order status
    /// </summary>
    Task<FawryOrderStatusResponse> GetOrderStatusAsync(string merchantCode, string merchantRefNumber);

    /// <summary>
    /// Refund a payment
    /// </summary>
    Task<FawryRefundResponse> RefundPaymentAsync(FawryRefundRequest request);

    /// <summary>
    /// Process callback from Fawry
    /// </summary>
    Task<FawryCallbackData> ProcessCallbackAsync(Dictionary<string, object> callbackData);

    /// <summary>
    /// Create payment link for sharing
    /// </summary>
    Task<FawryPaymentLinkResponse> CreatePaymentLinkAsync(decimal amount, string merchantRefNumber, string description, string customerEmail, string customerMobile);

    /// <summary>
    /// Verify signature from callback
    /// </summary>
    bool VerifyCallbackSignature(Dictionary<string, object> callbackData, string receivedSignature);
}

#region Fawry DTOs

public class FawryChargeRequest
{
    public string MerchantCode { get; set; } = string.Empty;
    public string MerchantRefNumber { get; set; } = string.Empty;
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerMobile { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "EGP";
    public string Description { get; set; } = string.Empty;
    public string? Language { get; set; } = "ar-eg";
    public string? ChargeExpiry { get; set; }
    public List<FawryChargeItem> ChargeItems { get; set; } = new();
    public string? Signature { get; set; }
}

public class FawryChargeItem
{
    public string ItemId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class FawryChargeResponse
{
    public bool Success { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? MerchantRefNumber { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentUrl { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorCode { get; set; }
}

public class FawryCashOnDeliveryRequest
{
    public string MerchantCode { get; set; } = string.Empty;
    public string MerchantRefNumber { get; set; } = string.Empty;
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerMobile { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "EGP";
    public string Description { get; set; } = string.Empty;
    public List<FawryChargeItem> ChargeItems { get; set; } = new();
    public string? DeliveryAddress { get; set; }
}

public class FawryCashOnDeliveryResponse
{
    public bool Success { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? MerchantRefNumber { get; set; }
    public string? ErrorMessage { get; set; }
}

public class FawryOrderStatusResponse
{
    public bool Success { get; set; }
    public string? OrderStatus { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? MerchantRefNumber { get; set; }
    public decimal? Amount { get; set; }
    public string? CurrencyCode { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? ErrorMessage { get; set; }
}

public class FawryRefundRequest
{
    public string MerchantCode { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public string RefundNumber { get; set; } = string.Empty;
    public decimal RefundAmount { get; set; }
    public string? Reason { get; set; }
}

public class FawryRefundResponse
{
    public bool Success { get; set; }
    public string? RefundNumber { get; set; }
    public string? ErrorMessage { get; set; }
}

public class FawryCallbackData
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? MerchantRefNumber { get; set; }
    public decimal Amount { get; set; }
    public string? CurrencyCode { get; set; }
    public string? OrderStatus { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime? PaymentDate { get; set; }
    public Dictionary<string, object>? RawData { get; set; }
}

public class FawryPaymentLinkResponse
{
    public bool Success { get; set; }
    public string? PaymentLink { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? ErrorMessage { get; set; }
}

#endregion
