using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ConstructionManagement.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork; // إضافة Unit of Work

    public AuthService(
        IUserRepository userRepository,
        IConfiguration configuration,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // البحث عن المستخدم باستخدام البريد الإلكتروني
        var user = await _userRepository.GetByEmailAsync(request.Email);

        // التحقق من وجود المستخدم وصحة كلمة المرور المشفرة
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return new AuthResponse(false, "بيانات الدخول غير صحيحة", null, null);
        }

        // توليد التوكن
        var token = GenerateJwtToken(user);

        // استخراج أسماء الأدوار بشكل آمن
        var roles = user.UserRoles?.Select(ur => ur.Role.Name).ToList() ?? new List<string>();

        // إنشاء كائن Dto للمستخدم
        var userDto = new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            roles,
            user.CreatedAt
        );

        return new AuthResponse(true, "تم تسجيل الدخول بنجاح", token, userDto);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // 1. التحقق من وجود المستخدم مسبقاً
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return new AuthResponse(false, "البريد الإلكتروني مستخدم بالفعل", null, null);
        }

        // 2. إنشاء كائن المستخدم وتشفير كلمة المرور
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone, // تأكد أن اسم الحقل في الـ Entity يطابق هذا
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            // 3. الحفظ باستخدام Repository و Unit of Work
            await _userRepository.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // 4. إرجاع استجابة نجاح (يمكنك توليد توكن هنا أيضاً إذا أردت تسجيل دخول تلقائي)
            return new AuthResponse(true, "تم إنشاء الحساب بنجاح", null, null);
        }
        catch (Exception ex)
        {
            // تسجيل الخطأ أو التعامل معه
            return new AuthResponse(false, $"حدث خطأ أثناء التسجيل: {ex.Message}", null, null);
        }
    }

    private string GenerateJwtToken(User user)
    {
        var secretKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(secretKey))
            throw new InvalidOperationException("JWT Key is missing in configuration.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // 1. المطالبات الأساسية (Claims)
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
        };

        // 2. مطالبات الأدوار (إضافة كل دور كمطالبة منفصلة)
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
            Expires = DateTime.UtcNow.AddDays(7), // يفضل استخدام UtcNow
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}