using ConstructionManagement.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces
{
    public interface IUserService
    {
        Task<int> AddUserAsync(AddUserRequest request, int adminId);
        Task<bool> DeleteUserAsync(int userId, int adminId);
        Task<bool> AssignRoleToUserAsync(int userId, string roleName, int adminId);
        Task<UserDto?> GetUserByIdAsync(int userId, int adminId);
        Task<List<UserDto>> GetAllUsersAsync(int adminId);
    }
}
