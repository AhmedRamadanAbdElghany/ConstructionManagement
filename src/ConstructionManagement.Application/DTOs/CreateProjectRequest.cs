
public record CreateProjectRequest(
    string ProjectName,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    int? GeneralManagerUserId,
    string AccountingSystem,           // Measured, Supervision, Mixed, Other
    decimal? TotalContractValue);