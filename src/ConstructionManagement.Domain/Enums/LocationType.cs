namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Defines the type of location submission
/// </summary>
public enum LocationType
{
    /// <summary>
    /// Location submitted at start of workday
    /// </summary>
    StartOfDay = 1,
    
    /// <summary>
    /// Location submitted at end of workday
    /// </summary>
    EndOfDay = 2,
    
    /// <summary>
    /// Location submitted in response to random scheduled check
    /// </summary>
    RandomCheck = 3,
    
    /// <summary>
    /// Location submitted in response to on-demand request
    /// </summary>
    OnDemand = 4
}
