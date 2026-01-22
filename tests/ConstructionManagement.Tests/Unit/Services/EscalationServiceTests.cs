﻿using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using MockQueryable.Moq;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    private readonly Mock<IUnitOfWork> _uowMock = new(); // تأكد من وجود هذا السطر هنا

    private EscalationService CreateService()
    {
        return new EscalationService(
            _projectRepo.Object,
            _escalationLogRepo.Object,
            _userRepo.Object,
            _emailService.Object,
            _transactionRepo.Object,
            _notificationRepo.Object,
            _notificationService.Object,
            _teamRoleRepo.Object,
            _uowMock.Object // تمرير الـ Mock الصحيح هنا
        );
    }

    #region Delay Escalation Tests

    [Fact]
    public async Task CheckAndSendDelayEscalationsAsync_ShouldCreateCorrectLogEntry_WhenEscalated()
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

        // استخدام BuildMock() لضمان دعم ToListAsync و FirstOrDefaultAsync
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

        // Act
        await service.CheckAndSendDelayEscalationsAsync();

        // Assert
        // تصحيح: الكود يرسل "ItemEndDelay" وليس "EndDelay"
        _escalationLogRepo.Verify(r => r.AddAsync(It.Is<EscalationLog>(log =>
            log.ProjectId == projectId &&
            log.BOQItemId == itemId &&
            log.RecipientUserId == managerId &&
            log.EscalationType == "ItemEndDelay")), // تأكد من مطابقة الاسم في الكود
            Times.Once());
    }


    [Fact]
    public async Task CheckAndSendDelayEscalationsAsync_WhenLogExistsForThisItemToday_ShouldSkip()
    {
        // Arrange
        var today = DateTime.UtcNow.Date;
        var projectId = 1;
        var itemId = 200;
        var managerId = 10;

        var project = new Project
        {
            Id = projectId,
            IsClosed = false, // شرط أساسي في الاستعلام
            Settings = new ProjectSettings { EnableDelayNotification = true },
            BOQItems = new List<BOQItem>
        {
            new BOQItem { Id = itemId, EndDate = today.AddDays(-1), Status = "جاري" }
        }
        };

        // 1. محاكاة المشاريع
        _projectRepo.Setup(r => r.AsQueryable()).Returns(new List<Project> { project }.BuildMock());

        // 2. محاكاة الـ Log الموجود مسبقاً (هذا ما يمنع التكرار)
        var existingLogs = new List<EscalationLog>
    {
        new EscalationLog
        {
            ProjectId = projectId,
            BOQItemId = itemId,
            SentAt = today,
            EscalationType = "ItemEndDelay" // تأكد من مطابقة النوع المستخدم في الكود
        }
    }.BuildMock();
        _escalationLogRepo.Setup(r => r.AsQueryable()).Returns(existingLogs);

        // 3. الأهم: محاكاة فريق العمل لدعم FirstOrDefaultAsync (حل الخطأ CS1061/InvalidOperation)
        _teamRoleRepo.Setup(r => r.AsQueryable()).Returns(new List<ProjectTeamRole>
    {
        new ProjectTeamRole
        {
            ProjectTeamMember = new ProjectTeamMember { ProjectId = projectId, UserId = managerId },
            ProjectRole = new ProjectRole { Name = "ProjectManager" }
        }
    }.BuildMock());

        var service = CreateService();

        // Act
        await service.CheckAndSendDelayEscalationsAsync();

        // Assert
        // يجب ألا يتم إضافة أي سجل جديد لأن السجل موجود بالفعل لنفس اليوم
        _escalationLogRepo.Verify(r => r.AddAsync(It.IsAny<EscalationLog>()), Times.Never());
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.AtMostOnce()); // سيتم استدعاؤه مرة واحدة فقط في نهاية الميثود الرئيسية
    }
    #endregion
}