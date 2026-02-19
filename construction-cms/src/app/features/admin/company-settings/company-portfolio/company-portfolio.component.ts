import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PortfolioService, PortfolioCategoryDto, PortfolioItemDto, CreatePortfolioCategoryRequest, UpdatePortfolioCategoryRequest, CreatePortfolioItemRequest, UpdatePortfolioItemRequest } from '../../../../core/services/portfolio.service';

@Component({
    selector: 'app-company-portfolio',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="space-y-6">
        <!-- Breadcrumbs / Navigation -->
        <div class="flex items-center gap-3">
            <button (click)="selectCategory(null)" 
                    class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-indigo-500 transition-all shadow-sm group">
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
            </button>
            
            @for (crumb of breadcrumbs; track crumb.id) {
                <div class="flex items-center gap-3">
                    <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                    <button (click)="selectCategory(crumb.id)"
                            class="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 transition-all shadow-sm">
                        {{ crumb.name }}
                    </button>
                </div>
            }

            <div class="ml-auto flex items-center gap-3" *ngIf="!readOnly">
                <button (click)="openCreateCategoryModal()" 
                        class="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                    {{ 'portfolio.new_category' | translate }}
                </button>
                @if (selectedCategoryId) {
                    <button (click)="openCreateItemModal()" 
                            class="px-6 py-3 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                        {{ 'portfolio.new_item' | translate }}
                    </button>
                }
            </div>
        </div>

        <!-- Content Grid (Categories & Items) -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <!-- Categories -->
            @for (category of currentChildCategories; track category.id) {
                <div (click)="selectCategory(category.id)" 
                     class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 cursor-pointer overflow-hidden">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>

                    <div class="relative z-10">
                        <div class="flex items-start justify-between mb-8">
                            <div class="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>
                            </div>
                            <div class="flex items-center opacity-0 group-hover:opacity-100 transition-all" *ngIf="!readOnly">
                                <button (click)="openEditCategoryModal(category); $event.stopPropagation()" class="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button (click)="deleteCategory(category); $event.stopPropagation()" class="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>

                        <h3 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate mb-1">{{ category.name }}</h3>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{{ category.childCategories.length || 0 }} Subfolders • {{ category.items.length || 0 }} Items</p>
                    </div>
                </div>
            }

            <!-- Items -->
            @for (item of currentItems; track item.id) {
                 <div class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 cursor-default overflow-hidden">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>

                    <div class="relative z-10">
                        <div class="flex items-start justify-between mb-8">
                            <div class="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                @if (item.fileUrl && isImage(item.fileType)) {
                                    <img [src]="item.fileUrl" class="w-full h-full object-cover rounded-3xl" alt="">
                                } @else {
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                }
                            </div>
                            <div class="flex items-center opacity-0 group-hover:opacity-100 transition-all" *ngIf="!readOnly">
                                <button (click)="openEditItemModal(item); $event.stopPropagation()" class="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button (click)="deleteItem(item); $event.stopPropagation()" class="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>

                        <h3 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate mb-1">{{ item.name }}</h3>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate mb-2">{{ item.clientName || 'No Client' }} • {{ item.completionDate | date:'mediumDate' }}</p>
                        @if (item.fileUrl) {
                            <a [href]="item.fileUrl" target="_blank" class="inline-flex items-center gap-2 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-widest" (click)="$event.stopPropagation()">
                                View File
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                        }
                    </div>
                </div>
            }
        </div>

        <!-- Empty State -->
        @if (!loading && currentChildCategories.length === 0 && currentItems.length === 0) {
            <div class="py-24 text-center">
                <div class="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Empty Portfolio</h3>
                <p class="text-slate-500 mb-6 uppercase text-[10px] font-bold tracking-widest">No categories or work items found</p>
            </div>
        }

        <!-- Create/Edit Category Modal -->
        @if (showCreateCategoryModal) {
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showCreateCategoryModal = false">
                <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl" (click)="$event.stopPropagation()">
                    <div class="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ isEditCategoryMode ? ('portfolio.edit_category' | translate) : ('portfolio.new_category' | translate) }}</h3>
                        <button (click)="showCreateCategoryModal = false" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
                            <input type="text" [(ngModel)]="newCategory.name" 
                                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter category name">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea [(ngModel)]="newCategory.description" rows="3"
                                        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter description"></textarea>
                        </div>
                    </div>
                    <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                        <button (click)="showCreateCategoryModal = false" 
                                class="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10">
                            Cancel
                        </button>
                        <button (click)="isEditCategoryMode ? updateCategory() : createCategory()" 
                                [disabled]="!newCategory.name || creating"
                                class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50">
                            {{ isEditCategoryMode ? ('common.save' | translate) : ('common.add_new' | translate) }}
                        </button>
                    </div>
                </div>
            </div>
        }

        <!-- Create/Edit Item Modal -->
        @if (showCreateItemModal) {
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showCreateItemModal = false">
                <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl" (click)="$event.stopPropagation()">
                     <div class="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ isEditItemMode ? ('portfolio.edit_item' | translate) : ('portfolio.new_item' | translate) }}</h3>
                        <button (click)="showCreateItemModal = false" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
                            <input type="text" [(ngModel)]="newItem.name" 
                                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Project Name">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
                                <input type="text" [(ngModel)]="newItem.clientName" 
                                        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                <input type="text" [(ngModel)]="newItem.location" 
                                        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea [(ngModel)]="newItem.description" rows="3"
                                        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Completion Date</label>
                            <input type="date" [(ngModel)]="newItem.completionDate"
                                   class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Media File</label>
                            <input type="file" (change)="handleItemFileSelect($event)" 
                                   class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                             @if (selectedItemFile) {
                                <p class="mt-2 text-xs text-emerald-600 font-bold">{{ selectedItemFile.name }}</p>
                            }
                        </div>
                    </div>
                    <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                        <button (click)="showCreateItemModal = false" 
                                class="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10">
                            Cancel
                        </button>
                        <button (click)="isEditItemMode ? updateItem() : createItem()" 
                                [disabled]="!newItem.name || creating"
                                class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50">
                            {{ isEditItemMode ? ('common.save' | translate) : ('common.add_new' | translate) }}
                        </button>
                    </div>
                </div>
            </div>
        }
    </div>
    `
})
export class CompanyPortfolioComponent implements OnInit {
    @Input() companyId!: number;
    @Input() readOnly = false;

    categoryTree: PortfolioCategoryDto[] = [];
    allCategories: PortfolioCategoryDto[] = [];
    loading = false;
    creating = false;

    // Navigation
    selectedCategoryId: number | null = null;

    get breadcrumbs(): { id: number | null, name: string }[] {
        const crumbs: { id: number | null, name: string }[] = [];
        let currentId = this.selectedCategoryId;
        while (currentId) {
            const cat = this.allCategories.find(c => c.id === currentId);
            if (cat) {
                crumbs.unshift({ id: cat.id, name: cat.name });
                currentId = cat.parentCategoryId || null;
            } else break;
        }
        return crumbs;
    }

    get currentChildCategories(): PortfolioCategoryDto[] {
        if (!this.selectedCategoryId) return this.categoryTree;
        return this.allCategories.find(c => c.id === this.selectedCategoryId)?.childCategories || [];
    }

    get currentItems(): PortfolioItemDto[] {
        if (!this.selectedCategoryId) return [];
        return this.allCategories.find(c => c.id === this.selectedCategoryId)?.items || [];
    }

    selectCategory(id: number | null) {
        this.selectedCategoryId = id;
    }

    // Modal States
    showCreateCategoryModal = false;
    isEditCategoryMode = false;

    showCreateItemModal = false;
    isEditItemMode = false;

    // Forms
    newCategory: {
        id?: number;
        name: string;
        description: string;
        parentCategoryId: number | null;
    } = { name: '', description: '', parentCategoryId: null };

    newItem: {
        id?: number;
        name: string;
        description: string;
        clientName: string;
        location: string;
        completionDate: string;
    } = { name: '', description: '', clientName: '', location: '', completionDate: '' };

    selectedItemFile: File | null = null;

    constructor(private portfolioService: PortfolioService) { }

    ngOnInit() {
        if (this.companyId) {
            this.loadPortfolio();
        }
    }

    loadPortfolio() {
        this.loading = true;
        this.portfolioService.getCompanyPortfolio(this.companyId).subscribe({
            next: (data) => {
                this.categoryTree = data;
                this.allCategories = [];
                this.flattenCategories(data);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading portfolio:', err);
                this.loading = false;
            }
        });
    }

    flattenCategories(categories: PortfolioCategoryDto[]) {
        categories.forEach(c => {
            this.allCategories.push(c);
            if (c.childCategories) this.flattenCategories(c.childCategories);
        });
    }

    isImage(fileType?: string): boolean {
        return !!fileType && fileType.startsWith('image/');
    }

    // Category Actions
    openCreateCategoryModal() {
        this.isEditCategoryMode = false;
        this.newCategory = { name: '', description: '', parentCategoryId: this.selectedCategoryId };
        this.showCreateCategoryModal = true;
    }

    openEditCategoryModal(category: PortfolioCategoryDto) {
        this.isEditCategoryMode = true;
        this.newCategory = {
            id: category.id,
            name: category.name,
            description: category.description || '',
            parentCategoryId: category.parentCategoryId || null
        };
        this.showCreateCategoryModal = true;
    }

    createCategory() {
        if (!this.newCategory.name) return;
        this.creating = true;
        const request: CreatePortfolioCategoryRequest = {
            name: this.newCategory.name,
            description: this.newCategory.description,
            parentCategoryId: this.newCategory.parentCategoryId || undefined
        };

        this.portfolioService.createCategory(request).subscribe({
            next: () => {
                this.creating = false;
                this.showCreateCategoryModal = false;
                this.loadPortfolio();
            },
            error: (err) => {
                console.error(err);
                this.creating = false;
            }
        });
    }

    updateCategory() {
        if (!this.newCategory.name || !this.newCategory.id) return;
        this.creating = true;
        const request: UpdatePortfolioCategoryRequest = {
            name: this.newCategory.name,
            description: this.newCategory.description,
            parentCategoryId: this.newCategory.parentCategoryId || undefined
        };

        this.portfolioService.updateCategory(this.newCategory.id, request).subscribe({
            next: () => {
                this.creating = false;
                this.showCreateCategoryModal = false;
                this.loadPortfolio();
            },
            error: (err) => {
                console.error(err);
                this.creating = false;
            }
        });
    }

    deleteCategory(category: PortfolioCategoryDto) {
        if (confirm(`Delete category "${category.name}" and all contents?`)) {
            this.portfolioService.deleteCategory(category.id).subscribe({
                next: () => this.loadPortfolio(),
                error: (err) => console.error(err)
            });
        }
    }

    // Item Actions
    openCreateItemModal() {
        this.isEditItemMode = false;
        this.newItem = { name: '', description: '', clientName: '', location: '', completionDate: '' };
        this.selectedItemFile = null;
        this.showCreateItemModal = true;
    }

    openEditItemModal(item: PortfolioItemDto) {
        this.isEditItemMode = true;
        this.newItem = {
            id: item.id,
            name: item.name,
            description: item.description || '',
            clientName: item.clientName || '',
            location: item.location || '',
            completionDate: item.completionDate ? new Date(item.completionDate).toISOString().split('T')[0] : ''
        };
        this.selectedItemFile = null;
        this.showCreateItemModal = true;
    }

    handleItemFileSelect(event: any) {
        if (event.target.files.length > 0) {
            this.selectedItemFile = event.target.files[0];
        }
    }

    createItem() {
        if (!this.newItem.name || !this.selectedCategoryId) return;
        this.creating = true;

        const request: CreatePortfolioItemRequest = {
            name: this.newItem.name,
            description: this.newItem.description,
            categoryId: this.selectedCategoryId,
            file: this.selectedItemFile || undefined,
            clientName: this.newItem.clientName,
            location: this.newItem.location,
            completionDate: this.newItem.completionDate
        };

        this.portfolioService.createItem(request).subscribe({
            next: () => {
                this.creating = false;
                this.showCreateItemModal = false;
                this.loadPortfolio();
            },
            error: (err) => {
                console.error(err);
                this.creating = false;
            }
        });
    }

    updateItem() {
        if (!this.newItem.name || !this.newItem.id) return;
        this.creating = true;

        const request: UpdatePortfolioItemRequest = {
            name: this.newItem.name,
            description: this.newItem.description,
            categoryId: this.selectedCategoryId || undefined,
            file: this.selectedItemFile || undefined,
            clientName: this.newItem.clientName,
            location: this.newItem.location,
            completionDate: this.newItem.completionDate
        };

        this.portfolioService.updateItem(this.newItem.id, request).subscribe({
            next: () => {
                this.creating = false;
                this.showCreateItemModal = false;
                this.loadPortfolio();
            },
            error: (err) => {
                console.error(err);
                this.creating = false;
            }
        });
    }

    deleteItem(item: PortfolioItemDto) {
        if (confirm(`Delete item "${item.name}"?`)) {
            this.portfolioService.deleteItem(item.id).subscribe({
                next: () => this.loadPortfolio(),
                error: (err) => console.error(err)
            });
        }
    }
}
