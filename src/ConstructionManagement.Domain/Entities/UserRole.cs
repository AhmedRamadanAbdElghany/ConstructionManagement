// Domain/Entities/UserRole.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

// =============================================
// UserRole – many-to-many bridge between User and Role
// =============================================
// More explicit style with composite PK (no separate Id column)
// More explicit style with composite PK (no separate Id column)
public class UserRole : ITenantEntity
{
    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public string TenantId { get; set; } = "ConstructionDB";

    public int UserId { get; set; }
    public int RoleId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    [ForeignKey(nameof(RoleId))]
    public virtual Role Role { get; set; } = null!;

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // If using Fluent API ? you would configure composite key in OnModelCreating:
    // modelBuilder.Entity<UserRole>()
    //     .HasKey(ur => new { ur.UserId, ur.RoleId });
}
