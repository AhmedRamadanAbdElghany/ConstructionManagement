using ConstructionManagement.Application.DTOs.MiscExpense;
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

public class MiscExpenseServiceTests
{
    private readonly Mock<IRepository<MiscExpense>> _expenseRepoMock = new();
    private readonly Mock<IRepository<CompanySettings>> _settingsRepoMock = new();
    private readonly Mock<IRepository<User>> _userRepoMock = new();
    private readonly Mock<IFileStorageService> _fileStorageMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<INotificationService> _notificationMock = new();
    private readonly Mock<ICompanyContext> _companyContextMock = new();

    private MiscExpenseService CreateService()
        => new(_expenseRepoMock.Object, _settingsRepoMock.Object, _userRepoMock.Object,
               _fileStorageMock.Object, _unitOfWorkMock.Object, _notificationMock.Object, _companyContextMock.Object);

    public MiscExpenseServiceTests()
    {
        _companyContextMock.Setup(c => c.CompanyId).Returns(1);
        _expenseRepoMock.Setup(r => r.AddAsync(It.IsAny<MiscExpense>()))
            .Returns<MiscExpense>(e => Task.FromResult(e));
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
    }

    #region GetExpensesAsync

    [Fact]
    public async Task GetExpensesAsync_ShouldReturnExpensesForCompany()
    {
        var expenses = new List<MiscExpense>
        {
            new() { Id = 1, CompanyId = 1, ExpenseNumber = "ME-001", Amount = 100, ApprovalStatus = ExpenseApprovalStatus.Pending },
            new() { Id = 2, CompanyId = 1, ExpenseNumber = "ME-002", Amount = 200, ApprovalStatus = ExpenseApprovalStatus.Approved }
        };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(expenses.BuildMock());
        var service = CreateService();
        var result = (await service.GetExpensesAsync()).ToList();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetExpensesAsync_ShouldMapAllFields()
    {
        var expense = new MiscExpense
        {
            Id = 1, CompanyId = 1, ExpenseNumber = "ME-20240101-0001", ExpenseDate = DateTime.Today,
            Amount = 150, Category = "OfficeSupplies", Description = "Office supplies purchase",
            Project = new Project { ProjectName = "Test Project" },
            CreatedByUser = new User { FirstName = "Manager", LastName = "User" }
        };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(new List<MiscExpense> { expense }.BuildMock());
        var service = CreateService();
        var result = (await service.GetExpensesAsync()).First();
        result.Id.Should().Be(1);
        result.ExpenseNumber.Should().Be("ME-20240101-0001");
        result.Amount.Should().Be(150);
    }

    #endregion

    #region GetExpenseByIdAsync

    [Fact]
    public async Task GetExpenseByIdAsync_WhenExists_ShouldReturnExpense()
    {
        var expense = new MiscExpense { Id = 1, CompanyId = 1, ExpenseNumber = "ME-001", Amount = 100 };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(new List<MiscExpense> { expense }.BuildMock());
        var service = CreateService();
        var result = await service.GetExpenseByIdAsync(1);
        result.Should().NotBeNull();
        result!.Amount.Should().Be(100);
    }

    [Fact]
    public async Task GetExpenseByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(new List<MiscExpense>().BuildMock());
        var service = CreateService();
        var result = await service.GetExpenseByIdAsync(999);
        result.Should().BeNull();
    }

    #endregion

    #region CreateExpenseAsync

    [Fact]
    public async Task CreateExpenseAsync_ShouldCreateExpenseWithCorrectNumber()
    {
        var settings = new CompanySettings { CompanyId = 1, RequireMiscExpenseApproval = false };
        _settingsRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CompanySettings> { settings }.BuildMock());
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(new List<MiscExpense>().BuildMock());
        _expenseRepoMock.Setup(r => r.AddAsync(It.IsAny<MiscExpense>()))
            .Callback<MiscExpense>(e => e.Id = 1)
            .Returns<MiscExpense>(e => Task.FromResult(e));

        var request = new CreateMiscExpenseRequest { ExpenseDate = DateTime.Today, Amount = 150, Category = "OfficeSupplies", Description = "Office supplies", ProjectId = 1, CreatedByUserId = 1 };
        var service = CreateService();
        var result = await service.CreateExpenseAsync(request);

        result.Should().NotBeNull();
        result.ExpenseNumber.Should().Contain("ME-");
        result.ApprovalStatus.Should().Be("Approved");
    }

    [Fact]
    public async Task CreateExpenseAsync_WhenApprovalRequired_ShouldSetPending()
    {
        var settings = new CompanySettings { CompanyId = 1, RequireMiscExpenseApproval = true };
        _settingsRepoMock.Setup(r => r.AsQueryable()).Returns(new List<CompanySettings> { settings }.BuildMock());
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(new List<MiscExpense>().BuildMock());
        _expenseRepoMock.Setup(r => r.AddAsync(It.IsAny<MiscExpense>()))
            .Callback<MiscExpense>(e => e.Id = 1)
            .Returns<MiscExpense>(e => Task.FromResult(e));

        var request = new CreateMiscExpenseRequest { ExpenseDate = DateTime.Today, Amount = 150, Category = "OfficeSupplies", Description = "Office supplies", ProjectId = 1, CreatedByUserId = 1 };
        var service = CreateService();
        var result = await service.CreateExpenseAsync(request);

        result.ApprovalStatus.Should().Be("Pending");
    }

    #endregion

    #region ReviewExpenseAsync

    [Fact]
    public async Task ReviewExpenseAsync_WhenApproved_ShouldUpdateStatus()
    {
        var expense = new MiscExpense { Id = 1, CompanyId = 1, ApprovalStatus = ExpenseApprovalStatus.Pending, Amount = 150 };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(new List<MiscExpense> { expense }.BuildMock());
        var request = new ReviewMiscExpenseRequest { IsApproved = true };
        var service = CreateService();
        var result = await service.ReviewExpenseAsync(1, request, 1);
        result.ApprovalStatus.Should().Be("Approved");
    }

    [Fact]
    public async Task ReviewExpenseAsync_WhenRejected_ShouldSetReason()
    {
        var expense = new MiscExpense { Id = 1, CompanyId = 1, ApprovalStatus = ExpenseApprovalStatus.Pending, Amount = 150 };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(new List<MiscExpense> { expense }.BuildMock());
        var request = new ReviewMiscExpenseRequest { IsApproved = false, RejectionReason = "Invalid receipt" };
        var service = CreateService();
        var result = await service.ReviewExpenseAsync(1, request, 1);
        result.ApprovalStatus.Should().Be("Rejected");
        result.RejectionReason.Should().Be("Invalid receipt");
    }

    [Fact]
    public async Task ReviewExpenseAsync_WhenAlreadyReviewed_ShouldThrowException()
    {
        var expense = new MiscExpense { Id = 1, CompanyId = 1, ApprovalStatus = ExpenseApprovalStatus.Approved };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(new List<MiscExpense> { expense }.BuildMock());
        var request = new ReviewMiscExpenseRequest { IsApproved = false };
        var service = CreateService();
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReviewExpenseAsync(1, request, 1));
    }

    #endregion

    #region GetPendingExpensesAsync

    [Fact]
    public async Task GetPendingExpensesAsync_ShouldReturnOnlyPending()
    {
        var expenses = new List<MiscExpense>
        {
            new() { Id = 1, CompanyId = 1, ApprovalStatus = ExpenseApprovalStatus.Pending },
            new() { Id = 2, CompanyId = 1, ApprovalStatus = ExpenseApprovalStatus.Approved },
            new() { Id = 3, CompanyId = 1, ApprovalStatus = ExpenseApprovalStatus.Pending }
        };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(expenses.BuildMock());
        var service = CreateService();
        var result = (await service.GetPendingExpensesAsync()).ToList();
        result.Should().HaveCount(2);
        result.All(e => e.ApprovalStatus == "Pending").Should().BeTrue();
    }

    #endregion

    #region GetSummaryAsync

    [Fact]
    public async Task GetSummaryAsync_ShouldReturnCorrectSummary()
    {
        var expenses = new List<MiscExpense>
        {
            new() { Id = 1, CompanyId = 1, Amount = 100, ApprovalStatus = ExpenseApprovalStatus.Pending, Category = "OfficeSupplies" },
            new() { Id = 2, CompanyId = 1, Amount = 50, ApprovalStatus = ExpenseApprovalStatus.Pending, Category = "OfficeSupplies" },
            new() { Id = 3, CompanyId = 1, Amount = 200, ApprovalStatus = ExpenseApprovalStatus.Approved, Category = "Travel" },
            new() { Id = 4, CompanyId = 1, Amount = 30, ApprovalStatus = ExpenseApprovalStatus.Rejected, Category = "OfficeSupplies" }
        };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(expenses.BuildMock());
        var service = CreateService();
        var result = await service.GetSummaryAsync();
        result.TotalExpenses.Should().Be(4);
        result.TotalAmount.Should().Be(380);
        result.PendingApprovals.Should().Be(2);
        result.ApprovedCount.Should().Be(1);
        result.ExpensesByCategory.Should().ContainKey("OfficeSupplies");
    }

    #endregion

    #region GetExpensesByCategoryAsync

    [Fact]
    public async Task GetExpensesByCategoryAsync_ShouldGroupByCategory()
    {
        var expenses = new List<MiscExpense>
        {
            new() { CompanyId = 1, Amount = 100, Category = "OfficeSupplies", ApprovalStatus = ExpenseApprovalStatus.Approved },
            new() { CompanyId = 1, Amount = 50, Category = "OfficeSupplies", ApprovalStatus = ExpenseApprovalStatus.Approved },
            new() { CompanyId = 1, Amount = 200, Category = "Travel", ApprovalStatus = ExpenseApprovalStatus.Approved },
            new() { CompanyId = 1, Amount = 30, Category = "OfficeSupplies", ApprovalStatus = ExpenseApprovalStatus.Pending }
        };
        _expenseRepoMock.Setup(r => r.AsQueryable()).Returns(expenses.BuildMock());
        var service = CreateService();
        var result = await service.GetExpensesByCategoryAsync();
        result.Should().HaveCount(2);
        result["OfficeSupplies"].Should().Be(150);
        result["Travel"].Should().Be(200);
    }

    #endregion
}
