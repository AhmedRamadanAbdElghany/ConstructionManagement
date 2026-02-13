import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DesignService } from '../../../../core/services/design.service';
import { Design, DesignCategory, CreateCategoryRequest, CreateDesignRequest } from '../../../../shared/interfaces';
import { AuthService } from '../../../../core/services/auth.service';

interface DesignGroup {
    latestDesign: Design;
    versions: Design[];
    isExpanded: boolean;
}

@Component({
    selector: 'app-designs-tab',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
        <div class="designs-container">
            <!-- Header with actions -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ 'designs.title' | translate }}</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'project_detail.designs_desc' | translate }}</p>
                </div>
                @if (canAddDesign || canAddCategory) {
                    <div class="flex gap-2">
                        @if (canAddCategory) {
                            <button (click)="showCreateCategoryModal = true" 
                                    class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {{ 'designs.create_category' | translate }}
                            </button>
                        }
                        @if (canAddDesign) {
                            <button (click)="showUploadModal = true" 
                                    class="px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium text-sm hover:bg-cyan-600 transition-colors flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                {{ 'designs.add_design' | translate }}
                            </button>
                        }
                    </div>
                }
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <!-- Category Tree Panel -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-4">
                        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                            {{ 'designs.select_category' | translate }}
                        </h3>
                        
                        <!-- All Categories Button -->
                        <button (click)="selectCategory(null)"
                                [class.bg-cyan-50]="!selectedCategoryId"
                                [class.dark:bg-cyan-900/20]="!selectedCategoryId"
                                [class.text-cyan-600]="!selectedCategoryId"
                                [class.dark:text-cyan-400]="!selectedCategoryId"
                                class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-2 flex items-center justify-between">
                            <span>{{ 'designs.all_categories' | translate }}</span>
                            <span class="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ getTotalDesignCount() }}</span>
                        </button>

                        <!-- Category Tree -->
                        <div class="category-tree space-y-1">
                            @for (category of categoryTree; track category.id) {
                                <div class="category-item">
                                    <button (click)="selectCategory(category.id)"
                                            [class.bg-cyan-50]="selectedCategoryId === category.id"
                                            [class.dark:bg-cyan-900/20]="selectedCategoryId === category.id"
                                            [class.text-cyan-600]="selectedCategoryId === category.id"
                                            [class.dark:text-cyan-400]="selectedCategoryId === category.id"
                                            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
                                        <span class="truncate">{{ category.name }}</span>
                                        <div class="flex items-center gap-2">
                                            @if ((category.childCategories ?? []).length > 0) {
                                                <button (click)="toggleCategory(category.id); $event.stopPropagation()"
                                                        class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                                                    <svg class="w-3 h-3 transition-transform" 
                                                         [class.rotate-90]="expandedCategories.has(category.id)"
                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                                    </svg>
                                                </button>
                                            }
                                            <span class="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                {{ (category.designCount ?? 0) }}
                                            </span>
                                        </div>
                                    </button>
                                    
                                    <!-- Child Categories -->
                                    @if (expandedCategories.has(category.id) && (category.childCategories ?? []).length > 0) {
                                        <div class="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                            @for (child of (category.childCategories ?? []); track child.id) {
                                                <button (click)="selectCategory(child.id)"
                                                        [class.bg-cyan-50]="selectedCategoryId === child.id"
                                                        [class.dark:bg-cyan-900/20]="selectedCategoryId === child.id"
                                                        [class.text-cyan-600]="selectedCategoryId === child.id"
                                                        [class.dark:text-cyan-400]="selectedCategoryId === child.id"
                                                        class="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
                                                    <span class="truncate">{{ child.name }}</span>
                                                    <span class="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                                                        {{ child.designCount }}
                                                    </span>
                                                </button>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                            
                            <!-- Uncategorized -->
                            @if (uncategorizedDesigns.length > 0) {
                                <button (click)="selectCategory(-1)"
                                        [class.bg-cyan-50]="selectedCategoryId === -1"
                                        [class.dark:bg-cyan-900/20]="selectedCategoryId === -1"
                                        [class.text-cyan-600]="selectedCategoryId === -1"
                                        [class.dark:text-cyan-400]="selectedCategoryId === -1"
                                        class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
                                    <span>{{ 'designs.uncategorized' | translate }}</span>
                                    <span class="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ uncategorizedDesigns.length }}</span>
                                </button>
                            }
                        </div>
                    </div>
                </div>

                <!-- Designs Grid -->
                <div class="lg:col-span-3">
                    @if (loading) {
                        <div class="flex items-center justify-center h-64">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                        </div>
                    } @else if (filteredDesigns.length === 0) {
                        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-12 text-center">
                            <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">{{ 'designs.no_designs' | translate }}</h3>
                            <p class="text-slate-500 dark:text-slate-400 mb-4">{{ 'designs.no_designs_desc' | translate }}</p>
                            @if (canAddDesign) {
                                <button (click)="showUploadModal = true" 
                                        class="px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium text-sm hover:bg-cyan-600 transition-colors">
                                    {{ 'designs.add_design' | translate }}
                                </button>
                            }
                        </div>
                    } @else {
                        <div class="grid grid-cols-1 gap-4">
                            @for (group of filteredDesigns; track group.latestDesign.id) {
                                <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden hover:border-cyan-500/30 transition-all">
                                    <!-- Latest Version Card -->
                                    <div class="p-4">
                                        <div class="flex items-start gap-3">
                                            <!-- File Icon -->
                                            <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                @if (group.latestDesign.fileType?.includes('pdf')) {
                                                    <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M14,18H10V16H14V18M14,14H10V12H14V14M13,9V3.5L18.5,9H13Z"></path>
                                                    </svg>
                                                } @else if (group.latestDesign.fileType?.includes('image')) {
                                                    <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                } @else if (group.latestDesign.fileType?.includes('cad') || group.latestDesign.fileType?.includes('dxf') || group.latestDesign.fileType?.includes('dwg')) {
                                                    <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                                                    </svg>
                                                } @else {
                                                    <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                }
                                            </div>
                                            
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-start justify-between">
                                                    <div>
                                                        <h4 class="font-medium text-slate-900 dark:text-white truncate">{{ group.latestDesign.name }}</h4>
                                                        <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ group.latestDesign.originalFileName }}</p>
                                                    </div>
                                                    @if (group.versions.length > 1) {
                                                        <button (click)="openVersionHistory(group)"
                                                                class="px-3 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xs font-medium hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors flex items-center gap-1">
                                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            {{ 'designs.view_versions' | translate }} ({{ group.versions.length }})
                                                        </button>
                                                    }
                                                </div>
                                                
                                                <div class="flex items-center gap-2 mt-2 flex-wrap">
                                                    <!-- Status Badge -->
                                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                          [ngClass]="{
                                                              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': group.latestDesign.status === 'Draft',
                                                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': group.latestDesign.status === 'Active',
                                                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400': group.latestDesign.status === 'Archived',
                                                              'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': group.latestDesign.status === 'Deprecated'
                                                          }">
                                                        {{ 'designs.' + group.latestDesign.status.toLowerCase() | translate }}
                                                    </span>
                                                    
                                                    <!-- Version Badge -->
                                                    <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                                                        v{{ group.latestDesign.version }}
                                                    </span>
                                                    
                                                    <!-- Approval Status Badge -->
                                                    @if (group.latestDesign.approvalStatus) {
                                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                              [ngClass]="{
                                                                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': group.latestDesign.approvalStatus === 'Pending',
                                                                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': group.latestDesign.approvalStatus === 'Approved',
                                                                  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': group.latestDesign.approvalStatus === 'Rejected'
                                                              }">
                                                            {{ 'designs.approval_' + group.latestDesign.approvalStatus.toLowerCase() | translate }}
                                                        </span>
                                                    }
                                                    
                                                    <!-- Submitted By -->
                                                    @if (group.latestDesign.createdByUserName) {
                                                        <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                            </svg>
                                                            {{ group.latestDesign.createdByUserName }}
                                                        </span>
                                                    }
                                                </div>
                                                

                                                    
                                                    <!-- Actions -->
                                                    <div class="flex items-center justify-between mt-3">
                                                        <span class="text-xs text-slate-400">{{ group.latestDesign.createdAt | date:'medium' }}</span>
                                                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            @if (canAddDesign) {
                                                                <button (click)="openNewVersionModal(group.latestDesign)" 
                                                                        class="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors text-xs font-medium flex items-center gap-1">
                                                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                                                    </svg>
                                                                    {{ 'designs.new_version' | translate }}
                                                                </button>
                                                            }
                                                            <button (click)="viewDesign(group.latestDesign)" 
                                                                    class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-cyan-500 transition-colors">
                                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                                </svg>
                                                            </button>
                                                            @if (canAddDesign) {
                                                                <button (click)="deleteDesign(group.latestDesign)" 
                                                                        class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors">
                                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                    </svg>
                                                                </button>
                                                            }
                                                        </div>
                                                    </div>
                                                
                                                <!-- Change Notes -->
                                                @if (group.latestDesign.changeNotes) {
                                                    <div class="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400">
                                                        <span class="font-medium">{{ 'designs.change_notes' | translate }}:</span> {{ group.latestDesign.changeNotes }}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Expanded Version History -->
                                    @if (group.isExpanded) {
                                        <div class="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30 p-4">
                                            <h5 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{{ 'designs.version_history' | translate }}</h5>
                                            <div class="space-y-2">
                                                @for (version of group.versions; track version.id) {
                                                    <div class="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-colors"
                                                         [class.border-cyan-500]="version.id === group.latestDesign.id"
                                                         [class.bg-cyan-50]="version.id === group.latestDesign.id"
                                                         [class.dark:bg-cyan-900/10]="version.id === group.latestDesign.id">
                                                        <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                            </svg>
                                                        </div>
                                                        <div class="flex-1 min-w-0">
                                                            <div class="flex items-center gap-2">
                                                                <span class="font-medium text-slate-900 dark:text-white">v{{ version.version }}</span>
                                                                @if (version.id === group.latestDesign.id) {
                                                                    <span class="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase">
                                                                        {{ 'designs.latest' | translate }}
                                                                    </span>
                                                                }
                                                                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                                                                      [ngClass]="{
                                                                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': version.status === 'Draft',
                                                                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': version.status === 'Active'
                                                                      }">
                                                                    {{ 'designs.' + version.status.toLowerCase() | translate }}
                                                                </span>
                                                                @if (version.approvalStatus) {
                                                                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                                                                          [ngClass]="{
                                                                              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': version.approvalStatus === 'Pending',
                                                                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': version.approvalStatus === 'Approved',
                                                                              'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': version.approvalStatus === 'Rejected'
                                                                          }">
                                                                        {{ 'designs.approval_' + version.approvalStatus.toLowerCase() | translate }}
                                                                    </span>
                                                                }
                                                            </div>
                                                            <div class="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                <span>{{ version.createdByUserName }}</span>
                                                                <span>{{ version.createdAt | date:'medium' }}</span>
                                                                @if (version.fileSize) {
                                                                    <span>{{ formatFileSize(version.fileSize) }}</span>
                                                                }
                                                            </div>
                                                            @if (version.changeNotes) {
                                                                <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ version.changeNotes }}</p>
                                                            }
                                                            @if (version.approvalStatus === 'Rejected' && version.rejectionReason) {
                                                                <p class="mt-1 text-xs text-rose-600 dark:text-rose-400">
                                                                    <span class="font-medium">{{ 'designs.rejection_reason' | translate }}:</span> {{ version.rejectionReason }}
                                                                </p>
                                                            }
                                                        </div>
                                                        <button (click)="viewDesign(version)"
                                                                class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-cyan-500 transition-colors">
                                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                            </svg>
                                                        </button>
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
            </div>

            <!-- Upload Modal -->
            @if (showUploadModal) {
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeUploadModal()">
                    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl" (click)="$event.stopPropagation()">
                        <div class="p-6 border-b border-slate-200 dark:border-white/5">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ (isNewVersionMode ? 'designs.upload_new_version' : 'designs.add_design') | translate }}</h3>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.design_name' | translate }}</label>
                                <input type="text" [(ngModel)]="newDesign.name" 
                                       class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                       placeholder="Enter design name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.description' | translate }}</label>
                                <textarea [(ngModel)]="newDesign.description" rows="3"
                                          class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                          placeholder="Enter description"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.select_category' | translate }}</label>
                                <select [(ngModel)]="newDesign.categoryId"
                                        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option [value]="null">{{ 'designs.uncategorized' | translate }}</option>
                                    @for (cat of allCategories; track cat.id) {
                                        <option [value]="cat.id">{{ cat.name }}</option>
                                    }
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.status' | translate }}</label>
                                <select [(ngModel)]="newDesign.status"
                                        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value="Draft">{{ 'designs.draft' | translate }}</option>
                                    <option value="Active">{{ 'designs.active' | translate }}</option>
                                </select>
                            </div>
                            @if (isNewVersionMode) {
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.change_notes' | translate }}</label>
                                    <textarea [(ngModel)]="changeNotes" rows="2"
                                            class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="Enter change notes"></textarea>
                                </div>
                            }
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.upload_file' | translate }}</label>
                                <div class="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors cursor-pointer"
                                     (click)="fileInput.click()"
                                     (dragover)="$event.preventDefault()"
                                     (drop)="handleFileDrop($event)">
                                    <input #fileInput type="file" class="hidden" (change)="handleFileSelect($event)" accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg">
                                    @if (selectedFile) {
                                        <p class="text-sm text-slate-600 dark:text-slate-400">{{ selectedFile.name }}</p>
                                        <p class="text-xs text-slate-400 mt-1">{{ formatFileSize(selectedFile.size) }}</p>
                                    } @else {
                                        <svg class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'designs.drag_drop_hint' | translate }}</p>
                                        <p class="text-xs text-slate-400 mt-1">{{ 'designs.supported_formats' | translate }}</p>
                                    }
                                </div>
                            </div>
                        </div>
                        <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                            <button (click)="closeUploadModal()" 
                                    class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {{ 'common.cancel' | translate }}
                            </button>
                            <button (click)="uploadDesign()" 
                                    [disabled]="!newDesign.name || !selectedFile || uploading"
                                    class="px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium text-sm hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                @if (uploading) {
                                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                }
                                {{ 'designs.upload_file' | translate }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            <!-- Create Category Modal -->
            @if (showCreateCategoryModal) {
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showCreateCategoryModal = false">
                    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl" (click)="$event.stopPropagation()">
                        <div class="p-6 border-b border-slate-200 dark:border-white/5">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ 'designs.create_category' | translate }}</h3>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.category_name' | translate }}</label>
                                <input type="text" [(ngModel)]="newCategory.name" 
                                       class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                       placeholder="Enter category name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.description' | translate }}</label>
                                <textarea [(ngModel)]="newCategory.description" rows="3"
                                          class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                          placeholder="Enter description (optional)"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{{ 'designs.subcategory' | translate }}</label>
                                <select [(ngModel)]="newCategory.parentCategoryId"
                                        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option [value]="null">{{ 'designs.new_category' | translate }}</option>
                                    @for (cat of categoryTree; track cat.id) {
                                        <option [value]="cat.id">{{ cat.name }}</option>
                                    }
                                </select>
                            </div>
                        </div>
                        <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                            <button (click)="showCreateCategoryModal = false" 
                                    class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {{ 'common.cancel' | translate }}
                            </button>
                            <button (click)="createCategory()" 
                                    [disabled]="!newCategory.name || creatingCategory"
                                    class="px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium text-sm hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ 'designs.create_category' | translate }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            <!-- Version History Modal -->
            @if (showVersionHistoryModal && selectedDesign) {
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="showVersionHistoryModal = false">
                    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden" (click)="$event.stopPropagation()">
                        <div class="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ 'designs.version_history' | translate }}</h3>
                                <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedDesign.name }}</p>
                            </div>
                            <button (click)="showVersionHistoryModal = false" 
                                    class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="p-6 overflow-y-auto max-h-[60vh]">
                            <div class="space-y-3">
                                @for (version of selectedDesignVersions; track version.id) {
                                    <div class="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-colors"
                                         [class.border-cyan-500]="version.id === selectedDesign.id"
                                         [class.bg-cyan-50]="version.id === selectedDesign.id"
                                         [class.dark:bg-cyan-900/10]="version.id === selectedDesign.id">
                                        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            @if (version.fileType?.includes('pdf')) {
                                                <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M14,18H10V16H14V18M14,14H10V12H14V14M13,9V3.5L18.5,9H13Z"></path>
                                                </svg>
                                            } @else {
                                                <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                            }
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2 flex-wrap">
                                                <span class="font-bold text-slate-900 dark:text-white">v{{ version.version }}</span>
                                                @if (version.id === selectedDesign.id) {
                                                    <span class="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase">
                                                        {{ 'designs.latest' | translate }}
                                                    </span>
                                                }
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                                      [ngClass]="{
                                                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': version.status === 'Draft',
                                                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': version.status === 'Active'
                                                      }">
                                                    {{ 'designs.' + version.status.toLowerCase() | translate }}
                                                </span>
                                                @if (version.approvalStatus) {
                                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                                          [ngClass]="{
                                                              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': version.approvalStatus === 'Pending',
                                                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': version.approvalStatus === 'Approved',
                                                              'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400': version.approvalStatus === 'Rejected'
                                                          }">
                                                        {{ 'designs.approval_' + version.approvalStatus.toLowerCase() | translate }}
                                                    </span>
                                                }
                                            </div>
                                            <div class="mt-2 space-y-1 text-sm">
                                                <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                    </svg>
                                                    <span>{{ 'designs.submitted_by' | translate }}: {{ version.createdByUserName }}</span>
                                                </div>
                                                <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                    <span>{{ 'designs.submitted_at' | translate }}: {{ version.createdAt | date:'medium' }}</span>
                                                </div>
                                                @if (version.fileSize) {
                                                    <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                                                        </svg>
                                                        <span>{{ 'designs.file_size' | translate }}: {{ formatFileSize(version.fileSize) }}</span>
                                                    </div>
                                                }
                                                @if (version.changeNotes) {
                                                    <div class="mt-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                                                        <span class="font-medium">{{ 'designs.change_notes' | translate }}:</span> {{ version.changeNotes }}
                                                    </div>
                                                }
                                                @if (version.approvalStatus === 'Approved' && version.approvedByUserName) {
                                                    <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        <span>{{ 'designs.approved_by' | translate }}: {{ version.approvedByUserName }} ({{ version.approvedDate | date:'shortDate' }})</span>
                                                    </div>
                                                }
                                                @if (version.approvalStatus === 'Rejected' && version.rejectionReason) {
                                                    <div class="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        <span>{{ 'designs.rejected_reason' | translate }}: {{ version.rejectionReason }}</span>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <button (click)="viewDesign(version)"
                                                class="p-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-colors">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                        </button>
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
export class DesignsTabComponent implements OnInit, OnChanges {
    @Input() projectId!: number;

    loading = true;
    uploading = false;
    creatingCategory = false;

    categoryTree: DesignCategory[] = [];
    allCategories: DesignCategory[] = [];
    allDesigns: Design[] = [];
    uncategorizedDesigns: Design[] = [];
    designGroups: DesignGroup[] = [];

    selectedCategoryId: number | null = null;
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
        parentCategoryId: null as number | null
    };

    get canAddDesign(): boolean {
        return this.authService.hasProjectPermission('Design.Add');
    }

    get canViewDesigns(): boolean {
        return this.authService.hasProjectPermission('Design.View') || this.canAddDesign || this.authService.hasRole(['SuperAdmin', 'CompanyAdmin']);
    }

    get canAddCategory(): boolean {
        return this.authService.hasProjectPermission('Category.Add') || this.canAddDesign || this.authService.hasRole(['SuperAdmin', 'CompanyAdmin']);
    }

    get filteredDesigns(): DesignGroup[] {
        if (this.selectedCategoryId === null) {
            return this.designGroups;
        } else if (this.selectedCategoryId === -1) {
            return this.designGroups.filter(g => !g.latestDesign.categoryId);
        } else {
            const categoryIds = this.getCategoryAndSubcategoryIds(this.selectedCategoryId);
            return this.designGroups.filter(g => g.latestDesign.categoryId && categoryIds.includes(g.latestDesign.categoryId));
        }
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
                this.flattenCategories(categories);

                // Load dummy categories if no real categories exist
                if (categories.length === 0) {
                    this.loadDummyCategories();
                }
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                // Load dummy categories on error for demo
                this.loadDummyCategories();
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
                // Load dummy designs on error for demo
                this.loadDummyDesigns();
            }
        });
    }

    loadDummyCategories(): void {
        // Demo categories with photos - using the new interface structure
        this.categoryTree = [
            {
                id: 1,
                name: 'Architectural',
                description: 'Architectural drawings and plans',
                projectId: this.projectId,
                order: 1,
                createdAt: '2024-01-15T10:00:00Z',
                photoUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
                createdByUserId: 2,
                childCategories: [],
                designs: [],
                designCount: 0
            },
            {
                id: 2,
                name: 'Structural',
                description: 'Structural engineering designs',
                projectId: this.projectId,
                order: 2,
                createdAt: '2024-01-15T10:30:00Z',
                photoUrl: 'https://images.unsplash.com/photo-1518098268026-4e1875127430?w=400&h=300&fit=crop',
                createdByUserId: 2,
                childCategories: [],
                designs: [],
                designCount: 0
            },
            {
                id: 3,
                name: 'Electrical',
                description: 'Electrical systems and schematics',
                projectId: this.projectId,
                order: 3,
                createdAt: '2024-01-16T09:00:00Z',
                photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                createdByUserId: 2,
                childCategories: [],
                designs: [],
                designCount: 0
            },
            {
                id: 4,
                name: 'Floor Plans',
                description: 'Detailed floor plans and layouts',
                parentCategoryId: 1,
                projectId: this.projectId,
                order: 1,
                createdAt: '2024-01-17T08:00:00Z',
                photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
                createdByUserId: 2,
                childCategories: [],
                designs: [],
                designCount: 0
            },
            {
                id: 5,
                name: 'Elevations',
                description: 'Building elevations and facades',
                parentCategoryId: 1,
                projectId: this.projectId,
                order: 2,
                createdAt: '2024-01-18T14:00:00Z',
                photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
                createdByUserId: 2,
                childCategories: [],
                designs: [],
                designCount: 0
            }
        ];
        this.flattenCategories(this.categoryTree);

        // Also load dummy designs for demo
        this.loadDummyDesigns();
    }

    loadDummyDesigns(): void {
        // Demo designs with multiple versions for testing version history
        this.allDesigns = [
            // Architectural - Floor Plans - Multiple versions (v1, v2, v3)
            {
                id: 1,
                name: 'Ground Floor Plan v1',
                description: 'Initial ground floor layout',
                categoryId: 4,
                projectId: this.projectId,
                version: 1,
                fileName: 'ground_floor_v1.pdf',
                fileType: 'application/pdf',
                fileSize: 2456000,
                fileUrl: '/assets/designs/ground_floor_v1.pdf',
                status: 'Archived',
                createdByUserId: 2,
                createdByUserName: 'Maria Hassan',
                createdAt: '2024-01-20T10:00:00Z',
                updatedAt: '2024-01-20T10:00:00Z',
                approvalStatus: 'Approved',
                approvedByUserId: 1,
                approvedByUserName: 'Ahmed Ali',
                approvedDate: '2024-01-22T14:30:00Z',
                versionCount: 3,
                changeNotes: 'Initial version'
            },
            {
                id: 2,
                name: 'Ground Floor Plan v2',
                description: 'Updated ground floor layout with modifications',
                categoryId: 4,
                projectId: this.projectId,
                version: 2,
                fileName: 'ground_floor_v2.pdf',
                fileType: 'application/pdf',
                fileSize: 2680000,
                fileUrl: '/assets/designs/ground_floor_v2.pdf',
                status: 'Archived',
                createdByUserId: 2,
                createdByUserName: 'Maria Hassan',
                createdAt: '2024-02-05T09:00:00Z',
                updatedAt: '2024-02-05T09:00:00Z',
                approvalStatus: 'Approved',
                approvedByUserId: 1,
                approvedByUserName: 'Ahmed Ali',
                approvedDate: '2024-02-07T11:00:00Z',
                versionCount: 3,
                parentDesignId: 1,
                changeNotes: 'Modified entrance layout and added additional restroom'
            },
            {
                id: 3,
                name: 'Ground Floor Plan v3',
                description: 'Final approved version with all changes',
                categoryId: 4,
                projectId: this.projectId,
                version: 3,
                fileName: 'ground_floor_v3.pdf',
                fileType: 'application/pdf',
                fileSize: 2890000,
                fileUrl: '/assets/designs/ground_floor_v3.pdf',
                status: 'Active',
                createdByUserId: 2,
                createdByUserName: 'Maria Hassan',
                createdAt: '2024-03-10T15:00:00Z',
                updatedAt: '2024-03-10T15:00:00Z',
                approvalStatus: 'Approved',
                approvedByUserId: 1,
                approvedByUserName: 'Ahmed Ali',
                approvedDate: '2024-03-12T09:00:00Z',
                versionCount: 3,
                parentDesignId: 2,
                changeNotes: 'Final revision incorporating client feedback'
            },
            // Structural - Foundation designs
            {
                id: 4,
                name: 'Foundation Layout v1',
                description: 'Main foundation design',
                categoryId: 2,
                projectId: this.projectId,
                version: 1,
                fileName: 'foundation_v1.dwg',
                fileType: 'application/dwg',
                fileSize: 5200000,
                fileUrl: '/assets/designs/foundation_v1.dwg',
                status: 'Active',
                createdByUserId: 7,
                createdByUserName: 'Mohamed Farid',
                createdAt: '2024-01-25T08:00:00Z',
                updatedAt: '2024-01-25T08:00:00Z',
                approvalStatus: 'Approved',
                approvedByUserId: 1,
                approvedByUserName: 'Ahmed Ali',
                approvedDate: '2024-01-28T10:00:00Z',
                versionCount: 1,
                changeNotes: 'Initial foundation design'
            },
            // Electrical - Single version - Pending approval
            {
                id: 5,
                name: 'Electrical Wiring Diagram v1',
                description: 'Complete electrical wiring layout',
                categoryId: 3,
                projectId: this.projectId,
                version: 1,
                fileName: 'electrical_wiring_v1.pdf',
                fileType: 'application/pdf',
                fileSize: 1850000,
                fileUrl: '/assets/designs/electrical_wiring_v1.pdf',
                status: 'Active',
                createdByUserId: 2,
                createdByUserName: 'Maria Hassan',
                createdAt: '2024-02-15T11:00:00Z',
                updatedAt: '2024-02-15T11:00:00Z',
                approvalStatus: 'Pending',
                versionCount: 1,
                changeNotes: 'Initial electrical design'
            },
            // Architectural - Elevations - Rejected version
            {
                id: 6,
                name: 'Main Facade Elevation v1',
                description: 'Initial facade design',
                categoryId: 5,
                projectId: this.projectId,
                version: 1,
                fileName: 'facade_v1.pdf',
                fileType: 'application/pdf',
                fileSize: 3200000,
                fileUrl: '/assets/designs/facade_v1.pdf',
                status: 'Archived',
                createdByUserId: 2,
                createdByUserName: 'Maria Hassan',
                createdAt: '2024-02-20T14:00:00Z',
                updatedAt: '2024-02-20T14:00:00Z',
                approvalStatus: 'Rejected',
                approvedByUserId: 1,
                approvedByUserName: 'Ahmed Ali',
                approvedDate: '2024-02-25T16:00:00Z',
                versionCount: 2,
                rejectionReason: 'Does not match client requirements. Please revise facade to include more glass elements.',
                changeNotes: 'Initial facade design'
            },
            {
                id: 7,
                name: 'Main Facade Elevation v2',
                description: 'Revised facade with glass elements',
                categoryId: 5,
                projectId: this.projectId,
                version: 2,
                fileName: 'facade_v2.pdf',
                fileType: 'application/pdf',
                fileSize: 3500000,
                fileUrl: '/assets/designs/facade_v2.pdf',
                status: 'Active',
                createdByUserId: 2,
                createdByUserName: 'Maria Hassan',
                createdAt: '2024-03-01T10:00:00Z',
                updatedAt: '2024-03-01T10:00:00Z',
                approvalStatus: 'Approved',
                approvedByUserId: 1,
                approvedByUserName: 'Ahmed Ali',
                approvedDate: '2024-03-05T14:00:00Z',
                parentDesignId: 6,
                changeNotes: 'Added 40% glass coverage per client request'
            }
        ];

        this.uncategorizedDesigns = this.allDesigns.filter(d => !d.categoryId);
        this.groupDesignsByVersion();
        this.loading = false;
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

    getTotalDesignCount(): number {
        return this.designGroups.length;
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
            next: (designId) => {
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

    createCategory(): void {
        if (!this.newCategory.name) return;

        this.creatingCategory = true;
        const request: CreateCategoryRequest = {
            name: this.newCategory.name,
            description: this.newCategory.description || undefined,
            parentCategoryId: this.newCategory.parentCategoryId || undefined,
            projectId: this.projectId,
            order: 0
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
        this.newDesign = {
            name: '',
            description: '',
            categoryId: null,
            status: 'Draft'
        };
    }

    viewDesign(design: Design): void {
        if (design.fileUrl) {
            window.open(design.fileUrl, '_blank');
        }
    }

    deleteDesign(design: Design): void {
        if (confirm('Are you sure you want to delete this design?')) {
            this.designService.deleteDesign(design.id).subscribe({
                next: () => {
                    this.loadData();
                },
                error: (err) => {
                    console.error('Error deleting design:', err);
                }
            });
        }
    }

    openVersionHistory(group: DesignGroup): void {
        this.selectedDesign = group.latestDesign;
        this.selectedDesignVersions = group.versions;
        this.showVersionHistoryModal = true;
    }

    private resetNewDesign(): void {
        this.newDesign = {
            name: '',
            description: '',
            categoryId: null,
            status: 'Draft'
        };
        this.selectedFile = null;
    }

    private resetNewCategory(): void {
        this.newCategory = {
            name: '',
            description: '',
            parentCategoryId: null
        };
    }
}
