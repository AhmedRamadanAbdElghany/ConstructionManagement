using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace ConstructionManagement.Tests.Integration
{
    public class EscalationIntegrationTests : IntegrationTestBase
    {
        private readonly EscalationService _service;
        private readonly Mock<INotificationService> _notifMock = new();

        public EscalationIntegrationTests() : base()
        {
            // الترتيب الصحيح تمامًا مطابق لـ EscalationService constructor
            _service = new EscalationService(
                new Repository<Project>(Context),                     // 1: IRepository<Project>
                new Repository<EscalationLog>(Context),               // 2: IRepository<EscalationLog>
                new Repository<User>(Context),                        // 3: IRepository<User>
                new Mock<IEmailService>().Object,                     // 4: IEmailService
                _notifMock.Object,                                    // 5: INotificationService
                new Repository<ProjectTeamRole>(Context),             // 6: IRepository<ProjectTeamRole>
                new Repository<Transaction>(Context),                 // 7: IRepository<Transaction>
                new Repository<Notification>(Context),                // 8: IRepository<Notification>
                UnitOfWork                                            // 9: IUnitOfWork
            );
        }

        [Fact]
        public async Task CheckEscalations_ShouldDetectDelayedProjects()
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

            // 3. Act
            await _service.CheckAndSendDelayEscalationsAsync();

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
}