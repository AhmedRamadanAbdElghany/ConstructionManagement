namespace ConstructionManagement.Application.DTOs;

public record DailyLogDto(
    int ItemDailyLogID,
    DateTime LogDate,
    bool IsClosed,
    decimal? DailyProgressPercentage,
    string? ProgressNotes,
    string? ClosingNotes,
    DateTime? ClosedAt,
    string? ClosedByFullName
);