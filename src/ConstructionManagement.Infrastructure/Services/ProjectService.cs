using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

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
            var project = new Project
            {
                ProjectName = request.ProjectName,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                OwnerUserId = ownerUserId,
                GeneralManagerUserId = request.GeneralManagerUserId,
                AccountingSystem = request.AccountingSystem ?? "Mixed",
                TotalContractValue = request.TotalContractValue,
                IsClosed = false
            };

            await _projectRepository.AddAsync(project);
            await _unitOfWork.SaveChangesAsync(); // Get project.Id

            // Create default settings (shared PK = project.Id)
            await _settingsRepository.AddAsync(new ProjectSettings { Id = project.Id });
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
                           (ur.Role.Name == "SuperAdmin" || ur.Role.Name == "ProjectAdmin"));

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
        p.AccountingSystem,
        p.TotalContractValue,
        p.CreatedAt,
        p.IsClosed,
        p.ClosedAt
    );
}