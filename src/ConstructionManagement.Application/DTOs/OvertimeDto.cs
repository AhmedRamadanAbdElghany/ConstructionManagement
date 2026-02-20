namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for overtime rule.
/// </summary>
public record OvertimeRuleDto(
    int Id,
    string Name,
    string? Description,
    decimal Multiplier,
    string? ApplicableDay,
    string? StartTime,
    string? EndTime,
    bool IsActive,
    int Priority
);

/// <summary>
/// DTO for creating an overtime rule.
/// </summary>
public record CreateOvertimeRuleRequest(
    string Name,
    string? Description = null,
    decimal Multiplier = 1.5m,
    DayOfWeek? ApplicableDay = null,
    TimeSpan? StartTime = null,
    TimeSpan? EndTime = null,
    int Priority = 0
);

/// <summary>
/// DTO for overtime record list item.
/// </summary>
public record OvertimeListItemDto(
    int Id,
    int UserId,
    string UserFullName,
    int? ProjectId,
    string? ProjectName,
    DateTime Date,
    decimal Hours,
    decimal Multiplier,
    decimal CalculatedAmount,
    string Currency,
    string Status,
    string StatusDisplayName,
    string? Reason
);

/// <summary>
/// DTO for full overtime record details.
/// </summary>
public record OvertimeDto(
    int Id,
    int UserId,
    string UserFullName,
    int? ProjectId,
    string? ProjectName,
    DateTime Date,
    TimeSpan StartTime,
    TimeSpan EndTime,
    decimal Hours,
    int? OvertimeRuleId,
    string? RuleName,
    decimal Multiplier,
    decimal HourlyRate,
    decimal CalculatedAmount,
    string Currency,
    string Status,
    string StatusDisplayName,
    string? Reason,
    int? ApprovedByUserId,
    string? ApprovedByFullName,
    DateTime? ApprovedAt,
    string? RejectionReason,
    int? PayrollId
);

/// <summary>
/// DTO for creating an overtime request.
/// </summary>
public record CreateOvertimeRequest(
    int UserId,
    DateTime Date,
    TimeSpan StartTime,
    TimeSpan EndTime,
    int? ProjectId = null,
    string? Reason = null
);

/// <summary>
/// DTO for approving overtime.
/// </summary>
public record ApproveOvertimeRequest(
    string? Notes = null
);

/// <summary>
/// DTO for overtime summary.
/// </summary>
public record OvertimeSummaryDto(
    int TotalRecords,
    int PendingCount,
    int ApprovedCount,
    int RejectedCount,
    decimal TotalHours,
    decimal TotalAmount,
    decimal PendingAmount,
    decimal ApprovedAmount,
    List<OvertimeListItemDto> PendingApprovals
);

/// <summary>
/// DTO for overtime calculation result.
/// </summary>
public record OvertimeCalculationDto(
    decimal Hours,
    decimal Multiplier,
    decimal HourlyRate,
    decimal CalculatedAmount,
    string AppliedRule
);
