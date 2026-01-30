using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class BOQItemRepository : Repository<BOQItem>, IBOQItemRepository
{
    public BOQItemRepository(ApplicationDbContext context) : base(context) { }

    public async Task<BOQItem?> GetWithDetailsAsync(int itemId)
        => await _dbSet
            .Include(i => i.Project)         // سيتم التعرف عليها الآن
            .Include(i => i.MeasuredData)
            .Include(i => i.SupervisionData)
            .FirstOrDefaultAsync(i => i.Id == itemId);
}
