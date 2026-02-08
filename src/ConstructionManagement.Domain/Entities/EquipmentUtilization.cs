using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents equipment utilization tracking
/// </summary>
public class EquipmentUtilization : BaseEntity, ICompanyEntity
{
    public int EquipmentId { get; set; }
    [ForeignKey(nameof(EquipmentId))]
    public virtual Equipment? Equipment { get; set; }
    
    public int? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }
    
    /// <summary>
    /// Type of utilization tracking
    /// </summary>
    public UtilizationType UtilizationType { get; set; }
    
    /// <summary>
    /// Date of utilization
    /// </summary>
    public DateTime UtilizationDate { get; set; }
    
    /// <summary>
    /// Start time
    /// </summary>
    public TimeSpan? StartTime { get; set; }
    
    /// <summary>
    /// End time
    /// </summary>
    public TimeSpan? EndTime { get; set; }
    
    /// <summary>
    /// Total hours used
    /// </summary>
    public decimal HoursUsed { get; set; }
    
    /// <summary>
    /// Total hours (HoursUsed + IdleHours)
    /// </summary>
    public decimal TotalHours { get; set; }
    
    /// <summary>
    /// Productive hours (actual work)
    /// </summary>
    public decimal ProductiveHours { get; set; }
    
    /// <summary>
    /// Idle hours
    /// </summary>
    public decimal IdleHours { get; set; }
    
    /// <summary>
    /// Operator/user ID
    /// </summary>
    public int? OperatorUserId { get; set; }
    
    /// <summary>
    /// Location where equipment was used
    /// </summary>
    public string? Location { get; set; }
    
    /// <summary>
    /// Work area or zone
    /// </summary>
    public string? WorkArea { get; set; }
    
    /// <summary>
    /// Task or activity performed
    /// </summary>
    public string? TaskPerformed { get; set; }
    
    /// <summary>
    /// Weather conditions
    /// </summary>
    public string? WeatherConditions { get; set; }
    
    /// <summary>
    /// Starting meter reading (hours or km)
    /// </summary>
    public decimal? StartingMeter { get; set; }
    
    /// <summary>
    /// Ending meter reading
    /// </summary>
    public decimal? EndingMeter { get; set; }
    
    /// <summary>
    /// Fuel consumed in liters/gallons
    /// </summary>
    public decimal? FuelConsumed { get; set; }
    
    /// <summary>
    /// Efficiency metric (output per hour)
    /// </summary>
    public decimal? EfficiencyMetric { get; set; }
    
    /// <summary>
    /// Notes or comments
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Is this entry verified
    /// </summary>
    public bool IsVerified { get; set; }
    
    /// <summary>
    /// Verified by user ID
    /// </summary>
    public int? VerifiedById { get; set; }
    
    /// <summary>
    /// Verification date
    /// </summary>
    public DateTime? VerifiedDate { get; set; }
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
