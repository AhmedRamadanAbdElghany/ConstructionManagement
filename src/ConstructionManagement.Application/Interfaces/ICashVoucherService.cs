using ConstructionManagement.Application.DTOs.CashVoucher;

namespace ConstructionManagement.Application.Interfaces
{
    public interface ICashVoucherService
    {
        Task<IEnumerable<CashVoucherDto>> GetVouchersAsync();
        Task<CashVoucherDto?> GetVoucherByIdAsync(int id);
        Task<CashVoucherDto> CreateVoucherAsync(CreateCashVoucherRequest request, int createdByUserId);
        Task<CashVoucherDto> ReviewVoucherAsync(int voucherId, ReviewCashVoucherRequest request, int reviewerUserId);
        Task<IEnumerable<CashVoucherDto>> GetPendingVouchersAsync();
        Task<IEnumerable<CashVoucherDto>> GetVouchersByWorkerAsync(int workerUserId);
        Task<CashVoucherSummary> GetSummaryAsync();
    }
}
