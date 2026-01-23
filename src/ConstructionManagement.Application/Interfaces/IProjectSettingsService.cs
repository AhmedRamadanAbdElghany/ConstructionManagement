using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IProjectSettingsService
    {
        Task<ProjectSettingsDto> GetSettingsAsync(int projectId);
        Task UpdateSettingsAsync(int projectId, UpdateProjectSettingsRequest request, int userId);
    }
}
