using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Service;

public class TransactionRollbackIntegrationTests : IntegrationTestBase
{
    [Fact]
    public async Task CreateTransaction_WithDatabaseError_RollsBackTransaction()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var initialTransactionCount = await Context.ProjectTransactions.CountAsync();

        // Act & Assert - Simulate a transaction that should fail
        // We'll use a transaction scope to test rollback
        using var transaction = await Context.Database.BeginTransactionAsync();

        try
        {
            var transaction = new ProjectTransaction
            {
                ProjectId = project.Id,
                TransactionType = TransactionType.Expense,
                Amount = 5000.00m,
                Description = "Test transaction",
                TransactionDate = DateTime.UtcNow,
                CreatedByUserId = user.Id
            };

            Context.ProjectTransactions.Add(transaction);
            await Context.SaveChangesAsync();

            // Simulate an error condition
            throw new InvalidOperationException("Simulated error for rollback test");
        }
        catch
        {
            await transaction.RollbackAsync();
        }

        // Assert - Verify rollback occurred
        var finalTransactionCount = await Context.ProjectTransactions.CountAsync();
        finalTransactionCount.Should().Be(initialTransactionCount, "Transaction should have been rolled back");
    }

    [Fact]
    public async Task CreateProject_WithDatabaseError_RollsBackProject()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");

        var initialProjectCount = await Context.Projects.CountAsync();

        // Act & Assert - Simulate a project creation that should fail
        using var transaction = await Context.Database.BeginTransactionAsync();

        try
        {
            var project = new Project
            {
                ProjectName = "Test Project",
                OwnerUserId = 1,
                AccountingSystem = CalculationMethod.Measured,
                Status = "Active"
            };

            Context.Projects.Add(project);
            await Context.SaveChangesAsync();

            // Simulate an error condition
            throw new InvalidOperationException("Simulated error for rollback test");
        }
        catch
        {
            await transaction.RollbackAsync();
        }

        // Assert - Verify rollback occurred
        var finalProjectCount = await Context.Projects.CountAsync();
        finalProjectCount.Should().Be(initialProjectCount, "Project should have been rolled back");
    }

    [Fact]
    public async Task CreateDailyLog_WithDatabaseError_RollsBackDailyLog()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var boqItem = new BOQItem
        {
            ProjectId = project.Id,
            ItemName = "Test Item",
            Unit = "m2",
            UnitRate = 100,
            Quantity = 1000
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var initialDailyLogCount = await Context.DailyLogs.CountAsync();

        // Act & Assert - Simulate a daily log creation that should fail
        using var transaction = await Context.Database.BeginTransactionAsync();

        try
        {
            var dailyLog = new DailyLog
            {
                BOQItemId = boqItem.Id,
                LogDate = DateTime.UtcNow.Date,
                CompletionPercentage = 50,
                Notes = "Test daily log",
                IsClosed = false
            };

            Context.DailyLogs.Add(dailyLog);
            await Context.SaveChangesAsync();

            // Simulate an error condition
            throw new InvalidOperationException("Simulated error for rollback test");
        }
        catch
        {
            await transaction.RollbackAsync();
        }

        // Assert - Verify rollback occurred
        var finalDailyLogCount = await Context.DailyLogs.CountAsync();
        finalDailyLogCount.Should().Be(initialDailyLogCount, "Daily log should have been rolled back");
    }

    [Fact]
    public async Task CreateMultipleEntities_WithPartialFailure_RollsBackAll()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var initialCounts = new
        {
            Projects = await Context.Projects.CountAsync(),
            Transactions = await Context.ProjectTransactions.CountAsync(),
            DailyLogs = await Context.DailyLogs.CountAsync()
        };

        // Act & Assert - Create multiple entities and fail on the last one
        using var transaction = await Context.Database.BeginTransactionAsync();

        try
        {
            // Create project
            var project2 = new Project
            {
                ProjectName = "Test Project 2",
                OwnerUserId = user.Id,
                AccountingSystem = CalculationMethod.Measured,
                Status = "Active"
            };
            Context.Projects.Add(project2);

            // Create transaction
            var transaction = new ProjectTransaction
            {
                ProjectId = project.Id,
                TransactionType = TransactionType.Expense,
                Amount = 5000.00m,
                Description = "Test transaction",
                TransactionDate = DateTime.UtcNow,
                CreatedByUserId = user.Id
            };
            Context.ProjectTransactions.Add(transaction);

            // Create daily log
            var boqItem = new BOQItem
            {
                ProjectId = project.Id,
                ItemName = "Test Item",
                Unit = "m2",
                UnitRate = 100,
                Quantity = 1000
            };
            Context.BOQItems.Add(boqItem);

            var dailyLog = new DailyLog
            {
                BOQItemId = boqItem.Id,
                LogDate = DateTime.UtcNow.Date,
                CompletionPercentage = 50,
                Notes = "Test daily log",
                IsClosed = false
            };
            Context.DailyLogs.Add(dailyLog);

            await Context.SaveChangesAsync();

            // Simulate an error condition
            throw new InvalidOperationException("Simulated error for rollback test");
        }
        catch
        {
            await transaction.RollbackAsync();
        }

        // Assert - Verify all entities were rolled back
        var finalCounts = new
        {
            Projects = await Context.Projects.CountAsync(),
            Transactions = await Context.ProjectTransactions.CountAsync(),
            DailyLogs = await Context.DailyLogs.CountAsync()
        };

        finalCounts.Projects.Should().Be(initialCounts.Projects, "Projects should have been rolled back");
        finalCounts.Transactions.Should().Be(initialCounts.Transactions, "Transactions should have been rolled back");
        finalCounts.DailyLogs.Should().Be(initialCounts.DailyLogs, "Daily logs should have been rolled back");
    }

    [Fact]
    public async Task UpdateEntity_WithDatabaseError_RollsBackUpdate()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var originalProjectName = project.ProjectName;

        // Act & Assert - Update project and fail
        using var transaction = await Context.Database.BeginTransactionAsync();

        try
        {
            project.ProjectName = "Updated Project Name";
            Context.Projects.Update(project);
            await Context.SaveChangesAsync();

            // Simulate an error condition
            throw new InvalidOperationException("Simulated error for rollback test");
        }
        catch
        {
            await transaction.RollbackAsync();
        }

        // Assert - Verify update was rolled back
        var updatedProject = await Context.Projects.FindAsync(project.Id);
        updatedProject.Should().NotBeNull();
        updatedProject!.ProjectName.Should().Be(originalProjectName, "Project name should not have been updated");
    }

    [Fact]
    public async Task DeleteEntity_WithDatabaseError_RollsBackDelete()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var initialProjectCount = await Context.Projects.CountAsync();

        // Act & Assert - Delete project and fail
        using var transaction = await Context.Database.BeginTransactionAsync();

        try
        {
            Context.Projects.Remove(project);
            await Context.SaveChangesAsync();

            // Simulate an error condition
            throw new InvalidOperationException("Simulated error for rollback test");
        }
        catch
        {
            await transaction.RollbackAsync();
        }

        // Assert - Verify delete was rolled back
        var finalProjectCount = await Context.Projects.CountAsync();
        finalProjectCount.Should().Be(initialProjectCount, "Project should not have been deleted");

        var deletedProject = await Context.Projects.FindAsync(project.Id);
        deletedProject.Should().NotBeNull("Project should still exist after rollback");
    }
}
