using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.Tests.Integration;

public class FullSystemIntegrationTests : IntegrationTestBase
{
	private readonly AuthService _authService;
	private readonly BOQItemService _boqService;

	public FullSystemIntegrationTests()
	{
		// 1. ????? ??? Configuration ?? ?????? ???? ?????? (jwtSettings ???? j ????)
		var mockConfig = new Mock<IConfiguration>();
		mockConfig.Setup(c => c["jwtSettings:Key"]).Returns("SuperSecretKeyForTesting1234567890123456");
		mockConfig.Setup(c => c["jwtSettings:Issuer"]).Returns("TestIssuer");
		mockConfig.Setup(c => c["jwtSettings:Audience"]).Returns("TestAudience");

		// 2. ????? ??? Repositories
		var userRepository = new UserRepository(Context);

		_authService = new AuthService(
			userRepository,
			mockConfig.Object,
			UnitOfWork);

		_boqService = new BOQItemService(
			new Repository<BOQItem>(Context),
			new Repository<BOQMeasured>(Context),
			new Repository<BOQSupervision>(Context),
			new Repository<BOQPackage>(Context),
			new Repository<ItemInvoice>(Context),
			new Repository<Project>(Context),
			UnitOfWork);
	}

	[Fact]
	public async Task Auth_LoginFullProcess_ShouldSucceed()
	{
		// Arrange
		var password = "Password123!";
		// ???? ?? ????? TenantId ??? ??? GenerateJwtToken ??????
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
			"C1", "Item 1", "Desc", "Unit", null, null,
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
		// ????? ???? ??? Configuration ???? ????? ?????? ?? ?????? ?????? jwtSettings
		var config = new ConfigurationBuilder()
			.AddInMemoryCollection(new Dictionary<string, string?>
			{
				{ "jwtSettings:Key", "SuperSecretKeyForTesting1234567890123456" },
				{ "jwtSettings:Issuer", "TestIssuer" },
				{ "jwtSettings:Audience", "TestAudience" }
			})
			.Build();

		var password = "Password123";
		var user = await SeedUserAsync("sys@test.com", BCrypt.Net.BCrypt.HashPassword(password), "System User");

		var auth = new AuthService(new UserRepository(Context), config, UnitOfWork);
		var login = await auth.LoginAsync(new LoginRequest("sys@test.com", password));

		login.Token.Should().NotBeNullOrEmpty();

		var project = await SeedProjectAsync("Project 1", user.Id);

		var itemId = await _boqService.CreateBOQItemAsync(project.Id, new CreateBOQItemRequest(
			"C1", "Item 1", "Desc", "Unit", null, null, "Measured", 100m, 50m, null, null, null, null, null, null
		), user.Id);

		var saved = await Context.BOQItems.Include(i => i.MeasuredData).FirstAsync(i => i.Id == itemId);
		saved.MeasuredData.Should().NotBeNull();
	}
}
