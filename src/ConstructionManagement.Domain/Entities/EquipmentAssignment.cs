using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an equipment assignment to a project/user
/// </summary>
public class EquipmentAssignment : BaseEntity, IProjectEntity
{
    public int? EquipmentId { get; set; }
    [ForeignKey(nameof(EquipmentId))]
    public virtual Equipment? Equipment { get; set; }
    
    public int? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public virtual Project? Project { get; set; }
    
    /// <summary>
    /// User who requested the equipment
    /// </summary>
    public int? AssignedToUserId { get; set; }
    
    /// <summary>
    /// Assigned to user
    /// </summary>
    public virtual User? AssignedToUser { get; set; }
    
    /// <summary>
    /// Type of assignment
    /// </summary>
    public EquipmentAssignmentType AssignmentType { get; set; } = EquipmentAssignmentType.Rental;
    
    /// <summary>
    /// Current status
    /// </summary>
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Pending;
    
    /// <summary>
    /// Date when assignment starts
    /// </summary>
    public DateTime StartDate { get; set; }
    
    /// <summary>
    /// Expected end date
    /// </summary>
    public DateTime? EndDate { get; set; }
    
    /// <summary>
    /// Actual end date when equipment is returned
    /// </summary>
    public DateTime? ActualEndDate { get; set; }
    
    /// <summary>
    /// Actual return date
    /// </summary>
    public DateTime? ActualReturnDate { get; set; }
    
    /// <summary>
    /// Assigned location/site
    /// </summary>
    public string? AssignedLocation { get; set; }
    
    /// <summary>
    /// Purpose of assignment
    /// </summary>
    public string? Purpose { get; set; }
    
    /// <summary>
    /// Rental rate (if applicable)
    /// </summary>
    public decimal? RentalRate { get; set; }
    
    /// <summary>
    /// Rate unit (hourly, daily, weekly, monthly)
    /// </summary>
    public string? RateUnit { get; set; }
    
    /// <summary>
    /// Total cost calculated at return
    /// </summary>
    public decimal? TotalCost { get; set; }
    
    /// <summary>
    /// Odometer or hour meter reading at assignment
    /// </summary>
    public decimal? StartingMeterReading { get; set; }
    
    /// <summary>
    /// Operating hours at assignment
    /// </summary>
    public decimal? OperatingHoursAtAssignment { get; set; }
    
    /// <summary>
    /// Odometer or hour meter reading at return
    /// </summary>
    public decimal? EndingMeterReading { get; set; }
    
    /// <summary>
    /// Operating hours at return
    /// </summary>
    public decimal? OperatingHoursAtReturn { get; set; }
    
    /// <summary>
    /// Fuel level at assignment (0-100%)
    /// </summary>
    public decimal? FuelLevelAtAssignment { get; set; }
    
    /// <summary>
    /// Fuel level at return (0-100%)
    /// </summary>
    public decimal? FuelLevelAtReturn { get; set; }
    
    /// <summary>
    /// Notes at assignment
    /// </summary>
    public string? AssignmentNotes { get; set; }
    
    /// <summary>
    /// Notes at return
    /// </summary>
    public string? ReturnNotes { get; set; }
    
    /// <summary>
    /// Notes
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Condition notes at assignment
    /// </summary>
    public string? ConditionAtAssignment { get; set; }
    
    /// <summary>
    /// Condition notes at return
    /// </summary>
    public string? ConditionAtReturn { get; set; }
    
    /// <summary>
    /// Approved by user ID
    /// </summary>
    public int? ApprovedById { get; set; }
    
    /// <summary>
    /// Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; set; }
    
    /// <summary>
    /// Assigned by user ID
    /// </summary>
    public int? AssignedByUserId { get; set; }
    
    /// <summary>
    /// Assigned by user
    /// </summary>
    public virtual User? AssignedByUser { get; set; }
    
    /// <summary>
    /// Return approved by user ID
    /// </summary>
    public int? ReturnApprovedByUserId { get; set; }
    
    /// <summary>
    /// Return approved by user
    /// </summary>
    public virtual User? ReturnApprovedByUser { get; set; }
    
    /// <summary>
    /// Is this assignment overdue
    /// </summary>
    public bool IsOverdue { get; set; }
    
    /// <summary>
    /// Company ID
    /// </summary>
    public int? CompanyId { get; set; }
}
