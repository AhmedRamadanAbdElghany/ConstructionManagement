using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class DailyLogService : IDailyLogService
{
    private readonly IRepository<ItemDailyLog> _logRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DailyLogService(IRepository<ItemDailyLog> logRepository, IUnitOfWork unitOfWork)
    {
        _logRepository = logRepository;
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
        var log = await _logRepository.AsQueryable()
            .FirstOrDefaultAsync(l => l.BOQItemId == itemId && l.LogDate.Date == logDate.Date);

        if (log == null || log.IsClosed) return false;

        log.IsClosed = true;
        log.ClosedByUserId = userId;
        log.ClosedAt = DateTime.UtcNow;
        log.DailyProgressPercentage = request.DailyProgressPercentage;
        log.ProgressNotes = request.ProgressNotes;
        log.ClosingNotes = request.ClosingNotes;

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