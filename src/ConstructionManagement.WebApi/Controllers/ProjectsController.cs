using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using System.Security.Claims;

[Authorize]
[Route("api/projects")]
[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService) => _projectService = projectService;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var projectId = await _projectService.CreateProjectAsync(request, userId);
        return CreatedAtAction(nameof(Get), new { projectId }, new { projectId });
    }

    [HttpGet("{projectId}")]
    [Authorize(Policy = "CanCreateProject")]
    public async Task<IActionResult> Get(int projectId)
    {
        var project = await _projectService.GetProjectByIdAsync(projectId);
        return project != null ? Ok(project) : NotFound();
    }

    [HttpPut("{projectId}")]
    [Authorize(Policy = "CanEditProject")]  // Policy جديدة
    public async Task<IActionResult> UpdateProject(int projectId, [FromBody] UpdateProjectRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var success = await _projectService.UpdateProjectAsync(projectId, request, userId);

        return success ? Ok("تم تعديل المشروع بنجاح") : NotFound("المشروع غير موجود");
    }

    [HttpPut("{projectId}/close")]
    [Authorize(Policy = "CanCloseProject")]  // Policy جديدة
    public async Task<IActionResult> CloseProject(int projectId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var success = await _projectService.CloseProjectAsync(projectId, userId);

        return success ? Ok("تم إغلاق المشروع بنجاح") : BadRequest("لا يمكن إغلاق المشروع");
    }

    [HttpGet("my-projects")]
    public async Task<IActionResult> GetMyProjects()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var projects = await _projectService.GetProjectsByUserAsync(userId);
        return Ok(projects);
    }
}