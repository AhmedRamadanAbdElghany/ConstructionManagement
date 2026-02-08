namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents the status of a job posting.
/// </summary>
public enum JobStatus
{
    /// <summary>
    /// Job posting is open for applications.
    /// </summary>
    Open = 0,

    /// <summary>
    /// Job posting is temporarily paused.
    /// </summary>
    OnHold = 1,

    /// <summary>
    /// Job posting is closed (filled).
    /// </summary>
    Closed = 2,

    /// <summary>
    /// Job posting is cancelled.
    /// </summary>
    Cancelled = 3,

    /// <summary>
    /// Job posting is in draft mode.
    /// </summary>
    Draft = 4
}
