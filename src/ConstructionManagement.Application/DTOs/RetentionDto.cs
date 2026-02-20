namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for retention schedule list item.
/// </summary>
public record RetentionListItemDto(
    int Id,
    int ProjectId,
    string ProjectName,
    int ProgressInvoiceId,
    string InvoiceNumber,
    decimal RetentionAmount,
    string Currency,
    DateTime RetentionDate,
    DateTime ReleaseDate,
    string Status,
    string StatusDisplayName,
    decimal ReleasedAmount,
    decimal RemainingAmount,
    int DaysUntilRelease,
    bool IsOverdue
);

/// <summary>
/// DTO for full retention schedule details.
/// </summary>
public record RetentionDto(
    int Id,
    int ProjectId,
    string ProjectName,
    int ProgressInvoiceId,
    string InvoiceNumber,
    decimal RetentionAmount,
    string Currency,
    DateTime RetentionDate,
    int RetentionPeriodMonths,
    DateTime ReleaseDate,
    DateTime? ActualReleaseDate,
    string Status,
    string StatusDisplayName,
    decimal ReleasedAmount,
    decimal RemainingAmount,
    string? Notes,
    int? ReleasedByUserId,
    string? ReleasedByFullName,
    DateTime? ReleasedAt,
    int ReminderCount,
    DateTime? LastReminderDate
);

/// <summary>
/// DTO for creating a retention schedule.
/// </summary>
public record CreateRetentionRequest(
    int ProjectId,
    int ProgressInvoiceId,
    decimal RetentionAmount,
    string? Currency = null,
    DateTime? RetentionDate = null,
    int RetentionPeriodMonths = 6,
    string? Notes = null
);

/// <summary>
/// DTO for releasing retention.
/// </summary>
public record ReleaseRetentionRequest(
    decimal? Amount = null, // For partial release
    string? Notes = null
);

/// <summary>
/// DTO for retention summary.
/// </summary>
public record RetentionSummaryDto(
    int TotalRetentions,
    int HeldCount,
    int DueForReleaseCount,
    int ReleasedCount,
    decimal TotalHeldAmount,
    decimal TotalReleasedAmount,
    decimal TotalPendingAmount,
    List<RetentionListItemDto> DueForRelease
);
