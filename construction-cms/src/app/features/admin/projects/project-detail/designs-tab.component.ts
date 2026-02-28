import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DesignService } from '../../../../core/services/design.service';
import { Design, DesignCategory, CreateCategoryRequest, CreateDesignRequest } from '../../../../shared/interfaces';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';


interface DesignGroup {
    latestDesign: Design;
    versions: Design[];
    isExpanded: boolean;
}

@Component({
    selector: 'app-designs-tab',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, LoadingSpinnerComponent],
    template: `
        <div class="min-h-screen bg-transparent transition-colors duration-500 pb-20">
            <!-- Breadcrumbs / Navigation -->
            <div class="mb-8 flex flex-wrap items-center gap-3">
                <button (click)="selectCategory(null)" 
                        class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-cyan-500 transition-all shadow-sm group">
                    <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                </button>
                
                @for (crumb of breadcrumbs; track crumb.id) {
                    <div class="flex items-center gap-3">
                        <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                        <button (click)="selectCategory(crumb.id)"
                                class="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-500 transition-all shadow-sm">
                            {{ crumb.name }}
                        </button>
                    </div>
                }

                <div class="ml-auto flex items-center gap-3">
                    <button *ngIf="companyId" (click)="openImportTemplateModal()" 
                            class="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-500 transition-all shadow-sm flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Import Template
                    </button>
                    <button *ngIf="canAddCategory" (click)="openCreateCategoryModal()" 
                            class="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-all shadow-sm flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                        {{ 'designs.new_folder' | translate }}
                    </button>
                    <button *ngIf="canAddDesign" (click)="showUploadModal = true" 
                            class="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                        Add Drawing
                    </button>
                </div>
            </div>

            @if (loading) {
                <div class="py-24 flex flex-col items-center justify-center space-y-4">
                    <app-loading-spinner [centered]="true"></app-loading-spinner>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Loading Explorer...</p>
                </div>
            } @else {
                <!-- Grid Container -->
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <!-- Folders -->
                    @for (folder of currentChildCategoriesList; track folder.id) {
                        <div (click)="selectCategory(folder.id)" 
                             class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
                            <div class="relative z-10">
                                <div class="flex items-start justify-between mb-10">
                                    <div class="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>
                                    </div>
                                    <div class="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                                        <button (click)="openEditCategoryModal(folder); $event.stopPropagation()" class="p-2 text-slate-400 hover:text-cyan-500 transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        <button (click)="deleteCategory(folder.id, $event); $event.stopPropagation()" class="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                <h4 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate mb-1">{{ folder.name }}</h4>
                                <div class="flex items-center justify-between mt-4">
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ folder.designCount || 0 }} Drawings</span>
                                    <div class="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-cyan-500 transition-all">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <!-- Files -->
                    @for (group of currentDesignsInFolder; track group.latestDesign.id) {
                        <div class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-cyan-500/10 hover:-translate-y-2 transition-all duration-500">
                            <div class="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                                @if (group.latestDesign.fileUrl && isImage(group.latestDesign.fileType)) {
                                    <img [src]="group.latestDesign.fileUrl" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                                } @else {
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                        <div class="w-20 h-20 rounded-3xl bg-white dark:bg-slate-950 shadow-xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all">
                                            @if (group.latestDesign.fileType?.includes('pdf')) {
                                                <svg class="w-10 h-10 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M14,18H10V16H14V18M14,14H10V12H14V14M13,9V3.5L18.5,9H13Z"></path></svg>
                                            } @else {
                                                <svg class="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            }
                                        </div>
                                    </div>
                                }
                                <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                    <div class="flex gap-2">
                                        <button (click)="viewDesign(group.latestDesign)" class="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-all shadow-xl">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        </button>
                                        <button *ngIf="canAddDesign" (click)="openNewVersionModal(group.latestDesign)" class="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-cyan-500/20">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                                        </button>
                                    </div>
                                    <button *ngIf="canAddDesign" (click)="deleteDesign(group.latestDesign)" class="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Delete</button>
                                </div>
                                <div class="absolute top-4 left-4">
                                    <span class="px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-white">v{{ group.latestDesign.version }}</span>
                                </div>
                            </div>
                            <div class="p-6">
                                <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate mb-1">{{ group.latestDesign.name }}</h4>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{{ group.latestDesign.originalFileName }}</p>
                                <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
                                    <span class="text-[9px] font-black uppercase tracking-widest" [ngClass]="{
                                        'text-amber-500': group.latestDesign.status === 'Draft',
                                        'text-emerald-500': group.latestDesign.status === 'Active'
                                    }">{{ group.latestDesign.status }}</span>
                                    <button *ngIf="group.versions.length > 1" (click)="openVersionHistory(group)" class="text-[9px] font-black text-cyan-500 uppercase tracking-widest hover:underline">{{ group.versions.length }} Versions</button>
                                </div>
                            </div>
                        </div>
                    }
                </div>

                @if (currentDesignsInFolder.length === 0 && currentChildCategoriesList.length === 0) {
                    <div class="py-24 text-center">
                        <div class="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>
                        </div>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{{ 'designs.empty_folder' | translate }}</h3>
                        <div class="flex justify-center gap-4">
                            <button *ngIf="canAddDesign" (click)="showUploadModal = true" class="px-8 py-3.5 rounded-2xl bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Upload Drawing</button>
                        </div>
                    </div>
                }
            }
        </div>

        <!-- Modals -->
        
        <!-- Upload Modal -->
        <div *ngIf="showUploadModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" (click)="closeUploadModal()">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
                <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <h3 class="text-xl font-black uppercase tracking-tight">{{ (isNewVersionMode ? 'Upload New Version' : 'Add New Drawing') }}</h3>
                    <button (click)="closeUploadModal()" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Design Name</label>
                        <input type="text" [(ngModel)]="newDesign.name" class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 font-bold transition-all">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                        <textarea [(ngModel)]="newDesign.description" rows="3" class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 font-medium transition-all"></textarea>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">File</label>
                        <div class="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] p-12 text-center hover:border-cyan-500/50 cursor-pointer transition-all group" (click)="fileInput.click()">
                            <input #fileInput type="file" class="hidden" (change)="handleFileSelect($event)" accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg">
                            <div class="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition-all">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"></path></svg>
                            </div>
                            <p *ngIf="!selectedFile" class="text-xs text-slate-400 font-bold uppercase tracking-widest">Select Drawing File</p>
                            <p *ngIf="selectedFile" class="text-sm text-cyan-500 font-black">{{ selectedFile.name }}</p>
                            <p class="text-[9px] text-slate-400 mt-2 uppercase tracking-tighter">PDF, DWG, PNG or JPG max 20MB</p>
                        </div>
                    </div>
                </div>
                <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 bg-slate-50/50 dark:bg-white/5">
                    <button (click)="closeUploadModal()" class="flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400">{{ 'common.cancel' | translate }}</button>
                    <button (click)="uploadDesign()" [disabled]="!newDesign.name || !selectedFile || uploading" class="flex-1 px-8 py-4 rounded-2xl bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:grayscale">
                        {{ uploading ? 'Uploading...' : 'Save Drawing' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Category Modal -->
        <div *ngIf="showCreateCategoryModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" (click)="showCreateCategoryModal = false">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
                <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <h3 class="text-xl font-black uppercase tracking-tight">{{ (isEditCategoryMode ? ('designs.edit_category' | translate) : ('designs.new_folder' | translate)) }}</h3>
                    <button (click)="showCreateCategoryModal = false" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="p-8 space-y-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{{ 'designs.category_name' | translate }}</label>
                        <input type="text" [(ngModel)]="newCategory.name" class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold transition-all">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                        <textarea [(ngModel)]="newCategory.description" rows="3" class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-medium transition-all"></textarea>
                    </div>

                </div>
                <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 bg-slate-50/50 dark:bg-white/5">
                    <button (click)="showCreateCategoryModal = false" class="flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400">{{ 'common.cancel' | translate }}</button>
                    <button (click)="isEditCategoryMode ? updateCategory() : createCategory()" [disabled]="!newCategory.name || creatingCategory" class="flex-1 px-8 py-4 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50">
                        {{ creatingCategory ? ('common.processing' | translate) : ('common.save' | translate) }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Version History Modal -->
        <div *ngIf="showVersionHistoryModal && selectedDesign" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" (click)="showVersionHistoryModal = false">
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col" (click)="$event.stopPropagation()">
                <div class="p-10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-black uppercase tracking-tight">{{ selectedDesign.name }}</h3>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Version History</p>
                    </div>
                    <button (click)="showVersionHistoryModal = false" class="p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                        <svg class="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="p-10 overflow-y-auto space-y-4">
                    @for (version of selectedDesignVersions; track version.id) {
                        <div class="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 hover:border-cyan-500/30 transition-all duration-300">
                            <div class="flex items-center gap-6">
                                <span class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center font-black text-sm shadow-sm">v{{ version.version }}</span>
                                <div>
                                    <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ version.createdAt | date:'medium' }}</p>
                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">By {{ version.createdByUserName }}</p>
                                </div>
                            </div>
                            <button (click)="viewDesign(version)" class="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center shadow-sm group">
                                <svg class="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>

        <!-- Import Modal -->
        <div *ngIf="showImportTemplateModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" (click)="showImportTemplateModal = false">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
                <div class="p-8 border-b border-slate-100 dark:border-white/5">
                    <h3 class="text-xl font-black uppercase tracking-tight">Import Standard Template</h3>
                </div>
                <div class="p-8 space-y-4 max-h-80 overflow-y-auto">
                    @if (templatesLoading) {
                        <div class="py-12 text-center flex flex-col items-center justify-center gap-3">
                            <app-loading-spinner [centered]="true"></app-loading-spinner>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading templates...</p>
                        </div>
                    } @else if (companyTemplates.length === 0) {
                        <div class="py-12 text-center">
                            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">No Templates Found</p>
                        </div>
                    } @else {
                        @for (template of companyTemplates; track template.id) {
                            <div (click)="selectedTemplateId = template.id" 
                                 class="p-5 rounded-2xl border-2 transition-all cursor-pointer group"
                                 [class.border-cyan-500]="selectedTemplateId === template.id"
                                 [class.bg-cyan-500/[0.02]]="selectedTemplateId === template.id"
                                 [class.border-slate-100]="selectedTemplateId !== template.id"
                                 [class.dark:border-white/5]="selectedTemplateId !== template.id">
                                <h4 class="text-sm font-black uppercase tracking-tight group-hover:text-cyan-500 transition-colors">{{ template.name }}</h4>
                                <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">{{ template.description || 'No description' }}</p>
                            </div>
                        }
                    }
                </div>
                <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 bg-slate-50/50 dark:bg-white/5">
                    <button (click)="showImportTemplateModal = false" class="flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400">{{ 'common.cancel' | translate }}</button>
                    <button (click)="importTemplate()" [disabled]="!selectedTemplateId || importingTemplate" class="flex-1 px-8 py-4 rounded-2xl bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50">
                        {{ importingTemplate ? 'Importing...' : 'Import Now' }}
                    </button>
                </div>
            </div>
        </div>
    `
})
export class DesignsTabComponent implements OnInit, OnChanges {
    @Input() projectId!: number;
    @Input() companyId?: number;

    // Import Modal State
    showImportTemplateModal = false;
    templatesLoading = false;
    companyTemplates: DesignCategory[] = [];
    selectedTemplateId: number | null = null;
    importingTemplate = false;

    // General State
    loading = true;
    uploading = false;
    creatingCategory = false;
    isEditCategoryMode = false;
    selectedCategoryIdToEdit: number | null = null;

    categoryTree: DesignCategory[] = [];
    allCategories: DesignCategory[] = [];
    allDesigns: Design[] = [];
    uncategorizedDesigns: Design[] = [];
    designGroups: DesignGroup[] = [];

    selectedCategoryId: number | null = null;
    folderPlacement: 'subfolder' | 'sibling' = 'subfolder';
    expandedCategories = new Set<number>();

    showUploadModal = false;
    showCreateCategoryModal = false;
    showVersionHistoryModal = false;
    selectedDesign: Design | null = null;
    selectedDesignVersions: Design[] = [];
    selectedFile: File | null = null;

    // Versioning
    isNewVersionMode = false;
    selectedParentDesignId: number | null = null;
    changeNotes = '';

    newDesign = {
        name: '',
        description: '',
        categoryId: null as number | null,
        status: 'Draft'
    };

    newCategory = {
        name: '',
        description: '',
        parentCategoryId: undefined as number | undefined
    };
    selectedCategoryFile: File | null = null;

    get breadcrumbs(): { id: number | null, name: string }[] {
        const crumbs: { id: number | null, name: string }[] = [];
        let currentId = this.selectedCategoryId;

        while (currentId && currentId !== -1) {
            const cat = this.allCategories.find(c => c.id === currentId);
            if (cat) {
                crumbs.unshift({ id: cat.id, name: cat.name });
                currentId = cat.parentCategoryId ?? null;
            } else {
                break;
            }
        }
        return crumbs;
    }

    get currentChildCategoriesList(): DesignCategory[] {
        if (!this.selectedCategoryId) {
            return this.categoryTree;
        }
        const category = this.allCategories.find(c => c.id === this.selectedCategoryId);
        return category?.childCategories ?? [];
    }

    get currentDesignsInFolder(): DesignGroup[] {
        if (!this.selectedCategoryId) {
            return this.designGroups.filter(g => !g.latestDesign.categoryId);
        }
        return this.designGroups.filter(g => g.latestDesign.categoryId === this.selectedCategoryId);
    }

    isImage(fileType?: string): boolean {
        if (!fileType) return false;
        const types = ['image', 'png', 'jpg', 'jpeg'];
        return types.some(t => fileType.toLowerCase().includes(t));
    }

    get canAddDesign(): boolean {
        return this.authService.hasProjectPermission('Design.Add');
    }

    get canViewDesigns(): boolean {
        return this.authService.hasProjectPermission('Design.View') || this.canAddDesign || this.authService.hasRole(['SuperAdmin', 'CompanyAdmin']);
    }

    get canAddCategory(): boolean {
        return this.authService.hasProjectPermission('Category.Add') || this.canAddDesign || this.authService.hasRole(['SuperAdmin', 'CompanyAdmin']);
    }

    constructor(
        private designService: DesignService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['projectId'] && !changes['projectId'].firstChange) {
            this.loadData();
        }
    }

    loadData(): void {
        this.loading = true;

        this.designService.getCategoryTree(this.projectId).subscribe({
            next: (categories) => {
                this.categoryTree = categories;
                this.allCategories = [];
                this.flattenCategories(categories);
                if (categories.length === 0) {
                    this.loading = false;
                }
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                this.loading = false;
            }
        });

        this.designService.getProjectDesigns(this.projectId).subscribe({
            next: (designs) => {
                this.allDesigns = designs;
                this.uncategorizedDesigns = designs.filter(d => !d.categoryId);
                this.groupDesignsByVersion();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading designs:', err);
                this.loading = false;
            }
        });
    }

    groupDesignsByVersion(): void {
        const groups = new Map<number, Design[]>();

        for (const design of this.allDesigns) {
            const key = design.parentDesignId || design.id;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(design);
        }

        this.designGroups = Array.from(groups.values()).map(versions => {
            const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
            return {
                latestDesign: sortedVersions[0],
                versions: sortedVersions,
                isExpanded: false
            };
        });
    }

    flattenCategories(categories: DesignCategory[]): void {
        for (const cat of categories) {
            this.allCategories.push(cat);
            if ((cat.childCategories ?? []).length > 0) {
                this.flattenCategories(cat.childCategories ?? []);
            }
        }
    }

    selectCategory(categoryId: number | null): void {
        this.selectedCategoryId = categoryId;
        this.newDesign.categoryId = categoryId;
    }

    toggleCategory(categoryId: number): void {
        if (this.expandedCategories.has(categoryId)) {
            this.expandedCategories.delete(categoryId);
        } else {
            this.expandedCategories.add(categoryId);
        }
    }

    getCategoryAndSubcategoryIds(categoryId: number): number[] {
        const ids: number[] = [categoryId];
        const category = this.allCategories.find(c => c.id === categoryId);
        if (category) {
            for (const child of (category.childCategories ?? [])) {
                ids.push(...this.getCategoryAndSubcategoryIds(child.id));
            }
        }
        return ids;
    }

    handleFileSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    handleFileDrop(event: DragEvent): void {
        event.preventDefault();
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            this.selectedFile = event.dataTransfer.files[0];
        }
    }

    formatFileSize(bytes: number): string {
        return this.designService.formatFileSize(bytes);
    }

    uploadDesign(): void {
        if (!this.newDesign.name || !this.selectedFile) return;

        this.uploading = true;

        const request: CreateDesignRequest = {
            name: this.newDesign.name,
            description: this.newDesign.description,
            categoryId: this.newDesign.categoryId || undefined,
            status: this.newDesign.status as any,
            file: this.selectedFile,
            createAsNewVersion: this.isNewVersionMode,
            parentDesignId: this.isNewVersionMode && this.selectedParentDesignId ? this.selectedParentDesignId : undefined,
            changeNotes: this.isNewVersionMode ? this.changeNotes : undefined
        };

        this.designService.createDesign(this.projectId, request).subscribe({
            next: () => {
                this.uploading = false;
                this.closeUploadModal();
                this.loadData();
            },
            error: (err) => {
                console.error('Error uploading design:', err);
                this.uploading = false;
            }
        });
    }

    openCreateCategoryModal(): void {
        this.resetNewCategory();
        this.folderPlacement = 'subfolder';
        this.showCreateCategoryModal = true;
    }

    createCategory(): void {
        if (!this.newCategory.name) return;

        let parentId: number | undefined = this.selectedCategoryId || undefined;

        this.creatingCategory = true;
        const request: CreateCategoryRequest = {
            name: this.newCategory.name,
            description: this.newCategory.description || undefined,
            parentCategoryId: parentId,
            projectId: this.projectId,
            order: 0,
            file: this.selectedCategoryFile || undefined
        };

        this.designService.createCategory(this.projectId, request).subscribe({
            next: () => {
                this.creatingCategory = false;
                this.showCreateCategoryModal = false;
                this.resetNewCategory();
                this.loadData();
            },
            error: (err) => {
                console.error('Error creating category:', err);
                this.creatingCategory = false;
            }
        });
    }

    openEditCategoryModal(category: DesignCategory): void {
        this.newCategory = {
            name: category.name,
            description: category.description || '',
            parentCategoryId: category.parentCategoryId ?? undefined
        };
        this.selectedCategoryIdToEdit = category.id;
        this.isEditCategoryMode = true;
        this.showCreateCategoryModal = true;
    }

    updateCategory(): void {
        if (!this.newCategory.name || !this.selectedCategoryIdToEdit) return;

        this.creatingCategory = true;
        this.designService.updateCategory(this.selectedCategoryIdToEdit, {
            ...this.newCategory,
            file: this.selectedCategoryFile || undefined
        }).subscribe({
            next: () => {
                this.creatingCategory = false;
                this.showCreateCategoryModal = false;
                this.resetNewCategory();
                this.loadData();
            },
            error: (err) => {
                console.error('Error updating category:', err);
                this.creatingCategory = false;
            }
        });
    }

    deleteCategory(categoryId: number, event: Event): void {
        event.stopPropagation();
        if (confirm('Are you sure? All designs in this folder will become uncategorized.')) {
            this.designService.deleteCategory(categoryId).subscribe({
                next: () => this.loadData(),
                error: (err) => console.error('Error deleting category:', err)
            });
        }
    }

    openNewVersionModal(design: Design): void {
        this.newDesign = {
            name: design.name,
            description: design.description || '',
            categoryId: design.categoryId || null,
            status: 'Draft'
        };
        this.selectedParentDesignId = design.id;
        this.isNewVersionMode = true;
        this.showUploadModal = true;
        this.changeNotes = '';
        this.selectedFile = null;
    }

    closeUploadModal(): void {
        this.showUploadModal = false;
        this.isNewVersionMode = false;
        this.selectedParentDesignId = null;
        this.changeNotes = '';
        this.selectedFile = null;
        this.resetNewDesign();
    }

    viewDesign(design: Design): void {
        if (design.fileUrl) window.open(design.fileUrl, '_blank');
    }

    deleteDesign(design: Design): void {
        if (confirm('Delete this drawing?')) {
            this.designService.deleteDesign(design.id).subscribe({
                next: () => this.loadData(),
                error: (err) => console.error('Error deleting design:', err)
            });
        }
    }

    openVersionHistory(group: DesignGroup): void {
        this.selectedDesign = group.latestDesign;
        this.selectedDesignVersions = group.versions;
        this.showVersionHistoryModal = true;
    }

    openImportTemplateModal() {
        if (!this.companyId) return;
        this.showImportTemplateModal = true;
        this.templatesLoading = true;
        this.designService.getCompanyTemplates(this.companyId).subscribe({
            next: (templates) => {
                this.companyTemplates = templates;
                this.templatesLoading = false;
            },
            error: (err) => {
                console.error('Error loading templates:', err);
                this.templatesLoading = false;
            }
        });
    }

    importTemplate() {
        if (!this.selectedTemplateId || !this.projectId) return;
        this.importingTemplate = true;
        this.designService.importTemplate(this.projectId, this.selectedTemplateId).subscribe({
            next: () => {
                this.importingTemplate = false;
                this.showImportTemplateModal = false;
                this.loadData();
            },
            error: (err) => {
                console.error('Error importing template:', err);
                this.importingTemplate = false;
            }
        });
    }

    private resetNewDesign(): void {
        this.newDesign = {
            name: '',
            description: '',
            categoryId: this.selectedCategoryId,
            status: 'Draft'
        };
        this.selectedFile = null;
    }

    private resetNewCategory(): void {
        this.newCategory = {
            name: '',
            description: '',
            parentCategoryId: undefined
        };
        this.isEditCategoryMode = false;
        this.selectedCategoryIdToEdit = null;
        this.selectedCategoryFile = null;
    }

    handleCategoryFileSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedCategoryFile = input.files[0];
        }
    }
}
