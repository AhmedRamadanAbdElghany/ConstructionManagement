import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Order {
    id: number;
    vendorId: number;
    vendorName: string;
    status: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryAddress: string;
    createdAt: string;
    items: OrderItem[];
}

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    unit: string | null;
}

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    template: `
    <div class="orders-page">
      <!-- Header -->
      <div class="page-header">
        <h1>{{ 'MARKETPLACE.MY_ORDERS' | translate }}</h1>
        <div class="breadcrumb">
          <a [routerLink]="['/marketplace']">{{ 'MARKETPLACE.HOME' | translate }}</a>
          <span>/</span>
          <span>{{ 'MARKETPLACE.ORDERS' | translate }}</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button [class.active]="currentFilter() === 'all'" (click)="filterOrders('all')">
          {{ 'MARKETPLACE.ALL_ORDERS' | translate }}
        </button>
        <button [class.active]="currentFilter() === 'pending'" (click)="filterOrders('pending')">
          {{ 'MARKETPLACE.PENDING' | translate }}
        </button>
        <button [class.active]="currentFilter() === 'processing'" (click)="filterOrders('processing')">
          {{ 'MARKETPLACE.PROCESSING' | translate }}
        </button>
        <button [class.active]="currentFilter() === 'delivered'" (click)="filterOrders('delivered')">
          {{ 'MARKETPLACE.DELIVERED' | translate }}
        </button>
        <button [class.active]="currentFilter() === 'cancelled'" (click)="filterOrders('cancelled')">
          {{ 'MARKETPLACE.CANCELLED' | translate }}
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <i class="pi pi-spinner pi-spin"></i>
          <p>{{ 'MARKETPLACE.LOADING' | translate }}</p>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && orders().length === 0) {
        <div class="empty-state">
          <i class="pi pi-shopping-bag"></i>
          <h2>{{ 'MARKETPLACE.NO_ORDERS' | translate }}</h2>
          <p>{{ 'MARKETPLACE.NO_ORDERS_MSG' | translate }}</p>
          <a [routerLink]="['/marketplace/products']" class="shop-btn">
            {{ 'MARKETPLACE.START_SHOPPING' | translate }}
          </a>
        </div>
      }

      <!-- Orders List -->
      @if (!loading() && orders().length > 0) {
        <div class="orders-list">
          @for (order of filteredOrders(); track order.id) {
            <div class="order-card" (click)="viewOrder(order.id)">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-id">#{{ order.id }}</span>
                  <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <div class="order-status" [class]="getStatusClass(order.status)">
                  {{ getStatusLabel(order.status) }}
                </div>
              </div>
              
              <div class="order-vendor">
                <i class="pi pi-building"></i>
                <span>{{ order.vendorName }}</span>
              </div>

              <div class="order-items-preview">
                @for (item of order.items.slice(0, 3); track item.productId) {
                  <span class="item-preview">
                    {{ item.productName }} × {{ item.quantity }}
                  </span>
                }
                @if (order.items.length > 3) {
                  <span class="more-items">+{{ order.items.length - 3 }} {{ 'MARKETPLACE.MORE_ITEMS' | translate }}</span>
                }
              </div>

              <div class="order-footer">
                <div class="order-total">
                  <span class="label">{{ 'MARKETPLACE.TOTAL' | translate }}:</span>
                  <span class="value">{{ order.totalAmount | currency:'EGP':'symbol':'1.0-2' }}</span>
                </div>
                <div class="order-actions">
                  @if (order.status === 'pending' || order.status === 'processing') {
                    <button class="cancel-btn" (click)="cancelOrder(order.id); $event.stopPropagation()">
                      <i class="pi pi-times"></i>
                      {{ 'MARKETPLACE.CANCEL' | translate }}
                    </button>
                  }
                  <button class="view-btn">
                    <i class="pi pi-eye"></i>
                    {{ 'MARKETPLACE.VIEW_DETAILS' | translate }}
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .orders-page {
      min-height: 100vh;
      background: #f9fafb;
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      color: #1e3a5f;
      margin-bottom: 0.5rem;
    }

    .breadcrumb {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .breadcrumb a {
      color: #f59e0b;
      text-decoration: none;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-tabs button {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.3s;
    }

    .filter-tabs button:hover {
      border-color: #f59e0b;
      color: #f59e0b;
    }

    .filter-tabs button.active {
      background: #f59e0b;
      border-color: #f59e0b;
      color: white;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 40vh;
      background: white;
      border-radius: 16px;
    }

    .loading-state i, .empty-state i {
      font-size: 3rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .empty-state h2 {
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .shop-btn {
      padding: 0.75rem 2rem;
      background: #f59e0b;
      color: white;
      text-decoration: none;
      border-radius: 8px;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: box-shadow 0.3s;
    }

    .order-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .order-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .order-id {
      font-weight: 600;
      color: #1e3a5f;
    }

    .order-date {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .order-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .order-status.pending {
      background: #fef3c7;
      color: #d97706;
    }

    .order-status.processing {
      background: #dbeafe;
      color: #2563eb;
    }

    .order-status.ready {
      background: #d1fae5;
      color: #059669;
    }

    .order-status.delivered {
      background: #d1fae5;
      color: #059669;
    }

    .order-status.cancelled {
      background: #fee2e2;
      color: #dc2626;
    }

    .order-vendor {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #6b7280;
    }

    .order-vendor i {
      color: #f59e0b;
    }

    .order-items-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .item-preview {
      font-size: 0.85rem;
      background: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
    }

    .more-items {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .order-total .label {
      color: #6b7280;
      margin-right: 0.5rem;
    }

    .order-total .value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a5f;
    }

    .order-actions {
      display: flex;
      gap: 0.5rem;
    }

    .cancel-btn, .view-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cancel-btn {
      background: transparent;
      border: 1px solid #ef4444;
      color: #ef4444;
    }

    .cancel-btn:hover {
      background: #fee2e2;
    }

    .view-btn {
      background: #1e3a5f;
      border: none;
      color: white;
    }

    .view-btn:hover {
      background: #2d5a87;
    }

    @media (max-width: 768px) {
      .order-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .order-actions {
        width: 100%;
      }

      .cancel-btn, .view-btn {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
    private http = inject(HttpClient);
    private router = inject(Router);
    protected translate = inject(TranslateService);

    loading = signal(true);
    orders = signal<Order[]>([]);
    currentFilter = signal<string>('all');

    private get apiUrl(): string {
        return (window as any).__API_URL__ || 'https://localhost:7001/api';
    }

    ngOnInit(): void {
        this.loadOrders();
    }

    private loadOrders(): void {
        this.loading.set(true);

        this.http.get<Order[]>(`${this.apiUrl}/marketplace/orders/my-orders`).subscribe({
            next: (orders) => {
                this.orders.set(orders || []);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading orders:', error);
                this.loading.set(false);
            }
        });
    }

    filteredOrders = signal<Order[]>([]);

    filterOrders(filter: string): void {
        this.currentFilter.set(filter);
        if (filter === 'all') {
            this.filteredOrders.set(this.orders());
        } else {
            this.filteredOrders.set(this.orders().filter(o => o.status.toLowerCase() === filter));
        }
    }

    viewOrder(orderId: number): void {
        this.router.navigate(['/marketplace/orders', orderId]);
    }

    cancelOrder(orderId: number): void {
        if (confirm('Are you sure you want to cancel this order?')) {
            this.http.post(`${this.apiUrl}/marketplace/orders/${orderId}/cancel`, {}).subscribe({
                next: () => {
                    this.loadOrders();
                },
                error: (error) => {
                    console.error('Error cancelling order:', error);
                    alert('Failed to cancel order. Please try again.');
                }
            });
        }
    }

    getStatusClass(status: string): string {
        return status.toLowerCase();
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'pending': 'MARKETPLACE.STATUS_PENDING',
            'processing': 'MARKETPLACE.STATUS_PROCESSING',
            'ready': 'MARKETPLACE.STATUS_READY',
            'delivered': 'MARKETPLACE.STATUS_DELIVERED',
            'cancelled': 'MARKETPLACE.STATUS_CANCELLED'
        };
        return labels[status.toLowerCase()] || status;
    }
}
