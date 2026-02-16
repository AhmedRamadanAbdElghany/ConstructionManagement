using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace ConstructionManagement.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICompanyRequestRepository _companyRequestRepository;
    private readonly INotificationService _notificationService;
    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<UserRole> _userRoleRepository;

    public AuthService(
        IUserRepository userRepository,
        IConfiguration configuration,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICompanyRequestRepository companyRequestRepository,
        INotificationService notificationService,
        IRepository<Vendor> vendorRepository,
        IRepository<Role> roleRepository,
        IRepository<UserRole> userRoleRepository)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;
        _companyRequestRepository = companyRequestRepository;
        _notificationService = notificationService;
        _vendorRepository = vendorRepository;
        _roleRepository = roleRepository;
        _userRoleRepository = userRoleRepository;
    }

    private readonly IRepository<Vendor> _vendorRepository;

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return new AuthResponse(false, "Invalid email or password", null, null);
        }

        var token = GenerateJwtToken(user);

        var roles = user.UserRoles?.Select(ur => ur.Role.Name).ToList() ?? new List<string>();

        var userDto = new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            roles,
            user.CreatedAt,
            user.UserType,
            user.CompanyId
        );

        return new AuthResponse(true, "Login successful", token, userDto);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Validate email format
        if (!IsValidEmail(request.Email))
        {
            return new AuthResponse(false, "Invalid email format", null, null);
        }

        // Validate password strength
        var passwordValidation = ValidatePasswordStrength(request.Password);
        if (!passwordValidation.IsValid)
        {
            return new AuthResponse(false, passwordValidation.Message, null, null);
        }

        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return new AuthResponse(false, "Email is already registered", null, null);
        }

        var existingUserByName = await _userRepository.GetByFullNameAsync(request.FullName);
        if (existingUserByName != null)
        {
            return new AuthResponse(false, "Full Name is already taken. Please use a different name.", null, null);
        }

        var nameParts = request.FullName.Split(' ', 2);
        var user = new User
        {
            FirstName = nameParts[0],
            LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow,
            IsEmailVerified = true,
            EmailVerificationToken = null,
            UserType = request.UserType
        };

        try
        {
            await _userRepository.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // Auto-create Vendor profile if user is an InventoryOwner
            if (request.UserType == UserType.InventoryOwner)
            {
                var vendor = new Vendor
                {
                    Name = request.FullName, // Default name, can be changed later
                    UserId = user.Id,
                    IsPublic = true,         // Visible in public search by default? Or maybe waiting for location? 
                                             // Let's set it to true but without location it won't show up in nearby.
                    CompanyId = null,        // Independent vendor
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                await _vendorRepository.AddAsync(vendor);
                await _unitOfWork.SaveChangesAsync();
            }

            // Auto-create CompanyRequest ONLY if user is a CompanyOwner
            if (request.UserType == UserType.CompanyOwner)
            {
                var companyRequest = new CompanyRequest
                {
                    UserId = user.Id,
                    CompanyName = request.FullName + "'s Company",
                    ContactEmail = request.Email,
                    ContactPhone = request.Phone,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    Notes = "Auto-created from registration"
                };
                await _companyRequestRepository.AddAsync(companyRequest);
                await _unitOfWork.SaveChangesAsync();

                // Notify Super Admins
                var superAdmins = await _userRepository.GetUsersByRoleAsync("SuperAdmin");
                foreach (var admin in superAdmins)
                {
                    await _notificationService.NotifyNewCompanyRequestAsync(admin.Id, companyRequest.CompanyName, companyRequest.Id);
                }

                // Notify User
                await _notificationService.CreateAndSendAsync(
                    user.Id,
                    "Registration Pending",
                    "Your company registration request has been received and is currently awaiting administrative approval.",
                    null,
                    NotificationType.General
                );
            }
            // For InventoryOwner and NormalUser, we skip the "Pending" status and company request.
            // They are effectively "Active" (confirmed by email check usually, but for now we proceed).

            // Link Roles in Database
            var roleName = request.UserType switch
            {
                UserType.InventoryOwner => "InventoryOwner",
                UserType.NormalUser => "User",
                UserType.CompanyOwner => "CompanyAdmin",
                _ => "CompanyUser"
            };

            var role = await _roleRepository.AsQueryable().FirstOrDefaultAsync(r => r.Name == roleName);
            if (role != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = role.Id,
                    AssignedAt = DateTime.UtcNow
                };
                await _userRoleRepository.AddAsync(userRole);
                await _unitOfWork.SaveChangesAsync();
                
                // Ensure the user object has the roles for JWT generation
                user.UserRoles = new List<UserRole> { userRole };
            }

            // TODO: Send verification email with user.EmailVerificationToken
            var token = GenerateJwtToken(user);
            var roles = new List<string> { roleName };
            
            var userDto = new UserDto(
                user.Id,
                user.FullName,
                user.Email,
                roles,
                user.CreatedAt,
                user.UserType,
                user.CompanyId
            );

            return new AuthResponse(true, "Registration successful. Welcome!", token, userDto);
        }
        catch (Exception ex)
        {
            return new AuthResponse(false, $"Registration failed: {ex.Message}", null, null);
        }
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        if (!IsValidEmail(request.Email))
        {
            return new ForgotPasswordResponse(false, "Invalid email format");
        }

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            // Don't reveal if user exists
            return new ForgotPasswordResponse(true, "If an account exists with this email, a password reset link has been sent.");
        }

        // Generate reset token
        user.PasswordResetToken = GenerateSecureToken();
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        try
        {
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // TODO: Send password reset email with user.PasswordResetToken

            return new ForgotPasswordResponse(true, "If an account exists with this email, a password reset link has been sent.");
        }
        catch (Exception)
        {
            return new ForgotPasswordResponse(false, "An error occurred while processing your request.");
        }
    }

    public async Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmPassword)
        {
            return new ResetPasswordResponse(false, "Passwords do not match");
        }

        var passwordValidation = ValidatePasswordStrength(request.NewPassword);
        if (!passwordValidation.IsValid)
        {
            return new ResetPasswordResponse(false, passwordValidation.Message);
        }

        var user = await _userRepository.GetByPasswordResetTokenAsync(request.Token);
        if (user == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            return new ResetPasswordResponse(false, "Invalid or expired reset token.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;

        try
        {
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return new ResetPasswordResponse(true, "Password reset successful.");
        }
        catch (Exception)
        {
            return new ResetPasswordResponse(false, "An error occurred while resetting your password.");
        }
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var user = await _userRepository.GetByEmailVerificationTokenAsync(token);
        if (user == null)
        {
            return false;
        }

        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;

        try
        {
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<AuthResponse> ResendVerificationEmailAsync(string email)
    {
        if (!IsValidEmail(email))
        {
            return new AuthResponse(false, "Invalid email format", null, null);
        }

        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            return new AuthResponse(false, "User not found", null, null);
        }

        if (user.IsEmailVerified)
        {
            return new AuthResponse(false, "Email is already verified", null, null);
        }

        user.EmailVerificationToken = GenerateSecureToken();

        try
        {
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // TODO: Send verification email

            return new AuthResponse(true, "Verification email sent successfully.", null, null);
        }
        catch (Exception ex)
        {
            return new AuthResponse(false, $"Failed to send verification email: {ex.Message}", null, null);
        }
    }

    public int? GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }

    public Task<int?> GetCurrentUserIdAsync()
    {
        return Task.FromResult(GetCurrentUserId());
    }

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        var nameParts = request.FullName.Split(' ', 2);
        user.FirstName = nameParts[0];
        user.LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

        try
        {
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return false;
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return false;
        }

        var passwordValidation = ValidatePasswordStrength(request.NewPassword);
        if (!passwordValidation.IsValid)
        {
            return false;
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        try
        {
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<User?> GetCurrentUserAsync()
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId.HasValue)
        {
            return await _userRepository.GetByIdAsync(userId.Value);
        }
        return null;
    }

    private string GenerateJwtToken(User user)
    {
        var secretKey = _configuration["JwtSettings:Key"];
        if (string.IsNullOrEmpty(secretKey))
            throw new InvalidOperationException("JWT Key is missing in configuration.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        if (user.CompanyId.HasValue)
        {
            claims.Add(new Claim("companyId", user.CompanyId.Value.ToString()));
        }

        if (user.UserRoles != null)
        {
            foreach (var userRole in user.UserRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));
            }
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    private static string GenerateSecureToken()
    {
        var bytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var regex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
        return regex.IsMatch(email);
    }

    private static (bool IsValid, string Message) ValidatePasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return (false, "Password is required");

        if (password.Length < 8)
            return (false, "Password must be at least 8 characters long");

        if (!Regex.IsMatch(password, @"[A-Z]"))
            return (false, "Password must contain at least one uppercase letter");

        if (!Regex.IsMatch(password, @"[a-z]"))
            return (false, "Password must contain at least one lowercase letter");

        if (!Regex.IsMatch(password, @"[0-9]"))
            return (false, "Password must contain at least one number");

        if (!Regex.IsMatch(password, @"[!@#$%^&*(),.?""':{}|<>]"))
            return (false, "Password must contain at least one special character");

        return (true, "Password is strong");
    }
}
