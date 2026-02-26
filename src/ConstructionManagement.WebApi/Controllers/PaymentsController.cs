using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : BaseApiController
    {
        private readonly IPaymentService _paymentService;
        private readonly IPayMobService _payMobService;
        private readonly IFawryService _fawryService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(
            IPaymentService paymentService,
            IPayMobService payMobService,
            IFawryService fawryService,
            ILogger<PaymentsController> logger)
        {
            _paymentService = paymentService;
            _payMobService = payMobService;
            _fawryService = fawryService;
            _logger = logger;
        }

        /// <summary>
        /// Get payment transaction by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PaymentTransactionDto>> GetTransaction(int id)
        {
            var companyId = GetCompanyId();
            var transaction = await _paymentService.GetTransactionByIdAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }
            
            // Company isolation: Only SuperAdmin can view any transaction, CompanyAdmin can only view their company's
            if (!User.IsInRole("SuperAdmin") && transaction.CompanyId != companyId)
            {
                return Forbid();
            }
            
            return Ok(transaction);
        }

        /// <summary>
        /// Get payment history for company
        /// </summary>
        [HttpGet("history")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PaymentHistoryDto>> GetPaymentHistory(
            [FromQuery] int? projectId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var companyId = GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest("Company context not found");
            }

            var history = await _paymentService.GetPaymentHistoryAsync(companyId.Value, projectId, page, pageSize);
            return Ok(history);
        }

        /// <summary>
        /// Get payment summary for dashboard
        /// </summary>
        [HttpGet("summary")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PaymentSummaryDto>> GetPaymentSummary()
        {
            var companyId = GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest("Company context not found");
            }

            var summary = await _paymentService.GetPaymentSummaryAsync(companyId.Value);
            return Ok(summary);
        }

        /// <summary>
        /// Get payments for a specific project
        /// </summary>
        [HttpGet("project/{projectId}")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<System.Collections.Generic.List<PaymentTransactionDto>>> GetProjectPayments(int projectId)
        {
            var companyId = GetCompanyId();
            var payments = await _paymentService.GetProjectPaymentsAsync(projectId, companyId, User.IsInRole("SuperAdmin"));
            return Ok(payments);
        }

        /// <summary>
        /// Initiate online payment (Client or Company Admin)
        /// </summary>
        [HttpPost("initiate")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,CompanyOwner,Client")]
        [EnableRateLimiting("PaymentRateLimit")]
        public async Task<ActionResult<PaymentResultDto>> InitiatePayment([FromBody] CreateOnlinePaymentRequest request)
        {
            var userId = GetUserId();
            var result = await _paymentService.InitiateOnlinePaymentAsync(userId, request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }
            
            return Ok(result);
        }

        /// <summary>
        /// Confirm online payment after gateway processing
        /// </summary>
        [HttpPost("{transactionId}/confirm")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,CompanyOwner,Client")]
        [EnableRateLimiting("PaymentRateLimit")]
        public async Task<ActionResult<PaymentResultDto>> ConfirmPayment(int transactionId, [FromBody] GatewayConfirmPaymentRequest request)
        {
            var result = await _paymentService.ConfirmOnlinePaymentAsync(transactionId, request.PaymentIntentId);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }
            
            return Ok(result);
        }

        /// <summary>
        /// Record offline payment (Company Admin)
        /// </summary>
        [HttpPost("record-offline")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PaymentTransactionDto>> RecordOfflinePayment([FromBody] RecordOfflinePaymentRequest request)
        {
            var userId = GetUserId();
            var companyId = GetCompanyId();
            
            if (!companyId.HasValue)
            {
                return BadRequest("Company context not found");
            }

            var transaction = await _paymentService.RecordOfflinePaymentAsync(userId, companyId.Value, request);
            return Ok(transaction);
        }

        /// <summary>
        /// Update payment status
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PaymentTransactionDto>> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var transaction = await _paymentService.UpdatePaymentStatusAsync(id, request.Status, request.Notes);
                return Ok(transaction);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        /// <summary>
        /// Refund a payment
        /// </summary>
        [HttpPost("{id}/refund")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PaymentResultDto>> RefundPayment(int id, [FromBody] RefundPaymentRequest request)
        {
            request.TransactionId = id;
            var userId = GetUserId();
            var result = await _paymentService.RefundPaymentAsync(userId, request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }
            
            return Ok(result);
        }

        /// <summary>
        /// Get payment settings
        /// </summary>
        [HttpGet("settings")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PaymentSettingsDto>> GetPaymentSettings()
        {
            var companyId = GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest("Company context not found");
            }

            var settings = await _paymentService.GetPaymentSettingsAsync(companyId.Value);
            return Ok(settings);
        }

        /// <summary>
        /// Update payment settings
        /// </summary>
        [HttpPut("settings")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<PaymentSettingsDto>> UpdatePaymentSettings([FromBody] UpdatePaymentSettingsRequest request)
        {
            var companyId = GetCompanyId();
            if (!companyId.HasValue)
            {
                return BadRequest("Company context not found");
            }

            var settings = await _paymentService.UpdatePaymentSettingsAsync(companyId.Value, request);
            return Ok(settings);
        }

        /// <summary>
        /// Get client payment history (for client portal)
        /// </summary>
        [HttpGet("client-history")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin,Client")]
        public async Task<ActionResult<PaymentHistoryDto>> GetClientPaymentHistory()
        {
            var userId = GetUserId();
            var history = await _paymentService.GetClientPaymentHistoryAsync(userId);
            return Ok(history);
        }

        /// <summary>
        /// Stripe webhook endpoint
        /// </summary>
        /// <remarks>
        /// This endpoint is called by Stripe to notify about payment events.
        /// It validates the Stripe signature to ensure the request is authentic.
        /// </remarks>
        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> HandleWebhook()
        {
            var signature = Request.Headers["Stripe-Signature"].ToString();
            
            // Validate that signature header is present
            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Stripe webhook received without signature header");
                return BadRequest(new { error = "Missing Stripe signature header" });
            }

            // Read the raw body for signature verification
            using var reader = new System.IO.StreamReader(Request.Body);
            var payload = await reader.ReadToEndAsync();
            
            // Validate payload is not empty
            if (string.IsNullOrEmpty(payload))
            {
                _logger.LogWarning("Stripe webhook received with empty payload");
                return BadRequest(new { error = "Empty payload" });
            }
            
            try
            {
                var result = await _paymentService.HandleWebhookAsync(payload, signature);
                
                if (!result.Success)
                {
                    _logger.LogWarning("Stripe webhook processing failed: {Message}", result.Message);
                    return BadRequest(new { error = result.Message });
                }
                
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                // Signature verification failed
                _logger.LogError(ex, "Stripe webhook signature verification failed");
                return Unauthorized(new { error = "Invalid webhook signature" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Stripe webhook");
                return StatusCode(500, new { error = "Internal server error processing webhook" });
            }
        }

        #region Egyptian Payment Methods (PayMob, Fawry, Mobile Wallets)

        /// <summary>
        /// Initiate marketplace payment with Egyptian payment methods
        /// </summary>
        /// <remarks>
        /// Supported payment methods:
        /// - Card (Visa/Mastercard) via PayMob
        /// - PayMob wallet
        /// - Fawry
        /// - Vodafone Cash
        /// - Orange Money
        /// - Etisalat Cash
        /// - Cash on Delivery
        /// </remarks>
        [HttpPost("marketplace/initiate")]
        [Authorize]
        [EnableRateLimiting("PaymentRateLimit")]
        public async Task<ActionResult<MarketplacePaymentResponse>> InitiateMarketplacePayment([FromBody] MarketplacePaymentRequest request)
        {
            try
            {
                var userId = GetUserId();
                
                // Get order details from service
                var order = await _paymentService.GetOrderForPaymentAsync(request.OrderId, userId);
                if (order == null)
                {
                    return NotFound(new { error = "Order not found or not accessible" });
                }

                var merchantOrderId = $"ORD-{request.OrderId}-{DateTime.UtcNow.Ticks}";
                
                switch (request.PaymentMethod)
                {
                    case MarketplacePaymentMethod.Card:
                    case MarketplacePaymentMethod.PayMob:
                        return await InitiatePayMobCardPayment(order, merchantOrderId, request);
                    
                    case MarketplacePaymentMethod.VodafoneCash:
                    case MarketplacePaymentMethod.OrangeMoney:
                    case MarketplacePaymentMethod.EtisalatCash:
                        return await InitiatePayMobWalletPayment(order, merchantOrderId, request);
                    
                    case MarketplacePaymentMethod.Fawry:
                        return await InitiateFawryPayment(order, merchantOrderId, request);
                    
                    case MarketplacePaymentMethod.CashOnDelivery:
                        return await InitiateCashOnDelivery(order, merchantOrderId, request);
                    
                    default:
                        return BadRequest(new { error = "Unsupported payment method" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initiating marketplace payment for order {OrderId}", request.OrderId);
                return StatusCode(500, new { error = "Error processing payment request" });
            }
        }

        /// <summary>
        /// PayMob callback endpoint for card payments
        /// </summary>
        [HttpPost("paymob/callback")]
        [AllowAnonymous]
        public async Task<IActionResult> PayMobCallback()
        {
            try
            {
                using var reader = new System.IO.StreamReader(Request.Body);
                var payload = await reader.ReadToEndAsync();
                
                var callbackData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(payload);
                if (callbackData == null)
                {
                    return BadRequest(new { error = "Invalid callback data" });
                }

                var result = await _payMobService.ProcessCallbackAsync(callbackData);
                
                if (result.Success)
                {
                    // Update order payment status
                    await _paymentService.UpdateOrderPaymentStatusAsync(
                        result.OrderId,
                        result.TransactionId.ToString(),
                        PaymentStatus.Completed,
                        result.RawData);
                    
                    _logger.LogInformation("PayMob payment successful for order {OrderId}", result.OrderId);
                }
                else
                {
                    _logger.LogWarning("PayMob payment failed for order {OrderId}: {Message}", 
                        result.OrderId, result.Message);
                }
                
                return Ok(new { processed = true, success = result.Success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayMob callback");
                return StatusCode(500, new { error = "Error processing callback" });
            }
        }

        /// <summary>
        /// Fawry callback endpoint
        /// </summary>
        [HttpPost("fawry/callback")]
        [AllowAnonymous]
        public async Task<IActionResult> FawryCallback()
        {
            try
            {
                using var reader = new System.IO.StreamReader(Request.Body);
                var payload = await reader.ReadToEndAsync();
                
                var callbackData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(payload);
                if (callbackData == null)
                {
                    return BadRequest(new { error = "Invalid callback data" });
                }

                // Verify signature
                var signature = callbackData.TryGetValue("signature", out var sig) ? sig?.ToString() : "";
                if (!_fawryService.VerifyCallbackSignature(callbackData, signature ?? ""))
                {
                    _logger.LogWarning("Fawry callback signature verification failed");
                    return Unauthorized(new { error = "Invalid signature" });
                }

                var result = await _fawryService.ProcessCallbackAsync(callbackData);
                
                if (result.Success)
                {
                    // Update order payment status
                    await _paymentService.UpdateOrderPaymentStatusByReferenceAsync(
                        result.MerchantRefNumber,
                        result.ReferenceNumber,
                        PaymentStatus.Completed,
                        result.RawData);
                    
                    _logger.LogInformation("Fawry payment successful for order {MerchantRef}", result.MerchantRefNumber);
                }
                else
                {
                    _logger.LogWarning("Fawry payment failed for order {MerchantRef}: {Message}", 
                        result.MerchantRefNumber, result.Message);
                }
                
                return Ok(new { processed = true, success = result.Success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Fawry callback");
                return StatusCode(500, new { error = "Error processing callback" });
            }
        }

        /// <summary>
        /// Get payment status for marketplace order
        /// </summary>
        [HttpGet("marketplace/status/{orderId}")]
        [Authorize]
        public async Task<ActionResult<PaymentStatusResponse>> GetMarketplacePaymentStatus(int orderId)
        {
            var userId = GetUserId();
            var status = await _paymentService.GetMarketplacePaymentStatusAsync(orderId, userId);
            
            if (status == null)
            {
                return NotFound(new { error = "Payment not found" });
            }
            
            return Ok(status);
        }

        /// <summary>
        /// Get payment history for current user (marketplace orders)
        /// </summary>
        [HttpGet("marketplace/history")]
        [Authorize]
        public async Task<ActionResult<PaymentHistoryResponse>> GetMarketplacePaymentHistory(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();
            var history = await _paymentService.GetMarketplacePaymentHistoryAsync(userId, page, pageSize);
            return Ok(history);
        }

        /// <summary>
        /// Refund marketplace payment
        /// </summary>
        [HttpPost("marketplace/refund")]
        [Authorize(Roles = "SuperAdmin,CompanyAdmin")]
        public async Task<ActionResult<MarketplaceRefundResponse>> RefundMarketplacePayment([FromBody] MarketplaceRefundRequest request)
        {
            try
            {
                var userId = GetUserId();
                
                // Get payment details
                var payment = await _paymentService.GetPaymentByPaymentIdAsync(request.PaymentId);
                if (payment == null)
                {
                    return NotFound(new { error = "Payment not found" });
                }

                // Process refund based on original payment method
                switch (payment.PaymentMethod)
                {
                    case MarketplacePaymentMethod.Card:
                    case MarketplacePaymentMethod.PayMob:
                    case MarketplacePaymentMethod.VodafoneCash:
                    case MarketplacePaymentMethod.OrangeMoney:
                    case MarketplacePaymentMethod.EtisalatCash:
                        var authToken = await _payMobService.GetAuthTokenAsync();
                        var refundResult = await _payMobService.RefundPaymentAsync(
                            authToken,
                            int.Parse(payment.ReferenceNumber ?? "0"),
                            (int)(request.Amount * 100));
                        
                        if (refundResult.Success)
                        {
                            await _paymentService.UpdateOrderPaymentStatusAsync(
                                payment.OrderId,
                                refundResult.RefundId?.ToString() ?? "",
                                PaymentStatus.Refunded,
                                new { refundAmount = request.Amount, reason = request.Reason });
                        }
                        
                        return Ok(new MarketplaceRefundResponse
                        {
                            Success = refundResult.Success,
                            RefundId = refundResult.RefundId?.ToString(),
                            RefundedAmount = request.Amount,
                            ErrorMessage = refundResult.ErrorMessage
                        });

                    case MarketplacePaymentMethod.Fawry:
                        var fawryRefund = await _fawryService.RefundPaymentAsync(new FawryRefundRequest
                        {
                            ReferenceNumber = payment.ReferenceNumber ?? "",
                            RefundNumber = $"REF-{DateTime.UtcNow.Ticks}",
                            RefundAmount = request.Amount,
                            Reason = request.Reason
                        });
                        
                        if (fawryRefund.Success)
                        {
                            await _paymentService.UpdateOrderPaymentStatusAsync(
                                payment.OrderId,
                                fawryRefund.RefundNumber ?? "",
                                PaymentStatus.Refunded,
                                new { refundAmount = request.Amount, reason = request.Reason });
                        }
                        
                        return Ok(new MarketplaceRefundResponse
                        {
                            Success = fawryRefund.Success,
                            RefundId = fawryRefund.RefundNumber,
                            RefundedAmount = request.Amount,
                            ErrorMessage = fawryRefund.ErrorMessage
                        });

                    default:
                        return BadRequest(new { error = "Refund not supported for this payment method" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing refund for payment {PaymentId}", request.PaymentId);
                return StatusCode(500, new { error = "Error processing refund" });
            }
        }

        #endregion

        #region Private Payment Helper Methods

        private async Task<ActionResult<MarketplacePaymentResponse>> InitiatePayMobCardPayment(
            dynamic order, 
            string merchantOrderId,
            MarketplacePaymentRequest request)
        {
            var items = new List<PayMobOrderItem>();
            
            // Add order items
            foreach (var item in order.Items)
            {
                items.Add(new PayMobOrderItem
                {
                    Name = item.ProductName,
                    AmountCents = (int)(item.UnitPrice * 100),
                    Description = item.ProductName,
                    Quantity = item.Quantity
                });
            }

            var billingData = new PayMobBillingData
            {
                FirstName = request.BillingInfo.FirstName,
                LastName = request.BillingInfo.LastName,
                Email = request.BillingInfo.Email,
                PhoneNumber = request.BillingInfo.PhoneNumber,
                City = request.BillingInfo.City ?? "Cairo",
                Street = request.BillingInfo.Street ?? "",
                Building = request.BillingInfo.Building ?? "",
                Floor = request.BillingInfo.Floor ?? "",
                Apartment = request.BillingInfo.Apartment ?? ""
            };

            var result = await _payMobService.CreatePaymentLinkAsync(
                order.TotalAmount,
                "EGP",
                merchantOrderId,
                billingData,
                items,
                $"{Request.Scheme}://{Request.Host}/api/payments/paymob/callback",
                $"{Request.Scheme}://{Request.Host}/payment/success");

            if (!result.Success)
            {
                return BadRequest(new MarketplacePaymentResponse
                {
                    Success = false,
                    ErrorMessage = result.ErrorMessage
                });
            }

            // Save payment record
            await _paymentService.CreatePaymentRecordAsync(new CreatePaymentRecordRequest
            {
                OrderId = request.OrderId,
                PaymentId = result.PaymentKey,
                ReferenceNumber = result.OrderId?.ToString(),
                PaymentMethod = request.PaymentMethod,
                Amount = order.TotalAmount,
                Currency = "EGP"
            });

            return Ok(new MarketplacePaymentResponse
            {
                Success = true,
                PaymentId = result.PaymentKey,
                ReferenceNumber = result.OrderId?.ToString(),
                PaymentUrl = result.PaymentUrl,
                PaymentMethod = request.PaymentMethod,
                Amount = order.TotalAmount,
                Currency = "EGP"
            });
        }

        private async Task<ActionResult<MarketplacePaymentResponse>> InitiatePayMobWalletPayment(
            dynamic order,
            string merchantOrderId,
            MarketplacePaymentRequest request)
        {
            if (string.IsNullOrEmpty(request.PhoneNumber))
            {
                return BadRequest(new MarketplacePaymentResponse
                {
                    Success = false,
                    ErrorMessage = "Phone number is required for wallet payments"
                });
            }

            var walletProvider = request.WalletProvider switch
            {
                WalletProvider.VodafoneCash => "vodafone",
                WalletProvider.OrangeMoney => "orange",
                WalletProvider.EtisalatCash => "etisalat",
                _ => "vodafone"
            };

            // First create card payment to get payment key
            var items = new List<PayMobOrderItem>
            {
                new PayMobOrderItem
                {
                    Name = $"Order #{request.OrderId}",
                    AmountCents = (int)(order.TotalAmount * 100),
                    Description = $"Marketplace Order #{request.OrderId}",
                    Quantity = 1
                }
            };

            var billingData = new PayMobBillingData
            {
                FirstName = request.BillingInfo.FirstName,
                LastName = request.BillingInfo.LastName,
                Email = request.BillingInfo.Email,
                PhoneNumber = request.PhoneNumber
            };

            var paymentResult = await _payMobService.CreatePaymentLinkAsync(
                order.TotalAmount,
                "EGP",
                merchantOrderId,
                billingData,
                items,
                $"{Request.Scheme}://{Request.Host}/api/payments/paymob/callback",
                $"{Request.Scheme}://{Request.Host}/payment/success");

            if (!paymentResult.Success || string.IsNullOrEmpty(paymentResult.PaymentKey))
            {
                return BadRequest(new MarketplacePaymentResponse
                {
                    Success = false,
                    ErrorMessage = paymentResult.ErrorMessage ?? "Failed to initiate wallet payment"
                });
            }

            // Now process wallet payment
            var walletResult = await _payMobService.CreateWalletPaymentAsync(
                paymentResult.PaymentKey,
                request.PhoneNumber,
                walletProvider);

            // Save payment record
            await _paymentService.CreatePaymentRecordAsync(new CreatePaymentRecordRequest
            {
                OrderId = request.OrderId,
                PaymentId = paymentResult.PaymentKey,
                ReferenceNumber = paymentResult.OrderId?.ToString(),
                PaymentMethod = request.PaymentMethod,
                Amount = order.TotalAmount,
                Currency = "EGP"
            });

            return Ok(new MarketplacePaymentResponse
            {
                Success = walletResult.Success,
                PaymentId = paymentResult.PaymentKey,
                ReferenceNumber = paymentResult.OrderId?.ToString(),
                PaymentUrl = walletResult.RedirectUrl,
                PaymentMethod = request.PaymentMethod,
                Amount = order.TotalAmount,
                Currency = "EGP",
                ErrorMessage = walletResult.ErrorMessage
            });
        }

        private async Task<ActionResult<MarketplacePaymentResponse>> InitiateFawryPayment(
            dynamic order,
            string merchantOrderId,
            MarketplacePaymentRequest request)
        {
            var chargeRequest = new FawryChargeRequest
            {
                MerchantRefNumber = merchantOrderId,
                CustomerCode = GetUserId().ToString(),
                CustomerMobile = request.BillingInfo.PhoneNumber,
                CustomerEmail = request.BillingInfo.Email,
                CustomerName = $"{request.BillingInfo.FirstName} {request.BillingInfo.LastName}",
                Amount = order.TotalAmount,
                Description = $"Marketplace Order #{request.OrderId}",
                ChargeItems = new List<FawryChargeItem>()
            };

            // Add order items
            foreach (var item in order.Items)
            {
                chargeRequest.ChargeItems.Add(new FawryChargeItem
                {
                    ItemId = item.ProductId.ToString(),
                    Description = item.ProductName,
                    Price = item.UnitPrice,
                    Quantity = item.Quantity
                });
            }

            var result = await _fawryService.CreateChargeAsync(chargeRequest);

            if (!result.Success)
            {
                return BadRequest(new MarketplacePaymentResponse
                {
                    Success = false,
                    ErrorMessage = result.ErrorMessage
                });
            }

            // Save payment record
            await _paymentService.CreatePaymentRecordAsync(new CreatePaymentRecordRequest
            {
                OrderId = request.OrderId,
                PaymentId = result.ReferenceNumber,
                ReferenceNumber = result.ReferenceNumber,
                PaymentMethod = MarketplacePaymentMethod.Fawry,
                Amount = order.TotalAmount,
                Currency = "EGP"
            });

            return Ok(new MarketplacePaymentResponse
            {
                Success = true,
                PaymentId = result.ReferenceNumber,
                ReferenceNumber = result.ReferenceNumber,
                PaymentUrl = result.PaymentUrl,
                PaymentMethod = MarketplacePaymentMethod.Fawry,
                Amount = order.TotalAmount,
                Currency = "EGP"
            });
        }

        private async Task<ActionResult<MarketplacePaymentResponse>> InitiateCashOnDelivery(
            dynamic order,
            string merchantOrderId,
            MarketplacePaymentRequest request)
        {
            if (request.DeliveryAddress == null)
            {
                return BadRequest(new MarketplacePaymentResponse
                {
                    Success = false,
                    ErrorMessage = "Delivery address is required for cash on delivery"
                });
            }

            var codRequest = new FawryCashOnDeliveryRequest
            {
                MerchantRefNumber = merchantOrderId,
                CustomerCode = GetUserId().ToString(),
                CustomerMobile = request.BillingInfo.PhoneNumber,
                CustomerEmail = request.BillingInfo.Email,
                CustomerName = $"{request.BillingInfo.FirstName} {request.BillingInfo.LastName}",
                Amount = order.TotalAmount,
                Description = $"Marketplace Order #{request.OrderId}",
                DeliveryAddress = $"{request.DeliveryAddress.Address}, {request.DeliveryAddress.Area}, {request.DeliveryAddress.City}",
                ChargeItems = new List<FawryChargeItem>()
            };

            // Add order items
            foreach (var item in order.Items)
            {
                codRequest.ChargeItems.Add(new FawryChargeItem
                {
                    ItemId = item.ProductId.ToString(),
                    Description = item.ProductName,
                    Price = item.UnitPrice,
                    Quantity = item.Quantity
                });
            }

            var result = await _fawryService.CreateCashOnDeliveryAsync(codRequest);

            if (!result.Success)
            {
                return BadRequest(new MarketplacePaymentResponse
                {
                    Success = false,
                    ErrorMessage = result.ErrorMessage
                });
            }

            // Save payment record
            await _paymentService.CreatePaymentRecordAsync(new CreatePaymentRecordRequest
            {
                OrderId = request.OrderId,
                PaymentId = result.ReferenceNumber,
                ReferenceNumber = result.ReferenceNumber,
                PaymentMethod = MarketplacePaymentMethod.CashOnDelivery,
                Amount = order.TotalAmount,
                Currency = "EGP"
            });

            return Ok(new MarketplacePaymentResponse
            {
                Success = true,
                PaymentId = result.ReferenceNumber,
                ReferenceNumber = result.ReferenceNumber,
                PaymentMethod = MarketplacePaymentMethod.CashOnDelivery,
                Amount = order.TotalAmount,
                Currency = "EGP"
            });
        }

        #endregion


    }

    // Request DTOs for controller
    public class GatewayConfirmPaymentRequest
    {
        public string PaymentIntentId { get; set; } = string.Empty;
    }

    public class UpdateStatusRequest
    {
        public PaymentStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}
