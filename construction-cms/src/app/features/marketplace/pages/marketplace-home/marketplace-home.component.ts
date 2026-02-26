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
    <div class="marketplace-home-premium">
      <!-- Hero Section with Futuristic Background -->
      <section class="hero-section-premium">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="badge-premium">{{ 'MARKETPLACE.TITLE' | translate }}</div>
          <h1>{{ 'MARKETPLACE.HOME' | translate }}</h1>
          <p>{{ 'MARKETPLACE.SUBTITLE' | translate }}</p>
          
          <!-- Modern Search Bar -->
          <div class="search-wrapper">
            <div class="search-container-glass">
              <i class="pi pi-search search-icon"></i>
              <input type="text" 
                     [placeholder]="'MARKETPLACE.SEARCH_PLACEHOLDER' | translate"
                     [(ngModel)]="searchTerm"
                     (keyup.enter)="searchProducts()" />
              <button class="search-btn-premium" (click)="searchProducts()">
                <span>{{ 'MARKETPLACE.SEARCH' | translate }}</span>
                <i class="pi pi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div class="content-shell">
        <!-- Categories Section -->
        <section class="categories-section-premium">
          <div class="section-header">
            <div class="header-title">
              <h2>{{ 'MARKETPLACE.CATEGORIES' | translate }}</h2>
              <div class="title-underline"></div>
            </div>
          </div>
          <div class="categories-grid">
            @for (category of categories; track category.id) {
              <a [routerLink]="['/marketplace/products']" 
                 [queryParams]="{categoryId: category.id}"
                 class="category-card-glass group">
                <div class="category-icon-wrapper">
                  <div class="icon-glow"></div>
                  <i [class]="getCategoryIcon(category.icon)"></i>
                </div>
                <h3>{{ translate.currentLang === 'ar' ? category.nameAr : category.name }}</h3>
                <span class="product-count">{{ category.productCount }} {{ 'MARKETPLACE.PRODUCTS' | translate }}</span>
              </a>
            }
          </div>
        </section>

        <!-- Featured Products Section -->
        <section class="featured-section-premium">
          <div class="section-header">
            <div class="header-title">
              <h2>{{ 'MARKETPLACE.FEATURED_PRODUCTS' | translate }}</h2>
              <div class="title-underline"></div>
            </div>
            <a [routerLink]="['/marketplace/products']" class="view-all-premium group">
              <span>{{ 'MARKETPLACE.VIEW_ALL' | translate }}</span>
              <div class="arrow-circle">
                <i class="pi pi-arrow-right"></i>
              </div>
            </a>
          </div>
          <div class="products-grid-premium">
            @for (product of featuredProducts; track product.id) {
              <div class="product-card-premium" [routerLink]="['/marketplace/products', product.id]">
                <div class="product-image-wrapper">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.name">
                  } @else {
                    <div class="placeholder-image-premium">
                      <i class="pi pi-box"></i>
                    </div>
                  }
                  <div class="image-overlay">
                    <button class="quick-view-btn">
                      <i class="pi pi-eye"></i>
                    </button>
                  </div>
                </div>
                <div class="product-card-body">
                  <span class="category-tag-premium">{{ product.categoryName }}</span>
                  <h3>{{ product.name }}</h3>
                  <div class="vendor-info-row">
                    <i class="pi pi-building"></i>
                    <span>{{ product.vendorName }}</span>
                  </div>
                  <div class="price-footer">
                    <div class="price-box">
                      <span class="price-amount">{{ product.price | currency:'EGP':'symbol':'1.0-2' }}</span>
                      @if (product.unit) {
                        <span class="price-unit">/ {{ product.unit }}</span>
                      }
                    </div>
                    <button class="add-to-cart-small" (click)="$event.stopPropagation()">
                      <i class="pi pi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Nearby Vendors Section -->
        <section class="vendors-section-premium">
          <div class="section-header">
            <div class="header-title">
              <h2>{{ 'MARKETPLACE.NEARBY_VENDORS' | translate }}</h2>
              <div class="title-underline"></div>
            </div>
            <a [routerLink]="['/marketplace/nearby']" class="view-all-premium group">
              <span>{{ 'MARKETPLACE.VIEW_ALL' | translate }}</span>
              <div class="arrow-circle">
                <i class="pi pi-arrow-right"></i>
              </div>
            </a>
          </div>
          <div class="vendors-grid-premium">
            @for (vendor of featuredVendors; track vendor.id) {
              <div class="vendor-card-premium" [routerLink]="['/marketplace/vendors', vendor.id]">
                <div class="vendor-glow"></div>
                <div class="vendor-top">
                  <div class="vendor-portrait">
                    <i class="pi pi-building"></i>
                  </div>
                  <div class="vendor-main-info">
                    <h3>{{ vendor.name }}</h3>
                    <div class="location-badge">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ vendor.address || 'MARKETPLACE.NO_ADDRESS' | translate }}</span>
                    </div>
                  </div>
                </div>
                <div class="vendor-metrics">
                  <div class="metric-item">
                    <span class="metric-value">{{ vendor.averageRating | number:'1.0-1' }}</span>
                    <span class="metric-label"><i class="pi pi-star-fill"></i> {{ 'MARKETPLACE.RATING' | translate }}</span>
                  </div>
                  <div class="metric-divider"></div>
                  <div class="metric-item">
                    <span class="metric-value">{{ vendor.productCount }}</span>
                    <span class="metric-label">{{ 'MARKETPLACE.PRODUCTS' | translate }}</span>
                  </div>
                </div>
                <button class="visit-store-btn">
                  <span>{{ 'MARKETPLACE.VIEW_PROFILE' | translate }}</span>
                </button>
              </div>
            }
          </div>
        </section>

        <!-- Quick Experience Actions -->
        <section class="experience-actions">
          <a [routerLink]="['/marketplace/nearby']" class="exp-card highlight-cyan">
            <div class="exp-icon"><i class="pi pi-map-marker"></i></div>
            <div class="exp-text">
              <h4>{{ 'MARKETPLACE.FIND_NEARBY' | translate }}</h4>
              <p>Locate suppliers on map</p>
            </div>
            <i class="pi pi-chevron-right exp-arrow"></i>
          </a>
          <a [routerLink]="['/marketplace/orders']" class="exp-card highlight-amber">
            <div class="exp-icon"><i class="pi pi-list"></i></div>
            <div class="exp-text">
              <h4>{{ 'MARKETPLACE.MY_ORDERS' | translate }}</h4>
              <p>Track your procurements</p>
            </div>
            <i class="pi pi-chevron-right exp-arrow"></i>
          </a>
          <a [routerLink]="['/marketplace/cart']" class="exp-card highlight-emerald">
            <div class="exp-icon"><i class="pi pi-shopping-cart"></i></div>
            <div class="exp-text">
              <h4>{{ 'MARKETPLACE.CART' | translate }}</h4>
              <p>Complete your purchase</p>
            </div>
            <i class="pi pi-chevron-right exp-arrow"></i>
          </a>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .marketplace-home-premium {
      min-height: 100vh;
      background: var(--app-bg);
      color: var(--app-text);
      padding-bottom: 5rem;
      transition: all 0.3s ease;
    }

    /* Hero Section */
    .hero-section-premium {
      position: relative;
      height: 520px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background-image: url('https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=2070');
      background-size: cover;
      background-position: center;
      margin-bottom: -60px;
      clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, var(--hero-start, rgba(15, 23, 42, 0.7)), var(--hero-end, rgba(15, 23, 42, 0.95)));
      backdrop-filter: blur(4px);
    }

    :host-context(.dark) {
       --hero-start: rgba(15, 23, 42, 0.8);
       --hero-end: rgba(15, 23, 42, 0.98);
    }

    :host-context(:not(.dark)) {
       --hero-start: rgba(255, 255, 255, 0.6);
       --hero-end: rgba(255, 255, 255, 0.9);
    }

    .hero-content {
      position: relative;
      z-index: 10;
      max-width: 850px;
      padding: 0 2rem;
    }

    .badge-premium {
      display: inline-block;
      padding: 7px 18px;
      background: rgba(14, 165, 233, 0.1);
      border: 1px solid rgba(14, 165, 233, 0.2);
      border-radius: 100px;
      color: var(--accent-blue);
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .hero-content h1 {
      font-size: 4.5rem;
      font-weight: 950;
      margin-bottom: 1.25rem;
      color: var(--app-text);
      letter-spacing: -0.05em;
      line-height: 1.1;
    }

    :host-context(.dark) .hero-content h1 {
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-content p {
      font-size: 1.4rem;
      color: var(--muted-text);
      margin-bottom: 3rem;
      line-height: 1.6;
      font-weight: 600;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Search Bar */
    .search-wrapper {
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
    }

    .search-container-glass {
      display: flex;
      align-items: center;
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 10px 10px 10px 30px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .search-container-glass:focus-within {
      background: var(--card-bg);
      border-color: var(--accent-blue);
      box-shadow: 0 30px 60px rgba(56, 189, 248, 0.2);
      transform: scale(1.02);
    }

    .search-icon {
      color: var(--accent-blue);
      font-size: 1.5rem;
      margin-right: 1.25rem;
    }

    .search-container-glass input {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--app-text);
      font-size: 1.2rem;
      outline: none;
      padding: 0.75rem 0;
      font-weight: 700;
    }

    .search-btn-premium {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, var(--accent-blue) 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 18px;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
    }

    .search-btn-premium:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 20px 40px rgba(14, 165, 233, 0.4);
    }

    /* Content Shell */
    .content-shell {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      position: relative;
      z-index: 20;
    }

    /* Sections Shared */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 3rem;
    }

    .header-title h2 {
      font-size: 2.5rem;
      font-weight: 950;
      margin-bottom: 0.75rem;
      color: var(--app-text);
      letter-spacing: -0.04em;
    }

    .title-underline {
      width: 100px;
      height: 6px;
      background: linear-gradient(to right, var(--accent-blue), transparent);
      border-radius: 3px;
    }

    .view-all-premium {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      color: var(--muted-text);
      text-decoration: none;
      font-weight: 800;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .view-all-premium:hover {
      color: var(--accent-blue);
    }

    .arrow-circle {
      width: 52px;
      height: 52px;
      border-radius: 18px;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      color: var(--muted-text);
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .view-all-premium:hover .arrow-circle {
      background: var(--accent-blue);
      color: white;
      transform: translateX(8px) rotate(-15deg);
      border-color: transparent;
      box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2);
    }

    /* Categories Grid */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 2rem;
      margin-bottom: 6rem;
    }

    .category-card-glass {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 3rem 2rem;
      text-align: center;
      text-decoration: none;
      color: inherit;
      transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    }

    .category-card-glass:hover {
      transform: translateY(-12px);
      border-color: var(--accent-blue);
      box-shadow: 0 30px 60px rgba(0,0,0,0.08);
    }

    .category-icon-wrapper {
      width: 90px;
      height: 90px;
      margin: 0 auto 2rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.4s ease;
    }

    .category-card-glass:hover .category-icon-wrapper {
      background: var(--accent-blue);
      border-color: transparent;
      transform: scale(1.1) rotate(10deg);
      box-shadow: 0 15px 30px rgba(14, 165, 233, 0.3);
    }

    .category-icon-wrapper i {
      font-size: 2.5rem;
      color: var(--accent-blue);
      z-index: 2;
      transition: all 0.3s ease;
    }

    .category-card-glass:hover .category-icon-wrapper i {
      color: white;
    }

    .icon-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, var(--accent-blue) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .category-card-glass:hover .icon-glow {
      opacity: 0.4;
    }

    .category-card-glass h3 {
      font-size: 1.5rem;
      font-weight: 900;
      margin-bottom: 0.75rem;
      color: var(--app-text);
      letter-spacing: -0.02em;
    }

    .product-count {
      font-size: 0.9rem;
      color: var(--muted-text);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* Products Grid */
    .featured-section-premium {
      margin-bottom: 5rem;
    }

    .products-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .product-card-premium {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 28px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
    }

    .product-card-premium:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
      border-color: var(--accent-blue);
    }

    .product-image-wrapper {
      height: 240px;
      position: relative;
      background: var(--input-bg);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .product-card-premium:hover .product-image-wrapper img {
      transform: scale(1.1);
    }

    .placeholder-image-premium {
      color: var(--muted-text);
      opacity: 0.5;
    }

    .placeholder-image-premium i {
      font-size: 4rem;
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card-premium:hover .image-overlay {
      opacity: 1;
    }

    .quick-view-btn {
      width: 50px;
      height: 50px;
      border-radius: 15px;
      background: white;
      color: #0f172a;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      transform: translateY(20px);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-card-premium:hover .quick-view-btn {
      transform: translateY(0);
    }

    .product-card-body {
      padding: 1.75rem;
    }

    .category-tag-premium {
      font-size: 0.7rem;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent-blue);
      background: rgba(14, 165, 233, 0.1);
      padding: 6px 12px;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: inline-block;
    }

    .product-card-body h3 {
      font-size: 1.4rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      color: var(--app-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.01em;
    }

    .vendor-info-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--muted-text);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }

    .price-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }

    .price-amount {
      font-size: 1.6rem;
      font-weight: 950;
      color: var(--app-text);
      letter-spacing: -0.02em;
    }

    .price-unit {
      font-size: 0.95rem;
      color: var(--muted-text);
      margin-left: 0.4rem;
      font-weight: 600;
    }

    .add-to-cart-small {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: var(--input-bg);
      color: var(--app-text);
      border: 1px solid var(--glass-border);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-to-cart-small:hover {
      background: var(--accent-blue);
      color: white;
      transform: scale(1.1) rotate(90deg);
      border-color: transparent;
      box-shadow: 0 10px 20px rgba(56, 189, 248, 0.3);
    }

    /* Vendors Grid */
    .vendors-section-premium {
      margin-bottom: 5rem;
    }

    .vendors-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .vendor-card-premium {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 2.25rem;
      position: relative;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      overflow: hidden;
    }

    .vendor-card-premium:hover {
      background: var(--card-bg);
      border-color: var(--accent-amber);
      transform: translateY(-8px);
      box-shadow: 0 30px 60px rgba(0,0,0,0.1);
    }

    .vendor-glow {
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, var(--accent-amber) 0%, transparent 70%);
      pointer-events: none;
      opacity: 0.05;
    }

    .vendor-card-premium:hover .vendor-glow {
      opacity: 0.15;
    }

    .vendor-top {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .vendor-portrait {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-amber);
      font-size: 2rem;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .vendor-card-premium:hover .vendor-portrait {
      background: var(--accent-amber);
      color: white;
      border-color: transparent;
      transform: scale(1.1) rotate(-5deg);
    }

    .vendor-main-info h3 {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--app-text);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .location-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--muted-text);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .vendor-metrics {
      display: flex;
      align-items: center;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 1.5rem;
      margin-bottom: 2.25rem;
      transition: all 0.3s ease;
    }

    .vendor-card-premium:hover .vendor-metrics {
      background: var(--card-bg);
      border-color: rgba(245, 158, 11, 0.2);
    }

    .metric-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 950;
      color: var(--app-text);
      letter-spacing: -0.02em;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--muted-text);
      font-weight: 700;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      letter-spacing: 0.05em;
    }

    .metric-label i {
      color: var(--accent-amber);
      font-size: 0.7rem;
    }

    .metric-divider {
      width: 1px;
      height: 40px;
      background: var(--glass-border);
    }

    .visit-store-btn {
      width: 100%;
      padding: 16px;
      border-radius: 18px;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      color: var(--app-text);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .vendor-card-premium:hover .visit-store-btn {
      background: var(--accent-amber);
      color: white;
      border-color: transparent;
      box-shadow: 0 15px 30px rgba(245, 158, 11, 0.3);
      transform: translateY(-2px);
    }

    /* Experience Actions */
    .experience-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      margin-top: 4rem;
    }

    .exp-card {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 2.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      text-decoration: none;
      color: var(--app-text);
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
      position: relative;
      overflow: hidden;
    }

    .exp-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 25px 50px rgba(0,0,0,0.06);
      background: var(--input-bg);
      border-color: var(--accent-blue);
    }

    .exp-icon {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      transition: all 0.4s ease;
    }

    .exp-card:hover .exp-icon {
       transform: rotate(-10deg) scale(1.1);
       background: var(--accent-blue);
       color: white;
       border-color: transparent;
    }

    .exp-text h4 {
      font-size: 1.25rem;
      font-weight: 950;
      color: var(--app-text);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .exp-text p {
      font-size: 0.95rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .exp-arrow {
      margin-left: auto;
      font-size: 1.25rem;
      color: var(--muted-text);
      transition: all 0.3s ease;
    }

    .exp-card:hover .exp-arrow {
      color: var(--accent-blue);
      transform: translateX(8px);
    }

    .highlight-cyan .exp-icon { color: var(--accent-blue); }
    .highlight-amber .exp-icon { color: var(--accent-amber); }
    .highlight-emerald .exp-icon { color: #10b981; }

    @media (max-width: 1200px) {
       .hero-content h1 { font-size: 3.5rem; }
       .experience-actions { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .categories-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
      .hero-content h1 { font-size: 2.5rem; }
      .search-container-glass { flex-direction: column; padding: 2rem; gap: 1.5rem; }
      .search-container-glass input { width: 100%; text-align: center; }
      .search-btn-premium { width: 100%; justify-content: center; }
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
