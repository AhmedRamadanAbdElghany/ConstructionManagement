using ConstructionManagement.Application.DTOs.JoinRequest;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class JoinRequestService : IJoinRequestService
{
    private readonly IJoinRequestRepository _joinRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly IRepository<Role> _roleRepository;

    public JoinRequestService(
        IJoinRequestRepository joinRequestRepository,
        IUserRepository userRepository,
        ICompanyRepository companyRepository,
        INotificationService notificationService,
        IEmailService emailService,
        IRepository<Role> roleRepository)
    {
        _joinRequestRepository = joinRequestRepository;
        _userRepository = userRepository;
        _companyRepository = companyRepository;
        _notificationService = notificationService;
        _emailService = emailService;
        _roleRepository = roleRepository;
    }

    public async Task<JoinRequestDto> CreateRequestAsync(int? userId, CreateJoinRequestDto dto)
    {
        if (userId == null)
        {
            throw new ArgumentException("User ID is required.");
        }

        // Check if user already has a pending request for this company
        if (await _joinRequestRepository.ExistsPendingByUserIdAndCompanyIdAsync(userId.Value, dto.CompanyId))
        {
            throw new InvalidOperationException("You already have a pending request to join this company.");
        }

        // Check if user is already part of the company
        var user = await _userRepository.GetByIdAsync(userId.Value);
        if (user != null && user.CompanyId == dto.CompanyId)
        {
            throw new InvalidOperationException("You are already part of this company.");
        }

        var request = new JoinRequest
        {
            UserId = userId.Value,
            CompanyId = dto.CompanyId,
            Message = dto.Message,
            RequestedRole = dto.RequestedRole ?? "NormalUser",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _joinRequestRepository.AddAsync(request);

        // Notify Company Admin
        var companyAdmins = await _userRepository.GetUsersByCompanyIdAndRoleAsync(dto.CompanyId, "CompanyAdmin");
        foreach (var admin in companyAdmins)
        {
            await _notificationService.NotifyNewJoinRequestAsync(admin.Id, user?.FullName ?? "A user", request.Id);
        }

        return MapToDto(request);
    }

    public async Task<JoinRequestDto?> GetByIdAsync(int id)
    {
        var request = await _joinRequestRepository.GetByIdAsync(id);
        return request != null ? MapToDto(request) : null;
    }

    public async Task<IEnumerable<JoinRequestDto>> GetAllRequestsAsync()
    {
        var requests = await _joinRequestRepository.GetAllAsync();
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<JoinRequestDto>> GetPendingRequestsForCompanyAsync(int companyId)
    {
        var requests = await _joinRequestRepository.GetPendingRequestsByCompanyIdAsync(companyId);
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<JoinRequestDto>> GetMyRequestsAsync(int? userId)
    {
        if (userId == null)
        {
            return Enumerable.Empty<JoinRequestDto>();
        }

        var requests = await _joinRequestRepository.GetByUserIdAsync(userId.Value);
        return requests.Select(MapToDto);
    }

    public async Task<JoinRequestDto> ApproveRequestAsync(int id, int? reviewedByUserId)
    {
        if (reviewedByUserId == null)
        {
            throw new ArgumentException("Reviewer User ID is required.");
        }

        var request = await _joinRequestRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Join request not found.");

        if (request.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending requests can be approved.");
        }

        // Add user to company
        var user = await _userRepository.GetByIdAsync(request.UserId ?? 0);
        if (user != null)
        {
            user.CompanyId = request.CompanyId;

            // IMPORTANT: Do NOT change user.UserType here.
            // UserType is set at registration and is immutable.
            // The join request approval only assigns the user to the company.

            // Determine the appropriate role name based on the user's existing UserType
            var roleName = user.UserType switch
            {
                Domain.Enums.UserType.Worker => "CompanyUser",
                Domain.Enums.UserType.Engineer => "CompanyUser",
                Domain.Enums.UserType.InventoryOwner => "CompanyUser",
                Domain.Enums.UserType.NormalUser => "User",
                _ => "User"
            };

            // Look up role by name instead of using hardcoded IDs
            var role = await _roleRepository.AsQueryable()
                .FirstOrDefaultAsync(r => r.Name == roleName && r.CompanyId == null);

            if (role != null && !user.UserRoles.Any(ur => ur.RoleId == role.Id))
            {
                user.UserRoles.Add(new UserRole
                {
                    RoleId = role.Id,
                    AssignedAt = DateTime.UtcNow
                });
            }
            await _userRepository.UpdateAsync(user);
        }

        // Update request status
        request.Status = "Approved";
        request.ReviewedByUserId = reviewedByUserId.Value;
        request.ReviewedAt = DateTime.UtcNow;
        await _joinRequestRepository.UpdateAsync(request);

        // Send notifications
        var company = await _companyRepository.GetByIdAsync(request.CompanyId);
        await _notificationService.NotifyJoinRequestApprovedAsync(request.UserId ?? 0, company?.Name ?? "the company");
        await _emailService.SendJoinRequestApprovedAsync(user?.Email ?? "", company?.Name ?? "the company");

        return MapToDto(request);
    }

    public async Task<JoinRequestDto> RejectRequestAsync(int id, RejectJoinRequestDto dto)
    {
        var request = await _joinRequestRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Join request not found.");

        if (request.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending requests can be rejected.");
        }

        request.Status = "Rejected";
        request.RejectionReason = dto.RejectionReason;
        request.ReviewedByUserId = dto.ReviewedByUserId ?? 0;
        request.ReviewedAt = DateTime.UtcNow;
        await _joinRequestRepository.UpdateAsync(request);

        // Send notifications
        var user = await _userRepository.GetByIdAsync(request.UserId ?? 0);
        await _notificationService.NotifyJoinRequestRejectedAsync(request.UserId ?? 0, dto.RejectionReason);
        await _emailService.SendJoinRequestRejectedAsync(user?.Email ?? "", dto.RejectionReason);

        return MapToDto(request);
    }

    public async Task<bool> DeleteRequestAsync(int id)
    {
        return await _joinRequestRepository.DeleteAsync(id);
    }

    public async Task<int> GetPendingCountForCompanyAsync(int companyId)
    {
        var requests = await _joinRequestRepository.GetPendingRequestsByCompanyIdAsync(companyId);
        return requests.Count();
    }

    private static JoinRequestDto MapToDto(JoinRequest request)
    {
        return new JoinRequestDto
        {
            Id = request.Id,
            UserId = request.UserId ?? 0,
            UserFullName = request.User?.FullName ?? string.Empty,
            UserEmail = request.User?.Email ?? string.Empty,
            CompanyId = request.CompanyId,
            CompanyName = request.Company?.Name ?? string.Empty,
            Status = request.Status,
            RejectionReason = request.RejectionReason,
            ReviewedByUserId = request.ReviewedByUserId,
            ReviewedByFullName = request.ReviewedBy?.FullName,
            ReviewedAt = request.ReviewedAt,
            CreatedAt = request.CreatedAt,
            Message = request.Message,
            RequestedRole = request.RequestedRole
        };
    }
}
