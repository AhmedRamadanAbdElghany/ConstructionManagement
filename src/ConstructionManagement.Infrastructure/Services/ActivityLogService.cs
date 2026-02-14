using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IRepository<ActivityLog> _activityLogRepository;
    private readonly IRepository<User> _userRepository;

    public ActivityLogService(
        IRepository<ActivityLog> activityLogRepository,
        IRepository<User> userRepository)
    {
        _activityLogRepository = activityLogRepository;
        _userRepository = userRepository;
    }

    public async Task LogActivityAsync(int projectId, string activityType, string action, string details, int? userId = null)
    {
        var userName = "System";
        if (userId.HasValue && userId.Value > 0)
        {
            var user = await _userRepository.GetByIdAsync(userId.Value);
            if (user != null)
            {
                userName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(userName)) userName = user.Username;
            }
        }

        var log = new ActivityLog
        {
            ProjectId = projectId,
            UserId = userId == 0 ? null : userId,
            UserName = userName,
            ActivityType = activityType,
            Action = action,
            Details = details
        };

        await _activityLogRepository.AddAsync(log);
    }

    public async Task<List<ActivityLogDto>> GetProjectActivitiesAsync(int projectId, int? limit = null)
    {
        var query = _activityLogRepository.AsQueryable()
            .Where(l => l.ProjectId == projectId)
            .OrderByDescending(l => l.CreatedAt);

        var finalQuery = limit.HasValue ? query.Take(limit.Value) : query;

        return await finalQuery.Select(l => new ActivityLogDto
        {
            Id = l.Id,
            ProjectId = l.ProjectId,
            UserId = l.UserId,
            UserName = l.UserName,
            ActivityType = l.ActivityType,
            Action = l.Action,
            Details = l.Details,
            CreatedAt = l.CreatedAt
        }).ToListAsync();
    }
}
