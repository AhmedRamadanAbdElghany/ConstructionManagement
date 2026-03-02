# Sidebar Permission-Based Access Control Plan

## Overview
This plan outlines implementing a permission-based system for the entire sidebar, allowing SystemAdmin to control which pages each role can access by assigning specific permissions.

## Current Implementation
We already have permissions for:
- `Location.Submit` - for workers to submit location (My Location page)
- `Geofence.Manage` - for managing geofences
- `Location.View` - for viewing location tracking reports

## Required Permissions

### Administration Section
| Menu Item | Permission Name | Description |
|-----------|----------------|-------------|
| Companies | `Companies.View` | View companies list |
| Messages | `Messages.View` | View messages |
| Social Wall | `SocialWall.View` | View social wall |
| Pending Requests | `HR.Requests` | View pending requests |
| HR Settings | `HR.Settings` | Manage HR settings |
| Projects | `Projects.View` | View projects |
| Inspections | `Inspections.View` | View inspections |
| Locations | `Locations.View` | View locations |
| Inventory | `Inventory.View` | View inventory |
| Equipment | `Equipment.View` | View equipment |
| Safety | `Safety.View` | View safety records |
| Subcontractors | `Subcontractors.View` | View subcontractors |
| Documents | `Documents.View` | View documents |
| Quality | `Quality.View` | View quality records |
| Analytics | `Analytics.View` | View analytics |
| Configurations | `Configurations.View` | View configurations |
| Finance | `Finance.View` | View finance |
| Location Tracking | `Location.View` | View location tracking (existing) |
| Geofencing | `Geofence.Manage` | Manage geofences (existing) |
| Leave Management | `Leave.Manage` | Manage leave |
| Performance | `Performance.View` | View performance |
| Training | `Training.View` | View training |
| Currencies | `Currencies.View` | View currencies |
| Payments | `Payments.View` | View payments |

### Operations Section
| Menu Item | Permission Name | Description |
|-----------|----------------|-------------|
| Tasks | `Tasks.View` | View tasks |
| Escalations | `Escalations.View` | View escalations |
| Daily Log | `DailyLog.View` | View daily log |
| My Location | `Location.Submit` | Submit location (existing) |
| Personal HR | `HR.Personal` | Personal HR |
| My Projects | `Projects.My` | View my projects |
| My Documents | `Documents.My` | View my documents |

### Implementation Steps

### Step 1: Add Permissions to Database
Update `ApplicationDbContext.cs` to add new permissions (IDs 102+):
- Add all permission entries in the seed data

### Step 2: Update Program.cs Authorization Policies
Add authorization policies for each permission:
```csharp
options.AddPolicy("CanViewCompanies", policy => policy.RequireAssertion(...));
options.AddPolicy("CanViewMessages", policy => policy.RequireAssertion(...));
// ... etc
```

### Step 3: Update Sidebar Component
Update `sidebar.component.ts`:
- Replace all role-based conditions with permission-based checks
- Keep SystemAdmin and CompanyAdmin bypass for admin features
- Use pattern: `authService.hasPermission('Permission.Name') || isAdmin`

### Step 4: Update Backend Controllers
For each feature endpoint, add appropriate authorization attributes:
```csharp
[Authorize(Policy = "CanViewCompanies")]
```

### Step 5: Add Translations
Add translation keys for permission names (optional, for display purposes)

## Sidebar Current Conditions (to be updated)

Current patterns to replace:
- `currentRole !== 'SystemAdmin'` → `authService.hasPermission(...) || isAdmin`
- `(isWorker && hasApprovedCompany())` → `authService.hasPermission(...)`

## Priority
1. First: Complete location permissions (already done)
2. Second: Add remaining administration section permissions
3. Third: Add operations section permissions
4. Fourth: Update all backend controllers

## Files to Modify
1. `src/ConstructionManagement.Infrastructure/Persistence/ApplicationDbContext.cs` - Add permissions
2. `src/ConstructionManagement.WebApi/Program.cs` - Add authorization policies
3. `construction-cms/src/app/layout/sidebar/sidebar.component.ts` - Update visibility conditions
4. Various controller files - Add authorization attributes
