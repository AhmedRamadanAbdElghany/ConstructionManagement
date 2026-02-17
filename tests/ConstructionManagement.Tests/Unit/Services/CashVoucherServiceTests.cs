using ConstructionManagement.Application.DTOs.CashVoucher;
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

public class CashVoucherServiceTests
{
    private readonly Mock<IRepository<CashVoucher>> _voucherRepoMock = new();
    private readonly Mock<IRepository<CompanySettings>> _settingsRepoMock = new();
    private readonly Mock<IRepository<User>> _userRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<INotificationService> _notificationMock = new();
    private readonly Mock<ICompanyContext> _companyContextMock = new();
    private readonly Mock<ILocalizationService> _localizationServiceMock = new();

    private CashVoucherService CreateService()
        => new(_voucherRepoMock.Object, _settingsRepoMock.Object, _userRepoMock.Object,
               _unitOfWorkMock.Object, _localizationServiceMock.Object, _notificationMock.Object, _companyContextMock.Object);

    public CashVoucherServiceTests()
    {
        _companyContextMock.Setup(c => c.CompanyId).Returns(1);
        _voucherRepoMock.Setup(r => r.AddAsync(It.IsAny<CashVoucher>()))
            .Returns<CashVoucher>(v => Task.FromResult(v));
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
    }

    #region GetVouchersAsync

    [Fact]
    public async Task GetVouchersAsync_ShouldReturnVouchersForCompany()
    {
        var vouchers = new List<CashVoucher>
        {
            new() { Id = 1, CompanyId = 1, VoucherNumber = "CV-001", Amount = 500, ApprovalStatus = VoucherApprovalStatus.Pending },
            new() { Id = 2, CompanyId = 1, VoucherNumber = "CV-002", Amount = 1000, ApprovalStatus = VoucherApprovalStatus.Approved }
        };
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(vouchers.BuildMock());
        var service = CreateService();
        var result = (await service.GetVouchersAsync()).ToList();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetVouchersAsync_ShouldMapAllFields()
    {
        var voucher = new CashVoucher
        {
            Id = 1, CompanyId = 1, VoucherNumber = "CV-20240101-0001", VoucherDate = DateTime.Today,
            Amount = 500, Description = "Daily wage payment", Category = "DailyWages",
            WorkerUser = new User { FirstName = "Ahmed", LastName = "Worker" },
            Project = new Project { ProjectName = "Test Project" },
            CreatedByUser = new User { FirstName = "Manager", LastName = "User" }
        };
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CashVoucher> { voucher }.BuildMock());
        var service = CreateService();
        var result = (await service.GetVouchersAsync()).First();
        result.Id.Should().Be(1);
        result.VoucherNumber.Should().Be("CV-20240101-0001");
        result.Amount.Should().Be(500);
    }

    #endregion

    #region GetVoucherByIdAsync

    [Fact]
    public async Task GetVoucherByIdAsync_WhenExists_ShouldReturnVoucher()
    {
        var voucher = new CashVoucher { Id = 1, CompanyId = 1, VoucherNumber = "CV-001", Amount = 500 };
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CashVoucher> { voucher }.BuildMock());
        var service = CreateService();
        var result = await service.GetVoucherByIdAsync(1);
        result.Should().NotBeNull();
        result!.Amount.Should().Be(500);
    }

    [Fact]
    public async Task GetVoucherByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CashVoucher>().BuildMock());
        var service = CreateService();
        var result = await service.GetVoucherByIdAsync(999);
        result.Should().BeNull();
    }

    #endregion

    #region CreateVoucherAsync

    [Fact]
    public async Task CreateVoucherAsync_ShouldCreateVoucherWithCorrectNumber()
    {
        var settings = new CompanySettings { CompanyId = 1, RequireCashVoucherApproval = false };
        _settingsRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CompanySettings> { settings }.BuildMock());
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CashVoucher>().BuildMock());
        _voucherRepoMock.Setup(r => r.AddAsync(It.IsAny<CashVoucher>()))
            .Callback<CashVoucher>(v => v.Id = 1)
            .Returns<CashVoucher>(v => Task.FromResult(v));

        var request = new CreateCashVoucherRequest { VoucherDate = DateTime.Today, Amount = 500, Description = "Daily wages", WorkerUserId = 1, ProjectId = 1, Category = "DailyWages" };
        var service = CreateService();
        var result = await service.CreateVoucherAsync(request, 1);

        result.Should().NotBeNull();
        result.VoucherNumber.Should().Contain("CV-");
        result.ApprovalStatus.Should().Be("Approved");
    }

    [Fact]
    public async Task CreateVoucherAsync_WhenApprovalRequired_ShouldSetPending()
    {
        var settings = new CompanySettings { CompanyId = 1, RequireCashVoucherApproval = true };
        _settingsRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CompanySettings> { settings }.BuildMock());
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CashVoucher>().BuildMock());
        _voucherRepoMock.Setup(r => r.AddAsync(It.IsAny<CashVoucher>()))
            .Callback<CashVoucher>(v => v.Id = 1)
            .Returns<CashVoucher>(v => Task.FromResult(v));

        var request = new CreateCashVoucherRequest { VoucherDate = DateTime.Today, Amount = 500, Description = "Daily wages", WorkerUserId = 1, ProjectId = 1, Category = "DailyWages" };
        var service = CreateService();
        var result = await service.CreateVoucherAsync(request, 1);

        result.ApprovalStatus.Should().Be("Pending");
    }

    #endregion

    #region ReviewVoucherAsync

    [Fact]
    public async Task ReviewVoucherAsync_WhenApproved_ShouldUpdateStatus()
    {
        var voucher = new CashVoucher { Id = 1, CompanyId = 1, ApprovalStatus = VoucherApprovalStatus.Pending, Amount = 500 };
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CashVoucher> { voucher }.BuildMock());
        var request = new ReviewCashVoucherRequest { IsApproved = true };
        var service = CreateService();
        var result = await service.ReviewVoucherAsync(1, request, 1);
        result.ApprovalStatus.Should().Be("Approved");
    }

    [Fact]
    public async Task ReviewVoucherAsync_WhenRejected_ShouldSetReason()
    {
        var voucher = new CashVoucher { Id = 1, CompanyId = 1, ApprovalStatus = VoucherApprovalStatus.Pending, Amount = 500 };
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CashVoucher> { voucher }.BuildMock());
        var request = new ReviewCashVoucherRequest { IsApproved = false, RejectionReason = "Duplicate payment" };
        var service = CreateService();
        var result = await service.ReviewVoucherAsync(1, request, 1);
        result.ApprovalStatus.Should().Be("Rejected");
        result.RejectionReason.Should().Be("Duplicate payment");
    }

    [Fact]
    public async Task ReviewVoucherAsync_WhenAlreadyReviewed_ShouldThrowException()
    {
        var voucher = new CashVoucher { Id = 1, CompanyId = 1, ApprovalStatus = VoucherApprovalStatus.Approved };
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CashVoucher> { voucher }.BuildMock());
        var request = new ReviewCashVoucherRequest { IsApproved = false };
        var service = CreateService();
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReviewVoucherAsync(1, request, 1));
    }

    #endregion

    #region GetPendingVouchersAsync

    [Fact]
    public async Task GetPendingVouchersAsync_ShouldReturnOnlyPending()
    {
        var vouchers = new List<CashVoucher>
        {
            new() { Id = 1, CompanyId = 1, ApprovalStatus = VoucherApprovalStatus.Pending },
            new() { Id = 2, CompanyId = 1, ApprovalStatus = VoucherApprovalStatus.Approved },
            new() { Id = 3, CompanyId = 1, ApprovalStatus = VoucherApprovalStatus.Pending }
        };
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(vouchers.BuildMock());
        var service = CreateService();
        var result = (await service.GetPendingVouchersAsync()).ToList();
        result.Should().HaveCount(2);
        result.All(v => v.ApprovalStatus == "Pending").Should().BeTrue();
    }

    #endregion

    #region GetSummaryAsync

    [Fact]
    public async Task GetSummaryAsync_ShouldReturnCorrectSummary()
    {
        var vouchers = new List<CashVoucher>
        {
            new() { Id = 1, CompanyId = 1, Amount = 1000, ApprovalStatus = VoucherApprovalStatus.Pending },
            new() { Id = 2, CompanyId = 1, Amount = 500, ApprovalStatus = VoucherApprovalStatus.Pending },
            new() { Id = 3, CompanyId = 1, Amount = 2000, ApprovalStatus = VoucherApprovalStatus.Approved },
            new() { Id = 4, CompanyId = 1, Amount = 300, ApprovalStatus = VoucherApprovalStatus.Rejected }
        };
        _voucherRepoMock.Setup(r => r.AsQueryable()).Returns(vouchers.BuildMock());
        var service = CreateService();
        var result = await service.GetSummaryAsync();
        result.TotalVouchers.Should().Be(4);
        result.TotalAmount.Should().Be(3800);
        result.PendingApprovals.Should().Be(2);
        result.ApprovedCount.Should().Be(1);
    }

    #endregion
}
