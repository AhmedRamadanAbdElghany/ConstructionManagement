// Infrastructure/Persistence/Repositories/CompanyUserRepository.cs
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

// Alias to avoid conflict with nested ContractStatus in SubcontractorContract
using ContractStatusEnum = ConstructionManagement.Domain.Enums.ContractStatus;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class CompanyUserRepository : Repository<CompanyUser>, ICompanyUserRepository
{
    public CompanyUserRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<CompanyUser>> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(cu => cu.Company)
            .Where(cu => cu.UserId == userId && !cu.IsDeleted)
            .OrderBy(cu => cu.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyUser>> GetByCompanyIdAsync(int companyId)
    {
        return await _dbSet
            .Include(cu => cu.User)
            .Where(cu => cu.CompanyId == companyId && !cu.IsDeleted)
            .OrderBy(cu => cu.User != null ? cu.User.LastName : null)
            .ThenBy(cu => cu.User != null ? cu.User.FirstName : null)
            .ToListAsync();
    }

    public async Task<CompanyUser?> GetByUserAndCompanyAsync(int userId, int companyId)
    {
        return await _dbSet
            .Include(cu => cu.Company)
            .Include(cu => cu.User)
            .FirstOrDefaultAsync(cu => cu.UserId == userId && cu.CompanyId == companyId && !cu.IsDeleted);
    }

    public async Task<IEnumerable<CompanyUser>> GetActiveByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(cu => cu.Company)
            .Where(cu => cu.UserId == userId && cu.Status == ContractStatusEnum.Active && !cu.IsDeleted)
            .OrderBy(cu => cu.Company != null ? cu.Company.Name : null)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyUser>> GetActiveByCompanyIdAsync(int companyId)
    {
        return await _dbSet
            .Include(cu => cu.User)
            .Where(cu => cu.CompanyId == companyId && cu.Status == ContractStatusEnum.Active && !cu.IsDeleted)
            .OrderBy(cu => cu.User != null ? cu.User.LastName : null)
            .ThenBy(cu => cu.User != null ? cu.User.FirstName : null)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyUser>> GetByCompanyAndRoleAsync(int companyId, string role)
    {
        return await _dbSet
            .Include(cu => cu.User)
            .Where(cu => cu.CompanyId == companyId && cu.Role.ToLower() == role.ToLower() && !cu.IsDeleted)
            .OrderBy(cu => cu.User != null ? cu.User.LastName : null)
            .ThenBy(cu => cu.User != null ? cu.User.FirstName : null)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyUser>> GetByCompanyAndStatusAsync(int companyId, ContractStatusEnum status)
    {
        return await _dbSet
            .Include(cu => cu.User)
            .Where(cu => cu.CompanyId == companyId && cu.Status == status && !cu.IsDeleted)
            .OrderBy(cu => cu.User != null ? cu.User.LastName : null)
            .ThenBy(cu => cu.User != null ? cu.User.FirstName : null)
            .ToListAsync();
    }



    public async Task<bool> IsUserAssociatedWithCompanyAsync(int userId, int companyId)
    {
        return await _dbSet
            .AnyAsync(cu => cu.UserId == userId && cu.CompanyId == companyId && !cu.IsDeleted);
    }

    public async Task UpdateStatusAsync(int id, ContractStatusEnum status, string? terminationReason = null)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity != null)
        {
            entity.Status = status;
            entity.UpdatedAt = DateTime.UtcNow;

            if (status == ContractStatusEnum.Terminated)
            {
                entity.TerminatedAt = DateTime.UtcNow;
                entity.TerminationReason = terminationReason;
            }

            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<CompanyUser>> GetAllByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(cu => cu.Company)
            .Where(cu => cu.UserId == userId && !cu.IsDeleted)
            .OrderBy(cu => cu.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyUser>> GetAllByCompanyIdAsync(int companyId)
    {
        return await _dbSet
            .Include(cu => cu.User)
            .Where(cu => cu.CompanyId == companyId && !cu.IsDeleted)
            .OrderBy(cu => cu.User != null ? cu.User.LastName : null)
            .ThenBy(cu => cu.User != null ? cu.User.FirstName : null)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyUser>> GetDraftByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(cu => cu.Company)
            .Where(cu => cu.UserId == userId && cu.Status == ContractStatusEnum.Draft && !cu.IsDeleted)
            .OrderBy(cu => cu.Company != null ? cu.Company.Name : null)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyUser>> GetDraftByCompanyIdAsync(int companyId)
    {
        return await _dbSet
            .Include(cu => cu.User)
            .Where(cu => cu.CompanyId == companyId && cu.Status == ContractStatusEnum.Draft && !cu.IsDeleted)
            .OrderBy(cu => cu.User != null ? cu.User.LastName : null)
            .ThenBy(cu => cu.User != null ? cu.User.FirstName : null)
            .ToListAsync();
    }
}
