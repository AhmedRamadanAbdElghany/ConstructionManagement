using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;

namespace ConstructionManagement.Tests.Integration;

public class AuthServiceIntegrationTests : IntegrationTestBase
{
    private readonly AuthService _service;
    private readonly Mock<IUserRepository> _userRepoMock = new();

    public AuthServiceIntegrationTests() : base()
    {
        // 1. إعداد قاموس يحتوي على المفاتيح بالظبط كما يتوقعها كود الـ AuthService
        // ملاحظة: تأكد هل الكود في AuthService يستخدم "Secret" أم "Key"
        var testSettings = new Dictionary<string, string> {
        {"Jwt:Key", "SuperSecretKey12345678901234567890"}, // استخدم مسمى Key إذا كان سطر 63 يطلبه
        {"Jwt:Secret", "SuperSecretKey12345678901234567890"}, // أو Secret حسب الكود لديك
        {"Jwt:Issuer", "TestIssuer"},
        {"Jwt:Audience", "TestAudience"},
        {"Jwt:ExpiryInMinutes", "60"}
    };

        // 2. بناء كائن Configuration حقيقي بدلاً من الـ Mock
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(testSettings)
            .Build();

        // 3. حقن الإعدادات الحقيقية في الخدمة
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

        var user = new User
        {
            Id = 1,
            FullName = "Auth User",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };

        _userRepoMock
            .Setup(r => r.GetByEmailAsync(email))
            .ReturnsAsync(user);

        var loginRequest = new LoginRequest(email, password);

        // Act
        var result = await _service.LoginAsync(loginRequest);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
    }
}