using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Services;

public class ProjectItemService : IProjectItemService
{
    private readonly IRepository<ProjectItem> _itemRepository;
    private readonly IRepository<ItemInvoice> _invoiceRepo;
    private readonly IRepository<Project> _projectRepo;
    private readonly IActivityLogService _activityLogService;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectItemService(
        IRepository<ProjectItem> itemRepository,
        IRepository<ItemInvoice> invoiceRepo,
        IRepository<Project> projectRepo,
        IActivityLogService activityLogService,
        IUnitOfWork unitOfWork)
    {
        _itemRepository = itemRepository;
        _invoiceRepo = invoiceRepo;
        _projectRepo = projectRepo;
        _activityLogService = activityLogService;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> CreateProjectItemAsync(int projectId, CreateProjectItemRequest request, int creatorUserId)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));
        if (_unitOfWork == null) throw new Exception("UnitOfWork is not initialized");

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            var project = await _projectRepo.GetByIdAsync(projectId)
                ?? throw new InvalidOperationException("المشروع غير موجود");

            // AccountingType is now determined by Project.AccountingSystem
            var accountingSystem = project.AccountingSystem;

            var projectItem = new ProjectItem
            {
                ProjectId = projectId,
                ItemCode = request.ItemCode ?? string.Empty,
                ItemName = request.ItemName ?? string.Empty,
                Description = request.Description,
                Unit = request.Unit ?? string.Empty,
                PhaseId = request.PhaseId,
                Status = "جديد",
                WorkflowStatus = ProjectItemWorkflowStatus.Pending,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CompanyId = project.CompanyId,
                ResponsibleUserId = request.ResponsibleUserId,
                RequiresPreStartConfirmation = request.RequiresPreStartConfirmation,
                PreStartConfirmationDeadline = request.StartDate?.AddHours(-request.PreStartConfirmationHours)
            };

            // Set accounting-specific fields based on Project.AccountingSystem
            if (accountingSystem == CalculationMethod.Measured)
            {
                if (request.AgreedQuantity <= 0) throw new InvalidOperationException("الكمية يجب أن تكون أكبر من صفر");
                if (request.UnitPrice < 0) throw new InvalidOperationException("سعر الوحدة لا يمكن أن يكون سالباً");

                projectItem.AgreedQuantity = request.AgreedQuantity ?? 0;
                projectItem.UnitPrice = request.UnitPrice ?? 0;
                projectItem.ExecutedQuantity = 0;
            }
            else if (accountingSystem == CalculationMethod.Packages)
            {
                if (request.TotalPackageValue <= 0) throw new InvalidOperationException("قيمة الحزمة يجب أن تكون أكبر من صفر");

                projectItem.TotalPackageValue = request.TotalPackageValue ?? 0;
                projectItem.PaymentTerms = request.PaymentTerms;
                projectItem.CompletionPercentage = 0;
            }
            else if (accountingSystem == CalculationMethod.Supervision)
            {
                if (request.SupervisionPercentage <= 0) throw new InvalidOperationException("نسبة الأشراف يجب أن تكون أكبر من صفر");

                projectItem.SupervisionPercentage = request.SupervisionPercentage ?? 10m;
                projectItem.EstimatedTotalCost = request.EstimatedTotalCost ?? 0;
            }

            await _itemRepository.AddAsync(projectItem);
            await _unitOfWork.SaveChangesAsync();

            await _activityLogService.LogActivityAsync(
                projectId,
                "Log",
                "Project Item Added",
                $"New item '{projectItem.ItemName}' ({projectItem.ItemCode}) added to the project scope.",
                creatorUserId
            );

            await _unitOfWork.CommitAsync();

            return projectItem.Id;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<ProjectItemDto?> GetProjectItemWithProgressAsync(int itemId)
    {
        var item = await _itemRepository.AsQueryable()
            .Include(i => i.Project)
            .Include(i => i.Phase)
            .Include(i => i.ResponsibleUser)
            .Include(i => i.PreStartConfirmedByUser)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null) return null;

        var accountingSystem = item.Project?.AccountingSystem ?? CalculationMethod.Measured;
        decimal progress = await CalculateProgressAsync(item, accountingSystem);

        return MapToDto(item, progress);
    }

    public async Task<IEnumerable<ProjectItemDto>> GetProjectItemsAsync(int projectId)
    {
        var project = await _projectRepo.GetByIdAsync(projectId);
        var accountingSystem = project?.AccountingSystem ?? CalculationMethod.Measured;

        var items = await _itemRepository.AsQueryable()
            .Where(i => i.ProjectId == projectId)
            .Include(i => i.Phase)
            .Include(i => i.ResponsibleUser)
            .Include(i => i.PreStartConfirmedByUser)
            .ToListAsync();

        var invoices = await _invoiceRepo.AsQueryable()
            .Where(i => i.ProjectId == projectId && i.Status == "Approved")
            .Select(i => new { i.ProjectItemId, i.NetAmount })
            .ToListAsync();

        var invoiceGroups = invoices.GroupBy(i => i.ProjectItemId)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.NetAmount));

        var dtos = new List<ProjectItemDto>();

        foreach (var item in items)
        {
            decimal progress = await CalculateProgressAsync(item, accountingSystem, invoiceGroups);
            dtos.Add(MapToDto(item, progress));
        }

        return dtos;
    }

    public async Task UpdateProjectItemAsync(int projectId, int itemId, UpdateProjectItemRequest request)
    {
        var item = await _itemRepository.AsQueryable()
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ProjectId == projectId)
            ?? throw new InvalidOperationException("البند غير موجود");

        if (request.ItemName != null)
            item.ItemName = request.ItemName;
        if (request.Description != null)
            item.Description = request.Description;
        if (request.Status != null)
            item.Status = request.Status;
        if (request.StartDate.HasValue)
            item.StartDate = request.StartDate;
        if (request.EndDate.HasValue)
            item.EndDate = request.EndDate;
        if (request.PhaseId.HasValue)
            item.PhaseId = request.PhaseId;
        if (request.ResponsibleUserId.HasValue)
            item.ResponsibleUserId = request.ResponsibleUserId;
        if (request.RequiresPreStartConfirmation.HasValue)
            item.RequiresPreStartConfirmation = request.RequiresPreStartConfirmation.Value;
        if (request.EstimatedRemainingDays.HasValue)
            item.EstimatedRemainingDays = request.EstimatedRemainingDays;

        await _itemRepository.UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteProjectItemAsync(int projectId, int itemId)
    {
        var item = await _itemRepository.AsQueryable()
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ProjectId == projectId)
            ?? throw new InvalidOperationException("البند غير موجود");

        await _itemRepository.DeleteAsync(item);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ConfirmPreStartAsync(int itemId, int userId, string? notes)
    {
        var item = await _itemRepository.GetByIdAsync(itemId)
            ?? throw new InvalidOperationException("البند غير موجود");

        item.PreStartConfirmedAt = DateTime.UtcNow;
        item.PreStartConfirmedByUserId = userId;
        item.PreStartConfirmationNotes = notes;
        item.WorkflowStatus = ProjectItemWorkflowStatus.ReadyToStart;

        await _itemRepository.UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();
        
        await _activityLogService.LogActivityAsync(
            item.ProjectId,
            "Log",
            "Pre-Start Confirmed",
            $"Pre-start requirements confirmed for item '{item.ItemName}' by user ID {userId}.",
            userId
        );
    }

    public async Task AuthorizeForcedStartAsync(int itemId, int userId, string reason)
    {
        var item = await _itemRepository.GetByIdAsync(itemId)
            ?? throw new InvalidOperationException("البند غير موجود");

        item.IsForcedStart = true;
        item.ForcedStartAuthorizedByUserId = userId;
        item.ForcedStartAuthorizedAt = DateTime.UtcNow;
        item.ForcedStartReason = reason;
        item.WorkflowStatus = ProjectItemWorkflowStatus.ReadyToStart;

        await _itemRepository.UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();

        await _activityLogService.LogActivityAsync(
            item.ProjectId,
            "Log",
            "Forced Start Authorized",
            $"Forced start authorized for item '{item.ItemName}' by user ID {userId}. Reason: {reason}",
            userId
        );
    }

    public async Task StartProjectItemAsync(int itemId, int userId)
    {
        var item = await _itemRepository.GetByIdAsync(itemId)
            ?? throw new InvalidOperationException("البند غير موجود");

        if (item.WorkflowStatus != ProjectItemWorkflowStatus.ReadyToStart && !item.IsForcedStart)
            throw new InvalidOperationException("البند غير جاهز للبدء. يجب تأكيد المتطلبات أولاً أو الحصول على تصريح بدء قسري.");

        item.ActualStartDate = DateTime.UtcNow;
        item.WorkflowStatus = ProjectItemWorkflowStatus.InProgress;
        item.Status = "InProgress";

        await _itemRepository.UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();

        await _activityLogService.LogActivityAsync(
            item.ProjectId,
            "Log",
            "Item Started",
            $"Work started on item '{item.ItemName}'.",
            userId
        );
    }

    public async Task CompleteProjectItemAsync(int itemId, int userId)
    {
        var item = await _itemRepository.GetByIdAsync(itemId)
            ?? throw new InvalidOperationException("البند غير موجود");

        item.ActualEndDate = DateTime.UtcNow;
        item.WorkflowStatus = ProjectItemWorkflowStatus.Completed;
        item.Status = "Completed";

        await _itemRepository.UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();

        await _activityLogService.LogActivityAsync(
            item.ProjectId,
            "Log",
            "Item Completed",
            $"Work completed on item '{item.ItemName}'.",
            userId
        );
    }

    public async Task UpdateWorkflowStatusAsync(int itemId, ProjectItemWorkflowStatus status)
    {
        var item = await _itemRepository.GetByIdAsync(itemId)
            ?? throw new InvalidOperationException("البند غير موجود");

        item.WorkflowStatus = status;
        
        // Sync with legacy status string
        item.Status = status.ToString();

        await _itemRepository.UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();
    }


    private ProjectItemDto MapToDto(ProjectItem item, decimal progress)
    {
        return new ProjectItemDto
        {
            Id = item.Id,
            ProjectId = item.ProjectId,
            PhaseId = item.PhaseId,
            ItemCode = item.ItemCode ?? "",
            ItemName = item.ItemName,
            Description = item.Description,
            Unit = item.Unit,
            Status = item.Status,
            StartDate = item.StartDate,
            EndDate = item.EndDate,
            AgreedQuantity = item.AgreedQuantity,
            ExecutedQuantity = item.ExecutedQuantity,
            UnitPrice = item.UnitPrice,
            EstimatedTotalCost = item.EstimatedTotalCost,
            SupervisionPercentage = item.SupervisionPercentage,
            TotalPackageValue = item.TotalPackageValue,
            EstimatedBudget = item.EstimatedBudget,
            ProgressPercentage = progress,
            WorkflowStatus = item.WorkflowStatus,
            RequiresPreStartConfirmation = item.RequiresPreStartConfirmation,
            PreStartConfirmationDeadline = item.PreStartConfirmationDeadline,
            PreStartConfirmedAt = item.PreStartConfirmedAt,
            PreStartConfirmedByName = item.PreStartConfirmedByUser != null ? $"{item.PreStartConfirmedByUser.FirstName} {item.PreStartConfirmedByUser.LastName}" : null,
            PreStartConfirmationNotes = item.PreStartConfirmationNotes,
            IsForcedStart = item.IsForcedStart,
            ForcedStartReason = item.ForcedStartReason,
            ResponsibleUserId = item.ResponsibleUserId,
            ResponsibleUserName = item.ResponsibleUser != null ? $"{item.ResponsibleUser.FirstName} {item.ResponsibleUser.LastName}" : null,
            EstimatedRemainingDays = item.EstimatedRemainingDays,
            ActualStartDate = item.ActualStartDate,
            ActualEndDate = item.ActualEndDate,
            LastDailyLogDate = item.LastDailyLogDate,
            LastProgressPercentage = item.LastProgressPercentage
        };
    }

    private async Task<decimal> CalculateProgressAsync(ProjectItem item, CalculationMethod accountingSystem, 
        Dictionary<int, decimal>? invoiceGroups = null)
    {
        decimal progress = 0;

        if (accountingSystem == CalculationMethod.Measured)
        {
            if (item.AgreedQuantity.HasValue && item.AgreedQuantity > 0 && item.ExecutedQuantity.HasValue)
            {
                progress = (item.ExecutedQuantity.Value / item.AgreedQuantity.Value) * 100;
            }
        }
        else if (accountingSystem == CalculationMethod.Supervision)
        {
            if (item.EstimatedTotalCost.HasValue && item.EstimatedTotalCost > 0)
            {
                decimal approvedSum = 0;
                if (invoiceGroups != null && invoiceGroups.TryGetValue(item.Id, out var sum))
                {
                    approvedSum = sum;
                }
                else
                {
                    approvedSum = await _invoiceRepo.AsQueryable()
                        .Where(i => i.ProjectItemId == item.Id && i.Status == "Approved")
                        .SumAsync(i => i.NetAmount);
                }
                progress = (approvedSum / item.EstimatedTotalCost.Value) * 100;
            }
        }
        else if (accountingSystem == CalculationMethod.Packages)
        {
            progress = item.CompletionPercentage ?? 0;
        }

        return progress;
    }
}
