import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BOQService } from '../../../../core/services/boq.service';
import { BOQItem, CreateBOQItemRequest, UpdateBOQItemRequest } from '../../../../shared/interfaces';

@Component({
    selector: 'app-boq-items',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">BOQ Items</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Manage Bill of Quantities items for your project</p>
          </div>
          <button (click)="openAddModal()" 
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            + Add Item
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Items</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ boqItems.length }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Value</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ totalValue | currency:'USD' }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Executed</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ executedValue | currency:'USD' }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Progress</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ overallProgress | number:'1.0-0' }}%</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- BOQ Items Table -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-black text-slate-900 dark:text-white">Items List</h2>
              <div class="flex items-center space-x-4">
                <input type="text" 
                       [(ngModel)]="searchTerm" 
                       placeholder="Search items..." 
                       class="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-white/5">
                  <th class="px-6 py-4 text-left">Item</th>
                  <th class="px-6 py-4 text-left">Unit</th>
                  <th class="px-6 py-4 text-right">Quantity</th>
                  <th class="px-6 py-4 text-right">Rate</th>
                  <th class="px-6 py-4 text-right">Total Value</th>
                  <th class="px-6 py-4 text-right">Executed</th>
                  <th class="px-6 py-4 text-center">Progress</th>
                  <th class="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 dark:divide-white/[0.02]">
                @for (item of filteredItems; track item.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td class="px-6 py-4">
                      <div class="text-sm font-bold text-slate-900 dark:text-white">{{ item.description }}</div>
                      <div class="text-[10px] text-slate-400 font-black uppercase mt-1">ID: {{ item.id }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {{ item.unit }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="text-sm font-black text-slate-900 dark:text-white">{{ item.totalQuantity }}</div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="text-sm font-black text-slate-900 dark:text-white">{{ item.rate | currency:'USD' }}</div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="text-sm font-black text-slate-900 dark:text-white">{{ (item.totalQuantity * item.rate) | currency:'USD' }}</div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="text-sm font-black text-cyan-600 dark:text-cyan-400">{{ item.executedQuantity }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center">
                        <div class="w-20 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div class="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                               [style.width.%]="(item.executedQuantity / item.totalQuantity) * 100">
                          </div>
                        </div>
                        <span class="ml-2 text-[10px] font-black text-slate-400">{{ (item.executedQuantity / item.totalQuantity) * 100 | number:'1.0-0' }}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center space-x-2">
                        <button (click)="openEditModal(item)" 
                                class="p-2 rounded-xl bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button (click)="deleteItem(item.id)" 
                                class="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @if (filteredItems.length === 0) {
                  <tr>
                    <td colspan="8" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center">
                        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>
                        <div class="text-sm font-bold text-slate-400">No BOQ items found</div>
                        <div class="text-xs text-slate-400 mt-1">Add your first item to get started</div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ isEditMode ? 'Edit BOQ Item' : 'Add New BOQ Item' }}</h3>
          </div>
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description *</label>
              <input type="text" 
                     [(ngModel)]="formData.description" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                     placeholder="Enter item description">
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit *</label>
                <input type="text" 
                       [(ngModel)]="formData.unit" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                       placeholder="e.g., m2, m3, pcs">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Quantity *</label>
                <input type="number" 
                       [(ngModel)]="formData.totalQuantity" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                       placeholder="0">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rate *</label>
                <input type="number" 
                       [(ngModel)]="formData.rate" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                       placeholder="0.00">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Executed Quantity</label>
                <input type="number" 
                       [(ngModel)]="formData.executedQuantity" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                       placeholder="0">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
                <input type="date" 
                       [(ngModel)]="formData.startDate" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Date</label>
                <input type="date" 
                       [(ngModel)]="formData.endDate" 
                       class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              </div>
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="saveItem()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styles: []
})
export class BoqItemsComponent implements OnInit {
    boqItems: BOQItem[] = [];
    filteredItems: BOQItem[] = [];
    searchTerm: string = '';
    showModal: boolean = false;
    isEditMode: boolean = false;
    editingItemId: number | null = null;
    projectId: number = 1; // TODO: Get from route or service

    formData: Partial<BOQItem> = {
        description: '',
        unit: '',
        totalQuantity: 0,
        executedQuantity: 0,
        rate: 0,
        startDate: '',
        endDate: ''
    };

    constructor(private boqService: BOQService) { }

    ngOnInit(): void {
        this.loadBOQItems();
    }

    loadBOQItems(): void {
        this.boqService.getItems(this.projectId).subscribe({
            next: (items) => {
                this.boqItems = items;
                this.filterItems();
            },
            error: (error) => {
                console.error('Error loading BOQ items:', error);
            }
        });
    }

    filterItems(): void {
        if (!this.searchTerm) {
            this.filteredItems = this.boqItems;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredItems = this.boqItems.filter(item =>
                item.description.toLowerCase().includes(term) ||
                item.unit.toLowerCase().includes(term)
            );
        }
    }

    get totalValue(): number {
        return this.boqItems.reduce((sum, item) => sum + (item.totalQuantity * item.rate), 0);
    }

    get executedValue(): number {
        return this.boqItems.reduce((sum, item) => sum + (item.executedQuantity * item.rate), 0);
    }

    get overallProgress(): number {
        if (this.totalValue === 0) return 0;
        return (this.executedValue / this.totalValue) * 100;
    }

    openAddModal(): void {
        this.isEditMode = false;
        this.editingItemId = null;
        this.formData = {
            description: '',
            unit: '',
            totalQuantity: 0,
            executedQuantity: 0,
            rate: 0,
            startDate: '',
            endDate: ''
        };
        this.showModal = true;
    }

    openEditModal(item: BOQItem): void {
        this.isEditMode = true;
        this.editingItemId = item.id;
        this.formData = { ...item };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.isEditMode = false;
        this.editingItemId = null;
    }

    saveItem(): void {
        if (!this.formData.description || !this.formData.unit || !this.formData.totalQuantity || !this.formData.rate) {
            alert('Please fill in all required fields');
            return;
        }

        if (this.isEditMode && this.editingItemId) {
            const updateRequest: UpdateBOQItemRequest = {
                itemName: this.formData.description,
                description: this.formData.description,
                startDate: this.formData.startDate,
                endDate: this.formData.endDate
            };
            this.boqService.updateItem(this.projectId, this.editingItemId, updateRequest).subscribe({
                next: () => {
                    this.loadBOQItems();
                    this.closeModal();
                },
                error: (error) => {
                    console.error('Error updating BOQ item:', error);
                    alert('Failed to update item');
                }
            });
        } else {
            const createRequest: CreateBOQItemRequest = {
                itemName: this.formData.description,
                description: this.formData.description,
                unit: this.formData.unit,
                agreedQuantity: this.formData.totalQuantity,
                unitPrice: this.formData.rate,
                startDate: this.formData.startDate,
                endDate: this.formData.endDate,
                accountingType: 'Measured'
            };
            this.boqService.createItem(this.projectId, createRequest).subscribe({
                next: () => {
                    this.loadBOQItems();
                    this.closeModal();
                },
                error: (error) => {
                    console.error('Error creating BOQ item:', error);
                    alert('Failed to create item');
                }
            });
        }
    }

    deleteItem(itemId: number): void {
        if (confirm('Are you sure you want to delete this item?')) {
            // Note: Delete method not implemented in BOQService yet
            alert('Delete functionality not yet implemented');
        }
    }
}
