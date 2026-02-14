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
            {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
            }
        ]
    }
];
