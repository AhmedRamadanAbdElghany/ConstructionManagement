using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces
{
    /// <summary>
    /// Interface for Analytics and Reporting services
    /// </summary>
    public interface IAnalyticsService
    {
        #region Dashboard

        /// <summary>
        /// Get dashboard summary for the company
        /// </summary>
        Task<DashboardSummaryDto> GetDashboardSummaryAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null);

        #endregion

        #region Financial Analytics

        /// <summary>
        /// Get financial analytics for the company
        /// </summary>
        Task<FinancialAnalyticsDto> GetFinancialAnalyticsAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get project financial summaries
        /// </summary>
        Task<List<ProjectFinancialSummary>> GetProjectFinancialsAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get financial trends
        /// </summary>
        Task<List<FinancialTrendData>> GetFinancialTrendsAsync(int companyId, string period = "Monthly", int periods = 12, bool isCost = false);

        #endregion

        #region Resource Analytics

        /// <summary>
        /// Get resource analytics for the company
        /// </summary>
        Task<ResourceAnalyticsDto> GetResourceAnalyticsAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get resource utilization by project
        /// </summary>
        Task<List<ProjectResourceSummary>> GetProjectResourceUtilizationAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get worker performance metrics
        /// </summary>
        Task<List<WorkerPerformance>> GetWorkerPerformanceAsync(int companyId, int topN = 10, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get equipment utilization metrics
        /// </summary>
        Task<List<EquipmentPerformance>> GetEquipmentPerformanceAsync(int companyId, int topN = 10);

        #endregion

        #region KPI Analytics

        /// <summary>
        /// Get KPI dashboard data
        /// </summary>
        Task<KPIDashboardDto> GetKPIDashboardAsync(int companyId);

        /// <summary>
        /// Get all KPI definitions
        /// </summary>
        Task<List<KPIDefinitionDto>> GetKPIDefinitionsAsync(int companyId);

        /// <summary>
        /// Get KPI results for a specific definition
        /// </summary>
        Task<List<KPIResultDto>> GetKPIResultsAsync(int kpiDefinitionId, int periods = 12);

        /// <summary>
        /// Calculate and store KPI results
        /// </summary>
        Task CalculateAndStoreKPIResultsAsync(int companyId);

        #endregion

        #region Chart Data

        /// <summary>
        /// Get chart data for dashboard widgets
        /// </summary>
        Task<ChartDataDto> GetChartDataAsync(int companyId, string chartType, string dataSource, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get revenue chart data
        /// </summary>
        Task<ChartDataDto> GetRevenueChartDataAsync(int companyId, int periods = 12);

        /// <summary>
        /// Get project progress chart data
        /// </summary>
        Task<ChartDataDto> GetProjectProgressChartDataAsync(int companyId);

        /// <summary>
        /// Get resource utilization chart data
        /// </summary>
        Task<ChartDataDto> GetResourceUtilizationChartDataAsync(int companyId);

        /// <summary>
        /// Get cost breakdown chart data
        /// </summary>
        Task<ChartDataDto> GetCostBreakdownChartDataAsync(int companyId);

        #endregion

        #region Snapshots

        /// <summary>
        /// Get analytics snapshot for a specific date
        /// </summary>
        Task<AnalyticsSnapshot?> GetSnapshotAsync(int companyId, DateTime date);

        /// <summary>
        /// Create analytics snapshot
        /// </summary>
        Task<AnalyticsSnapshot> CreateSnapshotAsync(int companyId, DateTime snapshotDate);

        /// <summary>
        /// Get snapshot history
        /// </summary>
        Task<List<AnalyticsSnapshot>> GetSnapshotHistoryAsync(int companyId, string snapshotType = "Monthly", int count = 12);

        #endregion

        #region Report Definitions

        /// <summary>
        /// Get all report definitions for the company
        /// </summary>
        Task<List<ReportDefinitionDto>> GetReportDefinitionsAsync(int companyId);

        /// <summary>
        /// Get report definition by ID
        /// </summary>
        Task<ReportDefinitionDto?> GetReportDefinitionAsync(int reportId);

        /// <summary>
        /// Create a new report definition
        /// </summary>
        Task<ReportDefinitionDto> CreateReportDefinitionAsync(int companyId, CreateReportDefinitionRequest request);

        /// <summary>
        /// Update a report definition
        /// </summary>
        Task<ReportDefinitionDto?> UpdateReportDefinitionAsync(int reportId, UpdateReportDefinitionRequest request);

        /// <summary>
        /// Delete a report definition
        /// </summary>
        Task<bool> DeleteReportDefinitionAsync(int reportId);

        #endregion

        #region Report Execution

        /// <summary>
        /// Execute a report and return data
        /// </summary>
        Task<ReportDataResult> ExecuteReportAsync(int companyId, ExecuteReportRequest request);

        /// <summary>
        /// Execute report and export to file
        /// </summary>
        Task<ExportResult> ExecuteAndExportReportAsync(int companyId, ExecuteReportRequest request);

        /// <summary>
        /// Get report execution history
        /// </summary>
        Task<List<ReportExecutionDto>> GetReportExecutionHistoryAsync(int reportDefinitionId, int count = 10);

        #endregion

        #region Resource Utilization

        /// <summary>
        /// Get resource utilization data
        /// </summary>
        Task<List<ResourceUtilizationDto>> GetResourceUtilizationAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Record resource utilization
        /// </summary>
        Task<ResourceUtilizationDto> RecordResourceUtilizationAsync(int companyId, CreateResourceUtilizationRequest request);

        #endregion

        #region Analytics Snapshots

        /// <summary>
        /// Get analytics snapshots
        /// </summary>
        Task<List<AnalyticsSnapshotDto>> GetAnalyticsSnapshotsAsync(int companyId, int count = 12);

        #endregion
    }

    #region Additional DTOs

    public class AnalyticsSnapshotDto
    {
        public int Id { get; set; }
        public int? CompanyId { get; set; }
        public int? ProjectId { get; set; }
        public string SnapshotType { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public DateTime SnapshotDate { get; set; }
        public decimal ProjectHealthScore { get; set; }
        public int TotalProjects { get; set; }
        public int ActiveProjects { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalCosts { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal ProfitMargin { get; set; }
        public decimal LaborUtilization { get; set; }
        public decimal EquipmentUtilization { get; set; }
        public decimal AverageQualityScore { get; set; }
        public int TotalDefects { get; set; }
        public int TotalIncidents { get; set; }
    }

    #endregion
}
