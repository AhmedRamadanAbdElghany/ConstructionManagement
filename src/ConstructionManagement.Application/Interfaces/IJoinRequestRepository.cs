using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces;

public interface IJoinRequestRepository
{
    Task<JoinRequest?> GetByIdAsync(int id);
    Task<JoinRequest?> GetByUserIdAndCompanyIdAsync(int userId, int companyId);
    Task<IEnumerable<JoinRequest>> GetAllAsync();
    Task<IEnumerable<JoinRequest>> GetPendingRequestsByCompanyIdAsync(int companyId);
    Task<IEnumerable<JoinRequest>> GetPendingRequestsForUserAsync(int userId);
    Task<IEnumerable<JoinRequest>> GetByUserIdAsync(int userId);
    Task<IEnumerable<JoinRequest>> GetByStatusAsync(string status);
    Task AddAsync(JoinRequest request);
    Task UpdateAsync(JoinRequest request);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsPendingByUserIdAndCompanyIdAsync(int userId, int companyId);
}
