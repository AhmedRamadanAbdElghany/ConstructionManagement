using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ConstructionManagement.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for EF Core tools (migrations, dotnet ef commands, etc.).
/// Uses the master database connection string (not tenant-specific).
/// </summary>
/// 
/*
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{

    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Try to locate the WebApi project folder (where appsettings.json lives)
        var currentDir = Directory.GetCurrentDirectory();

        var possibleBasePaths = new[]
        {
            Path.Combine(currentDir, "ConstructionManagement.WebApi"),
            Path.Combine(currentDir, "..", "ConstructionManagement.WebApi"),
            Path.Combine(currentDir, "..", "..", "ConstructionManagement.WebApi"),
            Path.Combine(currentDir, "..", "..", "..", "ConstructionManagement.WebApi"),
            currentDir // fallback: current directory
        };

        string? configBasePath = null;
        foreach (var path in possibleBasePaths)
        {
            if (Directory.Exists(path))
            {
                var settingsPath = Path.Combine(path, "appsettings.json");
                if (File.Exists(settingsPath))
                {
                    configBasePath = path;
                    break;
                }
            }
        }

        if (string.IsNullOrEmpty(configBasePath))
        {
            throw new InvalidOperationException(
                "Could not locate appsettings.json. " +
                "Make sure you run migrations from the solution root or inside the WebApi project folder. " +
                $"Searched paths: {string.Join(", ", possibleBasePaths)}");
        }

        // Build configuration with environment support
        var configuration = new ConfigurationBuilder()
            .SetBasePath(configBasePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        // Get the master connection string (for design-time / migrations)
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' not found in appsettings.json or environment variables. " +
                "This factory uses the master database for migrations – tenant switching happens at runtime only.");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        // Optional: enable more detailed EF Core output during migrations (uncomment if needed)
        // optionsBuilder.EnableSensitiveDataLogging();
        // optionsBuilder.EnableDetailedErrors();

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
*/
