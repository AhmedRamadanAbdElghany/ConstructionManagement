// Infrastructure/Persistence/Repositories/CompanyRepository.cs
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class CompanyRepository : Repository<Company>, ICompanyRepository
{
    public CompanyRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Company?> GetByNameAsync(string name)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
    }

    public async Task<Company?> GetByBusinessIdAsync(string businessId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.BusinessId == businessId);
    }

    public async Task<IEnumerable<Company>> GetActiveCompaniesAsync()
    {
        return await _dbSet
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }
}
