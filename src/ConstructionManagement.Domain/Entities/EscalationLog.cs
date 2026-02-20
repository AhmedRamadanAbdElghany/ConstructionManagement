using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Log entry for escalation notifications sent due to delays, missing approvals,
/// or other critical events (project-level or item-specific)
/// </summary>
public class EscalationLog : BaseEntity, ICompanyEntity
{
    // Primary Key inherited from BaseEntity ? public int Id { get; set; }

    /// <summary>
    /// Company identifier for data isolation
    /// </summary>
    public int? CompanyId { get; set; }

    // Required: every escalation belongs to a project
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // Optional: specific Project item that caused the escalation
    // null ? escalation is for the entire project
    public int? ProjectItemId { get; set; }

    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem? ProjectItem { get; set; }

    // -- Escalation details ----------------------------------------------------
    public string EscalationType { get; set; } = string.Empty;   // "StartDelay", "EndDelay", "ApprovalTimeout", "BudgetOverrun", etc.

    // Who was notified / escalated to
    public int RecipientUserId { get; set; }

    [ForeignKey(nameof(RecipientUserId))]
    public virtual User Recipient { get; set; } = null!;

    public string Message { get; set; } = string.Empty;          // full text of the notification/escalation

    // Delivery method & timestamp
    public bool SentByEmail { get; set; } = false;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
