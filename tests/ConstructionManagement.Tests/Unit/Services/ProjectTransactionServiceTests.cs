using ConstructionManagement.Application.DTOs.Transaction;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;

using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.Tests.Unit.Services;

public class ProjectTransactionServiceTests
{
    private readonly Mock<IRepository<Transaction>> _transactionRepo = new();
    private readonly Mock<IRepository<BOQItem>> _boqItemRepo = new();
    private readonly Mock<IRepository<ProjectSettings>> _settingsRepo = new();
    private readonly Mock<IRepository<BOQProfitabilityLog>> _profitLogRepo = new();
    private readonly Mock<IFileStorageService> _fileStorage = new();
    private readonly Mock<INotificationService> _notificationService = new();
    private readonly Mock<IActivityLogService> _activityLogMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private ProjectTransactionService CreateService()
    {
        return new ProjectTransactionService(
            _transactionRepo.Object,
            _boqItemRepo.Object,
            _settingsRepo.Object,
            _fileStorage.Object,
            _profitLogRepo.Object,
            _notificationService.Object,
            _unitOfWork.Object,
            _activityLogMock.Object
        );
    }

    [Fact]
    public async Task CreateTransactionAsync_ShouldCommit_WhenValidRequest()
    {
        var projectId = 1;
        var request = new CreateTransactionRequest(null, TransactionType.Other, 500m, "Test", null, null, null);

        _settingsRepo.Setup(r => r.GetByIdAsync(projectId))
            .ReturnsAsync(new ProjectSettings { Id = projectId, EnableInvoiceReview = false });

        var service = CreateService();
        var result = await service.CreateTransactionAsync(projectId, request, 10);

        _unitOfWork.Verify(u => u.CommitAsync(), Times.Once);
        _transactionRepo.Verify(r => r.AddAsync(It.IsAny<Transaction>()), Times.Once);
    }

    [Fact]
    public async Task CreateTransactionAsync_WhenBudgetExceeded_SendsNotification()
    {
        var projectId = 1;
        var boqItemId = 100;
        var request = new CreateTransactionRequest(boqItemId, TransactionType.MaterialPurchase, 5000m, "Over Budget", null, null, null);

        _settingsRepo.Setup(r => r.GetByIdAsync(projectId))
            .ReturnsAsync(new ProjectSettings { Id = projectId, EnableInvoiceReview = false });

        var boqItem = new BOQItem
        {
            Id = boqItemId,
            ProjectId = projectId, // هام: ربط البند بالمشروع
            AccountingType = CalculationMethod.Measured,
            MeasuredData = new BOQMeasured { AgreedQuantity = 10, UnitPrice = 400 }, // الميزانية 4000
            Project = new Project { Id = projectId, ProjectName = "Test", OwnerUserId = 5 }
        };

        _boqItemRepo.Setup(r => r.AsQueryable()).Returns(new List<BOQItem> { boqItem }.BuildMock());
        _transactionRepo.Setup(r => r.AsQueryable()).Returns(new List<Transaction>().BuildMock());

        var service = CreateService();
        await service.CreateTransactionAsync(projectId, request, 10);

        _notificationService.Verify(n => n.CreateAndSendAsync(
            5,
            It.Is<string>(s => s.Contains("تصعيد حرج")),
            It.IsAny<string>(),
            It.IsAny<string>(),
            NotificationType.BudgetOverrun),
            Times.Once);
    }

    [Fact]
    public async Task GetProjectProfitabilityAsync_CalculatesTotalsCorrectly()
    {
        int projectId = 1;
        var items = new List<BOQItem>
        {
            new BOQItem { Id = 10, ProjectId = projectId, AccountingType = CalculationMethod.Measured, MeasuredData = new BOQMeasured { AgreedQuantity = 100, UnitPrice = 100 } }, // 10,000
            new BOQItem { Id = 20, ProjectId = projectId, AccountingType = CalculationMethod.Measured, MeasuredData = new BOQMeasured { AgreedQuantity = 50, UnitPrice = 100 } }  // 5,000
        };
        var transactions = new List<Transaction>
        {
            new Transaction { ProjectId = projectId, Amount = 3000, Status = TransactionStatus.Approved }
        };

        _boqItemRepo.Setup(r => r.AsQueryable()).Returns(items.BuildMock());
        _transactionRepo.Setup(r => r.AsQueryable()).Returns(transactions.BuildMock());

        var service = CreateService();
        var result = await service.GetProjectProfitabilityAsync(projectId);

        result.Should().NotBeNull();
        result.TotalEstimatedBudget.Should().Be(15000);
        result.TotalSpent.Should().Be(3000);
        result.TotalProfit.Should().Be(12000);
    }
}
