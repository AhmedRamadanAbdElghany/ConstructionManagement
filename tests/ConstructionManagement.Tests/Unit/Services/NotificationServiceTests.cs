using ConstructionManagement.Application.DTOs.Notfification;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Domain.Enums;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace ConstructionManagement.Tests.Unit.Services;

public class NotificationServiceTests
{
    private readonly Mock<INotificationRepository> _repoMock = new();
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<ILogger<NotificationService>> _loggerMock = new();

    private NotificationService CreateService() =>
        new(_repoMock.Object, _userRepoMock.Object, _loggerMock.Object);

    #region Create & Send Tests

    [Fact]
    public async Task CreateAndSendAsync_ShouldSaveNotification()
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
            new() { Id = 1, UserId = userId, IsRead = false, Title = "Test1", Message = "Msg1", CreatedAt = DateTime.UtcNow },
            new() { Id = 2, UserId = userId, IsRead = true, Title = "Test2", Message = "Msg2", CreatedAt = DateTime.UtcNow }
        };

        _repoMock.Setup(r => r.GetUnreadByUserIdAsync(userId))
            .ReturnsAsync(notifications.Where(n => !n.IsRead).ToList());

        var service = CreateService();

        // Act
        var result = await service.GetUserNotificationsAsync(userId, unreadOnly: true);

        // Assert
        result.Should().HaveCount(1);
        result[0].IsRead.Should().BeFalse();
    }

    [Fact]
    public async Task GetUserNotificationsAsync_ShouldReturnAll_WhenNotUnreadOnly()
    {
        // Arrange
        var userId = 1;
        var notifications = new List<Notification>
        {
            new() { Id = 1, UserId = userId, IsRead = false, Title = "Test1", Message = "Msg1", CreatedAt = DateTime.UtcNow },
            new() { Id = 2, UserId = userId, IsRead = true, Title = "Test2", Message = "Msg2", CreatedAt = DateTime.UtcNow }
        };

        _repoMock.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync(notifications);

        var service = CreateService();

        // Act
        var result = await service.GetUserNotificationsAsync(userId, unreadOnly: false);

        // Assert
        result.Should().HaveCount(2);
    }

    #endregion

    #region Mark as Read Tests

    [Fact]
    public async Task MarkAsReadAsync_ShouldUpdateNotification_WhenNotificationExists()
    {
        // Arrange
        const int userId = 1;
        var notification = new Notification { Id = 1, UserId = userId, IsRead = false, Title = "Test", Message = "Msg", CreatedAt = DateTime.UtcNow };
        
        _repoMock.Setup(r => r.GetByIdAndUserIdAsync(1, userId))
            .ReturnsAsync(notification);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Notification>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();

        // Act
        await service.MarkAsReadAsync(1, userId);

        // Assert
        notification.IsRead.Should().BeTrue();
        notification.ReadAt.Should().NotBeNull();
        _repoMock.Verify(r => r.UpdateAsync(notification), Times.Once());
    }

    [Fact]
    public async Task MarkAsReadAsync_ShouldDoNothing_WhenNotificationBelongsToAnotherUser()
    {
        // Arrange
        const int userId = 2; // Different user
        var notification = new Notification { Id = 1, UserId = 1, IsRead = false, Title = "Test", Message = "Msg", CreatedAt = DateTime.UtcNow };
        
        _repoMock.Setup(r => r.GetByIdAndUserIdAsync(1, userId))
            .ReturnsAsync((Notification?)null);

        var service = CreateService();

        // Act
        await service.MarkAsReadAsync(1, userId);

        // Assert
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Notification>()), Times.Never());
    }

    [Fact]
    public async Task MarkAsReadAsync_ShouldDoNothing_WhenAlreadyRead()
    {
        // Arrange
        const int userId = 1;
        var notification = new Notification { Id = 1, UserId = userId, IsRead = true, Title = "Test", Message = "Msg", CreatedAt = DateTime.UtcNow };
        
        _repoMock.Setup(r => r.GetByIdAndUserIdAsync(1, userId))
            .ReturnsAsync(notification);

        var service = CreateService();

        // Act
        await service.MarkAsReadAsync(1, userId);

        // Assert
        _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Notification>()), Times.Never());
    }

    [Fact]
    public async Task MarkAllAsReadAsync_ShouldUpdateAllUnread_WhenUserHasUnreadNotifications()
    {
        // Arrange
        var userId = 1;
        var notifications = new List<Notification>
        {
            new() { Id = 1, UserId = userId, IsRead = false, Title = "Test1", Message = "Msg1", CreatedAt = DateTime.UtcNow },
            new() { Id = 2, UserId = userId, IsRead = false, Title = "Test2", Message = "Msg2", CreatedAt = DateTime.UtcNow }
        };

        _repoMock.Setup(r => r.GetUnreadByUserIdAsync(userId))
            .ReturnsAsync(notifications);
        _repoMock.Setup(r => r.UpdateRangeAsync(It.IsAny<List<Notification>>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();

        // Act
        await service.MarkAllAsReadAsync(userId);

        // Assert
        _repoMock.Verify(r => r.UpdateRangeAsync(It.Is<List<Notification>>(list => list.Count == 2)), Times.Once());
    }

    [Fact]
    public async Task MarkAllAsReadAsync_WhenNoUnread_ShouldNotCallUpdate()
    {
        // Arrange
        var userId = 1;

        _repoMock.Setup(r => r.GetUnreadByUserIdAsync(userId))
            .ReturnsAsync(new List<Notification>());

        var service = CreateService();

        // Act
        await service.MarkAllAsReadAsync(userId);

        // Assert
        _repoMock.Verify(r => r.UpdateRangeAsync(It.IsAny<List<Notification>>()), Times.Never());
    }

    #endregion
}
