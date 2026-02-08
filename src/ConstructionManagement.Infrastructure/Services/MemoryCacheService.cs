using ConstructionManagement.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// In-memory implementation of the cache service using IMemoryCache.
/// Suitable for single-instance deployments.
/// </summary>
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<MemoryCacheService> _logger;
    private readonly ConcurrentDictionary<string, bool> _keys = new();
    private readonly object _lock = new();

    /// <summary>
    /// Default cache duration for items without specific expiration.
    /// </summary>
    public static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(5);

    public MemoryCacheService(IMemoryCache cache, ILogger<MemoryCacheService> logger)
    {
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public Task<T?> GetAsync<T>(string key) where T : class
    {
        _logger.LogDebug("Getting cache entry for key: {Key}", key);
        
        if (_cache.TryGetValue(key, out T? value))
        {
            _logger.LogDebug("Cache hit for key: {Key}", key);
            return Task.FromResult(value);
        }

        _logger.LogDebug("Cache miss for key: {Key}", key);
        return Task.FromResult<T?>(null);
    }

    public Task<T> GetAsync<T>(string key, T defaultValue) where T : class
    {
        return Task.Run(() =>
        {
            var value = GetAsync<T>(key).Result;
            return value ?? defaultValue;
        });
    }

    public Task SetAsync<T>(string key, T value, TimeSpan expiration) where T : class
    {
        _logger.LogDebug(
            "Setting cache entry for key: {Key} with expiration: {Expiration}",
            key, expiration);

        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration,
            SlidingExpiration = expiration > TimeSpan.FromSeconds(10) ? expiration.Add(TimeSpan.FromSeconds(-10)) : null,
            Priority = CacheItemPriority.Normal
        };

        options.RegisterPostEvictionCallback((cacheKey, _, _, _) =>
        {
            if (cacheKey is string keyString)
            {
                _keys.TryRemove(keyString, out _);
                _logger.LogDebug("Cache entry evicted: {Key}", keyString);
            }
        });

        _cache.Set(key, value, options);
        _keys.TryAdd(key, true);

        _logger.LogDebug("Cache entry set successfully: {Key}", key);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key)
    {
        _logger.LogDebug("Removing cache entry for key: {Key}", key);
        _cache.Remove(key);
        _keys.TryRemove(key, out _);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string key)
    {
        var exists = _cache.TryGetValue(key, out _);
        return Task.FromResult(exists);
    }

    public Task RemoveByPatternAsync(string pattern)
    {
        _logger.LogInformation("Removing cache entries matching pattern: {Pattern}", pattern);
        
        // Convert glob-style pattern to regex
        var regexPattern = pattern
            .Replace(".", "\\.")
            .Replace("*", ".*")
            .Replace("?", ".");

        var regex = new System.Text.RegularExpressions.Regex($"^{regexPattern}$");

        lock (_lock)
        {
            var keysToRemove = _keys.Keys.Where(k => regex.IsMatch(k)).ToList();
            
            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
                _keys.TryRemove(key, out _);
                _logger.LogDebug("Removed cache entry by pattern: {Key}", key);
            }

            _logger.LogInformation(
                "Removed {Count} cache entries matching pattern: {Pattern}",
                keysToRemove.Count, pattern);
        }

        return Task.CompletedTask;
    }

    public Task ClearAsync()
    {
        _logger.LogInformation("Clearing all cache entries");
        
        lock (_lock)
        {
            var keys = _keys.Keys.ToList();
            
            foreach (var key in keys)
            {
                _cache.Remove(key);
                _keys.TryRemove(key, out _);
            }

            _logger.LogInformation("Cleared {Count} cache entries", keys.Count);
        }

        return Task.CompletedTask;
    }
}

/// <summary>
/// Extension methods for common caching operations.
/// </summary>
public static class CacheExtensions
{
    /// <summary>
    /// Gets a cached value or creates it if not found.
    /// </summary>
    public static async Task<T?> GetOrCreateAsync<T>(this ICacheService cache, string key, TimeSpan expiration, Func<Task<T>> factory)
        where T : class
    {
        var value = await cache.GetAsync<T>(key);
        
        if (value != null)
            return value;

        value = await factory();
        await cache.SetAsync(key, value, expiration);
        
        return value;
    }

    /// <summary>
    /// Gets a cached value or creates it if not found (synchronous version).
    /// </summary>
    public static T? GetOrCreate<T>(this ICacheService cache, string key, TimeSpan expiration, Func<T> factory)
        where T : class
    {
        var value = cache.GetAsync<T>(key).Result;
        
        if (value != null)
            return value;

        value = factory();
        cache.SetAsync(key, value, expiration).Wait();
        
        return value;
    }

    /// <summary>
    /// Gets a cached value with a default expiration.
    /// </summary>
    public static Task<T?> GetAsync<T>(this ICacheService cache, string key)
        where T : class
    {
        return cache.GetAsync<T>(key);
    }

    /// <summary>
    /// Sets a cached value with default expiration.
    /// </summary>
    public static Task SetAsync<T>(this ICacheService cache, string key, T value)
        where T : class
    {
        return cache.SetAsync(key, value, TimeSpan.FromMinutes(5));
    }
}
