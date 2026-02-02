
public record CreateProjectRequest(
    string ProjectName,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    int? GeneralManagerUserId,
    string AccountingSystem,
    decimal? TotalContractValue,
    UpdateProjectSettingsRequest? Settings = null);
