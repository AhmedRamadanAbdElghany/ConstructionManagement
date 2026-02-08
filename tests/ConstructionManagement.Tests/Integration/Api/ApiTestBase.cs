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

    private readonly Microsoft.Data.Sqlite.SqliteConnection _connection;

    protected ApiTestBase()
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
        Environment.SetEnvironmentVariable("IsTesting", "true");

        // Initialize and open the connection
        _connection = new Microsoft.Data.Sqlite.SqliteConnection("DataSource=:memory:");
        _connection.Open();

        // Configure test settings
        var testSettings = new Dictionary<string, string?>
        {
            { "JwtSettings:Key", "SuperSecretKey12345678901234567890" },
            { "JwtSettings:Issuer", "TestIssuer" },
            { "JwtSettings:Audience", "TestAudience" },
            { "JwtSettings:ExpiryInMinutes", "60" },
            // Connection string is not used when passing connection instance, but good to have meaningful default
            { "ConnectionStrings:DefaultConnection", "DataSource=:memory:" },
            { "IsTesting", "true" }
        };

        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Development");
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

                    // Register the shared connection
                    services.AddSingleton<System.Data.Common.DbConnection>(_connection);

                    // Add in-memory DbContext using the shared connection
                    services.AddDbContext<ApplicationDbContext>((sp, options) =>
                    {
                        var connection = sp.GetRequiredService<System.Data.Common.DbConnection>();
                        options.UseSqlite(connection);
                    }, ServiceLifetime.Scoped);

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

        // EnsureCreated uses the open connection
        Context.Database.EnsureCreated();
        
        // Seed base test data (company and roles)
        SeedBaseData();
    }

    /// <summary>
    /// Seeds essential base data (Company and Roles) required for authentication to work
    /// </summary>
    private void SeedBaseData()
    {
        // Seed Company if not exists
        if (!Context.Companies.IgnoreQueryFilters().Any(c => c.Id == 1))
        {
            Context.Companies.Add(new Company
            {
                Id = 1,
                Name = "Test Company",
                IsActive = true
            });
            Context.SaveChanges();
        }
        
        // Seed default roles if not exist (check by name, not by empty table)
        if (!Context.Roles.IgnoreQueryFilters().Any(r => r.Name == "SuperAdmin"))
        {
            Context.Roles.Add(new Role { Name = "SuperAdmin", Description = "Super Administrator", CompanyId = null });
        }
        if (!Context.Roles.IgnoreQueryFilters().Any(r => r.Name == "Admin"))
        {
            Context.Roles.Add(new Role { Name = "Admin", Description = "Company Administrator", CompanyId = 1 });
        }
        if (!Context.Roles.IgnoreQueryFilters().Any(r => r.Name == "User"))
        {
            Context.Roles.Add(new Role { Name = "User", Description = "Regular User", CompanyId = 1 });
        }
        
        Context.SaveChanges();
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

        var content = await response.Content.ReadAsStringAsync();
        // Console.WriteLine($"Login Response: {content}"); 

        var result = JsonSerializer.Deserialize<LoginResponseDto>(content, options);
        
        if (result == null || string.IsNullOrEmpty(result.Token))
            throw new InvalidOperationException($"Login succeeded but token is null or empty. content: {content}");
        
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
        return await SeedUserWithRolesAsync(email, passwordHash, fullName, companyId, "User");
    }

    protected async Task<User> SeedUserWithRolesAsync(string email, string passwordHash, string fullName = "Test User", int? companyId = 1, params string[] roleNames)
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
        
        // Remove existing user with same email and their UserRoles
        var existing = await Context.Users.IgnoreQueryFilters()
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Email == email);
        if (existing != null)
        {
            Context.UserRoles.RemoveRange(existing.UserRoles);
            Context.Users.Remove(existing);
            await Context.SaveChangesAsync();
        }
        
        Context.Users.Add(user);
        await Context.SaveChangesAsync();
        
        // Assign roles
        if (roleNames.Length > 0)
        {
            foreach (var roleName in roleNames)
            {
                var role = await Context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == roleName);
                if (role != null)
                {
                    Context.UserRoles.Add(new UserRole
                    {
                        UserId = user.Id,
                        RoleId = role.Id,
                        CompanyId = companyId,
                        AssignedAt = DateTime.UtcNow
                    });
                }
            }
            await Context.SaveChangesAsync();
            
            // Reload user with roles
            user = await Context.Users.IgnoreQueryFilters()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstAsync(u => u.Id == user.Id);
        }
        
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

        // Seed project settings as they are required by some services
        if (!Context.ProjectSettings.IgnoreQueryFilters().Any(s => s.Id == project.Id))
        {
            Context.ProjectSettings.Add(new ProjectSettings { Id = project.Id });
            await Context.SaveChangesAsync();
        }

        return project;
    }

    public async ValueTask DisposeAsync()
    {
        await Context.Database.CloseConnectionAsync();
        await Context.DisposeAsync();
        await Factory.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    public class LoginResponseDto
    {
        [JsonPropertyName("token")]
        public string Token { get; set; } = "";
        
        [JsonPropertyName("user")]
        public UserDto? User { get; set; }
    }

    public class UserDto
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
