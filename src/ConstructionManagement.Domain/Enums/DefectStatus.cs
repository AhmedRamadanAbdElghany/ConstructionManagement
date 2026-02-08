namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents the status of a defect.
/// </summary>
public enum DefectStatus
{
    /// <summary>
    /// Defect has been identified and reported.
    /// </summary>
    Open = 0,

    /// <summary>
    /// Defect is being investigated.
    /// </summary>
    InProgress = 1,

    /// <summary>
    /// Defect has been resolved but not yet verified.
    /// </summary>
    Resolved = 2,

    /// <summary>
    /// Defect has been closed and verified.
    /// </summary>
    Closed = 3,

    /// <summary>
    /// Defect has been reopened after being resolved.
    /// </summary>
    Reopened = 4,

    /// <summary>
    /// Defect has been accepted as is.
    /// </summary>
    Accepted = 5
}
