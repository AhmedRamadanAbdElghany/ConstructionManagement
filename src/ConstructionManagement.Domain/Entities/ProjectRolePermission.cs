using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities
{
    // Project-specific: ProjectRole ? Permission
    public class ProjectRolePermission : ITenantEntity
    {
        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public string TenantId { get; set; } = "ConstructionDB";

        [ForeignKey(nameof(ProjectRoleId))]
        public int ProjectRoleId { get; set; }
        [ForeignKey(nameof(PermissionId))]
        public int PermissionId { get; set; }

        public virtual ProjectRole ProjectRole { get; set; } = null!;
        public virtual Permission Permission { get; set; } = null!;
    }
}

