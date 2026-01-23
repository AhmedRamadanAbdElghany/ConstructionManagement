using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Approval rule for a specific source type (photo upload / field visit note)
/// Can be project-wide (BOQItemId = null) or item-specific
/// </summary>
public class ProjectApprovalRule : BaseEntity
{
    // Primary Key inherited from BaseEntity → public int Id { get; set; }

    // The project this approval rule belongs to
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // Optional: if null → rule applies to the entire project
    // if set   → rule applies only to this specific BOQ item
    public int? BOQItemId { get; set; }

    [ForeignKey(nameof(BOQItemId))]
    public virtual BOQItem? BOQItem { get; set; }

    // What kind of upload/evidence this rule applies to
    public SourceType Source { get; set; }

    // Role names (usually from ProjectRole.Name)
    public string UploaderRole { get; set; } = string.Empty;   // who is allowed to upload/submit
    public string ApproverRole { get; set; } = string.Empty;   // who must approve it first

    // Escalation settings
    public int ResponseTimeoutHours { get; set; }              // after how many hours to escalate
    public string EscalationRole { get; set; } = string.Empty; // which role receives the escalation

    // Optional: useful inverse navigation (if you frequently query rules from project)
    // public virtual ICollection<ApprovalRequest> RelatedRequests { get; set; } = new List<ApprovalRequest>();
}