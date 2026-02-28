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
    <div class="orders-page-premium">
      <!-- Premium Header -->
      <div class="page-header-premium">
        <div class="header-main">
          <div class="header-icon">
            <i class="pi pi-shopping-bag"></i>
            <div class="icon-pulse"></div>
          </div>
          <div class="header-text">
            <h1>{{ 'MARKETPLACE.MY_ORDERS' | translate }}</h1>
            <p>{{ 'MARKETPLACE.MANAGE_ORDERS_SUBTITLE' | translate }}</p>
          </div>
        </div>
      </div>

      <div class="premium-shell">
        <!-- Filter Bar Glass -->
        <div class="filter-bar-glass">
            <div class="filter-scroll">
                <button [class.active]="currentFilter() === 'all'" (click)="filterOrders('all')">
                    <i class="pi pi-list"></i>
                    <span>{{ 'MARKETPLACE.ALL_ORDERS' | translate }}</span>
                </button>
                <button [class.active]="currentFilter() === 'pending'" (click)="filterOrders('pending')">
                    <i class="pi pi-clock"></i>
                    <span>{{ 'MARKETPLACE.PENDING' | translate }}</span>
                </button>
                <button [class.active]="currentFilter() === 'processing'" (click)="filterOrders('processing')">
                    <i class="pi pi-cog pi-spin"></i>
                    <span>{{ 'MARKETPLACE.PROCESSING' | translate }}</span>
                </button>
                <button [class.active]="currentFilter() === 'delivered'" (click)="filterOrders('delivered')">
                    <i class="pi pi-check-circle"></i>
                    <span>{{ 'MARKETPLACE.DELIVERED' | translate }}</span>
                </button>
                <button [class.active]="currentFilter() === 'cancelled'" (click)="filterOrders('cancelled')">
                    <i class="pi pi-times-circle"></i>
                    <span>{{ 'MARKETPLACE.CANCELLED' | translate }}</span>
                </button>
            </div>
        </div>

        <!-- States -->
        <div class="status-containers">
            @if (loading()) {
              <div class="state-placeholder animate-pulse">
                <div class="spinner-premium"></div>
                <h2>{{ 'MARKETPLACE.LOADING' | translate }}</h2>
                <p>Retrieving your material orders...</p>
              </div>
            }

            @if (!loading() && filteredOrders().length === 0) {
              <div class="state-placeholder glass-state">
                <div class="state-icon"><i class="pi pi-shopping-bag"></i></div>
                <h2>{{ 'MARKETPLACE.NO_ORDERS' | translate }}</h2>
                <p>{{ 'MARKETPLACE.NO_ORDERS_MSG' | translate }}</p>
                <a [routerLink]="['/marketplace']" class="premium-action-btn">
                    <span>{{ 'MARKETPLACE.START_SHOPPING' | translate }}</span>
                    <i class="pi pi-shopping-cart"></i>
                </a>
              </div>
            }
        </div>

        <!-- Orders Grid -->
        @if (!loading() && filteredOrders().length > 0) {
          <div class="orders-grid-premium">
            @for (order of filteredOrders(); track order.id) {
              <div class="order-glass-card group" (click)="viewOrder(order.id)">
                <div class="card-glow"></div>
                
                <div class="card-top">
                  <div class="order-id-box">
                    <span class="id-tag">#{{ order.id }}</span>
                    <span class="date-tag">{{ order.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <div class="status-pill" [class]="getStatusClass(order.status)">
                    <div class="status-dot"></div>
                    <span>{{ getStatusLabel(order.status) }}</span>
                  </div>
                </div>

                <div class="vendor-box-premium">
                   <div class="box-icon">
                     <i class="pi pi-building"></i>
                   </div>
                   <div class="box-info">
                     <h4>{{ order.vendorName }}</h4>
                     <p>{{ order.deliveryAddress }}</p>
                   </div>
                </div>

                <div class="items-preview-premium">
                    <div class="preview-header">
                        <i class="pi pi-box"></i>
                        <span>{{ 'MARKETPLACE.ORDER_ITEMS' | translate }}</span>
                    </div>
                    <div class="items-list">
                        @for (item of order.items.slice(0, 2); track item.productId) {
                        <div class="preview-item">
                            <span class="name">{{ item.productName }}</span>
                            <span class="qty">× {{ item.quantity }}</span>
                        </div>
                        }
                        @if (order.items.length > 2) {
                        <div class="more-items-pill">
                            +{{ order.items.length - 2 }} {{ 'MARKETPLACE.MORE_ITEMS' | translate }}
                        </div>
                        }
                    </div>
                </div>

                <div class="card-footer-premium">
                    <div class="total-box">
                        <span class="label">{{ 'MARKETPLACE.TOTAL' | translate }}</span>
                        <span class="value">{{ order.totalAmount | currency:'EGP':'symbol':'1.0-2' }}</span>
                    </div>
                    <div class="actions">
                        @if (order.status === 'pending' || order.status === 'processing') {
                        <button class="cancel-action-btn" (click)="cancelOrder(order.id); $event.stopPropagation()">
                            <i class="pi pi-times"></i>
                        </button>
                        }
                        <button class="details-action-btn">
                            <i class="pi pi-chevron-right"></i>
                        </button>
                    </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .orders-page-premium {
      min-height: 100vh;
      background: var(--app-bg);
      color: var(--app-text);
      padding-bottom: 6rem;
      transition: all 0.3s ease;
    }

    .premium-shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Header */
    .page-header-premium {
      background: linear-gradient(to bottom, var(--card-bg), var(--app-bg));
      padding: 4rem 2rem;
      margin-bottom: -60px;
      text-align: center;
    }

    .header-main {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .header-icon {
      width: 72px;
      height: 72px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.25rem;
      color: var(--accent-amber);
      position: relative;
    }

    .icon-pulse {
      position: absolute;
      inset: -8px;
      background: var(--accent-amber);
      border-radius: 22px;
      opacity: 0.1;
      animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.1; }
      50% { transform: scale(1.15); opacity: 0.2; }
    }

    .header-text h1 {
      font-size: 3rem;
      font-weight: 950;
      letter-spacing: -0.04em;
      margin-bottom: 0.5rem;
      color: var(--app-text);
    }

    :host-context(.dark) .header-text h1 {
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-text p {
      color: var(--muted-text);
      font-size: 1.1rem;
      font-weight: 500;
    }

    /* Filter Bar */
    .filter-bar-glass {
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 8px;
      margin-bottom: 4rem;
      position: relative;
      z-index: 20;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }

    .filter-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .filter-scroll::-webkit-scrollbar { display: none; }

    .filter-scroll button {
      flex: 1;
      min-width: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 14px 20px;
      border-radius: 18px;
      border: none;
      background: transparent;
      color: var(--muted-text);
      font-weight: 800;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }

    .filter-scroll button i { font-size: 1.1rem; opacity: 0.6; transition: all 0.3s ease; }

    .filter-scroll button:hover:not(.active) {
      background: var(--input-bg);
      color: var(--app-text);
      transform: translateY(-1px);
    }

    .filter-scroll button.active {
      background: var(--card-bg);
      color: var(--accent-amber);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--glass-border);
    }

    .filter-scroll button.active i { opacity: 1; transform: scale(1.1); }

    /* States */
    .status-containers { margin-top: 5rem; }

    .state-placeholder {
      text-align: center;
      padding: 6rem 4rem;
      background: var(--glass-bg);
      border-radius: 48px;
      border: 2px dashed var(--glass-border);
      backdrop-filter: blur(10px);
    }

    .spinner-premium {
      width: 56px;
      height: 56px;
      border: 4px solid var(--glass-border);
      border-top-color: var(--accent-amber);
      border-radius: 50%;
      margin: 0 auto 2rem;
      animation: spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .premium-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 1.25rem;
      padding: 18px 48px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      border: none;
      border-radius: 22px;
      font-size: 1.1rem;
      font-weight: 900;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 20px 40px rgba(245, 158, 11, 0.3);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      margin-top: 2.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .premium-action-btn:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 30px 60px rgba(245, 158, 11, 0.4);
      filter: brightness(1.1);
    }

    /* Grid */
    .orders-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2.5rem;
    }

    .order-glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 2.25rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    }

    .order-glass-card:hover {
      background: var(--card-bg);
      border-color: var(--accent-amber);
      transform: translateY(-10px);
      box-shadow: 0 30px 60px rgba(0,0,0,0.08);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .order-id-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .id-tag {
      font-size: 1.4rem;
      font-weight: 950;
      color: var(--app-text);
      letter-spacing: -0.04em;
    }

    .date-tag {
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--muted-text);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .status-dot { width: 8px; height: 8px; border-radius: 50%; }

    .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .status-pill.pending .status-dot { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }

    .status-pill.processing { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
    .status-pill.processing .status-dot { background: #0ea5e9; box-shadow: 0 0 10px #0ea5e9; }

    .status-pill.delivered { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .status-pill.delivered .status-dot { background: #10b981; box-shadow: 0 0 10px #10b981; }

    .status-pill.cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .status-pill.cancelled .status-dot { background: #ef4444; box-shadow: 0 0 10px #ef4444; }

    .vendor-box-premium {
      display: flex;
      gap: 1.5rem;
      background: var(--input-bg);
      padding: 1.5rem;
      border-radius: 24px;
      margin-bottom: 1.75rem;
      border: 1px solid var(--glass-border);
      transition: all 0.3s ease;
    }

    .order-glass-card:hover .vendor-box-premium {
      background: var(--card-bg);
      border-color: rgba(245, 158, 11, 0.1);
    }

    .box-icon {
      width: 52px;
      height: 52px;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-amber);
      font-size: 1.5rem;
      transition: all 0.3s ease;
    }

    .order-glass-card:hover .box-icon {
      background: var(--accent-amber);
      color: white;
      border-color: transparent;
      transform: rotate(-5deg) scale(1.1);
    }

    .box-info h4 {
      font-size: 1.1rem;
      font-weight: 900;
      color: var(--app-text);
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }

    .box-info p {
      font-size: 0.85rem;
      color: var(--muted-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
      font-weight: 500;
    }

    .items-preview-premium {
      margin-bottom: 2.5rem;
      padding: 0 0.5rem;
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.75rem;
      font-weight: 850;
      color: var(--muted-text);
      text-transform: uppercase;
      margin-bottom: 1.25rem;
      letter-spacing: 0.1em;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      color: var(--app-text);
      font-weight: 600;
    }

    .preview-item .qty { color: var(--accent-amber); font-weight: 900; }

    .more-items-pill {
      margin-top: 8px;
      font-size: 0.8rem;
      color: var(--muted-text);
      font-weight: 800;
      background: var(--input-bg);
      padding: 4px 12px;
      border-radius: 8px;
      display: inline-block;
    }

    .card-footer-premium {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      border-top: 1px solid var(--glass-border);
    }

    .total-box {
      display: flex;
      flex-direction: column;
    }

    .total-box .label { font-size: 0.75rem; font-weight: 850; color: var(--muted-text); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .total-box .value { font-size: 1.5rem; font-weight: 950; color: var(--app-text); letter-spacing: -0.02em; }

    .card-footer-premium .actions {
      display: flex;
      gap: 1rem;
    }

    .cancel-action-btn {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cancel-action-btn:hover { background: #ef4444; color: white; transform: scale(1.1) rotate(90deg); box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3); border-color: transparent; }

    .details-action-btn {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      color: var(--app-text);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .order-glass-card:hover .details-action-btn { background: var(--accent-amber); border-color: transparent; color: white; transform: scale(1.1); box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3); }

    @media (max-width: 768px) {
      .premium-shell { padding: 0 1.5rem; }
      .orders-grid-premium { grid-template-columns: 1fr; }
      .header-text h1 { font-size: 2.25rem; }
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
    return (window as any).__API_URL__ || '/api';
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
