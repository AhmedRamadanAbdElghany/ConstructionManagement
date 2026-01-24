using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MockQueryable;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class EscalationServiceTests
{
    private readonly Mock<IRepository<Project>> _projectRepo = new();
    private readonly Mock<IRepository<EscalationLog>> _escalationLogRepo = new();
    private readonly Mock<IRepository<User>> _userRepo = new();
    private readonly Mock<IEmailService> _emailService = new();
    private readonly Mock<INotificationService> _notificationService = new();
    private readonly Mock<IRepository<ProjectTeamRole>> _teamRoleRepo = new();
    private readonly Mock<IRepository<Transaction>> _transactionRepo = new();
    private readonly Mock<IRepository<Notification>> _notificationRepo = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ILogger<ProjectDelayEscalationService>> _loggerMock = new(); // ← added logger

    private ProjectDelayEscalationService CreateService()
    {
        return new ProjectDelayEscalationService(
            _projectRepo.Object,        // 1
            _escalationLogRepo.Object,  // 2
            _userRepo.Object,           // 3
            _emailService.Object,       // 4
            _notificationService.Object,// 5
            _teamRoleRepo.Object,       // 6
            _transactionRepo.Object,    // 7
            _notificationRepo.Object,   // 8
            _uowMock.Object,            // 9
            _loggerMock.Object          // 10 ← added
        );
    }

    [Fact]
    public async Task CheckProjectAndItemDelaysAsync_ShouldCreateCorrectLogEntry_WhenEscalated()
    {
        // Arrange
        var today = DateTime.UtcNow.Date;
        var projectId = 1;
        var managerId = 10;
        var itemId = 200;

        var project = new Project
        {
            Id = projectId,
            Status = "جاري",
            IsClosed = false,
            Settings = new ProjectSettings
            {
                EnableDelayNotification = true,
                DelayGracePeriodDays = 0
            },
            BOQItems = new List<BOQItem>
            {
                new BOQItem
                {
                    Id = itemId,
                    ItemName = "Finishing",
                    EndDate = today.AddDays(-1),
                    Status = "جاري"
                }
            }
        };

        _projectRepo.Setup(r => r.AsQueryable()).Returns(new List<Project> { project }.BuildMock());

        _teamRoleRepo.Setup(r => r.AsQueryable()).Returns(new List<ProjectTeamRole>
        {
            new ProjectTeamRole
            {
                ProjectTeamMember = new ProjectTeamMember { ProjectId = projectId, UserId = managerId },
                ProjectRole = new ProjectRole { Name = "ProjectManager" }
            }
        }.BuildMock());

        _escalationLogRepo.Setup(r => r.AsQueryable()).Returns(new List<EscalationLog>().BuildMock());

        var service = CreateService();

        // Act – استخدم الاسم الجديد
        await service.CheckProjectAndItemDelaysAsync();

        // Assert
        _escalationLogRepo.Verify(r => r.AddAsync(It.Is<EscalationLog>(log =>
            log.ProjectId == projectId &&
            log.BOQItemId == itemId &&
            log.RecipientUserId == managerId &&
            log.EscalationType == "ItemEndDelay")),
            Times.Once());

        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task CheckProjectAndItemDelaysAsync_WhenLogExistsForThisItemToday_ShouldSkip()
    {
        // Arrange
        var today = DateTime.UtcNow.Date;
        var projectId = 1;
        var itemId = 200;
        var managerId = 10;

        var project = new Project
        {
            Id = projectId,
            IsClosed = false,
            Settings = new ProjectSettings { EnableDelayNotification = true },
            BOQItems = new List<BOQItem>
            {
                new BOQItem { Id = itemId, EndDate = today.AddDays(-1), Status = "جاري" }
            }
        };

        _projectRepo.Setup(r => r.AsQueryable()).Returns(new List<Project> { project }.BuildMock());

        var existingLogs = new List<EscalationLog>
        {
            new EscalationLog
            {
                ProjectId = projectId,
                BOQItemId = itemId,
                SentAt = today,
                EscalationType = "ItemEndDelay"
            }
        }.BuildMock();

        _escalationLogRepo.Setup(r => r.AsQueryable()).Returns(existingLogs);

        _teamRoleRepo.Setup(r => r.AsQueryable()).Returns(new List<ProjectTeamRole>
        {
            new ProjectTeamRole
            {
                ProjectTeamMember = new ProjectTeamMember { ProjectId = projectId, UserId = managerId },
                ProjectRole = new ProjectRole { Name = "ProjectManager" }
            }
        }.BuildMock());

        var service = CreateService();

        // Act – الاسم الجديد
        await service.CheckProjectAndItemDelaysAsync();

        // Assert
        _escalationLogRepo.Verify(r => r.AddAsync(It.IsAny<EscalationLog>()), Times.Never());
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.AtMostOnce());
    }
}