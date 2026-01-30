namespace ConstructionManagement.Domain.Entities
{
    public class Permission : BaseEntity, ITenantEntity
    {
        public string Name { get; set; } = string.Empty; // "CanReviewMedia"
        public string? Description { get; set; }

        /// <summary>
        /// Tenant identifier for data isolation
        /// </summary>
        public string TenantId { get; set; } = "ConstructionDB";

        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public virtual ICollection<ProjectRolePermission> ProjectRolePermissions { get; set; } = new List<ProjectRolePermission>();
    }
}
