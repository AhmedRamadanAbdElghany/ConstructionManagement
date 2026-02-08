import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SubcontractorService, SubcontractorPayment, CreatePaymentRequest, UpdatePaymentStatusRequest } from '../../../../core/services/subcontractor.service';

@Component({
    selector: 'app-subcontractor-payments',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Subcontractor Payments</h1>
            <div class="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-fit">
              <button (click)="activeTab = 'pending'"
                      [class.bg-white]="activeTab === 'pending'"
                      [class.shadow-sm]="activeTab === 'pending'"
                      [class.text-slate-900]="activeTab === 'pending'"
                      [class.dark:bg-slate-700]="activeTab === 'pending'"
                      [class.dark:text-white]="activeTab === 'pending'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                Pending
              </button>
              <button (click)="activeTab = 'approved'"
                      [class.bg-white]="activeTab === 'approved'"
                      [class.shadow-sm]="activeTab === 'approved'"
                      [class.text-slate-900]="activeTab === 'approved'"
                      [class.dark:bg-slate-700]="activeTab === 'approved'"
                      [class.dark:text-white]="activeTab === 'approved'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                Approved
              </button>
              <button (click)="activeTab = 'paid'"
                      [class.bg-white]="activeTab === 'paid'"
                      [class.shadow-sm]="activeTab === 'paid'"
                      [class.text-slate-900]="activeTab === 'paid'"
                      [class.dark:bg-slate-700]="activeTab === 'paid'"
                      [class.dark:text-white]="activeTab === 'paid'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                Paid
              </button>
              <button (click)="activeTab = 'all'"
                      [class.bg-white]="activeTab === 'all'"
                      [class.shadow-sm]="activeTab === 'all'"
                      [class.text-slate-900]="activeTab === 'all'"
                      [class.dark:bg-slate-700]="activeTab === 'all'"
                      [class.dark:text-white]="activeTab === 'all'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                All
              </button>
            </div>
          </div>

          <button (click)="openCreateModal()"
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-green-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            New Payment
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ summary.pendingAmount || 0 }}</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Total Pending</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">Approved</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ summary.approvedAmount || 0 }}</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Total Approved</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Paid</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ summary.paidAmount || 0 }}</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Total Paid</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-[10px] font-black text-violet-500 uppercase tracking-widest">Total</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ summary.totalAmount || 0 }}</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">All Payments</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Search</label>
              <input type="text" [(ngModel)]="searchTerm" placeholder="Search payments..."
                     class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-emerald-500/10">
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subcontractor</label>
              <select [(ngModel)]="filterSubcontractor" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Subcontractors</option>
                @for (sub of subcontractors; track sub.id) {
                  <option [value]="sub.id">{{ sub.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Payment Type</label>
              <select [(ngModel)]="filterType" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Types</option>
                <option value="Progress Payment">Progress Payment</option>
                <option value="Milestone Payment">Milestone Payment</option>
                <option value="Final Payment">Final Payment</option>
                <option value="Retention Release">Retention Release</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date Range</label>
              <select [(ngModel)]="filterDateRange" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Payments List -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
          @if (isLoading) {
            <div class="flex items-center justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          } @else if (filteredPayments.length === 0) {
            <div class="text-center py-20">
              <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <p class="text-sm text-slate-500 dark:text-slate-400">No payments found</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-white/5">
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Payment #</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Subcontractor</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Type</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Amount</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Retention</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Net Payment</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Invoice Date</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Due Date</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (payment of filteredPayments; track payment.id) {
                    <tr class="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">{{ payment.paymentNumber }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ payment.subcontractorName || '-' }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ payment.paymentType }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">{{ formatCurrency(payment.amount) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ formatCurrency(payment.retentionDeducted || 0) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-emerald-500">{{ formatCurrency(payment.netPayment || 0) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ formatDate(payment.invoiceDate) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ formatDate(payment.dueDate) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
                              [class.bg-amber-500/10]="payment.status === 'Pending'"
                              [class.text-amber-500]="payment.status === 'Pending'"
                              [class.bg-blue-500/10]="payment.status === 'Approved'"
                              [class.text-blue-500]="payment.status === 'Approved'"
                              [class.bg-emerald-500/10]="payment.status === 'Paid'"
                              [class.text-emerald-500]="payment.status === 'Paid'">
                          {{ payment.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button (click)="viewPayment(payment)" class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            View
                          </button>
                          @if (payment.status === 'Pending') {
                            <button (click)="approvePayment(payment)" class="px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
                              Approve
                            </button>
                          }
                          @if (payment.status === 'Approved') {
                            <button (click)="markAsPaid(payment)" class="px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">
                              Mark Paid
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Create Payment Modal -->
        @if (showCreateModal) {
          <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
              <button (click)="closeCreateModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-2xl">&times;</button>

              <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">New Payment</h2>

              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Payment Number *</label>
                    <input type="text" [(ngModel)]="paymentForm.paymentNumber" placeholder="e.g., PAY-2024-001"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-emerald-500/10">
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Payment Type *</label>
                    <select [(ngModel)]="paymentForm.paymentType" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                      <option value="">Select Type</option>
                      <option value="Progress Payment">Progress Payment</option>
                      <option value="Milestone Payment">Milestone Payment</option>
                      <option value="Final Payment">Final Payment</option>
                      <option value="Retention Release">Retention Release</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subcontractor *</label>
                    <select [(ngModel)]="paymentForm.subcontractorId" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                      <option value="">Select Subcontractor</option>
                      @for (sub of subcontractors; track sub.id) {
                        <option [value]="sub.id">{{ sub.name }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contract</label>
                    <select [(ngModel)]="paymentForm.contractId" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                      <option value="">Select Contract</option>
                      @for (contract of contracts; track contract.id) {
                        <option [value]="contract.id">{{ contract.contractNumber }} - {{ contract.title }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amount *</label>
                    <input type="number" [(ngModel)]="paymentForm.amount" placeholder="0.00" step="0.01"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-emerald-500/10">
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Retention Deducted</label>
                    <input type="number" [(ngModel)]="paymentForm.retentionDeducted" placeholder="0.00" step="0.01"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-emerald-500/10">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Invoice Date *</label>
                    <input type="date" [(ngModel)]="paymentForm.invoiceDate"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-emerald-500/10">
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Due Date</label>
                    <input type="date" [(ngModel)]="paymentForm.dueDate"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-emerald-500/10">
                  </div>
                </div>
              </div>

              <div class="flex gap-4 mt-8">
                <button (click)="closeCreateModal()" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  Cancel
                </button>
                <button (click)="createPayment()" class="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                  Create Payment
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SubcontractorPaymentsComponent implements OnInit {
    activeTab: 'pending' | 'approved' | 'paid' | 'all' = 'pending';
    searchTerm = '';
    filterSubcontractor = '';
    filterType = '';
    filterDateRange = '';

    payments: SubcontractorPayment[] = [];
    subcontractors: any[] = [];
    contracts: any[] = [];
    isLoading = false;

    showCreateModal = false;
    paymentForm: Partial<CreatePaymentRequest> = {};

    summary = {
        pendingAmount: 0,
        approvedAmount: 0,
        paidAmount: 0,
        totalAmount: 0
    };

    constructor(private subcontractorService: SubcontractorService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.subcontractorService.getSubcontractors().subscribe({
            next: (data) => {
                this.subcontractors = data;
            },
            error: (error) => {
                console.error('Error loading subcontractors:', error);
            }
        });

        this.subcontractorService.getAllContracts().subscribe({
            next: (data) => {
                this.contracts = data;
            },
            error: (error) => {
                console.error('Error loading contracts:', error);
            }
        });

        this.loadPayments();
    }

    loadPayments(): void {
        this.isLoading = true;
        const observable = this.activeTab === 'pending'
            ? this.subcontractorService.getPendingPayments()
            : this.subcontractorService.getAllPayments();

        observable.subscribe({
            next: (data) => {
                this.payments = data;
                this.calculateSummary();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading payments:', error);
                this.isLoading = false;
            }
        });
    }

    calculateSummary(): void {
        this.summary = {
            pendingAmount: this.payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0),
            approvedAmount: this.payments.filter(p => p.status === 'Approved').reduce((sum, p) => sum + (p.amount || 0), 0),
            paidAmount: this.payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0),
            totalAmount: this.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
        };
    }

    get filteredPayments(): SubcontractorPayment[] {
        return this.payments.filter(payment => {
            const matchesSearch = !this.searchTerm ||
                payment.paymentNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesSubcontractor = !this.filterSubcontractor || payment.subcontractorId === Number(this.filterSubcontractor);
            const matchesType = !this.filterType || payment.paymentType === this.filterType;
            const matchesTab = this.activeTab === 'all' || payment.status === this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1);
            return matchesSearch && matchesSubcontractor && matchesType && matchesTab;
        });
    }

    openCreateModal(): void {
        this.paymentForm = {
            paymentNumber: '',
            paymentType: '',
            subcontractorId: undefined,
            contractId: undefined,
            amount: 0,
            retentionDeducted: 0,
            invoiceDate: new Date(),
            dueDate: undefined
        };
        this.showCreateModal = true;
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
        this.paymentForm = {};
    }

    createPayment(): void {
        this.subcontractorService.createPayment(this.paymentForm as CreatePaymentRequest).subscribe({
            next: (created) => {
                this.payments.unshift(created);
                this.calculateSummary();
                this.closeCreateModal();
            },
            error: (error) => {
                console.error('Error creating payment:', error);
            }
        });
    }

    viewPayment(payment: SubcontractorPayment): void {
        console.log('View payment:', payment);
    }

    approvePayment(payment: SubcontractorPayment): void {
        const request: UpdatePaymentStatusRequest = {
            status: 'Approved'
        };
        this.subcontractorService.updatePaymentStatus(payment.id, request).subscribe({
            next: (updated) => {
                const index = this.payments.findIndex(p => p.id === updated.id);
                if (index !== -1) {
                    this.payments[index] = updated;
                    this.calculateSummary();
                }
            },
            error: (error) => {
                console.error('Error approving payment:', error);
            }
        });
    }

    markAsPaid(payment: SubcontractorPayment): void {
        const request: UpdatePaymentStatusRequest = {
            status: 'Paid',
            paymentDate: new Date()
        };
        this.subcontractorService.updatePaymentStatus(payment.id, request).subscribe({
            next: (updated) => {
                const index = this.payments.findIndex(p => p.id === updated.id);
                if (index !== -1) {
                    this.payments[index] = updated;
                    this.calculateSummary();
                }
            },
            error: (error) => {
                console.error('Error marking payment as paid:', error);
            }
        });
    }

    formatDate(date: string | Date | null | undefined): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}
