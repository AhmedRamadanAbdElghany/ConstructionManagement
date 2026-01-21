using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Authorization;

public class ProjectRoleHandler : AuthorizationHandler<ProjectRoleRequirement>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProjectRoleHandler(
        ApplicationDbContext dbContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ProjectRoleRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return;

        // بديل موثوق: parse الـ path يدويًا
        var path = httpContext.Request.Path.Value ?? string.Empty;

        // افترض الـ route شكلها: /api/projects/{projectId}/...
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Length < 3 || !int.TryParse(segments[2], out var projectId)) // index 2 = projectId
        {
            // لو الـ path مش مطابق للشكل المتوقع → نرجع بدون نجاح
            return;
        }

        var userIdClaim = context.User.FindFirst("sub")?.Value
                       ?? context.User.FindFirst("nameid")?.Value
                       ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            return;

        var hasRole = await _dbContext.ProjectTeamRoles
            .AnyAsync(tr =>
                tr.ProjectTeamMember.UserId == userId &&
                tr.ProjectTeamMember.Id == projectId &&
                tr.ProjectRole.Name == requirement.RequiredRole);

        if (hasRole)
        {
            context.Succeed(requirement);
        }
    }
}