import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
    // Default redirect
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },

    // Dashboard - Available to all authenticated users
    {
        path: 'dashboard',
        loadComponent: () => import('./features/common/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },

    // Notifications
    {
        path: 'notifications',
        loadComponent: () => import('./features/common/notifications/notifications.component').then(m => m.NotificationsComponent)
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

    // Client Routes
    {
        path: 'client',
        children: [
            {
                path: 'projects',
                loadComponent: () => import('./features/client/client-projects/client-projects.component').then(m => m.ClientProjectsComponent),
                canActivate: [roleGuard],
                data: { roles: ['NormalUser'] }
            }
        ]
    },

    // Fallback
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
