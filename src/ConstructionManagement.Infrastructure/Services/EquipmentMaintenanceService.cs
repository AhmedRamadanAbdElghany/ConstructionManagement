using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Equipment Maintenance service implementation
/// </summary>
public class EquipmentMaintenanceService : IEquipmentMaintenanceService
{
    private readonly ApplicationDbContext _context;
    private readonly ICompanyContext _companyContext;

    public EquipmentMaintenanceService(ApplicationDbContext context, ICompanyContext companyContext)
    {
        _context = context;
        _companyContext = companyContext;
    }

    public async Task<IEnumerable<EquipmentMaintenanceDto>> GetMaintenancesAsync(int? companyId = null)
    {
        var query = _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(m => m.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(m => m.CompanyId == _companyContext.CompanyId.Value);

        var maintenances = await query.OrderByDescending(m => m.ScheduledDate).ToListAsync();

        return maintenances.Select(MapToMaintenanceDto);
    }

    public async Task<EquipmentMaintenanceDto?> GetMaintenanceByIdAsync(int id)
    {
        var maintenance = await _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .Include(m => m.PerformedByUser)
            .FirstOrDefaultAsync(m => m.Id == id);

        return maintenance == null ? null : MapToMaintenanceDto(maintenance);
    }

    public async Task<IEnumerable<EquipmentMaintenanceDto>> GetMaintenancesByEquipmentAsync(int equipmentId)
    {
        var maintenances = await _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .Where(m => m.EquipmentId == equipmentId)
            .OrderByDescending(m => m.ScheduledDate)
            .ToListAsync();

        return maintenances.Select(MapToMaintenanceDto);
    }

    public async Task<IEnumerable<EquipmentMaintenanceDto>> GetUpcomingMaintenancesAsync(DateTime beforeDate, int? companyId = null)
    {
        var query = _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .Where(m => m.ScheduledDate <= beforeDate && m.Status == MaintenanceStatus.Scheduled)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(m => m.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(m => m.CompanyId == _companyContext.CompanyId.Value);

        var maintenances = await query.OrderBy(m => m.ScheduledDate).ToListAsync();

        return maintenances.Select(MapToMaintenanceDto);
    }

    public async Task<IEnumerable<EquipmentMaintenanceDto>> GetPendingMaintenancesAsync(int? companyId = null)
    {
        var query = _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .Where(m => m.Status == MaintenanceStatus.Scheduled)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(m => m.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(m => m.CompanyId == _companyContext.CompanyId.Value);

        var maintenances = await query.OrderBy(m => m.ScheduledDate).ToListAsync();

        return maintenances.Select(MapToMaintenanceDto);
    }

    public async Task<IEnumerable<EquipmentMaintenanceDto>> GetOverdueMaintenancesAsync(int? companyId = null)
    {
        var query = _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .Where(m => m.Status == MaintenanceStatus.Scheduled && m.ScheduledDate < DateTime.UtcNow)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(m => m.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(m => m.CompanyId == _companyContext.CompanyId.Value);

        var maintenances = await query.OrderBy(m => m.ScheduledDate).ToListAsync();

        return maintenances.Select(MapToMaintenanceDto);
    }

    public async Task<IEnumerable<EquipmentMaintenanceDto>> GetMaintenancesByStatusAsync(MaintenanceStatus status, int? companyId = null)
    {
        var query = _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .Where(m => m.Status == status)
            .AsQueryable();

        if (companyId.HasValue)
            query = query.Where(m => m.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(m => m.CompanyId == _companyContext.CompanyId.Value);

        var maintenances = await query.OrderByDescending(m => m.ScheduledDate).ToListAsync();

        return maintenances.Select(MapToMaintenanceDto);
    }

    public async Task<EquipmentMaintenanceDto> CreateMaintenanceAsync(EquipmentMaintenance maintenance)
    {
        _context.EquipmentMaintenances.Add(maintenance);
        await _context.SaveChangesAsync();

        // Update equipment next maintenance date
        if (maintenance.NextMaintenanceDue.HasValue)
        {
            var equipment = await _context.Equipment.FindAsync(maintenance.EquipmentId);
            if (equipment != null)
            {
                equipment.NextMaintenanceDate = maintenance.NextMaintenanceDue;
                equipment.LastMaintenanceDate = maintenance.ActualDate;
                equipment.Status = EquipmentStatus.InMaintenance;
                await _context.SaveChangesAsync();
            }
        }

        return MapToMaintenanceDto(maintenance);
    }

    public async Task<EquipmentMaintenanceDto?> UpdateMaintenanceAsync(int id, EquipmentMaintenance maintenance)
    {
        var existing = await _context.EquipmentMaintenances.FindAsync(id);
        if (existing == null) return null;

        existing.MaintenanceType = maintenance.MaintenanceType;
        existing.Status = maintenance.Status;
        existing.ScheduledDate = maintenance.ScheduledDate;
        existing.ActualDate = maintenance.ActualDate;
        existing.ServiceProvider = maintenance.ServiceProvider;
        existing.ServiceProviderContact = maintenance.ServiceProviderContact;
        existing.ServiceProviderPhone = maintenance.ServiceProviderPhone;
        existing.WorkOrderNumber = maintenance.WorkOrderNumber;
        existing.InvoiceNumber = maintenance.InvoiceNumber;
        existing.Cost = maintenance.Cost;
        existing.LaborHours = maintenance.LaborHours;
        existing.PartsUsed = maintenance.PartsUsed;
        existing.Description = maintenance.Description;
        existing.IssuesFound = maintenance.IssuesFound;
        existing.Recommendations = maintenance.Recommendations;
        existing.NextMaintenanceDue = maintenance.NextMaintenanceDue;
        existing.NextMaintenanceHours = maintenance.NextMaintenanceHours;
        existing.OperatingHoursAtMaintenance = maintenance.OperatingHoursAtMaintenance;
        existing.IsWarrantyRepair = maintenance.IsWarrantyRepair;
        existing.PerformedByUserId = maintenance.PerformedByUserId;
        existing.AttachedDocuments = maintenance.AttachedDocuments;

        await _context.SaveChangesAsync();

        // Update equipment if needed
        if (maintenance.NextMaintenanceDue.HasValue)
        {
            var equipment = await _context.Equipment.FindAsync(existing.EquipmentId);
            if (equipment != null)
            {
                equipment.NextMaintenanceDate = maintenance.NextMaintenanceDue;
                await _context.SaveChangesAsync();
            }
        }

        return MapToMaintenanceDto(existing);
    }

    public async Task<EquipmentMaintenanceDto?> StartMaintenanceAsync(int id)
    {
        var maintenance = await _context.EquipmentMaintenances
            .Include(m => m.Equipment)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (maintenance == null) return null;

        maintenance.Status = MaintenanceStatus.InProgress;
        await _context.SaveChangesAsync();

        // Update equipment status
        if (maintenance.Equipment != null)
        {
            maintenance.Equipment.Status = EquipmentStatus.InMaintenance;
            await _context.SaveChangesAsync();
        }

        return MapToMaintenanceDto(maintenance);
    }

    public async Task<EquipmentMaintenanceDto?> CompleteMaintenanceAsync(int id, EquipmentMaintenance maintenance)
    {
        var existing = await _context.EquipmentMaintenances.FindAsync(id);
        if (existing == null) return null;

        existing.ActualDate = maintenance.ActualDate ?? DateTime.UtcNow;
        existing.Status = MaintenanceStatus.Completed;
        existing.ServiceProvider = maintenance.ServiceProvider;
        existing.ServiceProviderContact = maintenance.ServiceProviderContact;
        existing.ServiceProviderPhone = maintenance.ServiceProviderPhone;
        existing.WorkOrderNumber = maintenance.WorkOrderNumber;
        existing.InvoiceNumber = maintenance.InvoiceNumber;
        existing.Cost = maintenance.Cost;
        existing.LaborHours = maintenance.LaborHours;
        existing.PartsUsed = maintenance.PartsUsed;
        existing.Description = maintenance.Description;
        existing.IssuesFound = maintenance.IssuesFound;
        existing.Recommendations = maintenance.Recommendations;
        existing.NextMaintenanceDue = maintenance.NextMaintenanceDue;
        existing.NextMaintenanceHours = maintenance.NextMaintenanceHours;
        existing.OperatingHoursAtMaintenance = maintenance.OperatingHoursAtMaintenance;
        existing.IsWarrantyRepair = maintenance.IsWarrantyRepair;
        existing.PerformedByUserId = maintenance.PerformedByUserId;
        existing.AttachedDocuments = maintenance.AttachedDocuments;

        await _context.SaveChangesAsync();

        // Update equipment
        var equipment = await _context.Equipment.FindAsync(existing.EquipmentId);
        if (equipment != null)
        {
            equipment.Status = EquipmentStatus.Available;
            equipment.LastMaintenanceDate = existing.ActualDate;
            if (existing.NextMaintenanceDue.HasValue)
                equipment.NextMaintenanceDate = existing.NextMaintenanceDue;
            if (existing.OperatingHoursAtMaintenance.HasValue)
                equipment.OperatingHours = existing.OperatingHoursAtMaintenance.Value;
            await _context.SaveChangesAsync();
        }

        return MapToMaintenanceDto(existing);
    }

    public async Task<bool> DeleteMaintenanceAsync(int id)
    {
        var maintenance = await _context.EquipmentMaintenances.FindAsync(id);
        if (maintenance == null) return false;

        _context.EquipmentMaintenances.Remove(maintenance);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<decimal> GetTotalMaintenanceCostAsync(int equipmentId)
    {
        return await _context.EquipmentMaintenances
            .Where(m => m.EquipmentId == equipmentId && m.Status == MaintenanceStatus.Completed)
            .SumAsync(m => m.Cost ?? 0);
    }

    public async Task<decimal> GetTotalMaintenanceCostByCompanyAsync(int? companyId = null)
    {
        var query = _context.EquipmentMaintenances
            .Where(m => m.Status == MaintenanceStatus.Completed);

        if (companyId.HasValue)
            query = query.Where(m => m.CompanyId == companyId.Value);
        else if (_companyContext.CompanyId.HasValue)
            query = query.Where(m => m.CompanyId == _companyContext.CompanyId.Value);

        return await query.SumAsync(m => m.Cost ?? 0);
    }

    private EquipmentMaintenanceDto MapToMaintenanceDto(EquipmentMaintenance maintenance)
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
}
