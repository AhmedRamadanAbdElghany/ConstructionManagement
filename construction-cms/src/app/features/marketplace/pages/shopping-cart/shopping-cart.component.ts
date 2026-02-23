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
      background: #f9fafb;
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;
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

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      background: white;
      border-radius: 16px;
      padding: 3rem;
    }

    .empty-cart i {
      font-size: 4rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .empty-cart h2 {
      margin-bottom: 0.5rem;
    }

    .empty-cart p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .shop-btn {
      padding: 0.75rem 2rem;
      background: #f59e0b;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
    }

    .cart-items {
      background: white;
      border-radius: 16px;
      overflow: hidden;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 1rem;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 100px;
      height: 100px;
      background: #f3f4f6;
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
      font-size: 2rem;
      color: #9ca3af;
    }

    .item-details h3 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .item-details .vendor {
      font-size: 0.85rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }

    .price {
      font-weight: 600;
      color: #1e3a5f;
    }

    .unit {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .item-quantity button {
      width: 36px;
      height: 36px;
      background: #f9fafb;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .item-quantity button:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .item-quantity button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .item-quantity input {
      width: 50px;
      height: 36px;
      border: none;
      text-align: center;
      font-size: 0.95rem;
    }

    .item-total .total {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a5f;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background 0.3s;
    }

    .remove-btn:hover {
      background: #fee2e2;
    }

    .continue-shopping {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      color: #f59e0b;
      text-decoration: none;
    }

    .order-summary {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 1rem;
    }

    .order-summary h2 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      color: #1e3a5f;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-row.total {
      border-bottom: none;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a5f;
      margin-top: 0.5rem;
    }

    .delivery-section, .payment-section {
      margin-top: 1.5rem;
    }

    .delivery-section h3, .payment-section h3 {
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
      color: #1e3a5f;
    }

    .delivery-section textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      resize: none;
      font-family: inherit;
    }

    .payment-methods {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .payment-method {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .payment-method:hover {
      border-color: #f59e0b;
    }

    .payment-method.selected {
      border-color: #f59e0b;
      background: #fffbeb;
    }

    .payment-method i {
      font-size: 1.5rem;
      color: #1e3a5f;
    }

    .checkout-btn {
      width: 100%;
      padding: 1rem;
      margin-top: 1.5rem;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .checkout-btn:hover:not(:disabled) {
      background: #d97706;
    }

    .checkout-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    @media (max-width: 1024px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: 0.75rem;
      }

      .item-quantity, .item-total, .remove-btn {
        grid-column: 2;
      }
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
        return (window as any).__API_URL__ || 'https://localhost:7001/api';
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
            vendorId: this.cartItems()[0]?.product?.vendorId, // Assuming single vendor for now
            items: this.cartItems().map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product?.price
            })),
            deliveryAddress: this.deliveryAddress,
            paymentMethod: this.selectedPaymentMethod(),
            totalAmount: this.total()
        };

        this.http.post(`${this.apiUrl}/marketplace/orders`, orderData).subscribe({
            next: (response: any) => {
                // Clear cart
                localStorage.removeItem('marketplace_cart');
                // Navigate to order confirmation
                this.router.navigate(['/marketplace/orders', response.id]);
            },
            error: (error) => {
                console.error('Error creating order:', error);
                alert('Failed to create order. Please try again.');
            }
        });
    }
}
