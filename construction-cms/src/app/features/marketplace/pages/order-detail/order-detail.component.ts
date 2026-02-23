import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    updatedAt: string;
    items: OrderItem[];
    notes: string | null;
}

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    unit: string | null;
    imageUrl: string | null;
}

interface ReviewRequest {
    rating: number;
    comment: string;
}

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
    template: `
    <div class="order-detail-page">
      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <i class="pi pi-spinner pi-spin"></i>
          <p>{{ 'MARKETPLACE.LOADING' | translate }}</p>
        </div>
      }

      <!-- Order Content -->
      @if (!loading() && order()) {
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="title-section">
              <a [routerLink]="['/marketplace/orders']" class="back-link">
                <i class="pi pi-arrow-left"></i>
                {{ 'MARKETPLACE.BACK_TO_ORDERS' | translate }}
              </a>
              <h1>{{ 'MARKETPLACE.ORDER' | translate }} #{{ order()?.id }}</h1>
              <div class="order-status" [class]="getStatusClass(order()?.status || '')">
                {{ getStatusLabel(order()?.status || '') }}
              </div>
            </div>
            <div class="order-date">
              {{ order()?.createdAt | date:'medium' }}
            </div>
          </div>
        </div>

        <div class="content-grid">
          <!-- Main Content -->
          <div class="main-content">
            <!-- Order Progress -->
            <div class="progress-section">
              <h2>{{ 'MARKETPLACE.ORDER_PROGRESS' | translate }}</h2>
              <div class="progress-steps">
                @for (step of progressSteps; track step.id) {
                  <div class="step" [class.completed]="isStepCompleted(step.id)" [class.current]="isStepCurrent(step.id)">
                    <div class="step-icon">
                      <i [class]="step.icon"></i>
                    </div>
                    <div class="step-info">
                      <span class="step-name">{{ step.name | translate }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Order Items -->
            <div class="items-section">
              <h2>{{ 'MARKETPLACE.ORDER_ITEMS' | translate }}</h2>
              <div class="items-list">
                @for (item of order()?.items; track item.productId) {
                  <div class="item-row">
                    <div class="item-image">
                      @if (item.imageUrl) {
                        <img [src]="item.imageUrl" [alt]="item.productName">
                      } @else {
                        <div class="placeholder-image">
                          <i class="pi pi-box"></i>
                        </div>
                      }
                    </div>
                    <div class="item-details">
                      <h3>{{ item.productName }}</h3>
                      <p class="unit-price">{{ item.price | currency:'EGP':'symbol':'1.0-2' }} @if (item.unit) { / {{ item.unit }} }</p>
                    </div>
                    <div class="item-quantity">
                      × {{ item.quantity }}
                    </div>
                    <div class="item-total">
                      {{ item.price * item.quantity | currency:'EGP':'symbol':'1.0-2' }}
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Actions -->
            <div class="actions-section">
              @if (canCancel()) {
                <button class="cancel-btn" (click)="cancelOrder()">
                  <i class="pi pi-times"></i>
                  {{ 'MARKETPLACE.CANCEL_ORDER' | translate }}
                </button>
              }
              @if (canConfirmDelivery()) {
                <button class="confirm-btn" (click)="confirmDelivery()">
                  <i class="pi pi-check"></i>
                  {{ 'MARKETPLACE.CONFIRM_DELIVERY' | translate }}
                </button>
              }
            </div>
          </div>

          <!-- Sidebar -->
          <div class="sidebar">
            <!-- Order Summary -->
            <div class="summary-card">
              <h2>{{ 'MARKETPLACE.ORDER_SUMMARY' | translate }}</h2>
              <div class="summary-row">
                <span>{{ 'MARKETPLACE.SUBTOTAL' | translate }}</span>
                <span>{{ calculateSubtotal() | currency:'EGP':'symbol':'1.0-2' }}</span>
              </div>
              <div class="summary-row">
                <span>{{ 'MARKETPLACE.DELIVERY_FEE' | translate }}</span>
                <span>50.00 EGP</span>
              </div>
              <div class="summary-row total">
                <span>{{ 'MARKETPLACE.TOTAL' | translate }}</span>
                <span>{{ order()?.totalAmount | currency:'EGP':'symbol':'1.0-2' }}</span>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="info-card">
              <h2>{{ 'MARKETPLACE.PAYMENT_INFO' | translate }}</h2>
              <div class="info-row">
                <i class="pi pi-credit-card"></i>
                <span>{{ getPaymentMethodLabel(order()?.paymentMethod || '') }}</span>
              </div>
              <div class="info-row">
                <i class="pi pi-check-circle"></i>
                <span [class.paid]="order()?.paymentStatus === 'paid'" [class.pending]="order()?.paymentStatus !== 'paid'">
                  {{ order()?.paymentStatus === 'paid' ? ('MARKETPLACE.PAID' | translate) : ('MARKETPLACE.PENDING' | translate) }}
                </span>
              </div>
            </div>

            <!-- Delivery Info -->
            <div class="info-card">
              <h2>{{ 'MARKETPLACE.DELIVERY_INFO' | translate }}</h2>
              <div class="info-row">
                <i class="pi pi-map-marker"></i>
                <span>{{ order()?.deliveryAddress }}</span>
              </div>
            </div>

            <!-- Vendor Info -->
            <div class="info-card vendor-card" (click)="goToVendor()">
              <h2>{{ 'MARKETPLACE.VENDOR' | translate }}</h2>
              <div class="vendor-info">
                <div class="vendor-avatar">
                  <i class="pi pi-building"></i>
                </div>
                <div class="vendor-details">
                  <span class="vendor-name">{{ order()?.vendorName }}</span>
                  <span class="view-profile">{{ 'MARKETPLACE.VIEW_PROFILE' | translate }}</span>
                </div>
                <i class="pi pi-chevron-right"></i>
              </div>
            </div>

            <!-- Review Section -->
            @if (canReview()) {
              <div class="review-card">
                <h2>{{ 'MARKETPLACE.LEAVE_REVIEW' | translate }}</h2>
                <div class="rating-input">
                  @for (star of [1,2,3,4,5]; track star) {
                    <i class="pi" 
                       [class.pi-star-fill]="star <= reviewRating()"
                       [class.pi-star]="star > reviewRating()"
                       (click)="reviewRating.set(star)"></i>
                  }
                </div>
                <textarea [(ngModel)]="reviewComment" 
                          [placeholder]="'MARKETPLACE.REVIEW_PLACEHOLDER' | translate"
                          rows="3"></textarea>
                <button class="submit-review-btn" (click)="submitReview()" [disabled]="reviewRating() === 0">
                  {{ 'MARKETPLACE.SUBMIT_REVIEW' | translate }}
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Not Found -->
      @if (!loading() && !order()) {
        <div class="not-found">
          <i class="pi pi-exclamation-triangle"></i>
          <h2>{{ 'MARKETPLACE.ORDER_NOT_FOUND' | translate }}</h2>
          <a [routerLink]="['/marketplace/orders']" class="back-btn">
            {{ 'MARKETPLACE.BACK_TO_ORDERS' | translate }}
          </a>
        </div>
      }
    </div>
  `,
    styles: [`
    .order-detail-page {
      min-height: 100vh;
      background: #f9fafb;
      padding: 2rem;
    }

    .loading-state, .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .loading-state i, .not-found i {
      font-size: 3rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .not-found h2 {
      margin-bottom: 1rem;
    }

    .back-btn {
      padding: 0.75rem 1.5rem;
      background: #1e3a5f;
      color: white;
      text-decoration: none;
      border-radius: 8px;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      text-decoration: none;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .back-link:hover {
      color: #f59e0b;
    }

    .title-section h1 {
      font-size: 1.5rem;
      color: #1e3a5f;
      margin-bottom: 0.5rem;
    }

    .order-status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .order-status.pending { background: #fef3c7; color: #d97706; }
    .order-status.processing { background: #dbeafe; color: #2563eb; }
    .order-status.ready { background: #d1fae5; color: #059669; }
    .order-status.delivered { background: #d1fae5; color: #059669; }
    .order-status.cancelled { background: #fee2e2; color: #dc2626; }

    .order-date {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
    }

    .progress-section, .items-section, .actions-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .progress-section h2, .items-section h2, .summary-card h2, .info-card h2, .review-card h2 {
      font-size: 1rem;
      margin-bottom: 1rem;
      color: #1e3a5f;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
    }

    .step::after {
      content: '';
      position: absolute;
      top: 20px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: #e5e7eb;
    }

    .step:last-child::after {
      display: none;
    }

    .step.completed::after {
      background: #059669;
    }

    .step-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      z-index: 1;
    }

    .step.completed .step-icon {
      background: #059669;
      color: white;
    }

    .step.current .step-icon {
      background: #f59e0b;
      color: white;
    }

    .step-name {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
    }

    .step.completed .step-name, .step.current .step-name {
      color: #1e3a5f;
      font-weight: 500;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .item-row {
      display: grid;
      grid-template-columns: 60px 1fr auto auto;
      gap: 1rem;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .item-image {
      width: 60px;
      height: 60px;
      background: #e5e7eb;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image i {
      font-size: 1.5rem;
      color: #9ca3af;
    }

    .item-details h3 {
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }

    .unit-price {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .item-quantity {
      font-weight: 500;
      color: #6b7280;
    }

    .item-total {
      font-weight: 600;
      color: #1e3a5f;
    }

    .actions-section {
      display: flex;
      gap: 1rem;
    }

    .cancel-btn, .confirm-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
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

    .confirm-btn {
      background: #059669;
      border: none;
      color: white;
    }

    .confirm-btn:hover {
      background: #047857;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .summary-card, .info-card, .review-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-row.total {
      border-bottom: none;
      font-weight: 600;
      color: #1e3a5f;
      margin-top: 0.5rem;
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .info-row i {
      color: #f59e0b;
      margin-top: 0.25rem;
    }

    .paid { color: #059669; }
    .pending { color: #d97706; }

    .vendor-card {
      cursor: pointer;
      transition: box-shadow 0.3s;
    }

    .vendor-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .vendor-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .vendor-avatar {
      width: 40px;
      height: 40px;
      background: #f0f9ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vendor-avatar i {
      color: #1e3a5f;
    }

    .vendor-details {
      flex: 1;
    }

    .vendor-name {
      display: block;
      font-weight: 500;
    }

    .view-profile {
      font-size: 0.8rem;
      color: #f59e0b;
    }

    .rating-input {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .rating-input i {
      font-size: 1.5rem;
      color: #fbbf24;
      cursor: pointer;
    }

    .rating-input i:not(.pi-star-fill) {
      color: #d1d5db;
    }

    .review-card textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      resize: none;
      font-family: inherit;
      margin-bottom: 1rem;
    }

    .submit-review-btn {
      width: 100%;
      padding: 0.75rem;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
    }

    .submit-review-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .progress-steps {
        flex-wrap: wrap;
        gap: 1rem;
      }

      .step::after {
        display: none;
      }

      .item-row {
        grid-template-columns: 50px 1fr;
        gap: 0.75rem;
      }

      .item-quantity, .item-total {
        grid-column: 2;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    protected translate = inject(TranslateService);

    loading = signal(true);
    order = signal<Order | null>(null);
    reviewRating = signal(0);
    reviewComment = '';

    progressSteps = [
        { id: 'pending', name: 'MARKETPLACE.STEP_PENDING', icon: 'pi pi-clock' },
        { id: 'processing', name: 'MARKETPLACE.STEP_PROCESSING', icon: 'pi pi-cog' },
        { id: 'ready', name: 'MARKETPLACE.STEP_READY', icon: 'pi pi-box' },
        { id: 'delivered', name: 'MARKETPLACE.STEP_DELIVERED', icon: 'pi pi-check' }
    ];

    private get apiUrl(): string {
        return (window as any).__API_URL__ || 'https://localhost:7001/api';
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const orderId = params['id'];
            if (orderId) {
                this.loadOrder(+orderId);
            }
        });
    }

    private loadOrder(orderId: number): void {
        this.loading.set(true);

        this.http.get<Order>(`${this.apiUrl}/marketplace/orders/${orderId}`).subscribe({
            next: (order) => {
                this.order.set(order);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading order:', error);
                this.loading.set(false);
            }
        });
    }

    isStepCompleted(stepId: string): boolean {
        const order = this.order();
        if (!order) return false;

        const stepOrder = ['pending', 'processing', 'ready', 'delivered'];
        const currentIndex = stepOrder.indexOf(order.status.toLowerCase());
        const stepIndex = stepOrder.indexOf(stepId);

        return stepIndex < currentIndex;
    }

    isStepCurrent(stepId: string): boolean {
        const order = this.order();
        if (!order) return false;
        return order.status.toLowerCase() === stepId;
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

    getPaymentMethodLabel(method: string): string {
        const labels: Record<string, string> = {
            'cash': 'MARKETPLACE.PAYMENT_CASH',
            'card': 'MARKETPLACE.PAYMENT_CARD',
            'paymob': 'PayMob',
            'fawry': 'Fawry',
            'vodafone': 'Vodafone Cash',
            'orange': 'Orange Money'
        };
        return labels[method.toLowerCase()] || method;
    }

    calculateSubtotal(): number {
        const order = this.order();
        if (!order) return 0;
        return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    canCancel(): boolean {
        const order = this.order();
        return order !== null && (order.status === 'pending' || order.status === 'processing');
    }

    canConfirmDelivery(): boolean {
        const order = this.order();
        return order !== null && order.status === 'ready';
    }

    canReview(): boolean {
        const order = this.order();
        return order !== null && order.status === 'delivered';
    }

    cancelOrder(): void {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        const order = this.order();
        if (!order) return;

        this.http.post(`${this.apiUrl}/marketplace/orders/${order.id}/cancel`, {}).subscribe({
            next: () => {
                this.loadOrder(order.id);
            },
            error: (error) => {
                console.error('Error cancelling order:', error);
                alert('Failed to cancel order.');
            }
        });
    }

    confirmDelivery(): void {
        const order = this.order();
        if (!order) return;

        this.http.post(`${this.apiUrl}/marketplace/orders/${order.id}/confirm-delivery`, {}).subscribe({
            next: () => {
                this.loadOrder(order.id);
            },
            error: (error) => {
                console.error('Error confirming delivery:', error);
                alert('Failed to confirm delivery.');
            }
        });
    }

    goToVendor(): void {
        const order = this.order();
        if (order) {
            this.router.navigate(['/marketplace/vendors', order.vendorId]);
        }
    }

    submitReview(): void {
        const order = this.order();
        if (!order || this.reviewRating() === 0) return;

        const reviewData = {
            rating: this.reviewRating(),
            comment: this.reviewComment
        };

        this.http.post(`${this.apiUrl}/marketplace/orders/${order.id}/review`, reviewData).subscribe({
            next: () => {
                alert('Review submitted successfully!');
                this.reviewRating.set(0);
                this.reviewComment = '';
            },
            error: (error) => {
                console.error('Error submitting review:', error);
                alert('Failed to submit review.');
            }
        });
    }
}
