using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs.LocationTracking;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service for managing geofence zones and tracking worker presence
/// </summary>
public interface IGeofenceService
{
    #region Zone Management
    
    /// <summary>
    /// Gets all geofence zones for the company
    /// </summary>
    Task<List<GeofenceZoneDto>> GetZonesAsync(bool? activeOnly = null);
    
    /// <summary>
    /// Gets a specific geofence zone
    /// </summary>
    Task<GeofenceZoneDto?> GetZoneAsync(int zoneId);
    
    /// <summary>
    /// Creates a new geofence zone
    /// </summary>
    Task<GeofenceZoneDto> CreateZoneAsync(CreateGeofenceZoneRequest request);
    
    /// <summary>
    /// Updates a geofence zone
    /// </summary>
    Task<GeofenceZoneDto> UpdateZoneAsync(int zoneId, UpdateGeofenceZoneRequest request);
    
    /// <summary>
    /// Deletes a geofence zone
    /// </summary>
    Task<bool> DeleteZoneAsync(int zoneId);
    
    #endregion
    
    #region Worker Assignments
    
    /// <summary>
    /// Assigns workers to a zone
    /// </summary>
    Task<List<WorkerZoneAssignmentDto>> AssignWorkersAsync(int zoneId, AssignWorkersToZoneRequest request);
    
    /// <summary>
    /// Removes a worker from a zone
    /// </summary>
    Task<bool> RemoveWorkerAsync(int zoneId, int userId);
    
    /// <summary>
    /// Gets workers assigned to a zone
    /// </summary>
    Task<List<WorkerZoneAssignmentDto>> GetZoneWorkersAsync(int zoneId);
    
    /// <summary>
    /// Gets zones assigned to a worker
    /// </summary>
    Task<List<WorkerAssignedZoneDto>> GetWorkerZonesAsync(int userId);
    
    #endregion
    
    #region Events
    
    /// <summary>
    /// Gets geofence events
    /// </summary>
    Task<GeofenceEventHistoryDto> GetEventsAsync(int? zoneId, int? userId, DateTime? fromDate, DateTime? toDate, int page = 1, int pageSize = 50);
    
    /// <summary>
    /// Gets today's geofence events
    /// </summary>
    Task<List<GeofenceEventDto>> GetTodayEventsAsync(int? zoneId = null);
    
    #endregion
    
    #region Worker Status
    
    /// <summary>
    /// Gets all workers' zone status
    /// </summary>
    Task<WorkersZoneSummaryDto> GetWorkersZoneStatusAsync();
    
    /// <summary>
    /// Gets a specific worker's zone status
    /// </summary>
    Task<WorkerZoneStatusDto> GetWorkerZoneStatusAsync(int userId);
    
    #endregion
    
    #region Location Processing
    
    /// <summary>
    /// Processes a location submission to check geofence status
    /// Called by LocationTrackingService when a location is submitted
    /// </summary>
    Task ProcessLocationAsync(int locationId, int userId, double latitude, double longitude);
    
    #endregion
}
