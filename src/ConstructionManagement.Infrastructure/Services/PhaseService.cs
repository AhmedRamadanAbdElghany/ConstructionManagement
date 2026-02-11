using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class PhaseService : IPhaseService
{
    private readonly IRepository<Phase> _phaseRepository;
    private readonly IRepository<CompanyDefaultPhase> _defaultPhaseRepository;
    private readonly IRepository<CompanyDefaultPhaseItem> _defaultPhaseItemRepository;
    private readonly IRepository<BOQItem> _boqItemRepository;
    private readonly IRepository<CatalogItem> _catalogItemRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PhaseService(
        IRepository<Phase> phaseRepository,
        IRepository<CompanyDefaultPhase> defaultPhaseRepository,
        IRepository<CompanyDefaultPhaseItem> defaultPhaseItemRepository,
        IRepository<BOQItem> boqItemRepository,
        IRepository<CatalogItem> catalogItemRepository,
        IUnitOfWork unitOfWork)
    {
        _phaseRepository = phaseRepository;
        _defaultPhaseRepository = defaultPhaseRepository;
        _defaultPhaseItemRepository = defaultPhaseItemRepository;
        _boqItemRepository = boqItemRepository;
        _catalogItemRepository = catalogItemRepository;
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
            .Include(d => d.Items)
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

            // Clone items
            foreach (var defItem in def.Items)
            {
                var boqItem = new BOQItem
                {
                    ProjectId = projectId,
                    PhaseId = newPhase.Id,
                    ItemName = defItem.Name,
                    ItemCode = "TEMPL-" + defItem.Id,
                    Status = "جديد",
                    AccountingType = CalculationMethod.Measured, // Default to measured
                    CompanyId = companyId
                };
                await _boqItemRepository.AddAsync(boqItem);
            }

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

            // Clone items
            foreach (var defItem in childDef.Items)
            {
                var boqItem = new BOQItem
                {
                    ProjectId = projectId,
                    PhaseId = newPhase.Id,
                    ItemName = defItem.Name,
                    ItemCode = "TEMPL-" + defItem.Id,
                    Status = "جديد",
                    AccountingType = CalculationMethod.Measured,
                    CompanyId = companyId
                };
                await _boqItemRepository.AddAsync(boqItem);
            }

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
            .Include(d => d.Items)
            .ToListAsync();

        var rootPhases = defaults.Where(d => d.ParentId == null).OrderBy(d => d.Order).ToList();
        return rootPhases.Select(d => BuildDefaultPhaseTree(d, defaults));
    }

    private PhaseDto BuildDefaultPhaseTree(CompanyDefaultPhase phase, List<CompanyDefaultPhase> allPhases)
    {
        var children = allPhases
            .Where(p => p.ParentId == phase.Id)
            .OrderBy(p => p.Order)
            .Select(p => BuildDefaultPhaseTree(p, allPhases))
            .ToList();

        var items = phase.Items.Select(i => new BOQItemDto(
            i.Id,
            "", // Template items don't have codes yet
            i.Name,
            "Measured",
            "Template",
            null,
            null,
            0,
            i.Category
        )).ToList();

        return new PhaseDto(
            phase.Id,
            phase.Name,
            phase.Description,
            phase.Order,
            phase.ParentId,
            !children.Any(),
            null,
            null,
            children,
            items
        );
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

    public async Task ClearDefaultPhasesAsync(int companyId)
    {
        var defaults = await _defaultPhaseRepository.AsQueryable()
            .Where(d => d.CompanyId == companyId)
            .ToListAsync();
        
        foreach (var def in defaults)
        {
            await _defaultPhaseRepository.DeleteAsync(def);
        }
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task AddItemsToDefaultPhaseAsync(int phaseId, IEnumerable<int> catalogItemIds)
    {
        var phase = await _defaultPhaseRepository.GetByIdAsync(phaseId);
        if (phase == null) return;

        var catalogItems = await _catalogItemRepository.AsQueryable()
            .Where(ci => catalogItemIds.Contains(ci.Id))
            .ToListAsync();

        foreach (var ci in catalogItems)
        {
            await _defaultPhaseItemRepository.AddAsync(new CompanyDefaultPhaseItem
            {
                CompanyId = phase.CompanyId,
                DefaultPhaseId = phase.Id,
                Name = ci.Name,
                Unit = ci.Unit,
                DefaultRate = ci.DefaultRate ?? 0m,
                Category = ci.Category,
                Order = 0 // Position at start or end?
            });
        }
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ReorderDefaultPhaseAsync(int phaseId, int direction)
    {
        var phase = await _defaultPhaseRepository.GetByIdAsync(phaseId);
        if (phase == null) return;

        var siblings = await _defaultPhaseRepository.AsQueryable()
            .Where(d => d.CompanyId == phase.CompanyId && d.ParentId == phase.ParentId)
            .OrderBy(d => d.Order)
            .ToListAsync();

        var index = siblings.FindIndex(s => s.Id == phase.Id);
        if (index == -1) return;

        int newIndex = index + direction;
        if (newIndex < 0 || newIndex >= siblings.Count) return;

        var other = siblings[newIndex];

        // Swap orders
        int tempOrder = phase.Order;
        phase.Order = other.Order;
        other.Order = tempOrder;

        // If orders are identical (shouldn't happen with OrderBy, but for safety)
        if (phase.Order == other.Order)
        {
            if (direction < 0) phase.Order--;
            else phase.Order++;
        }

        await _defaultPhaseRepository.UpdateAsync(phase);
        await _defaultPhaseRepository.UpdateAsync(other);
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
