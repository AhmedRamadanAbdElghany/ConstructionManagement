using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Many-to-Many relationship between ProjectTeamMember and ProjectRole
/// Represents a specific role assignment for a team member in a project
/// </summary>
public class ProjectTeamRole : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    public int ProjectTeamMemberId { get; set; }

    [ForeignKey(nameof(ProjectTeamMemberId))]
    public virtual ProjectTeamMember ProjectTeamMember { get; set; } = null!;

    public int ProjectRoleId { get; set; }

    [ForeignKey(nameof(ProjectRoleId))]
    public virtual ProjectRole ProjectRole { get; set; } = null!;

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Optional: useful if you want to track who made the assignment
    // public int? AssignedByUserId { get; set; }
    // public virtual User? AssignedBy { get; set; }
}
