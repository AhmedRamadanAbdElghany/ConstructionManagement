using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IDashboardStatisticsService
{
    Task<DashboardStats> GetDashboardStatsAsync();
    Task<SystemAdminStats> GetSystemAdminStatsAsync();
    Task<List<CompanySubscription>> GetCompanySubscriptionsAsync();
    Task<List<RecentActivity>> GetRecentActivitiesAsync(int userId, int? limit = null);
    Task<List<RecentActivity>> GetProjectActivitiesAsync(int projectId, int? limit = null);
    Task<List<SystemAdminActivity>> GetSystemAdminActivitiesAsync(int? limit = null);
}
