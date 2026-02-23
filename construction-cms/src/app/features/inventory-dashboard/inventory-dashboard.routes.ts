import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const inventoryRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./inventory-layout.component').then(m => m.InventoryLayoutComponent),
        canActivate: [roleGuard],
        data: { roles: ['InventoryOwner'] },
        children: [
            {
                path: 'overview',
                loadComponent: () => import('./pages/inventory-overview/inventory-overview.component').then(m => m.InventoryOverviewComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./pages/my-products/my-products.component').then(m => m.MyProductsComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./pages/incoming-orders/incoming-orders.component').then(m => m.IncomingOrdersComponent)
            },
            {
                path: 'sales',
                loadComponent: () => import('./pages/sales-log/sales-log.component').then(m => m.SalesLogComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/store-settings/store-settings.component').then(m => m.StoreSettingsComponent)
            },
            // HR Routes
            {
                path: 'staff',
                loadComponent: () => import('./pages/staff-management/staff-management.component').then(m => m.StaffManagementComponent)
            },
            {
                path: 'join-requests',
                loadComponent: () => import('./pages/join-requests/join-requests.component').then(m => m.JoinRequestsComponent)
            },
            {
                path: 'attendance',
                loadComponent: () => import('./pages/attendance-tracking/attendance-tracking.component').then(m => m.AttendanceTrackingComponent)
            },
            // Reports Routes
            {
                path: 'sales-reports',
                loadComponent: () => import('./pages/sales-reports/sales-reports.component').then(m => m.SalesReportsComponent)
            },
            {
                path: 'inventory-reports',
                loadComponent: () => import('./pages/inventory-reports/inventory-reports.component').then(m => m.InventoryReportsComponent)
            },
            {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
            }
        ]
    }
];
