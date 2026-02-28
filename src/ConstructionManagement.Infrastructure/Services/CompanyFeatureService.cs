using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

/// <summary>
/// Service for checking if features are enabled for the current company
/// </summary>
public class CompanyFeatureService : ICompanyFeatureService
{
    private const string CacheKeyPrefix = "CompanyFeature_";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    
    // Static list of all known feature flags for cache invalidation
    private static readonly string[] AllFeatureFlags = new[]
    {
        "EnableUserManagement", "EnableProjectManagement", "EnableProjectItemsManagement",
        "EnableDailyLogs", "EnableSiteMedia", "EnableInventoryManagement",
        "EnableEquipmentManagement", "EnableQualityControl", "EnableSafetyManagement",
        "EnableSubcontractorManagement", "EnableFinancialManagement", "EnableAnalytics",
        "EnableNotifications", "EnableDocumentManagement", "EnableDesignManagement",
        "EnableClientPortal", "EnableAccessControl", "EnableHRManagement",
        "EnableVendorManagement", "EnableLocationTracking", "EnableGeofenceManagement",
        "EnableLocationSubmit", "EnableInspections", "EnableLeaveManagement",
        "EnablePerformanceEvaluation", "EnableTrainingTracking", "EnableTasks",
        "EnableEscalations", "EnableMessaging", "EnableSocialWall", "EnableCurrencies",
        "EnablePaymentGateway", "EnableMarketplace", "EnableInventoryOwner", "EnableVideoCalls"
    };
    
    private readonly ICurrentUserService _currentUserService;
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<CompanyFeatureService> _logger;

    // Dictionary for compile-time safe feature flag checking
    // Maps feature flag property name to a function that extracts the value from CompanySettings
    private static readonly Dictionary<string, Func<CompanySettings, bool>> FeatureFlagGetters = new(StringComparer.OrdinalIgnoreCase)
    {
        ["EnableUserManagement"] = s => s.EnableUserManagement,
        ["EnableProjectManagement"] = s => s.EnableProjectManagement,
        ["EnableProjectItemsManagement"] = s => s.EnableProjectItemsManagement,
        ["EnableDailyLogs"] = s => s.EnableDailyLogs,
        ["EnableSiteMedia"] = s => s.EnableSiteMedia,
        ["EnableInventoryManagement"] = s => s.EnableInventoryManagement,
        ["EnableEquipmentManagement"] = s => s.EnableEquipmentManagement,
        ["EnableQualityControl"] = s => s.EnableQualityControl,
        ["EnableSafetyManagement"] = s => s.EnableSafetyManagement,
        ["EnableSubcontractorManagement"] = s => s.EnableSubcontractorManagement,
        ["EnableFinancialManagement"] = s => s.EnableFinancialManagement,
        ["EnableAnalytics"] = s => s.EnableAnalytics,
        ["EnableNotifications"] = s => s.EnableNotifications,
        ["EnableDocumentManagement"] = s => s.EnableDocumentManagement,
        ["EnableDesignManagement"] = s => s.EnableDesignManagement,
        ["EnableClientPortal"] = s => s.EnableClientPortal,
        ["EnableAccessControl"] = s => s.EnableAccessControl,
        ["EnableHRManagement"] = s => s.EnableHRManagement,
        ["EnableVendorManagement"] = s => s.EnableVendorManagement,
        ["EnableLocationTracking"] = s => s.EnableLocationTracking,
        ["EnableGeofenceManagement"] = s => s.EnableGeofenceManagement,
        ["EnableLocationSubmit"] = s => s.EnableLocationSubmit,
        ["EnableInspections"] = s => s.EnableInspections,
        ["EnableLeaveManagement"] = s => s.EnableLeaveManagement,
        ["EnablePerformanceEvaluation"] = s => s.EnablePerformanceEvaluation,
        ["EnableTrainingTracking"] = s => s.EnableTrainingTracking,
        ["EnableTasks"] = s => s.EnableTasks,
        ["EnableEscalations"] = s => s.EnableEscalations,
        ["EnableMessaging"] = s => s.EnableMessaging,
        ["EnableSocialWall"] = s => s.EnableSocialWall,
        ["EnableCurrencies"] = s => s.EnableCurrencies,
        ["EnablePaymentGateway"] = s => s.EnablePaymentGateway,
        ["EnableMarketplace"] = s => s.EnableMarketplace,
        ["EnableInventoryOwner"] = s => s.EnableInventoryOwner,
        ["EnableVideoCalls"] = s => s.EnableVideoCalls,
    };

    public CompanyFeatureService(
        ICurrentUserService currentUserService, 
        ApplicationDbContext context,
        IMemoryCache cache,
        ILogger<CompanyFeatureService> logger)
    {
        _currentUserService = currentUserService;
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Check if a specific feature is enabled for the current user's company
    /// </summary>
    /// <remarks>
    /// Priority: SuperAdmin (always allowed) -> CompanySettings (primary) -> Company (fallback) -> false
    /// SuperAdmin bypasses all feature checks for administrative access.
    /// CompanySettings defaults to true for most features, while Company defaults to false.
    /// This allows fine-grained control via CompanySettings while providing backward compatibility.
    /// Results are cached for 5 minutes to reduce database queries.
    /// </remarks>
    public async Task<bool> IsFeatureEnabledAsync(string featureName)
    {
        var companyId = _currentUserService.CompanyId;
        
        // SuperAdmin always has access regardless of company context or settings
        if (_currentUserService.IsInRole("SuperAdmin"))
        {
            return true;
        }

        // Non-SuperAdmin requires company context
        if (!companyId.HasValue)
        {
            _logger.LogWarning("User {UserId} attempted to access {Feature} without company context", 
                _currentUserService.UserId, featureName);
            return false;
        }

        var cacheKey = $"{CacheKeyPrefix}{featureName}_{companyId.Value}";
        
        if (_cache.TryGetValue(cacheKey, out bool cachedResult))
            return cachedResult;

        var settings = await _context.CompanySettings
            .FirstOrDefaultAsync(s => s.CompanyId == companyId.Value);

        bool result;
        if (settings == null)
        {
            // CompanySettings not found - check Company entity for fallback flags
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == companyId.Value);
            
            if (company != null)
            {
                // Use Company entity as fallback (defaults are defined there)
                result = GetCompanyFallbackFlag(company, featureName);
                _logger.LogInformation("Using Company entity fallback for {Feature} on company {CompanyId}", 
                    featureName, companyId.Value);
            }
            else
            {
                // Company doesn't exist either - return false for safety
                _logger.LogError("Company {CompanyId} not found - returning false for {Feature}", 
                    companyId.Value, featureName);
                result = false;
            }
            
            // Don't cache null-settings results - they may change when settings are created
            // Cache with shorter duration (1 minute) if we got a result from Company fallback
            if (result)
            {
                _cache.Set(cacheKey, result, TimeSpan.FromMinutes(1));
            }
        }
        else
        {
            result = GetSettingsFlag(settings, featureName);
            _cache.Set(cacheKey, result, CacheDuration);
        }

        return result;
    }

    /// <summary>
    /// Get feature flag from Company entity as fallback when CompanySettings doesn't exist
    /// </summary>
    private bool GetCompanyFallbackFlag(Company company, string featureName)
    {
        // Map feature names to Company entity properties
        var companyFlagGetters = new Dictionary<string, Func<Company, bool>>(StringComparer.OrdinalIgnoreCase)
        {
            ["EnableLocationTracking"] = c => c.EnableLocationTracking,
            ["EnableGeofenceManagement"] = c => c.EnableGeofenceManagement,
            ["EnableLocationSubmit"] = c => c.EnableLocationSubmit,
            ["EnableInspections"] = c => c.EnableInspections,
            ["EnableLeaveManagement"] = c => c.EnableLeaveManagement,
            ["EnablePerformanceEvaluation"] = c => c.EnablePerformanceEvaluation,
            ["EnableTrainingTracking"] = c => c.EnableTrainingTracking,
            ["EnableTasks"] = c => c.EnableTasks,
            ["EnableEscalations"] = c => c.EnableEscalations,
            ["EnableMessaging"] = c => c.EnableMessaging,
            ["EnableSocialWall"] = c => c.EnableSocialWall,
            ["EnableCurrencies"] = c => c.EnableCurrencies,
            ["EnablePaymentGateway"] = c => c.EnablePaymentGateway,
            ["EnableMarketplace"] = c => c.EnableMarketplace,
            ["EnableInventoryOwner"] = c => c.EnableInventoryOwner,
            ["EnableVideoCalls"] = c => c.EnableVideoCalls,
        };

        if (companyFlagGetters.TryGetValue(featureName, out var getter))
        {
            return getter(company);
        }
        
        // For other flags, default to true if not explicitly set (backward compatibility)
        return true;
    }

    /// <summary>
    /// Get feature flag from CompanySettings using dictionary lookup (compile-time safe)
    /// </summary>
    private bool GetSettingsFlag(CompanySettings settings, string featureName)
    {
        if (FeatureFlagGetters.TryGetValue(featureName, out var getter))
        {
            return getter(settings);
        }
        // Fallback to reflection for unknown flags (maintains backward compatibility)
        var property = typeof(CompanySettings).GetProperty(featureName);
        if (property != null && property.PropertyType == typeof(bool))
        {
            return (bool)(property.GetValue(settings) ?? false);
        }
        return false;
    }

    /// <summary>
    /// Centralized helper method to check if a feature is enabled
    /// </summary>
    /// <param name="flagName">Name of the feature flag for logging</param>
    /// <param name="flagAccessor">Function to extract the flag value from CompanySettings</param>
    /// <returns>True if enabled, false otherwise</returns>
    private async Task<bool> CheckFeatureAsync(string flagName, Func<CompanySettings, bool> flagAccessor)
    {
        var companyId = _currentUserService.CompanyId;
        
        // If no company context, check if user is SuperAdmin
        if (!companyId.HasValue)
        {
            var isSuperAdmin = _currentUserService.IsInRole("SuperAdmin");
            if (!isSuperAdmin)
            {
                _logger.LogWarning("User {UserId} attempted to access {Feature} without company context and not SuperAdmin", 
                    _currentUserService.UserId, flagName);
            }
            return isSuperAdmin;
        }

        // SuperAdmin always has access regardless of company settings
        if (_currentUserService.IsInRole("SuperAdmin"))
        {
            return true;
        }

        var settings = await _context.CompanySettings
            .FirstOrDefaultAsync(s => s.CompanyId == companyId.Value);

        var isEnabled = settings != null && flagAccessor(settings);
        
        if (!isEnabled)
        {
            _logger.LogDebug("Feature {Feature} is disabled for company {CompanyId}", flagName, companyId.Value);
        }
        
        return isEnabled;
    }

    // Typed methods now use the caching-enabled IsFeatureEnabledAsync for consistency
    public Task<bool> IsInspectionsEnabledAsync() => IsFeatureEnabledAsync("EnableInspections");

    public Task<bool> IsHRManagementEnabledAsync() => IsFeatureEnabledAsync("EnableHRManagement");

    public Task<bool> IsLeaveManagementEnabledAsync() => IsFeatureEnabledAsync("EnableLeaveManagement");

    public Task<bool> IsLocationTrackingEnabledAsync() => IsFeatureEnabledAsync("EnableLocationTracking");

    public Task<bool> IsGeofenceManagementEnabledAsync() => IsFeatureEnabledAsync("EnableGeofenceManagement");

    public Task<bool> IsInventoryManagementEnabledAsync() => IsFeatureEnabledAsync("EnableInventoryManagement");

    public Task<bool> IsEquipmentManagementEnabledAsync() => IsFeatureEnabledAsync("EnableEquipmentManagement");

    public Task<bool> IsQualityControlEnabledAsync() => IsFeatureEnabledAsync("EnableQualityControl");

    public Task<bool> IsSafetyManagementEnabledAsync() => IsFeatureEnabledAsync("EnableSafetyManagement");

    public Task<bool> IsSubcontractorManagementEnabledAsync() => IsFeatureEnabledAsync("EnableSubcontractorManagement");

    public Task<bool> IsDocumentManagementEnabledAsync() => IsFeatureEnabledAsync("EnableDocumentManagement");

    public Task<bool> IsVendorManagementEnabledAsync() => IsFeatureEnabledAsync("EnableVendorManagement");

    public Task<bool> IsPerformanceEvaluationEnabledAsync() => IsFeatureEnabledAsync("EnablePerformanceEvaluation");

    public Task<bool> IsTrainingTrackingEnabledAsync() => IsFeatureEnabledAsync("EnableTrainingTracking");

    public Task<bool> IsMultiCurrencyEnabledAsync() => IsFeatureEnabledAsync("EnableCurrencies");

    public Task<bool> IsPaymentGatewayEnabledAsync() => IsFeatureEnabledAsync("EnablePaymentGateway");

    public Task<bool> IsMarketplaceEnabledAsync() => IsFeatureEnabledAsync("EnableMarketplace");

    public Task<bool> IsVideoCallsEnabledAsync() => IsFeatureEnabledAsync("EnableVideoCalls");

    public Task<bool> IsEscalationsEnabledAsync() => IsFeatureEnabledAsync("EnableEscalations");

    public Task<bool> IsTasksEnabledAsync() => IsFeatureEnabledAsync("EnableTasks");

    public Task<bool> IsMessagingEnabledAsync() => IsFeatureEnabledAsync("EnableMessaging");

    public Task<bool> IsSocialWallEnabledAsync() => IsFeatureEnabledAsync("EnableSocialWall");

    /// <summary>
    /// Invalidates the feature flag cache for a specific company.
    /// Call this when company settings are updated.
    /// </summary>
    /// <param name="companyId">The company ID to invalidate cache for</param>
    public void InvalidateCache(int companyId)
    {
        // Remove all cached feature flags for this company
        foreach (var featureFlag in AllFeatureFlags)
        {
            var cacheKey = $"{CacheKeyPrefix}{featureFlag}_{companyId}";
            _cache.Remove(cacheKey);
        }
        _logger.LogInformation("Cache invalidation completed for company {CompanyId}", companyId);
    }

    /// <summary>
    /// Clears all feature flag caches. Use with caution.
    /// </summary>
    /// <remarks>
    /// Note: MemoryCache doesn't support enumerating keys, so this method only logs a warning.
    /// For true cache clearing across all companies, consider using IDistributedCache with Redis.
    /// </remarks>
    public void ClearAllCaches()
    {
        _logger.LogWarning("ClearAllCaches called - MemoryCache does not support key enumeration. Cache will expire naturally based on CacheDuration (5 minutes). For immediate cache clearing across all companies, consider using IDistributedCache with Redis.");
    }
}
