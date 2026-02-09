using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces;

public interface ICompanyRequestRepository
{
    Task<CompanyRequest?> GetByIdAsync(int id);
    Task<CompanyRequest?> GetByUserIdAsync(int userId);
    Task<IEnumerable<CompanyRequest>> GetAllAsync();
    Task<IEnumerable<CompanyRequest>> GetPendingRequestsAsync();
    Task<IEnumerable<CompanyRequest>> GetByStatusAsync(string status);
    Task AddAsync(CompanyRequest request);
    Task UpdateAsync(CompanyRequest request);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsByUserIdAsync(int userId);
}
