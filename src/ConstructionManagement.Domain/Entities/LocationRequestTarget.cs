using System;
using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a target worker for a location request
/// </summary>
public class LocationRequestTarget : BaseEntity
{
    /// <summary>
    /// The location request this target belongs to
    /// </summary>
    public int RequestId { get; set; }
    
    /// <summary>
    /// Navigation property to the request
    /// </summary>
    public LocationRequest Request { get; set; } = null!;
    
    /// <summary>
    /// The worker targeted by this request
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// Navigation property to the user
    /// </summary>
    public User User { get; set; } = null!;
    
    /// <summary>
    /// Status of this target's response
    /// </summary>
    public LocationRequestStatus Status { get; set; } = LocationRequestStatus.Pending;
    
    /// <summary>
    /// Reference to the submitted location (when fulfilled)
    /// </summary>
    public int? LocationId { get; set; }
    
    /// <summary>
    /// Navigation property to the submitted location
    /// </summary>
    public WorkerLocation? Location { get; set; }
    
    /// <summary>
    /// When the target fulfilled the request
    /// </summary>
    public DateTime? FulfilledAt { get; set; }
    
    /// <summary>
    /// When notification was sent to this target
    /// </summary>
    public DateTime? NotifiedAt { get; set; }
    
    /// <summary>
    /// When reminder was sent (if applicable)
    /// </summary>
    public DateTime? ReminderSentAt { get; set; }
}
