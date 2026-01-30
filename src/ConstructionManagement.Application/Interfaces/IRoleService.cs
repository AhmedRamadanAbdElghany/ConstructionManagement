using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IRoleService
    {
        Task<int> AddRoleAsync(AddRoleRequest request, int adminId);
        Task<bool> DeleteRoleAsync(int roleId, int adminId);
    }
}
