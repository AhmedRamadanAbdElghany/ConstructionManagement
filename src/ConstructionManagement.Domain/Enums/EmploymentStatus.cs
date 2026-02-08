namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents the employment status of a team member.
/// </summary>
public enum EmploymentStatus
{
    /// <summary>
    /// Employee is currently active.
    /// </summary>
    Active = 0,

    /// <summary>
    /// Employee is on probation.
    /// </summary>
    Probation = 1,

    /// <summary>
    /// Employee is temporarily inactive.
    /// </summary>
    OnLeave = 2,

    /// <summary>
    /// Employee has been terminated.
    /// </summary>
    Terminated = 3,

    /// <summary>
    /// Employee has resigned.
    /// </summary>
    Resigned = 4,

    /// <summary>
    /// Employee is retired.
    /// </summary>
    Retired = 5
}
