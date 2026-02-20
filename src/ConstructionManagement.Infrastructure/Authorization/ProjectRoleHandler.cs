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

        // 4. Resolve ProjectId from various sources (Route, Design, Category, Item)
        if (httpContext.Request.RouteValues["projectId"] != null && int.TryParse(httpContext.Request.RouteValues["projectId"]!.ToString(), out var pId))
        {
            projectId = pId;
        }
        else if (httpContext.Request.RouteValues["itemId"] != null && int.TryParse(httpContext.Request.RouteValues["itemId"]!.ToString(), out var itemId))
        {
            projectId = await db.ProjectItems.Where(i => i.Id == itemId).Select(i => i.ProjectId).FirstOrDefaultAsync();
        }
        else if (httpContext.Request.RouteValues["categoryId"] != null && int.TryParse(httpContext.Request.RouteValues["categoryId"]!.ToString(), out var catId))
        {
            projectId = await db.DesignCategories.Where(c => c.Id == catId).Select(c => c.ProjectId).FirstOrDefaultAsync();
        }
        else if (httpContext.Request.RouteValues["designId"] != null && int.TryParse(httpContext.Request.RouteValues["designId"]!.ToString(), out var dId))
        {
            projectId = await db.Designs.Where(d => d.Id == dId).Select(d => d.ProjectId).FirstOrDefaultAsync();
        }

        if (projectId == 0) projectId = null;

        // 5. Bypass for CompanyAdmin if they belong to the same company
        if (context.User.IsInRole("CompanyAdmin"))
        {
            var companyIdClaim = context.User.FindFirst("companyId");
            if (companyIdClaim != null && int.TryParse(companyIdClaim.Value, out var userCompanyId))
            {
                if (projectId != null)
                {
                    var proj = await db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
                    if (proj != null && proj.CompanyId == userCompanyId)
                    {
                        context.Succeed(requirement);
                        return;
                    }
                }
                else
                {
                    if (httpContext.Request.RouteValues["companyId"] != null && int.TryParse(httpContext.Request.RouteValues["companyId"]!.ToString(), out var routeCompanyId))
                    {
                        if (routeCompanyId == userCompanyId)
                        {
                            context.Succeed(requirement);
                            return;
                        }
                    }
                }
            }
        }

        if (projectId == null) return;

        // 6. Check if user is Project Owner
        var projOwner = await db.Projects.FindAsync(projectId);
        if (projOwner != null && projOwner.OwnerUserId == userId)
        {
            context.Succeed(requirement);
            return;
        }

        // 7. Check Project-Specific Permissions
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
