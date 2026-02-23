import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentService, PaymentTransactionDto, PaymentSummaryDto } from '../../../core/services/payment.service';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ 'payments.title' | translate }}</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">{{ 'payments.subtitle' | translate }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'payments.total_processed' | translate }}</div>
          <div class="text-2xl font-bold text-green-500">{{ summary().totalReceived | currency }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'payments.pending' | translate }}</div>
          <div class="text-2xl font-bold text-amber-500">{{ summary().pendingPayments }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'payments.completed' | translate }}</div>
          <div class="text-2xl font-bold text-cyan-500">{{ summary().completedPayments }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'payments.refunds' | translate }}</div>
          <div class="text-2xl font-bold text-red-500">{{ summary().totalRefunded | currency }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="border-b border-slate-200 dark:border-slate-700">
          <nav class="flex -mb-px">
            <button (click)="activeTab.set('payments')" 
                    [class.border-cyan-500]="activeTab() === 'payments'"
                    [class.text-cyan-600]="activeTab() === 'payments'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'payments.payments' | translate }}
            </button>
            <button (click)="activeTab.set('history')" 
                    [class.border-cyan-500]="activeTab() === 'history'"
                    [class.text-cyan-600]="activeTab() === 'history'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'payments.history' | translate }}
            </button>
            <button (click)="activeTab.set('settings')" 
                    [class.border-cyan-500]="activeTab() === 'settings'"
                    [class.text-cyan-600]="activeTab() === 'settings'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'payments.settings' | translate }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          @switch (activeTab()) {
            @case ('payments') {
              <div class="space-y-4">
                @if (transactions().length === 0) {
                  <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                    {{ 'payments.no_payments' | translate }}
                  </div>
                } @else {
                  @for (payment of transactions(); track payment.id) {
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <div class="font-medium text-slate-900 dark:text-white">{{ payment.projectName || payment.companyName }}</div>
                          <div class="text-sm text-slate-500 dark:text-slate-400">{{ payment.createdAt | date:'medium' }}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="text-right">
                          <div class="font-bold text-slate-900 dark:text-white">{{ payment.amount | currency:payment.currency }}</div>
                          <div class="text-sm text-slate-500 dark:text-slate-400">{{ payment.paymentMethod }}</div>
                        </div>
                        <span [class]="getPaymentStatusClass(payment.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ 'payments.status_' + payment.status.toLowerCase() | translate }}
                        </span>
                      </div>
                    </div>
                  }
                }
              </div>
            }
            @case ('history') {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-700">
                      <th class="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'payments.date' | translate }}</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'payments.project' | translate }}</th>
                      <th class="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'payments.amount' | translate }}</th>
                      <th class="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'payments.status' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of transactions(); track entry.id) {
                      <tr class="border-b border-slate-100 dark:border-slate-700/50">
                        <td class="py-3 px-4 text-slate-600 dark:text-slate-300">{{ entry.createdAt | date:'short' }}</td>
                        <td class="py-3 px-4 text-slate-900 dark:text-white">{{ entry.projectName || entry.companyName }}</td>
                        <td class="py-3 px-4 text-right font-mono">{{ entry.amount | currency:entry.currency }}</td>
                        <td class="py-3 px-4 text-center">
                          <span [class]="getPaymentStatusClass(entry.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                            {{ entry.status }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            @case ('settings') {
              <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                {{ 'payments.gateway_settings' | translate }}
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class PaymentsComponent implements OnInit {
    private paymentService = inject(PaymentService);

    activeTab = signal<'payments' | 'history' | 'settings'>('payments');
    transactions = signal<PaymentTransactionDto[]>([]);
    summary = signal<PaymentSummaryDto>({
        totalReceived: 0,
        totalPending: 0,
        totalRefunded: 0,
        completedPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        recentPayments: []
    });

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.paymentService.getPaymentSummary().subscribe({
            next: (data: PaymentSummaryDto) => {
                this.summary.set(data);
                this.transactions.set(data.recentPayments.map(r => ({
                    id: r.id,
                    companyId: 0,
                    companyName: r.clientName,
                    projectName: r.projectName,
                    amount: r.amount,
                    currency: 'USD',
                    channel: 'Online' as const,
                    paymentMethod: 'Card',
                    status: r.status as any,
                    createdAt: r.createdAt
                })));
            }
        });
        this.paymentService.getPaymentHistory().subscribe({
            next: (data) => {
                this.transactions.set(data.transactions);
            }
        });
    }

    getPaymentStatusClass(status: string): string {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Refunded': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    }
}
