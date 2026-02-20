// Infrastructure/Persistence/Repositories/Interfaces/IProjectItemRepository.cs
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

public interface IProjectItemRepository : IRepository<ProjectItem>
{
    Task<ProjectItem?> GetWithDetailsAsync(int itemId);
    Task<IEnumerable<ProjectItem>> GetByProjectIdAsync(int projectId);
    Task<IEnumerable<ProjectItem>> GetByPhaseIdAsync(int phaseId);
}
