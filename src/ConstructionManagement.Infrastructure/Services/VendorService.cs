using ConstructionManagement.Application.DTOs.Vendor;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
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
                .FirstOrDefaultAsync(v => v.Name == request.NewVendorName && v.IsPublic == false);

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
                     VendorType = "Shadow", // Or "Supplier"
                     CompanyId = null,
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
            Category = p.Category,
            Price = p.Price,
            Unit = p.Unit,
            Description = p.Description,
            QuantityInStock = p.QuantityInStock,
            LowStockThreshold = p.LowStockThreshold,
            PurchasePrice = p.PurchasePrice,
            IsActive = p.IsActive
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
            Category = request.Category,
            Price = request.Price,
            Unit = request.Unit,
            Description = request.Description,
            QuantityInStock = request.QuantityInStock,
            LowStockThreshold = request.LowStockThreshold,
            PurchasePrice = request.PurchasePrice,
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
            Category = product.Category,
            Price = product.Price,
            Unit = product.Unit,
            Description = product.Description,
            QuantityInStock = product.QuantityInStock,
            LowStockThreshold = product.LowStockThreshold,
            PurchasePrice = product.PurchasePrice,
            IsActive = product.IsActive
        };
    }

    public async Task<VendorProductDto> UpdateProductAsync(int productId, UpdateVendorProductRequest request)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null) throw new KeyNotFoundException("Product not found");

        product.Name = request.Name;
        product.Category = request.Category;
        product.Price = request.Price;
        product.Unit = request.Unit;
        product.Description = request.Description;
        product.LowStockThreshold = request.LowStockThreshold;
        product.PurchasePrice = request.PurchasePrice;
        product.QuantityInStock = request.QuantityInStock;
        product.IsActive = request.IsActive;
        
        await _unitOfWork.SaveChangesAsync();

        return new VendorProductDto
        {
            Id = product.Id,
            VendorId = product.VendorId,
            Name = product.Name,
            Category = product.Category,
            Price = product.Price,
            Unit = product.Unit,
            Description = product.Description,
            QuantityInStock = product.QuantityInStock,
            LowStockThreshold = product.LowStockThreshold,
            PurchasePrice = product.PurchasePrice,
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
        var summary = await _invoiceRepository.AsQueryable()
            .GroupBy(i => new { i.VendorId, i.Vendor.Name })
            .Select(g => new VendorInvoiceSummary
            {
                VendorId = g.Key.VendorId,
                VendorName = g.Key.Name,
                TotalInvoices = g.Count(),
                TotalAmount = g.Sum(i => i.Amount),
                PendingApprovals = g.Count(i => i.ApprovalStatus == InvoiceApprovalStatus.Pending)
            })
            .ToListAsync();
            
        return summary;
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
                        Category = p.Category,
                        Price = p.Price,
                        Unit = p.Unit,
                        Description = p.Description,
                        QuantityInStock = p.QuantityInStock,
                        LowStockThreshold = p.LowStockThreshold,
                        PurchasePrice = p.PurchasePrice,
                        IsActive = p.IsActive,
                        SalesCount = 0 // For now simpler
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
                    Category = p.Category,
                    Price = p.Price,
                    Unit = p.Unit,
                    Description = p.Description,
                    QuantityInStock = p.QuantityInStock,
                    LowStockThreshold = p.LowStockThreshold,
                    PurchasePrice = p.PurchasePrice,
                    IsActive = p.IsActive,
                    SalesCount = 0 // For now simpler
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
            VendorName = invoice.Vendor?.Name ?? string.Empty,
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
}
