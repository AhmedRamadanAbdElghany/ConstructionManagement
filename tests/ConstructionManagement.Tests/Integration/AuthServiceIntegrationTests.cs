using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using BCrypt.Net; // تأكد إن الحزمة مثبتة (BCrypt.Net-Next)

namespace ConstructionManagement.Tests.Integration;

public class AuthServiceIntegrationTests : IntegrationTestBase
{
    private readonly AuthService _service;
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock = new();

    public AuthServiceIntegrationTests() : base()
    {
        // 1. Test JWT settings (must match what AuthService expects)
        var testSettings = new Dictionary<string, string?>
        {
            { "JwtSettings:Key", "SuperSecretKey12345678901234567890" }, // 32+ chars
            { "JwtSettings:Issuer", "TestIssuer" },
            { "JwtSettings:Audience", "TestAudience" },
            { "JwtSettings:ExpiryInMinutes", "60" }
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(testSettings)
            .Build();

        // 2. Inject real config + mocked repo + unitOfWork
        _service = new AuthService(
            _userRepoMock.Object,
            configuration,
            UnitOfWork,
            _httpContextAccessorMock.Object
        );
    }

    // DOCUMENTATION TABLES (replace with full 113 test-case tables):
    // Test Case: <Name>
    // Step # | Step Description | Expected Result
    // 1      | ...              | ...
    // 2      | ...              | ...
    // 3      | ...              | ...
    // 4      | ...              | ...

    // Test case:
    // 1) LoginAsync_WithValidCredentials_ReturnsToken
    //    Steps: seed user with hashed password -> configure JWT -> call login -> assert token and user email.
    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        const string email = "auth@test.com";
        const string password = "Password123";

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = new User
        {
            Id = 1,
            FirstName = "Auth",
            LastName = "User",
            Email = email,
            PasswordHash = hashedPassword
            // أضف أي حقول أخرى مطلوبة مثل Role إذا كان AuthService يعتمد عليها
        };

        _userRepoMock
            .Setup(r => r.GetByEmailAsync(email))
            .ReturnsAsync(user);

        var loginRequest = new LoginRequest(email, password);

        // Act
        var result = await _service.LoginAsync(loginRequest);

        // Assert
        result.Should().NotBeNull("يجب أن يرجع كائن LoginResponse");
        result.Token.Should().NotBeNullOrEmpty("يجب أن يحتوي على JWT token صالح");
        result.Token.Should().Contain(".");
        result.User.Should().NotBeNull();
        result.User!.Email.Should().Be(email);
        // اختبارات إضافية اختيارية
        // result.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsToken_RealDB()
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "JwtSettings:Key", "SuperSecretKey12345678901234567890" },
                { "JwtSettings:Issuer", "TestIssuer" },
                { "JwtSettings:Audience", "TestAudience" }
            })
            .Build();

        const string password = "Password123";
        var user = new User
        {
            FirstName = "Auth",
            LastName = "User",
            Email = "auth@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        var service = new AuthService(new UserRepository(Context), config, UnitOfWork, _httpContextAccessorMock.Object);

        // Act
        var result = await service.LoginAsync(new LoginRequest("auth@test.com", password));

        // Assert
        result.Token.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User!.Email.Should().Be("auth@test.com");
    }
}
