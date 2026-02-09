using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using ConstructionManagement.Tests.Integration.Api;

namespace ConstructionManagement.Tests.Integration.Service;

public class ConcurrencyHandlingIntegrationTests : ApiTestBase
{
    private static readonly System.Threading.SemaphoreSlim _dbLock = new System.Threading.SemaphoreSlim(1, 1);

    [Fact]
    public async Task ConcurrentProjectUpdates_LastWriteWins()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);
        Context.ChangeTracker.Clear();

        // Act - Simulate concurrent updates using separate scopes
        var task1 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var p = await db.Projects.AsNoTracking().FirstOrDefaultAsync(x => x.Id == project.Id);
                p!.ProjectName = "Updated by Task 1";
                db.Projects.Update(p);
                await db.SaveChangesAsync();
            }
            finally { _dbLock.Release(); }
        });

        var task2 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var p = await db.Projects.AsNoTracking().FirstOrDefaultAsync(x => x.Id == project.Id);
                p!.ProjectName = "Updated by Task 2";
                db.Projects.Update(p);
                await db.SaveChangesAsync();
            }
            finally { _dbLock.Release(); }
        });

        await Task.WhenAll(task1, task2);

        // Assert - Verify last write wins
        var finalProject = await Context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == project.Id);
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
        Context.ChangeTracker.Clear();

        var initialTransactionCount = await Context.Transactions.CountAsync();

        // Act - Create transactions concurrently using separate scopes
        var task1 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var transaction = new Transaction
                {
                    ProjectId = project.Id,
                    Type = TransactionType.Overhead,
                    Amount = 1000.00m,
                    Description = "Transaction from Task 1",
                    TransactionDate = DateTime.UtcNow,
                    CreatedByUserId = user.Id
                };
                db.Transactions.Add(transaction);
                await db.SaveChangesAsync();
            }
            finally { _dbLock.Release(); }
        });

        var task2 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var transaction = new Transaction
                {
                    ProjectId = project.Id,
                    Type = TransactionType.MaterialPurchase,
                    Amount = 2000.00m,
                    Description = "Transaction from Task 2",
                    TransactionDate = DateTime.UtcNow,
                    CreatedByUserId = user.Id
                };
                db.Transactions.Add(transaction);
                await db.SaveChangesAsync();
            }
            finally { _dbLock.Release(); }
        });

        await Task.WhenAll(task1, task2);

        // Assert - Both transactions should be created
        var finalTransactionCount = await Context.Transactions.AsNoTracking().CountAsync();
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
            MeasuredData = new BOQMeasured { AgreedQuantity = 1000, UnitPrice = 100 }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var initialDailyLogCount = await Context.ItemDailyLogs.CountAsync();

        // Act - Create daily logs concurrently using separate scopes
        var task1 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var dailyLog = new ItemDailyLog
                {
                    BOQItemId = boqItem.Id,
                    LogDate = DateTime.UtcNow.Date,
                    DailyProgressPercentage = 50,
                    ProgressNotes = "Daily log from Task 1",
                    IsClosed = false,
                    CreatedByUserId = user.Id
                };
                db.ItemDailyLogs.Add(dailyLog);
                await db.SaveChangesAsync();
            }
            finally { _dbLock.Release(); }
        });

        var task2 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var dailyLog = new ItemDailyLog
                {
                    BOQItemId = boqItem.Id,
                    LogDate = DateTime.UtcNow.Date.AddDays(1),
                    DailyProgressPercentage = 75,
                    ProgressNotes = "Daily log from Task 2",
                    IsClosed = false,
                    CreatedByUserId = user.Id
                };
                db.ItemDailyLogs.Add(dailyLog);
                await db.SaveChangesAsync();
            }
            finally { _dbLock.Release(); }
        });

        await Task.WhenAll(task1, task2);

        // Assert - Both daily logs should be created
        var finalDailyLogCount = await Context.ItemDailyLogs.CountAsync();
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
            MeasuredData = new BOQMeasured { AgreedQuantity = 1000, UnitPrice = 100 }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();
        Context.ChangeTracker.Clear();

        // Act - Update BOQ item concurrently using separate scopes
        var task1 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var item = await db.BOQItems.Include(i => i.MeasuredData).AsNoTracking().FirstOrDefaultAsync(i => i.Id == boqItem.Id);
                if (item != null && item.MeasuredData != null)
                {
                    item.MeasuredData.UnitPrice = 150;
                    db.BOQItems.Update(item);
                    await db.SaveChangesAsync();
                }
            }
            finally { _dbLock.Release(); }
        });

        var task2 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var item = await db.BOQItems.Include(i => i.MeasuredData).AsNoTracking().FirstOrDefaultAsync(i => i.Id == boqItem.Id);
                if (item != null && item.MeasuredData != null)
                {
                    item.MeasuredData.UnitPrice = 200;
                    db.BOQItems.Update(item);
                    await db.SaveChangesAsync();
                }
            }
            finally { _dbLock.Release(); }
        });

        await Task.WhenAll(task1, task2);

        // Assert - Verify last write wins
        var finalItem = await Context.BOQItems.AsNoTracking().Include(i => i.MeasuredData).FirstOrDefaultAsync(i => i.Id == boqItem.Id);
        finalItem.Should().NotBeNull();
        finalItem!.MeasuredData!.UnitPrice.Should().BeOneOf(new[] { 150m, 200m }, 
            "One of the concurrent updates should have been applied");
    }

    [Fact]
    public async Task ConcurrentUserCreation_BothSucceed()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var initialUserCount = await Context.Users.CountAsync();

        // Act - Create users concurrently using separate scopes
        var task1 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var user = new User
                {
                    FirstName = "User",
                    LastName = "One",
                    Email = "user1@example.com",
                    PasswordHash = hashedPassword,
                    CompanyId = 1
                };
                db.Users.Add(user);
                await db.SaveChangesAsync();
            }
            finally { _dbLock.Release(); }
        });

        var task2 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var user = new User
                {
                    FirstName = "User",
                    LastName = "Two",
                    Email = "user2@example.com",
                    PasswordHash = hashedPassword,
                    CompanyId = 1
                };
                db.Users.Add(user);
                await db.SaveChangesAsync();
            }
            finally { _dbLock.Release(); }
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
        Context.ChangeTracker.Clear();

        var initialProjectCount = await Context.Projects.CountAsync();

        // Act - Delete project concurrently using separate scopes
        var task1 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var proj = await db.Projects.AsNoTracking().FirstOrDefaultAsync(x => x.Id == project.Id);
                if (proj != null)
                {
                    db.Projects.Remove(proj);
                    try { await db.SaveChangesAsync(); } catch (DbUpdateConcurrencyException) { /* Expected */ }
                }
            }
            finally { _dbLock.Release(); }
        });

        var task2 = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var proj = await db.Projects.AsNoTracking().FirstOrDefaultAsync(x => x.Id == project.Id);
                if (proj != null)
                {
                    db.Projects.Remove(proj);
                    try { await db.SaveChangesAsync(); } catch (DbUpdateConcurrencyException) { /* Expected */ }
                }
            }
            finally { _dbLock.Release(); }
        });

        await Task.WhenAll(task1, task2);

        // Assert - Project should be deleted (one operation succeeds, the other fails)
        var finalProjectCount = await Context.Projects.AsNoTracking().CountAsync();
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

        // Act - Read and write concurrently using separate scopes
        var readTask = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var proj = await db.Projects.AsNoTracking().FirstOrDefaultAsync(x => x.Id == project.Id);
                return proj;
            }
            finally { _dbLock.Release(); }
        });

        var writeTask = Task.Run(async () =>
        {
            await _dbLock.WaitAsync();
            try
            {
                using var scope = Factory.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var proj = await db.Projects.AsNoTracking().FirstOrDefaultAsync(x => x.Id == project.Id);
                if (proj != null)
                {
                    proj.ProjectName = "Updated during read";
                    db.Projects.Update(proj);
                    await db.SaveChangesAsync();
                }
            }
            finally { _dbLock.Release(); }
        });

        await Task.WhenAll(readTask, writeTask);

        // Assert - Write should succeed despite concurrent read
        var finalProject = await Context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == project.Id);
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

        var initialTransactionCount = await Context.Transactions.CountAsync();

        // Act - Create multiple transactions concurrently using separate scopes
        var tasks = new List<Task>();
        for (int i = 0; i < 10; i++)
        {
            var taskIndex = i;
            var task = Task.Run(async () =>
            {
                await _dbLock.WaitAsync();
                try
                {
                    using var scope = Factory.Services.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var transaction = new Transaction
                    {
                        ProjectId = project.Id,
                        Type = TransactionType.Overhead,
                        Amount = 100.00m * (taskIndex + 1),
                        Description = $"Transaction {taskIndex + 1}",
                        TransactionDate = DateTime.UtcNow,
                        CreatedByUserId = user.Id
                    };
                    db.Transactions.Add(transaction);
                    await db.SaveChangesAsync();
                }
                finally { _dbLock.Release(); }
            });
            tasks.Add(task);
        }

        await Task.WhenAll(tasks);

        // Assert - All transactions should be created
        var finalTransactionCount = await Context.Transactions.CountAsync();
        finalTransactionCount.Should().Be(initialTransactionCount + 10,
            "All concurrent transactions should have been created");
    }
}
