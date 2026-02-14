using ConstructionManagement.Application.DTOs.Transaction;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Integration;

public class TransactionsReviewIntegrationTests : IntegrationTestBase
{
    private readonly ProjectTransactionService _transService;

    public TransactionsReviewIntegrationTests()
    {
        var activityLogService = new Mock<IActivityLogService>().Object;
        _transService = new ProjectTransactionService(
            new Repository<Transaction>(Context),
            new Repository<BOQItem>(Context),
            new Repository<ProjectSettings>(Context),
            new Mock<IFileStorageService>().Object,
            new Repository<BOQProfitabilityLog>(Context),
            new Mock<INotificationService>().Object,
            UnitOfWork,
            activityLogService);
    }

    [Fact]
    public async Task ReviewTransaction_Approve_ShouldUpdateFields()
    {
        // Arrange
        var user = await SeedUserAsync("rev@test.com", "x", "Reviewer");
        var project = await SeedProjectAsync("Tx Project", user.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings { Id = project.Id, EnableInvoiceReview = true });
        await Context.SaveChangesAsync();

        var item = new BOQItem
        {
            ItemCode = "T1",
            ItemName = "Item",
            ProjectId = project.Id,
            AccountingType = CalculationMethod.Measured,
            Status = "Active"
        };
        Context.BOQItems.Add(item);
        await Context.SaveChangesAsync();

        Context.BOQMeasured.Add(new BOQMeasured
        {
            Id = item.Id,
            AgreedQuantity = 10m,
            UnitPrice = 100m,
            ExecutedQuantity = 0m
        });
        await Context.SaveChangesAsync();

        var createTransRequest = new CreateTransactionRequest(
            item.Id,
            TransactionType.MaterialPurchase,
            100m,
            "Test Tx",
            "INV-100",
            "Supplier",
            null);

        var txId = await _transService.CreateTransactionAsync(project.Id, createTransRequest, user.Id);

        var reviewRequest = new ReviewTransactionRequest(TransactionStatus.Approved, "OK");

        // Act
        var ok = await _transService.ReviewTransactionAsync(txId, reviewRequest, user.Id);

        // Assert
        ok.Should().BeTrue();
        var tx = await Context.Set<Transaction>().FindAsync(txId);
        tx.Should().NotBeNull();
        tx!.ReviewedByUserId.Should().Be(user.Id);
        tx.ReviewDate.Should().NotBeNull();
        tx.Status.Should().Be(TransactionStatus.Approved);
        tx.ReviewNotes.Should().Be("OK");
    }

    [Fact]
    public async Task ReviewTransaction_WhenAlreadyReviewed_ReturnsFalse()
    {
        // Arrange
        var user = await SeedUserAsync("rev2@test.com", "x", "Reviewer 2");
        var project = await SeedProjectAsync("Tx Project 2", user.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings { Id = project.Id, EnableInvoiceReview = true });
        await Context.SaveChangesAsync();

        var item = new BOQItem
        {
            ItemCode = "T2",
            ItemName = "Item 2",
            ProjectId = project.Id,
            AccountingType = CalculationMethod.Measured,
            Status = "Active"
        };
        Context.BOQItems.Add(item);
        await Context.SaveChangesAsync();

        Context.BOQMeasured.Add(new BOQMeasured
        {
            Id = item.Id,
            AgreedQuantity = 10m,
            UnitPrice = 100m,
            ExecutedQuantity = 0m
        });
        await Context.SaveChangesAsync();

        var createTransRequest = new CreateTransactionRequest(
            item.Id,
            TransactionType.MaterialPurchase,
            100m,
            "Test Tx",
            "INV-200",
            "Supplier",
            null);

        var txId = await _transService.CreateTransactionAsync(project.Id, createTransRequest, user.Id);

        var reviewRequest = new ReviewTransactionRequest(TransactionStatus.Approved, "OK");

        var first = await _transService.ReviewTransactionAsync(txId, reviewRequest, user.Id);
        var second = await _transService.ReviewTransactionAsync(txId, reviewRequest, user.Id);

        // Assert
        first.Should().BeTrue();
        second.Should().BeFalse();
    }
}
