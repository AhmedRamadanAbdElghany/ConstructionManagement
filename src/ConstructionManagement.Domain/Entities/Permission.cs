namespace ConstructionManagement.Domain.Entities
{
    public class Permission : BaseEntity, ICompanyEntity
    {
        public string Name { get; set; } = string.Empty; // "CanReviewMedia"
        public string? Description { get; set; }

        public int? CompanyId { get; set; }

        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public virtual ICollection<ProjectRolePermission> ProjectRolePermissions { get; set; } = new List<ProjectRolePermission>();
    }
}
