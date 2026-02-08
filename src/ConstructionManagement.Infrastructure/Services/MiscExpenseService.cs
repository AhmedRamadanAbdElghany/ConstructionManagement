using ConstructionManagement.Application.DTOs.MiscExpense;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class MiscExpenseService : IMiscExpenseService
{
    private readonly IRepository<MiscExpense> _expenseRepository;
    private readonly IRepository<CompanySettings> _settingsRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService? _notificationService;
    private readonly ICompanyContext _companyContext;

    public MiscExpenseService(
        IRepository<MiscExpense> expenseRepository,
        IRepository<CompanySettings> settingsRepository,
        IRepository<User> userRepository,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        INotificationService? notificationService = null,
        ICompanyContext companyContext = null!)
    {
        _expenseRepository = expenseRepository;
        _settingsRepository = settingsRepository;
        _userRepository = userRepository;
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _companyContext = companyContext;
    }

    public async Task<IEnumerable<MiscExpenseDto>> GetExpensesAsync()
    {
        var companyId = _companyContext.CompanyId;
        var expenses = await _expenseRepository.AsQueryable()
            .Where(e => e.CompanyId == companyId)
            .Include(e => e.Project)
            .Include(e => e.CreatedByUser)
            .Include(e => e.ApprovedByUser)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return expenses.Select(MapToDto);
    }

    public async Task<MiscExpenseDto?> GetExpenseByIdAsync(int id)
    {
        var companyId = _companyContext.CompanyId;
        var expense = await _expenseRepository.AsQueryable()
            .Where(e => e.Id == id && e.CompanyId == companyId)
            .Include(e => e.Project)
            .Include(e => e.CreatedByUser)
            .Include(e => e.ApprovedByUser)
            .FirstOrDefaultAsync();

        return expense == null ? null : MapToDto(expense);
    }

    public async Task<MiscExpenseDto> CreateExpenseAsync(CreateMiscExpenseRequest request)
    {
        var companyId = _companyContext.CompanyId;
        
        // Get settings to check if approval is required
        var settings = await _settingsRepository.AsQueryable()
            .FirstOrDefaultAsync(s => s.CompanyId == companyId);
        
        bool requireApproval = settings?.RequireMiscExpenseApproval ?? true;
        var approverRole = settings?.MiscExpenseApproverRole;

        // Upload file if provided
        string? receiptUrl = null;
        string? originalFileName = null;
        if (request.ReceiptFile != null && request.ReceiptFile.Length > 0)
        {
            receiptUrl = await _fileStorageService.UploadFileAsync(request.ReceiptFile, "misc-expenses");
            originalFileName = request.ReceiptFile.FileName;
        }

        // Generate expense number
        var count = await _expenseRepository.AsQueryable()
            .CountAsync(e => e.CompanyId == companyId);
        var expenseNumber = $"ME-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D4}";

        var expense = new MiscExpense
        {
            CompanyId = companyId,
            ExpenseNumber = expenseNumber,
            ExpenseDate = request.ExpenseDate,
            Amount = request.Amount,
            Category = request.Category,
            Description = request.Description,
            Notes = request.Notes,
            ProjectId = request.ProjectId,
            ReceiptUrl = receiptUrl,
            OriginalFileName = originalFileName,
            ApprovalStatus = requireApproval ? ExpenseApprovalStatus.Pending : ExpenseApprovalStatus.Approved,
            CreatedByUserId = request.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _expenseRepository.AddAsync(expense);
        await _unitOfWork.SaveChangesAsync();

        // Send notification if approval is required
        if (requireApproval && _notificationService != null)
        {
            await _notificationService.CreateNotificationAsync(
                "MiscExpensePendingApproval",
                $"نثريات جديدة معلقة للموافقة: {expenseNumber}",
                companyId,
                null,
                expense.Id,
                "MiscExpense",
                approverRole
            );
        }

        return MapToDto(expense);
    }

    public async Task<MiscExpenseDto> ReviewExpenseAsync(int expenseId, ReviewMiscExpenseRequest request, int reviewerUserId)
    {
        var companyId = _companyContext.CompanyId;
        var expense = await _expenseRepository.AsQueryable()
            .Where(e => e.Id == expenseId && e.CompanyId == companyId)
            .Include(e => e.Project)
            .FirstOrDefaultAsync();

        if (expense == null)
            throw new InvalidOperationException("إثبات المصروفات غير موجود");

        if (expense.ApprovalStatus != ExpenseApprovalStatus.Pending)
            throw new InvalidOperationException("تم مراجعة إثبات المصروفات بالفعل");

        expense.ApprovalStatus = request.IsApproved ? ExpenseApprovalStatus.Approved : ExpenseApprovalStatus.Rejected;
        expense.ApprovedByUserId = reviewerUserId;
        expense.ApprovedDate = DateTime.UtcNow;
        expense.RejectionReason = request.IsApproved ? null : request.RejectionReason;

        await _unitOfWork.SaveChangesAsync();

        return MapToDto(expense);
    }

    public async Task<IEnumerable<MiscExpenseDto>> GetPendingExpensesAsync()
    {
        var companyId = _companyContext.CompanyId;
        var expenses = await _expenseRepository.AsQueryable()
            .Where(e => e.CompanyId == companyId && e.ApprovalStatus == ExpenseApprovalStatus.Pending)
            .Include(e => e.Project)
            .Include(e => e.CreatedByUser)
            .Include(e => e.ApprovedByUser)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return expenses.Select(MapToDto);
    }

    public async Task<MiscExpenseSummary> GetSummaryAsync()
    {
        var companyId = _companyContext.CompanyId;
        var expenses = await _expenseRepository.AsQueryable()
            .Where(e => e.CompanyId == companyId)
            .ToListAsync();

        return new MiscExpenseSummary
        {
            TotalExpenses = expenses.Count,
            TotalAmount = expenses.Sum(e => e.Amount),
            PendingApprovals = expenses.Count(e => e.ApprovalStatus == ExpenseApprovalStatus.Pending),
            ApprovedCount = expenses.Count(e => e.ApprovalStatus == ExpenseApprovalStatus.Approved),
            RejectedCount = expenses.Count(e => e.ApprovalStatus == ExpenseApprovalStatus.Rejected),
            PendingAmount = expenses.Where(e => e.ApprovalStatus == ExpenseApprovalStatus.Pending).Sum(e => e.Amount),
            ApprovedAmount = expenses.Where(e => e.ApprovalStatus == ExpenseApprovalStatus.Approved).Sum(e => e.Amount),
            ExpensesByCategory = expenses
                .GroupBy(e => e.Category)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount))
        };
    }

    public async Task<Dictionary<string, decimal>> GetExpensesByCategoryAsync()
    {
        var companyId = _companyContext.CompanyId;
        var expenses = await _expenseRepository.AsQueryable()
            .Where(e => e.CompanyId == companyId && e.ApprovalStatus == ExpenseApprovalStatus.Approved)
            .ToListAsync();

        return expenses
            .GroupBy(e => e.Category)
            .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));
    }

    private MiscExpenseDto MapToDto(MiscExpense expense)
    {
        return new MiscExpenseDto
        {
            Id = expense.Id,
            ExpenseNumber = expense.ExpenseNumber,
            ExpenseDate = expense.ExpenseDate,
            Amount = expense.Amount,
            Category = expense.Category,
            Description = expense.Description,
            Notes = expense.Notes,
            ReceiptUrl = expense.ReceiptUrl,
            OriginalFileName = expense.OriginalFileName,
            ProjectId = expense.ProjectId,
            ProjectName = expense.Project?.ProjectName,
            ApprovalStatus = expense.ApprovalStatus.ToString(),
            ApprovedByUserId = expense.ApprovedByUserId,
            ApprovedByUserName = expense.ApprovedByUser?.FullName,
            ApprovedDate = expense.ApprovedDate,
            RejectionReason = expense.RejectionReason,
            CreatedByUserId = expense.CreatedByUserId,
            CreatedByUserName = expense.CreatedByUser?.FullName ?? string.Empty,
            CreatedAt = expense.CreatedAt
        };
    }
}
