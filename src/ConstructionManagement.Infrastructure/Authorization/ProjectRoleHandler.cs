using System.Security.Claims;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ConstructionManagement.Infrastructure.Authorization;

public class ProjectRoleHandler : AuthorizationHandler<ProjectRoleRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServiceScopeFactory _scopeFactory; // تأكد من وجود هذا السطر

    public ProjectRoleHandler(IHttpContextAccessor httpContextAccessor, IServiceScopeFactory scopeFactory)
    {
        _httpContextAccessor = httpContextAccessor;
        _scopeFactory = scopeFactory;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ProjectRoleRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;

        // 1. استخراج الـ ProjectId من مسار الـ URL
        if (httpContext?.Request.RouteValues["projectId"] is not string projectIdRaw || !int.TryParse(projectIdRaw, out var projectId))
            return;

        // 2. استخراج الـ UserId من الـ Claims
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return;

        var userId = int.Parse(userIdClaim.Value);

        // 3. استخدام الـ Scope للوصول للـ DbContext
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // 4. البحث في شجرة الصلاحيات (User -> TeamMember -> Roles -> Permissions)
        var hasPermission = await db.ProjectTeam
            .Where(m => m.ProjectId == projectId && m.UserId == userId)
            .SelectMany(m => m.ProjectTeamRoles)
            .Select(tr => tr.ProjectRole)
            .SelectMany(pr => pr.Permissions)
            .AnyAsync(rp => rp.Permission.Name == requirement.PermissionName); // تم تصحيح المسمى هنا

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}