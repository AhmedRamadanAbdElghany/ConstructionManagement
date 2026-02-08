using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Equipment management service implementation
/// </summary>
public class EquipmentService : IEquipmentService
{
    private readonly ApplicationDbContext _context;
    private readonly ICompanyContext _companyContext;

    public EquipmentService(ApplicationDbContext context, ICompanyContext companyContext)
    {
        _context = context;
        _companyContext = companyContext;
    }

    #region Equipment Type Operations

    public async Task<IEnumerable<EquipmentTypeDto>> GetEquipmentTypesAsync(int? companyId = null)
    {
        var query = _context.EquipmentTypes.AsQueryable();

        if (companyId.HasValue)
            query = query.Where(t => t.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(t => t.CompanyId == _companyContext.CompanyId.Value);

        var types = await query.OrderBy(t => t.Name).ToListAsync();

        var result = new List<EquipmentTypeDto>();
        foreach (var type in types)
        {
            var dto = MapToEquipmentTypeDto(type);
            dto.EquipmentCount = await _context.Equipment.CountAsync(e => e.EquipmentTypeId == type.Id);
            result.Add(dto);
        }

        return result;
    }

    public async Task<EquipmentTypeDto?> GetEquipmentTypeByIdAsync(int id)
    {
        var type = await _context.EquipmentTypes.FindAsync(id);
        if (type == null) return null;

        var dto = MapToEquipmentTypeDto(type);
        dto.EquipmentCount = await _context.Equipment.CountAsync(e => e.EquipmentTypeId == type.Id);
        return dto;
    }

    public async Task<EquipmentTypeDto> CreateEquipmentTypeAsync(EquipmentType equipmentType)
    {
        _context.EquipmentTypes.Add(equipmentType);
        await _context.SaveChangesAsync();

        return MapToEquipmentTypeDto(equipmentType);
    }

    public async Task<EquipmentTypeDto?> UpdateEquipmentTypeAsync(int id, EquipmentType equipmentType)
    {
        var existing = await _context.EquipmentTypes.FindAsync(id);
        if (existing == null) return null;

        existing.Name = equipmentType.Name;
        existing.Description = equipmentType.Description;
        existing.Code = equipmentType.Code;
        existing.Icon = equipmentType.Icon;
        existing.DefaultHourlyRate = equipmentType.DefaultHourlyRate;
        existing.DefaultDailyRate = equipmentType.DefaultDailyRate;
        existing.DefaultMonthlyRate = equipmentType.DefaultMonthlyRate;
        existing.IsActive = equipmentType.IsActive;

        await _context.SaveChangesAsync();

        return MapToEquipmentTypeDto(existing);
    }

    public async Task<bool> DeleteEquipmentTypeAsync(int id)
    {
        var type = await _context.EquipmentTypes.FindAsync(id);
        if (type == null) return false;

        // Check if there are any equipment using this type
        if (await _context.Equipment.AnyAsync(e => e.EquipmentTypeId == id))
            throw new InvalidOperationException("Cannot delete equipment type that has equipment assigned");

        _context.EquipmentTypes.Remove(type);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<EquipmentTypeDto>> SearchEquipmentTypesAsync(string searchTerm, int? companyId = null)
    {
        var query = _context.EquipmentTypes.AsQueryable();

        if (companyId.HasValue)
            query = query.Where(t => t.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(t => t.CompanyId == _companyContext.CompanyId.Value);

        query = query.Where(t => t.Name.Contains(searchTerm) ||
                                 (t.Description != null && t.Description.Contains(searchTerm)) ||
                                 (t.Code != null && t.Code.Contains(searchTerm)));

        var types = await query.OrderBy(t => t.Name).ToListAsync();

        return types.Select(MapToEquipmentTypeDto);
    }

    #endregion

    #region Equipment Operations

    public async Task<IEnumerable<EquipmentDto>> GetEquipmentListAsync(int? companyId = null)
    {
        var query = _context.Equipment
            .Include(e => e.EquipmentType)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(e => e.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(e => e.CompanyId == _companyContext.CompanyId.Value);

        var equipment = await query.OrderBy(e => e.Name).ToListAsync();

        var result = new List<EquipmentDto>();
        foreach (var eq in equipment)
        {
            var dto = MapToEquipmentDto(eq);
            
            // Get current assignment
            var currentAssignment = await _context.EquipmentAssignments
                .FirstOrDefaultAsync(a => a.EquipmentId == eq.Id && a.Status == AssignmentStatus.Active);
            
            if (currentAssignment != null)
            {
                dto.AssignedProjectId = currentAssignment.ProjectId;
                dto.AssignedProjectName = currentAssignment.Project?.ProjectName;
            }

            // Calculate maintenance status
            if (eq.NextMaintenanceDate.HasValue)
            {
                var daysUntil = (eq.NextMaintenanceDate.Value - DateTime.UtcNow).Days;
                dto.DaysUntilMaintenance = daysUntil;
                dto.IsMaintenanceDue = daysUntil <= 0;
            }

            result.Add(dto);
        }

        return result;
    }

    public async Task<EquipmentDto?> GetEquipmentByIdAsync(int id)
    {
        var equipment = await _context.Equipment
            .Include(e => e.EquipmentType)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (equipment == null) return null;

        var dto = MapToEquipmentDto(equipment);

        // Get current assignment
        var currentAssignment = await _context.EquipmentAssignments
            .Include(a => a.Project)
            .FirstOrDefaultAsync(a => a.EquipmentId == equipment.Id && a.Status == AssignmentStatus.Active);

        if (currentAssignment != null)
        {
            dto.AssignedProjectId = currentAssignment.ProjectId;
            dto.AssignedProjectName = currentAssignment.Project?.ProjectName;
        }

        // Calculate maintenance status
        if (equipment.NextMaintenanceDate.HasValue)
        {
            var daysUntil = (equipment.NextMaintenanceDate.Value - DateTime.UtcNow).Days;
            dto.DaysUntilMaintenance = daysUntil;
            dto.IsMaintenanceDue = daysUntil <= 0;
        }

        return dto;
    }

    public async Task<EquipmentDto?> GetEquipmentBySerialNumberAsync(string serialNumber)
    {
        var equipment = await _context.Equipment
            .Include(e => e.EquipmentType)
            .FirstOrDefaultAsync(e => e.SerialNumber == serialNumber);

        return equipment == null ? null : MapToEquipmentDto(equipment);
    }

    public async Task<EquipmentDto> CreateEquipmentAsync(Equipment equipment)
    {
        _context.Equipment.Add(equipment);
        await _context.SaveChangesAsync();

        return MapToEquipmentDto(equipment);
    }

    public async Task<EquipmentDto?> UpdateEquipmentAsync(int id, Equipment equipment)
    {
        var existing = await _context.Equipment.FindAsync(id);
        if (existing == null) return null;

        existing.Name = equipment.Name;
        existing.Description = equipment.Description;
        existing.SerialNumber = equipment.SerialNumber;
        existing.Barcode = equipment.Barcode;
        existing.EquipmentTypeId = equipment.EquipmentTypeId;
        existing.Manufacturer = equipment.Manufacturer;
        existing.ModelNumber = equipment.ModelNumber;
        existing.YearOfManufacture = equipment.YearOfManufacture;
        existing.Status = equipment.Status;
        existing.PurchaseDate = equipment.PurchaseDate;
        existing.PurchasePrice = equipment.PurchasePrice;
        existing.CurrentValue = equipment.CurrentValue;
        existing.OperatingHours = equipment.OperatingHours;
        existing.LastMaintenanceDate = equipment.LastMaintenanceDate;
        existing.NextMaintenanceDate = equipment.NextMaintenanceDate;
        existing.InsuranceExpiryDate = equipment.InsuranceExpiryDate;
        existing.RegistrationExpiryDate = equipment.RegistrationExpiryDate;
        existing.CurrentLocation = equipment.CurrentLocation;
        existing.StorageLocation = equipment.StorageLocation;
        existing.Specifications = equipment.Specifications;
        existing.Notes = equipment.Notes;
        existing.ImageUrl = equipment.ImageUrl;
        existing.IsActive = equipment.IsActive;
        existing.IsAvailableForRental = equipment.IsAvailableForRental;
        existing.HasGpsTracking = equipment.HasGpsTracking;
        existing.GpsDeviceId = equipment.GpsDeviceId;

        await _context.SaveChangesAsync();

        return MapToEquipmentDto(existing);
    }

    public async Task<bool> DeleteEquipmentAsync(int id)
    {
        var equipment = await _context.Equipment.FindAsync(id);
        if (equipment == null) return false;

        _context.Equipment.Remove(equipment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<EquipmentDto>> SearchEquipmentAsync(string searchTerm, int? companyId = null)
    {
        var query = _context.Equipment
            .Include(e => e.EquipmentType)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(e => e.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(e => e.CompanyId == _companyContext.CompanyId.Value);

        query = query.Where(e => e.Name.Contains(searchTerm) ||
                                 e.SerialNumber.Contains(searchTerm) ||
                                 (e.Description != null && e.Description.Contains(searchTerm)) ||
                                 (e.Barcode != null && e.Barcode.Contains(searchTerm)));

        var equipment = await query.OrderBy(e => e.Name).ToListAsync();

        return equipment.Select(MapToEquipmentDto);
    }

    public async Task<IEnumerable<EquipmentDto>> GetEquipmentByStatusAsync(EquipmentStatus status, int? companyId = null)
    {
        var query = _context.Equipment
            .Include(e => e.EquipmentType)
            .Where(e => e.Status == status)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(e => e.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(e => e.CompanyId == _companyContext.CompanyId.Value);

        var equipment = await query.OrderBy(e => e.Name).ToListAsync();

        return equipment.Select(MapToEquipmentDto);
    }

    public async Task<IEnumerable<EquipmentDto>> GetEquipmentByTypeAsync(int equipmentTypeId, int? companyId = null)
    {
        var query = _context.Equipment
            .Include(e => e.EquipmentType)
            .Where(e => e.EquipmentTypeId == equipmentTypeId)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(e => e.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(e => e.CompanyId == _companyContext.CompanyId.Value);

        var equipment = await query.OrderBy(e => e.Name).ToListAsync();

        return equipment.Select(MapToEquipmentDto);
    }

    public async Task<IEnumerable<EquipmentDto>> GetAvailableEquipmentAsync(int? companyId = null)
    {
        return await GetEquipmentByStatusAsync(EquipmentStatus.Available, companyId);
    }

    public async Task<IEnumerable<EquipmentDto>> GetEquipmentRequiringMaintenanceAsync(int? companyId = null)
    {
        var query = _context.Equipment
            .Include(e => e.EquipmentType)
            .Where(e => e.NextMaintenanceDate <= DateTime.UtcNow || e.Status == EquipmentStatus.InMaintenance)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(e => e.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(e => e.CompanyId == _companyContext.CompanyId.Value);

        var equipment = await query.OrderBy(e => e.NextMaintenanceDate).ToListAsync();

        return equipment.Select(MapToEquipmentDto);
    }

    public async Task<EquipmentStatisticsDto> GetEquipmentStatisticsAsync(int? companyId = null)
    {
        var query = _context.Equipment.AsQueryable();

        if (companyId.HasValue)
            query = query.Where(e => e.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(e => e.CompanyId == _companyContext.CompanyId.Value);

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);

        var stats = new EquipmentStatisticsDto
        {
            TotalCount = await query.CountAsync(),
            AvailableCount = await query.CountAsync(e => e.Status == EquipmentStatus.Available),
            AssignedCount = await query.CountAsync(e => e.Status == EquipmentStatus.Assigned),
            MaintenanceCount = await query.CountAsync(e => e.Status == EquipmentStatus.InMaintenance),
            OutOfServiceCount = await query.CountAsync(e => e.Status == EquipmentStatus.OutOfService),
            TotalValue = await query.SumAsync(e => e.CurrentValue ?? e.PurchasePrice ?? 0),
            TotalOperatingHours = await query.SumAsync(e => e.OperatingHours)
        };

        // Get average utilization from the last 30 days
        var thirtyDaysAgo = now.AddDays(-30);
        var utilizations = await _context.EquipmentUtilizations
            .Where(u => u.UtilizationDate >= thirtyDaysAgo)
            .ToListAsync();

        if (utilizations.Any())
        {
            stats.AverageUtilization = utilizations.Average(u => u.ProductiveHours / (u.TotalHours > 0 ? u.TotalHours : 1)) * 100;
        }

        return stats;
    }

    public async Task<EquipmentDashboardDto> GetDashboardAsync(int? companyId = null)
    {
        var stats = await GetEquipmentStatisticsAsync(companyId);

        var query = _context.Equipment.AsQueryable();
        if (companyId.HasValue)
            query = query.Where(e => e.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(e => e.CompanyId == _companyContext.CompanyId.Value);

        var dashboard = new EquipmentDashboardDto
        {
            TotalEquipment = stats.TotalCount,
            AvailableEquipment = stats.AvailableCount,
            AssignedEquipment = stats.AssignedCount,
            InMaintenanceEquipment = stats.MaintenanceCount,
            OutOfServiceEquipment = stats.OutOfServiceCount
        };

        // Get overdue assignments
        dashboard.OverdueAssignments = await _context.EquipmentAssignments
            .CountAsync(a => a.Status == AssignmentStatus.Active && a.EndDate < DateTime.UtcNow);

        // Get upcoming maintenance (next 7 days)
        var nextWeek = DateTime.UtcNow.AddDays(7);
        var upcomingMaintenances = await _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .Where(m => m.ScheduledDate <= nextWeek && m.Status == MaintenanceStatus.Scheduled)
            .OrderBy(m => m.ScheduledDate)
            .Take(5)
            .ToListAsync();

        dashboard.UpcomingMaintenance = upcomingMaintenances.Count;
        dashboard.UpcomingMaintenances = upcomingMaintenances.Select(MapToEquipmentMaintenanceDto).ToList();

        // Get active assignments
        dashboard.ActiveAssignments = (await _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .Include(a => a.Project)
            .Where(a => a.Status == AssignmentStatus.Active)
            .Take(5)
            .ToListAsync())
            .Select(MapToEquipmentAssignmentDto)
            .ToList();

        return dashboard;
    }

    #endregion

    #region Equipment Assignment Operations

    public async Task<IEnumerable<EquipmentAssignmentDto>> GetAssignmentsAsync(int? companyId = null)
    {
        var query = _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .Include(a => a.Project)
            .Include(a => a.AssignedToUser)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(a => a.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(a => a.CompanyId == _companyContext.CompanyId.Value);

        var assignments = await query.OrderByDescending(a => a.StartDate).ToListAsync();

        return assignments.Select(MapToEquipmentAssignmentDto);
    }

    public async Task<EquipmentAssignmentDto?> GetAssignmentByIdAsync(int id)
    {
        var assignment = await _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .Include(a => a.Project)
            .Include(a => a.AssignedToUser)
            .Include(a => a.AssignedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);

        return assignment == null ? null : MapToEquipmentAssignmentDto(assignment);
    }

    public async Task<IEnumerable<EquipmentAssignmentDto>> GetActiveAssignmentsAsync(int? companyId = null)
    {
        var query = _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .Include(a => a.Project)
            .Include(a => a.AssignedToUser)
            .Where(a => a.Status == AssignmentStatus.Active)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(a => a.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(a => a.CompanyId == _companyContext.CompanyId.Value);

        var assignments = await query.OrderByDescending(a => a.StartDate).ToListAsync();

        return assignments.Select(MapToEquipmentAssignmentDto);
    }

    public async Task<IEnumerable<EquipmentAssignmentDto>> GetAssignmentsByEquipmentAsync(int equipmentId)
    {
        var assignments = await _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .Include(a => a.Project)
            .Include(a => a.AssignedToUser)
            .Where(a => a.EquipmentId == equipmentId)
            .OrderByDescending(a => a.StartDate)
            .ToListAsync();

        return assignments.Select(MapToEquipmentAssignmentDto);
    }

    public async Task<IEnumerable<EquipmentAssignmentDto>> GetAssignmentsByProjectAsync(int projectId)
    {
        var assignments = await _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .Include(a => a.Project)
            .Include(a => a.AssignedToUser)
            .Where(a => a.ProjectId == projectId)
            .OrderByDescending(a => a.StartDate)
            .ToListAsync();

        return assignments.Select(MapToEquipmentAssignmentDto);
    }

    public async Task<IEnumerable<EquipmentAssignmentDto>> GetAssignmentsByUserAsync(int userId)
    {
        var assignments = await _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .Include(a => a.Project)
            .Include(a => a.AssignedToUser)
            .Where(a => a.AssignedToUserId == userId)
            .OrderByDescending(a => a.StartDate)
            .ToListAsync();

        return assignments.Select(MapToEquipmentAssignmentDto);
    }

    public async Task<EquipmentAssignmentDto> CreateAssignmentAsync(EquipmentAssignment assignment)
    {
        _context.EquipmentAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        // Update equipment status
        var equipment = await _context.Equipment.FindAsync(assignment.EquipmentId);
        if (equipment != null)
        {
            equipment.Status = EquipmentStatus.Assigned;
            if (!string.IsNullOrEmpty(assignment.ConditionAtAssignment))
                equipment.Notes = $"Condition at assignment: {assignment.ConditionAtAssignment}";
            await _context.SaveChangesAsync();
        }

        return MapToEquipmentAssignmentDto(assignment);
    }

    public async Task<EquipmentAssignmentDto?> ReturnEquipmentAsync(int id, ReturnEquipmentRequest request)
    {
        var assignment = await _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null) return null;

        assignment.ActualReturnDate = request.ActualReturnDate ?? DateTime.UtcNow;
        assignment.ConditionAtReturn = request.ConditionAtReturn;
        assignment.FuelLevelAtReturn = request.FuelLevelAtReturn;
        assignment.OperatingHoursAtReturn = request.OperatingHoursAtReturn;
        assignment.Notes = request.Notes;
        assignment.Status = AssignmentStatus.Completed;

        // Update equipment status and operating hours
        if (assignment.Equipment != null)
        {
            assignment.Equipment.Status = EquipmentStatus.Available;
            if (assignment.OperatingHoursAtReturn.HasValue)
                assignment.Equipment.OperatingHours = assignment.OperatingHoursAtReturn.Value;
        }

        await _context.SaveChangesAsync();

        return MapToEquipmentAssignmentDto(assignment);
    }

    public async Task<bool> CancelAssignmentAsync(int id)
    {
        var assignment = await _context.EquipmentAssignments
            .Include(a => a.Equipment)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null) return false;

        assignment.Status = AssignmentStatus.Cancelled;

        // Restore equipment status
        if (assignment.Equipment != null)
        {
            assignment.Equipment.Status = EquipmentStatus.Available;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> OverdueAssignmentsExistAsync(int? companyId = null)
    {
        var query = _context.EquipmentAssignments
            .Where(a => a.Status == AssignmentStatus.Active && a.EndDate < DateTime.UtcNow);

        if (companyId.HasValue)
            query = query.Where(a => a.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(a => a.CompanyId == _companyContext.CompanyId.Value);

        return await query.AnyAsync();
    }

    #endregion

    #region Mapping Methods

    private EquipmentTypeDto MapToEquipmentTypeDto(EquipmentType type)
    {
        return new EquipmentTypeDto
        {
            Id = type.Id,
            Name = type.Name,
            Description = type.Description,
            Code = type.Code,
            Icon = type.Icon,
            DefaultHourlyRate = type.DefaultHourlyRate,
            DefaultDailyRate = type.DefaultDailyRate,
            DefaultMonthlyRate = type.DefaultMonthlyRate,
            IsActive = type.IsActive,
            CompanyId = type.CompanyId,
            CreatedAt = type.CreatedAt,
            EquipmentCount = 0
        };
    }

    private EquipmentDto MapToEquipmentDto(Equipment equipment)
    {
        return new EquipmentDto
        {
            Id = equipment.Id,
            Name = equipment.Name,
            Description = equipment.Description,
            SerialNumber = equipment.SerialNumber,
            Barcode = equipment.Barcode,
            EquipmentTypeId = equipment.EquipmentTypeId,
            EquipmentTypeName = equipment.EquipmentType?.Name,
            Manufacturer = equipment.Manufacturer,
            ModelNumber = equipment.ModelNumber,
            YearOfManufacture = equipment.YearOfManufacture,
            Status = equipment.Status,
            StatusName = equipment.Status.ToString(),
            PurchaseDate = equipment.PurchaseDate,
            PurchasePrice = equipment.PurchasePrice,
            CurrentValue = equipment.CurrentValue,
            OperatingHours = equipment.OperatingHours,
            LastMaintenanceDate = equipment.LastMaintenanceDate,
            NextMaintenanceDate = equipment.NextMaintenanceDate,
            InsuranceExpiryDate = equipment.InsuranceExpiryDate,
            RegistrationExpiryDate = equipment.RegistrationExpiryDate,
            CurrentLocation = equipment.CurrentLocation,
            StorageLocation = equipment.StorageLocation,
            Specifications = equipment.Specifications,
            Notes = equipment.Notes,
            ImageUrl = equipment.ImageUrl,
            IsActive = equipment.IsActive,
            IsAvailableForRental = equipment.IsAvailableForRental,
            HasGpsTracking = equipment.HasGpsTracking,
            GpsDeviceId = equipment.GpsDeviceId,
            CompanyId = equipment.CompanyId,
            CreatedAt = equipment.CreatedAt,
            UpdatedAt = equipment.UpdatedAt
        };
    }

    private EquipmentAssignmentDto MapToEquipmentAssignmentDto(EquipmentAssignment assignment)
    {
        return new EquipmentAssignmentDto
        {
            Id = assignment.Id,
            EquipmentId = assignment.EquipmentId,
            EquipmentName = assignment.Equipment?.Name,
            EquipmentSerialNumber = assignment.Equipment?.SerialNumber,
            ProjectId = assignment.ProjectId,
            ProjectName = assignment.Project?.ProjectName,
            AssignedToUserId = assignment.AssignedToUserId,
            AssignedToUserName = assignment.AssignedToUser != null ? $"{assignment.AssignedToUser.FirstName} {assignment.AssignedToUser.LastName}" : null,
            AssignmentType = assignment.AssignmentType,
            AssignmentTypeName = assignment.AssignmentType.ToString(),
            StartDate = assignment.StartDate,
            EndDate = assignment.EndDate,
            ActualReturnDate = assignment.ActualReturnDate,
            Status = assignment.Status,
            StatusName = assignment.Status.ToString(),
            ConditionAtAssignment = assignment.ConditionAtAssignment,
            ConditionAtReturn = assignment.ConditionAtReturn,
            FuelLevelAtAssignment = assignment.FuelLevelAtAssignment,
            FuelLevelAtReturn = assignment.FuelLevelAtReturn,
            OperatingHoursAtAssignment = assignment.OperatingHoursAtAssignment,
            OperatingHoursAtReturn = assignment.OperatingHoursAtReturn,
            Purpose = assignment.Purpose,
            Notes = assignment.Notes,
            AssignedByUserId = assignment.AssignedByUserId,
            AssignedByUserName = assignment.AssignedByUser != null ? $"{assignment.AssignedByUser.FirstName} {assignment.AssignedByUser.LastName}" : null,
            ReturnApprovedByUserId = assignment.ReturnApprovedByUserId,
            ReturnApprovedByUserName = assignment.ReturnApprovedByUser != null ? $"{assignment.ReturnApprovedByUser.FirstName} {assignment.ReturnApprovedByUser.LastName}" : null,
            CompanyId = assignment.CompanyId,
            CreatedAt = assignment.CreatedAt,
            UpdatedAt = assignment.UpdatedAt
        };
    }

    private EquipmentMaintenanceDto MapToEquipmentMaintenanceDto(EquipmentMaintenance maintenance)
    {
        return new EquipmentMaintenanceDto
        {
            Id = maintenance.Id,
            EquipmentId = maintenance.EquipmentId,
            EquipmentName = maintenance.Equipment?.Name,
            EquipmentSerialNumber = maintenance.Equipment?.SerialNumber,
            MaintenanceType = maintenance.MaintenanceType,
            MaintenanceTypeName = maintenance.MaintenanceType.ToString(),
            Status = maintenance.Status,
            StatusName = maintenance.Status.ToString(),
            ScheduledDate = maintenance.ScheduledDate,
            ActualDate = maintenance.ActualDate,
            ServiceProvider = maintenance.ServiceProvider,
            ServiceProviderContact = maintenance.ServiceProviderContact,
            ServiceProviderPhone = maintenance.ServiceProviderPhone,
            WorkOrderNumber = maintenance.WorkOrderNumber,
            InvoiceNumber = maintenance.InvoiceNumber,
            Cost = maintenance.Cost,
            LaborHours = maintenance.LaborHours,
            PartsUsed = maintenance.PartsUsed,
            Description = maintenance.Description,
            IssuesFound = maintenance.IssuesFound,
            Recommendations = maintenance.Recommendations,
            NextMaintenanceDue = maintenance.NextMaintenanceDue,
            NextMaintenanceHours = maintenance.NextMaintenanceHours,
            OperatingHoursAtMaintenance = maintenance.OperatingHoursAtMaintenance,
            IsWarrantyRepair = maintenance.IsWarrantyRepair,
            PerformedByUserId = maintenance.PerformedByUserId,
            PerformedByUserName = maintenance.PerformedByUser != null ? $"{maintenance.PerformedByUser.FirstName} {maintenance.PerformedByUser.LastName}" : null,
            AttachedDocuments = maintenance.AttachedDocuments,
            CompanyId = maintenance.CompanyId,
            CreatedAt = maintenance.CreatedAt,
            UpdatedAt = maintenance.UpdatedAt
        };
    }

    #endregion
}
