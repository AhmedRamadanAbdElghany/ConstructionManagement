using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Application.Interfaces;
namespace ConstructionManagement.Tests.Integration;

public class FullSystemIntegrationTests : IntegrationTestBase
{
	private readonly AuthService _authService;
	private readonly BOQItemService _boqService;
	private readonly IConfiguration _config;
	private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock = new();
	private readonly Mock<ICompanyRequestRepository> _companyRequestRepoMock = new();
	private readonly Mock<INotificationService> _notificationServiceMock = new();
	private readonly Mock<ILocalizationService> _localizationServiceMock = new();

	public FullSystemIntegrationTests()
	{
		// Create in-memory configuration with proper keys (matching AuthService expectation)
		_config = new ConfigurationBuilder()
			.AddInMemoryCollection(new Dictionary<string, string?>
			{
				{ "jwtSettings:Key", "SuperSecretKeyForTesting1234567890123456" },
				{ "jwtSettings:Issuer", "TestIssuer" },
				{ "jwtSettings:Audience", "TestAudience" }
			})
			.Build();

		// Initialize repositories and services with real implementations
		var userRepository = new UserRepository(Context);

		_authService = new AuthService(
			userRepository,
			_config,
			UnitOfWork,
			_httpContextAccessorMock.Object,
			_companyRequestRepoMock.Object,
			_notificationServiceMock.Object,
			new Repository<Vendor>(Context),
			new Repository<Role>(Context),
			new Repository<UserRole>(Context),
			_localizationServiceMock.Object);

		_boqService = new BOQItemService(
			new Repository<BOQItem>(Context),
			new Repository<BOQMeasured>(Context),
			new Repository<BOQSupervision>(Context),
			new Repository<BOQPackage>(Context),
			new Repository<ItemInvoice>(Context),
			new Repository<Project>(Context),
			new Mock<IActivityLogService>().Object,
			UnitOfWork);
	}

	[Fact]
	public async Task Auth_LoginFullProcess_ShouldSucceed()
	{
		// Arrange
		var password = "Password123!";
		// Ensure TenantId is set for GenerateJwtToken call
		var user = await SeedUserAsync("test@system.com", BCrypt.Net.BCrypt.HashPassword(password), "Test User");

		// Act
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
		var user = await SeedUserAsync("boq@test.com", "any_hash", "BOQ User");

		var project = new Project
		{
			ProjectName = "Project 1",
			OwnerUserId = user.Id,
			AccountingSystem = CalculationMethod.Measured,
			Status = "Active"
		};
		Context.Projects.Add(project);
		await Context.SaveChangesAsync();

		var request = new CreateBOQItemRequest(
			null, "C1", "Item 1", "Desc", "Unit", null, null,
			"Measured", 100, 50, null, null, null, null,
            null, null
		);

		// Act
		var itemId = await _boqService.CreateBOQItemAsync(project.Id, request, user.Id);

		// Assert
		var savedItem = await Context.BOQItems
			.Include(i => i.MeasuredData)
			.FirstOrDefaultAsync(i => i.Id == itemId);

		savedItem.Should().NotBeNull();
		savedItem!.ProjectId.Should().Be(project.Id);
		savedItem!.MeasuredData.Should().NotBeNull();
		savedItem.MeasuredData!.UnitPrice.Should().Be(50);
	}

	[Fact]
	public async Task Auth_Project_BOQ_HappyPath_ShouldSucceed()
	{
		// Use the class-level config that is properly configured
		var password = "Password123";
		var user = await SeedUserAsync("sys@test.com", BCrypt.Net.BCrypt.HashPassword(password), "System User");

		var login = await _authService.LoginAsync(new LoginRequest("sys@test.com", password));

		login.Token.Should().NotBeNullOrEmpty();

		var project = await SeedProjectAsync("Project 1", user.Id);

		var itemId = await _boqService.CreateBOQItemAsync(project.Id, new CreateBOQItemRequest(
			null, "C1", "Item 1", "Desc", "Unit", null, null, "Measured", 100m, 50m, null, null, null, null, null, null
		), user.Id);

		var saved = await Context.BOQItems.Include(i => i.MeasuredData).FirstAsync(i => i.Id == itemId);
		saved.MeasuredData.Should().NotBeNull();
	}
}
