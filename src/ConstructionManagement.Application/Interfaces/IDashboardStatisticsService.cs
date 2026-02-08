using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IDashboardStatisticsService
{
    Task<DashboardStats> GetDashboardStatsAsync();
    Task<List<CompanySubscription>> GetCompanySubscriptionsAsync();
    Task<List<RecentActivity>> GetRecentActivitiesAsync(int? limit = null);
    Task<List<SuperAdminActivity>> GetSuperAdminActivitiesAsync(int? limit = null);
}
