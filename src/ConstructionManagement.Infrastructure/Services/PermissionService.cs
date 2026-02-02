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
    public class PermissionService : IPermissionService
    {
        private readonly IRepository<Permission> _permissionRepository;
        private readonly IRepository<UserRole> _userRoleRepository;
        private readonly IUnitOfWork _unitOfWork;

        public PermissionService(
            IRepository<Permission> permissionRepository,
            IRepository<UserRole> userRoleRepository,
            IUnitOfWork unitOfWork)
        {
            _permissionRepository = permissionRepository;
            _userRoleRepository = userRoleRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
        {
            return await _permissionRepository.AsQueryable()
                .Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description
                })
                .ToListAsync();
        }

        public async Task<int> CreatePermissionAsync(CreatePermissionRequest request, int userId)
        {
            if (!await IsSuperAdmin(userId))
                throw new UnauthorizedAccessException("Only SuperAdmin can create permissions.");

            var exists = await _permissionRepository.AsQueryable().AnyAsync(p => p.Name == request.Name);
            if (exists) throw new InvalidOperationException("Permission already exists.");

            var permission = new Permission
            {
                Name = request.Name,
                Description = request.Description
            };

            await _permissionRepository.AddAsync(permission);
            await _unitOfWork.SaveChangesAsync();

            return permission.Id;
        }

        public async Task<bool> DeletePermissionAsync(int permissionId, int userId)
        {
            if (!await IsSuperAdmin(userId))
                throw new UnauthorizedAccessException("Only SuperAdmin can delete permissions.");

            var permission = await _permissionRepository.GetByIdAsync(permissionId);
            if (permission == null) return false;

            await _permissionRepository.DeleteAsync(permission);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        private async Task<bool> IsSuperAdmin(int userId)
        {
            return await _userRoleRepository.AsQueryable()
                .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SuperAdmin");
        }
    }
}
