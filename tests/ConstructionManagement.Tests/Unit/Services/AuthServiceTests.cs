using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
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
    private readonly Mock<ApplicationDbContext> _contextMock = new();
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock = new();
    private readonly Mock<ICompanyRequestRepository> _companyRequestRepoMock = new();
    private readonly Mock<INotificationService> _notificationServiceMock = new();
    private readonly Mock<IRepository<Vendor>> _vendorRepoMock = new();
    private readonly Mock<IRepository<Role>> _roleRepoMock = new();
    private readonly Mock<IRepository<UserRole>> _userRoleRepoMock = new();
    private readonly Mock<ILocalizationService> _localizationServiceMock = new();
    private readonly Mock<ICompanyUserRepository> _companyUserRepoMock = new();

    public AuthServiceTests()
    {
        // تم التعديل إلى jwtSettings (حرف j صغير) ليتطابق مع السطر 102 في AuthService.cs
        _configMock.Setup(c => c["JwtSettings:Key"]).Returns("ThisIsAStrongSecretKeyForTesting123456!");
        _configMock.Setup(c => c["JwtSettings:Issuer"]).Returns("TestIssuer");
        _configMock.Setup(c => c["JwtSettings:Audience"]).Returns("TestAudience");
        _localizationServiceMock.Setup(l => l.GetString(It.IsAny<string>(), It.IsAny<object[]>()))
            .Returns((string key, object[] args) => key);
    }

    private AuthService CreateService()
    {
        return new AuthService(
            _userRepoMock.Object,
            _configMock.Object,
            _uowMock.Object,
            _contextMock.Object,
            _httpContextAccessorMock.Object,
            _companyRequestRepoMock.Object,
            _notificationServiceMock.Object,
            _vendorRepoMock.Object,
            _roleRepoMock.Object,
            _userRoleRepoMock.Object,
            _localizationServiceMock.Object,
            _companyUserRepoMock.Object
        );
    }

    // ─── LOGIN TESTS ────────────────────────────────────────────────────────

    [Fact]
    public async Task LoginAsync_WhenCredentialsAreValid_ReturnsSuccessWithToken()
    {
        // Arrange
        var password = "SafePassword@123";
        var user = new User
        {
            Id = 1,
            FirstName = "Ahmed",
            LastName = "Ramadan",
            Email = "ahmed@eng.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CompanyId = 1,
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
        var request = new LoginRequest("wrong@email.com", "password@123");

        // Act
        var result = await service.LoginAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Invalid email or password");
    }

    // ─── REGISTER TESTS ─────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterAsync_WhenDataIsValid_ShouldSaveUserWithCorrectData()
    {
        // Arrange
        var request = new RegisterRequest("Ahmed Ramadan", "ahmed@test.com", "StrongPass@123", "01000000000", UserType.NormalUser);
        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);
        _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => u);
        _uowMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

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
        var request = new RegisterRequest("New User", "existing@test.com", "StrongPass@123", "0123456789", UserType.NormalUser);
        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(new User());

        var service = CreateService();

        // Act
        var result = await service.RegisterAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Be("Email is already registered");
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
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@123"),
            UserType = UserType.NormalUser
        };
        _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);
        
        var configWithoutKey = new Mock<IConfiguration>();
        configWithoutKey.Setup(c => c["JwtSettings:Key"]).Returns((string?)null);
        
        var serviceWithoutKey = new AuthService(
            _userRepoMock.Object,
            configWithoutKey.Object,
            _uowMock.Object,
            _contextMock.Object,
            _httpContextAccessorMock.Object,
            _companyRequestRepoMock.Object,
            _notificationServiceMock.Object,
            _vendorRepoMock.Object,
            _roleRepoMock.Object,
            _userRoleRepoMock.Object,
            _localizationServiceMock.Object,
            _companyUserRepoMock.Object
        );

        var request = new LoginRequest(user.Email, "Test@123");

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => serviceWithoutKey.LoginAsync(request));
    }
}
