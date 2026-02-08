using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

/// <summary>
/// API Controller for Equipment management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentController : ControllerBase
{
    private readonly IEquipmentService _equipmentService;
    private readonly IEquipmentMaintenanceService _maintenanceService;

    public EquipmentController(
        IEquipmentService equipmentService,
        IEquipmentMaintenanceService maintenanceService)
    {
        _equipmentService = equipmentService;
        _maintenanceService = maintenanceService;
    }

    #region Equipment Types

    /// <summary>
    /// Get all equipment types
    /// </summary>
    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<EquipmentTypeDto>>> GetEquipmentTypes([FromQuery] int? companyId = null)
    {
        var types = await _equipmentService.GetEquipmentTypesAsync(companyId);
        return Ok(types);
    }

    /// <summary>
    /// Get equipment type by ID
    /// </summary>
    [HttpGet("types/{id}")]
    public async Task<ActionResult<EquipmentTypeDto>> GetEquipmentType(int id)
    {
        var type = await _equipmentService.GetEquipmentTypeByIdAsync(id);
        if (type == null) return NotFound();
        return Ok(type);
    }

    /// <summary>
    /// Search equipment types
    /// </summary>
    [HttpGet("types/search")]
    public async Task<ActionResult<IEnumerable<EquipmentTypeDto>>> SearchEquipmentTypes(
        [FromQuery] string searchTerm,
        [FromQuery] int? companyId = null)
    {
        var types = await _equipmentService.SearchEquipmentTypesAsync(searchTerm, companyId);
        return Ok(types);
    }

    /// <summary>
    /// Create equipment type
    /// </summary>
    [HttpPost("types")]
    public async Task<ActionResult<EquipmentTypeDto>> CreateEquipmentType([FromBody] CreateEquipmentTypeRequest request)
    {
        var equipmentType = new EquipmentType
        {
            Name = request.Name,
            Description = request.Description,
            Code = request.Code,
            Icon = request.Icon,
            DefaultHourlyRate = request.DefaultHourlyRate,
            DefaultDailyRate = request.DefaultDailyRate,
            DefaultMonthlyRate = request.DefaultMonthlyRate,
            IsActive = request.IsActive
        };

        var createdType = await _equipmentService.CreateEquipmentTypeAsync(equipmentType);
        return CreatedAtAction(nameof(GetEquipmentType), new { id = createdType.Id }, createdType);
    }

    /// <summary>
    /// Update equipment type
    /// </summary>
    [HttpPut("types/{id}")]
    public async Task<ActionResult<EquipmentTypeDto>> UpdateEquipmentType(int id, [FromBody] UpdateEquipmentTypeRequest request)
    {
        var equipmentType = new EquipmentType
        {
            Name = request.Name,
            Description = request.Description,
            Code = request.Code,
            Icon = request.Icon,
            DefaultHourlyRate = request.DefaultHourlyRate,
            DefaultDailyRate = request.DefaultDailyRate,
            DefaultMonthlyRate = request.DefaultMonthlyRate,
            IsActive = request.IsActive
        };

        var updatedType = await _equipmentService.UpdateEquipmentTypeAsync(id, equipmentType);
        if (updatedType == null) return NotFound();
        return Ok(updatedType);
    }

    /// <summary>
    /// Delete equipment type
    /// </summary>
    [HttpDelete("types/{id}")]
    public async Task<ActionResult> DeleteEquipmentType(int id)
    {
        try
        {
            var result = await _equipmentService.DeleteEquipmentTypeAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    #endregion

    #region Equipment

    /// <summary>
    /// Get all equipment
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EquipmentDto>>> GetEquipment([FromQuery] int? companyId = null)
    {
        var equipment = await _equipmentService.GetEquipmentListAsync(companyId);
        return Ok(equipment);
    }

    /// <summary>
    /// Get equipment by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<EquipmentDto>> GetEquipmentById(int id)
    {
        var equipment = await _equipmentService.GetEquipmentByIdAsync(id);
        if (equipment == null) return NotFound();
        return Ok(equipment);
    }

    /// <summary>
    /// Get equipment by serial number
    /// </summary>
    [HttpGet("serial/{serialNumber}")]
    public async Task<ActionResult<EquipmentDto>> GetEquipmentBySerialNumber(string serialNumber)
    {
        var equipment = await _equipmentService.GetEquipmentBySerialNumberAsync(serialNumber);
        if (equipment == null) return NotFound();
        return Ok(equipment);
    }

    /// <summary>
    /// Search equipment
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<EquipmentDto>>> SearchEquipment(
        [FromQuery] string searchTerm,
        [FromQuery] int? companyId = null)
    {
        var equipment = await _equipmentService.SearchEquipmentAsync(searchTerm, companyId);
        return Ok(equipment);
    }

    /// <summary>
    /// Get equipment by status
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<EquipmentDto>>> GetEquipmentByStatus(
        EquipmentStatus status,
        [FromQuery] int? companyId = null)
    {
        var equipment = await _equipmentService.GetEquipmentByStatusAsync(status, companyId);
        return Ok(equipment);
    }

    /// <summary>
    /// Get equipment by type
    /// </summary>
    [HttpGet("type/{typeId}")]
    public async Task<ActionResult<IEnumerable<EquipmentDto>>> GetEquipmentByType(
        int typeId,
        [FromQuery] int? companyId = null)
    {
        var equipment = await _equipmentService.GetEquipmentByTypeAsync(typeId, companyId);
        return Ok(equipment);
    }

    /// <summary>
    /// Get available equipment
    /// </summary>
    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<EquipmentDto>>> GetAvailableEquipment([FromQuery] int? companyId = null)
    {
        var equipment = await _equipmentService.GetAvailableEquipmentAsync(companyId);
        return Ok(equipment);
    }

    /// <summary>
    /// Get equipment requiring maintenance
    /// </summary>
    [HttpGet("maintenance-due")]
    public async Task<ActionResult<IEnumerable<EquipmentDto>>> GetEquipmentRequiringMaintenance([FromQuery] int? companyId = null)
    {
        var equipment = await _equipmentService.GetEquipmentRequiringMaintenanceAsync(companyId);
        return Ok(equipment);
    }

    /// <summary>
    /// Get equipment statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<EquipmentStatisticsDto>> GetEquipmentStatistics([FromQuery] int? companyId = null)
    {
        var stats = await _equipmentService.GetEquipmentStatisticsAsync(companyId);
        return Ok(stats);
    }

    /// <summary>
    /// Get equipment dashboard
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<EquipmentDashboardDto>> GetDashboard([FromQuery] int? companyId = null)
    {
        var dashboard = await _equipmentService.GetDashboardAsync(companyId);
        return Ok(dashboard);
    }

    /// <summary>
    /// Create equipment
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EquipmentDto>> CreateEquipment([FromBody] CreateEquipmentRequest request)
    {
        var equipment = new Equipment
        {
            Name = request.Name,
            Description = request.Description,
            SerialNumber = request.SerialNumber,
            Barcode = request.Barcode,
            EquipmentTypeId = request.EquipmentTypeId,
            Manufacturer = request.Manufacturer,
            ModelNumber = request.ModelNumber,
            YearOfManufacture = request.YearOfManufacture,
            Status = request.Status,
            PurchaseDate = request.PurchaseDate,
            PurchasePrice = request.PurchasePrice,
            CurrentValue = request.CurrentValue,
            OperatingHours = request.OperatingHours,
            LastMaintenanceDate = request.LastMaintenanceDate,
            NextMaintenanceDate = request.NextMaintenanceDate,
            InsuranceExpiryDate = request.InsuranceExpiryDate,
            RegistrationExpiryDate = request.RegistrationExpiryDate,
            CurrentLocation = request.CurrentLocation,
            StorageLocation = request.StorageLocation,
            Specifications = request.Specifications,
            Notes = request.Notes,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive,
            IsAvailableForRental = request.IsAvailableForRental,
            HasGpsTracking = request.HasGpsTracking,
            GpsDeviceId = request.GpsDeviceId
        };

        var createdEquipment = await _equipmentService.CreateEquipmentAsync(equipment);
        return CreatedAtAction(nameof(GetEquipmentById), new { id = createdEquipment.Id }, createdEquipment);
    }

    /// <summary>
    /// Update equipment
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<EquipmentDto>> UpdateEquipment(int id, [FromBody] UpdateEquipmentRequest request)
    {
        var equipment = new Equipment
        {
            Name = request.Name,
            Description = request.Description,
            SerialNumber = request.SerialNumber,
            Barcode = request.Barcode,
            EquipmentTypeId = request.EquipmentTypeId,
            Manufacturer = request.Manufacturer,
            ModelNumber = request.ModelNumber,
            YearOfManufacture = request.YearOfManufacture,
            Status = request.Status,
            PurchaseDate = request.PurchaseDate,
            PurchasePrice = request.PurchasePrice,
            CurrentValue = request.CurrentValue,
            OperatingHours = request.OperatingHours,
            LastMaintenanceDate = request.LastMaintenanceDate,
            NextMaintenanceDate = request.NextMaintenanceDate,
            InsuranceExpiryDate = request.InsuranceExpiryDate,
            RegistrationExpiryDate = request.RegistrationExpiryDate,
            CurrentLocation = request.CurrentLocation,
            StorageLocation = request.StorageLocation,
            Specifications = request.Specifications,
            Notes = request.Notes,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive,
            IsAvailableForRental = request.IsAvailableForRental,
            HasGpsTracking = request.HasGpsTracking,
            GpsDeviceId = request.GpsDeviceId
        };

        var updatedEquipment = await _equipmentService.UpdateEquipmentAsync(id, equipment);
        if (updatedEquipment == null) return NotFound();
        return Ok(updatedEquipment);
    }

    /// <summary>
    /// Delete equipment
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEquipment(int id)
    {
        var result = await _equipmentService.DeleteEquipmentAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion

    #region Equipment Assignments

    /// <summary>
    /// Get all assignments
    /// </summary>
    [HttpGet("assignments")]
    public async Task<ActionResult<IEnumerable<EquipmentAssignmentDto>>> GetAssignments([FromQuery] int? companyId = null)
    {
        var assignments = await _equipmentService.GetAssignmentsAsync(companyId);
        return Ok(assignments);
    }

    /// <summary>
    /// Get active assignments
    /// </summary>
    [HttpGet("assignments/active")]
    public async Task<ActionResult<IEnumerable<EquipmentAssignmentDto>>> GetActiveAssignments([FromQuery] int? companyId = null)
    {
        var assignments = await _equipmentService.GetActiveAssignmentsAsync(companyId);
        return Ok(assignments);
    }

    /// <summary>
    /// Get assignment by ID
    /// </summary>
    [HttpGet("assignments/{id}")]
    public async Task<ActionResult<EquipmentAssignmentDto>> GetAssignment(int id)
    {
        var assignment = await _equipmentService.GetAssignmentByIdAsync(id);
        if (assignment == null) return NotFound();
        return Ok(assignment);
    }

    /// <summary>
    /// Get assignments by equipment
    /// </summary>
    [HttpGet("equipment/{equipmentId}/assignments")]
    public async Task<ActionResult<IEnumerable<EquipmentAssignmentDto>>> GetAssignmentsByEquipment(int equipmentId)
    {
        var assignments = await _equipmentService.GetAssignmentsByEquipmentAsync(equipmentId);
        return Ok(assignments);
    }

    /// <summary>
    /// Get assignments by project
    /// </summary>
    [HttpGet("projects/{projectId}/assignments")]
    public async Task<ActionResult<IEnumerable<EquipmentAssignmentDto>>> GetAssignmentsByProject(int projectId)
    {
        var assignments = await _equipmentService.GetAssignmentsByProjectAsync(projectId);
        return Ok(assignments);
    }

    /// <summary>
    /// Check for overdue assignments
    /// </summary>
    [HttpGet("assignments/overdue")]
    public async Task<ActionResult<bool>> HasOverdueAssignments([FromQuery] int? companyId = null)
    {
        var hasOverdue = await _equipmentService.OverdueAssignmentsExistAsync(companyId);
        return Ok(hasOverdue);
    }

    /// <summary>
    /// Create equipment assignment
    /// </summary>
    [HttpPost("assignments")]
    public async Task<ActionResult<EquipmentAssignmentDto>> CreateAssignment([FromBody] CreateEquipmentAssignmentRequest request)
    {
        var assignment = new EquipmentAssignment
        {
            EquipmentId = request.EquipmentId,
            ProjectId = request.ProjectId,
            AssignedToUserId = request.AssignedToUserId,
            AssignmentType = request.AssignmentType,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ConditionAtAssignment = request.ConditionAtAssignment,
            FuelLevelAtAssignment = request.FuelLevelAtAssignment,
            OperatingHoursAtAssignment = request.OperatingHoursAtAssignment,
            Purpose = request.Purpose,
            Notes = request.Notes
        };

        var createdAssignment = await _equipmentService.CreateAssignmentAsync(assignment);
        return CreatedAtAction(nameof(GetAssignment), new { id = createdAssignment.Id }, createdAssignment);
    }

    /// <summary>
    /// Return equipment
    /// </summary>
    [HttpPost("assignments/{id}/return")]
    public async Task<ActionResult<EquipmentAssignmentDto>> ReturnEquipment(int id, [FromBody] ReturnEquipmentRequest request)
    {
        var assignment = await _equipmentService.ReturnEquipmentAsync(id, request);
        if (assignment == null) return NotFound();
        return Ok(assignment);
    }

    /// <summary>
    /// Cancel assignment
    /// </summary>
    [HttpPost("assignments/{id}/cancel")]
    public async Task<ActionResult> CancelAssignment(int id)
    {
        var result = await _equipmentService.CancelAssignmentAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion

    #region Equipment Maintenance

    /// <summary>
    /// Get all maintenance records
    /// </summary>
    [HttpGet("maintenance")]
    public async Task<ActionResult<IEnumerable<EquipmentMaintenanceDto>>> GetMaintenances([FromQuery] int? companyId = null)
    {
        var maintenances = await _maintenanceService.GetMaintenancesAsync(companyId);
        return Ok(maintenances);
    }

    /// <summary>
    /// Get maintenance by ID
    /// </summary>
    [HttpGet("maintenance/{id}")]
    public async Task<ActionResult<EquipmentMaintenanceDto>> GetMaintenance(int id)
    {
        var maintenance = await _maintenanceService.GetMaintenanceByIdAsync(id);
        if (maintenance == null) return NotFound();
        return Ok(maintenance);
    }

    /// <summary>
    /// Get maintenance by equipment
    /// </summary>
    [HttpGet("equipment/{equipmentId}/maintenance")]
    public async Task<ActionResult<IEnumerable<EquipmentMaintenanceDto>>> GetMaintenancesByEquipment(int equipmentId)
    {
        var maintenances = await _maintenanceService.GetMaintenancesByEquipmentAsync(equipmentId);
        return Ok(maintenances);
    }

    /// <summary>
    /// Get upcoming maintenance
    /// </summary>
    [HttpGet("maintenance/upcoming")]
    public async Task<ActionResult<IEnumerable<EquipmentMaintenanceDto>>> GetUpcomingMaintenance(
        [FromQuery] DateTime beforeDate,
        [FromQuery] int? companyId = null)
    {
        var maintenances = await _maintenanceService.GetUpcomingMaintenancesAsync(beforeDate, companyId);
        return Ok(maintenances);
    }

    /// <summary>
    /// Get pending maintenance
    /// </summary>
    [HttpGet("maintenance/pending")]
    public async Task<ActionResult<IEnumerable<EquipmentMaintenanceDto>>> GetPendingMaintenance([FromQuery] int? companyId = null)
    {
        var maintenances = await _maintenanceService.GetPendingMaintenancesAsync(companyId);
        return Ok(maintenances);
    }

    /// <summary>
    /// Get overdue maintenance
    /// </summary>
    [HttpGet("maintenance/overdue")]
    public async Task<ActionResult<IEnumerable<EquipmentMaintenanceDto>>> GetOverdueMaintenance([FromQuery] int? companyId = null)
    {
        var maintenances = await _maintenanceService.GetOverdueMaintenancesAsync(companyId);
        return Ok(maintenances);
    }

    /// <summary>
    /// Get maintenance by status
    /// </summary>
    [HttpGet("maintenance/status/{status}")]
    public async Task<ActionResult<IEnumerable<EquipmentMaintenanceDto>>> GetMaintenancesByStatus(
        MaintenanceStatus status,
        [FromQuery] int? companyId = null)
    {
        var maintenances = await _maintenanceService.GetMaintenancesByStatusAsync(status, companyId);
        return Ok(maintenances);
    }

    /// <summary>
    /// Create maintenance record
    /// </summary>
    [HttpPost("maintenance")]
    public async Task<ActionResult<EquipmentMaintenanceDto>> CreateMaintenance([FromBody] CreateEquipmentMaintenanceRequest request)
    {
        var maintenance = new EquipmentMaintenance
        {
            EquipmentId = request.EquipmentId,
            MaintenanceType = request.MaintenanceType,
            ScheduledDate = request.ScheduledDate,
            ActualDate = request.ActualDate,
            ServiceProvider = request.ServiceProvider,
            ServiceProviderContact = request.ServiceProviderContact,
            ServiceProviderPhone = request.ServiceProviderPhone,
            WorkOrderNumber = request.WorkOrderNumber,
            InvoiceNumber = request.InvoiceNumber,
            Cost = request.Cost,
            LaborHours = request.LaborHours,
            PartsUsed = request.PartsUsed,
            Description = request.Description,
            IssuesFound = request.IssuesFound,
            Recommendations = request.Recommendations,
            NextMaintenanceDue = request.NextMaintenanceDue,
            NextMaintenanceHours = request.NextMaintenanceHours,
            OperatingHoursAtMaintenance = request.OperatingHoursAtMaintenance,
            IsWarrantyRepair = request.IsWarrantyRepair,
            PerformedByUserId = request.PerformedByUserId,
            AttachedDocuments = request.AttachedDocuments
        };

        var createdMaintenance = await _maintenanceService.CreateMaintenanceAsync(maintenance);
        return CreatedAtAction(nameof(GetMaintenance), new { id = createdMaintenance.Id }, createdMaintenance);
    }

    /// <summary>
    /// Update maintenance record
    /// </summary>
    [HttpPut("maintenance/{id}")]
    public async Task<ActionResult<EquipmentMaintenanceDto>> UpdateMaintenance(int id, [FromBody] UpdateEquipmentMaintenanceRequest request)
    {
        var maintenance = new EquipmentMaintenance
        {
            MaintenanceType = request.MaintenanceType,
            Status = request.Status,
            ScheduledDate = request.ScheduledDate,
            ActualDate = request.ActualDate,
            ServiceProvider = request.ServiceProvider,
            ServiceProviderContact = request.ServiceProviderContact,
            ServiceProviderPhone = request.ServiceProviderPhone,
            WorkOrderNumber = request.WorkOrderNumber,
            InvoiceNumber = request.InvoiceNumber,
            Cost = request.Cost,
            LaborHours = request.LaborHours,
            PartsUsed = request.PartsUsed,
            Description = request.Description,
            IssuesFound = request.IssuesFound,
            Recommendations = request.Recommendations,
            NextMaintenanceDue = request.NextMaintenanceDue,
            NextMaintenanceHours = request.NextMaintenanceHours,
            OperatingHoursAtMaintenance = request.OperatingHoursAtMaintenance,
            IsWarrantyRepair = request.IsWarrantyRepair,
            PerformedByUserId = request.PerformedByUserId,
            AttachedDocuments = request.AttachedDocuments
        };

        var updatedMaintenance = await _maintenanceService.UpdateMaintenanceAsync(id, maintenance);
        if (updatedMaintenance == null) return NotFound();
        return Ok(updatedMaintenance);
    }

    /// <summary>
    /// Start maintenance
    /// </summary>
    [HttpPost("maintenance/{id}/start")]
    public async Task<ActionResult<EquipmentMaintenanceDto>> StartMaintenance(int id)
    {
        var maintenance = await _maintenanceService.StartMaintenanceAsync(id);
        if (maintenance == null) return NotFound();
        return Ok(maintenance);
    }

    /// <summary>
    /// Complete maintenance
    /// </summary>
    [HttpPost("maintenance/{id}/complete")]
    public async Task<ActionResult<EquipmentMaintenanceDto>> CompleteMaintenance(int id, [FromBody] UpdateEquipmentMaintenanceRequest request)
    {
        var maintenance = new EquipmentMaintenance
        {
            ActualDate = request.ActualDate,
            Status = MaintenanceStatus.Completed,
            ServiceProvider = request.ServiceProvider,
            ServiceProviderContact = request.ServiceProviderContact,
            ServiceProviderPhone = request.ServiceProviderPhone,
            WorkOrderNumber = request.WorkOrderNumber,
            InvoiceNumber = request.InvoiceNumber,
            Cost = request.Cost,
            LaborHours = request.LaborHours,
            PartsUsed = request.PartsUsed,
            Description = request.Description,
            IssuesFound = request.IssuesFound,
            Recommendations = request.Recommendations,
            NextMaintenanceDue = request.NextMaintenanceDue,
            NextMaintenanceHours = request.NextMaintenanceHours,
            OperatingHoursAtMaintenance = request.OperatingHoursAtMaintenance,
            IsWarrantyRepair = request.IsWarrantyRepair,
            PerformedByUserId = request.PerformedByUserId,
            AttachedDocuments = request.AttachedDocuments
        };

        var completedMaintenance = await _maintenanceService.CompleteMaintenanceAsync(id, maintenance);
        if (completedMaintenance == null) return NotFound();
        return Ok(completedMaintenance);
    }

    /// <summary>
    /// Delete maintenance record
    /// </summary>
    [HttpDelete("maintenance/{id}")]
    public async Task<ActionResult> DeleteMaintenance(int id)
    {
        var result = await _maintenanceService.DeleteMaintenanceAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    #endregion
}
