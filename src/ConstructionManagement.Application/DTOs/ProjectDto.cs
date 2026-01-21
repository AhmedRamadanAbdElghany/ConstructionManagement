namespace ConstructionManagement.Application.DTOs
{

    public record ProjectDto(
        int ProjectID,
        string ProjectName,
        string? Description,
        DateTime? StartDate,
        DateTime? EndDate,
        int OwnerUserID,
        int? GeneralManagerUserID,
        string? AccountingSystem,
        decimal? TotalContractValue,
        DateTime CreatedAt,
        bool IsClosed,           // ← new
        DateTime? ClosedAt       // ← new
    );
}