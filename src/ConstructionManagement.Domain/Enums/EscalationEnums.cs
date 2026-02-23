namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Type of escalation for project items
/// </summary>
public enum EscalationType
{
    /// <summary>
    /// Pre-start confirmation not received X hours before scheduled start
    /// </summary>
    PreStartNotConfirmed = 0,
    
    /// <summary>
    /// Materials not ready for the item
    /// </summary>
    MaterialsNotReady = 1,
    
    /// <summary>
    /// Equipment not ready for the item
    /// </summary>
    EquipmentNotReady = 2,
    
    /// <summary>
    /// Workers not available for the item
    /// </summary>
    WorkersNotAvailable = 3,
    
    /// <summary>
    /// Company owner authorized starting with missing items
    /// </summary>
    ForcedStartAuthorized = 4,
    
    /// <summary>
    /// Issue reported during execution
    /// </summary>
    IssueDuringExecution = 5,
    
    /// <summary>
    /// Item not started by end of scheduled day
    /// </summary>
    NoStartToday = 6,
    
    /// <summary>
    /// System predicts item will exceed end date
    /// </summary>
    DelayPredicted = 7,
    
    /// <summary>
    /// Budget exceeded for the item
    /// </summary>
    BudgetExceeded = 8,
    
    /// <summary>
    /// Task stuck in same status for too long
    /// </summary>
    TaskStuck = 9,
    
    /// <summary>
    /// Review pending for too long
    /// </summary>
    ReviewPendingTooLong = 10
}

/// <summary>
/// Severity level of escalation
/// </summary>
public enum EscalationSeverity
{
    /// <summary>
    /// Low severity - informational
    /// </summary>
    Low = 0,
    
    /// <summary>
    /// Medium severity - attention needed
    /// </summary>
    Medium = 1,
    
    /// <summary>
    /// High severity - urgent attention required
    /// </summary>
    High = 2,
    
    /// <summary>
    /// Critical severity - immediate action required
    /// </summary>
    Critical = 3
}

/// <summary>
/// Status of an escalation
/// </summary>
public enum EscalationStatus
{
    /// <summary>
    /// Escalation is open and needs attention
    /// </summary>
    Open = 0,
    
    /// <summary>
    /// Someone is working on resolving the escalation
    /// </summary>
    InProgress = 1,
    
    /// <summary>
    /// Escalation resolved successfully
    /// </summary>
    Resolved = 2,
    
    /// <summary>
    /// Escalation closed without resolution (e.g., cancelled item)
    /// </summary>
    Closed = 3,
    
    /// <summary>
    /// Escalation escalated to higher authority
    /// </summary>
    Escalated = 4
}

/// <summary>
/// Type of workflow configuration
/// </summary>
public enum WorkflowConfigurationType
{
    /// <summary>
    /// Pre-start confirmation settings
    /// </summary>
    PreStartConfirmation = 0,
    
    /// <summary>
    /// No-start check settings
    /// </summary>
    NoStartCheck = 1,
    
    /// <summary>
    /// Delay prediction settings
    /// </summary>
    DelayPrediction = 2,
    
    /// <summary>
    /// Task stuck detection settings
    /// </summary>
    TaskStuckDetection = 3,
    
    /// <summary>
    /// Review timeout settings
    /// </summary>
    ReviewTimeout = 4
}

/// <summary>
/// Confirmation status for pre-start checks
/// </summary>
public enum ConfirmationStatus
{
    /// <summary>
    /// Not yet confirmed
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Confirmed - all ready
    /// </summary>
    Confirmed = 1,
    
    /// <summary>
    /// Partially confirmed - some items missing
    /// </summary>
    PartiallyConfirmed = 2,
    
    /// <summary>
    /// Rejected - cannot proceed
    /// </summary>
    Rejected = 3,
    
    /// <summary>
    /// Forced start authorized by owner
    /// </summary>
    ForcedStart = 4
}
