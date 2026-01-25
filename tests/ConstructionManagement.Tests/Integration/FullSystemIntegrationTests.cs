using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories; // للـ Repository
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions; // ضروري لحل أخطاء .Should()
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration; // ضروري لحل خطأ IConfiguration
using Moq;
using Xunit;

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
        mockConfig.Setup(c => c["JwtSettings:Key"]).Returns("SuperSecretKeyForTesting1234567890123456");
        mockConfig.Setup(c => c["JwtSettings:Issuer"]).Returns("TestIssuer");
        mockConfig.Setup(c => c["JwtSettings:Audience"]).Returns("TestAudience");

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

    // Test Case: Auth_Project_BOQ_HappyPath_ShouldSucceed
    // Step # | Step Description                         | Expected Result
    // 1      | Seed user + configure JWT                | User exists, config ready
    // 2      | Login via AuthService                    | Token returned
    // 3      | Create project                           | Project persisted
    // 4      | Create BOQ item                           | Measured data saved

    [Fact]
    public async Task Auth_LoginFullProcess_ShouldSucceed()
    {
        // Arrange
        var password = "Password123!";
        var user = await SeedUserAsync("test@system.com", BCrypt.Net.BCrypt.HashPassword(password));

        // Act - تأكد من وجود LoginRequest في الـ DTOs
        var result = await _authService.LoginAsync(new LoginRequest("test@system.com", password));

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User!.Email.Should().Be("test@system.com");
    }

    [Fact]
    public async Task BOQ_CreateAndProgress_ShouldPersistCorrectData()
    {
        // Arrange
        var user = new User { FullName = "Admin", Email = "a@a.com", PasswordHash = "any" };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        var project = new Project
        {
            ProjectName = "Project 1",
            OwnerUserId = user.Id,
            AccountingSystem = "Measured",
            Status = "Active"
        };
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
        savedItem!.ProjectId.Should().Be(project.Id);
        savedItem!.MeasuredData.Should().NotBeNull();
        savedItem.MeasuredData!.UnitPrice.Should().Be(50);
    }

    [Fact]
    public async Task Auth_Project_BOQ_HappyPath_ShouldSucceed()
    {
        // Test case:
        // 1) Auth_Project_BOQ_HappyPath_ShouldSucceed
        //    Steps: seed user -> login via AuthService -> create project -> create BOQ item -> assert measured data persisted.

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Jwt:Key", "SuperSecretKeyForTesting1234567890123456" },
                { "Jwt:Issuer", "TestIssuer" },
                { "Jwt:Audience", "TestAudience" }
            })
            .Build();

        var password = "Password123";
        var user = await SeedUserAsync("sys@test.com", BCrypt.Net.BCrypt.HashPassword(password), "System User");

        var auth = new AuthService(new UserRepository(Context), config, UnitOfWork);
        var login = await auth.LoginAsync(new LoginRequest("sys@test.com", password));
        login.Token.Should().NotBeNullOrEmpty();

        var project = await SeedProjectAsync("Project 1", user.Id);

        var boq = new BOQItemService(
            new Repository<BOQItem>(Context),
            new Repository<BOQMeasured>(Context),
            new Repository<BOQSupervision>(Context),
            new Repository<ItemInvoice>(Context),
            new Repository<Project>(Context),
            UnitOfWork);

        var itemId = await boq.CreateBOQItemAsync(project.Id, new CreateBOQItemRequest(
            "C1", "Item 1", "Desc", "Unit", null, null, "Measured", 100m, 50m, null, null, null, null
        ), user.Id);

        var saved = await Context.BOQItems.Include(i => i.MeasuredData).FirstAsync(i => i.Id == itemId);
        saved.MeasuredData.Should().NotBeNull();
    }

    // DOCUMENTATION TABLES (replace with full 113 test-case tables):
    // Test Case: <Name>
    // Step # | Step Description | Expected Result
    // 1      | ...              | ...
}