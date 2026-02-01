using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRepository<Role> _roleRepository;
        private readonly IRepository<UserRole> _userRoleRepository;
        private readonly IUnitOfWork _unitOfWork; // إضافة الـ Unit of Work

        public RoleService(
            IRepository<Role> roleRepository,
            IRepository<UserRole> userRoleRepository,
            IUnitOfWork unitOfWork)
        {
            _roleRepository = roleRepository;
            _userRoleRepository = userRoleRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<int> AddRoleAsync(AddRoleRequest request, int adminId)
        {
            if (!await IsSuperAdmin(adminId))
                throw new UnauthorizedAccessException("غير مصرح لك بإضافة أدوار");

            var exists = await _roleRepository.AsQueryable().AnyAsync(r => r.Name == request.RoleName);
            if (exists) throw new InvalidOperationException("هذا الدور موجود مسبقاً");

            var role = new Role 
            { 
                Name = request.RoleName, 
                Description = request.Description,
                CompanyId = request.CompanyId
            };
 
            await _roleRepository.AddAsync(role);
            await _unitOfWork.SaveChangesAsync(); // الحفظ النهائي

            return role.Id;
        }

        public async Task<bool> DeleteRoleAsync(int roleId, int adminId)
        {
            if (!await IsSuperAdmin(adminId))
                throw new UnauthorizedAccessException("غير مصرح لك بحذف أدوار");

            var role = await _roleRepository.GetByIdAsync(roleId);
            if (role == null) return false;

            // منع حذف الأدوار الأساسية للنظام لضمان استقرار الصلاحيات
            if (role.Name == "SuperAdmin")
                throw new InvalidOperationException("لا يمكن حذف دور مدير النظام الأساسي");

            await _roleRepository.DeleteAsync(role);
            await _unitOfWork.SaveChangesAsync(); // الحفظ النهائي

            return true;
        }

        private async Task<bool> IsSuperAdmin(int userId)
        {
            return await _userRoleRepository.AsQueryable()
                .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "SuperAdmin");
        }
    }
}
