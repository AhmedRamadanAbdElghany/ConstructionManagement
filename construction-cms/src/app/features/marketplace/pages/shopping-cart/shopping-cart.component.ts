import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface CartItem {
  productId: number;
  quantity: number;
  product?: Product;
}

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string | null;
  imageUrl: string | null;
  vendorName: string;
  vendorId: number;
  quantityInStock: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
}

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="cart-page">
      <!-- Header -->
      <div class="page-header">
        <h1>{{ 'MARKETPLACE.SHOPPING_CART' | translate }}</h1>
        <div class="breadcrumb">
          <a [routerLink]="['/marketplace']">{{ 'MARKETPLACE.HOME' | translate }}</a>
          <span>/</span>
          <span>{{ 'MARKETPLACE.CART' | translate }}</span>
        </div>
      </div>

      <!-- Empty Cart -->
      @if (cartItems().length === 0) {
        <div class="empty-cart">
          <i class="pi pi-shopping-cart"></i>
          <h2>{{ 'MARKETPLACE.EMPTY_CART' | translate }}</h2>
          <p>{{ 'MARKETPLACE.EMPTY_CART_MSG' | translate }}</p>
          <a [routerLink]="['/marketplace/products']" class="shop-btn">
            {{ 'MARKETPLACE.START_SHOPPING' | translate }}
          </a>
        </div>
      }

      <!-- Cart Content -->
      @if (cartItems().length > 0) {
        <div class="cart-content">
          <div class="cart-items-section">
            <!-- Cart Items -->
            <div class="cart-items">
              @for (item of cartItems(); track item.productId) {
                <div class="cart-item">
                  <div class="item-image">
                    @if (item.product?.imageUrl) {
                      <img [src]="item.product?.imageUrl" [alt]="item.product?.name">
                    } @else {
                      <div class="placeholder-image">
                        <i class="pi pi-box"></i>
                      </div>
                    }
                  </div>
                  <div class="item-details">
                    <h3>{{ item.product?.name }}</h3>
                    <p class="vendor">{{ item.product?.vendorName }}</p>
                    <div class="price-row">
                      <span class="price">{{ item.product?.price | currency:'EGP':'symbol':'1.0-2' }}</span>
                      @if (item.product?.unit) {
                        <span class="unit">/ {{ item.product?.unit }}</span>
                      }
                    </div>
                  </div>
                  <div class="item-quantity">
                    <button (click)="decrementQuantity(item)" [disabled]="item.quantity <= 1">
                      <i class="pi pi-minus"></i>
                    </button>
                    <input type="number" [ngModel]="item.quantity" (ngModelChange)="updateQuantity(item, $event)" min="1" [max]="item.product?.quantityInStock || 999" />
                    <button (click)="incrementQuantity(item)" [disabled]="item.quantity >= (item.product?.quantityInStock || 999)">
                      <i class="pi pi-plus"></i>
                    </button>
                  </div>
                  <div class="item-total">
                    <span class="total">{{ (item.product?.price || 0) * item.quantity | currency:'EGP':'symbol':'1.0-2' }}</span>
                  </div>
                  <button class="remove-btn" (click)="removeItem(item)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              }
            </div>

            <!-- Continue Shopping -->
            <a [routerLink]="['/marketplace/products']" class="continue-shopping">
              <i class="pi pi-arrow-left"></i>
              {{ 'MARKETPLACE.CONTINUE_SHOPPING' | translate }}
            </a>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
            <h2>{{ 'MARKETPLACE.ORDER_SUMMARY' | translate }}</h2>
            
            <div class="summary-row">
              <span>{{ 'MARKETPLACE.SUBTOTAL' | translate }}</span>
              <span>{{ subtotal() | currency:'EGP':'symbol':'1.0-2' }}</span>
            </div>
            <div class="summary-row">
              <span>{{ 'MARKETPLACE.DELIVERY_FEE' | translate }}</span>
              <span>{{ deliveryFee() | currency:'EGP':'symbol':'1.0-2' }}</span>
            </div>
            <div class="summary-row total">
              <span>{{ 'MARKETPLACE.TOTAL' | translate }}</span>
              <span>{{ total() | currency:'EGP':'symbol':'1.0-2' }}</span>
            </div>

            <!-- Delivery Address -->
            <div class="delivery-section">
              <h3>{{ 'MARKETPLACE.DELIVERY_ADDRESS' | translate }}</h3>
              <textarea [(ngModel)]="deliveryAddress" 
                        [placeholder]="'MARKETPLACE.ENTER_ADDRESS' | translate"
                        rows="3"></textarea>
            </div>

            <!-- Payment Method -->
            <div class="payment-section">
              <h3>{{ 'MARKETPLACE.PAYMENT_METHOD' | translate }}</h3>
              <div class="payment-methods">
                @for (method of paymentMethods; track method.id) {
                  <button class="payment-method"
                          [class.selected]="selectedPaymentMethod() === method.id"
                          (click)="selectedPaymentMethod.set(method.id)">
                    <i [class]="method.icon"></i>
                    <span>{{ translate.currentLang === 'ar' ? method.nameAr : method.name }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Checkout Button -->
            <button class="checkout-btn" (click)="checkout()" [disabled]="!canCheckout()">
              {{ 'MARKETPLACE.PROCEED_TO_CHECKOUT' | translate }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page {
      min-height: 100vh;
      background: var(--app-bg);
      color: var(--app-text);
      padding: 3rem 2rem;
      transition: all 0.3s ease;
    }

    .page-header {
      margin-bottom: 3rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 950;
      color: var(--app-text);
      margin-bottom: 0.5rem;
      letter-spacing: -0.04em;
    }

    .breadcrumb {
      display: flex;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .breadcrumb a {
      color: var(--accent-amber);
      text-decoration: none;
    }

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 4rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }

    .empty-cart i {
      font-size: 5rem;
      color: var(--accent-amber);
      margin-bottom: 2rem;
      opacity: 0.5;
    }

    .empty-cart h2 {
      margin-bottom: 1rem;
      font-weight: 900;
    }

    .empty-cart p {
      color: var(--muted-text);
      margin-bottom: 2.5rem;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .shop-btn {
      padding: 1rem 2.5rem;
      background: var(--accent-amber);
      color: white;
      text-decoration: none;
      border-radius: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);
    }

    .shop-btn:hover {
       transform: translateY(-3px);
       box-shadow: 0 15px 30px rgba(245, 158, 11, 0.3);
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 3rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 120px 1fr auto auto auto;
      gap: 2rem;
      align-items: center;
      padding: 2rem;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .cart-item:hover {
       transform: translateY(-4px);
       border-color: var(--accent-amber);
       box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }

    .item-image {
      width: 120px;
      height: 120px;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
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
      font-size: 2.5rem;
      color: var(--muted-text);
      opacity: 0.4;
    }

    .item-details h3 {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
      color: var(--app-text);
      letter-spacing: -0.01em;
    }

    .item-details .vendor {
      font-size: 0.9rem;
      color: var(--muted-text);
      margin-bottom: 0.75rem;
      font-weight: 600;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
    }

    .price {
      font-weight: 850;
      color: var(--app-text);
      font-size: 1.1rem;
    }

    .unit {
      font-size: 0.85rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      overflow: hidden;
      padding: 3px;
    }

    .item-quantity button {
      width: 38px;
      height: 38px;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: var(--app-text);
    }

    .item-quantity button:hover:not(:disabled) {
      background: var(--accent-amber);
      color: white;
      border-color: transparent;
    }

    .item-quantity button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .item-quantity input {
      width: 50px;
      background: transparent;
      border: none;
      text-align: center;
      font-size: 1rem;
      font-weight: 800;
      color: var(--app-text);
      outline: none;
    }

    .item-total .total {
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--app-text);
      letter-spacing: -0.02em;
    }

    .remove-btn {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      cursor: pointer;
      padding: 0.75rem;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .remove-btn:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1) rotate(90deg);
      border-color: transparent;
    }

    .continue-shopping {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 2rem;
      color: var(--accent-amber);
      text-decoration: none;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      transition: all 0.3s ease;
    }

    .continue-shopping:hover {
       transform: translateX(-5px);
       color: var(--app-text);
    }

    .order-summary {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 2.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
      box-shadow: 0 20px 50px rgba(0,0,0,0.03);
    }

    .order-summary h2 {
      font-size: 1.5rem;
      font-weight: 900;
      margin-bottom: 2rem;
      color: var(--app-text);
      letter-spacing: -0.02em;
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
      font-size: 1.5rem;
      font-weight: 950;
      color: var(--app-text);
      margin-top: 1rem;
      letter-spacing: -0.02em;
    }

    .delivery-section, .payment-section {
      margin-top: 2.5rem;
    }

    .delivery-section h3, .payment-section h3 {
      font-size: 0.85rem;
      font-weight: 850;
      margin-bottom: 1.25rem;
      color: var(--app-text);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .delivery-section textarea {
      width: 100%;
      padding: 1.25rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      color: var(--app-text);
      resize: none;
      font-family: inherit;
      font-weight: 600;
      outline: none;
      transition: all 0.3s ease;
    }

    .delivery-section textarea:focus {
       border-color: var(--accent-amber);
       box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
    }

    .payment-methods {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .payment-method {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
      background: var(--input-bg);
      border: 2px solid var(--glass-border);
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      color: var(--app-text);
    }

    .payment-method:hover {
      border-color: var(--accent-amber);
      transform: translateY(-3px);
    }

    .payment-method.selected {
      border-color: var(--accent-amber);
      background: var(--card-bg);
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.15);
    }

    .payment-method i {
      font-size: 1.75rem;
      color: var(--accent-amber);
    }

    .payment-method span {
       font-size: 0.8rem;
       font-weight: 800;
       text-align: center;
    }

    .checkout-btn {
      width: 100%;
      padding: 1.25rem;
      margin-top: 2.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      border: none;
      border-radius: 18px;
      font-size: 1.1rem;
      font-weight: 950;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 15px 30px rgba(245, 158, 11, 0.3);
    }

    .checkout-btn:hover:not(:disabled) {
      transform: translateY(-5px);
      box-shadow: 0 25px 50px rgba(245, 158, 11, 0.4);
      filter: brightness(1.1);
    }

    .checkout-btn:disabled {
      background: var(--muted-text);
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    @media (max-width: 1200px) {
       .cart-content { grid-template-columns: 1fr; gap: 2rem; }
       .order-summary { position: static; width: 100%; max-width: 600px; margin: 0 auto; }
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 100px 1fr;
        gap: 1.5rem;
        padding: 1.5rem;
      }

      .item-quantity, .item-total, .remove-btn {
        grid-column: 2;
      }

      .item-details h3 { font-size: 1.1rem; }
      .page-header h1 { font-size: 2rem; }
    }
  `]
})
export class ShoppingCartComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  protected translate = inject(TranslateService);

  cartItems = signal<CartItem[]>([]);
  deliveryAddress = '';
  selectedPaymentMethod = signal<string>('cash');

  paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Cash on Delivery', nameAr: 'الدفع عند الاستلام', icon: 'pi pi-money-bill' },
    { id: 'card', name: 'Credit/Debit Card', nameAr: 'بطاقة ائتمان', icon: 'pi pi-credit-card' },
    { id: 'paymob', name: 'PayMob', nameAr: 'باي موب', icon: 'pi pi-mobile' },
    { id: 'fawry', name: 'Fawry', nameAr: 'فوري', icon: 'pi pi-building' },
    { id: 'vodafone', name: 'Vodafone Cash', nameAr: 'فودافون كاش', icon: 'pi pi-mobile' },
    { id: 'orange', name: 'Orange Money', nameAr: 'أورنج موني', icon: 'pi pi-mobile' }
  ];

  private get apiUrl(): string {
    return (window as any).__API_URL__ || '/api';
  }

  ngOnInit(): void {
    this.loadCart();
  }

  private loadCart(): void {
    const cartJson = localStorage.getItem('marketplace_cart');
    const cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];

    // Load product details for each cart item
    if (cart.length > 0) {
      const productIds = cart.map(item => item.productId);
      this.http.post<Product[]>(`${this.apiUrl}/marketplace/products/by-ids`, { ids: productIds }).subscribe({
        next: (products) => {
          const itemsWithProducts = cart.map(item => ({
            ...item,
            product: products.find(p => p.id === item.productId)
          })).filter(item => item.product);
          this.cartItems.set(itemsWithProducts);
        },
        error: (error) => {
          console.error('Error loading cart products:', error);
          // Fallback: use cart as-is without product details
          this.cartItems.set(cart);
        }
      });
    }
  }

  subtotal = signal(0);
  deliveryFee = signal(0);
  total = signal(0);

  private updateTotals(): void {
    const items = this.cartItems();
    const sub = items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
    this.subtotal.set(sub);
    this.deliveryFee.set(sub > 0 ? 50 : 0); // Fixed delivery fee
    this.total.set(sub + this.deliveryFee());
  }

  incrementQuantity(item: CartItem): void {
    item.quantity++;
    this.saveCart();
    this.updateTotals();
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
      this.updateTotals();
    }
  }

  updateQuantity(item: CartItem, quantity: number): void {
    item.quantity = Math.max(1, Math.min(quantity, item.product?.quantityInStock || 999));
    this.saveCart();
    this.updateTotals();
  }

  removeItem(item: CartItem): void {
    const items = this.cartItems().filter(i => i.productId !== item.productId);
    this.cartItems.set(items);
    this.saveCart();
    this.updateTotals();
  }

  private saveCart(): void {
    const cart = this.cartItems().map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    localStorage.setItem('marketplace_cart', JSON.stringify(cart));
  }

  canCheckout(): boolean {
    return this.cartItems().length > 0 &&
      this.deliveryAddress.trim() !== '' &&
      this.selectedPaymentMethod() !== '';
  }

  checkout(): void {
    if (!this.canCheckout()) return;

    const orderData = {
      vendorId: this.cartItems()[0]?.product?.vendorId,
      items: this.cartItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      deliveryAddress: this.deliveryAddress,
      paymentMethod: this.selectedPaymentMethod(),
      notes: ''
    };

    this.http.post(`${this.apiUrl}/marketplace/orders`, orderData).subscribe({
      next: (order: any) => {
        localStorage.removeItem('marketplace_cart');

        // If online payment (not cash), initiate payment
        if (this.selectedPaymentMethod() !== 'cash') {
          this.initiatePayment(order);
        } else {
          this.router.navigate(['/marketplace/orders', order.id]);
        }
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('Failed to create order. Please try again.');
      }
    });
  }

  private initiatePayment(order: any): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const paymentMethodMap: Record<string, number> = {
      'card': 1, // Card
      'paymob': 2, // PayMob
      'fawry': 3, // Fawry
      'vodafone': 4, // VodafoneCash
      'orange': 5, // OrangeMoney
      'etisalat': 6 // EtisalatCash
    };

    const paymentRequest = {
      orderId: order.id,
      paymentMethod: paymentMethodMap[this.selectedPaymentMethod()] || 1,
      billingInfo: {
        firstName: user.firstName || user.fullName?.split(' ')[0] || 'Guest',
        lastName: user.lastName || user.fullName?.split(' ')[1] || 'Guest',
        email: user.email || 'guest@example.com',
        phoneNumber: user.phoneNumber || '01000000000'
      },
      phoneNumber: user.phoneNumber // For wallet payments
    };

    this.http.post(`${this.apiUrl}/EgyptianPayment/initiate`, paymentRequest).subscribe({
      next: (response: any) => {
        if (response.success && response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          alert('Payment initiation failed. Please try again from Order Detail page.');
          this.router.navigate(['/marketplace/orders', order.id]);
        }
      },
      error: (error) => {
        console.error('Error initiating payment:', error);
        this.router.navigate(['/marketplace/orders', order.id]);
      }
    });
  }
}
