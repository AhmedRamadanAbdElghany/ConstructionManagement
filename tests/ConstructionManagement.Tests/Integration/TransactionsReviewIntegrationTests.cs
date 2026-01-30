using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.Transaction;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Moq;
using System.Reflection;
using Xunit;

namespace ConstructionManagement.Tests.Integration;

/// <summary>
/// Integration tests for transaction review features.
/// Test cases:
/// 1) ReviewTransaction_Approve_ShouldUpdateFields
///    Steps: seed user -> create project/settings -> create BOQ item/measured data -> create transaction -> review -> assert status/reviewer/date.
/// 2) ReviewTransaction_WhenAlreadyReviewed_ShouldReturnFalse
///    Steps: seed user/project/settings -> create item -> create transaction -> review once -> review again -> assert false.
/// </summary>
public class TransactionsReviewIntegrationTests : IntegrationTestBase
{
    private readonly ProjectTransactionService _transService;

    public TransactionsReviewIntegrationTests()
    {
        _transService = new ProjectTransactionService(
            new Repository<Transaction>(Context),
            new Repository<BOQItem>(Context),
            new Repository<ProjectSettings>(Context),
            new Mock<IFileStorageService>().Object,
            new Repository<BOQProfitabilityLog>(Context),
            new Mock<INotificationService>().Object,
            UnitOfWork);
    }

    // DOCUMENTATION TABLES (replace with full 113 test-case tables):
    // Test Case: <Name>
    // Step # | Step Description | Expected Result
    // 1      | ...              | ...

    // Test Case: ReviewTransaction_Approve_ShouldUpdateFields
    // Step # | Step Description                                      | Expected Result
    // 1      | Seed user/project/settings/BOQ item/measurement       | Data persisted
    // 2      | Create transaction                                   | Transaction created
    // 3      | Review transaction (Approved)  
    [Fact]
    public async Task ReviewTransaction_ShouldUpdateReviewFields()
    {
        // Arrange
        var user = new User { FirstName = "Tx", LastName = "Reviewer", Email = "rev@test.com", PasswordHash = "x" };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        var project = new Project
        {
            ProjectName = "Tx Project",
            OwnerUserId = user.Id,
            AccountingSystem = "Measured",
            Status = "Active"
        };
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();

        Context.Set<ProjectSettings>().Add(new ProjectSettings
        {
            Id = project.Id,
            EnableInvoiceReview = true
        });
        await Context.SaveChangesAsync();

		var item = new BOQItem
		{
			ItemCode = "T1",
			ItemName = "Item",
			ProjectId = project.Id,
			AccountingType = "Measured",
			Status = "Active",
		};

        Context.BOQItems.Add(item);
        await Context.SaveChangesAsync();

		// Ensure EstimatedBudget > 0 to avoid divide-by-zero in notifications
		Context.BOQMeasured.Add(new BOQMeasured
		{
			Id = item.Id,
			Item = item,
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

        var reviewRequest = CreateReviewRequestApproved();

        // Act
        var ok = await _transService.ReviewTransactionAsync(txId, reviewRequest, user.Id);

        // Assert
        ok.Should().BeTrue();
        var tx = await Context.Set<Transaction>().FindAsync(txId);
        tx!.ReviewedByUserId.Should().Be(user.Id);
        tx.ReviewDate.Should().NotBeNull();
    }

    [Fact]
    public async Task ReviewTransaction_WhenAlreadyReviewed_ReturnsFalse()
    {
        var user = new User { FirstName = "Tx", LastName = "Reviewer2", Email = "rev2@test.com", PasswordHash = "x" };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        var project = new Project
        {
            ProjectName = "Tx Project 2",
            OwnerUserId = user.Id,
            AccountingSystem = "Measured",
            Status = "Active"
        };
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();

        Context.Set<ProjectSettings>().Add(new ProjectSettings { Id = project.Id, EnableInvoiceReview = true });
        await Context.SaveChangesAsync();

        var item = new BOQItem
        {
            ItemCode = "T2",
            ItemName = "Item 2",
            ProjectId = project.Id,
            AccountingType = "Measured",
            Status = "Active",
        };
        Context.BOQItems.Add(item);
        await Context.SaveChangesAsync();

        Context.BOQMeasured.Add(new BOQMeasured
        {
            Id = item.Id,
            Item = item,
            AgreedQuantity = 10m,
            UnitPrice = 100m,
            ExecutedQuantity = 0m
        });
        await Context.SaveChangesAsync();

        var txId = await _transService.CreateTransactionAsync(project.Id,
            new CreateTransactionRequest(item.Id, TransactionType.MaterialPurchase, 100m, "Test", "INV-200", "Supplier", null),
            user.Id);

        var reviewRequest = CreateReviewRequestApproved();

        var first = await _transService.ReviewTransactionAsync(txId, reviewRequest, user.Id);
        var second = await _transService.ReviewTransactionAsync(txId, reviewRequest, user.Id);

        first.Should().BeTrue();
        second.Should().BeFalse();
    }

    [Fact]
    public async Task ReviewTransaction_Approve_ShouldUpdateFields()
    {
        var reviewer = await SeedUserAsync("rev@test.com", "x", "Reviewer");
        var project = await SeedProjectAsync("Tx Project", reviewer.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings { Id = project.Id, EnableInvoiceReview = true });
        await Context.SaveChangesAsync();

        var item = new BOQItem
        {
            ItemCode = "T1",
            ItemName = "Item",
            ProjectId = project.Id,
            AccountingType = "Measured",
            Status = "Active"
        };
        Context.BOQItems.Add(item);
        await Context.SaveChangesAsync();

        Context.BOQMeasured.Add(new BOQMeasured
        {
            Id = item.Id,
            Item = item,
            AgreedQuantity = 10m,
            UnitPrice = 100m,
            ExecutedQuantity = 0m
        });
        await Context.SaveChangesAsync();

        var txId = await _transService.CreateTransactionAsync(project.Id,
            new CreateTransactionRequest(item.Id, TransactionType.MaterialPurchase, 100m, "Test", "INV-1", "Supplier", null),
            reviewer.Id);

        var ok = await _transService.ReviewTransactionAsync(txId, new ReviewTransactionRequest(TransactionStatus.Approved, "OK"), reviewer.Id);

        // Assert
        ok.Should().BeTrue();
        var tx = await Context.Set<Transaction>().FindAsync(txId);
        tx!.ReviewedByUserId.Should().Be(reviewer.Id);
        tx.ReviewDate.Should().NotBeNull();
        tx.Status.Should().Be(TransactionStatus.Approved);
    }

    // Test Case: ReviewTransaction_WhenAlreadyReviewed_ShouldReturnFalse
    // Step # | Step Description                                      | Expected Result
    // 1      | Create and review transaction once                   | First review succeeds
    // 2      | Review same transaction again                        | Returns false
    [Fact]
    public async Task ReviewTransaction_WhenAlreadyReviewed_ShouldReturnFalse()
    {
        var reviewer = await SeedUserAsync("rev2@test.com", "x", "Reviewer");
        var project = await SeedProjectAsync("Tx Project 2", reviewer.Id);

        Context.Set<ProjectSettings>().Add(new ProjectSettings { Id = project.Id, EnableInvoiceReview = true });
        await Context.SaveChangesAsync();

        var item = new BOQItem
        {
            ItemCode = "T2",
            ItemName = "Item 2",
            ProjectId = project.Id,
            AccountingType = "Measured",
            Status = "Active"
        };
        Context.BOQItems.Add(item);
        await Context.SaveChangesAsync();

        Context.BOQMeasured.Add(new BOQMeasured
        {
            Id = item.Id,
            Item = item,
            AgreedQuantity = 10m,
            UnitPrice = 100m,
            ExecutedQuantity = 0m
        });
        await Context.SaveChangesAsync();

        var txId = await _transService.CreateTransactionAsync(project.Id,
            new CreateTransactionRequest(item.Id, TransactionType.MaterialPurchase, 50m, "Test", "INV-2", "Supplier", null),
            reviewer.Id);

        var first = await _transService.ReviewTransactionAsync(txId, new ReviewTransactionRequest(TransactionStatus.Approved, "OK"), reviewer.Id);
        var second = await _transService.ReviewTransactionAsync(txId, new ReviewTransactionRequest(TransactionStatus.Approved, "OK"), reviewer.Id);

        // Assert
        first.Should().BeTrue();
        second.Should().BeFalse();
    }

    private static ReviewTransactionRequest CreateReviewRequestApproved()
    {
        var type = typeof(ReviewTransactionRequest);

        var directCtor = type.GetConstructor(new[] { typeof(TransactionStatus), typeof(string) });
        if (directCtor != null)
            return (ReviewTransactionRequest)directCtor.Invoke(new object[] { TransactionStatus.Approved, "OK" });

        var ctor = type.GetConstructors(BindingFlags.Public | BindingFlags.Instance)
            .OrderBy(c => c.GetParameters().Length)
            .FirstOrDefault();

        if (ctor == null)
            return (ReviewTransactionRequest)Activator.CreateInstance(type)!;

        var args = ctor.GetParameters()
            .Select(p => GetDefaultValue(p.ParameterType))
            .ToArray();

        var instance = (ReviewTransactionRequest)Activator.CreateInstance(type, args)!;

        var statusProp = type.GetProperty("Status", BindingFlags.Public | BindingFlags.Instance);
        object statusValue = statusProp?.PropertyType == typeof(string)
            ? "Approved"
            : (object)TransactionStatus.Approved;

        SetPropertyIfExists(instance, "Status", statusValue);
        SetPropertyIfExists(instance, "ReviewNotes", "OK");
        SetPropertyIfExists(instance, "Notes", "OK");

        return instance;
    }

    private static object? GetDefaultValue(Type t)
    {
        if (t == typeof(string)) return "Approved";
        if (t == typeof(bool)) return true;
        if (t.IsEnum) return Enum.GetValues(t).GetValue(0);
        if (Nullable.GetUnderlyingType(t) != null) return null;
        return t.IsValueType ? Activator.CreateInstance(t) : null;
    }

	private static void SetPropertyIfExists(object instance, string name, object? value)
	{
		var prop = instance.GetType().GetProperty(name, BindingFlags.Public | BindingFlags.Instance);
		if (prop == null || !prop.CanWrite) return;
	
		if (value != null)
		{
			var targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
	
			if (targetType.IsEnum && value is string s)
			{
				value = Enum.Parse(targetType, s, ignoreCase: true);
			}
			else if (targetType.IsEnum && !targetType.IsInstanceOfType(value))
			{
				value = Enum.ToObject(targetType, value);
			}
			else if (!targetType.IsInstanceOfType(value))
			{
				value = Convert.ChangeType(value, targetType);
			}
		}
	
		prop.SetValue(instance, value);
	}

    // NOTE: No error-related changes required here.
}
