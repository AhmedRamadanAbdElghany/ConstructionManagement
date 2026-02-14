using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.WebApi.Controllers;

[Authorize(Roles = "SuperAdmin")]
[ApiController]
[Route("api/admin/companies")]
public class CompaniesController : ControllerBase
{
    private readonly IRepository<Company> _companyRepo;
    private readonly IRepository<CompanySettings> _settingsRepo;
    private readonly IRepository<Permission> _permissionRepo;
    private readonly IRepository<Role> _roleRepo;
    private readonly IRepository<RolePermission> _rolePermissionRepo;
    private readonly IRepository<User> _userRepo;
    private readonly IRepository<UserRole> _userRoleRepo;
    private readonly IUnitOfWork _uow;

    public CompaniesController(
        IRepository<Company> companyRepo, 
        IRepository<CompanySettings> settingsRepo, 
        IRepository<Permission> permissionRepo,
        IRepository<Role> roleRepo,
        IRepository<RolePermission> rolePermissionRepo,
        IRepository<User> userRepo,
        IRepository<UserRole> userRoleRepo,
        IUnitOfWork uow)
    {
        _companyRepo = companyRepo;
        _settingsRepo = settingsRepo;
        _permissionRepo = permissionRepo;
        _roleRepo = roleRepo;
        _rolePermissionRepo = rolePermissionRepo;
        _userRepo = userRepo;
        _userRoleRepo = userRoleRepo;
        _uow = uow;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyRequest request)
    {
        var company = new Company
        {
            Name = request.Name,
            PackageId = request.PackageId,
            IsActive = true,

            EnableUserManagement = request.EnableUserManagement,
            EnableProjectManagement = request.EnableProjectManagement,
            EnableBOQManagement = request.EnableBOQManagement,
            EnableDailyLogs = request.EnableDailyLogs,
            EnableSiteMedia = request.EnableSiteMedia,
            EnableEquipmentManagement = request.EnableEquipmentManagement,
            EnableInventoryManagement = request.EnableInventoryManagement,
            EnableQualityControl = request.EnableQualityControl,
            EnableSafetyManagement = request.EnableSafetyManagement,
            EnableSubcontractorManagement = request.EnableSubcontractorManagement,
            EnableFinancialManagement = request.EnableFinancialManagement,
            EnableAnalytics = request.EnableAnalytics,
            EnableNotifications = request.EnableNotifications,
            EnableDocumentManagement = request.EnableDocumentManagement,
            EnableDesignManagement = request.EnableDesignManagement,
            EnableClientPortal = request.EnableClientPortal,
            EnableAccessControl = request.EnableAccessControl,
            EnableHRManagement = request.EnableHRManagement,
            EnableVendorManagement = request.EnableVendorManagement
        };
        
        await _companyRepo.AddAsync(company);
        await _uow.SaveChangesAsync();
        
        // Initial settings for the company
        var settings = new CompanySettings
        {
            CompanyId = company.Id,
            EnableDelayNotification = request.EnableDelayNotification,
            EnablePhotoUpload = request.EnablePhotoUpload,
            RequirePhotoReview = request.RequirePhotoReview,
            ClientCanSeeFinancials = request.ClientCanSeeFinancials,
            AllowMeasured = request.AllowMeasured,
            AllowSupervision = request.AllowSupervision,
            AllowPackages = request.AllowPackages,
            AllowLocations = request.AllowLocations,
            AllowHR = request.AllowHR,
            
            // Fixed Defaults as per requirements
            RequireInvoiceApproval = request.EnableInvoiceReview,
            InvoiceApproverRole = request.InvoiceApproverRole,
            EnableVendorInvoiceUpload = request.EnableVendorInvoiceUpload,
            EnableCashVoucher = request.EnableCashVoucher,
            RequireCashVoucherApproval = request.RequireCashVoucherApproval,
            CashVoucherApproverRole = request.CashVoucherApproverRole,
            CashVoucherSubmitterRole = request.CashVoucherSubmitterRole,
            RecordCashVoucherToWorker = request.RecordCashVoucherToWorker,
            
            // Fixed Defaults as per requirements
            DelayNotificationIntervalDays = 7,
            DelayGracePeriodDays = 3,
            PhotoApproverRole = "MediaReviewer",
            DefaultMoneyCalculationMethod = request.AllowMeasured ? 
                ConstructionManagement.Domain.Enums.CalculationMethod.Measured : 
                (request.AllowSupervision ? ConstructionManagement.Domain.Enums.CalculationMethod.Supervision : ConstructionManagement.Domain.Enums.CalculationMethod.Packages)
        };
        await _settingsRepo.AddAsync(settings);
        await _uow.SaveChangesAsync();

        // Seed Company-Specific Permissions & Admin Role
        await SyncCompanyPermissions(company.Id, request);
        await _uow.SaveChangesAsync();

        // Create Company Admin User
        var nameParts = request.AdminName.Split(' ', 2);
        var adminUser = new User
        {
            FirstName = nameParts[0],
            LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            Email = request.AdminEmail,
            Username = request.AdminEmail, // Using email as username for simplicity
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Construction@2026"), // Standard default password
            CompanyId = company.Id,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.AddAsync(adminUser);
        await _uow.SaveChangesAsync();

        // Assign CompanyAdmin Role to the new User
        var adminRole = await _roleRepo.AsQueryable()
            .FirstOrDefaultAsync(r => r.CompanyId == company.Id && r.Name == "CompanyAdmin");

        if (adminRole != null)
        {
            await _userRoleRepo.AddAsync(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id,
                CompanyId = company.Id,
                AssignedAt = DateTime.UtcNow
            });
            await _uow.SaveChangesAsync();
        }
        
        return Ok(company);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companies = await _companyRepo.AsQueryable()
            .Include(c => c.Settings)
            .ToListAsync();
        return Ok(companies);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var company = await _companyRepo.AsQueryable()
            .Include(c => c.Settings)
            .FirstOrDefaultAsync(c => c.Id == id);
            
        if (company == null) return NotFound();
        return Ok(company);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCompanyRequest request)
    {
        var company = await _companyRepo.AsQueryable()
            .Include(c => c.Settings)
            .FirstOrDefaultAsync(c => c.Id == id);
            
        if (company == null) return NotFound();

        company.Name = request.Name;
        company.PackageId = request.PackageId;
        company.IsActive = request.IsActive;

        company.EnableUserManagement = request.EnableUserManagement;
        company.EnableProjectManagement = request.EnableProjectManagement;
        company.EnableBOQManagement = request.EnableBOQManagement;
        company.EnableDailyLogs = request.EnableDailyLogs;
        company.EnableSiteMedia = request.EnableSiteMedia;
        company.EnableEquipmentManagement = request.EnableEquipmentManagement;
        company.EnableInventoryManagement = request.EnableInventoryManagement;
        company.EnableQualityControl = request.EnableQualityControl;
        company.EnableSafetyManagement = request.EnableSafetyManagement;
        company.EnableSubcontractorManagement = request.EnableSubcontractorManagement;
        company.EnableFinancialManagement = request.EnableFinancialManagement;
        company.EnableAnalytics = request.EnableAnalytics;
        company.EnableNotifications = request.EnableNotifications;
        company.EnableDocumentManagement = request.EnableDocumentManagement;
        company.EnableDesignManagement = request.EnableDesignManagement;
        company.EnableClientPortal = request.EnableClientPortal;
        company.EnableAccessControl = request.EnableAccessControl;
        company.EnableHRManagement = request.EnableHRManagement;
        company.EnableVendorManagement = request.EnableVendorManagement;

        if (company.Settings == null)
        {
            company.Settings = new CompanySettings { CompanyId = company.Id };
            await _settingsRepo.AddAsync(company.Settings);
        }

        company.Settings.EnableDelayNotification = request.EnableDelayNotification;
        company.Settings.EnablePhotoUpload = request.EnablePhotoUpload;
        company.Settings.RequirePhotoReview = request.RequirePhotoReview;
        company.Settings.ClientCanSeeFinancials = request.ClientCanSeeFinancials;
        company.Settings.AllowMeasured = request.AllowMeasured;
        company.Settings.AllowSupervision = request.AllowSupervision;
        company.Settings.AllowPackages = request.AllowPackages;
        company.Settings.AllowLocations = request.AllowLocations;
        company.Settings.AllowHR = request.AllowHR;

        // Inventory Configuration
        company.Settings.RequireMaterialRequestApproval = request.RequireMaterialRequestApproval;
        company.Settings.MaterialRequestApproverRole = request.MaterialRequestApproverRole;
        company.Settings.EnableMultiWarehouse = request.EnableMultiWarehouse;
        company.Settings.EnableStockAlerts = request.EnableStockAlerts;
        company.Settings.DefaultLowStockThreshold = request.DefaultLowStockThreshold;

        // Equipment Configuration
        company.Settings.EnableEquipmentMaintenanceScheduling = request.EnableEquipmentMaintenanceScheduling;
        company.Settings.EnableEquipmentUtilizationTracking = request.EnableEquipmentUtilizationTracking;
        company.Settings.EnableEquipmentGpsTracking = request.EnableEquipmentGpsTracking;
        company.Settings.EnableEquipmentRentalBilling = request.EnableEquipmentRentalBilling;
        company.Settings.EquipmentMaintenanceAlertThreshold = request.EquipmentMaintenanceAlertThreshold;

        // Daily Log Policy
        company.Settings.AllowAddProgressEntry = request.AllowAddProgressEntry;
        company.Settings.AllowReopenClosedDay = request.AllowReopenClosedDay;
        company.Settings.AutoCloseDay = request.AutoCloseDay;

        // Reviews & Visibility
        company.Settings.EnableInvoiceReview = request.EnableInvoiceReview;
        company.Settings.InvoiceApproverRole = request.InvoiceApproverRole;
        company.Settings.EnableVendorInvoiceUpload = request.EnableVendorInvoiceUpload;
        
        company.Settings.EnableCashVoucher = request.EnableCashVoucher;
        company.Settings.RequireCashVoucherApproval = request.RequireCashVoucherApproval;
        company.Settings.CashVoucherApproverRole = request.CashVoucherApproverRole;
        company.Settings.CashVoucherSubmitterRole = request.CashVoucherSubmitterRole;
        company.Settings.RecordCashVoucherToWorker = request.RecordCashVoucherToWorker;

        company.Settings.ClientCanSeeMedia = request.ClientCanSeeMedia;
        company.Settings.ClientCanSeeBOQ = request.ClientCanSeeBOQ;

        // Sync permissions on update
        await SyncCompanyPermissions(company.Id, new CreateCompanyRequest 
        { 
            AllowMeasured = request.AllowMeasured,
            AllowSupervision = request.AllowSupervision,
            AllowPackages = request.AllowPackages,
            AllowLocations = request.AllowLocations,
            AllowHR = request.AllowHR,
            EnableDelayNotification = request.EnableDelayNotification,
            EnablePhotoUpload = request.EnablePhotoUpload,
            RequirePhotoReview = request.RequirePhotoReview,
            ClientCanSeeFinancials = request.ClientCanSeeFinancials
        });

        await _uow.SaveChangesAsync();

        return Ok(company);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var company = await _companyRepo.GetByIdAsync(id);
        if (company == null) return NotFound();

        await _companyRepo.DeleteAsync(company);
        await _uow.SaveChangesAsync();

        return Ok(new { Message = "Company deleted successfully" });
    }

    private async Task SyncCompanyPermissions(int companyId, CreateCompanyRequest request)
    {
        // 1. Define required permissions based on active features
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

        // 2. Sync Permission Table
        var existingPerms = await _permissionRepo.AsQueryable()
            .Where(p => p.CompanyId == companyId)
            .ToListAsync();

        foreach (var def in definitions)
        {
            var p = existingPerms.FirstOrDefault(x => x.Name == def.Name);
            if (def.Enabled && p == null)
            {
                p = new Permission { Name = def.Name, Description = def.Desc, CompanyId = companyId };
                await _permissionRepo.AddAsync(p);
            }
            else if (!def.Enabled && p != null)
            {
                await _permissionRepo.DeleteAsync(p);
            }
        }
        await _uow.SaveChangesAsync();

        // 3. Ensure CompanyAdmin Role exists
        var adminRole = await _roleRepo.AsQueryable()
            .FirstOrDefaultAsync(r => r.CompanyId == companyId && r.Name == "CompanyAdmin");
        
        if (adminRole == null)
        {
            adminRole = new Role { Name = "CompanyAdmin", Description = "Full organizational control", CompanyId = companyId };
            await _roleRepo.AddAsync(adminRole);
            await _uow.SaveChangesAsync();
        }

        // 4. Sync CompanyAdmin Role Permissions
        var currentRolePerms = await _rolePermissionRepo.AsQueryable()
            .Where(rp => rp.RoleId == adminRole.Id)
            .ToListAsync();

        var allCompanyPerms = await _permissionRepo.AsQueryable()
            .Where(p => p.CompanyId == companyId)
            .ToListAsync();

        // Add missing assignments
        foreach (var cp in allCompanyPerms)
        {
            if (!currentRolePerms.Any(rp => rp.PermissionId == cp.Id))
            {
                await _rolePermissionRepo.AddAsync(new RolePermission { RoleId = adminRole.Id, PermissionId = cp.Id, CompanyId = companyId });
            }
        }

        // Remove assignments for deleted/disabled permissions
        foreach (var rp in currentRolePerms)
        {
            if (!allCompanyPerms.Any(cp => cp.Id == rp.PermissionId))
            {
                await _rolePermissionRepo.DeleteAsync(rp);
            }
        }
    }
}
