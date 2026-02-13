import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DesignService } from '../../../core/services/design.service';
import { DesignCategory, CreateCategoryRequest, UpdateCategoryRequest } from '../../../shared/interfaces';

@Component({
    selector: 'app-company-design-settings',
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

            <div class="ml-auto flex items-center gap-3">
                 <button (click)="openCreateCategoryModal()" 
                        class="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                    New Folder
                </button>
            </div>
        </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        @for (category of currentChildCategories; track category.id) {
          <div (click)="selectCategory(category.id)" 
               class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 cursor-pointer overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>

                <div class="relative z-10">
                    <div class="flex items-start justify-between mb-8">
                        <div class="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                             @if (category.photoUrl) {
                                 <img [src]="category.photoUrl" class="w-full h-full object-cover rounded-3xl">
                             } @else {
                                 <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>
                             }
                        </div>
                        <div class="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                            <button (click)="openEditCategoryModal(category); $event.stopPropagation()" class="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button (click)="deleteCategory(category); $event.stopPropagation()" class="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>

                    <h3 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate mb-1">{{ category.name }}</h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{{ (category.childCategories || []).length }} Subfolders</p>
                </div>
          </div>
        }

        @if (!selectedCategoryId) {
            <div (click)="openCreateCategoryModal()" 
                 class="group p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all cursor-pointer flex flex-col items-center justify-center text-center">
                <div class="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all mb-4">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                </div>
                <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Create Folder</h4>
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global template root</p>
            </div>
        }
      </div>

       <!-- Empty State -->
       @if (!loading && currentChildCategories.length === 0) {
           <div class="py-24 text-center">
               <div class="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                   <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>
               </div>
               <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Empty Template Folder</h3>
               <button (click)="openCreateCategoryModal()" class="mt-6 px-8 py-3.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-500/20">Add First Category</button>
           </div>
       }

       <!-- Create/Edit Category Modal -->
        @if (showCreateCategoryModal) {
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showCreateCategoryModal = false">
                <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl" (click)="$event.stopPropagation()">
                    <div class="p-6 border-b border-slate-200 dark:border-white/5">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ isEditCategoryMode ? 'Edit Template Category' : 'New Template Category' }}</h3>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
                            <input type="text" [(ngModel)]="newCategory.name" 
                                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter category name">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                            <textarea [(ngModel)]="newCategory.description" rows="3"
                                        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter description"></textarea>
                        </div>

                         <!-- Image Upload -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Image (Optional)</label>
                            <div class="relative w-full h-32 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-colors group"
                                    (click)="categoryFileInput.click()">
                                    <input #categoryFileInput type="file" class="hidden" (change)="handleCategoryFileSelect($event)" accept="image/*">
                                    @if (selectedCategoryFile) {
                                        <div class="text-center">
                                            <p class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">{{ selectedCategoryFile.name }}</p>
                                        </div>
                                    } @else {
                                        <div class="text-center">
                                            <svg class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Click to upload image</p>
                                        </div>
                                    }
                            </div>
                        </div>
                    </div>
                    <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                        <button (click)="showCreateCategoryModal = false" 
                                class="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-white/5">
                            Cancel
                        </button>
                        <button (click)="isEditCategoryMode ? updateCategory() : createCategory()" 
                                [disabled]="!newCategory.name || creatingCategory"
                                class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50">
                            {{ isEditCategoryMode ? 'Save Template' : 'Create Template' }}
                        </button>
                    </div>
                </div>
            </div>
        }
    </div>
  `
})
export class CompanyDesignSettingsComponent implements OnInit {
    @Input() companyId!: number;

    categoryTree: DesignCategory[] = [];
    allCategories: DesignCategory[] = [];
    loading = false;

    // Navigation State
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

    get currentChildCategories(): DesignCategory[] {
        if (!this.selectedCategoryId) return this.categoryTree;
        return this.allCategories.find(c => c.id === this.selectedCategoryId)?.childCategories || [];
    }

    selectCategory(id: number | null) {
        this.selectedCategoryId = id;
    }

    // Modal State
    showCreateCategoryModal = false;
    isEditCategoryMode = false;
    creatingCategory = false;

    newCategory: {
        id?: number;
        name: string;
        description: string;
        parentCategoryId: number | null;
    } = { name: '', description: '', parentCategoryId: null };

    selectedCategoryFile: File | null = null;

    constructor(private designService: DesignService) { }

    ngOnInit() {
        if (this.companyId) {
            this.loadTemplates();
        }
    }

    loadTemplates() {
        this.loading = true;
        this.designService.getCompanyTemplates(this.companyId).subscribe({
            next: (categories) => {
                this.categoryTree = categories;
                this.allCategories = [];
                this.flattenCategories(categories);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading design templates:', err);
                this.loading = false;
            }
        });
    }

    flattenCategories(categories: DesignCategory[]) {
        categories.forEach(c => {
            this.allCategories.push(c);
            if (c.childCategories) this.flattenCategories(c.childCategories);
        });
    }

    openCreateCategoryModal() {
        this.resetNewCategory();
        this.newCategory.parentCategoryId = this.selectedCategoryId;
        this.showCreateCategoryModal = true;
    }

    openEditCategoryModal(category: DesignCategory) {
        this.isEditCategoryMode = true;
        this.newCategory = {
            id: category.id,
            name: category.name,
            description: category.description || '',
            parentCategoryId: category.parentCategoryId || null
        };
        this.showCreateCategoryModal = true;
    }

    handleCategoryFileSelect(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedCategoryFile = file;
        }
    }

    resetNewCategory() {
        this.isEditCategoryMode = false;
        this.newCategory = { name: '', description: '', parentCategoryId: null };
        this.selectedCategoryFile = null;
    }

    createCategory() {
        if (!this.newCategory.name) return;

        this.creatingCategory = true;
        const request: CreateCategoryRequest = {
            name: this.newCategory.name,
            description: this.newCategory.description || undefined,
            parentCategoryId: this.newCategory.parentCategoryId || undefined,
            companyId: this.companyId,
            order: 0,
            file: this.selectedCategoryFile || undefined
        };

        this.designService.createCompanyTemplate(this.companyId, request).subscribe({
            next: () => {
                this.creatingCategory = false;
                this.showCreateCategoryModal = false;
                this.resetNewCategory();
                this.loadTemplates();
            },
            error: (err) => {
                console.error('Error creating template:', err);
                this.creatingCategory = false;
            }
        });
    }

    updateCategory() {
        if (!this.newCategory.name || !this.newCategory.id) return;

        this.creatingCategory = true;
        const request: UpdateCategoryRequest = {
            name: this.newCategory.name,
            description: this.newCategory.description,
            parentCategoryId: this.newCategory.parentCategoryId || undefined,
            file: this.selectedCategoryFile || undefined
        };

        this.designService.updateCompanyTemplate(this.newCategory.id, request).subscribe({
            next: () => {
                this.creatingCategory = false;
                this.showCreateCategoryModal = false;
                this.resetNewCategory();
                this.loadTemplates();
            },
            error: (err) => {
                console.error('Error updating template:', err);
                this.creatingCategory = false;
            }
        });
    }

    deleteCategory(category: DesignCategory) {
        if (confirm('Are you sure you want to delete this template category?')) {
            this.designService.deleteCompanyTemplate(category.id).subscribe({
                next: () => {
                    this.loadTemplates();
                },
                error: (err) => {
                    console.error('Error deleting template:', err);
                }
            });
        }
    }
}
