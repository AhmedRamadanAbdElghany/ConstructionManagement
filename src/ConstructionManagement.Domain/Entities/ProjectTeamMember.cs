using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a user's membership in a specific project
/// Links a user to a project, defines reporting line, and holds multiple roles
/// </summary>
public class ProjectTeamMember : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    // -- Project & User --------------------------------------------------------

    /// <summary>
    /// The project this membership belongs to
    /// </summary>
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    /// <summary>
    /// The user who is a member of this project
    /// </summary>
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    // -- Reporting Structure ---------------------------------------------------

    /// <summary>
    /// Optional: the user this team member reports to **within this project**
    /// (can be different from company-wide reporting)
    /// </summary>
    public int? ReportsToUserId { get; set; }

    [ForeignKey(nameof(ReportsToUserId))]
    public virtual User? ReportsTo { get; set; }

    // -- Roles (many-to-many via bridge table) ---------------------------------

    /// <summary>
    /// All roles assigned to this user **in this specific project**
    /// </summary>
    public virtual ICollection<ProjectTeamRole> ProjectTeamRoles { get; set; }
        = new List<ProjectTeamRole>();

    // -- Computed / Helper Properties (not persisted) --------------------------

    /// <summary>
    /// Convenience property: all active roles for this membership
    /// Used in services, authorization checks, UI display
    /// </summary>
    [NotMapped]
    public IEnumerable<ProjectRole> Roles => ProjectTeamRoles.Select(ptr => ptr.ProjectRole);

    // Optional helpers – useful in queries / views
    [NotMapped]
    public bool HasAnyRole => ProjectTeamRoles.Any();

    [NotMapped]
    public bool IsManagerOrAbove => Roles.Any(r => r.Name is "ProjectManager" or "GeneralManager" or "Approver");
}
