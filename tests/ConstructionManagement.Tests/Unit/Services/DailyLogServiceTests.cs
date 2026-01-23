using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence.Repositories.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using MockQueryable;
using Moq;

namespace ConstructionManagement.Tests.Unit.Services;

public class DailyLogServiceTests
{
    private readonly Mock<IRepository<ItemDailyLog>> _logRepoMock;
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly DailyLogService _service;

    public DailyLogServiceTests()
    {
        _logRepoMock = new Mock<IRepository<ItemDailyLog>>();
        _uowMock = new Mock<IUnitOfWork>();
        _service = new DailyLogService(_logRepoMock.Object, _uowMock.Object);
    }

    [Fact]
    public async Task IsDayClosedForItemAsync_ShouldReturnTrue_WhenLogIsClosed()
    {
        var itemId = 1;
        var date = DateTime.UtcNow.Date;
        // تصحيح: BuildMock مباشرة على القائمة
        var logs = new List<ItemDailyLog>
        {
            new ItemDailyLog { BOQItemId = itemId, LogDate = date, IsClosed = true }
        }.BuildMock();

        _logRepoMock.Setup(r => r.AsQueryable()).Returns(logs);

        var result = await _service.IsDayClosedForItemAsync(itemId, date);
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetOrCreateDailyLogIdAsync_ShouldCreateNewLog_WhenNotFound()
    {
        var itemId = 1;
        var date = DateTime.UtcNow.Date;
        // تصحيح: BuildMock مباشرة على القائمة الفارغة
        var emptyLogs = new List<ItemDailyLog>().BuildMock();

        _logRepoMock.Setup(r => r.AsQueryable()).Returns(emptyLogs);

        await _service.GetOrCreateDailyLogIdAsync(itemId, date, 10);

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
        }.BuildMock(); // تصحيح

        _logRepoMock.Setup(r => r.AsQueryable()).Returns(logs);

        var resultId = await _service.GetOrCreateDailyLogIdAsync(1, date, 10);

        resultId.Should().Be(existingId);
    }

    [Fact]
    public async Task CloseDailyLogAsync_ShouldUpdateLog_WhenValidRequest()
    {
        var date = DateTime.UtcNow.Date;
        var existingLog = new ItemDailyLog { BOQItemId = 1, LogDate = date, IsClosed = false };
        var logs = new List<ItemDailyLog> { existingLog }.BuildMock(); // تصحيح

        _logRepoMock.Setup(r => r.AsQueryable()).Returns(logs);

        var result = await _service.CloseDailyLogAsync(1, date, 20, new CloseDailyLogRequest(95.5m, "Work", "Good"));

        result.Should().BeTrue();
        existingLog.IsClosed.Should().BeTrue();
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once());
    }

    [Fact]
    public async Task GetDailyLogHistoryAsync_ShouldReturnMappedDtos()
    {
        var logs = new List<ItemDailyLog>
        {
            new ItemDailyLog
            {
                BOQItemId = 1,
                LogDate = DateTime.UtcNow,
                ClosedByUser = new User { FullName = "Ahmed Ramadan" }
            }
        }.BuildMock(); // تصحيح

        _logRepoMock.Setup(r => r.AsQueryable()).Returns(logs);

        var history = await _service.GetDailyLogHistoryAsync(1);

        history.Should().NotBeEmpty();
        history.First().ClosedByFullName.Should().Be("Ahmed Ramadan");
    }
}