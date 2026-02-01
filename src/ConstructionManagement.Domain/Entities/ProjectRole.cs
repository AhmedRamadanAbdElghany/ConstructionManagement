using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Defines roles that can be assigned to users within a specific project
/// (project-specific roles – different from global/system roles)
/// </summary>
public class ProjectRole : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }

    // Primary Key inherited from BaseEntity ? public int Id { get; set; }

    // Which project owns this role definition
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // Role identifier / code (used in code & permissions)
    public string Name { get; set; } = string.Empty;           // e.g. "SiteEngineer", "SafetyOfficer", "QuantitySurveyor", "Approver"

    // Human-readable explanation (optional)
    public string? Description { get; set; }

    // -- Navigation properties -----------------------------------------------

    // All team members who have been assigned this role in this project
    public virtual ICollection<ProjectTeamRole> Assignments { get; set; }
        = new List<ProjectTeamRole>();

    // if you later want to define permissions per role
    public virtual ICollection<ProjectRolePermission> Permissions { get; set; } = new List<ProjectRolePermission>();
}
