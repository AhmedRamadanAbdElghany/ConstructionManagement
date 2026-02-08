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

        // 2. استخدام الـ Scope للوصول للـ DbContext
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        int? projectId = null;

        // 3. استخراج الـ ProjectId من مسار الـ URL
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

        // 3.5. التحقق مما إذا كان المستخدم هو مالك المشروع (Owner)
        var project = await db.Projects.FindAsync(projectId);
        if (project != null && project.OwnerUserId == userId)
        {
            context.Succeed(requirement);
            return;
        }

        // 4. البحث في شجرة الصلاحيات (User -> TeamMember -> Roles -> Permissions)
        var hasPermission = await db.ProjectTeamMembers
            .Where(m => m.ProjectId == projectId && m.UserId == userId)
            .SelectMany(m => m.ProjectTeamRoles)
            .Select(tr => tr.ProjectRole)
            .SelectMany(pr => pr.Permissions)
            .AnyAsync(rp => rp.Permission.Name == requirement.PermissionName);

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}
