using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<IConfiguration> _configMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    public AuthServiceTests()
    {
        _configMock.Setup(c => c["Jwt:Key"]).Returns("ThisIsAStrongSecretKeyForTesting123456!");
        _configMock.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
        _configMock.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");
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
    public async Task LoginAsync_WhenUserDoesNotExist_ReturnsFailure()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        var service = CreateService();
        var request = new LoginRequest("wrong@email.com", "password123");

        var result = await service.LoginAsync(request);

        result.Success.Should().BeFalse();
        result.Message.Should().Be("بيانات الدخول غير صحيحة");
    }

    [Fact]
    public async Task LoginAsync_WhenCredentialsAreValid_ReturnsSuccessWithToken()
    {
        var password = "SafePassword123";
        var user = new User
        {
            Id = 1,
            FullName = "Ahmed Ramadan",
            Email = "ahmed@eng.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            UserRoles = new List<UserRole>
            {
                new UserRole { Role = new Role { Name = "Admin" } }
            }
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

        var service = CreateService();
        var request = new LoginRequest(user.Email, password);

        var result = await service.LoginAsync(request);

        result.Success.Should().BeTrue();
        result.Token.Should().NotBeNullOrEmpty();
    }

    // ─── REGISTER TESTS ─────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterAsync_WhenEmailAlreadyExists_ReturnsFailure()
    {
        // Arrange: تحديث الطلب ليشمل رقم الهاتف بناءً على الـ DTO الجديد
        var request = new RegisterRequest("New User", "existing@test.com", "Pass123", "0123456789");
        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(new User());

        var service = CreateService();

        // Act
        var result = await service.RegisterAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("البريد الإلكتروني مستخدم بالفعل");
        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never);
    }

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

        // التحقق من أن الكائن الذي تم إرساله للـ Repository يحتوي على البيانات الصحيحة بما فيها الهاتف
        _userRepoMock.Verify(r => r.AddAsync(It.Is<User>(u =>
            u.Email == request.Email &&
            u.FullName == request.FullName &&
            u.Phone == request.Phone && // التأكد من تخزين الهاتف
            u.PasswordHash != request.Password // التأكد من التشفير
        )), Times.Once);

        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    // ─── EDGE CASES ─────────────────────────────────────────────────────────

    [Fact]
    public async Task LoginAsync_ShouldThrowException_WhenJwtKeyIsMissing()
    {
        var user = new User { Email = "t@t.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("1"), UserRoles = new List<UserRole>() };
        _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);
        _configMock.Setup(c => c["Jwt:Key"]).Returns((string?)null);

        var service = CreateService();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LoginAsync(new LoginRequest(user.Email, "1")));
    }
}