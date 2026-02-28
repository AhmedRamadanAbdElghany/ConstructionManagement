import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { CashVouchersService, CashVoucherDto, CashVoucherSummary } from '../../../core/services/cash-vouchers.service';
import { MiscExpensesService, MiscExpenseDto, MiscExpenseSummary } from '../../../core/services/misc-expenses.service';
import { TransactionsService, TransactionDto } from '../../../core/services/transactions.service';
import { InvoicesService, InvoiceDto } from '../../../core/services/invoices.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { VendorService, VendorWithStats, VendorDashboard, VendorProject, VendorInvoice } from '../../../core/services/vendor.service';

// Billing interface for platform subscription
interface BillingInvoice {
  id: number;
  date: Date;
  reference: string;
  amount: number;
  status: string;
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-500">
      <div class="max-w-7xl mx-auto animate-premium-fade">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 class="premium-heading mb-4">{{ 'finance.title' | translate }}</h1>
            <p class="premium-subheading mb-0">{{ 'finance.subtitle' | translate }}</p>
          </div>
          <div class="flex gap-4">
            <button class="premium-button-ghost bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5" (click)="refreshData()">
              <span class="mr-2">↺</span> {{ 'common.refresh' | translate }}
            </button>
            <button class="premium-button-primary" (click)="exportReport()">
              <span class="mr-2">↓</span> {{ 'common.export' | translate }}
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
          @for (metric of [
            {key: 'vouchers', label: 'finance.stats.cash_vouchers', value: cashVoucherSummary()?.totalVouchers || 0, amount: cashVoucherSummary()?.totalAmount || 0, color: 'blue', icon: '💰'},
            {key: 'expenses', label: 'finance.stats.misc_expenses', value: miscExpenseSummary()?.totalExpenses || 0, amount: miscExpenseSummary()?.totalAmount || 0, color: 'amber', icon: '💳'},
            {key: 'transactions', label: 'finance.stats.transactions', value: transactions().length, amount: totalTransactionAmount(), color: 'emerald', icon: '💸'},
            {key: 'invoices', label: 'finance.stats.invoices', value: invoices().length, amount: totalInvoiceAmount(), color: 'indigo', icon: '📄'},
            {key: 'vendors', label: 'finance.stats.vendor_bills', value: vendorDashboard()?.totalVendors || 0, amount: vendorDashboard()?.pendingApprovals || 0, color: 'rose', icon: '🏢'}
          ]; track metric.key; let i = $index) {
            <div class="premium-card-stack group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative cursor-default" [style.animation-delay]="(i * 100) + 'ms'">
              <div class="absolute -top-10 -right-10 w-32 h-32 bg-{{metric.color}}-500/5 rounded-full blur-3xl group-hover:bg-{{metric.color}}-500/10 transition-colors"></div>
              <div class="flex items-start justify-between mb-8">
                <div class="w-12 h-12 rounded-2xl bg-{{metric.color}}-500/10 text-{{metric.color}}-600 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                  {{ metric.icon }}
                </div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ metric.value }} Items</span>
              </div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{{ metric.label | translate }}</p>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tghter mb-1">
                {{ metric.amount | currency:'USD':'symbol':'1.0-0' }}
              </h3>
              <div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden shadow-inner">
                <div class="h-full bg-{{metric.color}}-500 rounded-full transition-all duration-1000 scale-x-0 group-hover:scale-x-100 origin-left" style="width: 70%"></div>
              </div>
            </div>
          }
        </div>

        <!-- Navigation Hub (Tabs) -->
        <div class="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900/50 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 w-fit overflow-x-auto no-scrollbar mb-12">
          @for (tab of [
            {id: 'vouchers', label: 'finance.tabs.vouchers', icon: '💰'},
            {id: 'expenses', label: 'finance.tabs.expenses', icon: '💳'},
            {id: 'transactions', label: 'finance.tabs.transactions', icon: '💸'},
            {id: 'invoices', label: 'finance.tabs.invoices', icon: '📄'},
            {id: 'billing', label: 'finance.tabs.billing', icon: '⚡'},
            {id: 'vendors', label: 'finance.tabs.vendors', icon: '🏢'},
            {id: 'ledger', label: 'finance.tabs.ledger', icon: '📝'}
          ]; track tab.id) {
            <button (click)="setActiveTab(tab.id)" 
                    [class]="activeTab === tab.id ? 
                      'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-lg shadow-slate-900/20 dark:shadow-white/10' : 
                      'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center gap-3">
                <span class="grayscale group-hover:grayscale-0">{{ tab.icon }}</span>
                {{ tab.label | translate }}
            </button>
          }
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          @switch (activeTab) {
            @case ('vouchers') {
              <div class="animate-premium-fade">
                <div class="flex items-center justify-between mb-8">
                  <h2 class="premium-section-title mb-0">{{ 'finance.tabs.vouchers' | translate }}</h2>
                  <button class="premium-button-primary !py-3 !px-6" (click)="createVoucher()">
                    <span class="mr-2">+</span> {{ 'finance.voucher.new' | translate }}
                  </button>
                </div>
                <div class="premium-card-stack !p-0 overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                          <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'finance.voucher.number' | translate }}</th>
                          <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'finance.voucher.project' | translate }}</th>
                          <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'finance.voucher.amount' | translate }}</th>
                          <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'finance.voucher.date' | translate }}</th>
                          <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.status' | translate }}</th>
                          <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{{ 'common.actions' | translate }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-200 dark:divide-white/5">
                        @for (voucher of cashVouchers(); track voucher.id) {
                          <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group">
                            <td class="px-8 py-6 font-black text-sm text-slate-900 dark:text-white uppercase tracking-tighter">{{ voucher.voucherNumber }}</td>
                            <td class="px-8 py-6">
                              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ voucher.projectName || '-' }}</span>
                            </td>
                            <td class="px-8 py-6 font-black text-sm text-slate-900 dark:text-white">{{ voucher.amount | currency:'USD':'symbol':'1.0-0' }}</td>
                            <td class="px-8 py-6 text-sm text-slate-500">{{ voucher.createdAt | date:'mediumDate' }}</td>
                            <td class="px-8 py-6">
                              <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                    [ngClass]="{
                                      'bg-amber-500/10 text-amber-600': voucher.status === 'Pending',
                                      'bg-emerald-500/10 text-emerald-600': voucher.status === 'Approved',
                                      'bg-rose-500/10 text-rose-600': voucher.status === 'Rejected'
                                    }">
                                {{ voucher.status }}
                              </span>
                            </td>
                            <td class="px-8 py-6 text-right">
                              <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all" (click)="viewVoucher(voucher)">
                                  👁
                                </button>
                                @if (voucher.status === 'Pending') {
                                  <button class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all" (click)="approveVoucher(voucher)">
                                    ✓
                                  </button>
                                  <button class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all" (click)="rejectVoucher(voucher)">
                                    ✕
                                  </button>
                                }
                              </div>
                            </td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="6" class="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest opacity-40">
                              {{ 'finance.no_vouchers' | translate }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
            @case ('expenses') {
              <div class="expenses-section">
                <div class="section-header">
                  <h2>{{ 'finance.tabs.expenses' | translate }}</h2>
                  <button class="btn btn-primary" (click)="createExpense()">
                    <span class="icon">&#43;</span> {{ 'finance.expense.new' | translate }}
                  </button>
                </div>
                <div class="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ 'finance.expense.number' | translate }}</th>
                        <th>{{ 'finance.expense.category' | translate }}</th>
                        <th>{{ 'finance.expense.project' | translate }}</th>
                        <th>{{ 'finance.expense.amount' | translate }}</th>
                        <th>{{ 'finance.expense.date' | translate }}</th>
                        <th>{{ 'common.status' | translate }}</th>
                        <th>{{ 'common.actions' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (expense of miscExpenses(); track expense.id) {
                        <tr [class.pending]="expense.status === 'Pending'" [class.approved]="expense.status === 'Approved'" [class.rejected]="expense.status === 'Rejected'">
                          <td>{{ expense.expenseNumber }}</td>
                          <td>{{ expense.categoryName || '-' }}</td>
                          <td>{{ expense.projectName || '-' }}</td>
                          <td>{{ expense.amount | currency:'USD':'symbol':'1.0-0' }}</td>
                          <td>{{ expense.expenseDate | date:'shortDate' }}</td>
                          <td>
                            <span class="status-badge" [class.pending]="expense.status === 'Pending'" [class.approved]="expense.status === 'Approved'" [class.rejected]="expense.status === 'Rejected'">
                              {{ expense.statusName }}
                            </span>
                          </td>
                          <td>
                            <button class="btn-icon" (click)="viewExpense(expense)" title="{{ 'common.view' | translate }}">
                              <span>&#128065;</span>
                            </button>
                            @if (expense.status === 'Pending') {
                              <button class="btn-icon" (click)="approveExpense(expense)" title="{{ 'common.approve' | translate }}">
                                <span>&#10004;</span>
                              </button>
                              <button class="btn-icon" (click)="rejectExpense(expense)" title="{{ 'common.reject' | translate }}">
                                <span>&#10006;</span>
                              </button>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="7" class="no-data">{{ 'finance.no_expenses' | translate }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
            @case ('transactions') {
              <div class="transactions-section">
                <div class="section-header">
                  <h2>{{ 'finance.tabs.transactions' | translate }}</h2>
                  <div class="filters">
                    <select [(ngModel)]="selectedProjectId" class="filter-select">
                      <option value="">{{ 'finance.transaction.all_projects' | translate }}</option>
                    </select>
                  </div>
                </div>
                <div class="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ 'finance.transaction.type' | translate }}</th>
                        <th>{{ 'finance.transaction.project_item' | translate }}</th>
                        <th>{{ 'finance.transaction.amount' | translate }}</th>
                        <th>{{ 'finance.transaction.date' | translate }}</th>
                        <th>{{ 'common.status' | translate }}</th>
                        <th>{{ 'common.actions' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (transaction of transactions(); track transaction.id) {
                        <tr [class.pending]="transaction.status === 'Pending'" [class.approved]="transaction.status === 'Approved'" [class.rejected]="transaction.status === 'Rejected'">
                          <td>{{ transaction.transactionTypeName }}</td>
                          <td>{{ transaction.projectItemName || '-' }}</td>
                          <td>{{ transaction.amount | currency:'USD':'symbol':'1.0-0' }}</td>
                          <td>{{ transaction.transactionDate | date:'shortDate' }}</td>
                          <td>
                            <span class="status-badge" [class.pending]="transaction.status === 'Pending'" [class.approved]="transaction.status === 'Approved'" [class.rejected]="transaction.status === 'Rejected'">
                              {{ transaction.statusName }}
                            </span>
                          </td>
                          <td>
                            <button class="btn-icon" (click)="viewTransaction(transaction)" title="{{ 'common.view' | translate }}">
                              <span>&#128065;</span>
                            </button>
                            @if (transaction.status === 'Pending') {
                              <button class="btn-icon" (click)="approveTransaction(transaction)" title="{{ 'common.approve' | translate }}">
                                <span>&#10004;</span>
                              </button>
                              <button class="btn-icon" (click)="rejectTransaction(transaction)" title="{{ 'common.reject' | translate }}">
                                <span>&#10006;</span>
                              </button>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="6" class="no-data">{{ 'finance.no_transactions' | translate }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
            @case ('invoices') {
              <div class="invoices-section">
                <div class="section-header">
                  <h2>{{ 'finance.tabs.invoices' | translate }}</h2>
                  <button class="btn btn-primary" (click)="createInvoice()">
                    <span class="icon">&#43;</span> {{ 'finance.invoice.new' | translate }}
                  </button>
                </div>
                <div class="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ 'finance.invoice.number' | translate }}</th>
                        <th>{{ 'finance.invoice.item' | translate }}</th>
                        <th>{{ 'finance.invoice.amount' | translate }}</th>
                        <th>{{ 'finance.invoice.date' | translate }}</th>
                        <th>{{ 'common.status' | translate }}</th>
                        <th>{{ 'common.actions' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (invoice of invoices(); track invoice.id) {
                        <tr [class.pending]="invoice.status === 'Pending'" [class.approved]="invoice.status === 'Approved'" [class.rejected]="invoice.status === 'Rejected'">
                          <td>{{ invoice.invoiceNumber }}</td>
                          <td>{{ invoice.itemName || '-' }}</td>
                          <td>{{ invoice.netAmount | currency:'USD':'symbol':'1.0-0' }}</td>
                          <td>{{ invoice.invoiceDate | date:'shortDate' }}</td>
                          <td>
                            <span class="status-badge" [class.pending]="invoice.status === 'Pending'" [class.approved]="invoice.status === 'Approved'" [class.rejected]="invoice.status === 'Rejected'">
                              {{ invoice.statusDisplayName }}
                            </span>
                          </td>
                          <td>
                            <button class="btn-icon" (click)="viewInvoice(invoice)" title="{{ 'common.view' | translate }}">
                              <span>&#128065;</span>
                            </button>
                            @if (invoice.status === 'Pending') {
                              <button class="btn-icon" (click)="approveInvoice(invoice)" title="{{ 'common.approve' | translate }}">
                                <span>&#10004;</span>
                              </button>
                              <button class="btn-icon" (click)="rejectInvoice(invoice)" title="{{ 'common.reject' | translate }}">
                                <span>&#10006;</span>
                              </button>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="6" class="no-data">{{ 'finance.no_invoices' | translate }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
            @case ('billing') {
              <div class="billing-section">
                <!-- MRR Card -->
                <div class="billing-hero">
                  <div class="billing-hero-content">
                    <p class="billing-label">{{ 'finance.billing.mrr' | translate }}</p>
                    <h3 class="billing-amount">{{ billingMRR() | currency:'USD':'symbol':'1.0-0' }}</h3>
                    <div class="billing-info-cards">
                      <div class="billing-info-card">
                        <p class="info-label">{{ 'finance.billing.interval' | translate }}</p>
                        <p class="info-value">{{ 'finance.billing.monthly' | translate }}</p>
                      </div>
                      <div class="billing-info-card">
                        <p class="info-label">{{ 'finance.billing.next_renewal' | translate }}</p>
                        <p class="info-value">{{ nextRenewal() }}</p>
                      </div>
                      <div class="billing-info-card status-good">
                        <p class="info-label">{{ 'finance.billing.payment_status' | translate }}</p>
                        <p class="info-value">&#10004; {{ 'finance.billing.good_standing' | translate }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Payout Method -->
                <div class="payout-card">
                  <div class="payout-icon">&#128179;</div>
                  <h4>{{ 'finance.billing.payout_method' | translate }}</h4>
                  <p class="payout-details">{{ payoutMethod() }}</p>
                  <button class="btn btn-secondary" (click)="updatePayoutMethod()">
                    {{ 'finance.billing.update_card' | translate }}
                  </button>
                </div>

                <!-- Invoicing History -->
                <div class="section-header">
                  <h2>{{ 'finance.billing.invoicing_history' | translate }}</h2>
                </div>
                <div class="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ 'finance.billing.billing_date' | translate }}</th>
                        <th>{{ 'finance.billing.transaction_ref' | translate }}</th>
                        <th>{{ 'finance.billing.amount_paid' | translate }}</th>
                        <th>{{ 'finance.billing.status' | translate }}</th>
                        <th>{{ 'common.actions' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (invoice of billingHistory(); track invoice.id) {
                        <tr>
                          <td>{{ invoice.date | date:'MMM dd, yyyy' }}</td>
                          <td>{{ invoice.reference }}</td>
                          <td>{{ invoice.amount | currency:'USD':'symbol':'1.0-0' }}</td>
                          <td>
                            <span class="status-badge approved">{{ invoice.status }}</span>
                          </td>
                          <td>
                            <button class="btn-icon" (click)="viewInvoiceDetails(invoice)" title="{{ 'common.view' | translate }}">
                              <span>&#128065;</span>
                            </button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="no-data">{{ 'finance.billing.no_history' | translate }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
            @case ('vendors') {
              <div class="vendors-section">
                <!-- Vendor Dashboard Summary -->
                @if (vendorDashboard()) {
                  <div class="vendor-summary-cards">
                    <div class="summary-card">
                      <span class="summary-label">{{ 'finance.vendors.total_vendors' | translate }}</span>
                      <span class="summary-value">{{ vendorDashboard()!.totalVendors }}</span>
                    </div>
                    <div class="summary-card">
                      <span class="summary-label">{{ 'finance.vendors.total_spend' | translate }}</span>
                      <span class="summary-value">{{ vendorDashboard()!.totalSpend | currency:'USD':'symbol':'1.0-0' }}</span>
                    </div>
                    <div class="summary-card warning">
                      <span class="summary-label">{{ 'finance.vendors.pending_approvals' | translate }}</span>
                      <span class="summary-value">{{ vendorDashboard()!.pendingApprovals | currency:'USD':'symbol':'1.0-0' }}</span>
                    </div>
                  </div>
                }

                <div class="section-header">
                  <h2>{{ 'finance.tabs.vendors' | translate }}</h2>
                </div>
                <div class="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ 'finance.vendors.name' | translate }}</th>
                        <th>{{ 'finance.vendors.type' | translate }}</th>
                        <th>{{ 'finance.vendors.total_invoices' | translate }}</th>
                        <th>{{ 'finance.vendors.total_amount' | translate }}</th>
                        <th>{{ 'finance.vendors.pending' | translate }}</th>
                        <th>{{ 'finance.vendors.projects' | translate }}</th>
                        <th>{{ 'common.actions' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (vendor of vendorsWithStats(); track vendor.id) {
                        <tr [class.inactive]="!vendor.isActive">
                          <td>
                            <span class="vendor-name">{{ vendor.name }}</span>
                            @if (vendor.isExternalVendor) {
                              <span class="badge external">{{ 'finance.vendors.external' | translate }}</span>
                            }
                          </td>
                          <td>{{ vendor.vendorType || '-' }}</td>
                          <td>{{ vendor.totalInvoices }}</td>
                          <td>{{ vendor.totalAmount | currency:'USD':'symbol':'1.0-0' }}</td>
                          <td>
                            @if (vendor.pendingAmount > 0) {
                              <span class="status-badge pending">{{ vendor.pendingAmount | currency:'USD':'symbol':'1.0-0' }}</span>
                            } @else {
                              <span>-</span>
                            }
                          </td>
                          <td>{{ vendor.projectCount }}</td>
                          <td>
                            <button class="btn-icon" (click)="viewVendorDetail(vendor)" title="{{ 'common.view' | translate }}">
                              <span>&#128065;</span>
                            </button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="7" class="no-data">{{ 'finance.vendors.no_vendors' | translate }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
            @case ('ledger') {
              <div class="ledger-section">
                <div class="section-header">
                  <h2>{{ 'finance.tabs.ledger' | translate }}</h2>
                  <div class="header-actions">
                    <span class="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {{ ledger().length }} {{ 'finance.ledger.total_entries' | translate }}
                    </span>
                  </div>
                </div>
                <div class="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ 'finance.ledger.date' | translate }}</th>
                        <th>{{ 'finance.ledger.vendor' | translate }}</th>
                        <th>{{ 'finance.ledger.number' | translate }}</th>
                        <th>{{ 'finance.ledger.project' | translate }}</th>
                        <th>{{ 'finance.ledger.amount' | translate }}</th>
                        <th>{{ 'common.status' | translate }}</th>
                        <th>{{ 'common.actions' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (entry of ledger(); track entry.id) {
                        <tr [class.pending]="entry.approvalStatus === 'Pending'" [class.approved]="entry.approvalStatus === 'Approved'" [class.rejected]="entry.approvalStatus === 'Rejected'">
                          <td>{{ entry.invoiceDate | date:'shortDate' }}</td>
                          <td>
                            <div class="flex flex-col">
                              <span class="font-bold">{{ entry.vendorName }}</span>
                              @if (entry.isExternalVendor) {
                                <span class="text-[9px] uppercase tracking-tighter text-amber-600 font-black">{{ 'finance.vendors.external' | translate }}</span>
                              }
                            </div>
                          </td>
                          <td class="font-mono text-xs">{{ entry.invoiceNumber }}</td>
                          <td>{{ entry.projectName || '-' }}</td>
                          <td class="font-bold text-slate-900">{{ entry.amount | currency }}</td>
                          <td>
                            <span class="status-badge" [class.pending]="entry.approvalStatus === 'Pending'" [class.approved]="entry.approvalStatus === 'Approved'" [class.rejected]="entry.approvalStatus === 'Rejected'">
                              {{ entry.approvalStatus }}
                            </span>
                          </td>
                          <td>
                            <button class="btn-icon" (click)="viewLedgerEntry(entry)" title="{{ 'common.view' | translate }}">
                              <span>&#128065;</span>
                            </button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="7" class="no-data">{{ 'finance.ledger.no_data' | translate }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          }
        </div>
    </div>

    <!-- Vendor Detail Modal -->
    @if (showVendorDetail() && selectedVendor()) {
      <div class="modal-overlay" (click)="closeVendorDetail()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedVendor()!.name }}</h2>
            <button class="btn-close" (click)="closeVendorDetail()">&#10006;</button>
          </div>
          <div class="modal-body">
            <!-- Vendor Projects -->
            <div class="detail-section">
              <h3>{{ 'finance.vendors.projects' | translate }}</h3>
              <div class="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'finance.vendors.project_name' | translate }}</th>
                      <th>{{ 'finance.vendors.invoices' | translate }}</th>
                      <th>{{ 'finance.vendors.total' | translate }}</th>
                      <th>{{ 'finance.vendors.last_invoice' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (project of vendorProjects(); track project.projectId) {
                      <tr>
                        <td>{{ project.projectName }}</td>
                        <td>{{ project.totalInvoices }}</td>
                        <td>{{ project.totalAmount | currency:'USD':'symbol':'1.0-0' }}</td>
                        <td>{{ project.lastInvoiceDate | date:'shortDate' }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="no-data">{{ 'finance.vendors.no_projects' | translate }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Vendor Bills -->
            <div class="detail-section">
              <h3>{{ 'finance.vendors.bills' | translate }}</h3>
              <div class="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'finance.vendors.invoice_number' | translate }}</th>
                      <th>{{ 'finance.vendors.date' | translate }}</th>
                      <th>{{ 'finance.vendors.amount' | translate }}</th>
                      <th>{{ 'common.status' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (bill of vendorBills(); track bill.id) {
                      <tr>
                        <td>{{ bill.invoiceNumber }}</td>
                        <td>{{ bill.invoiceDate | date:'shortDate' }}</td>
                        <td>{{ bill.amount | currency:'USD':'symbol':'1.0-0' }}</td>
                        <td>
                          <span class="status-badge" [class.pending]="bill.approvalStatus === 'Pending'" [class.approved]="bill.approvalStatus === 'Approved'" [class.rejected]="bill.approvalStatus === 'Rejected'">
                            {{ bill.approvalStatus }}
                          </span>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="no-data">{{ 'finance.vendors.no_bills' | translate }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .finance-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .header-content h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .header-content .subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.375rem;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #f3f4f6;
    }

    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
    }

    .spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid #3b82f6;
    }

    .metric-card.cash-vouchers { border-left-color: #3b82f6; }
    .metric-card.misc-expenses { border-left-color: #f59e0b; }
    .metric-card.transactions { border-left-color: #10b981; }
    .metric-card.invoices { border-left-color: #8b5cf6; }
    .metric-card.vendor-bills { border-left-color: #ef4444; }

    .metric-icon {
      font-size: 2rem;
      opacity: 0.8;
    }

    .metric-content {
      flex: 1;
    }

    .metric-title {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0.25rem 0;
    }

    .metric-subtitle {
      display: block;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .metric-amount {
      font-size: 1.25rem;
      font-weight: 700;
      color: #059669;
    }

    .metric-amount.warning {
      color: #ef4444;
    }

    .tabs-container {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .tab-btn {
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: none;
      font-weight: 600;
      font-size: 0.875rem;
      color: #6b7280;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tab-btn:hover {
      color: #3b82f6;
    }

    .tab-btn.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .tab-content {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 0.75rem;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .data-table {
      overflow-x: auto;
    }

    .data-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: #f9fafb;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e5e7eb;
    }

    .data-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
    }

    .data-table tr:hover {
      background: #f9fafb;
    }

    .data-table tr.pending {
      background: #fef3c7;
    }

    .data-table tr.approved {
      background: #d1fae5;
    }

    .data-table tr.rejected {
      background: #fee2e2;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-block;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.approved {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Billing Section Styles */
    .billing-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .billing-hero {
      background: linear-gradient(135deg, #4f46e5 0%, #1e40af 100%);
      border-radius: 2rem;
      padding: 2rem;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .billing-hero::before {
      content: '';
      position: absolute;
      right: -5rem;
      top: -5rem;
      width: 15rem;
      height: 15rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      blur: 3rem;
    }

    .billing-hero-content {
      position: relative;
      z-index: 1;
    }

    .billing-label {
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.5rem;
    }

    .billing-amount {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
    }

    .billing-info-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .billing-info-card {
      padding: 1rem 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .billing-info-card.status-good {
      background: #10b981;
    }

    .info-label {
      font-size: 0.5625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.25rem;
    }

    .info-value {
      font-weight: 700;
      color: white;
    }

    .payout-card {
      background: #f9fafb;
      border-radius: 2rem;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border: 1px solid #e5e7eb;
    }

    .payout-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .payout-card h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .payout-details {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 1rem 0;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
      font-style: italic;
    }

    /* Vendor Styles */
    .vendor-summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3b82f6;
    }

    .summary-card.warning {
      border-left-color: #f59e0b;
    }

    .summary-label {
      display: block;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .summary-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .vendor-name {
      font-weight: 600;
    }

    .badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-left: 0.5rem;
    }

    .badge.external {
      background: #fef3c7;
      color: #92400e;
    }

    tr.inactive {
      opacity: 0.5;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }

    .btn-close:hover {
      color: #1f2937;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .detail-section {
      margin-bottom: 2rem;
    }

    .detail-section:last-child {
      margin-bottom: 0;
    }

    .detail-section h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 1rem 0;
    }
  `]
})
export class FinanceComponent implements OnInit, OnDestroy {
  private cashVouchersService = inject(CashVouchersService);
  private miscExpensesService = inject(MiscExpensesService);
  private transactionsService = inject(TransactionsService);
  private invoicesService = inject(InvoicesService);
  private vendorService = inject(VendorService);
  private destroy$ = new Subject<void>();

  isLoading = signal(true);
  activeTab: 'vouchers' | 'expenses' | 'transactions' | 'invoices' | 'billing' | 'vendors' | 'ledger' = 'vouchers';
  selectedProjectId = signal<number | null>(null);

  cashVouchers = signal<CashVoucherDto[]>([]);
  cashVoucherSummary = signal<CashVoucherSummary | null>(null);
  miscExpenses = signal<MiscExpenseDto[]>([]);
  miscExpenseSummary = signal<MiscExpenseSummary | null>(null);
  transactions = signal<TransactionDto[]>([]);
  invoices = signal<InvoiceDto[]>([]);

  // Vendor signals
  vendorsWithStats = signal<VendorWithStats[]>([]);
  vendorDashboard = signal<VendorDashboard | null>(null);
  selectedVendor = signal<VendorWithStats | null>(null);
  vendorProjects = signal<VendorProject[]>([]);
  vendorBills = signal<VendorInvoice[]>([]);
  ledger = signal<VendorInvoice[]>([]);
  showVendorDetail = signal(false);

  pendingTransactions = computed(() => this.transactions().filter(t => t.status === 'Pending').length);
  pendingInvoices = computed(() => this.invoices().filter(i => i.status === 'Pending').length);
  totalTransactionAmount = computed(() => this.transactions().reduce((sum, t) => sum + t.amount, 0));
  totalInvoiceAmount = computed(() => this.invoices().reduce((sum, i) => sum + i.netAmount, 0));

  // Billing signals
  billingMRR = signal(5240);
  nextRenewal = signal('March 15, 2024');
  payoutMethod = signal('VISA ending in •••• 4422');
  billingHistory = signal<BillingInvoice[]>([
    { id: 1, date: new Date('2024-02-15'), reference: 'INV-2024-0215', amount: 5240, status: 'Settled' },
    { id: 2, date: new Date('2024-01-15'), reference: 'INV-2024-0115', amount: 5240, status: 'Settled' },
    { id: 3, date: new Date('2023-12-15'), reference: 'INV-2023-1215', amount: 5240, status: 'Settled' },
    { id: 4, date: new Date('2023-11-15'), reference: 'INV-2023-1115', amount: 5240, status: 'Settled' }
  ]);

  private i18nService = inject(I18nService);

  constructor() {
    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllData();
      });
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllData(): void {
    this.isLoading.set(true);

    // Load cash vouchers
    this.cashVouchersService.getVouchers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(vouchers => {
        this.cashVouchers.set(vouchers);
        this.loadCashVoucherSummary();
      });

    // Load misc expenses
    this.miscExpensesService.getExpenses()
      .pipe(takeUntil(this.destroy$))
      .subscribe(expenses => {
        this.miscExpenses.set(expenses);
        this.loadMiscExpenseSummary();
      });

    // Transactions tab is project-scoped; load only when a project filter is selected
    // (deferred to loadTransactionsForProject, not fetched globally here)
    this.transactions.set([]);

    // Load invoices (company-scoped; backend filters by companyId from JWT)
    this.invoicesService.getInvoices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.invoices.set(result.items as any[]);
        this.isLoading.set(false);
      });

    // Load vendor data
    this.loadVendorData();

    // Load financial ledger
    this.loadLedger();
  }

  loadVendorData(): void {
    this.vendorService.getVendorsWithStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(vendors => {
        this.vendorsWithStats.set(vendors);
      });

    this.vendorService.getVendorDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe(dashboard => {
        this.vendorDashboard.set(dashboard);
      });
  }

  loadCashVoucherSummary(): void {
    this.cashVouchersService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cashVoucherSummary.set(summary);
      });
  }

  loadMiscExpenseSummary(): void {
    this.miscExpensesService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.miscExpenseSummary.set(summary);
      });
  }

  refreshData(): void {
    this.loadAllData();
  }

  exportReport(): void {
    // TODO: Implement export functionality
    console.log('Exporting financial report...');
  }

  // Cash Voucher Actions
  createVoucher(): void {
    console.log('Creating new cash voucher...');
  }

  viewVoucher(voucher: CashVoucherDto): void {
    console.log('Viewing voucher:', voucher);
  }

  approveVoucher(voucher: CashVoucherDto): void {
    if (confirm('Approve cash voucher ' + voucher.voucherNumber + '?')) {
      this.cashVouchersService.reviewVoucher(voucher.id, { isApproved: true })
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAllData());
    }
  }

  rejectVoucher(voucher: CashVoucherDto): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.cashVouchersService.reviewVoucher(voucher.id, { isApproved: false, rejectionReason: reason })
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAllData());
    }
  }

  // Misc Expense Actions
  createExpense(): void {
    console.log('Creating new misc expense...');
  }

  viewExpense(expense: MiscExpenseDto): void {
    console.log('Viewing expense:', expense);
  }

  approveExpense(expense: MiscExpenseDto): void {
    if (confirm('Approve expense ' + expense.expenseNumber + '?')) {
      this.miscExpensesService.reviewExpense(expense.id, { isApproved: true })
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAllData());
    }
  }

  rejectExpense(expense: MiscExpenseDto): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.miscExpensesService.reviewExpense(expense.id, { isApproved: false, rejectionReason: reason })
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAllData());
    }
  }

  // Transaction Actions
  viewTransaction(transaction: TransactionDto): void {
    console.log('Viewing transaction:', transaction);
  }

  approveTransaction(transaction: TransactionDto): void {
    if (confirm('Approve transaction?')) {
      this.transactionsService.reviewTransaction(1, transaction.id, { isApproved: true })
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAllData());
    }
  }

  rejectTransaction(transaction: TransactionDto): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.transactionsService.reviewTransaction(1, transaction.id, { isApproved: false, rejectionReason: reason })
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAllData());
    }
  }

  // Invoice Actions
  createInvoice(): void {
    console.log('Creating new invoice...');
  }

  viewInvoice(invoice: InvoiceDto): void {
    console.log('Viewing invoice:', invoice);
  }

  approveInvoice(invoice: InvoiceDto): void {
    if (confirm('Approve invoice ' + invoice.invoiceNumber + '?')) {
      this.invoicesService.reviewInvoice(invoice.id, true)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAllData());
    }
  }

  rejectInvoice(invoice: InvoiceDto): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.invoicesService.reviewInvoice(invoice.id, false, reason)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAllData());
    }
  }

  // Billing Actions
  updatePayoutMethod(): void {
    console.log('Opening payout method update dialog...');
    // TODO: Implement payout method update modal
  }

  viewInvoiceDetails(invoice: BillingInvoice): void {
    console.log('Viewing billing invoice:', invoice);
    // TODO: Open invoice PDF or details modal
  }

  // Vendor Actions
  viewVendorDetail(vendor: VendorWithStats): void {
    this.selectedVendor.set(vendor);
    this.showVendorDetail.set(true);

    // Load vendor projects
    this.vendorService.getVendorProjects(vendor.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(projects => {
        this.vendorProjects.set(projects);
      });

    // Load vendor bills
    this.vendorService.getVendorBills(vendor.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(bills => {
        this.vendorBills.set(bills);
      });
  }

  closeVendorDetail(): void {
    this.showVendorDetail.set(false);
    this.selectedVendor.set(null);
    this.vendorProjects.set([]);
    this.vendorBills.set([]);
  }

  loadLedger(): void {
    this.vendorService.getFinancialLedger()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ledger => {
        this.ledger.set(ledger);
      });
  }

  viewLedgerEntry(entry: VendorInvoice): void {
    console.log('Viewing ledger entry:', entry);
    // You could open a shared "Invoice View" modal here
  }

  setActiveTab(tab: any): void {
    this.activeTab = tab;
  }
}
