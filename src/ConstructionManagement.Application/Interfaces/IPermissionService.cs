using System.Collections.Generic;
using System.Threading.Tasks;
using ConstructionManagement.Application.DTOs;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IPermissionService
    {
        Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync();
        Task<int> CreatePermissionAsync(CreatePermissionRequest request, int userId);
        Task<bool> DeletePermissionAsync(int permissionId, int userId);
    }
}
