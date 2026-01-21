public record CloseDailyLogRequest(
    decimal DailyProgressPercentage,     // 0–100, required at closing
    string? ProgressNotes,
    string? ClosingNotes);