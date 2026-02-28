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
      color: var(--accent-amber);
      margin-bottom: 2rem;
    }

    .not-found h2 {
      margin-bottom: 1rem;
      font-weight: 900;
    }

    .not-found p {
      color: var(--muted-text);
      margin-bottom: 2.5rem;
      font-weight: 500;
    }

    .back-btn {
      padding: 1rem 2.5rem;
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

    .breadcrumb {
      display: flex;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: var(--muted-text);
      margin-bottom: 2.5rem;
      font-weight: 600;
    }

    .breadcrumb a {
      color: var(--accent-amber);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .breadcrumb a:hover {
       color: var(--app-text);
    }

    .product-main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 3rem;
      margin-bottom: 3rem;
      box-shadow: 0 20px 50px rgba(0,0,0,0.03);
    }

    .product-image-section {
      position: sticky;
      top: 2rem;
    }

    .main-image {
      aspect-ratio: 1;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .main-image:hover img {
       transform: scale(1.05);
    }

    .placeholder-image i {
      font-size: 6rem;
      color: var(--muted-text);
      opacity: 0.3;
    }

    .product-info-section h1 {
      font-size: 2.75rem;
      font-weight: 950;
      margin: 1rem 0;
      color: var(--app-text);
      letter-spacing: -0.04em;
      line-height: 1.1;
    }

    .category-tag {
      font-size: 0.75rem;
      font-weight: 850;
      color: var(--accent-amber);
      background: rgba(245, 158, 11, 0.1);
      padding: 0.4rem 1rem;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .vendor-info {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      cursor: pointer;
      margin: 1.5rem 0;
      color: var(--app-text);
      font-weight: 700;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .vendor-info:hover {
      background: var(--card-bg);
      border-color: var(--accent-amber);
      transform: translateX(8px);
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.1);
    }

    .vendor-info i { color: var(--accent-amber); }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 2rem;
    }

    .rating i {
      color: #fbbf24;
      font-size: 1.15rem;
      filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.2));
    }

    .rating i:not(.filled) {
      color: var(--glass-border);
      filter: none;
    }

    .rating-text {
      margin-left: 0.75rem;
      color: var(--muted-text);
      font-size: 0.95rem;
      font-weight: 600;
    }

    .price-section {
      margin-bottom: 2.5rem;
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .price {
      font-size: 3rem;
      font-weight: 950;
      color: var(--app-text);
      letter-spacing: -0.04em;
    }

    .unit {
      font-size: 1.25rem;
      color: var(--muted-text);
      font-weight: 700;
    }

    .stock-status {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      font-weight: 850;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .stock-status.in-stock {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .stock-status.low-stock {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .stock-status.out-of-stock {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .sku {
      font-size: 0.9rem;
      color: var(--muted-text);
      margin-bottom: 2.5rem;
      font-weight: 600;
      opacity: 0.8;
    }

    .add-to-cart-section {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      overflow: hidden;
      padding: 4px;
    }

    .quantity-selector button {
      width: 48px;
      height: 48px;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: var(--app-text);
    }

    .quantity-selector button:hover:not(:disabled) {
      background: var(--accent-amber);
      color: white;
      border-color: transparent;
    }

    .quantity-selector button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .quantity-selector input {
      width: 70px;
      background: transparent;
      border: none;
      text-align: center;
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--app-text);
      outline: none;
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
      gap: 1rem;
      padding: 0 3rem;
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

    .add-to-cart-btn:hover:not(:disabled) {
      transform: translateY(-5px);
      box-shadow: 0 25px 50px rgba(245, 158, 11, 0.4);
      filter: brightness(1.1);
    }

    .add-to-cart-btn:disabled {
      background: var(--muted-text);
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    .description-section h3 {
      font-size: 1.25rem;
      font-weight: 900;
      margin-bottom: 1rem;
      color: var(--app-text);
      letter-spacing: -0.01em;
    }

    .description-section p {
      color: var(--app-text);
      line-height: 1.8;
      font-size: 1.05rem;
      font-weight: 500;
      opacity: 0.9;
    }

    .vendor-section {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 3rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }

    .vendor-section h2 {
      font-size: 1.5rem;
      font-weight: 900;
      margin-bottom: 2rem;
      color: var(--app-text);
      letter-spacing: -0.02em;
    }

    .vendor-card {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 2rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .vendor-card:hover {
      background: var(--card-bg);
      border-color: var(--accent-amber);
      transform: scale(1.02);
      box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    }

    .vendor-avatar {
      width: 80px;
      height: 80px;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .vendor-card:hover .vendor-avatar {
       background: var(--accent-amber);
       color: white;
       border-color: transparent;
       transform: rotate(-5deg);
    }

    .vendor-avatar i {
      font-size: 2.5rem;
      color: var(--accent-amber);
    }

    .vendor-card:hover .vendor-avatar i {
       color: white;
    }

    .vendor-details {
      flex: 1;
    }

    .vendor-details h3 {
      font-size: 1.5rem;
      font-weight: 900;
      margin-bottom: 0.5rem;
      color: var(--app-text);
    }

    .vendor-details .address {
      font-size: 1rem;
      color: var(--muted-text);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .vendor-stats {
      display: flex;
      gap: 2rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--app-text);
      font-weight: 700;
    }

    .stat i {
      color: var(--accent-amber);
      font-size: 1rem;
    }

    @media (max-width: 1024px) {
       .product-main { gap: 2rem; padding: 2rem; }
       .product-info-section h1 { font-size: 2.25rem; }
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

      .vendor-card { flex-direction: column; text-align: center; }
      .vendor-stats { justify-content: center; flex-wrap: wrap; }
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
    return (window as any).__API_URL__ || '/api';
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
