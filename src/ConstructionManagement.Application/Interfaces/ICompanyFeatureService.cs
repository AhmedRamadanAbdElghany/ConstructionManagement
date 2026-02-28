using System.Threading.Tasks;

namespace ConstructionManagement.Application.Interfaces;

/// <summary>
/// Service for checking if features are enabled for the current company
/// </summary>
public interface ICompanyFeatureService
{
    /// <summary>
    /// Check if a specific feature is enabled for the current user's company
    /// </summary>
    /// <param name="featureName">The feature name (e.g., "EnableInspections", "EnableHRManagement")</param>
    /// <returns>True if enabled, false otherwise</returns>
    Task<bool> IsFeatureEnabledAsync(string featureName);

    /// <summary>
    /// Check if inspections feature is enabled
    /// </summary>
    Task<bool> IsInspectionsEnabledAsync();

    /// <summary>
    /// Check if HR management feature is enabled
    /// </summary>
    Task<bool> IsHRManagementEnabledAsync();

    /// <summary>
    /// Check if leave management feature is enabled
    /// </summary>
    Task<bool> IsLeaveManagementEnabledAsync();

    /// <summary>
    /// Check if location tracking feature is enabled
    /// </summary>
    Task<bool> IsLocationTrackingEnabledAsync();

    /// <summary>
    /// Check if geofence management feature is enabled
    /// </summary>
    Task<bool> IsGeofenceManagementEnabledAsync();

    /// <summary>
    /// Check if inventory management feature is enabled
    /// </summary>
    Task<bool> IsInventoryManagementEnabledAsync();

    /// <summary>
    /// Check if equipment management feature is enabled
    /// </summary>
    Task<bool> IsEquipmentManagementEnabledAsync();

    /// <summary>
    /// Check if quality control feature is enabled
    /// </summary>
    Task<bool> IsQualityControlEnabledAsync();

    /// <summary>
    /// Check if safety management feature is enabled
    /// </summary>
    Task<bool> IsSafetyManagementEnabledAsync();

    /// <summary>
    /// Check if subcontractor management feature is enabled
    /// </summary>
    Task<bool> IsSubcontractorManagementEnabledAsync();

    /// <summary>
    /// Check if document management feature is enabled
    /// </summary>
    Task<bool> IsDocumentManagementEnabledAsync();

    /// <summary>
    /// Check if vendor management feature is enabled
    /// </summary>
    Task<bool> IsVendorManagementEnabledAsync();

    /// <summary>
    /// Check if performance evaluation feature is enabled
    /// </summary>
    Task<bool> IsPerformanceEvaluationEnabledAsync();

    /// <summary>
    /// Check if training tracking feature is enabled
    /// </summary>
    Task<bool> IsTrainingTrackingEnabledAsync();

    /// <summary>
    /// Check if multi-currency feature is enabled
    /// </summary>
    Task<bool> IsMultiCurrencyEnabledAsync();

    /// <summary>
    /// Check if payment gateway feature is enabled
    /// </summary>
    Task<bool> IsPaymentGatewayEnabledAsync();

    /// <summary>
    /// Check if marketplace feature is enabled
    /// </summary>
    Task<bool> IsMarketplaceEnabledAsync();

    /// <summary>
    /// Check if video calls feature is enabled
    /// </summary>
    Task<bool> IsVideoCallsEnabledAsync();

    /// <summary>
    /// Check if escalations feature is enabled
    /// </summary>
    Task<bool> IsEscalationsEnabledAsync();

    /// <summary>
    /// Check if tasks feature is enabled
    /// </summary>
    Task<bool> IsTasksEnabledAsync();

    /// <summary>
    /// Check if messaging feature is enabled
    /// </summary>
    Task<bool> IsMessagingEnabledAsync();

    /// <summary>
    /// Check if social wall feature is enabled
    /// </summary>
    Task<bool> IsSocialWallEnabledAsync();

    /// <summary>
    /// Invalidates the feature flag cache for a specific company.
    /// Call this when company settings are updated.
    /// </summary>
    /// <param name="companyId">The company ID to invalidate cache for</param>
    void InvalidateCache(int companyId);

    /// <summary>
    /// Clears all feature flag caches. Use with caution.
    /// </summary>
    void ClearAllCaches();
}
