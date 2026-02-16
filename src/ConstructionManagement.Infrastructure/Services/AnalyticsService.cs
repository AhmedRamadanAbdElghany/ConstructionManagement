using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services
{
    /// <summary>
    /// Analytics and Reporting service implementation
    /// </summary>
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(ApplicationDbContext context, ILogger<AnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Dashboard

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var end = endDate ?? DateTime.UtcNow;
            var start = startDate ?? end.AddMonths(-1);

            var summary = new DashboardSummaryDto();

            // Project Health Metrics
            var projects = await _context.Projects
                .Where(p => p.CompanyId == companyId && !p.IsDeleted)
                .AsNoTracking()
                .ToListAsync();

            summary.TotalProjects = projects.Count;
            summary.ActiveProjects = projects.Count(p => p.Status == "InProgress" || p.Status == "Active" || p.Status == "????");
            summary.CompletedProjects = projects.Count(p => p.Status == "Completed" || p.IsClosed);
            summary.OnHoldProjects = projects.Count(p => p.Status == "OnHold");
            summary.DelayedProjects = projects.Count(p => p.EndDate < end && (p.Status == "InProgress" || p.Status == "Active" || p.Status == "????"));
            summary.AverageProgress = projects.Any() ? projects.Average(p => p.ProgressPercentage) : 0;
            summary.ProjectHealthScore = CalculateProjectHealthScore(projects);

            // Financial Metrics
            var invoices = await _context.Invoices
                .Where(i => i.CompanyId == companyId && i.InvoiceDate >= start && i.InvoiceDate <= end)
                .AsNoTracking()
                .ToListAsync();

            summary.TotalRevenue = invoices.Where(i => i.StatusEnum == Domain.Enums.InvoiceStatus.Paid).Sum(i => i.NetAmount);
            summary.TotalCosts = await GetTotalCostsAsync(companyId, start, end);
            summary.GrossProfit = summary.TotalRevenue - summary.TotalCosts;
            summary.ProfitMargin = summary.TotalRevenue > 0 ? (summary.GrossProfit / summary.TotalRevenue) * 100 : 0;
            summary.PendingInvoices = invoices.Where(i => i.StatusEnum == Domain.Enums.InvoiceStatus.Sent || i.StatusEnum == Domain.Enums.InvoiceStatus.Draft).Sum(i => i.NetAmount);
            summary.OverduePayments = invoices.Where(i => i.DueDate < end && i.StatusEnum != Domain.Enums.InvoiceStatus.Paid).Sum(i => i.NetAmount);

            // Resource Metrics
            var workers = await _context.TeamMembers
                .Where(t => t.CompanyId == companyId && t.Status == Domain.Enums.EmploymentStatus.Active)
                .AsNoTracking()
                .ToListAsync();

            summary.ActiveWorkers = workers.Count;
            summary.LaborUtilization = await GetLaborUtilizationAsync(companyId, start, end);
            summary.EquipmentUtilization = await GetEquipmentUtilizationAsync(companyId);
            summary.OpenPositions = await _context.JobPostings
                .CountAsync(j => j.CompanyId == companyId && j.Status == Domain.Enums.JobStatus.Open);

            // Quality & Safety
            summary.QualityScore = await GetAverageQualityScoreAsync(companyId);
            summary.OpenDefects = await _context.Defects.CountAsync(d => d.CompanyId == companyId && d.Status != "Resolved");
            summary.SafetyIncidents = await _context.SafetyIncidents.CountAsync(s => s.CompanyId == companyId && s.IncidentDate >= start && s.IncidentDate <= end);
            summary.SafetyScore = CalculateSafetyScore(companyId);

            // Trends
            summary.RevenueTrend = await GetRevenueTrendAsync(companyId, start, end);
            summary.ProgressTrend = await GetProgressTrendAsync(companyId, start, end);
            summary.CostTrend = await GetCostTrendAsync(companyId, start, end);

            return summary;
        }

        #endregion

        #region Financial Analytics

        public async Task<FinancialAnalyticsDto> GetFinancialAnalyticsAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var end = endDate ?? DateTime.UtcNow;
            var start = startDate ?? end.AddMonths(-12);

            var analytics = new FinancialAnalyticsDto();

            // Get invoices
            var invoices = await _context.Invoices
                .Where(i => i.CompanyId == companyId && i.InvoiceDate >= start && i.InvoiceDate <= end)
                .AsNoTracking()
                .ToListAsync();

            // Revenue
            analytics.TotalRevenue = invoices.Sum(i => i.NetAmount);
            analytics.InvoicedAmount = analytics.TotalRevenue;
            analytics.CollectedAmount = invoices.Where(i => i.StatusEnum == Domain.Enums.InvoiceStatus.Paid).Sum(i => i.NetAmount);
            analytics.PendingAmount = invoices.Where(i => i.StatusEnum != Domain.Enums.InvoiceStatus.Paid && i.StatusEnum != Domain.Enums.InvoiceStatus.Cancelled).Sum(i => i.NetAmount);
            analytics.OverdueAmount = invoices.Where(i => i.DueDate < end && i.StatusEnum != Domain.Enums.InvoiceStatus.Paid).Sum(i => i.NetAmount);
            analytics.CollectionRate = analytics.InvoicedAmount > 0 ? (analytics.CollectedAmount / analytics.InvoicedAmount) * 100 : 0;

            // Costs
            analytics.TotalCosts = await GetTotalCostsAsync(companyId, start, end);
            analytics.LaborCosts = await GetLaborCostsAsync(companyId, start, end);
            analytics.MaterialCosts = await GetMaterialCostsAsync(companyId, start, end);
            analytics.EquipmentCosts = await GetEquipmentCostsAsync(companyId, start, end);
            analytics.SubcontractorCosts = await GetSubcontractorCostsAsync(companyId, start, end);
            analytics.OverheadCosts = analytics.TotalCosts - analytics.LaborCosts - analytics.MaterialCosts - analytics.EquipmentCosts - analytics.SubcontractorCosts;

            // Profit
            analytics.GrossProfit = analytics.TotalRevenue - analytics.TotalCosts;
            analytics.NetProfit = analytics.GrossProfit;
            analytics.ProfitMargin = analytics.TotalRevenue > 0 ? (analytics.GrossProfit / analytics.TotalRevenue) * 100 : 0;
            analytics.OperatingMargin = analytics.TotalRevenue > 0 ? (analytics.GrossProfit / analytics.TotalRevenue) * 100 : 0;

            // Project Summaries
            analytics.ProjectSummaries = await GetProjectFinancialsAsync(companyId, start, end);

            // Trends
            analytics.MonthlyRevenue = await GetFinancialTrendsAsync(companyId, "Monthly", 12);
            analytics.MonthlyCosts = await GetFinancialTrendsAsync(companyId, "Monthly", 12, true);

            // Ratios
            analytics.CurrentRatio = 1.5m;
            analytics.DebtToEquity = 0.5m;
            analytics.ReturnOnInvestment = analytics.TotalCosts > 0 ? (analytics.GrossProfit / analytics.TotalCosts) * 100 : 0;

            return analytics;
        }

        public async Task<List<ProjectFinancialSummary>> GetProjectFinancialsAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var projects = await _context.Projects
                .Where(p => p.CompanyId == companyId && !p.IsDeleted)
                .AsNoTracking()
                .ToListAsync();

            var summaries = new List<ProjectFinancialSummary>();

            foreach (var project in projects)
            {
                var invoices = await _context.Invoices
                    .Where(i => i.ProjectId == project.Id && i.CompanyId == companyId)
                    .AsNoTracking()
                    .ToListAsync();

                var expenses = await _context.Expenses
                    .Where(e => e.ProjectId == project.Id && e.CompanyId == companyId)
                    .AsNoTracking()
                    .ToListAsync();

                var summary = new ProjectFinancialSummary
                {
                    ProjectId = project.Id,
                    ProjectName = project.Name,
                    Budget = project.Budget ?? 0,
                    ActualCost = expenses.Sum(e => e.Amount),
                    Variance = (project.Budget ?? 0) - expenses.Sum(e => e.Amount),
                    Invoiced = invoices.Sum(i => i.NetAmount),
                    Collected = invoices.Where(i => i.StatusEnum == Domain.Enums.InvoiceStatus.Paid).Sum(i => i.NetAmount),
                    Pending = invoices.Where(i => i.StatusEnum != Domain.Enums.InvoiceStatus.Paid).Sum(i => i.NetAmount),
                    Revenue = invoices.Sum(i => i.NetAmount),
                    Profit = invoices.Sum(i => i.NetAmount) - expenses.Sum(e => e.Amount),
                    ProfitMargin = invoices.Sum(i => i.NetAmount) > 0 ? ((invoices.Sum(i => i.NetAmount) - expenses.Sum(e => e.Amount)) / invoices.Sum(i => i.NetAmount)) * 100 : 0,
                    CostPerformanceIndex = expenses.Sum(e => e.Amount) > 0 && (project.Budget ?? 0) > 0 ? (project.Budget ?? 0) / expenses.Sum(e => e.Amount) : 0,
                    SchedulePerformanceIndex = 1.0m
                };

                summaries.Add(summary);
            }

            return summaries;
        }

        public async Task<List<FinancialTrendData>> GetFinancialTrendsAsync(int companyId, string period = "Monthly", int periods = 12, bool isCost = false)
        {
            var trends = new List<FinancialTrendData>();
            var end = DateTime.UtcNow;
            var start = end.AddMonths(-periods);

            for (int i = 0; i < periods; i++)
            {
                var periodStart = start.AddMonths(i);
                var periodEnd = periodStart.AddMonths(1);

                var amount = isCost
                    ? await _context.Expenses
                        .Where(e => e.CompanyId == companyId && e.ExpenseDate >= periodStart && e.ExpenseDate < periodEnd)
                        .SumAsync(e => e.Amount)
                    : await _context.Invoices
                        .Where(i => i.CompanyId == companyId && i.InvoiceDate >= periodStart && i.InvoiceDate < periodEnd)
                        .SumAsync(i => i.NetAmount);

                trends.Add(new FinancialTrendData
                {
                    Year = periodStart.Year,
                    Month = periodStart.Month,
                    MonthName = periodStart.ToString("MMM yyyy"),
                    Amount = amount,
                    Cumulative = trends.Any() ? trends.Last().Cumulative + amount : amount,
                    PercentageChange = i > 0 && trends.Any() && trends.Last().Amount > 0 ? ((amount - trends.Last().Amount) / trends.Last().Amount) * 100 : 0
                });
            }

            return trends;
        }

        #endregion

        #region Resource Analytics

        public async Task<ResourceAnalyticsDto> GetResourceAnalyticsAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var analytics = new ResourceAnalyticsDto();

            var workers = await _context.TeamMembers
                .Where(t => t.CompanyId == companyId && t.Status == Domain.Enums.EmploymentStatus.Active)
                .AsNoTracking()
                .ToListAsync();

            analytics.TotalWorkers = workers.Count;
            analytics.ActiveWorkers = workers.Count;
            analytics.TotalLaborHours = workers.Sum(w => w.HoursWorked);
            analytics.AverageUtilization = await GetLaborUtilizationAsync(companyId, startDate, endDate);
            analytics.ProductivityIndex = 1.0m;
            analytics.TotalLaborCost = workers.Sum(w => w.Salary);

            var equipment = await _context.Equipment
                .Where(e => e.CompanyId == companyId && e.Status == Domain.Enums.EquipmentStatus.Available)
                .AsNoTracking()
                .ToListAsync();

            analytics.TotalEquipment = equipment.Count;
            analytics.ActiveEquipment = equipment.Count;
            analytics.EquipmentUtilization = await GetEquipmentUtilizationAsync(companyId);
            analytics.EquipmentCost = equipment.Sum(e => e.RentalRate);

            analytics.ProjectResources = await GetProjectResourceUtilizationAsync(companyId, startDate, endDate);
            analytics.TopWorkers = await GetWorkerPerformanceAsync(companyId, 10, startDate, endDate);
            analytics.TopEquipment = await GetEquipmentPerformanceAsync(companyId, 10);

            return analytics;
        }

        public async Task<List<ProjectResourceSummary>> GetProjectResourceUtilizationAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var projects = await _context.Projects
                .Where(p => p.CompanyId == companyId && !p.IsDeleted)
                .AsNoTracking()
                .ToListAsync();

            var summaries = new List<ProjectResourceSummary>();

            foreach (var project in projects)
            {
                summaries.Add(new ProjectResourceSummary
                {
                    ProjectId = project.Id,
                    ProjectName = project.Name,
                    WorkerCount = await _context.ProjectAssignments.CountAsync(a => a.ProjectId == project.Id),
                    LaborHours = 0,
                    UtilizationRate = 0,
                    LaborCost = 0,
                    EquipmentCount = await _context.EquipmentAssignments.CountAsync(a => a.ProjectId == project.Id),
                    EquipmentHours = 0,
                    EquipmentUtilization = 0,
                    EquipmentCost = 0
                });
            }

            return summaries;
        }

        public async Task<List<WorkerPerformance>> GetWorkerPerformanceAsync(int companyId, int topN = 10, DateTime? startDate = null, DateTime? endDate = null)
        {
            var workers = await _context.TeamMembers
                .Where(t => t.CompanyId == companyId && t.Status == Domain.Enums.EmploymentStatus.Active)
                .AsNoTracking()
                .Take(topN)
                .ToListAsync();

            return workers.Select(w => new WorkerPerformance
            {
                WorkerId = w.Id.ToString(),
                WorkerName = $"{w.FirstName} {w.LastName}",
                Role = w.JobTitle ?? "Unknown",
                HoursWorked = (int)w.HoursWorked,
                Productivity = 1.0m,
                QualityScore = 0.85m,
                TasksCompleted = 0
            }).ToList();
        }

        public async Task<List<EquipmentPerformance>> GetEquipmentPerformanceAsync(int companyId, int topN = 10)
        {
            var equipment = await _context.Equipment
                .Where(e => e.CompanyId == companyId && e.Status == Domain.Enums.EquipmentStatus.Active)
                .AsNoTracking()
                .Take(topN)
                .ToListAsync();

            return equipment.Select(e => new EquipmentPerformance
            {
                EquipmentId = e.Id,
                EquipmentName = e.Name,
                Type = e.EquipmentType?.Name ?? "Unknown",
                UtilizationRate = 0.75m,
                OperatingHours = (int)e.OperatingHours,
                MaintenanceHours = 0,
                DowntimeHours = 0,
                CostPerHour = e.RentalRate
            }).ToList();
        }

        #endregion

        #region KPI Analytics

        public async Task<KPIDashboardDto> GetKPIDashboardAsync(int companyId)
        {
            return new KPIDashboardDto
            {
                KPIs = await GetKPIDefinitionsAsync(companyId),
                RecentResults = await GetRecentKPIResultsAsync(companyId),
                CategorySummary = await GetKPICategorySummaryAsync(companyId),
                Alerts = await GetKPIAlertsAsync(companyId)
            };
        }

        public async Task<List<KPIDefinitionDto>> GetKPIDefinitionsAsync(int companyId)
        {
            var kpis = await _context.KPIDefinitions
                .Where(k => k.CompanyId == companyId && k.IsActive)
                .AsNoTracking()
                .ToListAsync();

            return kpis.Select(k => new KPIDefinitionDto
            {
                Id = k.Id,
                Name = k.Name,
                Description = k.Description,
                Category = k.Category,
                MetricType = k.MetricType,
                CurrentValue = GetCurrentKPIValue(companyId, k),
                TargetValue = k.TargetValue,
                Status = GetKPIStatus(k),
                Variance = ParseVariance(CalculateKPIVariance(k)),
                Trend = "Stable",
                DisplayFormat = k.DisplayFormat,
                DisplayPrecision = k.DisplayPrecision
            }).ToList();
        }

        private static decimal ParseVariance(string? variance)
        {
            if (decimal.TryParse(variance, out var result))
                return result;
            return 0;
        }

        private static decimal ParseDecimalSafe(string? value)
        {
            if (decimal.TryParse(value, out var result))
                return result;
            return 0m;
        }

        public async Task<List<KPIResultDto>> GetKPIResultsAsync(int kpiDefinitionId, int periods = 12)
        {
            var results = await _context.KPIResults
                .Where(k => k.KPIDefinitionId == kpiDefinitionId)
                .OrderByDescending(k => k.Date)
                .Take(periods)
                .AsNoTracking()
                .ToListAsync();

            return results.Select(r => new KPIResultDto
            {
                Id = r.Id,
                KPIDefinitionId = r.KPIDefinitionId,
                KPIName = "",
                Date = r.Date,
                Value = r.Value,
                TargetValue = r.TargetValue,
                Status = r.Status,
                Variance = ParseVariance(r.Variance)
            }).ToList();
        }

        public async Task CalculateAndStoreKPIResultsAsync(int companyId)
        {
            var kpis = await _context.KPIDefinitions
                .Where(k => k.CompanyId == companyId && k.IsActive)
                .ToListAsync();

            foreach (var kpi in kpis)
            {
                var result = new KPIResult
                {
                    CompanyId = companyId,
                    KPIDefinitionId = kpi.Id,
                    Date = DateTime.UtcNow,
                    Value = GetCurrentKPIValue(companyId, kpi),
                    TargetValue = kpi.TargetValue,
                    Status = GetKPIStatus(kpi),
                    Variance = CalculateKPIVariance(kpi),
                    CalculatedBy = "System"
                };

                _context.KPIResults.Add(result);
            }

            await _context.SaveChangesAsync();
        }

        #endregion

        #region Chart Data

        public async Task<ChartDataDto> GetChartDataAsync(int companyId, string chartType, string dataSource, DateTime? startDate = null, DateTime? endDate = null)
        {
            return chartType switch
            {
                "Revenue" => await GetRevenueChartDataAsync(companyId),
                "ProjectProgress" => await GetProjectProgressChartDataAsync(companyId),
                "ResourceUtilization" => await GetResourceUtilizationChartDataAsync(companyId),
                "CostBreakdown" => await GetCostBreakdownChartDataAsync(companyId),
                _ => new ChartDataDto()
            };
        }

        public async Task<ChartDataDto> GetRevenueChartDataAsync(int companyId, int periods = 12)
        {
            var trends = await GetFinancialTrendsAsync(companyId, "Monthly", periods);

            return new ChartDataDto
            {
                ChartType = "Bar",
                Title = "Revenue Trend",
                Labels = trends.Select(t => new ChartLabel { Label = t.MonthName }).ToList(),
                Datasets = new List<ChartDataset>
                {
                    new ChartDataset
                    {
                        Label = "Revenue",
                        Data = trends.Select(t => t.Amount).ToList(),
                        BackgroundColor = "#4F46E5",
                        BorderColor = "#4F46E5",
                        BorderWidth = 1,
                        Fill = true
                    }
                },
                Options = new ChartOptions
                {
                    Responsive = true,
                    ShowLegend = true,
                    XAxisTitle = "Month",
                    YAxisTitle = "Amount ($)"
                }
            };
        }

        public async Task<ChartDataDto> GetProjectProgressChartDataAsync(int companyId)
        {
            var projects = await _context.Projects
                .Where(p => p.CompanyId == companyId && !p.IsDeleted && (p.Status == "InProgress" || p.Status == "Active" || p.Status == "????"))
                .AsNoTracking()
                .Take(10)
                .ToListAsync();

            return new ChartDataDto
            {
                ChartType = "HorizontalBar",
                Title = "Project Progress",
                Labels = projects.Select(p => new ChartLabel { Label = p.Name }).ToList(),
                Datasets = new List<ChartDataset>
                {
                    new ChartDataset
                    {
                        Label = "Progress",
                        Data = projects.Select(p => p.ProgressPercentage).ToList(),
                        BackgroundColor = "#10B981"
                    }
                },
                Options = new ChartOptions
                {
                    Responsive = true,
                    ShowLegend = true,
                    XAxisTitle = "Progress (%)",
                    YAxisTitle = "Project"
                }
            };
        }

        public async Task<ChartDataDto> GetResourceUtilizationChartDataAsync(int companyId)
        {
            var analytics = await GetResourceAnalyticsAsync(companyId);

            return new ChartDataDto
            {
                ChartType = "Doughnut",
                Title = "Resource Distribution",
                Labels = new List<ChartLabel>
                {
                    new ChartLabel { Label = "Labor", Value = analytics.TotalLaborCost.ToString() },
                    new ChartLabel { Label = "Equipment", Value = analytics.EquipmentCost.ToString() }
                },
                Datasets = new List<ChartDataset>
                {
                    new ChartDataset
                    {
                        Label = "Utilization",
                        Data = new List<decimal> { analytics.TotalLaborCost, analytics.EquipmentCost },
                        BackgroundColors = new List<string> { "#4F46E5", "#10B981" }
                    }
                },
                Options = new ChartOptions
                {
                    Responsive = true,
                    ShowLegend = true
                }
            };
        }

        public async Task<ChartDataDto> GetCostBreakdownChartDataAsync(int companyId)
        {
            var end = DateTime.UtcNow;
            var start = end.AddMonths(-12);

            return new ChartDataDto
            {
                ChartType = "Pie",
                Title = "Cost Breakdown",
                Labels = new List<ChartLabel>
                {
                    new ChartLabel { Label = "Labor" },
                    new ChartLabel { Label = "Materials" },
                    new ChartLabel { Label = "Equipment" },
                    new ChartLabel { Label = "Subcontractors" }
                },
                Datasets = new List<ChartDataset>
                {
                    new ChartDataset
                    {
                        Label = "Costs",
                        Data = new List<decimal>
                        {
                            await GetLaborCostsAsync(companyId, start, end),
                            await GetMaterialCostsAsync(companyId, start, end),
                            await GetEquipmentCostsAsync(companyId, start, end),
                            await GetSubcontractorCostsAsync(companyId, start, end)
                        },
                        BackgroundColors = new List<string> { "#EF4444", "#F59E0B", "#10B981", "#3B82F6" }
                    }
                },
                Options = new ChartOptions
                {
                    Responsive = true,
                    ShowLegend = true
                }
            };
        }

        #endregion

        #region Snapshots

        public async Task<AnalyticsSnapshot?> GetSnapshotAsync(int companyId, DateTime date)
        {
            return await _context.AnalyticsSnapshots
                .Where(s => s.CompanyId == companyId && s.SnapshotDate.Date == date.Date)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<AnalyticsSnapshot> CreateSnapshotAsync(int companyId, DateTime snapshotDate)
        {
            var summary = await GetDashboardSummaryAsync(companyId, snapshotDate.AddMonths(-1), snapshotDate);

            var snapshot = new AnalyticsSnapshot
            {
                CompanyId = companyId,
                SnapshotType = "Monthly",
                Period = snapshotDate.ToString("yyyy-MM"),
                SnapshotDate = snapshotDate,
                ProjectHealthScore = summary.ProjectHealthScore,
                TotalProjects = summary.TotalProjects,
                ActiveProjects = summary.ActiveProjects,
                CompletedProjects = summary.CompletedProjects,
                OnHoldProjects = summary.OnHoldProjects,
                DelayedProjects = summary.DelayedProjects,
                AverageProgress = summary.AverageProgress,
                ScheduleVariance = 0,
                TotalRevenue = summary.TotalRevenue,
                TotalCosts = summary.TotalCosts,
                GrossProfit = summary.GrossProfit,
                ProfitMargin = summary.ProfitMargin,
                TotalInvoiced = summary.PendingInvoices,
                TotalCollected = summary.TotalRevenue,
                PendingPayments = summary.PendingInvoices,
                OverduePayments = summary.OverduePayments,
                LaborUtilization = summary.LaborUtilization,
                EquipmentUtilization = summary.EquipmentUtilization,
                TotalTeamMembers = summary.ActiveWorkers,
                ActiveWorkers = summary.ActiveWorkers,
                OpenPositions = summary.OpenPositions,
                AverageQualityScore = summary.QualityScore,
                TotalInspections = 0,
                PassedInspections = 0,
                TotalDefects = summary.OpenDefects,
                OpenDefects = summary.OpenDefects,
                ResolvedDefects = 0,
                TotalIncidents = summary.SafetyIncidents,
                SafetyViolations = 0,
                IncidentRate = 0,
                LostTimeIncidents = 0,
                SafetyTrainingCompleted = 0,
                CreatedBy = "System"
            };

            _context.AnalyticsSnapshots.Add(snapshot);
            await _context.SaveChangesAsync();

            return snapshot;
        }

        public async Task<List<AnalyticsSnapshot>> GetSnapshotHistoryAsync(int companyId, string snapshotType = "Monthly", int count = 12)
        {
            return await _context.AnalyticsSnapshots
                .Where(s => s.CompanyId == companyId && s.SnapshotType == snapshotType)
                .OrderByDescending(s => s.SnapshotDate)
                .Take(count)
                .AsNoTracking()
                .ToListAsync();
        }

        #endregion

        #region Report Definitions

        public async Task<List<ReportDefinitionDto>> GetReportDefinitionsAsync(int companyId)
        {
            var reports = await _context.ReportDefinitions
                .Where(r => r.CompanyId == companyId)
                .AsNoTracking()
                .ToListAsync();

            return reports.Select(r => new ReportDefinitionDto
            {
                Id = r.Id,
                CompanyId = r.CompanyId ?? 0,
                Name = r.Name,
                Description = r.Description,
                ReportType = r.ReportType,
                Category = r.Category,
                IsPublic = r.IsPublic,
                IsScheduled = r.IsScheduled,
                ScheduleFrequency = r.ScheduleFrequency,
                LastRunAt = r.LastRunAt,
                RunCount = r.RunCount,
                CreatedBy = r.CreatedBy ?? "",
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        public async Task<ReportDefinitionDto?> GetReportDefinitionAsync(int reportId)
        {
            var report = await _context.ReportDefinitions
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null) return null;

            return new ReportDefinitionDto
            {
                Id = report.Id,
                CompanyId = report.CompanyId ?? 0,
                Name = report.Name,
                Description = report.Description,
                ReportType = report.ReportType,
                Category = report.Category,
                IsPublic = report.IsPublic,
                IsScheduled = report.IsScheduled,
                ScheduleFrequency = report.ScheduleFrequency,
                LastRunAt = report.LastRunAt,
                RunCount = report.RunCount,
                CreatedBy = report.CreatedBy ?? "",
                CreatedAt = report.CreatedAt
            };
        }

        public async Task<ReportDefinitionDto> CreateReportDefinitionAsync(int companyId, CreateReportDefinitionRequest request)
        {
            var report = new ReportDefinition
            {
                CompanyId = companyId,
                Name = request.Name,
                Description = request.Description,
                ReportType = request.ReportType,
                Category = request.Category,
                Configuration = request.Configuration,
                Columns = request.Columns,
                Filters = request.Filters,
                GroupBy = request.GroupBy,
                SortBy = request.SortBy,
                SortOrder = request.SortOrder,
                IsPublic = request.IsPublic,
                IsScheduled = request.IsScheduled,
                ScheduleFrequency = request.ScheduleFrequency,
                ScheduleCron = request.ScheduleCron,
                CreatedBy = "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.ReportDefinitions.Add(report);
            await _context.SaveChangesAsync();

            return new ReportDefinitionDto
            {
                Id = report.Id,
                CompanyId = report.CompanyId ?? 0,
                Name = report.Name,
                Description = report.Description,
                ReportType = report.ReportType,
                Category = report.Category,
                IsPublic = report.IsPublic,
                IsScheduled = report.IsScheduled,
                ScheduleFrequency = report.ScheduleFrequency,
                LastRunAt = report.LastRunAt,
                RunCount = report.RunCount,
                CreatedBy = report.CreatedBy,
                CreatedAt = report.CreatedAt
            };
        }

        public async Task<ReportDefinitionDto?> UpdateReportDefinitionAsync(int reportId, UpdateReportDefinitionRequest request)
        {
            var report = await _context.ReportDefinitions
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null) return null;

            report.Name = request.Name;
            report.Description = request.Description;
            report.Configuration = request.Configuration;
            report.Columns = request.Columns;
            report.Filters = request.Filters;
            report.GroupBy = request.GroupBy;
            report.SortBy = request.SortBy;
            report.SortOrder = request.SortOrder;
            report.IsPublic = request.IsPublic;
            report.IsScheduled = request.IsScheduled;
            report.ScheduleFrequency = request.ScheduleFrequency;
            report.ScheduleCron = request.ScheduleCron;
            report.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetReportDefinitionAsync(reportId);
        }

        public async Task<bool> DeleteReportDefinitionAsync(int reportId)
        {
            var report = await _context.ReportDefinitions
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null) return false;

            _context.ReportDefinitions.Remove(report);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Report Execution

        public async Task<ReportDataResult> ExecuteReportAsync(int companyId, ExecuteReportRequest request)
        {
            var startTime = DateTime.UtcNow;
            var result = new ReportDataResult();

            var report = await _context.ReportDefinitions
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == request.ReportDefinitionId);

            if (report == null)
            {
                result.Data = new List<Dictionary<string, object>>();
                return result;
            }

            result.Data = await ExecuteReportQuery(companyId, report, request);
            result.TotalCount = result.Data?.Count ?? 0;
            result.Page = request.Page ?? 1;
            result.PageSize = request.PageSize ?? 50;
            result.TotalPages = (int)Math.Ceiling(result.TotalCount / (double)result.PageSize);
            result.ExecutionTimeMs = (long)(DateTime.UtcNow - startTime).TotalMilliseconds;

            // Log execution
            var execution = new ReportExecution
            {
                CompanyId = companyId,
                ReportDefinitionId = request.ReportDefinitionId,
                ExecutedBy = "System",
                ExecutedAt = DateTime.UtcNow,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Parameters = request.Parameters,
                RowCount = result.TotalCount,
                ExecutionTimeMs = result.ExecutionTimeMs,
                Status = "Success",
                Format = request.Format
            };

            _context.ReportExecutions.Add(execution);

            report.LastRunAt = DateTime.UtcNow;
            report.RunCount++;

            await _context.SaveChangesAsync();

            return result;
        }

        public async Task<ExportResult> ExecuteAndExportReportAsync(int companyId, ExecuteReportRequest request)
        {
            var reportData = await ExecuteReportAsync(companyId, request);
            return new ExportResult
            {
                Success = true,
                FileName = $"Report_{request.ReportDefinitionId}_{DateTime.UtcNow:yyyyMMddHHmmss}.{request.Format.ToLower()}",
                FileSize = reportData.Data?.Count ?? 0 * 100,
                FileContent = new byte[0]
            };
        }

        public async Task<List<ReportExecutionDto>> GetReportExecutionHistoryAsync(int reportDefinitionId, int count = 10)
        {
            return await _context.ReportExecutions
                .Where(e => e.ReportDefinitionId == reportDefinitionId)
                .OrderByDescending(e => e.ExecutedAt)
                .Take(count)
                .Select(e => new ReportExecutionDto
                {
                    Id = e.Id,
                    ReportDefinitionId = e.ReportDefinitionId,
                    ReportName = "",
                    ExecutedBy = e.ExecutedBy,
                    ExecutedAt = e.ExecutedAt,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    RowCount = e.RowCount,
                    ExecutionTimeMs = e.ExecutionTimeMs,
                    Status = e.Status,
                    ErrorMessage = e.ErrorMessage,
                    FilePath = e.FilePath,
                    FileSize = e.FileSize,
                    Format = e.Format
                })
                .AsNoTracking()
                .ToListAsync();
        }

        #endregion

        #region Resource Utilization

        public async Task<List<ResourceUtilizationDto>> GetResourceUtilizationAsync(int companyId, DateTime? startDate = null, DateTime? endDate = null)
        {
            return await _context.ResourceUtilizations
                .Where(r => r.CompanyId == companyId)
                .OrderByDescending(r => r.Date)
                .Select(r => new ResourceUtilizationDto
                {
                    Id = r.Id,
                    CompanyId = r.CompanyId,
                    ProjectId = r.ProjectId,
                    ResourceType = r.ResourceType,
                    ResourceId = r.ResourceId,
                    ResourceName = r.ResourceName,
                    Date = r.Date,
                    PlannedHours = r.PlannedHours,
                    ActualHours = r.ActualHours,
                    UtilizationRate = r.UtilizationRate,
                    ProductivityIndex = r.ProductivityIndex,
                    CostPlanned = r.CostPlanned,
                    CostActual = r.CostActual,
                    Efficiency = r.Efficiency
                })
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<ResourceUtilizationDto> RecordResourceUtilizationAsync(int companyId, CreateResourceUtilizationRequest request)
        {
            var utilization = new ResourceUtilization
            {
                CompanyId = companyId,
                ProjectId = request.ProjectId,
                ResourceType = request.ResourceType,
                ResourceId = request.ResourceId,
                ResourceName = request.ResourceName,
                Date = request.Date,
                PlannedHours = request.PlannedHours,
                ActualHours = request.ActualHours,
                UtilizationRate = request.PlannedHours > 0 ? (request.ActualHours / request.PlannedHours) * 100 : 0,
                ProductivityIndex = 1.0m,
                CostPlanned = request.CostPlanned,
                CostActual = request.CostActual,
                Efficiency = request.CostPlanned > 0 ? request.CostPlanned / (request.CostActual > 0 ? request.CostActual : 1) : 0,
                Notes = request.Notes,
                CreatedBy = "System"
            };

            _context.ResourceUtilizations.Add(utilization);
            await _context.SaveChangesAsync();

            return new ResourceUtilizationDto
            {
                Id = utilization.Id,
                CompanyId = utilization.CompanyId,
                ProjectId = utilization.ProjectId,
                ResourceType = utilization.ResourceType,
                ResourceId = utilization.ResourceId,
                ResourceName = utilization.ResourceName,
                Date = utilization.Date,
                PlannedHours = utilization.PlannedHours,
                ActualHours = utilization.ActualHours,
                UtilizationRate = utilization.UtilizationRate,
                ProductivityIndex = utilization.ProductivityIndex,
                CostPlanned = utilization.CostPlanned,
                CostActual = utilization.CostActual,
                Efficiency = utilization.Efficiency
            };
        }

        #endregion

        #region Analytics Snapshots

        public async Task<List<AnalyticsSnapshotDto>> GetAnalyticsSnapshotsAsync(int companyId, int count = 12)
        {
            return await _context.AnalyticsSnapshots
                .Where(s => s.CompanyId == companyId)
                .OrderByDescending(s => s.SnapshotDate)
                .Take(count)
                .Select(s => new AnalyticsSnapshotDto
                {
                    Id = s.Id,
                    CompanyId = s.CompanyId,
                    ProjectId = s.ProjectId,
                    SnapshotType = s.SnapshotType,
                    Period = s.Period,
                    SnapshotDate = s.SnapshotDate,
                    ProjectHealthScore = s.ProjectHealthScore,
                    TotalProjects = s.TotalProjects,
                    ActiveProjects = s.ActiveProjects,
                    TotalRevenue = s.TotalRevenue,
                    TotalCosts = s.TotalCosts,
                    GrossProfit = s.GrossProfit,
                    ProfitMargin = s.ProfitMargin,
                    LaborUtilization = s.LaborUtilization,
                    EquipmentUtilization = s.EquipmentUtilization,
                    AverageQualityScore = s.AverageQualityScore,
                    TotalDefects = s.TotalDefects,
                    TotalIncidents = s.TotalIncidents
                })
                .AsNoTracking()
                .ToListAsync();
        }

        #endregion

        #region Private Helper Methods

        private decimal CalculateProjectHealthScore(List<Project> projects)
        {
            if (!projects.Any()) return 0;

            var activeProjects = projects.Where(p => p.Status == "InProgress").ToList();
            if (!activeProjects.Any()) return 100;

            var onTimeCount = activeProjects.Count(p => p.EndDate >= DateTime.UtcNow);
            return (decimal)onTimeCount / activeProjects.Count * 100;
        }

        private async Task<decimal> GetTotalCostsAsync(int companyId, DateTime start, DateTime end)
        {
            return await _context.Expenses
                .Where(e => e.CompanyId == companyId && e.ExpenseDate >= start && e.ExpenseDate <= end)
                .SumAsync(e => e.Amount);
        }

        private async Task<decimal> GetLaborCostsAsync(int companyId, DateTime start, DateTime end)
        {
            var workers = await _context.TeamMembers
                .Where(t => t.CompanyId == companyId)
                .ToListAsync();

            return workers.Sum(w => w.Salary);
        }

        private async Task<decimal> GetMaterialCostsAsync(int companyId, DateTime start, DateTime end)
        {
            return await _context.Expenses
                .Where(e => e.CompanyId == companyId && e.ExpenseDate >= start && e.ExpenseDate <= end && e.Category == "Materials")
                .SumAsync(e => e.Amount);
        }

        private async Task<decimal> GetEquipmentCostsAsync(int companyId, DateTime start, DateTime end)
        {
            return await _context.Expenses
                .Where(e => e.CompanyId == companyId && e.ExpenseDate >= start && e.ExpenseDate <= end && e.Category == "Equipment")
                .SumAsync(e => e.Amount);
        }

        private async Task<decimal> GetSubcontractorCostsAsync(int companyId, DateTime start, DateTime end)
        {
            return await _context.Expenses
                .Where(e => e.CompanyId == companyId && e.ExpenseDate >= start && e.ExpenseDate <= end && e.Category == "Subcontractors")
                .SumAsync(e => e.Amount);
        }

        private Task<decimal> GetLaborUtilizationAsync(int companyId, DateTime? startDate, DateTime? endDate)
        {
            return Task.FromResult(75.0m); // Placeholder
        }

        private Task<decimal> GetEquipmentUtilizationAsync(int companyId)
        {
            var equipment = _context.Equipment
                .Where(e => e.CompanyId == companyId && e.Status == Domain.Enums.EquipmentStatus.Active)
                .AsNoTracking()
                .ToList();

            if (!equipment.Any()) return Task.FromResult(0m);

            var totalHours = equipment.Sum(e => e.OperatingHours);
            var maxHours = equipment.Count * 24 * 30; // Assume 24/7 for a month

            return Task.FromResult(maxHours > 0 ? (totalHours / maxHours) * 100 : 0);
        }

        private Task<decimal> GetAverageQualityScoreAsync(int companyId)
        {
            return Task.FromResult(85.0m); // Placeholder
        }

        private decimal CalculateSafetyScore(int companyId)
        {
            return 90.0m; // Placeholder
        }

        private async Task<List<TrendDataPoint>> GetRevenueTrendAsync(int companyId, DateTime start, DateTime end)
        {
            var trends = new List<TrendDataPoint>();
            var current = start;

            while (current <= end)
            {
                var monthEnd = current.AddMonths(1).AddDays(-1);
                var revenue = await _context.Invoices
                    .Where(i => i.CompanyId == companyId && i.InvoiceDate >= current && i.InvoiceDate <= monthEnd)
                    .SumAsync(i => i.NetAmount);

                trends.Add(new TrendDataPoint
                {
                    Period = current.ToString("yyyy-MM"),
                    Date = current,
                    Value = revenue
                });

                current = current.AddMonths(1);
            }

            return trends;
        }

        private async Task<List<TrendDataPoint>> GetProgressTrendAsync(int companyId, DateTime start, DateTime end)
        {
            var projects = await _context.Projects
                .Where(p => p.CompanyId == companyId && !p.IsDeleted)
                .AsNoTracking()
                .ToListAsync();

            return new List<TrendDataPoint>
            {
                new TrendDataPoint { Period = "Current", Date = DateTime.UtcNow, Value = projects.Any() ? projects.Average(p => p.ProgressPercentage) : 0 }
            };
        }

        private async Task<List<TrendDataPoint>> GetCostTrendAsync(int companyId, DateTime start, DateTime end)
        {
            return await GetRevenueTrendAsync(companyId, start, end); // Placeholder - use same logic
        }

        private async Task<List<KPIResultDto>> GetRecentKPIResultsAsync(int companyId)
        {
            return await _context.KPIResults
                .Where(k => k.CompanyId == companyId)
                .OrderByDescending(k => k.Date)
                .Take(50)
                .Select(r => new KPIResultDto
                {
                    Id = r.Id,
                    KPIDefinitionId = r.KPIDefinitionId,
                    KPIName = "",
                    Date = r.Date,
                    Value = r.Value,
                    TargetValue = r.TargetValue,
                    Status = r.Status,
                    Variance = ParseDecimalSafe(r.Variance)
                })
                .AsNoTracking()
                .ToListAsync();
        }

        private async Task<List<KPISummaryByCategory>> GetKPICategorySummaryAsync(int companyId)
        {
            var kpis = await _context.KPIDefinitions
                .Where(k => k.CompanyId == companyId && k.IsActive)
                .AsNoTracking()
                .ToListAsync();

            return kpis.GroupBy(k => k.Category)
                .Select(g => new KPISummaryByCategory
                {
                    Category = g.Key,
                    TotalKPIs = g.Count(),
                    OnTarget = 0, // Placeholder
                    Warning = 0,
                    Critical = 0,
                    AverageValue = 0,
                    AverageTarget = 0
                })
                .ToList();
        }

        private Task<List<KPIAlertDto>> GetKPIAlertsAsync(int companyId)
        {
            return Task.FromResult(new List<KPIAlertDto>()); // Placeholder
        }

        private decimal GetCurrentKPIValue(int companyId, KPIDefinition kpi)
        {
            return kpi.Category switch
            {
                "Financial" => 150000m, // Placeholder
                "Operational" => 75.0m,
                "Quality" => 85.0m,
                "Safety" => 95.0m,
                _ => 0m
            };
        }

        private string GetKPIStatus(KPIDefinition kpi)
        {
            return "OnTarget"; // Placeholder
        }

        private string CalculateKPIVariance(KPIDefinition kpi)
        {
            return "5.0"; // Placeholder
        }

        private async Task<List<Dictionary<string, object>>> ExecuteReportQuery(int companyId, ReportDefinition report, ExecuteReportRequest request)
        {
            // Execute different report types
            return report.ReportType switch
            {
                "Financial" => await GetFinancialReportDataAsync(companyId, request),
                "Project" => await GetProjectReportDataAsync(companyId, request),
                "Resource" => await GetResourceReportDataAsync(companyId, request),
                "Quality" => await GetQualityReportDataAsync(companyId, request),
                _ => new List<Dictionary<string, object>>()
            };
        }

        private async Task<List<Dictionary<string, object>>> GetFinancialReportDataAsync(int companyId, ExecuteReportRequest request)
        {
            var financials = await GetFinancialAnalyticsAsync(companyId, request.StartDate, request.EndDate);
            return new List<Dictionary<string, object>>
            {
                new Dictionary<string, object>
                {
                    { "TotalRevenue", financials.TotalRevenue },
                    { "TotalCosts", financials.TotalCosts },
                    { "GrossProfit", financials.GrossProfit },
                    { "ProfitMargin", financials.ProfitMargin }
                }
            };
        }

        private async Task<List<Dictionary<string, object>>> GetProjectReportDataAsync(int companyId, ExecuteReportRequest request)
        {
            var projects = await _context.Projects
                .Where(p => p.CompanyId == companyId && !p.IsDeleted)
                .AsNoTracking()
                .ToListAsync();

            return projects.Select(p => new Dictionary<string, object>
            {
                { "Id", p.Id },
                { "Name", p.Name ?? "" },
                { "Status", p.Status ?? "" },
                { "Progress", p.ProgressPercentage },
                { "Budget", p.Budget ?? 0 },
                { "StartDate", p.StartDate ?? DateTime.MinValue },
                { "EndDate", p.EndDate ?? DateTime.MinValue }
            }).ToList();
        }

        private async Task<List<Dictionary<string, object>>> GetResourceReportDataAsync(int companyId, ExecuteReportRequest request)
        {
            var workers = await _context.TeamMembers
                .Where(t => t.CompanyId == companyId)
                .AsNoTracking()
                .ToListAsync();

            return workers.Select(w => new Dictionary<string, object>
            {
                { "Id", w.Id },
                { "Name", $"{w.FirstName} {w.LastName}" },
                { "Role", w.JobTitle },
                { "Status", w.Status },
                { "HoursWorked", w.HoursWorked }
            }).ToList();
        }

        private async Task<List<Dictionary<string, object>>> GetQualityReportDataAsync(int companyId, ExecuteReportRequest request)
        {
            var inspections = await _context.QualityInspections
                .Where(q => q.CompanyId == companyId)
                .AsNoTracking()
                .ToListAsync();

            return inspections.Select(i => new Dictionary<string, object>
            {
                { "Id", i.Id },
                { "ProjectId", i.ProjectId ?? 0 },
                { "Type", i.InspectionType ?? "" },
                { "Status", i.Status ?? "" },
                { "Score", i.OverallScore },
                { "Date", i.InspectionDate }
            }).ToList();
        }

        #endregion
    }
}
