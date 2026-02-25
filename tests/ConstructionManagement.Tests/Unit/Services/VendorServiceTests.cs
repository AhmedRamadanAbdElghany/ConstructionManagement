using ConstructionManagement.Application.DTOs.Vendor;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class VendorServiceTests
{
    private readonly Mock<IRepository<Vendor>> _vendorRepoMock = new();
    private readonly Mock<IRepository<VendorInvoice>> _invoiceRepoMock = new();
    private readonly Mock<IRepository<VendorProduct>> _productRepoMock = new();
    private readonly Mock<IRepository<CompanySettings>> _settingsRepoMock = new();
    private readonly Mock<IRepository<User>> _userRepoMock = new();
    private readonly Mock<IFileStorageService> _fileStorageMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<INotificationService> _notificationMock = new();
    private readonly Mock<IActivityLogService> _activityLogMock = new();
    private readonly Mock<ICompanyContext> _companyContextMock = new();
    private readonly Mock<IRepository<VendorTransaction>> _transactionRepoMock = new();
    private readonly Mock<IRepository<DeliveryCostTier>> _deliveryTierRepoMock = new();
    private readonly Mock<IRepository<ItemInvoice>> _itemInvoiceRepoMock = new();

    private VendorService CreateService()
        => new(
            _vendorRepoMock.Object,
            _invoiceRepoMock.Object,
            _productRepoMock.Object,
            _transactionRepoMock.Object,
            _settingsRepoMock.Object,
            _userRepoMock.Object,
            _fileStorageMock.Object,
            _unitOfWorkMock.Object,
            _activityLogMock.Object,
            _deliveryTierRepoMock.Object,
            _itemInvoiceRepoMock.Object,
            _notificationMock.Object,
            _companyContextMock.Object
        );

    public VendorServiceTests()
    {
        _companyContextMock.Setup(c => c.CompanyId).Returns(1);
        _vendorRepoMock.Setup(r => r.AddAsync(It.IsAny<Vendor>()))
            .Returns<Vendor>(v => Task.FromResult(v));
        _invoiceRepoMock.Setup(r => r.AddAsync(It.IsAny<VendorInvoice>()))
            .Returns<VendorInvoice>(i => Task.FromResult(i));
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
    }

    #region GetVendorsAsync

    [Fact]
    public async Task GetVendorsAsync_ShouldReturnActiveVendorsForCompany()
    {
        // Arrange
        var vendors = new List<Vendor>
        {
            new() { Id = 1, CompanyId = 1, Name = "Vendor A", IsActive = true, Invoices = new List<VendorInvoice>() },
            new() { Id = 2, CompanyId = 1, Name = "Vendor B", IsActive = true, Invoices = new List<VendorInvoice>() },
            new() { Id = 3, CompanyId = 1, Name = "Inactive Vendor", IsActive = false, Invoices = new List<VendorInvoice>() }
        };

        _vendorRepoMock.Setup(r => r.AsQueryable()).Returns(vendors.BuildMock());
        var service = CreateService();

        // Act
        var result = (await service.GetVendorsAsync()).ToList();

        // Assert
        result.Should().HaveCount(2);
        result.All(v => v.IsActive).Should().BeTrue();
    }

    [Fact]
    public async Task GetVendorsAsync_ShouldMapAllFields()
    {
        // Arrange
        var vendor = new Vendor
        {
            Id = 1, CompanyId = 1, Name = "Test Vendor", Phone = "0123456789",
            Email = "test@vendor.com", Address = "123 Test St", TaxNumber = "TAX123",
            ContactPerson = "John Doe", Notes = "Test notes", VendorType = "Supplier",
            CurrentBalance = 5000, TotalPaid = 10000, TotalInvoiced = 15000, IsActive = true,
            Invoices = new List<VendorInvoice>()
        };

        _vendorRepoMock.Setup(r => r.AsQueryable()).Returns(new List<Vendor> { vendor }.BuildMock());
        var service = CreateService();

        // Act
        var result = (await service.GetVendorsAsync()).First();

        // Assert
        result.Id.Should().Be(1);
        result.Name.Should().Be("Test Vendor");
        result.CurrentBalance.Should().Be(5000);
    }

    #endregion

    #region GetVendorByIdAsync

    [Fact]
    public async Task GetVendorByIdAsync_WhenVendorExists_ShouldReturnVendor()
    {
        // Arrange
        var vendor = new Vendor { Id = 1, CompanyId = 1, Name = "Test Vendor", IsActive = true, Invoices = new List<VendorInvoice>() };
        _vendorRepoMock.Setup(r => r.AsQueryable()).Returns(new List<Vendor> { vendor }.BuildMock());
        var service = CreateService();

        // Act
        var result = await service.GetVendorByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Test Vendor");
    }

    [Fact]
    public async Task GetVendorByIdAsync_WhenVendorNotExists_ShouldReturnNull()
    {
        // Arrange
        _vendorRepoMock.Setup(r => r.AsQueryable()).Returns(new List<Vendor>().BuildMock());
        var service = CreateService();

        // Act
        var result = await service.GetVendorByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateVendorAsync

    [Fact]
    public async Task CreateVendorAsync_ShouldCreateVendorAndReturnDto()
    {
        // Arrange
        var request = new CreateVendorRequest { Name = "New Vendor", Phone = "0123456789", Email = "new@vendor.com" };
        Vendor? capturedVendor = null;
        _vendorRepoMock.Setup(r => r.AddAsync(It.IsAny<Vendor>()))
            .Callback<Vendor>(v => { v.Id = 1; capturedVendor = v; })
            .Returns<Vendor>(v => Task.FromResult(v));
        var service = CreateService();

        // Act
        var result = await service.CreateVendorAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Vendor");
        result.IsActive.Should().BeTrue();
        _vendorRepoMock.Verify(r => r.AddAsync(It.IsAny<Vendor>()), Times.Once);
    }

    #endregion

    #region UpdateVendorAsync

    [Fact]
    public async Task UpdateVendorAsync_WhenVendorExists_ShouldUpdateAndReturnDto()
    {
        // Arrange
        var vendor = new Vendor { Id = 1, CompanyId = 1, Name = "Old Name", Phone = "0123456789", Email = "old@vendor.com", IsActive = true };
        _vendorRepoMock.Setup(r => r.AsQueryable()).Returns(new List<Vendor> { vendor }.BuildMock());
        var request = new UpdateVendorRequest { Name = "Updated Name", Phone = "0987654321", Email = "updated@vendor.com", IsActive = true };
        var service = CreateService();

        // Act
        var result = await service.UpdateVendorAsync(1, request);

        // Assert
        result.Name.Should().Be("Updated Name");
        result.Phone.Should().Be("0987654321");
    }

    [Fact]
    public async Task UpdateVendorAsync_WhenVendorNotExists_ShouldThrowException()
    {
        // Arrange
        _vendorRepoMock.Setup(r => r.AsQueryable()).Returns(new List<Vendor>().BuildMock());
        var request = new UpdateVendorRequest { Name = "Test" };
        var service = CreateService();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateVendorAsync(999, request));
    }

    #endregion

    #region DeleteVendorAsync

    [Fact]
    public async Task DeleteVendorAsync_WhenVendorExists_ShouldSoftDelete()
    {
        // Arrange
        var vendor = new Vendor { Id = 1, CompanyId = 1, Name = "Vendor to Delete", IsActive = true, Invoices = new List<VendorInvoice>() };
        _vendorRepoMock.Setup(r => r.AsQueryable()).Returns(new List<Vendor> { vendor }.BuildMock());
        var service = CreateService();

        // Act
        var result = await service.DeleteVendorAsync(1);

        // Assert
        result.Should().BeTrue();
        vendor.IsActive.Should().BeFalse();
    }

    #endregion

    #region GetPendingInvoicesAsync

    [Fact]
    public async Task GetPendingInvoicesAsync_ShouldReturnOnlyPendingInvoices()
    {
        // Arrange
        var invoices = new List<VendorInvoice>
        {
            new() { Id = 1, CompanyId = 1, ApprovalStatus = InvoiceApprovalStatus.Pending, Vendor = new Vendor { Name = "V1" } },
            new() { Id = 2, CompanyId = 1, ApprovalStatus = InvoiceApprovalStatus.Approved, Vendor = new Vendor { Name = "V2" } },
            new() { Id = 3, CompanyId = 1, ApprovalStatus = InvoiceApprovalStatus.Pending, Vendor = new Vendor { Name = "V3" } }
        };

        _invoiceRepoMock.Setup(r => r.AsQueryable()).Returns(invoices.BuildMock());
        var service = CreateService();

        // Act
        var result = (await service.GetPendingInvoicesAsync()).ToList();

        // Assert
        result.Should().HaveCount(2);
        result.All(i => i.ApprovalStatus == "Pending").Should().BeTrue();
    }

    #endregion

    #region CreateInvoiceAsync

    [Fact]
    public async Task CreateInvoiceAsync_WhenNoApprovalRequired_ShouldAutoApprove()
    {
        // Arrange
        var settings = new CompanySettings { CompanyId = 1, RequireInvoiceApproval = false };
        var vendor = new Vendor { Id = 1, Name = "Test Vendor", CurrentBalance = 0, TotalInvoiced = 0 };

        _settingsRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CompanySettings> { settings }.BuildMock());
        _vendorRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(vendor);
        _invoiceRepoMock.Setup(r => r.AddAsync(It.IsAny<VendorInvoice>()))
            .Callback<VendorInvoice>(i => i.Id = 1)
            .Returns<VendorInvoice>(i => Task.FromResult(i));

        var request = new CreateVendorInvoiceRequest { VendorId = 1, InvoiceNumber = "INV-001", Amount = 1000, CreatedByUserId = 1 };
        var service = CreateService();

        // Act
        var result = await service.CreateInvoiceAsync(request);

        // Assert
        result.ApprovalStatus.Should().Be("Approved");
    }

    [Fact]
    public async Task CreateInvoiceAsync_WhenApprovalRequired_ShouldSetPending()
    {
        // Arrange
        var settings = new CompanySettings { CompanyId = 1, RequireInvoiceApproval = true };
        var vendor = new Vendor { Id = 1, Name = "Test Vendor" };

        _settingsRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CompanySettings> { settings }.BuildMock());
        _vendorRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(vendor);
        _invoiceRepoMock.Setup(r => r.AddAsync(It.IsAny<VendorInvoice>()))
            .Callback<VendorInvoice>(i => i.Id = 1)
            .Returns<VendorInvoice>(i => Task.FromResult(i));

        var request = new CreateVendorInvoiceRequest { VendorId = 1, InvoiceNumber = "INV-001", Amount = 1000, CreatedByUserId = 1 };
        var service = CreateService();

        // Act
        var result = await service.CreateInvoiceAsync(request);

        // Assert
        result.ApprovalStatus.Should().Be("Pending");
    }

    #endregion

    #region ReviewInvoiceAsync

    [Fact]
    public async Task ReviewInvoiceAsync_WhenApproved_ShouldUpdateStatus()
    {
        // Arrange
        var invoice = new VendorInvoice { Id = 1, CompanyId = 1, ApprovalStatus = InvoiceApprovalStatus.Pending, Amount = 1000, Vendor = new Vendor { Name = "Test Vendor" } };
        _invoiceRepoMock.Setup(r => r.AsQueryable()).Returns(new List<VendorInvoice> { invoice }.BuildMock());
        var request = new ReviewVendorInvoiceRequest { IsApproved = true };
        var service = CreateService();

        // Act
        var result = await service.ReviewInvoiceAsync(1, request, 1);

        // Assert
        result.ApprovalStatus.Should().Be("Approved");
    }

    [Fact]
    public async Task ReviewInvoiceAsync_WhenRejected_ShouldSetRejectionReason()
    {
        // Arrange
        var invoice = new VendorInvoice { Id = 1, CompanyId = 1, ApprovalStatus = InvoiceApprovalStatus.Pending, Amount = 1000, Vendor = new Vendor { Name = "Test Vendor" } };
        _invoiceRepoMock.Setup(r => r.AsQueryable()).Returns(new List<VendorInvoice> { invoice }.BuildMock());
        var request = new ReviewVendorInvoiceRequest { IsApproved = false, RejectionReason = "Invalid invoice" };
        var service = CreateService();

        // Act
        var result = await service.ReviewInvoiceAsync(1, request, 1);

        // Assert
        result.ApprovalStatus.Should().Be("Rejected");
        result.RejectionReason.Should().Be("Invalid invoice");
    }

    [Fact]
    public async Task ReviewInvoiceAsync_WhenAlreadyReviewed_ShouldThrowException()
    {
        // Arrange
        var invoice = new VendorInvoice { Id = 1, CompanyId = 1, ApprovalStatus = InvoiceApprovalStatus.Approved };
        _invoiceRepoMock.Setup(r => r.AsQueryable()).Returns(new List<VendorInvoice> { invoice }.BuildMock());
        var request = new ReviewVendorInvoiceRequest { IsApproved = true };
        var service = CreateService();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReviewInvoiceAsync(1, request, 1));
    }

    #endregion

    #region GetVendorInvoiceSummaryAsync

    [Fact]
    public async Task GetVendorInvoiceSummaryAsync_ShouldReturnCorrectSummary()
    {
        // Arrange
        var vendors = new List<Vendor>
        {
            new()
            {
                Id = 1, CompanyId = 1, Name = "Vendor A", IsActive = true,
                Invoices = new List<VendorInvoice>
                {
                    new() { Amount = 1000, ApprovalStatus = InvoiceApprovalStatus.Approved },
                    new() { Amount = 500, ApprovalStatus = InvoiceApprovalStatus.Pending },
                    new() { Amount = 200, ApprovalStatus = InvoiceApprovalStatus.Rejected }
                }
            },
            new() { Id = 2, CompanyId = 1, Name = "Vendor B", IsActive = true, Invoices = new List<VendorInvoice>() }
        };

        _vendorRepoMock.Setup(r => r.AsQueryable()).Returns(vendors.BuildMock());
        var service = CreateService();

        // Act
        var result = (await service.GetVendorInvoiceSummaryAsync()).ToList();

        // Assert
        result.Should().HaveCount(2);
        var vendorASummary = result.First(v => v.VendorId == 1);
        vendorASummary.TotalAmount.Should().Be(1700);
        vendorASummary.PendingApprovals.Should().Be(1);
    }

    #endregion
}
