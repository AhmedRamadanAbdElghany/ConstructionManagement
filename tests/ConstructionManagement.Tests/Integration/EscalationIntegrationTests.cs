using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
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
    private readonly Mock<ILogger<ProjectDelayEscalationService>> _loggerMock = new(); // ← required now

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
            new Repository<Notification>(Context),          // 8
            UnitOfWork,                                     // 9
            _loggerMock.Object                              // 10 – logger was missing
        );
    }

    [Fact]
    public async Task CheckProjectAndItemDelaysAsync_ShouldDetectDelayedProjects()
    {
        // 1. Arrange: إنشاء مستخدم
        var user = new User
        {
            FullName = "Manager",
            Email = "m@m.com",
            PasswordHash = "AnyHash123"
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        // 2. Arrange: إنشاء مشروع متأخر
        var project = new Project
        {
            ProjectName = "Late Tower",
            OwnerUserId = user.Id,
            StartDate = DateTime.UtcNow.AddDays(-10),
            Settings = new ProjectSettings
            {
                EnableDelayNotification = true,
                DelayNotificationIntervalDays = 1,
                DelayGracePeriodDays = 0 // عشان يتفعل التأخير فورًا
            }
        };
        Context.Projects.Add(project);
        await Context.SaveChangesAsync();

        // 3. Act – الاسم الجديد الصحيح
        await _service.CheckProjectAndItemDelaysAsync();

        // 4. Assert
        var log = await Context.EscalationLogs
            .FirstOrDefaultAsync(l => l.ProjectId == project.Id);

        log.Should().NotBeNull("يجب تسجيل التصعيد في جدول EscalationLogs");

        _notifMock.Verify(n => n.CreateAndSendAsync(
            user.Id,
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            NotificationType.ProjectDelay),
            Times.Once());
    }
}