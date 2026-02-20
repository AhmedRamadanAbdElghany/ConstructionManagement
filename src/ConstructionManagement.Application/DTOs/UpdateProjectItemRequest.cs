// Application/DTOs/UpdateProjectItemRequest.cs
public record UpdateProjectItemRequest(
    string? ItemName,
    string? Description,
    string? Status,
    DateTime? StartDate,
    DateTime? EndDate,
    int? PhaseId);
