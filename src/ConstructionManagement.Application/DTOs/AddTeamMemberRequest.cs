// Application/DTOs/AddTeamMemberRequest.cs
namespace ConstructionManagement.Application.DTOs
{
    public record AddTeamMemberRequest(
    int UserID,
    int RoleID,
    int? ReportsToUserID);
}