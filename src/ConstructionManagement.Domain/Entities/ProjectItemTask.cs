using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Task within a project item - Mini Jira system for construction operations
/// </summary>
public class ProjectItemTask : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    // -- Project & Item Relationship -------------------------------------------
    public int ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;
    
    public int ProjectItemId { get; set; }
    
    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem ProjectItem { get; set; } = null!;
    
    // -- Task Identification ----------------------------------------------------
    /// <summary>
    /// Auto-generated task number (e.g., TASK-001)
    /// </summary>
    public string TaskNumber { get; set; } = string.Empty;
    
    /// <summary>
    /// Task title/name
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Detailed description of the task
    /// </summary>
    public string? Description { get; set; }
    
    // -- Task Status & Workflow -------------------------------------------------
    /// <summary>
    /// Current status of the task
    /// </summary>
    public Domain.Enums.ProjectTaskStatus Status { get; set; } = Domain.Enums.ProjectTaskStatus.Pending;
    
    /// <summary>
    /// Priority level of the task
    /// </summary>
    public TaskPriority Priority { get; set; } = TaskPriority.Normal;
    
    // -- Assignment -------------------------------------------------------------
    /// <summary>
    /// User assigned to complete this task
    /// </summary>
    public int? AssignedToUserId { get; set; }
    
    [ForeignKey(nameof(AssignedToUserId))]
    public virtual User? AssignedToUser { get; set; }
    
    /// <summary>
    /// User who created this task
    /// </summary>
    public int CreatedByUserId { get; set; }
    
    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User CreatedByUser { get; set; } = null!;
    
    // -- Schedule ---------------------------------------------------------------
    /// <summary>
    /// When the task is scheduled to start
    /// </summary>
    public DateTime? ScheduledStartDate { get; set; }
    
    /// <summary>
    /// When the task is scheduled to end
    /// </summary>
    public DateTime? ScheduledEndDate { get; set; }
    
    /// <summary>
    /// Actual start date/time
    /// </summary>
    public DateTime? ActualStartDate { get; set; }
    
    /// <summary>
    /// Actual completion date/time
    /// </summary>
    public DateTime? ActualEndDate { get; set; }
    
    /// <summary>
    /// Due date for the task
    /// </summary>
    public DateTime? DueDate { get; set; }
    
    // -- Progress Tracking ------------------------------------------------------
    /// <summary>
    /// Estimated hours to complete
    /// </summary>
    public decimal? EstimatedHours { get; set; }
    
    /// <summary>
    /// Actual hours worked
    /// </summary>
    public decimal? ActualHours { get; set; }
    
    /// <summary>
    /// Progress percentage (0-100)
    /// </summary>
    public decimal ProgressPercentage { get; set; } = 0;
    
    // -- Pre-Start Confirmation -------------------------------------------------
    /// <summary>
    /// Whether pre-start confirmation is required
    /// </summary>
    public bool RequiresPreStartConfirmation { get; set; } = false;
    
    /// <summary>
    /// Hours before start when confirmation reminder should be sent
    /// </summary>
    public int PreStartConfirmationHours { get; set; } = 24;
    
    /// <summary>
    /// Status of pre-start confirmation
    /// </summary>
    public ConfirmationStatus PreStartConfirmationStatus { get; set; } = ConfirmationStatus.Pending;
    
    /// <summary>
    /// When pre-start confirmation was received
    /// </summary>
    public DateTime? PreStartConfirmedAt { get; set; }
    
    /// <summary>
    /// User who confirmed pre-start
    /// </summary>
    public int? PreStartConfirmedByUserId { get; set; }
    
    [ForeignKey(nameof(PreStartConfirmedByUserId))]
    public virtual User? PreStartConfirmedByUser { get; set; }
    
    /// <summary>
    /// Notes from pre-start confirmation
    /// </summary>
    public string? PreStartConfirmationNotes { get; set; }
    
    // -- Review & Approval ------------------------------------------------------
    /// <summary>
    /// User who reviewed/approved the task
    /// </summary>
    public int? ReviewedByUserId { get; set; }
    
    [ForeignKey(nameof(ReviewedByUserId))]
    public virtual User? ReviewedByUser { get; set; }
    
    /// <summary>
    /// When the task was reviewed
    /// </summary>
    public DateTime? ReviewedAt { get; set; }
    
    // -- Location ---------------------------------------------------------------
    /// <summary>
    /// Physical location where task is performed
    /// </summary>
    public string? Location { get; set; }
    
    // -- Notes & Comments -------------------------------------------------------
    /// <summary>
    /// Internal notes for the task
    /// </summary>
    public string? InternalNotes { get; set; }
    
    // -- Navigation Collections -------------------------------------------------
    public virtual ICollection<ProjectItemTaskAttachment> Attachments { get; set; }
        = new List<ProjectItemTaskAttachment>();
    
    public virtual ICollection<ProjectItemTaskReview> Reviews { get; set; }
        = new List<ProjectItemTaskReview>();
    
    public virtual ICollection<ProjectItemTaskHistory> History { get; set; }
        = new List<ProjectItemTaskHistory>();
    
    public virtual ICollection<TaskNotification> Notifications { get; set; }
        = new List<TaskNotification>();
    
    public virtual ICollection<ProjectItemEscalation> Escalations { get; set; }
        = new List<ProjectItemEscalation>();
    
    // -- Computed Properties ----------------------------------------------------
    /// <summary>
    /// Whether the task is overdue
    /// </summary>
    [NotMapped]
    public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.UtcNow && Status != Domain.Enums.ProjectTaskStatus.Approved;
    
    /// <summary>
    /// Whether the task is ready for review (has attachments)
    /// </summary>
    [NotMapped]
    public bool IsReadyForReview => Status == Domain.Enums.ProjectTaskStatus.InProgress && Attachments.Any(a => a.ReviewStatus == ReviewStatus.Pending);
    
    /// <summary>
    /// Duration in days (scheduled)
    /// </summary>
    [NotMapped]
    public int? ScheduledDurationDays => ScheduledStartDate.HasValue && ScheduledEndDate.HasValue 
        ? (ScheduledEndDate.Value - ScheduledStartDate.Value).Days 
        : null;
}
