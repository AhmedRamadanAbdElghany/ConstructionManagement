// Application/DTOs/ProjectTeamDto.cs
namespace ConstructionManagement.Application.DTOs
{
    // في ProjectTeamDto.cs
    public class ProjectTeamDto
    {
        public int TeamID { get; set; }
        public int UserID { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public int? ReportsToUserID { get; set; }
        public List<string> Roles { get; set; } = new();

        public ProjectTeamDto(int teamID, int userID, string userFullName, int? reportsToUserID, List<string> roles)
        {
            TeamID = teamID;
            UserID = userID;
            UserFullName = userFullName;
            ReportsToUserID = reportsToUserID;
            Roles = roles ?? new List<string>();
        }
        public ProjectTeamDto() { }
    }
}