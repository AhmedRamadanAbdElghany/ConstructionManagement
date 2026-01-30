using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IDailyLogService
{
    Task<bool> IsDayClosedForItemAsync(int itemId, DateTime date);
    Task<int> GetOrCreateDailyLogIdAsync(int itemId, DateTime logDate, int userId);
    Task<bool> CloseDailyLogAsync(int itemId, DateTime logDate, int userId, CloseDailyLogRequest request);
    Task<List<DailyLogDto>> GetDailyLogHistoryAsync(int itemId); // توحيد الاسم هنا
}
