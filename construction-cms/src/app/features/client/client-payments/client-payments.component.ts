import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ClientPortalService, ClientPayment, ClientPaymentSummary } from '../../../core/services/client-portal.service';

@Component({
  selector: 'app-client-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">{{ 'client.payments' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'client.payments_subtitle' | translate }}</p>
          </div>
          
          <!-- Filters -->
          <div class="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
            <div class="flex flex-col px-3">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
              <select [(ngModel)]="selectedStatus" (change)="loadPayments()" class="bg-transparent border-none text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none cursor-pointer">
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div class="flex flex-col px-3">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project</span>
              <select [(ngModel)]="selectedProjectId" (change)="loadPayments()" class="bg-transparent border-none text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none cursor-pointer">
                <option value="">All Projects</option>
                <option *ngFor="let project of projects" [value]="project.id">{{ project.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Payment Summary Cards -->
        @if (!isLoading && paymentSummary) {
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div class="premium-stat-card">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{{ 'client.total_invoiced' | translate }}</p>
              <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ formatCurrency(paymentSummary.totalInvoiced) }}</span>
            </div>
            <div class="premium-stat-card">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{{ 'client.total_paid' | translate }}</p>
              <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{{ formatCurrency(paymentSummary.totalPaid) }}</span>
            </div>
            <div class="premium-stat-card">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{{ 'client.pending_amount' | translate }}</p>
              <span class="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tighter">{{ formatCurrency(paymentSummary.pendingAmount) }}</span>
            </div>
            <div class="premium-stat-card">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{{ 'client.overdue_amount' | translate }}</p>
              <span class="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">{{ formatCurrency(paymentSummary.overdueAmount) }}</span>
            </div>
          </div>
        }

        <!-- Payments List -->
        @if (!isLoading && payments.length > 0) {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50 dark:bg-slate-950/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.invoice_number' | translate }}</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.company' | translate }}</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.project' | translate }}</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.invoice_date' | translate }}</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.due_date' | translate }}</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.amount' | translate }}</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.paid_amount' | translate }}</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.status' | translate }}</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'client.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (payment of payments; track payment.id) {
                    <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">{{ payment.invoiceNumber }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {{ payment.companyName || 'N/A' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ payment.projectName }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ formatDate(payment.invoiceDate) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ formatDate(payment.dueDate) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">{{ formatCurrency(payment.amount) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ formatCurrency(payment.paidAmount || 0) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                              [ngClass]="{
                                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': payment.status === 'Paid',
                                'bg-amber-500/10 text-amber-600 dark:text-amber-400': payment.status === 'Pending',
                                'bg-rose-500/10 text-rose-600 dark:text-rose-400': payment.status === 'Overdue'
                              }">
                          {{ payment.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <button (click)="downloadInvoice(payment)" class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                          {{ 'client.download' | translate }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading && payments.length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <svg class="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'client.no_payments' | translate }}</h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {{ 'client.no_payments_desc' | translate }}
            </p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .premium-stat-card {
      @apply bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl transition-all;
    }
    :host ::ng-deep select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  `]
})
export class ClientPaymentsComponent implements OnInit {
  private clientPortalService = inject(ClientPortalService);

  payments: ClientPayment[] = [];
  paymentSummary: ClientPaymentSummary | null = null;
  projects: any[] = [];
  isLoading = false;
  selectedStatus = '';
  selectedProjectId = '';

  ngOnInit() {
    this.loadPayments();
    this.loadPaymentSummary();
    this.loadProjects();
  }

  loadPayments() {
    this.isLoading = true;
    const projectId = this.selectedProjectId ? parseInt(this.selectedProjectId) : undefined;
    this.clientPortalService.getClientPayments(projectId).subscribe({
      next: (payments) => {
        this.payments = payments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoading = false;
      }
    });
  }

  loadPaymentSummary() {
    this.clientPortalService.getClientPaymentSummary().subscribe({
      next: (summary) => {
        this.paymentSummary = summary;
      },
      error: (error) => {
        console.error('Error loading payment summary:', error);
      }
    });
  }

  loadProjects() {
    // Load projects from dashboard
    this.clientPortalService.getClientDashboard().subscribe({
      next: (dashboard) => {
        this.projects = dashboard.projects.map(p => ({ id: p.projectId, name: p.projectName }));
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  downloadInvoice(payment: ClientPayment) {
    // TODO: Implement invoice download functionality
    console.log('Downloading invoice:', payment.invoiceNumber);
  }

  formatCurrency(value: number): string {
    return this.clientPortalService.formatCurrency(value);
  }

  formatDate(dateString: string): string {
    return this.clientPortalService.formatDate(dateString);
  }
}
