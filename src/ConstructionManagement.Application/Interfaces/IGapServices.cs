using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service for managing retention schedules.
/// </summary>
public interface IRetentionService
{
    // CRUD
    Task<int> CreateRetentionScheduleAsync(CreateRetentionRequest request, int createdByUserId, int companyId);
    Task<RetentionDto?> GetRetentionByIdAsync(int retentionId);
    Task<List<RetentionListItemDto>> GetRetentionsForProjectAsync(int projectId);
    Task<RetentionSummaryDto> GetRetentionSummaryAsync(int companyId);
    
    // Release
    Task<bool> ReleaseRetentionAsync(int retentionId, ReleaseRetentionRequest request, int releasedByUserId);
    Task<bool> CancelRetentionAsync(int retentionId, string reason, int userId);
    
    // Background Jobs
    Task CheckDueRetentionsAsync();
    Task SendRetentionRemindersAsync();
    
    // Queries
    Task<List<RetentionListItemDto>> GetDueForReleaseAsync(int companyId);
    Task<List<RetentionListItemDto>> GetOverdueRetentionsAsync(int companyId);
}

/// <summary>
/// Service for managing overtime.
/// </summary>
public interface IOvertimeService
{
    // Rules
    Task<int> CreateOvertimeRuleAsync(CreateOvertimeRuleRequest request, int companyId);
    Task<List<OvertimeRuleDto>> GetOvertimeRulesAsync(int companyId);
    Task<OvertimeRuleDto?> GetApplicableRuleAsync(DateTime date, TimeSpan startTime, int companyId);
    
    // Records
    Task<int> SubmitOvertimeRequestAsync(CreateOvertimeRequest request, int createdByUserId, int companyId);
    Task<OvertimeDto?> GetOvertimeByIdAsync(int overtimeId);
    Task<List<OvertimeListItemDto>> GetOvertimeForUserAsync(int userId, DateTime? from = null, DateTime? to = null);
    Task<OvertimeSummaryDto> GetOvertimeSummaryAsync(int? projectId = null, int? companyId = null);
    
    // Approval
    Task<bool> ApproveOvertimeAsync(int overtimeId, int approverId, string? notes = null);
    Task<bool> RejectOvertimeAsync(int overtimeId, int rejectorId, string reason);
    Task<List<OvertimeListItemDto>> GetPendingApprovalsAsync(int managerId);
    
    // Calculation
    Task<OvertimeCalculationDto> CalculateOvertimeAsync(int userId, DateTime date, TimeSpan startTime, TimeSpan endTime);
    Task<decimal> GetUserHourlyRateAsync(int userId);
}

/// <summary>
/// Service for equipment ROI analysis.
/// </summary>
public interface IROIAnalysisService
{
    // Reports
    Task<EquipmentROIReportDto> GetEquipmentROIAsync(int equipmentId, DateTime from, DateTime to);
    Task<FleetROISummaryDto> GetFleetROISummaryAsync(int companyId, DateTime from, DateTime to);
    Task<List<EquipmentROIReportDto>> GetProjectEquipmentROIAsync(int projectId, DateTime from, DateTime to);
    
    // Utilization
    Task<EquipmentROIUtilizationDto> GetEquipmentUtilizationAsync(int equipmentId, DateTime from, DateTime to);
    Task<List<EquipmentROIUtilizationDto>> GetFleetUtilizationAsync(int companyId, DateTime from, DateTime to);
    
    // Cost Breakdown
    Task<EquipmentCostBreakdownDto> GetCostBreakdownAsync(int equipmentId, DateTime from, DateTime to);
    
    // Trends
    Task<List<ROITrendDto>> GetROITrendsAsync(int equipmentId, int months = 12);
    
    // Background
    Task GenerateMonthlyROIReportsAsync(int companyId);
}
