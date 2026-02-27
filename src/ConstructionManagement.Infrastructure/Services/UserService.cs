using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<UserRole> _userRoleRepository;
    private readonly ICompanyUserRepository _companyUserRepository;
    private readonly IUnitOfWork _unitOfWork; // إضافة الـ Unit of Work

    public UserService(
        IRepository<User> userRepository,
        IRepository<Role> roleRepository,
        IRepository<UserRole> userRoleRepository,
        ICompanyUserRepository companyUserRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _userRoleRepository = userRoleRepository;
        _companyUserRepository = companyUserRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> AddUserAsync(AddUserRequest request, int adminId)
    {
        if (!await IsAuthorizedAdminAsync(adminId))
            throw new UnauthorizedAccessException("ليس لديك صلاحية لإضافة مستخدمين");

        var admin = await _userRepository.GetByIdAsync(adminId);
        if (admin?.CompanyId == null)
            throw new InvalidOperationException("You must belong to a company to add users");

        var existingUser = await _userRepository.AsQueryable()
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
        {
            var alreadyInCompany = await _companyUserRepository.IsUserAssociatedWithCompanyAsync(existingUser.Id, admin.CompanyId.Value);
            if (alreadyInCompany)
                throw new InvalidOperationException("البريد الإلكتروني مسجل بالفعل لمستخدم آخر في شركتك");

            var companyUser = new CompanyUser
            {
                UserId = existingUser.Id,
                CompanyId = admin.CompanyId.Value,
                Role = "CompanyUser",
                ContractStartDate = DateTime.UtcNow,
                Status = ConstructionManagement.Domain.Enums.ContractStatus.Active,
                JoinedAt = DateTime.UtcNow
            };
            await _companyUserRepository.AddAsync(companyUser);

            var role = await _roleRepository.AsQueryable().FirstOrDefaultAsync(r => r.Name == "CompanyUser");
            if (role != null && !await _userRoleRepository.AsQueryable().AnyAsync(ur => ur.UserId == existingUser.Id && ur.RoleId == role.Id && ur.CompanyId == admin.CompanyId.Value))
            {
                await _userRoleRepository.AddAsync(new UserRole
                {
                    UserId = existingUser.Id,
                    RoleId = role.Id,
                    CompanyId = admin.CompanyId.Value,
                    AssignedAt = DateTime.UtcNow
                });
            }

            await _unitOfWork.SaveChangesAsync();
            return existingUser.Id;
        }

        // 2. إنشاء كائن المستخدم وتشفير كلمة المرور
        var nameParts = request.FullName.Split(' ', 2);
        var user = new User
        {
            FirstName = nameParts[0],
            LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow,
            CompanyId = admin?.CompanyId
        };

        await _userRepository.AddAsync(user);
        
        var newCompanyUser = new CompanyUser
        {
            User = user,
            CompanyId = admin.CompanyId.Value,
            Role = "CompanyUser",
            ContractStartDate = DateTime.UtcNow,
            Status = ConstructionManagement.Domain.Enums.ContractStatus.Active,
            JoinedAt = DateTime.UtcNow
        };
        await _companyUserRepository.AddAsync(newCompanyUser);

        var newRole = await _roleRepository.AsQueryable().FirstOrDefaultAsync(r => r.Name == "CompanyUser");
        if (newRole != null)
        {
            await _userRoleRepository.AddAsync(new UserRole
            {
                User = user,
                RoleId = newRole.Id,
                CompanyId = admin.CompanyId.Value,
                AssignedAt = DateTime.UtcNow
            });
        }

        await _unitOfWork.SaveChangesAsync(); // الحفظ عبر Unit of Work
        return user.Id;
    }

    public async Task<bool> DeleteUserAsync(int userId, int adminId)
    {
        if (!await IsAuthorizedAdminAsync(adminId))
            throw new UnauthorizedAccessException("ليس لديك صلاحية لحذف مستخدمين");

        if (userId == adminId)
            throw new InvalidOperationException("لا يمكنك حذف حسابك الخاص من هنا");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        var admin = await _userRepository.GetByIdAsync(adminId);
        if (admin == null) return false;

        bool isSuperAdmin = await _userRoleRepository.AsQueryable().AnyAsync(ur => ur.UserId == adminId && ur.Role.Name == "SuperAdmin");

        if (isSuperAdmin)
        {
            await _userRepository.DeleteAsync(user);
        }
        else if (admin.CompanyId.HasValue)
        {
            var companyUser = await _companyUserRepository.GetByUserAndCompanyAsync(userId, admin.CompanyId.Value);
            if (companyUser != null)
            {
                await _companyUserRepository.UpdateStatusAsync(companyUser.Id, ConstructionManagement.Domain.Enums.ContractStatus.Draft, "Removed from company by admin");
            }
        }

        await _unitOfWork.SaveChangesAsync(); // الحفظ عبر Unit of Work
        return true;
    }

    public async Task<bool> AssignRoleToUserAsync(int userId, string roleName, int adminId)
    {
        if (!await IsAuthorizedAdminAsync(adminId))
            throw new UnauthorizedAccessException("ليس لديك صلاحية لتعيين أدوار");

        var role = await _roleRepository.AsQueryable()
            .FirstOrDefaultAsync(r => r.Name == roleName);

        if (role == null)
            throw new KeyNotFoundException($"الدور '{roleName}' غير موجود بالنظام");

        var alreadyAssigned = await _userRoleRepository.AsQueryable()
            .AnyAsync(ur => ur.UserId == userId && ur.RoleId == role.Id);

        if (alreadyAssigned) return true;

        var userRole = new UserRole
        {
            UserId = userId,
            RoleId = role.Id,
            AssignedAt = DateTime.UtcNow
        };

        await _userRoleRepository.AddAsync(userRole);
        await _unitOfWork.SaveChangesAsync(); // الحفظ عبر Unit of Work
        return true;
    }

    // ميثودز الـ Get لا تحتاج لـ SaveChanges
    public async Task<UserDto?> GetUserByIdAsync(int userId, int adminId)
    {
        if (!await IsAuthorizedAdminAsync(adminId))
            throw new UnauthorizedAccessException("ليس لديك صلاحية لعرض تفاصيل المستخدمين");

        return await _userRepository.AsQueryable()
            .Where(u => u.Id == userId)
            .Select(u => new UserDto(
                u.Id, $"{u.FirstName} {u.LastName}".Trim(), u.Email,
                u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                u.CreatedAt,
                u.UserType,
                u.CompanyId,
                u.RequiresPasswordChange,
                null))
            .FirstOrDefaultAsync();
    }

    public async Task<List<UserDto>> GetAllUsersAsync(int adminId)
    {
        if (!await IsAuthorizedAdminAsync(adminId))
            throw new UnauthorizedAccessException("ليس لديك صلاحية لعرض قائمة المستخدمين");

        return await _userRepository.AsQueryable()
            .Select(u => new UserDto(
                u.Id, $"{u.FirstName} {u.LastName}".Trim(), u.Email,
                u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                u.CreatedAt,
                u.UserType,
                u.CompanyId,
                u.RequiresPasswordChange,
                null))
            .ToListAsync();
    }

    private async Task<bool> IsAuthorizedAdminAsync(int userId)
    {
        return await _userRoleRepository.AsQueryable()
            .AnyAsync(ur => ur.UserId == userId && (ur.Role.Name == "SuperAdmin" || ur.Role.Name == "CompanyAdmin"));
    }
}
