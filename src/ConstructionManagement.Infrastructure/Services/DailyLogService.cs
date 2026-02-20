using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class DailyLogService : IDailyLogService
{
    private readonly IRepository<ItemDailyLog> _logRepository;
    private readonly IRepository<ProjectItemExecutedDelta> _deltaRepository;
    private readonly IUnitOfWork _unitOfWork;

    private readonly IRepository<ProjectItem> _itemRepository;
    private readonly IActivityLogService _activityLogService;
    private readonly ILocalizationService _localizationService;

    public DailyLogService(
        IRepository<ItemDailyLog> logRepository,
        IRepository<ProjectItemExecutedDelta> deltaRepository,
        IRepository<ProjectItem> itemRepository,
        IActivityLogService activityLogService,
        IUnitOfWork unitOfWork,
        ILocalizationService localizationService)
    {
        _logRepository = logRepository;
        _deltaRepository = deltaRepository;
        _itemRepository = itemRepository;
        _activityLogService = activityLogService;
        _unitOfWork = unitOfWork;
        _localizationService = localizationService;
    }

    public async Task<bool> IsDayClosedForItemAsync(int itemId, DateTime date)
    {
        return await _logRepository.AsQueryable()
            .AnyAsync(l => l.ProjectItemId == itemId && l.LogDate.Date == date.Date && l.IsClosed);
    }

    public async Task<int> GetOrCreateDailyLogIdAsync(int itemId, DateTime logDate, int userId)
    {
        var log = await _logRepository.AsQueryable()
            .FirstOrDefaultAsync(l => l.ProjectItemId == itemId && l.LogDate.Date == logDate.Date);

        if (log != null) return log.Id;

        var newLog = new ItemDailyLog
        {
            ProjectItemId = itemId,
            LogDate = logDate.Date,
            CreatedByUserId = userId,
            IsClosed = false
        };

        await _logRepository.AddAsync(newLog);
        await _unitOfWork.SaveChangesAsync();

        return newLog.Id;
    }

    public async Task<bool> CloseDailyLogAsync(int itemId, DateTime logDate, int userId, CloseDailyLogRequest request)
    {
        // 1. Find the log
        var log = await _logRepository.AsQueryable()
            .FirstOrDefaultAsync(l => l.ProjectItemId == itemId && l.LogDate.Date == logDate.Date);

        if (log == null || log.IsClosed)
            return false;

        // 2. Calculate delta (example formula — adjust to your real business logic)
        // Here we assume DailyProgressPercentage is % of AgreedQuantity
        decimal deltaQty = 0m;

        // Load the ProjectItem to get AgreedQuantity
        var projectItem = await _itemRepository.GetByIdAsync(itemId);
        
        if (request.DailyProgressPercentage > 0) // simple check (no HasValue needed)
        {
            decimal agreedQty = projectItem?.AgreedQuantity ?? 1000m;
            deltaQty = (request.DailyProgressPercentage / 100m) * agreedQty;
        }

        // 3. Record delta (append-only — no direct update to ExecutedQuantity)
        var delta = new ProjectItemExecutedDelta
        {
            ProjectItemId = itemId,
            DeltaQuantity = deltaQty,
            ChangeType = "DailyLog",
            ReferenceId = log.Id,
            CreatedByUserId = userId,
            DeltaDate = logDate.Date
        };

        await _deltaRepository.AddAsync(delta);

        // 4. Close the daily log
        log.IsClosed = true;
        log.ClosedAt = DateTime.UtcNow;
        log.ClosedByUserId = userId;
        log.DailyProgressPercentage = request.DailyProgressPercentage;
        log.ProgressNotes = request.ProgressNotes;
        log.ClosingNotes = request.ClosingNotes;

        await _logRepository.UpdateAsync(log);

        // 5. Activity Log
        if (projectItem != null)
        {
            await _activityLogService.LogActivityAsync(
                projectItem.ProjectId, 
                "Log", 
                "Daily Log Closed", 
                $"Progress for '{projectItem.ItemName}' recorded: {request.DailyProgressPercentage:N0}% on {logDate:yyyy-MM-dd}.", 
                userId
            );
        }

        // 6. Commit
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReopenClosedDayAsync(int itemId, DateTime logDate, int userId, string reason, List<int>? notifyRoleIds)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new InvalidOperationException(_localizationService["DailyLog.ReopenReasonRequired"]);

        var log = await _logRepository.AsQueryable()
            .FirstOrDefaultAsync(l => l.ProjectItemId == itemId && l.LogDate.Date == logDate.Date);

        if (log == null || !log.IsClosed)
            return false;

        // Find associated delta and remove it
        var associatedDelta = await _deltaRepository.AsQueryable()
            .FirstOrDefaultAsync(d => d.ProjectItemId == itemId && d.ReferenceId == log.Id && d.ChangeType == "DailyLog");
        
        if (associatedDelta != null)
        {
            await _deltaRepository.DeleteAsync(associatedDelta);
        }

        log.IsClosed = false;
        log.ClosedAt = null;
        log.ClosedByUserId = null;
        // logic to use reason and notifyRoleIds could be added here (e.g. Activity Log or Notifications)

        await _logRepository.UpdateAsync(log);

        var item = await _itemRepository.GetByIdAsync(itemId);
        if (item != null)
        {
            await _activityLogService.LogActivityAsync(
                item.ProjectId, 
                "Log", 
                "Daily Log Reopened", 
                $"Daily log for '{item.ItemName}' on {logDate:yyyy-MM-dd} reopened. Reason: {reason}", 
                userId
            );
        }

        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<List<DailyLogDto>> GetDailyLogHistoryAsync(int itemId)
    {
        var logs = await _logRepository.AsQueryable()
            .Include(l => l.ClosedByUser)
            .Where(l => l.ProjectItemId == itemId)
            .OrderByDescending(l => l.LogDate)
            .ToListAsync();

        return logs.Select(l => new DailyLogDto(
            l.ProjectItemId,
            l.LogDate,
            l.IsClosed,
            l.DailyProgressPercentage,
            l.ProgressNotes,
            l.ClosingNotes,
            l.ClosedAt,
            l.ClosedByUser?.FullName
        )).ToList();
    }
}
