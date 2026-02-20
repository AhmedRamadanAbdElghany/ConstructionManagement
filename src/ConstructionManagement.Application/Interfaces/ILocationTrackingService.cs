using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs.LocationTracking;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service for managing worker location tracking
/// </summary>
public interface ILocationTrackingService
{
    #region Company Settings
    
    /// <summary>
    /// Gets the location tracking settings for the current company
    /// </summary>
    Task<CompanyLocationSettingsDto> GetSettingsAsync();
    
    /// <summary>
    /// Updates the location tracking settings for the current company
    /// </summary>
    Task<CompanyLocationSettingsDto> UpdateSettingsAsync(UpdateLocationSettingsRequest request);
    
    #endregion
    
    #region Location Submission (Worker)
    
    /// <summary>
    /// Submits a location from a worker
    /// </summary>
    Task<WorkerLocationDto> SubmitLocationAsync(SubmitLocationRequest request);
    
    /// <summary>
    /// Gets pending location requests for the current worker
    /// </summary>
    Task<List<PendingLocationRequestDto>> GetMyPendingRequestsAsync();
    
    /// <summary>
    /// Gets location history for the current worker
    /// </summary>
    Task<WorkerLocationHistoryDto> GetMyHistoryAsync(DateTime? fromDate, DateTime? toDate, int page = 1, int pageSize = 20);
    
    #endregion
    
    #region Location Management (Admin)
    
    /// <summary>
    /// Creates an on-demand location request for specified workers
    /// </summary>
    Task<LocationRequestDto> CreateLocationRequestAsync(RequestLocationRequest request);
    
    /// <summary>
    /// Gets all location requests for the company
    /// </summary>
    Task<List<LocationRequestDto>> GetLocationRequestsAsync(DateTime? fromDate, DateTime? toDate, int? status = null);
    
    /// <summary>
    /// Cancels a location request
    /// </summary>
    Task<bool> CancelLocationRequestAsync(int requestId);
    
    /// <summary>
    /// Gets location status for all workers today
    /// </summary>
    Task<TodayLocationSummaryDto> GetTodaySummaryAsync();
    
    /// <summary>
    /// Gets location history for a specific worker
    /// </summary>
    Task<WorkerLocationHistoryDto> GetWorkerHistoryAsync(int userId, DateTime? fromDate, DateTime? toDate, int page = 1, int pageSize = 20);
    
    /// <summary>
    /// Gets location status for a specific worker
    /// </summary>
    Task<WorkerLocationStatusDto> GetWorkerStatusAsync(int userId);
    
    #endregion
    
    #region Background Job Support
    
    /// <summary>
    /// Generates random check requests for the day (called by background job)
    /// </summary>
    Task GenerateRandomCheckRequestsAsync(int companyId);
    
    /// <summary>
    /// Processes expired location requests (called by background job)
    /// </summary>
    Task ProcessExpiredRequestsAsync();
    
    /// <summary>
    /// Sends reminders for pending requests (called by background job)
    /// </summary>
    Task SendRemindersAsync();
    
    #endregion
}
