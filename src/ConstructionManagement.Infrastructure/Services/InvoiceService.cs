using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IRepository<ItemInvoice> _invoiceRepository;
    private readonly IRepository<ItemDailyLog> _dailyLogRepository;
    private readonly IRepository<BOQItem> _boqItemRepository;
    private readonly IUnitOfWork _unitOfWork;

    public InvoiceService(
        IRepository<ItemInvoice> invoiceRepository,
        IRepository<ItemDailyLog> dailyLogRepository,
        IRepository<BOQItem> boqItemRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _dailyLogRepository = dailyLogRepository;
        _boqItemRepository = boqItemRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> CreateInvoiceAsync(int itemId, CreateInvoiceRequest request, int createdByUserId)
    {
        // 1. التحقق من التقفيل اليومي
        var invoiceDate = request.InvoiceDate.Date;
        var isClosed = await _dailyLogRepository.AsQueryable()
            .AnyAsync(l => l.BOQItemId == itemId
                        && l.LogDate.Date == invoiceDate
                        && l.IsClosed);

        if (isClosed)
            throw new InvalidOperationException("اليوم مقفول لهذا البند، لا يمكن إضافة فواتير جديدة");

        // 2. جلب ProjectID من البند (إلزامي في الـ Entity)
        var item = await _boqItemRepository.GetByIdAsync(itemId);
        if (item == null) throw new ArgumentException("البند غير موجود");

        // 3. إنشاء الفاتورة
        var invoice = new ItemInvoice
        {
            BOQItemId = itemId,
            ProjectId = item.ProjectId,
            InvoiceNumber = request.InvoiceNumber,
            InvoiceDate = request.InvoiceDate,
            Amount = request.Amount,
            Description = request.Description,
            SupplierVendor = request.SupplierVendor,
            AttachmentPath = request.AttachmentPath,
            ReviewerUserId = createdByUserId,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _invoiceRepository.AddAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        return invoice.Id;
    }

    // إصلاح الخطأ: إضافة ميثود المراجعة
    public async Task<bool> ReviewInvoiceAsync(int invoiceId, ReviewInvoiceRequest request, int reviewerUserId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null || invoice.Status != "Pending")
            return false;

        invoice.Status = request.Status;
        invoice.RejectionReason = request.RejectionReason;
        invoice.ReviewDate = DateTime.UtcNow;
        invoice.ReviewerUserId = reviewerUserId;

        await _invoiceRepository.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    // إصلاح الخطأ: إضافة ميثود الحصول على فاتورة محددة
    public async Task<InvoiceDto?> GetInvoiceByIdAsync(int invoiceId)
    {
        var invoice = await _invoiceRepository.AsQueryable()
            .Include(i => i.Reviewer)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        return MapToDto(invoice);
    }

    public async Task<List<InvoiceDto>> GetInvoicesForItemAsync(int itemId, string? statusFilter = null)
    {
        var query = _invoiceRepository.AsQueryable()
            .Include(i => i.Reviewer)
            .Where(i => i.BOQItemId == itemId);

        if (!string.IsNullOrEmpty(statusFilter))
            query = query.Where(i => i.Status == statusFilter);

        var invoices = await query.OrderByDescending(i => i.InvoiceDate).ToListAsync();

        return invoices.Select(MapToDto).ToList();
    }

    private static InvoiceDto MapToDto(ItemInvoice invoice)
    {
        return new InvoiceDto(
            invoice.Id,
            invoice.BOQItemId,
            invoice.InvoiceNumber,
            invoice.InvoiceDate,
            invoice.Amount,
            invoice.Description,
            invoice.SupplierVendor,
            invoice.Status,
            invoice.RejectionReason,
            invoice.ReviewDate,
            invoice.Reviewer?.FullName,
            invoice.AttachmentPath,
            invoice.CreatedAt);
    }
}