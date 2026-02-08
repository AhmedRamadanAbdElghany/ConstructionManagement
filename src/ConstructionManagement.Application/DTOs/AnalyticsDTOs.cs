using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Application.DTOs
{
    #region Dashboard DTOs

    public class DashboardSummaryDto
    {
        // Project Health
        public int TotalProjects { get; set; }
        public int ActiveProjects { get; set; }
        public int CompletedProjects { get; set; }
        public int OnHoldProjects { get; set; }
        public int DelayedProjects { get; set; }
        public decimal AverageProgress { get; set; }
        public decimal ProjectHealthScore { get; set; }

        // Financial Summary
        public decimal TotalRevenue { get; set; }
        public decimal TotalCosts { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal ProfitMargin { get; set; }
        public decimal PendingInvoices { get; set; }
        public decimal OverduePayments { get; set; }

        // Resource Summary
        public decimal LaborUtilization { get; set; }
        public decimal EquipmentUtilization { get; set; }
        public int ActiveWorkers { get; set; }
        public int OpenPositions { get; set; }

        // Quality & Safety Summary
        public decimal QualityScore { get; set; }
        public int OpenDefects { get; set; }
        public int SafetyIncidents { get; set; }
        public decimal SafetyScore { get; set; }

        // Trends
        public List<TrendDataPoint>? RevenueTrend { get; set; }
        public List<TrendDataPoint>? ProgressTrend { get; set; }
        public List<TrendDataPoint>? CostTrend { get; set; }
    }

    public class TrendDataPoint
    {
        public string Period { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
        public string? Label { get; set; }
    }

    #endregion

    #region Financial Analytics DTOs

    public class FinancialAnalyticsDto
    {
        // Summary
        public decimal TotalRevenue { get; set; }
        public decimal TotalCosts { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal NetProfit { get; set; }
        public decimal ProfitMargin { get; set; }
        public decimal OperatingMargin { get; set; }

        // Revenue Breakdown
        public decimal InvoicedAmount { get; set; }
        public decimal CollectedAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal OverdueAmount { get; set; }
        public decimal CollectionRate { get; set; }

        // Cost Breakdown
        public decimal LaborCosts { get; set; }
        public decimal MaterialCosts { get; set; }
        public decimal EquipmentCosts { get; set; }
        public decimal SubcontractorCosts { get; set; }
        public decimal OverheadCosts { get; set; }

        // By Project
        public List<ProjectFinancialSummary>? ProjectSummaries { get; set; }

        // Trends
        public List<FinancialTrendData>? MonthlyRevenue { get; set; }
        public List<FinancialTrendData>? MonthlyCosts { get; set; }
        public List<FinancialTrendData>? MonthlyProfit { get; set; }

        // Ratios
        public decimal CurrentRatio { get; set; }
        public decimal DebtToEquity { get; set; }
        public decimal ReturnOnInvestment { get; set; }
    }

    public class ProjectFinancialSummary
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        public decimal ActualCost { get; set; }
        public decimal Variance { get; set; }
        public decimal Invoiced { get; set; }
        public decimal Collected { get; set; }
        public decimal Pending { get; set; }
        public decimal Revenue { get; set; }
        public decimal Profit { get; set; }
        public decimal ProfitMargin { get; set; }
        public decimal CostPerformanceIndex { get; set; }
        public decimal SchedulePerformanceIndex { get; set; }
    }

    public class FinancialTrendData
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Cumulative { get; set; }
        public decimal PercentageChange { get; set; }
    }

    #endregion

    #region Resource Analytics DTOs

    public class ResourceAnalyticsDto
    {
        // Labor Analytics
        public int TotalWorkers { get; set; }
        public int ActiveWorkers { get; set; }
        public decimal TotalLaborHours { get; set; }
        public decimal AverageUtilization { get; set; }
        public decimal ProductivityIndex { get; set; }
        public decimal LaborCostPerHour { get; set; }
        public decimal TotalLaborCost { get; set; }

        // Equipment Analytics
        public int TotalEquipment { get; set; }
        public int ActiveEquipment { get; set; }
        public decimal EquipmentUtilization { get; set; }
        public decimal EquipmentCost { get; set; }
        public decimal MaintenanceCost { get; set; }

        // By Project
        public List<ProjectResourceSummary>? ProjectResources { get; set; }

        // Trends
        public List<ResourceTrendData>? UtilizationTrend { get; set; }
        public List<ResourceTrendData>? ProductivityTrend { get; set; }

        // Top Performers
        public List<WorkerPerformance>? TopWorkers { get; set; }
        public List<EquipmentPerformance>? TopEquipment { get; set; }
    }

    public class ProjectResourceSummary
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int WorkerCount { get; set; }
        public decimal LaborHours { get; set; }
        public decimal UtilizationRate { get; set; }
        public decimal LaborCost { get; set; }
        public int EquipmentCount { get; set; }
        public decimal EquipmentHours { get; set; }
        public decimal EquipmentUtilization { get; set; }
        public decimal EquipmentCost { get; set; }
    }

    public class ResourceTrendData
    {
        public DateTime Date { get; set; }
        public string Period { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public decimal Target { get; set; }
    }

    public class WorkerPerformance
    {
        public string WorkerId { get; set; } = string.Empty;
        public string WorkerName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int HoursWorked { get; set; }
        public decimal Productivity { get; set; }
        public decimal QualityScore { get; set; }
        public int TasksCompleted { get; set; }
    }

    public class EquipmentPerformance
    {
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal UtilizationRate { get; set; }
        public int OperatingHours { get; set; }
        public int MaintenanceHours { get; set; }
        public int DowntimeHours { get; set; }
        public decimal CostPerHour { get; set; }
    }

    #endregion

    #region KPI DTOs

    public class KPIDashboardDto
    {
        public List<KPIDefinitionDto>? KPIs { get; set; }
        public List<KPIResultDto>? RecentResults { get; set; }
        public List<KPISummaryByCategory>? CategorySummary { get; set; }
        public List<KPIAlertDto>? Alerts { get; set; }
    }

    public class KPIDefinitionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string MetricType { get; set; } = string.Empty;
        public decimal CurrentValue { get; set; }
        public string? TargetValue { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Variance { get; set; }
        public string Trend { get; set; } = string.Empty; // Up, Down, Stable
        public string DisplayFormat { get; set; } = string.Empty;
        public int DisplayPrecision { get; set; }
    }

    public class KPIResultDto
    {
        public int Id { get; set; }
        public int KPIDefinitionId { get; set; }
        public string KPIName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
        public string? TargetValue { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Variance { get; set; }
    }

    public class KPISummaryByCategory
    {
        public string Category { get; set; } = string.Empty;
        public int TotalKPIs { get; set; }
        public int OnTarget { get; set; }
        public int Warning { get; set; }
        public int Critical { get; set; }
        public decimal AverageValue { get; set; }
        public decimal AverageTarget { get; set; }
    }

    public class KPIAlertDto
    {
        public int Id { get; set; }
        public int KPIDefinitionId { get; set; }
        public string KPIName { get; set; } = string.Empty;
        public string AlertType { get; set; } = string.Empty; // Warning, Critical
        public string Message { get; set; } = string.Empty;
        public decimal CurrentValue { get; set; }
        public string Threshold { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    #endregion

    #region Report DTOs

    public class ReportDefinitionDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public bool IsScheduled { get; set; }
        public string? ScheduleFrequency { get; set; }
        public DateTime? LastRunAt { get; set; }
        public int RunCount { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateReportDefinitionRequest
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ReportType { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        public string Configuration { get; set; } = string.Empty;
        public string Columns { get; set; } = string.Empty;
        public string Filters { get; set; } = string.Empty;
        public string GroupBy { get; set; } = string.Empty;
        public string SortBy { get; set; } = string.Empty;
        public string SortOrder { get; set; } = "Asc";
        public bool IsPublic { get; set; }
        public bool IsScheduled { get; set; }
        public string? ScheduleFrequency { get; set; }
        public string? ScheduleCron { get; set; }
    }

    public class UpdateReportDefinitionRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        public string Configuration { get; set; } = string.Empty;
        public string Columns { get; set; } = string.Empty;
        public string Filters { get; set; } = string.Empty;
        public string GroupBy { get; set; } = string.Empty;
        public string SortBy { get; set; } = string.Empty;
        public string SortOrder { get; set; } = "Asc";
        public bool IsPublic { get; set; }
        public bool IsScheduled { get; set; }
        public string? ScheduleFrequency { get; set; }
        public string? ScheduleCron { get; set; }
    }

    public class ExecuteReportRequest
    {
        [Required]
        public int ReportDefinitionId { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Parameters { get; set; } = string.Empty;
        public string Format { get; set; } = "JSON"; // JSON, PDF, Excel, CSV
        public int? Page { get; set; }
        public int? PageSize { get; set; }
    }

    public class ReportExecutionDto
    {
        public int Id { get; set; }
        public int ReportDefinitionId { get; set; }
        public string ReportName { get; set; } = string.Empty;
        public string ExecutedBy { get; set; } = string.Empty;
        public DateTime ExecutedAt { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int RowCount { get; set; }
        public long ExecutionTimeMs { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public string? FilePath { get; set; }
        public string? FileSize { get; set; }
        public string Format { get; set; } = string.Empty;
    }

    public class ReportDataResult
    {
        public List<Dictionary<string, object>>? Data { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public long ExecutionTimeMs { get; set; }
        public List<ReportColumnInfo>? Columns { get; set; }
    }

    public class ReportColumnInfo
    {
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
        public bool IsNullable { get; set; }
        public bool IsVisible { get; set; }
        public int SortOrder { get; set; }
        public string? Format { get; set; }
        public int? Width { get; set; }
    }

    public class ResourceUtilizationDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public string ResourceType { get; set; } = string.Empty;
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
    }

    public class CreateResourceUtilizationRequest
    {
        public int? ProjectId { get; set; }
        public string ResourceType { get; set; } = string.Empty;
        public string ResourceId { get; set; } = string.Empty;
        public string ResourceName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal PlannedHours { get; set; }
        public decimal ActualHours { get; set; }
        public decimal CostPlanned { get; set; }
        public decimal CostActual { get; set; }
        public string? Notes { get; set; }
    }

    #endregion

    #region Chart Data DTOs

    public class ChartDataDto
    {
        public string ChartType { get; set; } = string.Empty; // Bar, Line, Pie, Doughnut, Area
        public string Title { get; set; } = string.Empty;
        public List<ChartDataset>? Datasets { get; set; }
        public List<ChartLabel>? Labels { get; set; }
        public ChartOptions? Options { get; set; }
    }

    public class ChartDataset
    {
        public string Label { get; set; } = string.Empty;
        public List<decimal>? Data { get; set; }
        public string? BackgroundColor { get; set; }
        public string? BorderColor { get; set; }
        public int BorderWidth { get; set; }
        public bool Fill { get; set; }
        public List<string>? BackgroundColors { get; set; }
        public List<string>? BorderColors { get; set; }
    }

    public class ChartLabel
    {
        public string Label { get; set; } = string.Empty;
        public string? Value { get; set; }
    }

    public class ChartOptions
    {
        public bool Responsive { get; set; } = true;
        public bool MaintainAspectRatio { get; set; } = true;
        public string? LegendPosition { get; set; }
        public bool ShowLegend { get; set; } = true;
        public bool ShowLabels { get; set; } = true;
        public string? XAxisTitle { get; set; }
        public string? YAxisTitle { get; set; }
        public decimal? YAxisMin { get; set; }
        public decimal? YAxisMax { get; set; }
    }

    #endregion

    #region Export DTOs

    public class ExportRequest
    {
        [Required]
        public string Format { get; set; } = string.Empty; // PDF, Excel, CSV

        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public List<Dictionary<string, object>>? Data { get; set; }
        public List<ExportColumn>? Columns { get; set; }
        public string? Template { get; set; }
        public bool IncludeHeaders { get; set; } = true;
        public bool IncludeFooters { get; set; } = true;
        public string? Orientation { get; set; } // Portrait, Landscape
        public string? PaperSize { get; set; } // A4, Letter
        public string? Margin { get; set; }
        public string? LogoPath { get; set; }
        public string? CompanyName { get; set; }
    }

    public class ExportColumn
    {
        public string Field { get; set; } = string.Empty;
        public string Header { get; set; } = string.Empty;
        public string? Format { get; set; }
        public int Width { get; set; }
        public string? Alignment { get; set; } // Left, Center, Right
        public bool Bold { get; set; }
        public string? BackgroundColor { get; set; }
        public string? TextColor { get; set; }
    }

    public class ExportResult
    {
        public bool Success { get; set; }
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
        public string? ContentType { get; set; }
        public byte[]? FileContent { get; set; }
        public long FileSize { get; set; }
        public string? ErrorMessage { get; set; }
    }

    #endregion

    #region Analytics Filter DTOs

    public class AnalyticsFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int>? ProjectIds { get; set; }
        public List<int>? PhaseIds { get; set; }
        public List<int>? CategoryIds { get; set; }
        public string? GroupBy { get; set; }
        public string? SortBy { get; set; }
        public string SortOrder { get; set; } = "Desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    #endregion
}
