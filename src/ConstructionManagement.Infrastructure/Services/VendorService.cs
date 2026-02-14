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
    private readonly IRepository<VendorProduct> _productRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService? _notificationService;
    private readonly ICompanyContext _companyContext;

    private readonly IActivityLogService _activityLogService;

    public VendorService(
        IRepository<Vendor> vendorRepository,
        IRepository<VendorInvoice> invoiceRepository,
        IRepository<VendorProduct> productRepository,
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
        var companyId = _companyContext.CompanyId;
        var vendors = await _vendorRepository.AsQueryable()
            .Where(v => v.CompanyId == companyId && v.IsActive)
            .Include(v => v.Invoices)
            .ToListAsync();

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
            VendorType = v.VendorType,
            CurrentBalance = v.CurrentBalance,
            TotalPaid = v.TotalPaid,
            TotalInvoiced = v.TotalInvoiced,
            IsActive = v.IsActive,
            InvoiceCount = v.Invoices.Count,
            CreatedAt = v.CreatedAt,
            IsRegistered = v.UserId.HasValue
        });
    }

    public async Task<VendorDto?> GetVendorByIdAsync(int id)
    {
        var companyId = _companyContext.CompanyId;
        var vendor = await _vendorRepository.AsQueryable()
            .Where(v => v.Id == id && v.CompanyId == companyId)
            .Include(v => v.Invoices)
            .FirstOrDefaultAsync();

        if (vendor == null) return null;

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
            VendorType = vendor.VendorType,
            CurrentBalance = vendor.CurrentBalance,
            TotalPaid = vendor.TotalPaid,
            TotalInvoiced = vendor.TotalInvoiced,
            IsActive = vendor.IsActive,
            InvoiceCount = vendor.Invoices.Count,
            CreatedAt = vendor.CreatedAt,
            IsRegistered = vendor.UserId.HasValue
        };
    }

    public async Task<VendorDto> CreateVendorAsync(CreateVendorRequest request)
    {
        var companyId = _companyContext.CompanyId;
        
        var vendor = new Vendor
        {
            CompanyId = companyId,
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            TaxNumber = request.TaxNumber,
            ContactPerson = request.ContactPerson,
            Notes = request.Notes,
            VendorType = request.VendorType,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _vendorRepository.AddAsync(vendor);
        await _unitOfWork.SaveChangesAsync();

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
            VendorType = vendor.VendorType,
            CurrentBalance = vendor.CurrentBalance,
            TotalPaid = vendor.TotalPaid,
            TotalInvoiced = vendor.TotalInvoiced,
            IsActive = vendor.IsActive,
            InvoiceCount = 0,
            CreatedAt = vendor.CreatedAt
        };
    }

    public async Task<VendorDto> UpdateVendorAsync(int id, UpdateVendorRequest request)
    {
        var companyId = _companyContext.CompanyId;
        var vendor = await _vendorRepository.AsQueryable()
            .Where(v => v.Id == id && v.CompanyId == companyId)
            .FirstOrDefaultAsync();

        if (vendor == null)
            throw new InvalidOperationException("المورد غير موجود");

        vendor.Name = request.Name;
        vendor.Phone = request.Phone;
        vendor.Email = request.Email;
        vendor.Address = request.Address;
        vendor.TaxNumber = request.TaxNumber;
        vendor.ContactPerson = request.ContactPerson;
        vendor.Notes = request.Notes;
        vendor.VendorType = request.VendorType;
        vendor.IsActive = request.IsActive;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

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
            VendorType = vendor.VendorType,
            CurrentBalance = vendor.CurrentBalance,
            TotalPaid = vendor.TotalPaid,
            TotalInvoiced = vendor.TotalInvoiced,
            IsActive = vendor.IsActive,
            CreatedAt = vendor.CreatedAt
        };
    }

    public async Task<bool> DeleteVendorAsync(int id)
    {
        var companyId = _companyContext.CompanyId;
        var vendor = await _vendorRepository.AsQueryable()
            .Where(v => v.Id == id && v.CompanyId == companyId)
            .Include(v => v.Invoices)
            .FirstOrDefaultAsync();

        if (vendor == null)
            throw new InvalidOperationException("المورد غير موجود");

        // Soft delete - deactivate instead of hard delete
        vendor.IsActive = false;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<VendorInvoiceDto>> GetInvoicesByVendorAsync(int vendorId)
    {
        var companyId = _companyContext.CompanyId;
        var invoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.VendorId == vendorId && i.CompanyId == companyId)
            .Include(i => i.Vendor)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .Include(i => i.Project)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(i => MapInvoiceToDto(i));
    }

    public async Task<IEnumerable<VendorInvoiceDto>> GetPendingInvoicesAsync()
    {
        var companyId = _companyContext.CompanyId;
        var invoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.CompanyId == companyId && i.ApprovalStatus == InvoiceApprovalStatus.Pending)
            .Include(i => i.Vendor)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .Include(i => i.Project)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(i => MapInvoiceToDto(i));
    }

    public async Task<IEnumerable<VendorInvoiceDto>> GetInvoicesByProjectAsync(int projectId)
    {
        var companyId = _companyContext.CompanyId;
        var invoices = await _invoiceRepository.AsQueryable()
            .Where(i => i.ProjectId == projectId && i.CompanyId == companyId)
            .Include(i => i.Vendor)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .Include(i => i.Project)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(i => MapInvoiceToDto(i));
    }

    public async Task<VendorInvoiceDto> CreateInvoiceAsync(CreateVendorInvoiceRequest request)
    {
        var companyId = _companyContext.CompanyId;
        
        // Get company settings to check if approval is required
        var settings = await _settingsRepository.AsQueryable()
            .FirstOrDefaultAsync(s => s.CompanyId == companyId);
        
        bool requireApproval = settings?.RequireInvoiceApproval ?? true;

        // Upload file if provided
        string? fileUrl = null;
        string? originalFileName = null;
        string? fileType = null;
        long? fileSize = null;

        if (request.File != null && request.File.Length > 0)
        {
            fileUrl = await _fileStorageService.UploadFileAsync(request.File, "vendor-invoices");
            originalFileName = request.File.FileName;
            fileType = request.File.ContentType;
            fileSize = request.File.Length;
        }

        // Create shadow vendor if NewVendorName is provided and VendorId is not set
        int actualVendorId = 0;
        if (request.VendorId.HasValue && request.VendorId.Value > 0)
        {
            actualVendorId = request.VendorId.Value;
        }
        else if (!string.IsNullOrEmpty(request.NewVendorName))
        {
            // Check if a vendor with the same name already exists in this company context (or globally)
            var existingVendor = await _vendorRepository.AsQueryable()
                .FirstOrDefaultAsync(v => v.Name == request.NewVendorName && (v.CompanyId == companyId || v.IsPublic));
            
            if (existingVendor != null)
            {
                actualVendorId = existingVendor.Id;
            }
            else
            {
                // Create shadow vendor
                var shadowVendor = new Vendor
                {
                    CompanyId = companyId,
                    Name = request.NewVendorName,
                    IsActive = true,
                    IsPublic = false, // Shadows are not public on map until they register
                    UserId = null,
                    CreatedAt = DateTime.UtcNow
                };
                await _vendorRepository.AddAsync(shadowVendor);
                await _unitOfWork.SaveChangesAsync();
                actualVendorId = shadowVendor.Id;
            }
        }
        else
        {
            throw new InvalidOperationException("يجب اختيار مورد أو إدخال اسم مورد جديد");
        }

        var invoice = new VendorInvoice
        {
            CompanyId = companyId,
            VendorId = actualVendorId,
            InvoiceNumber = request.InvoiceNumber,
            InvoiceDate = request.InvoiceDate,
            Amount = request.Amount,
            Description = request.Description,
            Notes = request.Notes,
            MaterialType = request.MaterialType,
            ProjectId = request.ProjectId,
            FileUrl = fileUrl,
            OriginalFileName = originalFileName,
            FileType = fileType,
            FileSize = fileSize,
            ApprovalStatus = requireApproval ? InvoiceApprovalStatus.Pending : InvoiceApprovalStatus.Approved,
            CreatedByUserId = request.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _invoiceRepository.AddAsync(invoice);
        
        // Update vendor totals
        var vendor = await _vendorRepository.GetByIdAsync(actualVendorId);
        if (vendor != null)
        {
            vendor.TotalInvoiced = (vendor.TotalInvoiced ?? 0) + request.Amount;
            vendor.CurrentBalance = (vendor.CurrentBalance ?? 0) + request.Amount;
        }

        await _unitOfWork.SaveChangesAsync();

        // Send notification if approval is required
        if (requireApproval && _notificationService != null)
        {
            await _notificationService.CreateNotificationAsync(
                "InvoicePendingApproval",
                $"فاتورة جديدة معلقة للموافقة: {invoice.InvoiceNumber}",
                companyId,
                null,
                invoice.Id,
                "VendorInvoice",
                settings?.InvoiceApproverRole
            );
        }

        if (invoice.ProjectId.HasValue)
        {
            await _activityLogService.LogActivityAsync(
                invoice.ProjectId.Value, 
                "Financial", 
                "Invoice Submitted", 
                $"Vendor invoice {invoice.InvoiceNumber} for {invoice.Amount:N2} submitted.", 
                request.CreatedByUserId
            );
        }

        return MapInvoiceToDto(invoice);
    }

    public async Task<VendorInvoiceDto> ReviewInvoiceAsync(int invoiceId, ReviewVendorInvoiceRequest request, int reviewerUserId)
    {
        var companyId = _companyContext.CompanyId;
        var invoice = await _invoiceRepository.AsQueryable()
            .Where(i => i.Id == invoiceId && i.CompanyId == companyId)
            .Include(i => i.Vendor)
            .FirstOrDefaultAsync();

        if (invoice == null)
            throw new InvalidOperationException("الفاتورة غير موجودة");

        if (invoice.ApprovalStatus != InvoiceApprovalStatus.Pending)
            throw new InvalidOperationException("الفاتورة уже تمت مراجعتها");

        invoice.ApprovalStatus = request.IsApproved ? InvoiceApprovalStatus.Approved : InvoiceApprovalStatus.Rejected;
        invoice.ApprovedByUserId = reviewerUserId;
        invoice.ApprovedDate = DateTime.UtcNow;
        invoice.RejectionReason = request.IsApproved ? null : request.RejectionReason;

        // Update vendor balance if approved
        if (request.IsApproved && invoice.Vendor != null)
        {
            invoice.Vendor.TotalInvoiced = (invoice.Vendor.TotalInvoiced ?? 0) + invoice.Amount;
            invoice.Vendor.CurrentBalance = (invoice.Vendor.CurrentBalance ?? 0) + invoice.Amount;
        }

        await _unitOfWork.SaveChangesAsync();

        if (invoice.ProjectId.HasValue)
        {
            var statusStr = request.IsApproved ? "Approved" : "Rejected";
            await _activityLogService.LogActivityAsync(
                invoice.ProjectId.Value, 
                "Financial", 
                $"Invoice {statusStr}", 
                $"Vendor invoice {invoice.InvoiceNumber} was {statusStr.ToLower()}.", 
                reviewerUserId
            );
        }

        return MapInvoiceToDto(invoice);
    }

    public async Task<VendorInvoiceDto?> GetInvoiceByIdAsync(int id)
    {
        var companyId = _companyContext.CompanyId;
        var invoice = await _invoiceRepository.AsQueryable()
            .Where(i => i.Id == id && i.CompanyId == companyId)
            .Include(i => i.Vendor)
            .Include(i => i.CreatedByUser)
            .Include(i => i.ApprovedByUser)
            .Include(i => i.Project)
            .FirstOrDefaultAsync();

        if (invoice == null) return null;

        return MapInvoiceToDto(invoice);
    }

    public async Task<IEnumerable<VendorInvoiceSummary>> GetVendorInvoiceSummaryAsync()
    {
        var companyId = _companyContext.CompanyId;
        var vendors = await _vendorRepository.AsQueryable()
            .Where(v => v.CompanyId == companyId && v.IsActive)
            .Include(v => v.Invoices)
            .ToListAsync();

        return vendors.Select(v => new VendorInvoiceSummary
        {
            VendorId = v.Id,
            VendorName = v.Name,
            TotalInvoices = v.Invoices.Count,
            TotalAmount = v.Invoices.Sum(i => i.Amount),
            PendingApprovals = v.Invoices.Count(i => i.ApprovalStatus == InvoiceApprovalStatus.Pending),
            ApprovedCount = v.Invoices.Count(i => i.ApprovalStatus == InvoiceApprovalStatus.Approved),
            RejectedCount = v.Invoices.Count(i => i.ApprovalStatus == InvoiceApprovalStatus.Rejected)
        });
    }

    public async Task<IEnumerable<PublicVendorDto>> SearchPublicVendorsAsync(VendorSearchRequest request)
    {
        var query = _vendorRepository.AsQueryable()
            .Where(v => v.IsActive)
            .Include(v => v.Products)
            .Include(v => v.Invoices) // Include invoices to count orders
            .AsQueryable();

        // If it's a discovery search (Public), we usually only show Public vendors
        // BUT if it's a shadow vendor, it's not public on map.
        // The user says: "any one else can see the vendors and how many orders were made"
        // and "cannot show it on map... until registers".
        // So we allow seeing them in list but maybe filter map results.

        if (!string.IsNullOrEmpty(request.Material))
        {
            query = query.Where(v => (v.VendorType != null && v.VendorType.Contains(request.Material)) || 
                                      v.Products.Any(p => p.Name.Contains(request.Material) || (p.Category != null && p.Category.Contains(request.Material))));
        }

        if (!string.IsNullOrEmpty(request.Name))
        {
            query = query.Where(v => v.Name.Contains(request.Name));
        }

        var vendors = await query.ToListAsync();
        var results = new List<PublicVendorDto>();

        double? refLat = request.Latitude;
        double? refLng = request.Longitude;

        // If project ID is provided, try to get project location
        if (request.ProjectId.HasValue)
        {
            // Note: Currently Project entity in this system doesn't have Lat/Lng.
            // In a real scenario, we'd fetch it here.
        }

        foreach (var v in vendors)
        {
            // Only show registered vendors on map (discovery) if they are public
            // Shadow vendors (UserId == null) should NOT be shown on map according to user
            bool canShowOnMap = v.UserId.HasValue && v.IsPublic;
            
            double? distance = null;
            if (refLat.HasValue && refLng.HasValue && v.Latitude.HasValue && v.Longitude.HasValue)
            {
                distance = CalculateDistance(refLat.Value, refLng.Value, v.Latitude.Value, v.Longitude.Value);
            }

            // If it's a map search (Lat/Lng provided) and vendor distance > radius, or vendor cannot be on map, skip
            if (refLat.HasValue && refLng.HasValue)
            {
                if (!canShowOnMap) continue; 
                if (distance.HasValue && distance > request.RadiusKm) continue;
            }

            results.Add(new PublicVendorDto
            {
                Id = v.Id,
                Name = v.Name,
                Phone = v.Phone,
                Email = v.Email,
                Address = v.Address,
                VendorType = v.VendorType,
                Latitude = v.Latitude,
                Longitude = v.Longitude,
                DistanceKm = distance,
                IsRegistered = v.UserId.HasValue,
                InvoiceCount = v.Invoices.Count, // "how many orders were made from this vendor"
                TopProducts = v.Products.Take(5).Select(p => new VendorProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Unit = p.Unit,
                    Category = p.Category
                }).ToList()
            });
        }

        return results.OrderBy(r => r.DistanceKm ?? double.MaxValue);
    }

    public async Task<VendorSpendReportDto> GetVendorSpendReportAsync(int? vendorId, DateTime? from, DateTime? to)
    {
        var companyId = _companyContext.CompanyId;
        var query = _invoiceRepository.AsQueryable()
            .Where(i => i.CompanyId == companyId && i.ApprovalStatus == InvoiceApprovalStatus.Approved);

        if (vendorId.HasValue)
        {
            query = query.Where(i => i.VendorId == vendorId.Value);
        }

        if (from.HasValue)
        {
            query = query.Where(i => i.InvoiceDate >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(i => i.InvoiceDate <= to.Value);
        }

        var invoices = await query.Include(i => i.Vendor).ToListAsync();

        var report = new VendorSpendReportDto
        {
            TotalSpend = invoices.Sum(i => i.Amount),
            TotalInvoices = invoices.Count,
            TopVendors = invoices.GroupBy(i => new { i.VendorId, i.Vendor?.Name })
                .Select(g => new VendorSpendItem
                {
                    VendorId = g.Key.VendorId,
                    VendorName = g.Key.Name ?? "Unknown",
                    TotalAmount = g.Sum(i => i.Amount),
                    InvoiceCount = g.Count()
                })
                .OrderByDescending(x => x.TotalAmount)
                .ToList(),
            SpendTrends = invoices.GroupBy(i => i.InvoiceDate.Date)
                .Select(g => new SpendByDateItem
                {
                    Date = g.Key,
                    Amount = g.Sum(i => i.Amount)
                })
                .OrderBy(x => x.Date)
                .ToList()
        };

        return report;
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
            IsActive = true
        };

        await _productRepository.AddAsync(product);
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
            IsActive = product.IsActive
        };
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
}
