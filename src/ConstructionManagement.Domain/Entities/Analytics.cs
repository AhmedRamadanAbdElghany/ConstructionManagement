namespace ConstructionManagement.Domain.Entities
{
    /// <summary>
    /// Custom report definitions
    /// </summary>
    public class ReportDefinition : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty; // Financial, Project, Resource, Quality, Custom
        public string Category { get; set; } = string.Empty; // Dashboard, Operational, Executive, Compliance
        public string Configuration { get; set; } = string.Empty; // JSON report configuration
        public string Columns { get; set; } = string.Empty; // JSON array of columns
        public string Filters { get; set; } = string.Empty; // JSON filter definitions
        public string GroupBy { get; set; } = string.Empty;
        public string SortBy { get; set; } = string.Empty;
        public string SortOrder { get; set; } = "Asc";
        public bool IsPublic { get; set; }
        public bool IsScheduled { get; set; }
        public string? ScheduleFrequency { get; set; } // Daily, Weekly, Monthly
        public string? ScheduleCron { get; set; }
        public DateTime? LastRunAt { get; set; }
        public int RunCount { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual ICollection<ReportExecution> Executions { get; set; } = new List<ReportExecution>();
    }

    /// <summary>
    /// Report execution history
    /// </summary>
    public class ReportExecution : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int ReportDefinitionId { get; set; }
        public string ExecutedBy { get; set; } = string.Empty;
        public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Parameters { get; set; } = string.Empty; // JSON parameters
        public int RowCount { get; set; }
        public long ExecutionTimeMs { get; set; }
        public string Status { get; set; } = string.Empty; // Success, Failed, Timeout
        public string? ErrorMessage { get; set; }
        public string? FilePath { get; set; }
        public string? FileSize { get; set; }
        public string Format { get; set; } = string.Empty; // PDF, Excel, CSV, HTML

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual ReportDefinition? ReportDefinition { get; set; }
    }

    /// <summary>
    /// Dashboard widget configurations
    /// </summary>
    public class DashboardWidget : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string WidgetType { get; set; } = string.Empty; // Chart, Metric, Table, Map, Gauge
        public string Title { get; set; } = string.Empty;
        public string DataSource { get; set; } = string.Empty; // Analytics endpoint
        public string Configuration { get; set; } = string.Empty; // JSON widget config
        public string Position { get; set; } = string.Empty; // JSON position {x, y, w, h}
        public int SortOrder { get; set; }
        public bool IsVisible { get; set; } = true;
        public string? DashboardId { get; set; } // For multiple dashboards
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Company? Company { get; set; }
    }

    /// <summary>
    /// Analytics snapshots for point-in-time reporting
    /// </summary>
    public class AnalyticsSnapshot : ICompanyEntity, IProjectEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public string SnapshotType { get; set; } = string.Empty; // Daily, Weekly, Monthly, Quarterly
        public string Period { get; set; } = string.Empty; // "2024-01" or date range
        public DateTime SnapshotDate { get; set; }
        
        // Project Health Metrics
        public decimal ProjectHealthScore { get; set; }
        public int TotalProjects { get; set; }
        public int ActiveProjects { get; set; }
        public int CompletedProjects { get; set; }
        public int OnHoldProjects { get; set; }
        public int DelayedProjects { get; set; }
        public decimal AverageProgress { get; set; }
        public decimal ScheduleVariance { get; set; }
        
        // Financial Metrics
        public decimal TotalRevenue { get; set; }
        public decimal TotalCosts { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal ProfitMargin { get; set; }
        public decimal TotalInvoiced { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal PendingPayments { get; set; }
        public decimal OverduePayments { get; set; }
        
        // Resource Metrics
        public decimal LaborUtilization { get; set; }
        public decimal EquipmentUtilization { get; set; }
        public int TotalTeamMembers { get; set; }
        public int ActiveWorkers { get; set; }
        public int OpenPositions { get; set; }
        
        // Quality Metrics
        public decimal AverageQualityScore { get; set; }
        public int TotalInspections { get; set; }
        public int PassedInspections { get; set; }
        public int TotalDefects { get; set; }
        public int OpenDefects { get; set; }
        public int ResolvedDefects { get; set; }
        
        // Safety Metrics
        public int TotalIncidents { get; set; }
        public int SafetyViolations { get; set; }
        public decimal IncidentRate { get; set; }
        public int LostTimeIncidents { get; set; }
        public int SafetyTrainingCompleted { get; set; }
        
        // Additional KPIs
        public string KPIs { get; set; } = string.Empty; // JSON additional KPIs
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
    }

    /// <summary>
    /// KPI definitions and targets
    /// </summary>
    public class KPIDefinition : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Financial, Operational, Quality, Safety
        public string MetricType { get; set; } = string.Empty; // Percentage, Currency, Count, Duration
        public string Formula { get; set; } = string.Empty;
        public string DataSource { get; set; } = string.Empty;
        public string? TargetValue { get; set; }
        public string TargetOperator { get; set; } = string.Empty; // GreaterThan, LessThan, Equals
        public string? WarningThreshold { get; set; }
        public string? CriticalThreshold { get; set; }
        public string DisplayFormat { get; set; } = string.Empty; // Currency, Percent, Number
        public int DisplayPrecision { get; set; }
        public bool IsActive { get; set; } = true;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual ICollection<KPIResult> Results { get; set; } = new List<KPIResult>();
    }

    /// <summary>
    /// KPI calculation results over time
    /// </summary>
    public class KPIResult : ICompanyEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int KPIDefinitionId { get; set; }
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
        public string? TargetValue { get; set; }
        public string Status { get; set; } = string.Empty; // OnTarget, Warning, Critical
        public string? Variance { get; set; }
        public string? Notes { get; set; }
        public string CalculatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual KPIDefinition? KPIDefinition { get; set; }
    }

    /// <summary>
    /// Resource utilization tracking
    /// </summary>
    public class ResourceUtilization : ICompanyEntity, IProjectEntity
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public string ResourceType { get; set; } = string.Empty; // Labor, Equipment, Material
        public string ResourceId { get; set; } = string.Empty;
        public string ResourceName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal PlannedHours { get; set; }
        public decimal ActualHours { get; set; }
        public decimal UtilizationRate { get; set; }
        public decimal ProductivityIndex { get; set; }
        public decimal CostPlanned { get; set; }
        public decimal CostActual { get; set; }
        public decimal Efficiency { get; set; }
        public string? Notes { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Company? Company { get; set; }
        public virtual Project? Project { get; set; }
    }
}
