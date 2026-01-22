﻿using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Integration
{
    public class EscalationIntegrationTests : IntegrationTestBase
    {
        private readonly EscalationService _service;
        private readonly Mock<INotificationService> _notifMock = new();

        public EscalationIntegrationTests() : base()
        {
            // بناء السيرفس مع الـ Repositories المعتمدة على الـ Context الخاص بـ SQLite
            _service = new EscalationService(
                new Repository<Project>(Context),
                new Repository<EscalationLog>(Context),
                new Repository<User>(Context),
                new Mock<IEmailService>().Object,
                new Repository<Transaction>(Context),
                new Repository<Notification>(Context),
                _notifMock.Object,
                new Repository<ProjectTeamRole>(Context),
                UnitOfWork);
        }

        [Fact]
        public async Task CheckEscalations_ShouldDetectDelayedProjects()
        {
            // 1. Arrange: إنشاء مستخدم بالخصائص المتاحة فقط (FullName, Email)
            var user = new User
            {
                FullName = "Manager",
                Email = "m@m.com",
                PasswordHash = "AnyHash123"
            };
            Context.Users.Add(user);
            await Context.SaveChangesAsync();

            var project = new Project
            {
                ProjectName = "Late Tower",
                OwnerUserId = user.Id,
                StartDate = DateTime.UtcNow.AddDays(-10),
                Settings = new ProjectSettings
                {
                    EnableDelayNotification = true,
                    DelayNotificationIntervalDays = 1
                }
            };
            Context.Projects.Add(project);
            await Context.SaveChangesAsync();

            // 2. Act
            await _service.CheckAndSendDelayEscalationsAsync();

            // 3. Assert
            // نتحقق من وجود لوج مربوط برقم المشروع
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