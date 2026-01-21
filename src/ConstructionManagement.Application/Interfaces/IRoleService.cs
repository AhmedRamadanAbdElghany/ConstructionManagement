using ConstructionManagement.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IRoleService
    {
        Task<int> AddRoleAsync(AddRoleRequest request, int adminId);
        Task<bool> DeleteRoleAsync(int roleId, int adminId);
    }
}
