using System.Net.Http.Json;
using System.Text.Json;
using ConstructionManagement.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

public class PayMobService : IPayMobService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PayMobService> _logger;
    private readonly string _apiKey;

    public PayMobService(HttpClient httpClient, IConfiguration configuration, ILogger<PayMobService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _apiKey = _configuration["PayMob:ApiKey"] ?? string.Empty;
    }

    public async Task<string> GetAuthenticationTokenAsync()
    {
        var response = await _httpClient.PostAsJsonAsync("https://accept.paymob.com/api/auth/tokens", new { api_key = _apiKey });
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        return content.GetProperty("token").GetString() ?? throw new Exception("Failed to get PayMob token");
    }

    public async Task<int> CreateOrderAsync(string authToken, PayMobOrderRequest request)
    {
        var payload = new
        {
            auth_token = authToken,
            delivery_needed = "false",
            amount_cents = request.AmountCents,
            currency = request.Currency,
            merchant_order_id = request.MerchantOrderId,
            items = request.Items ?? Array.Empty<object>()
        };

        var response = await _httpClient.PostAsJsonAsync("https://accept.paymob.com/api/ecommerce/orders", payload);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        return content.GetProperty("id").GetInt32();
    }

    public async Task<string> GetPaymentKeyAsync(string authToken, PayMobPaymentKeyRequest request)
    {
        var payload = new
        {
            auth_token = authToken,
            amount_cents = request.AmountCents,
            expiration = request.Expiration,
            order_id = request.OrderId,
            billing_data = new
            {
                apartment = request.BillingData.Apartment,
                email = request.BillingData.Email,
                floor = request.BillingData.Floor,
                first_name = request.BillingData.FirstName,
                street = request.BillingData.Street,
                building = request.BillingData.Building,
                phone_number = request.BillingData.PhoneNumber,
                shipping_method = request.BillingData.ShippingMethod,
                postal_code = request.BillingData.PostalCode,
                city = request.BillingData.City,
                country = request.BillingData.Country,
                last_name = request.BillingData.LastName,
                state = request.BillingData.State
            },
            currency = request.Currency,
            integration_id = request.IntegrationId
        };

        var response = await _httpClient.PostAsJsonAsync("https://accept.paymob.com/api/acceptance/payment_keys", payload);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        return content.GetProperty("token").GetString() ?? throw new Exception("Failed to get payment key");
    }

    public async Task<PayMobWalletResponse> InitiateWalletPaymentAsync(string paymentKey, string phoneNumber)
    {
        var payload = new
        {
            source = new
            {
                identifier = phoneNumber,
                subtype = "WALLET"
            },
            payment_token = paymentKey
        };

        var response = await _httpClient.PostAsJsonAsync("https://accept.paymob.com/api/acceptance/payments/pay", payload);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<PayMobWalletResponse>();
        return content ?? throw new Exception("Failed to initiate wallet payment");
    }

    public bool ValidateHmac(IDictionary<string, string> queryParams, string hmac)
    {
        var hmacSecret = _configuration["PayMob:HmacSecret"];
        if (string.IsNullOrEmpty(hmacSecret)) return true; // Skip if not configured (not recommended for production)

        // Fields used for HMAC calculation in the specific order required by PayMob
        string[] keys = {
            "amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction",
            "id", "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded",
            "is_standalone_payment", "is_voided", "order", "owner", "pending",
            "source_data.pan", "source_data.sub_type", "source_data.type", "success"
        };

        var concatenatedValues = string.Empty;
        foreach (var key in keys)
        {
            if (queryParams.TryGetValue(key, out var value))
            {
                concatenatedValues += value;
            }
        }

        using var hmacHasher = new System.Security.Cryptography.HMACSHA512(System.Text.Encoding.UTF8.GetBytes(hmacSecret));
        var hashBytes = hmacHasher.ComputeHash(System.Text.Encoding.UTF8.GetBytes(concatenatedValues));
        var calculatedHmac = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        return string.Equals(calculatedHmac, hmac, StringComparison.OrdinalIgnoreCase);
    }

    public Task<string> GetAuthTokenAsync() => GetAuthenticationTokenAsync();

    public Task<PayMobCallbackResult> ProcessCallbackAsync(Dictionary<string, object> callbackData)
    {
        try
        {
            var obj = callbackData["obj"] as JsonElement?;
            if (obj == null) return Task.FromResult(new PayMobCallbackResult { Success = false, Message = "Missing obj in callback" });

            return Task.FromResult(new PayMobCallbackResult
            {
                Success = obj.Value.GetProperty("success").GetBoolean(),
                OrderId = obj.Value.GetProperty("order").GetProperty("id").GetInt32(),
                TransactionId = obj.Value.GetProperty("id").GetInt32(),
                RawData = JsonSerializer.Serialize(callbackData)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse PayMob callback");
            return Task.FromResult(new PayMobCallbackResult { Success = false, Message = ex.Message });
        }
    }

    public async Task<PayMobRefundResult> RefundPaymentAsync(string authToken, int transactionId, int amountCents)
    {
        var payload = new { auth_token = authToken, transaction_id = transactionId, amount_cents = amountCents };
        var response = await _httpClient.PostAsJsonAsync("https://accept.paymob.com/api/acceptance/void_refund/refund", payload);
        
        if (!response.IsSuccessStatusCode) return new PayMobRefundResult { Success = false, ErrorMessage = await response.Content.ReadAsStringAsync() };

        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        return new PayMobRefundResult
        {
            Success = content.GetProperty("success").GetBoolean(),
            RefundId = content.GetProperty("id").GetInt32()
        };
    }

    public async Task<PayMobPaymentLinkResult> CreatePaymentLinkAsync(decimal amount, string currency, 
        string merchantOrderId, PayMobBillingData billingData, List<PayMobOrderItem> items,
        string callbackUrl, string returnUrl)
    {
        try
        {
            var authToken = await GetAuthenticationTokenAsync();
            var orderPayload = new PayMobOrderRequest 
            { 
                AmountCents = ((int)(amount * 100)).ToString(), 
                Currency = currency, 
                MerchantOrderId = merchantOrderId, 
                Items = items 
            };
            
            var orderId = await CreateOrderAsync(authToken, orderPayload);
            
            var integrationId = int.TryParse(_configuration["PayMob:IntegrationId"], out var id) ? id : 0;
            var paymentKey = await GetPaymentKeyAsync(authToken, new PayMobPaymentKeyRequest
            {
                AmountCents = ((int)(amount * 100)).ToString(),
                Currency = currency,
                OrderId = orderId,
                BillingData = billingData,
                IntegrationId = integrationId
            });

            return new PayMobPaymentLinkResult
            {
                Success = true,
                PaymentKey = paymentKey,
                OrderId = orderId,
                PaymentUrl = $"https://accept.paymob.com/api/acceptance/iframes/{_configuration["PayMob:IframeId"]}?payment_token={paymentKey}"
            };
        }
        catch (Exception ex)
        {
            return new PayMobPaymentLinkResult { Success = false, ErrorMessage = ex.Message };
        }
    }

    public async Task<PayMobWalletPaymentResult> CreateWalletPaymentAsync(string paymentKey, string phoneNumber, string walletProvider)
    {
        try
        {
            var response = await InitiateWalletPaymentAsync(paymentKey, phoneNumber);
            return new PayMobWalletPaymentResult
            {
                Success = true,
                RedirectUrl = response.RedirectUrl
            };
        }
        catch (Exception ex)
        {
            return new PayMobWalletPaymentResult { Success = false, ErrorMessage = ex.Message };
        }
    }
}

