namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Defines the location tracking mode for a company
/// </summary>
public enum TrackingMode
{
    /// <summary>
    /// Workers submit location at start and end of workday
    /// </summary>
    StartEnd = 1,
    
    /// <summary>
    /// System requests location at random intervals during working hours
    /// </summary>
    RandomInterval = 2
}
