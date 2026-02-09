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
    [Fact]
    public async Task ProjectsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id, companyId: 1);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id, companyId: 2);

        // Act & Assert - Projects should be isolated by global query filter (Context Id = 1)
        var allProjects = await Context.Projects.IgnoreQueryFilters().ToListAsync();
        var company1Projects = await Context.Projects.Where(p => p.ProjectName == "Company 1 Project").ToListAsync();
        var company2ProjectsInvisible = await Context.Projects.Where(p => p.ProjectName == "Company 2 Project").ToListAsync();

        allProjects.Should().Contain(p => p.ProjectName == "Company 1 Project");
        allProjects.Should().Contain(p => p.ProjectName == "Company 2 Project");
        
        company1Projects.Should().ContainSingle();
        company2ProjectsInvisible.Should().BeEmpty("Projects from other companies should be filtered out");
    }

    [Fact]
    public async Task UsersFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        // Act & Assert - Users should be isolated by global query filter (Context Id = 1)
        var allUsers = await Context.Users.IgnoreQueryFilters().ToListAsync();
        var company1Users = await Context.Users.Where(u => u.Email == "user1@company1.com").ToListAsync();
        var company2UsersInvisible = await Context.Users.Where(u => u.Email == "user2@company2.com").ToListAsync();

        allUsers.Should().Contain(u => u.Email == "user1@company1.com");
        allUsers.Should().Contain(u => u.Email == "user2@company2.com");

        company1Users.Should().ContainSingle();
        company2UsersInvisible.Should().BeEmpty("Users from other companies should be filtered out");
    }

    [Fact]
    public async Task TransactionsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id, companyId: 1);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id, companyId: 2);

        var transaction1 = new Transaction
        {
            ProjectId = project1.Id,
            Type = TransactionType.Overhead,
            Amount = 5000,
            Description = "Company 1 Transaction",
            CreatedByUserId = user1.Id,
            TransactionDate = DateTime.UtcNow,
            CompanyId = 1
        };
        Context.Transactions.Add(transaction1);

        var transaction2 = new Transaction
        {
            ProjectId = project2.Id,
            Type = TransactionType.Overhead,
            Amount = 3000,
            Description = "Company 2 Transaction",
            CreatedByUserId = user2.Id,
            TransactionDate = DateTime.UtcNow,
            CompanyId = 2
        };
        Context.Transactions.Add(transaction2);

        await Context.SaveChangesAsync();

        // Act & Assert - Transactions should be isolated (Context Id = 1)
        var allTransactions = await Context.Transactions.IgnoreQueryFilters().ToListAsync();
        var company1Transactions = await Context.Transactions.Where(t => t.Description == "Company 1 Transaction").ToListAsync();
        var company2TransactionsInvisible = await Context.Transactions.Where(t => t.Description == "Company 2 Transaction").ToListAsync();

        allTransactions.Should().Contain(t => t.Description == "Company 1 Transaction");
        allTransactions.Should().Contain(t => t.Description == "Company 2 Transaction");

        company1Transactions.Should().ContainSingle();
        company2TransactionsInvisible.Should().BeEmpty("Transactions from other companies should be filtered out");
    }

    [Fact]
    public async Task DailyLogsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id, companyId: 1);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id, companyId: 2);

        var boqItem1 = new BOQItem
        {
            ProjectId = project1.Id,
            ItemName = "Item 1",
            CompanyId = 1
        };
        Context.BOQItems.Add(boqItem1);

        var boqItem2 = new BOQItem
        {
            ProjectId = project2.Id,
            ItemName = "Item 2",
            CompanyId = 2
        };
        Context.BOQItems.Add(boqItem2);

        await Context.SaveChangesAsync();

        var dailyLog1 = new ItemDailyLog
        {
            BOQItemId = boqItem1.Id,
            LogDate = DateTime.UtcNow,
            DailyProgressPercentage = 50,
            CreatedByUserId = user1.Id,
            CompanyId = 1
        };
        Context.ItemDailyLogs.Add(dailyLog1);

        var dailyLog2 = new ItemDailyLog
        {
            BOQItemId = boqItem2.Id,
            LogDate = DateTime.UtcNow,
            DailyProgressPercentage = 75,
            CreatedByUserId = user2.Id,
            CompanyId = 2
        };
        Context.ItemDailyLogs.Add(dailyLog2);

        await Context.SaveChangesAsync();

        // Act & Assert - Daily logs should be isolated (Context Id = 1)
        var allLogs = await Context.ItemDailyLogs.IgnoreQueryFilters().ToListAsync();
        var company1Logs = await Context.ItemDailyLogs.Where(dl => dl.ProgressNotes == "Daily log from Task 1" || dl.DailyProgressPercentage == 50).ToListAsync();
        var company2LogsInvisible = await Context.ItemDailyLogs.Where(dl => dl.ProgressNotes == "Daily log from Task 2" || dl.DailyProgressPercentage == 75).ToListAsync();

        allLogs.Should().Contain(dl => dl.DailyProgressPercentage == 50);
        allLogs.Should().Contain(dl => dl.DailyProgressPercentage == 75);

        company1Logs.Should().ContainSingle();
        company2LogsInvisible.Should().BeEmpty("Daily logs from other companies should be filtered out");
    }

    [Fact]
    public async Task BOQItemsFromDifferentCompanies_AreIsolated()
    {
        // Arrange
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user1 = await SeedUserAsync("user1@company1.com", hashedPassword, "User 1", companyId: 1);
        var user2 = await SeedUserAsync("user2@company2.com", hashedPassword, "User 2", companyId: 2);

        var project1 = await SeedProjectAsync("Company 1 Project", user1.Id, companyId: 1);
        var project2 = await SeedProjectAsync("Company 2 Project", user2.Id, companyId: 2);

        var boqItem1 = new BOQItem
        {
            ProjectId = project1.Id,
            ItemName = "Company 1 Item",
            ItemCode = "C1-001",
            AccountingType = CalculationMethod.Measured,
            CompanyId = 1
        };
        Context.BOQItems.Add(boqItem1);

        var boqItem2 = new BOQItem
        {
            ProjectId = project2.Id,
            ItemName = "Company 2 Item",
            ItemCode = "C2-001",
            AccountingType = CalculationMethod.Measured,
            CompanyId = 2
        };
        Context.BOQItems.Add(boqItem2);

        await Context.SaveChangesAsync();

        // Act & Assert - BOQ items should be isolated (Context Id = 1)
        var allItems = await Context.BOQItems.IgnoreQueryFilters().ToListAsync();
        var company1Items = await Context.BOQItems.Where(i => i.ItemCode == "C1-001").ToListAsync();
        var company2ItemsInvisible = await Context.BOQItems.Where(i => i.ItemCode == "C2-001").ToListAsync();

        allItems.Should().Contain(i => i.ItemCode == "C1-001");
        allItems.Should().Contain(i => i.ItemCode == "C2-001");

        company1Items.Should().ContainSingle();
        company2ItemsInvisible.Should().BeEmpty("BOQ items from other companies should be filtered out");
    }
}
