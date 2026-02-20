using System;
using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a location submission from a worker
/// </summary>
public class WorkerLocation : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// The company this location belongs to
    /// </summary>
    public int? CompanyId { get; set; }
    
    /// <summary>
    /// Navigation property to the company
    /// </summary>
    public Company Company { get; set; } = null!;
    
    /// <summary>
    /// The worker who submitted the location
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// Navigation property to the user
    /// </summary>
    public User User { get; set; } = null!;
    
    /// <summary>
    /// Latitude coordinate
    /// </summary>
    [Range(-90, 90)]
    public decimal Latitude { get; set; }
    
    /// <summary>
    /// Longitude coordinate
    /// </summary>
    [Range(-180, 180)]
    public decimal Longitude { get; set; }
    
    /// <summary>
    /// GPS accuracy in meters (optional)
    /// </summary>
    public decimal? Accuracy { get; set; }
    
    /// <summary>
    /// Type of location submission
    /// </summary>
    public LocationType LocationType { get; set; }
    
    /// <summary>
    /// Reference to the location request this fulfills (if applicable)
    /// </summary>
    public int? RequestId { get; set; }
    
    /// <summary>
    /// Navigation property to the request
    /// </summary>
    public LocationRequest? Request { get; set; }
    
    /// <summary>
    /// URL to photo taken with location (optional)
    /// </summary>
    [MaxLength(500)]
    public string? PhotoUrl { get; set; }
    
    /// <summary>
    /// Optional notes from the worker
    /// </summary>
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    /// <summary>
    /// Device information for audit purposes
    /// </summary>
    [MaxLength(500)]
    public string? DeviceInfo { get; set; }
    
    /// <summary>
    /// The time when the location was recorded (from device)
    /// </summary>
    public DateTime RecordedAt { get; set; }
}
