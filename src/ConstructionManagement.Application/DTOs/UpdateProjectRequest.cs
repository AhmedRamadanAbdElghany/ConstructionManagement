namespace ConstructionManagement.Application.DTOs;

public record UpdateProjectRequest(
    string? ProjectName,
    string? Description,
    DateTime? StartDate,
    DateTime? EndDate,
    decimal? TotalContractValue,
    int? GeneralManagerUserId // أضفنا هذا الحقل لحل خطأ CS1061
);