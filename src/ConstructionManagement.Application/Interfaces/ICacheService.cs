using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Interface for caching service operations.
/// Provides abstraction over the caching implementation (Memory Cache, Redis, etc.)
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Gets a cached value by key.
    /// </summary>
    /// <typeparam name="T">The type of the cached value.</typeparam>
    /// <param name="key">The cache key.</param>
    /// <returns>The cached value, or null if not found.</returns>
    Task<T?> GetAsync<T>(string key) where T : class;

    /// <summary>
    /// Gets a cached value by key with a default value if not found.
    /// </summary>
    /// <typeparam name="T">The type of the cached value.</typeparam>
    /// <param name="key">The cache key.</param>
    /// <param name="defaultValue">The default value to return if not found.</param>
    /// <returns>The cached value, or the default value if not found.</returns>
    Task<T> GetAsync<T>(string key, T defaultValue) where T : class;

    /// <summary>
    /// Sets a value in the cache.
    /// </summary>
    /// <typeparam name="T">The type of the value to cache.</typeparam>
    /// <param name="key">The cache key.</param>
    /// <param name="value">The value to cache.</param>
    /// <param name="expiration">The time until the cache entry expires.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SetAsync<T>(string key, T value, TimeSpan expiration) where T : class;

    /// <summary>
    /// Removes a value from the cache.
    /// </summary>
    /// <param name="key">The cache key to remove.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task RemoveAsync(string key);

    /// <summary>
    /// Checks if a key exists in the cache.
    /// </summary>
    /// <param name="key">The cache key to check.</param>
    /// <returns>True if the key exists, false otherwise.</returns>
    Task<bool> ExistsAsync(string key);

    /// <summary>
    /// Removes all cache entries matching a pattern.
    /// </summary>
    /// <param name="pattern">The pattern to match keys against.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task RemoveByPatternAsync(string pattern);

    /// <summary>
    /// Clears all entries from the cache.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ClearAsync();
}

/// <summary>
/// Common cache key prefixes for consistent naming.
/// </summary>
public static class CacheKeyPrefixes
{
    public const string User = "user";
    public const string Role = "role";
    public const string Permission = "permission";
    public const string Project = "project";
    public const string Invoice = "invoice";
    public const string Notification = "notification";
    public const string Vendor = "vendor";
    public const string BOQItem = "boqitem";
    public const string Settings = "settings";
}

/// <summary>
/// Extension methods for building cache keys.
/// </summary>
public static class CacheKeyBuilder
{
    /// <summary>
    /// Builds a cache key with the specified prefix and segments.
    /// </summary>
    public static string Build(string prefix, params string[] segments)
    {
        return string.Join(":", new[] { prefix }.Concat(segments));
    }

    /// <summary>
    /// Builds a user cache key.
    /// </summary>
    public static string UserKey(int userId)
    {
        return Build(CacheKeyPrefixes.User, userId.ToString());
    }

    /// <summary>
    /// Builds a role cache key.
    /// </summary>
    public static string RoleKey(int roleId)
    {
        return Build(CacheKeyPrefixes.Role, roleId.ToString());
    }

    /// <summary>
    /// Builds a project cache key.
    /// </summary>
    public static string ProjectKey(int projectId)
    {
        return Build(CacheKeyPrefixes.Project, projectId.ToString());
    }

    /// <summary>
    /// Builds an invoice cache key.
    /// </summary>
    public static string InvoiceKey(int invoiceId)
    {
        return Build(CacheKeyPrefixes.Invoice, invoiceId.ToString());
    }

    /// <summary>
    /// Builds a notifications cache key for a user.
    /// </summary>
    public static string UserNotificationsKey(int userId)
    {
        return Build(CacheKeyPrefixes.Notification, "user", userId.ToString());
    }
}
