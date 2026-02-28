# Company-Based Permission System Plan

## Overview
This plan outlines implementing a company-based permission system where:
1. **SuperAdmin** assigns specific permissions to each company when approving/configuring
2. **Company Admin** can see available permissions for their company
3. **Company Admin** can create custom roles and assign permissions to those roles

## Current State
- Global permissions exist (Location.Submit, Geofence.Manage, Location.View, etc.)
- These permissions are not tied to specific companies
- All users in a company see the same features

## Required Features

### 1. Company-Specific Permissions
- Permissions are assigned per company (not global)
- When SuperAdmin approves a company, they select which permissions that company can use
- Each company has its own set of allowed permissions

### 2. Permission Management for Companies
- Add UI for SuperAdmin to configure company permissions
- Add fields to Company entity to store allowed permissions
- Add interface for Company Admin to view available permissions

### 3. Role Management for Company Admin
- Company Admin can create custom roles within their company
- Each role can have a subset of the company's allowed permissions
- Users are assigned to roles

### 4. Implementation Components

#### Database Changes
- Add `CompanyPermissions` table or field to store company-specific permissions
- Existing permissions can be used as a reference

#### Backend Changes
- Add endpoints to manage company permissions (SuperAdmin)
- Add endpoints to manage roles within a company (CompanyAdmin)
- Update authorization to check company-specific permissions

#### Frontend Changes
- Add company permission configuration page (SuperAdmin)
- Add role management page (CompanyAdmin)
- Update sidebar to check company-specific permissions

## Permission Categories

### Core Features (Always Available)
- Dashboard
- Messages
- My Projects
- My Documents

### Configurable Features (Can be enabled per company)
| Feature | Permission Key |
|---------|---------------|
| Companies | `Feature.Companies` |
| HR Settings | `Feature.HR` |
| Projects | `Feature.Projects` |
| Inspections | `Feature.Inspections` |
| Locations | `Feature.Locations` |
| Inventory | `Feature.Inventory` |
| Equipment | `Feature.Equipment` |
| Safety | `Feature.Safety` |
| Subcontractors | `Feature.Subcontractors` |
| Documents | `Feature.Documents` |
| Quality | `Feature.Quality` |
| Analytics | `Feature.Analytics` |
| Configurations | `Feature.Configurations` |
| Finance | `Feature.Finance` |
| Leave Management | `Feature.Leave` |
| Performance | `Feature.Performance` |
| Training | `Feature.Training` |
| Currencies | `Feature.Currencies` |
| Payments | `Feature.Payments` |
| Geofencing | `Feature.Geofencing` |
| Location Tracking | `Feature.LocationTracking` |

## User Flow

### SuperAdmin Flow
1. Create or approve a new company
2. Configure which features/permissions the company can access
3. Save company configuration

### Company Admin Flow
1. Login and see only enabled features in sidebar
2. Go to Role Management
3. Create custom roles (e.g., "Project Manager", "Worker", "Accountant")
4. Assign permissions to each role
5. Assign users to roles

### User Flow
1. Login and see features based on their role's permissions
2. Can only access pages their role is permitted to use

## Technical Implementation

### Step 1: Add Feature Flags to Company
- Add `EnabledFeatures` field to Company entity (JSON or comma-separated)
- Or create `CompanyFeature` table

### Step 2: Update Authorization
- Check both user role AND company-enabled features
- SuperAdmin bypasses feature checks

### Step 3: Create Role Management UI
- Company Admin can create/edit/delete roles
- Assign permissions to roles from company's enabled features

### Step 4: Update Sidebar
- Check company feature flags
- Check role permissions

## Files to Modify

### Backend
- Company entity - add EnabledFeatures
- CompanyService - add feature configuration methods
- RoleService - add company-specific role management
- Authorization handlers - check company features

### Frontend
- Company configuration page (SuperAdmin)
- Role management page (CompanyAdmin)
- Sidebar - check company features

## Priority
1. Add feature flags to company
2. Update sidebar to check company features
3. Add role management for CompanyAdmin
4. Add SuperAdmin company configuration
