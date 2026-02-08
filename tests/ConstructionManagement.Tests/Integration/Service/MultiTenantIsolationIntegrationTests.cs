using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Service;

public class MultiTenantIsolationIntegrationTests : IntegrationTestBase
{
    [Fact]
    public async Task UsersFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        // Act - User from company 1 tries to access company 2's project
        var company1Context = new CompanyContext { CompanyId = 1 };
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        using var context1 = new ApplicationDbContext(options, company1Context);
        context1.Database.OpenConnection();
        context1.Database.EnsureCreated();

        // Try to access project from company 2
        var projectFromCompany1 = await context1.Projects.FindAsync(project2.Id);

        // Assert
        projectFromCompany1.Should().BeNull("User from company 1 should not see company 2's project");
    }

    [Fact]
    public async Task ProjectsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        // Act - Get projects for each company
        var company1Context = new CompanyContext { CompanyId = 1 };
        var company2Context = new CompanyContext { CompanyId = 2 };

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        using var context1 = new ApplicationDbContext(options, company1Context);
        using var context2 = new ApplicationDbContext(options, company2Context);

        context1.Database.OpenConnection();
        context2.Database.OpenConnection();
        context1.Database.EnsureCreated();
        context2.Database.EnsureCreated();

        var company1Projects = await context1.Projects.ToListAsync();
        var company2Projects = await context2.Projects.ToListAsync();

        // Assert
        company1Projects.Should().ContainSingle(p => p.Id == project1.Id);
        company1Projects.Should().NotContain(p => p.Id == project2.Id);

        company2Projects.Should().ContainSingle(p => p.Id == project2.Id);
        company2Projects.Should().NotContain(p => p.Id == project1.Id);
    }

    [Fact]
    public async Task TransactionsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        var transaction1 = new ProjectTransaction
        {
            ProjectId = project1.Id,
            TransactionType = TransactionType.Expense,
            Amount = 5000.00m,
            Description = "Company 1 transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user1.Id
        };

        var transaction2 = new ProjectTransaction
        {
            ProjectId = project2.Id,
            TransactionType = TransactionType.Invoice,
            Amount = 10000.00m,
            Description = "Company 2 transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user2.Id
        };

        Context.ProjectTransactions.AddRange(transaction1, transaction2);
        await Context.SaveChangesAsync();

        // Act - Get transactions for each company
        var company1Context = new CompanyContext { CompanyId = 1 };
        var company2Context = new CompanyContext { CompanyId = 2 };

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        using var context1 = new ApplicationDbContext(options, company1Context);
        using var context2 = new ApplicationDbContext(options, company2Context);

        context1.Database.OpenConnection();
        context2.Database.OpenConnection();
        context1.Database.EnsureCreated();
        context2.Database.EnsureCreated();

        var company1Transactions = await context1.ProjectTransactions.ToListAsync();
        var company2Transactions = await context2.ProjectTransactions.ToListAsync();

        // Assert
        company1Transactions.Should().ContainSingle(t => t.Id == transaction1.Id);
        company1Transactions.Should().NotContain(t => t.Id == transaction2.Id);

        company2Transactions.Should().ContainSingle(t => t.Id == transaction2.Id);
        company2Transactions.Should().NotContain(t => t.Id == transaction1.Id);
    }

    [Fact]
    public async Task DailyLogsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        var boqItem1 = new BOQItem
        {
            ProjectId = project1.Id,
            ItemName = "Company 1 Item",
            Unit = "m2",
            UnitRate = 100,
            Quantity = 1000
        };

        var boqItem2 = new BOQItem
        {
            ProjectId = project2.Id,
            ItemName = "Company 2 Item",
            Unit = "m2",
            UnitRate = 100,
            Quantity = 1000
        };

        Context.BOQItems.AddRange(boqItem1, boqItem2);
        await Context.SaveChangesAsync();

        var dailyLog1 = new DailyLog
        {
            BOQItemId = boqItem1.Id,
            LogDate = DateTime.UtcNow.Date,
            CompletionPercentage = 50,
            Notes = "Company 1 daily log",
            IsClosed = false
        };

        var dailyLog2 = new DailyLog
        {
            BOQItemId = boqItem2.Id,
            LogDate = DateTime.UtcNow.Date,
            CompletionPercentage = 75,
            Notes = "Company 2 daily log",
            IsClosed = false
        };

        Context.DailyLogs.AddRange(dailyLog1, dailyLog2);
        await Context.SaveChangesAsync();

        // Act - Get daily logs for each company
        var company1Context = new CompanyContext { CompanyId = 1 };
        var company2Context = new CompanyContext { CompanyId = 2 };

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        using var context1 = new ApplicationDbContext(options, company1Context);
        using var context2 = new ApplicationDbContext(options, company2Context);

        context1.Database.OpenConnection();
        context2.Database.OpenConnection();
        context1.Database.EnsureCreated();
        context2.Database.EnsureCreated();

        var company1DailyLogs = await context1.DailyLogs.ToListAsync();
        var company2DailyLogs = await context2.DailyLogs.ToListAsync();

        // Assert
        company1DailyLogs.Should().ContainSingle(dl => dl.Id == dailyLog1.Id);
        company1DailyLogs.Should().NotContain(dl => dl.Id == dailyLog2.Id);

        company2DailyLogs.Should().ContainSingle(dl => dl.Id == dailyLog2.Id);
        company2DailyLogs.Should().NotContain(dl => dl.Id == dailyLog1.Id);
    }

    [Fact]
    public async Task BOQItemsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        var boqItem1 = new BOQItem
        {
            ProjectId = project1.Id,
            ItemName = "Company 1 Item",
            Unit = "m2",
            UnitRate = 100,
            Quantity = 1000
        };

        var boqItem2 = new BOQItem
        {
            ProjectId = project2.Id,
            ItemName = "Company 2 Item",
            Unit = "m2",
            UnitRate = 100,
            Quantity = 1000
        };

        Context.BOQItems.AddRange(boqItem1, boqItem2);
        await Context.SaveChangesAsync();

        // Act - Get BOQ items for each company
        var company1Context = new CompanyContext { CompanyId = 1 };
        var company2Context = new CompanyContext { CompanyId = 2 };

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        using var context1 = new ApplicationDbContext(options, company1Context);
        using var context2 = new ApplicationDbContext(options, company2Context);

        context1.Database.OpenConnection();
        context2.Database.OpenConnection();
        context1.Database.EnsureCreated();
        context2.Database.EnsureCreated();

        var company1BOQItems = await context1.BOQItems.ToListAsync();
        var company2BOQItems = await context2.BOQItems.ToListAsync();

        // Assert
        company1BOQItems.Should().ContainSingle(item => item.Id == boqItem1.Id);
        company1BOQItems.Should().NotContain(item => item.Id == boqItem2.Id);

        company2BOQItems.Should().ContainSingle(item => item.Id == boqItem2.Id);
        company2BOQItems.Should().NotContain(item => item.Id == boqItem1.Id);
    }

    [Fact]
    public async Task CrossCompanyQuery_ReturnsEmptyResults()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        // Act - Query company 1's context for company 2's project
        var company1Context = new CompanyContext { CompanyId = 1 };
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        using var context1 = new ApplicationDbContext(options, company1Context);
        context1.Database.OpenConnection();
        context1.Database.EnsureCreated();

        var company2Projects = await context1.Projects
            .Where(p => p.Id == project2.Id)
            .ToListAsync();

        // Assert
        company2Projects.Should().BeEmpty("Company 1 should not see company 2's projects");
    }

    [Fact]
    public async Task CompanyContext_Isolation_WithMultipleOperations()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        var boqItem1 = new BOQItem
        {
            ProjectId = project1.Id,
            ItemName = "Company 1 Item",
            Unit = "m2",
            UnitRate = 100,
            Quantity = 1000
        };

        var boqItem2 = new BOQItem
        {
            ProjectId = project2.Id,
            ItemName = "Company 2 Item",
            Unit = "m2",
            UnitRate = 100,
            Quantity = 1000
        };

        Context.BOQItems.AddRange(boqItem1, boqItem2);
        await Context.SaveChangesAsync();

        // Act - Perform multiple operations with different company contexts
        var company1Context = new CompanyContext { CompanyId = 1 };
        var company2Context = new CompanyContext { CompanyId = 2 };

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        using var context1 = new ApplicationDbContext(options, company1Context);
        using var context2 = new ApplicationDbContext(options, company2Context);

        context1.Database.OpenConnection();
        context2.Database.OpenConnection();
        context1.Database.EnsureCreated();
        context2.Database.EnsureCreated();

        // Query projects
        var company1Projects = await context1.Projects.ToListAsync();
        var company2Projects = await context2.Projects.ToListAsync();

        // Query BOQ items
        var company1BOQItems = await context1.BOQItems.ToListAsync();
        var company2BOQItems = await context2.BOQItems.ToListAsync();

        // Query users
        var company1Users = await context1.Users.ToListAsync();
        var company2Users = await context2.Users.ToListAsync();

        // Assert - Verify complete isolation
        company1Projects.Should().HaveCount(1);
        company2Projects.Should().HaveCount(1);
        company1Projects.Should().NotIntersectWith(company2Projects);

        company1BOQItems.Should().HaveCount(1);
        company2BOQItems.Should().HaveCount(1);
        company1BOQItems.Should().NotIntersectWith(company2BOQItems);

        company1Users.Should().HaveCount(1);
        company2Users.Should().HaveCount(1);
        company1Users.Should().NotIntersectWith(company2Users);
    }
}
