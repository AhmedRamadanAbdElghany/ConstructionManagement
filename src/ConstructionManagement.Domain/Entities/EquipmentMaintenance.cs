using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents equipment maintenance record
/// </summary>
public class EquipmentMaintenance : BaseEntity, ICompanyEntity
{
    public int EquipmentId { get; set; }
    [ForeignKey(nameof(EquipmentId))]
    public virtual Equipment? Equipment { get; set; }
    
    /// <summary>
    /// Type of maintenance
    /// </summary>
    public MaintenanceType MaintenanceType { get; set; } = MaintenanceType.Preventive;
    
    /// <summary>
    /// Current status
    /// </summary>
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Scheduled;
    
    /// <summary>
    /// Scheduled maintenance date
    /// </summary>
    public DateTime ScheduledDate { get; set; }
    
    /// <summary>
    /// Actual start date
    /// </summary>
    public DateTime? StartDate { get; set; }
    
    /// <summary>
    /// Completion date
    /// </summary>
    public DateTime? CompletionDate { get; set; }
    
    /// <summary>
    /// Actual date
    /// </summary>
    public DateTime? ActualDate { get; set; }
    
    /// <summary>
    /// Description of work to be done
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Work performed
    /// </summary>
    public string? WorkPerformed { get; set; }
    
    /// <summary>
    /// Maintenance performed by (vendor or internal)
    /// </summary>
    public string? PerformedBy { get; set; }
    
    /// <summary>
    /// Performed by user
    /// </summary>
    public virtual User? PerformedByUser { get; set; }
    
    /// <summary>
    /// Vendor ID if external
    /// </summary>
    public int? VendorId { get; set; }
    
    /// <summary>
    /// Technician name
    /// </summary>
    public string? TechnicianName { get; set; }
    
    /// <summary>
    /// Service provider
    /// </summary>
    public string? ServiceProvider { get; set; }
    
    /// <summary>
    /// Service provider contact
    /// </summary>
    public string? ServiceProviderContact { get; set; }
    
    /// <summary>
    /// Service provider phone
    /// </summary>
    public string? ServiceProviderPhone { get; set; }
    
    /// <meter_reading>
    /// Meter reading at maintenance
    /// </meter_reading>
    public decimal? MeterReading { get; set; }
    
    /// <summary>
    /// Operating hours at maintenance
    /// </summary>
    public decimal? OperatingHoursAtMaintenance { get; set; }
    
    /// <summary>
    /// Labor hours
    /// </summary>
    public decimal? LaborHours { get; set; }
    
    /// <summary>
    /// Labor cost
    /// </summary>
    public decimal? LaborCost { get; set; }
    
    /// <summary>
    /// Parts cost
    /// </summary>
    public decimal? PartsCost { get; set; }
    
    /// <summary>
    /// Additional costs
    /// </summary>
    public decimal? AdditionalCosts { get; set; }
    
    /// <summary>
    /// Total cost
    /// </summary>
    public decimal? Cost { get; set; }
    
    /// <summary>
    /// Invoice number
    /// </summary>
    public string? InvoiceNumber { get; set; }
    
    /// <summary>
    /// Work order number
    /// </summary>
    public string? WorkOrderNumber { get; set; }
    
    /// <summary>
    /// Parts used (comma-separated list)
    /// </summary>
    public string? PartsUsed { get; set; }
    
    /// <summary>
    /// Priority level
    /// </summary>
    public int Priority { get; set; } = 1;
    
    /// <summary>
    /// Is warranty work
    /// </summary>
    public bool IsWarrantyWork { get; set; }
    
    /// <summary>
    /// Is warranty repair
    /// </summary>
    public bool IsWarrantyRepair { get; set; }
    
    /// <summary>
    /// Warranty expiration date
    /// </summary>
    public DateTime? WarrantyExpirationDate { get; set; }
    
    /// <summary>
    /// Next maintenance date recommendation
    /// </summary>
    public DateTime? NextMaintenanceDate { get; set; }
    
    /// <summary>
    /// Next maintenance due
    /// </summary>
    public DateTime? NextMaintenanceDue { get; set; }
    
    /// <summary>
    /// Next maintenance meter reading recommendation
    /// </summary>
    public decimal? NextMaintenanceMeterReading { get; set; }
    
    /// <summary>
    /// Next maintenance hours
    /// </summary>
    public decimal? NextMaintenanceHours { get; set; }
    
    /// <summary>
    /// Downtime in hours
    /// </summary>
    public decimal? DowntimeHours { get; set; }
    
    /// <summary>
    /// Issues found during maintenance
    /// </summary>
    public string? IssuesFound { get; set; }
    
    /// <summary>
    /// Recommendations for future
    /// </summary>
    public string? Recommendations { get; set; }
    
    /// <summary>
    /// Notes
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Signature of person who performed maintenance
    /// </summary>
    public string? SignatureData { get; set; }
    
    /// <summary>
    /// Photos or attachments
    /// </summary>
    public string? Attachments { get; set; }
    
    /// <summary>
    /// Attached documents
    /// </summary>
    public string? AttachedDocuments { get; set; }
    
    /// <summary>
    /// Completed by user ID
    /// </summary>
    public int? CompletedById { get; set; }
    
    /// <summary>
    /// Performed by user ID
    /// </summary>
    public int? PerformedByUserId { get; set; }
    
    /// <summary>
    /// Supervisor approval
    /// </summary>
    public int? SupervisedById { get; set; }
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
}
