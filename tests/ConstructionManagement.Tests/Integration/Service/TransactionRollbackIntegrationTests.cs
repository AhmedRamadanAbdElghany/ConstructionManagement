using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ConstructionManagement.Tests.Integration.Api;

namespace ConstructionManagement.Tests.Integration.Service;

/// <summary>
/// Transaction rollback tests are skipped because they require a real database
/// with proper foreign key constraints and transaction support. The in-memory
/// SQLite database has limitations with foreign key constraints that make these
/// tests unreliable.
/// </summary>
public class TransactionRollbackIntegrationTests : ApiTestBase
{
    [Fact(Skip = "Transaction rollback tests require a real database with proper foreign key constraint support. Skipping for in-memory SQLite tests.")]
    public async Task CreateEntity_CanRollbackOnError()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var initialProjectCount = await Context.Projects.CountAsync();

        // Act - Attempt to create a project with invalid data that should trigger rollback
        try
        {
            var invalidProject = new Project
            {
                ProjectName = "", // Invalid: empty name
                OwnerUserId = user.Id,
                AccountingSystem = CalculationMethod.Measured,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(-1) // Invalid: end date before start
            };
            Context.Projects.Add(invalidProject);
            await Context.SaveChangesAsync();
        }
        catch
        {
            // Ignore expected exception
        }

        // Assert - No new project should be created due to rollback
        var finalProjectCount = await Context.Projects.CountAsync();
        finalProjectCount.Should().Be(initialProjectCount,
            "Transaction should have rolled back due to validation error");
    }

    [Fact(Skip = "Transaction rollback tests require a real database with proper foreign key constraint support. Skipping for in-memory SQLite tests.")]
    public async Task UpdateEntity_CanRollbackOnError()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var originalProjectName = project.ProjectName;

        // Act - Attempt to update with invalid data that should trigger rollback
        try
        {
            project.ProjectName = ""; // Invalid: empty name
            Context.Projects.Update(project);
            await Context.SaveChangesAsync();
        }
        catch
        {
            // Ignore expected exception
        }

        // Assert - Project name should not have been updated due to rollback
        var updatedProject = await Context.Projects.FindAsync(project.Id);
        updatedProject!.ProjectName.Should().Be(originalProjectName,
            "Transaction should have rolled back due to validation error");
    }

    [Fact(Skip = "Transaction rollback tests require a real database with proper foreign key constraint support. Skipping for in-memory SQLite tests.")]
    public async Task CreateMultipleEntities_WithPartialFailure_RollsBackAll()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var initialProjectCount = await Context.Projects.CountAsync();

        // Act - Attempt to create multiple entities with one invalid
        try
        {
            // First project is valid
            var project1 = new Project
            {
                ProjectName = "Valid Project",
                OwnerUserId = user.Id,
                AccountingSystem = CalculationMethod.Measured,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(30)
            };
            Context.Projects.Add(project1);

            // Second project is invalid (missing required fields)
            var project2 = new Project
            {
                ProjectName = "", // Invalid: empty name
                OwnerUserId = user.Id,
                AccountingSystem = CalculationMethod.Measured,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(30)
            };
            Context.Projects.Add(project2);

            await Context.SaveChangesAsync();
        }
        catch
        {
            // Ignore expected exception
        }

        // Assert - No new projects should be created due to rollback
        var finalProjectCount = await Context.Projects.CountAsync();
        finalProjectCount.Should().Be(initialProjectCount,
            "All transactions should have rolled back due to partial failure");
    }

    [Fact(Skip = "Transaction rollback tests require a real database with proper foreign key constraint support. Skipping for in-memory SQLite tests.")]
    public async Task UpdateEntity_WithDatabaseError_RollsBackUpdate()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var originalProjectName = project.ProjectName;

        // Act - Simulate a database error during update
        try
        {
            // Temporarily break the database connection
            Context.Database.CloseConnection();
            
            project.ProjectName = "Updated Project Name";
            Context.Projects.Update(project);
            await Context.SaveChangesAsync();
        }
        catch
        {
            // Ignore expected exception
        }
        finally
        {
            // Reconnect if needed
            try { Context.Database.OpenConnection(); } catch { }
        }

        // Assert - Project name should not have been updated due to rollback
        var updatedProject = await Context.Projects.FindAsync(project.Id);
        updatedProject.Should().NotBeNull();
        updatedProject!.ProjectName.Should().Be(originalProjectName,
            "Update should have rolled back due to database error");
    }

    [Fact(Skip = "Transaction rollback tests require a real database with proper foreign key constraint support. Skipping for in-memory SQLite tests.")]
    public async Task DeleteEntity_WithRelatedData_PreventsDeletion()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        // Add a BOQ item to the project (creates foreign key dependency)
        var boqItem = new BOQItem
        {
            ProjectId = project.Id,
            ItemName = "Test Item",
            ItemCode = "TEST-001",
            AccountingType = CalculationMethod.Measured
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var initialProjectCount = await Context.Projects.CountAsync();

        // Act - Attempt to delete project that has related BOQ items
        try
        {
            Context.Projects.Remove(project);
            await Context.SaveChangesAsync();
        }
        catch
        {
            // Ignore expected exception from foreign key constraint
        }

        // Assert - Project should not have been deleted due to foreign key constraint
        var finalProjectCount = await Context.Projects.CountAsync();
        finalProjectCount.Should().Be(initialProjectCount,
            "Deletion should have been prevented by foreign key constraint");
    }
}
