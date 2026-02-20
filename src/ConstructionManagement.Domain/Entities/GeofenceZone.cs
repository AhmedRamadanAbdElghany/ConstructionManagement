using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Defines a virtual geographic boundary (geofence) for tracking worker presence
/// </summary>
public class GeofenceZone : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// The company this zone belongs to
    /// </summary>
    public int? CompanyId { get; set; }
    
    /// <summary>
    /// Navigation property to the company
    /// </summary>
    public Company Company { get; set; } = null!;
    
    /// <summary>
    /// Optional project this zone is associated with
    /// </summary>
    public int? ProjectId { get; set; }
    
    /// <summary>
    /// Navigation property to the project
    /// </summary>
    public Project? Project { get; set; }
    
    /// <summary>
    /// Name of the geofence zone
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional description of the zone
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }
    
    /// <summary>
    /// Type of zone (Circle or Polygon)
    /// </summary>
    public ZoneType ZoneType { get; set; } = ZoneType.Circle;
    
    /// <summary>
    /// Center latitude for circle zones
    /// </summary>
    public decimal? CenterLatitude { get; set; }
    
    /// <summary>
    /// Center longitude for circle zones
    /// </summary>
    public decimal? CenterLongitude { get; set; }
    
    /// <summary>
    /// Radius in meters for circle zones
    /// </summary>
    public int? RadiusMeters { get; set; }
    
    /// <summary>
    /// GeoJSON representation for polygon zones
    /// </summary>
    public string? PolygonGeoJson { get; set; }
    
    /// <summary>
    /// Whether this zone is active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Whether to alert when worker enters the zone
    /// </summary>
    public bool AlertOnEntry { get; set; } = false;
    
    /// <summary>
    /// Whether to alert when worker exits the zone
    /// </summary>
    public bool AlertOnExit { get; set; } = true;
    
    /// <summary>
    /// Grace period in minutes before alerting on extended exit
    /// </summary>
    public int AllowedExitDurationMinutes { get; set; } = 30;
    
    /// <summary>
    /// Workers assigned to this zone
    /// </summary>
    public ICollection<WorkerGeofenceAssignment> WorkerAssignments { get; set; } = new List<WorkerGeofenceAssignment>();
    
    /// <summary>
    /// Events recorded for this zone
    /// </summary>
    public ICollection<GeofenceEvent> Events { get; set; } = new List<GeofenceEvent>();
}
