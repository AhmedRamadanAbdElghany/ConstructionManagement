import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TaskManagementService,
  ProjectItemTask,
  ProjectItemTaskAttachment,
  ProjectItemTaskHistory,
  TaskStatus,
  TaskPriority,
  MediaType,
  ReviewStatus
} from '../../../core/services/task-management.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500 font-['Outfit']">
      <div class="max-w-7xl mx-auto p-6 md:p-10">
        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center h-64">
          <app-loading-spinner [centered]="true"></app-loading-spinner>
        </div>

        <!-- Task Content -->
        <div *ngIf="!loading && task">
          <!-- Header -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 animate-premium-fade">
            <div class="flex items-start space-x-6">
              <button (click)="goBack()" class="mt-1 p-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:-translate-x-1 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <svg class="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <div class="flex flex-wrap items-center gap-3 mb-3">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{{ task.taskNumber }}</span>
                  <span [class]="getStatusClass(task.status)" class="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ring-current">
                    {{ getStatusLabel(task.status) }}
                  </span>
                  <span [class]="getPriorityClass(task.priority)" class="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ring-current">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{{ task.title }}</h1>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-4">
              <button *ngIf="canStart()" (click)="startTask()" 
                class="group relative px-8 py-4 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
                <span class="relative z-10">{{ 'tasks.start' | translate }}</span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
              <button *ngIf="canSubmitForReview()" (click)="submitForReview()" 
                class="group relative px-8 py-4 rounded-[2rem] bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
                <span class="relative z-10">{{ 'tasks.submit_review' | translate }}</span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
              <div class="flex items-center gap-3">
                <button *ngIf="canApprove()" (click)="openReviewModal('approve')" 
                  class="group relative px-8 py-4 rounded-[2rem] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
                  <span class="relative z-10">{{ 'tasks.approve' | translate }}</span>
                </button>
                <button *ngIf="canReject()" (click)="openReviewModal('reject')" 
                  class="group relative px-8 py-4 rounded-[2rem] bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-rose-500/30 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
                  <span class="relative z-10">{{ 'tasks.reject' | translate }}</span>
                </button>
              </div>
              <button *ngIf="canRequestRevision()" (click)="openReviewModal('revision')" 
                class="group relative px-8 py-4 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
                <span class="relative z-10">{{ 'tasks.request_revision' | translate }}</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Description -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade" style="animation-delay: 100ms">
                <div class="flex items-center gap-3 mb-8">
                  <div class="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'tasks.description' | translate }}</h2>
                </div>
                <div class="relative">
                  <p *ngIf="task.description" class="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium whitespace-pre-wrap italic pl-6 border-l-2 border-slate-100 dark:border-white/5">{{ task.description }}</p>
                  <p *ngIf="!task.description" class="text-slate-400 dark:text-slate-500 text-sm font-bold italic">{{ 'tasks.no_description' | translate }}</p>
                </div>
              </div>

              <!-- Attachments -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade" style="animation-delay: 200ms">
                <div class="flex items-center justify-between mb-10">
                  <div class="flex items-center gap-3">
                    <div class="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'tasks.attachments' | translate }}</h2>
                  </div>
                  <button (click)="openUploadModal()" class="px-6 py-3 rounded-[1.25rem] bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-2 ring-1 ring-slate-200 dark:ring-white/5 group">
                    <svg class="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>{{ 'tasks.add_attachment' | translate }}</span>
                  </button>
                </div>
                
                <div *ngIf="attachments.length === 0" class="text-center py-16 bg-slate-50/50 dark:bg-white/[0.02] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                  <div class="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-1 ring-slate-200 dark:ring-white/5">
                    <svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <p class="text-slate-400 dark:text-slate-500 font-bold text-sm tracking-tight">{{ 'tasks.no_attachments' | translate }}</p>
                </div>

                <div *ngIf="attachments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div *ngFor="let attachment of attachments" 
                    class="group relative bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/50 transition-all duration-500 shadow-lg hover:shadow-2xl hover:-translate-y-2">
                    <!-- Preview Area -->
                    <div class="aspect-[4/3] relative bg-slate-100 dark:bg-slate-900/50 overflow-hidden">
                      <img *ngIf="attachment.mediaType === MediaType.Photo" [src]="attachment.filePath" [alt]="attachment.caption || attachment.fileName" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                      <div *ngIf="attachment.mediaType === MediaType.Video" class="w-full h-full flex items-center justify-center bg-slate-900">
                        <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-125 transition-transform duration-500 ring-2 ring-white/30">
                          <svg class="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                        </div>
                      </div>
                      <div *ngIf="attachment.mediaType === MediaType.Document" class="w-full h-full flex items-center justify-center">
                        <svg class="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div class="absolute top-4 right-4">
                        <span [class]="getReviewStatusClass(attachment.reviewStatus)" class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl ring-1 ring-inset ring-current backdrop-blur-sm">
                          {{ getReviewStatusLabel(attachment.reviewStatus) }}
                        </span>
                      </div>
                    </div>
                    <div class="p-6">
                      <p class="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight leading-none mb-2">{{ attachment.caption || attachment.fileName }}</p>
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{{ attachment.uploadedAt | date:'medium' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Activity History -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade" style="animation-delay: 300ms">
                <div class="flex items-center gap-3 mb-10">
                  <div class="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'tasks.activity_history' | translate }}</h2>
                </div>
                <div *ngIf="history.length === 0" class="text-center py-12 bg-slate-50/50 dark:bg-white/[0.02] rounded-[2rem]">
                  <p class="text-slate-400 dark:text-slate-500 font-bold text-sm italic">{{ 'tasks.no_history' | translate }}</p>
                </div>
                <div *ngIf="history.length > 0" class="relative pl-10 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/20 before:via-purple-500/20 before:to-transparent">
                  <div *ngFor="let item of history; let last = last" class="relative animate-premium-fade">
                    <div class="absolute -left-[10px] top-0 w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-4 ring-slate-50 dark:ring-slate-950 flex items-center justify-center z-10">
                      <div class="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-premium-pulse"></div>
                    </div>
                    <div class="flex items-start gap-4">
                      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs ring-1 ring-indigo-500/20 shadow-inner flex-shrink-0">
                        {{ getInitials(item.changedByUser) }}
                      </div>
                      <div class="bg-slate-50/50 dark:bg-white/[0.02] rounded-[1.5rem] p-6 flex-1 ring-1 ring-slate-200/50 dark:ring-white/5">
                        <p class="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-relaxed">
                          <span class="text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-[10px] mr-2">{{ item.changedByUser?.name || 'System' }}</span>
                          {{ item.notes || getActionLabel(item.action) }}
                        </p>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 opacity-60 italic">{{ item.changedAt | date:'medium' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-8 animate-premium-fade" style="animation-delay: 400ms">
              <!-- Task Details -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none">
                <div class="flex items-center gap-3 mb-8">
                  <div class="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'tasks.details' | translate }}</h2>
                </div>
                <div class="space-y-6">
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] ring-1 ring-slate-100 dark:ring-white/5">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'tasks.status' | translate }}</span>
                    <span [class]="getStatusClass(task.status)" class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ring-current">
                      {{ getStatusLabel(task.status) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] ring-1 ring-slate-100 dark:ring-white/5">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'tasks.priority' | translate }}</span>
                    <span [class]="getPriorityClass(task.priority)" class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ring-current">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] ring-1 ring-slate-100 dark:ring-white/5">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'tasks.progress' | translate }}</span>
                    <span class="text-sm font-black text-blue-600 dark:text-blue-400">{{ task.progressPercentage }}%</span>
                  </div>
                  <div *ngIf="task.dueDate" class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] ring-1 ring-slate-100 dark:ring-white/5">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'tasks.due_date' | translate }}</span>
                    <span class="text-sm font-black text-slate-900 dark:text-white">{{ task.dueDate | date:'mediumDate' }}</span>
                  </div>
                  <div *ngIf="task.assignedToUser" class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] ring-1 ring-slate-100 dark:ring-white/5">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'tasks.assigned_to' | translate }}</span>
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-indigo-500/20 ring-2 ring-white dark:ring-slate-900">
                        {{ getInitials(task.assignedToUser) }}
                      </div>
                      <span class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{{ task.assignedToUser?.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Progress Update -->
              <div *ngIf="canSubmitForReview() || canStart()" class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none">
                <div class="flex items-center gap-3 mb-8">
                  <div class="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'tasks.update_progress' | translate }}</h2>
                </div>
                <div class="space-y-8">
                  <div class="px-2">
                    <input type="range" [(ngModel)]="progressValue" min="0" max="100" 
                      class="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600">
                    <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                      <span>0%</span>
                      <span class="px-4 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">{{ progressValue }}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <button (click)="updateProgress()" 
                    class="group relative w-full px-8 py-4 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
                    <span class="relative z-10">{{ 'tasks.save_progress' | translate }}</span>
                    <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
                </div>
              </div>

              <!-- Pre-Start Confirmation -->
              <div *ngIf="task.requiresPreStartConfirmation" class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none">
                <div class="flex items-center gap-3 mb-8">
                  <div class="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
                  <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'tasks.pre_start_confirmation' | translate }}</h2>
                </div>
                <div class="space-y-6">
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] ring-1 ring-slate-100 dark:ring-white/5">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'tasks.confirmation_status' | translate }}</span>
                    <span [class]="getConfirmationStatusClass(task.preStartConfirmationStatus)" class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ring-current">
                      {{ getConfirmationStatusLabel(task.preStartConfirmationStatus) }}
                    </span>
                  </div>
                  <button *ngIf="canConfirmPreStart()" (click)="confirmPreStart()" 
                    class="group relative w-full px-8 py-4 rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
                    <span class="relative z-10">{{ 'tasks.confirm_ready' | translate }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Modal -->
        <div *ngIf="showReviewModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-premium-fade">
          <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/60 dark:border-white/5">
            <div class="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">
                    {{ reviewType === 'approve' ? ('tasks.approve_task' | translate) : 
                       reviewType === 'reject' ? ('tasks.reject_task' | translate) : 
                       ('tasks.request_revision' | translate) }}
                  </h2>
                  <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">Submit final quality assessment</p>
                </div>
                <button (click)="closeReviewModal()" class="p-4 rounded-[1.25rem] bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all hover:rotate-90">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
            <div class="p-10 space-y-8">
              <div *ngIf="reviewType === 'approve'" class="group">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 ml-4">{{ 'tasks.quality_rating' | translate }}</label>
                <div class="flex items-center gap-4 px-6 py-4 bg-slate-50/50 dark:bg-white/[0.01] rounded-[1.5rem] ring-1 ring-slate-200 dark:ring-white/5">
                  <button *ngFor="let i of [1,2,3,4,5]" (click)="reviewData.qualityRating = i"
                    class="text-4xl transition-all duration-300 hover:scale-125 hover:rotate-12"
                    [class.text-amber-400]="i <= reviewData.qualityRating"
                    [class.drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]]="i <= reviewData.qualityRating"
                    [class.text-slate-200]="i > reviewData.qualityRating"
                    [class.dark:text-slate-700]="i > reviewData.qualityRating">
                    ★
                  </button>
                </div>
              </div>
              <div *ngIf="reviewType === 'reject'" class="group relative">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4 group-focus-within:text-rose-500 transition-colors">{{ 'tasks.rejection_reason' | translate }}</label>
                <textarea [(ngModel)]="reviewData.rejectionReason" rows="4"
                  class="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all outline-none resize-none"></textarea>
              </div>
              <div *ngIf="reviewType === 'revision'" class="group relative">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4 group-focus-within:text-purple-500 transition-colors">{{ 'tasks.revision_instructions' | translate }}</label>
                <textarea [(ngModel)]="reviewData.revisionInstructions" rows="4"
                  class="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all outline-none resize-none"></textarea>
              </div>
              <div class="group relative">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4 group-focus-within:text-indigo-500 transition-colors">{{ 'tasks.comments' | translate }}</label>
                <textarea [(ngModel)]="reviewData.comments" rows="3"
                  class="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none resize-none"></textarea>
              </div>
            </div>
            <div class="p-10 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-end gap-4 bg-slate-50/30 dark:bg-white/[0.01]">
              <button (click)="closeReviewModal()" class="px-10 py-5 rounded-[2rem] bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm ring-1 ring-slate-200 dark:ring-white/5">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="submitReview()" 
                [class.from-emerald-500]="reviewType === 'approve'"
                [class.to-teal-600]="reviewType === 'approve'"
                [class.shadow-emerald-500/20]="reviewType === 'approve'"
                [class.from-rose-500]="reviewType === 'reject'"
                [class.to-pink-600]="reviewType === 'reject'"
                [class.shadow-rose-500/20]="reviewType === 'reject'"
                [class.from-purple-600]="reviewType === 'revision'"
                [class.to-indigo-700]="reviewType === 'revision'"
                [class.shadow-purple-500/20]="reviewType === 'revision'"
                class="group relative px-10 py-5 rounded-[2rem] bg-gradient-to-r text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
                <span class="relative z-10">{{ 'common.submit' | translate }}</span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  private taskService = inject(TaskManagementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  task: ProjectItemTask | null = null;
  attachments: ProjectItemTaskAttachment[] = [];
  history: ProjectItemTaskHistory[] = [];
  loading = true;
  progressValue = 0;

  showReviewModal = false;
  reviewType: 'approve' | 'reject' | 'revision' = 'approve';
  reviewData = {
    qualityRating: 3,
    rejectionReason: '',
    revisionInstructions: '',
    comments: ''
  };

  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  MediaType = MediaType;
  ReviewStatus = ReviewStatus;

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('id'));
    if (taskId) {
      this.loadTask(taskId);
    }
  }

  loadTask(id: number): void {
    this.loading = true;
    this.taskService.getTask(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.task = task;
          this.progressValue = task.progressPercentage;
          this.loadAttachments(id);
          this.loadHistory(id);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading task:', error);
          this.loading = false;
        }
      });
  }

  loadAttachments(taskId: number): void {
    this.taskService.getAttachments(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (attachments) => {
          this.attachments = attachments;
        },
        error: (error) => {
          console.error('Error loading attachments:', error);
        }
      });
  }

  loadHistory(taskId: number): void {
    this.taskService.getTaskHistory(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (history) => {
          this.history = history;
        },
        error: (error) => {
          console.error('Error loading history:', error);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  // Status checks
  canStart(): boolean {
    return this.task?.status === TaskStatus.Pending;
  }

  canSubmitForReview(): boolean {
    return this.task?.status === TaskStatus.InProgress;
  }

  canApprove(): boolean {
    return this.task?.status === TaskStatus.ReadyForReview;
  }

  canReject(): boolean {
    return this.task?.status === TaskStatus.ReadyForReview;
  }

  canRequestRevision(): boolean {
    return this.task?.status === TaskStatus.ReadyForReview;
  }

  canConfirmPreStart(): boolean {
    return this.task?.requiresPreStartConfirmation === true &&
      this.task?.preStartConfirmationStatus === 0; // Pending
  }

  // Actions
  startTask(): void {
    if (!this.task) return;
    this.taskService.startTask(this.task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.task = task;
          this.loadHistory(task.id);
        },
        error: (error) => {
          console.error('Error starting task:', error);
        }
      });
  }

  submitForReview(): void {
    if (!this.task) return;
    this.taskService.submitForReview(this.task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.task = task;
          this.loadHistory(task.id);
        },
        error: (error) => {
          console.error('Error submitting for review:', error);
        }
      });
  }

  updateProgress(): void {
    if (!this.task) return;
    this.taskService.updateTask(this.task.id, { progressPercentage: this.progressValue })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.task = task;
          this.loadHistory(task.id);
        },
        error: (error) => {
          console.error('Error updating progress:', error);
        }
      });
  }

  confirmPreStart(): void {
    if (!this.task) return;
    this.taskService.confirmPreStart(this.task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.task = task;
          this.loadHistory(task.id);
        },
        error: (error) => {
          console.error('Error confirming pre-start:', error);
        }
      });
  }

  // Review Modal
  openReviewModal(type: 'approve' | 'reject' | 'revision'): void {
    this.reviewType = type;
    this.reviewData = {
      qualityRating: 3,
      rejectionReason: '',
      revisionInstructions: '',
      comments: ''
    };
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  submitReview(): void {
    if (!this.task) return;

    let observable;
    switch (this.reviewType) {
      case 'approve':
        observable = this.taskService.approveTask(this.task.id, this.reviewData.comments, this.reviewData.qualityRating);
        break;
      case 'reject':
        observable = this.taskService.rejectTask(this.task.id, this.reviewData.rejectionReason);
        break;
      case 'revision':
        observable = this.taskService.requestRevision(this.task.id, this.reviewData.revisionInstructions);
        break;
      default:
        return;
    }

    observable.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.task = task;
          this.loadHistory(task.id);
          this.closeReviewModal();
        },
        error: (error) => {
          console.error('Error submitting review:', error);
        }
      });
  }

  openUploadModal(): void {
    // Implement file upload modal
  }

  // Helper methods
  getStatusLabel(status: TaskStatus): string {
    return this.taskService.getStatusLabel(status);
  }

  getStatusClass(status: TaskStatus): string {
    return this.taskService.getStatusColor(status);
  }

  getPriorityLabel(priority: TaskPriority): string {
    return this.taskService.getPriorityLabel(priority);
  }

  getPriorityClass(priority: TaskPriority): string {
    return this.taskService.getPriorityColor(priority);
  }

  getReviewStatusLabel(status: ReviewStatus): string {
    const labels = {
      [ReviewStatus.Pending]: 'Pending',
      [ReviewStatus.Approved]: 'Approved',
      [ReviewStatus.Rejected]: 'Rejected',
      [ReviewStatus.RevisionRequested]: 'Revision'
    };
    return labels[status] || 'Pending';
  }

  getReviewStatusClass(status: ReviewStatus): string {
    const classes = {
      [ReviewStatus.Pending]: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300',
      [ReviewStatus.Approved]: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',
      [ReviewStatus.Rejected]: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
      [ReviewStatus.RevisionRequested]: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300'
    };
    return classes[status] || classes[ReviewStatus.Pending];
  }

  getConfirmationStatusLabel(status: number): string {
    const labels = ['Pending', 'Confirmed', 'Partially Confirmed', 'Rejected', 'Forced Start'];
    return labels[status] || 'Pending';
  }

  getConfirmationStatusClass(status: number): string {
    const classes = [
      'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300',
      'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',
      'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300',
      'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
      'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300'
    ];
    return classes[status] || classes[0];
  }

  getActionLabel(action: number): string {
    const labels = ['Created', 'Updated', 'Status Changed', 'Assigned', 'Commented', 'Attachment Added'];
    return labels[action] || 'Updated';
  }

  getInitials(user: any): string {
    if (!user) return '?';
    const name = user.name || user.fullName || user.userName || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
