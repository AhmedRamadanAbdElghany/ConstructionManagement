using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs.LocationTracking;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for managing geofence zones and tracking worker presence
/// </summary>
public class GeofenceService : IGeofenceService
{
    private readonly ApplicationDbContext _context;
    private readonly ICompanyContext _companyContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly INotificationService _notificationService;
    private readonly ILogger<GeofenceService> _logger;

    public GeofenceService(
        ApplicationDbContext context,
        ICompanyContext companyContext,
        IHttpContextAccessor httpContextAccessor,
        INotificationService notificationService,
        ILogger<GeofenceService> logger)
    {
        _context = context;
        _companyContext = companyContext;
        _httpContextAccessor = httpContextAccessor;
        _notificationService = notificationService;
        _logger = logger;
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    #region Zone Management

    public async Task<List<GeofenceZoneDto>> GetZonesAsync(bool? activeOnly = null)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var query = _context.GeofenceZones
            .Include(z => z.Project)
            .Include(z => z.WorkerAssignments)
            .Where(z => z.CompanyId == companyId);

        if (activeOnly == true)
        {
            query = query.Where(z => z.IsActive);
        }

        var zones = await query.OrderBy(z => z.Name).ToListAsync();

        return zones.Select(z => new GeofenceZoneDto
        {
            Id = z.Id,
            ProjectId = z.ProjectId,
            ProjectName = z.Project?.Name,
            Name = z.Name,
            Description = z.Description,
            ZoneType = z.ZoneType,
            CenterLatitude = z.CenterLatitude.HasValue ? (double)z.CenterLatitude.Value : null,
            CenterLongitude = z.CenterLongitude.HasValue ? (double)z.CenterLongitude.Value : null,
            RadiusMeters = z.RadiusMeters,
            PolygonGeoJson = z.PolygonGeoJson,
            IsActive = z.IsActive,
            AlertOnEntry = z.AlertOnEntry,
            AlertOnExit = z.AlertOnExit,
            AllowedExitDurationMinutes = z.AllowedExitDurationMinutes,
            AssignedWorkerCount = z.WorkerAssignments.Count(a => a.IsActive),
            CreatedAt = z.CreatedAt
        }).ToList();
    }

    public async Task<GeofenceZoneDto?> GetZoneAsync(int zoneId)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var zone = await _context.GeofenceZones
            .Include(z => z.Project)
            .Include(z => z.WorkerAssignments)
            .FirstOrDefaultAsync(z => z.Id == zoneId && z.CompanyId == companyId);

        if (zone == null) return null;

        return new GeofenceZoneDto
        {
            Id = zone.Id,
            ProjectId = zone.ProjectId,
            ProjectName = zone.Project?.Name,
            Name = zone.Name,
            Description = zone.Description,
            ZoneType = zone.ZoneType,
            CenterLatitude = zone.CenterLatitude.HasValue ? (double)zone.CenterLatitude.Value : null,
            CenterLongitude = zone.CenterLongitude.HasValue ? (double)zone.CenterLongitude.Value : null,
            RadiusMeters = zone.RadiusMeters,
            PolygonGeoJson = zone.PolygonGeoJson,
            IsActive = zone.IsActive,
            AlertOnEntry = zone.AlertOnEntry,
            AlertOnExit = zone.AlertOnExit,
            AllowedExitDurationMinutes = zone.AllowedExitDurationMinutes,
            AssignedWorkerCount = zone.WorkerAssignments.Count(a => a.IsActive),
            CreatedAt = zone.CreatedAt
        };
    }

    public async Task<GeofenceZoneDto> CreateZoneAsync(CreateGeofenceZoneRequest request)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var zone = new GeofenceZone
        {
            CompanyId = companyId,
            ProjectId = request.ProjectId,
            Name = request.Name,
            Description = request.Description,
            ZoneType = request.ZoneType,
            CenterLatitude = request.CenterLatitude.HasValue ? (decimal)request.CenterLatitude.Value : null,
            CenterLongitude = request.CenterLongitude.HasValue ? (decimal)request.CenterLongitude.Value : null,
            RadiusMeters = request.RadiusMeters,
            PolygonGeoJson = request.PolygonGeoJson,
            IsActive = true,
            AlertOnEntry = request.AlertOnEntry,
            AlertOnExit = request.AlertOnExit,
            AllowedExitDurationMinutes = request.AllowedExitDurationMinutes
        };

        _context.GeofenceZones.Add(zone);
        await _context.SaveChangesAsync();

        return (await GetZoneAsync(zone.Id))!;
    }

    public async Task<GeofenceZoneDto> UpdateZoneAsync(int zoneId, UpdateGeofenceZoneRequest request)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var zone = await _context.GeofenceZones
            .FirstOrDefaultAsync(z => z.Id == zoneId && z.CompanyId == companyId);

        if (zone == null)
        {
            throw new InvalidOperationException("Zone not found");
        }

        zone.Name = request.Name;
        zone.Description = request.Description;
        zone.IsActive = request.IsActive;
        zone.AlertOnEntry = request.AlertOnEntry;
        zone.AlertOnExit = request.AlertOnExit;
        zone.AllowedExitDurationMinutes = request.AllowedExitDurationMinutes;
        zone.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetZoneAsync(zone.Id))!;
    }

    public async Task<bool> DeleteZoneAsync(int zoneId)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var zone = await _context.GeofenceZones
            .FirstOrDefaultAsync(z => z.Id == zoneId && z.CompanyId == companyId);

        if (zone == null) return false;

        _context.GeofenceZones.Remove(zone);
        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Worker Assignments

    public async Task<List<WorkerZoneAssignmentDto>> AssignWorkersAsync(int zoneId, AssignWorkersToZoneRequest request)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");
        var currentUserId = GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("No user context");

        var zone = await _context.GeofenceZones
            .FirstOrDefaultAsync(z => z.Id == zoneId && z.CompanyId == companyId);

        if (zone == null)
        {
            throw new InvalidOperationException("Zone not found");
        }

        var assignments = new List<WorkerZoneAssignmentDto>();

        foreach (var userId in request.UserIds)
        {
            // Check if already assigned
            var existing = await _context.WorkerGeofenceAssignments
                .FirstOrDefaultAsync(a => a.ZoneId == zoneId && a.UserId == userId);

            if (existing != null)
            {
                if (!existing.IsActive)
                {
                    existing.IsActive = true;
                    existing.AssignedAt = DateTime.UtcNow;
                    existing.AssignedBy = currentUserId;
                }
            }
            else
            {
                var assignment = new WorkerGeofenceAssignment
                {
                    ZoneId = zoneId,
                    UserId = userId,
                    AssignedBy = currentUserId,
                    AssignedAt = DateTime.UtcNow,
                    IsActive = true
                };
                _context.WorkerGeofenceAssignments.Add(assignment);
            }
        }

        await _context.SaveChangesAsync();

        return await GetZoneWorkersAsync(zoneId);
    }

    public async Task<bool> RemoveWorkerAsync(int zoneId, int userId)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var assignment = await _context.WorkerGeofenceAssignments
            .Include(a => a.Zone)
            .FirstOrDefaultAsync(a => a.ZoneId == zoneId && a.UserId == userId && a.Zone!.CompanyId == companyId);

        if (assignment == null) return false;

        assignment.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<WorkerZoneAssignmentDto>> GetZoneWorkersAsync(int zoneId)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var assignments = await _context.WorkerGeofenceAssignments
            .Include(a => a.Zone)
            .Include(a => a.User)
            .Include(a => a.AssignedByUser)
            .Where(a => a.ZoneId == zoneId && a.Zone!.CompanyId == companyId && a.IsActive)
            .OrderBy(a => a.User!.FirstName)
            .ToListAsync();

        return assignments.Select(a => new WorkerZoneAssignmentDto
        {
            AssignmentId = a.Id,
            ZoneId = a.ZoneId,
            ZoneName = a.Zone!.Name,
            UserId = a.UserId,
            UserName = $"{a.User!.FirstName} {a.User.LastName}",
            AssignedAt = a.AssignedAt,
            AssignedByName = $"{a.AssignedByUser!.FirstName} {a.AssignedByUser.LastName}",
            IsActive = a.IsActive
        }).ToList();
    }

    public async Task<List<WorkerAssignedZoneDto>> GetWorkerZonesAsync(int userId)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var assignments = await _context.WorkerGeofenceAssignments
            .Include(a => a.Zone)
            .Where(a => a.UserId == userId && a.Zone!.CompanyId == companyId && a.IsActive && a.Zone.IsActive)
            .ToListAsync();

        return assignments.Select(a => new WorkerAssignedZoneDto
        {
            ZoneId = a.ZoneId,
            ZoneName = a.Zone!.Name,
            IsCurrentlyInside = false // Will be calculated when needed
        }).ToList();
    }

    #endregion

    #region Events

    public async Task<GeofenceEventHistoryDto> GetEventsAsync(int? zoneId, int? userId, DateTime? fromDate, DateTime? toDate, int page = 1, int pageSize = 50)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var query = _context.GeofenceEvents
            .Include(e => e.User)
            .Include(e => e.Zone)
            .Include(e => e.Location)
            .Where(e => e.CompanyId == companyId);

        if (zoneId.HasValue)
            query = query.Where(e => e.ZoneId == zoneId.Value);

        if (userId.HasValue)
            query = query.Where(e => e.UserId == userId.Value);

        if (fromDate.HasValue)
            query = query.Where(e => e.EventTime >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(e => e.EventTime <= toDate.Value);

        var totalCount = await query.CountAsync();

        var events = await query
            .OrderByDescending(e => e.EventTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new GeofenceEventHistoryDto
        {
            Events = events.Select(e => new GeofenceEventDto
            {
                Id = e.Id,
                UserId = e.UserId,
                UserName = $"{e.User!.FirstName} {e.User.LastName}",
                ZoneId = e.ZoneId,
                ZoneName = e.Zone!.Name,
                EventType = e.EventType,
                EventTime = e.EventTime,
                DurationMinutes = e.DurationMinutes,
                IsAlerted = e.IsAlerted,
                Latitude = (double)e.Location!.Latitude,
                Longitude = (double)e.Location.Longitude,
                Notes = e.Notes
            }).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<GeofenceEventDto>> GetTodayEventsAsync(int? zoneId = null)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var today = DateTime.UtcNow.Date;

        var query = _context.GeofenceEvents
            .Include(e => e.User)
            .Include(e => e.Zone)
            .Include(e => e.Location)
            .Where(e => e.CompanyId == companyId && e.EventTime.Date == today);

        if (zoneId.HasValue)
            query = query.Where(e => e.ZoneId == zoneId.Value);

        var events = await query
            .OrderByDescending(e => e.EventTime)
            .Take(100)
            .ToListAsync();

        return events.Select(e => new GeofenceEventDto
        {
            Id = e.Id,
            UserId = e.UserId,
            UserName = $"{e.User!.FirstName} {e.User.LastName}",
            ZoneId = e.ZoneId,
            ZoneName = e.Zone!.Name,
            EventType = e.EventType,
            EventTime = e.EventTime,
            DurationMinutes = e.DurationMinutes,
            IsAlerted = e.IsAlerted,
            Latitude = (double)e.Location!.Latitude,
            Longitude = (double)e.Location.Longitude,
            Notes = e.Notes
        }).ToList();
    }

    #endregion

    #region Worker Status

    public async Task<WorkersZoneSummaryDto> GetWorkersZoneStatusAsync()
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        // Get all workers with active zone assignments
        var workerAssignments = await _context.WorkerGeofenceAssignments
            .Include(a => a.User)
            .Include(a => a.Zone)
            .Where(a => a.Zone!.CompanyId == companyId && a.IsActive && a.Zone.IsActive)
            .GroupBy(a => a.UserId)
            .ToDictionaryAsync(g => g.Key, g => g.ToList());

        var workerIds = workerAssignments.Keys.ToList();

        // Get latest location for each worker
        var latestLocations = await _context.WorkerLocations
            .Where(l => workerIds.Contains(l.UserId))
            .GroupBy(l => l.UserId)
            .Select(g => g.OrderByDescending(l => l.RecordedAt).First())
            .ToDictionaryAsync(l => l.UserId, l => l);

        var workers = new List<WorkerZoneStatusDto>();

        foreach (var kvp in workerAssignments)
        {
            var userId = kvp.Key;
            var assignments = kvp.Value;
            var worker = assignments.First().User!;

            var status = new WorkerZoneStatusDto
            {
                UserId = userId,
                UserName = $"{worker.FirstName} {worker.LastName}",
                AssignedZones = assignments.Select(a => new WorkerAssignedZoneDto
                {
                    ZoneId = a.ZoneId,
                    ZoneName = a.Zone!.Name,
                    IsCurrentlyInside = false
                }).ToList()
            };

            if (latestLocations.TryGetValue(userId, out var location))
            {
                status.LastLocationTime = location.RecordedAt;
                status.LastLatitude = (double)location.Latitude;
                status.LastLongitude = (double)location.Longitude;

                // Check if inside any assigned zone
                foreach (var assignment in assignments)
                {
                    var zone = assignment.Zone!;
                    var isInside = IsPointInZone((double)location.Latitude, (double)location.Longitude, zone);

                    var assignedZone = status.AssignedZones.First(z => z.ZoneId == zone.Id);
                    assignedZone.IsCurrentlyInside = isInside;

                    if (isInside)
                    {
                        status.CurrentZoneId = zone.Id;
                        status.CurrentZoneName = zone.Name;
                        status.IsInsideZone = true;
                    }
                }

                // If not inside any zone, check for exit duration
                if (!status.IsInsideZone && status.AssignedZones.Any())
                {
                    // Get last exit event
                    var lastExit = await _context.GeofenceEvents
                        .Where(e => e.UserId == userId && e.EventType == GeofenceEventType.Exit)
                        .OrderByDescending(e => e.EventTime)
                        .FirstOrDefaultAsync();

                    if (lastExit != null)
                    {
                        status.ExitTime = lastExit.EventTime;
                        status.MinutesOutside = (int)(DateTime.UtcNow - lastExit.EventTime).TotalMinutes;

                        var zone = assignments.First(a => a.ZoneId == lastExit.ZoneId).Zone;
                        status.IsOverdue = status.MinutesOutside > zone.AllowedExitDurationMinutes;
                    }
                }
            }

            workers.Add(status);
        }

        return new WorkersZoneSummaryDto
        {
            LastUpdated = DateTime.UtcNow,
            TotalWorkers = workers.Count,
            WorkersInsideZone = workers.Count(w => w.IsInsideZone),
            WorkersOutsideZone = workers.Count(w => !w.IsInsideZone),
            WorkersOverdue = workers.Count(w => w.IsOverdue),
            Workers = workers
        };
    }

    public async Task<WorkerZoneStatusDto> GetWorkerZoneStatusAsync(int userId)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var assignments = await _context.WorkerGeofenceAssignments
            .Include(a => a.User)
            .Include(a => a.Zone)
            .Where(a => a.UserId == userId && a.Zone!.CompanyId == companyId && a.IsActive && a.Zone.IsActive)
            .ToListAsync();

        if (!assignments.Any())
        {
            throw new InvalidOperationException("Worker has no zone assignments");
        }

        var worker = assignments.First().User!;
        var status = new WorkerZoneStatusDto
        {
            UserId = userId,
            UserName = $"{worker.FirstName} {worker.LastName}",
            AssignedZones = assignments.Select(a => new WorkerAssignedZoneDto
            {
                ZoneId = a.ZoneId,
                ZoneName = a.Zone!.Name,
                IsCurrentlyInside = false
            }).ToList()
        };

        // Get latest location
        var location = await _context.WorkerLocations
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.RecordedAt)
            .FirstOrDefaultAsync();

        if (location != null)
        {
            status.LastLocationTime = location.RecordedAt;
            status.LastLatitude = (double)location.Latitude;
            status.LastLongitude = (double)location.Longitude;

            foreach (var assignment in assignments)
            {
                var zone = assignment.Zone!;
                var isInside = IsPointInZone((double)location.Latitude, (double)location.Longitude, zone);

                var assignedZone = status.AssignedZones.First(z => z.ZoneId == zone.Id);
                assignedZone.IsCurrentlyInside = isInside;

                if (isInside)
                {
                    status.CurrentZoneId = zone.Id;
                    status.CurrentZoneName = zone.Name;
                    status.IsInsideZone = true;
                }
            }
        }

        return status;
    }

    #endregion

    #region Location Processing

    public async Task ProcessLocationAsync(int locationId, int userId, double latitude, double longitude)
    {
        var companyId = _companyContext.CompanyId;
        if (companyId == null) return;

        // Get worker's active zone assignments
        var assignments = await _context.WorkerGeofenceAssignments
            .Include(a => a.Zone)
            .Where(a => a.UserId == userId && a.IsActive && a.Zone!.IsActive)
            .ToListAsync();

        if (!assignments.Any()) return;

        var location = await _context.WorkerLocations.FindAsync(locationId);
        if (location == null) return;

        foreach (var assignment in assignments)
        {
            var zone = assignment.Zone!;
            var isCurrentlyInside = IsPointInZone(latitude, longitude, zone);

            // Get last known status for this zone
            var lastEvent = await _context.GeofenceEvents
                .Where(e => e.UserId == userId && e.ZoneId == zone.Id)
                .OrderByDescending(e => e.EventTime)
                .FirstOrDefaultAsync();

            var wasInside = lastEvent?.EventType == GeofenceEventType.Entry || 
                           lastEvent?.EventType == GeofenceEventType.Return;

            // Detect state change
            if (isCurrentlyInside && !wasInside)
            {
                // Entry event
                var entryEvent = new GeofenceEvent
                {
                    CompanyId = companyId,
                    UserId = userId,
                    ZoneId = zone.Id,
                    LocationId = locationId,
                    EventType = GeofenceEventType.Entry,
                    EventTime = DateTime.UtcNow
                };
                _context.GeofenceEvents.Add(entryEvent);

                if (zone.AlertOnEntry)
                {
                    await SendZoneAlertAsync(userId, zone, "entered");
                    entryEvent.IsAlerted = true;
                    entryEvent.AlertedAt = DateTime.UtcNow;
                }

                _logger.LogInformation("Worker {UserId} entered zone {ZoneId}", userId, zone.Id);
            }
            else if (!isCurrentlyInside && wasInside)
            {
                // Exit event
                var exitEvent = new GeofenceEvent
                {
                    CompanyId = companyId,
                    UserId = userId,
                    ZoneId = zone.Id,
                    LocationId = locationId,
                    EventType = GeofenceEventType.Exit,
                    EventTime = DateTime.UtcNow
                };
                _context.GeofenceEvents.Add(exitEvent);

                if (zone.AlertOnExit)
                {
                    await SendZoneAlertAsync(userId, zone, "exited");
                    exitEvent.IsAlerted = true;
                    exitEvent.AlertedAt = DateTime.UtcNow;
                }

                _logger.LogInformation("Worker {UserId} exited zone {ZoneId}", userId, zone.Id);
            }
        }

        await _context.SaveChangesAsync();
    }

    #endregion

    #region Helper Methods

    private bool IsPointInZone(double latitude, double longitude, GeofenceZone zone)
    {
        if (zone.ZoneType == ZoneType.Circle)
        {
            if (!zone.CenterLatitude.HasValue || !zone.CenterLongitude.HasValue || !zone.RadiusMeters.HasValue)
                return false;

            return IsPointInCircle(
                latitude, longitude,
                (double)zone.CenterLatitude.Value,
                (double)zone.CenterLongitude.Value,
                zone.RadiusMeters.Value
            );
        }
        else if (zone.ZoneType == ZoneType.Polygon && !string.IsNullOrEmpty(zone.PolygonGeoJson))
        {
            // For polygon, we would need a GeoJSON parser
            // For now, return false - this would require additional implementation
            return false;
        }

        return false;
    }

    private bool IsPointInCircle(double lat1, double lon1, double lat2, double lon2, double radiusMeters)
    {
        // Haversine formula to calculate distance
        var distance = CalculateDistance(lat1, lon1, lat2, lon2);
        return distance <= radiusMeters;
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371000; // Earth's radius in meters

        var phi1 = lat1 * Math.PI / 180;
        var phi2 = lat2 * Math.PI / 180;
        var deltaPhi = (lat2 - lat1) * Math.PI / 180;
        var deltaLambda = (lon2 - lon1) * Math.PI / 180;

        var a = Math.Sin(deltaPhi / 2) * Math.Sin(deltaPhi / 2) +
                Math.Cos(phi1) * Math.Cos(phi2) *
                Math.Sin(deltaLambda / 2) * Math.Sin(deltaLambda / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c;
    }

    private async Task SendZoneAlertAsync(int userId, GeofenceZone zone, string action)
    {
        // Get company admins to notify
        var admins = await _context.UserRoles
            .Include(ur => ur.User)
            .Include(ur => ur.Role)
            .Where(ur => ur.User!.CompanyId == zone.CompanyId && 
                   (ur.Role!.Name == "CompanyOwner" || ur.Role.Name == "Admin"))
            .Select(ur => ur.UserId)
            .Distinct()
            .ToListAsync();

        var user = await _context.Users.FindAsync(userId);
        var userName = user != null ? $"{user.FirstName} {user.LastName}" : $"User {userId}";

        foreach (var adminId in admins)
        {
            await _notificationService.CreateAndSendAsync(
                adminId,
                "Geofence Alert",
                $"Worker {userName} has {action} zone '{zone.Name}'",
                $"/geofencing/zones/{zone.Id}",
                Domain.Entities.NotificationType.General
            );
        }
    }

    #endregion
}
