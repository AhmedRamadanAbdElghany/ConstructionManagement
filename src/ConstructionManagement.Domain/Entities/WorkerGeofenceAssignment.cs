using System;
using System.ComponentModel.DataAnnotations;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an assignment of a worker to a geofence zone
/// </summary>
public class WorkerGeofenceAssignment : BaseEntity
{
    /// <summary>
    /// The zone the worker is assigned to
    /// </summary>
    public int ZoneId { get; set; }
    
    /// <summary>
    /// Navigation property to the zone
    /// </summary>
    public GeofenceZone Zone { get; set; } = null!;
    
    /// <summary>
    /// The worker assigned to the zone
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// Navigation property to the user
    /// </summary>
    public User User { get; set; } = null!;
    
    /// <summary>
    /// When the assignment was created
    /// </summary>
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// The admin who created this assignment
    /// </summary>
    public int AssignedBy { get; set; }
    
    /// <summary>
    /// Navigation property to the assigning user
    /// </summary>
    public User AssignedByUser { get; set; } = null!;
    
    /// <summary>
    /// Whether this assignment is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
