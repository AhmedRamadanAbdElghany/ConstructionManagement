namespace ConstructionManagement.Domain.Enums;

/// <summary>
/// Represents the status of equipment.
/// </summary>
public enum EquipmentStatus
{
    /// <summary>
    /// Equipment is active and available.
    /// </summary>
    Available = 0,

    /// <summary>
    /// Equipment is active and in use.
    /// </summary>
    Active = 1,

    /// <summary>
    /// Equipment is under maintenance.
    /// </summary>
    Maintenance = 2,
    
    /// <summary>
    /// Equipment is in maintenance.
    /// </summary>
    InMaintenance = 3,

    /// <summary>
    /// Equipment is out of service.
    /// </summary>
    OutOfService = 4,

    /// <summary>
    /// Equipment has been retired/disposed.
    /// </summary>
    Retired = 5,

    /// <summary>
    /// Equipment is reserved for a project.
    /// </summary>
    Reserved = 6,
    
    /// <summary>
    /// Equipment is assigned.
    /// </summary>
    Assigned = 7,

    /// <summary>
    /// Equipment is currently in use.
    /// </summary>
    InUse = 8
}
