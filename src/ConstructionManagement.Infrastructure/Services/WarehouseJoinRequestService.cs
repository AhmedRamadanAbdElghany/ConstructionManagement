using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class WarehouseJoinRequestService : IWarehouseJoinRequestService
{
    private readonly IRepository<WarehouseJoinRequest> _requestRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Company> _companyRepository;
    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<UserRole> _userRoleRepository;
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;

    public WarehouseJoinRequestService(
        IRepository<WarehouseJoinRequest> requestRepository,
        IRepository<User> userRepository,
        IRepository<Company> companyRepository,
        IRepository<Role> roleRepository,
        IRepository<UserRole> userRoleRepository,
        INotificationService notificationService,
        IUnitOfWork unitOfWork)
    {
        _requestRepository = requestRepository;
        _userRepository = userRepository;
        _companyRepository = companyRepository;
        _roleRepository = roleRepository;
        _userRoleRepository = userRoleRepository;
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<WarehouseJoinRequestDto> CreateRequestAsync(int userId, CreateWarehouseJoinRequestDto dto)
    {
        // Check if user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        // Check if company exists
        var company = await _companyRepository.GetByIdAsync(dto.CompanyId);
        if (company == null || !company.IsActive)
            throw new KeyNotFoundException("Company not found or inactive.");

        // Check if user already has a company
        if (user.CompanyId.HasValue)
            throw new InvalidOperationException("User already belongs to a company.");

        // Check if there's already a pending request
        var existingRequest = await _requestRepository.AsQueryable()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.CompanyId == dto.CompanyId && r.Status == "Pending");
        
        if (existingRequest != null)
            throw new InvalidOperationException("You already have a pending request to this company.");

        var request = new WarehouseJoinRequest
        {
            UserId = userId,
            CompanyId = dto.CompanyId,
            Message = dto.Message,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _requestRepository.AddAsync(request);
        await _unitOfWork.SaveChangesAsync();

        // Notify company owner/admin
        var companyAdmins = await _userRoleRepository.AsQueryable()
            .Include(ur => ur.User)
            .Where(ur => ur.CompanyId == dto.CompanyId && ur.Role.Name == "CompanyAdmin")
            .Select(ur => ur.User)
            .ToListAsync();

        // Also get the owner (InventoryOwner or CompanyOwner)
        var owner = await _userRepository.AsQueryable()
            .FirstOrDefaultAsync(u => u.CompanyId == dto.CompanyId && 
                (u.UserType == UserType.CompanyOwner || u.UserType == UserType.InventoryOwner));

        if (owner != null && !companyAdmins.Any(a => a.Id == owner.Id))
        {
            companyAdmins.Add(owner);
        }

        foreach (var admin in companyAdmins)
        {
            await _notificationService.CreateAndSendAsync(
                admin.Id,
                "New Join Request",
                $"User {user.FullName} has requested to join your company.",
                $"/warehouse/requests/{request.Id}",
                NotificationType.General
            );
        }

        return await MapToDto(request);
    }

    public async Task<IEnumerable<WarehouseJoinRequestDto>> GetPendingRequestsAsync(int companyId, int requesterUserId)
    {
        await ValidateCompanyAccess(companyId, requesterUserId);

        var requests = await _requestRepository.AsQueryable()
            .Include(r => r.User)
            .Include(r => r.Company)
            .Include(r => r.Role)
            .Where(r => r.CompanyId == companyId && r.Status == "Pending")
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(MapToDtoSync);
    }

    public async Task<IEnumerable<WarehouseJoinRequestDto>> GetAllRequestsAsync(int companyId, int requesterUserId)
    {
        await ValidateCompanyAccess(companyId, requesterUserId);

        var requests = await _requestRepository.AsQueryable()
            .Include(r => r.User)
            .Include(r => r.Company)
            .Include(r => r.Role)
            .Where(r => r.CompanyId == companyId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(MapToDtoSync);
    }

    public async Task<IEnumerable<WarehouseJoinRequestDto>> GetMyRequestsAsync(int userId)
    {
        var requests = await _requestRepository.AsQueryable()
            .Include(r => r.User)
            .Include(r => r.Company)
            .Include(r => r.Role)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(MapToDtoSync);
    }

    public async Task<WarehouseJoinRequestDto> ReviewRequestAsync(int requestId, int reviewerUserId, ReviewWarehouseJoinRequestDto dto)
    {
        var request = await _requestRepository.AsQueryable()
            .Include(r => r.User)
            .Include(r => r.Company)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null)
            throw new KeyNotFoundException("Request not found.");

        if (request.Status != "Pending")
            throw new InvalidOperationException("This request has already been processed.");

        await ValidateCompanyAccess(request.CompanyId, reviewerUserId);

        var reviewer = await _userRepository.GetByIdAsync(reviewerUserId);
        
        if (dto.Approve)
        {
            // Validate role if provided
            if (dto.RoleId.HasValue)
            {
                var role = await _roleRepository.GetByIdAsync(dto.RoleId.Value);
                if (role == null || role.CompanyId != request.CompanyId)
                    throw new InvalidOperationException("Invalid role for this company.");
            }

            request.Status = "Approved";
            request.RoleId = dto.RoleId;
            request.ReviewedByUserId = reviewerUserId;
            request.ReviewedAt = DateTime.UtcNow;

            // Update user's company
            var user = request.User;
            user.CompanyId = request.CompanyId;

            // Assign role if provided
            if (dto.RoleId.HasValue)
            {
                await _userRoleRepository.AddAsync(new UserRole
                {
                    UserId = user.Id,
                    RoleId = dto.RoleId.Value,
                    CompanyId = request.CompanyId,
                    AssignedAt = DateTime.UtcNow
                });
            }

            await _userRepository.UpdateAsync(user);
            await _notificationService.CreateAndSendAsync(
                user.Id,
                "Join Request Approved",
                $"Your request to join {request.Company.Name} has been approved!",
                $"/warehouse/requests/{request.Id}",
                NotificationType.General
            );
        }
        else
        {
            request.Status = "Rejected";
            request.RejectionReason = dto.RejectionReason;
            request.ReviewedByUserId = reviewerUserId;
            request.ReviewedAt = DateTime.UtcNow;

            await _notificationService.CreateAndSendAsync(
                request.UserId,
                "Join Request Rejected",
                $"Your request to join {request.Company.Name} has been rejected.",
                $"/warehouse/requests/{request.Id}",
                NotificationType.General
            );
        }

        await _requestRepository.UpdateAsync(request);
        await _unitOfWork.SaveChangesAsync();

        return await MapToDto(request);
    }

    public async Task<WarehouseJoinRequestDto?> GetByIdAsync(int requestId)
    {
        var request = await _requestRepository.AsQueryable()
            .Include(r => r.User)
            .Include(r => r.Company)
            .Include(r => r.Role)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        return request != null ? MapToDtoSync(request) : null;
    }

    public async Task<bool> CancelRequestAsync(int requestId, int userId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request == null)
            return false;

        if (request.UserId != userId)
            throw new UnauthorizedAccessException("You can only cancel your own requests.");

        if (request.Status != "Pending")
            throw new InvalidOperationException("Only pending requests can be cancelled.");

        request.Status = "Cancelled";
        await _requestRepository.UpdateAsync(request);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    private async Task ValidateCompanyAccess(int companyId, int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException();

        // Check if user is company owner, inventory owner, or company admin
        bool hasAccess = false;

        if (user.CompanyId == companyId && 
            (user.UserType == UserType.CompanyOwner || user.UserType == UserType.InventoryOwner))
        {
            hasAccess = true;
        }
        else if (user.CompanyId == companyId)
        {
            // Check if user is CompanyAdmin
            hasAccess = await _userRoleRepository.AsQueryable()
                .AnyAsync(ur => ur.UserId == userId && ur.CompanyId == companyId && ur.Role.Name == "CompanyAdmin");
        }

        if (!hasAccess)
            throw new UnauthorizedAccessException("You don't have access to this company's requests.");
    }

    private async Task<WarehouseJoinRequestDto> MapToDto(WarehouseJoinRequest request)
    {
        var reviewer = request.ReviewedByUserId.HasValue 
            ? await _userRepository.GetByIdAsync(request.ReviewedByUserId.Value) 
            : null;

        return new WarehouseJoinRequestDto
        {
            Id = request.Id,
            UserId = request.UserId,
            UserFullName = request.User?.FullName ?? string.Empty,
            UserEmail = request.User?.Email ?? string.Empty,
            CompanyId = request.CompanyId,
            CompanyName = request.Company?.Name ?? string.Empty,
            Status = request.Status,
            RoleId = request.RoleId,
            RoleName = request.Role?.Name,
            Message = request.Message,
            RejectionReason = request.RejectionReason,
            ReviewedByUserId = request.ReviewedByUserId,
            ReviewedByFullName = reviewer?.FullName,
            ReviewedAt = request.ReviewedAt,
            CreatedAt = request.CreatedAt
        };
    }

    private static WarehouseJoinRequestDto MapToDtoSync(WarehouseJoinRequest request)
    {
        return new WarehouseJoinRequestDto
        {
            Id = request.Id,
            UserId = request.UserId,
            UserFullName = request.User?.FullName ?? string.Empty,
            UserEmail = request.User?.Email ?? string.Empty,
            CompanyId = request.CompanyId,
            CompanyName = request.Company?.Name ?? string.Empty,
            Status = request.Status,
            RoleId = request.RoleId,
            RoleName = request.Role?.Name,
            Message = request.Message,
            RejectionReason = request.RejectionReason,
            ReviewedByUserId = request.ReviewedByUserId,
            ReviewedByFullName = request.ReviewedByUser?.FullName,
            ReviewedAt = request.ReviewedAt,
            CreatedAt = request.CreatedAt
        };
    }
}
