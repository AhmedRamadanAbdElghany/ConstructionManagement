using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service interface for managing company-user relationships
/// </summary>
public interface ICompanyUserService
{
    /// <summary>
    /// Update the status of a company-user relationship
    /// </summary>
    Task<bool> UpdateStatusAsync(int companyUserId, string status, int requestedByUserId);

    /// <summary>
    /// Get all company-user relationships for a user (including Draft)
    /// </summary>
    Task<IEnumerable<CompanyUserDetailsDto>> GetAllByUserIdAsync(int userId);

    /// <summary>
    /// Get all company-user relationships for a company (including Draft)
    /// </summary>
    Task<IEnumerable<CompanyUserDetailsDto>> GetAllByCompanyIdAsync(int companyId);

    /// <summary>
    /// Get draft company-user relationships for a user
    /// </summary>
    Task<IEnumerable<CompanyUserDetailsDto>> GetDraftByUserIdAsync(int userId);

    /// <summary>
    /// Get draft company-user relationships for a company
    /// </summary>
    Task<IEnumerable<CompanyUserDetailsDto>> GetDraftByCompanyIdAsync(int companyId);

    /// <summary>
    /// Get a specific company-user relationship
    /// </summary>
    Task<CompanyUserDetailsDto?> GetByIdAsync(int companyUserId);
}
