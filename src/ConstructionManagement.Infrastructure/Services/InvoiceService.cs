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
    private readonly IRepository<InvoiceImage> _invoiceImageRepository;
    private readonly IRepository<ItemDailyLog> _dailyLogRepository;
    private readonly IRepository<ProjectItem> _projectItemRepository;
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<CompanySettings> _companySettingsRepository;

    // Used in production / integration scenarios
    private readonly ApplicationDbContext? _context;
    private readonly IUnitOfWork? _unitOfWork;
    private readonly ILogger<InvoiceService> _logger;
    private readonly ILocalizationService _localizationService;

    // Full constructor - used by DI container with null validation
    public InvoiceService(
        IRepository<ItemInvoice> invoiceRepository,
        IRepository<InvoiceImage> invoiceImageRepository,
        IRepository<ItemDailyLog> dailyLogRepository,
        IRepository<ProjectItem> projectItemRepository,
        IRepository<Project> projectRepository,
        IRepository<CompanySettings> companySettingsRepository,
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ILogger<InvoiceService> logger,
        ILocalizationService localizationService)
    {
        _invoiceRepository = invoiceRepository ?? throw new ArgumentNullException(nameof(invoiceRepository));
        _invoiceImageRepository = invoiceImageRepository ?? throw new ArgumentNullException(nameof(invoiceImageRepository));
        _dailyLogRepository = dailyLogRepository ?? throw new ArgumentNullException(nameof(dailyLogRepository));
        _projectItemRepository = projectItemRepository ?? throw new ArgumentNullException(nameof(projectItemRepository));
        _projectRepository = projectRepository ?? throw new ArgumentNullException(nameof(projectRepository));
        _companySettingsRepository = companySettingsRepository ?? throw new ArgumentNullException(nameof(companySettingsRepository));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _localizationService = localizationService ?? throw new ArgumentNullException(nameof(localizationService));
    }

    // Test-friendly constructor - only repositories (no DbContext or UnitOfWork)
    public InvoiceService(
        IRepository<ItemInvoice> invoiceRepository,
        IRepository<InvoiceImage> invoiceImageRepository,
        IRepository<ItemDailyLog> dailyLogRepository,
        IRepository<ProjectItem> projectItemRepository,
        IRepository<Project> projectRepository,
        IRepository<CompanySettings> companySettingsRepository,
        ILogger<InvoiceService> logger,
        ILocalizationService localizationService)
    {
        _invoiceRepository = invoiceRepository ?? throw new ArgumentNullException(nameof(invoiceRepository));
        _invoiceImageRepository = invoiceImageRepository ?? throw new ArgumentNullException(nameof(invoiceImageRepository));
        _dailyLogRepository = dailyLogRepository ?? throw new ArgumentNullException(nameof(dailyLogRepository));
        _projectItemRepository = projectItemRepository ?? throw new ArgumentNullException(nameof(projectItemRepository));
        _projectRepository = projectRepository ?? throw new ArgumentNullException(nameof(projectRepository));
        _companySettingsRepository = companySettingsRepository ?? throw new ArgumentNullException(nameof(companySettingsRepository));
        _context = null;
        _unitOfWork = null;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _localizationService = localizationService ?? throw new ArgumentNullException(nameof(localizationService));
    }

    #region New Methods

    public async Task<int> CreateInvoiceAsync(CreateInvoiceRequest request, int createdByUserId, int companyId)
    {
        if (_unitOfWork == null || _context == null)
        {
            _logger.LogError("Transaction support is not available. UnitOfWork or Context is null.");
            throw new InvalidOperationException("Transaction support is not available in this context.");
        }

        _logger.LogInformation("Creating invoice for item {ItemId} by user {UserId}", request.ProjectItemId, createdByUserId);

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Get item and project
            var item = await _projectItemRepository.AsQueryable()
                .Include(i => i.Project)
                .FirstOrDefaultAsync(i => i.Id == request.ProjectItemId);
            
            if (item == null)
            {
                _logger.LogWarning("ProjectItem not found. ItemId: {ItemId}", request.ProjectItemId);
                throw new ArgumentException(_localizationService["Invoice.ItemNotFound"]);
            }

            // Generate invoice number if not provided
            var invoiceDate = request.InvoiceDate ?? DateTime.UtcNow;
            var year = invoiceDate.Year;
            string invoiceNumber = request.InvoiceNumber ?? await GenerateInvoiceNumberAsync(year);

            // Parse invoice type (default: PurchaseInvoice)
            var invoiceType = InvoiceTypeExtensions.FromString(request.InvoiceType) ?? InvoiceType.PurchaseInvoice;

            // Set default values for optional fields
            var subTotal = request.SubTotal ?? request.NetAmount;
            var currency = string.IsNullOrEmpty(request.Currency) ? "EGP" : request.Currency;

            // Create invoice - Status is Draft by default (will change to Pending when images are added)
            var invoice = new ItemInvoice
            {
                CompanyId = companyId,
                ProjectItemId = request.ProjectItemId,
                ProjectId = item.ProjectId,
                InvoiceType = invoiceType.ToDatabaseString(),
                InvoiceNumber = invoiceNumber,
                InvoiceDate = invoiceDate,
                DueDate = request.DueDate,
                SubTotal = subTotal,
                TaxRate = request.TaxRate ?? 0,
                TaxAmount = request.TaxAmount ?? 0,
                RetentionRate = request.RetentionRate ?? 0,
                RetentionAmount = request.RetentionAmount ?? 0,
                NetAmount = request.NetAmount,
                Currency = currency,
                Description = request.Description,
                SupplierVendor = request.SupplierVendor,
                AttachmentPath = request.AttachmentPath,
                StatusEnum = InvoiceStatus.Draft, // Draft status - will change to Pending when images are uploaded
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            };

            // ── Budget Enforcement ──────────────────────────────────────────────
            if (item.EnforceBudget && item.BudgetAmount.HasValue)
            {
                // Calculate used budget (confirmed invoices only)
                var usedBudget = await _invoiceRepository.AsQueryable()
                    .Where(i => i.ProjectItemId == item.Id && i.Status == InvoiceStatus.Approved.ToDatabaseString())
                    .SumAsync(i => i.NetAmount);

                if (usedBudget + request.NetAmount > item.BudgetAmount.Value)
                {
                    _logger.LogWarning("Budget exceeded for item {ItemName}. Budget: {Budget}, Used: {Used}, Requested: {Requested}",
                        item.ItemName, item.BudgetAmount, usedBudget, request.NetAmount);
                    
                    throw new Domain.Exceptions.BudgetExceededException(
                        item.Id, 
                        item.ItemName, 
                        item.BudgetAmount.Value, 
                        usedBudget, 
                        request.NetAmount);
                }

                // Update item's BudgetUsed field (denormalized for performance)
                item.BudgetUsed = usedBudget + request.NetAmount;
                await _projectItemRepository.UpdateAsync(item);
            }
            // ──────────────────────────────────────────────────────────────────

            await _invoiceRepository.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Invoice {InvoiceId} created successfully with number {InvoiceNumber} (Status: Draft)", 
                invoice.Id, invoiceNumber);

            return invoice.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create invoice for item {ItemId}", request.ProjectItemId);
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<InvoiceDto?> GetInvoiceByIdAsync(int invoiceId)
    {
        var invoice = await _invoiceRepository.AsQueryable()
            .Include(i => i.ProjectItem)
            .Include(i => i.Project)
            .Include(i => i.CreatedBy)
            .Include(i => i.Reviewer)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        return invoice == null ? null : MapToDto(invoice);
    }

    public async Task<bool> ReviewInvoiceAsync(int invoiceId, ReviewInvoiceRequest request, int reviewerUserId)
    {
        if (_unitOfWork == null)
        {
            _logger.LogError("UnitOfWork is not available for reviewing invoice {InvoiceId}", invoiceId);
            throw new InvalidOperationException("UnitOfWork is not available in this context.");
        }

        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            _logger.LogWarning("Invoice not found for review. InvoiceId: {InvoiceId}", invoiceId);
            return false;
        }

        // Only allow review if invoice is still pending
        if (invoice.StatusEnum != InvoiceStatus.Pending)
        {
            _logger.LogWarning("Cannot review invoice {InvoiceId} with status {Status}", invoiceId, invoice.Status);
            return false;
        }

        var isApproved = request.Status == "Approved";
        invoice.StatusEnum = isApproved ? InvoiceStatus.Approved : InvoiceStatus.Rejected;
        invoice.ReviewDate = DateTime.UtcNow;
        invoice.ReviewerUserId = reviewerUserId;
        invoice.RejectionReason = request.RejectionReason;

        await _invoiceRepository.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} reviewed by {UserId}. Result: {Status}", 
            invoiceId, reviewerUserId, invoice.Status);
        
        return true;
    }

    public async Task<bool> UpdateInvoiceAsync(int invoiceId, UpdateInvoiceRequest request, int userId)
    {
        if (_unitOfWork == null)
        {
            _logger.LogError("UnitOfWork is not available for updating invoice {InvoiceId}", invoiceId);
            throw new InvalidOperationException("UnitOfWork is not available in this context.");
        }

        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            _logger.LogWarning("Invoice not found for update. InvoiceId: {InvoiceId}", invoiceId);
            return false;
        }

        // Only allow updates if invoice is still pending
        if (invoice.StatusEnum != InvoiceStatus.Pending)
        {
            _logger.LogWarning("Cannot update invoice {InvoiceId} with status {Status}", invoiceId, invoice.Status);
            return false;
        }

        if (request.InvoiceNumber != null)
            invoice.InvoiceNumber = request.InvoiceNumber;
        if (request.InvoiceDate.HasValue)
            invoice.InvoiceDate = request.InvoiceDate.Value;
        if (request.DueDate.HasValue)
            invoice.DueDate = request.DueDate;
        if (request.SubTotal.HasValue)
            invoice.SubTotal = request.SubTotal.Value;
        if (request.TaxRate.HasValue)
            invoice.TaxRate = request.TaxRate;
        if (request.TaxAmount.HasValue)
            invoice.TaxAmount = request.TaxAmount;
        if (request.RetentionRate.HasValue)
            invoice.RetentionRate = request.RetentionRate;
        if (request.RetentionAmount.HasValue)
            invoice.RetentionAmount = request.RetentionAmount;
        if (request.NetAmount.HasValue)
            invoice.NetAmount = request.NetAmount.Value;
        if (request.Currency != null)
            invoice.Currency = request.Currency;
        if (request.Description != null)
            invoice.Description = request.Description;
        if (request.SupplierVendor != null)
            invoice.SupplierVendor = request.SupplierVendor;
        if (request.AttachmentPath != null)
            invoice.AttachmentPath = request.AttachmentPath;

        invoice.UpdatedAt = DateTime.UtcNow;

        await _invoiceRepository.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} updated successfully", invoiceId);
        return true;
    }

    public async Task<bool> DeleteInvoiceAsync(int invoiceId, int userId)
    {
        if (_unitOfWork == null)
        {
            _logger.LogError("UnitOfWork is not available for deleting invoice {InvoiceId}", invoiceId);
            throw new InvalidOperationException("UnitOfWork is not available in this context.");
        }

        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            _logger.LogWarning("Invoice not found for deletion. InvoiceId: {InvoiceId}", invoiceId);
            return false;
        }

        // Only allow deletion if invoice is still pending or draft
        if (invoice.StatusEnum != InvoiceStatus.Pending && invoice.StatusEnum != InvoiceStatus.Draft)
        {
            _logger.LogWarning("Cannot delete invoice {InvoiceId} with status {Status}", invoiceId, invoice.Status);
            return false;
        }

        await _invoiceRepository.DeleteAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} deleted successfully", invoiceId);
        return true;
    }

    public async Task<PagedInvoiceResult> GetInvoicesAsync(InvoiceFilterRequest filter, int companyId)
    {
        _logger.LogDebug("Fetching invoices with filter for company {CompanyId}", companyId);

        var query = _invoiceRepository.AsQueryable()
            .Include(i => i.ProjectItem)
            .Include(i => i.Project)
            .Include(i => i.CreatedBy)
            .Include(i => i.Images)
            .Where(i => i.CompanyId == companyId);

        // Apply filters
        if (filter.ProjectId.HasValue)
            query = query.Where(i => i.ProjectId == filter.ProjectId.Value);

        if (filter.ProjectItemId.HasValue)
            query = query.Where(i => i.ProjectItemId == filter.ProjectItemId.Value);

        if (!string.IsNullOrEmpty(filter.InvoiceType))
        {
            var invoiceType = InvoiceTypeExtensions.FromString(filter.InvoiceType);
            if (invoiceType.HasValue)
                query = query.Where(i => i.InvoiceType == invoiceType.Value.ToDatabaseString());
        }

        if (!string.IsNullOrEmpty(filter.Status))
        {
            var status = InvoiceStatusExtensions.FromString(filter.Status);
            if (status.HasValue)
                query = query.Where(i => i.Status == status.Value.ToDatabaseString());
        }

        if (filter.DateFrom.HasValue)
            query = query.Where(i => i.InvoiceDate >= filter.DateFrom.Value);

        if (filter.DateTo.HasValue)
            query = query.Where(i => i.InvoiceDate <= filter.DateTo.Value);

        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            var term = filter.SearchTerm.ToLower();
            query = query.Where(i => 
                i.InvoiceNumber.ToLower().Contains(term) ||
                (i.Description != null && i.Description.ToLower().Contains(term)) ||
                (i.ProjectItem.ItemName.ToLower().Contains(term)));
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = ApplySorting(query, filter.SortBy, filter.SortDescending);

        // Apply pagination
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        return new PagedInvoiceResult(
            items.Select(MapToListItemDto).ToList(),
            totalCount,
            filter.PageNumber,
            filter.PageSize,
            totalPages
        );
    }

    public async Task<List<InvoiceListItemDto>> GetInvoicesForProjectAsync(int projectId, string? invoiceType = null, string? status = null)
    {
        _logger.LogDebug("Fetching invoices for project {ProjectId}", projectId);

        var query = _invoiceRepository.AsQueryable()
            .Include(i => i.ProjectItem)
            .Include(i => i.CreatedBy)
            .Include(i => i.Images)
            .Where(i => i.ProjectId == projectId);

        if (!string.IsNullOrEmpty(invoiceType))
        {
            var type = InvoiceTypeExtensions.FromString(invoiceType);
            if (type.HasValue)
                query = query.Where(i => i.InvoiceType == type.Value.ToDatabaseString());
        }

        if (!string.IsNullOrEmpty(status))
        {
            var statusEnum = InvoiceStatusExtensions.FromString(status);
            if (statusEnum.HasValue)
                query = query.Where(i => i.Status == statusEnum.Value.ToDatabaseString());
        }

        var invoices = await query.OrderByDescending(i => i.InvoiceDate).ToListAsync();
        return invoices.Select(MapToListItemDto).ToList();
    }

    public async Task<List<InvoiceListItemDto>> GetInvoicesForItemAsync(int projectItemId)
    {
        _logger.LogDebug("Fetching invoices for item {ItemId}", projectItemId);

        var invoices = await _invoiceRepository.AsQueryable()
            .Include(i => i.ProjectItem)
            .Include(i => i.Project)
            .Include(i => i.CreatedBy)
            .Include(i => i.Images)
            .Where(i => i.ProjectItemId == projectItemId)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();

        return invoices.Select(MapToListItemDto).ToList();
    }

    public async Task<List<InvoiceListItemDto>> GetPendingInvoicesAsync(int companyId)
    {
        _logger.LogDebug("Fetching pending invoices for company {CompanyId}", companyId);

        var invoices = await _invoiceRepository.AsQueryable()
            .Include(i => i.ProjectItem)
            .Include(i => i.Project)
            .Include(i => i.CreatedBy)
            .Include(i => i.Images)
            .Where(i => i.CompanyId == companyId && i.Status == InvoiceStatus.Pending.ToDatabaseString())
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(MapToListItemDto).ToList();
    }

    public async Task<bool> CanUserApproveInvoiceAsync(int userId, int invoiceId)
    {
        var invoice = await _invoiceRepository.AsQueryable()
            .Include(i => i.Project)
            .ThenInclude(p => p.Company)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null)
            return false;

        // Check company settings for approval requirements
        var settings = await _companySettingsRepository.AsQueryable()
            .FirstOrDefaultAsync(s => s.CompanyId == invoice.Project.CompanyId);

        if (settings == null || !settings.EnableInvoiceReview)
            return true; // No approval required

        // Check if user has the required role
        // This would integrate with the role/permission system
        return true; // Simplified for now
    }

    public async Task<int> AddInvoiceImageAsync(int invoiceId, string imagePath, string? originalFileName, long? fileSize, string? contentType, string? description = null)
    {
        if (_unitOfWork == null)
        {
            _logger.LogError("UnitOfWork is not available for adding image to invoice {InvoiceId}", invoiceId);
            throw new InvalidOperationException("UnitOfWork is not available in this context.");
        }

        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
        {
            _logger.LogWarning("Invoice not found for adding image. InvoiceId: {InvoiceId}", invoiceId);
            throw new ArgumentException("Invoice not found");
        }

        // Get max display order
        var maxOrder = await _invoiceImageRepository.AsQueryable()
            .Where(i => i.ItemInvoiceId == invoiceId)
            .MaxAsync(i => (int?)i.DisplayOrder) ?? -1;

        var image = new InvoiceImage
        {
            ItemInvoiceId = invoiceId,
            ImagePath = imagePath,
            OriginalFileName = originalFileName,
            FileSize = fileSize,
            ContentType = contentType,
            DisplayOrder = maxOrder + 1,
            Description = description
        };

        await _invoiceImageRepository.AddAsync(image);
        
        // ⭐ Auto-transition from Draft to Pending when first image is added
        if (invoice.StatusEnum == InvoiceStatus.Draft)
        {
            invoice.StatusEnum = InvoiceStatus.Pending;
            _logger.LogInformation("Invoice {InvoiceId} status changed from Draft to Pending (first image added)", invoiceId);
        }
        
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Image {ImageId} added to invoice {InvoiceId}", image.Id, invoiceId);
        return image.Id;
    }

    public async Task<bool> RemoveInvoiceImageAsync(int invoiceId, int imageId)
    {
        if (_unitOfWork == null)
        {
            _logger.LogError("UnitOfWork is not available for removing image from invoice {InvoiceId}", invoiceId);
            throw new InvalidOperationException("UnitOfWork is not available in this context.");
        }

        var image = await _invoiceImageRepository.AsQueryable()
            .FirstOrDefaultAsync(i => i.Id == imageId && i.ItemInvoiceId == invoiceId);

        if (image == null)
        {
            _logger.LogWarning("Image not found for removal. ImageId: {ImageId}, InvoiceId: {InvoiceId}", imageId, invoiceId);
            return false;
        }

        await _invoiceImageRepository.DeleteAsync(image);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Image {ImageId} removed from invoice {InvoiceId}", imageId, invoiceId);
        return true;
    }

    public async Task<bool> ReorderInvoiceImagesAsync(int invoiceId, Dictionary<int, int> imageOrder)
    {
        if (_unitOfWork == null)
        {
            _logger.LogError("UnitOfWork is not available for reordering images for invoice {InvoiceId}", invoiceId);
            throw new InvalidOperationException("UnitOfWork is not available in this context.");
        }

        var images = await _invoiceImageRepository.AsQueryable()
            .Where(i => i.ItemInvoiceId == invoiceId)
            .ToListAsync();

        foreach (var image in images)
        {
            if (imageOrder.TryGetValue(image.Id, out var order))
            {
                image.DisplayOrder = order;
            }
        }

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Images reordered for invoice {InvoiceId}", invoiceId);
        return true;
    }

    public async Task<InvoiceStatisticsDto> GetInvoiceStatisticsAsync(int? projectId = null, int? companyId = null)
    {
        var query = _invoiceRepository.AsQueryable();

        if (projectId.HasValue)
            query = query.Where(i => i.ProjectId == projectId.Value);

        if (companyId.HasValue)
            query = query.Where(i => i.CompanyId == companyId.Value);

        var invoices = await query.ToListAsync();

        return new InvoiceStatisticsDto(
            TotalInvoices: invoices.Count,
            PendingInvoices: invoices.Count(i => i.StatusEnum == InvoiceStatus.Pending),
            ApprovedInvoices: invoices.Count(i => i.StatusEnum == InvoiceStatus.Approved),
            RejectedInvoices: invoices.Count(i => i.StatusEnum == InvoiceStatus.Rejected),
            TotalAmount: invoices.Sum(i => i.NetAmount),
            PendingAmount: invoices.Where(i => i.StatusEnum == InvoiceStatus.Pending).Sum(i => i.NetAmount),
            ApprovedAmount: invoices.Where(i => i.StatusEnum == InvoiceStatus.Approved).Sum(i => i.NetAmount),
            DisbursementAuthorizationCount: invoices.Count(i => i.InvoiceTypeEnum == InvoiceType.DisbursementAuthorization),
            PurchaseInvoiceCount: invoices.Count(i => i.InvoiceTypeEnum == InvoiceType.PurchaseInvoice)
        );
    }

    #endregion

    #region Legacy Methods

    [Obsolete("Use CreateInvoiceAsync with companyId parameter")]
    public async Task<int> CreateInvoiceAsync(int itemId, CreateInvoiceRequest request, int createdByUserId)
    {
        // Get company from item
        var item = await _projectItemRepository.AsQueryable()
            .Include(i => i.Project)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null)
            throw new ArgumentException("Item not found");

        var newRequest = new CreateInvoiceRequest(
            ProjectItemId: itemId,
            InvoiceType: request.InvoiceType ?? "PurchaseInvoice",
            InvoiceNumber: request.InvoiceNumber,
            InvoiceDate: request.InvoiceDate,
            NetAmount: request.NetAmount,
            Currency: request.Currency,
            Description: request.Description,
            SupplierVendor: request.SupplierVendor
        );

        return await CreateInvoiceAsync(newRequest, createdByUserId, item.Project.CompanyId ?? 0);
    }

    [Obsolete("Use GetInvoicesForItemAsync instead")]
    async Task<List<InvoiceDto>> IInvoiceService.GetInvoicesForItemAsync(int itemId, string? statusFilter)
    {
        var items = await GetInvoicesForItemAsync(itemId);
        return items.Select(i => new InvoiceDto(
            Id: i.Id,
            ProjectId: i.ProjectId,
            ProjectName: i.ProjectName,
            ProjectItemId: i.ProjectItemId,
            ItemName: i.ItemName,
            InvoiceType: i.InvoiceType,
            InvoiceTypeDisplayName: i.InvoiceTypeDisplayName,
            InvoiceNumber: i.InvoiceNumber,
            InvoiceDate: i.InvoiceDate,
            DueDate: null,
            SubTotal: i.NetAmount,
            TaxRate: null,
            TaxAmount: null,
            RetentionRate: null,
            RetentionAmount: null,
            NetAmount: i.NetAmount,
            Currency: i.Currency,
            Description: i.Description,
            SupplierVendor: null,
            Status: i.Status,
            StatusDisplayName: i.StatusDisplayName,
            RejectionReason: null,
            ReviewDate: null,
            ReviewerFullName: null,
            AttachmentPath: null,
            CreatedByUserId: 0,
            CreatedByFullName: i.CreatedByFullName,
            CreatedAt: i.CreatedAt,
            UpdatedAt: null,
            Images: new List<InvoiceImageDto>()
        )).ToList();
    }

    [Obsolete("Use GetInvoicesAsync with filter instead")]
    async Task<List<InvoiceDto>> IInvoiceService.GetAllInvoicesAsync(int? projectId, string? statusFilter)
    {
        var items = await GetInvoicesForProjectAsync(projectId ?? 0, null, statusFilter);
        return items.Select(i => new InvoiceDto(
            Id: i.Id,
            ProjectId: i.ProjectId,
            ProjectName: i.ProjectName,
            ProjectItemId: i.ProjectItemId,
            ItemName: i.ItemName,
            InvoiceType: i.InvoiceType,
            InvoiceTypeDisplayName: i.InvoiceTypeDisplayName,
            InvoiceNumber: i.InvoiceNumber,
            InvoiceDate: i.InvoiceDate,
            DueDate: null,
            SubTotal: i.NetAmount,
            TaxRate: null,
            TaxAmount: null,
            RetentionRate: null,
            RetentionAmount: null,
            NetAmount: i.NetAmount,
            Currency: i.Currency,
            Description: i.Description,
            SupplierVendor: null,
            Status: i.Status,
            StatusDisplayName: i.StatusDisplayName,
            RejectionReason: null,
            ReviewDate: null,
            ReviewerFullName: null,
            AttachmentPath: null,
            CreatedByUserId: 0,
            CreatedByFullName: i.CreatedByFullName,
            CreatedAt: i.CreatedAt,
            UpdatedAt: null,
            Images: new List<InvoiceImageDto>()
        )).ToList();
    }

    #endregion

    #region Private Helper Methods

    private async Task<string> GenerateInvoiceNumberAsync(int year)
    {
        if (_context == null)
            return $"INV-{year}-{Guid.NewGuid().ToString().Substring(0, 8)}";

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

        return parameters[1].Value?.ToString()
            ?? $"INV-{year}-{Guid.NewGuid().ToString().Substring(0, 8)}";
    }

    private static IQueryable<ItemInvoice> ApplySorting(IQueryable<ItemInvoice> query, string sortBy, bool descending)
    {
        return sortBy?.ToLower() switch
        {
            "invoicenumber" => descending ? query.OrderByDescending(i => i.InvoiceNumber) : query.OrderBy(i => i.InvoiceNumber),
            "invoicedate" => descending ? query.OrderByDescending(i => i.InvoiceDate) : query.OrderBy(i => i.InvoiceDate),
            "netamount" => descending ? query.OrderByDescending(i => i.NetAmount) : query.OrderBy(i => i.NetAmount),
            "status" => descending ? query.OrderByDescending(i => i.Status) : query.OrderBy(i => i.Status),
            "createdat" => descending ? query.OrderByDescending(i => i.CreatedAt) : query.OrderBy(i => i.CreatedAt),
            _ => descending ? query.OrderByDescending(i => i.InvoiceDate) : query.OrderBy(i => i.InvoiceDate)
        };
    }

    private static InvoiceDto MapToDto(ItemInvoice invoice)
    {
        var invoiceType = InvoiceTypeExtensions.FromString(invoice.InvoiceType) ?? InvoiceType.PurchaseInvoice;
        var status = InvoiceStatusExtensions.FromString(invoice.Status) ?? InvoiceStatus.Pending;

        return new InvoiceDto(
            Id: invoice.Id,
            ProjectId: invoice.ProjectId,
            ProjectName: invoice.Project?.Name ?? "",
            ProjectItemId: invoice.ProjectItemId,
            ItemName: invoice.ProjectItem?.ItemName ?? "",
            InvoiceType: invoice.InvoiceType,
            InvoiceTypeDisplayName: invoiceType.GetDisplayName(),
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
            StatusDisplayName: status.GetDisplayName(),
            RejectionReason: invoice.RejectionReason,
            ReviewDate: invoice.ReviewDate,
            ReviewerFullName: invoice.Reviewer != null ? $"{invoice.Reviewer.FirstName} {invoice.Reviewer.LastName}".Trim() : null,
            AttachmentPath: invoice.AttachmentPath,
            CreatedByUserId: invoice.CreatedByUserId,
            CreatedByFullName: invoice.CreatedBy != null ? $"{invoice.CreatedBy.FirstName} {invoice.CreatedBy.LastName}".Trim() : null,
            CreatedAt: invoice.CreatedAt,
            UpdatedAt: invoice.UpdatedAt,
            Images: invoice.Images?.Select(img => new InvoiceImageDto(
                Id: img.Id,
                ImagePath: img.ImagePath,
                OriginalFileName: img.OriginalFileName,
                FileSize: img.FileSize,
                ContentType: img.ContentType,
                DisplayOrder: img.DisplayOrder,
                Description: img.Description
            )).ToList() ?? new List<InvoiceImageDto>()
        );
    }

    private static InvoiceListItemDto MapToListItemDto(ItemInvoice invoice)
    {
        var invoiceType = InvoiceTypeExtensions.FromString(invoice.InvoiceType) ?? InvoiceType.PurchaseInvoice;
        var status = InvoiceStatusExtensions.FromString(invoice.Status) ?? InvoiceStatus.Pending;

        return new InvoiceListItemDto(
            Id: invoice.Id,
            ProjectId: invoice.ProjectId,
            ProjectName: invoice.Project?.Name ?? "",
            ProjectItemId: invoice.ProjectItemId,
            ItemName: invoice.ProjectItem?.ItemName ?? "",
            InvoiceType: invoice.InvoiceType,
            InvoiceTypeDisplayName: invoiceType.GetDisplayName(),
            InvoiceNumber: invoice.InvoiceNumber ?? string.Empty,
            InvoiceDate: invoice.InvoiceDate,
            NetAmount: invoice.NetAmount,
            Currency: invoice.Currency ?? "EGP",
            Status: invoice.Status ?? "Pending",
            StatusDisplayName: status.GetDisplayName(),
            Description: invoice.Description,
            ImageCount: invoice.Images?.Count ?? 0,
            CreatedByFullName: invoice.CreatedBy != null ? $"{invoice.CreatedBy.FirstName} {invoice.CreatedBy.LastName}".Trim() : null,
            CreatedAt: invoice.CreatedAt
        );
    }

    #endregion
}
