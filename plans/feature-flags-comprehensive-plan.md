# Feature Flags Comprehensive Plan

## Executive Summary

This document outlines a comprehensive plan to ensure ALL features in the Construction Management System have proper feature flags that can be controlled by SuperAdmin. The plan addresses inconsistencies between frontend and backend feature flag implementations, adds missing flags, and ensures proper enforcement at both the UI and API levels.

---

## Current State Analysis

### Existing Feature Flags in CompanySettings (Backend)

The following master switch flags exist in [`CompanySettings.cs`](src/ConstructionManagement.Domain/Entities/CompanySettings.cs):

```csharp
// MODULE MASTER SWITCHES (Lines 65-91)
EnableUserManagement = true
EnableProjectManagement = true
EnableProjectItemsManagement = true
EnableDailyLogs = true
EnableSiteMedia = true
EnableInventoryManagement = false
EnableEquipmentManagement = false
EnableQualityControl = false
EnableSafetyManagement = false
EnableSubcontractorManagement = false
EnableFinancialManagement = true
EnableAnalytics = true
EnableNotifications = true
EnableDocumentManagement = false
EnableDesignManagement = false
EnableClientPortal = false
EnableAccessControl = true
EnableHRManagement = false
EnableVendorManagement = false
EnableLocationTracking = false
EnableGeofenceManagement = false
EnableLocationSubmit = false
```

### Issues Identified

#### 1. Missing Feature Flags in CompanySettings

| Flag | Status | Where Referenced |
|------|--------|------------------|
| `EnableInspections` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnableLeaveManagement` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnablePerformanceEvaluation` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnableTrainingTracking` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnableMarketplace` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnableMessaging` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnableSocialWall` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnableTasks` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnableEscalations` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnableCurrencies` | **MISSING** | Referenced in sidebar but doesn't exist |
| `EnablePayments` | **MISSING** | Referenced in sidebar but doesn't exist |

#### 2. Incorrect Feature Flag Usage in Sidebar

The [`sidebar.component.ts`](construction-cms/src/app/layout/sidebar/sidebar.component.ts) has the following issues:

| Line | Current Check | Should Be |
|------|--------------|-----------|
| 127 | `settings?.allowHR` | `settings?.enableHRManagement` |
| 165 | `settings?.allowLocations` | `settings?.enableLocationTracking` |
| 151-161 | **NO CHECK** | Should check `EnableInspections` |
| 321 | `settings?.enableLeaveManagement` | Flag doesn't exist - add it |
| 334 | `settings?.enablePerformanceEvaluation` | Flag doesn't exist - add it |
| 347 | `settings?.enableTrainingTracking` | Flag doesn't exist - add it |

#### 3. Backend API Controllers Missing Feature Flag Checks

Most controllers do NOT check feature flags. The following need enforcement:

- [`InspectionsController.cs`](src/ConstructionManagement.WebApi/Controllers/InspectionsController.cs) - No check (should check `EnableInspections`)
- [`HRGapControllers.cs`](src/ConstructionManagement.WebApi/Controllers/HRGapControllers.cs) - No check (should check `EnableHRManagement`)
- [`LeaveManagementController.cs`](src/ConstructionManagement.WebApi/Controllers/LeaveManagementController.cs) - No check (should check `EnableLeaveManagement`)
- [`PerformanceEvaluationsController.cs`](src/ConstructionManagement.WebApi/Controllers/PerformanceEvaluationsController.cs) - No check (should check `EnablePerformanceEvaluation`)
- [`TrainingController.cs`](src/ConstructionManagement.WebApi/Controllers/TrainingController.cs) - No check (should check `EnableTrainingTracking`)
- [`MessagingController.cs`](src/ConstructionManagement.WebApi/Controllers/MessagingController.cs) - No check (should check `EnableMessaging`)
- [`SocialMediaController.cs`](src/ConstructionManagement.WebApi/Controllers/SocialMediaController.cs) - No check (should check `EnableSocialWall`)
- [`TasksController.cs`](src/ConstructionManagement.WebApi/Controllers/TasksController.cs) - No check (should check `EnableTasks`)
- [`EscalationsController.cs`](src/ConstructionManagement.WebApi/Controllers/EscalationsController.cs) - No check (should check `EnableEscalations`)
- [`CurrenciesController.cs`](src/ConstructionManagement.WebApi/Controllers/CurrenciesController.cs) - No check (should check `EnableCurrencies`)
- [`PaymentsController.cs`](src/ConstructionManagement.WebApi/Controllers/PaymentsController.cs) - No check (should check `EnablePayments`)
- [`MarketplaceController.cs`](src/ConstructionManagement.WebApi/Controllers/MarketplaceController.cs) - No check (should check `EnableMarketplace`)
- [`InventoryController.cs`](src/ConstructionManagement.WebApi/Controllers/InventoryController.cs) - No check (should check `EnableInventoryManagement`)
- [`EquipmentController.cs`](src/ConstructionManagement.WebApi/Controllers/EquipmentController.cs) - No check (should check `EnableEquipmentManagement`)
- [`SafetyController.cs`](src/ConstructionManagement.WebApi/Controllers/SafetyController.cs) - No check (should check `EnableSafetyManagement`)
- [`SubcontractorController.cs`](src/ConstructionManagement.WebApi/Controllers/SubcontractorController.cs) - No check (should check `EnableSubcontractorManagement`)
- [`DocumentController.cs`](src/ConstructionManagement.WebApi/Controllers/DocumentController.cs) - No check (should check `EnableDocumentManagement`)
- [`QualityController.cs`](src/ConstructionManagement.WebApi/Controllers/QualityController.cs) - No check (should check `EnableQualityControl`)
- [`GeofenceController.cs`](src/ConstructionManagement.WebApi/Controllers/GeofenceController.cs) - No check (should check `EnableGeofenceManagement`)
- [`LocationTrackingController.cs`](src/ConstructionManagement.WebApi/Controllers/LocationTrackingController.cs) - No check (should check `EnableLocationTracking`)

---

## Implementation Plan

### Phase 1: Add Missing Feature Flags to CompanySettings

#### 1.1 Update CompanySettings.cs

Add the following properties to [`CompanySettings.cs`](src/ConstructionManagement.Domain/Entities/CompanySettings.cs) after line 91:

```csharp
// Inspection Feature Flags
public bool EnableInspections { get; set; } = false;

// HR Feature Flags
public bool EnableLeaveManagement { get; set; } = false;
public bool EnablePerformanceEvaluation { get; set; } = false;
public bool EnableTrainingTracking { get; set; } = false;

// Operations Feature Flags
public bool EnableTasks { get; set; } = false;
public bool EnableEscalations { get; set; } = false;

// Communication Feature Flags
public bool EnableMessaging { get; set; } = false;
public bool EnableSocialWall { get; set; } = false;

// Finance Feature Flags
public bool EnableCurrencies { get; set; } = false;
public bool EnablePayments { get; set; } = false;

// Marketplace Feature Flags
public bool EnableMarketplace { get; set; } = false;
```

#### 1.2 Update UpdateCompanySettingsRequest.cs

Add the following properties to [`UpdateCompanySettingsRequest.cs`](src/ConstructionManagement.Application/DTOs/UpdateCompanySettingsRequest.cs) after line 36:

```csharp
// Inspection Feature Flags
public bool? EnableInspections { get; set; }

// HR Feature Flags
public bool? EnableLeaveManagement { get; set; }
public bool? EnablePerformanceEvaluation { get; set; }
public bool? EnableTrainingTracking { get; set; }

// Operations Feature Flags
public bool? EnableTasks { get; set; }
public bool? EnableEscalations { get; set; }

// Communication Feature Flags
public bool? EnableMessaging { get; set; }
public bool? EnableSocialWall { get; set; }

// Finance Feature Flags
public bool? EnableCurrencies { get; set; }
public bool? EnablePayments { get; set; }

// Marketplace Feature Flags
public bool? EnableMarketplace { get; set; }
```

#### 1.3 Update CompanySettingsController.cs

Update [`CompanySettingsController.cs`](src/ConstructionManagement.WebApi/Controllers/CompanySettingsController.cs) to include the new flags in the GET and PUT methods.

#### 1.4 Run Database Migration

Create a new EF Core migration to add the new columns to the CompanySettings table.

---

### Phase 2: Update Frontend Interfaces and Services

#### 2.1 Update CompanySettings Interface

Update [`interfaces.ts`](construction-cms/src/app/shared/interfaces.ts) to add the new feature flags:

```typescript
// Add after line 230
enableInspections?: boolean;
enableLeaveManagement?: boolean;
enablePerformanceEvaluation?: boolean;
enableTrainingTracking?: boolean;
enableTasks?: boolean;
enableEscalations?: boolean;
enableMessaging?: boolean;
enableSocialWall?: boolean;
enableCurrencies?: boolean;
enablePayments?: boolean;
enableMarketplace?: boolean;
```

#### 2.2 Update SettingsService

Update [`settings.service.ts`](construction-cms/src/app/core/services/settings.service.ts):

- Add the new flags to `UpdateCompanySettingsRequest` interface
- Ensure all flags are included in the default settings for SuperAdmin

---

### Phase 3: Update Sidebar Component

Update [`sidebar.component.ts`](construction-cms/src/app/layout/sidebar/sidebar.component.ts) to use the correct feature flags:

#### 3.1 Fix HR Flag (Line 127)

**Before:**
```typescript
@if (settings?.allowHR) {
```

**After:**
```typescript
@if (settings?.enableHRManagement) {
```

#### 3.2 Fix Locations Flag (Line 165)

**Before:**
```typescript
@if (settings?.allowLocations) {
```

**After:**
```typescript
@if (settings?.enableLocationTracking) {
```

#### 3.3 Add Inspections Flag (Line 151-161)

**Before:**
```typescript
<!-- Inspections -->
<a routerLink="/admin/inspections" 
   routerLinkActive="nav-active"
   class="nav-item group">
```

**After:**
```typescript
@if (settings?.enableInspections) {
  <!-- Inspections -->
  <a routerLink="/admin/inspections" 
     routerLinkActive="nav-active"
     class="nav-item group">
```

**Add closing tag after line 161:**
```typescript
  </a>
}
```

#### 3.4 Add Missing Feature Flag Checks

Add the following checks for the new flags throughout the sidebar:

| Feature | Location | Flag to Add |
|---------|----------|-------------|
| Leave Management | Line 321 | `settings?.enableLeaveManagement` (already exists but flag now exists) |
| Performance | Line 334 | `settings?.enablePerformanceEvaluation` (already exists but flag now exists) |
| Training | Line 347 | `settings?.enableTrainingTracking` (already exists but flag now exists) |
| Tasks | Add after line 430 | `settings?.enableTasks` |
| Escalations | Add after line 412 | `settings?.enableEscalations` |
| Messages | Add after line 86 | `settings?.enableMessaging` |
| Social Wall | Add after line 98 | `settings?.enableSocialWall` |
| Currencies | Add after line 369 | `settings?.enableCurrencies` |
| Payments | Add after line 383 | `settings?.enablePayments` |
| Marketplace | Add new section | `settings?.enableMarketplace` |

---

### Phase 4: Backend API Feature Flag Enforcement

Create a reusable service/filter to check feature flags and apply to all controllers.

#### 4.1 Create FeatureFlagHelper Service

Create a new service that can be injected into controllers:

```csharp
public interface IFeatureFlagService
{
    bool IsFeatureEnabled(int companyId, string featureFlag);
    Task<bool> IsFeatureEnabledAsync(int companyId, string featureFlag);
}

public class FeatureFlagService : IFeatureFlagService
{
    private readonly ICompanySettingsService _settingsService;
    
    public bool IsFeatureEnabled(int companyId, string featureFlag)
    {
        var settings = _settingsService.GetCompanySettings(companyId);
        var property = typeof(CompanySettings).GetProperty(featureFlag);
        return (bool)(property?.GetValue(settings) ?? false);
    }
}
```

#### 4.2 Add Feature Flag Checks to Controllers

Add checks at the beginning of each controller action. Example for InspectionsController:

```csharp
[Authorize]
public class InspectionsController : ControllerBase
{
    private readonly IInspectionService _inspectionService;
    private readonly IFeatureFlagService _featureFlags;

    [HttpGet]
    public async Task<IActionResult> GetInspections()
    {
        var companyId = GetCompanyId();
        
        if (!_featureFlags.IsFeatureEnabled(companyId, nameof(CompanySettings.EnableInspections)))
        {
            return Forbid();
        }
        
        // ... existing code
    }
}
```

#### 4.3 Alternative: Create Action Filter

Create a custom action filter for cleaner implementation:

```csharp
public class RequireFeatureFlagAttribute : ActionFilterAttribute
{
    public string FeatureFlag { get; }
    
    public RequireFeatureFlagAttribute(string featureFlag)
    {
        FeatureFlag = featureFlag;
    }
    
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        // Check feature flag
        // Return 403 if disabled
    }
}

// Usage:
[HttpGet]
[RequireFeatureFlag(nameof(CompanySettings.EnableInspections))]
public async Task<IActionResult> GetInspections() { }
```

---

### Phase 5: Verification Checklist

After implementation, verify the following:

- [ ] All sidebar menu items check proper feature flags
- [ ] SuperAdmin can see all features regardless of settings
- [ ] CompanyAdmin sees only enabled features
- [ ] Backend API returns 403 for disabled features
- [ ] Feature flags persist in database
- [ ] Default values work correctly for new companies

---

## Implementation Priority

| Priority | Item | Effort |
|----------|------|--------|
| 1 | Add missing flags to CompanySettings | Medium |
| 2 | Update sidebar to use correct flags | Low |
| 3 | Update frontend interfaces | Low |
| 4 | Create backend feature flag service | Medium |
| 5 | Add API checks to controllers | High |
| 6 | Database migration | Low |

---

## Notes

- The `allowHR` and `allowLocations` flags in the sidebar are legacy flags from ProjectSettings - these should be phased out in favor of the CompanySettings flags
- SuperAdmin should always see all features regardless of company settings
- Feature flags should default to `false` for new companies to maintain a clean onboarding experience
- Consider adding a "Enable All Features" option for demo/testing purposes
