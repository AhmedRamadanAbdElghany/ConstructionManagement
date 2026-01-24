using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using BCrypt.Net; // تأكد إن الحزمة مثبتة (BCrypt.Net-Next)

namespace ConstructionManagement.Tests.Integration;

public class AuthServiceIntegrationTests : IntegrationTestBase
{
    private readonly AuthService _service;
    private readonly Mock<IUserRepository> _userRepoMock = new();

    public AuthServiceIntegrationTests() : base()
    {
        // 1. Test JWT settings (must match what AuthService expects)
        var testSettings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKey12345678901234567890" }, // 32+ chars
            { "Jwt:Issuer", "TestIssuer" },
            { "Jwt:Audience", "TestAudience" },
            { "Jwt:ExpiryInMinutes", "60" }
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(testSettings)
            .Build();

        // 2. Inject real config + mocked repo + unitOfWork
        _service = new AuthService(
            _userRepoMock.Object,
            configuration,
            UnitOfWork
        );
    }

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
            FullName = "Auth User",
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
        // اختبارات إضافية اختيارية
        // result.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }
}