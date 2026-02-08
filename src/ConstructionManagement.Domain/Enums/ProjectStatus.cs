namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents the status of a project.
/// </summary>
public enum ProjectStatus
{
    /// <summary>
    /// Project is in the planning phase.
    /// </summary>
    Planning = 0,

    /// <summary>
    /// Project has been initiated but not yet started.
    /// </summary>
    New = 1,

    /// <summary>
    /// Project is actively in progress.
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Project is temporarily paused.
    /// </summary>
    OnHold = 3,

    /// <summary>
    /// Project has been completed.
    /// </summary>
    Completed = 4,

    /// <summary>
    /// Project has been cancelled.
    /// </summary>
    Cancelled = 5,

    /// <summary>
    /// Project is delayed.
    /// </summary>
    Delayed = 6
}
