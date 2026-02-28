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
        <!-- Status Messages -->
        @if (paymentStatusMessage()) {
          <div class="status-banner" [class]="paymentStatusMessage()?.type">
            <i class="pi" [class.pi-check-circle]="paymentStatusMessage()?.type === 'success'" [class.pi-exclamation-circle]="paymentStatusMessage()?.type === 'error'"></i>
            <span>{{ paymentStatusMessage()?.text | translate }}</span>
            <button (click)="paymentStatusMessage.set(null)"><i class="pi pi-times"></i></button>
          </div>
        }

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
              @if (canPay()) {
                <button class="pay-btn" (click)="payNow()">
                  <i class="pi pi-credit-card"></i>
                  {{ 'MARKETPLACE.PAY_NOW' | translate }}
                </button>
              }
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
      background: var(--app-bg);
      color: var(--app-text);
      padding: 3rem 2rem;
      transition: all 0.3s ease;
    }

    .loading-state, .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .loading-state i, .not-found i {
      font-size: 4rem;
      color: var(--accent-blue);
      margin-bottom: 2rem;
    }

    .not-found h2 {
      margin-bottom: 1.5rem;
      font-weight: 900;
    }

    .back-btn {
      padding: 1rem 2rem;
      background: var(--accent-blue);
      color: white;
      text-decoration: none;
      border-radius: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2);
    }

    .page-header {
      margin-bottom: 3rem;
    }

    .status-banner {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 2rem;
      border-radius: 20px;
      margin-bottom: 2.5rem;
      animation: bannerSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid transparent;
      font-weight: 700;
    }

    .status-banner.success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.2);
    }

    .status-banner.error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .status-banner button {
      margin-left: auto;
      background: rgba(0,0,0,0.05);
      border: none;
      color: inherit;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .status-banner button:hover {
      background: rgba(0,0,0,0.1);
      transform: rotate(90deg);
    }

    @keyframes bannerSlideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--glass-border);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--muted-text);
      text-decoration: none;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.3s ease;
    }

    .back-link:hover {
      color: var(--accent-amber);
      transform: translateX(-5px);
    }

    .title-section h1 {
      font-size: 2.5rem;
      font-weight: 950;
      color: var(--app-text);
      margin-bottom: 0.75rem;
      letter-spacing: -0.04em;
    }

    .order-status {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1.25rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .order-status.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .order-status.processing { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .order-status.ready { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .order-status.delivered { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .order-status.cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .order-date {
      color: var(--muted-text);
      font-size: 1rem;
      font-weight: 600;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 3rem;
      max-width: 1400px;
      margin: 3rem auto 0;
    }

    .progress-section, .items-section, .actions-section {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }

    .progress-section h2, .items-section h2, .summary-card h2, .info-card h2, .review-card h2 {
      font-size: 1.25rem;
      font-weight: 900;
      margin-bottom: 2rem;
      color: var(--app-text);
      letter-spacing: -0.02em;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
      position: relative;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .step::after {
      content: '';
      position: absolute;
      top: 24px;
      left: 50%;
      width: 100%;
      height: 4px;
      background: var(--input-bg);
      z-index: -1;
      transition: all 0.6s ease;
    }

    .step:last-child::after {
      display: none;
    }

    .step.completed::after {
      background: var(--accent-blue);
    }

    .step-icon {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: var(--input-bg);
      border: 2px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      color: var(--muted-text);
      font-size: 1.25rem;
    }

    .step.completed .step-icon {
      background: var(--accent-blue);
      color: white;
      border-color: transparent;
      transform: scale(1.1);
      box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
    }

    .step.current .step-icon {
      background: var(--accent-amber);
      color: white;
      border-color: transparent;
      transform: scale(1.1);
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
    }

    .step-name {
      font-size: 0.8rem;
      color: var(--muted-text);
      text-align: center;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .step.completed .step-name, .step.current .step-name {
      color: var(--app-text);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .item-row {
      display: grid;
      grid-template-columns: 80px 1fr auto auto;
      gap: 2rem;
      align-items: center;
      padding: 1.5rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      transition: all 0.3s ease;
    }

    .item-row:hover {
       border-color: var(--accent-blue);
       transform: translateX(5px);
       background: var(--card-bg);
    }

    .item-image {
      width: 80px;
      height: 80px;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
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
      font-size: 2rem;
      color: var(--muted-text);
      opacity: 0.4;
    }

    .item-details h3 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0 0 0.4rem;
      color: var(--app-text);
    }

    .unit-price {
      font-size: 0.9rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .item-quantity {
      font-weight: 800;
      color: var(--muted-text);
      font-size: 1.1rem;
    }

    .item-total {
      font-weight: 900;
      color: var(--app-text);
      font-size: 1.15rem;
    }

    .actions-section {
      display: flex;
      gap: 1.5rem;
    }

    .cancel-btn, .confirm-btn, .pay-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      border-radius: 16px;
      font-weight: 850;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.85rem;
      flex: 1;
    }
    
    .pay-btn {
      background: var(--accent-blue);
      border: none;
      color: white;
      box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2);
    }

    .pay-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(14, 165, 233, 0.3);
      filter: brightness(1.1);
    }

    .cancel-btn {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .cancel-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
      transform: translateY(-5px);
    }

    .confirm-btn {
      background: #10b981;
      border: none;
      color: white;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
    }

    .confirm-btn:hover {
      background: #059669;
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(16, 185, 129, 0.3);
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .summary-card, .info-card, .review-card {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 2.25rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 1rem 0;
      border-bottom: 1px solid var(--glass-border);
      color: var(--muted-text);
      font-weight: 600;
    }

    .summary-row.total {
      border-bottom: none;
      font-weight: 950;
      color: var(--app-text);
      margin-top: 1rem;
      font-size: 1.5rem;
      letter-spacing: -0.02em;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
      padding: 1rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 18px;
      transition: all 0.3s ease;
    }

    .info-row:hover {
       border-color: var(--accent-blue);
       transform: translateX(8px);
    }

    .info-row i {
      color: var(--accent-blue);
      font-size: 1.25rem;
    }

    .info-row span {
       font-weight: 700;
       font-size: 1rem;
    }

    .paid { color: #10b981; font-weight: 900; }
    .pending { color: #f59e0b; font-weight: 900; }

    .vendor-card {
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .vendor-card:hover {
      transform: translateY(-5px);
      border-color: var(--accent-amber);
      box-shadow: 0 15px 30px rgba(245, 158, 11, 0.1);
    }

    .vendor-card h2 { color: var(--app-text); }

    .vendor-info {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .vendor-avatar {
      width: 52px;
      height: 52px;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .vendor-card:hover .vendor-avatar {
       background: var(--accent-amber);
       color: white;
       border-color: transparent;
    }

    .vendor-avatar i {
      color: var(--accent-amber);
      font-size: 1.5rem;
    }

    .vendor-card:hover .vendor-avatar i { color: white; }

    .vendor-details {
      flex: 1;
    }

    .vendor-name {
      display: block;
      font-weight: 800;
      color: var(--app-text);
      font-size: 1.1rem;
    }

    .view-profile {
      font-size: 0.8rem;
      color: var(--accent-amber);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .rating-input {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      justify-content: center;
    }

    .rating-input i {
      font-size: 2rem;
      color: #fbbf24;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.2));
    }

    .rating-input i:hover { transform: scale(1.2); }

    .rating-input i:not(.pi-star-fill) {
      color: var(--glass-border);
      filter: none;
    }

    .review-card textarea {
      width: 100%;
      padding: 1.25rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 18px;
      color: var(--app-text);
      resize: none;
      font-family: inherit;
      margin-bottom: 1.5rem;
      font-weight: 600;
      outline: none;
      transition: all 0.3s ease;
    }

    .review-card textarea:focus {
       border-color: var(--accent-blue);
       box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
    }

    .submit-review-btn {
      width: 100%;
      padding: 1.1rem;
      background: linear-gradient(135deg, var(--accent-blue), #2563eb);
      color: white;
      border: none;
      border-radius: 18px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: all 0.4s ease;
      box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2);
    }

    .submit-review-btn:hover:not(:disabled) {
       transform: translateY(-3px);
       box-shadow: 0 15px 30px rgba(14, 165, 233, 0.3);
    }

    .submit-review-btn:disabled {
      background: var(--muted-text);
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      .sidebar { max-width: 600px; margin: 0 auto; width: 100%; }
    }

    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .progress-steps {
        flex-direction: column;
        gap: 1.5rem;
      }

      .step::after {
        display: none;
      }

      .step { flex-direction: row; align-items: center; gap: 1.5rem; }
      .step-icon { margin-bottom: 0; }

      .item-row {
        grid-template-columns: 60px 1fr;
        gap: 1.5rem;
        padding: 1.25rem;
      }

      .item-quantity, .item-total {
        grid-column: 2;
      }

      .actions-section { flex-direction: column; }
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
    return (window as any).__API_URL__ || '/api';
  }

  paymentStatusMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.loadOrder(+orderId);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['payment'] === 'success') {
        this.paymentStatusMessage.set({ type: 'success', text: 'MARKETPLACE.PAYMENT_SUCCESS_MSG' });
        // Clear the query param without reloading
        this.router.navigate([], { relativeTo: this.route, queryParams: { payment: null }, queryParamsHandling: 'merge' });
      } else if (params['payment'] === 'failed') {
        this.paymentStatusMessage.set({ type: 'error', text: 'MARKETPLACE.PAYMENT_FAILED_MSG' });
        this.router.navigate([], { relativeTo: this.route, queryParams: { payment: null }, queryParamsHandling: 'merge' });
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

  canPay(): boolean {
    const order = this.order();
    return order !== null &&
      order.paymentStatus?.toLowerCase() !== 'paid' &&
      order.paymentMethod?.toLowerCase() !== 'cash' &&
      order.status?.toLowerCase() !== 'cancelled';
  }

  payNow(): void {
    const order = this.order();
    if (!order) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const paymentMethodMap: Record<string, number> = {
      'card': 1,
      'paymob': 2,
      'fawry': 3,
      'vodafone': 4,
      'orange': 5,
      'etisalat': 6
    };

    const paymentRequest = {
      orderId: order.id,
      paymentMethod: paymentMethodMap[order.paymentMethod.toLowerCase()] || 1,
      billingInfo: {
        firstName: user.firstName || user.fullName?.split(' ')[0] || 'Guest',
        lastName: user.lastName || user.fullName?.split(' ')[1] || 'Guest',
        email: user.email || 'guest@example.com',
        phoneNumber: user.phoneNumber || '01000000000'
      },
      phoneNumber: user.phoneNumber
    };

    this.http.post(`${this.apiUrl}/EgyptianPayment/initiate`, paymentRequest).subscribe({
      next: (response: any) => {
        if (response.success && response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          alert('Payment initiation failed. Please try again.');
        }
      },
      error: (error) => {
        console.error('Error initiating payment:', error);
        alert('Payment initiation error.');
      }
    });
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
