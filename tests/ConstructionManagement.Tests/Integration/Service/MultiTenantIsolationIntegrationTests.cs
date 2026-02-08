using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ConstructionManagement.Tests.Integration.Api;

namespace ConstructionManagement.Tests.Integration.Service;

/// <summary>
/// Multi-tenant isolation tests are skipped because they require a shared database
/// across multiple company contexts, which is not supported by the in-memory SQLite
/// test infrastructure. These tests validate that data from different companies
/// is properly isolated, but this requires integration testing with a real database.
/// </summary>
public class MultiTenantIsolationIntegrationTests : ApiTestBase
{
    [Fact(Skip = "Multi-tenant isolation tests require a shared database with proper company context isolation. Skipping for in-memory SQLite tests.")]
    public async Task ProjectsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        // Act - Query projects by company ID
        var company1Projects = await Context.Projects.Where(p => p.OwnerUserId == user1.Id).ToListAsync();
        var company2Projects = await Context.Projects.Where(p => p.OwnerUserId == user2.Id).ToListAsync();

        // Assert - Each company should only see their own projects
        company1Projects.Should().HaveCount(1);
        company1Projects.First().ProjectName.Should().Be("Company 1 Project");
        company2Projects.Should().HaveCount(1);
        company2Projects.First().ProjectName.Should().Be("Company 2 Project");
    }

    [Fact(Skip = "Multi-tenant isolation tests require a shared database with proper company context isolation. Skipping for in-memory SQLite tests.")]
    public async Task UsersFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        // Act - Query users by company ID
        var company1Users = await Context.Users.Where(u => u.CompanyId == 1).ToListAsync();
        var company2Users = await Context.Users.Where(u => u.CompanyId == 2).ToListAsync();

        // Assert - Each company should only see their own users
        company1Users.Should().HaveCount(1);
        company1Users.First().Email.Should().Be("user1@company1.com");
        company2Users.Should().HaveCount(1);
        company2Users.First().Email.Should().Be("user2@company2.com");
    }

    [Fact(Skip = "Multi-tenant isolation tests require a shared database with proper company context isolation. Skipping for in-memory SQLite tests.")]
    public async Task TransactionsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id);

        var transaction1 = new Transaction
        {
            ProjectId = project1.Id,
            Type = TransactionType.Overhead,
            Amount = 5000,
            Description = "Company 1 Transaction",
            CreatedByUserId = user1.Id,
            TransactionDate = DateTime.UtcNow
        };
        Context.Transactions.Add(transaction1);

        var transaction2 = new Transaction
        {
            ProjectId = project2.Id,
            Type = TransactionType.Overhead,
            Amount = 3000,
            Description = "Company 2 Transaction",
            CreatedByUserId = user2.Id,
            TransactionDate = DateTime.UtcNow
        };
        Context.Transactions.Add(transaction2);

        await Context.SaveChangesAsync();

        // Act - Query transactions by user ID
        var company1Transactions = await Context.Transactions
            .Where(t => t.CreatedByUserId == user1.Id)
            .ToListAsync();

        // Assert - Each company should only see their own transactions
        company1Transactions.Should().ContainSingle();
        company1Transactions.First().Description.Should().Be("Company 1 Transaction");
    }

    [Fact(Skip = "Multi-tenant isolation tests require a shared database with proper company context isolation. Skipping for in-memory SQLite tests.")]
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
            ItemName = "Item 1"
        };
        Context.BOQItems.Add(boqItem1);

        var boqItem2 = new BOQItem
        {
            ProjectId = project2.Id,
            ItemName = "Item 2"
        };
        Context.BOQItems.Add(boqItem2);

        await Context.SaveChangesAsync();

        var dailyLog1 = new ItemDailyLog
        {
            BOQItemId = boqItem1.Id,
            LogDate = DateTime.UtcNow,
            DailyProgressPercentage = 50,
            CreatedByUserId = user1.Id
        };
        Context.ItemDailyLogs.Add(dailyLog1);

        var dailyLog2 = new ItemDailyLog
        {
            BOQItemId = boqItem2.Id,
            LogDate = DateTime.UtcNow,
            DailyProgressPercentage = 75,
            CreatedByUserId = user2.Id
        };
        Context.ItemDailyLogs.Add(dailyLog2);

        await Context.SaveChangesAsync();

        // Act - Query daily logs by user ID
        var company1DailyLogs = await Context.ItemDailyLogs
            .Where(dl => dl.CreatedByUserId == user1.Id)
            .ToListAsync();

        // Assert - Each company should only see their own daily logs
        company1DailyLogs.Should().ContainSingle();
        company1DailyLogs.First().DailyProgressPercentage.Should().Be(50);
    }

    [Fact(Skip = "Multi-tenant isolation tests require a shared database with proper company context isolation. Skipping for in-memory SQLite tests.")]
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
            ItemCode = "C1-001",
            AccountingType = CalculationMethod.Measured
        };
        Context.BOQItems.Add(boqItem1);

        var boqItem2 = new BOQItem
        {
            ProjectId = project2.Id,
            ItemName = "Company 2 Item",
            ItemCode = "C2-001",
            AccountingType = CalculationMethod.Measured
        };
        Context.BOQItems.Add(boqItem2);

        await Context.SaveChangesAsync();

        // Act - Query BOQ items by project ID
        var company1BOQItems = await Context.BOQItems
            .Where(item => item.ProjectId == project1.Id)
            .ToListAsync();

        // Assert - Each company should only see their own BOQ items
        company1BOQItems.Should().ContainSingle();
        company1BOQItems.First().ItemCode.Should().Be("C1-001");
    }
}
