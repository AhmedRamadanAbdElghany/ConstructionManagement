using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class PhaseService : IPhaseService
{
    private readonly IRepository<Phase> _phaseRepository;
    private readonly IRepository<CompanyDefaultPhase> _defaultPhaseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PhaseService(
        IRepository<Phase> phaseRepository,
        IRepository<CompanyDefaultPhase> defaultPhaseRepository,
        IUnitOfWork unitOfWork)
    {
        _phaseRepository = phaseRepository;
        _defaultPhaseRepository = defaultPhaseRepository;
        _unitOfWork = unitOfWork;
    }

    // --- Project Phases ---

    public async Task<int> CreateProjectPhaseAsync(int projectId, CreatePhaseRequest request)
    {
        var phase = new Phase
        {
            ProjectId = projectId,
            Name = request.Name,
            Description = request.Description,
            Order = request.Order ?? 0,
            ParentPhaseId = request.ParentPhaseId
        };

        await _phaseRepository.AddAsync(phase);
        await _unitOfWork.SaveChangesAsync();
        return phase.Id;
    }

    public async Task<IEnumerable<PhaseDto>> GetProjectPhasesAsync(int projectId)
    {
        var phases = await _phaseRepository.AsQueryable()
            .Where(p => p.ProjectId == projectId)
            .OrderBy(p => p.Order)
            .ToListAsync();

        return phases.Select(p => MapToDto(p));
    }

    public async Task<IEnumerable<PhaseDto>> GetPhaseTreeAsync(int projectId)
    {
        var allPhases = await _phaseRepository.AsQueryable()
            .Where(p => p.ProjectId == projectId)
            .Include(p => p.Items)
            .ToListAsync();

        var rootPhases = allPhases.Where(p => p.ParentPhaseId == null).OrderBy(p => p.Order).ToList();
        
        return rootPhases.Select(p => BuildPhaseTree(p, allPhases));
    }

    private PhaseDto BuildPhaseTree(Phase phase, List<Phase> allPhases)
    {
        var children = allPhases
            .Where(p => p.ParentPhaseId == phase.Id)
            .OrderBy(p => p.Order)
            .Select(p => BuildPhaseTree(p, allPhases))
            .ToList();

        var items = phase.Items.Select(i => new BOQItemDto(
            i.Id,
            i.ItemCode,
            i.ItemName,
            i.AccountingType.ToString(),
            i.Status,
            i.StartDate,
            i.EndDate,
            0, // Placeholder for progress
            null // Placeholder for notes
        )).ToList();

        DateTime? minStart = null;
        DateTime? maxEnd = null;

        // Aggregate from children
        foreach (var child in children)
        {
            if (child.StartDate.HasValue)
            {
                if (minStart == null || child.StartDate < minStart) minStart = child.StartDate;
            }
            if (child.EndDate.HasValue)
            {
                if (maxEnd == null || child.EndDate > maxEnd) maxEnd = child.EndDate;
            }
        }

        // Aggregate from items
        foreach (var item in items)
        {
            if (item.StartDate.HasValue)
            {
                if (minStart == null || item.StartDate < minStart) minStart = item.StartDate;
            }
            if (item.EndDate.HasValue)
            {
                if (maxEnd == null || item.EndDate > maxEnd) maxEnd = item.EndDate;
            }
        }

        return new PhaseDto(
            phase.Id,
            phase.Name,
            phase.Description,
            phase.Order,
            phase.ParentPhaseId,
            !children.Any(),
            minStart,
            maxEnd,
            children,
            items
        );
    }

    // Update the interface to return IEnumerable<PhaseDto> for tree

    public async Task UpdatePhaseAsync(int phaseId, UpdatePhaseRequest request)
    {
        var phase = await _phaseRepository.GetByIdAsync(phaseId);
        if (phase == null) return;

        if (request.Name != null) phase.Name = request.Name;
        if (request.Description != null) phase.Description = request.Description;
        if (request.Order != null) phase.Order = request.Order.Value;

        await _phaseRepository.UpdateAsync(phase);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeletePhaseAsync(int phaseId)
    {
        var phase = await _phaseRepository.GetByIdAsync(phaseId);
        if (phase == null) return;

        await _phaseRepository.DeleteAsync(phase);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task InitializeProjectPhasesAsync(int projectId, int companyId)
    {
        var defaults = await _defaultPhaseRepository.AsQueryable()
            .Where(d => d.CompanyId == companyId)
            .ToListAsync();

        if (!defaults.Any()) return;

        // Clone defaults to project phases
        var oldToNewIdMap = new Dictionary<int, int>();
        
        // Root levels first
        foreach (var def in defaults.Where(d => d.ParentId == null).OrderBy(d => d.Order))
        {
            var newPhase = new Phase
            {
                ProjectId = projectId,
                Name = def.Name,
                Description = def.Description,
                Order = def.Order,
                CompanyId = companyId
            };
            await _phaseRepository.AddAsync(newPhase);
            await _unitOfWork.SaveChangesAsync();
            oldToNewIdMap[def.Id] = newPhase.Id;

            await CloneChildren(def, newPhase.Id, projectId, companyId, defaults, oldToNewIdMap);
        }
    }

    private async Task CloneChildren(CompanyDefaultPhase parentDef, int newParentId, int projectId, int companyId, List<CompanyDefaultPhase> allDefaults, Dictionary<int, int> map)
    {
        foreach (var childDef in allDefaults.Where(d => d.ParentId == parentDef.Id).OrderBy(d => d.Order))
        {
            var newPhase = new Phase
            {
                ProjectId = projectId,
                Name = childDef.Name,
                Description = childDef.Description,
                Order = childDef.Order,
                ParentPhaseId = newParentId,
                CompanyId = companyId
            };
            await _phaseRepository.AddAsync(newPhase);
            await _unitOfWork.SaveChangesAsync();
            map[childDef.Id] = newPhase.Id;

            await CloneChildren(childDef, newPhase.Id, projectId, companyId, allDefaults, map);
        }
    }

    // --- Company Default Phases ---

    public async Task<int> CreateDefaultPhaseAsync(int companyId, CreatePhaseRequest request)
    {
        var def = new CompanyDefaultPhase
        {
            CompanyId = companyId,
            Name = request.Name,
            Description = request.Description,
            Order = request.Order ?? 0,
            ParentId = request.ParentPhaseId
        };

        await _defaultPhaseRepository.AddAsync(def);
        await _unitOfWork.SaveChangesAsync();
        return def.Id;
    }

    public async Task<IEnumerable<PhaseDto>> GetDefaultPhasesAsync(int companyId)
    {
        var defaults = await _defaultPhaseRepository.AsQueryable()
            .Where(d => d.CompanyId == companyId)
            .OrderBy(d => d.Order)
            .ToListAsync();

        return defaults.Select(d => new PhaseDto(d.Id, d.Name, d.Description, d.Order, d.ParentId, !d.Children.Any(), null, null, null, null));
    }

    public async Task UpdateDefaultPhaseAsync(int defaultPhaseId, UpdatePhaseRequest request)
    {
        var def = await _defaultPhaseRepository.GetByIdAsync(defaultPhaseId);
        if (def == null) return;

        if (request.Name != null) def.Name = request.Name;
        if (request.Description != null) def.Description = request.Description;
        if (request.Order != null) def.Order = request.Order.Value;

        await _defaultPhaseRepository.UpdateAsync(def);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteDefaultPhaseAsync(int defaultPhaseId)
    {
        var def = await _defaultPhaseRepository.GetByIdAsync(defaultPhaseId);
        if (def == null) return;

        await _defaultPhaseRepository.DeleteAsync(def);
        await _unitOfWork.SaveChangesAsync();
    }

    private PhaseDto MapToDto(Phase p)
    {
        return new PhaseDto(
            p.Id,
            p.Name,
            p.Description,
            p.Order,
            p.ParentPhaseId,
            p.IsLeafPhase,
            null,
            null,
            null,
            null
        );
    }
}
