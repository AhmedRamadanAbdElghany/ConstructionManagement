using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;

namespace ConstructionManagement.Tests.Unit.Services;

public class InvoiceServiceTests
{
    private readonly Mock<IRepository<ItemInvoice>> _invoiceRepoMock = new();
    private readonly Mock<IRepository<ItemDailyLog>> _logRepoMock = new();
    private readonly Mock<IRepository<BOQItem>> _boqItemRepoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    private InvoiceService CreateService() =>
        new(_invoiceRepoMock.Object, _logRepoMock.Object, _boqItemRepoMock.Object, _uowMock.Object);

    [Fact]
    public async Task GetInvoiceByIdAsync_ShouldMapAllFieldsCorrectly()
    {
        // Arrange
        var invoiceId = 1;
        var createdAt = DateTime.UtcNow.AddDays(-1);
        var reviewDate = DateTime.UtcNow;

        var invoice = new ItemInvoice
        {
            Id = invoiceId,
            BOQItemId = 10,
            InvoiceNumber = "INV-2024-001",
            InvoiceDate = DateTime.Today,
            Amount = 1500.50m,
            Description = "Test Invoice",
            SupplierVendor = "Modern Steel Co.",
            Status = "Approved",
            RejectionReason = null,
            ReviewDate = reviewDate,
            AttachmentPath = "/uploads/inv1.pdf",
            CreatedAt = createdAt,
            Reviewer = new User { FullName = "Ahmed Accountant" }
        };

        var mockData = new List<ItemInvoice> { invoice }.BuildMock();
        _invoiceRepoMock.Setup(r => r.AsQueryable()).Returns(mockData);

        var service = CreateService();

        // Act
        var result = await service.GetInvoiceByIdAsync(invoiceId);

        // Assert
        result.Should().NotBeNull();
        result!.InvoiceID.Should().Be(invoiceId);
        result.ItemID.Should().Be(10);
        result.InvoiceNumber.Should().Be("INV-2024-001");
        result.Amount.Should().Be(1500.50m);
        result.SupplierVendor.Should().Be("Modern Steel Co.");
        result.Status.Should().Be("Approved");
        result.AccountantFullName.Should().Be("Ahmed Accountant"); // التاكد من المابينج لهذا الحقل تحديداً
        result.ReviewDate.Should().Be(reviewDate);
        result.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task GetInvoiceByIdAsync_WhenReviewerIsNull_ShouldStillReturnDtoWithNullAccountantName()
    {
        // Arrange
        var invoiceId = 5;
        var invoice = new ItemInvoice
        {
            Id = invoiceId,
            Status = "Pending",
            Reviewer = null // حالة فاتورة لم تراجع بعد
        };

        _invoiceRepoMock.Setup(r => r.AsQueryable()).Returns(new List<ItemInvoice> { invoice }.BuildMock());
        var service = CreateService();

        // Act
        var result = await service.GetInvoiceByIdAsync(invoiceId);

        // Assert
        result.Should().NotBeNull();
        result!.AccountantFullName.Should().BeNull();
    }

    [Fact]
    public async Task GetInvoicesForItemAsync_ShouldReturnOrderedListByDateDescending()
    {
        // Arrange
        var itemId = 1;
        var invoices = new List<ItemInvoice>
        {
            new ItemInvoice { Id = 1, BOQItemId = itemId, InvoiceDate = DateTime.Today.AddDays(-2) },
            new ItemInvoice { Id = 2, BOQItemId = itemId, InvoiceDate = DateTime.Today }
        }.BuildMock();

        _invoiceRepoMock.Setup(r => r.AsQueryable()).Returns(invoices);
        var service = CreateService();

        // Act
        var result = await service.GetInvoicesForItemAsync(itemId);

        // Assert
        result.Should().HaveCount(2);
        result[0].InvoiceID.Should().Be(2); // الاحدث اولا كما في الكود OrderByDescending
        result[1].InvoiceID.Should().Be(1);
    }
}