import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface ProductCategory {
  id: number;
  name: string;
  nameAr: string;
  icon: string | null;
  productCount: number;
}

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

@Component({
  selector: 'app-marketplace-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="products-page">
      <!-- Header -->
      <div class="page-header">
        <h1>{{ 'MARKETPLACE.ALL_PRODUCTS' | translate }}</h1>
        <div class="breadcrumb">
          <a [routerLink]="['/marketplace']">{{ 'MARKETPLACE.HOME' | translate }}</a>
          <span>/</span>
          <span>{{ 'MARKETPLACE.PRODUCTS' | translate }}</span>
        </div>
      </div>

      <div class="content-layout">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar">
          <div class="filter-section">
            <h3>{{ 'MARKETPLACE.CATEGORIES' | translate }}</h3>
            <div class="category-list">
              @for (category of categories; track category.id) {
                <button 
                  class="category-btn"
                  [class.active]="selectedCategoryId() === category.id"
                  (click)="selectCategory(category.id)">
                  <span>{{ translate.currentLang === 'ar' ? category.nameAr : category.name }}</span>
                  <span class="count">{{ category.productCount }}</span>
                </button>
              }
            </div>
          </div>

          <div class="filter-section">
            <h3>{{ 'MARKETPLACE.PRICE_RANGE' | translate }}</h3>
            <div class="price-inputs">
              <input type="number" 
                     [placeholder]="'MARKETPLACE.MIN' | translate"
                     [(ngModel)]="minPrice"
                     (change)="applyFilters()" />
              <span>-</span>
              <input type="number" 
                     [placeholder]="'MARKETPLACE.MAX' | translate"
                     [(ngModel)]="maxPrice"
                     (change)="applyFilters()" />
            </div>
          </div>

          <button class="clear-filters" (click)="clearFilters()">
            <i class="pi pi-times"></i>
            {{ 'MARKETPLACE.CLEAR_FILTERS' | translate }}
          </button>
        </aside>

        <!-- Products Grid -->
        <main class="products-main">
          <!-- Search and Sort Bar -->
          <div class="toolbar">
            <div class="search-box">
              <i class="pi pi-search"></i>
              <input type="text" 
                     [placeholder]="'MARKETPLACE.SEARCH_PRODUCTS' | translate"
                     [(ngModel)]="searchTerm"
                     (keyup.enter)="applyFilters()" />
            </div>
            <div class="sort-select">
              <select [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="relevance">{{ 'MARKETPLACE.SORT_RELEVANCE' | translate }}</option>
                <option value="price_asc">{{ 'MARKETPLACE.SORT_PRICE_LOW' | translate }}</option>
                <option value="price_desc">{{ 'MARKETPLACE.SORT_PRICE_HIGH' | translate }}</option>
                <option value="name">{{ 'MARKETPLACE.SORT_NAME' | translate }}</option>
              </select>
            </div>
          </div>

          <!-- Results Count -->
          <div class="results-info">
            {{ productsResponse()?.pagination?.totalCount || 0 }} {{ 'MARKETPLACE.PRODUCTS_FOUND' | translate }}
          </div>

          <!-- Loading State -->
          @if (loading()) {
            <div class="loading-state">
              <i class="pi pi-spinner pi-spin"></i>
              <p>{{ 'MARKETPLACE.LOADING' | translate }}</p>
            </div>
          }

          <!-- Empty State -->
          @if (!loading() && products().length === 0) {
            <div class="empty-state">
              <i class="pi pi-box"></i>
              <h3>{{ 'MARKETPLACE.NO_PRODUCTS' | translate }}</h3>
              <p>{{ 'MARKETPLACE.TRY_DIFFERENT_FILTERS' | translate }}</p>
              <button (click)="clearFilters()">{{ 'MARKETPLACE.CLEAR_FILTERS' | translate }}</button>
            </div>
          }

          <!-- Products Grid -->
          @if (!loading() && products().length > 0) {
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
                    @if (product.quantityInStock < 10) {
                      <span class="low-stock">{{ 'MARKETPLACE.LOW_STOCK' | translate }}</span>
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

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="pagination">
                <button 
                  class="page-btn"
                  [disabled]="currentPage() === 1"
                  (click)="goToPage(currentPage() - 1)">
                  <i class="pi pi-chevron-left"></i>
                </button>
                
                @for (page of getPageNumbers(); track page) {
                  <button 
                    class="page-btn"
                    [class.active]="currentPage() === page"
                    (click)="goToPage(page)">
                    {{ page }}
                  </button>
                }
                
                <button 
                  class="page-btn"
                  [disabled]="currentPage() === totalPages()"
                  (click)="goToPage(currentPage() + 1)">
                  <i class="pi pi-chevron-right"></i>
                </button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .products-page {
      min-height: 100vh;
      background: var(--app-bg);
      color: var(--app-text);
      transition: all 0.3s ease;
    }

    .page-header {
      background: var(--card-bg);
      padding: 2rem;
      border-bottom: 1px solid var(--glass-border);
    }

    .page-header h1 {
      margin: 0 0 0.5rem;
      color: var(--app-text);
      font-weight: 850;
    }

    .breadcrumb {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .breadcrumb a {
      color: var(--accent-blue);
      text-decoration: none;
    }

    .content-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2.5rem;
      padding: 2.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filters-sidebar {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 1.75rem;
      height: fit-content;
      position: sticky;
      top: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }

    .filter-section {
      margin-bottom: 2rem;
    }

    .filter-section h3 {
      font-size: 0.8rem;
      font-weight: 850;
      margin-bottom: 1.25rem;
      color: var(--app-text);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .category-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.15rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
      width: 100%;
      color: var(--app-text);
      font-weight: 600;
    }

    .category-btn:hover {
      background: var(--glass-bg);
      border-color: var(--accent-blue);
      transform: translateX(4px);
    }

    .category-btn.active {
      background: var(--accent-blue);
      color: white;
      border-color: var(--accent-blue);
      box-shadow: 0 8px 16px rgba(14, 165, 233, 0.2);
    }

    .category-btn .count {
      font-size: 0.75rem;
      background: var(--glass-border);
      padding: 0.125rem 0.6rem;
      border-radius: 10px;
      font-weight: 800;
    }

    .category-btn.active .count {
      background: rgba(255,255,255,0.2);
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .price-inputs input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      width: 100%;
      background: var(--input-bg);
      color: var(--app-text);
      font-weight: 600;
      outline: none;
      transition: all 0.3s ease;
    }

    .price-inputs input:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }

    .clear-filters {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.85rem;
      background: transparent;
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      color: var(--muted-text);
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.05em;
    }

    .clear-filters:hover {
      background: rgba(239, 68, 68, 0.05);
      border-color: #ef4444;
      color: #ef4444;
    }

    .products-main {
      min-height: 500px;
    }

    .toolbar {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .search-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      padding: 0 1.25rem;
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
      padding: 0.9rem 0;
      border: none;
      outline: none;
      background: transparent;
      color: var(--app-text);
      font-weight: 600;
      font-size: 1rem;
    }

    .sort-select select {
      padding: 0.9rem 2.5rem 0.9rem 1.25rem;
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      background: var(--card-bg);
      color: var(--app-text);
      cursor: pointer;
      font-weight: 600;
      outline: none;
      transition: all 0.3s ease;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1rem;
    }

    .sort-select select:focus {
      border-color: var(--accent-blue);
    }

    .results-info {
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
    }

    .loading-state i, .empty-state i {
      font-size: 3.5rem;
      color: var(--accent-blue);
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      margin-bottom: 0.75rem;
      font-weight: 900;
      color: var(--app-text);
    }

    .empty-state p {
      color: var(--muted-text);
      margin-bottom: 2rem;
      font-weight: 500;
    }

    .empty-state button {
      padding: 0.9rem 2rem;
      background: var(--accent-blue);
      color: white;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.3s ease;
    }

    .empty-state button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 2rem;
    }

    .product-card {
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      border-color: var(--accent-blue);
    }

    .product-image {
      height: 200px;
      background: var(--input-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
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
      font-size: 3.5rem;
      color: var(--muted-text);
      opacity: 0.4;
    }

    .low-stock {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 900;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    .product-info {
      padding: 1.5rem;
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
      font-size: 1.15rem;
      font-weight: 800;
      margin: 1rem 0 0.4rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--app-text);
      letter-spacing: -0.01em;
    }

    .vendor-name {
      font-size: 0.9rem;
      color: var(--muted-text);
      margin-bottom: 1.25rem;
      font-weight: 600;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
    }

    .price {
      font-size: 1.4rem;
      font-weight: 950;
      color: var(--app-text);
      letter-spacing: -0.02em;
    }

    .unit {
      font-size: 0.9rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .pagination {
      display: flex;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 3.5rem;
    }

    .page-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--card-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--app-text);
      font-weight: 700;
    }

    .page-btn:hover:not(:disabled) {
      background: var(--input-bg);
      border-color: var(--accent-blue);
      color: var(--accent-blue);
    }

    .page-btn.active {
      background: var(--accent-blue);
      color: white;
      border-color: var(--accent-blue);
      box-shadow: 0 8px 16px rgba(14, 165, 233, 0.2);
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (max-width: 1024px) {
      .content-layout {
        grid-template-columns: 240px 1fr;
        gap: 1.5rem;
        padding: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .content-layout {
        grid-template-columns: 1fr;
      }

      .filters-sidebar {
        position: static;
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .content-layout {
        grid-template-columns: 1fr;
      }

      .filters-sidebar {
        position: static;
      }
    }
  `]
})
export class MarketplaceProductsComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected translate = inject(TranslateService);

  categories: ProductCategory[] = [];

  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'relevance';

  selectedCategoryId = signal<number | null>(null);
  currentPage = signal(1);
  pageSize = 20;

  loading = signal(true);
  products = signal<Product[]>([]);
  productsResponse = signal<ProductsResponse | null>(null);
  totalPages = signal(1);

  private get apiUrl(): string {
    return (window as any).__API_URL__ || 'https://localhost:7001/api';
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategoryId.set(+params['categoryId']);
      }
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.loadProducts();
    });
  }

  private loadCategories(): void {
    this.http.get<any[]>(`${this.apiUrl}/marketplace/categories`).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  private loadProducts(): void {
    this.loading.set(true);

    let url = `${this.apiUrl}/marketplace/products?page=${this.currentPage()}&pageSize=${this.pageSize}`;

    if (this.selectedCategoryId()) {
      url += `&categoryId=${this.selectedCategoryId()}`;
    }
    if (this.searchTerm) {
      url += `&searchTerm=${encodeURIComponent(this.searchTerm)}`;
    }
    if (this.minPrice) {
      url += `&minPrice=${this.minPrice}`;
    }
    if (this.maxPrice) {
      url += `&maxPrice=${this.maxPrice}`;
    }
    if (this.sortBy) {
      url += `&sortBy=${this.sortBy}`;
    }

    this.http.get<ProductsResponse>(url).subscribe({
      next: (response) => {
        this.products.set(response.products || []);
        this.productsResponse.set(response);
        this.totalPages.set(response.pagination?.totalPages || 1);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }

  selectCategory(categoryId: number): void {
    if (this.selectedCategoryId() === categoryId) {
      this.selectedCategoryId.set(null);
    } else {
      this.selectedCategoryId.set(categoryId);
    }
    this.currentPage.set(1);
    this.loadProducts();
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedCategoryId.set(null);
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'relevance';
    this.currentPage.set(1);
    this.router.navigate(['/marketplace/products']);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const current = this.currentPage();
    const total = this.totalPages();

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
