using System;
using System.Collections.Generic;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs.LocationTracking;

#region Geofence Zones

/// <summary>
/// DTO for a geofence zone
/// </summary>
public class GeofenceZoneDto
{
    public int Id { get; set; }
    public int? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ZoneType ZoneType { get; set; }
    public double? CenterLatitude { get; set; }
    public double? CenterLongitude { get; set; }
    public int? RadiusMeters { get; set; }
    public string? PolygonGeoJson { get; set; }
    public bool IsActive { get; set; }
    public bool AlertOnEntry { get; set; }
    public bool AlertOnExit { get; set; }
    public int AllowedExitDurationMinutes { get; set; }
    public int AssignedWorkerCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request to create a geofence zone
/// </summary>
public class CreateGeofenceZoneRequest
{
    public int? ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ZoneType ZoneType { get; set; } = ZoneType.Circle;
    
    // For Circle type
    public double? CenterLatitude { get; set; }
    public double? CenterLongitude { get; set; }
    public int? RadiusMeters { get; set; }
    
    // For Polygon type
    public string? PolygonGeoJson { get; set; }
    
    public bool AlertOnEntry { get; set; }
    public bool AlertOnExit { get; set; } = true;
    public int AllowedExitDurationMinutes { get; set; } = 30;
}

/// <summary>
/// Request to update a geofence zone
/// </summary>
public class UpdateGeofenceZoneRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool AlertOnEntry { get; set; }
    public bool AlertOnExit { get; set; }
    public int AllowedExitDurationMinutes { get; set; }
}

#endregion

#region Geofence Events

/// <summary>
/// DTO for a geofence event
/// </summary>
public class GeofenceEventDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public GeofenceEventType EventType { get; set; }
    public DateTime EventTime { get; set; }
    public int? DurationMinutes { get; set; }
    public bool IsAlerted { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for geofence event history
/// </summary>
public class GeofenceEventHistoryDto
{
    public List<GeofenceEventDto> Events { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

#endregion

#region Worker Assignments

/// <summary>
/// Request to assign workers to a zone
/// </summary>
public class AssignWorkersToZoneRequest
{
    public List<int> UserIds { get; set; } = new();
}

/// <summary>
/// DTO for a worker's zone assignment
/// </summary>
public class WorkerZoneAssignmentDto
{
    public int AssignmentId { get; set; }
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
    public string AssignedByName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

#endregion

#region Worker Zone Status

/// <summary>
/// DTO for a worker's current zone status
/// </summary>
public class WorkerZoneStatusDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int? CurrentZoneId { get; set; }
    public string? CurrentZoneName { get; set; }
    public bool IsInsideZone { get; set; }
    public DateTime? LastLocationTime { get; set; }
    public double? LastLatitude { get; set; }
    public double? LastLongitude { get; set; }
    public DateTime? ExitTime { get; set; }
    public int? MinutesOutside { get; set; }
    public bool IsOverdue { get; set; }
    public List<WorkerAssignedZoneDto> AssignedZones { get; set; } = new();
}

/// <summary>
/// DTO for a zone assigned to a worker
/// </summary>
public class WorkerAssignedZoneDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public bool IsCurrentlyInside { get; set; }
}

/// <summary>
/// Summary of all workers' zone status
/// </summary>
public class WorkersZoneSummaryDto
{
    public DateTime LastUpdated { get; set; }
    public int TotalWorkers { get; set; }
    public int WorkersInsideZone { get; set; }
    public int WorkersOutsideZone { get; set; }
    public int WorkersOverdue { get; set; }
    public List<WorkerZoneStatusDto> Workers { get; set; } = new();
}

#endregion
