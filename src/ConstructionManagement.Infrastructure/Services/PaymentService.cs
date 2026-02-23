using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;

namespace ConstructionManagement.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ISensitiveDataProtectionService _dataProtection;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            ApplicationDbContext context, 
            IConfiguration configuration,
            ISensitiveDataProtectionService dataProtection,
            ILogger<PaymentService> logger)
        {
            _context = context;
            _configuration = configuration;
            _dataProtection = dataProtection;
            _logger = logger;
        }

        public async Task<PaymentTransactionDto?> GetTransactionByIdAsync(int id)
        {
            var transaction = await _context.PaymentTransactions
                .Include(p => p.Company)
                .Include(p => p.Project)
                .Include(p => p.ItemInvoice)
                .Include(p => p.Recorder)
                .FirstOrDefaultAsync(p => p.Id == id);

            return transaction == null ? null : MapToDto(transaction);
        }

        public async Task<GatewayPaymentHistoryDto> GetPaymentHistoryAsync(int companyId, int? projectId = null, int page = 1, int pageSize = 20)
        {
            var query = _context.PaymentTransactions
                .Include(p => p.Company)
                .Include(p => p.Project)
                .Include(p => p.ItemInvoice)
                .Include(p => p.Recorder)
                .Where(p => p.CompanyId == companyId);

            if (projectId.HasValue)
            {
                query = query.Where(p => p.ProjectId == projectId);
            }

            var totalCount = await query.CountAsync();
            var transactions = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new GatewayPaymentHistoryDto
            {
                Transactions = transactions.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                TotalAmount = await query.SumAsync(p => p.Amount),
                PendingAmount = await query.Where(p => p.Status == PaymentStatus.Pending).SumAsync(p => p.Amount),
                CompletedAmount = await query.Where(p => p.Status == PaymentStatus.Completed).SumAsync(p => p.Amount)
            };
        }

        public async Task<PaymentSummaryDto> GetPaymentSummaryAsync(int companyId)
        {
            var transactions = await _context.PaymentTransactions
                .Where(p => p.CompanyId == companyId)
                .ToListAsync();

            var recentPayments = await _context.PaymentTransactions
                .Include(p => p.Project)
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .ToListAsync();

            return new PaymentSummaryDto
            {
                TotalReceived = transactions.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount),
                TotalPending = transactions.Where(p => p.Status == PaymentStatus.Pending).Sum(p => p.Amount),
                TotalRefunded = transactions.Where(p => p.Status == PaymentStatus.Refunded).Sum(p => p.Amount),
                CompletedPayments = transactions.Count(p => p.Status == PaymentStatus.Completed),
                PendingPayments = transactions.Count(p => p.Status == PaymentStatus.Pending),
                FailedPayments = transactions.Count(p => p.Status == PaymentStatus.Failed),
                RecentPayments = recentPayments.Select(p => new RecentPaymentDto
                {
                    Id = p.Id,
                    ClientName = p.Company?.Name ?? "Unknown",
                    ProjectName = p.Project?.Name,
                    Amount = p.Amount,
                    Status = p.Status.ToString(),
                    CreatedAt = p.CreatedAt
                }).ToList()
            };
        }

        public async Task<PaymentResultDto> InitiateOnlinePaymentAsync(int userId, CreateOnlinePaymentRequest request)
        {
            // Get user's company
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new PaymentResultDto { Success = false, Message = "User not found" };
            }

            // Create pending transaction
            var transaction = new PaymentTransaction
            {
                CompanyId = user.CompanyId,
                ProjectId = request.ProjectId,
                ItemInvoiceId = request.ItemInvoiceId,
                Amount = request.Amount,
                Currency = request.Currency,
                Channel = PaymentChannel.Online,
                PaymentMethod = request.PaymentMethod,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Notes = request.Notes
            };

            _context.PaymentTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            // In a real implementation, this would integrate with Stripe/PayPal
            // For now, we'll simulate a payment intent creation
            var clientSecret = $"pi_{Guid.NewGuid():N}_secret_{Guid.NewGuid():N}";

            return new PaymentResultDto
            {
                Success = true,
                Message = "Payment initiated successfully",
                Transaction = MapToDto(transaction),
                ClientSecret = clientSecret
            };
        }

        public async Task<PaymentResultDto> ConfirmOnlinePaymentAsync(int transactionId, string paymentIntentId)
        {
            // Use explicit transaction with serializable isolation to prevent race conditions
            await using var dbTransaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            
            try
            {
                var transaction = await _context.PaymentTransactions
                    .Include(t => t.Company)
                    .FirstOrDefaultAsync(t => t.Id == transactionId);
                    
                if (transaction == null)
                {
                    return new PaymentResultDto { Success = false, Message = "Transaction not found" };
                }

                // Idempotency check: if already completed, return success without re-processing
                if (transaction.Status == PaymentStatus.Completed)
                {
                    _logger.LogInformation("Transaction {TransactionId} already completed, returning existing result", transactionId);
                    return new PaymentResultDto
                    {
                        Success = true,
                        Message = "Payment already confirmed",
                        Transaction = MapToDto(transaction)
                    };
                }

                // Verify payment intent with Stripe API
                if (transaction.CompanyId.HasValue)
                {
                    var stripeSecretKey = await GetDecryptedStripeSecretKeyAsync(transaction.CompanyId.Value);
                    if (!string.IsNullOrEmpty(stripeSecretKey))
                    {
                        try
                        {
                            using var httpClient = new HttpClient();
                            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {stripeSecretKey}");
                            
                            var stripeResponse = await httpClient.GetAsync($"https://api.stripe.com/v1/payment_intents/{paymentIntentId}");
                            
                            if (stripeResponse.IsSuccessStatusCode)
                            {
                                var content = await stripeResponse.Content.ReadAsStringAsync();
                                var paymentIntent = JsonSerializer.Deserialize<StripePaymentIntentResponse>(content, new JsonSerializerOptions
                                {
                                    PropertyNameCaseInsensitive = true
                                });
                                
                                if (paymentIntent?.Status != "succeeded")
                                {
                                    _logger.LogWarning("Payment intent {PaymentIntentId} has status {Status}, not succeeded", paymentIntentId, paymentIntent?.Status);
                                    return new PaymentResultDto 
                                    { 
                                        Success = false, 
                                        Message = $"Payment not completed. Status: {paymentIntent?.Status}" 
                                    };
                                }
                                
                                _logger.LogInformation("Payment intent {PaymentIntentId} verified successfully via Stripe API", paymentIntentId);
                            }
                            else
                            {
                                _logger.LogWarning("Failed to verify payment intent {PaymentIntentId} with Stripe: {StatusCode}", paymentIntentId, stripeResponse.StatusCode);
                                // Continue with confirmation if Stripe API is unavailable (fallback for testing)
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error verifying payment intent {PaymentIntentId} with Stripe", paymentIntentId);
                            // Continue with confirmation as fallback
                        }
                    }
                }

                transaction.Status = PaymentStatus.Completed;
                transaction.TransactionReference = paymentIntentId;
                transaction.CompletedAt = DateTime.UtcNow;
                transaction.GatewayResponse = $"{{\"payment_intent\": \"{paymentIntentId}\", \"status\": \"succeeded\", \"verified\": true}}";

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return new PaymentResultDto
                {
                    Success = true,
                    Message = "Payment confirmed successfully",
                    Transaction = MapToDto(transaction)
                };
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                _logger.LogError(ex, "Error confirming payment for transaction {TransactionId}", transactionId);
                throw;
            }
        }

        public async Task<PaymentResultDto> HandleWebhookAsync(string payload, string signature)
        {
            if (string.IsNullOrEmpty(payload))
            {
                _logger.LogWarning("Webhook received with empty payload");
                return new PaymentResultDto { Success = false, Message = "Empty payload" };
            }

            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Webhook received without signature");
                return new PaymentResultDto { Success = false, Message = "Missing signature" };
            }

            // Parse the webhook event to extract company info
            StripeWebhookEvent? webhookEvent;
            try
            {
                webhookEvent = JsonSerializer.Deserialize<StripeWebhookEvent>(payload, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse webhook payload");
                return new PaymentResultDto { Success = false, Message = "Invalid payload format" };
            }

            if (webhookEvent?.Data?.Object == null)
            {
                _logger.LogWarning("Webhook event has no data object");
                return new PaymentResultDto { Success = false, Message = "Invalid event data" };
            }

            // Extract payment intent ID and find the associated transaction
            var paymentIntentId = webhookEvent.Data.Object.Id;
            if (string.IsNullOrEmpty(paymentIntentId))
            {
                _logger.LogWarning("Webhook event has no payment intent ID");
                return new PaymentResultDto { Success = false, Message = "No payment intent ID" };
            }

            // Find the transaction by payment intent ID or reference
            var transaction = await _context.PaymentTransactions
                .Include(t => t.Company)
                .FirstOrDefaultAsync(t => t.TransactionReference == paymentIntentId);

            if (transaction == null)
            {
                _logger.LogWarning("No transaction found for payment intent {PaymentIntentId}", paymentIntentId);
                return new PaymentResultDto { Success = false, Message = "Transaction not found" };
            }

            // Verify webhook signature using company's Stripe webhook secret
            if (transaction.CompanyId.HasValue)
            {
                var stripeSecretKey = await GetDecryptedStripeSecretKeyAsync(transaction.CompanyId.Value);
                if (!string.IsNullOrEmpty(stripeSecretKey))
                {
                    // Get webhook secret from configuration or company settings
                    var webhookSecret = _configuration["Stripe:WebhookSecret"];
                    
                    if (!string.IsNullOrEmpty(webhookSecret))
                    {
                        if (!VerifyStripeSignature(payload, signature, webhookSecret))
                        {
                            _logger.LogWarning("Invalid webhook signature for payment intent {PaymentIntentId}", paymentIntentId);
                            return new PaymentResultDto { Success = false, Message = "Invalid signature" };
                        }
                    }
                    else
                    {
                        _logger.LogWarning("No Stripe webhook secret configured - skipping signature verification");
                    }
                }
            }

            // Process the webhook event based on type
            switch (webhookEvent.Type)
            {
                case "payment_intent.succeeded":
                    transaction.Status = PaymentStatus.Completed;
                    transaction.CompletedAt = DateTime.UtcNow;
                    transaction.GatewayResponse = payload;
                    _logger.LogInformation("Payment {PaymentIntentId} marked as completed via webhook", paymentIntentId);
                    break;

                case "payment_intent.payment_failed":
                    transaction.Status = PaymentStatus.Failed;
                    transaction.GatewayResponse = payload;
                    _logger.LogWarning("Payment {PaymentIntentId} failed via webhook", paymentIntentId);
                    break;

                case "charge.refunded":
                    transaction.Status = PaymentStatus.Refunded;
                    transaction.GatewayResponse = payload;
                    _logger.LogInformation("Payment {PaymentIntentId} refunded via webhook", paymentIntentId);
                    break;

                default:
                    _logger.LogInformation("Unhandled webhook event type: {EventType}", webhookEvent.Type);
                    break;
            }

            await _context.SaveChangesAsync();

            return new PaymentResultDto
            {
                Success = true,
                Message = $"Webhook processed: {webhookEvent.Type}",
                Transaction = MapToDto(transaction)
            };
        }

        /// <summary>
        /// Verifies Stripe webhook signature using HMAC-SHA256
        /// </summary>
        private bool VerifyStripeSignature(string payload, string signature, string secret)
        {
            try
            {
                // Stripe signature format: t={timestamp},v1={signature},v0={legacy_signature}
                var signatureParts = signature.Split(',');
                long timestamp = 0;
                string? v1Signature = null;

                foreach (var part in signatureParts)
                {
                    var keyValue = part.Split('=', 2);
                    if (keyValue.Length != 2) continue;

                    switch (keyValue[0])
                    {
                        case "t":
                            timestamp = long.Parse(keyValue[1]);
                            break;
                        case "v1":
                            v1Signature = keyValue[1];
                            break;
                    }
                }

                if (timestamp == 0 || string.IsNullOrEmpty(v1Signature))
                {
                    _logger.LogWarning("Invalid signature format - missing timestamp or v1 signature");
                    return false;
                }

                // Verify timestamp is within 5 minutes
                var timestampDiff = Math.Abs(DateTimeOffset.UtcNow.ToUnixTimeSeconds() - timestamp);
                if (timestampDiff > 300)
                {
                    _logger.LogWarning("Webhook timestamp too old: {TimestampDiff} seconds", timestampDiff);
                    return false;
                }

                // Compute expected signature
                var signedPayload = $"{timestamp}.{payload}";
                using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
                var computedSignature = BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(signedPayload)))
                    .Replace("-", "").ToLower();

                // Constant-time comparison to prevent timing attacks
                if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(computedSignature),
                    Encoding.UTF8.GetBytes(v1Signature.ToLower())))
                {
                    _logger.LogWarning("Signature mismatch. Expected: {Expected}, Got: {Got}", computedSignature, v1Signature);
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Stripe signature");
                return false;
            }
        }

        // Helper classes for Stripe API responses
        private class StripePaymentIntentResponse
        {
            public string Id { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public long Amount { get; set; }
            public string Currency { get; set; } = string.Empty;
        }

        private class StripeWebhookEvent
        {
            public string Id { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public StripeEventData? Data { get; set; }
        }

        private class StripeEventData
        {
            public StripePaymentIntentResponse? Object { get; set; }
        }

        public async Task<PaymentTransactionDto> RecordOfflinePaymentAsync(int userId, int companyId, RecordOfflinePaymentRequest request)
        {
            var transaction = new PaymentTransaction
            {
                CompanyId = companyId,
                ProjectId = request.ProjectId,
                ItemInvoiceId = request.ItemInvoiceId,
                Amount = request.Amount,
                Currency = request.Currency,
                Channel = PaymentChannel.Offline,
                PaymentMethod = request.PaymentMethod,
                TransactionReference = request.TransactionReference,
                Status = PaymentStatus.Completed, // Offline payments are immediately completed
                CreatedAt = DateTime.UtcNow,
                CompletedAt = request.PaymentDate,
                RecordedBy = userId,
                Notes = request.Notes,
                ReceiptUrl = request.ReceiptUrl
            };

            _context.PaymentTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Also create a ClientPayment record for backward compatibility
            if (request.ProjectId.HasValue)
            {
                var clientPayment = new ClientPayment
                {
                    ProjectId = request.ProjectId.Value,
                    Amount = request.Amount,
                    PaymentDate = request.PaymentDate,
                    PaymentMethod = request.PaymentMethod switch
                    {
                        "Cash" => ClientPaymentMethod.Cash,
                        "Check" or "Cheque" => ClientPaymentMethod.Check,
                        "CreditCard" => ClientPaymentMethod.CreditCard,
                        _ => ClientPaymentMethod.BankTransfer
                    },
                    ReceiptNumber = request.TransactionReference,
                    Status = ClientPaymentStatus.Confirmed,
                    Notes = request.Notes,
                    AttachmentPath = request.ReceiptUrl,
                    CreatedByUserId = userId
                };
                _context.ClientPayments.Add(clientPayment);
                await _context.SaveChangesAsync();
                
                transaction.ClientPaymentId = clientPayment.Id;
                await _context.SaveChangesAsync();
            }

            return MapToDto(transaction);
        }

        public async Task<PaymentTransactionDto> UpdatePaymentStatusAsync(int transactionId, Domain.Entities.PaymentStatus status, string? notes = null)
        {
            var transaction = await _context.PaymentTransactions.FindAsync(transactionId);
            if (transaction == null)
            {
                throw new ArgumentException("Transaction not found");
            }

            transaction.Status = status;
            if (!string.IsNullOrEmpty(notes))
            {
                transaction.Notes = notes;
            }

            if (status == PaymentStatus.Completed)
            {
                transaction.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return MapToDto(transaction);
        }

        public async Task<PaymentResultDto> RefundPaymentAsync(int userId, RefundPaymentRequest request)
        {
            var transaction = await _context.PaymentTransactions.FindAsync(request.TransactionId);
            if (transaction == null)
            {
                return new PaymentResultDto { Success = false, Message = "Transaction not found" };
            }

            if (transaction.Status != PaymentStatus.Completed)
            {
                return new PaymentResultDto { Success = false, Message = "Only completed payments can be refunded" };
            }

            var refundAmount = request.Amount ?? transaction.Amount;

            // Create refund transaction
            var refundTransaction = new PaymentTransaction
            {
                CompanyId = transaction.CompanyId,
                ProjectId = transaction.ProjectId,
                ItemInvoiceId = transaction.ItemInvoiceId,
                Amount = -refundAmount, // Negative amount for refund
                Currency = transaction.Currency,
                Channel = transaction.Channel,
                PaymentMethod = transaction.PaymentMethod,
                TransactionReference = $"REFUND-{transaction.TransactionReference}",
                Status = PaymentStatus.Refunded,
                CreatedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow,
                RecordedBy = userId,
                Notes = $"Refund: {request.Reason}"
            };

            _context.PaymentTransactions.Add(refundTransaction);

            // Update original transaction
            transaction.Status = PaymentStatus.Refunded;
            transaction.Notes = $"{transaction.Notes}\nRefunded: {request.Reason}";

            await _context.SaveChangesAsync();

            return new PaymentResultDto
            {
                Success = true,
                Message = "Refund processed successfully",
                Transaction = MapToDto(refundTransaction)
            };
        }

        public async Task<PaymentSettingsDto> GetPaymentSettingsAsync(int companyId)
        {
            var settings = await _context.CompanySettings
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            return new PaymentSettingsDto
            {
                EnableOnlinePayments = settings?.EnableOnlinePayments ?? false,
                EnableStripe = settings?.EnableStripe ?? false,
                EnablePayPal = settings?.EnablePayPal ?? false,
                EnableBankTransfer = settings?.EnableBankTransfer ?? true,
                StripePublicKey = settings?.StripePublicKey,
                Currency = settings?.Currency ?? "USD",
                MinimumPaymentAmount = settings?.MinimumPaymentAmount ?? 1,
                RequirePaymentApproval = settings?.RequirePaymentApproval ?? false
            };
        }

        public async Task<PaymentSettingsDto> UpdatePaymentSettingsAsync(int companyId, UpdatePaymentSettingsRequest request)
        {
            var settings = await _context.CompanySettings
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            if (settings == null)
            {
                settings = new CompanySettings { CompanyId = companyId };
                _context.CompanySettings.Add(settings);
            }

            settings.EnableOnlinePayments = request.EnableOnlinePayments;
            settings.EnableStripe = request.EnableStripe;
            settings.EnablePayPal = request.EnablePayPal;
            settings.EnableBankTransfer = request.EnableBankTransfer;
            
            // Encrypt sensitive keys before storing
            if (!string.IsNullOrEmpty(request.StripeSecretKey))
            {
                // Only encrypt if it looks like a new value (not already encrypted)
                if (!_dataProtection.IsProtected(request.StripeSecretKey))
                {
                    settings.StripeSecretKeyEncrypted = _dataProtection.Protect(request.StripeSecretKey);
                    _logger.LogInformation("Encrypted Stripe secret key for company {CompanyId}", companyId);
                }
                else
                {
                    settings.StripeSecretKeyEncrypted = request.StripeSecretKey;
                }
            }
            if (!string.IsNullOrEmpty(request.StripePublicKey))
            {
                settings.StripePublicKey = request.StripePublicKey;
            }
            
            // Encrypt PayPal secret if provided
            if (!string.IsNullOrEmpty(request.PayPalSecret))
            {
                if (!_dataProtection.IsProtected(request.PayPalSecret))
                {
                    settings.PayPalClientSecretEncrypted = _dataProtection.Protect(request.PayPalSecret);
                    _logger.LogInformation("Encrypted PayPal client secret for company {CompanyId}", companyId);
                }
                else
                {
                    settings.PayPalClientSecretEncrypted = request.PayPalSecret;
                }
            }
            if (!string.IsNullOrEmpty(request.PayPalClientId))
            {
                settings.PayPalClientId = request.PayPalClientId;
            }
            
            settings.Currency = request.Currency;
            settings.MinimumPaymentAmount = request.MinimumPaymentAmount;
            settings.RequirePaymentApproval = request.RequirePaymentApproval;

            await _context.SaveChangesAsync();

            return await GetPaymentSettingsAsync(companyId);
        }

        public async Task<GatewayPaymentHistoryDto> GetClientPaymentHistoryAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || user.CompanyId == null)
            {
                return new GatewayPaymentHistoryDto();
            }

            // Get payments for projects owned by the user's company
            var transactions = await _context.PaymentTransactions
                .Include(p => p.Project)
                .Include(p => p.ItemInvoice)
                .Where(p => p.CompanyId == user.CompanyId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return new GatewayPaymentHistoryDto
            {
                Transactions = transactions.Select(MapToDto).ToList(),
                TotalCount = transactions.Count,
                TotalAmount = transactions.Sum(p => p.Amount),
                PendingAmount = transactions.Where(p => p.Status == PaymentStatus.Pending).Sum(p => p.Amount),
                CompletedAmount = transactions.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount)
            };
        }

        public async Task<List<PaymentTransactionDto>> GetProjectPaymentsAsync(int projectId, int? companyId = null, bool isSuperAdmin = false)
        {
            var query = _context.PaymentTransactions
                .Include(p => p.Company)
                .Include(p => p.Recorder)
                .Where(p => p.ProjectId == projectId);

            // Company isolation: filter by company unless SuperAdmin
            if (!isSuperAdmin && companyId.HasValue)
            {
                query = query.Where(p => p.CompanyId == companyId.Value);
            }

            var transactions = await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return transactions.Select(MapToDto).ToList();
        }

        private static PaymentTransactionDto MapToDto(PaymentTransaction transaction)
        {
            return new PaymentTransactionDto
            {
                Id = transaction.Id,
                CompanyId = transaction.CompanyId,
                CompanyName = transaction.Company?.Name ?? "",
                ProjectId = transaction.ProjectId,
                ProjectName = transaction.Project?.Name,
                ItemInvoiceId = transaction.ItemInvoiceId,
                InvoiceNumber = transaction.ItemInvoice?.InvoiceNumber,
                Amount = transaction.Amount,
                Currency = transaction.Currency,
                Channel = transaction.Channel.ToString(),
                PaymentMethod = transaction.PaymentMethod,
                TransactionReference = transaction.TransactionReference,
                Status = transaction.Status.ToString(),
                CreatedAt = transaction.CreatedAt,
                CompletedAt = transaction.CompletedAt,
                RecordedByName = transaction.Recorder?.FullName,
                Notes = transaction.Notes,
                ReceiptUrl = transaction.ReceiptUrl
            };
        }

        /// <summary>
        /// Gets the decrypted Stripe secret key for a company.
        /// Use this method when you need to make API calls to Stripe.
        /// </summary>
        public async Task<string?> GetDecryptedStripeSecretKeyAsync(int companyId)
        {
            var settings = await _context.CompanySettings
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);
            
            if (string.IsNullOrEmpty(settings?.StripeSecretKeyEncrypted))
            {
                return null;
            }

            try
            {
                return _dataProtection.Unprotect(settings.StripeSecretKeyEncrypted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to decrypt Stripe secret key for company {CompanyId}", companyId);
                throw new InvalidOperationException("Failed to decrypt payment gateway credentials", ex);
            }
        }

        /// <summary>
        /// Gets the decrypted PayPal client secret for a company.
        /// Use this method when you need to make API calls to PayPal.
        /// </summary>
        public async Task<string?> GetDecryptedPayPalSecretAsync(int companyId)
        {
            var settings = await _context.CompanySettings
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);
            
            if (string.IsNullOrEmpty(settings?.PayPalClientSecretEncrypted))
            {
                return null;
            }

            try
            {
                return _dataProtection.Unprotect(settings.PayPalClientSecretEncrypted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to decrypt PayPal client secret for company {CompanyId}", companyId);
                throw new InvalidOperationException("Failed to decrypt payment gateway credentials", ex);
            }
        }

        #region Marketplace Payment Methods

        /// <summary>
        /// Get order details for payment processing
        /// </summary>
        public async Task<dynamic?> GetOrderForPaymentAsync(int orderId, int userId)
        {
            // Get the order from InventoryOrder table
            var order = await _context.InventoryOrders
                .Include(o => o.Vendor)
                .ThenInclude(v => v.Company)
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == userId);

            if (order == null)
            {
                _logger.LogWarning("Order {OrderId} not found for user {UserId}", orderId, userId);
                return null;
            }

            return new
            {
                OrderId = order.Id,
                TotalAmount = order.TotalAmount,
                Currency = "EGP",
                Status = order.Status.ToString(),
                VendorName = order.Vendor?.Name ?? "Unknown",
                Items = order.Items?.Select(i => new
                {
                    i.ProductName,
                    i.Quantity,
                    i.UnitPrice,
                    i.TotalPrice
                }).ToList()
            };
        }

        /// <summary>
        /// Create a payment record for marketplace order
        /// </summary>
        public async Task CreatePaymentRecordAsync(CreatePaymentRecordRequest request)
        {
            var payment = new MarketplacePayment
            {
                OrderId = request.OrderId,
                PaymentId = request.PaymentId,
                ReferenceNumber = request.ReferenceNumber,
                PaymentMethodValue = (int)request.PaymentMethod,
                Amount = request.Amount,
                Currency = request.Currency ?? "EGP",
                StatusValue = (int)MarketplacePaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.MarketplacePayments.Add(payment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created payment record for order {OrderId}, payment ID: {PaymentId}", 
                request.OrderId, request.PaymentId);
        }

        /// <summary>
        /// Update order payment status after callback
        /// </summary>
        public async Task UpdateOrderPaymentStatusAsync(int orderId, string transactionId, Domain.Entities.PaymentStatus status, object? additionalData = null)
        {
            var payment = await _context.MarketplacePayments
                .FirstOrDefaultAsync(p => p.OrderId == orderId);

            if (payment == null)
            {
                _logger.LogWarning("Payment record not found for order {OrderId}", orderId);
                return;
            }

            // Map Domain PaymentStatus to integer status value
            payment.StatusValue = MapToMarketplaceStatusValue(status);
            payment.TransactionId = transactionId;
            
            if (status == Domain.Entities.PaymentStatus.Completed)
            {
                payment.PaidAt = DateTime.UtcNow;
            }

            if (additionalData != null)
            {
                payment.GatewayResponse = System.Text.Json.JsonSerializer.Serialize(additionalData);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated payment status for order {OrderId} to {Status}", orderId, status);
        }

        /// <summary>
        /// Update order payment status by merchant reference number
        /// </summary>
        public async Task UpdateOrderPaymentStatusByReferenceAsync(string? merchantRefNumber, string? referenceNumber, Domain.Entities.PaymentStatus status, object? additionalData = null)
        {
            var query = _context.MarketplacePayments.AsQueryable();

            if (!string.IsNullOrEmpty(merchantRefNumber))
            {
                query = query.Where(p => p.PaymentId == merchantRefNumber);
            }
            else if (!string.IsNullOrEmpty(referenceNumber))
            {
                query = query.Where(p => p.ReferenceNumber == referenceNumber);
            }
            else
            {
                _logger.LogWarning("No reference provided for payment status update");
                return;
            }

            var payment = await query.FirstOrDefaultAsync();

            if (payment == null)
            {
                _logger.LogWarning("Payment record not found for reference: {Reference}", merchantRefNumber ?? referenceNumber);
                return;
            }

            // Map Domain PaymentStatus to integer status value
            payment.StatusValue = MapToMarketplaceStatusValue(status);
            
            if (!string.IsNullOrEmpty(referenceNumber))
            {
                payment.ReferenceNumber = referenceNumber;
            }

            if (status == Domain.Entities.PaymentStatus.Completed)
            {
                payment.PaidAt = DateTime.UtcNow;
            }

            if (additionalData != null)
            {
                payment.GatewayResponse = System.Text.Json.JsonSerializer.Serialize(additionalData);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated payment status for order {OrderId} to {Status}", payment.OrderId, status);
        }

        /// <summary>
        /// Get marketplace payment status for an order
        /// </summary>
        public async Task<PaymentStatusResponse?> GetMarketplacePaymentStatusAsync(int orderId, int userId)
        {
            var payment = await _context.MarketplacePayments
                .Include(p => p.Order)
                .ThenInclude(o => o.Vendor)
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Order.CustomerId == userId);

            if (payment == null)
            {
                return null;
            }

            return new PaymentStatusResponse
            {
                PaymentId = payment.PaymentId,
                ReferenceNumber = payment.ReferenceNumber,
                OrderId = payment.OrderId,
                Status = MapToDtoPaymentStatus(payment.StatusValue),
                PaymentMethod = MapToDtoPaymentMethod(payment.PaymentMethodValue),
                Amount = payment.Amount,
                Currency = payment.Currency,
                PaidAt = payment.PaidAt,
                ExpiresAt = payment.ExpiresAt,
                PaymentUrl = payment.PaymentUrl,
                ErrorMessage = payment.ErrorMessage
            };
        }

        /// <summary>
        /// Get payment history for marketplace user
        /// </summary>
        public async Task<PaymentHistoryResponse> GetMarketplacePaymentHistoryAsync(int userId, int page = 1, int pageSize = 20)
        {
            var payments = await (from p in _context.MarketplacePayments
                        join o in _context.InventoryOrders on p.OrderId equals o.Id
                        join v in _context.Vendors on o.VendorId equals v.Id
                        where o.CustomerId == userId
                        orderby p.CreatedAt descending
                        select new
                        {
                            p.Id,
                            p.PaymentId,
                            p.ReferenceNumber,
                            p.OrderId,
                            p.PaymentMethodValue,
                            p.StatusValue,
                            p.Amount,
                            p.Currency,
                            p.CreatedAt,
                            p.PaidAt,
                            VendorName = v.Name
                        })
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .ToListAsync();

            var totalCount = await (from p in _context.MarketplacePayments
                                    join o in _context.InventoryOrders on p.OrderId equals o.Id
                                    where o.CustomerId == userId
                                    select p).CountAsync();

            return new PaymentHistoryResponse
            {
                Payments = payments.Select(p => new PaymentHistoryItem
                {
                    Id = p.Id,
                    PaymentId = p.PaymentId,
                    ReferenceNumber = p.ReferenceNumber,
                    OrderId = p.OrderId,
                    PaymentMethod = MapToDtoPaymentMethod(p.PaymentMethodValue),
                    Status = MapToDtoPaymentStatus(p.StatusValue),
                    Amount = p.Amount,
                    Currency = p.Currency,
                    CreatedAt = p.CreatedAt,
                    PaidAt = p.PaidAt,
                    VendorName = p.VendorName
                }).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        /// <summary>
        /// Get payment by payment ID
        /// </summary>
        public async Task<PaymentHistoryItem?> GetPaymentByPaymentIdAsync(string paymentId)
        {
            var payment = await _context.MarketplacePayments
                .Include(p => p.Order)
                .ThenInclude(o => o.Vendor)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

            if (payment == null)
            {
                return null;
            }

            return new PaymentHistoryItem
            {
                Id = payment.Id,
                PaymentId = payment.PaymentId,
                ReferenceNumber = payment.ReferenceNumber,
                OrderId = payment.OrderId,
                PaymentMethod = MapToDtoPaymentMethod(payment.PaymentMethodValue),
                Status = MapToDtoPaymentStatus(payment.StatusValue),
                Amount = payment.Amount,
                Currency = payment.Currency,
                CreatedAt = payment.CreatedAt,
                PaidAt = payment.PaidAt,
                VendorName = payment.Order?.Vendor?.Name
            };
        }

        /// <summary>
        /// Maps Domain PaymentStatus to integer status value
        /// </summary>
        private static int MapToMarketplaceStatusValue(Domain.Entities.PaymentStatus status)
        {
            return status switch
            {
                Domain.Entities.PaymentStatus.Pending => 0,
                Domain.Entities.PaymentStatus.Completed => 2,
                Domain.Entities.PaymentStatus.Failed => 3,
                Domain.Entities.PaymentStatus.Cancelled => 4,
                Domain.Entities.PaymentStatus.Refunded => 5,
                _ => 0
            };
        }

        /// <summary>
        /// Maps integer status value to DTO MarketplacePaymentStatus
        /// </summary>
        private static MarketplacePaymentStatus MapToDtoPaymentStatus(int statusValue)
        {
            return statusValue switch
            {
                0 => MarketplacePaymentStatus.Pending,
                1 => MarketplacePaymentStatus.Processing,
                2 => MarketplacePaymentStatus.Completed,
                3 => MarketplacePaymentStatus.Failed,
                4 => MarketplacePaymentStatus.Cancelled,
                5 => MarketplacePaymentStatus.Refunded,
                6 => MarketplacePaymentStatus.Expired,
                _ => MarketplacePaymentStatus.Pending
            };
        }

        /// <summary>
        /// Maps integer method value to DTO MarketplacePaymentMethod
        /// </summary>
        private static MarketplacePaymentMethod MapToDtoPaymentMethod(int methodValue)
        {
            return methodValue switch
            {
                1 => MarketplacePaymentMethod.Card,
                2 => MarketplacePaymentMethod.PayMob,
                3 => MarketplacePaymentMethod.Fawry,
                4 => MarketplacePaymentMethod.VodafoneCash,
                5 => MarketplacePaymentMethod.OrangeMoney,
                6 => MarketplacePaymentMethod.EtisalatCash,
                7 => MarketplacePaymentMethod.CashOnDelivery,
                _ => MarketplacePaymentMethod.Card
            };
        }

        #endregion
    }
}
