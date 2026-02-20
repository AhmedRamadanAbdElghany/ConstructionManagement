using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class ProjectItemRepository : Repository<ProjectItem>, IProjectItemRepository
{
    public ProjectItemRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<ProjectItem?> GetWithDetailsAsync(int itemId)
    {
        return await _context.ProjectItems
            .Include(i => i.Project)
            .Include(i => i.Phase)
            .FirstOrDefaultAsync(i => i.Id == itemId);
    }

    public async Task<IEnumerable<ProjectItem>> GetByProjectIdAsync(int projectId)
    {
        return await _context.ProjectItems
            .Include(i => i.Phase)
            .Where(i => i.ProjectId == projectId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectItem>> GetByPhaseIdAsync(int phaseId)
    {
        return await _context.ProjectItems
            .Where(i => i.PhaseId == phaseId)
            .ToListAsync();
    }
}
