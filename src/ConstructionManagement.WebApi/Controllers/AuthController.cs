using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.WebApi.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserTypeService _userTypeService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IUserTypeService userTypeService, IConfiguration configuration)
    {
        _authService = authService;
        _userTypeService = userTypeService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        if (!response.Success)
        {
            return Unauthorized(new { message = response.Message });
        }

        if (string.IsNullOrEmpty(response.Token) || response.User == null)
        {
            return StatusCode(500, new { message = "Login succeeded but token or user data is missing" });
        }

        var user = response.User;
        var token = response.Token;

        return Ok(new
        {
            token,
            user = new
            {
                userId = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                roles = user.Roles,
                createdAt = user.CreatedAt,
                userType = (int)user.CurrentUserType,
                companyId = user.CompanyId
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var response = await _authService.RegisterAsync(request);

        if (!response.Success)
        {
            return BadRequest(new { message = response.Message });
        }

        return Ok(new
        {
            success = true,
            message = response.Message,
            token = response.Token,
            user = response.User != null ? new
            {
                userId = response.User.UserID,
                fullName = response.User.FullName,
                email = response.User.Email,
                roles = response.User.Roles,
                createdAt = response.User.CreatedAt,
                userType = (int)response.User.CurrentUserType,
                companyId = response.User.CompanyId
            } : null
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var response = await _authService.ForgotPasswordAsync(request);

        if (!response.Success)
        {
            return BadRequest(new { message = response.Message });
        }

        return Ok(new { message = response.Message });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var response = await _authService.ResetPasswordAsync(request);

        if (!response.Success)
        {
            return BadRequest(new { message = response.Message });
        }

        return Ok(new { message = response.Message });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] EmailVerificationRequest request)
    {
        var success = await _authService.VerifyEmailAsync(request.Token);

        if (!success)
        {
            return BadRequest(new { message = "Invalid or expired verification token." });
        }

        return Ok(new { message = "Email verified successfully." });
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ForgotPasswordRequest request)
    {
        var response = await _authService.ResendVerificationEmailAsync(request.Email);

        if (!response.Success)
        {
            return BadRequest(new { message = response.Message });
        }

        return Ok(new { message = "Verification email sent successfully." });
    }

    [HttpPost("change-user-type")]
    public async Task<IActionResult> ChangeUserType([FromBody] ChangeUserTypeRequest request)
    {
        var userId = _authService.GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(new { success = false, message = "User not authenticated" });
        }

        var result = await _userTypeService.ChangeUserTypeAsync(userId.Value, request.NewUserType, request.Reason);

        if (result)
        {
            return Ok(new { success = true, message = "User type changed successfully" });
        }

        return BadRequest(new { success = false, message = "Failed to change user type" });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = _authService.GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var success = await _authService.UpdateProfileAsync(userId.Value, request);
        return success ? Ok(new { message = "Profile updated successfully" }) : BadRequest(new { message = "Failed to update profile" });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = _authService.GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var success = await _authService.ChangePasswordAsync(userId.Value, request);
        return success ? Ok(new { message = "Password changed successfully" }) : BadRequest(new { message = "Invalid current password or failed to update password" });
    }
}
