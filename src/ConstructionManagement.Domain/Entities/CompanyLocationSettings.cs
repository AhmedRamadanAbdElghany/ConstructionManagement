using System;
using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Company-level settings for worker location tracking
/// </summary>
public class CompanyLocationSettings : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// The company these settings belong to
    /// </summary>
    public int? CompanyId { get; set; }
    
    /// <summary>
    /// Navigation property to the company
    /// </summary>
    public Company Company { get; set; } = null!;
    
    /// <summary>
    /// Whether location tracking is enabled for this company
    /// </summary>
    public bool IsLocationTrackingEnabled { get; set; } = false;
    
    /// <summary>
    /// The tracking mode (StartEnd or RandomInterval)
    /// </summary>
    public TrackingMode TrackingMode { get; set; } = TrackingMode.StartEnd;
    
    /// <summary>
    /// Start of working hours (e.g., 08:00)
    /// </summary>
    public TimeSpan WorkingHoursStart { get; set; } = new TimeSpan(8, 0, 0);
    
    /// <summary>
    /// End of working hours (e.g., 17:00)
    /// </summary>
    public TimeSpan WorkingHoursEnd { get; set; } = new TimeSpan(17, 0, 0);
    
    /// <summary>
    /// Number of random checks per day (3-5) for RandomInterval mode
    /// </summary>
    [Range(1, 10)]
    public int RandomCheckCount { get; set; } = 3;
    
    /// <summary>
    /// Working days as comma-separated values (1=Monday, 7=Sunday)
    /// e.g., "1,2,3,4,5" for Monday-Friday
    /// </summary>
    [MaxLength(50)]
    public string WorkingDays { get; set; } = "1,2,3,4,5";
    
    /// <summary>
    /// Whether to require a photo with location submission
    /// </summary>
    public bool RequirePhoto { get; set; } = false;
    
    /// <summary>
    /// Minutes before a location request expires
    /// </summary>
    public int RequestExpirationMinutes { get; set; } = 30;
    
    /// <summary>
    /// Whether to send reminders for pending requests
    /// </summary>
    public bool SendReminders { get; set; } = true;
    
    /// <summary>
    /// Minutes before sending a reminder
    /// </summary>
    public int ReminderDelayMinutes { get; set; } = 10;
}
