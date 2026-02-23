using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ConstructionManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// PayMob Payment Gateway Service Implementation
/// Documentation: https://docs.paymob.com/docs/api
/// </summary>
public class PayMobService : IPayMobService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PayMobService> _logger;
    private readonly HttpClient _httpClient;
    
    private readonly string _apiKey;
    private readonly string _integrationId;
    private readonly string _iframeId;
    private readonly string _hmacSecret;
    private readonly string _baseUrl;
    
    public PayMobService(
        IConfiguration configuration,
        ILogger<PayMobService> logger,
        HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
        
        // PayMob configuration from appsettings.json
        _apiKey = configuration["PayMob:ApiKey"] ?? throw new ArgumentNullException("PayMob:ApiKey not configured");
        _integrationId = configuration["PayMob:IntegrationId"] ?? throw new ArgumentNullException("PayMob:IntegrationId not configured");
        _iframeId = configuration["PayMob:IframeId"] ?? throw new ArgumentNullException("PayMob:IframeId not configured");
        _hmacSecret = configuration["PayMob:HmacSecret"] ?? "";
        _baseUrl = configuration["PayMob:BaseUrl"] ?? "https://accept.paymob.com/api";
    }
    
    /// <summary>
    /// Step 1: Get Authentication Token
    /// </summary>
    public async Task<string> GetAuthTokenAsync()
    {
        try
        {
            var requestBody = new { api_key = _apiKey };
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/auth/tokens", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("PayMob auth failed: {Response}", responseString);
                throw new Exception($"PayMob authentication failed: {responseString}");
            }
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            return result.GetProperty("token").GetString() 
                ?? throw new Exception("Token not found in PayMob response");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting PayMob auth token");
            throw;
        }
    }
    
    /// <summary>
    /// Step 2: Create Order
    /// </summary>
    public async Task<PayMobOrderResponse> CreateOrderAsync(
        string authToken, 
        int amountCents, 
        string merchantOrderId, 
        List<PayMobOrderItem> items)
    {
        try
        {
            var orderItems = items.Select(i => new
            {
                name = i.Name,
                amount_cents = i.AmountCents,
                description = i.Description,
                quantity = i.Quantity,
                currency = i.Currency ?? "EGP"
            }).ToList();
            
            var requestBody = new
            {
                auth_token = authToken,
                delivery_needed = false,
                merchant_id = _configuration["PayMob:MerchantId"],
                amount_cents = amountCents,
                currency = "EGP",
                merchant_order_id = merchantOrderId,
                items = orderItems
            };
            
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/ecommerce/orders", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("PayMob order creation failed: {Response}", responseString);
                throw new Exception($"PayMob order creation failed: {responseString}");
            }
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            return new PayMobOrderResponse
            {
                Id = result.GetProperty("id").GetInt32(),
                MerchantOrderId = result.TryGetProperty("merchant_order_id", out var merId) 
                    ? merId.GetString() 
                    : merchantOrderId,
                AmountCents = amountCents,
                Currency = "EGP",
                CreatedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating PayMob order");
            throw;
        }
    }
    
    /// <summary>
    /// Step 3: Get Payment Key
    /// </summary>
    public async Task<string> GetPaymentKeyAsync(
        string authToken, 
        int orderId, 
        int amountCents, 
        PayMobBillingData billingData,
        string currency = "EGP")
    {
        try
        {
            var requestBody = new
            {
                auth_token = authToken,
                amount_cents = amountCents,
                expiration = 3600, // 1 hour
                order_id = orderId,
                billing_data = new
                {
                    first_name = billingData.FirstName,
                    last_name = billingData.LastName,
                    email = billingData.Email,
                    phone_number = billingData.PhoneNumber,
                    country = billingData.Country,
                    city = billingData.City,
                    street = billingData.Street,
                    building = billingData.Building,
                    floor = billingData.Floor,
                    apartment = billingData.Apartment
                },
                currency = currency,
                integration_id = int.Parse(_integrationId)
            };
            
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/acceptance/payment_keys", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("PayMob payment key failed: {Response}", responseString);
                throw new Exception($"PayMob payment key generation failed: {responseString}");
            }
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            return result.GetProperty("token").GetString() 
                ?? throw new Exception("Payment key not found in PayMob response");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting PayMob payment key");
            throw;
        }
    }
    
    /// <summary>
    /// Create complete payment link for card payment
    /// </summary>
    public async Task<PayMobPaymentResponse> CreatePaymentLinkAsync(
        decimal amount, 
        string currency, 
        string merchantOrderId, 
        PayMobBillingData billingData, 
        List<PayMobOrderItem> items,
        string callbackUrl,
        string successUrl)
    {
        try
        {
            // Step 1: Get auth token
            var authToken = await GetAuthTokenAsync();
            
            // Step 2: Create order
            var amountCents = (int)(amount * 100); // Convert to cents
            var order = await CreateOrderAsync(authToken, amountCents, merchantOrderId, items);
            
            // Step 3: Get payment key
            var paymentKey = await GetPaymentKeyAsync(authToken, order.Id, amountCents, billingData, currency);
            
            // Generate payment URL
            var paymentUrl = $"https://accept.paymob.com/api/acceptance/iframes/{_iframeId}?payment_token={paymentKey}";
            
            return new PayMobPaymentResponse
            {
                Success = true,
                PaymentKey = paymentKey,
                PaymentUrl = paymentUrl,
                OrderId = order.Id
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating PayMob payment link");
            return new PayMobPaymentResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Create wallet payment (Vodafone Cash, Orange Money, Etisalat Cash)
    /// </summary>
    public async Task<PayMobWalletResponse> CreateWalletPaymentAsync(
        string paymentKey, 
        string phoneNumber, 
        string walletProvider)
    {
        try
        {
            // Map wallet provider to PayMob integration ID
            var walletIntegrationId = walletProvider.ToLower() switch
            {
                "vodafone" or "vodafonemoney" or "vodafonecash" => 
                    _configuration["PayMob:WalletIntegrations:Vodafone"] ?? _integrationId,
                "orange" or "orangemoney" => 
                    _configuration["PayMob:WalletIntegrations:Orange"] ?? _integrationId,
                "etisalat" or "etisalatcash" => 
                    _configuration["PayMob:WalletIntegrations:Etisalat"] ?? _integrationId,
                _ => _integrationId
            };
            
            var requestBody = new
            {
                source = new
                {
                    identifier = phoneNumber,
                    subtype = "WALLET"
                },
                payment_token = paymentKey
            };
            
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/acceptance/payments/pay", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            if (result.TryGetProperty("redirect_url", out var redirectUrl))
            {
                return new PayMobWalletResponse
                {
                    Success = true,
                    RedirectUrl = redirectUrl.GetString()
                };
            }
            
            if (result.TryGetProperty("message", out var message))
            {
                return new PayMobWalletResponse
                {
                    Success = false,
                    ErrorMessage = message.GetString()
                };
            }
            
            return new PayMobWalletResponse
            {
                Success = response.IsSuccessStatusCode,
                RedirectUrl = responseString
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating PayMob wallet payment");
            return new PayMobWalletResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Process callback from PayMob
    /// </summary>
    public async Task<PayMobCallbackData> ProcessCallbackAsync(Dictionary<string, object> callbackData)
    {
        try
        {
            // Verify HMAC signature - reject if secret not configured
            if (string.IsNullOrEmpty(_hmacSecret))
            {
                _logger.LogWarning("PayMob HMAC secret not configured - callback rejected for security reasons");
                return new PayMobCallbackData
                {
                    Success = false,
                    Message = "Security configuration error: HMAC secret not configured"
                };
            }
            
            var isValid = VerifyHmac(callbackData);
            if (!isValid)
            {
                _logger.LogWarning("PayMob callback HMAC signature verification failed");
                return new PayMobCallbackData
                {
                    Success = false,
                    Message = "Invalid HMAC signature"
                };
            }
            
            var success = callbackData.TryGetValue("success", out var successVal) 
                && successVal?.ToString() == "true";
            
            var orderId = callbackData.TryGetValue("order", out var orderObj) 
                ? GetOrderIdFromObject(orderObj) 
                : 0;
            
            var transactionId = callbackData.TryGetValue("id", out var txnId) 
                ? Convert.ToInt32(txnId) 
                : 0;
            
            var amountCents = callbackData.TryGetValue("amount_cents", out var amt) 
                ? Convert.ToDecimal(amt) / 100 
                : 0;
            
            var currency = callbackData.TryGetValue("currency", out var curr) 
                ? curr?.ToString() 
                : "EGP";
            
            var paymentMethod = callbackData.TryGetValue("source_data", out var sourceData) 
                ? GetPaymentMethodFromSource(sourceData) 
                : "Unknown";
            
            return new PayMobCallbackData
            {
                Success = success,
                Message = success ? "Payment successful" : "Payment failed",
                OrderId = orderId,
                TransactionId = transactionId,
                Amount = amountCents,
                Currency = currency,
                PaymentMethod = paymentMethod,
                ProcessedAt = DateTime.UtcNow,
                RawData = callbackData
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PayMob callback");
            return new PayMobCallbackData
            {
                Success = false,
                Message = ex.Message,
                RawData = callbackData
            };
        }
    }
    
    /// <summary>
    /// Refund a payment
    /// </summary>
    public async Task<PayMobRefundResponse> RefundPaymentAsync(
        string authToken, 
        int transactionId, 
        int amountCents)
    {
        try
        {
            var requestBody = new
            {
                auth_token = authToken,
                transaction_id = transactionId,
                amount_cents = amountCents
            };
            
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/acceptance/void_refund/refund", content);
            var responseString = await response.Content.ReadAsStringAsync();
            
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            if (response.IsSuccessStatusCode)
            {
                return new PayMobRefundResponse
                {
                    Success = true,
                    RefundId = result.TryGetProperty("id", out var refundId) 
                        ? refundId.GetInt32() 
                        : null
                };
            }
            
            return new PayMobRefundResponse
            {
                Success = false,
                ErrorMessage = result.TryGetProperty("message", out var msg) 
                    ? msg.GetString() 
                    : responseString
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding PayMob payment");
            return new PayMobRefundResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Get transaction status
    /// </summary>
    public async Task<PayMobTransactionResponse> GetTransactionAsync(string authToken, int transactionId)
    {
        try
        {
            var response = await _httpClient.GetAsync(
                $"{_baseUrl}/acceptance/transactions/{transactionId}?auth_token={authToken}");
            
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseString);
            
            return new PayMobTransactionResponse
            {
                Id = transactionId,
                Success = result.TryGetProperty("success", out var success) && success.GetBoolean(),
                IsRefunded = result.TryGetProperty("is_refunded", out var refunded) && refunded.GetBoolean(),
                AmountCents = result.TryGetProperty("amount_cents", out var amt) 
                    ? amt.GetDecimal() / 100 
                    : 0,
                Currency = result.TryGetProperty("currency", out var curr) 
                    ? curr.GetString() 
                    : "EGP",
                PaymentMethod = result.TryGetProperty("source_data", out var source) 
                    ? GetPaymentMethodFromSource(source) 
                    : "Unknown",
                CreatedAt = result.TryGetProperty("created_at", out var created) 
                    ? created.GetDateTime() 
                    : DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting PayMob transaction");
            throw;
        }
    }
    
    #region Private Helper Methods
    
    private bool VerifyHmac(Dictionary<string, object> data)
    {
        try
        {
            // Get the HMAC from the callback
            if (!data.TryGetValue("hmac", out var hmacValue))
                return false;
            
            // Build the concatenated string for HMAC verification
            var keysToConcat = new[] 
            { 
                "amount_cents", "created_at", "currency", "error_occured", 
                "has_parent_transaction", "id", "integration_id", "is_3d_secure",
                "is_auth", "is_capture", "is_refunded", "is_standalone_payment",
                "is_voided", "order.id", "owner", "pending", "source_data.pan",
                "source_data.sub_type", "source_data.type", "success"
            };
            
            var concatenated = new StringBuilder();
            foreach (var key in keysToConcat)
            {
                var value = GetNestedValue(data, key);
                if (value != null)
                {
                    concatenated.Append(value.ToString());
                }
            }
            
            // Calculate HMAC SHA256
            using var hmacSha256 = new HMACSHA256(Encoding.UTF8.GetBytes(_hmacSecret));
            var hashBytes = hmacSha256.ComputeHash(Encoding.UTF8.GetBytes(concatenated.ToString()));
            var calculatedHmac = Convert.ToHexString(hashBytes).ToLower();
            
            // Use constant-time comparison to prevent timing attacks
            var providedHmac = hmacValue?.ToString()?.ToLower() ?? "";
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(calculatedHmac),
                Encoding.UTF8.GetBytes(providedHmac));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying PayMob HMAC");
            return false;
        }
    }
    
    private static object? GetNestedValue(Dictionary<string, object> data, string key)
    {
        var parts = key.Split('.');
        object? current = data;
        
        foreach (var part in parts)
        {
            if (current is Dictionary<string, object> dict && dict.TryGetValue(part, out var value))
            {
                current = value;
            }
            else
            {
                return null;
            }
        }
        
        return current;
    }
    
    private static int GetOrderIdFromObject(object? orderObj)
    {
        if (orderObj == null) return 0;
        
        if (orderObj is int orderId)
            return orderId;
        
        if (orderObj is Dictionary<string, object> orderDict && 
            orderDict.TryGetValue("id", out var id))
        {
            return Convert.ToInt32(id);
        }
        
        // Try to parse from JSON
        try
        {
            var json = JsonSerializer.Serialize(orderObj);
            var element = JsonSerializer.Deserialize<JsonElement>(json);
            if (element.TryGetProperty("id", out var idProp))
            {
                return idProp.GetInt32();
            }
        }
        catch { }
        
        return 0;
    }
    
    private static string GetPaymentMethodFromSource(object? sourceData)
    {
        if (sourceData == null) return "Unknown";
        
        try
        {
            var json = JsonSerializer.Serialize(sourceData);
            var element = JsonSerializer.Deserialize<JsonElement>(json);
            
            if (element.TryGetProperty("type", out var type))
            {
                return type.GetString() ?? "Unknown";
            }
            
            if (element.TryGetProperty("sub_type", out var subType))
            {
                return subType.GetString() ?? "Unknown";
            }
        }
        catch { }
        
        return "Unknown";
    }
    
    #endregion
}
