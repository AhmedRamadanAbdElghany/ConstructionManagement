using ConstructionManagement.Application.DTOs.CompanyRequest;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;

namespace ConstructionManagement.Infrastructure.Services;

public class CompanyRequestService : ICompanyRequestService
{
    private readonly ICompanyRequestRepository _companyRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IRepository<CompanySettings> _companySettingsRepository;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;

    public CompanyRequestService(
        ICompanyRequestRepository companyRequestRepository,
        IUserRepository userRepository,
        ICompanyRepository companyRepository,
        IRepository<CompanySettings> companySettingsRepository,
        INotificationService notificationService,
        IEmailService emailService)
    {
        _companyRequestRepository = companyRequestRepository;
        _userRepository = userRepository;
        _companyRepository = companyRepository;
        _companySettingsRepository = companySettingsRepository;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task<CompanyRequestDto> CreateRequestAsync(int? userId, CreateCompanyRequestDto dto)
    {
        if (userId == null)
        {
            throw new ArgumentException("User ID is required.");
        }

        // Check if user already has a pending request
        if (await _companyRequestRepository.ExistsByUserIdAsync(userId.Value))
        {
            throw new InvalidOperationException("You already have a pending company request.");
        }

        var request = new CompanyRequest
        {
            UserId = userId.Value,
            CompanyName = dto.CompanyName,
            BusinessId = dto.BusinessId,
            ContactEmail = dto.ContactEmail,
            ContactPhone = dto.ContactPhone,
            Address = dto.Address,
            Notes = dto.Notes,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _companyRequestRepository.AddAsync(request);

        // Find Super Admin to notify
        var superAdmins = await _userRepository.GetUsersByRoleAsync("SuperAdmin");
        foreach (var admin in superAdmins)
        {
            await _notificationService.NotifyNewCompanyRequestAsync(admin.Id, dto.CompanyName, request.Id);
        }

        return MapToDto(request);
    }

    public async Task<CompanyRequestDto?> GetByIdAsync(int id)
    {
        var request = await _companyRequestRepository.GetByIdAsync(id);
        return request != null ? MapToDto(request) : null;
    }

    public async Task<IEnumerable<CompanyRequestDto>> GetAllRequestsAsync()
    {
        var requests = await _companyRequestRepository.GetAllAsync();
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<CompanyRequestDto>> GetPendingRequestsAsync()
    {
        var requests = await _companyRequestRepository.GetPendingRequestsAsync();
        return requests.Select(MapToDto);
    }

    public async Task<CompanyRequestDto?> GetMyRequestAsync(int? userId)
    {
        if (userId == null)
        {
            return null;
        }

        var request = await _companyRequestRepository.GetByUserIdAsync(userId.Value);
        return request != null ? MapToDto(request) : null;
    }

    public async Task<CompanyRequestDto> ApproveRequestAsync(int id, int? reviewedByUserId)
    {
        if (reviewedByUserId == null)
        {
            throw new ArgumentException("Reviewer User ID is required.");
        }

        var request = await _companyRequestRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Company request not found.");

        if (request.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending requests can be approved.");
        }

        // Create the company
        var company = new Company
        {
            Name = request.CompanyName,
            BusinessId = request.BusinessId,
            ContactEmail = request.ContactEmail ?? request.User.Email,
            ContactPhone = request.ContactPhone,
            Address = request.Address,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _companyRepository.AddAsync(company);

        // Create default CompanySettings for the new company
        var settings = new CompanySettings { CompanyId = company.Id };
        await _companySettingsRepository.AddAsync(settings);

        // Update user to be Company Admin of the new company
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user != null)
        {
            user.CompanyId = company.Id;
            user.UserRoles.Clear();
            user.UserRoles.Add(new UserRole
            {
                RoleId = 2, // Assuming 2 is CompanyAdmin role
                AssignedAt = DateTime.UtcNow
            });
            await _userRepository.UpdateAsync(user);
        }

        // Update request status
        request.Status = "Approved";
        request.ReviewedByUserId = reviewedByUserId.Value;
        request.ReviewedAt = DateTime.UtcNow;
        await _companyRequestRepository.UpdateAsync(request);

        // Send notifications
        await _notificationService.NotifyCompanyRequestApprovedAsync(request.UserId, request.CompanyName);
        await _emailService.SendCompanyRequestApprovedAsync(request.User.Email, request.CompanyName);

        return MapToDto(request);
    }

    public async Task<CompanyRequestDto> RejectRequestAsync(int id, RejectCompanyRequestDto dto)
    {
        var request = await _companyRequestRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Company request not found.");

        if (request.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending requests can be rejected.");
        }

        request.Status = "Rejected";
        request.RejectionReason = dto.RejectionReason;
        request.ReviewedByUserId = dto.ReviewedByUserId ?? 0;
        request.ReviewedAt = DateTime.UtcNow;
        await _companyRequestRepository.UpdateAsync(request);

        // Send notifications
        await _notificationService.NotifyCompanyRequestRejectedAsync(request.UserId, dto.RejectionReason);
        await _emailService.SendCompanyRequestRejectedAsync(request.User.Email, dto.RejectionReason);

        return MapToDto(request);
    }

    public async Task<bool> DeleteRequestAsync(int id)
    {
        return await _companyRequestRepository.DeleteAsync(id);
    }

    public async Task<int> GetPendingCountAsync()
    {
        var requests = await _companyRequestRepository.GetPendingRequestsAsync();
        return requests.Count();
    }

    private static CompanyRequestDto MapToDto(CompanyRequest request)
    {
        return new CompanyRequestDto
        {
            Id = request.Id,
            UserId = request.UserId,
            UserFullName = request.User?.FullName ?? string.Empty,
            UserEmail = request.User?.Email ?? string.Empty,
            CompanyName = request.CompanyName,
            BusinessId = request.BusinessId,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Address = request.Address,
            Status = request.Status,
            RejectionReason = request.RejectionReason,
            ReviewedByUserId = request.ReviewedByUserId,
            ReviewedByFullName = request.ReviewedBy?.FullName,
            ReviewedAt = request.ReviewedAt,
            CreatedAt = request.CreatedAt,
            Notes = request.Notes
        };
    }
}
