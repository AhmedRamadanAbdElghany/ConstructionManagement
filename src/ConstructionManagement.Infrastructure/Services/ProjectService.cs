using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly IRepository<Project> _projectRepository;
    private readonly IRepository<UserRole> _userRoleRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<ProjectSettings> _settingsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProjectService(
        IRepository<Project> projectRepository,
        IRepository<UserRole> userRoleRepository,
        IRepository<User> userRepository,
        IRepository<ProjectSettings> settingsRepository,
        IUnitOfWork unitOfWork)
    {
        _projectRepository = projectRepository;
        _userRoleRepository = userRoleRepository;
        _userRepository = userRepository;
        _settingsRepository = settingsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> CreateProjectAsync(CreateProjectRequest request, int ownerUserId)
    {
        // Validate General Manager if provided
        if (request.GeneralManagerUserId.HasValue &&
            !await _userRepository.ExistsAsync(request.GeneralManagerUserId.Value))
        {
            throw new InvalidOperationException("المدير العام المحدد غير موجود في النظام.");
        }

        // Validate dates
        if (request.EndDate.HasValue && request.EndDate < request.StartDate)
        {
            throw new InvalidOperationException("تاريخ نهاية المشروع لا يمكن أن يكون قبل تاريخ البداية.");
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var owner = await _userRepository.GetByIdAsync(ownerUserId);
            var project = new Project
            {
                ProjectName = request.ProjectName,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                OwnerUserId = ownerUserId,
                GeneralManagerUserId = request.GeneralManagerUserId,
                CompanyId = owner?.CompanyId,
                AccountingSystem = Enum.TryParse<CalculationMethod>(request.AccountingSystem, true, out var parsedMethod) ? parsedMethod : CalculationMethod.Measured,
                TotalContractValue = request.TotalContractValue,
                IsClosed = false
            };

            await _projectRepository.AddAsync(project);
            await _unitOfWork.SaveChangesAsync(); // Get project.Id

            // Create project settings
            var settings = new ProjectSettings { Id = project.Id };
            
            if (request.Settings != null)
            {
                settings.EnableDelayNotification = request.Settings.EnableDelayNotification;
                settings.DelayNotificationIsOneTimeOnly = request.Settings.DelayNotificationIsOneTimeOnly;
                settings.DelayNotificationIntervalDays = request.Settings.DelayNotificationIntervalDays;
                settings.DelayNotificationSendEmail = request.Settings.DelayNotificationSendEmail;
                settings.DelayGracePeriodDays = request.Settings.DelayGracePeriodDays;
                settings.EnablePhotoUpload = request.Settings.EnablePhotoUpload;
                settings.RequirePhotoReview = request.Settings.RequirePhotoReview;
                settings.PhotoApproverRole = request.Settings.PhotoApproverRole;
                settings.EnableInvoiceReview = request.Settings.EnableInvoiceReview;
                settings.EnableInvoiceAggregation = request.Settings.EnableInvoiceAggregation;
                settings.MaxPhotosPerUpload = request.Settings.MaxPhotosPerUpload;
                settings.ClientCanSeeFinancials = request.Settings.ClientCanSeeFinancials;
                settings.ClientCanSeeMedia = request.Settings.ClientCanSeeMedia;
                settings.ClientCanSeeBOQ = request.Settings.ClientCanSeeBOQ;
                settings.AllowAddProgressEntry = request.Settings.AllowAddProgressEntry;
                settings.AllowReopenClosedDay = request.Settings.AllowReopenClosedDay;
                settings.AutoCloseDay = request.Settings.AutoCloseDay;
                settings.AutoCloseDayTime = request.Settings.AutoCloseDayTime;

                if (!string.IsNullOrEmpty(request.Settings.MoneyCalculationMethod) && 
                    Enum.TryParse<CalculationMethod>(request.Settings.MoneyCalculationMethod, true, out var method))
                {
                    settings.MoneyCalculationMethod = method;
                }
            }

            await _settingsRepository.AddAsync(settings);
            await _unitOfWork.SaveChangesAsync();

            await _unitOfWork.CommitAsync();
            return project.Id;
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> UpdateProjectAsync(int projectId, UpdateProjectRequest request, int currentUserId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null) return false;

        if (project.IsClosed)
            throw new InvalidOperationException("لا يمكن تعديل البيانات لأن المشروع مغلق.");

        if (!await HasAdminPermissionAsync(currentUserId, projectId))
            throw new UnauthorizedAccessException("ليس لديك صلاحية لتعديل بيانات هذا المشروع.");

        if (request.GeneralManagerUserId.HasValue &&
            !await _userRepository.ExistsAsync(request.GeneralManagerUserId.Value))
            throw new InvalidOperationException("المدير العام الجديد غير موجود.");

        // Update only provided fields
        if (request.ProjectName != null) project.ProjectName = request.ProjectName;
        if (request.Description != null) project.Description = request.Description;
        if (request.GeneralManagerUserId != null) project.GeneralManagerUserId = request.GeneralManagerUserId;
        if (request.TotalContractValue != null) project.TotalContractValue = request.TotalContractValue;

        await _projectRepository.UpdateAsync(project);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CloseProjectAsync(int projectId, int currentUserId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null || project.IsClosed) return false;

        if (!await HasAdminPermissionAsync(currentUserId, projectId))
            throw new UnauthorizedAccessException("ليس لديك صلاحية لإغلاق هذا المشروع.");

        project.IsClosed = true;
        project.ClosedAt = DateTime.UtcNow;
        project.ClosedByUserId = currentUserId;

        await _projectRepository.UpdateAsync(project);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(int projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        return project == null ? null : MapToDto(project);
    }

    public async Task<List<ProjectDto>> GetProjectsByUserAsync(int userId)
    {
        var projects = await _projectRepository.AsQueryable()
            .Where(p => p.OwnerUserId == userId ||
                        p.GeneralManagerUserId == userId ||
                        p.TeamMembers.Any(tm => tm.UserId == userId))  // ← FIXED: ProjectTeam → TeamMembers
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return projects.Select(MapToDto).ToList();
    }

    private async Task<bool> HasAdminPermissionAsync(int userId, int projectId)
    {
        // System-level admin check
        var isSystemAdmin = await _userRoleRepository.AsQueryable()
            .AnyAsync(ur => ur.UserId == userId &&
                           (ur.Role.Name == "SuperAdmin" || ur.Role.Name == "CompanyAdmin"));

        if (isSystemAdmin) return true;

        // Project-level check: owner, GM, or ProjectAdmin role in team
        return await _projectRepository.AsQueryable()
            .AnyAsync(p => p.Id == projectId &&
                          (p.OwnerUserId == userId ||
                           p.GeneralManagerUserId == userId ||
                           p.TeamMembers.Any(tm => tm.UserId == userId &&  // ← FIXED: ProjectTeam → TeamMembers
                                               tm.ProjectTeamRoles.Any(ptr => ptr.ProjectRole.Name == "ProjectAdmin"))));
    }

    private ProjectDto MapToDto(Project p) => new ProjectDto(
        p.Id,
        p.ProjectName,
        p.Description,
        p.StartDate,
        p.EndDate,
        p.OwnerUserId,
        p.GeneralManagerUserId,
        p.AccountingSystem.ToString(),
        p.TotalContractValue,
        p.CreatedAt,
        p.IsClosed,
        p.ClosedAt
    );
}
