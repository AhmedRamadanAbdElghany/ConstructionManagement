using ConstructionManagement.Application.DTOs.CashVoucher;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class CashVoucherService : ICashVoucherService
{
    private readonly IRepository<CashVoucher> _voucherRepository;
    private readonly IRepository<CompanySettings> _settingsRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService? _notificationService;
    private readonly ICompanyContext _companyContext;
    private readonly ILocalizationService _localizationService;

    public CashVoucherService(
        IRepository<CashVoucher> voucherRepository,
        IRepository<CompanySettings> settingsRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork,
        ILocalizationService localizationService,
        INotificationService? notificationService = null,
        ICompanyContext companyContext = null!)
    {
        _voucherRepository = voucherRepository;
        _settingsRepository = settingsRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _localizationService = localizationService;
        _notificationService = notificationService;
        _companyContext = companyContext;
    }

    public async Task<IEnumerable<CashVoucherDto>> GetVouchersAsync()
    {
        var companyId = _companyContext.CompanyId;
        var vouchers = await _voucherRepository.AsQueryable()
            .Where(v => v.CompanyId == companyId)
            .Include(v => v.WorkerUser)
            .Include(v => v.Project)
            .Include(v => v.CreatedByUser)
            .Include(v => v.ApprovedByUser)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        return vouchers.Select(MapToDto);
    }

    public async Task<CashVoucherDto?> GetVoucherByIdAsync(int id)
    {
        var companyId = _companyContext.CompanyId;
        var voucher = await _voucherRepository.AsQueryable()
            .Where(v => v.Id == id && v.CompanyId == companyId)
            .Include(v => v.WorkerUser)
            .Include(v => v.Project)
            .Include(v => v.CreatedByUser)
            .Include(v => v.ApprovedByUser)
            .FirstOrDefaultAsync();

        return voucher == null ? null : MapToDto(voucher);
    }

    public async Task<CashVoucherDto> CreateVoucherAsync(CreateCashVoucherRequest request, int createdByUserId)
    {
        var companyId = _companyContext.CompanyId;
        
        // Get settings to check if approval is required
        var settings = await _settingsRepository.AsQueryable()
            .FirstOrDefaultAsync(s => s.CompanyId == companyId);
        
        bool requireApproval = settings?.RequireCashVoucherApproval ?? true;
        var approverRole = settings?.CashVoucherApproverRole;

        // Generate voucher number
        var count = await _voucherRepository.AsQueryable()
            .CountAsync(v => v.CompanyId == companyId);
        var voucherNumber = $"CV-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D4}";

        var voucher = new CashVoucher
        {
            CompanyId = companyId,
            VoucherNumber = voucherNumber,
            VoucherDate = request.VoucherDate,
            Amount = request.Amount,
            Description = request.Description,
            Notes = request.Notes,
            WorkerUserId = request.WorkerUserId,
            ProjectId = request.ProjectId,
            Category = request.Category,
            ApprovalStatus = requireApproval ? VoucherApprovalStatus.Pending : VoucherApprovalStatus.Approved,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _voucherRepository.AddAsync(voucher);
        await _unitOfWork.SaveChangesAsync();

        // Send notification if approval is required
        if (requireApproval && _notificationService != null)
        {
            await _notificationService.CreateNotificationAsync(
                "CashVoucherPendingApproval",
                _localizationService.GetString("CashVoucher.PendingApproval", voucherNumber),
                companyId,
                null,
                voucher.Id,
                "CashVoucher",
                approverRole
            );
        }

        return MapToDto(voucher);
    }

    public async Task<CashVoucherDto> ReviewVoucherAsync(int voucherId, ReviewCashVoucherRequest request, int reviewerUserId)
    {
        var companyId = _companyContext.CompanyId;
        var voucher = await _voucherRepository.AsQueryable()
            .Where(v => v.Id == voucherId && v.CompanyId == companyId)
            .Include(v => v.WorkerUser)
            .Include(v => v.Project)
            .FirstOrDefaultAsync();

        if (voucher == null)
            throw new InvalidOperationException(_localizationService["CashVoucher.NotFound"]);

        if (voucher.ApprovalStatus != VoucherApprovalStatus.Pending)
            throw new InvalidOperationException(_localizationService["CashVoucher.AlreadyReviewed"]);

        voucher.ApprovalStatus = request.IsApproved ? VoucherApprovalStatus.Approved : VoucherApprovalStatus.Rejected;
        voucher.ApprovedByUserId = reviewerUserId;
        voucher.ApprovedDate = DateTime.UtcNow;
        voucher.RejectionReason = request.IsApproved ? null : request.RejectionReason;

        await _unitOfWork.SaveChangesAsync();

        return MapToDto(voucher);
    }

    public async Task<IEnumerable<CashVoucherDto>> GetPendingVouchersAsync()
    {
        var companyId = _companyContext.CompanyId;
        var vouchers = await _voucherRepository.AsQueryable()
            .Where(v => v.CompanyId == companyId && v.ApprovalStatus == VoucherApprovalStatus.Pending)
            .Include(v => v.WorkerUser)
            .Include(v => v.Project)
            .Include(v => v.CreatedByUser)
            .Include(v => v.ApprovedByUser)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        return vouchers.Select(MapToDto);
    }

    public async Task<IEnumerable<CashVoucherDto>> GetVouchersByWorkerAsync(int workerUserId)
    {
        var companyId = _companyContext.CompanyId;
        var vouchers = await _voucherRepository.AsQueryable()
            .Where(v => v.CompanyId == companyId && v.WorkerUserId == workerUserId)
            .Include(v => v.Project)
            .Include(v => v.CreatedByUser)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        return vouchers.Select(MapToDto);
    }

    public async Task<CashVoucherSummary> GetSummaryAsync()
    {
        var companyId = _companyContext.CompanyId;
        var vouchers = await _voucherRepository.AsQueryable()
            .Where(v => v.CompanyId == companyId)
            .ToListAsync();

        return new CashVoucherSummary
        {
            TotalVouchers = vouchers.Count,
            TotalAmount = vouchers.Sum(v => v.Amount),
            PendingApprovals = vouchers.Count(v => v.ApprovalStatus == VoucherApprovalStatus.Pending),
            ApprovedCount = vouchers.Count(v => v.ApprovalStatus == VoucherApprovalStatus.Approved),
            RejectedCount = vouchers.Count(v => v.ApprovalStatus == VoucherApprovalStatus.Rejected),
            PendingAmount = vouchers.Where(v => v.ApprovalStatus == VoucherApprovalStatus.Pending).Sum(v => v.Amount),
            ApprovedAmount = vouchers.Where(v => v.ApprovalStatus == VoucherApprovalStatus.Approved).Sum(v => v.Amount)
        };
    }

    private CashVoucherDto MapToDto(CashVoucher voucher)
    {
        return new CashVoucherDto
        {
            Id = voucher.Id,
            VoucherNumber = voucher.VoucherNumber,
            VoucherDate = voucher.VoucherDate,
            Amount = voucher.Amount,
            Description = voucher.Description,
            Notes = voucher.Notes,
            WorkerUserId = voucher.WorkerUserId,
            WorkerUserName = voucher.WorkerUser?.FullName,
            ProjectId = voucher.ProjectId,
            ProjectName = voucher.Project?.ProjectName,
            Category = voucher.Category,
            ApprovalStatus = voucher.ApprovalStatus.ToString(),
            ApprovedByUserId = voucher.ApprovedByUserId,
            ApprovedByUserName = voucher.ApprovedByUser?.FullName,
            ApprovedDate = voucher.ApprovedDate,
            RejectionReason = voucher.RejectionReason,
            CreatedByUserId = voucher.CreatedByUserId,
            CreatedByUserName = voucher.CreatedByUser?.FullName ?? string.Empty,
            CreatedAt = voucher.CreatedAt
        };
    }
}
