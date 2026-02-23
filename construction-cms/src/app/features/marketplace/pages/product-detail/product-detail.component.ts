import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Product {
    id: number;
    name: string;
    price: number;
    unit: string | null;
    imageUrl: string | null;
    description: string | null;
    vendorName: string;
    vendorId: number;
    categoryName: string;
    quantityInStock: number;
    sku: string | null;
    averageRating: number | null;
    totalReviews: number;
}

interface Vendor {
    id: number;
    name: string;
    address: string | null;
    averageRating: number;
    totalOrders: number;
    productCount: number;
}

interface CartItem {
    productId: number;
    quantity: number;
}

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
    template: `
    <div class="product-detail-page">
      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <i class="pi pi-spinner pi-spin"></i>
          <p>{{ 'MARKETPLACE.LOADING' | translate }}</p>
        </div>
      }

      <!-- Product Content -->
      @if (!loading() && product()) {
        <div class="product-content">
          <!-- Breadcrumb -->
          <div class="breadcrumb">
            <a [routerLink]="['/marketplace']">{{ 'MARKETPLACE.HOME' | translate }}</a>
            <span>/</span>
            <a [routerLink]="['/marketplace/products']">{{ 'MARKETPLACE.PRODUCTS' | translate }}</a>
            <span>/</span>
            <span>{{ product()?.name }}</span>
          </div>

          <div class="product-main">
            <!-- Product Image -->
            <div class="product-image-section">
              <div class="main-image">
                @if (product()?.imageUrl) {
                  <img [src]="product()?.imageUrl" [alt]="product()?.name">
                } @else {
                  <div class="placeholder-image">
                    <i class="pi pi-box"></i>
                  </div>
                }
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info-section">
              <span class="category-tag">{{ product()?.categoryName }}</span>
              <h1>{{ product()?.name }}</h1>
              
              <!-- Vendor Info -->
              <div class="vendor-info" (click)="goToVendor(product()?.vendorId!)">
                <i class="pi pi-building"></i>
                <span>{{ product()?.vendorName }}</span>
                <i class="pi pi-chevron-right"></i>
              </div>

              <!-- Rating -->
              @if (product()?.averageRating) {
                <div class="rating">
                  @for (star of [1,2,3,4,5]; track star) {
                    <i class="pi" 
                       [class.pi-star-fill]="star <= (product()?.averageRating || 0)"
                       [class.pi-star]="star > (product()?.averageRating || 0)"
                       [class.filled]="star <= (product()?.averageRating || 0)"></i>
                  }
                  <span class="rating-text">
                    {{ product()?.averageRating | number:'1.0-1' }} 
                    ({{ product()?.totalReviews }} {{ 'MARKETPLACE.REVIEWS' | translate }})
                  </span>
                </div>
              }

              <!-- Price -->
              <div class="price-section">
                <span class="price">{{ product()?.price | currency:'EGP':'symbol':'1.0-2' }}</span>
                @if (product()?.unit) {
                  <span class="unit">/ {{ product()?.unit }}</span>
                }
              </div>

              <!-- Stock Status -->
              <div class="stock-status" [class.in-stock]="(product()?.quantityInStock || 0) > 10" [class.low-stock]="(product()?.quantityInStock || 0) <= 10 && (product()?.quantityInStock || 0) > 0" [class.out-of-stock]="(product()?.quantityInStock || 0) === 0">
                <i class="pi" [class.pi-check-circle]="(product()?.quantityInStock || 0) > 0" [class.pi-times-circle]="(product()?.quantityInStock || 0) === 0"></i>
                @if ((product()?.quantityInStock || 0) > 10) {
                  <span>{{ 'MARKETPLACE.IN_STOCK' | translate }}</span>
                } @else if ((product()?.quantityInStock || 0) > 0) {
                  <span>{{ 'MARKETPLACE.LOW_STOCK' | translate }} ({{ product()?.quantityInStock }})</span>
                } @else {
                  <span>{{ 'MARKETPLACE.OUT_OF_STOCK' | translate }}</span>
                }
              </div>

              <!-- SKU -->
              @if (product()?.sku) {
                <div class="sku">
                  <span>{{ 'MARKETPLACE.SKU' | translate }}: {{ product()?.sku }}</span>
                </div>
              }

              <!-- Quantity and Add to Cart -->
              <div class="add-to-cart-section">
                <div class="quantity-selector">
                  <button (click)="decrementQuantity()" [disabled]="quantity() <= 1">
                    <i class="pi pi-minus"></i>
                  </button>
                  <input type="number" [ngModel]="quantity()" (ngModelChange)="quantity.set($event)" min="1" [max]="product()?.quantityInStock || 999" />
                  <button (click)="incrementQuantity()" [disabled]="quantity() >= (product()?.quantityInStock || 999)">
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
                <button class="add-to-cart-btn" (click)="addToCart()" [disabled]="(product()?.quantityInStock || 0) === 0">
                  <i class="pi pi-shopping-cart"></i>
                  {{ 'MARKETPLACE.ADD_TO_CART' | translate }}
                </button>
              </div>

              <!-- Description -->
              @if (product()?.description) {
                <div class="description-section">
                  <h3>{{ 'MARKETPLACE.DESCRIPTION' | translate }}</h3>
                  <p>{{ product()?.description }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Vendor Section -->
          @if (vendor()) {
            <div class="vendor-section">
              <h2>{{ 'MARKETPLACE.SOLD_BY' | translate }}</h2>
              <div class="vendor-card" (click)="goToVendor(vendor()?.id!)">
                <div class="vendor-avatar">
                  <i class="pi pi-building"></i>
                </div>
                <div class="vendor-details">
                  <h3>{{ vendor()?.name }}</h3>
                  <p class="address">{{ vendor()?.address }}</p>
                  <div class="vendor-stats">
                    <div class="stat">
                      <i class="pi pi-star"></i>
                      <span>{{ vendor()?.averageRating | number:'1.0-1' }}</span>
                    </div>
                    <div class="stat">
                      <i class="pi pi-shopping-cart"></i>
                      <span>{{ vendor()?.totalOrders }} {{ 'MARKETPLACE.ORDERS' | translate }}</span>
                    </div>
                    <div class="stat">
                      <i class="pi pi-box"></i>
                      <span>{{ vendor()?.productCount }} {{ 'MARKETPLACE.PRODUCTS' | translate }}</span>
                    </div>
                  </div>
                </div>
                <i class="pi pi-chevron-right"></i>
              </div>
            </div>
          }
        </div>
      }

      <!-- Not Found State -->
      @if (!loading() && !product()) {
        <div class="not-found">
          <i class="pi pi-exclamation-triangle"></i>
          <h2>{{ 'MARKETPLACE.PRODUCT_NOT_FOUND' | translate }}</h2>
          <p>{{ 'MARKETPLACE.PRODUCT_NOT_FOUND_MSG' | translate }}</p>
          <a [routerLink]="['/marketplace/products']" class="back-btn">
            {{ 'MARKETPLACE.BROWSE_PRODUCTS' | translate }}
          </a>
        </div>
      }
    </div>
  `,
    styles: [`
    .product-detail-page {
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
      margin-bottom: 0.5rem;
    }

    .not-found p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .back-btn {
      padding: 0.75rem 1.5rem;
      background: #1e3a5f;
      color: white;
      text-decoration: none;
      border-radius: 8px;
    }

    .breadcrumb {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .breadcrumb a {
      color: #f59e0b;
      text-decoration: none;
    }

    .product-main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      background: white;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .product-image-section {
      position: sticky;
      top: 1rem;
    }

    .main-image {
      aspect-ratio: 1;
      background: #f3f4f6;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image i {
      font-size: 5rem;
      color: #9ca3af;
    }

    .product-info-section h1 {
      font-size: 1.75rem;
      margin: 0.5rem 0;
      color: #1e3a5f;
    }

    .category-tag {
      font-size: 0.75rem;
      color: #f59e0b;
      background: #fffbeb;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
    }

    .vendor-info {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f0f9ff;
      border-radius: 8px;
      cursor: pointer;
      margin: 1rem 0;
      color: #1e3a5f;
    }

    .vendor-info:hover {
      background: #e0f2fe;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .rating i {
      color: #fbbf24;
    }

    .rating i:not(.filled) {
      color: #d1d5db;
    }

    .rating-text {
      margin-left: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .price-section {
      margin-bottom: 1rem;
    }

    .price {
      font-size: 2rem;
      font-weight: 700;
      color: #1e3a5f;
    }

    .unit {
      font-size: 1rem;
      color: #6b7280;
    }

    .stock-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .stock-status.in-stock {
      background: #d1fae5;
      color: #059669;
    }

    .stock-status.low-stock {
      background: #fef3c7;
      color: #d97706;
    }

    .stock-status.out-of-stock {
      background: #fee2e2;
      color: #dc2626;
    }

    .sku {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .add-to-cart-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .quantity-selector button {
      width: 44px;
      height: 44px;
      background: #f9fafb;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quantity-selector button:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .quantity-selector button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-selector input {
      width: 60px;
      height: 44px;
      border: none;
      text-align: center;
      font-size: 1rem;
    }

    .quantity-selector input::-webkit-outer-spin-button,
    .quantity-selector input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .add-to-cart-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0 2rem;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: #d97706;
    }

    .add-to-cart-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .description-section h3 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      color: #1e3a5f;
    }

    .description-section p {
      color: #6b7280;
      line-height: 1.6;
    }

    .vendor-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
    }

    .vendor-section h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #1e3a5f;
    }

    .vendor-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .vendor-card:hover {
      background: #f0f9ff;
    }

    .vendor-avatar {
      width: 60px;
      height: 60px;
      background: #e0f2fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vendor-avatar i {
      font-size: 1.5rem;
      color: #1e3a5f;
    }

    .vendor-details {
      flex: 1;
    }

    .vendor-details h3 {
      margin-bottom: 0.25rem;
    }

    .vendor-details .address {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .vendor-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .stat i {
      color: #f59e0b;
    }

    @media (max-width: 768px) {
      .product-main {
        grid-template-columns: 1fr;
      }

      .product-image-section {
        position: static;
      }

      .add-to-cart-section {
        flex-direction: column;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    protected translate = inject(TranslateService);

    loading = signal(true);
    product = signal<Product | null>(null);
    vendor = signal<Vendor | null>(null);
    quantity = signal(1);

    private get apiUrl(): string {
        return (window as any).__API_URL__ || 'https://localhost:7001/api';
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const productId = params['id'];
            if (productId) {
                this.loadProduct(+productId);
            }
        });
    }

    private loadProduct(productId: number): void {
        this.loading.set(true);

        this.http.get<Product>(`${this.apiUrl}/marketplace/products/${productId}`).subscribe({
            next: (product) => {
                this.product.set(product);
                if (product.vendorId) {
                    this.loadVendor(product.vendorId);
                }
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading product:', error);
                this.loading.set(false);
            }
        });
    }

    private loadVendor(vendorId: number): void {
        this.http.get<Vendor>(`${this.apiUrl}/marketplace/vendors/${vendorId}`).subscribe({
            next: (vendor) => {
                this.vendor.set(vendor);
            },
            error: (error) => console.error('Error loading vendor:', error)
        });
    }

    goToVendor(vendorId: number): void {
        this.router.navigate(['/marketplace/vendors', vendorId]);
    }

    incrementQuantity(): void {
        const max = this.product()?.quantityInStock || 999;
        if (this.quantity() < max) {
            this.quantity.update(q => q + 1);
        }
    }

    decrementQuantity(): void {
        if (this.quantity() > 1) {
            this.quantity.update(q => q - 1);
        }
    }

    addToCart(): void {
        const product = this.product();
        if (!product) return;

        // Get current cart from localStorage
        const cartJson = localStorage.getItem('marketplace_cart');
        let cart: CartItem[] = cartJson ? JSON.parse(cartJson) : [];

        // Check if product already in cart
        const existingIndex = cart.findIndex(item => item.productId === product.id);
        if (existingIndex >= 0) {
            cart[existingIndex].quantity += this.quantity();
        } else {
            cart.push({
                productId: product.id,
                quantity: this.quantity()
            });
        }

        // Save cart
        localStorage.setItem('marketplace_cart', JSON.stringify(cart));

        // Navigate to cart
        this.router.navigate(['/marketplace/cart']);
    }
}
