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
/// Service for managing worker location tracking
/// </summary>
public class LocationTrackingService : ILocationTrackingService
{
    private readonly ApplicationDbContext _context;
    private readonly ICompanyContext _companyContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly INotificationService _notificationService;
    private readonly IGeofenceService _geofenceService;
    private readonly ILogger<LocationTrackingService> _logger;

    public LocationTrackingService(
        ApplicationDbContext context,
        ICompanyContext companyContext,
        IHttpContextAccessor httpContextAccessor,
        INotificationService notificationService,
        IGeofenceService geofenceService,
        ILogger<LocationTrackingService> logger)
    {
        _context = context;
        _companyContext = companyContext;
        _httpContextAccessor = httpContextAccessor;
        _notificationService = notificationService;
        _geofenceService = geofenceService;
        _logger = logger;
    }

    // Helper method to get user's company IDs via CompanyUser table
    private async Task<List<int>> GetUserCompanyIdsAsync(int userId)
    {
        return await _context.CompanyUsers
            .Where(cu => cu.UserId == userId && cu.Status == ContractStatus.Active)
            .Select(cu => cu.CompanyId)
            .ToListAsync();
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

    #region Company Settings

    public async Task<CompanyLocationSettingsDto> GetSettingsAsync()
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var settings = await _context.CompanyLocationSettings
            .FirstOrDefaultAsync(s => s.CompanyId == companyId);

        if (settings == null)
        {
            // Create default settings
            settings = new CompanyLocationSettings
            {
                CompanyId = companyId,
                IsLocationTrackingEnabled = false,
                TrackingMode = TrackingMode.StartEnd,
                WorkingHoursStart = new TimeSpan(8, 0, 0),
                WorkingHoursEnd = new TimeSpan(17, 0, 0),
                RandomCheckCount = 3,
                WorkingDays = "1,2,3,4,5",
                RequirePhoto = false,
                RequestExpirationMinutes = 30,
                SendReminders = true,
                ReminderDelayMinutes = 10
            };
            _context.CompanyLocationSettings.Add(settings);
            await _context.SaveChangesAsync();
        }

        return MapToSettingsDto(settings);
    }

    public async Task<CompanyLocationSettingsDto> UpdateSettingsAsync(UpdateLocationSettingsRequest request)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var settings = await _context.CompanyLocationSettings
            .FirstOrDefaultAsync(s => s.CompanyId == companyId);

        if (settings == null)
        {
            settings = new CompanyLocationSettings { CompanyId = companyId };
            _context.CompanyLocationSettings.Add(settings);
        }

        settings.IsLocationTrackingEnabled = request.IsLocationTrackingEnabled;
        settings.TrackingMode = request.TrackingMode;
        settings.WorkingHoursStart = request.WorkingHoursStart;
        settings.WorkingHoursEnd = request.WorkingHoursEnd;
        settings.RandomCheckCount = Math.Clamp(request.RandomCheckCount, 1, 10);
        settings.WorkingDays = string.Join(",", request.WorkingDays);
        settings.RequirePhoto = request.RequirePhoto;
        settings.RequestExpirationMinutes = request.RequestExpirationMinutes;
        settings.SendReminders = request.SendReminders;
        settings.ReminderDelayMinutes = request.ReminderDelayMinutes;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToSettingsDto(settings);
    }

    #endregion

    #region Location Submission (Worker)

    public async Task<WorkerLocationDto> SubmitLocationAsync(SubmitLocationRequest request)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");
        var userId = GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("No user context");

        // Check if there's a pending request to fulfill
        LocationRequestTarget? target = null;
        if (request.RequestId.HasValue)
        {
            target = await _context.LocationRequestTargets
                .Include(t => t.Request)
                .FirstOrDefaultAsync(t => t.RequestId == request.RequestId && t.UserId == userId && t.Status == LocationRequestStatus.Pending);

            if (target == null)
            {
                throw new InvalidOperationException("Location request not found or already fulfilled");
            }
        }

        var location = new WorkerLocation
        {
            CompanyId = companyId,
            UserId = userId,
            Latitude = (decimal)request.Latitude,
            Longitude = (decimal)request.Longitude,
            Accuracy = (decimal?)request.Accuracy,
            LocationType = request.LocationType,
            RequestId = request.RequestId,
            Notes = request.Notes,
            DeviceInfo = request.DeviceInfo,
            RecordedAt = DateTime.UtcNow
        };

        _context.WorkerLocations.Add(location);
        await _context.SaveChangesAsync(); // Save first to get the ID

        // Process geofence zones
        try
        {
            await _geofenceService.ProcessLocationAsync(location.Id, userId, request.Latitude, request.Longitude);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to process geofence for location {LocationId}", location.Id);
        }

        // Update request target if applicable
        if (target != null)
        {
            target.Status = LocationRequestStatus.Fulfilled;
            target.LocationId = location.Id;
            target.FulfilledAt = DateTime.UtcNow;

            // Check if all targets are fulfilled
            var allTargets = await _context.LocationRequestTargets
                .Where(t => t.RequestId == target.RequestId)
                .ToListAsync();

            if (allTargets.All(t => t.Status == LocationRequestStatus.Fulfilled))
            {
                target.Request!.Status = LocationRequestStatus.Fulfilled;
                target.Request.FulfilledAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        return await MapToLocationDtoAsync(location);
    }

    public async Task<List<PendingLocationRequestDto>> GetMyPendingRequestsAsync()
    {
        var userId = GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("No user context");

        var now = DateTime.UtcNow;

        var targets = await _context.LocationRequestTargets
            .Include(t => t.Request)
            .Where(t => t.UserId == userId && t.Status == LocationRequestStatus.Pending)
            .OrderByDescending(t => t.Request!.CreatedAt)
            .ToListAsync();

        return targets.Select(t => new PendingLocationRequestDto
        {
            RequestId = t.RequestId,
            TargetId = t.Id,
            RequestType = t.Request!.RequestType,
            ExpiresAt = t.Request.ExpiresAt,
            Notes = t.Request.Notes,
            CreatedAt = t.Request.CreatedAt,
            IsExpired = t.Request.ExpiresAt.HasValue && t.Request.ExpiresAt.Value < now
        }).ToList();
    }

    public async Task<WorkerLocationHistoryDto> GetMyHistoryAsync(DateTime? fromDate, DateTime? toDate, int page = 1, int pageSize = 20)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");
        var userId = GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("No user context");

        var query = _context.WorkerLocations
            .Include(l => l.User)
            .Where(l => l.CompanyId == companyId && l.UserId == userId);

        if (fromDate.HasValue)
            query = query.Where(l => l.RecordedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(l => l.RecordedAt <= toDate.Value);

        var totalCount = await query.CountAsync();

        var locations = await query
            .OrderByDescending(l => l.RecordedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new WorkerLocationHistoryDto
        {
            Locations = locations.Select(MapToLocationDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    #endregion

    #region Location Management (Admin)

    public async Task<LocationRequestDto> CreateLocationRequestAsync(RequestLocationRequest request)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");
        var userId = GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("No user context");

        if (request.UserIds == null || request.UserIds.Count == 0)
        {
            throw new ArgumentException("At least one worker must be selected");
        }

        var settings = await GetSettingsAsync();
        var expiresAt = DateTime.UtcNow.AddMinutes(request.ExpiresInMinutes ?? settings.RequestExpirationMinutes);

        var locationRequest = new LocationRequest
        {
            CompanyId = companyId,
            RequestedByUserId = userId,
            RequestType = LocationRequestType.OnDemand,
            Status = LocationRequestStatus.Pending,
            ExpiresAt = expiresAt,
            Notes = request.Notes
        };

        _context.LocationRequests.Add(locationRequest);
        await _context.SaveChangesAsync();

        // Create targets
        foreach (var targetUserId in request.UserIds)
        {
            var target = new LocationRequestTarget
            {
                RequestId = locationRequest.Id,
                UserId = targetUserId,
                Status = LocationRequestStatus.Pending,
                NotifiedAt = DateTime.UtcNow
            };
            _context.LocationRequestTargets.Add(target);

            // Send notification
            await _notificationService.CreateAndSendAsync(
                targetUserId,
                "Location Request",
                "Your location has been requested. Please submit your current location.",
                $"/location-tracking?request={locationRequest.Id}",
                Domain.Entities.NotificationType.General
            );
        }

        await _context.SaveChangesAsync();

        return await MapToRequestDtoAsync(locationRequest);
    }

    public async Task<List<LocationRequestDto>> GetLocationRequestsAsync(DateTime? fromDate, DateTime? toDate, int? status = null)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var query = _context.LocationRequests
            .Include(r => r.Targets)
                .ThenInclude(t => t.User)
            .Include(r => r.RequestedByUser)
            .Where(r => r.CompanyId == companyId);

        if (fromDate.HasValue)
            query = query.Where(r => r.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(r => r.CreatedAt <= toDate.Value);

        if (status.HasValue)
        {
            var statusEnum = (LocationRequestStatus)status.Value;
            query = query.Where(r => r.Status == statusEnum);
        }

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .Take(100)
            .ToListAsync();

        var result = new List<LocationRequestDto>();
        foreach (var req in requests)
        {
            result.Add(await MapToRequestDtoAsync(req));
        }
        return result;
    }

    public async Task<bool> CancelLocationRequestAsync(int requestId)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var request = await _context.LocationRequests
            .Include(r => r.Targets)
            .FirstOrDefaultAsync(r => r.Id == requestId && r.CompanyId == companyId);

        if (request == null)
            return false;

        if (request.Status != LocationRequestStatus.Pending)
            return false;

        request.Status = LocationRequestStatus.Cancelled;
        foreach (var target in request.Targets.Where(t => t.Status == LocationRequestStatus.Pending))
        {
            target.Status = LocationRequestStatus.Cancelled;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TodayLocationSummaryDto> GetTodaySummaryAsync()
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var today = DateTime.UtcNow.Date;
        var settings = await GetSettingsAsync();

        // Get all workers (users with UserType Worker in the company)
        var workers = await _context.UserRoles
            .Include(ur => ur.User)
            .Include(ur => ur.Role)
            .Where(ur => ur.User.CompanyId == companyId && ur.Role.Name == "Worker")
            .Select(ur => ur.User)
            .Distinct()
            .ToListAsync();

        var workerIds = workers.Select(w => w.Id).ToList();

        // Get today's locations
        var todayLocations = await _context.WorkerLocations
            .Where(l => l.CompanyId == companyId && workerIds.Contains(l.UserId) && l.RecordedAt.Date == today)
            .GroupBy(l => l.UserId)
            .ToDictionaryAsync(g => g.Key, g => g.ToList());

        // Get pending requests
        var pendingTargets = await _context.LocationRequestTargets
            .Include(t => t.Request)
            .Where(t => t.Request!.CompanyId == companyId && 
                   workerIds.Contains(t.UserId) && 
                   t.Status == LocationRequestStatus.Pending)
            .ToListAsync();

        var workerStatuses = new List<WorkerLocationStatusDto>();

        foreach (var worker in workers)
        {
            var status = new WorkerLocationStatusDto
            {
                UserId = worker.Id,
                UserName = $"{worker.FirstName} {worker.LastName}",
                HasSubmittedStartLocation = false,
                HasSubmittedEndLocation = false,
                RandomChecksCompleted = 0,
                RandomChecksExpected = settings.IsLocationTrackingEnabled && settings.TrackingMode == TrackingMode.RandomInterval ? settings.RandomCheckCount : 0
            };

            if (todayLocations.TryGetValue(worker.Id, out var locations))
            {
                status.HasSubmittedStartLocation = locations.Any(l => l.LocationType == LocationType.StartOfDay);
                status.HasSubmittedEndLocation = locations.Any(l => l.LocationType == LocationType.EndOfDay);
                status.RandomChecksCompleted = locations.Count(l => l.LocationType == LocationType.RandomCheck);
                status.LastLocationTime = locations.Max(l => l.RecordedAt);
                status.LastLocation = MapToLocationDto(locations.OrderByDescending(l => l.RecordedAt).First());
            }

            status.PendingRequests = pendingTargets
                .Where(t => t.UserId == worker.Id)
                .Select(t => new PendingLocationRequestDto
                {
                    RequestId = t.RequestId,
                    TargetId = t.Id,
                    RequestType = t.Request!.RequestType,
                    ExpiresAt = t.Request.ExpiresAt,
                    Notes = t.Request.Notes,
                    CreatedAt = t.Request.CreatedAt,
                    IsExpired = t.Request.ExpiresAt.HasValue && t.Request.ExpiresAt.Value < DateTime.UtcNow
                })
                .ToList();

            workerStatuses.Add(status);
        }

        return new TodayLocationSummaryDto
        {
            Date = today,
            TotalWorkers = workers.Count,
            WorkersWithStartLocation = workerStatuses.Count(w => w.HasSubmittedStartLocation),
            WorkersWithEndLocation = workerStatuses.Count(w => w.HasSubmittedEndLocation),
            WorkersPendingStart = workerStatuses.Count(w => !w.HasSubmittedStartLocation),
            WorkersPendingEnd = workerStatuses.Count(w => w.HasSubmittedStartLocation && !w.HasSubmittedEndLocation),
            Workers = workerStatuses
        };
    }

    public async Task<WorkerLocationHistoryDto> GetWorkerHistoryAsync(int userId, DateTime? fromDate, DateTime? toDate, int page = 1, int pageSize = 20)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var query = _context.WorkerLocations
            .Include(l => l.User)
            .Where(l => l.CompanyId == companyId && l.UserId == userId);

        if (fromDate.HasValue)
            query = query.Where(l => l.RecordedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(l => l.RecordedAt <= toDate.Value);

        var totalCount = await query.CountAsync();

        var locations = await query
            .OrderByDescending(l => l.RecordedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new WorkerLocationHistoryDto
        {
            Locations = locations.Select(MapToLocationDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<WorkerLocationStatusDto> GetWorkerStatusAsync(int userId)
    {
        var companyId = _companyContext.CompanyId
            ?? throw new UnauthorizedAccessException("No company context");

        var worker = await _context.Users.FindAsync(userId);
        if (worker == null || worker.CompanyId != companyId)
        {
            throw new InvalidOperationException("Worker not found");
        }

        var today = DateTime.UtcNow.Date;
        var settings = await GetSettingsAsync();

        var todayLocations = await _context.WorkerLocations
            .Where(l => l.CompanyId == companyId && l.UserId == userId && l.RecordedAt.Date == today)
            .OrderByDescending(l => l.RecordedAt)
            .ToListAsync();

        var pendingTargets = await _context.LocationRequestTargets
            .Include(t => t.Request)
            .Where(t => t.Request!.CompanyId == companyId && 
                   t.UserId == userId && 
                   t.Status == LocationRequestStatus.Pending)
            .ToListAsync();

        var status = new WorkerLocationStatusDto
        {
            UserId = worker.Id,
            UserName = $"{worker.FirstName} {worker.LastName}",
            HasSubmittedStartLocation = todayLocations.Any(l => l.LocationType == LocationType.StartOfDay),
            HasSubmittedEndLocation = todayLocations.Any(l => l.LocationType == LocationType.EndOfDay),
            RandomChecksCompleted = todayLocations.Count(l => l.LocationType == LocationType.RandomCheck),
            RandomChecksExpected = settings.IsLocationTrackingEnabled && settings.TrackingMode == TrackingMode.RandomInterval ? settings.RandomCheckCount : 0,
            LastLocationTime = todayLocations.FirstOrDefault()?.RecordedAt,
            LastLocation = todayLocations.FirstOrDefault() != null ? MapToLocationDto(todayLocations.First()) : null,
            PendingRequests = pendingTargets.Select(t => new PendingLocationRequestDto
            {
                RequestId = t.RequestId,
                TargetId = t.Id,
                RequestType = t.Request!.RequestType,
                ExpiresAt = t.Request.ExpiresAt,
                Notes = t.Request.Notes,
                CreatedAt = t.Request.CreatedAt,
                IsExpired = t.Request.ExpiresAt.HasValue && t.Request.ExpiresAt.Value < DateTime.UtcNow
            }).ToList()
        };

        return status;
    }

    #endregion

    #region Background Job Support

    public async Task GenerateRandomCheckRequestsAsync(int companyId)
    {
        var settings = await _context.CompanyLocationSettings
            .FirstOrDefaultAsync(s => s.CompanyId == companyId);

        if (settings == null || !settings.IsLocationTrackingEnabled || settings.TrackingMode != TrackingMode.RandomInterval)
        {
            return;
        }

        var today = DateTime.UtcNow.Date;
        var dayOfWeek = (int)today.DayOfWeek;
        // Convert to Monday=1 format
        if (dayOfWeek == 0) dayOfWeek = 7;

        var workingDays = settings.WorkingDays.Split(',').Select(int.Parse).ToList();
        if (!workingDays.Contains(dayOfWeek))
        {
            _logger.LogInformation("Today is not a working day for company {CompanyId}", companyId);
            return;
        }

        // Get workers
        var workers = await _context.UserRoles
            .Include(ur => ur.User)
            .Include(ur => ur.Role)
            .Where(ur => ur.User.CompanyId == companyId && ur.Role.Name == "Worker")
            .Select(ur => ur.User.Id)
            .Distinct()
            .ToListAsync();

        if (!workers.Any())
        {
            return;
        }

        // Generate random check times
        var random = new Random();
        var workingMinutes = (settings.WorkingHoursEnd - settings.WorkingHoursStart).TotalMinutes;
        var checkTimes = new List<TimeSpan>();

        for (int i = 0; i < settings.RandomCheckCount; i++)
        {
            var minutesFromStart = random.Next(0, (int)workingMinutes);
            checkTimes.Add(settings.WorkingHoursStart.Add(TimeSpan.FromMinutes(minutesFromStart)));
        }

        checkTimes.Sort();

        // Create requests for each check time
        foreach (var checkTime in checkTimes)
        {
            var scheduledFor = today.Add(checkTime);
            var expiresAt = scheduledFor.AddMinutes(settings.RequestExpirationMinutes);

            var request = new LocationRequest
            {
                CompanyId = companyId,
                RequestType = LocationRequestType.RandomScheduled,
                Status = LocationRequestStatus.Pending,
                ScheduledFor = scheduledFor,
                ExpiresAt = expiresAt
            };

            _context.LocationRequests.Add(request);
            await _context.SaveChangesAsync();

            foreach (var workerId in workers)
            {
                var target = new LocationRequestTarget
                {
                    RequestId = request.Id,
                    UserId = workerId,
                    Status = LocationRequestStatus.Pending
                };
                _context.LocationRequestTargets.Add(target);
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Generated {Count} random check requests for company {CompanyId}", checkTimes.Count, companyId);
    }

    public async Task ProcessExpiredRequestsAsync()
    {
        var now = DateTime.UtcNow;

        var expiredTargets = await _context.LocationRequestTargets
            .Include(t => t.Request)
            .Where(t => t.Status == LocationRequestStatus.Pending && 
                   t.Request!.ExpiresAt.HasValue && 
                   t.Request.ExpiresAt.Value < now)
            .ToListAsync();

        foreach (var target in expiredTargets)
        {
            target.Status = LocationRequestStatus.Expired;
        }

        // Update requests where all targets are expired
        var expiredRequestIds = expiredTargets.Select(t => t.RequestId).Distinct();
        foreach (var requestId in expiredRequestIds)
        {
            var allTargets = await _context.LocationRequestTargets
                .Where(t => t.RequestId == requestId)
                .ToListAsync();

            if (allTargets.All(t => t.Status == LocationRequestStatus.Expired || t.Status == LocationRequestStatus.Cancelled))
            {
                var request = await _context.LocationRequests.FindAsync(requestId);
                if (request != null && request.Status == LocationRequestStatus.Pending)
                {
                    request.Status = LocationRequestStatus.Expired;
                }
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Processed {Count} expired location requests", expiredTargets.Count);
    }

    public async Task SendRemindersAsync()
    {
        var settings = await _context.CompanyLocationSettings
            .Where(s => s.IsLocationTrackingEnabled && s.SendReminders)
            .ToListAsync();

        foreach (var setting in settings)
        {
            var reminderThreshold = DateTime.UtcNow.AddMinutes(-setting.ReminderDelayMinutes);

            var targetsNeedingReminder = await _context.LocationRequestTargets
                .Include(t => t.Request)
                .Include(t => t.User)
                .Where(t => t.Status == LocationRequestStatus.Pending &&
                       t.NotifiedAt.HasValue &&
                       t.NotifiedAt.Value < reminderThreshold &&
                       (t.ReminderSentAt == null || t.ReminderSentAt < reminderThreshold))
                .ToListAsync();

            foreach (var target in targetsNeedingReminder)
            {
                await _notificationService.CreateAndSendAsync(
                    target.UserId,
                    "Location Reminder",
                    "Please submit your location. The request is still pending.",
                    $"/location-tracking?request={target.RequestId}",
                    Domain.Entities.NotificationType.General
                );

                target.ReminderSentAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
    }

    #endregion

    #region Mapping

    private CompanyLocationSettingsDto MapToSettingsDto(CompanyLocationSettings settings)
    {
        return new CompanyLocationSettingsDto
        {
            Id = settings.Id,
            IsLocationTrackingEnabled = settings.IsLocationTrackingEnabled,
            TrackingMode = settings.TrackingMode,
            WorkingHoursStart = settings.WorkingHoursStart,
            WorkingHoursEnd = settings.WorkingHoursEnd,
            RandomCheckCount = settings.RandomCheckCount,
            WorkingDays = settings.WorkingDays.Split(',').Where(s => !string.IsNullOrEmpty(s)).Select(int.Parse).ToList(),
            RequirePhoto = settings.RequirePhoto,
            RequestExpirationMinutes = settings.RequestExpirationMinutes,
            SendReminders = settings.SendReminders,
            ReminderDelayMinutes = settings.ReminderDelayMinutes
        };
    }

    private WorkerLocationDto MapToLocationDto(WorkerLocation location)
    {
        return new WorkerLocationDto
        {
            Id = location.Id,
            UserId = location.UserId,
            UserName = location.User != null ? $"{location.User.FirstName} {location.User.LastName}" : "",
            Latitude = (double)location.Latitude,
            Longitude = (double)location.Longitude,
            Accuracy = location.Accuracy.HasValue ? (double?)location.Accuracy.Value : null,
            LocationType = location.LocationType,
            PhotoUrl = location.PhotoUrl,
            Notes = location.Notes,
            RecordedAt = location.RecordedAt,
            CreatedAt = location.CreatedAt
        };
    }

    private async Task<WorkerLocationDto> MapToLocationDtoAsync(WorkerLocation location)
    {
        if (location.User == null)
        {
            location = await _context.WorkerLocations
                .Include(l => l.User)
                .FirstAsync(l => l.Id == location.Id);
        }

        return MapToLocationDto(location);
    }

    private async Task<LocationRequestDto> MapToRequestDtoAsync(LocationRequest request)
    {
        if (request.RequestedByUser == null)
        {
            request = await _context.LocationRequests
                .Include(r => r.RequestedByUser)
                .Include(r => r.Targets)
                    .ThenInclude(t => t.User)
                .FirstAsync(r => r.Id == request.Id);
        }

        return new LocationRequestDto
        {
            Id = request.Id,
            RequestType = request.RequestType,
            Status = request.Status,
            ScheduledFor = request.ScheduledFor,
            ExpiresAt = request.ExpiresAt,
            Notes = request.Notes,
            RequestedByUserId = request.RequestedByUserId,
            RequestedByUserName = $"{request.RequestedByUser.FirstName} {request.RequestedByUser.LastName}",
            CreatedAt = request.CreatedAt,
            Targets = request.Targets.Select(t => new LocationRequestTargetDto
            {
                UserId = t.UserId,
                UserName = t.User != null ? $"{t.User.FirstName} {t.User.LastName}" : "",
                Status = t.Status,
                Location = t.Location != null ? MapToLocationDto(t.Location) : null,
                FulfilledAt = t.FulfilledAt
            }).ToList()
        };
    }

    #endregion
}
