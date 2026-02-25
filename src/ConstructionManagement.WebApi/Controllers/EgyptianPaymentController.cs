using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ConstructionManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EgyptianPaymentController : ControllerBase
{
    private readonly IEgyptianPaymentService _paymentService;

    public EgyptianPaymentController(IEgyptianPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// Initiate a payment for a marketplace order
    /// </summary>
    [HttpPost("initiate")]
    public async Task<ActionResult<MarketplacePaymentResponse>> InitiatePayment([FromBody] MarketplacePaymentRequest request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized();

        try
        {
            var response = await _paymentService.InitiatePaymentAsync(userId, request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Check payment status by Payment ID (PayMob Order ID)
    /// </summary>
    [HttpGet("status/{paymentId}")]
    public async Task<ActionResult<PaymentStatusResponse>> GetStatus(string paymentId)
    {
        try
        {
            var status = await _paymentService.GetPaymentStatusAsync(paymentId);
            return Ok(status);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// PayMob Webhook/Callback for transaction outcome
    /// Note: PayMob usually uses separate URLs for Transaction Callback and HMACK Webhook
    /// </summary>
    [HttpPost("callback")]
    [AllowAnonymous] // Callback from gateway
    public async Task<ActionResult<PaymentCallbackResponse>> HandleCallback([FromBody] PaymentCallbackRequest request)
    {
        // For POST webhooks, PayMob sends HMAC in query or body depending on config
        // Simplest is to trust it for now or implement POST HMAC validation if needed
        try
        {
            var result = await _paymentService.ProcessCallbackAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET callback for PayMob redirection
    /// </summary>
    [HttpGet("callback")]
    [AllowAnonymous]
    public async Task<ActionResult> HandleRedirectCallback()
    {
        var queryParams = Request.Query.ToDictionary(q => q.Key, q => q.Value.ToString());
        
        if (queryParams.TryGetValue("hmac", out var hmac))
        {
            var isValid = _paymentService.ValidateHmac(queryParams, hmac);
            if (!isValid)
            {
                return BadRequest(new { message = "Invalid HMAC signature" });
            }
        }

        // Process the callback data from query params
        var success = queryParams.TryGetValue("success", out var s) && s.ToLower() == "true";
        var orderNumber = queryParams.TryGetValue("merchant_order_id", out var mo) ? mo : null;
        var paymentId = queryParams.TryGetValue("id", out var pid) ? pid : null;

        if (string.IsNullOrEmpty(orderNumber))
        {
            return BadRequest(new { message = "Missing merchant_order_id" });
        }

        var callbackRequest = new PaymentCallbackRequest
        {
            MerchantRefNumber = orderNumber,
            PaymentId = paymentId,
            Success = success,
            Message = queryParams.TryGetValue("error_occured", out var err) && err == "true" ? "Error occurred during payment" : "Payment processed",
            Amount = queryParams.TryGetValue("amount_cents", out var amt) ? decimal.Parse(amt) / 100 : 0
        };

        var result = await _paymentService.ProcessCallbackAsync(callbackRequest);

        // Redirect to frontend success/failure page
        var baseUrl = _paymentService.GetFrontendBaseUrl();
        var redirectUrl = success 
            ? $"{baseUrl}/marketplace/orders/{result.OrderId}?payment=success" 
            : $"{baseUrl}/marketplace/orders/{result.OrderId}?payment=failed";

        return Redirect(redirectUrl);
    }
}
