using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;

namespace ConstructionManagement.Tests.Unit.Services;

public class BOQItemServiceTests
{
    private readonly Mock<IRepository<BOQItem>> _itemRepo = new();
    private readonly Mock<IRepository<BOQMeasured>> _measuredRepo = new();
    private readonly Mock<IRepository<BOQSupervision>> _supervisionRepo = new();
    private readonly Mock<IRepository<ItemInvoice>> _invoiceRepo = new();
    private readonly Mock<IRepository<Project>> _projectRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private BOQItemService CreateService() => new(
        _itemRepo.Object,
        _measuredRepo.Object,
        _supervisionRepo.Object,
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
            EstimatedTotalCost: null
        );

        // Service uses GetByIdAsync to verify project existence
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
        var request = new CreateBOQItemRequest(null, "Test", null, null, null, null, "Measured", 0, 0, null, null, null, null);

        _projectRepo.Setup(r => r.GetByIdAsync(projectId))
            .ReturnsAsync((Project)null!);

        var service = CreateService();

        // Act
        var act = async () => await service.CreateBOQItemAsync(projectId, request, 1);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("المشروع غير موجود");

        // Even if project is not found, the service should rollback the transaction it started
        _unitOfWork.Verify(u => u.RollbackAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBOQItemAsync_ShouldRollback_OnException()
    {
        // Arrange
        var projectId = 1;
        var request = new CreateBOQItemRequest(
            null, "Error Item", null, null, null, null,
            "Measured", 10, 10, null, null, null, null
        );

        _projectRepo.Setup(r => r.GetByIdAsync(projectId))
            .ReturnsAsync(new Project { Id = projectId });

        // Simulate database failure
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
            AccountingType = "Measured",
            MeasuredData = new BOQMeasured
            {
                AgreedQuantity = 200,
                ExecutedQuantity = 50
            }
        };

        // Fix: Removed .AsQueryable() call before .BuildMock()
        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem> { item }.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(itemId);

        // Assert
        result.Should().NotBeNull();
        result!.Progress.Should().Be(25m); // 50 executes / 200 agreed * 100
    }

    [Fact]
    public async Task GetBOQItemWithProgressAsync_Supervision_CalculatesCorrectly()
    {
        // Arrange
        var itemId = 20;
        var item = new BOQItem
        {
            Id = itemId,
            AccountingType = "Supervision",
            SupervisionData = new BOQSupervision { EstimatedTotalCost = 10000 }
        };

        var invoices = new List<ItemInvoice>
        {
            new ItemInvoice { Id = 1, BOQItemId = itemId, Amount = 2000, Status = "Approved" },
            new ItemInvoice { Id = 2, BOQItemId = itemId, Amount = 1000, Status = "Approved" },
            new ItemInvoice { Id = 3, BOQItemId = itemId, Amount = 5000, Status = "Pending" }
        };

        // Fix: Correct usage of BuildMock on the lists directly
        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem> { item }.BuildMock());

        _invoiceRepo.Setup(r => r.AsQueryable())
            .Returns(invoices.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(itemId);

        // Assert
        result.Should().NotBeNull();
        result!.Progress.Should().Be(30m); // 3000 approved / 10000 total * 100
    }

    #endregion

    // ─── أضف هذه الاختبارات داخل الكلاس ───

    #region Edge Cases & Special Scenarios

    [Fact]
    public async Task GetBOQItemWithProgressAsync_WhenItemDoesNotExist_ReturnsNull()
    {
        // Arrange
        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem>().BuildMock()); // قائمة فارغة

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetBOQItemWithProgressAsync_WhenAgreedQuantityIsZero_ReturnsZeroProgress()
    {
        // Arrange: اختبار تجنب الخطأ DivideByZeroException
        var item = new BOQItem
        {
            Id = 1,
            AccountingType = "Measured",
            MeasuredData = new BOQMeasured { AgreedQuantity = 0, ExecutedQuantity = 10 }
        };

        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem> { item }.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(1);

        // Assert
        result!.Progress.Should().Be(0);
    }

    [Fact]
    public async Task GetBOQItemWithProgressAsync_WhenDataIsNull_ReturnsZeroProgress()
    {
        // Arrange: حالة وجود بند Measured ولكن بدون سجل في جدول MeasuredData
        var item = new BOQItem
        {
            Id = 1,
            AccountingType = "Measured",
            MeasuredData = null // بيانات مفقودة
        };

        _itemRepo.Setup(r => r.AsQueryable())
            .Returns(new List<BOQItem> { item }.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetBOQItemWithProgressAsync(1);

        // Assert
        result!.Progress.Should().Be(0);
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