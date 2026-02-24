using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Daily task board entry - shows items that must start/be worked on today
/// Generated daily by background job
/// </summary>
public class DailyTaskBoard : BaseEntity, ICompanyEntity
{
    public int? CompanyId { get; set; }
    
    // -- Project Relationship ---------------------------------------------------
    public int ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;
    
    public int? ProjectItemId { get; set; }
    
    [ForeignKey(nameof(ProjectItemId))]
    public virtual ProjectItem? ProjectItem { get; set; }
    
    public int? ProjectItemTaskId { get; set; }
    
    [ForeignKey(nameof(ProjectItemTaskId))]
    public virtual ProjectItemTask? Task { get; set; }
    
    // -- Board Date -------------------------------------------------------------
    /// <summary>
    /// Date this board entry is for
    /// </summary>
    public DateTime BoardDate { get; set; }
    
    // -- Entry Type -------------------------------------------------------------
    /// <summary>
    /// Type of board entry
    /// </summary>
    public DailyBoardEntryType EntryType { get; set; }
    
    // -- Status -----------------------------------------------------------------
    /// <summary>
    /// Current status of this board entry
    /// </summary>
    public DailyBoardEntryStatus Status { get; set; } = DailyBoardEntryStatus.Pending;
    
    // -- Item Details (denormalized for quick access) ---------------------------
    /// <summary>
    /// Item/Task name
    /// </summary>
    public string ItemName { get; set; } = string.Empty;
    
    /// <summary>
    /// Item/Task description
    /// </summary>
    public string? ItemDescription { get; set; }
    
    /// <summary>
    /// Scheduled start time
    /// </summary>
    public DateTime? ScheduledStart { get; set; }
    
    /// <summary>
    /// Scheduled end time
    /// </summary>
    public DateTime? ScheduledEnd { get; set; }
    
    // -- Assignment -------------------------------------------------------------
    /// <summary>
    /// User assigned to this item
    /// </summary>
    public int? AssignedToUserId { get; set; }
    
    [ForeignKey(nameof(AssignedToUserId))]
    public virtual User? AssignedToUser { get; set; }
    
    /// <summary>
    /// Assigned user name (denormalized)
    /// </summary>
    public string? AssignedUserName { get; set; }
    
    // -- Pre-Start Status -------------------------------------------------------
    /// <summary>
    /// Pre-start confirmation status
    /// </summary>
    public ConfirmationStatus PreStartStatus { get; set; } = ConfirmationStatus.Pending;
    
    /// <summary>
    /// When pre-start was confirmed
    /// </summary>
    public DateTime? PreStartConfirmedAt { get; set; }
    
    /// <summary>
    /// Who confirmed pre-start
    /// </summary>
    public string? PreStartConfirmedByName { get; set; }
    
    // -- Progress ---------------------------------------------------------------
    /// <summary>
    /// Progress percentage
    /// </summary>
    public decimal ProgressPercentage { get; set; } = 0;
    
    /// <summary>
    /// Actual start time
    /// </summary>
    public DateTime? ActualStart { get; set; }
    
    /// <summary>
    /// Actual end time
    /// </summary>
    public DateTime? ActualEnd { get; set; }
    
    // -- Priority & Urgency -----------------------------------------------------
    /// <summary>
    /// Priority level
    /// </summary>
    public TaskPriority Priority { get; set; } = TaskPriority.Normal;
    
    /// <summary>
    /// Whether this item is on the critical path
    /// </summary>
    public bool IsCriticalPath { get; set; } = false;
    
    /// <summary>
    /// Whether this item is overdue
    /// </summary>
    public bool IsOverdue { get; set; } = false;
    
    // -- Notes ------------------------------------------------------------------
    /// <summary>
    /// Notes for the day
    /// </summary>
    public string? Notes { get; set; }
    
    // -- Timestamps -------------------------------------------------------------
    /// <summary>
    /// When this board entry was generated
    /// </summary>
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    

}

/// <summary>
/// Types of daily board entries
/// </summary>
public enum DailyBoardEntryType
{
    /// <summary>
    /// Project item scheduled to start today
    /// </summary>
    ItemStartingToday = 0,
    
    /// <summary>
    /// Project item in progress
    /// </summary>
    ItemInProgress = 1,
    
    /// <summary>
    /// Project item scheduled to end today
    /// </summary>
    ItemEndingToday = 2,
    
    /// <summary>
    /// Task scheduled for today
    /// </summary>
    TaskScheduled = 3,
    
    /// <summary>
    /// Overdue item
    /// </summary>
    OverdueItem = 4,
    
    /// <summary>
    /// Item requiring attention
    /// </summary>
    RequiresAttention = 5
}

/// <summary>
/// Status of daily board entry
/// </summary>
public enum DailyBoardEntryStatus
{
    /// <summary>
    /// Not yet started
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Pre-start confirmed, ready to start
    /// </summary>
    ReadyToStart = 1,
    
    /// <summary>
    /// Currently in progress
    /// </summary>
    InProgress = 2,
    
    /// <summary>
    /// Completed today
    /// </summary>
    Completed = 3,
    
    /// <summary>
    /// Delayed
    /// </summary>
    Delayed = 4,
    
    /// <summary>
    /// Not started (issue)
    /// </summary>
    NotStarted = 5,
    
    /// <summary>
    /// Cancelled
    /// </summary>
    Cancelled = 6
}
