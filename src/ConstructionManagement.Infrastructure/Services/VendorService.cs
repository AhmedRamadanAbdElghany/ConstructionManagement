using ConstructionManagement.Application.DTOs.Vendor;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;

namespace ConstructionManagement.Infrastructure.Services;

public class VendorService : IVendorService
{
    private readonly IRepository<Vendor> _vendorRepository;
    private readonly IRepository<VendorInvoice> _invoiceRepository;
    private readonly IRepository<CompanySettings> _settingsRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<VendorTransaction> _transactionRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService? _notificationService;
    private readonly ICompanyContext _companyContext;

    private readonly IActivityLogService _activityLogService;

    private readonly IRepository<VendorProduct> _productRepository;
    private readonly IRepository<DeliveryCostTier> _deliveryTierRepository;
    private readonly IRepository<ItemInvoice> _itemInvoiceRepository;

    public VendorService(
        IRepository<Vendor> vendorRepository,
        IRepository<VendorInvoice> invoiceRepository,
        IRepository<VendorProduct> productRepository,
        IRepository<VendorTransaction> transactionRepository,
        IRepository<CompanySettings> settingsRepository,
        IRepository<User> userRepository,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        IActivityLogService activityLogService,
        IRepository<DeliveryCostTier> deliveryTierRepository,
        IRepository<ItemInvoice> itemInvoiceRepository,
        INotificationService? notificationService = null,
        ICompanyContext companyContext = null!)
    {
        _vendorRepository = vendorRepository;
        _invoiceRepository = invoiceRepository;
        _productRepository = productRepository;
        _transactionRepository = transactionRepository;
        _settingsRepository = settingsRepository;
        _userRepository = userRepository;
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
        _activityLogService = activityLogService;
        _deliveryTierRepository = deliveryTierRepository;
        _itemInvoiceRepository = itemInvoiceRepository;
        _notificationService = notificationService;
        _companyContext = companyContext;
    }
    
    public async Task<IEnumerable<VendorDto>> GetVendorsAsync()
    {
        var vendors = await _vendorRepository.GetAllAsync();
        return vendors.Select(v => new VendorDto
        {
            Id = v.Id,
            Name = v.Name,
            Phone = v.Phone,
            Email = v.Email,
            Address = v.Address,
            TaxNumber = v.TaxNumber,
            ContactPerson = v.ContactPerson,
            Notes = v.Notes,
            CompanyId = v.CompanyId,
            VendorType = v.VendorType,
            IsActive = v.IsActive,
            Latitude = v.Latitude,
            Longitude = v.Longitude,
            IsPublic = v.IsPublic,
            UserId = v.UserId,
            IsRegistered = v.UserId.HasValue
        });
    }


    public async Task<VendorDto?> GetVendorByIdAsync(int id)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);
        if (vendor == null) return null;

        var invoiceCount = await _invoiceRepository.AsQueryable().CountAsync(i => i.VendorId == id);

        return new VendorDto
        {
            Id = vendor.Id,
            Name = vendor.Name,
            Phone = vendor.Phone,
            Email = vendor.Email,
            Address = vendor.Address,
            TaxNumber = vendor.TaxNumber,
            ContactPerson = vendor.ContactPerson,
            Notes = vendor.Notes,
            CompanyId = vendor.CompanyId,
            VendorType = vendor.VendorType,
            IsActive = vendor.IsActive,
            Latitude = vendor.Latitude,
            Longitude = vendor.Longitude,
            IsPublic = vendor.IsPublic,
            UserId = vendor.UserId,
            InvoiceCount = invoiceCount,
            IsRegistered = vendor.UserId.HasValue
        };
    }

    public async Task<VendorDto> CreateVendorAsync(CreateVendorRequest request)
    {
        var vendor = new Vendor
        {
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            TaxNumber = request.TaxNumber,
            ContactPerson = request.ContactPerson,
            Notes = request.Notes,
            CompanyId = null, // Independent vendor for now
            VendorType = request.VendorType ?? "General",
            IsActive = true,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            IsPublic = request.IsPublic,
            CreatedAt = DateTime.UtcNow
        };

        await _vendorRepository.AddAsync(vendor);
        await _unitOfWork.SaveChangesAsync();

        return await GetVendorByIdAsync(vendor.Id) ?? throw new Exception("Error creating vendor");
    }

    public async Task<VendorDto> UpdateVendorAsync(int id, UpdateVendorRequest request)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);
        if (vendor == null) throw new KeyNotFoundException("Vendor not found");

        vendor.Name = request.Name;
        vendor.Phone = request.Phone;
        vendor.Email = request.Email;
        vendor.Address = request.Address;
        vendor.TaxNumber = request.TaxNumber;
        vendor.ContactPerson = request.ContactPerson;
        vendor.Notes = request.Notes;
        if (request.VendorType != null) vendor.VendorType = request.VendorType;
        vendor.IsActive = request.IsActive;
        
        // Update location if provided (assuming UpdateVendorRequest has these fields, check DTO first?)
        // Assuming UpdateVendorRequest might not have Lat/Long yet, if not, careful.
        // Checking DTO... UpdateVendorRequest usually mirrors Create but let's check.
        // If they are missing in DTO, we can't update them here. 
        // For now, proceed with basic fields.
        
        vendor.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
        return await GetVendorByIdAsync(id) ?? throw new Exception("Error updating vendor");
    }

    public async Task<bool> DeleteVendorAsync(int id)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);
        if (vendor == null) return false;

        // Soft delete?
        vendor.IsActive = false; 
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<VendorInvoiceDto>> GetInvoicesByVendorAsync(int vendorId)
    {
        var invoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.VendorId == vendorId)
            .Include(i => i.Project)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(MapInvoiceToDto);
    }

    public async Task<IEnumerable<VendorInvoiceDto>> GetPendingInvoicesAsync()
    {
        var invoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.ApprovalStatus == InvoiceApprovalStatus.Pending)
            .Include(i => i.Vendor)
            .Include(i => i.Project)
            .Include(i => i.CreatedByUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(MapInvoiceToDto);
    }

    public async Task<VendorInvoiceDto> CreateInvoiceAsync(CreateVendorInvoiceRequest request)
    {
        string? fileUrl = null;
        if (request.File != null)
        {
             var result = await _fileStorageService.SaveFileAsync(request.File, "invoices");
             fileUrl = result.Path;
        }

        var invoice = new VendorInvoice
        {
            ProjectId = request.ProjectId,
            InvoiceNumber = request.InvoiceNumber,
            InvoiceDate = request.InvoiceDate,
            Amount = request.Amount,
            Description = request.Description,
            Notes = request.Notes,
            FileUrl = fileUrl,
            OriginalFileName = request.File?.FileName,
            MaterialType = request.MaterialType,
            ApprovalStatus = InvoiceApprovalStatus.Pending,
            CreatedByUserId = request.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };
        
        // Handle Shadow Vendor / New Vendor Entry
        if ((request.VendorId == null || request.VendorId == 0) && !string.IsNullOrEmpty(request.NewVendorName))
        {
             var existingShadow = await _vendorRepository.AsQueryable()
                .FirstOrDefaultAsync(v => v.Name == request.NewVendorName && v.IsExternalVendor);

             if (existingShadow != null)
             {
                 invoice.VendorId = existingShadow.Id;
             }
             else
             {
                 var newVendor = new Vendor
                 {
                     Name = request.NewVendorName,
                     IsPublic = false,
                     IsActive = true,
                     IsExternalVendor = true,
                     ExternalVendorSource = "InvoiceUpload",
                     VendorType = "External",
                     CompanyId = _companyContext?.CompanyId,
                     CreatedAt = DateTime.UtcNow
                 };
                 await _vendorRepository.AddAsync(newVendor);
                 await _unitOfWork.SaveChangesAsync();
                 invoice.VendorId = newVendor.Id;
             }
        }
        else if (request.VendorId.HasValue)
        {
             invoice.VendorId = request.VendorId.Value;
        }
        else
        {
            throw new ArgumentException("VendorId or NewVendorName must be provided");
        }

        await _invoiceRepository.AddAsync(invoice);
        await _unitOfWork.SaveChangesAsync();
        
        // Reload to get relations if needed, or just return basic
        return MapInvoiceToDto(invoice);
    }

    public async Task<VendorInvoiceDto> ReviewInvoiceAsync(int invoiceId, ReviewVendorInvoiceRequest request, int reviewerId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null) throw new KeyNotFoundException("Invoice not found");

        invoice.ApprovalStatus = request.IsApproved ? InvoiceApprovalStatus.Approved : InvoiceApprovalStatus.Rejected;
        invoice.ApprovedByUserId = reviewerId;
        invoice.ApprovedDate = DateTime.UtcNow;
        invoice.RejectionReason = request.RejectionReason;

        await _unitOfWork.SaveChangesAsync();
        return MapInvoiceToDto(invoice);
    }

    public async Task<VendorInvoiceDto?> GetInvoiceByIdAsync(int id)
    {
        var invoice = await _invoiceRepository.AsQueryable()
            .Include(i => i.Vendor)
            .Include(i => i.Project)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) return null;
        return MapInvoiceToDto(invoice);
    }

    public async Task<IEnumerable<VendorInvoiceDto>> GetInvoicesByProjectAsync(int projectId)
    {
        var invoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.ProjectId == projectId)
            .Include(i => i.Vendor)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(MapInvoiceToDto);
    }

    public async Task<IEnumerable<VendorProductDto>> GetVendorProductsAsync(int vendorId)
    {
        var products = await _productRepository.AsQueryable()
            .Where(p => p.VendorId == vendorId && p.IsActive)
            .ToListAsync();

        return products.Select(p => new VendorProductDto
        {
            Id = p.Id,
            VendorId = p.VendorId,
            Name = p.Name,
            CategoryId = p.CategoryId,
            CategoryName = p.Category != null ? p.Category.Name : p.CategoryLegacy,
            Price = p.Price,
            Unit = p.Unit,
            Description = p.Description,
            QuantityInStock = p.QuantityInStock,
            LowStockThreshold = p.LowStockThreshold,
            PurchasePrice = p.PurchasePrice,
            IsActive = p.IsActive,
            ImageUrl = p.ImageUrl,
            SKU = p.SKU,
            SalesCount = p.SalesCount,
            AverageRating = p.AverageRating,
            TotalReviews = p.TotalReviews
        });
    }

    public async Task<VendorProductDto> AddProductAsync(int vendorId, CreateVendorProductRequest request)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId);
        if (vendor == null) throw new KeyNotFoundException("Vendor not found");

        var product = new VendorProduct
        {
            VendorId = vendorId,
            CompanyId = vendor.CompanyId,
            Name = request.Name,
            CategoryId = request.CategoryId,
            Price = request.Price,
            Unit = request.Unit,
            Description = request.Description,
            QuantityInStock = request.QuantityInStock,
            LowStockThreshold = request.LowStockThreshold,
            PurchasePrice = request.PurchasePrice,
            ImageUrl = request.ImageUrl,
            SKU = request.SKU,
            IsActive = true
        };

        await _productRepository.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();
        
        // If initial stock > 0, record a transaction? 
        // Typically yes, "Initial Stock".
        if (request.QuantityInStock > 0)
        {
             var transaction = new VendorTransaction
             {
                 VendorId = vendorId,
                 VendorProductId = product.Id,
                 TransactionType = "InitialStock",
                 Quantity = request.QuantityInStock,
                 UnitPrice = request.PurchasePrice, // Cost at start
                 TransactionDate = DateTime.UtcNow,
                 Notes = "Initial Stock"
             };
             await _transactionRepository.AddAsync(transaction);
             await _unitOfWork.SaveChangesAsync();
        }

        return new VendorProductDto
        {
            Id = product.Id,
            VendorId = product.VendorId,
            Name = product.Name,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            Price = product.Price,
            Unit = product.Unit,
            Description = product.Description,
            QuantityInStock = product.QuantityInStock,
            LowStockThreshold = product.LowStockThreshold,
            PurchasePrice = product.PurchasePrice,
            ImageUrl = product.ImageUrl,
            SKU = product.SKU,
            IsActive = product.IsActive
        };
    }

    public async Task<VendorProductDto> UpdateProductAsync(int productId, UpdateVendorProductRequest request)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null) throw new KeyNotFoundException("Product not found");

        product.Name = request.Name;
        product.CategoryId = request.CategoryId;
        product.Price = request.Price;
        product.Unit = request.Unit;
        product.Description = request.Description;
        product.LowStockThreshold = request.LowStockThreshold;
        product.PurchasePrice = request.PurchasePrice;
        product.QuantityInStock = request.QuantityInStock;
        product.ImageUrl = request.ImageUrl;
        product.SKU = request.SKU;
        product.IsActive = request.IsActive;
        
        await _unitOfWork.SaveChangesAsync();

        return new VendorProductDto
        {
            Id = product.Id,
            VendorId = product.VendorId,
            Name = product.Name,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            Price = product.Price,
            Unit = product.Unit,
            Description = product.Description,
            QuantityInStock = product.QuantityInStock,
            LowStockThreshold = product.LowStockThreshold,
            PurchasePrice = product.PurchasePrice,
            ImageUrl = product.ImageUrl,
            SKU = product.SKU,
            IsActive = product.IsActive
        };
    }

    public async Task<VendorTransactionDto> RecordTransactionAsync(int vendorId, CreateVendorTransactionRequest request)
    {
        var product = await _productRepository.GetByIdAsync(request.VendorProductId);
        if (product == null || product.VendorId != vendorId) 
            throw new KeyNotFoundException("Product not found or does not belong to vendor");

        var transaction = new VendorTransaction
        {
            VendorId = vendorId,
            VendorProductId = request.VendorProductId,
            TransactionType = request.TransactionType, // "Sale", "Purchase"
            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice,
            Notes = request.Notes,
            ReferenceNumber = request.ReferenceNumber,
            TransactionDate = DateTime.UtcNow
        };

        // Update Stock
        if (request.TransactionType == "Purchase" || request.TransactionType == "Return" || request.TransactionType == "InitialStock")
        {
             product.QuantityInStock += request.Quantity;
        }
        else if (request.TransactionType == "Sale" || request.TransactionType == "Loss")
        {
             product.QuantityInStock -= request.Quantity;
        }
        // "Adjustment" could be + or - based on sign of Quantity, but usually handled by strict type. 
        // For simplicity, let's assume "Adjustment" takes signed Quantity.
        else if (request.TransactionType == "Adjustment")
        {
             product.QuantityInStock += request.Quantity;
        }

        await _transactionRepository.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return new VendorTransactionDto
        {
            Id = transaction.Id,
            VendorId = transaction.VendorId,
            VendorProductId = transaction.VendorProductId,
            ProductName = product.Name,
            TransactionType = transaction.TransactionType,
            Quantity = transaction.Quantity,
            UnitPrice = transaction.UnitPrice,
            TransactionDate = transaction.TransactionDate,
            Notes = transaction.Notes,
            ReferenceNumber = transaction.ReferenceNumber
        };
    }

    public async Task<IEnumerable<VendorTransactionDto>> GetVendorTransactionsAsync(int vendorId)
    {
        var transactions = await _transactionRepository.AsQueryable()
            .Where(t => t.VendorId == vendorId)
            .Include(t => t.VendorProduct)
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync();

        return transactions.Select(t => new VendorTransactionDto
        {
            Id = t.Id,
            VendorId = t.VendorId,
            VendorProductId = t.VendorProductId,
            ProductName = t.VendorProduct?.Name ?? "Unknown",
            TransactionType = t.TransactionType,
            Quantity = t.Quantity,
            UnitPrice = t.UnitPrice,
            TransactionDate = t.TransactionDate,
            Notes = t.Notes,
            ReferenceNumber = t.ReferenceNumber
        });
    }

    public async Task<bool> DeleteProductAsync(int productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null) return false;

        product.IsActive = false;
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<VendorDto> UpdateVendorProfileAsync(int userId, UpdateVendorRequest request)
    {
        var vendor = await _vendorRepository.AsQueryable()
            .FirstOrDefaultAsync(v => v.UserId == userId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found for this user");

        vendor.Name = request.Name;
        vendor.Phone = request.Phone;
        vendor.Email = request.Email;
        vendor.Address = request.Address;
        vendor.TaxNumber = request.TaxNumber;
        vendor.ContactPerson = request.ContactPerson;
        vendor.Notes = request.Notes;
        vendor.VendorType = request.VendorType;
        vendor.IsActive = request.IsActive;
        // Basic update from request, assuming we might need to add Lat/Lng to UpdateVendorRequest soon
        vendor.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
        return await GetVendorByIdAsync(vendor.Id) ?? throw new Exception("Error reloading vendor");
    }

    public async Task<VendorDto?> GetVendorByUserIdAsync(int userId)
    {
        var vendor = await _vendorRepository.AsQueryable()
            .FirstOrDefaultAsync(v => v.UserId == userId);

        if (vendor == null) return null;
        return await GetVendorByIdAsync(vendor.Id);
    }

    public async Task<IEnumerable<VendorInvoiceSummary>> GetVendorInvoiceSummaryAsync()
    {
        var companyId = _companyContext?.CompanyId;
        
        var vInvoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.VendorId.HasValue)
            .ToListAsync();

        var itemInvoices = await _itemInvoiceRepository.AsQueryable()
            .Where(i => i.CompanyId == companyId && i.VendorId.HasValue)
            .ToListAsync();

        var vendorSummaries = new Dictionary<int, VendorInvoiceSummary>();

        foreach (var inv in vInvoices)
        {
            var vid = inv.VendorId!.Value;
            if (!vendorSummaries.ContainsKey(vid))
            {
                vendorSummaries[vid] = new VendorInvoiceSummary { VendorId = vid, VendorName = inv.Vendor?.Name ?? "Unknown" };
            }
            
            var s = vendorSummaries[vid];
            s.TotalInvoices++;
            s.TotalAmount += inv.Amount;
            if (inv.ApprovalStatus == InvoiceApprovalStatus.Pending) s.PendingApprovals++;
            if (inv.ApprovalStatus == InvoiceApprovalStatus.Approved) s.ApprovedCount++;
            if (inv.ApprovalStatus == InvoiceApprovalStatus.Rejected) s.RejectedCount++;
        }

        foreach (var inv in itemInvoices)
        {
            var vid = inv.VendorId!.Value;
            if (!vendorSummaries.ContainsKey(vid))
            {
                vendorSummaries[vid] = new VendorInvoiceSummary { VendorId = vid, VendorName = inv.Vendor?.Name ?? inv.ExternalVendorName ?? "Unknown" };
            }

            var s = vendorSummaries[vid];
            s.TotalInvoices++;
            s.TotalAmount += inv.NetAmount;
            if (inv.Status == InvoiceStatus.Pending.ToDatabaseString()) s.PendingApprovals++;
            if (inv.Status == InvoiceStatus.Approved.ToDatabaseString()) s.ApprovedCount++;
            if (inv.Status == InvoiceStatus.Rejected.ToDatabaseString()) s.RejectedCount++;
        }

        return vendorSummaries.Values.OrderByDescending(s => s.TotalAmount);
    }

    public async Task<IEnumerable<PublicVendorDto>> SearchPublicVendorsAsync(VendorSearchRequest request)
    {
        var query = _vendorRepository.AsQueryable()
            .IgnoreQueryFilters()
            .Where(v => v.IsActive && (v.IsPublic || v.Products.Any(p => p.IsActive)));

        if (!string.IsNullOrEmpty(request.Name))
        {
            query = query.Where(v => v.Name.Contains(request.Name));
        }
        if (!string.IsNullOrEmpty(request.Material))
        {
            // Search by material type in vendor products
            var vendorIdsWithMaterial = await _productRepository.AsQueryable()
                .IgnoreQueryFilters()
                .Where(p => p.Name.Contains(request.Material) || (p.Description != null && p.Description.Contains(request.Material)))
                .Select(p => p.VendorId)
                .Distinct()
                .ToListAsync();
            query = query.Where(v => vendorIdsWithMaterial.Contains(v.Id));
        }

        // Include Products here to ensure they are loaded
        var vendors = await query.Include(v => v.Products).ToListAsync();

        if (request.Latitude.HasValue && request.Longitude.HasValue && request.RadiusKm < 5000)
        {
            var vendorsWithDistance = vendors.Select(v => new PublicVendorDto
            {
                Id = v.Id,
                Name = v.Name,
                Notes = v.Notes,
                Address = v.Address,
                VendorType = v.VendorType,
                Latitude = v.Latitude,
                Longitude = v.Longitude,
                DistanceKm = v.Latitude.HasValue && v.Longitude.HasValue 
                    ? CalculateDistance(request.Latitude.Value, request.Longitude.Value, v.Latitude.Value, v.Longitude.Value) 
                    : 99999,
                TopProducts = v.Products
                    .Where(p => p.IsActive && (string.IsNullOrEmpty(request.Material) || p.Name.Contains(request.Material) || (p.Description != null && p.Description.Contains(request.Material))))
                    .Select(p => new VendorProductDto
                    {
                        Id = p.Id,
                        VendorId = p.VendorId,
                        Name = p.Name,
                        CategoryId = p.CategoryId,
                        CategoryName = p.Category != null ? p.Category.Name : p.CategoryLegacy,
                        Price = p.Price,
                        Unit = p.Unit,
                        Description = p.Description,
                        QuantityInStock = p.QuantityInStock,
                        LowStockThreshold = p.LowStockThreshold,
                        PurchasePrice = p.PurchasePrice,
                        IsActive = p.IsActive,
                        SalesCount = p.SalesCount
                    })
                    .Take(5)
                    .ToList()
            })
            .Where(v => v.DistanceKm <= request.RadiusKm)
            .OrderBy(v => v.DistanceKm)
            .ToList();

            return vendorsWithDistance;
        }

        // Return all found vendors if no location specified or radius is huge ("Everywhere")
        return vendors.Select(v => new PublicVendorDto
        {
            Id = v.Id,
            Name = v.Name,
            Notes = v.Notes,
            Address = v.Address,
            VendorType = v.VendorType,
            Latitude = v.Latitude,
            Longitude = v.Longitude,
            DistanceKm = 0,
            TopProducts = v.Products
                .Where(p => p.IsActive && (string.IsNullOrEmpty(request.Material) || p.Name.Contains(request.Material) || (p.Description != null && p.Description.Contains(request.Material))))
                .Select(p => new VendorProductDto
                {
                    Id = p.Id,
                    VendorId = p.VendorId,
                    Name = p.Name,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : p.CategoryLegacy,
                    Price = p.Price,
                    Unit = p.Unit,
                    Description = p.Description,
                    QuantityInStock = p.QuantityInStock,
                    LowStockThreshold = p.LowStockThreshold,
                    PurchasePrice = p.PurchasePrice,
                    IsActive = p.IsActive,
                    SalesCount = p.SalesCount
                })
                .Take(5)
                .ToList()
        }).ToList();
    }

    public async Task<VendorSpendReportDto> GetVendorSpendReportAsync(int? vendorId, DateTime? from, DateTime? to)
    {
        var query = _invoiceRepository.AsQueryable()
            .Where(i => i.ApprovalStatus == InvoiceApprovalStatus.Approved);

        if (vendorId.HasValue) query = query.Where(i => i.VendorId == vendorId.Value);
        if (from.HasValue) query = query.Where(i => i.InvoiceDate >= from.Value);
        if (to.HasValue) query = query.Where(i => i.InvoiceDate <= to.Value);

        var invoices = await query.Include(i => i.Vendor).ToListAsync();

        return new VendorSpendReportDto
        {
             TotalSpend = invoices.Sum(i => i.Amount),
             TotalInvoices = invoices.Count,
             TopVendors = invoices.GroupBy(i => i.Vendor)
                .Select(g => new VendorSpendItem 
                { 
                    VendorId = g.Key?.Id ?? 0,
                    VendorName = g.Key?.Name ?? "Unknown", 
                    TotalAmount = g.Sum(i => i.Amount),
                    InvoiceCount = g.Count()
                })
                .OrderByDescending(x => x.TotalAmount)
                .Take(5)
                .ToList(),
             SpendTrends = invoices.GroupBy(i => i.InvoiceDate.Date)
                .Select(g => new SpendByDateItem
                {
                    Date = g.Key,
                    Amount = g.Sum(x => x.Amount)
                })
                .OrderBy(x => x.Date)
                .ToList()
        };
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371; // Earth's radius in kilometers
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private VendorInvoiceDto MapInvoiceToDto(VendorInvoice invoice)
    {
        return new VendorInvoiceDto
        {
            Id = invoice.Id,
            VendorId = invoice.VendorId,
            VendorName = invoice.Vendor?.Name ?? invoice.ExternalVendorName ?? string.Empty,
            ExternalVendorName = invoice.ExternalVendorName,
            IsExternalVendor = invoice.Vendor?.IsExternalVendor ?? !invoice.VendorId.HasValue,
            InvoiceNumber = invoice.InvoiceNumber,
            InvoiceDate = invoice.InvoiceDate,
            Amount = invoice.Amount,
            Description = invoice.Description,
            Notes = invoice.Notes,
            FileUrl = invoice.FileUrl,
            OriginalFileName = invoice.OriginalFileName,
            MaterialType = invoice.MaterialType,
            ApprovalStatus = invoice.ApprovalStatus.ToString(),
            ApprovedByUserId = invoice.ApprovedByUserId,
            ApprovedByUserName = invoice.ApprovedByUser?.FullName,
            ApprovedDate = invoice.ApprovedDate,
            RejectionReason = invoice.RejectionReason,
            CreatedByUserId = invoice.CreatedByUserId,
            CreatedByUserName = invoice.CreatedByUser?.FullName ?? string.Empty,
            ProjectId = invoice.ProjectId,
            ProjectName = invoice.Project?.ProjectName,
            CreatedAt = invoice.CreatedAt
        };
    }

    public async Task<VendorStatsDto?> GetVendorStatsByUserIdAsync(int userId)
    {
        var vendor = await GetVendorByUserIdAsync(userId);
        if (vendor == null) return null;

        var products = await GetVendorProductsAsync(vendor.Id);
        var transactions = await GetVendorTransactionsAsync(vendor.Id);
        var invoices = await GetInvoicesByVendorAsync(vendor.Id);

        // Calculate stats from sales transactions
        var salesTransactions = transactions.Where(t => t.TransactionType == "Sale").ToList();
        var totalRevenue = salesTransactions.Sum(t => t.TotalAmount);
        
        // Calculate cost for sold items (quantity * purchase price)
        var productDict = products.ToDictionary(p => p.Id, p => p.PurchasePrice);
        var totalCost = salesTransactions.Sum(t => 
            t.Quantity * (productDict.ContainsKey(t.VendorProductId) ? productDict[t.VendorProductId] : 0));

        return new VendorStatsDto
        {
            TotalSales = salesTransactions.Count,
            TotalRevenue = totalRevenue,
            TotalProfit = totalRevenue - totalCost,
            TotalProducts = products.Count(),
            LowStockCount = products.Count(p => p.QuantityInStock <= p.LowStockThreshold),
            PendingOrders = invoices.Count(i => i.ApprovalStatus == "Pending"),
            RecentTransactions = transactions.OrderByDescending(t => t.TransactionDate).Take(5).ToList()
        };
    }

    public async Task UpdateVendorLocationAsync(int userId, double latitude, double longitude)
    {
        var vendor = await _vendorRepository.AsQueryable()
            .FirstOrDefaultAsync(v => v.UserId == userId);

        if (vendor == null) throw new KeyNotFoundException("Vendor not found for this user");

        vendor.Latitude = latitude;
        vendor.Longitude = longitude;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<VendorDto> ToggleVendorVisibilityAsync(int userId)
    {
        var vendor = await _vendorRepository.AsQueryable()
            .FirstOrDefaultAsync(v => v.UserId == userId);

        if (vendor == null) throw new KeyNotFoundException("Vendor not found for this user");

        vendor.IsPublic = !vendor.IsPublic;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
        return await GetVendorByIdAsync(vendor.Id) ?? throw new Exception("Error reloading vendor");
    }

    #region Marketplace Features

    public async Task<(IEnumerable<VendorProductDto> Products, int TotalCount)> SearchProductsAsync(
        int? categoryId, string? searchTerm, decimal? minPrice, decimal? maxPrice,
        int? vendorId, string? sortBy, int page, int pageSize)
    {
        var query = _productRepository.AsQueryable()
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .Where(p => p.IsActive && p.Vendor.IsActive && (p.Vendor.IsPublic || p.Vendor.Products.Any()));

        // Apply filters
        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(p => p.Name.Contains(searchTerm) ||
                (p.Description != null && p.Description.Contains(searchTerm)) ||
                (p.SKU != null && p.SKU.Contains(searchTerm)));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        if (vendorId.HasValue)
        {
            query = query.Where(p => p.VendorId == vendorId.Value);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "name" => query.OrderBy(p => p.Name),
            "popular" => query.OrderByDescending(p => p.SalesCount),
            "rating" => query.OrderByDescending(p => p.AverageRating),
            _ => query.OrderByDescending(p => p.SalesCount) // relevance = popularity by default
        };

        // Apply pagination
        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var productDtos = products.Select(p => new VendorProductDto
        {
            Id = p.Id,
            VendorId = p.VendorId,
            Name = p.Name,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name,
            Price = p.Price,
            Unit = p.Unit,
            Description = p.Description,
            QuantityInStock = p.QuantityInStock,
            LowStockThreshold = p.LowStockThreshold,
            PurchasePrice = p.PurchasePrice,
            IsActive = p.IsActive,
            SalesCount = p.SalesCount,
            ImageUrl = p.ImageUrl,
            SKU = p.SKU,
            AverageRating = p.AverageRating,
            TotalReviews = p.TotalReviews
        });

        return (productDtos, totalCount);
    }

    public async Task<VendorProductDetailDto?> GetProductByIdAsync(int productId)
    {
        var product = await _productRepository.AsQueryable()
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .FirstOrDefaultAsync(p => p.Id == productId && p.IsActive);

        if (product == null) return null;

        return new VendorProductDetailDto
        {
            Id = product.Id,
            VendorId = product.VendorId,
            VendorName = product.Vendor?.Name ?? string.Empty,
            Name = product.Name,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            Price = product.Price,
            Unit = product.Unit,
            Description = product.Description,
            QuantityInStock = product.QuantityInStock,
            LowStockThreshold = product.LowStockThreshold,
            PurchasePrice = product.PurchasePrice,
            IsActive = product.IsActive,
            SalesCount = product.SalesCount,
            ImageUrl = product.ImageUrl,
            SKU = product.SKU,
            AverageRating = product.AverageRating,
            TotalReviews = product.TotalReviews,
            VendorLatitude = product.Vendor?.Latitude,
            VendorLongitude = product.Vendor?.Longitude,
            VendorAddress = product.Vendor?.Address
        };
    }

    public async Task<(IEnumerable<VendorProductDto> Products, int TotalCount)> GetProductsByCategoryAsync(
        int categoryId, int page, int pageSize)
    {
        return await SearchProductsAsync(categoryId, null, null, null, null, null, page, pageSize);
    }

    public async Task<IEnumerable<NearbyVendorDto>> GetNearbyVendorsAsync(
        double latitude, double longitude, double radiusKm, int? categoryId)
    {
        var query = _vendorRepository.AsQueryable()
            .Include(v => v.Products)
                .ThenInclude(p => p.Category)
            .Where(v => v.IsActive && (v.IsPublic || v.Products.Any(p => p.IsActive)));

        var vendors = await query.ToListAsync();

        // Filter by category if specified
        if (categoryId.HasValue)
        {
            vendors = vendors.Where(v => v.Products.Any(p => p.CategoryId == categoryId.Value && p.IsActive)).ToList();
        }

        // Calculate distance and filter by radius
        var nearbyVendors = vendors
            .Where(v => v.Latitude.HasValue && v.Longitude.HasValue)
            .Select(v => new NearbyVendorDto
            {
                VendorId = v.Id,
                CompanyName = v.Name,
                Description = v.Notes,
                Address = v.Address,
                Latitude = v.Latitude!.Value,
                Longitude = v.Longitude!.Value,
                DistanceKm = CalculateDistance(latitude, longitude, v.Latitude.Value, v.Longitude.Value),
                AverageRating = (double)(v.Products.Average(p => p.AverageRating ?? 0)),
                TotalReviews = v.Products.Sum(p => p.TotalReviews),
                TotalOrders = v.Products.Sum(p => p.SalesCount),
                ProductCount = v.Products.Count(p => p.IsActive),
                CategoryIds = v.Products.Where(p => p.CategoryId.HasValue).Select(p => p.CategoryId!.Value).Distinct().ToList()
            })
            .Where(v => v.DistanceKm <= radiusKm)
            .OrderBy(v => v.DistanceKm)
            .ToList();

        return nearbyVendors;
    }

    public async Task<VendorProfileDto?> GetVendorProfileAsync(int vendorId)
    {
        var vendor = await _vendorRepository.AsQueryable()
            .Include(v => v.Products)
                .ThenInclude(p => p.Category)
            .FirstOrDefaultAsync(v => v.Id == vendorId && v.IsActive);

        if (vendor == null) return null;

        return new VendorProfileDto
        {
            Id = vendor.Id,
            CompanyName = vendor.Name,
            Description = vendor.Notes,
            Address = vendor.Address,
            Phone = vendor.Phone,
            Email = vendor.Email,
            Latitude = vendor.Latitude,
            Longitude = vendor.Longitude,
            AverageRating = (double)(vendor.Products.Any() ? vendor.Products.Average(p => p.AverageRating ?? 0) : 0),
            TotalReviews = vendor.Products.Sum(p => p.TotalReviews),
            TotalOrders = vendor.Products.Sum(p => p.SalesCount),
            ProductCount = vendor.Products.Count(p => p.IsActive),
            CreatedAt = vendor.CreatedAt
        };
    }

    public async Task<(IEnumerable<VendorProductDto> Products, int TotalCount)> GetVendorProductsAsync(
        int vendorId, int? categoryId, int page, int pageSize)
    {
        return await SearchProductsAsync(categoryId, null, null, null, vendorId, null, page, pageSize);
    }

    public async Task<MarketplaceVendorStatsDto> GetVendorStatsAsync(int vendorId)
    {
        var vendor = await _vendorRepository.AsQueryable()
            .Include(v => v.Products)
            .FirstOrDefaultAsync(v => v.Id == vendorId);

        if (vendor == null)
        {
            return new MarketplaceVendorStatsDto();
        }

        var transactions = await _transactionRepository.AsQueryable()
            .Where(t => t.VendorId == vendorId)
            .ToListAsync();

        var salesTransactions = transactions.Where(t => t.TransactionType == "Sale").ToList();

        return new MarketplaceVendorStatsDto
        {
            TotalOrders = salesTransactions.Count,
            CompletedOrders = salesTransactions.Count(t => t.TransactionDate < DateTime.UtcNow.AddDays(-30)),
            PendingOrders = 0, // Would need order entity to track this
            CancelledOrders = 0,
            AverageRating = (double)(vendor.Products.Any() ? vendor.Products.Average(p => p.AverageRating ?? 0) : 0),
            TotalReviews = vendor.Products.Sum(p => p.TotalReviews),
            TotalRevenue = salesTransactions.Sum(t => t.TotalAmount),
            TotalProducts = vendor.Products.Count(p => p.IsActive)
        };
    }

    public async Task<(IEnumerable<VendorReviewDto> Reviews, int TotalCount)> GetVendorReviewsAsync(
        int vendorId, int page, int pageSize)
    {
        // This would require a VendorReview entity - for now return empty
        // In a full implementation, we would query a VendorReview table
        await Task.CompletedTask;
        return (Enumerable.Empty<VendorReviewDto>(), 0);
    }

    public async Task<VendorReviewDto> CreateReviewAsync(int userId, int orderId, CreateVendorReviewDto dto)
    {
        // This would require a VendorReview entity and order validation
        // For now, throw NotImplementedException
        await Task.CompletedTask;
        throw new NotImplementedException("Review functionality requires VendorReview entity implementation");
    }

    public async Task<VendorReviewDto?> GetReviewByIdAsync(int reviewId)
    {
        // This would require a VendorReview entity
        await Task.CompletedTask;
        return null;
    }

    #endregion

    #region Vendor Dashboard & Statistics (Feature 1)

    public async Task<IEnumerable<VendorWithStatsDto>> GetVendorsWithStatsAsync()
    {
        var companyId = _companyContext?.CompanyId;
        
        var vendors = await _vendorRepository.AsQueryable()
            .Where(v => v.CompanyId == companyId || v.CompanyId == null)
            .ToListAsync();

        var vendorIds = vendors.Select(v => (int?)v.Id).ToList();
        
        var vendorInvoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.VendorId.HasValue && vendorIds.Contains(i.VendorId))
            .ToListAsync();

        var itemInvoices = await _itemInvoiceRepository.AsQueryable()
            .Where(i => i.VendorId.HasValue && vendorIds.Contains(i.VendorId))
            .ToListAsync();

        var result = new List<VendorWithStatsDto>();

        foreach (var vendor in vendors)
        {
            var vInvoices = vendorInvoices.Where(i => i.VendorId == vendor.Id).ToList();
            var iInvoices = itemInvoices.Where(i => i.VendorId == vendor.Id).ToList();
            
            var allInvoicesCount = vInvoices.Count + iInvoices.Count;
            var totalAmount = vInvoices.Sum(i => i.Amount) + iInvoices.Sum(i => i.NetAmount);
            
            var pendingAmount = vInvoices.Where(i => i.ApprovalStatus == InvoiceApprovalStatus.Pending).Sum(i => i.Amount) +
                               iInvoices.Where(i => i.Status == InvoiceStatus.Pending.ToDatabaseString()).Sum(i => i.NetAmount);
                               
            var approvedAmount = vInvoices.Where(i => i.ApprovalStatus == InvoiceApprovalStatus.Approved).Sum(i => i.Amount) +
                                iInvoices.Where(i => i.Status == InvoiceStatus.Approved.ToDatabaseString()).Sum(i => i.NetAmount);

            var projectIds = vInvoices.Where(i => i.ProjectId.HasValue).Select(i => i.ProjectId!.Value)
                            .Union(iInvoices.Select(i => i.ProjectId))
                            .Distinct()
                            .Count();

            var lastInvoiceDate = vInvoices.Select(i => (DateTime?)i.InvoiceDate)
                                 .Union(iInvoices.Select(i => (DateTime?)i.InvoiceDate))
                                 .OrderByDescending(d => d)
                                 .FirstOrDefault();

            result.Add(new VendorWithStatsDto
            {
                Id = vendor.Id,
                Name = vendor.Name,
                Phone = vendor.Phone,
                Email = vendor.Email,
                VendorType = vendor.VendorType,
                IsExternalVendor = vendor.IsExternalVendor,
                IsActive = vendor.IsActive,
                TotalInvoices = allInvoicesCount,
                TotalAmount = totalAmount,
                PendingAmount = pendingAmount,
                ApprovedAmount = approvedAmount,
                ProjectCount = projectIds,
                LastInvoiceDate = lastInvoiceDate,
                CreatedAt = vendor.CreatedAt
            });
        }

        return result.OrderByDescending(v => v.TotalAmount);
    }

    public async Task<VendorDashboardDto> GetVendorDashboardAsync()
    {
        var vendors = await GetVendorsWithStatsAsync();
        var vendorList = vendors.ToList();

        return new VendorDashboardDto
        {
            TotalVendors = vendorList.Count,
            ExternalVendors = vendorList.Count(v => v.IsExternalVendor),
            RegisteredVendors = vendorList.Count(v => !v.IsExternalVendor),
            TotalSpend = vendorList.Sum(v => v.TotalAmount),
            PendingApprovals = vendorList.Sum(v => v.PendingAmount),
            TopVendors = vendorList.OrderByDescending(v => v.TotalAmount).Take(5).ToList(),
            RecentVendors = vendorList.OrderByDescending(v => v.CreatedAt).Take(5).ToList()
        };
    }

    public async Task<IEnumerable<VendorProjectDto>> GetVendorProjectsAsync(int vendorId)
    {
        var vInvoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.VendorId == vendorId && i.ProjectId.HasValue)
            .Include(i => i.Project)
            .ToListAsync();

        var iInvoices = await _itemInvoiceRepository.AsQueryable()
            .Where(i => i.VendorId == vendorId)
            .Include(i => i.Project)
            .ToListAsync();

        var projectStats = new Dictionary<int, VendorProjectDto>();

        foreach (var inv in vInvoices)
        {
            var pid = inv.ProjectId!.Value;
            if (!projectStats.ContainsKey(pid))
            {
                projectStats[pid] = new VendorProjectDto { ProjectId = pid, ProjectName = inv.Project?.ProjectName ?? "Unknown" };
            }
            
            var stats = projectStats[pid];
            stats.TotalInvoices++;
            stats.TotalAmount += inv.Amount;
            if (inv.ApprovalStatus == InvoiceApprovalStatus.Pending) stats.PendingAmount += inv.Amount;
            if (inv.ApprovalStatus == InvoiceApprovalStatus.Approved) stats.ApprovedAmount += inv.Amount;
            
            if (stats.LastInvoiceDate == null || inv.InvoiceDate > stats.LastInvoiceDate) stats.LastInvoiceDate = inv.InvoiceDate;
            if (stats.FirstInvoiceDate == null || inv.InvoiceDate < stats.FirstInvoiceDate) stats.FirstInvoiceDate = inv.InvoiceDate;
        }

        foreach (var inv in iInvoices)
        {
            var pid = inv.ProjectId;
            if (!projectStats.ContainsKey(pid))
            {
                projectStats[pid] = new VendorProjectDto { ProjectId = pid, ProjectName = inv.Project?.ProjectName ?? "Unknown" };
            }

            var stats = projectStats[pid];
            stats.TotalInvoices++;
            stats.TotalAmount += inv.NetAmount;
            if (inv.Status == InvoiceStatus.Pending.ToDatabaseString()) stats.PendingAmount += inv.NetAmount;
            if (inv.Status == InvoiceStatus.Approved.ToDatabaseString()) stats.ApprovedAmount += inv.NetAmount;

            if (stats.LastInvoiceDate == null || inv.InvoiceDate > stats.LastInvoiceDate) stats.LastInvoiceDate = inv.InvoiceDate;
            if (stats.FirstInvoiceDate == null || inv.InvoiceDate < stats.FirstInvoiceDate) stats.FirstInvoiceDate = inv.InvoiceDate;
        }

        return projectStats.Values.OrderByDescending(p => p.TotalAmount);
    }

    public async Task<IEnumerable<VendorInvoiceDto>> GetAllVendorBillsAsync(int vendorId)
    {
        var vInvoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.VendorId == vendorId)
            .Include(i => i.Project)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .ToListAsync();

        var iInvoices = await _itemInvoiceRepository.AsQueryable()
            .Where(i => i.VendorId == vendorId)
            .Include(i => i.Project)
            .Include(i => i.CreatedBy)
            .Include(i => i.Reviewer)
            .ToListAsync();

        var result = vInvoices.Select(MapInvoiceToDto).ToList();
        
        result.AddRange(iInvoices.Select(i => new VendorInvoiceDto
        {
            Id = i.Id,
            VendorId = i.VendorId,
            VendorName = i.Vendor?.Name ?? i.ExternalVendorName ?? "Unknown",
            ExternalVendorName = i.ExternalVendorName,
            IsExternalVendor = i.VendorId == null,
            InvoiceNumber = i.InvoiceNumber,
            InvoiceDate = i.InvoiceDate,
            Amount = i.NetAmount,
            Description = i.Description,
            ApprovalStatus = i.Status,
            ApprovedByUserId = i.ReviewerUserId,
            ApprovedByUserName = i.Reviewer?.FullName,
            ApprovedDate = i.ReviewDate,
            RejectionReason = i.RejectionReason,
            CreatedByUserId = i.CreatedByUserId,
            CreatedByUserName = i.CreatedBy?.FullName ?? "System",
            ProjectId = i.ProjectId,
            ProjectName = i.Project?.ProjectName,
            CreatedAt = i.CreatedAt
        }));

        return result.OrderByDescending(i => i.InvoiceDate);
    }

    public async Task<IEnumerable<VendorInvoiceDto>> GetFinancialLedgerAsync()
    {
        var companyId = _companyContext?.CompanyId;

        var vInvoices = await _invoiceRepository.AsQueryable()
            .Include(i => i.Vendor)
            .Include(i => i.Project)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .ToListAsync();

        var iInvoices = await _itemInvoiceRepository.AsQueryable()
            .Where(i => i.CompanyId == companyId || companyId == null)
            .Include(i => i.Vendor)
            .Include(i => i.Project)
            .Include(i => i.CreatedBy)
            .Include(i => i.Reviewer)
            .ToListAsync();

        var result = vInvoices.Select(MapInvoiceToDto).ToList();

        result.AddRange(iInvoices.Select(i => new VendorInvoiceDto
        {
            Id = i.Id,
            VendorId = i.VendorId,
            VendorName = i.Vendor?.Name ?? i.ExternalVendorName ?? "Unknown",
            ExternalVendorName = i.ExternalVendorName,
            IsExternalVendor = i.VendorId == null,
            InvoiceNumber = i.InvoiceNumber,
            InvoiceDate = i.InvoiceDate,
            Amount = i.NetAmount,
            Description = i.Description,
            ApprovalStatus = i.Status,
            ApprovedByUserId = i.ReviewerUserId,
            ApprovedByUserName = i.Reviewer?.FullName,
            ApprovedDate = i.ReviewDate,
            RejectionReason = i.RejectionReason,
            CreatedByUserId = i.CreatedByUserId,
            CreatedByUserName = i.CreatedBy?.FullName ?? "System",
            ProjectId = i.ProjectId,
            ProjectName = i.Project?.ProjectName,
            CreatedAt = i.CreatedAt
        }));

        return result.OrderByDescending(i => i.InvoiceDate);
    }
    #endregion

    #region Delivery Cost Tiers (Feature 2)

    public async Task<IEnumerable<DeliveryCostTierDto>> GetDeliveryCostTiersAsync(int productId)
    {
        var tiers = await _productRepository.AsQueryable()
            .Where(p => p.Id == productId)
            .SelectMany(p => p.DeliveryCostTiers)
            .Where(t => t.IsActive)
            .OrderBy(t => t.MinWeightKg)
            .ToListAsync();

        return tiers.Select(t => new DeliveryCostTierDto
        {
            Id = t.Id,
            VendorProductId = t.VendorProductId,
            ProductName = t.VendorProduct.Name,
            MinWeightKg = t.MinWeightKg,
            MaxWeightKg = t.MaxWeightKg,
            PricePerKm = t.PricePerKm,
            FixedFee = t.FixedFee,
            IsActive = t.IsActive,
            Description = t.Description,
            CreatedAt = t.CreatedAt
        });
    }

    public async Task<DeliveryCostTierDto> CreateDeliveryCostTierAsync(CreateDeliveryCostTierRequest request)
    {
        var product = await _productRepository.GetByIdAsync(request.VendorProductId);
        if (product == null) throw new KeyNotFoundException("Product not found");

        // Validate tier doesn't overlap with existing tiers
        var existingTiers = await _productRepository.AsQueryable()
            .Where(p => p.Id == request.VendorProductId)
            .SelectMany(p => p.DeliveryCostTiers)
            .Where(t => t.IsActive)
            .ToListAsync();

        var hasOverlap = existingTiers.Any(t => 
            (request.MinWeightKg >= t.MinWeightKg && request.MinWeightKg < t.MaxWeightKg) ||
            (request.MaxWeightKg > t.MinWeightKg && request.MaxWeightKg <= t.MaxWeightKg) ||
            (request.MinWeightKg <= t.MinWeightKg && request.MaxWeightKg >= t.MaxWeightKg));

        if (hasOverlap)
            throw new InvalidOperationException("Delivery tier overlaps with existing tier");

        var tier = new DeliveryCostTier
        {
            VendorProductId = request.VendorProductId,
            MinWeightKg = request.MinWeightKg,
            MaxWeightKg = request.MaxWeightKg,
            PricePerKm = request.PricePerKm,
            FixedFee = request.FixedFee,
            Description = request.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _deliveryTierRepository.AddAsync(tier);
        await _unitOfWork.SaveChangesAsync();

        return new DeliveryCostTierDto
        {
            Id = tier.Id,
            VendorProductId = tier.VendorProductId,
            ProductName = product.Name,
            MinWeightKg = tier.MinWeightKg,
            MaxWeightKg = tier.MaxWeightKg,
            PricePerKm = tier.PricePerKm,
            FixedFee = tier.FixedFee,
            IsActive = tier.IsActive,
            Description = tier.Description,
            CreatedAt = tier.CreatedAt
        };
    }

    public async Task<DeliveryCostTierDto> UpdateDeliveryCostTierAsync(int tierId, UpdateDeliveryCostTierRequest request)
    {
        var tier = await _deliveryTierRepository.GetByIdAsync(tierId);
        if (tier == null) throw new KeyNotFoundException("Delivery tier not found");

        tier.MinWeightKg = request.MinWeightKg;
        tier.MaxWeightKg = request.MaxWeightKg;
        tier.PricePerKm = request.PricePerKm;
        tier.FixedFee = request.FixedFee;
        tier.IsActive = request.IsActive;
        tier.Description = request.Description;
        tier.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        var product = await _productRepository.GetByIdAsync(tier.VendorProductId);
        return new DeliveryCostTierDto
        {
            Id = tier.Id,
            VendorProductId = tier.VendorProductId,
            ProductName = product?.Name ?? "",
            MinWeightKg = tier.MinWeightKg,
            MaxWeightKg = tier.MaxWeightKg,
            PricePerKm = tier.PricePerKm,
            FixedFee = tier.FixedFee,
            IsActive = tier.IsActive,
            Description = tier.Description,
            CreatedAt = tier.CreatedAt
        };
    }

    public async Task<bool> DeleteDeliveryCostTierAsync(int tierId)
    {
        var tier = await _deliveryTierRepository.GetByIdAsync(tierId);
        if (tier == null) return false;

        tier.IsActive = false;
        tier.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<DeliveryCalculationResult> CalculateDeliveryCostAsync(DeliveryCalculationRequest request)
    {
        var product = await _productRepository.AsQueryable()
            .Include(p => p.DeliveryCostTiers)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId);

        if (product == null)
        {
            return new DeliveryCalculationResult
            {
                ProductId = request.ProductId,
                WeightKg = request.WeightKg,
                DistanceKm = request.DistanceKm,
                IsCalculated = false,
                ErrorMessage = "Product not found"
            };
        }

        var applicableTier = product.DeliveryCostTiers
            .Where(t => t.IsActive && request.WeightKg >= t.MinWeightKg && request.WeightKg < t.MaxWeightKg)
            .OrderBy(t => t.PricePerKm) // Get cheapest tier if multiple match
            .FirstOrDefault();

        if (applicableTier == null)
        {
            return new DeliveryCalculationResult
            {
                ProductId = request.ProductId,
                ProductName = product.Name,
                WeightKg = request.WeightKg,
                DistanceKm = request.DistanceKm,
                IsCalculated = false,
                ErrorMessage = $"No delivery tier found for weight {request.WeightKg}kg"
            };
        }

        var distanceCost = applicableTier.PricePerKm * request.DistanceKm;
        var totalCost = applicableTier.FixedFee + distanceCost;

        return new DeliveryCalculationResult
        {
            ProductId = request.ProductId,
            ProductName = product.Name,
            WeightKg = request.WeightKg,
            DistanceKm = request.DistanceKm,
            AppliedTierId = applicableTier.Id,
            AppliedTierDescription = applicableTier.Description ?? $"{applicableTier.MinWeightKg}-{applicableTier.MaxWeightKg}kg",
            PricePerKm = applicableTier.PricePerKm,
            FixedFee = applicableTier.FixedFee,
            DistanceCost = distanceCost,
            TotalDeliveryCost = totalCost,
            IsCalculated = true
        };
    }

    public async Task<BulkDeliveryCalculationResult> CalculateBulkDeliveryCostAsync(BulkDeliveryCalculationRequest request)
    {
        var results = new List<DeliveryCalculationResult>();

        foreach (var item in request.Items)
        {
            var result = await CalculateDeliveryCostAsync(item);
            results.Add(result);
        }

        return new BulkDeliveryCalculationResult
        {
            Results = results,
            TotalDeliveryCost = results.Where(r => r.IsCalculated).Sum(r => r.TotalDeliveryCost),
            AllCalculated = results.All(r => r.IsCalculated)
        };
    }

    #endregion
}
