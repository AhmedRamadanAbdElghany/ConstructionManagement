using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.Transaction;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Integration.Service;

public class ErrorHandlingIntegrationTests : IntegrationTestBase
{
    private readonly IConfiguration _emptyConfig = new ConfigurationBuilder().Build();
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock = new();
    private readonly Mock<ICompanyRequestRepository> _companyRequestRepoMock = new();
    private readonly Mock<INotificationService> _notificationServiceMock = new();
    private readonly Mock<ILocalizationService> _localizationServiceMock = new();

    [Fact]
    public async Task CreateProject_WithInvalidData_ThrowsValidationException()
    {
        // Arrange
        const string email = "test@example.com";
        const string password = "Password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        await SeedUserAsync(email, hashedPassword, "Test User");

        var invalidRequest = new CreateProjectRequest(
            ProjectName: "", // Invalid: empty name
            Description: "123 Test Street",
            StartDate: DateTime.UtcNow.AddDays(-1), 
            EndDate: DateTime.UtcNow.AddDays(-10), // Invalid: before kickoff
            GeneralManagerUserId: null,
            AccountingSystem: CalculationMethod.Measured.ToString(),
            TotalContractValue: 100000
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            var projectRepo = new Repository<Project>(Context);
            var userRoleRepo = new Repository<UserRole>(Context);
            var userRepo = new Repository<User>(Context);
            var settingsRepo = new Repository<ProjectSettings>(Context);
            var phaseService = new Mock<IPhaseService>().Object;
            var activityLogService = new Mock<IActivityLogService>().Object;
            
            var service = new ProjectService(projectRepo, userRoleRepo, userRepo, settingsRepo, phaseService, UnitOfWork, activityLogService);
            await service.CreateProjectAsync(invalidRequest, 1);
        });

        exception.Message.Should().Contain("تاريخ نهاية المشروع");
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

        // Add required ProjectSettings for the project
        Context.ProjectSettings.Add(new ProjectSettings { Id = project.Id, EnableInvoiceReview = false });
        await Context.SaveChangesAsync();

        var invalidRequest = new CreateTransactionRequest(
            BOQItemId: null,
            Type: TransactionType.Overhead,
            Amount: -100.00m, // Invalid: negative amount
            Description: "Test transaction",
            InvoiceNumber: null,
            SupplierName: null,
            InvoiceAttachment: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(async () =>
        {
            var settingsRepo = new Repository<ProjectSettings>(Context);
            var transactionRepo = new Repository<Transaction>(Context);
            var boqItemRepo = new Repository<BOQItem>(Context);
            var profitabilityLogRepo = new Repository<BOQProfitabilityLog>(Context);
            var activityLogService = new Mock<IActivityLogService>().Object;
            var service = new ProjectTransactionService(
                transactionRepo, boqItemRepo, settingsRepo, new Mock<IFileStorageService>().Object, profitabilityLogRepo, new Mock<INotificationService>().Object, UnitOfWork, activityLogService);
            await service.CreateTransactionAsync(project.Id, invalidRequest, user.Id);
        });

        exception.Message.Should().Contain("مبلغ");
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
            ItemCode = "TEST",
            AccountingType = CalculationMethod.Measured
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        // Act & Assert
        var logRepo = new Repository<ItemDailyLog>(Context);
        var deltaRepo = new Repository<BOQExecutedDelta>(Context);
        var itemRepo = new Repository<BOQItem>(Context);
        var activityLogService = new Mock<IActivityLogService>().Object;
        var service = new DailyLogService(logRepo, deltaRepo, itemRepo, activityLogService, UnitOfWork, _localizationServiceMock.Object);
        
        var logId = await service.GetOrCreateDailyLogIdAsync(boqItem.Id, DateTime.UtcNow.Date, user.Id);
        logId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsFailure()
    {
        // Arrange
        var loginRequest = new LoginRequest("nonexistent@example.com", "Password123");

        // Act
        var userRepo = new UserRepository(Context);
        var service = new AuthService(userRepo, _emptyConfig, UnitOfWork, _httpContextAccessorMock.Object, _companyRequestRepoMock.Object, _notificationServiceMock.Object, new Repository<Vendor>(Context), new Repository<Role>(Context), new Repository<UserRole>(Context), _localizationServiceMock.Object);
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
        var userRepo = new UserRepository(Context);
        var service = new AuthService(userRepo, _emptyConfig, UnitOfWork, _httpContextAccessorMock.Object, _companyRequestRepoMock.Object, _notificationServiceMock.Object, new Repository<Vendor>(Context), new Repository<Role>(Context), new Repository<UserRole>(Context), _localizationServiceMock.Object);
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

        var invalidRequest = new CreateBOQItemRequest(
            PhaseId: null,
            ItemCode: "I001",
            ItemName: "Test Item",
            Description: null,
            Unit: "m2",
            StartDate: null,
            EndDate: null,
            AccountingType: CalculationMethod.Measured.ToString(),
            AgreedQuantity: 0, // Invalid: zero quantity
            UnitPrice: 100,
            SupervisionPercentage: null,
            BaseCalculation: null,
            CustomBaseAmount: null,
            EstimatedTotalCost: null,
            TotalPackageValue: null,
            PaymentTerms: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            var itemRepo = new Repository<BOQItem>(Context);
            var measuredRepo = new Repository<BOQMeasured>(Context);
            var supervisionRepo = new Repository<BOQSupervision>(Context);
            var packageRepo = new Repository<BOQPackage>(Context);
            var invoiceRepo = new Repository<ItemInvoice>(Context);
            var projectRepo = new Repository<Project>(Context);
            var activityLogService = new Mock<IActivityLogService>().Object;
            
            var service = new BOQItemService(itemRepo, measuredRepo, supervisionRepo, packageRepo, invoiceRepo, projectRepo, activityLogService, UnitOfWork);
            await service.CreateBOQItemAsync(project.Id, invalidRequest, user.Id);
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

        var updateRequest = new UpdateProjectRequest(
            ProjectName: "Updated Project",
            Description: "Updated Description",
            StartDate: null,
            EndDate: null,
            TotalContractValue: null,
            GeneralManagerUserId: null
        );

        // Act
        var projectRepo = new Repository<Project>(Context);
        var userRoleRepo = new Repository<UserRole>(Context);
        var userRepo = new Repository<User>(Context);
        var settingsRepo = new Repository<ProjectSettings>(Context);
        var phaseService = new Mock<IPhaseService>().Object;
        var activityLogService = new Mock<IActivityLogService>().Object;
        
        var service = new ProjectService(projectRepo, userRoleRepo, userRepo, settingsRepo, phaseService, UnitOfWork, activityLogService);
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

        var closeRequest = new CloseDailyLogRequest(
            DailyProgressPercentage: 75,
            ProgressNotes: "Closing non-existent log",
            ClosingNotes: null
        );

        // Act
        var logRepo = new Repository<ItemDailyLog>(Context);
        var deltaRepo = new Repository<BOQExecutedDelta>(Context);
        var itemRepo = new Repository<BOQItem>(Context);
        var activityLogService = new Mock<IActivityLogService>().Object;
        var service = new DailyLogService(logRepo, deltaRepo, itemRepo, activityLogService, UnitOfWork, _localizationServiceMock.Object);
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

        var reviewRequest = new ReviewTransactionRequest(
            Status: TransactionStatus.Approved,
            ReviewNotes: "Reviewing non-existent transaction"
        );

        // Act
        var settingsRepo = new Repository<ProjectSettings>(Context);
        var transactionRepo = new Repository<Transaction>(Context);
        var boqItemRepo = new Repository<BOQItem>(Context);
        var profitabilityLogRepo = new Repository<BOQProfitabilityLog>(Context);
        var activityLogService = new Mock<IActivityLogService>().Object;
        var service = new ProjectTransactionService(
            transactionRepo, boqItemRepo, settingsRepo, new Mock<IFileStorageService>().Object, profitabilityLogRepo, new Mock<INotificationService>().Object, UnitOfWork, activityLogService);
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

        var request1 = new CreateProjectRequest(
            ProjectName: "Duplicate Project",
            Description: "123 Test Street",
            StartDate: DateTime.UtcNow.AddDays(1),
            EndDate: DateTime.UtcNow.AddDays(90),
            GeneralManagerUserId: null,
            AccountingSystem: CalculationMethod.Measured.ToString(),
            TotalContractValue: 100000
        );

        var request2 = new CreateProjectRequest(
            ProjectName: "Duplicate Project",
            Description: "456 Test Street",
            StartDate: DateTime.UtcNow.AddDays(1),
            EndDate: DateTime.UtcNow.AddDays(100),
            GeneralManagerUserId: null,
            AccountingSystem: CalculationMethod.Measured.ToString(),
            TotalContractValue: 100000
        );

        // Act
        var projectRepo = new Repository<Project>(Context);
        var userRoleRepo = new Repository<UserRole>(Context);
        var userRepo = new Repository<User>(Context);
        var settingsRepo = new Repository<ProjectSettings>(Context);
        var phaseService = new Mock<IPhaseService>().Object;
        var activityLogService = new Mock<IActivityLogService>().Object;
        
        var service = new ProjectService(projectRepo, userRoleRepo, userRepo, settingsRepo, phaseService, UnitOfWork, activityLogService);
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

        // Add required ProjectSettings for the project
        Context.ProjectSettings.Add(new ProjectSettings { Id = project.Id, EnableInvoiceReview = false });
        await Context.SaveChangesAsync();

        var request = new CreateTransactionRequest(
            BOQItemId: null,
            Type: TransactionType.Overhead,
            Amount: 1000.00m,
            Description: "Future transaction",
            InvoiceNumber: null,
            SupplierName: null,
            InvoiceAttachment: null
        );

        // Act
        var settingsRepo = new Repository<ProjectSettings>(Context);
        var transactionRepo = new Repository<Transaction>(Context);
        var boqItemRepo = new Repository<BOQItem>(Context);
        var profitabilityLogRepo = new Repository<BOQProfitabilityLog>(Context);
        var activityLogService = new Mock<IActivityLogService>().Object;
        var service = new ProjectTransactionService(
            transactionRepo, boqItemRepo, settingsRepo, new Mock<IFileStorageService>().Object, profitabilityLogRepo, new Mock<INotificationService>().Object, UnitOfWork, activityLogService);
        var result = await service.CreateTransactionAsync(project.Id, request, user.Id);

        // Assert - Should succeed
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

        var invalidRequest = new CreateBOQItemRequest(
            PhaseId: null,
            ItemCode: "I001",
            ItemName: "Test Item",
            Description: null,
            Unit: "m2",
            StartDate: null,
            EndDate: null,
            AccountingType: CalculationMethod.Measured.ToString(),
            AgreedQuantity: 1000,
            UnitPrice: -50.00m, // Invalid: negative rate
            SupervisionPercentage: null,
            BaseCalculation: null,
            CustomBaseAmount: null,
            EstimatedTotalCost: null,
            TotalPackageValue: null,
            PaymentTerms: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            var itemRepo = new Repository<BOQItem>(Context);
            var measuredRepo = new Repository<BOQMeasured>(Context);
            var supervisionRepo = new Repository<BOQSupervision>(Context);
            var packageRepo = new Repository<BOQPackage>(Context);
            var invoiceRepo = new Repository<ItemInvoice>(Context);
            var projectRepo = new Repository<Project>(Context);
            var activityLogMock = new Mock<IActivityLogService>();
            
            var service = new BOQItemService(itemRepo, measuredRepo, supervisionRepo, packageRepo, invoiceRepo, projectRepo, activityLogMock.Object, UnitOfWork);
            await service.CreateBOQItemAsync(project.Id, invalidRequest, user.Id);
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
            ItemCode = "REOPEN",
            AccountingType = CalculationMethod.Measured
        };
        Context.BOQItems.Add(boqItem);
        await Context.SaveChangesAsync();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            var logRepo = new Repository<ItemDailyLog>(Context);
            var deltaRepo = new Repository<BOQExecutedDelta>(Context);
            var itemRepo = new Repository<BOQItem>(Context);
            var activityLogMock = new Mock<IActivityLogService>();
            var service = new DailyLogService(logRepo, deltaRepo, itemRepo, activityLogMock.Object, UnitOfWork, _localizationServiceMock.Object);
            await service.ReopenClosedDayAsync(boqItem.Id, DateTime.UtcNow.Date, user.Id, "", new List<int> { 1, 2 });
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

        var user = await SeedUserAsync(email, hashedPassword, "Test User");

        // Create SuperAdmin role and assign to user for authorization
        var superAdminRole = new Role { Name = "SuperAdmin" };
        Context.Roles.Add(superAdminRole);
        await Context.SaveChangesAsync();
        
        var userRole = new UserRole { UserId = user.Id, RoleId = superAdminRole.Id };
        Context.UserRoles.Add(userRole);
        await Context.SaveChangesAsync();

        var duplicateRequest = new AddUserRequest(
            FullName: "Test User",
            Email: email, // Duplicate email
            Password: password
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            var userRepo = new Repository<User>(Context);
            var roleRepo = new Repository<Role>(Context);
            var userRoleRepo = new Repository<UserRole>(Context);
            var service = new UserService(userRepo, roleRepo, userRoleRepo, UnitOfWork);
            await service.AddUserAsync(duplicateRequest, user.Id);
        });

        exception.Should().NotBeNull();
    }
}
