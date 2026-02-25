using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.Interfaces;

public interface IProjectItemService
{
    Task<int> CreateProjectItemAsync(int projectId, CreateProjectItemRequest request, int userId);
    Task<ProjectItemDto?> GetProjectItemWithProgressAsync(int itemId);
    Task<IEnumerable<ProjectItemDto>> GetProjectItemsAsync(int projectId);
    Task UpdateProjectItemAsync(int projectId, int itemId, UpdateProjectItemRequest request);
    Task DeleteProjectItemAsync(int projectId, int itemId);
    
    // Workflow methods
    Task ConfirmPreStartAsync(int itemId, int userId, string? notes);
    Task AuthorizeForcedStartAsync(int itemId, int userId, string reason);
    Task StartProjectItemAsync(int itemId, int userId);
    Task CompleteProjectItemAsync(int itemId, int userId);
    Task UpdateWorkflowStatusAsync(int itemId, ProjectItemWorkflowStatus status);
}
