using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services
{
    public class ProjectTeamService : IProjectTeamService
    {
        private readonly IRepository<ProjectTeamMember> _teamRepository;
        private readonly IRepository<ProjectRole> _roleRepository;
        private readonly IRepository<ProjectTeamRole> _teamRoleRepository;
        private readonly IRepository<User> _userRepository;
        private readonly IActivityLogService _activityLogService;
        private readonly IUnitOfWork _unitOfWork;

        public ProjectTeamService(
            IRepository<ProjectTeamMember> teamRepository,
            IRepository<ProjectRole> roleRepository,
            IRepository<ProjectTeamRole> teamRoleRepository,
            IRepository<User> userRepository,
            IActivityLogService activityLogService,
            IUnitOfWork unitOfWork)
        {
            _teamRepository = teamRepository;
            _roleRepository = roleRepository;
            _teamRoleRepository = teamRoleRepository;
            _userRepository = userRepository;
            _activityLogService = activityLogService;
            _unitOfWork = unitOfWork;
        }

        public async Task<int> AddTeamMemberAsync(int projectId, int userId, int? reportsToUserId)
        {
            if (!await _userRepository.ExistsAsync(userId))
                throw new InvalidOperationException("المستخدم غير موجود");

            if (userId == reportsToUserId)
                throw new InvalidOperationException("لا يمكن للمستخدم أن يرفع تقاريره لنفسه");

            var alreadyExists = await _teamRepository.AsQueryable()
                .AnyAsync(t => t.ProjectId == projectId && t.UserId == userId);

            if (alreadyExists)
                throw new InvalidOperationException("هذا المستخدم عضو بالفعل في فريق عمل المشروع");

            var member = new ProjectTeamMember
            {
                ProjectId = projectId,
                UserId = userId,
                ReportsToUserId = reportsToUserId,
                CreatedAt = DateTime.UtcNow
            };

            await _teamRepository.AddAsync(member);
            
            var user = await _userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                await _activityLogService.LogActivityAsync(
                    projectId, 
                    "Team", 
                    "Member Joined", 
                    $"{user.FirstName} {user.LastName} was added to the project team.", 
                    0 // System/Admin action
                );
            }

            await _unitOfWork.SaveChangesAsync(); // حفظ التغييرات

            return member.Id;
        }

        public async Task AssignRoleToMemberAsync(int teamId, int projectRoleId)
        {
            var alreadyHasRole = await _teamRoleRepository.AsQueryable()
                .AnyAsync(tr => tr.ProjectTeamMemberId == teamId && tr.ProjectRoleId == projectRoleId);

            if (alreadyHasRole) return;

            var assignment = new ProjectTeamRole
            {
                ProjectTeamMemberId = teamId,
                ProjectRoleId = projectRoleId,
                AssignedAt = DateTime.UtcNow
            };

            await _teamRoleRepository.AddAsync(assignment);
            await _unitOfWork.SaveChangesAsync(); // حفظ التغييرات
        }

        public async Task<int> CreateProjectRoleAsync(int projectId, string roleName, string? description)
        {
            var role = new ProjectRole
            {
                ProjectId = projectId,
                Name = roleName,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };

            await _roleRepository.AddAsync(role);
            await _unitOfWork.SaveChangesAsync(); // حفظ التغييرات

            return role.Id;
        }

        // ميثودات الجلب (Get) لا تحتاج SaveChanges لأنها Read-Only
        public async Task<List<ProjectTeamDto>> GetProjectTeamAsync(int projectId)
        {
            var teams = await _teamRepository.AsQueryable()
                .Where(t => t.ProjectId == projectId)
                .Include(t => t.User)
                .Include(t => t.ProjectTeamRoles)
                    .ThenInclude(ptr => ptr.ProjectRole)
                .ToListAsync();

            return teams.Select(t => new ProjectTeamDto
            {
                TeamID = t.Id,
                UserID = t.UserId,
                UserFullName = t.User?.FullName ?? "غير معروف",
                ReportsToUserID = t.ReportsToUserId,
                Roles = t.ProjectTeamRoles.Select(ptr => ptr.ProjectRole.Name).ToList()
            }).ToList();
        }

        public async Task<List<WorkerWithProjectsDto>> GetAllWorkersWithRolesAsync()
        {
            var teamMembers = await _teamRepository.AsQueryable()
                .Include(t => t.User)
                .Include(t => t.Project)
                .Include(t => t.ProjectTeamRoles)
                    .ThenInclude(ptr => ptr.ProjectRole)
                .ToListAsync();

            return teamMembers
                .GroupBy(t => t.UserId)
                .Select(g => new WorkerWithProjectsDto(
                    g.Key,
                    g.First().User?.FullName ?? "غير معروف",
                    g.First().User?.Email ?? "",
                    g.Select(t => new WorkerProjectRoleDto(
                        t.ProjectId,
                        t.Project?.ProjectName ?? "بدون اسم",
                        t.ProjectTeamRoles.Select(ptr => ptr.ProjectRole.Name).ToList(),
                        t.CreatedAt
                    )).ToList()
                )).ToList();
        }

        public async Task<List<ProjectRoleDto>> GetProjectRolesAsync(int projectId)
        {
            var roles = await _roleRepository.AsQueryable()
                .Where(r => r.ProjectId == projectId)
                .ToListAsync();

            return roles.Select(r => new ProjectRoleDto
            {
                ProjectRoleID = r.Id,
                Name = r.Name,
                Description = r.Description
            }).ToList();
        }
    }
}
