import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

const API_URL = '/api';

interface InventoryReport {
    totalProducts: number;
    totalValue: number;
    lowStockProducts: LowStockProduct[];
    outOfStockProducts: OutOfStockProduct[];
    stockByCategory: CategoryStock[];
    recentMovements: StockMovement[];
    turnoverRate: number;
}

interface LowStockProduct {
    productId: number;
    productName: string;
    currentStock: number;
    minStock: number;
    category: string;
}

interface OutOfStockProduct {
    productId: number;
    productName: string;
    category: string;
    lastRestockDate: string;
}

interface CategoryStock {
    categoryId: number;
    categoryName: string;
    productCount: number;
    totalValue: number;
    percentage: number;
}

interface StockMovement {
    id: number;
    productName: string;
    type: 'in' | 'out';
    quantity: number;
    date: string;
    reason: string;
}

@Component({
    selector: 'app-inventory-reports',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {{ 'WAREHOUSE_REPORTS.INVENTORY.TITLE' | translate }} 📦
              </h1>
              <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">
                {{ 'WAREHOUSE_REPORTS.INVENTORY.SUBTITLE' | translate }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button 
                (click)="exportReport()"
                class="px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {{ 'WAREHOUSE_REPORTS.INVENTORY.EXPORT' | translate }}
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_REPORTS.INVENTORY.TOTAL_PRODUCTS' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ report()?.totalProducts || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_REPORTS.INVENTORY.TOTAL_VALUE' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">EGP {{ report()?.totalValue?.toLocaleString() || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_REPORTS.INVENTORY.LOW_STOCK' | translate }}</p>
                <p class="text-2xl font-black text-amber-500">{{ report()?.lowStockProducts?.length || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_REPORTS.INVENTORY.OUT_OF_STOCK' | translate }}</p>
                <p class="text-2xl font-black text-rose-500">{{ report()?.outOfStockProducts?.length || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Low Stock Alert -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-amber-500/5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white">{{ 'WAREHOUSE_REPORTS.INVENTORY.LOW_STOCK_ALERT' | translate }}</h3>
              </div>
            </div>
            <div class="divide-y divide-slate-200 dark:divide-slate-800 max-h-80 overflow-y-auto">
              @for (product of report()?.lowStockProducts; track product.productId) {
                <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ product.productName }}</p>
                      <p class="text-sm text-slate-500 dark:text-slate-400">{{ product.category }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-bold text-amber-500">{{ product.currentStock }} {{ 'WAREHOUSE_REPORTS.INVENTORY.UNITS' | translate }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ 'WAREHOUSE_REPORTS.INVENTORY.MIN' | translate }}: {{ product.minStock }}</p>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center text-slate-500 dark:text-slate-400">
                  {{ 'WAREHOUSE_REPORTS.INVENTORY.NO_LOW_STOCK' | translate }}
                </div>
              }
            </div>
          </div>

          <!-- Out of Stock -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-rose-500/5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                  </svg>
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white">{{ 'WAREHOUSE_REPORTS.INVENTORY.OUT_OF_STOCK_ALERT' | translate }}</h3>
              </div>
            </div>
            <div class="divide-y divide-slate-200 dark:divide-slate-800 max-h-80 overflow-y-auto">
              @for (product of report()?.outOfStockProducts; track product.productId) {
                <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ product.productName }}</p>
                      <p class="text-sm text-slate-500 dark:text-slate-400">{{ product.category }}</p>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {{ 'WAREHOUSE_REPORTS.INVENTORY.OUT_OF_STOCK' | translate }}
                      </span>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center text-slate-500 dark:text-slate-400">
                  {{ 'WAREHOUSE_REPORTS.INVENTORY.NO_OUT_OF_STOCK' | translate }}
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Stock by Category -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-6 mb-8">
          <h3 class="font-bold text-slate-900 dark:text-white mb-6">{{ 'WAREHOUSE_REPORTS.INVENTORY.STOCK_BY_CATEGORY' | translate }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (category of report()?.stockByCategory; track category.categoryId) {
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div class="flex items-center justify-between mb-3">
                  <span class="font-medium text-slate-900 dark:text-white">{{ category.categoryName }}</span>
                  <span class="text-sm text-slate-500 dark:text-slate-400">{{ category.productCount }} {{ 'WAREHOUSE_REPORTS.INVENTORY.PRODUCTS' | translate }}</span>
                </div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'WAREHOUSE_REPORTS.INVENTORY.VALUE' | translate }}</span>
                  <span class="font-bold text-slate-900 dark:text-white">EGP {{ category.totalValue.toLocaleString() }}</span>
                </div>
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full"
                    [style.width.%]="category.percentage">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Recent Stock Movements -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 class="font-bold text-slate-900 dark:text-white">{{ 'WAREHOUSE_REPORTS.INVENTORY.RECENT_MOVEMENTS' | translate }}</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.INVENTORY.TABLE_PRODUCT' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.INVENTORY.TABLE_TYPE' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.INVENTORY.TABLE_QUANTITY' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.INVENTORY.TABLE_REASON' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.INVENTORY.TABLE_DATE' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                @for (movement of report()?.recentMovements; track movement.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="font-medium text-slate-900 dark:text-white">{{ movement.productName }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (movement.type === 'in') {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                          </svg>
                          {{ 'WAREHOUSE_REPORTS.INVENTORY.STOCK_IN' | translate }}
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                          </svg>
                          {{ 'WAREHOUSE_REPORTS.INVENTORY.STOCK_OUT' | translate }}
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                      {{ movement.quantity }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {{ movement.reason }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {{ movement.date | date:'mediumDate' }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      {{ 'WAREHOUSE_REPORTS.INVENTORY.NO_MOVEMENTS' | translate }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InventoryReportsComponent {
    private http = inject(HttpClient);

    // State
    report = signal<InventoryReport | null>(null);

    constructor() {
        this.loadReport();
    }

    loadReport() {
        this.http.get<InventoryReport>(`${API_URL}/vendor/reports/inventory`).subscribe({
            next: (data) => this.report.set(data),
            error: (err) => console.error('Failed to load inventory report:', err)
        });
    }

    exportReport() {
        window.open(`${API_URL}/vendor/reports/inventory/export`, '_blank');
    }
}
