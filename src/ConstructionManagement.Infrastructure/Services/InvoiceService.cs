using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IRepository<ItemInvoice> _invoiceRepository;
    private readonly IRepository<ItemDailyLog> _dailyLogRepository;
    private readonly IRepository<BOQItem> _boqItemRepository;

    // Used in production / integration scenarios
    private readonly ApplicationDbContext? _context;
    private readonly IUnitOfWork? _unitOfWork;

    // Full constructor - used by DI container
    public InvoiceService(
        IRepository<ItemInvoice> invoiceRepository,
        IRepository<ItemDailyLog> dailyLogRepository,
        IRepository<BOQItem> boqItemRepository,
        ApplicationDbContext context,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _dailyLogRepository = dailyLogRepository;
        _boqItemRepository = boqItemRepository;
        _context = context;
        _unitOfWork = unitOfWork;
    }

    // Test-friendly constructor - only repositories (no DbContext or UnitOfWork)
    public InvoiceService(
        IRepository<ItemInvoice> invoiceRepository,
        IRepository<ItemDailyLog> dailyLogRepository,
        IRepository<BOQItem> boqItemRepository)
    {
        _invoiceRepository = invoiceRepository;
        _dailyLogRepository = dailyLogRepository;
        _boqItemRepository = boqItemRepository;

        // Prevent accidental use of production-only dependencies in unit tests
        _context = null;
        _unitOfWork = null;
    }

    public async Task<int> CreateInvoiceAsync(int itemId, CreateInvoiceRequest request, int createdByUserId)
    {
        if (_unitOfWork == null || _context == null)
            throw new InvalidOperationException("Transaction support is not available in this context.");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // 1. Check if day is closed
            var invoiceDate = request.InvoiceDate.Date;
            var isClosed = await _dailyLogRepository.AsQueryable()
                .AnyAsync(l => l.BOQItemId == itemId
                            && l.LogDate.Date == invoiceDate
                            && l.IsClosed);

            if (isClosed)
                throw new InvalidOperationException("اليوم مقفول لهذا البند، لا يمكن إضافة فواتير جديدة");

            // 2. Get item and project
            var item = await _boqItemRepository.GetByIdAsync(itemId);
            if (item == null)
                throw new ArgumentException("البند غير موجود");

            // 3. Generate safe invoice number
            var year = DateTime.UtcNow.Year;
            string invoiceNumber = string.Empty;
            var parameters = new[]
            {
                new SqlParameter("@Year", year),
                new SqlParameter("@InvoiceNumber", SqlDbType.NVarChar, 20)
                {
                    Direction = ParameterDirection.Output
                }
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_generateInvoiceNumber @Year, @InvoiceNumber OUTPUT",
                parameters);

            invoiceNumber = parameters[1].Value?.ToString()
                ?? throw new InvalidOperationException("فشل توليد رقم الفاتورة");

            // 4. Create invoice
            var invoice = new ItemInvoice
            {
                BOQItemId = itemId,
                ProjectId = item.ProjectId,
                InvoiceNumber = invoiceNumber,
                InvoiceDate = request.InvoiceDate,
                DueDate = request.DueDate,
                SubTotal = request.SubTotal,
                TaxRate = request.TaxRate,
                TaxAmount = request.TaxAmount ?? (request.SubTotal * (request.TaxRate ?? 0) / 100),
                RetentionRate = request.RetentionRate,
                RetentionAmount = request.RetentionAmount ?? (request.SubTotal * (request.RetentionRate ?? 0) / 100),
                NetAmount = request.NetAmount ?? (request.SubTotal + (request.TaxAmount ?? 0) - (request.RetentionAmount ?? 0)),
                Currency = request.Currency ?? "EGP",
                Description = request.Description,
                SupplierVendor = request.SupplierVendor,
                AttachmentPath = request.AttachmentPath,
                Status = "Pending",
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            };

            await _invoiceRepository.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();

            return invoice.Id;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ReviewInvoiceAsync(int invoiceId, ReviewInvoiceRequest request, int reviewerUserId)
    {
        if (_unitOfWork == null)
            throw new InvalidOperationException("UnitOfWork is not available in this context.");

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

    public async Task<InvoiceDto?> GetInvoiceByIdAsync(int invoiceId)
    {
        var invoice = await _invoiceRepository.AsQueryable()
            .Include(i => i.Reviewer)
            .Include(i => i.CreatedBy)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null) return null;

        return MapToDto(invoice);
    }

    public async Task<List<InvoiceDto>> GetInvoicesForItemAsync(int itemId, string? statusFilter = null)
    {
        var query = _invoiceRepository.AsQueryable()
            .Include(i => i.Reviewer)
            .Include(i => i.CreatedBy)
            .Where(i => i.BOQItemId == itemId);

        if (!string.IsNullOrEmpty(statusFilter))
            query = query.Where(i => i.Status == statusFilter);

        var invoices = await query.OrderByDescending(i => i.InvoiceDate).ToListAsync();

        return invoices.Select(MapToDto).ToList();
    }

    private static InvoiceDto MapToDto(ItemInvoice invoice)
    {
        return new InvoiceDto(
            InvoiceID: invoice.Id,
            ItemID: invoice.BOQItemId,
            InvoiceNumber: invoice.InvoiceNumber,
            InvoiceDate: invoice.InvoiceDate,
            DueDate: invoice.DueDate,
            SubTotal: invoice.SubTotal,
            TaxRate: invoice.TaxRate,
            TaxAmount: invoice.TaxAmount,
            RetentionRate: invoice.RetentionRate,
            RetentionAmount: invoice.RetentionAmount,
            NetAmount: invoice.NetAmount,
            Currency: invoice.Currency ?? "EGP",
            Description: invoice.Description,
            SupplierVendor: invoice.SupplierVendor,
            Status: invoice.Status,
            RejectionReason: invoice.RejectionReason,
            ReviewDate: invoice.ReviewDate,
            ReviewerFullName: invoice.Reviewer?.FullName,
            AttachmentPath: invoice.AttachmentPath,
            CreatedByUserId: invoice.CreatedByUserId,
            CreatedByFullName: invoice.CreatedBy?.FullName,
            CreatedAt: invoice.CreatedAt
        );
    }
}
