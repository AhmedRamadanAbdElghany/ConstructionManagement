using Microsoft.AspNetCore.Authorization;

namespace ConstructionManagement.Infrastructure.Authorization;

public class ProjectRoleRequirement : IAuthorizationRequirement
{
    public string PermissionName { get; }

    public ProjectRoleRequirement(string permissionName)
    {
        PermissionName = permissionName;
    }
}
