using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ConstructionManagement.Tests.Unit.Services;

/// <summary>
/// Unit tests for MemoryCacheService.
/// </summary>
public class MemoryCacheServiceTests
{
    private readonly IMemoryCache _cache;
    private readonly Mock<ILogger<MemoryCacheService>> _loggerMock;
    private readonly MemoryCacheService _service;

    public MemoryCacheServiceTests()
    {
        _cache = new MemoryCache(new MemoryCacheOptions());
        _loggerMock = new Mock<ILogger<MemoryCacheService>>();
        _service = new MemoryCacheService(_cache, _loggerMock.Object);
    }

    #region GetAsync Tests

    [Fact]
    public async Task GetAsync_WhenCacheHit_ReturnsValue()
    {
        // Arrange
        var expectedValue = new TestCacheObject { Id = 1, Name = "Test" };
        _cache.Set("test-key", expectedValue);

        // Act
        var result = await _service.GetAsync<TestCacheObject>("test-key");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Name.Should().Be("Test");
    }

    [Fact]
    public async Task GetAsync_WhenCacheMiss_ReturnsNull()
    {
        // Act
        var result = await _service.GetAsync<TestCacheObject>("nonexistent-key");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetAsync with Default Value Tests

    [Fact]
    public async Task GetAsync_WithDefaultValue_WhenCacheHit_ReturnsCachedValue()
    {
        // Arrange
        var cachedObject = new TestCacheObject { Id = 1, Name = "Cached" };
        _cache.Set("test-key", cachedObject);

        var defaultValue = new TestCacheObject { Id = 99, Name = "Default" };

        // Act
        var result = await _service.GetAsync("test-key", defaultValue);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Name.Should().Be("Cached");
    }

    [Fact]
    public async Task GetAsync_WithDefaultValue_WhenCacheMiss_ReturnsDefault()
    {
        // Arrange
        var defaultValue = new TestCacheObject { Id = 99, Name = "Default" };

        // Act
        var result = await _service.GetAsync("nonexistent-key", defaultValue);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(99);
        result.Name.Should().Be("Default");
    }

    #endregion

    #region SetAsync Tests

    [Fact]
    public async Task SetAsync_ShouldSetValueWithExpiration()
    {
        // Arrange
        var value = new TestCacheObject { Id = 1, Name = "Test" };
        var expiration = TimeSpan.FromMinutes(5);

        // Act
        await _service.SetAsync("test-key", value, expiration);

        // Assert - Verify the value was stored correctly
        var retrieved = await _service.GetAsync<TestCacheObject>("test-key");
        retrieved.Should().NotBeNull();
        retrieved!.Id.Should().Be(1);
        retrieved.Name.Should().Be("Test");
    }

    [Fact]
    public async Task SetAsync_ShouldSetValueWithDefaultExpiration()
    {
        // Arrange
        var value = new TestCacheObject { Id = 1, Name = "Test" };

        // Act
        await _service.SetAsync("test-key", value);

        // Assert - Verify the value was stored correctly
        var retrieved = await _service.GetAsync<TestCacheObject>("test-key");
        retrieved.Should().NotBeNull();
        retrieved!.Id.Should().Be(1);
        retrieved.Name.Should().Be("Test");
    }

    #endregion

    #region RemoveAsync Tests

    [Fact]
    public async Task RemoveAsync_ShouldRemoveKey()
    {
        // Arrange - Pre-populate the cache
        await _service.SetAsync("test-key", new TestCacheObject { Id = 1, Name = "Test" });

        // Act
        await _service.RemoveAsync("test-key");

        // Assert
        var result = await _service.GetAsync<TestCacheObject>("test-key");
        result.Should().BeNull();
    }

    #endregion

    #region ExistsAsync Tests

    [Fact]
    public async Task ExistsAsync_WhenExists_ReturnsTrue()
    {
        // Arrange
        await _service.SetAsync("test-key", new TestCacheObject { Id = 1, Name = "Test" });

        // Act
        var result = await _service.ExistsAsync("test-key");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_WhenNotExists_ReturnsFalse()
    {
        // Act
        var result = await _service.ExistsAsync("nonexistent-key");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region ClearAsync Tests

    [Fact]
    public async Task ClearAsync_ShouldRemoveAllEntries()
    {
        // Arrange - Pre-populate the cache
        await _service.SetAsync("key1", new TestCacheObject { Id = 1, Name = "Test1" });
        await _service.SetAsync("key2", new TestCacheObject { Id = 2, Name = "Test2" });

        // Act
        await _service.ClearAsync();

        // Assert
        var result1 = await _service.GetAsync<TestCacheObject>("key1");
        var result2 = await _service.GetAsync<TestCacheObject>("key2");
        result1.Should().BeNull();
        result2.Should().BeNull();
    }

    #endregion

    #region Helper Classes

    private class TestCacheObject
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    #endregion
}

/// <summary>
/// Unit tests for CacheKeyBuilder and CacheKeyPrefixes.
/// </summary>
public class CacheKeyBuilderTests
{
    [Fact]
    public void Build_ShouldCombinePrefixAndSegments()
    {
        // Act
        var key = CacheKeyBuilder.Build("user", "1", "profile");

        // Assert
        key.Should().Be("user:1:profile");
    }

    [Fact]
    public void UserKey_ShouldReturnCorrectFormat()
    {
        // Act
        var key = CacheKeyBuilder.UserKey(123);

        // Assert
        key.Should().Be("user:123");
    }

    [Fact]
    public void RoleKey_ShouldReturnCorrectFormat()
    {
        // Act
        var key = CacheKeyBuilder.RoleKey(456);

        // Assert
        key.Should().Be("role:456");
    }

    [Fact]
    public void ProjectKey_ShouldReturnCorrectFormat()
    {
        // Act
        var key = CacheKeyBuilder.ProjectKey(789);

        // Assert
        key.Should().Be("project:789");
    }

    [Fact]
    public void InvoiceKey_ShouldReturnCorrectFormat()
    {
        // Act
        var key = CacheKeyBuilder.InvoiceKey(100);

        // Assert
        key.Should().Be("invoice:100");
    }

    [Fact]
    public void UserNotificationsKey_ShouldReturnCorrectFormat()
    {
        // Act
        var key = CacheKeyBuilder.UserNotificationsKey(50);

        // Assert
        key.Should().Be("notification:user:50");
    }

    [Fact]
    public void CacheKeyPrefixes_ShouldHaveCorrectValues()
    {
        // Assert
        CacheKeyPrefixes.User.Should().Be("user");
        CacheKeyPrefixes.Role.Should().Be("role");
        CacheKeyPrefixes.Permission.Should().Be("permission");
        CacheKeyPrefixes.Project.Should().Be("project");
        CacheKeyPrefixes.Invoice.Should().Be("invoice");
        CacheKeyPrefixes.Notification.Should().Be("notification");
        CacheKeyPrefixes.Vendor.Should().Be("vendor");
        CacheKeyPrefixes.BOQItem.Should().Be("boqitem");
        CacheKeyPrefixes.Settings.Should().Be("settings");
    }
}
