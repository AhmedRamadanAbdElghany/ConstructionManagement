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
      background: var(--app-bg);
      color: var(--app-text);
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

    .vendor-header {
      background: linear-gradient(135deg, var(--header-gradient-start, #1e3a5f) 0%, var(--header-gradient-end, #2d5a87) 100%);
      color: white;
      padding: 4rem 2rem;
      position: relative;
      overflow: hidden;
    }

    :host-context(.dark) {
      --header-gradient-start: #1e293b;
      --header-gradient-end: #0f172a;
    }

    :host-context(:not(.dark)) {
      --header-gradient-start: #3b82f6;
      --header-gradient-end: #2563eb;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 10;
    }

    .vendor-avatar {
      width: 120px;
      height: 120px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      transition: all 0.4s ease;
    }

    .vendor-avatar:hover {
      transform: rotate(-5deg) scale(1.05);
      border-color: white;
    }

    .vendor-avatar i {
      font-size: 3.5rem;
      color: white;
    }

    .vendor-info {
      flex: 1;
    }

    .vendor-info h1 {
      font-size: 3rem;
      font-weight: 950;
      margin-bottom: 0.75rem;
      letter-spacing: -0.04em;
    }

    .address {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      opacity: 0.9;
      margin-bottom: 2rem;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .vendor-stats {
      display: flex;
      gap: 3rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .stat i {
      color: #fbbf24;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
      filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4));
    }

    .stat .value {
      font-size: 1.5rem;
      font-weight: 950;
      letter-spacing: -0.02em;
    }

    .stat .label {
      font-size: 0.8rem;
      opacity: 0.7;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .vendor-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contact-btn, .directions-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      border-radius: 16px;
      font-weight: 850;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.85rem;
      min-width: 180px;
    }

    .contact-btn {
      background: white;
      color: #2563eb;
      border: none;
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }

    .contact-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.15);
      background: #f8fafc;
    }

    .directions-btn {
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
    }

    .directions-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-3px);
      border-color: white;
    }

    .tabs-container {
      background: var(--card-bg);
      border-bottom: 1px solid var(--glass-border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .tabs button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 2rem;
      background: none;
      border: none;
      border-bottom: 4px solid transparent;
      cursor: pointer;
      color: var(--muted-text);
      font-weight: 800;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 0.85rem;
    }

    .tabs button:hover {
      color: var(--app-text);
      background: var(--input-bg);
    }

    .tabs button.active {
      color: var(--accent-blue);
      border-bottom-color: var(--accent-blue);
    }

    .tab-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    .filter-bar {
      margin-bottom: 2.5rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 0 1.5rem;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      transition: all 0.3s ease;
    }

    .search-box:focus-within {
      border-color: var(--accent-blue);
      box-shadow: 0 8px 24px rgba(14, 165, 233, 0.1);
    }

    .search-box i {
      color: var(--muted-text);
      font-size: 1.1rem;
    }

    .search-box input {
      flex: 1;
      padding: 1rem 0;
      border: none;
      outline: none;
      background: transparent;
      color: var(--app-text);
      font-weight: 600;
      font-size: 1rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 2rem;
    }

    .product-card {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 28px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 30px 60px rgba(0,0,0,0.08);
      border-color: var(--accent-blue);
    }

    .product-image {
      height: 180px;
      background: var(--input-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.1);
    }

    .placeholder-image i {
      font-size: 3rem;
      color: var(--muted-text);
      opacity: 0.4;
    }

    .product-info {
      padding: 1.75rem;
    }

    .category-tag {
      font-size: 0.7rem;
      font-weight: 850;
      color: var(--accent-blue);
      background: rgba(14, 165, 233, 0.1);
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .product-info h3 {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 1.25rem 0 0.5rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--app-text);
      letter-spacing: -0.01em;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 950;
      color: var(--app-text);
      letter-spacing: -0.02em;
    }

    .unit {
      font-size: 0.95rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      margin-top: 4rem;
    }

    .page-btn {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--app-text);
    }

    .page-btn:hover:not(:disabled) {
      background: var(--accent-blue);
      color: white;
      border-color: transparent;
      transform: scale(1.1);
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-info {
      color: var(--app-text);
      font-weight: 800;
      font-size: 1rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      text-align: center;
    }

    .empty-state i {
      font-size: 4rem;
      color: var(--muted-text);
      margin-bottom: 2rem;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--muted-text);
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .review-card {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 28px;
      padding: 2.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .reviewer-info {
      display: flex;
      gap: 1.25rem;
    }

    .reviewer-info .avatar {
      width: 52px;
      height: 52px;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reviewer-info .avatar i {
      color: var(--accent-blue);
      font-size: 1.5rem;
    }

    .reviewer-info h4 {
      margin: 0 0 0.25rem;
      font-size: 1.15rem;
      font-weight: 800;
    }

    .reviewer-info .date {
      font-size: 0.85rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .rating i {
      color: #fbbf24;
      font-size: 1.1rem;
      margin-left: 2px;
    }

    .comment {
      color: var(--app-text);
      line-height: 1.7;
      font-size: 1.05rem;
      font-weight: 500;
    }

    .about-tab {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .about-card {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 28px;
      padding: 2.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .about-card h3 {
      margin-bottom: 2rem;
      color: var(--app-text);
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .about-card p {
      color: var(--app-text);
      line-height: 1.8;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 18px;
      transition: all 0.3s ease;
    }

    .info-row:hover {
      border-color: var(--accent-amber);
      transform: translateX(8px);
    }

    .info-row i {
      color: var(--accent-amber);
      font-size: 1.5rem;
    }

    .info-row span {
      font-weight: 700;
      font-size: 1.1rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: modalSlideUp 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    @keyframes modalSlideUp {
       from { transform: translateY(50px); opacity: 0; }
       to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.75rem 2.25rem;
      border-bottom: 1px solid var(--glass-border);
    }

    .modal-header h3 {
       font-weight: 900;
       letter-spacing: -0.01em;
       margin: 0;
    }

    .modal-header button {
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      cursor: pointer;
      padding: 0.6rem;
      color: var(--app-text);
      transition: all 0.3s ease;
    }

    .modal-header button:hover {
       background: #ef4444;
       color: white;
       border-color: transparent;
    }

    .modal-body {
      padding: 2.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .contact-option {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      transition: all 0.3s ease;
    }

    .contact-option:hover {
      border-color: var(--accent-blue);
      transform: scale(1.02);
    }

    .contact-option i {
       font-size: 1.5rem;
       color: var(--accent-blue);
    }

    .contact-option span {
       font-weight: 800;
       font-size: 1.15rem;
    }

    @media (max-width: 768px) {
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
