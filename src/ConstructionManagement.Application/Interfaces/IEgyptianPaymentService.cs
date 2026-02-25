using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IEgyptianPaymentService
{
    Task<MarketplacePaymentResponse> InitiatePaymentAsync(int userId, MarketplacePaymentRequest request);
    Task<PaymentCallbackResponse> ProcessCallbackAsync(PaymentCallbackRequest request);
    Task<PaymentStatusResponse> GetPaymentStatusAsync(string paymentId);
    Task<MarketplaceRefundResponse> RefundPaymentAsync(int userId, MarketplaceRefundRequest request);
    bool ValidateHmac(IDictionary<string, string> queryParams, string hmac);
    string GetFrontendBaseUrl();
}
