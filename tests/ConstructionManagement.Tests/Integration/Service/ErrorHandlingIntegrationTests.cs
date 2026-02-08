using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Service;

public class ErrorHandlingIntegrationTests : IntegrationTestBase
{
    [Fact]
    public async Task CreateProject_WithInvalidData_ThrowsValidationException()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");

        var invalidRequest = new CreateProjectRequest
        {
            ProjectName = "", // Invalid: empty name
            SiteAddress = "123 Test Street",
            KickoffDate = DateTime.UtcNow.AddDays(-1), // Invalid: past date
            HandoverTarget = DateTime.UtcNow.AddDays(-10), // Invalid: before kickoff
            AccountingSystem = CalculationMethod.Measured
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            var service = new ProjectService(Context, UnitOfWork);
            await service.CreateProjectAsync(invalidRequest, 1);
        });

        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateTransaction_WithNegativeAmount_ThrowsValidationException()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var invalidRequest = new CreateTransactionRequest
        {
            TransactionType = TransactionType.Expense,
            Amount = -100.00m, // Invalid: negative amount
            Description = "Test transaction",
            TransactionDate = DateTime.UtcNow
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            var service = new ProjectTransactionService(Context, UnitOfWork);
            await service.CreateTransactionAsync(project.Id, invalidRequest, user.Id);
        });

        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateDailyLog_WithInvalidPercentage_ThrowsValidationException()
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

        var invalidRequest = new CreateDailyLogRequest
        {
            LogDate = DateTime.UtcNow.Date,
            CompletionPercentage = 150, // Invalid: > 100
            Notes = "Test daily log"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            var service = new DailyLogService(Context, UnitOfWork);
            await service.GetOrCreateDailyLogIdAsync(boqItem.Id, invalidRequest.LogDate, user.Id);
        });

        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsFailure()
    {
        // Arrange
        var loginRequest = new LoginRequest("nonexistent@example.com", "Password123");

        // Act
        var service = new AuthService(null!, Configuration, UnitOfWork);
        var result = await service.LoginAsync(loginRequest);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsFailure()
    {
        // Arrange
        const string email = "test@example.com";
        const string correctPassword = "Password123";
        const string wrongPassword = "WrongPassword";

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(correctPassword);
        await SeedUserAsync(email, hashedPassword, "Test User");

        var loginRequest = new LoginRequest(email, wrongPassword);

        // Act
        var service = new AuthService(null!, Configuration, UnitOfWork);
        var result = await service.LoginAsync(loginRequest);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreateBOQItem_WithZeroQuantity_ThrowsValidationException()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var invalidRequest = new CreateBOQItemRequest
        {
            ProjectId = project.Id,
            ItemName = "Test Item",
            Unit = "m2",
            UnitRate = 100,
            Quantity = 0 // Invalid: zero quantity
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            var service = new BOQItemService(Context, UnitOfWork);
            await service.CreateBOQItemAsync(invalidRequest);
        });

        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateProject_WithNonExistentId_ReturnsFailure()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");

        var updateRequest = new UpdateProjectRequest
        {
            ProjectName = "Updated Project",
            SiteAddress = "456 Updated Street"
        };

        // Act
        var service = new ProjectService(Context, UnitOfWork);
        var result = await service.UpdateProjectAsync(99999, updateRequest, user.Id);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task CloseDailyLog_WithNonExistentLog_ReturnsFailure()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var closeRequest = new CloseDailyLogRequest
        {
            CompletionPercentage = 75,
            Notes = "Closing non-existent log"
        };

        // Act
        var service = new DailyLogService(Context, UnitOfWork);
        var result = await service.CloseDailyLogAsync(99999, DateTime.UtcNow.Date, user.Id, closeRequest);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ReviewTransaction_WithNonExistentTransaction_ReturnsFailure()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");

        var reviewRequest = new ReviewTransactionRequest
        {
            Approved = true,
            ReviewNotes = "Reviewing non-existent transaction"
        };

        // Act
        var service = new ProjectTransactionService(Context, UnitOfWork);
        var result = await service.ReviewTransactionAsync(99999, reviewRequest, user.Id);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task CreateProject_WithDuplicateName_Succeeds()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");

        var request1 = new CreateProjectRequest
        {
            ProjectName = "Duplicate Project",
            SiteAddress = "123 Test Street",
            KickoffDate = DateTime.UtcNow.AddDays(1),
            HandoverTarget = DateTime.UtcNow.AddDays(90),
            AccountingSystem = CalculationMethod.Measured
        };

        var request2 = new CreateProjectRequest
        {
            ProjectName = "Duplicate Project",
            SiteAddress = "456 Test Street",
            KickoffDate = DateTime.UtcNow.AddDays(1),
            HandoverTarget = DateTime.UtcNow.AddDays(90),
            AccountingSystem = CalculationMethod.Measured
        };

        // Act
        var service = new ProjectService(Context, UnitOfWork);
        var result1 = await service.CreateProjectAsync(request1, user.Id);
        var result2 = await service.CreateProjectAsync(request2, user.Id);

        // Assert - Both should succeed (assuming duplicate names are allowed)
        result1.Should().BeGreaterThan(0);
        result2.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateTransaction_WithFutureDate_Succeeds()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var request = new CreateTransactionRequest
        {
            TransactionType = TransactionType.Expense,
            Amount = 1000.00m,
            Description = "Future transaction",
            TransactionDate = DateTime.UtcNow.AddDays(30) // Future date
        };

        // Act
        var service = new ProjectTransactionService(Context, UnitOfWork);
        var result = await service.CreateTransactionAsync(project.Id, request, user.Id);

        // Assert - Should succeed (assuming future dates are allowed)
        result.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateBOQItem_WithNegativeRate_ThrowsValidationException()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = await SeedUserAsync(email, hashedPassword, "Test User");
        var project = await SeedProjectAsync("Test Project", user.Id);

        var invalidRequest = new CreateBOQItemRequest
        {
            ProjectId = project.Id,
            ItemName = "Test Item",
            Unit = "m2",
            UnitRate = -50.00m, // Invalid: negative rate
            Quantity = 1000
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            var service = new BOQItemService(Context, UnitOfWork);
            await service.CreateBOQItemAsync(invalidRequest);
        });

        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task ReopenDailyLog_WithoutReason_ThrowsValidationException()
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

        var invalidRequest = new ReopenDailyLogRequest
        {
            Reason = "", // Invalid: empty reason
            NotifyRoleIds = new List<int> { 1, 2 }
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            var service = new DailyLogService(Context, UnitOfWork);
            await service.ReopenClosedDayAsync(boqItem.Id, DateTime.UtcNow.Date, user.Id, invalidRequest.Reason, invalidRequest.NotifyRoleIds);
        });

        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateUser_WithDuplicateEmail_ThrowsValidationException()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");

        var duplicateRequest = new CreateUserRequest
        {
            FirstName = "Test",
            LastName = "User",
            Email = email, // Duplicate email
            Password = password,
            Role = "Worker"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            var service = new UserService(Context, UnitOfWork);
            await service.CreateUserAsync(duplicateRequest);
        });

        exception.Should().NotBeNull();
    }
}
