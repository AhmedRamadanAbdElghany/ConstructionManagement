import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const marketplaceRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/marketplace-home/marketplace-home.component').then(m => m.MarketplaceHomeComponent),
        canActivate: [roleGuard]
    },
    {
        path: 'products',
        loadComponent: () => import('./pages/marketplace-products/marketplace-products.component').then(m => m.MarketplaceProductsComponent),
        canActivate: [roleGuard]
    },
    {
        path: 'products/:id',
        loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        canActivate: [roleGuard]
    },
    {
        path: 'vendors/:id',
        loadComponent: () => import('./pages/vendor-profile/vendor-profile.component').then(m => m.VendorProfileComponent),
        canActivate: [roleGuard]
    },
    {
        path: 'cart',
        loadComponent: () => import('./pages/shopping-cart/shopping-cart.component').then(m => m.ShoppingCartComponent),
        canActivate: [roleGuard]
    },
    {
        path: 'orders',
        loadComponent: () => import('./pages/my-orders/my-orders.component').then(m => m.MyOrdersComponent),
        canActivate: [roleGuard]
    },
    {
        path: 'orders/:id',
        loadComponent: () => import('./pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
        canActivate: [roleGuard]
    },
    {
        path: 'nearby',
        loadComponent: () => import('./pages/nearby-vendors/nearby-vendors.component').then(m => m.NearbyVendorsComponent),
        canActivate: [roleGuard]
    }
];
