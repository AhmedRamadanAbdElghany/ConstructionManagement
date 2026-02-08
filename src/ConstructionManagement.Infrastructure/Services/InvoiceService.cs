using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
    private readonly ILogger<InvoiceService> _logger;

    // Full constructor - used by DI container with null validation
    public InvoiceService(
        IRepository<ItemInvoice> invoiceRepository,
        IRepository<ItemDailyLog> dailyLogRepository,
        IRepository<BOQItem> boqItemRepository,
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ILogger<InvoiceService> logger)
    {
        _invoiceRepository = invoiceRepository ?? throw new ArgumentNullException(nameof(invoiceRepository));
        _dailyLogRepository = dailyLogRepository ?? throw new ArgumentNullException(nameof(dailyLogRepository));
        _boqItemRepository = boqItemRepository ?? throw new ArgumentNullException(nameof(boqItemRepository));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // Test-friendly constructor - only repositories (no DbContext or UnitOfWork)
    // Uses a no-op logger for testing
    public InvoiceService(
        IRepository<ItemInvoice> invoiceRepository,
        IRepository<ItemDailyLog> dailyLogRepository,
        IRepository<BOQItem> boqItemRepository,
        ILogger<InvoiceService> logger)
    {
        _invoiceRepository = invoiceRepository ?? throw new ArgumentNullException(nameof(invoiceRepository));
        _dailyLogRepository = dailyLogRepository ?? throw new ArgumentNullException(nameof(dailyLogRepository));
        _boqItemRepository = boqItemRepository ?? throw new ArgumentNullException(nameof(boqItemRepository));
        _context = null;
        _unitOfWork = null;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<int> CreateInvoiceAsync(int itemId, CreateInvoiceRequest request, int createdByUserId)
    {
        if (_unitOfWork == null || _context == null)
        {
            _logger.LogError("Transaction support is not available. UnitOfWork or Context is null.");
            throw new InvalidOperationException("Transaction support is not available in this context.");
        }

        _logger.LogInformation("Creating invoice for item {ItemId} by user {UserId}", itemId, createdByUserId);

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
            {
                _logger.LogWarning("Attempted to create invoice for closed day. ItemId: {ItemId}, Date: {Date}", 
                    itemId, invoiceDate);
                throw new InvalidOperationException("اليوم مقفول لهذا البند، لا يمكن إضافة فواتير جديدة");
            }

            // 2. Get item and project
            var item = await _boqItemRepository.GetByIdAsync(itemId);
            if (item == null)
            {
                _logger.LogWarning("BOQItem not found. ItemId: {ItemId}", itemId);
                throw new ArgumentException("البند غير موجود");
            }

            _logger.LogDebug("Found BOQItem {ItemId} for project {ProjectId}", itemId, item.ProjectId);

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

            _logger.LogDebug("Generated invoice number: {InvoiceNumber}", invoiceNumber);

            // 4. Create invoice using enum status
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
                StatusEnum = InvoiceStatus.Pending, // Using enum instead of string
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            };

            await _invoiceRepository.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Invoice {InvoiceId} created successfully with number {InvoiceNumber}", 
                invoice.Id, invoiceNumber);

            return invoice.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create invoice for item {ItemId}", itemId);
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ReviewInvoiceAsync(int invoiceId, ReviewInvoiceRequest request, int reviewerUserId)
    {
        if (_unitOfWork == null)
        {
            _logger.LogError("UnitOfWork is not available for reviewing invoice {InvoiceId}", invoiceId);
            throw new InvalidOperationException("UnitOfWork is not available in this context.");
        }

        _logger.LogInformation("Reviewing invoice {InvoiceId} by user {UserId}. Status: {NewStatus}", 
            invoiceId, reviewerUserId, request.Status);

        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            _logger.LogWarning("Invoice not found for review. InvoiceId: {InvoiceId}", invoiceId);
            return false;
        }

        // Using enum-based status check instead of string comparison
        if (!invoice.StatusEnum.CanReview())
        {
            _logger.LogWarning("Invoice {InvoiceId} cannot be reviewed. Current status: {Status}", 
                invoiceId, invoice.Status);
            return false;
        }

        // Validate transition using enum extensions
        var newStatus = InvoiceStatusExtensions.FromString(request.Status) ?? InvoiceStatus.Draft;
        if (!invoice.StatusEnum.CanTransitionTo(newStatus))
        {
            _logger.LogWarning("Invalid status transition for invoice {InvoiceId}. From {CurrentStatus} to {NewStatus}", 
                invoiceId, invoice.Status, request.Status);
            return false;
        }

        invoice.StatusEnum = newStatus; // Using enum setter
        invoice.RejectionReason = request.RejectionReason;
        invoice.ReviewDate = DateTime.UtcNow;
        invoice.ReviewerUserId = reviewerUserId;

        await _invoiceRepository.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} review completed. New status: {Status}", 
            invoiceId, invoice.Status);

        return true;
    }

    public async Task<InvoiceDto?> GetInvoiceByIdAsync(int invoiceId)
    {
        _logger.LogDebug("Fetching invoice {InvoiceId}", invoiceId);

        var invoice = await _invoiceRepository.AsQueryable()
            .Include(i => i.Reviewer)
            .Include(i => i.CreatedBy)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null)
        {
            _logger.LogDebug("Invoice {InvoiceId} not found", invoiceId);
            return null;
        }

        return MapToDto(invoice);
    }

    public async Task<List<InvoiceDto>> GetInvoicesForItemAsync(int itemId, string? statusFilter = null)
    {
        _logger.LogDebug("Fetching invoices for item {ItemId}", itemId);

        var query = _invoiceRepository.AsQueryable()
            .Include(i => i.Reviewer)
            .Include(i => i.CreatedBy)
            .Where(i => i.BOQItemId == itemId);

        if (!string.IsNullOrEmpty(statusFilter))
        {
            // Convert string filter to enum for type-safe filtering
            var status = InvoiceStatusExtensions.FromString(statusFilter);
            if (status.HasValue)
            {
                query = query.Where(i => i.StatusEnum == status.Value);
                _logger.LogDebug("Filtering invoices by status {Status}", status);
            }
            else
            {
                _logger.LogWarning("Invalid status filter: {StatusFilter}", statusFilter);
            }
        }

        var invoices = await query.OrderByDescending(i => i.InvoiceDate).ToListAsync();

        _logger.LogDebug("Found {Count} invoices for item {ItemId}", invoices.Count, itemId);

        return invoices.Select(MapToDto).ToList();
    }

    public async Task<List<InvoiceDto>> GetInvoicesByStatusAsync(InvoiceStatus status)
    {
        _logger.LogDebug("Fetching invoices with status {Status}", status);

        var invoices = await _invoiceRepository.AsQueryable()
            .Include(i => i.Reviewer)
            .Include(i => i.CreatedBy)
            .Where(i => i.StatusEnum == status)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();

        _logger.LogDebug("Found {Count} invoices with status {Status}", invoices.Count, status);

        return invoices.Select(MapToDto).ToList();
    }

    public async Task<bool> CanCancelInvoiceAsync(int invoiceId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
            return false;

        return invoice.StatusEnum.CanCancel();
    }

    public async Task<List<InvoiceDto>> GetAllInvoicesAsync(int? projectId = null, string? statusFilter = null)
    {
        _logger.LogDebug("Fetching all invoices. ProjectId: {ProjectId}, StatusFilter: {StatusFilter}", projectId, statusFilter);

        IQueryable<ItemInvoice> query = _invoiceRepository.AsQueryable()
            .Include(i => i.Reviewer)
            .Include(i => i.CreatedBy);

        if (projectId.HasValue)
        {
            query = query.Where(i => i.ProjectId == projectId.Value);
            _logger.LogDebug("Filtering invoices by project {ProjectId}", projectId);
        }

        if (!string.IsNullOrEmpty(statusFilter))
        {
            // Convert string filter to enum for type-safe filtering
            var status = InvoiceStatusExtensions.FromString(statusFilter);
            if (status.HasValue)
            {
                query = query.Where(i => i.StatusEnum == status.Value);
                _logger.LogDebug("Filtering invoices by status {Status}", status);
            }
            else
            {
                _logger.LogWarning("Invalid status filter: {StatusFilter}", statusFilter);
            }
        }

        var invoices = await query.OrderByDescending(i => i.InvoiceDate).ToListAsync();

        _logger.LogDebug("Found {Count} invoices", invoices.Count);

        return invoices.Select(MapToDto).ToList();
    }

    private static InvoiceDto MapToDto(ItemInvoice invoice)
    {
        return new InvoiceDto(
            InvoiceID: invoice.Id,
            ItemID: invoice.BOQItemId,
            InvoiceNumber: invoice.InvoiceNumber ?? string.Empty,
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
            Status: invoice.Status ?? "Pending",
            RejectionReason: invoice.RejectionReason,
            ReviewDate: invoice.ReviewDate,
            ReviewerFullName: invoice.Reviewer != null ? $"{invoice.Reviewer.FirstName} {invoice.Reviewer.LastName}".Trim() : null,
            AttachmentPath: invoice.AttachmentPath,
            CreatedByUserId: invoice.CreatedByUserId,
            CreatedByFullName: invoice.CreatedBy != null ? $"{invoice.CreatedBy.FirstName} {invoice.CreatedBy.LastName}".Trim() : null,
            CreatedAt: invoice.CreatedAt
        );
    }
}
