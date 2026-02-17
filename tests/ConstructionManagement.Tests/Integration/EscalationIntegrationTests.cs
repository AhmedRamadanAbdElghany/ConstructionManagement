using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Integration;

public class EscalationIntegrationTests : IntegrationTestBase
{
    private readonly ProjectDelayEscalationService _service;
    private readonly Mock<INotificationService> _notifMock = new();
    private readonly Mock<ILogger<ProjectDelayEscalationService>> _loggerMock = new();
    private readonly Mock<ILocalizationService> _localizationServiceMock = new();
    private readonly Mock<IRepository<Notification>> _notificationRepoMock = new();

    public EscalationIntegrationTests() : base()
    {
        _service = new ProjectDelayEscalationService(
            new Repository<Project>(Context),               // 1
            new Repository<EscalationLog>(Context),         // 2
            new Repository<User>(Context),                  // 3
            new Mock<IEmailService>().Object,               // 4
            _notifMock.Object,                              // 5
            new Repository<ProjectTeamRole>(Context),       // 6
            new Repository<Transaction>(Context),           // 7
            _notificationRepoMock.Object,      // 8
            UnitOfWork,                                     // 9
            _loggerMock.Object,                             // 10
            _localizationServiceMock.Object                 // 11
        );
    }

    // DOCUMENTATION TABLES (replace with full 113 test-case tables):
    // Test Case: <Name>
    // Step # | Step Description | Expected Result
    // 1      | ...              | ...
    // 2      | ...              | ...
    // 3      | ...              | ...

    // Test Case: CheckProjectAndItemDelaysAsync_ShouldCreateEscalationLog
    // Step # | Step Description                        | Expected Result
    // 1      | Seed user + delayed project             | Data persisted
    // 2      | Enable delay notifications              | Settings saved
    // 3      | Run escalation service                  | Escalation log created

    [Fact]
    public async Task CheckProjectAndItemDelaysAsync_ShouldDetectDelayedProjects()
    {
        // 1. Arrange: إنشاء مستخدم
        var user = new User
        {
            FirstName = "Manager",
            LastName = string.Empty,
            Email = "m@m.com",
            PasswordHash = "AnyHash123"
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // 2. Arrange: إنشاء مشروع متأخر (تأخير في تاريخ البداية)
        var project = new Project
        {
            ProjectName = "Late Tower",
            OwnerUserId = user.Id,
            StartDate = DateTime.UtcNow.AddDays(-10),
            Status = "جديد"  // Status must be "جديد" for start delay check
        };
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();

        var settings = new ProjectSettings
        {
            Id = project.Id,
            EnableDelayNotification = true,
            DelayNotificationIntervalDays = 1,
            DelayGracePeriodDays = 0 // Grace period 0 to trigger immediately
        };
        Context.ProjectSettings.Add(settings);
        await Context.SaveChangesAsync();

        // 3. Act – تشغيل خدمة التصعيد
        await _service.CheckProjectAndItemDelaysAsync();

        // 4. Assert
        var log = await Context.EscalationLogs
            .FirstOrDefaultAsync(l => l.ProjectId == project.Id && l.BOQItemId == null);

        log.Should().NotBeNull("يجب تسجيل التصعيد في جدول EscalationLogs عند تأخير بداية المشروع");

        _notifMock.Verify(n => n.CreateAndSendAsync(
            user.Id,
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            NotificationType.ProjectDelay,
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<object[]?>()),
            Times.Once());
    }

    [Fact]
    public async Task CheckProjectAndItemDelaysAsync_WhenNotificationsDisabled_DoesNothing()
    {
        var user = await SeedUserAsync("no@notify.com", "AnyHash123", "No Notify");

        var project = new Project
        {
            ProjectName = "Late Tower 2",
            OwnerUserId = user.Id,
            StartDate = DateTime.UtcNow.AddDays(-10),
            EndDate = DateTime.UtcNow.AddDays(-1),
            Status = "Active"
        };
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();

        Context.Set<ProjectSettings>().Add(new ProjectSettings
        {
            Id = project.Id,
            EnableDelayNotification = false
        });
        await Context.SaveChangesAsync();

        await _service.CheckProjectAndItemDelaysAsync();

        var log = await Context.EscalationLogs.FirstOrDefaultAsync(l => l.ProjectId == project.Id);
        log.Should().BeNull();
    }

    [Fact]
    public async Task CheckProjectAndItemDelaysAsync_ShouldCreateEscalationLog()
    {
        var user = await SeedUserAsync("m@m.com", "AnyHash123", "Manager");

        var project = new Project
        {
            ProjectName = "Late Tower",
            OwnerUserId = user.Id,
            StartDate = DateTime.UtcNow.AddDays(-10),
            Status = "جديد"
        };
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();

        Context.Set<ProjectSettings>().Add(new ProjectSettings
        {
            Id = project.Id,
            EnableDelayNotification = true,
            DelayNotificationIntervalDays = 1,
            DelayGracePeriodDays = 0
        });
        await Context.SaveChangesAsync();

        await _service.CheckProjectAndItemDelaysAsync();

        var log = await Context.EscalationLogs.FirstOrDefaultAsync(l => l.ProjectId == project.Id);
        log.Should().NotBeNull();
    }

    // NOTE: No error-related changes required here.
}
