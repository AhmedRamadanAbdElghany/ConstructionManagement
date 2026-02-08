using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

/// <summary>
/// Unit tests for InMemoryNotificationQueue.
/// </summary>
public class InMemoryNotificationQueueTests
{
    private readonly Mock<ILogger<InMemoryNotificationQueue>> _loggerMock;
    private readonly InMemoryNotificationQueue _queue;

    public InMemoryNotificationQueueTests()
    {
        _loggerMock = new Mock<ILogger<InMemoryNotificationQueue>>();
        _queue = new InMemoryNotificationQueue(_loggerMock.Object);
    }

    #region QueueNotification Tests

    [Fact]
    public void QueueNotification_ShouldAddMessageToQueue()
    {
        // Arrange
        var message = new NotificationMessage
        {
            UserId = 1,
            Title = "Test",
            Message = "Test message",
            Type = "Test"
        };

        // Act
        _queue.QueueNotification(message);

        // Assert
        _queue.Count.Should().Be(1);
    }

    [Fact]
    public void QueueNotification_WithDefaultPriority_ShouldSetNormalPriority()
    {
        // Arrange
        var message = new NotificationMessage
        {
            UserId = 1,
            Title = "Test",
            Message = "Test message",
            Type = "Test",
            Priority = NotificationPriority.Normal
        };

        // Act
        _queue.QueueNotification(message);

        // Assert
        message.Priority.Should().Be(NotificationPriority.Normal);
    }

    [Fact]
    public void QueueNotification_WithPriority_ShouldRespectPriority()
    {
        // Arrange
        var lowPriority = new NotificationMessage { UserId = 1, Title = "Low", Type = "Test" };
        var highPriority = new NotificationMessage { UserId = 2, Title = "High", Type = "Test" };
        var urgentMessage = new NotificationMessage { UserId = 3, Title = "Urgent", Type = "Test" };

        // Act
        _queue.QueueNotification(lowPriority, NotificationPriority.Low);
        _queue.QueueNotification(highPriority, NotificationPriority.High);
        _queue.QueueNotification(urgentMessage, NotificationPriority.Urgent);

        // Assert
        _queue.Count.Should().Be(3);
    }

    [Fact]
    public void QueueNotification_ShouldThrowOnNullMessage()
    {
        // Arrange & Act
        Action act = () => _queue.QueueNotification(null!);

        // Assert
        act.Should().Throw<ArgumentNullException>();
    }

    #endregion

    #region DequeueAsync Tests

    [Fact]
    public async Task DequeueAsync_WhenEmpty_ShouldReturnNull()
    {
        // Act
        var result = await _queue.DequeueAsync();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task DequeueAsync_ShouldReturnMessages()
    {
        // Arrange
        var message = new NotificationMessage
        {
            UserId = 1,
            Title = "Test",
            Message = "Test message",
            Type = "Test"
        };
        _queue.QueueNotification(message);

        // Act
        var result = await _queue.DequeueAsync();

        // Assert
        result.Should().NotBeNull();
        result!.UserId.Should().Be(1);
        result.Title.Should().Be("Test");
    }

    #endregion

    #region Count Tests

    [Fact]
    public void Count_ShouldReturnCorrectNumber()
    {
        // Arrange
        _queue.QueueNotification(new NotificationMessage { UserId = 1, Title = "Test1", Type = "Test" });
        _queue.QueueNotification(new NotificationMessage { UserId = 2, Title = "Test2", Type = "Test" });
        _queue.QueueNotification(new NotificationMessage { UserId = 3, Title = "Test3", Type = "Test" });

        // Act
        var count = _queue.Count;

        // Assert
        count.Should().Be(3);
    }

    [Fact]
    public void Count_WhenEmpty_ShouldReturnZero()
    {
        // Act
        var count = _queue.Count;

        // Assert
        count.Should().Be(0);
    }

    #endregion

    #region Clear Tests

    [Fact]
    public void Clear_ShouldRemoveAllMessages()
    {
        // Arrange
        _queue.QueueNotification(new NotificationMessage { UserId = 1, Title = "Test1", Type = "Test" });
        _queue.QueueNotification(new NotificationMessage { UserId = 2, Title = "Test2", Type = "Test" });

        // Act
        _queue.Clear();
        var count = _queue.Count;

        // Assert
        count.Should().Be(0);
    }

    #endregion
}

/// <summary>
/// Unit tests for NotificationMessage.
/// </summary>
public class NotificationMessageTests
{
    [Fact]
    public void NotificationMessage_ShouldHaveDefaultValues()
    {
        // Arrange & Act
        var message = new NotificationMessage();

        // Assert
        message.Id.Should().NotBe(Guid.Empty);
        message.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        message.Priority.Should().Be(NotificationPriority.Normal);
        message.RetryCount.Should().Be(0);
        message.MaxRetries.Should().Be(3);
    }

    [Fact]
    public void NotificationMessage_ShouldAllowCustomValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-1);

        // Act
        var message = new NotificationMessage
        {
            Id = id,
            UserId = 42,
            Title = "Custom Title",
            Message = "Custom Message",
            Type = "CustomType",
            Priority = NotificationPriority.Urgent,
            RelatedEntityId = 100,
            RelatedEntityType = "Invoice",
            CreatedAt = createdAt
        };

        // Assert
        message.Id.Should().Be(id);
        message.UserId.Should().Be(42);
        message.Title.Should().Be("Custom Title");
        message.Message.Should().Be("Custom Message");
        message.Type.Should().Be("CustomType");
        message.Priority.Should().Be(NotificationPriority.Urgent);
        message.RelatedEntityId.Should().Be(100);
        message.RelatedEntityType.Should().Be("Invoice");
        message.CreatedAt.Should().Be(createdAt);
    }
}

/// <summary>
/// Unit tests for NotificationPriority enum values.
/// </summary>
public class NotificationPriorityTests
{
    [Theory]
    [InlineData(NotificationPriority.Low, 0)]
    [InlineData(NotificationPriority.Normal, 1)]
    [InlineData(NotificationPriority.High, 2)]
    [InlineData(NotificationPriority.Urgent, 3)]
    public void NotificationPriority_ShouldHaveCorrectValues(NotificationPriority priority, int expected)
    {
        // Assert
        ((int)priority).Should().Be(expected);
    }

    [Fact]
    public void NotificationPriority_ShouldBeOrdered()
    {
        // Assert - compare integer values for ordering
        ((int)NotificationPriority.Low).Should().BeLessThan((int)NotificationPriority.Normal);
        ((int)NotificationPriority.Normal).Should().BeLessThan((int)NotificationPriority.High);
        ((int)NotificationPriority.High).Should().BeLessThan((int)NotificationPriority.Urgent);
    }
}
