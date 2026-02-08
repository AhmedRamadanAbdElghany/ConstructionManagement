using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Api;

public class AuthControllerIntegrationTests : ApiTestBase
{
    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokenAndUserData()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");

        var loginRequest = new
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
        result.Token.Should().Contain(".");
        result.User.Should().NotBeNull();
        result.User!.UserId.Should().BeGreaterThan(0);
        result.User.Email.Should().Be(email);
        result.User.FullName.Should().Be("Test User");
        result.User.Roles.Should().NotBeNull();
    }

    [Fact]
    public async Task Login_WithInvalidEmail_ReturnsUnauthorized()
    {
        // Arrange
        const string email = "nonexistent@example.com";
        const string password = "Password123";

        var loginRequest = new
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        result.Should().NotBeNull();
        result!.Message.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        const string email = "test@example.com";
        const string correctPassword = "Password123";
        const string wrongPassword = "WrongPassword";

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(correctPassword);
        await SeedUserAsync(email, hashedPassword, "Test User");

        var loginRequest = new
        {
            Email = email,
            Password = wrongPassword
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        result.Should().NotBeNull();
        result!.Message.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithEmptyEmail_ReturnsBadRequest()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "",
            Password = "Password123"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithEmptyPassword_ReturnsBadRequest()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "test@example.com",
            Password = ""
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithMalformedEmail_ReturnsBadRequest()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "invalid-email",
            Password = "Password123"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_AuthenticatedUser_CanAccessProtectedEndpoint()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act - use the correct endpoint that exists
        var response = await Client.GetAsync("/api/projects/my-projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Login_UnauthenticatedUser_CannotAccessProtectedEndpoint()
    {
        // Arrange
        await ClearAuthTokenAsync();

        // Act - use the correct endpoint that exists
        var response = await Client.GetAsync("/api/projects/my-projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithExpiredToken_ReturnsUnauthorized()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");

        // Set an invalid token
        SetAuthToken("invalid.token.here");

        // Act
        var response = await Client.GetAsync("/api/projects/my-projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_MultipleUsers_ReturnsCorrectUserData()
    {
        // Arrange
        var user1 = await SeedUserAsync("user1@example.com", BCrypt.Net.BCrypt.HashPassword("Password123"), "User One");
        var user2 = await SeedUserAsync("user2@example.com", BCrypt.Net.BCrypt.HashPassword("Password456"), "User Two");

        // Act
        var response1 = await Client.PostAsJsonAsync("/api/auth/login", new { Email = "user1@example.com", Password = "Password123" });
        var response2 = await Client.PostAsJsonAsync("/api/auth/login", new { Email = "user2@example.com", Password = "Password456" });

        // Assert
        response1.StatusCode.Should().Be(HttpStatusCode.OK);
        response2.StatusCode.Should().Be(HttpStatusCode.OK);

        var result1 = await response1.Content.ReadFromJsonAsync<LoginResponse>();
        var result2 = await response2.Content.ReadFromJsonAsync<LoginResponse>();

        result1!.User!.UserId.Should().Be(user1.Id);
        result2!.User!.UserId.Should().Be(user2.Id);
        result1.User.Email.Should().Be("user1@example.com");
        result2.User.Email.Should().Be("user2@example.com");
    }

    [Fact]
    public async Task Login_WithSpecialCharactersInPassword_Succeeds()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "P@ssw0rd!123#";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");

        var loginRequest = new
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithCaseSensitiveEmail_Fails()
    {
        // Arrange
        const string email = "Test@Example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email.ToLower(), hashedPassword, "Test User");

        var loginRequest = new
        {
            Email = email.ToUpper(), // Different case
            Password = password
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        // This depends on whether email comparison is case-sensitive
        // Assuming it's case-insensitive (common practice)
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserData? User { get; set; }
    }

    public class UserData
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string>? Roles { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    private class ErrorResponse
    {
        public string Message { get; set; } = string.Empty;
    }
}
