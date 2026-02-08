using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Api;

public class DailyLogsControllerIntegrationTests : ApiTestBase
{
    [Fact]
    public async Task CreateOrGetDailyLog_WithValidData_ReturnsLogId()
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
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var createRequest = new
        {
            logDate = DateTime.UtcNow.Date
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<DailyLogResponse>();
        result.Should().NotBeNull();
        result!.DailyLogId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateOrGetDailyLog_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        await ClearAuthTokenAsync();

        var createRequest = new
        {
            logDate = DateTime.UtcNow.Date
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/projects/1/transactions", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateOrGetDailyLog_WithoutPermission_ReturnsForbidden()
    {
        // Arrange
        const string email1 = "owner@example.com";
        const string email2 = "other@example.com";
        const string password = "Password123";

        var owner = await SeedUserAsync(email1, BCrypt.Net.BCrypt.HashPassword(password), "Owner User");
        var other = await SeedUserAsync(email2, BCrypt.Net.BCrypt.HashPassword(password), "Other User");

        var project = await SeedProjectAsync("Test Project", owner.Id);

        var boqItem = new BOQItem
        {
            ProjectId = project.Id,
            ItemName = "Test Item",
            Unit = "m2",
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email2, password);
        SetAuthToken(token);

        var createRequest = new
        {
            logDate = DateTime.UtcNow.Date
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CloseDailyLog_WithValidData_ReturnsOk()
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
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var logDate = DateTime.UtcNow.Date;
        var closeRequest = new
        {
            dailyProgressPercentage = 75,
            progressNotes = "Day completed successfully"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs/{logDate:yyyy-MM-dd}/close", closeRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CloseDailyLog_AlreadyClosed_ReturnsBadRequest()
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
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var logDate = DateTime.UtcNow.Date;
        var closeRequest = new
        {
            dailyProgressPercentage = 75,
            progressNotes = "First close"
        };

        // First close
        await Client.PutAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs/{logDate:yyyy-MM-dd}/close", closeRequest);

        // Act - Try to close again
        var response = await Client.PutAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs/{logDate:yyyy-MM-dd}/close", closeRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetHistory_WithValidItemId_ReturnsHistory()
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
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/items/{boqItem.Id}/dailylogs/history");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<List<DailyLogHistoryDto>>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task ReopenClosedDay_WithValidData_ReturnsOk()
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
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var logDate = DateTime.UtcNow.Date;

        // First close the day
        var closeRequest = new
        {
            dailyProgressPercentage = 75,
            progressNotes = "Day completed"
        };
        await Client.PutAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs/{logDate:yyyy-MM-dd}/close", closeRequest);

        // Act - Reopen the day
        var reopenRequest = new
        {
            reason = "Need to add more entries",
            notifyRoleIds = new List<int> { 1, 2 }
        };
        var response = await Client.PutAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs/{logDate:yyyy-MM-dd}/reopen", reopenRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ReopenClosedDay_WithoutPermission_ReturnsForbidden()
    {
        // Arrange
        const string email1 = "owner@example.com";
        const string email2 = "other@example.com";
        const string password = "Password123";

        var owner = await SeedUserAsync(email1, BCrypt.Net.BCrypt.HashPassword(password), "Owner User");
        var other = await SeedUserAsync(email2, BCrypt.Net.BCrypt.HashPassword(password), "Other User");

        var project = await SeedProjectAsync("Test Project", owner.Id);

        var boqItem = new BOQItem
        {
            ProjectId = project.Id,
            ItemName = "Test Item",
            Unit = "m2",
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var ownerToken = await AuthenticateAsync(email1, password);
        SetAuthToken(ownerToken);

        var logDate = DateTime.UtcNow.Date;

        // Close the day as owner
        var closeRequest = new
        {
            dailyProgressPercentage = 75,
            progressNotes = "Day completed"
        };
        await Client.PutAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs/{logDate:yyyy-MM-dd}/close", closeRequest);

        // Act - Try to reopen as other user
        var otherToken = await AuthenticateAsync(email2, password);
        SetAuthToken(otherToken);

        var reopenRequest = new
        {
            reason = "Unauthorized reopen",
            notifyRoleIds = new List<int> { 1, 2 }
        };
        var response = await Client.PutAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs/{logDate:yyyy-MM-dd}/reopen", reopenRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ReopenClosedDay_WithInvalidDate_ReturnsBadRequest()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", 1);

        var boqItem = new BOQItem
        {
            ProjectId = project.Id,
            ItemName = "Test Item",
            Unit = "m2",
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var reopenRequest = new
        {
            reason = "Test reopen",
            notifyRoleIds = new List<int> { 1 }
        };

        // Act - Try to reopen with invalid date format
        var response = await Client.PutAsJsonAsync("/api/items/1/dailylogs/invalid-date/reopen", reopenRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateOrGetDailyLog_WithFutureDate_ReturnsBadRequest()
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
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 1000,
                UnitPrice = 100
            }
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        var token = await AuthenticateAsync(email, password);
        SetAuthToken(token);

        var createRequest = new
        {
            logDate = DateTime.UtcNow.AddDays(1).Date // Future date
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/items/{boqItem.Id}/dailylogs", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private class DailyLogResponse
    {
        public int DailyLogId { get; set; }
    }

    private class DailyLogHistoryDto
    {
        public int Id { get; set; }
        public DateTime LogDate { get; set; }
        public decimal DailyProgressPercentage { get; set; }
        public string? ProgressNotes { get; set; }
        public bool IsClosed { get; set; }
    }
}
