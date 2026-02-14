using ConstructionManagement.Application.DTOs;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

public class DailyLogServiceTests
{
    private readonly Mock<IRepository<ItemDailyLog>> _logRepoMock = new();
    private readonly Mock<IRepository<BOQExecutedDelta>> _deltaRepoMock = new();
    private readonly Mock<IRepository<BOQItem>> _itemRepoMock = new();
    private readonly Mock<IActivityLogService> _activityLogMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    private DailyLogService CreateService()
        => new DailyLogService(
            _logRepoMock.Object,
            _deltaRepoMock.Object,
            _itemRepoMock.Object,
            _activityLogMock.Object,
            _uowMock.Object
        );

    [Fact]
    public async Task IsDayClosedForItemAsync_ShouldReturnTrue_WhenLogIsClosed()
    {
        var itemId = 1;
        var date = DateTime.UtcNow.Date;

        var logs = new List<ItemDailyLog>
        {
            new ItemDailyLog { BOQItemId = itemId, LogDate = date, IsClosed = true }
        }.BuildMock();

        _logRepoMock.Setup(r => r.AsQueryable()).Returns(logs);

        var result = await CreateService().IsDayClosedForItemAsync(itemId, date);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetOrCreateDailyLogIdAsync_ShouldCreateNewLog_WhenNotFound()
    {
        var itemId = 1;
        var date = DateTime.UtcNow.Date;

        var emptyLogs = new List<ItemDailyLog>().BuildMock();
        _logRepoMock.Setup(r => r.AsQueryable()).Returns(emptyLogs);

        await CreateService().GetOrCreateDailyLogIdAsync(itemId, date, 10);

        _logRepoMock.Verify(r => r.AddAsync(It.IsAny<ItemDailyLog>()), Times.Once());
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task GetOrCreateDailyLogIdAsync_ShouldReturnExistingId_WhenFound()
    {
        var existingId = 500;
        var date = DateTime.UtcNow.Date;

        var logs = new List<ItemDailyLog>
        {
            new ItemDailyLog { Id = existingId, BOQItemId = 1, LogDate = date }
        }.BuildMock();

        _logRepoMock.Setup(r => r.AsQueryable()).Returns(logs);

        var resultId = await CreateService().GetOrCreateDailyLogIdAsync(1, date, 10);

        resultId.Should().Be(existingId);
    }

    [Fact]
    public async Task CloseDailyLogAsync_ShouldUpdateLogAndAddDelta_WhenValidRequest()
    {
        var itemId = 1;
        var logDate = DateTime.UtcNow.Date;
        var userId = 20;

        var existingLog = new ItemDailyLog { BOQItemId = itemId, LogDate = logDate, IsClosed = false };

        var logs = new List<ItemDailyLog> { existingLog }.BuildMock();
        _logRepoMock.Setup(r => r.AsQueryable()).Returns(logs);

        var request = new CloseDailyLogRequest(95.5m, "Work done", "Closed successfully");

        var result = await CreateService().CloseDailyLogAsync(itemId, logDate, userId, request);

        result.Should().BeTrue();
        existingLog.IsClosed.Should().BeTrue();
        existingLog.ClosedByUserId.Should().Be(userId);

        // Verify delta was added
        _deltaRepoMock.Verify(r => r.AddAsync(It.Is<BOQExecutedDelta>(d =>
            d.BOQItemId == itemId &&
            d.DeltaQuantity > 0 &&          // adjust based on your real calculation
            d.ChangeType == "DailyLog" &&
            d.CreatedByUserId == userId
        )), Times.Once());

        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task GetDailyLogHistoryAsync_ShouldReturnMappedDtos()
    {
        var itemId = 1;

        var logs = new List<ItemDailyLog>
        {
            new ItemDailyLog
            {
                BOQItemId = itemId,
                LogDate = DateTime.UtcNow,
                ClosedByUser = new User { FirstName = "Ahmed", LastName = "Ramadan" }
            }
        }.BuildMock();

        _logRepoMock.Setup(r => r.AsQueryable()).Returns(logs);

        var history = await CreateService().GetDailyLogHistoryAsync(itemId);

        history.Should().NotBeEmpty();
        history.First().ClosedByFullName.Should().Be("Ahmed Ramadan");
    }
}
