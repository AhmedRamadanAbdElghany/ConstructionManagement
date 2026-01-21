using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.DTOs.Transaction;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Integration;

public class BOQAndTransactionIntegrationTests : IntegrationTestBase
{
    private readonly BOQItemService _boqService;
    private readonly ProjectTransactionService _transService;

    public BOQAndTransactionIntegrationTests()
    {
        // تأكد أن UnitOfWork المعرف في IntegrationTestBase تم إنشاؤه
        // إذا كنت تستخدم Instance جديدة في كل مرة، يفضل تمريرها هكذا:

        _boqService = new BOQItemService(
            new Repository<BOQItem>(Context),
            new Repository<BOQMeasured>(Context),
            new Repository<BOQSupervision>(Context),
            new Repository<ItemInvoice>(Context),
            new Repository<Project>(Context),
            base.UnitOfWork); // تأكد أن هذا المتغير يحمل قيمة داخل IntegrationTestBase

        _transService = new ProjectTransactionService(
            new Repository<Transaction>(Context),
            new Repository<BOQItem>(Context),
            new Repository<ProjectSettings>(Context),
            new Mock<IFileStorageService>().Object,
            new Repository<BOQProfitabilityLog>(Context),
            new Mock<INotificationService>().Object,
            base.UnitOfWork);
    }
    [Fact]
    public async Task Transaction_ShouldAffect_ProjectProfitability()
    {
        // ── 1. Create User (To avoid FK failure on UserId: 1) ─────────────────────
        var user = new User
        {
            FullName = "Admin User",
            Email = "admin@test.com",
            PasswordHash = "hashed_password"
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // ── 2. Create project and its Settings ───────────────────────────────────
        var project = new Project
        {
            ProjectName = "Bridge Project",
            AccountingSystem = "Measured",
            TotalContractValue = 10000m,
            OwnerUserId = user.Id // ربط المشروع بالمستخدم الفعلي
        };
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();

        // إضافة الإعدادات (مهم جداً لأن الخدمة تطلبها في السطر 40)
        var settings = new ProjectSettings // افترض أن اسم الكلاس ProjectSettings
        {
            Id = project.Id, // عادة ما يكون الـ ID هو نفسه ID المشروع في علاقة 1:1
            EnableInvoiceReview = false
        };
        // ملاحظة: إذا كان الـ Repository يستخدم جدولاً مختلفاً، تأكد من إضافة السجل فيه
        Context.Set<ProjectSettings>().Add(settings);
        await Context.SaveChangesAsync();

        // ── 3. Create BOQ item ───────────────────────────────────────────────────
        var createItemRequest = new CreateBOQItemRequest(
            ItemCode: "B1",
            ItemName: "Steel Reinforcement",
            Description: "Steel bars",
            Unit: "Ton",
            StartDate: null, EndDate: null,
            AccountingType: "Measured",
            AgreedQuantity: 100m,
            UnitPrice: 10m,
            SupervisionPercentage: null, BaseCalculation: null, CustomBaseAmount: null, EstimatedTotalCost: null
        );

        var itemId = await _boqService.CreateBOQItemAsync(project.Id, createItemRequest, user.Id);

        // ── 4. Create transaction ───────────────────────────────────────────────
        var createTransRequest = new CreateTransactionRequest
        (
            itemId,
            TransactionType.MaterialPurchase,
            500m,
            "Steel purchase",
            "INV-001",
            "Steel Supplier Co.",
            null
        );

        await _transService.CreateTransactionAsync(project.Id, createTransRequest, user.Id);

        // ── 5. Assert profitability ─────────────────────────────────────────────
        var profit = await _transService.GetProjectProfitabilityAsync(project.Id);

        profit.Should().NotBeNull();
        profit.TotalEstimatedBudget.Should().Be(1000m); // 100 * 10
        profit.TotalSpent.Should().Be(500m);
        profit.TotalProfit.Should().Be(500m);
    }
}