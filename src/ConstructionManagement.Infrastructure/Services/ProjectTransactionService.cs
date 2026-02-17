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
    private readonly ILocalizationService? _localizationService;

    private readonly IActivityLogService _activityLogService;

    public ProjectTransactionService(
        IRepository<Transaction> transactionRepository,
        IRepository<BOQItem> boqItemRepository,
        IRepository<ProjectSettings> settingsRepository,
        IFileStorageService fileStorage,
        IRepository<BOQProfitabilityLog> profitabilityLogRepository,
        INotificationService notificationService,
        IUnitOfWork unitOfWork,
        IActivityLogService activityLogService,
        ILocalizationService? localizationService = null)
    {
        _transactionRepository = transactionRepository;
        _boqItemRepository = boqItemRepository;
        _settingsRepository = settingsRepository;
        _fileStorage = fileStorage;
        _profitabilityLogRepository = profitabilityLogRepository;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
        _activityLogService = activityLogService;
        _localizationService = localizationService;
    }

    public async Task<int> CreateTransactionAsync(int projectId, CreateTransactionRequest request, int userId)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (request.Amount <= 0)
            throw new ArgumentException("مبلغ المعاملة يجب أن يكون أكبر من صفر", nameof(request.Amount));

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

            await _activityLogService.LogActivityAsync(
                projectId, 
                "Financial", 
                "Expense Recorded", 
                $"New {request.Type} of {request.Amount:N2} added{(boqItem != null ? $" for '{boqItem.ItemName}'" : "")}.", 
                userId
            );

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

        await _activityLogService.LogActivityAsync(
            transaction.ProjectId, 
            "Financial", 
            $"Transaction {transaction.Status}", 
            $"Transaction '{transaction.Description}' was {transaction.Status.ToString().ToLower()}.", 
            reviewerUserId
        );

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
        if (boqItem.EstimatedBudget <= 0) return;

        decimal warningThreshold = boqItem.EstimatedBudget * 0.90m;
        decimal criticalThreshold = boqItem.EstimatedBudget;

        if (totalSpent >= criticalThreshold)
        {
            var title = _localizationService?["NotificationTitle.BudgetOverrun"] ?? "Budget Overrun";
            var message = _localizationService?.GetString("NotificationMessage.BudgetOverrun.Critical", boqItem.ItemName, totalSpent.ToString("P1"))
                ?? $"Item {boqItem.ItemName} exceeded budget ({totalSpent:P1})";
            
            await _notificationService.CreateAndSendAsync(
                userId: boqItem.Project.OwnerUserId,
                title: title,
                message: message,
                link: $"/projects/{projectId}",
                type: NotificationType.BudgetOverrun,
                titleKey: "NotificationTitle.BudgetOverrun",
                messageKey: "NotificationMessage.BudgetOverrun.Critical",
                messageArgs: new object[] { boqItem.ItemName, totalSpent.ToString("P1") }
            );
        }
        else if (totalSpent >= warningThreshold)
        {
            var title = _localizationService?["NotificationTitle.BudgetWarning"] ?? "Budget Warning";
            var message = _localizationService?.GetString("NotificationMessage.BudgetWarning.Approaching", boqItem.ItemName)
                ?? $"Item {boqItem.ItemName} has consumed 90% of its budget";
            
            await _notificationService.CreateAndSendAsync(
                userId: userId,
                title: title,
                message: message,
                link: $"/projects/{projectId}",
                type: NotificationType.BudgetWarning,
                titleKey: "NotificationTitle.BudgetWarning",
                messageKey: "NotificationMessage.BudgetWarning.Approaching",
                messageArgs: new object[] { boqItem.ItemName }
            );
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
