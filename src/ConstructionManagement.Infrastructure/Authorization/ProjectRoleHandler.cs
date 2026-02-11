using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;

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
        if (httpContext == null) return;

        // 1. استخراج الـ UserId من الـ Claims
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return;
        var userId = int.Parse(userIdClaim.Value);

        // 2. SuperAdmin Bypass
        // If the user is a SuperAdmin, grant full access regardless of project membership
        if (context.User.IsInRole("SuperAdmin"))
        {
            context.Succeed(requirement);
            return;
        }

        // 3. استخدام الـ Scope للوصول للـ DbContext
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        int? projectId = null;

        // 4. استخراج الـ ProjectId من مسار الـ URL
        if (httpContext.Request.RouteValues["projectId"] != null && int.TryParse(httpContext.Request.RouteValues["projectId"]!.ToString(), out var pId))
        {
            projectId = pId;
        }
        else if (httpContext.Request.RouteValues["itemId"] != null && int.TryParse(httpContext.Request.RouteValues["itemId"]!.ToString(), out var itemId))
        {
            // جلب الـ ProjectId من خلال الـ BOQItem
            projectId = await db.BOQItems
                .Where(i => i.Id == itemId)
                .Select(i => i.ProjectId)
                .FirstOrDefaultAsync();
            
            if (projectId == 0) projectId = null; // لم يتم العثور عليه
        }

        if (projectId == null) return;

        // 5. التحقق مما إذا كان المستخدم هو مالك المشروع (Owner)
        var project = await db.Projects.FindAsync(projectId);
        if (project != null && project.OwnerUserId == userId)
        {
            context.Succeed(requirement);
            return;
        }

        // 6. البحث في شجرة الصلاحيات (User -> TeamMember -> Roles -> Permissions)
        // Check for exact permission match OR the "All" wildcard
        var hasPermission = await db.ProjectTeamMembers
            .Where(m => m.ProjectId == projectId && m.UserId == userId)
            .SelectMany(m => m.ProjectTeamRoles)
            .Select(tr => tr.ProjectRole)
            .SelectMany(pr => pr.Permissions)
            .AnyAsync(rp => rp.Permission.Name == requirement.PermissionName || rp.Permission.Name == "All");

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}
