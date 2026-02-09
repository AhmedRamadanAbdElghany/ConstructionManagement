using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Application.DTOs;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Api;

public class ProjectsControllerIntegrationTests : ApiTestBase
{
    [Fact]
    public async Task CreateProject_WithValidData_ReturnsCreated()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var createRequest = new
        {
            projectName = "Test Project",
            description = "123 Test Street",
            startDate = DateTime.UtcNow.AddDays(1),
            endDate = DateTime.UtcNow.AddDays(90),
            generalManagerUserId = user.Id,
            accountingSystem = "Measured",
            totalContractValue = 100000m
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/projects", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var result = await response.Content.ReadFromJsonAsync<CreateProjectResponse>();
        result.Should().NotBeNull();
        result!.ProjectId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateProject_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        await ClearAuthTokenAsync();

        var createRequest = new
        {
            projectName = "Test Project",
            accountingSystem = "Measured"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/projects", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateProject_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");
        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var createRequest = new
        {
            projectName = "", // Invalid: empty name
            accountingSystem = "Measured"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/projects", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetProject_WithValidId_ReturnsProject()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/projects/{project.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<ProjectDto>();
        result.Should().NotBeNull();
        result!.ProjectName.Should().Be("Test Project");
        result.OwnerUserID.Should().Be(user.Id);
    }

    [Fact]
    public async Task GetProject_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");
        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync("/api/projects/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetMyProjects_ReturnsUserProjects()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        await SeedProjectAsync("Project 1", user.Id);
        await SeedProjectAsync("Project 2", user.Id);
        await SeedProjectAsync("Project 3", user.Id);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync("/api/projects/my-projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<List<ProjectDto>>();
        result.Should().NotBeNull();
        result!.Count.Should().Be(3);
        result.All(p => p.OwnerUserID == user.Id).Should().BeTrue();
    }

    [Fact]
    public async Task UpdateProject_WithValidData_ReturnsOk()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var updateRequest = new
        {
            projectName = "Updated Project Name",
            description = "456 Updated Street"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/projects/{project.Id}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task UpdateProject_WithoutPermission_ReturnsForbidden()
    {
        // Arrange
        const string email1 = "owner@example.com";
        const string email2 = "other@example.com";
        const string password = "Password123";

        var owner = await SeedUserAsync(email1, BCrypt.Net.BCrypt.HashPassword(password), "Owner User");
        var other = await SeedUserAsync(email2, BCrypt.Net.BCrypt.HashPassword(password), "Other User");

        var project = await SeedProjectAsync("Test Project", owner.Id);

        var token = await AuthenticateAsync(email2, password);
        SetAuthToken(token);

        var updateRequest = new
        {
            projectName = "Unauthorized Update"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/projects/{project.Id}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CloseProject_WithValidId_ReturnsOk()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.PutAsync($"/api/projects/{project.Id}/close", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CloseProject_AlreadyClosed_ReturnsBadRequest()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id, configure: p => p.IsClosed = true);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.PutAsync($"/api/projects/{project.Id}/close", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CloseProject_WithoutPermission_ReturnsForbidden()
    {
        // Arrange
        const string email1 = "owner@example.com";
        const string email2 = "other@example.com";
        const string password = "Password123";

        var owner = await SeedUserAsync(email1, BCrypt.Net.BCrypt.HashPassword(password), "Owner User");
        var other = await SeedUserAsync(email2, BCrypt.Net.BCrypt.HashPassword(password), "Other User");

        var project = await SeedProjectAsync("Test Project", owner.Id);

        var token = await AuthenticateAsync(email2, password);
        SetAuthToken(token);

        // Act
        var response = await Client.PutAsync($"/api/projects/{project.Id}/close", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateProject_WithDifferentAccountingMethods_Succeeds()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");
        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var methods = new[] { "Measured", "Supervision", "Packages" };

        foreach (var method in methods)
        {
            var createRequest = new
            {
                projectName = $"{method} Project",
                description = "123 Test Street",
                startDate = DateTime.UtcNow.AddDays(1),
                endDate = DateTime.UtcNow.AddDays(90),
                accountingSystem = method
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/projects", createRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
        }
    }

    [Fact]
    public async Task CreateProject_WithInvalidDateRange_ReturnsBadRequest()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");
        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var createRequest = new
        {
            projectName = "Test Project",
            description = "123 Test Street",
            startDate = DateTime.UtcNow.AddDays(-1), // Invalid: past date
            endDate = DateTime.UtcNow.AddDays(90),
            accountingSystem = "Measured"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/projects", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private class CreateProjectResponse
    {
        public int ProjectId { get; set; }
    }
}
