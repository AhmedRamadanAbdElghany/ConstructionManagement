// Domain/Entities/Role.cs
namespace ConstructionManagement.Domain.Entities;

public class Role : BaseEntity, ITenantEntity
{
    public string Name { get; set; } = string.Empty; // "Approver", "Closer", "Viewer", "Admin", etc.
    public string? Description { get; set; }

    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public string TenantId { get; set; } = "ConstructionDB";

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<RolePermission> Permissions { get; set; } = new List<RolePermission>();
}
