﻿using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using MockQueryable;
using MockQueryable.Moq;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class NotificationServiceTests
{
    private readonly Mock<IRepository<Notification>> _repoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();
    private readonly Mock<ILogger<NotificationService>> _loggerMock = new();

    private NotificationService CreateService() =>
        new(_repoMock.Object, _uowMock.Object, _loggerMock.Object);

    #region Create & Send Tests

    [Fact]
    public async Task CreateAndSendAsync_ShouldSaveNotificationAndCallUnitOfWork()
    {
        // Arrange
        var userId = 1;
        var service = CreateService();

        _repoMock.Setup(r => r.AddAsync(It.IsAny<Notification>()))
            .ReturnsAsync((Notification n) => n);

        // Act
        await service.CreateAndSendAsync(userId, "Test Title", "Test Message", "/link", NotificationType.General);

        // Assert
        _repoMock.Verify(r => r.AddAsync(It.Is<Notification>(n =>
            n.UserId == userId &&
            n.Title == "Test Title" &&
            n.Link == "/link")), Times.Once());
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    #endregion

    #region Query Tests

    [Fact]
    public async Task GetUserNotificationsAsync_ShouldReturnOnlyUnread_WhenRequested()
    {
        // Arrange
        var userId = 1;
        var notifications = new List<Notification>
        {
            new Notification { Id = 1, UserId = userId, IsRead = false, CreatedAt = DateTime.UtcNow },
            new Notification { Id = 2, UserId = userId, IsRead = true, CreatedAt = DateTime.UtcNow.AddMinutes(-5) }
        }.BuildMock();

        _repoMock.Setup(r => r.AsQueryable()).Returns(notifications);
        var service = CreateService();

        // Act
        var result = await service.GetUserNotificationsAsync(userId, unreadOnly: true);

        // Assert
        result.Should().HaveCount(1);
        result.All(n => n.IsRead == false).Should().BeTrue();
    }

    #endregion

    #region Update Status Tests

    [Fact]
    public async Task MarkAsReadAsync_ShouldUpdateStatus_WhenNotificationExistsAndBelongsToUser()
    {
        // Arrange
        var userId = 1;
        var notificationId = 10;
        var notification = new Notification { Id = notificationId, UserId = userId, IsRead = false };

        var mockData = new List<Notification> { notification }.BuildMock();
        _repoMock.Setup(r => r.AsQueryable()).Returns(mockData);

        var service = CreateService();

        // Act
        await service.MarkAsReadAsync(notificationId, userId);

        // Assert
        notification.IsRead.Should().BeTrue();
        notification.ReadAt.Should().NotBeNull();
        _repoMock.Verify(r => r.UpdateAsync(notification), Times.Once());
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task MarkAsReadAsync_ShouldDoNothing_WhenNotificationBelongsToAnotherUser()
    {
        // Arrange
        var userId = 1;
        var otherUserId = 99;
        var notificationId = 10;
        var notification = new Notification { Id = notificationId, UserId = otherUserId, IsRead = false };

        _repoMock.Setup(r => r.AsQueryable()).Returns(new List<Notification> { notification }.BuildMock());
        var service = CreateService();

        // Act
        await service.MarkAsReadAsync(notificationId, userId); // محاولة مستخدم مختلف قراءة الإشعار

        // Assert
        notification.IsRead.Should().BeFalse(); // لم يتغير
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Notification>()), Times.Never());
    }

    [Fact]
    public async Task MarkAllAsReadAsync_ShouldUpdateOnlyUnreadNotifications()
    {
        // Arrange
        var userId = 1;
        var notifications = new List<Notification>
        {
            new Notification { Id = 1, UserId = userId, IsRead = false },
            new Notification { Id = 2, UserId = userId, IsRead = true },
            new Notification { Id = 3, UserId = userId, IsRead = false }
        }.BuildMock();

        _repoMock.Setup(r => r.AsQueryable()).Returns(notifications);
        var service = CreateService();

        // Act
        await service.MarkAllAsReadAsync(userId);

        // Assert
        _repoMock.Verify(r => r.UpdateRangeAsync(It.Is<List<Notification>>(list => list.Count == 2)), Times.Once());
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task MarkAllAsReadAsync_WhenNoUnread_ShouldNotCallUpdate()
    {
        // Arrange
        var userId = 1;
        var notifications = new List<Notification>
        {
            new Notification { Id = 1, UserId = userId, IsRead = true }
        }.BuildMock();

        _repoMock.Setup(r => r.AsQueryable()).Returns(notifications);
        var service = CreateService();

        // Act
        await service.MarkAllAsReadAsync(userId);

        // Assert
        _repoMock.Verify(r => r.UpdateRangeAsync(It.IsAny<List<Notification>>()), Times.Never());
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Never());
    }

    #endregion
}