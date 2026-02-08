using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Api;

public class TransactionsControllerIntegrationTests : ApiTestBase
{
    [Fact]
    public async Task CreateTransaction_WithValidData_ReturnsCreated()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var createRequest = new
        {
            transactionType = "Expense",
            amount = 5000.00m,
            description = "Test expense",
            transactionDate = DateTime.UtcNow,
            boqItemId = (int?)null
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/projects/{project.Id}/transactions", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var result = await response.Content.ReadFromJsonAsync<CreateTransactionResponse>();
        result.Should().NotBeNull();
        result!.TransactionId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateTransaction_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        await ClearAuthTokenAsync();

        var createRequest = new
        {
            transactionType = "Expense",
            amount = 5000.00m,
            description = "Test expense"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/projects/1/transactions", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateTransaction_WithoutPermission_ReturnsForbidden()
    {
        // Arrange
        const string email1 = "owner@example.com";
        const string email2 = "other@example.com";
        const string password = "Password123";

        var owner = await SeedUserAsync(email1, BCrypt.Net.BCrypt.HashPassword(password), "Owner User");
        var other = await SeedUserAsync(email2, BCrypt.Net.BCrypt.HashPassword(password), "Other User");

        var project = await SeedProjectAsync("Test Project", owner.Id);

        var token = await AuthenticateAsync(email2, password);
        SetAuthToken(token);

        var createRequest = new
        {
            transactionType = "Expense",
            amount = 5000.00m,
            description = "Unauthorized expense"
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/projects/{project.Id}/transactions", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateTransaction_WithInvalidAmount_ReturnsBadRequest()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var createRequest = new
        {
            transactionType = "Expense",
            amount = -100.00m, // Invalid: negative amount
            description = "Test expense"
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/projects/{project.Id}/transactions", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTransaction_WithValidId_ReturnsTransaction()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

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

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/projects/{project.Id}/transactions/{transaction.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<TransactionDto>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(transaction.Id);
        result.Amount.Should().Be(5000.00m);
        result.Description.Should().Be("Test transaction");
    }

    [Fact]
    public async Task GetTransaction_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/projects/{project.Id}/transactions/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTransaction_WithWrongProject_ReturnsNotFound()
    {
        // Arrange
        const string email1 = "owner@example.com";
        const string email2 = "other@example.com";
        const string password = "Password123";

        var owner = await SeedUserAsync(email1, BCrypt.Net.BCrypt.HashPassword(password), "Owner User");
        var other = await SeedUserAsync(email2, BCrypt.Net.BCrypt.HashPassword(password), "Other User");

        var project1 = await SeedProjectAsync("Project 1", owner.Id);
        var project2 = await SeedProjectAsync("Project 2", other.Id);

        var transaction = new ProjectTransaction
        {
            ProjectId = project1.Id,
            TransactionType = TransactionType.Expense,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = owner.Id
        };
        Context.ProjectTransactions.Add(transaction);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email2, password);
        SetAuthToken(token);

        // Act - Try to access transaction from project1 using project2 URL
        var response = await Client.GetAsync($"/api/projects/{project2.Id}/transactions/{transaction.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTransactionsList_WithValidProject_ReturnsTransactions()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        for (int i = 0; i < 5; i++)
        {
            var transaction = new ProjectTransaction
            {
                ProjectId = project.Id,
                TransactionType = TransactionType.Expense,
                Amount = 1000.00m * (i + 1),
                Description = $"Test transaction {i + 1}",
                TransactionDate = DateTime.UtcNow.AddDays(-i),
                CreatedByUserId = user.Id
            };
            Context.ProjectTransactions.Add(transaction);
        }
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/projects/{project.Id}/transactions");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<List<TransactionDto>>();
        result.Should().NotBeNull();
        result!.Count.Should().Be(5);
    }

    [Fact]
    public async Task GetTransactionsList_WithBoqItemId_ReturnsFilteredTransactions()
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

        var transaction1 = new ProjectTransaction
        {
            ProjectId = project.Id,
            BOQItemId = boqItem.Id,
            TransactionType = TransactionType.Invoice,
            Amount = 5000.00m,
            Description = "Transaction with BOQ item",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id
        };

        var transaction2 = new ProjectTransaction
        {
            ProjectId = project.Id,
            BOQItemId = null,
            TransactionType = TransactionType.Expense,
            Amount = 1000.00m,
            Description = "Transaction without BOQ item",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id
        };

        Context.ProjectTransactions.AddRange(transaction1, transaction2);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/projects/{project.Id}/transactions?boqItemId={boqItem.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<List<TransactionDto>>();
        result.Should().NotBeNull();
        result!.Count.Should().Be(1);
        result[0].BOQItemId.Should().Be(boqItem.Id);
    }

    [Fact]
    public async Task ReviewTransaction_WithValidData_ReturnsOk()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var transaction = new ProjectTransaction
        {
            ProjectId = project.Id,
            TransactionType = TransactionType.Invoice,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id,
            Status = "Pending"
        };
        Context.ProjectTransactions.Add(transaction);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var reviewRequest = new
        {
            approved = true,
            reviewNotes = "Transaction approved"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/projects/{project.Id}/transactions/{transaction.Id}/review", reviewRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ReviewTransaction_WithoutPermission_ReturnsForbidden()
    {
        // Arrange
        const string email1 = "owner@example.com";
        const string email2 = "other@example.com";
        const string password = "Password123";

        var owner = await SeedUserAsync(email1, BCrypt.Net.BCrypt.HashPassword(password), "Owner User");
        var other = await SeedUserAsync(email2, BCrypt.Net.BCrypt.HashPassword(password), "Other User");

        var project = await SeedProjectAsync("Test Project", owner.Id);

        var transaction = new ProjectTransaction
        {
            ProjectId = project.Id,
            TransactionType = TransactionType.Invoice,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = owner.Id,
            Status = "Pending"
        };
        Context.ProjectTransactions.Add(transaction);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email2, password);
        SetAuthToken(token);

        var reviewRequest = new
        {
            approved = true,
            reviewNotes = "Unauthorized review"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/projects/{project.Id}/transactions/{transaction.Id}/review", reviewRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ReviewTransaction_AlreadyReviewed_ReturnsBadRequest()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var transaction = new ProjectTransaction
        {
            ProjectId = project.Id,
            TransactionType = TransactionType.Invoice,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id,
            Status = "Approved"
        };
        Context.ProjectTransactions.Add(transaction);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var reviewRequest = new
        {
            approved = false,
            reviewNotes = "Try to review again"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/projects/{project.Id}/transactions/{transaction.Id}/review", reviewRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTransaction_WithDifferentTypes_Succeeds()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var transactionTypes = new[] { "Expense", "Invoice", "Payment", "Refund" };

        foreach (var type in transactionTypes)
        {
            var createRequest = new
            {
                transactionType = type,
                amount = 1000.00m,
                description = $"{type} transaction",
                transactionDate = DateTime.UtcNow
            };

            // Act
            var response = await Client.PostAsJsonAsync($"/api/projects/{project.Id}/transactions", createRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
        }
    }

    private class CreateTransactionResponse
    {
        public int TransactionId { get; set; }
    }

    private class TransactionDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int? BOQItemId { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
