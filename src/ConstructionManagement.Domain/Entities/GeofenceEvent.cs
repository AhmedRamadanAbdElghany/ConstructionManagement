using System;
using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an event when a worker enters or exits a geofence zone
/// </summary>
public class GeofenceEvent : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// The company this event belongs to
    /// </summary>
    public int? CompanyId { get; set; }
    
    /// <summary>
    /// Navigation property to the company
    /// </summary>
    public Company Company { get; set; } = null!;
    
    /// <summary>
    /// The worker who triggered the event
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// Navigation property to the user
    /// </summary>
    public User User { get; set; } = null!;
    
    /// <summary>
    /// The zone this event is associated with
    /// </summary>
    public int ZoneId { get; set; }
    
    /// <summary>
    /// Navigation property to the zone
    /// </summary>
    public GeofenceZone Zone { get; set; } = null!;
    
    /// <summary>
    /// The location record that triggered this event
    /// </summary>
    public int LocationId { get; set; }
    
    /// <summary>
    /// Navigation property to the location
    /// </summary>
    public WorkerLocation Location { get; set; } = null!;
    
    /// <summary>
    /// Type of event (Entry, Exit, ExtendedExit, Return)
    /// </summary>
    public GeofenceEventType EventType { get; set; }
    
    /// <summary>
    /// When the event occurred
    /// </summary>
    public DateTime EventTime { get; set; }
    
    /// <summary>
    /// Duration outside zone in minutes (for Exit/ExtendedExit events)
    /// </summary>
    public int? DurationMinutes { get; set; }
    
    /// <summary>
    /// Whether an alert was sent for this event
    /// </summary>
    public bool IsAlerted { get; set; } = false;
    
    /// <summary>
    /// When the alert was sent
    /// </summary>
    public DateTime? AlertedAt { get; set; }
    
    /// <summary>
    /// Optional notes about the event
    /// </summary>
    [MaxLength(500)]
    public string? Notes { get; set; }
}
