// Infrastructure/Persistence/Repositories/Interfaces/IBOQItemRepository.cs (example for custom query)
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

public interface IBOQItemRepository : IRepository<BOQItem>
{
    Task<BOQItem?> GetWithDetailsAsync(int itemId);
}
