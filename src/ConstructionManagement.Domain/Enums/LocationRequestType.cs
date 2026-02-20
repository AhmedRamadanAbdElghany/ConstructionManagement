namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Defines the type of location request
/// </summary>
public enum LocationRequestType
{
    /// <summary>
    /// On-demand request from admin
    /// </summary>
    OnDemand = 1,
    
    /// <summary>
    /// Scheduled random check (for RandomInterval mode)
    /// </summary>
    RandomScheduled = 2,
    
    /// <summary>
    /// Start of day reminder
    /// </summary>
    StartOfDayReminder = 3,
    
    /// <summary>
    /// End of day reminder
    /// </summary>
    EndOfDayReminder = 4
}
