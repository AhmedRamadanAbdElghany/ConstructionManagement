using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(
            IAnalyticsService analyticsService,
            ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        #region Dashboard

        /// <summary>
        /// Get dashboard summary with key metrics
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var summary = await _analyticsService.GetDashboardSummaryAsync(companyId, startDate, endDate);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard summary");
                return StatusCode(500, new { message = "An error occurred while fetching dashboard data" });
            }
        }

        #endregion

        #region Financial Analytics

        /// <summary>
        /// Get financial analytics and metrics
        /// </summary>
        [HttpGet("financial")]
        public async Task<ActionResult<FinancialAnalyticsDto>> GetFinancialAnalytics(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var analytics = await _analyticsService.GetFinancialAnalyticsAsync(companyId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial analytics");
                return StatusCode(500, new { message = "An error occurred while fetching financial data" });
            }
        }

        /// <summary>
        /// Get project financial summaries
        /// </summary>
        [HttpGet("financial/project-summaries")]
        public async Task<ActionResult<List<ProjectFinancialSummary>>> GetProjectFinancialSummaries(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var summaries = await _analyticsService.GetProjectFinancialsAsync(companyId, startDate, endDate);
                return Ok(summaries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project financial summaries");
                return StatusCode(500, new { message = "An error occurred while fetching project financials" });
            }
        }

        /// <summary>
        /// Get financial trends
        /// </summary>
        [HttpGet("financial/trends")]
        public async Task<ActionResult<List<FinancialTrendData>>> GetFinancialTrends(
            CancellationToken cancellationToken,
            [FromQuery] string period = "Monthly",
            [FromQuery] int periods = 12,
            [FromQuery] bool isCost = false)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var trends = await _analyticsService.GetFinancialTrendsAsync(companyId, period, periods, isCost);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial trends");
                return StatusCode(500, new { message = "An error occurred while fetching financial trends" });
            }
        }

        #endregion

        #region Resource Analytics

        /// <summary>
        /// Get resource analytics
        /// </summary>
        [HttpGet("resources")]
        public async Task<ActionResult<ResourceAnalyticsDto>> GetResourceAnalytics(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var analytics = await _analyticsService.GetResourceAnalyticsAsync(companyId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource analytics");
                return StatusCode(500, new { message = "An error occurred while fetching resource data" });
            }
        }

        /// <summary>
        /// Get project resource utilization
        /// </summary>
        [HttpGet("resources/project-utilization")]
        public async Task<ActionResult<List<ProjectResourceSummary>>> GetProjectResourceUtilization(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var utilization = await _analyticsService.GetProjectResourceUtilizationAsync(companyId, startDate, endDate);
                return Ok(utilization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project resource utilization");
                return StatusCode(500, new { message = "An error occurred while fetching resource utilization" });
            }
        }

        /// <summary>
        /// Get top worker performance
        /// </summary>
        [HttpGet("resources/worker-performance")]
        public async Task<ActionResult<List<WorkerPerformance>>> GetWorkerPerformance(
            CancellationToken cancellationToken,
            [FromQuery] int topN = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var performance = await _analyticsService.GetWorkerPerformanceAsync(companyId, topN, startDate, endDate);
                return Ok(performance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting worker performance");
                return StatusCode(500, new { message = "An error occurred while fetching worker performance" });
            }
        }

        /// <summary>
        /// Get equipment performance
        /// </summary>
        [HttpGet("resources/equipment-performance")]
        public async Task<ActionResult<List<EquipmentPerformance>>> GetEquipmentPerformance(
            CancellationToken cancellationToken,
            [FromQuery] int topN = 10)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var performance = await _analyticsService.GetEquipmentPerformanceAsync(companyId, topN);
                return Ok(performance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting equipment performance");
                return StatusCode(500, new { message = "An error occurred while fetching equipment performance" });
            }
        }

        #endregion

        #region KPI Analytics

        /// <summary>
        /// Get KPI dashboard
        /// </summary>
        [HttpGet("kpi")]
        public async Task<ActionResult<KPIDashboardDto>> GetKPIDashboard(CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var dashboard = await _analyticsService.GetKPIDashboardAsync(companyId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPI dashboard");
                return StatusCode(500, new { message = "An error occurred while fetching KPI data" });
            }
        }

        /// <summary>
        /// Get all KPI definitions
        /// </summary>
        [HttpGet("kpi/definitions")]
        public async Task<ActionResult<List<KPIDefinitionDto>>> GetKPIDefinitions(CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var definitions = await _analyticsService.GetKPIDefinitionsAsync(companyId);
                return Ok(definitions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPI definitions");
                return StatusCode(500, new { message = "An error occurred while fetching KPI definitions" });
            }
        }

        /// <summary>
        /// Get KPI results for a specific definition
        /// </summary>
        [HttpGet("kpi/{kpiDefinitionId}/results")]
        public async Task<ActionResult<List<KPIResultDto>>> GetKPIResults(
            int kpiDefinitionId,
            CancellationToken cancellationToken,
            [FromQuery] int periods = 12)
        {
            try
            {
                var results = await _analyticsService.GetKPIResultsAsync(kpiDefinitionId, periods);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPI results");
                return StatusCode(500, new { message = "An error occurred while fetching KPI results" });
            }
        }

        /// <summary>
        /// Calculate and store KPI results
        /// </summary>
        [HttpPost("kpi/calculate")]
        public async Task<IActionResult> CalculateKPIResults(CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                await _analyticsService.CalculateAndStoreKPIResultsAsync(companyId);
                return Ok(new { message = "KPI calculation completed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating KPI results");
                return StatusCode(500, new { message = "An error occurred while calculating KPI results" });
            }
        }

        #endregion

        #region Chart Data

        /// <summary>
        /// Get chart data for visualizations
        /// </summary>
        [HttpGet("charts/{chartType}")]
        public async Task<ActionResult<ChartDataDto>> GetChartData(
            string chartType,
            [FromQuery] string dataSource,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var chartData = await _analyticsService.GetChartDataAsync(companyId, chartType, dataSource, startDate, endDate);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chart data for {ChartType}", chartType);
                return StatusCode(500, new { message = $"An error occurred while fetching chart data for {chartType}" });
            }
        }

        /// <summary>
        /// Get revenue chart data
        /// </summary>
        [HttpGet("charts/revenue")]
        public async Task<ActionResult<ChartDataDto>> GetRevenueChartData(
            CancellationToken cancellationToken,
            [FromQuery] int periods = 12)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var chartData = await _analyticsService.GetRevenueChartDataAsync(companyId, periods);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue chart data");
                return StatusCode(500, new { message = "An error occurred while fetching revenue chart data" });
            }
        }

        /// <summary>
        /// Get project progress chart data
        /// </summary>
        [HttpGet("charts/project-progress")]
        public async Task<ActionResult<ChartDataDto>> GetProjectProgressChartData(CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var chartData = await _analyticsService.GetProjectProgressChartDataAsync(companyId);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project progress chart data");
                return StatusCode(500, new { message = "An error occurred while fetching project progress chart data" });
            }
        }

        /// <summary>
        /// Get resource utilization chart data
        /// </summary>
        [HttpGet("charts/resource-utilization")]
        public async Task<ActionResult<ChartDataDto>> GetResourceUtilizationChartData(CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var chartData = await _analyticsService.GetResourceUtilizationChartDataAsync(companyId);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource utilization chart data");
                return StatusCode(500, new { message = "An error occurred while fetching resource utilization chart data" });
            }
        }

        /// <summary>
        /// Get cost breakdown chart data
        /// </summary>
        [HttpGet("charts/cost-breakdown")]
        public async Task<ActionResult<ChartDataDto>> GetCostBreakdownChartData(CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var chartData = await _analyticsService.GetCostBreakdownChartDataAsync(companyId);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cost breakdown chart data");
                return StatusCode(500, new { message = "An error occurred while fetching cost breakdown chart data" });
            }
        }

        #endregion

        #region Snapshots

        /// <summary>
        /// Get analytics snapshot for a specific date
        /// </summary>
        [HttpGet("snapshots/{date}")]
        public async Task<ActionResult<AnalyticsSnapshot?>> GetSnapshot(DateTime date, CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var snapshot = await _analyticsService.GetSnapshotAsync(companyId, date);
                return Ok(snapshot);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting snapshot for {Date}", date);
                return StatusCode(500, new { message = "An error occurred while fetching snapshot" });
            }
        }

        /// <summary>
        /// Create analytics snapshot
        /// </summary>
        [HttpPost("snapshots")]
        public async Task<ActionResult<AnalyticsSnapshot>> CreateSnapshot(
            [FromBody] DateTime snapshotDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var snapshot = await _analyticsService.CreateSnapshotAsync(companyId, snapshotDate);
                return Ok(snapshot);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating snapshot for {Date}", snapshotDate);
                return StatusCode(500, new { message = "An error occurred while creating snapshot" });
            }
        }

        /// <summary>
        /// Get snapshot history
        /// </summary>
        [HttpGet("snapshots")]
        public async Task<ActionResult<List<AnalyticsSnapshot>>> GetSnapshotHistory(
            CancellationToken cancellationToken,
            [FromQuery] string snapshotType = "Monthly",
            [FromQuery] int count = 12)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var history = await _analyticsService.GetSnapshotHistoryAsync(companyId, snapshotType, count);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting snapshot history");
                return StatusCode(500, new { message = "An error occurred while fetching snapshot history" });
            }
        }

        #endregion

        #region Report Definitions

        /// <summary>
        /// Get all report definitions
        /// </summary>
        [HttpGet("reports")]
        public async Task<ActionResult<List<ReportDefinitionDto>>> GetReportDefinitions(CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var reports = await _analyticsService.GetReportDefinitionsAsync(companyId);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report definitions");
                return StatusCode(500, new { message = "An error occurred while fetching report definitions" });
            }
        }

        /// <summary>
        /// Get report definition by ID
        /// </summary>
        [HttpGet("reports/{reportId}")]
        public async Task<ActionResult<ReportDefinitionDto>> GetReportDefinition(int reportId, CancellationToken cancellationToken)
        {
            try
            {
                var report = await _analyticsService.GetReportDefinitionAsync(reportId);
                if (report == null)
                    return NotFound(new { message = "Report definition not found" });
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report definition {ReportId}", reportId);
                return StatusCode(500, new { message = "An error occurred while fetching report definition" });
            }
        }

        /// <summary>
        /// Create a new report definition
        /// </summary>
        [HttpPost("reports")]
        public async Task<ActionResult<ReportDefinitionDto>> CreateReportDefinition(
            [FromBody] CreateReportDefinitionRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var report = await _analyticsService.CreateReportDefinitionAsync(companyId, request);
                return CreatedAtAction(nameof(GetReportDefinition), new { reportId = report.Id }, report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating report definition");
                return StatusCode(500, new { message = "An error occurred while creating report definition" });
            }
        }

        /// <summary>
        /// Update a report definition
        /// </summary>
        [HttpPut("reports/{reportId}")]
        public async Task<ActionResult<ReportDefinitionDto>> UpdateReportDefinition(
            int reportId,
            [FromBody] UpdateReportDefinitionRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                if (reportId != request.Id)
                    return BadRequest(new { message = "Report ID mismatch" });

                var report = await _analyticsService.UpdateReportDefinitionAsync(reportId, request);
                if (report == null)
                    return NotFound(new { message = "Report definition not found" });

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating report definition {ReportId}", reportId);
                return StatusCode(500, new { message = "An error occurred while updating report definition" });
            }
        }

        /// <summary>
        /// Delete a report definition
        /// </summary>
        [HttpDelete("reports/{reportId}")]
        public async Task<IActionResult> DeleteReportDefinition(int reportId, CancellationToken cancellationToken)
        {
            try
            {
                var deleted = await _analyticsService.DeleteReportDefinitionAsync(reportId);
                if (!deleted)
                    return NotFound(new { message = "Report definition not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting report definition {ReportId}", reportId);
                return StatusCode(500, new { message = "An error occurred while deleting report definition" });
            }
        }

        #endregion

        #region Report Execution

        /// <summary>
        /// Execute a report and return data
        /// </summary>
        [HttpPost("reports/execute")]
        public async Task<ActionResult<ReportDataResult>> ExecuteReport(
            [FromBody] ExecuteReportRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var result = await _analyticsService.ExecuteReportAsync(companyId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing report {ReportId}", request.ReportDefinitionId);
                return StatusCode(500, new { message = "An error occurred while executing report" });
            }
        }

        /// <summary>
        /// Execute report and export to file
        /// </summary>
        [HttpPost("reports/export")]
        public async Task<ActionResult<ExportResult>> ExecuteAndExportReport(
            [FromBody] ExecuteReportRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var result = await _analyticsService.ExecuteAndExportReportAsync(companyId, request);

                if (!result.Success)
                    return BadRequest(new { message = result.ErrorMessage });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report {ReportId}", request.ReportDefinitionId);
                return StatusCode(500, new { message = "An error occurred while exporting report" });
            }
        }

        /// <summary>
        /// Get report execution history
        /// </summary>
        [HttpGet("reports/{reportDefinitionId}/executions")]
        public async Task<ActionResult<List<ReportExecutionDto>>> GetReportExecutionHistory(
            int reportDefinitionId,
            CancellationToken cancellationToken,
            [FromQuery] int count = 10)
        {
            try
            {
                var history = await _analyticsService.GetReportExecutionHistoryAsync(reportDefinitionId, count);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report execution history for {ReportId}", reportDefinitionId);
                return StatusCode(500, new { message = "An error occurred while fetching execution history" });
            }
        }

        #endregion

        #region Resource Utilization

        /// <summary>
        /// Get resource utilization data
        /// </summary>
        [HttpGet("utilization")]
        public async Task<ActionResult<List<ResourceUtilizationDto>>> GetResourceUtilization(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var utilization = await _analyticsService.GetResourceUtilizationAsync(companyId, startDate, endDate);
                return Ok(utilization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource utilization");
                return StatusCode(500, new { message = "An error occurred while fetching resource utilization" });
            }
        }

        /// <summary>
        /// Record resource utilization
        /// </summary>
        [HttpPost("utilization")]
        public async Task<ActionResult<ResourceUtilizationDto>> RecordResourceUtilization(
            [FromBody] CreateResourceUtilizationRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var companyId = GetCurrentCompanyId();
                var utilization = await _analyticsService.RecordResourceUtilizationAsync(companyId, request);
                return CreatedAtAction(nameof(GetResourceUtilization), new { id = utilization.Id }, utilization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording resource utilization");
                return StatusCode(500, new { message = "An error occurred while recording resource utilization" });
            }
        }

        #endregion

        #region Helper Methods

        private int GetCurrentCompanyId()
        {
            // Get company ID from claims or other context
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (int.TryParse(companyIdClaim, out int companyId))
                return companyId;

            // Default fallback - in production, this should be properly authenticated
            return 1;
        }

        #endregion
    }
}
