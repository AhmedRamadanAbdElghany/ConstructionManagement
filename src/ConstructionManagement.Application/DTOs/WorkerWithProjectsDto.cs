namespace ConstructionManagement.Application.DTOs
{
    public record WorkerWithProjectsDto(
        int UserID,
        string FullName,
        string? Email,
        List<WorkerProjectRoleDto> Projects);
}
