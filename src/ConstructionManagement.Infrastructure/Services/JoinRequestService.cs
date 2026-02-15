using ConstructionManagement.Application.DTOs.JoinRequest;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

public class JoinRequestService : IJoinRequestService
{
    private readonly IJoinRequestRepository _joinRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;

    public JoinRequestService(
        IJoinRequestRepository joinRequestRepository,
        IUserRepository userRepository,
        ICompanyRepository companyRepository,
        INotificationService notificationService,
        IEmailService emailService)
    {
        _joinRequestRepository = joinRequestRepository;
        _userRepository = userRepository;
        _companyRepository = companyRepository;
        _notificationService = notificationService;
        _emailService = emailService;
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
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user != null)
        {
            user.CompanyId = request.CompanyId;

            // Map RequestedRole to UserType if provided
            if (!string.IsNullOrEmpty(request.RequestedRole))
            {
                user.UserType = request.RequestedRole switch
                {
                    "Worker" => Domain.Enums.UserType.Worker,
                    "InventoryOwner" => Domain.Enums.UserType.InventoryOwner,
                    "Engineer" => Domain.Enums.UserType.Engineer,
                    "NormalUser" => Domain.Enums.UserType.NormalUser,
                    _ => user.UserType // Keep current if unknown
                };
            }

            user.UserRoles.Clear();
            user.UserRoles.Add(new UserRole
            {
                RoleId = 3, // Assuming 3 is CompanyUser role
                AssignedAt = DateTime.UtcNow
            });
            await _userRepository.UpdateAsync(user);
        }

        // Update request status
        request.Status = "Approved";
        request.ReviewedByUserId = reviewedByUserId.Value;
        request.ReviewedAt = DateTime.UtcNow;
        await _joinRequestRepository.UpdateAsync(request);

        // Send notifications
        var company = await _companyRepository.GetByIdAsync(request.CompanyId);
        await _notificationService.NotifyJoinRequestApprovedAsync(request.UserId, company?.Name ?? "the company");
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
        var user = await _userRepository.GetByIdAsync(request.UserId);
        await _notificationService.NotifyJoinRequestRejectedAsync(request.UserId, dto.RejectionReason);
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
            UserId = request.UserId,
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
