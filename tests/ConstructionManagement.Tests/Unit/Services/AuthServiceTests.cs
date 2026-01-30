using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ConstructionManagement.Tests.Unit.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<IConfiguration> _configMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    public AuthServiceTests()
    {
        // تم التعديل إلى jwtSettings (حرف j صغير) ليتطابق مع السطر 102 في AuthService.cs
        _configMock.Setup(c => c["jwtSettings:Key"]).Returns("ThisIsAStrongSecretKeyForTesting123456!");
        _configMock.Setup(c => c["jwtSettings:Issuer"]).Returns("TestIssuer");
        _configMock.Setup(c => c["jwtSettings:Audience"]).Returns("TestAudience");
    }

    private AuthService CreateService()
    {
        return new AuthService(
            _userRepoMock.Object,
            _configMock.Object,
            _uowMock.Object
        );
    }

    // ─── LOGIN TESTS ────────────────────────────────────────────────────────

    [Fact]
    public async Task LoginAsync_WhenCredentialsAreValid_ReturnsSuccessWithToken()
    {
        // Arrange
        var password = "SafePassword123";
        var user = new User
        {
            Id = 1,
            FirstName = "Ahmed",
            LastName = "Ramadan",
            Email = "ahmed@eng.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            TenantId = "Construction_ClientA_DB",
            UserRoles = new List<UserRole>
            {
                new UserRole
                {
                    Role = new Role { Name = "Admin" }
                }
            }
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

        var service = CreateService();
        var request = new LoginRequest(user.Email, password);

        // Act
        var result = await service.LoginAsync(request);

        // Assert
        result.Success.Should().BeTrue();
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_WhenUserDoesNotExist_ReturnsFailure()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        var service = CreateService();
        var request = new LoginRequest("wrong@email.com", "password123");

        // Act
        var result = await service.LoginAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("بيانات الدخول غير صحيحة");
    }

    // ─── REGISTER TESTS ─────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterAsync_WhenDataIsValid_ShouldSaveUserWithCorrectData()
    {
        // Arrange
        var request = new RegisterRequest("Ahmed Ramadan", "ahmed@test.com", "StrongPass123", "01000000000");
        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);

        var service = CreateService();

        // Act
        var result = await service.RegisterAsync(request);

        // Assert
        result.Success.Should().BeTrue();

        _userRepoMock.Verify(r => r.AddAsync(It.Is<User>(u =>
            u.Email == request.Email &&
            u.FullName == request.FullName &&
            u.Phone == request.Phone &&
            u.PasswordHash != request.Password
        )), Times.Once());

        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailAlreadyExists_ReturnsFailure()
    {
        // Arrange
        var request = new RegisterRequest("New User", "existing@test.com", "Pass123", "0123456789");
        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(new User());

        var service = CreateService();

        // Act
        var result = await service.RegisterAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("البريد الإلكتروني مستخدم بالفعل");
        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never());
    }

    // ─── EDGE CASES ─────────────────────────────────────────────────────────

    [Fact]
    public async Task LoginAsync_ShouldThrowException_WhenJwtKeyIsMissing()
    {
        // Arrange
        var user = new User
        {
            Email = "t@t.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("1"),
            TenantId = "AnyDB",
            UserRoles = new List<UserRole>()
        };
        _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

        // محاكاة غياب المفتاح باستخدام الحرف الصغير jwtSettings
        _configMock.Setup(c => c["jwtSettings:Key"]).Returns((string?)null);

        var service = CreateService();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LoginAsync(new LoginRequest(user.Email, "1")));
    }
}
