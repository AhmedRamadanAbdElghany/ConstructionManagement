using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a dedicated activity log / audit trail for project-related actions.
/// </summary>
public class ActivityLog : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// Tenant identifier for data isolation
    /// </summary>
    public int? CompanyId { get; set; }
    
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// The project this activity belongs to.
    /// </summary>
    public int ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }

    /// <summary>
    /// The user who performed the activity.
    /// </summary>
    public int? UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    /// <summary>
    /// Snapshot of the username at the time of the activity.
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// Category of the activity (e.g., "Log", "Setting", "Financial", "Team", "Media").
    /// </summary>
    public string ActivityType { get; set; } = string.Empty;

    /// <summary>
    /// The specific action performed (e.g., "Updated status", "Approved invoice").
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of the change or additional context.
    /// </summary>
    public string Details { get; set; } = string.Empty;
}
