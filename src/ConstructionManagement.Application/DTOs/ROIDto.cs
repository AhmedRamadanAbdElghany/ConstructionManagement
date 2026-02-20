using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for equipment ROI report.
/// </summary>
public record EquipmentROIReportDto(
    int EquipmentId,
    string EquipmentName,
    string EquipmentType,
    string EquipmentCode,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    
    // Costs
    decimal TotalMaintenanceCost,
    decimal TotalFuelCost,
    decimal TotalOperatingCost,
    decimal TotalDepreciationCost,
    decimal TotalCost,
    
    // Revenue
    decimal TotalWorkValue,
    decimal TotalRentalIncome,
    decimal TotalRevenue,
    decimal TotalHoursWorked,
    int ProjectsCount,
    
    // Metrics
    decimal CostPerHour,
    decimal RevenuePerHour,
    decimal ProfitPerHour,
    decimal ROI_Percentage,
    decimal? UtilizationRate,
    string PerformanceRating,
    string PerformanceRatingArabic
);

/// <summary>
/// DTO for fleet ROI summary.
/// </summary>
public record FleetROISummaryDto(
    int TotalEquipment,
    int ExcellentCount,
    int GoodCount,
    int PoorCount,
    decimal TotalCosts,
    decimal TotalRevenue,
    decimal TotalProfit,
    decimal AverageROI,
    decimal AverageUtilization,
    List<EquipmentROIReportDto> EquipmentReports
);

/// <summary>
/// DTO for equipment cost breakdown.
/// </summary>
public record EquipmentCostBreakdownDto(
    int EquipmentId,
    string EquipmentName,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    List<CostBreakdownItemDto> Costs,
    Dictionary<string, decimal> CostsByCategory
);

/// <summary>
/// DTO for a single cost breakdown item.
/// </summary>
public record CostBreakdownItemDto(
    DateTime Date,
    string CostType,
    string CostTypeDisplayName,
    string? Description,
    decimal Amount,
    string Currency,
    int? SourceId,
    string? SourceType
);

/// <summary>
/// DTO for ROI filter.
/// </summary>
public record ROIFilterRequest(
    int? EquipmentId = null,
    int? ProjectId = null,
    DateTime? PeriodStart = null,
    DateTime? PeriodEnd = null,
    PerformanceRating? MinRating = null
);

/// <summary>
/// DTO for equipment utilization.
/// </summary>
public record EquipmentROIUtilizationDto(
    int EquipmentId,
    string EquipmentName,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    decimal TotalHoursWorked,
    decimal AvailableHours,
    decimal UtilizationRate,
    int ProjectsWorkedOn,
    decimal AverageHoursPerProject
);

/// <summary>
/// DTO for ROI trend data.
/// </summary>
public record ROITrendDto(
    DateTime Date,
    decimal ROI_Percentage,
    decimal TotalCost,
    decimal TotalRevenue,
    decimal HoursWorked
);
