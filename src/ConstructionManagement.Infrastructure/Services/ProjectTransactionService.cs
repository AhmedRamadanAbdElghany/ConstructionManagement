using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.Transaction;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class ProjectTransactionService : IProjectTransactionService
{
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<BOQItem> _boqItemRepository;
    private readonly IRepository<ProjectSettings> _settingsRepository;
    private readonly IFileStorageService _fileStorage;
    private readonly INotificationService _notificationService;
    private readonly IRepository<BOQProfitabilityLog> _profitabilityLogRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectTransactionService(
        IRepository<Transaction> transactionRepository,
        IRepository<BOQItem> boqItemRepository,
        IRepository<ProjectSettings> settingsRepository,
        IFileStorageService fileStorage,
        IRepository<BOQProfitabilityLog> profitabilityLogRepository,
        INotificationService notificationService,
        IUnitOfWork unitOfWork)
    {
        _transactionRepository = transactionRepository;
        _boqItemRepository = boqItemRepository;
        _settingsRepository = settingsRepository;
        _fileStorage = fileStorage;
        _profitabilityLogRepository = profitabilityLogRepository;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> CreateTransactionAsync(int projectId, CreateTransactionRequest request, int userId)
    {
        ArgumentNullException.ThrowIfNull(request);

        var settings = await _settingsRepository.GetByIdAsync(projectId)
            ?? throw new InvalidOperationException($"Project settings not found for project ID {projectId}");

        BOQItem? boqItem = null;
        if (request.BOQItemId.HasValue)
        {
            boqItem = await _boqItemRepository.AsQueryable()
                .Include(i => i.Project)
                .FirstOrDefaultAsync(i => i.Id == request.BOQItemId.Value);

            // تصحيح: التحقق من أن البند يخص المشروع عبر ProjectID
            if (boqItem == null || boqItem.ProjectId != projectId)
                throw new InvalidOperationException("BOQ item invalid or does not belong to this project");
        }

        string? attachmentPath = null;
        if (request.InvoiceAttachment != null)
        {
            attachmentPath = await _fileStorage.UploadFileAsync(request.InvoiceAttachment, $"project-{projectId}/transactions");
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var transaction = new Transaction
            {
                ProjectId = projectId,
                BOQItemId = request.BOQItemId,
                Type = request.Type,
                Amount = request.Amount,
                Description = request.Description,
                InvoiceNumber = request.InvoiceNumber,
                SupplierName = request.SupplierName,
                AttachmentPath = attachmentPath,
                CreatedByUserId = userId,
                TransactionDate = DateTime.UtcNow,

                Status = (settings?.EnableInvoiceReview ?? true)
    ? TransactionStatus.Pending
    : TransactionStatus.Approved,
              //  Status = settings.EnableInvoiceReview ? TransactionStatus.Pending : TransactionStatus.Approved,
                CreatedAt = DateTime.UtcNow
            };

            await _transactionRepository.AddAsync(transaction);

            if (request.BOQItemId.HasValue && boqItem != null)
            {
                var previousSpent = await _transactionRepository.AsQueryable()
                    .Where(t => t.BOQItemId == request.BOQItemId && t.Status == TransactionStatus.Approved)
                    .SumAsync(t => t.Amount);

                var totalSpent = previousSpent + (transaction.Status == TransactionStatus.Approved ? request.Amount : 0);
                decimal currentProfit = boqItem.EstimatedBudget - totalSpent;

                var log = new BOQProfitabilityLog
                {
                    BOQItemId = boqItem.Id,
                    TotalSpent = totalSpent,
                    EstimatedBudget = boqItem.EstimatedBudget,
                    CurrentProfit = currentProfit,
                    ProfitPercentage = boqItem.EstimatedBudget != 0 ? (currentProfit / boqItem.EstimatedBudget) * 100 : 0,
                    LogDate = DateTime.UtcNow
                };
                await _profitabilityLogRepository.AddAsync(log);

                await _unitOfWork.SaveChangesAsync();
                await CheckAndSendBudgetNotifications(projectId, boqItem, totalSpent, currentProfit, userId);
            }
            else
            {
                await _unitOfWork.SaveChangesAsync();
            }

            await _unitOfWork.CommitAsync();
            return transaction.Id;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<TransactionDto?> GetTransactionByIdAsync(int transactionId)
    {
        var transaction = await _transactionRepository.AsQueryable()
            .Include(t => t.BOQItem)
            .Include(t => t.CreatedBy)
            .Include(t => t.ReviewedBy)
            .FirstOrDefaultAsync(t => t.Id == transactionId);

        return transaction == null ? null : MapToDto(transaction);
    }

    public async Task<List<TransactionDto>> GetTransactionsForProjectAsync(int projectId, int? boqItemId = null)
    {
        var query = _transactionRepository.AsQueryable()
            .Include(t => t.BOQItem)
            .Include(t => t.CreatedBy)
            .Include(t => t.ReviewedBy)
            .Where(t => t.ProjectId == projectId); // تصحيح: الفلترة بـ ProjectID

        if (boqItemId.HasValue)
            query = query.Where(t => t.BOQItemId == boqItemId.Value);

        var transactions = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return transactions.Select(MapToDto).ToList();
    }

    public async Task<bool> ReviewTransactionAsync(int transactionId, ReviewTransactionRequest request, int reviewerUserId)
    {
        var transaction = await _transactionRepository.GetByIdAsync(transactionId);
        if (transaction == null || transaction.Status != TransactionStatus.Pending)
            return false;

        transaction.Status = request.Status;
        transaction.ReviewedByUserId = reviewerUserId;
        transaction.ReviewDate = DateTime.UtcNow;
        transaction.ReviewNotes = request.ReviewNotes;

        await _transactionRepository.UpdateAsync(transaction);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<ProjectProfitabilityDto> GetProjectProfitabilityAsync(int projectId)
    {
        // تصحيح: جلب كل بنود المشروع عبر ProjectID
        var items = await _boqItemRepository.AsQueryable().Where(i => i.ProjectId == projectId).ToListAsync();
        decimal totalEstimated = items.Sum(i => i.EstimatedBudget);

        // تصحيح: حساب إجمالي المصروفات المعتمدة للمشروع
        decimal totalSpent = await _transactionRepository.AsQueryable()
            .Where(t => t.ProjectId == projectId && t.Status == TransactionStatus.Approved)
            .SumAsync(t => t.Amount);

        return new ProjectProfitabilityDto(projectId, totalEstimated, totalSpent, totalEstimated - totalSpent,
            totalEstimated != 0 ? ((totalEstimated - totalSpent) / totalEstimated) * 100 : 0, items.Count);
    }

    public async Task<ItemProfitabilityDto?> GetItemProfitabilityAsync(int projectId, int boqItemId)
    {
        var item = await _boqItemRepository.AsQueryable()
            .FirstOrDefaultAsync(i => i.Id == boqItemId && i.ProjectId == projectId);

        if (item == null) return null;

        var totalSpent = await _transactionRepository.AsQueryable()
            .Where(t => t.BOQItemId == boqItemId && t.Status == TransactionStatus.Approved).SumAsync(t => t.Amount);

        return new ItemProfitabilityDto(boqItemId, item.ItemName, item.EstimatedBudget, totalSpent,
            item.EstimatedBudget - totalSpent, item.EstimatedBudget != 0 ? ((item.EstimatedBudget - totalSpent) / item.EstimatedBudget) * 100 : 0);
    }

    private async Task CheckAndSendBudgetNotifications(int projectId, BOQItem boqItem, decimal totalSpent, decimal currentProfit, int userId)
    {
        decimal warningThreshold = boqItem.EstimatedBudget * 0.90m;
        decimal criticalThreshold = boqItem.EstimatedBudget;

        if (totalSpent >= criticalThreshold)
        {
            await _notificationService.CreateAndSendAsync(boqItem.Project.OwnerUserId, "تصعيد حرج: تجاوز الميزانية",
                $"البند {boqItem.ItemName} تجاوز الميزانية ({(totalSpent / boqItem.EstimatedBudget * 100):F1}%)", $"/projects/{projectId}", NotificationType.BudgetOverrun);
        }
        else if (totalSpent >= warningThreshold)
        {
            await _notificationService.CreateAndSendAsync(userId, "تحذير: اقتراب من الميزانية",
                $"البند {boqItem.ItemName} استهلك 90% من ميزانيته", $"/projects/{projectId}", NotificationType.BudgetWarning);
        }
    }

    private TransactionDto MapToDto(Transaction t)
    {
        return new TransactionDto(
            t.Id, t.ProjectId, t.BOQItemId, t.BOQItem?.ItemName, t.Type, t.Amount, t.TransactionDate,
            t.CreatedByUserId, t.CreatedBy?.FullName ?? "غير معروف", t.Description, t.InvoiceNumber, t.SupplierName,
            t.AttachmentPath, t.Status, t.ReviewedByUserId, t.ReviewedBy?.FullName, t.ReviewNotes, t.CreatedAt);
    }
}