using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service implementation for managing company-user relationships
/// </summary>
public class CompanyUserService : ICompanyUserService
{
    private readonly ICompanyUserRepository _companyUserRepository;
    private readonly ICurrentUserService _currentUserService;

    public CompanyUserService(
        ICompanyUserRepository companyUserRepository,
        ICurrentUserService currentUserService)
    {
        _companyUserRepository = companyUserRepository;
        _currentUserService = currentUserService;
    }

    public async Task<bool> UpdateStatusAsync(int companyUserId, string status, int requestedByUserId)
    {
        var companyUser = await _companyUserRepository.GetByIdAsync(companyUserId);
        if (companyUser == null)
            return false;

        // Parse the status string to enum
        if (!Enum.TryParse<ContractStatus>(status, true, out var newStatus))
            return false;

        // Validate the status transition
        if (!IsValidStatusTransition(companyUser.Status, newStatus))
            return false;

        // Check permissions:
        // 1. User can change their own company association status (user side)
        // 2. Company admin can change any user's status in their company
        var hasPermission = await HasPermissionToChangeStatusAsync(companyUserId, requestedByUserId);
        if (!hasPermission)
            return false;

        await _companyUserRepository.UpdateStatusAsync(companyUserId, newStatus);
        return true;
    }

    public async Task<IEnumerable<CompanyUserDetailsDto>> GetAllByUserIdAsync(int userId)
    {
        var companyUsers = await _companyUserRepository.GetAllByUserIdAsync(userId);
        return companyUsers.Select(MapToDetailsDto);
    }

    public async Task<IEnumerable<CompanyUserDetailsDto>> GetAllByCompanyIdAsync(int companyId)
    {
        var companyUsers = await _companyUserRepository.GetAllByCompanyIdAsync(companyId);
        return companyUsers.Select(MapToDetailsDto);
    }

    public async Task<IEnumerable<CompanyUserDetailsDto>> GetDraftByUserIdAsync(int userId)
    {
        var companyUsers = await _companyUserRepository.GetDraftByUserIdAsync(userId);
        return companyUsers.Select(MapToDetailsDto);
    }

    public async Task<IEnumerable<CompanyUserDetailsDto>> GetDraftByCompanyIdAsync(int companyId)
    {
        var companyUsers = await _companyUserRepository.GetDraftByCompanyIdAsync(companyId);
        return companyUsers.Select(MapToDetailsDto);
    }

    public async Task<CompanyUserDetailsDto?> GetByIdAsync(int companyUserId)
    {
        var companyUser = await _companyUserRepository.GetByIdAsync(companyUserId);
        return companyUser == null ? null : MapToDetailsDto(companyUser);
    }

    private bool IsValidStatusTransition(ContractStatus currentStatus, ContractStatus newStatus)
    {
        // Allow transitions to/from Draft
        return currentStatus != newStatus;
    }

    private async Task<bool> HasPermissionToChangeStatusAsync(int companyUserId, int requestedByUserId)
    {
        var companyUser = await _companyUserRepository.GetByIdAsync(companyUserId);
        if (companyUser == null)
            return false;

        // User can always change their own company association
        if (companyUser.UserId == requestedByUserId)
            return true;

        // Check if the requester is a company admin for this company
        var requesterAssociations = await _companyUserRepository.GetByUserIdAsync(requestedByUserId);
        var requesterAssociation = requesterAssociations.FirstOrDefault(cu => cu.CompanyId == companyUser.CompanyId);

        if (requesterAssociation != null && requesterAssociation.Role == "CompanyAdmin")
            return true;

        return false;
    }

    private CompanyUserDetailsDto MapToDetailsDto(Domain.Entities.CompanyUser cu)
    {
        return new CompanyUserDetailsDto
        {
            Id = cu.Id,
            UserId = cu.UserId,
            UserFullName = cu.User?.FullName ?? string.Empty,
            UserEmail = cu.User?.Email ?? string.Empty,
            CompanyId = cu.CompanyId,
            CompanyName = cu.Company?.Name ?? string.Empty,
            Role = cu.Role,
            Status = cu.Status.ToString(),
            IsPrimary = cu.IsPrimary,
            ContractStartDate = cu.ContractStartDate,
            ContractEndDate = cu.ContractEndDate,
            JoinedAt = cu.JoinedAt,
            TerminatedAt = cu.TerminatedAt,
            TerminationReason = cu.TerminationReason
        };
    }
}
