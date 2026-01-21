using Microsoft.AspNetCore.Authorization;

namespace ConstructionManagement.Infrastructure.Authorization;

public class ProjectRoleRequirement : IAuthorizationRequirement
{
    public string RequiredRole { get; }

    public ProjectRoleRequirement(string requiredRole)
    {
        RequiredRole = requiredRole;
    }
}