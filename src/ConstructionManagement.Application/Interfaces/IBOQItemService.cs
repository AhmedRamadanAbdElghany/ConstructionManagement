// Application/Interfaces/IBOQItemService.cs
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces;

public interface IBOQItemService
{
    Task<int> CreateBOQItemAsync(int projectId, CreateBOQItemRequest request, int userId);
    Task<BOQItemDto?> GetBOQItemWithProgressAsync(int itemId);
    Task<IEnumerable<BOQItemDto>> GetProjectItemsAsync(int projectId);
}
