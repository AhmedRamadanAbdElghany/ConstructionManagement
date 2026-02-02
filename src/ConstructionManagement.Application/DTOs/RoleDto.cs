using System.Collections.Generic;

namespace ConstructionManagement.Application.DTOs
{
    public class RoleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? CompanyId { get; set; }
        public List<PermissionDto> Permissions { get; set; } = new();
    }

    public record UpdateRolePermissionsRequest(int RoleId, List<int> PermissionIds);
}
