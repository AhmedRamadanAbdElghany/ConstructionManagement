namespace ConstructionManagement.Application.DTOs
{
    public record WorkerProjectRoleDto(
        int ProjectID,
        string ProjectName,
        List<string> Roles,           // e.g. ["SiteEngineer", "Approver"]
        DateTime AssignedDate);
}
