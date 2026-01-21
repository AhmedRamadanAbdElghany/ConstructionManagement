using ConstructionManagement.Application.DTOs;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces;

public interface IInvoiceService
{
    /// <summary>
    /// إنشاء فاتورة جديدة لبند معين (مع التحقق من التقفيل اليومي)
    /// </summary>
    Task<int> CreateInvoiceAsync(int itemId, CreateInvoiceRequest request, int createdByUserId);

    /// <summary>
    /// مراجعة فاتورة (موافقة أو رفض) مع تسجيل السبب والمراجع
    /// </summary>
    Task<bool> ReviewInvoiceAsync(int invoiceId, ReviewInvoiceRequest request, int reviewerUserId);

    /// <summary>
    /// جلب تفاصيل فاتورة معينة
    /// </summary>
    Task<InvoiceDto?> GetInvoiceByIdAsync(int invoiceId);

    /// <summary>
    /// جلب كل الفواتير الخاصة ببند معين (مع فلترة اختيارية على الحالة)
    /// </summary>
    Task<List<InvoiceDto>> GetInvoicesForItemAsync(int itemId, string? statusFilter = null);
}