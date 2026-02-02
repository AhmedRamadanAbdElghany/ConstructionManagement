using ConstructionManagement.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleDto>> GetRolesByCompanyAsync(int? companyId, int userId);
        Task<int> AddRoleAsync(AddRoleRequest request, int userId);
        Task<bool> DeleteRoleAsync(int roleId, int userId);
        Task<bool> UpdateRoleAsync(int roleId, string name, string description, int userId);
        Task<bool> UpdateRolePermissionsAsync(UpdateRolePermissionsRequest request, int userId);
    }
}
