// Infrastructure/Persistence/Repositories/UserRepository.cs
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetByPasswordResetTokenAsync(string token)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.PasswordResetToken == token && 
                                       u.PasswordResetTokenExpiry.HasValue && 
                                       u.PasswordResetTokenExpiry > DateTime.UtcNow);
    }

    public async Task<User?> GetByEmailVerificationTokenAsync(string token)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
    }

    public async Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => ur.Role.Name.ToLower() == roleName.ToLower()))
            .ToListAsync();
    }

    public override async Task<User?> GetByIdAsync(int id)
    {
        return await _dbSet
            .IgnoreQueryFilters()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<IEnumerable<User>> GetUsersByCompanyIdAndRoleAsync(int companyId, string roleName)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Where(u => u.CompanyId == companyId && 
                       u.UserRoles.Any(ur => ur.Role.Name.ToLower() == roleName.ToLower()))
            .ToListAsync();
    }
}
