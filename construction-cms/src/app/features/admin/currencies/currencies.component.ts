import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MultiCurrencyService, CurrencyDto, ExchangeRateDto } from '../../../core/services/multi-currency.service';

@Component({
    selector: 'app-currencies',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ 'currencies.title' | translate }}</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">{{ 'currencies.subtitle' | translate }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'currencies.active_currencies' | translate }}</div>
          <div class="text-2xl font-bold text-cyan-500">{{ activeCurrencies() }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'currencies.exchange_rates' | translate }}</div>
          <div class="text-2xl font-bold text-amber-500">{{ exchangeRates().length }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'currencies.last_update' | translate }}</div>
          <div class="text-lg font-bold text-green-500">{{ lastUpdate() }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="border-b border-slate-200 dark:border-slate-700">
          <nav class="flex -mb-px">
            <button (click)="activeTab.set('currencies')" 
                    [class.border-cyan-500]="activeTab() === 'currencies'"
                    [class.text-cyan-600]="activeTab() === 'currencies'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'currencies.currencies' | translate }}
            </button>
            <button (click)="activeTab.set('rates')" 
                    [class.border-cyan-500]="activeTab() === 'rates'"
                    [class.text-cyan-600]="activeTab() === 'rates'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'currencies.exchange_rates' | translate }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          @switch (activeTab()) {
            @case ('currencies') {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-700">
                      <th class="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.code' | translate }}</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.name' | translate }}</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.symbol' | translate }}</th>
                      <th class="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.is_default' | translate }}</th>
                      <th class="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.status' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (currency of currencies(); track currency.id) {
                      <tr class="border-b border-slate-100 dark:border-slate-700/50">
                        <td class="py-3 px-4 font-medium text-slate-900 dark:text-white">{{ currency.code }}</td>
                        <td class="py-3 px-4 text-slate-600 dark:text-slate-300">{{ currency.name }}</td>
                        <td class="py-3 px-4 text-slate-600 dark:text-slate-300">{{ currency.symbol }}</td>
                        <td class="py-3 px-4 text-center">
                          @if (currency.isDefault) {
                            <span class="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                              {{ 'currencies.default' | translate }}
                            </span>
                          }
                        </td>
                        <td class="py-3 px-4 text-center">
                          <span [class]="currency.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700'" 
                                class="px-2 py-1 rounded-full text-xs font-medium">
                            {{ currency.isActive ? ('currencies.active' | translate) : ('currencies.inactive' | translate) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            @case ('rates') {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-700">
                      <th class="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.from' | translate }}</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.to' | translate }}</th>
                      <th class="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.rate' | translate }}</th>
                      <th class="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'currencies.updated' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (rate of exchangeRates(); track rate.id) {
                      <tr class="border-b border-slate-100 dark:border-slate-700/50">
                        <td class="py-3 px-4 font-medium text-slate-900 dark:text-white">{{ rate.fromCurrencyCode }}</td>
                        <td class="py-3 px-4 text-slate-600 dark:text-slate-300">{{ rate.toCurrencyCode }}</td>
                        <td class="py-3 px-4 text-right font-mono">{{ rate.rate | number:'1.4-4' }}</td>
                        <td class="py-3 px-4 text-center text-sm text-slate-500 dark:text-slate-400">{{ rate.effectiveDate | date:'short' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class CurrenciesComponent implements OnInit {
    private currencyService = inject(MultiCurrencyService);

    activeTab = signal<'currencies' | 'rates'>('currencies');
    currencies = signal<CurrencyDto[]>([]);
    exchangeRates = signal<ExchangeRateDto[]>([]);

    activeCurrencies = signal(0);
    lastUpdate = signal('--');

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.currencyService.getCurrencies().subscribe({
            next: (data: CurrencyDto[]) => {
                this.currencies.set(data);
                this.activeCurrencies.set(data.filter(c => c.isActive).length);
            }
        });
        this.currencyService.getAllExchangeRates().subscribe({
            next: (data: ExchangeRateDto[]) => {
                this.exchangeRates.set(data);
                if (data.length > 0) {
                    const latest = data.reduce((a: ExchangeRateDto, b: ExchangeRateDto) =>
                        new Date(a.effectiveDate) > new Date(b.effectiveDate) ? a : b);
                    this.lastUpdate.set(new Date(latest.effectiveDate).toLocaleDateString());
                }
            }
        });
    }
}
