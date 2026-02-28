import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InvoicesService, InvoiceListItemDto, InvoiceStatisticsDto } from '../../../../../core/services/invoices.service';
import { ProjectItem } from '../../../../../shared/interfaces';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

export type ViewMode = 'items' | 'phases';

// Extended interfaces for local use
interface ItemWithInvoices {
    id: number;
    itemName: string;
    itemCode: string;
    invoices?: InvoiceListItemDto[];
}

interface PhaseWithInvoices {
    id: number;
    name: string;
    items?: ItemWithInvoices[];
    invoiceCount?: number;
}

// Input type for phases
export interface PhaseInput {
    id: number;
    name: string;
    items?: { id: number; name?: string; itemName?: string; itemCode?: string }[];
}

@Component({
    selector: 'app-invoices-tab',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
    template: `
        <div class="invoices-tab">
            <!-- Header with Stats and View Toggle -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {{ 'invoices.title' | translate }}
                    </h3>
                    @if (statistics) {
                        <div class="flex items-center gap-3">
                            <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                                {{ statistics.totalInvoices }} {{ 'invoices.total' | translate }}
                            </span>
                            <span class="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-xs font-bold text-amber-600 dark:text-amber-400">
                                {{ statistics.pendingInvoices }} {{ 'common.pending' | translate }}
                            </span>
                        </div>
                    }
                </div>

                <!-- View Toggle -->
                <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button 
                        (click)="viewMode = 'items'"
                        [class.bg-white]="viewMode === 'items'"
                        [class.dark:bg-slate-700]="viewMode === 'items'"
                        [class.shadow-sm]="viewMode === 'items'"
                        [class.text-slate-900]="viewMode === 'items'"
                        [class.dark:text-white]="viewMode === 'items'"
                        [class.text-slate-500]="viewMode !== 'items'"
                        [class.dark:text-slate-400]="viewMode !== 'items'"
                        class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                        {{ 'invoices.items_view' | translate }}
                    </button>
                    <button 
                        (click)="viewMode = 'phases'"
                        [class.bg-white]="viewMode === 'phases'"
                        [class.dark:bg-slate-700]="viewMode === 'phases'"
                        [class.shadow-sm]="viewMode === 'phases'"
                        [class.text-slate-900]="viewMode === 'phases'"
                        [class.dark:text-white]="viewMode === 'phases'"
                        [class.text-slate-500]="viewMode !== 'phases'"
                        [class.dark:text-slate-400]="viewMode !== 'phases'"
                        class="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                        {{ 'invoices.phases_view' | translate }}
                    </button>
                </div>
            </div>

            <!-- Add Invoice Button -->
            <div class="mb-6">
                <button 
                    (click)="showUploadModal.emit()"
                    class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black uppercase tracking-wider hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    {{ 'invoices.upload_invoice' | translate }}
                </button>
            </div>

            <!-- Loading State -->
            @if (isLoading) {
                <app-loading-spinner [centered]="true"></app-loading-spinner>
            }

            <!-- Items View -->
            @if (!isLoading && viewMode === 'items') {
                <div class="space-y-3">
                    @for (item of itemsWithInvoices; track item.id) {
                        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                            <!-- Item Header -->
                            <button 
                                (click)="toggleItem(item.id)"
                                class="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                                        {{ item.itemName.charAt(0) || 'I' }}
                                    </div>
                                    <div class="text-left">
                                        <p class="font-bold text-slate-900 dark:text-white">{{ item.itemName }}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.itemCode }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                                        {{ item.invoices?.length || 0 }} {{ 'invoices.invoices' | translate }}
                                    </span>
                                    <svg 
                                        class="w-5 h-5 text-slate-400 transition-transform"
                                        [class.rotate-180]="expandedItems.has(item.id)"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </button>

                            <!-- Item Invoices (Expanded) -->
                            @if (expandedItems.has(item.id) && item.invoices?.length) {
                                <div class="border-t border-slate-200 dark:border-white/5 p-4 bg-slate-50 dark:bg-slate-800/30">
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        @for (invoice of item.invoices; track invoice.id) {
                                            <div 
                                                (click)="viewInvoice.emit(invoice)"
                                                class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 cursor-pointer hover:border-cyan-500/30 hover:shadow-lg transition-all">
                                                <div class="flex items-start justify-between mb-2">
                                                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ invoice.invoiceNumber }}</span>
                                                    <span 
                                                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                                        [ngClass]="{
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': invoice.status === 'Pending',
                                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': invoice.status === 'Approved',
                                                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': invoice.status === 'Rejected'
                                                        }">
                                                        {{ invoice.statusDisplayName }}
                                                    </span>
                                                </div>
                                                <p class="text-lg font-black text-cyan-600 dark:text-cyan-400">{{ invoice.netAmount | currency:invoice.currency:'symbol':'1.0-0' }}</p>
                                                <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{{ invoice.invoiceDate | date:'mediumDate' }}</p>
                                                <div class="flex items-center gap-2 mt-2">
                                                    <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                                                        {{ invoice.invoiceTypeDisplayName }}
                                                    </span>
                                                    @if (invoice.imageCount > 0) {
                                                        <span class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                            </svg>
                                                            {{ invoice.imageCount }}
                                                        </span>
                                                    }
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            }

                            <!-- No Invoices -->
                            @if (expandedItems.has(item.id) && !item.invoices?.length) {
                                <div class="border-t border-slate-200 dark:border-white/5 p-8 text-center">
                                    <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'invoices.no_invoices_item' | translate }}</p>
                                </div>
                            }
                        </div>
                    }

                    @if (!itemsWithInvoices.length) {
                        <div class="text-center py-12">
                            <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400">{{ 'invoices.no_invoices' | translate }}</p>
                        </div>
                    }
                </div>
            }

            <!-- Phases View -->
            @if (!isLoading && viewMode === 'phases') {
                <div class="space-y-3">
                    @for (phase of phasesWithInvoices; track phase.id) {
                        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                            <!-- Phase Header -->
                            <button 
                                (click)="togglePhase(phase.id)"
                                class="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm">
                                        {{ phase.name.charAt(0) || 'P' }}
                                    </div>
                                    <div class="text-left">
                                        <p class="font-bold text-slate-900 dark:text-white">{{ phase.name }}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">{{ phase.items?.length || 0 }} {{ 'invoices.items' | translate }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                                        {{ phase.invoiceCount || 0 }} {{ 'invoices.invoices' | translate }}
                                    </span>
                                    <svg 
                                        class="w-5 h-5 text-slate-400 transition-transform"
                                        [class.rotate-180]="expandedPhases.has(phase.id)"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </button>

                            <!-- Phase Items (Expanded) -->
                            @if (expandedPhases.has(phase.id) && phase.items?.length) {
                                <div class="border-t border-slate-200 dark:border-white/5">
                                    @for (item of phase.items; track item.id) {
                                        <div class="border-b border-slate-200 dark:border-white/5 last:border-b-0">
                                            <button 
                                                (click)="toggleItemInPhase(phase.id, item.id)"
                                                class="w-full flex items-center justify-between p-4 pl-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                                        {{ item.itemName.charAt(0) || 'I' }}
                                                    </div>
                                                    <div class="text-left">
                                                        <p class="font-medium text-slate-900 dark:text-white text-sm">{{ item.itemName }}</p>
                                                        <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ item.itemCode }}</p>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-3">
                                                    <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                        {{ item.invoices?.length || 0 }}
                                                    </span>
                                                    <svg 
                                                        class="w-4 h-4 text-slate-400 transition-transform"
                                                        [class.rotate-180]="isItemInPhaseExpanded(phase.id, item.id)"
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                                    </svg>
                                                </div>
                                            </button>

                                            <!-- Item Invoices -->
                                            @if (isItemInPhaseExpanded(phase.id, item.id) && item.invoices?.length) {
                                                <div class="p-4 pl-12 bg-slate-50 dark:bg-slate-800/30">
                                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        @for (invoice of item.invoices; track invoice.id) {
                                                            <div 
                                                                (click)="viewInvoice.emit(invoice)"
                                                                class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all">
                                                                <div class="flex items-center justify-between">
                                                                    <span class="text-xs font-bold text-slate-900 dark:text-white">{{ invoice.invoiceNumber }}</span>
                                                                    <span class="text-sm font-black text-cyan-600 dark:text-cyan-400">{{ invoice.netAmount | currency:invoice.currency:'symbol':'1.0-0' }}</span>
                                                                </div>
                                                                <div class="flex items-center gap-2 mt-1">
                                                                    <span 
                                                                        class="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                                                                        [ngClass]="{
                                                                            'bg-amber-100 text-amber-700': invoice.status === 'Pending',
                                                                            'bg-emerald-100 text-emerald-700': invoice.status === 'Approved',
                                                                            'bg-rose-100 text-rose-700': invoice.status === 'Rejected'
                                                                        }">
                                                                        {{ invoice.statusDisplayName }}
                                                                    </span>
                                                                    <span class="text-[10px] text-slate-500">{{ invoice.invoiceDate | date:'shortDate' }}</span>
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    }

                    @if (!phasesWithInvoices.length) {
                        <div class="text-center py-12">
                            <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400">{{ 'invoices.no_phases' | translate }}</p>
                        </div>
                    }
                </div>
            }
        </div>
    `
})
export class InvoicesTabComponent implements OnInit, OnChanges {
    @Input() projectId!: number;
    @Input() items: ProjectItem[] = [];
    @Input() phases: PhaseInput[] = [];

    @Output() showUploadModal = new EventEmitter<void>();
    @Output() viewInvoice = new EventEmitter<InvoiceListItemDto>();

    viewMode: ViewMode = 'items';
    isLoading = false;
    statistics: InvoiceStatisticsDto | null = null;

    expandedItems = new Set<number>();
    expandedPhases = new Set<number>();
    expandedItemsInPhase = new Set<string>(); // Format: "phaseId-itemId"

    itemsWithInvoices: ItemWithInvoices[] = [];
    phasesWithInvoices: PhaseWithInvoices[] = [];

    constructor(private invoicesService: InvoicesService) { }

    ngOnInit(): void {
        this.loadStatistics();
        this.loadInvoices();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['items'] || changes['phases']) {
            this.loadInvoices();
        }
    }

    loadStatistics(): void {
        this.invoicesService.getStatistics(this.projectId).subscribe({
            next: (stats: InvoiceStatisticsDto) => this.statistics = stats,
            error: (err: Error) => console.error('Error loading invoice statistics:', err)
        });
    }

    async loadInvoices(): Promise<void> {
        this.isLoading = true;

        try {
            // Load invoices for the project
            const invoices = await this.invoicesService.getInvoicesForProject(this.projectId).toPromise();

            // Map invoices to items
            this.itemsWithInvoices = this.items.map((item: ProjectItem) => ({
                id: item.id,
                itemName: item.itemName,
                itemCode: item.itemCode,
                invoices: invoices?.filter((inv: InvoiceListItemDto) => inv.projectItemId === item.id) || []
            }));

            // Map invoices to phases and their items
            this.phasesWithInvoices = this.phases.map((phase: PhaseInput) => {
                const phaseItems = (phase.items || []).map((item: any) => ({
                    id: item.id,
                    itemName: item.name || item.itemName || '',
                    itemCode: item.itemCode || `ITEM-${item.id}`,
                    invoices: invoices?.filter((inv: InvoiceListItemDto) => inv.projectItemId === item.id) || []
                }));

                const invoiceCount = phaseItems.reduce((sum: number, item: ItemWithInvoices) => sum + (item.invoices?.length || 0), 0);

                return {
                    id: phase.id,
                    name: phase.name,
                    items: phaseItems,
                    invoiceCount
                };
            });
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            this.isLoading = false;
        }
    }

    toggleItem(itemId: number): void {
        if (this.expandedItems.has(itemId)) {
            this.expandedItems.delete(itemId);
        } else {
            this.expandedItems.add(itemId);
        }
    }

    togglePhase(phaseId: number): void {
        if (this.expandedPhases.has(phaseId)) {
            this.expandedPhases.delete(phaseId);
        } else {
            this.expandedPhases.add(phaseId);
        }
    }

    toggleItemInPhase(phaseId: number, itemId: number): void {
        const key = `${phaseId}-${itemId}`;
        if (this.expandedItemsInPhase.has(key)) {
            this.expandedItemsInPhase.delete(key);
        } else {
            this.expandedItemsInPhase.add(key);
        }
    }

    isItemInPhaseExpanded(phaseId: number, itemId: number): boolean {
        return this.expandedItemsInPhase.has(`${phaseId}-${itemId}`);
    }

    refresh(): void {
        this.loadStatistics();
        this.loadInvoices();
    }
}
