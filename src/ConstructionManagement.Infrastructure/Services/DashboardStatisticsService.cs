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
    private readonly IRepository<CompanyRequest> _companyRequestRepository;
    private readonly ILogger<DashboardStatisticsService> _logger;

    public DashboardStatisticsService(
        IRepository<Project> projectRepository,
        IRepository<CompanyPackage> companyPackageRepository,
        IRepository<Company> companyRepository,
        INotificationRepository notificationRepository,
        IRepository<CompanyRequest> companyRequestRepository,
        ILogger<DashboardStatisticsService> logger)
    {
        _projectRepository = projectRepository ?? throw new ArgumentNullException(nameof(projectRepository));
        _companyPackageRepository = companyPackageRepository ?? throw new ArgumentNullException(nameof(companyPackageRepository));
        _companyRepository = companyRepository ?? throw new ArgumentNullException(nameof(companyRepository));
        _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
        _companyRequestRepository = companyRequestRepository ?? throw new ArgumentNullException(nameof(companyRequestRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        _logger.LogDebug("Fetching dashboard stats");

        var activeProjects = await _projectRepository.AsQueryable()
            .CountAsync(p => p.Status == "InProgress" || p.Status == "Active" || p.Status == "????");

        var completedProjects = await _projectRepository.AsQueryable()
            .CountAsync(p => p.Status == "Completed" || p.IsClosed);

        var delayedProjects = await _projectRepository.AsQueryable()
            .CountAsync(p => p.Status == "Delayed");

        var totalRevenue = await _projectRepository.AsQueryable()
            .Where(p => p.Status == "Completed" || p.IsClosed)
            .SumAsync(p => p.Budget ?? 0);

        return new DashboardStats
        {
            ActiveProjects = activeProjects,
            CompletedProjects = completedProjects,
            DelayedProjects = delayedProjects,
            TotalRevenue = totalRevenue
        };
    }

    public async Task<SuperAdminStats> GetSuperAdminStatsAsync()
    {
        _logger.LogDebug("Fetching super admin dashboard stats");

        var totalCompanies = await _companyRepository.AsQueryable().CountAsync();
        var activeSubscriptions = await _companyRepository.AsQueryable().CountAsync(c => c.IsActive);
        
        // Sum of all active company package prices
        var mrr = await _companyPackageRepository.AsQueryable()
            .Include(cp => cp.Company)
            .Where(cp => cp.Company != null && cp.Company.IsActive)
            .SumAsync(cp => cp.Price);

        var pendingOnboardings = await _companyRequestRepository.AsQueryable()
            .CountAsync(cr => cr.Status == "Pending");

        return new SuperAdminStats
        {
            TotalCompanies = totalCompanies,
            ActiveSubscriptions = activeSubscriptions,
            MonthlyRecurringRevenue = mrr,
            PendingOnboardings = pendingOnboardings
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

    private static string GetTimeAgo(DateTime dateTime)
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
        _logger.LogDebug("Fetching real super admin activities. Limit: {Limit}", limit);

        // Fetch company requests as activities
        var requestsData = await _companyRequestRepository.AsQueryable()
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit ?? 5)
            .ToListAsync();

        var requests = requestsData.Select(r => new SuperAdminActivity
            {
                Id = r.Id,
                Company = r.CompanyName,
                Action = r.Status == "Pending" ? "New boarding request submitted" : $"Request {r.Status.ToLower()}",
                Time = GetTimeAgo(r.CreatedAt),
                Status = r.Status == "Pending" ? "info" : (r.Status == "Approved" ? "success" : "danger")
            })
            .ToList();

        // If we have very few requests, add new companies as activities
        if (requests.Count < (limit ?? 5))
        {
            var companiesData = await _companyRepository.AsQueryable()
                .OrderByDescending(c => c.CreatedAt)
                .Take((limit ?? 5) - requests.Count)
                .ToListAsync();

            var companies = companiesData.Select(c => new SuperAdminActivity
                {
                    Id = c.Id + 1000, // Offset for unique ID in this list
                    Company = c.Name,
                    Action = "Organization is now live",
                    Time = GetTimeAgo(c.CreatedAt),
                    Status = "success"
                })
                .ToList();
            
            requests.AddRange(companies);
        }

        return requests.OrderByDescending(a => a.Id).Take(limit ?? 5).ToList();
    }
}
