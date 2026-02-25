namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Status of a project item in the workflow
/// </summary>
public enum ProjectItemWorkflowStatus
{
    /// <summary>
    /// Item is created but not yet ready to start
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Item is being prepared (materials/equipment being arranged)
    /// </summary>
    Preparing = 1,
    
    /// <summary>
    /// Pre-start confirmation received, ready to start
    /// </summary>
    ReadyToStart = 2,
    
    /// <summary>
    /// Item is currently in progress
    /// </summary>
    InProgress = 3,
    
    /// <summary>
    /// Item temporarily paused due to issues
    /// </summary>
    Paused = 4,
    
    /// <summary>
    /// Item work completed
    /// </summary>
    Completed = 5,
    
    /// <summary>
    /// Item work completed and approved
    /// </summary>
    Approved = 6,
    
    /// <summary>
    /// Item delayed behind schedule
    /// </summary>
    Delayed = 7,
    
    /// <summary>
    /// Started with missing items (Company Owner authorization)
    /// </summary>
    ForcedStart = 8,
    
    /// <summary>
    /// Item cancelled
    /// </summary>
    Cancelled = 9
}
