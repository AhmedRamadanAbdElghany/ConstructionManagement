using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IDashboardStatisticsService
{
    Task<DashboardStats> GetDashboardStatsAsync();
    Task<SuperAdminStats> GetSuperAdminStatsAsync();
    Task<List<CompanySubscription>> GetCompanySubscriptionsAsync();
    Task<List<RecentActivity>> GetRecentActivitiesAsync(int userId, int? limit = null);
    Task<List<SuperAdminActivity>> GetSuperAdminActivitiesAsync(int? limit = null);
}
