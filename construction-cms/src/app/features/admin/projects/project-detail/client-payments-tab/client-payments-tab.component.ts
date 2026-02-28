import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ClientPaymentsService, ClientPaymentListItem, ProjectFinancialSummary, CreateClientPaymentRequest, PaymentType, PaymentMethod } from '../../../../../core/services/client-payments.service';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-client-payments-tab',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
    template: `
        <div class="client-payments-tab">
            <!-- Financial Summary Card -->
            @if (financialSummary) {
                <div class="mb-6 p-6 rounded-2xl border-2 transition-all"
                    [ngClass]="{
                        'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800': financialSummary.balanceStatus === 'Surplus',
                        'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800': financialSummary.balanceStatus === 'Balanced',
                        'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800': financialSummary.balanceStatus === 'Deficit'
                    }">
                    
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {{ 'financial.summary' | translate }}
                        </h3>
                        @if (financialSummary.alertLevel !== 'None') {
                            <span class="px-3 py-1 rounded-lg text-xs font-bold uppercase"
                                [ngClass]="{
                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300': financialSummary.alertLevel === 'Warning',
                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300': financialSummary.alertLevel === 'Critical',
                                    'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300': financialSummary.alertLevel === 'Emergency'
                                }">
                                {{ 'financial.alert_' + financialSummary.alertLevel.toLowerCase() | translate }}
                            </span>
                        }
                    </div>

                    <!-- Balance Visualization -->
                    <div class="grid grid-cols-2 gap-6">
                        <!-- Client Payments -->
                        <div class="text-center">
                            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{{ 'financial.client_payments' | translate }}</p>
                            <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {{ financialSummary.totalClientPayments | currency:'EGP':'symbol':'1.0-0' }}
                            </p>
                            <div class="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div class="h-full bg-emerald-500 rounded-full transition-all" 
                                    [style.width.%]="getPaymentPercentage()"></div>
                            </div>
                        </div>

                        <!-- Expenses -->
                        <div class="text-center">
                            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{{ 'financial.expenses' | translate }}</p>
                            <p class="text-2xl font-black text-rose-600 dark:text-rose-400">
                                {{ financialSummary.totalExpenses | currency:'EGP':'symbol':'1.0-0' }}
                            </p>
                            <div class="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div class="h-full bg-rose-500 rounded-full transition-all" 
                                    [style.width.%]="getExpensePercentage()"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Balance -->
                    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-bold text-slate-600 dark:text-slate-400">{{ 'financial.balance' | translate }}</span>
                            <span class="text-xl font-black"
                                [ngClass]="{
                                    'text-emerald-600 dark:text-emerald-400': financialSummary.balance >= 0,
                                    'text-rose-600 dark:text-rose-400': financialSummary.balance < 0
                                }">
                                @if (financialSummary.balance >= 0) {
                                    +{{ financialSummary.balance | currency:'EGP':'symbol':'1.0-0' }}
                                } @else {
                                    {{ financialSummary.balance | currency:'EGP':'symbol':'1.0-0' }}
                                }
                            </span>
                        </div>
                        @if (financialSummary.alertMessage) {
                            <p class="mt-2 text-sm text-rose-600 dark:text-rose-400">
                                ⚠️ {{ financialSummary.alertMessage }}
                            </p>
                        }
                    </div>
                </div>
            }

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {{ 'financial.client_payments' | translate }}
                </h3>
                <button 
                    (click)="showAddModal.set(true)"
                    class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-black uppercase tracking-wider hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    {{ 'financial.add_payment' | translate }}
                </button>
            </div>

            <!-- Loading State -->
            @if (isLoading) {
                <app-loading-spinner [centered]="true"></app-loading-spinner>
            }

            <!-- Payments List -->
            @if (!isLoading && payments.length > 0) {
                <div class="space-y-3">
                    @for (payment of payments; track payment.id) {
                        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-4 hover:border-emerald-500/30 transition-all">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm"
                                        [ngClass]="{
                                            'bg-gradient-to-br from-cyan-500 to-blue-600': payment.paymentType === 'Advance',
                                            'bg-gradient-to-br from-emerald-500 to-teal-600': payment.paymentType === 'Progress',
                                            'bg-gradient-to-br from-amber-500 to-orange-600': payment.paymentType === 'OnAccount',
                                            'bg-gradient-to-br from-purple-500 to-pink-600': payment.paymentType === 'Final'
                                        }">
                                        {{ getPaymentTypeIcon(payment.paymentType) }}
                                    </div>
                                    <div>
                                        <p class="font-bold text-slate-900 dark:text-white">{{ payment.paymentTypeDisplayName }}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">
                                            {{ payment.paymentDate | date:'mediumDate' }}
                                            @if (payment.receiptNumber) {
                                                • {{ payment.receiptNumber }}
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                        {{ payment.amount | currency:payment.currency:'symbol':'1.0-0' }}
                                    </p>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                        [ngClass]="{
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': payment.status === 'Pending',
                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': payment.status === 'Confirmed',
                                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': payment.status === 'Cancelled'
                                        }">
                                        {{ payment.statusDisplayName }}
                                    </span>
                                </div>
                            </div>
                            @if (payment.notes) {
                                <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ payment.notes }}</p>
                            }
                        </div>
                    }
                </div>
            }

            <!-- Empty State -->
            @if (!isLoading && payments.length === 0) {
                <div class="text-center py-12">
                    <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <p class="text-slate-500 dark:text-slate-400">{{ 'financial.no_payments' | translate }}</p>
                </div>
            }

            <!-- Add Payment Modal -->
            @if (showAddModal()) {
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="showAddModal.set(false)">
                    <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
                        <!-- Modal Header -->
                        <div class="p-6 border-b border-slate-200 dark:border-white/5">
                            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {{ 'financial.add_payment' | translate }}
                            </h2>
                        </div>

                        <!-- Modal Body -->
                        <div class="p-6 overflow-y-auto max-h-[60vh]">
                            <div class="space-y-4">
                                <!-- Payment Type -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {{ 'financial.payment_type' | translate }} *
                                    </label>
                                    <select [(ngModel)]="newPayment.paymentType" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-medium">
                                        <option value="Advance">{{ 'financial.payment_type_advance' | translate }}</option>
                                        <option value="OnAccount">{{ 'financial.payment_type_on_account' | translate }}</option>
                                        <option value="Progress">{{ 'financial.payment_type_progress' | translate }}</option>
                                        <option value="Final">{{ 'financial.payment_type_final' | translate }}</option>
                                    </select>
                                </div>

                                <!-- Amount -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {{ 'financial.amount' | translate }} *
                                    </label>
                                    <div class="flex items-center gap-3">
                                        <input type="number" [(ngModel)]="newPayment.amount" 
                                            class="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-lg"
                                            placeholder="0.00">
                                        <select [(ngModel)]="newPayment.currency" class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-medium">
                                            <option value="EGP">EGP</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Payment Date -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {{ 'financial.payment_date' | translate }}
                                    </label>
                                    <input type="date" [(ngModel)]="newPayment.paymentDate" 
                                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-medium">
                                </div>

                                <!-- Payment Method -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {{ 'financial.payment_method' | translate }}
                                    </label>
                                    <select [(ngModel)]="newPayment.paymentMethod" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-medium">
                                        <option value="Cash">{{ 'financial.method_cash' | translate }}</option>
                                        <option value="BankTransfer">{{ 'financial.method_bank' | translate }}</option>
                                        <option value="Check">{{ 'financial.method_check' | translate }}</option>
                                    </select>
                                </div>

                                <!-- Notes -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {{ 'financial.notes' | translate }}
                                    </label>
                                    <textarea [(ngModel)]="newPayment.notes" rows="2"
                                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-medium resize-none"
                                        [placeholder]="'financial.notes_placeholder' | translate"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Modal Footer -->
                        <div class="p-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-end gap-3">
                            <button (click)="showAddModal.set(false)" 
                                class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {{ 'common.cancel' | translate }}
                            </button>
                            <button (click)="submitPayment()" [disabled]="!isFormValid() || isSubmitting()"
                                class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                @if (isSubmitting()) {
                                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                }
                                {{ 'financial.save_payment' | translate }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `
})
export class ClientPaymentsTabComponent implements OnInit {
    @Input() projectId!: number;
    @Output() paymentAdded = new EventEmitter<void>();

    payments: ClientPaymentListItem[] = [];
    financialSummary: ProjectFinancialSummary | null = null;
    isLoading = false;
    isSubmitting = signal(false);
    showAddModal = signal(false);

    newPayment = {
        paymentType: 'OnAccount' as PaymentType,
        amount: null as number | null,
        currency: 'EGP',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash' as PaymentMethod,
        notes: ''
    };

    constructor(private clientPaymentsService: ClientPaymentsService) { }

    ngOnInit(): void {
        this.loadPayments();
        this.loadFinancialSummary();
    }

    loadPayments(): void {
        this.isLoading = true;
        this.clientPaymentsService.getPaymentsForProject(this.projectId).subscribe({
            next: (payments) => {
                this.payments = payments;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading payments:', err);
                this.isLoading = false;
            }
        });
    }

    loadFinancialSummary(): void {
        this.clientPaymentsService.getProjectFinancialSummary(this.projectId).subscribe({
            next: (summary) => this.financialSummary = summary,
            error: (err) => console.error('Error loading financial summary:', err)
        });
    }

    getPaymentPercentage(): number {
        if (!this.financialSummary) return 0;
        const max = Math.max(this.financialSummary.totalClientPayments, this.financialSummary.totalExpenses);
        return max > 0 ? (this.financialSummary.totalClientPayments / max) * 100 : 0;
    }

    getExpensePercentage(): number {
        if (!this.financialSummary) return 0;
        const max = Math.max(this.financialSummary.totalClientPayments, this.financialSummary.totalExpenses);
        return max > 0 ? (this.financialSummary.totalExpenses / max) * 100 : 0;
    }

    getPaymentTypeIcon(type: string): string {
        switch (type) {
            case 'Advance': return 'م';
            case 'Progress': return 'م';
            case 'OnAccount': return 'ح';
            case 'Final': return 'ن';
            default: return 'د';
        }
    }

    isFormValid(): boolean {
        return !!(this.newPayment.amount && this.newPayment.amount > 0);
    }

    async submitPayment(): Promise<void> {
        if (!this.isFormValid() || this.isSubmitting()) return;

        this.isSubmitting.set(true);

        const request: CreateClientPaymentRequest = {
            projectId: this.projectId,
            paymentType: this.newPayment.paymentType,
            amount: this.newPayment.amount!,
            currency: this.newPayment.currency,
            paymentDate: this.newPayment.paymentDate,
            paymentMethod: this.newPayment.paymentMethod,
            notes: this.newPayment.notes || undefined
        };

        try {
            await this.clientPaymentsService.createPayment(this.projectId, request).toPromise();
            this.showAddModal.set(false);
            this.resetForm();
            this.loadPayments();
            this.loadFinancialSummary();
            this.paymentAdded.emit();
        } catch (error) {
            console.error('Error creating payment:', error);
        } finally {
            this.isSubmitting.set(false);
        }
    }

    private resetForm(): void {
        this.newPayment = {
            paymentType: 'OnAccount',
            amount: null,
            currency: 'EGP',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            notes: ''
        };
    }

    refresh(): void {
        this.loadPayments();
        this.loadFinancialSummary();
    }
}
