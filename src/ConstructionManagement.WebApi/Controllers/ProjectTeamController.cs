using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[Route("api/projects/{projectId}/team")]
[ApiController]
public class ProjectTeamController : ControllerBase
{
    private readonly IProjectTeamService _projectTeamService;

    public ProjectTeamController(IProjectTeamService projectTeamService)
    {
        _projectTeamService = projectTeamService;
    }

    [HttpPost("members")]
    public async Task<IActionResult> AddMember(int projectId, [FromBody] AddTeamMemberRequest request)
    {
        var teamId = await _projectTeamService.AddTeamMemberAsync(
            projectId,
            request.UserID,
            request.ReportsToUserID);

        return CreatedAtAction(nameof(GetTeam), new { projectId }, new { teamId });
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole(int projectId, [FromBody] CreateProjectRoleRequest request)
    {
        var roleId = await _projectTeamService.CreateProjectRoleAsync(
            projectId,
            request.RoleName,
            request.Description);

        return Ok(new { roleId });
    }

    [HttpPost("{teamId}/assign-role")]
    public async Task<IActionResult> AssignRole(int teamId, [FromBody] AssignProjectRoleRequest request)
    {
        await _projectTeamService.AssignRoleToMemberAsync(teamId, request.ProjectRoleID);
        return Ok("تم تعيين الدور بنجاح");
    }

    [HttpGet]
    public async Task<IActionResult> GetTeam(int projectId)
    {
        var team = await _projectTeamService.GetProjectTeamAsync(projectId);
        return Ok(team);
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles(int projectId)
    {
        var roles = await _projectTeamService.GetProjectRolesAsync(projectId);
        return Ok(roles);
    }
}