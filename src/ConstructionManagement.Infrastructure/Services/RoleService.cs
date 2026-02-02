using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConstructionManagement.Infrastructure.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRepository<Role> _roleRepository;
        private readonly IRepository<UserRole> _userRoleRepository;
        private readonly IRepository<Permission> _permissionRepository;
        private readonly IRepository<RolePermission> _rolePermissionRepository;
        private readonly IRepository<User> _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RoleService(
            IRepository<Role> roleRepository,
            IRepository<UserRole> userRoleRepository,
            IRepository<Permission> permissionRepository,
            IRepository<RolePermission> rolePermissionRepository,
            IRepository<User> userRepository,
            IUnitOfWork unitOfWork)
        {
            _roleRepository = roleRepository;
            _userRoleRepository = userRoleRepository;
            _permissionRepository = permissionRepository;
            _rolePermissionRepository = rolePermissionRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<RoleDto>> GetRolesByCompanyAsync(int? companyId, int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new UnauthorizedAccessException();

            bool isSuper = await IsSuperAdmin(userId);
            bool isCompanyAdmin = await IsCompanyAdmin(userId, user.CompanyId);

            if (!isSuper && !isCompanyAdmin)
                throw new UnauthorizedAccessException("Not authorized to view roles.");

            // If not super, ignore requested companyId and use user's companyId
            int? targetCompanyId = isSuper ? companyId : user.CompanyId;

            return await _roleRepository.AsQueryable()
                .Where(r => r.CompanyId == targetCompanyId || r.CompanyId == null)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    CompanyId = r.CompanyId,
                    Permissions = r.Permissions.Select(rp => new PermissionDto
                    {
                        Id = rp.Permission.Id,
                        Name = rp.Permission.Name,
                        Description = rp.Permission.Description
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<int> AddRoleAsync(AddRoleRequest request, int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new UnauthorizedAccessException();

            bool isSuper = await IsSuperAdmin(userId);
            bool isCompanyAdmin = await IsCompanyAdmin(userId, user.CompanyId);

            if (!isSuper && !isCompanyAdmin)
                throw new UnauthorizedAccessException("Not authorized to create roles.");

            int? targetCompanyId = isSuper ? request.CompanyId : user.CompanyId;

            var exists = await _roleRepository.AsQueryable()
                .AnyAsync(r => r.Name == request.RoleName && r.CompanyId == targetCompanyId);
            if (exists) throw new InvalidOperationException("Role already exists for this company.");

            var role = new Role
            {
                Name = request.RoleName,
                Description = request.Description,
                CompanyId = targetCompanyId
            };

            await _roleRepository.AddAsync(role);
            await _unitOfWork.SaveChangesAsync();

            return role.Id;
        }

        public async Task<bool> DeleteRoleAsync(int roleId, int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new UnauthorizedAccessException();

            var role = await _roleRepository.GetByIdAsync(roleId);
            if (role == null) return false;

            bool isSuper = await IsSuperAdmin(userId);
            bool isCompanyAdmin = await IsCompanyAdmin(userId, user.CompanyId);

            if (!isSuper && (!isCompanyAdmin || role.CompanyId != user.CompanyId))
                throw new UnauthorizedAccessException("Not authorized to delete this role.");

            if (role.Name == "SuperAdmin" || role.Name == "CompanyAdmin")
                throw new InvalidOperationException("Cannot delete system roles.");

            await _roleRepository.DeleteAsync(role);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateRoleAsync(int roleId, string name, string description, int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new UnauthorizedAccessException();

            var role = await _roleRepository.GetByIdAsync(roleId);
            if (role == null) return false;

            bool isSuper = await IsSuperAdmin(userId);
            bool isCompanyAdmin = await IsCompanyAdmin(userId, user.CompanyId);

            if (!isSuper && (!isCompanyAdmin || role.CompanyId != user.CompanyId))
                throw new UnauthorizedAccessException("Not authorized to update this role.");

            role.Name = name;
            role.Description = description;

            await _roleRepository.UpdateAsync(role);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateRolePermissionsAsync(UpdateRolePermissionsRequest request, int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new UnauthorizedAccessException();

            var role = await _roleRepository.AsQueryable()
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.Id == request.RoleId);
            
            if (role == null) return false;

            bool isSuper = await IsSuperAdmin(userId);
            bool isCompanyAdmin = await IsCompanyAdmin(userId, user.CompanyId);

            if (!isSuper && (!isCompanyAdmin || role.CompanyId != user.CompanyId))
                throw new UnauthorizedAccessException("Not authorized to manage permissions for this role.");

            // Remove existing
            var existing = await _rolePermissionRepository.AsQueryable()
                .Where(rp => rp.RoleId == role.Id)
                .ToListAsync();
            
            foreach(var ep in existing)
            {
                await _rolePermissionRepository.DeleteAsync(ep);
            }

            // Add new
            foreach(var pId in request.PermissionIds)
            {
                await _rolePermissionRepository.AddAsync(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = pId,
                    CompanyId = role.CompanyId
                });
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private async Task<bool> IsSuperAdmin(int userId)
        {
            return await _userRoleRepository.AsQueryable()
                .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SuperAdmin");
        }

        private async Task<bool> IsCompanyAdmin(int userId, int? companyId)
        {
            if (companyId == null) return false;
            return await _userRoleRepository.AsQueryable()
                .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "CompanyAdmin" && ur.CompanyId == companyId);
        }
    }
}
