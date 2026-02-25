import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InvoicesService, CreateInvoiceRequest, InvoiceType } from '../../../../../core/services/invoices.service';
import { VendorService, Vendor } from '../../../../../core/services/vendor.service';
import { ProjectItem } from '../../../../../shared/interfaces';

@Component({
    selector: 'app-invoice-upload-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="close.emit()">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
                <!-- Header -->
                <div class="p-6 border-b border-slate-200 dark:border-white/5">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {{ 'invoices.upload_invoice' | translate }}
                            </h2>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {{ 'invoices.upload_description_simple' | translate }}
                            </p>
                        </div>
                        <button 
                            (click)="close.emit()"
                            class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Form -->
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    <div class="space-y-6">
                        <!-- Project Item Selection (Required) -->
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                {{ 'invoices.select_item' | translate }} *
                            </label>
                            <select 
                                [(ngModel)]="form.projectItemId"
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all">
                                <option [ngValue]="null" disabled>{{ 'invoices.select_item_placeholder' | translate }}</option>
                                @for (item of projectItems; track item.id) {
                                    <option [ngValue]="item.id">{{ item.itemName }} ({{ item.itemCode }})</option>
                                }
                            </select>
                        </div>

                        <!-- Amount (Required) -->
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                {{ 'invoices.amount' | translate }} *
                            </label>
                            <div class="flex items-center gap-3">
                                <input 
                                    type="number"
                                    [(ngModel)]="form.netAmount"
                                    class="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-lg outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                    placeholder="0.00">
                                <select 
                                    [(ngModel)]="form.currency"
                                    class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all">
                                    <option value="EGP">EGP</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="SAR">SAR</option>
                                </select>
                            </div>
                        </div>

                        <!-- Image Upload -->
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                {{ 'invoices.upload_images' | translate }}
                            </label>
                            <div 
                                class="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition-colors cursor-pointer"
                                [class.border-cyan-500]="isDragging()"
                                (click)="fileInput.click()"
                                (dragover)="$event.preventDefault(); isDragging.set(true)"
                                (dragleave)="isDragging.set(false)"
                                (drop)="onFileDrop($event)">
                                <input 
                                    #fileInput
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    class="hidden"
                                    (change)="onFileSelect($event)">

                                @if (selectedFiles.length === 0) {
                                    <div class="flex flex-col items-center">
                                        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                        </div>
                                        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ 'invoices.drag_drop_images' | translate }}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">{{ 'invoices.or_click_browse' | translate }}</p>
                                    </div>
                                } @else {
                                    <div class="grid grid-cols-4 gap-3">
                                        @for (file of selectedFiles; track file.name) {
                                            <div class="relative group">
                                                <div class="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <img [src]="getFilePreview(file)" class="w-full h-full object-cover" alt="">
                                                </div>
                                                <button 
                                                    type="button"
                                                    (click)="removeFile($index); $event.stopPropagation()"
                                                    class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        }
                                        <div 
                                            class="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors"
                                            (click)="fileInput.click(); $event.stopPropagation()">
                                            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                            </svg>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                        <!-- Status Indicator -->
                        @if (selectedFiles.length === 0) {
                            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <div class="flex items-start gap-3">
                                    <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                    <div>
                                        <p class="text-sm font-bold text-amber-700 dark:text-amber-300">{{ 'invoices.draft_status_title' | translate }}</p>
                                        <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">{{ 'invoices.draft_status_description' | translate }}</p>
                                    </div>
                                </div>
                            </div>
                        } @else {
                            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <div class="flex items-start gap-3">
                                    <svg class="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div>
                                        <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300">{{ 'invoices.pending_status_title' | translate }}</p>
                                        <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{{ 'invoices.pending_status_description' | translate }}</p>
                                    </div>
                                </div>
                            </div>
                        }

                        <!-- Advanced Options Toggle -->
                        <div class="border-t border-slate-200 dark:border-white/5 pt-4">
                            <button 
                                type="button"
                                (click)="showAdvanced.set(!showAdvanced())"
                                class="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 font-medium hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
                                <svg class="w-4 h-4 transition-transform" [class.rotate-180]="showAdvanced()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                                {{ showAdvanced() ? ('invoices.hide_advanced' | translate) : ('invoices.show_advanced' | translate) }}
                            </button>
                        </div>

                        <!-- Advanced Options (Hidden by default) -->
                        @if (showAdvanced()) {
                            <div class="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5">
                                <!-- Invoice Type Selection -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                        {{ 'invoices.select_type' | translate }}
                                    </label>
                                    <div class="grid grid-cols-2 gap-3">
                                        <button 
                                            type="button"
                                            (click)="form.invoiceType = 'DisbursementAuthorization'"
                                            [class.ring-2]="form.invoiceType === 'DisbursementAuthorization'"
                                            [class.ring-cyan-500]="form.invoiceType === 'DisbursementAuthorization'"
                                            class="p-3 rounded-xl border-2 transition-all text-left"
                                            [ngClass]="{
                                                'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20': form.invoiceType === 'DisbursementAuthorization',
                                                'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10': form.invoiceType !== 'DisbursementAuthorization'
                                            }">
                                            <p class="font-bold text-slate-900 dark:text-white text-xs">{{ 'invoices.disbursement_authorization' | translate }}</p>
                                            <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ 'invoices.disbursement_authorization_ar' | translate }}</p>
                                        </button>

                                        <button 
                                            type="button"
                                            (click)="form.invoiceType = 'PurchaseInvoice'"
                                            [class.ring-2]="form.invoiceType === 'PurchaseInvoice'"
                                            [class.ring-cyan-500]="form.invoiceType === 'PurchaseInvoice'"
                                            class="p-3 rounded-xl border-2 transition-all text-left"
                                            [ngClass]="{
                                                'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20': form.invoiceType === 'PurchaseInvoice',
                                                'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10': form.invoiceType !== 'PurchaseInvoice'
                                            }">
                                            <p class="font-bold text-slate-900 dark:text-white text-xs">{{ 'invoices.purchase_invoice' | translate }}</p>
                                            <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ 'invoices.purchase_invoice_ar' | translate }}</p>
                                        </button>
                                    </div>
                                </div>

                                <!-- Invoice Number -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {{ 'invoices.invoice_number' | translate }}
                                    </label>
                                    <input 
                                        type="text"
                                        [(ngModel)]="form.invoiceNumber"
                                        class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium"
                                        [placeholder]="'invoices.invoice_number_auto' | translate">
                                </div>

                                <!-- Invoice Date -->
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            {{ 'invoices.invoice_date' | translate }}
                                        </label>
                                        <input 
                                            type="date"
                                            [(ngModel)]="form.invoiceDate"
                                            class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            {{ 'invoices.due_date' | translate }}
                                        </label>
                                        <input 
                                            type="date"
                                            [(ngModel)]="form.dueDate"
                                            class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium">
                                    </div>
                                </div>

                                <!-- Tax and Retention -->
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            {{ 'invoices.tax_rate' | translate }} (%)
                                        </label>
                                        <input 
                                            type="number"
                                            [(ngModel)]="form.taxRate"
                                            (ngModelChange)="calculateTotal()"
                                            class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium"
                                            placeholder="0">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            {{ 'invoices.retention_rate' | translate }} (%)
                                        </label>
                                        <input 
                                            type="number"
                                            [(ngModel)]="form.retentionRate"
                                            (ngModelChange)="calculateTotal()"
                                            class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium"
                                            placeholder="0">
                                    </div>
                                </div>

                                <!-- Supplier/Vendor Selection -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {{ 'invoices.supplier_vendor' | translate }}
                                    </label>
                                    
                                    <div class="space-y-3">
                                        <!-- Selection Mode Tabs -->
                                        <div class="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
                                            <button 
                                                type="button"
                                                (click)="vendorMode.set('select')"
                                                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                [class.bg-white]="vendorMode() === 'select'"
                                                [class.dark:bg-slate-800]="vendorMode() === 'select'"
                                                [class.text-cyan-600]="vendorMode() === 'select'"
                                                [class.shadow-sm]="vendorMode() === 'select'"
                                                [class.text-slate-500]="vendorMode() !== 'select'">
                                                {{ 'invoices.select_existing' | translate }}
                                            </button>
                                            <button 
                                                type="button"
                                                (click)="vendorMode.set('manual')"
                                                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                [class.bg-white]="vendorMode() === 'manual'"
                                                [class.dark:bg-slate-800]="vendorMode() === 'manual'"
                                                [class.text-cyan-600]="vendorMode() === 'manual'"
                                                [class.shadow-sm]="vendorMode() === 'manual'"
                                                [class.text-slate-500]="vendorMode() !== 'manual'">
                                                {{ 'invoices.enter_manual' | translate }}
                                            </button>
                                        </div>

                                        @if (vendorMode() === 'select') {
                                            <select 
                                                [(ngModel)]="form.vendorId"
                                                class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium">
                                                <option [ngValue]="null">{{ 'invoices.select_vendor_placeholder' | translate }}</option>
                                                @for (vendor of vendors(); track vendor.id) {
                                                    <option [ngValue]="vendor.id">{{ vendor.name }}</option>
                                                }
                                            </select>
                                        } @else {
                                            <input 
                                                type="text"
                                                [(ngModel)]="form.externalVendorName"
                                                class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium"
                                                [placeholder]="'invoices.supplier_vendor_placeholder' | translate">
                                        }
                                    </div>
                                </div>

                                <!-- Description -->
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {{ 'invoices.description' | translate }}
                                    </label>
                                    <textarea 
                                        [(ngModel)]="form.description"
                                        [placeholder]="'invoices.description_placeholder' | translate"
                                        rows="2"
                                        class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium resize-none"></textarea>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-end gap-3">
                    <button 
                        type="button"
                        (click)="close.emit()"
                        class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {{ 'common.cancel' | translate }}
                    </button>
                    <button 
                        type="button"
                        (click)="submitForm()"
                        [disabled]="!isFormValid() || isSubmitting()"
                        class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        @if (isSubmitting()) {
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        }
                        {{ 'invoices.submit_invoice' | translate }}
                    </button>
                </div>
            </div>
        </div>
    `
})
export class InvoiceUploadModalComponent implements OnInit {
    @Input() projectId!: number;
    @Input() projectItems: ProjectItem[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<number>();

    form = {
        projectItemId: null as number | null,
        netAmount: null as number | null,
        currency: 'EGP',
        // Advanced options (optional)
        invoiceType: 'PurchaseInvoice' as InvoiceType,
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        taxRate: 0,
        retentionRate: 0,
        description: '',
        supplierVendor: '',
        vendorId: null as number | null,
        externalVendorName: ''
    };

    vendors = signal<any[]>([]);
    vendorMode = signal<'select' | 'manual'>('select');
    selectedFiles: File[] = [];
    isDragging = signal(false);
    isSubmitting = signal(false);
    showAdvanced = signal(false);

    constructor(
        private invoicesService: InvoicesService,
        private vendorService: VendorService
    ) { }

    ngOnInit(): void {
        // Set default date to today
        this.form.invoiceDate = new Date().toISOString().split('T')[0];

        // Load vendors
        this.vendorService.getVendors().subscribe(vendors => {
            this.vendors.set(vendors);
        });
    }

    isFormValid(): boolean {
        return !!(
            this.form.projectItemId &&
            this.form.netAmount &&
            this.form.netAmount > 0
        );
    }

    calculateTotal(): void {
        // Tax and retention are optional, no need to calculate
        // The backend will handle this if needed
    }

    onFileSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.addFiles(Array.from(input.files));
        }
    }

    onFileDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragging.set(false);

        if (event.dataTransfer?.files) {
            this.addFiles(Array.from(event.dataTransfer.files));
        }
    }

    addFiles(files: File[]): void {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        this.selectedFiles = [...this.selectedFiles, ...imageFiles].slice(0, 10); // Max 10 images
    }

    removeFile(index: number): void {
        this.selectedFiles.splice(index, 1);
    }

    getFilePreview(file: File): string {
        return URL.createObjectURL(file);
    }

    async submitForm(): Promise<void> {
        if (!this.isFormValid() || this.isSubmitting()) return;

        this.isSubmitting.set(true);

        try {
            const request: CreateInvoiceRequest = {
                projectItemId: this.form.projectItemId!,
                netAmount: this.form.netAmount!,
                // Optional fields
                invoiceType: this.form.invoiceType,
                invoiceNumber: this.form.invoiceNumber || undefined,
                invoiceDate: this.form.invoiceDate || undefined,
                dueDate: this.form.dueDate || undefined,
                currency: this.form.currency,
                taxRate: this.form.taxRate || undefined,
                retentionRate: this.form.retentionRate || undefined,
                description: this.form.description || undefined,
                supplierVendor: this.form.supplierVendor || undefined,
                vendorId: this.vendorMode() === 'select' ? (this.form.vendorId || undefined) : undefined,
                externalVendorName: this.vendorMode() === 'manual' ? (this.form.externalVendorName || undefined) : undefined
            };

            const result = await this.invoicesService.createInvoiceForItem(
                this.projectId,
                this.form.projectItemId!,
                request
            ).toPromise();

            // Upload images if any (this will also change status from Draft to Pending)
            if (result?.invoiceId && this.selectedFiles.length > 0) {
                for (const file of this.selectedFiles) {
                    await this.invoicesService.addInvoiceImage(result.invoiceId, file).toPromise();
                }
            }

            this.submitted.emit(result?.invoiceId);
            this.close.emit();
        } catch (error) {
            console.error('Error creating invoice:', error);
        } finally {
            this.isSubmitting.set(false);
        }
    }
}
