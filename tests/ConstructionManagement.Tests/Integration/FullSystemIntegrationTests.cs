using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories; // للـ Repository
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions; // ضروري لحل أخطاء .Should()
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration; // ضروري لحل خطأ IConfiguration
using Moq;
using Xunit;
using System.Threading.Tasks;
using System;

namespace ConstructionManagement.Tests.Integration;

public class FullSystemIntegrationTests : IntegrationTestBase
{
    private readonly AuthService _authService;
    private readonly BOQItemService _boqService;

    public FullSystemIntegrationTests()
    {
        // 1. إعداد الـ Configuration
        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c["Jwt:Key"]).Returns("SuperSecretKeyForTesting1234567890123456");
        mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
        mockConfig.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");

        // 2. استخدام UserRepository بدلاً من Repository<User> العام
        // هذا يحل خطأ تحويل النوع CS1503
        var userRepository = new UserRepository(Context);

        _authService = new AuthService(
            userRepository,
            mockConfig.Object,
            UnitOfWork);

        _boqService = new BOQItemService(
            new Repository<BOQItem>(Context),
            new Repository<BOQMeasured>(Context),
            new Repository<BOQSupervision>(Context),
            new Repository<ItemInvoice>(Context),
            new Repository<Project>(Context),
            UnitOfWork);
    }

    [Fact]
    public async Task Auth_LoginFullProcess_ShouldSucceed()
    {
        // Arrange
        var password = "Password123!";
        var user = new User
        {
            FullName = "Test User",
            Email = "test@system.com",
            // تأكد من استخدام نفس طريقة التشفير في مشروعك
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // Act - تأكد من وجود LoginRequest في الـ DTOs
        var result = await _authService.LoginAsync(new LoginRequest("test@system.com", password));

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task BOQ_CreateAndProgress_ShouldPersistCorrectData()
    {
        // Arrange
        var user = new User { FullName = "Admin", Email = "a@a.com", PasswordHash = "any" };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        var project = new Project { ProjectName = "Project 1", OwnerUserId = user.Id };
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();

        var request = new CreateBOQItemRequest(
            "C1", "Item 1", "Desc", "Unit", null, null,
            "Measured", 100, 50, null, null, null, null
        );

        // Act
        var itemId = await _boqService.CreateBOQItemAsync(project.Id, request, user.Id);

        // Assert
        var savedItem = await Context.BOQItems
            .Include(i => i.MeasuredData)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        // الآن .Should() ستعمل بسبب وجود FluentAssertions
        savedItem.Should().NotBeNull();
        savedItem!.MeasuredData.Should().NotBeNull();
        savedItem.MeasuredData!.UnitPrice.Should().Be(50);
    }
}