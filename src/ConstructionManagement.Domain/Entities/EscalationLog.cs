using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Log entry for escalation notifications sent due to delays, missing approvals,
/// or other critical events (project-level or item-specific)
/// </summary>
public class EscalationLog : BaseEntity
{
    // Primary Key inherited from BaseEntity → public int Id { get; set; }

    // Required: every escalation belongs to a project
    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    // Optional: specific BOQ item that caused the escalation
    // null → escalation is for the entire project
    public int? BOQItemId { get; set; }

    [ForeignKey(nameof(BOQItemId))]
    public virtual BOQItem? BOQItem { get; set; }

    // ── Escalation details ────────────────────────────────────────────────────
    public string EscalationType { get; set; } = string.Empty;   // "StartDelay", "EndDelay", "ApprovalTimeout", "BudgetOverrun", etc.

    // Who was notified / escalated to
    public int RecipientUserId { get; set; }

    [ForeignKey(nameof(RecipientUserId))]
    public virtual User Recipient { get; set; } = null!;

    public string Message { get; set; } = string.Empty;          // full text of the notification/escalation

    // Delivery method & timestamp
    public bool SentByEmail { get; set; } = false;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Optional: useful for tracking delivery / acknowledgment
    // public bool IsAcknowledged { get; set; } = false;
    // public DateTime? AcknowledgedAt { get; set; }
    // public string? DeliveryStatus { get; set; }  // "Sent", "Failed", "Delivered", etc.
}