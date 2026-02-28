import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { VendorService, VendorSpendReport, VendorSpendItem, SpendByDateItem } from '../../../core/services/vendor.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { format } from 'date-fns';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {{ 'vendors.analytics_title' | translate }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Detailed reporting on your vendor relationships and spend.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2 px-3">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.from' | translate }}</span>
            <input type="date" [(ngModel)]="filters.fromDate" (change)="loadReport()"
                   class="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 p-0" />
          </div>
          <div class="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
          <div class="flex items-center gap-2 px-3">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.to' | translate }}</span>
            <input type="date" [(ngModel)]="filters.toDate" (change)="loadReport()"
                   class="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 p-0" />
          </div>
          <button (click)="loadReport()" class="ml-2 p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="flex flex-col items-center justify-center py-20 space-y-4">
          <app-loading-spinner [centered]="true"></app-loading-spinner>
          <p class="text-slate-400 font-medium animate-pulse">{{ 'common.loading_reports' | translate }}...</p>
        </div>
      } @else if (report) {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-cyan-500/10 relative overflow-hidden group">
            <div class="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <svg class="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
            </div>
            <p class="text-cyan-100 text-xs font-black uppercase tracking-[0.2em] mb-2">{{ 'vendors.total_spend' | translate }}</p>
            <h2 class="text-4xl font-black mb-1">{{ report.totalSpend | currency:'EGP' }}</h2>
            <p class="text-cyan-200 text-xs">{{ report.totalInvoices }} processed invoices</p>
          </div>

          <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
            <p class="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{{ 'vendors.avg_invoice' | translate }}</p>
            <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {{ (report.totalSpend / (report.totalInvoices || 1)) | currency:'EGP' }}
            </h2>
            <div class="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              <span>+12.5% from last period</span>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
            <p class="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{{ 'vendors.active_vendors' | translate }}</p>
            <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ report.topVendors.length }}</h2>
            <p class="text-[10px] text-slate-500 font-medium">Currently engaged in this period</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Spend Trend Chart (Simplified) -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <span class="w-2 h-8 bg-cyan-500 rounded-full"></span>
              {{ 'vendors.spend_trend' | translate }}
            </h3>
            
            <div class="h-64 flex items-end justify-between gap-4 px-4 relative">
              <!-- Grid Lines -->
              <div class="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div class="border-t border-slate-300 dark:border-slate-700 w-full"></div>
                <div class="border-t border-slate-300 dark:border-slate-700 w-full"></div>
                <div class="border-t border-slate-300 dark:border-slate-700 w-full"></div>
              </div>

              @for (item of report.spendTrends; track item.date) {
                <div class="flex-1 flex flex-col items-center group relative">
                  <div class="w-full bg-cyan-100 dark:bg-cyan-900/40 rounded-t-xl transition-all group-hover:bg-cyan-500 relative"
                       [style.height.%]="(item.amount / maxSpend) * 100">
                    <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {{ item.amount | currency:'EGP' }}
                    </div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-400 mt-3 rotate-45 md:rotate-0">{{ formatDate(item.date) }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Top Vendors list -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              {{ 'vendors.top_vendors' | translate }}
            </h3>
            
            <div class="space-y-4">
              @for (v of report.topVendors; track v.vendorId; let i = $index) {
                <div class="flex items-center gap-4 group p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                       [ngClass]="i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ v.vendorName }}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ v.invoiceCount }} Invoices</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ v.totalAmount | currency:'EGP' }}</p>
                    <div class="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div class="h-full bg-cyan-500" [style.width.%]="(v.totalAmount / report.totalSpend) * 100"></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <svg class="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p class="text-slate-400 font-medium">No analytics data found for this period</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class VendorAnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  loading = false;
  report?: VendorSpendReport;
  maxSpend = 1;

  filters = {
    fromDate: format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd')
  };

  constructor(private vendorService: VendorService) {
    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadReport();
      });
  }

  ngOnInit() {
    this.loadReport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReport() {
    this.loading = true;
    this.vendorService.getAnalytics(
      undefined,
      this.filters.fromDate ? new Date(this.filters.fromDate).toISOString() : undefined,
      this.filters.toDate ? new Date(this.filters.toDate).toISOString() : undefined
    ).subscribe({
      next: (data: VendorSpendReport) => {
        this.report = data;
        this.maxSpend = Math.max(...data.spendTrends.map((t: SpendByDateItem) => t.amount), 1);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading report', err);
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string) {
    try {
      return format(new Date(dateStr), 'MMM d');
    } catch {
      return dateStr;
    }
  }
}
