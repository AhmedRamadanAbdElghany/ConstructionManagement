import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Vendor {
    id: number;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    averageRating: number;
    totalOrders: number;
    productCount: number;
    description: string | null;
    phone: string | null;
    email: string | null;
}

interface Product {
    id: number;
    name: string;
    price: number;
    unit: string | null;
    imageUrl: string | null;
    categoryName: string;
    quantityInStock: number;
}

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    reviewerName: string;
    createdAt: string;
}

interface ProductsResponse {
    products: Product[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
}

interface ReviewsResponse {
    reviews: Review[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
}

@Component({
    selector: 'app-vendor-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
    template: `
    <div class="vendor-profile-page">
      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <i class="pi pi-spinner pi-spin"></i>
          <p>{{ 'MARKETPLACE.LOADING' | translate }}</p>
        </div>
      }

      <!-- Vendor Content -->
      @if (!loading() && vendor()) {
        <!-- Header -->
        <div class="vendor-header">
          <div class="header-content">
            <div class="vendor-avatar">
              <i class="pi pi-building"></i>
            </div>
            <div class="vendor-info">
              <h1>{{ vendor()?.name }}</h1>
              <p class="address">
                <i class="pi pi-map-marker"></i>
                {{ vendor()?.address || ('MARKETPLACE.NO_ADDRESS' | translate) }}
              </p>
              <div class="vendor-stats">
                <div class="stat">
                  <i class="pi pi-star"></i>
                  <span class="value">{{ vendor()?.averageRating | number:'1.0-1' }}</span>
                  <span class="label">{{ 'MARKETPLACE.RATING' | translate }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-shopping-cart"></i>
                  <span class="value">{{ vendor()?.totalOrders }}</span>
                  <span class="label">{{ 'MARKETPLACE.ORDERS' | translate }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-box"></i>
                  <span class="value">{{ vendor()?.productCount }}</span>
                  <span class="label">{{ 'MARKETPLACE.PRODUCTS' | translate }}</span>
                </div>
              </div>
            </div>
            <div class="vendor-actions">
              <button class="contact-btn" (click)="showContactModal = true">
                <i class="pi pi-phone"></i>
                {{ 'MARKETPLACE.CONTACT' | translate }}
              </button>
              <button class="directions-btn" (click)="getDirections()">
                <i class="pi pi-directions"></i>
                {{ 'MARKETPLACE.DIRECTIONS' | translate }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs">
            <button [class.active]="activeTab() === 'products'" (click)="activeTab.set('products')">
              <i class="pi pi-box"></i>
              {{ 'MARKETPLACE.PRODUCTS' | translate }}
            </button>
            <button [class.active]="activeTab() === 'reviews'" (click)="activeTab.set('reviews'); loadReviews()">
              <i class="pi pi-star"></i>
              {{ 'MARKETPLACE.REVIEWS' | translate }}
            </button>
            <button [class.active]="activeTab() === 'about'" (click)="activeTab.set('about')">
              <i class="pi pi-info-circle"></i>
              {{ 'MARKETPLACE.ABOUT' | translate }}
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Products Tab -->
          @if (activeTab() === 'products') {
            <div class="products-tab">
              <!-- Category Filter -->
              <div class="filter-bar">
                <div class="search-box">
                  <i class="pi pi-search"></i>
                  <input type="text" 
                         [placeholder]="'MARKETPLACE.SEARCH_PRODUCTS' | translate"
                         [(ngModel)]="productSearch"
                         (keyup.enter)="loadProducts()" />
                </div>
              </div>

              <!-- Products Loading -->
              @if (productsLoading()) {
                <div class="loading-state">
                  <i class="pi pi-spinner pi-spin"></i>
                </div>
              }

              <!-- Products Grid -->
              @if (!productsLoading() && products().length > 0) {
                <div class="products-grid">
                  @for (product of products(); track product.id) {
                    <div class="product-card" [routerLink]="['/marketplace/products', product.id]">
                      <div class="product-image">
                        @if (product.imageUrl) {
                          <img [src]="product.imageUrl" [alt]="product.name">
                        } @else {
                          <div class="placeholder-image">
                            <i class="pi pi-box"></i>
                          </div>
                        }
                      </div>
                      <div class="product-info">
                        <span class="category-tag">{{ product.categoryName }}</span>
                        <h3>{{ product.name }}</h3>
                        <div class="price-row">
                          <span class="price">{{ product.price | currency:'EGP':'symbol':'1.0-2' }}</span>
                          @if (product.unit) {
                            <span class="unit">/ {{ product.unit }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Pagination -->
                @if (totalProductPages() > 1) {
                  <div class="pagination">
                    <button 
                      class="page-btn"
                      [disabled]="currentProductPage() === 1"
                      (click)="loadProducts(currentProductPage() - 1)">
                      <i class="pi pi-chevron-left"></i>
                    </button>
                    <span class="page-info">{{ currentProductPage() }} / {{ totalProductPages() }}</span>
                    <button 
                      class="page-btn"
                      [disabled]="currentProductPage() === totalProductPages()"
                      (click)="loadProducts(currentProductPage() + 1)">
                      <i class="pi pi-chevron-right"></i>
                    </button>
                  </div>
                }
              }

              <!-- Empty Products -->
              @if (!productsLoading() && products().length === 0) {
                <div class="empty-state">
                  <i class="pi pi-box"></i>
                  <p>{{ 'MARKETPLACE.NO_PRODUCTS_VENDOR' | translate }}</p>
                </div>
              }
            </div>
          }

          <!-- Reviews Tab -->
          @if (activeTab() === 'reviews') {
            <div class="reviews-tab">
              @if (reviewsLoading()) {
                <div class="loading-state">
                  <i class="pi pi-spinner pi-spin"></i>
                </div>
              }

              @if (!reviewsLoading() && reviews().length > 0) {
                <div class="reviews-list">
                  @for (review of reviews(); track review.id) {
                    <div class="review-card">
                      <div class="review-header">
                        <div class="reviewer-info">
                          <div class="avatar">
                            <i class="pi pi-user"></i>
                          </div>
                          <div>
                            <h4>{{ review.reviewerName }}</h4>
                            <span class="date">{{ review.createdAt | date:'mediumDate' }}</span>
                          </div>
                        </div>
                        <div class="rating">
                          @for (star of [1,2,3,4,5]; track star) {
                            <i class="pi" 
                               [class.pi-star-fill]="star <= review.rating"
                               [class.pi-star]="star > review.rating"></i>
                          }
                        </div>
                      </div>
                      @if (review.comment) {
                        <p class="comment">{{ review.comment }}</p>
                      }
                    </div>
                  }
                </div>
              }

              @if (!reviewsLoading() && reviews().length === 0) {
                <div class="empty-state">
                  <i class="pi pi-star"></i>
                  <p>{{ 'MARKETPLACE.NO_REVIEWS' | translate }}</p>
                </div>
              }
            </div>
          }

          <!-- About Tab -->
          @if (activeTab() === 'about') {
            <div class="about-tab">
              <div class="about-card">
                <h3>{{ 'MARKETPLACE.DESCRIPTION' | translate }}</h3>
                <p>{{ vendor()?.description || ('MARKETPLACE.NO_DESCRIPTION' | translate) }}</p>
              </div>

              <div class="about-card">
                <h3>{{ 'MARKETPLACE.CONTACT_INFO' | translate }}</h3>
                <div class="contact-info">
                  @if (vendor()?.phone) {
                    <div class="info-row">
                      <i class="pi pi-phone"></i>
                      <span>{{ vendor()?.phone }}</span>
                    </div>
                  }
                  @if (vendor()?.email) {
                    <div class="info-row">
                      <i class="pi pi-envelope"></i>
                      <span>{{ vendor()?.email }}</span>
                    </div>
                  }
                  @if (vendor()?.address) {
                    <div class="info-row">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ vendor()?.address }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Not Found State -->
      @if (!loading() && !vendor()) {
        <div class="not-found">
          <i class="pi pi-exclamation-triangle"></i>
          <h2>{{ 'MARKETPLACE.VENDOR_NOT_FOUND' | translate }}</h2>
          <a [routerLink]="['/marketplace']" class="back-btn">
            {{ 'MARKETPLACE.BACK_TO_MARKETPLACE' | translate }}
          </a>
        </div>
      }
    </div>

    <!-- Contact Modal -->
    @if (showContactModal) {
      <div class="modal-overlay" (click)="showContactModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'MARKETPLACE.CONTACT_VENDOR' | translate }}</h3>
            <button (click)="showContactModal = false">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="contact-option">
              <i class="pi pi-phone"></i>
              <span>{{ vendor()?.phone || ('MARKETPLACE.NOT_AVAILABLE' | translate) }}</span>
            </div>
            <div class="contact-option">
              <i class="pi pi-envelope"></i>
              <span>{{ vendor()?.email || ('MARKETPLACE.NOT_AVAILABLE' | translate) }}</span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .vendor-profile-page {
      min-height: 100vh;
      background: #f9fafb;
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

    .vendor-header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: white;
      padding: 2rem;
    }

    .header-content {
      display: flex;
      align-items: flex-start;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .vendor-avatar {
      width: 100px;
      height: 100px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vendor-avatar i {
      font-size: 2.5rem;
    }

    .vendor-info {
      flex: 1;
    }

    .vendor-info h1 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .address {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.9;
      margin-bottom: 1rem;
    }

    .vendor-stats {
      display: flex;
      gap: 2rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat i {
      color: #fbbf24;
      margin-bottom: 0.25rem;
    }

    .stat .value {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .stat .label {
      font-size: 0.75rem;
      opacity: 0.8;
    }

    .vendor-actions {
      display: flex;
      gap: 1rem;
    }

    .contact-btn, .directions-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .contact-btn {
      background: white;
      color: #1e3a5f;
      border: none;
    }

    .contact-btn:hover {
      background: #f0f9ff;
    }

    .directions-btn {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .directions-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .tabs-container {
      background: white;
      border-bottom: 1px solid #e5e7eb;
    }

    .tabs {
      display: flex;
      gap: 0;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .tabs button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      color: #6b7280;
      font-weight: 500;
      transition: all 0.3s;
    }

    .tabs button:hover {
      color: #1e3a5f;
    }

    .tabs button.active {
      color: #1e3a5f;
      border-bottom-color: #f59e0b;
    }

    .tab-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .filter-bar {
      margin-bottom: 1.5rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 0 1rem;
      max-width: 400px;
    }

    .search-box i {
      color: #9ca3af;
    }

    .search-box input {
      flex: 1;
      padding: 0.75rem 0;
      border: none;
      outline: none;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .product-image {
      height: 140px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image i {
      font-size: 2.5rem;
      color: #9ca3af;
    }

    .product-info {
      padding: 1rem;
    }

    .category-tag {
      font-size: 0.7rem;
      color: #f59e0b;
      background: #fffbeb;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }

    .product-info h3 {
      font-size: 0.95rem;
      margin: 0.5rem 0 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }

    .price {
      font-size: 1rem;
      font-weight: 600;
      color: #1e3a5f;
    }

    .unit {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      color: #6b7280;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
    }

    .empty-state i {
      font-size: 2.5rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .review-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .reviewer-info {
      display: flex;
      gap: 0.75rem;
    }

    .reviewer-info .avatar {
      width: 40px;
      height: 40px;
      background: #f0f9ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reviewer-info .avatar i {
      color: #1e3a5f;
    }

    .reviewer-info h4 {
      margin-bottom: 0.25rem;
    }

    .reviewer-info .date {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .rating i {
      color: #fbbf24;
    }

    .comment {
      color: #4b5563;
      line-height: 1.6;
    }

    .about-tab {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .about-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .about-card h3 {
      margin-bottom: 1rem;
      color: #1e3a5f;
    }

    .about-card p {
      color: #6b7280;
      line-height: 1.6;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .info-row i {
      color: #f59e0b;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 400px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .contact-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }

    .contact-option i {
      color: #f59e0b;
      font-size: 1.25rem;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .vendor-stats {
        justify-content: center;
      }

      .vendor-actions {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class VendorProfileComponent implements OnInit {
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    protected translate = inject(TranslateService);

    loading = signal(true);
    vendor = signal<Vendor | null>(null);

    activeTab = signal<'products' | 'reviews' | 'about'>('products');

    productsLoading = signal(false);
    products = signal<Product[]>([]);
    currentProductPage = signal(1);
    totalProductPages = signal(1);
    productSearch = '';

    reviewsLoading = signal(false);
    reviews = signal<Review[]>([]);

    showContactModal = false;

    private get apiUrl(): string {
        return (window as any).__API_URL__ || 'https://localhost:7001/api';
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const vendorId = params['id'];
            if (vendorId) {
                this.loadVendor(+vendorId);
            }
        });
    }

    private loadVendor(vendorId: number): void {
        this.loading.set(true);

        this.http.get<Vendor>(`${this.apiUrl}/marketplace/vendors/${vendorId}`).subscribe({
            next: (vendor) => {
                this.vendor.set(vendor);
                this.loading.set(false);
                this.loadProducts();
            },
            error: (error) => {
                console.error('Error loading vendor:', error);
                this.loading.set(false);
            }
        });
    }

    loadProducts(page: number = 1): void {
        const vendor = this.vendor();
        if (!vendor) return;

        this.productsLoading.set(true);
        this.currentProductPage.set(page);

        let url = `${this.apiUrl}/marketplace/vendors/${vendor.id}/products?page=${page}&pageSize=12`;

        this.http.get<ProductsResponse>(url).subscribe({
            next: (response) => {
                this.products.set(response.products || []);
                this.totalProductPages.set(response.pagination?.totalPages || 1);
                this.productsLoading.set(false);
            },
            error: (error) => {
                console.error('Error loading products:', error);
                this.productsLoading.set(false);
            }
        });
    }

    loadReviews(): void {
        const vendor = this.vendor();
        if (!vendor) return;

        this.reviewsLoading.set(true);

        this.http.get<ReviewsResponse>(`${this.apiUrl}/marketplace/vendors/${vendor.id}/reviews`).subscribe({
            next: (response) => {
                this.reviews.set(response.reviews || []);
                this.reviewsLoading.set(false);
            },
            error: (error) => {
                console.error('Error loading reviews:', error);
                this.reviewsLoading.set(false);
            }
        });
    }

    getDirections(): void {
        const vendor = this.vendor();
        if (vendor?.latitude && vendor?.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`, '_blank');
        } else if (vendor?.address) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.address)}`, '_blank');
        }
    }
}
