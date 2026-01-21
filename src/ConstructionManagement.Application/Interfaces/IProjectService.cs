// Application/Interfaces/IProjectService.cs
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IProjectService
{
    Task<int> CreateProjectAsync(CreateProjectRequest request, int ownerUserId);
    Task<ProjectDto?> GetProjectByIdAsync(int projectId);
    Task<List<ProjectDto>> GetProjectsByUserAsync(int userId);
    Task<bool> UpdateProjectAsync(int projectId, UpdateProjectRequest request, int currentUserId);
    Task<bool> CloseProjectAsync(int projectId, int currentUserId);
}