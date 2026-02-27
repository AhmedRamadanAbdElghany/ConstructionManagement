using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;

namespace ConstructionManagement.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request);
    Task<bool> VerifyEmailAsync(string token);
    Task<AuthResponse> ResendVerificationEmailAsync(string email);
    int? GetCurrentUserId();
    Task<User?> GetCurrentUserAsync();
    Task<int?> GetCurrentUserIdAsync();
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<AuthResponse> SwitchActiveCompanyAsync(int userId, int companyId);
}
