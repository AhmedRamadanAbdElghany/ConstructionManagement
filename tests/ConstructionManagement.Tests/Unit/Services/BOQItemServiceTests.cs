using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;
using Xunit;

using ConstructionManagement.Domain.Enums;
namespace ConstructionManagement.Tests.Unit.Services;

public class BOQItemServiceTests
{
    private readonly Mock<IRepository<BOQItem>> _itemRepo = new();
    private readonly Mock<IRepository<BOQMeasured>> _measuredRepo = new();
    private readonly Mock<IRepository<BOQSupervision>> _supervisionRepo = new();
    private readonly Mock<IRepository<BOQPackage>> _packageRepo = new();
    private readonly Mock<IRepository<ItemInvoice>> _invoiceRepo = new();
    private readonly Mock<IRepository<Project>> _projectRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private BOQItemService CreateService() => new(
        _itemRepo.Object,
        _measuredRepo.Object,
        _supervisionRepo.Object,
        _packageRepo.Object,
        _invoiceRepo.Object,
        _projectRepo.Object,
        _unitOfWork.Object);

    #region Create BOQ Item Tests

    [Fact]
    public async Task CreateBOQItemAsync_ShouldCommit_WhenMeasuredTypeIsValid()
    {
        // Arrange
        var projectId = 1;
        var request = new CreateBOQItemRequest(
            ItemCode: "CONC-01",
            ItemName: "Concrete",
            Description: "Normal Concrete",
            Unit: "m3",
            StartDate: DateTime.UtcNow,
            EndDate: DateTime.UtcNow.AddMonths(1),
            AccountingType: "Measured",
            AgreedQuantity: 100,
            UnitPrice: 50,
            SupervisionPercentage: null,
            BaseCalculation: null,
            CustomBaseAmount: null,
            EstimatedTotalCost: null,
            TotalPackageValue: null,
            PaymentTerms: null
        );

        _projectRepo.Setup(r => r.GetByIdAsync(projectId))
            .ReturnsAsync(new Project { Id = projectId });

        var service = CreateService();

        // Act
        var result = await service.CreateBOQItemAsync(projectId, request, 1);

        // Assert
        _unitOfWork.Verify(u => u.BeginTransactionAsync(), Times.Once);
        _itemRepo.Verify(r => r.AddAsync(It.IsAny<BOQItem>()), Times.Once);
        _measuredRepo.Verify(r => r.AddAsync(It.IsAny<BOQMeasured>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
        _unitOfWork.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBOQItemAsync_ShouldThrowException_WhenProjectNotFound()
    {
        // Arrange
        var projectId = 99;
        var request = new CreateBOQItemRequest(
            ItemCode: null,
            ItemName: "Test",
            Description: null,
            Unit: null,
            StartDate: null,
            EndDate: null,
            AccountingType: "Measured",
            AgreedQuantity: 0,
            UnitPrice: 0,
            SupervisionPercentage: null,
            BaseCalculation: null,
            CustomBaseAmount: null,
            EstimatedTotalCost: null,
            TotalPackageValue: null,
            PaymentTerms: null
        );

        _projectRepo.Setup(r => r.GetByIdAsync(projectId))
            .ReturnsAsync((Project)null!);

        var service = CreateService();

        // Act
        var act = async () => await service.CreateBOQItemAsync(projectId, request, 1);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("المشروع غير موجود");

        _unitOfWork.Verify(u => u.RollbackAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBOQItemAsync_ShouldRollback_OnException()
    {
        // Arrange
        var projectId = 1;
        var request = new CreateBOQItemRequest(
            ItemCode: null,
            ItemName: "Error Item",
            Description: null,
            Unit: null,
            StartDate: null,
            EndDate: null,
            AccountingType: "Measured",
            AgreedQuantity: 10,
            UnitPrice: 10,
            SupervisionPercentage: null,
            BaseCalculation: null,
            CustomBaseAmount: null,
            EstimatedTotalCost: null,
            TotalPackageValue: null,
            PaymentTerms: null
        );

        _projectRepo.Setup(r => r.GetByIdAsync(projectId))
            .ReturnsAsync(new Project { Id = projectId });

        _itemRepo.Setup(r => r.AddAsync(It.IsAny<BOQItem>()))
            .ThrowsAsync(new Exception("DB Error"));

        var service = CreateService();

        // Act
        var act = async () => await service.CreateBOQItemAsync(projectId, request, 1);

        // Assert
        await act.Should().ThrowAsync<Exception>();

        _unitOfWork.Verify(u => u.RollbackAsync(), Times.Once);
        _unitOfWork.Verify(u => u.CommitAsync(), Times.Never);
    }

    #endregion

    #region Progress Calculation Tests

    [Fact]
    public async Task GetBOQItemWithProgressAsync_Measured_CalculatesCorrectly()
    {
        // Arrange
        var itemId = 10;
        var item = new BOQItem
        {
            Id = itemId,
            AccountingType = CalculationMethod.Measured,
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 200,
                ExecutedQuantity = 50
            }
        };

        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem> { item }.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(itemId);

        // Assert
        result.Should().NotBeNull();
        result!.Progress.Should().Be(25m); // 50 / 200 = 25%
    }

    [Fact]
    public async Task GetBOQItemWithProgressAsync_Supervision_CalculatesCorrectly()
    {
        // Arrange
        var itemId = 20;
        var item = new BOQItem
        {
            Id = itemId,
            AccountingType = CalculationMethod.Supervision,
            SupervisionData = new BOQSupervision { EstimatedTotalCost = 10000m }
        };

        var invoices = new List<ItemInvoice>
        {
            new ItemInvoice { Id = 1, BOQItemId = itemId, NetAmount = 2000m, Status = "Approved" },
            new ItemInvoice { Id = 2, BOQItemId = itemId, NetAmount = 1000m, Status = "Approved" },
            new ItemInvoice { Id = 3, BOQItemId = itemId, NetAmount = 5000m, Status = "Pending" }
        };

        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem> { item }.BuildMock());

        _invoiceRepo.Setup(r => r.AsQueryable())
            .Returns(invoices.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(itemId);

        // Assert
        result.Should().NotBeNull();
        result!.Progress.Should().Be(30m); // 3000 approved / 10000 total = 30%
    }

    #endregion

    #region Edge Cases & Special Scenarios

    [Fact]
    public async Task GetBOQItemWithProgressAsync_WhenItemDoesNotExist_ReturnsNull()
    {
        // Arrange
        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem>().BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetBOQItemWithProgressAsync_WhenAgreedQuantityIsZero_ReturnsZeroProgress()
    {
        // Arrange
        var item = new BOQItem
        {
            Id = 1,
            AccountingType = CalculationMethod.Measured,
            MeasuredData = new BOQMeasured { AgreedQuantity = 0, ExecutedQuantity = 10 }
        };

        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem> { item }.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(1);

        // Assert
        result!.Progress.Should().Be(0m); // Avoid DivideByZero
    }

    [Fact]
    public async Task GetBOQItemWithProgressAsync_WhenDataIsNull_ReturnsZeroProgress()
    {
        // Arrange
        var item = new BOQItem
        {
            Id = 1,
            AccountingType = CalculationMethod.Measured,
            MeasuredData = null
        };

        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem> { item }.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(1);

        // Assert
        result!.Progress.Should().Be(0m);
    }

    [Fact]
    public async Task CreateBOQItemAsync_WhenRequestIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var service = CreateService();

        // Act
        var act = async () => await service.CreateBOQItemAsync(1, null!, 1);

        // Assert
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    #endregion
}
