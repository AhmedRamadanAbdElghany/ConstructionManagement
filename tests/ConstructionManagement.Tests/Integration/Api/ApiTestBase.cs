using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ConstructionManagement.Tests.Integration.Api;

public abstract class ApiTestBase : IAsyncDisposable
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    protected readonly ApplicationDbContext Context;

    protected ApiTestBase()
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
        Environment.SetEnvironmentVariable("IsTesting", "true");

        // Configure test settings
        var testSettings = new Dictionary<string, string?>
        {
            { "JwtSettings:Key", "SuperSecretKey12345678901234567890" },
            { "JwtSettings:Issuer", "TestIssuer" },
            { "JwtSettings:Audience", "TestAudience" },
            { "JwtSettings:ExpiryInMinutes", "60" },
            { "ConnectionStrings:DefaultConnection", "DataSource=:memory:" },
            { "IsTesting", "true" }
        };

        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddInMemoryCollection(testSettings);
                });

                builder.ConfigureServices(services =>
                {
                    // Remove existing DbContext
                    var dbDescriptor = services.FirstOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (dbDescriptor != null)
                        services.Remove(dbDescriptor);

                    // Add in-memory DbContext
                    services.AddDbContext<ApplicationDbContext>(options =>
                        options.UseSqlite("DataSource=:memory:"), ServiceLifetime.Scoped);

                    // Replace ICompanyContext
                    var companyDesc = services.FirstOrDefault(d => d.ServiceType == typeof(ICompanyContext));
                    if (companyDesc != null)
                        services.Remove(companyDesc);
                    services.AddScoped<ICompanyContext>(sp => new CompanyContext { CompanyId = 1 });
                });
            });

        Client = Factory.CreateClient();

        // Use the same context for tests
        var scope = Factory.Services.CreateScope();
        Context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        Context.Database.OpenConnection();
        Context.Database.EnsureCreated();
    }

    protected async Task<string> AuthenticateAsync(string email, string password)
    {
        var loginRequest = new LoginRequest(email, password);
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Login failed ({response.StatusCode}): {error}");
        }

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>(options);
        
        if (result == null || string.IsNullOrEmpty(result.Token))
            throw new InvalidOperationException("Login succeeded but token is null or empty");
        
        return result.Token;
    }

    protected void SetAuthToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    protected Task ClearAuthTokenAsync()
    {
        Client.DefaultRequestHeaders.Authorization = null;
        return Task.CompletedTask;
    }

    protected async Task<User> SeedUserAsync(string email, string passwordHash, string fullName = "Test User", int? companyId = 1)
    {
        var nameParts = fullName.Split(' ', 2);
        var user = new User
        {
            FirstName = nameParts[0],
            LastName = nameParts.Length > 1 ? nameParts[1] : "",
            Email = email,
            PasswordHash = passwordHash,
            CompanyId = companyId,
            CreatedAt = DateTime.UtcNow
        };
        
        // Remove existing user with same email
        var existing = await Context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existing != null)
            Context.Users.Remove(existing);
        
        Context.Users.Add(user);
        await Context.SaveChangesAsync();
        return user;
    }

    protected async Task<Project> SeedProjectAsync(string name, int ownerUserId, Action<Project>? configure = null)
    {
        var project = new Project
        {
            ProjectName = name,
            OwnerUserId = ownerUserId,
            AccountingSystem = CalculationMethod.Measured,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };
        
        configure?.Invoke(project);
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();
        return project;
    }

    public async ValueTask DisposeAsync()
    {
        await Context.Database.CloseConnectionAsync();
        await Context.DisposeAsync();
        await Factory.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    private class LoginResponseDto
    {
        [JsonPropertyName("token")]
        public string Token { get; set; } = "";
        
        [JsonPropertyName("user")]
        public UserDto? User { get; set; }
    }

    private class UserDto
    {
        [JsonPropertyName("userId")]
        public int UserId { get; set; }
        
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = "";
        
        [JsonPropertyName("email")]
        public string Email { get; set; } = "";
        
        [JsonPropertyName("roles")]
        public List<string>? Roles { get; set; }
        
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }
    }
}
