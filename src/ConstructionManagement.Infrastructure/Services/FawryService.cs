using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ConstructionManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Fawry Payment Gateway Service Implementation
/// Documentation: https://www.fawry.com/developer/
/// </summary>
public class FawryService : IFawryService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<FawryService> _logger;
    private readonly HttpClient _httpClient;
    
    private readonly string _merchantCode;
    private readonly string _securityKey;
    private readonly string _baseUrl;
    
    public FawryService(
        IConfiguration configuration,
        ILogger<FawryService> logger,
        HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
        
        // Fawry configuration from appsettings.json
        _merchantCode = configuration["Fawry:MerchantCode"] 
            ?? throw new ArgumentNullException("Fawry:MerchantCode not configured");
        _securityKey = configuration["Fawry:SecurityKey"] 
            ?? throw new ArgumentNullException("Fawry:SecurityKey not configured");
        _baseUrl = configuration["Fawry:BaseUrl"] ?? "https://atfawry.fawrystaging.com/fawrypay-api/api";
    }
    
    /// <summary>
    /// Create a charge request for card payment
    /// </summary>
    public async Task<FawryChargeResponse> CreateChargeAsync(FawryChargeRequest request)
    {
        try
        {
            // Generate signature
            var signature = GenerateChargeSignature(request);
            request.Signature = signature;
            request.MerchantCode = _merchantCode;
            
            var requestBody = new
            {
                merchantCode = request.MerchantCode,
                merchantRefNum = request.MerchantRefNumber,
                customerCode = request.CustomerCode,
                customerMobile = request.CustomerMobile,
                customerEmail = request.CustomerEmail,
                customerName = request.CustomerName,
                amount = request.Amount,
                currencyCode = request.CurrencyCode,
                description = request.Description,
                language = request.Language ?? "ar-eg",
                chargeExpiry = request.ChargeExpiry,
                chargeItems = request.ChargeItems.Select(i => new
                {
                    itemId = i.ItemId,
                    description = i.Description,
                    price = i.Price,
                    quantity = i.Quantity
                }),
                signature = signature
            };
            
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/charges", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            if (response.IsSuccessStatusCode && result.TryGetProperty("statusCode", out var statusCode) 
                && statusCode.GetInt32() == 200)
            {
                return new FawryChargeResponse
                {
                    Success = true,
                    ReferenceNumber = result.TryGetProperty("referenceNumber", out var refNum) 
                        ? refNum.GetString() 
                        : null,
                    MerchantRefNumber = request.MerchantRefNumber,
                    PaymentMethod = "Card",
                    PaymentUrl = result.TryGetProperty("paymentUrl", out var payUrl) 
                        ? payUrl.GetString() 
                        : null
                };
            }
            
            return new FawryChargeResponse
            {
                Success = false,
                ErrorMessage = result.TryGetProperty("statusDescription", out var desc) 
                    ? desc.GetString() 
                    : responseString,
                ErrorCode = result.TryGetProperty("statusCode", out var code) 
                    ? code.GetInt32().ToString() 
                    : null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Fawry charge");
            return new FawryChargeResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Create a cash on delivery order
    /// </summary>
    public async Task<FawryCashOnDeliveryResponse> CreateCashOnDeliveryAsync(FawryCashOnDeliveryRequest request)
    {
        try
        {
            // Generate signature for COD
            var signatureString = $"{_merchantCode}{request.MerchantRefNumber}{request.Amount:0.00}";
            var signature = GenerateSignature(signatureString);
            
            var requestBody = new
            {
                merchantCode = _merchantCode,
                merchantRefNum = request.MerchantRefNumber,
                customerCode = request.CustomerCode,
                customerMobile = request.CustomerMobile,
                customerEmail = request.CustomerEmail,
                customerName = request.CustomerName,
                amount = request.Amount,
                currencyCode = request.CurrencyCode,
                description = request.Description,
                chargeItems = request.ChargeItems.Select(i => new
                {
                    itemId = i.ItemId,
                    description = i.Description,
                    price = i.Price,
                    quantity = i.Quantity
                }),
                deliveryAddress = request.DeliveryAddress,
                signature = signature
            };
            
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/orders/cash-on-delivery", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            if (response.IsSuccessStatusCode && result.TryGetProperty("statusCode", out var statusCode) 
                && statusCode.GetInt32() == 200)
            {
                return new FawryCashOnDeliveryResponse
                {
                    Success = true,
                    ReferenceNumber = result.TryGetProperty("referenceNumber", out var refNum) 
                        ? refNum.GetString() 
                        : null,
                    MerchantRefNumber = request.MerchantRefNumber
                };
            }
            
            return new FawryCashOnDeliveryResponse
            {
                Success = false,
                ErrorMessage = result.TryGetProperty("statusDescription", out var desc) 
                    ? desc.GetString() 
                    : responseString
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Fawry COD order");
            return new FawryCashOnDeliveryResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Get order status
    /// </summary>
    public async Task<FawryOrderStatusResponse> GetOrderStatusAsync(string merchantCode, string merchantRefNumber)
    {
        try
        {
            // Generate signature for status check
            var signatureString = $"{merchantCode}{merchantRefNumber}";
            var signature = GenerateSignature(signatureString);
            
            var response = await _httpClient.GetAsync(
                $"{_baseUrl}/orders/status?merchantCode={merchantCode}&merchantRefNumber={merchantRefNumber}&signature={signature}");
            
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            if (response.IsSuccessStatusCode)
            {
                return new FawryOrderStatusResponse
                {
                    Success = true,
                    OrderStatus = result.TryGetProperty("orderStatus", out var status) 
                        ? status.GetString() 
                        : null,
                    ReferenceNumber = result.TryGetProperty("referenceNumber", out var refNum) 
                        ? refNum.GetString() 
                        : null,
                    MerchantRefNumber = merchantRefNumber,
                    Amount = result.TryGetProperty("paymentAmount", out var amt) 
                        ? amt.GetDecimal() 
                        : null,
                    CurrencyCode = result.TryGetProperty("currencyCode", out var curr) 
                        ? curr.GetString() 
                        : null,
                    PaymentMethod = result.TryGetProperty("paymentMethod", out var method) 
                        ? method.GetString() 
                        : null,
                    PaymentDate = result.TryGetProperty("paymentTime", out var time) 
                        ? DateTime.TryParse(time.GetString(), out var dt) ? dt : null 
                        : null
                };
            }
            
            return new FawryOrderStatusResponse
            {
                Success = false,
                ErrorMessage = result.TryGetProperty("statusDescription", out var desc) 
                    ? desc.GetString() 
                    : responseString
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting Fawry order status");
            return new FawryOrderStatusResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Refund a payment
    /// </summary>
    public async Task<FawryRefundResponse> RefundPaymentAsync(FawryRefundRequest request)
    {
        try
        {
            // Generate signature for refund
            var signatureString = $"{_merchantCode}{request.ReferenceNumber}{request.RefundNumber}{request.RefundAmount:0.00}";
            var signature = GenerateSignature(signatureString);
            
            var requestBody = new
            {
                merchantCode = _merchantCode,
                referenceNumber = request.ReferenceNumber,
                refundNumber = request.RefundNumber,
                refundAmount = request.RefundAmount,
                reason = request.Reason,
                signature = signature
            };
            
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/refunds", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            if (response.IsSuccessStatusCode && result.TryGetProperty("statusCode", out var statusCode) 
                && statusCode.GetInt32() == 200)
            {
                return new FawryRefundResponse
                {
                    Success = true,
                    RefundNumber = result.TryGetProperty("refundNumber", out var refNum) 
                        ? refNum.GetString() 
                        : request.RefundNumber
                };
            }
            
            return new FawryRefundResponse
            {
                Success = false,
                ErrorMessage = result.TryGetProperty("statusDescription", out var desc) 
                    ? desc.GetString() 
                    : responseString
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding Fawry payment");
            return new FawryRefundResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Process callback from Fawry
    /// </summary>
    public async Task<FawryCallbackData> ProcessCallbackAsync(Dictionary<string, object> callbackData)
    {
        return await Task.Run(() =>
        {
            try
            {
                var success = callbackData.TryGetValue("orderStatus", out var status) 
                    && status?.ToString()?.ToUpper() == "PAID";
                
                var referenceNumber = callbackData.TryGetValue("referenceNumber", out var refNum) 
                    ? refNum?.ToString() 
                    : null;
                
                var merchantRefNumber = callbackData.TryGetValue("merchantRefNumber", out var merRef) 
                    ? merRef?.ToString() 
                    : null;
                
                var amount = callbackData.TryGetValue("paymentAmount", out var amt) 
                    ? Convert.ToDecimal(amt) 
                    : 0;
                
                var currencyCode = callbackData.TryGetValue("currencyCode", out var curr) 
                    ? curr?.ToString() 
                    : "EGP";
                
                var paymentMethod = callbackData.TryGetValue("paymentMethod", out var method) 
                    ? method?.ToString() 
                    : "Unknown";
                
                DateTime? paymentDate = null;
                if (callbackData.TryGetValue("paymentTime", out var time) && 
                    DateTime.TryParse(time?.ToString(), out var dt))
                {
                    paymentDate = dt;
                }
                
                return new FawryCallbackData
                {
                    Success = success,
                    Message = success ? "Payment successful" : "Payment pending or failed",
                    ReferenceNumber = referenceNumber,
                    MerchantRefNumber = merchantRefNumber,
                    Amount = amount,
                    CurrencyCode = currencyCode,
                    OrderStatus = status?.ToString(),
                    PaymentMethod = paymentMethod,
                    PaymentDate = paymentDate,
                    RawData = callbackData
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Fawry callback");
                return new FawryCallbackData
                {
                    Success = false,
                    Message = ex.Message,
                    RawData = callbackData
                };
            }
        });
    }
    
    /// <summary>
    /// Create payment link for sharing
    /// </summary>
    public async Task<FawryPaymentLinkResponse> CreatePaymentLinkAsync(
        decimal amount, 
        string merchantRefNumber, 
        string description, 
        string customerEmail, 
        string customerMobile)
    {
        try
        {
            // Generate signature
            var signatureString = $"{_merchantCode}{merchantRefNumber}{amount:0.00}";
            var signature = GenerateSignature(signatureString);
            
            var requestBody = new
            {
                merchantCode = _merchantCode,
                merchantRefNum = merchantRefNumber,
                amount = amount,
                currencyCode = "EGP",
                description = description,
                customerEmail = customerEmail,
                customerMobile = customerMobile,
                signature = signature
            };
            
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/payment-links", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            if (response.IsSuccessStatusCode)
            {
                return new FawryPaymentLinkResponse
                {
                    Success = true,
                    PaymentLink = result.TryGetProperty("paymentLink", out var link) 
                        ? link.GetString() 
                        : null,
                    ReferenceNumber = result.TryGetProperty("referenceNumber", out var refNum) 
                        ? refNum.GetString() 
                        : null
                };
            }
            
            return new FawryPaymentLinkResponse
            {
                Success = false,
                ErrorMessage = result.TryGetProperty("statusDescription", out var desc) 
                    ? desc.GetString() 
                    : responseString
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Fawry payment link");
            return new FawryPaymentLinkResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Verify signature from callback
    /// </summary>
    public bool VerifyCallbackSignature(Dictionary<string, object> callbackData, string receivedSignature)
    {
        try
        {
            // Build the signature string based on Fawry's requirements
            var signatureString = new StringBuilder();
            
            // Fawry signature format: merchantCode + referenceNumber + (paymentAmount if paid) + securityKey
            if (callbackData.TryGetValue("merchantCode", out var merchantCode))
            {
                signatureString.Append(merchantCode);
            }
            
            if (callbackData.TryGetValue("referenceNumber", out var refNum))
            {
                signatureString.Append(refNum);
            }
            
            if (callbackData.TryGetValue("paymentAmount", out var amount))
            {
                signatureString.Append(Convert.ToDecimal(amount).ToString("0.00"));
            }
            
            // Calculate expected signature
            var expectedSignature = GenerateSignature(signatureString.ToString());
            
            return string.Equals(expectedSignature, receivedSignature, StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying Fawry callback signature");
            return false;
        }
    }
    
    #region Private Helper Methods
    
    private string GenerateSignature(string data)
    {
        using var sha256 = SHA256.Create();
        var keyBytes = Encoding.UTF8.GetBytes(_securityKey);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        
        var combinedBytes = new byte[keyBytes.Length + dataBytes.Length];
        Buffer.BlockCopy(keyBytes, 0, combinedBytes, 0, keyBytes.Length);
        Buffer.BlockCopy(dataBytes, 0, combinedBytes, keyBytes.Length, dataBytes.Length);
        
        var hashBytes = sha256.ComputeHash(combinedBytes);
        return Convert.ToHexString(hashBytes).ToLower();
    }
    
    private string GenerateChargeSignature(FawryChargeRequest request)
    {
        // Fawry charge signature: merchantCode + merchantRefNum + customerCode + paymentMethodId + amount (in 2 decimal format) + securityKey
        var signatureString = $"{_merchantCode}{request.MerchantRefNumber}{request.CustomerCode}{request.Amount:0.00}";
        return GenerateSignature(signatureString);
    }
    
    #endregion
}
