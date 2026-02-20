using System;
using System.Threading.Tasks;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.BackgroundJobs;

/// <summary>
/// Background jobs for location tracking functionality
/// </summary>
public class LocationTrackingJobs
{
    private readonly ApplicationDbContext _context;
    private readonly ILocationTrackingService _locationTrackingService;
    private readonly ILogger<LocationTrackingJobs> _logger;

    public LocationTrackingJobs(
        ApplicationDbContext context,
        ILocationTrackingService locationTrackingService,
        ILogger<LocationTrackingJobs> logger)
    {
        _context = context;
        _locationTrackingService = locationTrackingService;
        _logger = logger;
    }

    /// <summary>
    /// Generates random check requests for all companies with random interval tracking enabled.
    /// Should run once per day, early morning before working hours.
    /// </summary>
    public async Task GenerateDailyRandomChecksAsync()
    {
        _logger.LogInformation("Starting daily random check generation at {Time}", DateTime.UtcNow);

        try
        {
            // Get all companies with random interval tracking enabled
            var companySettings = await _context.CompanyLocationSettings
                .Where(s => s.IsLocationTrackingEnabled && s.TrackingMode == Domain.Enums.TrackingMode.RandomInterval)
                .ToListAsync();

            _logger.LogInformation("Found {Count} companies with random interval tracking", companySettings.Count);

            foreach (var settings in companySettings)
            {
                try
                {
                    await _locationTrackingService.GenerateRandomCheckRequestsAsync(settings.CompanyId ?? 0);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to generate random checks for company {CompanyId}", settings.CompanyId);
                }
            }

            _logger.LogInformation("Completed daily random check generation");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in daily random check generation");
            throw;
        }
    }

    /// <summary>
    /// Processes expired location requests.
    /// Should run every 5-10 minutes.
    /// </summary>
    public async Task ProcessExpiredRequestsAsync()
    {
        _logger.LogInformation("Processing expired location requests at {Time}", DateTime.UtcNow);

        try
        {
            await _locationTrackingService.ProcessExpiredRequestsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing expired requests");
            throw;
        }
    }

    /// <summary>
    /// Sends reminders for pending location requests.
    /// Should run every 5-10 minutes.
    /// </summary>
    public async Task SendLocationRemindersAsync()
    {
        _logger.LogInformation("Sending location reminders at {Time}", DateTime.UtcNow);

        try
        {
            await _locationTrackingService.SendRemindersAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending location reminders");
            throw;
        }
    }

    /// <summary>
    /// Checks for workers who have been outside geofence zones for too long.
    /// Should run every 5-15 minutes.
    /// </summary>
    public async Task CheckGeofenceViolationsAsync()
    {
        _logger.LogInformation("Checking geofence violations at {Time}", DateTime.UtcNow);

        try
        {
            // Get all active geofence events where workers exited and haven't returned
            var activeExits = await _context.GeofenceEvents
                .Include(e => e.Zone)
                .Include(e => e.User)
                .Where(e => e.EventType == Domain.Enums.GeofenceEventType.Exit &&
                       e.Zone!.IsActive &&
                       e.Zone.AllowedExitDurationMinutes > 0)
                .GroupBy(e => new { e.UserId, e.ZoneId })
                .Select(g => g.OrderByDescending(e => e.EventTime).First())
                .ToListAsync();

            var now = DateTime.UtcNow;
            var violations = new List<(int UserId, int ZoneId, int MinutesOutside)>();

            foreach (var exitEvent in activeExits)
            {
                // Check if there's a subsequent entry/return event
                var hasReturned = await _context.GeofenceEvents
                    .AnyAsync(e => e.UserId == exitEvent.UserId &&
                             e.ZoneId == exitEvent.ZoneId &&
                             e.EventType == Domain.Enums.GeofenceEventType.Entry &&
                             e.EventTime > exitEvent.EventTime);

                if (!hasReturned)
                {
                    var minutesOutside = (int)(now - exitEvent.EventTime).TotalMinutes;
                    var allowedMinutes = exitEvent.Zone!.AllowedExitDurationMinutes;

                    if (minutesOutside > allowedMinutes)
                    {
                        violations.Add((exitEvent.UserId, exitEvent.ZoneId, minutesOutside));

                        // Create extended exit event
                        var extendedEvent = new Domain.Entities.GeofenceEvent
                        {
                            CompanyId = exitEvent.CompanyId,
                            UserId = exitEvent.UserId,
                            ZoneId = exitEvent.ZoneId,
                            LocationId = exitEvent.LocationId,
                            EventType = Domain.Enums.GeofenceEventType.ExtendedExit,
                            EventTime = now,
                            DurationMinutes = minutesOutside,
                            IsAlerted = true,
                            AlertedAt = now,
                            Notes = $"Worker has been outside zone for {minutesOutside} minutes (allowed: {allowedMinutes})"
                        };
                        _context.GeofenceEvents.Add(extendedEvent);
                    }
                }
            }

            if (violations.Any())
            {
                await _context.SaveChangesAsync();
                _logger.LogWarning("Found {Count} geofence violations", violations.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking geofence violations");
            throw;
        }
    }
}
