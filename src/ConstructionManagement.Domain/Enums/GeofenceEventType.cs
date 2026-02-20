namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Defines the type of geofence event
/// </summary>
public enum GeofenceEventType
{
    /// <summary>
    /// Worker entered the zone
    /// </summary>
    Entry = 1,
    
    /// <summary>
    /// Worker exited the zone
    /// </summary>
    Exit = 2,
    
    /// <summary>
    /// Worker has been outside zone for extended period
    /// </summary>
    ExtendedExit = 3,
    
    /// <summary>
    /// Worker returned to zone after being outside
    /// </summary>
    Return = 4
}
