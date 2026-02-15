using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.CompanyRequest;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class CompanyRequestService : ICompanyRequestService
{
    private readonly ICompanyRequestRepository _companyRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IRepository<CompanySettings> _companySettingsRepository;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly IRepository<Permission> _permissionRepository;
    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<RolePermission> _rolePermissionRepository;
    private readonly IRepository<UserRole> _userRoleRepository;
    private readonly IUnitOfWork _uow;

    public CompanyRequestService(
        ICompanyRequestRepository companyRequestRepository,
        IUserRepository userRepository,
        ICompanyRepository companyRepository,
        IRepository<CompanySettings> companySettingsRepository,
        INotificationService notificationService,
        IEmailService emailService,
        IRepository<Permission> permissionRepository,
        IRepository<Role> roleRepository,
        IRepository<RolePermission> rolePermissionRepository,
        IRepository<UserRole> userRoleRepository,
        IUnitOfWork uow)
    {
        _companyRequestRepository = companyRequestRepository;
        _userRepository = userRepository;
        _companyRepository = companyRepository;
        _companySettingsRepository = companySettingsRepository;
        _notificationService = notificationService;
        _emailService = emailService;
        _permissionRepository = permissionRepository;
        _roleRepository = roleRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _userRoleRepository = userRoleRepository;
        _uow = uow;
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

    public async Task<CompanyRequestDto> ApproveRequestAsync(int id, int? reviewedByUserId, ApproveCompanyRequestDto? dto = null)
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

        var config = dto?.Config;

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

        if (config != null)
        {
            company.EnableUserManagement = config.EnableUserManagement;
            company.EnableProjectManagement = config.EnableProjectManagement;
            company.EnableBOQManagement = config.EnableBOQManagement;
            company.EnableDailyLogs = config.EnableDailyLogs;
            company.EnableSiteMedia = config.EnableSiteMedia;
            company.EnableEquipmentManagement = config.EnableEquipmentManagement;
            company.EnableInventoryManagement = config.EnableInventoryManagement;
            company.EnableQualityControl = config.EnableQualityControl;
            company.EnableSafetyManagement = config.EnableSafetyManagement;
            company.EnableSubcontractorManagement = config.EnableSubcontractorManagement;
            company.EnableFinancialManagement = config.EnableFinancialManagement;
            company.EnableAnalytics = config.EnableAnalytics;
            company.EnableNotifications = config.EnableNotifications;
            company.EnableDocumentManagement = config.EnableDocumentManagement;
            company.EnableDesignManagement = config.EnableDesignManagement;
            company.EnableClientPortal = config.EnableClientPortal;
            company.EnableAccessControl = config.EnableAccessControl;
            company.EnableHRManagement = config.EnableHRManagement;
            company.EnableVendorManagement = config.EnableVendorManagement;
        }

        await _companyRepository.AddAsync(company);
        await _uow.SaveChangesAsync();

        // Create CompanySettings
        var settings = new CompanySettings { CompanyId = company.Id };
        
        if (config != null)
        {
            settings.EnableDelayNotification = config.EnableDelayNotification;
            settings.EnablePhotoUpload = config.EnablePhotoUpload;
            settings.RequirePhotoReview = config.RequirePhotoReview;
            settings.ClientCanSeeFinancials = config.ClientCanSeeFinancials;
            settings.AllowMeasured = config.AllowMeasured;
            settings.AllowSupervision = config.AllowSupervision;
            settings.AllowPackages = config.AllowPackages;
            settings.AllowLocations = config.AllowLocations;
            settings.AllowHR = config.AllowHR;

            settings.RequireMaterialRequestApproval = config.RequireMaterialRequestApproval;
            settings.MaterialRequestApproverRole = config.MaterialRequestApproverRole;
            settings.EnableMultiWarehouse = config.EnableMultiWarehouse;
            settings.EnableStockAlerts = config.EnableStockAlerts;
            settings.DefaultLowStockThreshold = config.DefaultLowStockThreshold;

            settings.EnableEquipmentMaintenanceScheduling = config.EnableEquipmentMaintenanceScheduling;
            settings.EnableEquipmentUtilizationTracking = config.EnableEquipmentUtilizationTracking;
            settings.EnableEquipmentGpsTracking = config.EnableEquipmentGpsTracking;
            settings.EnableEquipmentRentalBilling = config.EnableEquipmentRentalBilling;
            settings.EquipmentMaintenanceAlertThreshold = config.EquipmentMaintenanceAlertThreshold;

            settings.AllowAddProgressEntry = config.AllowAddProgressEntry;
            settings.AllowReopenClosedDay = config.AllowReopenClosedDay;
            settings.AutoCloseDay = config.AutoCloseDay;

            settings.EnableInvoiceReview = config.EnableInvoiceReview;
            settings.ClientCanSeeMedia = config.ClientCanSeeMedia;
            settings.ClientCanSeeBOQ = config.ClientCanSeeBOQ;
        }

        await _companySettingsRepository.AddAsync(settings);
        await _uow.SaveChangesAsync();

        // Seed Permissions and Admin Role
        await SyncCompanyPermissions(company.Id, config ?? new UpdateCompanyRequest
        {
            AllowMeasured = true,
            AllowSupervision = true,
            EnableDelayNotification = true,
            EnablePhotoUpload = true,
            RequirePhotoReview = true
        });
        await _uow.SaveChangesAsync();

        // Update user to be Company Admin of the new company
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user != null)
        {
            user.CompanyId = company.Id;
            user.UserType = Domain.Enums.UserType.CompanyOwner;

            // IMPORTANT: Do NOT call user.UserRoles.Clear() — that wipes ALL existing roles
            // (including SuperAdmin, roles from other companies, etc.).
            // Instead, only add the new CompanyAdmin role for this company.
            var adminRole = await _roleRepository.AsQueryable()
                .FirstOrDefaultAsync(r => r.CompanyId == company.Id && r.Name == "CompanyAdmin");

            if (adminRole != null && !user.UserRoles.Any(ur => ur.RoleId == adminRole.Id))
            {
                user.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = adminRole.Id,
                    CompanyId = company.Id,
                    AssignedAt = DateTime.UtcNow
                });
            }
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

    private async Task SyncCompanyPermissions(int companyId, UpdateCompanyRequest request)
    {
        var definitions = new List<(bool Enabled, string Name, string Desc)>
        {
            (true, "Project.View", "Access to view project dashboard"),
            (true, "Project.Edit", "Ability to edit project basic information"),
            (true, "User.Manage", "Ability to create and manage company roles and users"),
            (request.AllowMeasured, "Finance.Measured", "Access to measured BOQ items"),
            (request.AllowSupervision, "Finance.Supervision", "Access to supervision BOQ items"),
            (request.AllowPackages, "Finance.Packages", "Access to lump sum package billing"),
            (request.AllowLocations, "Operations.Locations", "Access to site locations and mapping"),
            (request.AllowHR, "Operations.HR", "Access to human resources management"),
            (request.EnableDelayNotification, "Operations.Delays", "Ability to manage project delays"),
            (request.RequirePhotoReview || request.EnablePhotoUpload, "Operations.Media", "Ability to manage site media"),
            (request.ClientCanSeeFinancials, "Client.Financials", "Access to view financial data in client portal")
        };

        var existingPerms = await _permissionRepository.AsQueryable()
            .Where(p => p.CompanyId == companyId)
            .ToListAsync();

        foreach (var def in definitions)
        {
            var p = existingPerms.FirstOrDefault(x => x.Name == def.Name);
            if (def.Enabled && p == null)
            {
                p = new Permission { Name = def.Name, Description = def.Desc, CompanyId = companyId };
                await _permissionRepository.AddAsync(p);
            }
            else if (!def.Enabled && p != null)
            {
                await _permissionRepository.DeleteAsync(p);
            }
        }

        var adminRole = await _roleRepository.AsQueryable()
            .FirstOrDefaultAsync(r => r.CompanyId == companyId && r.Name == "CompanyAdmin");
        
        if (adminRole == null)
        {
            adminRole = new Role { Name = "CompanyAdmin", Description = "Full organizational control", CompanyId = companyId };
            await _roleRepository.AddAsync(adminRole);
            await _uow.SaveChangesAsync();
        }

        var currentRolePerms = await _rolePermissionRepository.AsQueryable()
            .Where(rp => rp.RoleId == adminRole.Id)
            .ToListAsync();

        var allCompanyPerms = await _permissionRepository.AsQueryable()
            .Where(p => p.CompanyId == companyId)
            .ToListAsync();

        foreach (var cp in allCompanyPerms)
        {
            if (!currentRolePerms.Any(rp => rp.PermissionId == cp.Id))
            {
                await _rolePermissionRepository.AddAsync(new RolePermission { RoleId = adminRole.Id, PermissionId = cp.Id, CompanyId = companyId });
            }
        }

        foreach (var rp in currentRolePerms)
        {
            if (!allCompanyPerms.Any(cp => cp.Id == rp.PermissionId))
            {
                await _rolePermissionRepository.DeleteAsync(rp);
            }
        }
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
