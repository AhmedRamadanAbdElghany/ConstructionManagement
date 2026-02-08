using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Interface for Equipment management service
/// </summary>
public interface IEquipmentService
{
    // Equipment Type operations
    Task<IEnumerable<EquipmentTypeDto>> GetEquipmentTypesAsync(int? companyId = null);
    Task<EquipmentTypeDto?> GetEquipmentTypeByIdAsync(int id);
    Task<EquipmentTypeDto> CreateEquipmentTypeAsync(EquipmentType equipmentType);
    Task<EquipmentTypeDto?> UpdateEquipmentTypeAsync(int id, EquipmentType equipmentType);
    Task<bool> DeleteEquipmentTypeAsync(int id);
    Task<IEnumerable<EquipmentTypeDto>> SearchEquipmentTypesAsync(string searchTerm, int? companyId = null);

    // Equipment operations
    Task<IEnumerable<EquipmentDto>> GetEquipmentListAsync(int? companyId = null);
    Task<EquipmentDto?> GetEquipmentByIdAsync(int id);
    Task<EquipmentDto?> GetEquipmentBySerialNumberAsync(string serialNumber);
    Task<EquipmentDto> CreateEquipmentAsync(Equipment equipment);
    Task<EquipmentDto?> UpdateEquipmentAsync(int id, Equipment equipment);
    Task<bool> DeleteEquipmentAsync(int id);
    Task<IEnumerable<EquipmentDto>> SearchEquipmentAsync(string searchTerm, int? companyId = null);
    Task<IEnumerable<EquipmentDto>> GetEquipmentByStatusAsync(EquipmentStatus status, int? companyId = null);
    Task<IEnumerable<EquipmentDto>> GetEquipmentByTypeAsync(int equipmentTypeId, int? companyId = null);
    Task<IEnumerable<EquipmentDto>> GetAvailableEquipmentAsync(int? companyId = null);
    Task<IEnumerable<EquipmentDto>> GetEquipmentRequiringMaintenanceAsync(int? companyId = null);
    Task<EquipmentStatisticsDto> GetEquipmentStatisticsAsync(int? companyId = null);
    Task<EquipmentDashboardDto> GetDashboardAsync(int? companyId = null);

    // Equipment Assignment operations
    Task<IEnumerable<EquipmentAssignmentDto>> GetAssignmentsAsync(int? companyId = null);
    Task<EquipmentAssignmentDto?> GetAssignmentByIdAsync(int id);
    Task<IEnumerable<EquipmentAssignmentDto>> GetActiveAssignmentsAsync(int? companyId = null);
    Task<IEnumerable<EquipmentAssignmentDto>> GetAssignmentsByEquipmentAsync(int equipmentId);
    Task<IEnumerable<EquipmentAssignmentDto>> GetAssignmentsByProjectAsync(int projectId);
    Task<IEnumerable<EquipmentAssignmentDto>> GetAssignmentsByUserAsync(int userId);
    Task<EquipmentAssignmentDto> CreateAssignmentAsync(EquipmentAssignment assignment);
    Task<EquipmentAssignmentDto?> ReturnEquipmentAsync(int id, ReturnEquipmentRequest request);
    Task<bool> CancelAssignmentAsync(int id);
    Task<bool> OverdueAssignmentsExistAsync(int? companyId = null);
}

/// <summary>
/// Interface for Equipment Maintenance service
/// </summary>
public interface IEquipmentMaintenanceService
{
    Task<IEnumerable<EquipmentMaintenanceDto>> GetMaintenancesAsync(int? companyId = null);
    Task<EquipmentMaintenanceDto?> GetMaintenanceByIdAsync(int id);
    Task<IEnumerable<EquipmentMaintenanceDto>> GetMaintenancesByEquipmentAsync(int equipmentId);
    Task<IEnumerable<EquipmentMaintenanceDto>> GetUpcomingMaintenancesAsync(DateTime beforeDate, int? companyId = null);
    Task<IEnumerable<EquipmentMaintenanceDto>> GetPendingMaintenancesAsync(int? companyId = null);
    Task<IEnumerable<EquipmentMaintenanceDto>> GetOverdueMaintenancesAsync(int? companyId = null);
    Task<IEnumerable<EquipmentMaintenanceDto>> GetMaintenancesByStatusAsync(MaintenanceStatus status, int? companyId = null);
    Task<EquipmentMaintenanceDto> CreateMaintenanceAsync(EquipmentMaintenance maintenance);
    Task<EquipmentMaintenanceDto?> UpdateMaintenanceAsync(int id, EquipmentMaintenance maintenance);
    Task<EquipmentMaintenanceDto?> StartMaintenanceAsync(int id);
    Task<EquipmentMaintenanceDto?> CompleteMaintenanceAsync(int id, EquipmentMaintenance maintenance);
    Task<bool> DeleteMaintenanceAsync(int id);
    Task<decimal> GetTotalMaintenanceCostAsync(int equipmentId);
    Task<decimal> GetTotalMaintenanceCostByCompanyAsync(int? companyId = null);
}

/// <summary>
/// Interface for Equipment Utilization service
/// </summary>
public interface IEquipmentUtilizationService
{
    Task<IEnumerable<EquipmentUtilizationDto>> GetUtilizationsAsync(int? companyId = null);
    Task<EquipmentUtilizationDto?> GetUtilizationByIdAsync(int id);
    Task<IEnumerable<EquipmentUtilizationDto>> GetUtilizationsByEquipmentAsync(int equipmentId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<IEnumerable<EquipmentUtilizationDto>> GetUtilizationsByProjectAsync(int projectId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<IEnumerable<EquipmentUtilizationDto>> GetUtilizationsByDateAsync(DateTime date, int? companyId = null);
    Task<EquipmentUtilizationDto> CreateUtilizationAsync(EquipmentUtilization utilization);
    Task<EquipmentUtilizationDto?> UpdateUtilizationAsync(int id, EquipmentUtilization utilization);
    Task<bool> DeleteUtilizationAsync(int id);
    Task<decimal> GetAverageUtilizationRateAsync(int equipmentId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<Dictionary<int, decimal>> GetEquipmentUtilizationRatesAsync(DateTime fromDate, DateTime toDate, int? companyId = null);
}
