using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardStatisticsService _dashboardStatisticsService;

    public DashboardController(IDashboardStatisticsService dashboardStatisticsService)
    {
        _dashboardStatisticsService = dashboardStatisticsService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStats>> GetDashboardStats()
    {
        var stats = await _dashboardStatisticsService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet("subscriptions")]
    public async Task<ActionResult<List<CompanySubscription>>> GetCompanySubscriptions()
    {
        var subscriptions = await _dashboardStatisticsService.GetCompanySubscriptionsAsync();
        return Ok(subscriptions);
    }

    [HttpGet("activities")]
    public async Task<ActionResult<List<RecentActivity>>> GetRecentActivities([FromQuery] int? limit = null)
    {
        var activities = await _dashboardStatisticsService.GetRecentActivitiesAsync(limit);
        return Ok(activities);
    }

    [HttpGet("super-admin-activities")]
    [Authorize(Policy = "SuperAdminOnly")]
    public async Task<ActionResult<List<SuperAdminActivity>>> GetSuperAdminActivities([FromQuery] int? limit = null)
    {
        var activities = await _dashboardStatisticsService.GetSuperAdminActivitiesAsync(limit);
        return Ok(activities);
    }
}
