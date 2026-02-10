using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

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
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Project Project { get; set; } = null!;


    /// <summary>
    /// The user who is a member of this project
    /// </summary>
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual User User { get; set; } = null!;


    // -- Reporting Structure ---------------------------------------------------

    /// <summary>
    /// Optional: the user this team member reports to **within this project**
    /// (can be different from company-wide reporting)
    /// </summary>
    public int? ReportsToUserId { get; set; }

    [ForeignKey(nameof(ReportsToUserId))]
    [System.Text.Json.Serialization.JsonIgnore]
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

    /// Optional helpers – useful in queries / views
    [NotMapped]
    public bool HasAnyRole => ProjectTeamRoles.Any();

    [NotMapped]
    public bool IsManagerOrAbove => Roles.Any(r => r.Name is "ProjectManager" or "GeneralManager" or "Approver");

    // -- Analytics Properties (for HR and resource tracking) --------------------------------

    /// <summary>
    /// Employment status for analytics purposes
    /// </summary>
    public EmploymentStatus Status { get; set; } = EmploymentStatus.Active;

    /// <summary>
    /// Job title/position of the team member
    /// </summary>
    public string JobTitle { get; set; } = string.Empty;

    /// <summary>
    /// Hours worked by this team member (tracked for analytics)
    /// </summary>
    public decimal HoursWorked { get; set; } = 0;

    /// <summary>
    /// Salary of the team member (for cost analytics)
    /// </summary>
    public decimal Salary { get; set; } = 0;

    // -- Computed properties from User entity ----------------------------------------

    /// <summary>
    /// First name from linked User entity
    /// </summary>
    [NotMapped]
    public string FirstName => User?.FirstName ?? string.Empty;

    /// <summary>
    /// Last name from linked User entity
    /// </summary>
    [NotMapped]
    public string LastName => User?.LastName ?? string.Empty;
}
