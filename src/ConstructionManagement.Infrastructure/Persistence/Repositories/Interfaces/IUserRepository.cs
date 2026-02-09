// Infrastructure/Persistence/Repositories/Interfaces/IUserRepository.cs
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByPasswordResetTokenAsync(string token);
    Task<User?> GetByEmailVerificationTokenAsync(string token);
    Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName);
    Task<IEnumerable<User>> GetUsersByCompanyIdAndRoleAsync(int companyId, string roleName);
}
