import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
    // Auth Routes (available without authentication)
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },

    // Default redirect
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },

    // Dashboard - Available to all authenticated users
    {
        path: 'dashboard',
        loadComponent: () => import('./features/common/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard]
    },

    // Profile
    {
        path: 'profile',
        loadComponent: () => import('./features/common/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [roleGuard]
    },

    // Notifications
    {
        path: 'notifications',
        loadComponent: () => import('./features/common/notifications/notifications.component').then(m => m.NotificationsComponent),
        canActivate: [roleGuard]
    },

    // Browse Firms (for users not yet in a company)
    {
        path: 'browse-firms',
        loadComponent: () => import('./features/common/browse-firms/browse-firms.component').then(m => m.BrowseFirmsComponent),
        canActivate: [roleGuard]
    },

    // Warehouse Partner Routes
    {
        path: 'warehouse-partner',
        children: [
            {
                path: 'nearby-search',
                loadComponent: () => import('./features/common/warehouse-partner/nearby-search.component').then(m => m.NearbySearchComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin', 'CompanyUser', 'WarehouseOwner'] }
            },
            {
                path: 'create-order',
                loadComponent: () => import('./features/common/warehouse-partner/create-order.component').then(m => m.CreateOrderComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin', 'CompanyUser'] }
            },
            {
                path: 'barcode-scanner',
                loadComponent: () => import('./features/common/warehouse-partner/barcode-scanner.component').then(m => m.BarcodeScannerComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin', 'CompanyUser', 'WarehouseOwner'] }
            },
            {
                path: '',
                redirectTo: 'nearby-search',
                pathMatch: 'full'
            }
        ]
    },

    // Admin Routes
    {
        path: 'admin',
        children: [
            {
                path: 'companies',
                loadComponent: () => import('./features/admin/companies/companies.component').then(m => m.CompaniesComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin'] }
            },
            {
                path: 'pending-requests',
                loadComponent: () => import('./features/admin/pending-requests/pending-requests.component').then(m => m.PendingRequestsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'companies/:id',
                loadComponent: () => import('./features/admin/companies/company-detail/company-detail.component').then(m => m.CompanyDetailComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin'] }
            },
            {
                path: 'hr',
                loadComponent: () => import('./features/admin/hr/hr.component').then(m => m.HrComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'projects',
                loadComponent: () => import('./features/admin/projects/projects.component').then(m => m.ProjectsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'projects/:id',
                loadComponent: () => import('./features/admin/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'locations',
                loadComponent: () => import('./features/admin/locations/locations.component').then(m => m.LocationsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'company-settings',
                loadComponent: () => import('./features/admin/company-settings/company-settings.component').then(m => m.CompanySettingsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'project-hierarchy',
                loadComponent: () => import('./features/admin/project-hierarchy/project-hierarchy.component').then(m => m.ProjectHierarchyComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'access-control/permissions',
                loadComponent: () => import('./features/admin/access-control/permissions/permissions.component').then(m => m.PermissionsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin'] }
            },
            {
                path: 'access-control/roles',
                loadComponent: () => import('./features/admin/access-control/roles/roles.component').then(m => m.RolesComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'vendors',
                loadComponent: () => import('./features/admin/vendors/vendors.component').then(m => m.VendorsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'inventory',
                loadComponent: () => import('./features/admin/inventory/inventory.component').then(m => m.InventoryComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'equipment',
                loadComponent: () => import('./features/admin/equipment/equipment-list.component').then(m => m.EquipmentListComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'safety',
                loadComponent: () => import('./features/admin/safety/safety.component').then(m => m.SafetyComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'subcontractors',
                loadComponent: () => import('./features/admin/subcontractor/subcontractor.component').then(m => m.SubcontractorComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'analytics',
                loadComponent: () => import('./features/admin/analytics/analytics.component').then(m => m.AnalyticsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'documents',
                loadComponent: () => import('./features/admin/documents/documents.component').then(m => m.DocumentsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'quality',
                loadComponent: () => import('./features/admin/quality/quality.component').then(m => m.QualityComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'quality/inspections',
                loadComponent: () => import('./features/admin/quality/quality-inspections.component').then(m => m.QualityInspectionsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'quality/defects',
                loadComponent: () => import('./features/admin/quality/quality-defects.component').then(m => m.QualityDefectsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'quality/punchlist',
                loadComponent: () => import('./features/admin/quality/quality-punchlist.component').then(m => m.QualityPunchlistComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'safety/inspections',
                loadComponent: () => import('./features/admin/safety/safety-inspections.component').then(m => m.SafetyInspectionsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'safety/incidents',
                loadComponent: () => import('./features/admin/safety/safety-incidents.component').then(m => m.SafetyIncidentsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'safety/training',
                loadComponent: () => import('./features/admin/safety/safety-training.component').then(m => m.SafetyTrainingComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'analytics/profitability',
                loadComponent: () => import('./features/admin/analytics/profitability-dashboard.component').then(m => m.ProfitabilityDashboardComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'analytics/reports',
                loadComponent: () => import('./features/admin/analytics/reports-generation.component').then(m => m.ReportsGenerationComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'analytics/advanced',
                loadComponent: () => import('./features/admin/analytics/advanced-analytics.component').then(m => m.AdvancedAnalyticsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'equipment/:id',
                loadComponent: () => import('./features/admin/equipment/equipment-detail.component').then(m => m.EquipmentDetailComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'equipment/assignments',
                loadComponent: () => import('./features/admin/equipment/equipment-assignments.component').then(m => m.EquipmentAssignmentsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'inventory/transactions',
                loadComponent: () => import('./features/admin/inventory/inventory-transactions.component').then(m => m.InventoryTransactionsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'subcontractors/:id',
                loadComponent: () => import('./features/admin/subcontractor/subcontractor-detail/subcontractor-detail.component').then(m => m.SubcontractorDetailComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'subcontractors/contracts',
                loadComponent: () => import('./features/admin/subcontractor/subcontractor-contracts/subcontractor-contracts.component').then(m => m.SubcontractorContractsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'subcontractors/payments',
                loadComponent: () => import('./features/admin/subcontractor/subcontractor-payments/subcontractor-payments.component').then(m => m.SubcontractorPaymentsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'subcontractors/ratings',
                loadComponent: () => import('./features/admin/subcontractor/subcontractor-ratings/subcontractor-ratings.component').then(m => m.SubcontractorRatingsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            },
            {
                path: 'projects/:id/settings',
                loadComponent: () => import('./features/admin/projects/project-settings/project-settings.component').then(m => m.ProjectSettingsComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin'] }
            }
        ]
    },

    // Worker Routes
    {
        path: 'worker',
        children: [
            {
                path: 'daily-log',
                loadComponent: () => import('./features/worker/daily-log/daily-log.component').then(m => m.DailyLogComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin', 'CompanyUser'] }
            },
            {
                path: 'personal-hr',
                loadComponent: () => import('./features/worker/personal-hr/personal-hr.component').then(m => m.PersonalHrComponent),
                canActivate: [roleGuard],
                data: { roles: ['SuperAdmin', 'CompanyAdmin', 'CompanyUser'] }
            }
        ]
    },

    // Client Portal Routes
    {
        path: 'client-portal',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/client/client-portal/client-login.component').then(m => m.ClientLoginComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'projects',
                loadComponent: () => import('./features/client/client-projects/client-projects.component').then(m => m.ClientProjectsComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'projects/:id/progress',
                loadComponent: () => import('./features/client/client-projects/client-projects.component').then(m => m.ClientProjectsComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'payments',
                loadComponent: () => import('./features/client/reports/client-reports.component').then(m => m.ClientReportsComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'messages',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'messages/new',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'messages/:id',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'change-orders',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'change-orders/new',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'change-orders/:id',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'documents',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'activities',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/client/client-portal/client-dashboard.component').then(m => m.ClientDashboardComponent),
                canActivate: [roleGuard]
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },

    // Fallback
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
