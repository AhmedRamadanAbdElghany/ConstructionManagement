namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Status of a project item task
/// </summary>
public enum ProjectTaskStatus
{
    /// <summary>
    /// Task is created but not started
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Task is currently being worked on
    /// </summary>
    InProgress = 1,
    
    /// <summary>
    /// Task is submitted for review (photos/videos attached)
    /// </summary>
    ReadyForReview = 2,
    
    /// <summary>
    /// Reviewer requested changes/revision
    /// </summary>
    RevisionRequested = 3,
    
    /// <summary>
    /// Task completed and approved
    /// </summary>
    Approved = 4,
    
    /// <summary>
    /// Task rejected (cannot proceed)
    /// </summary>
    Rejected = 5,
    
    /// <summary>
    /// Task temporarily stopped
    /// </summary>
    OnHold = 6,
    
    /// <summary>
    /// Task cancelled
    /// </summary>
    Cancelled = 7
}

/// <summary>
/// Type of media attachment
/// </summary>
public enum MediaType
{
    /// <summary>
    /// Photo/image
    /// </summary>
    Photo = 0,
    
    /// <summary>
    /// Video
    /// </summary>
    Video = 1,
    
    /// <summary>
    /// Document (PDF, etc.)
    /// </summary>
    Document = 2
}

/// <summary>
/// Review status of an attachment
/// </summary>
public enum ReviewStatus
{
    /// <summary>
    /// Not yet reviewed
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Approved by reviewer
    /// </summary>
    Approved = 1,
    
    /// <summary>
    /// Rejected by reviewer
    /// </summary>
    Rejected = 2,
    
    /// <summary>
    /// Revision requested
    /// </summary>
    RevisionRequested = 3
}

/// <summary>
/// Type of review action
/// </summary>
public enum ReviewType
{
    /// <summary>
    /// Task approved
    /// </summary>
    Approval = 0,
    
    /// <summary>
    /// Task rejected
    /// </summary>
    Rejection = 1,
    
    /// <summary>
    /// Revision requested
    /// </summary>
    RevisionRequest = 2,
    
    /// <summary>
    /// Task started
    /// </summary>
    Start = 3,
    
    /// <summary>
    /// Task completed
    /// </summary>
    Complete = 4,
    
    /// <summary>
    /// Task put on hold
    /// </summary>
    Hold = 5,
    
    /// <summary>
    /// Task resumed
    /// </summary>
    Resume = 6,
    
    /// <summary>
    /// Task cancelled
    /// </summary>
    Cancel = 7
}

/// <summary>
/// Priority level for tasks
/// </summary>
public enum TaskPriority
{
    /// <summary>
    /// Low priority
    /// </summary>
    Low = 0,
    
    /// <summary>
    /// Normal priority
    /// </summary>
    Normal = 1,
    
    /// <summary>
    /// High priority
    /// </summary>
    High = 2,
    
    /// <summary>
    /// Critical/Urgent priority
    /// </summary>
    Critical = 3
}
