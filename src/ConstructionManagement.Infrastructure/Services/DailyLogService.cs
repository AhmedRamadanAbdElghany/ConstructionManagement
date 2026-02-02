using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class DailyLogService : IDailyLogService
{
    private readonly IRepository<ItemDailyLog> _logRepository;
    private readonly IRepository<BOQExecutedDelta> _deltaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DailyLogService(
        IRepository<ItemDailyLog> logRepository,
        IRepository<BOQExecutedDelta> deltaRepository,
        IUnitOfWork unitOfWork)
    {
        _logRepository = logRepository;
        _deltaRepository = deltaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> IsDayClosedForItemAsync(int itemId, DateTime date)
    {
        return await _logRepository.AsQueryable()
            .AnyAsync(l => l.BOQItemId == itemId && l.LogDate.Date == date.Date && l.IsClosed);
    }

    public async Task<int> GetOrCreateDailyLogIdAsync(int itemId, DateTime logDate, int userId)
    {
        var log = await _logRepository.AsQueryable()
            .FirstOrDefaultAsync(l => l.BOQItemId == itemId && l.LogDate.Date == logDate.Date);

        if (log != null) return log.Id;

        var newLog = new ItemDailyLog
        {
            BOQItemId = itemId,
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
            .FirstOrDefaultAsync(l => l.BOQItemId == itemId && l.LogDate.Date == logDate.Date);

        if (log == null || log.IsClosed)
            return false;

        // 2. Calculate delta (example formula — adjust to your real business logic)
        // Here we assume DailyProgressPercentage is % of AgreedQuantity
        decimal deltaQty = 0m;

        if (request.DailyProgressPercentage > 0) // simple check (no HasValue needed)
        {
            // REPLACE THIS WITH REAL AgreedQuantity loading logic
            // Example: load from BOQMeasured (you may need to inject IRepository<BOQMeasured>)
            decimal assumedAgreedQty = 1000m; // ← TEMPORARY — load real value!
            deltaQty = (request.DailyProgressPercentage / 100m) * assumedAgreedQty;
        }

        // 3. Record delta (append-only — no direct update to ExecutedQuantity)
        var delta = new BOQExecutedDelta
        {
            BOQItemId = itemId,
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

        // 5. Commit
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReopenClosedDayAsync(int itemId, DateTime logDate, int userId, string reason, List<int>? notifyRoleIds)
    {
        var log = await _logRepository.AsQueryable()
            .FirstOrDefaultAsync(l => l.BOQItemId == itemId && l.LogDate.Date == logDate.Date);

        if (log == null || !log.IsClosed)
            return false;

        // Find associated delta and remove it
        var associatedDelta = await _deltaRepository.AsQueryable()
            .FirstOrDefaultAsync(d => d.BOQItemId == itemId && d.ReferenceId == log.Id && d.ChangeType == "DailyLog");
        
        if (associatedDelta != null)
        {
            await _deltaRepository.DeleteAsync(associatedDelta);
        }

        log.IsClosed = false;
        log.ClosedAt = null;
        log.ClosedByUserId = null;
        // logic to use reason and notifyRoleIds could be added here (e.g. Activity Log or Notifications)

        await _logRepository.UpdateAsync(log);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<List<DailyLogDto>> GetDailyLogHistoryAsync(int itemId)
    {
        var logs = await _logRepository.AsQueryable()
            .Include(l => l.ClosedByUser)
            .Where(l => l.BOQItemId == itemId)
            .OrderByDescending(l => l.LogDate)
            .ToListAsync();

        return logs.Select(l => new DailyLogDto(
            l.BOQItemId,
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
