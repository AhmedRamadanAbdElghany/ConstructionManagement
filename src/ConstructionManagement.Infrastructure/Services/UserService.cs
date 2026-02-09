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
    private readonly IUnitOfWork _unitOfWork; // إضافة الـ Unit of Work

    public UserService(
        IRepository<User> userRepository,
        IRepository<Role> roleRepository,
        IRepository<UserRole> userRoleRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _userRoleRepository = userRoleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> AddUserAsync(AddUserRequest request, int adminId)
    {
        if (!await IsAuthorizedAdminAsync(adminId))
            throw new UnauthorizedAccessException("ليس لديك صلاحية لإضافة مستخدمين");

        var admin = await _userRepository.GetByIdAsync(adminId);

        var emailExists = await _userRepository.AsQueryable()
            .AnyAsync(u => u.Email == request.Email);

        if (emailExists)
            throw new InvalidOperationException("البريد الإلكتروني مسجل بالفعل لمستخدم آخر");

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

        await _userRepository.DeleteAsync(user);
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
                u.UserType))
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
                u.UserType))
            .ToListAsync();
    }

    private async Task<bool> IsAuthorizedAdminAsync(int userId)
    {
        return await _userRoleRepository.AsQueryable()
            .AnyAsync(ur => ur.UserId == userId && (ur.Role.Name == "SuperAdmin" || ur.Role.Name == "CompanyAdmin"));
    }
}
