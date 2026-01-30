using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize(Policy = "CanManageUsers")]
[Route("api/admin/users")]
[ApiController]
public class AdminUsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRoleService _roleService; // تم إضافة خدمة الأدوار

    public AdminUsersController(IUserService userService, IRoleService roleService)
    {
        _userService = userService;
        _roleService = roleService;
    }

    #region User Management

    [HttpPost]
    public async Task<IActionResult> AddUser([FromBody] AddUserRequest request)
    {
        var adminId = GetAdminId();
        var newUserId = await _userService.AddUserAsync(request, adminId);
        return CreatedAtAction(nameof(GetUser), new { userId = newUserId }, new { newUserId });
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var adminId = GetAdminId();
        var success = await _userService.DeleteUserAsync(userId, adminId);
        return success ? Ok("تم حذف المستخدم بنجاح") : NotFound("المستخدم غير موجود");
    }

    [HttpPut("{userId}/roles")]
    public async Task<IActionResult> AssignRoleToUser(int userId, [FromBody] AssignRoleRequest request)
    {
        var adminId = GetAdminId();
        var success = await _userService.AssignRoleToUserAsync(userId, request.RoleName, adminId);
        return success ? Ok("تم تعيين الرول بنجاح") : BadRequest("لا يمكن تعيين الرول");
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUser(int userId)
    {
        var adminId = GetAdminId();
        var user = await _userService.GetUserByIdAsync(userId, adminId);
        return user != null ? Ok(user) : NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var adminId = GetAdminId();
        var users = await _userService.GetAllUsersAsync(adminId);
        return Ok(users);
    }

    #endregion

    #region Role Management (New)

    /// <summary>
    /// إضافة دور (Role) جديد للنظام (مثل: ProjectManager, Consultant)
    /// </summary>
    [HttpPost("roles")]
    public async Task<IActionResult> AddRole([FromBody] AddRoleRequest request)
    {
        var adminId = GetAdminId();
        var roleId = await _roleService.AddRoleAsync(request, adminId);
        return Ok(new { Message = "تم إضافة الدور بنجاح", RoleID = roleId });
    }

    /// <summary>
    /// حذف دور من النظام
    /// </summary>
    [HttpDelete("roles/{roleId}")]
    public async Task<IActionResult> DeleteRole(int roleId)
    {
        var adminId = GetAdminId();
        var success = await _roleService.DeleteRoleAsync(roleId, adminId);
        return success ? Ok("تم حذف الدور بنجاح") : NotFound("الدور غير موجود أو لا يمكن حذفه");
    }

    #endregion

    private int GetAdminId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null) throw new UnauthorizedAccessException("المستخدم غير معرف");
        return int.Parse(claim.Value);
    }
}
