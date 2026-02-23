import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

const API_URL = '/api';

interface SalesReport {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: ProductSale[];
    salesByDate: DateSale[];
    salesByCategory: CategorySale[];
}

interface ProductSale {
    productId: number;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
    percentage: number;
}

interface DateSale {
    date: string;
    sales: number;
    orders: number;
}

interface CategorySale {
    categoryId: number;
    categoryName: string;
    sales: number;
    percentage: number;
}

@Component({
    selector: 'app-sales-reports',
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
                {{ 'WAREHOUSE_REPORTS.SALES.TITLE' | translate }} 📊
              </h1>
              <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">
                {{ 'WAREHOUSE_REPORTS.SALES.SUBTITLE' | translate }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <select 
                [(ngModel)]="dateRange"
                (change)="loadReport()"
                class="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                <option value="today">{{ 'WAREHOUSE_REPORTS.SALES.TODAY' | translate }}</option>
                <option value="week">{{ 'WAREHOUSE_REPORTS.SALES.THIS_WEEK' | translate }}</option>
                <option value="month">{{ 'WAREHOUSE_REPORTS.SALES.THIS_MONTH' | translate }}</option>
                <option value="year">{{ 'WAREHOUSE_REPORTS.SALES.THIS_YEAR' | translate }}</option>
                <option value="custom">{{ 'WAREHOUSE_REPORTS.SALES.CUSTOM_RANGE' | translate }}</option>
              </select>
              
              <button 
                (click)="exportReport()"
                class="px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {{ 'WAREHOUSE_REPORTS.SALES.EXPORT' | translate }}
              </button>
            </div>
          </div>
        </div>

        @if (dateRange === 'custom') {
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm mb-6">
            <div class="flex flex-wrap gap-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {{ 'WAREHOUSE_REPORTS.SALES.FROM_DATE' | translate }}
                </label>
                <input 
                  type="date"
                  [(ngModel)]="customFromDate"
                  class="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {{ 'WAREHOUSE_REPORTS.SALES.TO_DATE' | translate }}
                </label>
                <input 
                  type="date"
                  [(ngModel)]="customToDate"
                  class="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
              </div>
              <div class="flex items-end">
                <button 
                  (click)="loadReport()"
                  class="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">
                  {{ 'WAREHOUSE_REPORTS.SALES.APPLY' | translate }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_REPORTS.SALES.TOTAL_SALES' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">EGP {{ report()?.totalSales?.toLocaleString() || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_REPORTS.SALES.TOTAL_ORDERS' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ report()?.totalOrders || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_REPORTS.SALES.AVG_ORDER' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">EGP {{ report()?.averageOrderValue?.toLocaleString() || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_REPORTS.SALES.GROWTH' | translate }}</p>
                <p class="text-2xl font-black text-emerald-500">+{{ growthPercentage() }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Sales by Date -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <h3 class="font-bold text-slate-900 dark:text-white mb-4">{{ 'WAREHOUSE_REPORTS.SALES.SALES_TREND' | translate }}</h3>
            <div class="h-64 flex items-end gap-2">
              @for (sale of report()?.salesByDate; track sale.date) {
                <div class="flex-1 flex flex-col items-center gap-1">
                  <div 
                    class="w-full bg-gradient-to-t from-emerald-500 to-cyan-600 rounded-t-lg transition-all hover:opacity-80"
                    [style.height.%]="getBarHeight(sale.sales, maxDailySales())">
                  </div>
                  <span class="text-xs text-slate-500 dark:text-slate-400 transform -rotate-45 origin-left">
                    {{ sale.date | date:'dd/MM' }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Sales by Category -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <h3 class="font-bold text-slate-900 dark:text-white mb-4">{{ 'WAREHOUSE_REPORTS.SALES.SALES_BY_CATEGORY' | translate }}</h3>
            <div class="space-y-4">
              @for (category of report()?.salesByCategory; track category.categoryId) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-slate-700 dark:text-slate-300">{{ category.categoryName }}</span>
                    <span class="font-bold text-slate-900 dark:text-white">{{ category.percentage }}%</span>
                  </div>
                  <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full transition-all"
                      [style.width.%]="category.percentage">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 class="font-bold text-slate-900 dark:text-white">{{ 'WAREHOUSE_REPORTS.SALES.TOP_PRODUCTS' | translate }}</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.SALES.TABLE_PRODUCT' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.SALES.TABLE_QUANTITY' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.SALES.TABLE_REVENUE' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_REPORTS.SALES.TABLE_PERCENTAGE' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                @for (product of report()?.topProducts; track product.productId) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="font-medium text-slate-900 dark:text-white">{{ product.productName }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {{ product.quantitySold }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                      EGP {{ product.totalRevenue.toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            class="h-full bg-emerald-500 rounded-full"
                            [style.width.%]="product.percentage">
                          </div>
                        </div>
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ product.percentage }}%</span>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      {{ 'WAREHOUSE_REPORTS.SALES.NO_DATA' | translate }}
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
export class SalesReportsComponent {
    private http = inject(HttpClient);

    // State
    report = signal<SalesReport | null>(null);
    dateRange = 'month';
    customFromDate = '';
    customToDate = '';

    // Computed
    maxDailySales = computed(() => {
        const sales = this.report()?.salesByDate || [];
        if (sales.length === 0) return 100;
        return Math.max(...sales.map(s => s.sales));
    });

    growthPercentage = computed(() => {
        // Mock growth calculation
        return 12.5;
    });

    constructor() {
        this.loadReport();
    }

    loadReport() {
        let url = `${API_URL}/vendor/reports/sales?range=${this.dateRange}`;

        if (this.dateRange === 'custom' && this.customFromDate && this.customToDate) {
            url += `&from=${this.customFromDate}&to=${this.customToDate}`;
        }

        this.http.get<SalesReport>(url).subscribe({
            next: (data) => this.report.set(data),
            error: (err) => console.error('Failed to load sales report:', err)
        });
    }

    exportReport() {
        let url = `${API_URL}/vendor/reports/sales/export?range=${this.dateRange}`;

        if (this.dateRange === 'custom' && this.customFromDate && this.customToDate) {
            url += `&from=${this.customFromDate}&to=${this.customToDate}`;
        }

        window.open(url, '_blank');
    }

    getBarHeight(value: number, max: number): number {
        if (max === 0) return 0;
        return (value / max) * 100;
    }
}
