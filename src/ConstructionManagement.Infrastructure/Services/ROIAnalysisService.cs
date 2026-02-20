using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for equipment ROI (Return on Investment) analysis.
/// </summary>
public class ROIAnalysisService : IROIAnalysisService
{
    private readonly IRepository<Equipment> _equipmentRepository;
    private readonly IRepository<EquipmentROI> _roiRepository;
    private readonly IRepository<EquipmentCostBreakdown> _costBreakdownRepository;
    private readonly IRepository<EquipmentAssignment> _assignmentRepository;
    private readonly IRepository<EquipmentMaintenance> _maintenanceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ROIAnalysisService> _logger;

    public ROIAnalysisService(
        IRepository<Equipment> equipmentRepository,
        IRepository<EquipmentROI> roiRepository,
        IRepository<EquipmentCostBreakdown> costBreakdownRepository,
        IRepository<EquipmentAssignment> assignmentRepository,
        IRepository<EquipmentMaintenance> maintenanceRepository,
        IUnitOfWork unitOfWork,
        ILogger<ROIAnalysisService> logger)
    {
        _equipmentRepository = equipmentRepository;
        _roiRepository = roiRepository;
        _costBreakdownRepository = costBreakdownRepository;
        _assignmentRepository = assignmentRepository;
        _maintenanceRepository = maintenanceRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<EquipmentROIReportDto> GetEquipmentROIAsync(int equipmentId, DateTime from, DateTime to)
    {
        var equipment = await _equipmentRepository.AsQueryable()
            .FirstOrDefaultAsync(e => e.Id == equipmentId);

        if (equipment == null)
            throw new ArgumentException("Equipment not found");

        // Get existing ROI record or calculate new one
        var roi = await _roiRepository.AsQueryable()
            .FirstOrDefaultAsync(r => r.EquipmentId == equipmentId &&
                                     r.PeriodStart == from && r.PeriodEnd == to);

        if (roi == null)
        {
            roi = await CalculateROIAsync(equipment, from, to);
        }

        return MapToReportDto(roi, equipment);
    }

    public async Task<FleetROISummaryDto> GetFleetROISummaryAsync(int companyId, DateTime from, DateTime to)
    {
        var equipment = await _equipmentRepository.AsQueryable()
            .Where(e => e.CompanyId == companyId)
            .ToListAsync();

        var reports = new List<EquipmentROIReportDto>();

        foreach (var eq in equipment)
        {
            try
            {
                var report = await GetEquipmentROIAsync(eq.Id, from, to);
                reports.Add(report);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to calculate ROI for equipment {Id}", eq.Id);
            }
        }

        return new FleetROISummaryDto(
            TotalEquipment: equipment.Count,
            ExcellentCount: reports.Count(r => r.ROI_Percentage >= 50),
            GoodCount: reports.Count(r => r.ROI_Percentage >= 10 && r.ROI_Percentage < 50),
            PoorCount: reports.Count(r => r.ROI_Percentage < 0),
            TotalCosts: reports.Sum(r => r.TotalCost),
            TotalRevenue: reports.Sum(r => r.TotalRevenue),
            TotalProfit: reports.Sum(r => r.TotalRevenue - r.TotalCost),
            AverageROI: reports.Any() ? reports.Average(r => r.ROI_Percentage) : 0,
            AverageUtilization: reports.Where(r => r.UtilizationRate.HasValue).Select(r => r.UtilizationRate!.Value).DefaultIfEmpty(0).Average(),
            EquipmentReports: reports
        );
    }

    public async Task<List<EquipmentROIReportDto>> GetProjectEquipmentROIAsync(int projectId, DateTime from, DateTime to)
    {
        var assignments = await _assignmentRepository.AsQueryable()
            .Include(a => a.Equipment)
            .Where(a => a.ProjectId == projectId)
            .ToListAsync();

        var equipmentIds = assignments.Where(a => a.EquipmentId.HasValue).Select(a => a.EquipmentId!.Value).Distinct().ToList();
        var reports = new List<EquipmentROIReportDto>();

        foreach (var eqId in equipmentIds)
        {
            try
            {
                var report = await GetEquipmentROIAsync(eqId, from, to);
                reports.Add(report);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to calculate ROI for equipment {Id}", eqId);
            }
        }

        return reports;
    }

    public async Task<EquipmentROIUtilizationDto> GetEquipmentUtilizationAsync(int equipmentId, DateTime from, DateTime to)
    {
        var equipment = await _equipmentRepository.GetByIdAsync(equipmentId);
        if (equipment == null)
            throw new ArgumentException("Equipment not found");

        var assignments = await _assignmentRepository.AsQueryable()
            .Where(a => a.EquipmentId == equipmentId &&
                       a.StartDate >= from && a.StartDate <= to)
            .ToListAsync();

        var totalHours = assignments.Sum(a => (decimal?)a.HoursWorked) ?? 0;
        var projectIds = assignments.Select(a => a.ProjectId).Distinct().Count();

        // Calculate available hours (assuming 8 hours/day, 22 days/month)
        var days = (to - from).Days;
        var availableHours = days * 8m;

        var utilizationRate = availableHours > 0 ? (totalHours / availableHours) * 100 : 0;
        var avgHoursPerProject = projectIds > 0 ? totalHours / projectIds : 0;

        return new EquipmentROIUtilizationDto(
            EquipmentId: equipmentId,
            EquipmentName: equipment.Name,
            PeriodStart: from,
            PeriodEnd: to,
            TotalHoursWorked: totalHours,
            AvailableHours: availableHours,
            UtilizationRate: utilizationRate,
            ProjectsWorkedOn: projectIds,
            AverageHoursPerProject: avgHoursPerProject
        );
    }

    public async Task<List<EquipmentROIUtilizationDto>> GetFleetUtilizationAsync(int companyId, DateTime from, DateTime to)
    {
        var equipment = await _equipmentRepository.AsQueryable()
            .Where(e => e.CompanyId == companyId)
            .ToListAsync();

        var utilizations = new List<EquipmentROIUtilizationDto>();

        foreach (var eq in equipment)
        {
            try
            {
                var utilization = await GetEquipmentUtilizationAsync(eq.Id, from, to);
                utilizations.Add(utilization);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to calculate utilization for equipment {Id}", eq.Id);
            }
        }

        return utilizations;
    }

    public async Task<EquipmentCostBreakdownDto> GetCostBreakdownAsync(int equipmentId, DateTime from, DateTime to)
    {
        var equipment = await _equipmentRepository.GetByIdAsync(equipmentId);
        if (equipment == null)
            throw new ArgumentException("Equipment not found");

        var breakdowns = await _costBreakdownRepository.AsQueryable()
            .Where(c => c.EquipmentId == equipmentId &&
                       c.Date >= from && c.Date <= to)
            .OrderByDescending(c => c.Date)
            .ToListAsync();

        var costsByCategory = breakdowns
            .GroupBy(c => c.CostType)
            .ToDictionary(g => g.Key, g => g.Sum(c => c.Amount));

        return new EquipmentCostBreakdownDto(
            EquipmentId: equipmentId,
            EquipmentName: equipment.Name,
            PeriodStart: from,
            PeriodEnd: to,
            Costs: breakdowns.Select(MapCostBreakdownItem).ToList(),
            CostsByCategory: costsByCategory
        );
    }

    public async Task<List<ROITrendDto>> GetROITrendsAsync(int equipmentId, int months = 12)
    {
        var trends = new List<ROITrendDto>();
        var endDate = DateTime.UtcNow;
        var startDate = endDate.AddMonths(-months);

        for (var date = startDate; date <= endDate; date = date.AddMonths(1))
        {
            var monthStart = new DateTime(date.Year, date.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            try
            {
                var roi = await _roiRepository.AsQueryable()
                    .FirstOrDefaultAsync(r => r.EquipmentId == equipmentId &&
                                             r.PeriodStart == monthStart && r.PeriodEnd == monthEnd);

                if (roi != null)
                {
                    trends.Add(new ROITrendDto(
                        Date: monthStart,
                        ROI_Percentage: roi.ROI_Percentage,
                        TotalCost: roi.TotalCost,
                        TotalRevenue: roi.WorkValue + roi.RentalIncome,
                        HoursWorked: roi.HoursWorked
                    ));
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get ROI trend for {Date}", monthStart);
            }
        }

        return trends;
    }

    public async Task GenerateMonthlyROIReportsAsync(int companyId)
    {
        var equipment = await _equipmentRepository.AsQueryable()
            .Where(e => e.CompanyId == companyId)
            .ToListAsync();

        var lastMonth = DateTime.UtcNow.AddMonths(-1);
        var from = new DateTime(lastMonth.Year, lastMonth.Month, 1);
        var to = from.AddMonths(1).AddDays(-1);

        foreach (var eq in equipment)
        {
            try
            {
                await CalculateROIAsync(eq, from, to);
                _logger.LogInformation("Generated monthly ROI report for equipment {Id}", eq.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate ROI report for equipment {Id}", eq.Id);
            }
        }
    }

    #region Private Methods

    private async Task<EquipmentROI> CalculateROIAsync(Equipment equipment, DateTime from, DateTime to)
    {
        // Get maintenance costs
        var maintenance = await _maintenanceRepository.AsQueryable()
            .Where(m => m.EquipmentId == equipment.Id &&
                       m.ScheduledDate >= from && m.ScheduledDate <= to)
            .ToListAsync();

        var maintenanceCost = maintenance.Sum(m => m.Cost) ?? 0;

        // Get assignments for work value and hours
        var assignments = await _assignmentRepository.AsQueryable()
            .Where(a => a.EquipmentId == equipment.Id &&
                       a.StartDate >= from && a.StartDate <= to)
            .ToListAsync();

        var workValue = assignments.Sum(a => a.WorkValue ?? 0);
        var hoursWorked = assignments.Sum(a => (decimal?)a.HoursWorked) ?? 0;
        var projectsCount = assignments.Select(a => a.ProjectId).Distinct().Count();

        // Calculate costs
        var fuelCost = assignments.Sum(a => a.FuelCost ?? 0);
        var operatorCost = assignments.Sum(a => a.OperatorCost ?? 0);
        var depreciationCost = CalculateDepreciation(equipment, from, to);
        var totalCost = maintenanceCost + fuelCost + operatorCost + depreciationCost;

        // Calculate metrics
        var totalRevenue = workValue;
        var costPerHour = hoursWorked > 0 ? totalCost / hoursWorked : 0;
        var revenuePerHour = hoursWorked > 0 ? totalRevenue / hoursWorked : 0;
        var profitPerHour = revenuePerHour - costPerHour;
        decimal roiPercentage = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

        var performanceRating = GetPerformanceRating(roiPercentage);

        var roi = new EquipmentROI
        {
            CompanyId = equipment.CompanyId,
            EquipmentId = equipment.Id,
            PeriodStart = from,
            PeriodEnd = to,
            FuelCost = fuelCost,
            MaintenanceCost = maintenanceCost,
            OperatorCost = operatorCost,
            DepreciationCost = depreciationCost,
            TotalCost = totalCost,
            WorkValue = workValue,
            HoursWorked = hoursWorked,
            ProjectsCount = projectsCount,
            CostPerHour = costPerHour,
            RevenuePerHour = revenuePerHour,
            ProfitPerHour = profitPerHour,
            ROI_Percentage = roiPercentage,
            PerformanceRating = performanceRating
        };

        await _roiRepository.AddAsync(roi);
        await _unitOfWork.SaveChangesAsync();

        return roi;
    }

    private static decimal CalculateDepreciation(Equipment equipment, DateTime from, DateTime to)
    {
        if (!equipment.PurchasePrice.HasValue || equipment.PurchasePrice.Value == 0)
            return 0;

        // Straight-line depreciation over 5 years
        var usefulLifeYears = 5;
        var annualDepreciation = equipment.PurchasePrice.Value / usefulLifeYears;
        var months = ((to.Year - from.Year) * 12 + to.Month - from.Month) + 1;
        var monthlyDepreciation = annualDepreciation / 12;

        return monthlyDepreciation * months;
    }

    private static PerformanceRating GetPerformanceRating(decimal roiPercentage)
    {
        if (roiPercentage >= 50) return PerformanceRating.Excellent;
        if (roiPercentage >= 25) return PerformanceRating.VeryGood;
        if (roiPercentage >= 10) return PerformanceRating.Good;
        if (roiPercentage >= 0) return PerformanceRating.Acceptable;
        return PerformanceRating.Poor;
    }

    private static EquipmentROIReportDto MapToReportDto(EquipmentROI r, Equipment e) => new(
        EquipmentId: r.EquipmentId,
        EquipmentName: e.Name,
        EquipmentType: e.EquipmentType?.Name ?? "",
        EquipmentCode: e.EquipmentType?.Code ?? "",
        PeriodStart: r.PeriodStart,
        PeriodEnd: r.PeriodEnd,
        TotalMaintenanceCost: r.MaintenanceCost,
        TotalFuelCost: r.FuelCost,
        TotalOperatingCost: r.OperatorCost + r.InsuranceCost + r.OtherCosts,
        TotalDepreciationCost: r.DepreciationCost,
        TotalCost: r.TotalCost,
        TotalWorkValue: r.WorkValue,
        TotalRentalIncome: r.RentalIncome,
        TotalRevenue: r.WorkValue + r.RentalIncome,
        TotalHoursWorked: r.HoursWorked,
        ProjectsCount: r.ProjectsCount,
        CostPerHour: r.CostPerHour,
        RevenuePerHour: r.RevenuePerHour,
        ProfitPerHour: r.ProfitPerHour,
        ROI_Percentage: r.ROI_Percentage,
        UtilizationRate: r.UtilizationRate,
        PerformanceRating: r.PerformanceRating.ToString(),
        PerformanceRatingArabic: GetPerformanceRatingArabic(r.PerformanceRating)
    );

    private static CostBreakdownItemDto MapCostBreakdownItem(EquipmentCostBreakdown c) => new(
        Date: c.Date,
        CostType: c.CostType,
        CostTypeDisplayName: GetCostTypeDisplayName(c.CostType),
        Description: c.Description,
        Amount: c.Amount,
        Currency: c.Currency,
        SourceId: c.SourceId,
        SourceType: c.SourceType
    );

    private static string GetPerformanceRatingArabic(PerformanceRating rating) => rating switch
    {
        PerformanceRating.Excellent => "ممتاز",
        PerformanceRating.VeryGood => "جيد جداً",
        PerformanceRating.Good => "جيد",
        PerformanceRating.Acceptable => "مقبول",
        PerformanceRating.Poor => "ضعيف",
        _ => rating.ToString()
    };

    private static string GetCostTypeDisplayName(string costType) => costType?.ToLower() switch
    {
        "fuel" => "وقود",
        "maintenance" => "صيانة",
        "operator" => "مشغل",
        "insurance" => "تأمين",
        "depreciation" => "إهلاك",
        "other" => "أخرى",
        _ => costType ?? ""
    };

    #endregion
}
