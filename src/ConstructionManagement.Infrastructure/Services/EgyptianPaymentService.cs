using System;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

public class EgyptianPaymentService : IEgyptianPaymentService
{
    private readonly IPayMobService _payMobService;
    private readonly IRepository<InventoryOrder> _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EgyptianPaymentService> _logger;

    public EgyptianPaymentService(
        IPayMobService payMobService,
        IRepository<InventoryOrder> orderRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        ILogger<EgyptianPaymentService> logger)
    {
        _payMobService = payMobService;
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<MarketplacePaymentResponse> InitiatePaymentAsync(int userId, MarketplacePaymentRequest request)
    {
        var order = await _orderRepository.AsQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId);

        if (order == null)
            throw new InvalidOperationException("Order not found");

        if (order.CustomerId != userId)
            throw new UnauthorizedAccessException("Not authorized to pay for this order");

        if (order.PaymentStatus == Domain.Enums.PaymentStatus.Paid)
            throw new InvalidOperationException("Order is already paid");

        // Set payment method on order
        order.PaymentMethod = request.PaymentMethod.ToString();
        await _unitOfWork.SaveChangesAsync();

        if (request.PaymentMethod == MarketplacePaymentMethod.CashOnDelivery)
        {
            return new MarketplacePaymentResponse
            {
                Success = true,
                PaymentMethod = request.PaymentMethod,
                Amount = order.Total,
                Currency = "EGP"
            };
        }

        try
        {
            // PayMob Integration
            var authToken = await _payMobService.GetAuthenticationTokenAsync();
            
            var amountCents = (int)(order.Total * 100);
            
            var payMobOrder = await _payMobService.CreateOrderAsync(authToken, new PayMobOrderRequest
            {
                AmountCents = amountCents.ToString(),
                Currency = "EGP",
                MerchantOrderId = order.OrderNumber
            });

            order.PaymentReference = payMobOrder.ToString(); // Store PayMob Order ID
            await _unitOfWork.SaveChangesAsync();

            int integrationId = request.PaymentMethod switch
            {
                MarketplacePaymentMethod.Card => int.Parse(_configuration["PayMob:CardIntegrationId"] ?? "0"),
                _ => int.Parse(_configuration["PayMob:WalletIntegrationId"] ?? "0") // Default to wallet for others
            };

            var paymentKey = await _payMobService.GetPaymentKeyAsync(authToken, new PayMobPaymentKeyRequest
            {
                AmountCents = amountCents.ToString(),
                OrderId = payMobOrder,
                IntegrationId = integrationId,
                BillingData = new PayMobBillingData
                {
                    FirstName = request.BillingInfo.FirstName,
                    LastName = request.BillingInfo.LastName,
                    Email = request.BillingInfo.Email,
                    PhoneNumber = request.BillingInfo.PhoneNumber,
                    City = request.BillingInfo.City ?? "NA",
                    Street = request.BillingInfo.Street ?? "NA",
                    Building = request.BillingInfo.Building ?? "NA",
                    Floor = request.BillingInfo.Floor ?? "NA",
                    Apartment = request.BillingInfo.Apartment ?? "NA"
                }
            });

            if (request.PaymentMethod == MarketplacePaymentMethod.Card)
            {
                var iframeId = _configuration["PayMob:IframeId"];
                return new MarketplacePaymentResponse
                {
                    Success = true,
                    PaymentId = payMobOrder.ToString(),
                    PaymentUrl = $"https://accept.paymob.com/api/acceptance/iframes/{iframeId}?payment_token={paymentKey}",
                    PaymentMethod = request.PaymentMethod,
                    Amount = order.Total,
                    Currency = "EGP"
                };
            }
            else // Wallet
            {
                if (string.IsNullOrEmpty(request.PhoneNumber))
                    throw new InvalidOperationException("Phone number is required for wallet payments");

                var walletResponse = await _payMobService.InitiateWalletPaymentAsync(paymentKey, request.PhoneNumber);
                return new MarketplacePaymentResponse
                {
                    Success = true,
                    PaymentId = payMobOrder.ToString(),
                    PaymentUrl = walletResponse.RedirectUrl,
                    PaymentMethod = request.PaymentMethod,
                    Amount = order.Total,
                    Currency = "EGP"
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating PayMob payment for order {OrderNumber}", order.OrderNumber);
            return new MarketplacePaymentResponse
            {
                Success = false,
                ErrorMessage = "Payment initiation failed: " + ex.Message
            };
        }
    }

    public async Task<PaymentCallbackResponse> ProcessCallbackAsync(PaymentCallbackRequest request)
    {
        // PayMob sends info in 'obj' or similar in their HMAC
        // For simplicity here, we'll assume the request mapper handled the basic mapping
        
        var orderNumber = request.MerchantRefNumber;
        var order = await _orderRepository.AsQueryable()
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order == null)
            throw new InvalidOperationException($"Order {orderNumber} not found");

        if (request.Success)
        {
            order.PaymentStatus = Domain.Enums.PaymentStatus.Paid;
            order.PaymentGatewayTransactionId = request.PaymentId;
            order.Status = InventoryOrder.OrderStatus.Confirmed; // Auto confirm if paid
            await _unitOfWork.SaveChangesAsync();

            return new PaymentCallbackResponse
            {
                Success = true,
                OrderId = order.Id,
                TransactionId = request.PaymentId,
                Status = MarketplacePaymentStatus.Completed,
                Message = "Payment successful"
            };
        }
        else
        {
            order.PaymentStatus = Domain.Enums.PaymentStatus.Failed;
            await _unitOfWork.SaveChangesAsync();

            return new PaymentCallbackResponse
            {
                Success = false,
                OrderId = order.Id,
                Status = MarketplacePaymentStatus.Failed,
                Message = request.Message ?? "Payment failed"
            };
        }
    }

    public async Task<PaymentStatusResponse> GetPaymentStatusAsync(string paymentId)
    {
        // Would call PayMob status API
        // For now, check local DB
        var order = await _orderRepository.AsQueryable()
            .FirstOrDefaultAsync(o => o.PaymentReference == paymentId || o.PaymentGatewayTransactionId == paymentId);

        if (order == null)
            throw new KeyNotFoundException("Payment not found");

        return new PaymentStatusResponse
        {
            PaymentId = paymentId,
            OrderId = order.Id,
            Amount = order.Total,
            Currency = "EGP",
            Status = order.PaymentStatus switch
            {
                Domain.Enums.PaymentStatus.Paid => MarketplacePaymentStatus.Completed,
                Domain.Enums.PaymentStatus.Pending => MarketplacePaymentStatus.Pending,
                _ => MarketplacePaymentStatus.Failed
            },
            PaymentMethod = Enum.TryParse<MarketplacePaymentMethod>(order.PaymentMethod, out var pm) ? pm : MarketplacePaymentMethod.Card
        };
    }

    public async Task<MarketplaceRefundResponse> RefundPaymentAsync(int userId, MarketplaceRefundRequest request)
    {
         // Implementation for refunds via PayMob API
         throw new NotImplementedException("Refund functionality coming soon");
    }

    public bool ValidateHmac(IDictionary<string, string> queryParams, string hmac)
    {
        return _payMobService.ValidateHmac(queryParams, hmac);
    }

    public string GetFrontendBaseUrl()
    {
        return _configuration["FrontendBaseUrl"] ?? "http://localhost:4200";
    }
}
