using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Service;

public class ConcurrencyHandlingIntegrationTests : IntegrationTestBase
{
    [Fact]
    public async Task ConcurrentProjectUpdates_LastWriteWins()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        // Act - Simulate concurrent updates
        var task1 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var proj = await context.Projects.FindAsync(project.Id);
            if (proj != null)
            {
                proj!.ProjectName = "Updated by Task 1";
                context.Projects.Update(proj);
                await context.SaveChangesAsync();
            }
        });

        var task2 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var proj = await context.Projects.FindAsync(project.Id);
            if (proj != null)
            {
                proj!.ProjectName = "Updated by Task 2";
                context.Projects.Update(proj);
                await context.SaveChangesAsync();
            }
        });

        await Task.WhenAll(task1, task2);

        // Assert - Verify last write wins
        var finalProject = await Context.Projects.FindAsync(project.Id);
        finalProject.Should().NotBeNull();
        finalProject!.ProjectName.Should().BeOneOf("Updated by Task 1", "Updated by Task 2",
            "One of the concurrent updates should have been applied");
    }

    [Fact]
    public async Task ConcurrentTransactionCreation_BothSucceed()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var initialTransactionCount = await Context.ProjectTransactions.CountAsync();

        // Act - Create transactions concurrently
        var task1 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var transaction = new ProjectTransaction
            {
                ProjectId = project.Id,
                TransactionType = TransactionType.Expense,
                Amount = 1000.00m,
                Description = "Transaction from Task 1",
                TransactionDate = DateTime.UtcNow,
                CreatedByUserId = user.Id
            };
            context.ProjectTransactions.Add(transaction);
            await context.SaveChangesAsync();
        });

        var task2 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var transaction = new ProjectTransaction
            {
                ProjectId = project.Id,
                TransactionType = TransactionType.Invoice,
                Amount = 2000.00m,
                Description = "Transaction from Task 2",
                TransactionDate = DateTime.UtcNow,
                CreatedByUserId = user.Id
            };
            context.ProjectTransactions.Add(transaction);
            await context.SaveChangesAsync();
        });

        await Task.WhenAll(task1, task2);

        // Assert - Both transactions should be created
        var finalTransactionCount = await Context.ProjectTransactions.CountAsync();
        finalTransactionCount.Should().Be(initialTransactionCount + 2,
            "Both concurrent transactions should have been created");
    }

    [Fact]
    public async Task ConcurrentDailyLogCreation_BothSucceed()
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

        // Act - Create daily logs concurrently
        var task1 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var dailyLog = new DailyLog
            {
                BOQItemId = boqItem.Id,
                LogDate = DateTime.UtcNow.Date,
                CompletionPercentage = 50,
                Notes = "Daily log from Task 1",
                IsClosed = false
            };
            context.DailyLogs.Add(dailyLog);
            await context.SaveChangesAsync();
        });

        var task2 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var dailyLog = new DailyLog
            {
                BOQItemId = boqItem.Id,
                LogDate = DateTime.UtcNow.Date.AddDays(1),
                CompletionPercentage = 75,
                Notes = "Daily log from Task 2",
                IsClosed = false
            };
            context.DailyLogs.Add(dailyLog);
            await context.SaveChangesAsync();
        });

        await Task.WhenAll(task1, task2);

        // Assert - Both daily logs should be created
        var finalDailyLogCount = await Context.DailyLogs.CountAsync();
        finalDailyLogCount.Should().Be(initialDailyLogCount + 2,
            "Both concurrent daily logs should have been created");
    }

    [Fact]
    public async Task ConcurrentBOQItemUpdates_LastWriteWins()
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

        // Act - Update BOQ item concurrently
        var task1 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var item = await context.BOQItems.FindAsync(boqItem.Id);
            if (item != null)
            {
                item!.UnitRate = 150;
                context.BOQItems.Update(item);
                await context.SaveChangesAsync();
            }
        });

        var task2 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var item = await context.BOQItems.FindAsync(boqItem.Id);
            if (item != null)
            {
                item!.UnitRate = 200;
                context.BOQItems.Update(item);
                await context.SaveChangesAsync();
            }
        });

        await Task.WhenAll(task1, task2);

        // Assert - Verify last write wins
        var finalItem = await Context.BOQItems.FindAsync(boqItem.Id);
        finalItem.Should().NotBeNull();
        finalItem!.UnitRate.Should().BeOneOf(150, 200,
            "One of the concurrent updates should have been applied");
    }

    [Fact]
    public async Task ConcurrentUserCreation_BothSucceed()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var initialUserCount = await Context.Users.CountAsync();

        // Act - Create users concurrently
        var task1 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = new User
            {
                FirstName = "User",
                LastName = "One",
                Email = "user1@example.com",
                PasswordHash = hashedPassword,
                CompanyId = 1
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
        });

        var task2 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = new User
            {
                FirstName = "User",
                LastName = "Two",
                Email = "user2@example.com",
                PasswordHash = hashedPassword,
                CompanyId = 1
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
        });

        await Task.WhenAll(task1, task2);

        // Assert - Both users should be created
        var finalUserCount = await Context.Users.CountAsync();
        finalUserCount.Should().Be(initialUserCount + 2,
            "Both concurrent users should have been created");
    }

    [Fact]
    public async Task ConcurrentProjectDeletion_OnlyOneSucceeds()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var initialProjectCount = await Context.Projects.CountAsync();

        // Act - Delete project concurrently
        var task1 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var proj = await context.Projects.FindAsync(project.Id);
            if (proj != null)
            {
                context.Projects.Remove(proj!);
                await context.SaveChangesAsync();
            }
        });

        var task2 = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var proj = await context.Projects.FindAsync(project.Id);
            if (proj != null)
            {
                context.Projects.Remove(proj!);
                await context.SaveChangesAsync();
            }
        });

        await Task.WhenAll(task1, task2);

        // Assert - Project should be deleted (one operation succeeds, the other fails)
        var finalProjectCount = await Context.Projects.CountAsync();
        finalProjectCount.Should().Be(initialProjectCount - 1,
            "Project should have been deleted by one of the concurrent operations");
    }

    [Fact]
    public async Task ConcurrentReads_DoNotBlockWrites()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        // Act - Read and write concurrently
        var readTask = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            // Simulate a long-running read
            await Task.Delay(100);
            var proj = await context.Projects.FindAsync(project.Id);
            return proj;
        });

        var writeTask = Task.Run(async () =>
        {
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var proj = await context.Projects.FindAsync(project.Id);
            if (proj != null)
            {
                proj!.ProjectName = "Updated during read";
                context.Projects.Update(proj);
                await context.SaveChangesAsync();
            }
        });

        await Task.WhenAll(readTask, writeTask);

        // Assert - Write should succeed despite concurrent read
        var finalProject = await Context.Projects.FindAsync(project.Id);
        finalProject.Should().NotBeNull();
        finalProject!.ProjectName.Should().Be("Updated during read",
            "Write should have succeeded despite concurrent read");
    }

    [Fact]
    public async Task HighConcurrency_MultipleOperationsSucceed()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var initialTransactionCount = await Context.ProjectTransactions.CountAsync();

        // Act - Create multiple transactions concurrently
        var tasks = new List<Task>();
        for (int i = 0; i < 10; i++)
        {
            var taskIndex = i;
            var task = Task.Run(async () =>
            {
                using var scope = Factory.Services.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var transaction = new ProjectTransaction
                {
                    ProjectId = project.Id,
                    TransactionType = TransactionType.Expense,
                    Amount = 100.00m * (taskIndex + 1),
                    Description = $"Transaction {taskIndex + 1}",
                    TransactionDate = DateTime.UtcNow,
                    CreatedByUserId = user.Id
                };
                context.ProjectTransactions.Add(transaction);
                await context.SaveChangesAsync();
            });
            tasks.Add(task);
        }

        await Task.WhenAll(tasks);

        // Assert - All transactions should be created
        var finalTransactionCount = await Context.ProjectTransactions.CountAsync();
        finalTransactionCount.Should().Be(initialTransactionCount + 10,
            "All concurrent transactions should have been created");
    }
}
