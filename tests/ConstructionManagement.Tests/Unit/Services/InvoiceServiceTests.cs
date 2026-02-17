using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using MockQueryable;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class InvoiceServiceTests
{
    private readonly Mock<IRepository<ItemInvoice>> _invoiceRepoMock = new();
    private readonly Mock<IRepository<ItemDailyLog>> _dailyLogRepoMock = new();
    private readonly Mock<IRepository<BOQItem>> _boqItemRepoMock = new();
    private readonly Mock<ILogger<InvoiceService>> _loggerMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ILocalizationService> _localizationServiceMock = new();
    private readonly Mock<ApplicationDbContext> _contextMock = new(); // This might be tricky if it's not and interface or virtual

    private InvoiceService CreateService()
        => new InvoiceService(
            _invoiceRepoMock.Object,
            _dailyLogRepoMock.Object,
            _boqItemRepoMock.Object,
            _contextMock.Object,
            _uowMock.Object,
            _loggerMock.Object,
            _localizationServiceMock.Object
        );

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
            SubTotal = 1500.50m,
            TaxRate = 14m,
            TaxAmount = 210.07m,
            RetentionRate = 5m,
            RetentionAmount = 75.03m,
            NetAmount = 1635.54m,
            Currency = "EGP",
            Description = "Test Invoice",
            SupplierVendor = "Modern Steel Co.",
            Status = "Approved",
            RejectionReason = null,
            ReviewDate = reviewDate,
            AttachmentPath = "/uploads/inv1.pdf",
            CreatedAt = createdAt,
            Reviewer = new User { FirstName = "Ahmed", LastName = "Accountant" },
            CreatedBy = new User { FirstName = "Engineer", LastName = "Ali" }
        };

        _invoiceRepoMock.Setup(r => r.AsQueryable())
            .Returns(new List<ItemInvoice> { invoice }.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetInvoiceByIdAsync(invoiceId);

        // Assert
        result.Should().NotBeNull();
        result!.InvoiceID.Should().Be(invoiceId);
        result.ItemID.Should().Be(10);
        result.InvoiceNumber.Should().Be("INV-2024-001");
        result.SubTotal.Should().Be(1500.50m);
        result.NetAmount.Should().Be(1635.54m);
        result.SupplierVendor.Should().Be("Modern Steel Co.");
        result.Status.Should().Be("Approved");
        result.ReviewerFullName.Should().Be("Ahmed Accountant");
        result.ReviewDate.Should().Be(reviewDate);
        result.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public async Task GetInvoiceByIdAsync_WhenReviewerIsNull_ShouldStillReturnDtoWithNullReviewerName()
    {
        // Arrange
        var invoiceId = 5;

        var invoice = new ItemInvoice
        {
            Id = invoiceId,
            Status = "Pending",
            Reviewer = null
        };

        _invoiceRepoMock.Setup(r => r.AsQueryable())
            .Returns(new List<ItemInvoice> { invoice }.BuildMock());

        var service = CreateService();

        // Act
        var result = await service.GetInvoiceByIdAsync(invoiceId);

        // Assert
        result.Should().NotBeNull();
        result!.ReviewerFullName.Should().BeNull();
    }
    [Fact]
    public async Task GetInvoicesForItemAsync_ShouldReturnOrderedListByDateDescending()
    {
        var itemId = 1;
        var older = new DateTime(2026, 1, 22);
        var newer = new DateTime(2026, 1, 24);

        var invoices = new List<ItemInvoice>
    {
        new() { Id = 1, BOQItemId = itemId, InvoiceDate = older,  Currency = "EGP", Status = "Pending" },
        new() { Id = 2, BOQItemId = itemId, InvoiceDate = newer,  Currency = "EGP", Status = "Pending" }
    };

        _invoiceRepoMock.Setup(r => r.AsQueryable()).Returns(invoices.BuildMock());

        var service = CreateService();

        var result = await service.GetInvoicesForItemAsync(itemId);

        result.Should().HaveCount(2);
        result[0].InvoiceID.Should().Be(2);
        result[0].InvoiceDate.Should().Be(newer);
        result[1].InvoiceID.Should().Be(1);
        result[1].InvoiceDate.Should().Be(older);
    }
}
