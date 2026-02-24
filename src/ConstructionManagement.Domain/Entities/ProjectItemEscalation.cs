using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Escalation record for project items and tasks
/// Tracks issues that need management attention
/// </summary>
public class ProjectItemEscalation : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    // -- Project & Item Relationship -------------------------------------------
    public int ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;
    
    public int? ProjectItemId { get; set; }
    
    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem? ProjectItem { get; set; }
    
    public int? ProjectItemTaskId { get; set; }
    
    [ForeignKey(nameof(ProjectItemTaskId))]
    public virtual ProjectItemTask? Task { get; set; }
    
    // -- Escalation Type & Severity --------------------------------------------
    /// <summary>
    /// Type of escalation
    /// </summary>
    public EscalationType EscalationType { get; set; }
    
    /// <summary>
    /// Severity level
    /// </summary>
    public EscalationSeverity Severity { get; set; } = EscalationSeverity.Medium;
    
    /// <summary>
    /// Current status of the escalation
    /// </summary>
    public EscalationStatus Status { get; set; } = EscalationStatus.Open;
    
    // -- Escalation Details ----------------------------------------------------
    /// <summary>
    /// Title/summary of the escalation
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Detailed description of the issue
    /// </summary>
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// What triggered this escalation
    /// </summary>
    public string? TriggerReason { get; set; }
    
    // -- People Involved -------------------------------------------------------
    /// <summary>
    /// User who reported/triggered the escalation
    /// </summary>
    public int? ReportedByUserId { get; set; }
    
    [ForeignKey(nameof(ReportedByUserId))]
    public virtual User? ReportedByUser { get; set; }
    
    /// <summary>
    /// User currently assigned to handle the escalation
    /// </summary>
    public int? AssignedToUserId { get; set; }
    
    [ForeignKey(nameof(AssignedToUserId))]
    public virtual User? AssignedToUser { get; set; }
    
    /// <summary>
    /// User who resolved the escalation
    /// </summary>
    public int? ResolvedByUserId { get; set; }
    
    [ForeignKey(nameof(ResolvedByUserId))]
    public virtual User? ResolvedByUser { get; set; }
    
    // -- Timestamps ------------------------------------------------------------

    
    /// <summary>
    /// When someone started working on the escalation
    /// </summary>
    public DateTime? AcknowledgedAt { get; set; }
    
    /// <summary>
    /// When the escalation was resolved
    /// </summary>
    public DateTime? ResolvedAt { get; set; }
    
    /// <summary>
    /// Deadline for resolving the escalation
    /// </summary>
    public DateTime? ResolutionDeadline { get; set; }
    
    // -- Resolution ------------------------------------------------------------
    /// <summary>
    /// How the escalation was resolved
    /// </summary>
    public string? ResolutionNotes { get; set; }
    
    /// <summary>
    /// Action taken to resolve
    /// </summary>
    public string? ResolutionAction { get; set; }
    
    // -- Escalation Path -------------------------------------------------------
    /// <summary>
    /// Level of escalation (1 = first level, 2 = escalated to manager, etc.)
    /// </summary>
    public int EscalationLevel { get; set; } = 1;
    
    /// <summary>
    /// Previous escalation this was escalated from
    /// </summary>
    public int? PreviousEscalationId { get; set; }
    
    [ForeignKey(nameof(PreviousEscalationId))]
    public virtual ProjectItemEscalation? PreviousEscalation { get; set; }
    
    // -- Notifications ---------------------------------------------------------
    /// <summary>
    /// Whether notification was sent for this escalation
    /// </summary>
    public bool NotificationSent { get; set; } = false;
    
    /// <summary>
    /// When notification was sent
    /// </summary>
    public DateTime? NotificationSentAt { get; set; }
    
    /// <summary>
    /// Who was notified (JSON array of user IDs)
    /// </summary>
    public string? NotifiedUserIds { get; set; }
    
    // -- Impact Assessment -----------------------------------------------------
    /// <summary>
    /// Estimated cost impact of this issue
    /// </summary>
    public decimal? EstimatedCostImpact { get; set; }
    
    /// <summary>
    /// Estimated delay in days
    /// </summary>
    public int? EstimatedDelayDays { get; set; }
    
    /// <summary>
    /// Whether this affects project critical path
    /// </summary>
    public bool AffectsCriticalPath { get; set; } = false;
    
    // -- Follow-up -------------------------------------------------------------
    /// <summary>
    /// Whether follow-up is required
    /// </summary>
    public bool RequiresFollowUp { get; set; } = false;
    
    /// <summary>
    /// Scheduled follow-up date
    /// </summary>
    public DateTime? FollowUpDate { get; set; }
    
    /// <summary>
    /// Follow-up notes
    /// </summary>
    public string? FollowUpNotes { get; set; }
    
    // -- Navigation Collections -------------------------------------------------
    public virtual ICollection<EscalationAction> Actions { get; set; }
        = new List<EscalationAction>();
}

/// <summary>
/// Action taken on an escalation
/// </summary>
public class EscalationAction : BaseEntity
{
    // -- Escalation Relationship ------------------------------------------------
    public int ProjectItemEscalationId { get; set; }
    
    [ForeignKey(nameof(ProjectItemEscalationId))]
    public virtual ProjectItemEscalation Escalation { get; set; } = null!;
    
    // -- Action Details ---------------------------------------------------------
    /// <summary>
    /// Type of action taken
    /// </summary>
    public EscalationActionType ActionType { get; set; }
    
    /// <summary>
    /// Description of the action
    /// </summary>
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// User who took the action
    /// </summary>
    public int ActionByUserId { get; set; }
    
    [ForeignKey(nameof(ActionByUserId))]
    public virtual User ActionByUser { get; set; } = null!;
    
    /// <summary>
    /// When the action was taken
    /// </summary>
    public DateTime ActionAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Whether this action resolved the escalation
    /// </summary>
    public bool IsResolution { get; set; } = false;
}

/// <summary>
/// Types of actions that can be taken on an escalation
/// </summary>
public enum EscalationActionType
{
    /// <summary>
    /// Escalation acknowledged
    /// </summary>
    Acknowledged = 0,
    
    /// <summary>
    /// Assigned to someone
    /// </summary>
    Assigned = 1,
    
    /// <summary>
    /// Comment added
    /// </summary>
    CommentAdded = 2,
    
    /// <summary>
    /// Escalated to higher level
    /// </summary>
    Escalated = 3,
    
    /// <summary>
    /// Resolution provided
    /// </summary>
    Resolved = 4,
    
    /// <summary>
    /// Closed without resolution
    /// </summary>
    Closed = 5,
    
    /// <summary>
    /// Reopened
    /// </summary>
    Reopened = 6,
    
    /// <summary>
    /// Follow-up scheduled
    /// </summary>
    FollowUpScheduled = 7
}
