// Infrastructure/Persistence/Repositories/Interfaces/ICompanyUserRepository.cs
using ConstructionManagement.Domain.Entities;

// Alias to avoid conflict with nested ContractStatus in SubcontractorContract
using ContractStatusEnum = ConstructionManagement.Domain.Enums.ContractStatus;

namespace ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

public interface ICompanyUserRepository : IRepository<CompanyUser>
{
    /// <summary>
    /// Get all company-user relationships for a specific user
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetByUserIdAsync(int userId);

    /// <summary>
    /// Get all company-user relationships for a specific company
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetByCompanyIdAsync(int companyId);

    /// <summary>
    /// Get a specific company-user relationship by user and company IDs
    /// </summary>
    Task<CompanyUser?> GetByUserAndCompanyAsync(int userId, int companyId);

    /// <summary>
    /// Get all active company-user relationships for a user
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetActiveByUserIdAsync(int userId);

    /// <summary>
    /// Get all active company-user relationships for a company
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetActiveByCompanyIdAsync(int companyId);

    /// <summary>
    /// Get users by company and role
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetByCompanyAndRoleAsync(int companyId, string role);

    /// <summary>
    /// Get users by company and status
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetByCompanyAndStatusAsync(int companyId, ContractStatusEnum status);


    /// <summary>
    /// Check if a user is associated with a company
    /// </summary>
    Task<bool> IsUserAssociatedWithCompanyAsync(int userId, int companyId);

    /// <summary>
    /// Update contract status
    /// </summary>
    Task UpdateStatusAsync(int id, ContractStatusEnum status, string? terminationReason = null);

    /// <summary>
    /// Get all company-user relationships for a user including Draft status
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetAllByUserIdAsync(int userId);

    /// <summary>
    /// Get all company-user relationships for a company including Draft status
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetAllByCompanyIdAsync(int companyId);

    /// <summary>
    /// Get Draft company-user relationships for a user
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetDraftByUserIdAsync(int userId);

    /// <summary>
    /// Get Draft company-user relationships for a company
    /// </summary>
    Task<IEnumerable<CompanyUser>> GetDraftByCompanyIdAsync(int companyId);
}
