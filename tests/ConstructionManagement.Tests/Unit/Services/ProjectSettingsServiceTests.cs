using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class ProjectSettingsServiceTests
{
    private readonly Mock<IRepository<ProjectSettings>> _settingsRepo = new();
    private readonly Mock<IRepository<Project>> _projectRepo = new();
    private readonly Mock<IRepository<CompanySettings>> _companySettingsRepo = new(); // ← الجديد: Mock للإعدادات العامة
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private ProjectSettingsService CreateService() =>
        new ProjectSettingsService(
            _settingsRepo.Object,           // 1
            _projectRepo.Object,            // 2
            _companySettingsRepo.Object,    // 3 ← إضافة الموك الجديد هنا
            _unitOfWork.Object              // 4
        );

    [Fact]
    public async Task GetSettingsAsync_WhenProjectDoesNotExist_ThrowsException()
    {
        // Arrange
        _projectRepo.Setup(r => r.ExistsAsync(1)).ReturnsAsync(false);
        var service = CreateService();

        // Act & Assert
        await service.Invoking(s => s.GetSettingsAsync(1))
            .Should().ThrowAsync<KeyNotFoundException>()  // ← غيّر هنا إلى KeyNotFoundException
            .WithMessage("المشروع غير موجود");
    }

    [Fact]
    public async Task UpdateSettingsAsync_WhenValidOwner_UpdatesSuccessfully()
    {
        // Arrange
        int projectId = 1, ownerId = 1;
        var project = new Project { Id = projectId, OwnerUserId = ownerId };
        var settings = new ProjectSettings { Id = projectId };

        _projectRepo.Setup(r => r.GetByIdAsync(projectId)).ReturnsAsync(project);
        _settingsRepo.Setup(r => r.GetByIdAsync(projectId)).ReturnsAsync(settings);

        var service = CreateService();

        var request = new UpdateProjectSettingsRequest
        {
            EnableDelayNotification = true,
            DelayNotificationIsOneTimeOnly = false,
            DelayNotificationIntervalDays = 14,
            DelayNotificationSendEmail = true,
            EnablePhotoUpload = true,
            RequirePhotoReview = false,
            PhotoApproverRole = "Manager",
            EnableInvoiceReview = true,
            EnableInvoiceAggregation = true,
            MaxPhotosPerUpload = 50
        };

        // Act
        await service.UpdateSettingsAsync(projectId, request, ownerId);

        // Assert
        settings.DelayNotificationIntervalDays.Should().Be(14);
        _settingsRepo.Verify(r => r.UpdateAsync(settings), Times.Once());
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task GetSettingsAsync_WhenSettingsNotFound_CreatesDefaultsAndSaves()
    {
        // Arrange
        int projectId = 1;
        _projectRepo.Setup(r => r.ExistsAsync(projectId)).ReturnsAsync(true);
        _settingsRepo.Setup(r => r.GetByIdAsync(projectId)).ReturnsAsync((ProjectSettings)null!);

        // محاكاة إعدادات الشركة العامة (لأن GetSettingsAsync بيستخدمها للـ fallback)
        var globalSettings = new CompanySettings
        {
            EnableDelayNotification = true,
            DelayNotificationIntervalDays = 7,
            // ... باقي الافتراضيات
        };
        _companySettingsRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(globalSettings);

        var service = CreateService();

        // Act
        await service.GetSettingsAsync(projectId);

        // Assert
        _settingsRepo.Verify(r => r.AddAsync(It.Is<ProjectSettings>(s => s.Id == projectId)), Times.Once());
        _unitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once());
    }
}