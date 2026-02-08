using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.DTOs;

/// <summary>
/// DTO for Equipment Type
/// </summary>
public class EquipmentTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public string? Icon { get; set; }
    public decimal? DefaultHourlyRate { get; set; }
    public decimal? DefaultDailyRate { get; set; }
    public decimal? DefaultMonthlyRate { get; set; }
    public bool IsActive { get; set; }
    public int? CompanyId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int EquipmentCount { get; set; }
}

/// <summary>
/// Request DTO for creating Equipment Type
/// </summary>
public class CreateEquipmentTypeRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public string? Icon { get; set; }
    public decimal? DefaultHourlyRate { get; set; }
    public decimal? DefaultDailyRate { get; set; }
    public decimal? DefaultMonthlyRate { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Request DTO for updating Equipment Type
/// </summary>
public class UpdateEquipmentTypeRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public string? Icon { get; set; }
    public decimal? DefaultHourlyRate { get; set; }
    public decimal? DefaultDailyRate { get; set; }
    public decimal? DefaultMonthlyRate { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for Equipment
/// </summary>
public class EquipmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int EquipmentTypeId { get; set; }
    public string? EquipmentTypeName { get; set; }
    public string? Manufacturer { get; set; }
    public string? ModelNumber { get; set; }
    public int? YearOfManufacture { get; set; }
    public EquipmentStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public decimal? CurrentValue { get; set; }
    public decimal OperatingHours { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
    public DateTime? InsuranceExpiryDate { get; set; }
    public DateTime? RegistrationExpiryDate { get; set; }
    public string? CurrentLocation { get; set; }
    public string? StorageLocation { get; set; }
    public string? Specifications { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsAvailableForRental { get; set; }
    public bool HasGpsTracking { get; set; }
    public string? GpsDeviceId { get; set; }
    public int? CompanyId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Additional computed properties
    public int? AssignedProjectId { get; set; }
    public string? AssignedProjectName { get; set; }
    public int DaysUntilMaintenance { get; set; }
    public bool IsMaintenanceDue { get; set; }
}

/// <summary>
/// Request DTO for creating Equipment
/// </summary>
public class CreateEquipmentRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int EquipmentTypeId { get; set; }
    public string? Manufacturer { get; set; }
    public string? ModelNumber { get; set; }
    public int? YearOfManufacture { get; set; }
    public EquipmentStatus Status { get; set; } = EquipmentStatus.Available;
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public decimal? CurrentValue { get; set; }
    public decimal OperatingHours { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
    public DateTime? InsuranceExpiryDate { get; set; }
    public DateTime? RegistrationExpiryDate { get; set; }
    public string? CurrentLocation { get; set; }
    public string? StorageLocation { get; set; }
    public string? Specifications { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAvailableForRental { get; set; } = true;
    public bool HasGpsTracking { get; set; } = false;
    public string? GpsDeviceId { get; set; }
}

/// <summary>
/// Request DTO for updating Equipment
/// </summary>
public class UpdateEquipmentRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int EquipmentTypeId { get; set; }
    public string? Manufacturer { get; set; }
    public string? ModelNumber { get; set; }
    public int? YearOfManufacture { get; set; }
    public EquipmentStatus Status { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public decimal? CurrentValue { get; set; }
    public decimal OperatingHours { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
    public DateTime? InsuranceExpiryDate { get; set; }
    public DateTime? RegistrationExpiryDate { get; set; }
    public string? CurrentLocation { get; set; }
    public string? StorageLocation { get; set; }
    public string? Specifications { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsAvailableForRental { get; set; }
    public bool HasGpsTracking { get; set; }
    public string? GpsDeviceId { get; set; }
}

/// <summary>
/// DTO for Equipment Assignment
/// </summary>
public class EquipmentAssignmentDto
{
    public int Id { get; set; }
    public int EquipmentId { get; set; }
    public string? EquipmentName { get; set; }
    public string? EquipmentSerialNumber { get; set; }
    public int? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }
    public EquipmentAssignmentType AssignmentType { get; set; }
    public string AssignmentTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? ActualReturnDate { get; set; }
    public AssignmentStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string? ConditionAtAssignment { get; set; }
    public string? ConditionAtReturn { get; set; }
    public decimal? FuelLevelAtAssignment { get; set; }
    public decimal? FuelLevelAtReturn { get; set; }
    public decimal? OperatingHoursAtAssignment { get; set; }
    public decimal? OperatingHoursAtReturn { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public int? AssignedByUserId { get; set; }
    public string? AssignedByUserName { get; set; }
    public int? ReturnApprovedByUserId { get; set; }
    public string? ReturnApprovedByUserName { get; set; }
    public int? CompanyId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request DTO for creating Equipment Assignment
/// </summary>
public class CreateEquipmentAssignmentRequest
{
    public int EquipmentId { get; set; }
    public int? ProjectId { get; set; }
    public int? AssignedToUserId { get; set; }
    public EquipmentAssignmentType AssignmentType { get; set; } = EquipmentAssignmentType.ProjectBased;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? ConditionAtAssignment { get; set; }
    public decimal? FuelLevelAtAssignment { get; set; }
    public decimal? OperatingHoursAtAssignment { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Request DTO for returning Equipment
/// </summary>
public class ReturnEquipmentRequest
{
    public DateTime? ActualReturnDate { get; set; }
    public string? ConditionAtReturn { get; set; }
    public decimal? FuelLevelAtReturn { get; set; }
    public decimal? OperatingHoursAtReturn { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for Equipment Maintenance
/// </summary>
public class EquipmentMaintenanceDto
{
    public int Id { get; set; }
    public int EquipmentId { get; set; }
    public string? EquipmentName { get; set; }
    public string? EquipmentSerialNumber { get; set; }
    public MaintenanceType MaintenanceType { get; set; }
    public string MaintenanceTypeName { get; set; } = string.Empty;
    public MaintenanceStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public string? ServiceProvider { get; set; }
    public string? ServiceProviderContact { get; set; }
    public string? ServiceProviderPhone { get; set; }
    public string? WorkOrderNumber { get; set; }
    public string? InvoiceNumber { get; set; }
    public decimal? Cost { get; set; }
    public decimal? LaborHours { get; set; }
    public string? PartsUsed { get; set; }
    public string? Description { get; set; }
    public string? IssuesFound { get; set; }
    public string? Recommendations { get; set; }
    public DateTime? NextMaintenanceDue { get; set; }
    public decimal? NextMaintenanceHours { get; set; }
    public decimal? OperatingHoursAtMaintenance { get; set; }
    public bool IsWarrantyRepair { get; set; }
    public int? PerformedByUserId { get; set; }
    public string? PerformedByUserName { get; set; }
    public string? AttachedDocuments { get; set; }
    public int? CompanyId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request DTO for creating Equipment Maintenance
/// </summary>
public class CreateEquipmentMaintenanceRequest
{
    public int EquipmentId { get; set; }
    public MaintenanceType MaintenanceType { get; set; }
    public DateTime ScheduledDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public string? ServiceProvider { get; set; }
    public string? ServiceProviderContact { get; set; }
    public string? ServiceProviderPhone { get; set; }
    public string? WorkOrderNumber { get; set; }
    public string? InvoiceNumber { get; set; }
    public decimal? Cost { get; set; }
    public decimal? LaborHours { get; set; }
    public string? PartsUsed { get; set; }
    public string? Description { get; set; }
    public string? IssuesFound { get; set; }
    public string? Recommendations { get; set; }
    public DateTime? NextMaintenanceDue { get; set; }
    public decimal? NextMaintenanceHours { get; set; }
    public decimal? OperatingHoursAtMaintenance { get; set; }
    public bool IsWarrantyRepair { get; set; } = false;
    public int? PerformedByUserId { get; set; }
    public string? AttachedDocuments { get; set; }
}

/// <summary>
/// Request DTO for updating Equipment Maintenance
/// </summary>
public class UpdateEquipmentMaintenanceRequest
{
    public MaintenanceType MaintenanceType { get; set; }
    public MaintenanceStatus Status { get; set; }
    public DateTime ScheduledDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public string? ServiceProvider { get; set; }
    public string? ServiceProviderContact { get; set; }
    public string? ServiceProviderPhone { get; set; }
    public string? WorkOrderNumber { get; set; }
    public string? InvoiceNumber { get; set; }
    public decimal? Cost { get; set; }
    public decimal? LaborHours { get; set; }
    public string? PartsUsed { get; set; }
    public string? Description { get; set; }
    public string? IssuesFound { get; set; }
    public string? Recommendations { get; set; }
    public DateTime? NextMaintenanceDue { get; set; }
    public decimal? NextMaintenanceHours { get; set; }
    public decimal? OperatingHoursAtMaintenance { get; set; }
    public bool IsWarrantyRepair { get; set; }
    public int? PerformedByUserId { get; set; }
    public string? AttachedDocuments { get; set; }
}

/// <summary>
/// DTO for Equipment Utilization
/// </summary>
public class EquipmentUtilizationDto
{
    public int Id { get; set; }
    public int EquipmentId { get; set; }
    public string? EquipmentName { get; set; }
    public string? EquipmentSerialNumber { get; set; }
    public int? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public DateTime UtilizationDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal TotalHours { get; set; }
    public decimal ProductiveHours { get; set; }
    public decimal IdleHours { get; set; }
    public decimal DowntimeHours { get; set; }
    public decimal? FuelConsumed { get; set; }
    public UtilizationType UtilizationType { get; set; }
    public string UtilizationTypeName { get; set; } = string.Empty;
    public string? WorkPerformed { get; set; }
    public string? OperatorName { get; set; }
    public int? OperatorUserId { get; set; }
    public string? OperatorUserName { get; set; }
    public string? Location { get; set; }
    public string? WeatherConditions { get; set; }
    public string? Notes { get; set; }
    public bool IsBillable { get; set; }
    public decimal? BillingRate { get; set; }
    public decimal? BillingAmount { get; set; }
    public int? RecordedByUserId { get; set; }
    public string? RecordedByUserName { get; set; }
    public int? CompanyId { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request DTO for creating Equipment Utilization
/// </summary>
public class CreateEquipmentUtilizationRequest
{
    public int EquipmentId { get; set; }
    public int? ProjectId { get; set; }
    public DateTime UtilizationDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal TotalHours { get; set; }
    public decimal ProductiveHours { get; set; }
    public decimal IdleHours { get; set; }
    public decimal DowntimeHours { get; set; }
    public decimal? FuelConsumed { get; set; }
    public UtilizationType UtilizationType { get; set; } = UtilizationType.Daily;
    public string? WorkPerformed { get; set; }
    public string? OperatorName { get; set; }
    public int? OperatorUserId { get; set; }
    public string? Location { get; set; }
    public string? WeatherConditions { get; set; }
    public string? Notes { get; set; }
    public bool IsBillable { get; set; } = false;
    public decimal? BillingRate { get; set; }
    public decimal? BillingAmount { get; set; }
    public int? RecordedByUserId { get; set; }
}

/// <summary>
/// DTO for Equipment Dashboard/Summary
/// </summary>
public class EquipmentDashboardDto
{
    public int TotalEquipment { get; set; }
    public int AvailableEquipment { get; set; }
    public int AssignedEquipment { get; set; }
    public int InMaintenanceEquipment { get; set; }
    public int OutOfServiceEquipment { get; set; }
    public int OverdueAssignments { get; set; }
    public int UpcomingMaintenance { get; set; }
    public int PendingMaintenance { get; set; }
    public decimal AverageUtilizationRate { get; set; }
    public List<EquipmentTypeDto> TopEquipmentTypes { get; set; } = new List<EquipmentTypeDto>();
    public List<EquipmentMaintenanceDto> UpcomingMaintenances { get; set; } = new List<EquipmentMaintenanceDto>();
    public List<EquipmentAssignmentDto> ActiveAssignments { get; set; } = new List<EquipmentAssignmentDto>();
}

/// <summary>
/// Equipment statistics DTO
/// </summary>
public class EquipmentStatisticsDto
{
    public int TotalCount { get; set; }
    public int AvailableCount { get; set; }
    public int AssignedCount { get; set; }
    public int MaintenanceCount { get; set; }
    public int OutOfServiceCount { get; set; }
    public decimal TotalValue { get; set; }
    public decimal TotalOperatingHours { get; set; }
    public decimal AverageUtilization { get; set; }
    public decimal TotalMaintenanceCost { get; set; }
    public int MaintenanceCountThisMonth { get; set; }
    public int AssignmentsThisMonth { get; set; }
}
