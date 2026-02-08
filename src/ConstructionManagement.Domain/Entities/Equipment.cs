using System.ComponentModel.DataAnnotations.Schema;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

/// <summary>
/// Represents an equipment type/category
/// </summary>
public class EquipmentType : BaseEntity, ICompanyEntity
{
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string? Code { get; set; }
    
    /// <summary>
    /// Icon or image for the equipment type
    /// </summary>
    public string? Icon { get; set; }
    
    /// <summary>
    /// Default hourly rental rate
    /// </summary>
    public decimal? DefaultHourlyRate { get; set; }
    
    /// <summary>
    /// Default daily rental rate
    /// </summary>
    public decimal? DefaultDailyRate { get; set; }
    
    /// <summary>
    /// Default monthly rental rate
    /// </summary>
    public decimal? DefaultMonthlyRate { get; set; }
    
    /// <summary>
    /// Is this equipment type active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
    
    public virtual ICollection<Equipment> Equipment { get; set; } = new List<Equipment>();
}

/// <summary>
/// Represents a piece of equipment
/// </summary>
public class Equipment : BaseEntity, ICompanyEntity
{
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    /// <summary>
    /// Unique equipment serial number
    /// </summary>
    public string SerialNumber { get; set; } = string.Empty;
    
    /// <summary>
    /// Equipment barcode or QR code
    /// </summary>
    public string? Barcode { get; set; }
    
    public int EquipmentTypeId { get; set; }
    [ForeignKey(nameof(EquipmentTypeId))]
    public virtual EquipmentType? EquipmentType { get; set; }
    
    /// <summary>
    /// Manufacturer name
    /// </summary>
    public string? Manufacturer { get; set; }
    
    /// <summary>
    /// Model number
    /// </summary>
    public string? ModelNumber { get; set; }
    
    /// <summary>
    /// Year of manufacture
    /// </summary>
    public int? YearOfManufacture { get; set; }
    
    /// <summary>
    /// Current condition status
    /// </summary>
    public EquipmentStatus Status { get; set; } = EquipmentStatus.Available;
    
    /// <summary>
    /// Purchase date
    /// </summary>
    public DateTime? PurchaseDate { get; set; }
    
    /// <summary>
    /// Purchase price
    /// </summary>
    public decimal? PurchasePrice { get; set; }
    
    /// <summary>
    /// Current value/depreciated value
    /// </summary>
    public decimal? CurrentValue { get; set; }
    
    /// <summary>
    /// Operating hours counter
    /// </summary>
    public decimal OperatingHours { get; set; }
    
    /// <summary>
    /// Last maintenance date
    /// </summary>
    public DateTime? LastMaintenanceDate { get; set; }
    
    /// <summary>
    /// Next scheduled maintenance date
    /// </summary>
    public DateTime? NextMaintenanceDate { get; set; }
    
    /// <summary>
    /// Rental rate per day
    /// </summary>
    public decimal RentalRate { get; set; }
    
    /// <summary>
    /// Insurance expiry date
    /// </summary>
    public DateTime? InsuranceExpiryDate { get; set; }
    
    /// <summary>
    /// Location/Storage location
    /// </summary>
    public string? Location { get; set; }
    
    /// <summary>
    /// Notes or comments
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Registration expiry date
    /// </summary>
    public DateTime? RegistrationExpiryDate { get; set; }
    
    /// <summary>
    /// Current location
    /// </summary>
    public string? CurrentLocation { get; set; }
    
    /// <summary>
    /// Storage location
    /// </summary>
    public string? StorageLocation { get; set; }
    
    /// <summary>
    /// Specifications
    /// </summary>
    public string? Specifications { get; set; }
    
    /// <summary>
    /// Image URL
    /// </summary>
    public string? ImageUrl { get; set; }
    
    /// <summary>
    /// Is active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Is available for rental
    /// </summary>
    public bool IsAvailableForRental { get; set; } = true;
    
    /// <summary>
    /// Has GPS tracking
    /// </summary>
    public bool HasGpsTracking { get; set; }
    
    /// <summary>
    /// GPS device ID
    /// </summary>
    public string? GpsDeviceId { get; set; }
    
    // Navigation Properties
    public int? CompanyId { get; set; }
    [ForeignKey(nameof(CompanyId))]
    public virtual Company? Company { get; set; }
    
    public virtual ICollection<EquipmentAssignment> Assignments { get; set; } = new List<EquipmentAssignment>();
    public virtual ICollection<EquipmentMaintenance> Maintenances { get; set; } = new List<EquipmentMaintenance>();
    public virtual ICollection<EquipmentUtilization> UtilizationRecords { get; set; } = new List<EquipmentUtilization>();
}
