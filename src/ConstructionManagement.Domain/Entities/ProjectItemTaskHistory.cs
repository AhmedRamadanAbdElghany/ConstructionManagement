using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// History/audit log for project item task changes
/// Tracks all state transitions and field changes
/// </summary>
public class ProjectItemTaskHistory : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    // -- Task Relationship ------------------------------------------------------
    public int ProjectItemTaskId { get; set; }
    
    [ForeignKey(nameof(ProjectItemTaskId))]
    public virtual ProjectItemTask Task { get; set; } = null!;
    
    // -- Change Information -----------------------------------------------------
    /// <summary>
    /// Type of change that occurred
    /// </summary>
    public TaskHistoryAction Action { get; set; }
    
    /// <summary>
    /// Field that was changed (if applicable)
    /// </summary>
    public string? FieldName { get; set; }
    
    /// <summary>
    /// Value before the change
    /// </summary>
    public string? OldValue { get; set; }
    
    /// <summary>
    /// Value after the change
    /// </summary>
    public string? NewValue { get; set; }
    
    // -- User Information -------------------------------------------------------
    /// <summary>
    /// User who made the change
    /// </summary>
    public int ChangedByUserId { get; set; }
    
    [ForeignKey(nameof(ChangedByUserId))]
    public virtual User ChangedByUser { get; set; } = null!;
    
    /// <summary>
    /// When the change occurred
    /// </summary>
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    
    // -- Additional Context -----------------------------------------------------
    /// <summary>
    /// IP address of the user who made the change
    /// </summary>
    public string? IpAddress { get; set; }
    
    /// <summary>
    /// User agent of the client
    /// </summary>
    public string? UserAgent { get; set; }
    
    /// <summary>
    /// Additional notes about the change
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Types of actions that can be recorded in task history
/// </summary>
public enum TaskHistoryAction
{
    /// <summary>
    /// Task created
    /// </summary>
    Created = 0,
    
    /// <summary>
    /// Status changed
    /// </summary>
    StatusChanged = 1,
    
    /// <summary>
    /// Task assigned to user
    /// </summary>
    Assigned = 2,
    
    /// <summary>
    /// Task reassigned to different user
    /// </summary>
    Reassigned = 3,
    
    /// <summary>
    /// Task started
    /// </summary>
    Started = 4,
    
    /// <summary>
    /// Task completed
    /// </summary>
    Completed = 5,
    
    /// <summary>
    /// Task approved
    /// </summary>
    Approved = 6,
    
    /// <summary>
    /// Task rejected
    /// </summary>
    Rejected = 7,
    
    /// <summary>
    /// Revision requested
    /// </summary>
    RevisionRequested = 8,
    
    /// <summary>
    /// Task put on hold
    /// </summary>
    PutOnHold = 9,
    
    /// <summary>
    /// Task resumed
    /// </summary>
    Resumed = 10,
    
    /// <summary>
    /// Task cancelled
    /// </summary>
    Cancelled = 11,
    
    /// <summary>
    /// Due date changed
    /// </summary>
    DueDateChanged = 12,
    
    /// <summary>
    /// Priority changed
    /// </summary>
    PriorityChanged = 13,
    
    /// <summary>
    /// Progress updated
    /// </summary>
    ProgressUpdated = 14,
    
    /// <summary>
    /// Attachment added
    /// </summary>
    AttachmentAdded = 15,
    
    /// <summary>
    /// Attachment removed
    /// </summary>
    AttachmentRemoved = 16,
    
    /// <summary>
    /// Comment added
    /// </summary>
    CommentAdded = 17,
    
    /// <summary>
    /// Field updated
    /// </summary>
    FieldUpdated = 18,
    
    /// <summary>
    /// Pre-start confirmed
    /// </summary>
    PreStartConfirmed = 19,
    
    /// <summary>
    /// Forced start authorized
    /// </summary>
    ForcedStartAuthorized = 20
}
