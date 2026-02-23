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
      background: #f9fafb;
    }

    .page-header {
      background: white;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .page-header h1 {
      margin: 0 0 0.5rem;
      color: #1e3a5f;
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

    .content-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    .filters-sidebar {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 1rem;
    }

    .filter-section {
      margin-bottom: 1.5rem;
    }

    .filter-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #1e3a5f;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      width: 100%;
    }

    .category-btn:hover {
      background: #f0f9ff;
      border-color: #1e3a5f;
    }

    .category-btn.active {
      background: #1e3a5f;
      color: white;
      border-color: #1e3a5f;
    }

    .category-btn .count {
      font-size: 0.75rem;
      background: rgba(0,0,0,0.1);
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
    }

    .category-btn.active .count {
      background: rgba(255,255,255,0.2);
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .price-inputs input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      width: 100%;
    }

    .clear-filters {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem;
      background: transparent;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .clear-filters:hover {
      background: #fee2e2;
      border-color: #ef4444;
      color: #ef4444;
    }

    .products-main {
      min-height: 500px;
    }

    .toolbar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .search-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 0 1rem;
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

    .sort-select select {
      padding: 0.75rem 2rem 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      cursor: pointer;
    }

    .results-info {
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
    }

    .loading-state i, .empty-state i {
      font-size: 3rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .empty-state button {
      padding: 0.75rem 1.5rem;
      background: #1e3a5f;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
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
      position: relative;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image i {
      font-size: 3rem;
      color: #9ca3af;
    }

    .low-stock {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
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

    .pagination {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
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
      transition: all 0.2s;
    }

    .page-btn:hover:not(:disabled) {
      background: #f0f9ff;
      border-color: #1e3a5f;
    }

    .page-btn.active {
      background: #1e3a5f;
      color: white;
      border-color: #1e3a5f;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
