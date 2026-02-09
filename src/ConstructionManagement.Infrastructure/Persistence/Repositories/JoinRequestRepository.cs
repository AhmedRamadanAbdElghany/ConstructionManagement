using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories;

public class JoinRequestRepository : IJoinRequestRepository
{
    private readonly ApplicationDbContext _context;

    public JoinRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<JoinRequest?> GetByIdAsync(int id)
    {
        return await _context.JoinRequests
            .Include(jr => jr.User)
            .Include(jr => jr.Company)
            .Include(jr => jr.ReviewedBy)
            .FirstOrDefaultAsync(jr => jr.Id == id);
    }

    public async Task<JoinRequest?> GetByUserIdAndCompanyIdAsync(int userId, int companyId)
    {
        return await _context.JoinRequests
            .Include(jr => jr.User)
            .Include(jr => jr.Company)
            .Where(jr => jr.UserId == userId && jr.CompanyId == companyId)
            .OrderByDescending(jr => jr.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<JoinRequest>> GetAllAsync()
    {
        return await _context.JoinRequests
            .Include(jr => jr.User)
            .Include(jr => jr.Company)
            .Include(jr => jr.ReviewedBy)
            .OrderByDescending(jr => jr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<JoinRequest>> GetPendingRequestsByCompanyIdAsync(int companyId)
    {
        return await _context.JoinRequests
            .Include(jr => jr.User)
            .Include(jr => jr.Company)
            .Include(jr => jr.ReviewedBy)
            .Where(jr => jr.CompanyId == companyId && jr.Status == "Pending")
            .OrderByDescending(jr => jr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<JoinRequest>> GetPendingRequestsForUserAsync(int userId)
    {
        return await _context.JoinRequests
            .Include(jr => jr.Company)
            .Where(jr => jr.UserId == userId && jr.Status == "Pending")
            .OrderByDescending(jr => jr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<JoinRequest>> GetByUserIdAsync(int userId)
    {
        return await _context.JoinRequests
            .Include(jr => jr.Company)
            .Include(jr => jr.ReviewedBy)
            .Where(jr => jr.UserId == userId)
            .OrderByDescending(jr => jr.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<JoinRequest>> GetByStatusAsync(string status)
    {
        return await _context.JoinRequests
            .Include(jr => jr.User)
            .Include(jr => jr.Company)
            .Include(jr => jr.ReviewedBy)
            .Where(jr => jr.Status == status)
            .OrderByDescending(jr => jr.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(JoinRequest request)
    {
        await _context.JoinRequests.AddAsync(request);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(JoinRequest request)
    {
        _context.JoinRequests.Update(request);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var request = await _context.JoinRequests.FindAsync(id);
        if (request == null)
            return false;

        _context.JoinRequests.Remove(request);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsPendingByUserIdAndCompanyIdAsync(int userId, int companyId)
    {
        return await _context.JoinRequests
            .AnyAsync(jr => jr.UserId == userId && jr.CompanyId == companyId && jr.Status == "Pending");
    }
}
