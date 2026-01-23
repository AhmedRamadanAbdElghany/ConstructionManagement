using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IProjectTeamService
    {
        // إضافة شخص للمشروع
        Task<int> AddTeamMemberAsync(int projectId, int userId, int? reportsToUserId);

        // إضافة دور (role) لشخص في المشروع
        Task AssignRoleToMemberAsync(int teamId, int projectRoleId);

        // إنشاء دور جديد في المشروع
        Task<int> CreateProjectRoleAsync(int projectId, string roleName, string? description);

        // جلب كل الأشخاص في المشروع مع أدوارهم
        Task<List<ProjectTeamDto>> GetProjectTeamAsync(int projectId);

        // جلب الأدوار المتاحة في المشروع
        Task<List<ProjectRoleDto>> GetProjectRolesAsync(int projectId);

        /// <summary>
        /// Get all workers across all projects with their roles per project
        /// </summary>
        Task<List<WorkerWithProjectsDto>> GetAllWorkersWithRolesAsync();
    }
}
