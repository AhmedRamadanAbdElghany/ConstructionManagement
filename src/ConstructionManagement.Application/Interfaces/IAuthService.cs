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
}
