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
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<DashboardStatisticsService> _logger;

    public DashboardStatisticsService(
        IRepository<Project> projectRepository,
        IRepository<CompanyPackage> companyPackageRepository,
        IRepository<Company> companyRepository,
        INotificationRepository notificationRepository,
        ILogger<DashboardStatisticsService> logger)
    {
        _projectRepository = projectRepository ?? throw new ArgumentNullException(nameof(projectRepository));
        _companyPackageRepository = companyPackageRepository ?? throw new ArgumentNullException(nameof(companyPackageRepository));
        _companyRepository = companyRepository ?? throw new ArgumentNullException(nameof(companyRepository));
        _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
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

    public async Task<List<RecentActivity>> GetRecentActivitiesAsync(int userId, int? limit = null)
    {
        _logger.LogDebug("Fetching recent activities for user {UserId}. Limit: {Limit}", userId, limit);

        var notifications = await _notificationRepository.AsQueryable()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit ?? 5)
            .ToListAsync();

        var activities = notifications.Select(n => new RecentActivity
        {
            Id = n.Id,
            Type = MapNotificationTypeToActivityType(n.Type),
            Message = n.Title + ": " + n.Message, // Combining Title and Message for better context
            Time = GetTimeAgo(n.CreatedAt)
        }).ToList();

        _logger.LogDebug("Returning {Count} real activities", activities.Count);

        return activities;
    }

    private string MapNotificationTypeToActivityType(NotificationType type)
    {
        return type switch
        {
            NotificationType.ApprovalGranted => "success",
            NotificationType.PaymentReceived => "success",
            NotificationType.MilestoneAchieved => "success",
            
            NotificationType.ProjectDelay => "warning",
            NotificationType.ItemDelay => "warning",
            NotificationType.BudgetWarning => "warning",
            
            NotificationType.BudgetOverrun => "danger",
            NotificationType.ApprovalRejected => "danger",
            NotificationType.Escalation => "danger",
            
            _ => "info" // General, Info, PhotoReview, etc.
        };
    }

    private string GetTimeAgo(DateTime dateTime)
    {
        var timeSpan = DateTime.UtcNow - dateTime;

        if (timeSpan.TotalMinutes < 1)
            return "Just now";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes} minutes ago";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours} hours ago";
        if (timeSpan.TotalDays < 7)
            return $"{(int)timeSpan.TotalDays} days ago";
        
        return dateTime.ToString("MMM dd, yyyy");
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
