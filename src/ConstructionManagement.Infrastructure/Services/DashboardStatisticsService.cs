using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

public class DashboardStatisticsService : IDashboardStatisticsService
{
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<CompanyPackage> _companyPackageRepository;
    private readonly IRepository<Company> _companyRepository;
    private readonly ILogger<DashboardStatisticsService> _logger;

    public DashboardStatisticsService(
        IRepository<Project> projectRepository,
        IRepository<CompanyPackage> companyPackageRepository,
        IRepository<Company> companyRepository,
        ILogger<DashboardStatisticsService> logger)
    {
        _projectRepository = projectRepository ?? throw new ArgumentNullException(nameof(projectRepository));
        _companyPackageRepository = companyPackageRepository ?? throw new ArgumentNullException(nameof(companyPackageRepository));
        _companyRepository = companyRepository ?? throw new ArgumentNullException(nameof(companyRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        _logger.LogDebug("Fetching dashboard stats");

        var activeProjects = await _projectRepository.AsQueryable()
            .CountAsync(p => p.Status == "InProgress");

        var completedProjects = await _projectRepository.AsQueryable()
            .CountAsync(p => p.Status == "Completed");

        var delayedProjects = await _projectRepository.AsQueryable()
            .CountAsync(p => p.Status == "Delayed");

        var totalRevenue = await _projectRepository.AsQueryable()
            .Where(p => p.Status == "Completed")
            .SumAsync(p => p.Budget ?? 0);

        return new DashboardStats
        {
            ActiveProjects = activeProjects,
            CompletedProjects = completedProjects,
            DelayedProjects = delayedProjects,
            TotalRevenue = totalRevenue
        };
    }

    public async Task<List<CompanySubscription>> GetCompanySubscriptionsAsync()
    {
        _logger.LogDebug("Fetching company subscriptions");

        var subscriptions = await _companyPackageRepository.AsQueryable()
            .Include(cp => cp.Company)
            .Select(cp => new CompanySubscription
            {
                Id = cp.Id,
                CompanyName = cp.Company != null ? cp.Company.Name : string.Empty,
                PackageName = cp.Name,
                StartDate = DateTime.Now.AddYears(-1),
                EndDate = DateTime.Now.AddYears(1),
                Status = "Active",
                Amount = cp.Price
            })
            .OrderByDescending(cp => cp.StartDate)
            .ToListAsync();

        _logger.LogDebug("Found {Count} company subscriptions", subscriptions.Count);

        return subscriptions;
    }

    public async Task<List<RecentActivity>> GetRecentActivitiesAsync(int? limit = null)
    {
        _logger.LogDebug("Fetching recent activities. Limit: {Limit}", limit);

        // For now, return mock data since we don't have an Activity entity
        var activities = new List<RecentActivity>
        {
            new() { Id = 1, Type = "success", Message = "Payment received for Dubai Tower Project", Time = "2 minutes ago" },
            new() { Id = 2, Type = "info", Message = "New BOQ item added to Villa Complex", Time = "15 minutes ago" },
            new() { Id = 3, Type = "warning", Message = "Commercial Mall Cairo is behind schedule", Time = "1 hour ago" }
        };

        if (limit.HasValue && limit.Value > 0)
        {
            activities = activities.Take(limit.Value).ToList();
        }

        _logger.LogDebug("Returning {Count} recent activities", activities.Count);

        return activities;
    }

    public async Task<List<SuperAdminActivity>> GetSuperAdminActivitiesAsync(int? limit = null)
    {
        _logger.LogDebug("Fetching super admin activities. Limit: {Limit}", limit);

        // For now, return mock data since we don't have an Activity entity
        var activities = new List<SuperAdminActivity>
        {
            new() { Id = 1, Company = "Al-Massa Construction", Action = "Upgraded to Enterprise Tier", Time = "10 MIN AGO", Status = "success" },
            new() { Id = 2, Company = "BuildIt Solutions", Action = "Monthly payment processed successfully", Time = "1 HOUR AGO", Status = "success" },
            new() { Id = 3, Company = "Skyline Architects", Action = "Subscription canceled", Time = "3 HOURS AGO", Status = "danger" },
            new() { Id = 4, Company = "Urban Development", Action = "New organization onboarded", Time = "5 HOURS AGO", Status = "success" }
        };

        if (limit.HasValue && limit.Value > 0)
        {
            activities = activities.Take(limit.Value).ToList();
        }

        _logger.LogDebug("Returning {Count} super admin activities", activities.Count);

        return activities;
    }
}
