using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Services;
using ConstructionManagement.WebApi;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Headers;

namespace ConstructionManagement.Tests.Integration.Api;

public abstract class ApiTestBase : IAsyncDisposable
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    protected readonly ApplicationDbContext Context;
    protected readonly ICompanyContext CompanyContext;
    protected readonly IUnitOfWork UnitOfWork;
    protected readonly IConfiguration Configuration;

    protected ApiTestBase()
    {
        // Configure test settings
        var testSettings = new Dictionary<string, string?>
        {
            { "JwtSettings:Key", "SuperSecretKey12345678901234567890" },
            { "JwtSettings:Issuer", "TestIssuer" },
            { "JwtSettings:Audience", "TestAudience" },
            { "JwtSettings:ExpiryInMinutes", "60" },
            { "ConnectionStrings:DefaultConnection", "DataSource=:memory:" }
        };

        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddInMemoryCollection(testSettings);
                });

                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Add in-memory database
                    services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
                    {
                        var companyContext = new CompanyContext { CompanyId = 1 };
                        options.UseSqlite("DataSource=:memory:");
                        var context = new ApplicationDbContext(options.Options, companyContext);
                        context.Database.OpenConnection();
                        context.Database.EnsureCreated();
                        return context;
                    });

                    // Add CompanyContext
                    services.AddScoped<ICompanyContext>(sp => new CompanyContext { CompanyId = 1 });
                });
            });

        Client = Factory.CreateClient();

        // Get services from the factory's service provider
        var scope = Factory.Services.CreateScope();
        Context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        CompanyContext = scope.ServiceProvider.GetRequiredService<ICompanyContext>();
        UnitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        Configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    }

    protected async Task<string> AuthenticateAsync(string email, string password)
    {
        var loginRequest = new
        {
            Email = email,
            Password = password
        };

        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result!.Token;
    }

    protected void SetAuthToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    protected async Task ClearAuthTokenAsync()
    {
        Client.DefaultRequestHeaders.Authorization = null;
    }

    protected async Task<User> SeedUserAsync(string email, string passwordHash, string fullName = "Test User", int? companyId = 1)
    {
        var nameParts = fullName.Split(' ', 2);
        var user = new User
        {
            FirstName = nameParts[0],
            LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            Email = email,
            PasswordHash = passwordHash,
            CompanyId = companyId
        };
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
            Status = "Active"
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

    private class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto? User { get; set; }
    }

    private class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}
