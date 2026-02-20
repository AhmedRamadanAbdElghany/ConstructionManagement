// Application/Interfaces/IProjectItemService.cs
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IProjectItemService
{
    Task<int> CreateProjectItemAsync(int projectId, CreateProjectItemRequest request, int userId);
    Task<ProjectItemDto?> GetProjectItemWithProgressAsync(int itemId);
    Task<IEnumerable<ProjectItemDto>> GetProjectItemsAsync(int projectId);
    Task UpdateProjectItemAsync(int projectId, int itemId, UpdateProjectItemRequest request);
    Task DeleteProjectItemAsync(int projectId, int itemId);
}
