using ConstructionManagement.Application.DTOs.Vendor;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class VendorService : IVendorService
{
    private readonly IRepository<Vendor> _vendorRepository;
    private readonly IRepository<VendorInvoice> _invoiceRepository;
    private readonly IRepository<CompanySettings> _settingsRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService? _notificationService;
    private readonly ICompanyContext _companyContext;

    public VendorService(
        IRepository<Vendor> vendorRepository,
        IRepository<VendorInvoice> invoiceRepository,
        IRepository<CompanySettings> settingsRepository,
        IRepository<User> userRepository,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        INotificationService? notificationService = null,
        ICompanyContext companyContext = null!)
    {
        _vendorRepository = vendorRepository;
        _invoiceRepository = invoiceRepository;
        _settingsRepository = settingsRepository;
        _userRepository = userRepository;
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
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
            CreatedAt = v.CreatedAt
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
            CreatedAt = vendor.CreatedAt
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

        var invoice = new VendorInvoice
        {
            CompanyId = companyId,
            VendorId = request.VendorId,
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
        var vendor = await _vendorRepository.GetByIdAsync(request.VendorId);
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
