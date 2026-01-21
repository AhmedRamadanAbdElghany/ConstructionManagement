// Domain/Entities/Role.cs
namespace ConstructionManagement.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty; // "Approver", "Closer", "Viewer", "Admin", etc.
    public string? Description { get; set; }
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}