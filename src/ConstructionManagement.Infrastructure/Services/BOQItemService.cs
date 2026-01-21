using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class BOQItemService : IBOQItemService
{
    private readonly IRepository<BOQItem> _itemRepository;
    private readonly IRepository<BOQMeasured> _measuredRepo;
    private readonly IRepository<BOQSupervision> _supervisionRepo;
    private readonly IRepository<ItemInvoice> _invoiceRepo;
    private readonly IRepository<Project> _projectRepo;
    private readonly IUnitOfWork _unitOfWork;

    public BOQItemService(
        IRepository<BOQItem> itemRepository,
        IRepository<BOQMeasured> measuredRepo,
        IRepository<BOQSupervision> supervisionRepo,
        IRepository<ItemInvoice> invoiceRepo,
        IRepository<Project> projectRepo,
        IUnitOfWork unitOfWork)
    {
        _itemRepository = itemRepository;
        _measuredRepo = measuredRepo;
        _supervisionRepo = supervisionRepo;
        _invoiceRepo = invoiceRepo;
        _projectRepo = projectRepo;
        _unitOfWork = unitOfWork;
    }


    public async Task<int> CreateBOQItemAsync(int projectId, CreateBOQItemRequest request, int creatorUserId)
    {
        // تأكد من أن الـ request ليس null قبل البدء
        if (request == null) throw new ArgumentNullException(nameof(request));

        // بدأ المعاملة إذا كنت تستخدمها
        if (_unitOfWork == null) throw new Exception("UnitOfWork is not initialized");

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            var project = await _projectRepo.GetByIdAsync(projectId)
                ?? throw new InvalidOperationException("المشروع غير موجود");

            var boqItem = new BOQItem
            {
                ProjectId = projectId,
                ItemCode = request.ItemCode,
                ItemName = request.ItemName,
                Description = request.Description,
                Unit = request.Unit,
                AccountingType = request.AccountingType ?? "Measured",
                Status = "جديد",
                StartDate = request.StartDate,
                EndDate = request.EndDate
                // إذا كان هناك حقول أخرى مثل CreatedBy تأكد من تعبئتها
            };

            await _itemRepository.AddAsync(boqItem);
            await _unitOfWork.SaveChangesAsync();

            // منطق MeasuredData...
            if (boqItem.AccountingType == "Measured" || boqItem.AccountingType == "Mixed")
            {
                var measured = new BOQMeasured
                {
                    Id = boqItem.Id, // هذا يعتمد على SaveChanges السابقة
                    AgreedQuantity = request.AgreedQuantity ?? 0,
                    UnitPrice = request.UnitPrice ?? 0
                };
                await _measuredRepo.AddAsync(measured);
                await _unitOfWork.SaveChangesAsync();
            }

            await _unitOfWork.CommitAsync();
            return boqItem.Id;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<BOQItemDto?> GetBOQItemWithProgressAsync(int itemId)
    {
        var item = await _itemRepository.AsQueryable()
            .Include(i => i.MeasuredData)
            .Include(i => i.SupervisionData)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null) return null;

        // تم تغيير التعريف هنا من decimal? إلى decimal لحل خطأ CS0266
        decimal progress = 0;

        if (item.AccountingType == "Measured" && item.MeasuredData != null)
        {
            if (item.MeasuredData.AgreedQuantity > 0)
            {
                progress = (item.MeasuredData.ExecutedQuantity / item.MeasuredData.AgreedQuantity) * 100;
            }
        }
        else if (item.AccountingType == "Supervision" && item.SupervisionData != null)
        {
            if (item.SupervisionData.EstimatedTotalCost > 0)
            {
                var approvedSum = await _invoiceRepo.AsQueryable()
                    .Where(i => i.BOQItemId == itemId && i.Status == "Approved")
                    .SumAsync(i => i.Amount);

                progress = (approvedSum / item.SupervisionData.EstimatedTotalCost) * 100;
            }
        }

        // السطر 120: تمرير progress كـ decimal صريح
        return new BOQItemDto(
            item.Id,
            item.ItemCode ?? "",
            item.ItemName,
            item.AccountingType,
            item.Status,
            item.StartDate,
            item.EndDate,
            progress,
            null);
    }
}