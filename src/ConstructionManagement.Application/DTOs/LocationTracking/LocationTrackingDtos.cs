using System;
using System.Collections.Generic;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs.LocationTracking;

#region Company Settings

/// <summary>
/// DTO for company location tracking settings
/// </summary>
public class CompanyLocationSettingsDto
{
    public int Id { get; set; }
    public bool IsLocationTrackingEnabled { get; set; }
    public TrackingMode TrackingMode { get; set; }
    public TimeSpan WorkingHoursStart { get; set; }
    public TimeSpan WorkingHoursEnd { get; set; }
    public int RandomCheckCount { get; set; }
    public List<int> WorkingDays { get; set; } = new();
    public bool RequirePhoto { get; set; }
    public int RequestExpirationMinutes { get; set; }
    public bool SendReminders { get; set; }
    public int ReminderDelayMinutes { get; set; }
}

/// <summary>
/// Request to update company location tracking settings
/// </summary>
public class UpdateLocationSettingsRequest
{
    public bool IsLocationTrackingEnabled { get; set; }
    public TrackingMode TrackingMode { get; set; }
    public TimeSpan WorkingHoursStart { get; set; }
    public TimeSpan WorkingHoursEnd { get; set; }
    public int RandomCheckCount { get; set; }
    public List<int> WorkingDays { get; set; } = new();
    public bool RequirePhoto { get; set; }
    public int RequestExpirationMinutes { get; set; } = 30;
    public bool SendReminders { get; set; } = true;
    public int ReminderDelayMinutes { get; set; } = 10;
}

#endregion

#region Location Submission

/// <summary>
/// Request to submit a worker's location
/// </summary>
public class SubmitLocationRequest
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Accuracy { get; set; }
    public LocationType LocationType { get; set; }
    public int? RequestId { get; set; }
    public string? Notes { get; set; }
    public string? DeviceInfo { get; set; }
}

/// <summary>
/// DTO for a worker location record
/// </summary>
public class WorkerLocationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Accuracy { get; set; }
    public LocationType LocationType { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime RecordedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for worker location history
/// </summary>
public class WorkerLocationHistoryDto
{
    public List<WorkerLocationDto> Locations { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

#endregion

#region Location Requests

/// <summary>
/// Request to create an on-demand location request
/// </summary>
public class RequestLocationRequest
{
    public List<int> UserIds { get; set; } = new();
    public string? Notes { get; set; }
    public int? ExpiresInMinutes { get; set; }
}

/// <summary>
/// DTO for a location request
/// </summary>
public class LocationRequestDto
{
    public int Id { get; set; }
    public LocationRequestType RequestType { get; set; }
    public LocationRequestStatus Status { get; set; }
    public DateTime? ScheduledFor { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? Notes { get; set; }
    public int RequestedByUserId { get; set; }
    public string RequestedByUserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<LocationRequestTargetDto> Targets { get; set; } = new();
}

/// <summary>
/// DTO for a location request target
/// </summary>
public class LocationRequestTargetDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public LocationRequestStatus Status { get; set; }
    public WorkerLocationDto? Location { get; set; }
    public DateTime? FulfilledAt { get; set; }
}

/// <summary>
/// DTO for pending location request (for worker view)
/// </summary>
public class PendingLocationRequestDto
{
    public int RequestId { get; set; }
    public int TargetId { get; set; }
    public LocationRequestType RequestType { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsExpired { get; set; }
}

#endregion

#region Worker Status

/// <summary>
/// DTO for worker location status
/// </summary>
public class WorkerLocationStatusDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public bool HasSubmittedStartLocation { get; set; }
    public bool HasSubmittedEndLocation { get; set; }
    public int RandomChecksCompleted { get; set; }
    public int RandomChecksExpected { get; set; }
    public DateTime? LastLocationTime { get; set; }
    public WorkerLocationDto? LastLocation { get; set; }
    public List<PendingLocationRequestDto> PendingRequests { get; set; } = new();
}

/// <summary>
/// DTO for today's location summary
/// </summary>
public class TodayLocationSummaryDto
{
    public DateTime Date { get; set; }
    public int TotalWorkers { get; set; }
    public int WorkersWithStartLocation { get; set; }
    public int WorkersWithEndLocation { get; set; }
    public int WorkersPendingStart { get; set; }
    public int WorkersPendingEnd { get; set; }
    public List<WorkerLocationStatusDto> Workers { get; set; } = new();
}

#endregion
