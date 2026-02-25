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

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div class="max-w-7xl mx-auto p-6">
        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center h-64">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Task Content -->
        <div *ngIf="!loading && task">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <button (click)="goBack()" class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <div class="flex items-center space-x-3">
                  <span class="text-sm font-bold text-slate-500 dark:text-slate-400">{{ task.taskNumber }}</span>
                  <span [class]="getStatusClass(task.status)" class="px-3 py-1 rounded-lg text-xs font-bold uppercase">
                    {{ getStatusLabel(task.status) }}
                  </span>
                  <span [class]="getPriorityClass(task.priority)" class="px-3 py-1 rounded-lg text-xs font-bold uppercase">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <h1 class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ task.title }}</h1>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button *ngIf="canStart()" (click)="startTask()" 
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                {{ 'tasks.start' | translate }}
              </button>
              <button *ngIf="canSubmitForReview()" (click)="submitForReview()" 
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                {{ 'tasks.submit_review' | translate }}
              </button>
              <button *ngIf="canApprove()" (click)="openReviewModal('approve')" 
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                {{ 'tasks.approve' | translate }}
              </button>
              <button *ngIf="canReject()" (click)="openReviewModal('reject')" 
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                {{ 'tasks.reject' | translate }}
              </button>
              <button *ngIf="canRequestRevision()" (click)="openReviewModal('revision')" 
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                {{ 'tasks.request_revision' | translate }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Description -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ 'tasks.description' | translate }}</h2>
                <p *ngIf="task.description" class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{{ task.description }}</p>
                <p *ngIf="!task.description" class="text-slate-400 dark:text-slate-500 text-sm italic">{{ 'tasks.no_description' | translate }}</p>
              </div>

              <!-- Attachments -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ 'tasks.attachments' | translate }}</h2>
                  <button (click)="openUploadModal()" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>{{ 'tasks.add_attachment' | translate }}</span>
                  </button>
                </div>
                <div *ngIf="attachments.length === 0" class="text-center py-8">
                  <svg class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p class="text-slate-400 dark:text-slate-500 text-sm">{{ 'tasks.no_attachments' | translate }}</p>
                </div>
                <div *ngIf="attachments.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div *ngFor="let attachment of attachments" 
                    class="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 hover:border-cyan-500/50 transition-colors">
                    <!-- Image Preview -->
                    <div *ngIf="attachment.mediaType === MediaType.Photo" class="aspect-square bg-slate-100 dark:bg-slate-800">
                      <img [src]="attachment.filePath" [alt]="attachment.caption || attachment.fileName" class="w-full h-full object-cover">
                    </div>
                    <!-- Video Preview -->
                    <div *ngIf="attachment.mediaType === MediaType.Video" class="aspect-square bg-slate-800 flex items-center justify-center">
                      <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <!-- Document Preview -->
                    <div *ngIf="attachment.mediaType === MediaType.Document" class="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <!-- Review Status Badge -->
                    <div class="absolute top-2 right-2">
                      <span [class]="getReviewStatusClass(attachment.reviewStatus)" class="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                        {{ getReviewStatusLabel(attachment.reviewStatus) }}
                      </span>
                    </div>
                    <!-- Caption -->
                    <div class="p-3 bg-white dark:bg-slate-800">
                      <p class="text-xs font-medium text-slate-900 dark:text-white truncate">{{ attachment.caption || attachment.fileName }}</p>
                      <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{{ attachment.uploadedAt | date:'short' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Activity History -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ 'tasks.activity_history' | translate }}</h2>
                <div *ngIf="history.length === 0" class="text-center py-8">
                  <p class="text-slate-400 dark:text-slate-500 text-sm">{{ 'tasks.no_history' | translate }}</p>
                </div>
                <div *ngIf="history.length > 0" class="space-y-4">
                  <div *ngFor="let item of history" class="flex items-start space-x-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {{ getInitials(item.changedByUser) }}
                    </div>
                    <div class="flex-1">
                      <p class="text-sm text-slate-900 dark:text-white">
                        <span class="font-bold">{{ item.changedByUser?.name || 'Unknown' }}</span>
                        <span class="text-slate-500 dark:text-slate-400 ml-1">{{ item.notes || getActionLabel(item.action) }}</span>
                      </p>
                      <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ item.changedAt | date:'medium' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <!-- Task Details -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ 'tasks.details' | translate }}</h2>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'tasks.status' | translate }}</span>
                    <span [class]="getStatusClass(task.status)" class="px-3 py-1 rounded-lg text-xs font-bold">
                      {{ getStatusLabel(task.status) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'tasks.priority' | translate }}</span>
                    <span [class]="getPriorityClass(task.priority)" class="px-3 py-1 rounded-lg text-xs font-bold">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'tasks.progress' | translate }}</span>
                    <span class="text-sm font-bold text-slate-900 dark:text-white">{{ task.progressPercentage }}%</span>
                  </div>
                  <div *ngIf="task.dueDate" class="flex items-center justify-between">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'tasks.due_date' | translate }}</span>
                    <span class="text-sm font-bold text-slate-900 dark:text-white">{{ task.dueDate | date:'shortDate' }}</span>
                  </div>
                  <div *ngIf="task.assignedToUser" class="flex items-center justify-between">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'tasks.assigned_to' | translate }}</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {{ getInitials(task.assignedToUser) }}
                      </div>
                      <span class="text-sm font-bold text-slate-900 dark:text-white">{{ task.assignedToUser?.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Progress Update -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ 'tasks.update_progress' | translate }}</h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm text-slate-500 dark:text-slate-400 mb-2">{{ 'tasks.progress_percentage' | translate }}</label>
                    <input type="range" [(ngModel)]="progressValue" min="0" max="100" 
                      class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer">
                    <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>0%</span>
                      <span class="font-bold text-cyan-600">{{ progressValue }}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <button (click)="updateProgress()" 
                    class="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                    {{ 'tasks.save_progress' | translate }}
                  </button>
                </div>
              </div>

              <!-- Pre-Start Confirmation -->
              <div *ngIf="task.requiresPreStartConfirmation" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ 'tasks.pre_start_confirmation' | translate }}</h2>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'tasks.confirmation_status' | translate }}</span>
                    <span [class]="getConfirmationStatusClass(task.preStartConfirmationStatus)" class="px-3 py-1 rounded-lg text-xs font-bold">
                      {{ getConfirmationStatusLabel(task.preStartConfirmationStatus) }}
                    </span>
                  </div>
                  <button *ngIf="canConfirmPreStart()" (click)="confirmPreStart()" 
                    class="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                    {{ 'tasks.confirm_ready' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Modal -->
        <div *ngIf="showReviewModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md">
            <div class="p-6 border-b border-slate-200 dark:border-white/5">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">
                {{ reviewType === 'approve' ? ('tasks.approve_task' | translate) : 
                   reviewType === 'reject' ? ('tasks.reject_task' | translate) : 
                   ('tasks.request_revision' | translate) }}
              </h2>
            </div>
            <div class="p-6 space-y-4">
              <div *ngIf="reviewType === 'approve'">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'tasks.quality_rating' | translate }}</label>
                <div class="flex items-center space-x-2">
                  <button *ngFor="let i of [1,2,3,4,5]" (click)="reviewData.qualityRating = i"
                    [class.text-yellow-400]="i <= reviewData.qualityRating"
                    [class.text-slate-300]="i > reviewData.qualityRating"
                    class="text-2xl transition-colors">
                    ★
                  </button>
                </div>
              </div>
              <div *ngIf="reviewType === 'reject'">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'tasks.rejection_reason' | translate }}</label>
                <textarea [(ngModel)]="reviewData.rejectionReason" rows="3"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"></textarea>
              </div>
              <div *ngIf="reviewType === 'revision'">
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'tasks.revision_instructions' | translate }}</label>
                <textarea [(ngModel)]="reviewData.revisionInstructions" rows="3"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"></textarea>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'tasks.comments' | translate }}</label>
                <textarea [(ngModel)]="reviewData.comments" rows="2"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"></textarea>
              </div>
            </div>
            <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end space-x-3">
              <button (click)="closeReviewModal()" class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="submitReview()" 
                [class.bg-gradient-to-r]="true"
                [class.from-green-600]="reviewType === 'approve'"
                [class.to-emerald-600]="reviewType === 'approve'"
                [class.from-red-600]="reviewType === 'reject'"
                [class.to-rose-600]="reviewType === 'reject'"
                [class.from-orange-600]="reviewType === 'revision'"
                [class.to-amber-600]="reviewType === 'revision'"
                class="px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity">
                {{ 'common.submit' | translate }}
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
