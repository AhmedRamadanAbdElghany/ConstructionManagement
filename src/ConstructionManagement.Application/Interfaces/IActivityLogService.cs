using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IActivityLogService
{
    Task LogActivityAsync(int projectId, string activityType, string action, string details, int? userId = null);
    Task<List<ActivityLogDto>> GetProjectActivitiesAsync(int projectId, int? limit = null);
}
