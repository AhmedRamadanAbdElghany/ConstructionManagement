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
            .Include(u => u.UserRoles)           // جلب جدول الربط
                .ThenInclude(ur => ur.Role)      // جلب بيانات الدور الفعلية من جدول الـ Roles
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }
}
