import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { VendorService, Vendor, VendorInvoice, VendorInvoiceSummary, CreateVendorRequest, CreateVendorInvoiceRequest, VendorProject, VendorWithStats } from '../../../core/services/vendor.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
    selector: 'app-vendors',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
        <div class="vendors-container p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ 'vendors.title' | translate }}</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'vendors.description' | translate }}</p>
                </div>
                @if (canAddVendor) {
                    <button (click)="showCreateModal = true" 
                            class="px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium text-sm hover:bg-cyan-600 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        {{ 'vendors.add_vendor' | translate }}
                    </button>
                }
            </div>

            <!-- Tabs -->
            <div class="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button (click)="activeTab = 'vendors'"
                        [class.border-cyan-500]="activeTab === 'vendors'"
                        [class.text-cyan-600]="activeTab === 'vendors'"
                        class="px-4 py-2 border-b-2 border-transparent font-medium text-sm transition-colors">
                    {{ 'vendors.vendors_list' | translate }}
                </button>
                @if (canApproveInvoices) {
                    <button (click)="activeTab = 'pending'"
                            [class.border-cyan-500]="activeTab === 'pending'"
                            [class.text-cyan-600]="activeTab === 'pending'"
                            class="px-4 py-2 border-b-2 border-transparent font-medium text-sm transition-colors flex items-center gap-2">
                        {{ 'vendors.pending_approvals' | translate }}
                        @if (pendingCount > 0) {
                            <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                {{ pendingCount }}
                            </span>
                        }
                    </button>
                }
                <button (click)="activeTab = 'summary'"
                        [class.border-cyan-500]="activeTab === 'summary'"
                        [class.text-cyan-600]="activeTab === 'summary'"
                        class="px-4 py-2 border-b-2 border-transparent font-medium text-sm transition-colors">
                    {{ 'vendors.summary' | translate }}
                </button>
            </div>

            @if (loading) {
                <div class="flex items-center justify-center py-12">
                    <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            } @else {
                <!-- Vendors List Tab -->
                @if (activeTab === 'vendors') {
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        @for (vendor of vendors; track vendor.id) {
                            <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition-colors">
                                <div class="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 class="font-bold text-slate-900 dark:text-white">{{ vendor.name }}</h3>
                                        @if (vendor.vendorType) {
                                            <span class="text-xs text-slate-500 dark:text-slate-400">{{ vendor.vendorType }}</span>
                                        }
                                    </div>
                                    <span class="px-2 py-0.5 rounded text-xs font-medium"
                                          [class.bg-emerald-100]="vendor.isActive"
                                          [class.text-emerald-700]="vendor.isActive"
                                          [class.dark:bg-emerald-900/30]="vendor.isActive"
                                          [class.dark:text-emerald-400]="vendor.isActive">
                                        {{ (vendor.isActive ? 'common.active' : 'common.inactive') | translate }}
                                    </span>
                                </div>
                                
                                <div class="space-y-2 text-sm">
                                    @if (vendor.phone) {
                                        <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                            </svg>
                                            <span>{{ vendor.phone }}</span>
                                        </div>
                                    }
                                    @if (vendor.email) {
                                        <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                            </svg>
                                            <span>{{ vendor.email }}</span>
                                        </div>
                                    }
                                    @if (vendor.contactPerson) {
                                        <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                            <span>{{ vendor.contactPerson }}</span>
                                        </div>
                                    }
                                </div>

                                <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div class="flex items-center justify-between text-sm">
                                        <div class="flex flex-col">
                                            <span class="text-slate-500 dark:text-slate-400 font-medium">{{ 'vendors.invoices_count' | translate }}: {{ vendor.totalInvoices || 0 }}</span>
                                            @if (vendor.totalAmount) {
                                                <div class="flex flex-col">
                                                    <span class="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{{ 'vendors.total_payments' | translate }}</span>
                                                    <span class="text-cyan-600 dark:text-cyan-400 font-bold">{{ (vendor.totalAmount || 0) | currency }}</span>
                                                </div>
                                            }
                                        </div>
                                        <div class="flex flex-wrap gap-2 justify-end">
                                            <button (click)="viewVendorInvoices(vendor)" 
                                                    class="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-wider">
                                                {{ 'vendors.view_bills' | translate }}
                                            </button>
                                            <button (click)="viewVendorProjects(vendor)" 
                                                    class="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors uppercase tracking-wider">
                                                {{ 'vendors.view_projects' | translate }}
                                            </button>
                                            @if (canAddVendor) {
                                                <button (click)="showAddInvoice(vendor)" 
                                                        class="px-2 py-1 rounded-lg bg-cyan-500 text-white text-[10px] font-bold hover:bg-cyan-600 transition-colors uppercase tracking-wider">
                                                    {{ 'vendors.add_invoice' | translate }}
                                                </button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        @empty {
                            <div class="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                                <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                <p>{{ 'vendors.no_vendors' | translate }}</p>
                            </div>
                        }
                    </div>
                }

                <!-- Pending Approvals Tab -->
                @if (activeTab === 'pending') {
                    <div class="space-y-4">
                        @for (invoice of pendingInvoices; track invoice.id) {
                            <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <div class="flex items-start gap-4">
                                    <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <span class="font-bold text-slate-900 dark:text-white">{{ invoice.invoiceNumber }}</span>
                                            <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold uppercase">
                                                {{ 'vendors.pending' | translate }}
                                            </span>
                                        </div>
                                        <div class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            <span>{{ invoice.vendorName }}</span>
                                            <span class="mx-2">•</span>
                                            <span>{{ invoice.amount | currency }}</span>
                                            <span class="mx-2">•</span>
                                            <span>{{ invoice.invoiceDate | date:'mediumDate' }}</span>
                                        </div>
                                        @if (invoice.description) {
                                            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ invoice.description }}</p>
                                        }
                                        <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            {{ 'vendors.submitted_by' | translate }}: {{ invoice.createdByUserName }} • {{ invoice.createdAt | date:'medium' }}
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button (click)="approveInvoice(invoice)" 
                                                class="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                                            {{ 'vendors.approve' | translate }}
                                        </button>
                                        <button (click)="showRejectModal(invoice)" 
                                                class="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors">
                                            {{ 'vendors.reject' | translate }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                        @empty {
                            <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                                <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p>{{ 'vendors.no_pending_invoices' | translate }}</p>
                            </div>
                        }
                    </div>
                }

                <!-- Summary Tab -->
                @if (activeTab === 'summary') {
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        @for (summary of vendorSummary; track summary.vendorId) {
                            <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <h3 class="font-bold text-slate-900 dark:text-white mb-3">{{ summary.vendorName }}</h3>
                                <div class="space-y-2">
                                    <div class="flex justify-between text-sm">
                                        <span class="text-slate-500 dark:text-slate-400">{{ 'vendors.total_invoices' | translate }}</span>
                                        <span class="font-medium text-slate-900 dark:text-white">{{ summary.totalInvoices }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-slate-500 dark:text-slate-400">{{ 'vendors.total_amount' | translate }}</span>
                                        <span class="font-medium text-emerald-600 dark:text-emerald-400">{{ summary.totalAmount | currency }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-slate-500 dark:text-slate-400">{{ 'vendors.pending' | translate }}</span>
                                        <span class="font-medium text-amber-600">{{ summary.pendingApprovals }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-slate-500 dark:text-slate-400">{{ 'vendors.approved' | translate }}</span>
                                        <span class="font-medium text-emerald-600">{{ summary.approvedCount }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-slate-500 dark:text-slate-400">{{ 'vendors.rejected' | translate }}</span>
                                        <span class="font-medium text-rose-600">{{ summary.rejectedCount }}</span>
                                    </div>
                                </div>
                            </div>
                        }
                        @empty {
                            <div class="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                                <p>{{ 'vendors.no_summary' | translate }}</p>
                            </div>
                        }
                    </div>
                }
            }

            <!-- Create Vendor Modal -->
            @if (showCreateModal) {
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showCreateModal = false">
                    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ 'vendors.create_vendor' | translate }}</h3>
                            <button (click)="showCreateModal = false" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="p-4 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.name' | translate }} *</label>
                                <input type="text" [(ngModel)]="newVendor.name" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.phone' | translate }}</label>
                                    <input type="text" [(ngModel)]="newVendor.phone" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.email' | translate }}</label>
                                    <input type="email" [(ngModel)]="newVendor.email" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.contact_person' | translate }}</label>
                                <input type="text" [(ngModel)]="newVendor.contactPerson" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.vendor_type' | translate }}</label>
                                <select [(ngModel)]="newVendor.vendorType" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    <option value="">{{ 'vendors.select_type' | translate }}</option>
                                    <option value="Cement">{{ 'vendors.type_cement' | translate }}</option>
                                    <option value="Steel">{{ 'vendors.type_steel' | translate }}</option>
                                    <option value="Sand">{{ 'vendors.type_sand' | translate }}</option>
                                    <option value="Aggregate">{{ 'vendors.type_aggregate' | translate }}</option>
                                    <option value="Bricks">{{ 'vendors.type_bricks' | translate }}</option>
                                    <option value="Other">{{ 'vendors.type_other' | translate }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.notes' | translate }}</label>
                                <textarea [(ngModel)]="newVendor.notes" rows="2" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"></textarea>
                            </div>
                        </div>
                        <div class="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                            <button (click)="showCreateModal = false" class="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {{ 'common.cancel' | translate }}
                            </button>
                            <button (click)="createVendor()" [disabled]="!newVendor.name" class="flex-1 px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50">
                                {{ 'common.create' | translate }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            <!-- Add Invoice Modal -->
            @if (showAddInvoiceModal && selectedVendor) {
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showAddInvoiceModal = false">
                    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl" (click)="$event.stopPropagation()">
                        <div class="p-4 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor *</label>
                                @if (selectedVendor && !isChangingVendor) {
                                    <div class="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                        <span class="text-sm font-medium">{{ selectedVendor.name }}</span>
                                        <button (click)="isChangingVendor = true" class="text-xs text-cyan-500 hover:underline">Change</button>
                                    </div>
                                } @else {
                                    <div class="space-y-2">
                                        <select [(ngModel)]="newInvoice.vendorId" (change)="onVendorIdChange()"
                                                class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500">
                                            <option [value]="0">-- {{ 'vendors.select_vendor' | translate }} --</option>
                                            @for (v of vendors; track v.id) {
                                                <option [value]="v.id">{{ v.name }}</option>
                                            }
                                            <option [value]="-1">+ New Supplier (Shadow Vendor)</option>
                                        </select>
                                        
                                        @if (newInvoice.vendorId === -1) {
                                            <input type="text" [(ngModel)]="newInvoice.newVendorName" 
                                                   placeholder="Enter new supplier name"
                                                   class="w-full px-4 py-2 rounded-xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500" />
                                        }
                                    </div>
                                }
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.invoice_number' | translate }} *</label>
                                    <input type="text" [(ngModel)]="newInvoice.invoiceNumber" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.invoice_date' | translate }} *</label>
                                    <input type="date" [(ngModel)]="newInvoice.invoiceDate" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.amount' | translate }} *</label>
                                <input type="number" [(ngModel)]="newInvoice.amount" step="0.01" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.description' | translate }}</label>
                                <input type="text" [(ngModel)]="newInvoice.description" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.material_type' | translate }}</label>
                                <select [(ngModel)]="newInvoice.materialType" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    <option value="">{{ 'vendors.select_type' | translate }}</option>
                                    <option value="Cement">{{ 'vendors.type_cement' | translate }}</option>
                                    <option value="Steel">{{ 'vendors.type_steel' | translate }}</option>
                                    <option value="Sand">{{ 'vendors.type_sand' | translate }}</option>
                                    <option value="Aggregate">{{ 'vendors.type_aggregate' | translate }}</option>
                                    <option value="Other">{{ 'vendors.type_other' | translate }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.invoice_file' | translate }}</label>
                                <input type="file" (change)="onFileSelected($event)" accept=".pdf,.jpg,.jpeg,.png" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                            </div>
                        </div>
                        <div class="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                            <button (click)="showAddInvoiceModal = false" class="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {{ 'common.cancel' | translate }}
                            </button>
                            <button (click)="createInvoice()" [disabled]="(!newInvoice.vendorId && !newInvoice.newVendorName) || !newInvoice.invoiceNumber || !newInvoice.amount" class="flex-1 px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50">
                                {{ 'common.submit' | translate }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            <!-- Reject Invoice Modal -->
            @if (showRejectInvoiceModal && selectedInvoice) {
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showRejectInvoiceModal = false">
                    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ 'vendors.reject_invoice' | translate }}</h3>
                            <button (click)="showRejectInvoiceModal = false" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="p-4">
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'vendors.rejection_reason' | translate }} *</label>
                            <textarea [(ngModel)]="rejectionReason" rows="3" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"></textarea>
                        </div>
                        <div class="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                            <button (click)="showRejectInvoiceModal = false" class="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {{ 'common.cancel' | translate }}
                            </button>
                            <button (click)="rejectInvoice()" [disabled]="!rejectionReason" class="flex-1 px-4 py-2 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
                                {{ 'vendors.reject' | translate }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            <!-- Vendor Projects Modal -->
            @if (showVendorProjectsModal && selectedVendor) {
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="showVendorProjectsModal = false">
                    <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-800" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-between p-8 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ selectedVendor.name }}</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ 'vendors.projects_summary' | translate }}</span>
                                </div>
                            </div>
                            <button (click)="showVendorProjectsModal = false" class="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="p-8 overflow-y-auto max-h-[60vh] space-y-6">
                            @for (project of vendorProjects; track project.projectId) {
                                <div class="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all group">
                                    <div class="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 class="font-black text-slate-900 dark:text-white text-xl">{{ project.projectName }}</h4>
                                            <p class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                {{ project.firstInvoiceDate | date:'mediumDate' }} — {{ project.lastInvoiceDate | date:'mediumDate' }}
                                            </p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-2xl font-black text-indigo-600 dark:text-indigo-400">{{ project.totalAmount | currency }}</p>
                                            <div class="flex items-center justify-end gap-1 mt-1">
                                                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">{{ project.totalInvoices }} Invoices</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-white/5">
                                        <div class="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                            <p class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Approved</p>
                                            <p class="text-base font-black text-emerald-700 dark:text-emerald-300">{{ project.approvedAmount | currency }}</p>
                                        </div>
                                        <div class="p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                            <p class="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Pending</p>
                                            <p class="text-base font-black text-amber-700 dark:text-amber-300">{{ project.pendingAmount | currency }}</p>
                                        </div>
                                    </div>
                                </div>
                            }
                            @empty {
                                <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <div class="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                                        <svg class="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                    </div>
                                    <p class="font-bold text-lg text-slate-500 dark:text-slate-400">No projects found</p>
                                    <p class="text-sm mt-1">This vendor hasn't been linked to any projects yet.</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }

            <!-- Vendor Invoices Modal -->
            @if (showVendorInvoicesModal && selectedVendor) {
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="showVendorInvoicesModal = false">
                    <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-between p-8 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ selectedVendor.name }}</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ 'vendors.all_bills_and_invoices' | translate }}</span>
                                </div>
                            </div>
                            <button (click)="showVendorInvoicesModal = false" class="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Invoice Filters -->
                        <div class="px-8 py-4 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-6 items-center">
                            <div class="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.from' | translate }}</span>
                                <input type="date" [(ngModel)]="invoiceFilters.fromDate" class="bg-transparent border-none text-xs font-bold p-0 focus:ring-0 text-slate-700 dark:text-slate-200" />
                            </div>
                            <div class="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.to' | translate }}</span>
                                <input type="date" [(ngModel)]="invoiceFilters.toDate" class="bg-transparent border-none text-xs font-bold p-0 focus:ring-0 text-slate-700 dark:text-slate-200" />
                            </div>
                            <div class="flex-1"></div>
                            <button (click)="resetInvoiceFilters()" class="text-xs font-black text-cyan-500 hover:text-cyan-600 uppercase tracking-widest">Reset Filters</button>
                        </div> 

                        <div class="p-8 overflow-y-auto max-h-[60vh]">
                            <div class="space-y-4">
                                @for (invoice of filteredInvoices; track invoice.id) {
                                    <div class="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-all group">
                                        <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-all transform group-hover:scale-105">
                                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center flex-wrap gap-2">
                                                <span class="text-lg font-black text-slate-900 dark:text-white">{{ invoice.invoiceNumber }}</span>
                                                <span class="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em]"
                                                      [ngClass]="{
                                                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': invoice.approvalStatus === 'Pending',
                                                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': invoice.approvalStatus === 'Approved' || invoice.approvalStatus === 'Reviewed',
                                                          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': invoice.approvalStatus === 'Rejected'
                                                      }">
                                                    {{ invoice.approvalStatus | translate }}
                                                </span>
                                                @if (invoice.projectName) {
                                                    <span class="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                                                        {{ invoice.projectName }}
                                                    </span>
                                                }
                                            </div>
                                            <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2">
                                                {{ invoice.invoiceDate | date:'mediumDate' }}
                                                <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                                {{ invoice.materialType || 'General Materials' }}
                                            </div>
                                            @if (invoice.description) {
                                                <p class="text-xs text-slate-400 mt-2 font-medium line-clamp-1 italic">{{ invoice.description }}</p>
                                            }
                                        </div>
                                        <div class="text-right">
                                            <p class="text-2xl font-black text-slate-900 dark:text-white">{{ invoice.amount | currency }}</p>
                                            @if (invoice.fileUrl) {
                                                <a [href]="invoice.fileUrl" target="_blank" class="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-900/10 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-all">
                                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                    View File
                                                </a>
                                            }
                                        </div>
                                    </div>
                                }
                                @empty {
                                    <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <div class="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                                            <svg class="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                        </div>
                                        <p class="font-bold text-lg text-slate-500 dark:text-slate-400">No invoices found</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    `
})
export class VendorsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private i18nService = inject(I18nService);

    loading = false;
    activeTab: 'vendors' | 'pending' | 'summary' = 'vendors';

    vendors: VendorWithStats[] = [];
    pendingInvoices: VendorInvoice[] = [];
    vendorSummary: VendorInvoiceSummary[] = [];
    vendorInvoices: VendorInvoice[] = [];
    vendorProjects: VendorProject[] = [];
    selectedVendor: Vendor | VendorWithStats | null = null;
    selectedInvoice: VendorInvoice | null = null;

    showCreateModal = false;
    showAddInvoiceModal = false;
    showRejectInvoiceModal = false;
    showVendorInvoicesModal = false;
    showVendorProjectsModal = false;
    isChangingVendor = false;

    invoiceFilters = {
        fromDate: '',
        toDate: ''
    };

    get filteredInvoices() {
        return this.vendorInvoices.filter(inv => {
            if (this.invoiceFilters.fromDate && new Date(inv.invoiceDate) < new Date(this.invoiceFilters.fromDate)) return false;
            if (this.invoiceFilters.toDate && new Date(inv.invoiceDate) > new Date(this.invoiceFilters.toDate)) return false;
            return true;
        });
    }

    resetInvoiceFilters() {
        this.invoiceFilters = { fromDate: '', toDate: '' };
    }
    rejectionReason = '';
    selectedFile: File | null = null;

    pendingCount = 0;

    newVendor: CreateVendorRequest = {
        name: '',
        phone: '',
        email: '',
        contactPerson: '',
        vendorType: '',
        notes: ''
    };

    newInvoice: CreateVendorInvoiceRequest = {
        vendorId: 0,
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        materialType: ''
    };

    get canAddVendor(): boolean {
        return this.authService.hasRole(['SuperAdmin', 'CompanyAdmin']) || this.authService.hasProjectPermission('Vendor.Add');
    }

    get canApproveInvoices(): boolean {
        return this.authService.hasRole(['SuperAdmin', 'CompanyAdmin']) || this.authService.hasProjectPermission('VendorInvoice.Approve');
    }

    constructor(
        private vendorService: VendorService,
        private authService: AuthService
    ) {
        // Subscribe to language changes to refresh data
        this.i18nService.onLanguageChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.loadData();
            });
    }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData(): void {
        this.loading = true;

        this.vendorService.getVendorsWithStats().subscribe({
            next: (vendors) => {
                this.vendors = vendors;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading vendors:', err);
                this.loading = false;
            }
        });

        if (this.canApproveInvoices) {
            this.loadPendingInvoices();
        }

        this.vendorService.getVendorSummary().subscribe({
            next: (summary) => {
                this.vendorSummary = summary;
            },
            error: (err) => {
                console.error('Error loading summary:', err);
            }
        });
    }

    loadPendingInvoices(): void {
        this.vendorService.getPendingInvoices().subscribe({
            next: (invoices) => {
                this.pendingInvoices = invoices;
                this.pendingCount = invoices.length;
            },
            error: (err) => {
                console.error('Error loading pending invoices:', err);
            }
        });
    }

    viewVendorInvoices(vendor: Vendor | VendorWithStats): void {
        this.selectedVendor = vendor;
        this.vendorService.getVendorBills(vendor.id).subscribe({
            next: (invoices) => {
                this.vendorInvoices = invoices;
                this.showVendorInvoicesModal = true;
            },
            error: (err) => {
                console.error('Error loading vendor invoices:', err);
            }
        });
    }

    viewVendorProjects(vendor: Vendor | VendorWithStats): void {
        this.selectedVendor = vendor;
        this.vendorService.getVendorProjects(vendor.id).subscribe({
            next: (projects) => {
                this.vendorProjects = projects;
                this.showVendorProjectsModal = true;
            },
            error: (err) => {
                console.error('Error loading vendor projects:', err);
            }
        });
    }

    showAddInvoice(vendor?: Vendor | VendorWithStats): void {
        this.selectedVendor = vendor || null;
        this.isChangingVendor = !vendor;
        this.newInvoice = {
            vendorId: vendor?.id || 0,
            newVendorName: '',
            invoiceNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            amount: 0,
            description: '',
            materialType: ''
        };
        this.selectedFile = null;
        this.showAddInvoiceModal = true;
    }

    onVendorIdChange() {
        if (this.newInvoice.vendorId === -1) {
            this.newInvoice.newVendorName = '';
        } else if (this.newInvoice.vendorId! > 0) {
            this.newInvoice.newVendorName = undefined;
        }
    }

    showRejectModal(invoice: VendorInvoice): void {
        this.selectedInvoice = invoice;
        this.rejectionReason = '';
        this.showRejectInvoiceModal = true;
    }

    createVendor(): void {
        if (!this.newVendor.name) return;

        this.vendorService.createVendor(this.newVendor).subscribe({
            next: () => {
                this.loadData();
                this.showCreateModal = false;
                this.newVendor = {
                    name: '',
                    phone: '',
                    email: '',
                    contactPerson: '',
                    vendorType: '',
                    notes: ''
                };
            },
            error: (err) => {
                console.error('Error creating vendor:', err);
            }
        });
    }

    createInvoice(): void {
        const req = { ...this.newInvoice };
        if (req.vendorId === -1) {
            req.vendorId = undefined;
        }

        if ((!req.vendorId && !req.newVendorName) || !req.invoiceNumber || !req.amount) return;

        this.vendorService.createInvoice(req).subscribe({
            next: () => {
                this.showAddInvoiceModal = false;
                this.loadData();
            },
            error: (err) => {
                console.error('Error creating invoice:', err);
            }
        });
    }

    approveInvoice(invoice: VendorInvoice): void {
        this.vendorService.reviewInvoice(invoice.id, { isApproved: true }).subscribe({
            next: () => {
                this.loadPendingInvoices();
                this.loadData();
            },
            error: (err) => {
                console.error('Error approving invoice:', err);
            }
        });
    }

    rejectInvoice(): void {
        if (!this.selectedInvoice || !this.rejectionReason) return;

        this.vendorService.reviewInvoice(this.selectedInvoice.id, {
            isApproved: false,
            rejectionReason: this.rejectionReason
        }).subscribe({
            next: () => {
                this.showRejectInvoiceModal = false;
                this.loadPendingInvoices();
                this.loadData();
            },
            error: (err) => {
                console.error('Error rejecting invoice:', err);
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.newInvoice.file = this.selectedFile;
        }
    }
}
