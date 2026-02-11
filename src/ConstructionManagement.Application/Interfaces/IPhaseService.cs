using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IPhaseService
{
    // Project Phases
    Task<int> CreateProjectPhaseAsync(int projectId, CreatePhaseRequest request);
    Task<IEnumerable<PhaseDto>> GetProjectPhasesAsync(int projectId);
    Task<IEnumerable<PhaseDto>> GetPhaseTreeAsync(int projectId);
    Task UpdatePhaseAsync(int phaseId, UpdatePhaseRequest request);
    Task DeletePhaseAsync(int phaseId);
    Task InitializeProjectPhasesAsync(int projectId, int companyId);

    // Company Default Phases
    Task<int> CreateDefaultPhaseAsync(int companyId, CreatePhaseRequest request);
    Task<IEnumerable<PhaseDto>> GetDefaultPhasesAsync(int companyId);
    Task UpdateDefaultPhaseAsync(int defaultPhaseId, UpdatePhaseRequest request);
    Task DeleteDefaultPhaseAsync(int defaultPhaseId);
    Task ClearDefaultPhasesAsync(int companyId);
    Task AddItemsToDefaultPhaseAsync(int phaseId, IEnumerable<int> catalogItemIds);
    Task ReorderDefaultPhaseAsync(int phaseId, int direction);
}
