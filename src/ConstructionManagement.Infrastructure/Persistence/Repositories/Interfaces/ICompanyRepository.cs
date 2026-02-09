// Infrastructure/Persistence/Repositories/Interfaces/ICompanyRepository.cs
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

public interface ICompanyRepository : IRepository<Company>
{
    Task<Company?> GetByNameAsync(string name);
    Task<Company?> GetByBusinessIdAsync(string businessId);
    Task<IEnumerable<Company>> GetActiveCompaniesAsync();
}
