import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface ProductCategory {
  id: number;
  name: string;
  nameAr: string;
  icon: string | null;
  productCount: number;
  subCategories?: ProductCategory[];
}

interface FeaturedProduct {
  id: number;
  name: string;
  price: number;
  unit: string | null;
  imageUrl: string | null;
  vendorName: string;
  vendorId: number;
  categoryName: string;
}

interface FeaturedVendor {
  id: number;
  name: string;
  address: string | null;
  averageRating: number;
  totalOrders: number;
  productCount: number;
}

@Component({
  selector: 'app-marketplace-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="marketplace-home">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>{{ 'MARKETPLACE.TITLE' | translate }}</h1>
          <p>{{ 'MARKETPLACE.SUBTITLE' | translate }}</p>
          
          <!-- Search Bar -->
          <div class="search-container">
            <input type="text" 
                   [placeholder]="'MARKETPLACE.SEARCH_PLACEHOLDER' | translate"
                   [(ngModel)]="searchTerm"
                   (keyup.enter)="searchProducts()" />
            <button class="search-btn" (click)="searchProducts()">
              <i class="pi pi-search"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section">
        <h2>{{ 'MARKETPLACE.CATEGORIES' | translate }}</h2>
        <div class="categories-grid">
          @for (category of categories; track category.id) {
            <a [routerLink]="['/marketplace/products']" 
               [queryParams]="{categoryId: category.id}"
               class="category-card">
              <div class="category-icon">
                <i [class]="getCategoryIcon(category.icon)"></i>
              </div>
              <h3>{{ translate.currentLang === 'ar' ? category.nameAr : category.name }}</h3>
              <span class="product-count">{{ category.productCount }} {{ 'MARKETPLACE.PRODUCTS' | translate }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="featured-section">
        <div class="section-header">
          <h2>{{ 'MARKETPLACE.FEATURED_PRODUCTS' | translate }}</h2>
          <a [routerLink]="['/marketplace/products']" class="view-all">
            {{ 'MARKETPLACE.VIEW_ALL' | translate }}
            <i class="pi pi-arrow-right"></i>
          </a>
        </div>
        <div class="products-grid">
          @for (product of featuredProducts; track product.id) {
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
                <p class="vendor-name">{{ product.vendorName }}</p>
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
      </section>

      <!-- Nearby Vendors Section -->
      <section class="vendors-section">
        <div class="section-header">
          <h2>{{ 'MARKETPLACE.NEARBY_VENDORS' | translate }}</h2>
          <a [routerLink]="['/marketplace/nearby']" class="view-all">
            {{ 'MARKETPLACE.VIEW_ALL' | translate }}
            <i class="pi pi-arrow-right"></i>
          </a>
        </div>
        <div class="vendors-grid">
          @for (vendor of featuredVendors; track vendor.id) {
            <div class="vendor-card" [routerLink]="['/marketplace/vendors', vendor.id]">
              <div class="vendor-header">
                <div class="vendor-avatar">
                  <i class="pi pi-building"></i>
                </div>
                <div class="vendor-info">
                  <h3>{{ vendor.name }}</h3>
                  <p class="address">{{ vendor.address }}</p>
                </div>
              </div>
              <div class="vendor-stats">
                <div class="stat">
                  <i class="pi pi-star"></i>
                  <span>{{ vendor.averageRating | number:'1.0-1' }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-shopping-cart"></i>
                  <span>{{ vendor.totalOrders }} {{ 'MARKETPLACE.ORDERS' | translate }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-box"></i>
                  <span>{{ vendor.productCount }} {{ 'MARKETPLACE.PRODUCTS' | translate }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <a [routerLink]="['/marketplace/nearby']" class="action-card">
          <i class="pi pi-map-marker"></i>
          <span>{{ 'MARKETPLACE.FIND_NEARBY' | translate }}</span>
        </a>
        <a [routerLink]="['/marketplace/orders']" class="action-card">
          <i class="pi pi-list"></i>
          <span>{{ 'MARKETPLACE.MY_ORDERS' | translate }}</span>
        </a>
        <a [routerLink]="['/marketplace/cart']" class="action-card">
          <i class="pi pi-shopping-cart"></i>
          <span>{{ 'MARKETPLACE.CART' | translate }}</span>
        </a>
      </section>
    </div>
  `,
  styles: [`
    .marketplace-home {
      padding: 0;
    }

    .hero-section {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .hero-content p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 1.5rem;
    }

    .search-container {
      display: flex;
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .search-container input {
      flex: 1;
      padding: 1rem 1.5rem;
      border: none;
      font-size: 1rem;
      outline: none;
    }

    .search-btn {
      padding: 1rem 1.5rem;
      background: #f59e0b;
      border: none;
      color: white;
      cursor: pointer;
      transition: background 0.3s;
    }

    .search-btn:hover {
      background: #d97706;
    }

    .categories-section, .featured-section, .vendors-section {
      padding: 2rem;
    }

    .categories-section h2, .featured-section h2, .vendors-section h2 {
      margin-bottom: 1.5rem;
      color: #1e3a5f;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      color: #1e3a5f;
    }

    .view-all {
      color: #f59e0b;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .category-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      text-decoration: none;
      color: inherit;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .category-icon {
      width: 60px;
      height: 60px;
      background: #f0f9ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .category-icon i {
      font-size: 1.5rem;
      color: #1e3a5f;
    }

    .category-card h3 {
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }

    .product-count {
      font-size: 0.8rem;
      color: #6b7280;
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
      height: 160px;
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

    .placeholder-image {
      color: #9ca3af;
    }

    .placeholder-image i {
      font-size: 3rem;
    }

    .product-info {
      padding: 1rem;
    }

    .category-tag {
      font-size: 0.75rem;
      color: #f59e0b;
      background: #fffbeb;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .product-info h3 {
      font-size: 1rem;
      margin: 0.5rem 0 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .vendor-name {
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
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a5f;
    }

    .unit {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .vendors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .vendor-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .vendor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .vendor-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .vendor-avatar {
      width: 50px;
      height: 50px;
      background: #f0f9ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vendor-avatar i {
      font-size: 1.25rem;
      color: #1e3a5f;
    }

    .vendor-info h3 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .address {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .vendor-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .stat i {
      color: #f59e0b;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding: 2rem;
      background: #f9fafb;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .action-card i {
      font-size: 1.5rem;
      color: #1e3a5f;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 1.75rem;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }

      .categories-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class MarketplaceHomeComponent implements OnInit {
  private http = inject(HttpClient);
  protected translate = inject(TranslateService);

  searchTerm = '';
  categories: ProductCategory[] = [];
  featuredProducts: FeaturedProduct[] = [];
  featuredVendors: FeaturedVendor[] = [];

  private get apiUrl(): string {
    return (window as any).__API_URL__ || 'https://localhost:7001/api';
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
    this.loadFeaturedVendors();
  }

  private loadCategories(): void {
    this.http.get<any[]>(`${this.apiUrl}/marketplace/categories`).subscribe({
      next: (data) => {
        this.categories = data.slice(0, 8);
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  private loadFeaturedProducts(): void {
    this.http.get<any>(`${this.apiUrl}/marketplace/products?pageSize=4`).subscribe({
      next: (response) => {
        this.featuredProducts = response.products || [];
      },
      error: (error) => console.error('Error loading featured products:', error)
    });
  }

  private loadFeaturedVendors(): void {
    // Get user location for nearby vendors
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.http.get<any[]>(`${this.apiUrl}/marketplace/vendors/nearby?latitude=${lat}&longitude=${lng}&radiusKm=50`).subscribe({
            next: (data) => {
              this.featuredVendors = data.slice(0, 3);
            },
            error: (error) => console.error('Error loading vendors:', error)
          });
        },
        () => {
          // If location not available, show empty
          this.featuredVendors = [];
        }
      );
    }
  }

  searchProducts(): void {
    if (this.searchTerm.trim()) {
      window.location.href = `/marketplace/products?search=${encodeURIComponent(this.searchTerm)}`;
    }
  }

  getCategoryIcon(icon: string | null): string {
    const iconMap: Record<string, string> = {
      'building': 'pi pi-building',
      'paint': 'pi pi-palette',
      'door': 'pi pi-window-maximize',
      'bath': 'pi pi-sliders-h',
      'bolt': 'pi pi-bolt',
      'plumbing': 'pi pi-wrench'
    };
    return iconMap[icon || 'building'] || 'pi pi-box';
  }
}
