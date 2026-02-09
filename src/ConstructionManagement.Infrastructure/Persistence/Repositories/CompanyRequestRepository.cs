using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class CompanyRequestRepository : ICompanyRequestRepository
{
    private readonly ApplicationDbContext _context;

    public CompanyRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CompanyRequest?> GetByIdAsync(int id)
    {
        return await _context.CompanyRequests
            .Include(cr => cr.User)
            .Include(cr => cr.ReviewedBy)
            .FirstOrDefaultAsync(cr => cr.Id == id);
    }

    public async Task<CompanyRequest?> GetByUserIdAsync(int userId)
    {
        return await _context.CompanyRequests
            .Include(cr => cr.User)
            .Include(cr => cr.ReviewedBy)
            .Where(cr => cr.UserId == userId)
            .OrderByDescending(cr => cr.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<CompanyRequest>> GetAllAsync()
    {
        return await _context.CompanyRequests
            .Include(cr => cr.User)
            .Include(cr => cr.ReviewedBy)
            .OrderByDescending(cr => cr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyRequest>> GetPendingRequestsAsync()
    {
        return await _context.CompanyRequests
            .Include(cr => cr.User)
            .Include(cr => cr.ReviewedBy)
            .Where(cr => cr.Status == "Pending")
            .OrderByDescending(cr => cr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<CompanyRequest>> GetByStatusAsync(string status)
    {
        return await _context.CompanyRequests
            .Include(cr => cr.User)
            .Include(cr => cr.ReviewedBy)
            .Where(cr => cr.Status == status)
            .OrderByDescending(cr => cr.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(CompanyRequest request)
    {
        await _context.CompanyRequests.AddAsync(request);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(CompanyRequest request)
    {
        _context.CompanyRequests.Update(request);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var request = await _context.CompanyRequests.FindAsync(id);
        if (request == null)
            return false;

        _context.CompanyRequests.Remove(request);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsByUserIdAsync(int userId)
    {
        return await _context.CompanyRequests
            .AnyAsync(cr => cr.UserId == userId && cr.Status == "Pending");
    }
}
