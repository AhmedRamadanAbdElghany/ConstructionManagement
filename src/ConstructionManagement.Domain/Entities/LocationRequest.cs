using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents a request for location from one or more workers
/// </summary>
public class LocationRequest : BaseEntity, ICompanyEntity
{
    /// <summary>
    /// The company this request belongs to
    /// </summary>
    public int? CompanyId { get; set; }
    
    /// <summary>
    /// Navigation property to the company
    /// </summary>
    public Company Company { get; set; } = null!;
    
    /// <summary>
    /// The admin who created this request
    /// </summary>
    public int RequestedByUserId { get; set; }
    
    /// <summary>
    /// Navigation property to the requesting user
    /// </summary>
    public User RequestedByUser { get; set; } = null!;
    
    /// <summary>
    /// Type of location request
    /// </summary>
    public LocationRequestType RequestType { get; set; }
    
    /// <summary>
    /// When this request is scheduled for (for RandomScheduled type)
    /// </summary>
    public DateTime? ScheduledFor { get; set; }
    
    /// <summary>
    /// Current status of the request
    /// </summary>
    public LocationRequestStatus Status { get; set; } = LocationRequestStatus.Pending;
    
    /// <summary>
    /// When this request expires
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
    
    /// <summary>
    /// When all targets have fulfilled the request
    /// </summary>
    public DateTime? FulfilledAt { get; set; }
    
    /// <summary>
    /// Optional notes from the requester
    /// </summary>
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    /// <summary>
    /// The targets (workers) for this request
    /// </summary>
    public ICollection<LocationRequestTarget> Targets { get; set; } = new List<LocationRequestTarget>();
}
