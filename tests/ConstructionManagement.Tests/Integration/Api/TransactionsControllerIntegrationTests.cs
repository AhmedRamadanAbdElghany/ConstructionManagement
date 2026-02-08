using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Application.DTOs.Transaction;
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

        var form = new MultipartFormDataContent();
        form.Add(new StringContent(TransactionType.Overhead.ToString()), "Type");
        form.Add(new StringContent("5000.00"), "Amount");
        form.Add(new StringContent("Test expense"), "Description");

        // Act
        var response = await Client.PostAsync($"/api/projects/{project.Id}/transactions", form);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var result = await response.Content.ReadFromJsonAsync<CreateTransactionResponse>();
        result.Should().NotBeNull();
        result!.transactionId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateTransaction_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        await ClearAuthTokenAsync();

        var form = new MultipartFormDataContent();
        form.Add(new StringContent(TransactionType.Overhead.ToString()), "Type");
        form.Add(new StringContent("5000.00"), "Amount");

        // Act
        var response = await Client.PostAsync($"/api/projects/1/transactions", form);

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

        var form = new MultipartFormDataContent();
        form.Add(new StringContent(TransactionType.Overhead.ToString()), "Type");
        form.Add(new StringContent("5000.00"), "Amount");

        // Act
        var response = await Client.PostAsync($"/api/projects/{project.Id}/transactions", form);

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

        var form = new MultipartFormDataContent();
        form.Add(new StringContent(TransactionType.Overhead.ToString()), "Type");
        form.Add(new StringContent("-100.00"), "Amount"); // Invalid: negative amount

        // Act
        var response = await Client.PostAsync($"/api/projects/{project.Id}/transactions", form);

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

        var transaction = new Transaction
        {
            ProjectId = project.Id,
            Type = TransactionType.Overhead,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id
        };
        Context.Transactions.Add(transaction);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/projects/{project.Id}/transactions/{transaction.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<TransactionDto>();
        result.Should().NotBeNull();
        result!.TransactionId.Should().Be(transaction.Id);
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

        var transaction = new Transaction
        {
            ProjectId = project1.Id,
            Type = TransactionType.Overhead,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = owner.Id
        };
        Context.Transactions.Add(transaction);
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
            var transaction = new Transaction
            {
                ProjectId = project.Id,
                Type = TransactionType.Overhead,
                Amount = 1000.00m * (i + 1),
                Description = $"Test transaction {i + 1}",
                TransactionDate = DateTime.UtcNow.AddDays(-i),
                CreatedByUserId = user.Id
            };
            Context.Transactions.Add(transaction);
        }
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/projects/{project.Id}/transactions");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<List<TransactionDto>>();
        result.Should().BeEquivalentTo(result); // Using FluentAssertions
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
            AccountingType = CalculationMethod.Measured
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        Context.BOQMeasured.Add(new BOQMeasured
        {
            Id = boqItem.Id,
            AgreedQuantity = 1000,
            UnitPrice = 100
        });
        await Context.SaveChangesAsync();

        var transaction1 = new Transaction
        {
            ProjectId = project.Id,
            BOQItemId = boqItem.Id,
            Type = TransactionType.MaterialPurchase,
            Amount = 5000.00m,
            Description = "Transaction with BOQ item",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id
        };

        var transaction2 = new Transaction
        {
            ProjectId = project.Id,
            BOQItemId = null,
            Type = TransactionType.Overhead,
            Amount = 1000.00m,
            Description = "Transaction without BOQ item",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id
        };

        Context.Transactions.AddRange(transaction1, transaction2);
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

        var transaction = new Transaction
        {
            ProjectId = project.Id,
            Type = TransactionType.MaterialPurchase,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id,
            Status = TransactionStatus.Pending
        };
        Context.Transactions.Add(transaction);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var reviewRequest = new ReviewTransactionRequest(TransactionStatus.Approved, "Transaction approved");

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

        var transaction = new Transaction
        {
            ProjectId = project.Id,
            Type = TransactionType.MaterialPurchase,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = owner.Id,
            Status = TransactionStatus.Pending
        };
        Context.Transactions.Add(transaction);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email2, password);
        SetAuthToken(token);

        var reviewRequest = new ReviewTransactionRequest(TransactionStatus.Approved, "Unauthorized review");

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

        var transaction = new Transaction
        {
            ProjectId = project.Id,
            Type = TransactionType.MaterialPurchase,
            Amount = 5000.00m,
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow,
            CreatedByUserId = user.Id,
            Status = TransactionStatus.Approved
        };
        Context.Transactions.Add(transaction);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var reviewRequest = new ReviewTransactionRequest(TransactionStatus.Rejected, "Try to review again");

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

        var transactionTypes = new[] { TransactionType.MaterialPurchase, TransactionType.LaborPayment, TransactionType.Overhead };

        foreach (var type in transactionTypes)
        {
            var form = new MultipartFormDataContent();
            form.Add(new StringContent(type.ToString()), "Type");
            form.Add(new StringContent("1000.00"), "Amount");
            form.Add(new StringContent($"{type} transaction"), "Description");

            // Act
            var response = await Client.PostAsync($"/api/projects/{project.Id}/transactions", form);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
        }
    }

    private class CreateTransactionResponse
    {
        public int transactionId { get; set; }
    }

    private class TransactionDto
    {
        public int TransactionId { get; set; }
        public int ProjectId { get; set; }
        public int? BOQItemId { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime TransactionDate { get; set; }
        public TransactionStatus Status { get; set; }
    }
}
