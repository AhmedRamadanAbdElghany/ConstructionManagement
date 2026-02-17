namespace ConstructionManagement.Application.DTOs;

public class DashboardStats
{
    public int ActiveProjects { get; set; }
    public int CompletedProjects { get; set; }
    public int DelayedProjects { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class SuperAdminStats
{
    public int TotalCompanies { get; set; }
    public int ActiveSubscriptions { get; set; }
    public decimal MonthlyRecurringRevenue { get; set; }
    public int PendingOnboardings { get; set; }
    public int NewCompaniesCount { get; set; }
}

public class CompanySubscription
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class RecentActivity
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // 'success', 'info', 'warning', 'danger'
    public string Message { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class SuperAdminActivity
{
    public int Id { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // 'success', 'danger'
    public DateTime Timestamp { get; set; }
}
