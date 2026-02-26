import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TaskManagementService,
  ProjectItemTask,
  TaskStatus,
  TaskPriority
} from '../../../core/services/task-management.service';
import { DailyBoardService, DailyBoardSummary } from '../../../core/services/daily-board.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8 animate-premium-fade">
          <div>
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase drop-shadow-sm">
              {{ 'tasks.board_title' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight italic opacity-80">
              {{ 'tasks.board_subtitle' | translate }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button (click)="openCreateTaskModal()" 
              class="px-6 py-3 rounded-[1.5rem] bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(6,182,212,0.4)] hover:scale-[1.05] hover:shadow-[0_20px_40px_-5px_rgba(6,182,212,0.5)] active:scale-95 transition-all flex items-center group">
              <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mr-3 group-hover:rotate-90 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              {{ 'tasks.new_task' | translate }}
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-premium-fade" style="animation-delay: 100ms">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">{{ 'tasks.total_tasks' | translate }}</p>
                <p class="text-3xl font-black text-slate-900 dark:text-white mt-1">{{ stats.total }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-premium-fade" style="animation-delay: 200ms">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">{{ 'tasks.in_progress' | translate }}</p>
                <p class="text-3xl font-black text-blue-600 mt-1">{{ stats.inProgress }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-premium-fade" style="animation-delay: 300ms">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">{{ 'tasks.ready_for_review' | translate }}</p>
                <p class="text-3xl font-black text-amber-600 mt-1">{{ stats.readyForReview }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-premium-fade" style="animation-delay: 400ms">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">{{ 'tasks.overdue' | translate }}</p>
                <p class="text-3xl font-black text-rose-600 mt-1">{{ stats.overdue }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div class="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-2 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <button (click)="filterStatus = null" 
              [class.bg-gradient-to-r]="filterStatus === null"
              [class.from-cyan-600]="filterStatus === null"
              [class.to-indigo-700]="filterStatus === null"
              [class.text-white]="filterStatus === null"
              [class.text-slate-400]="filterStatus !== null"
              class="px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all">
              {{ 'tasks.all' | translate }}
            </button>
            <button *ngFor="let status of statusOptions" (click)="filterStatus = status.value"
              [class.bg-gradient-to-r]="filterStatus === status.value"
              [class.from-cyan-600]="filterStatus === status.value"
              [class.to-indigo-700]="filterStatus === status.value"
              [class.text-white]="filterStatus === status.value"
              [class.text-slate-400]="filterStatus !== status.value"
              class="px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all">
              {{ status.label }}
            </button>
          </div>

          <div class="flex items-center space-x-3">
            <div class="relative">
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()"
                [placeholder]="'tasks.search_placeholder' | translate"
                class="w-64 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all">
              <svg class="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Pending Column -->
          <div class="bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                <h3 class="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">{{ 'tasks.pending' | translate }}</h3>
              </div>
              <span class="px-2 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs font-bold">{{ getTasksByStatus(TaskStatus.Pending).length }}</span>
            </div>
            <div class="space-y-3">
              <div *ngFor="let task of getTasksByStatus(TaskStatus.Pending); let i = $index" 
                (click)="viewTask(task)"
                class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 group animate-premium-fade"
                [style.animation-delay]="(i * 50 + 400) + 'ms'">
                <div class="flex items-start justify-between mb-4">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ task.taskNumber }}</span>
                  <span [class]="getPriorityClass(task.priority)" class="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <h4 class="font-black text-slate-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ task.title }}</h4>
                <p *ngIf="task.description" class="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2 italic opacity-80">{{ task.description }}</p>
                <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div *ngIf="task.dueDate" class="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <svg class="w-3.5 h-3.5 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ task.dueDate | date:'shortDate' }}
                  </div>
                  <div *ngIf="task.assignedToUser" class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-indigo-500/20">
                    {{ getInitials(task.assignedToUser) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 class="font-bold text-blue-700 dark:text-blue-300 text-sm uppercase tracking-wider">{{ 'tasks.in_progress' | translate }}</h3>
              </div>
              <span class="px-2 py-1 rounded-lg bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs font-bold">{{ getTasksByStatus(TaskStatus.InProgress).length }}</span>
            </div>
            <div class="space-y-3">
              <div *ngFor="let task of getTasksByStatus(TaskStatus.InProgress); let i = $index" 
                (click)="viewTask(task)"
                class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-blue-200 dark:border-blue-500/20 hover:border-blue-500/50 group animate-premium-fade"
                [style.animation-delay]="(i * 50 + 450) + 'ms'">
                <div class="flex items-start justify-between mb-4">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ task.taskNumber }}</span>
                  <span [class]="getPriorityClass(task.priority)" class="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <h4 class="font-black text-slate-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ task.title }}</h4>
                <p *ngIf="task.description" class="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2 italic opacity-80">{{ task.description }}</p>
                <div class="mb-5">
                  <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>{{ 'tasks.progress' | translate }}</span>
                    <span class="text-blue-600">{{ task.progressPercentage }}%</span>
                  </div>
                  <div class="w-full h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000" [style.width.%]="task.progressPercentage"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div *ngIf="task.dueDate" class="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <svg class="w-3.5 h-3.5 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ task.dueDate | date:'shortDate' }}
                  </div>
                  <div *ngIf="task.assignedToUser" class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-blue-500/20">
                    {{ getInitials(task.assignedToUser) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ready for Review Column -->
          <div class="bg-yellow-50 dark:bg-yellow-900/10 rounded-3xl p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <h3 class="font-bold text-yellow-700 dark:text-yellow-300 text-sm uppercase tracking-wider">{{ 'tasks.ready_for_review' | translate }}</h3>
              </div>
              <span class="px-2 py-1 rounded-lg bg-yellow-200 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 text-xs font-bold">{{ getTasksByStatus(TaskStatus.ReadyForReview).length }}</span>
            </div>
            <div class="space-y-3">
              <div *ngFor="let task of getTasksByStatus(TaskStatus.ReadyForReview); let i = $index" 
                (click)="viewTask(task)"
                class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-yellow-200 dark:border-yellow-500/20 hover:border-yellow-500/50 group animate-premium-fade"
                [style.animation-delay]="(i * 50 + 500) + 'ms'">
                <div class="flex items-start justify-between mb-4">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ task.taskNumber }}</span>
                  <span [class]="getPriorityClass(task.priority)" class="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <h4 class="font-black text-slate-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{{ task.title }}</h4>
                <p *ngIf="task.description" class="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2 italic opacity-80">{{ task.description }}</p>
                <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div *ngIf="task.dueDate" class="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <svg class="w-3.5 h-3.5 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ task.dueDate | date:'shortDate' }}
                  </div>
                  <div *ngIf="task.assignedToUser" class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-amber-500/20">
                    {{ getInitials(task.assignedToUser) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Approved Column -->
          <div class="bg-green-50 dark:bg-green-900/10 rounded-3xl p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 class="font-bold text-green-700 dark:text-green-300 text-sm uppercase tracking-wider">{{ 'tasks.approved' | translate }}</h3>
              </div>
              <span class="px-2 py-1 rounded-lg bg-green-200 dark:bg-green-800 text-green-600 dark:text-green-300 text-xs font-bold">{{ getTasksByStatus(TaskStatus.Approved).length }}</span>
            </div>
            <div class="space-y-3">
              <div *ngFor="let task of getTasksByStatus(TaskStatus.Approved); let i = $index" 
                (click)="viewTask(task)"
                class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-500/50 group animate-premium-fade"
                [style.animation-delay]="(i * 50 + 550) + 'ms'">
                <div class="flex items-start justify-between mb-4">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ task.taskNumber }}</span>
                  <span class="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                    {{ 'tasks.completed' | translate }}
                  </span>
                </div>
                <h4 class="font-black text-slate-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ task.title }}</h4>
                <p *ngIf="task.description" class="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2 italic opacity-80">{{ task.description }}</p>
                <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div *ngIf="task.actualEndDate" class="flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {{ task.actualEndDate | date:'shortDate' }}
                  </div>
                  <div *ngIf="task.assignedToUser" class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-emerald-500/20">
                    {{ getInitials(task.assignedToUser) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Task Modal -->
        <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200 dark:border-white/5">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ 'tasks.create_task' | translate }}</h2>
                <button (click)="closeCreateModal()" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'tasks.title' | translate }} *</label>
                <input type="text" [(ngModel)]="newTask.title" 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'tasks.description' | translate }}</label>
                <textarea [(ngModel)]="newTask.description" rows="3"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'tasks.priority' | translate }}</label>
                  <select [(ngModel)]="newTask.priority" 
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                    <option [ngValue]="0">{{ 'tasks.low' | translate }}</option>
                    <option [ngValue]="1">{{ 'tasks.normal' | translate }}</option>
                    <option [ngValue]="2">{{ 'tasks.high' | translate }}</option>
                    <option [ngValue]="3">{{ 'tasks.critical' | translate }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'tasks.due_date' | translate }}</label>
                  <input type="date" [(ngModel)]="newTask.dueDate" 
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                </div>
              </div>
            </div>
            <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end space-x-3">
              <button (click)="closeCreateModal()" class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="createTask()" [disabled]="!newTask.title"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {{ 'tasks.create' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskBoardComponent implements OnInit {
  private taskService = inject(TaskManagementService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private i18nService = inject(I18nService);

  tasks: ProjectItemTask[] = [];
  filteredTasks: ProjectItemTask[] = [];
  searchTerm = '';
  filterStatus: TaskStatus | null = null;
  showCreateModal = false;

  stats = {
    total: 0,
    inProgress: 0,
    readyForReview: 0,
    overdue: 0
  };

  newTask = {
    title: '',
    description: '',
    priority: TaskPriority.Normal,
    dueDate: ''
  };

  statusOptions = [
    { value: TaskStatus.Pending, label: 'Pending' },
    { value: TaskStatus.InProgress, label: 'In Progress' },
    { value: TaskStatus.ReadyForReview, label: 'Review' },
    { value: TaskStatus.Approved, label: 'Approved' }
  ];

  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getMyTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.applyFilters();
          this.calculateStats();
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.tasks];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(term) ||
        t.taskNumber.toLowerCase().includes(term) ||
        (t.description?.toLowerCase().includes(term) ?? false)
      );
    }

    if (this.filterStatus !== null) {
      filtered = filtered.filter(t => t.status === this.filterStatus);
    }

    this.filteredTasks = filtered;
  }

  calculateStats(): void {
    this.stats.total = this.tasks.length;
    this.stats.inProgress = this.tasks.filter(t => t.status === TaskStatus.InProgress).length;
    this.stats.readyForReview = this.tasks.filter(t => t.status === TaskStatus.ReadyForReview).length;
    this.stats.overdue = this.tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Approved;
    }).length;
  }

  getTasksByStatus(status: TaskStatus): ProjectItemTask[] {
    return this.filteredTasks.filter(t => t.status === status);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getPriorityLabel(priority: TaskPriority): string {
    return this.taskService.getPriorityLabel(priority);
  }

  getPriorityClass(priority: TaskPriority): string {
    const classes = {
      [TaskPriority.Low]: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
      [TaskPriority.Normal]: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
      [TaskPriority.High]: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
      [TaskPriority.Critical]: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400'
    };
    return classes[priority] || classes[TaskPriority.Normal];
  }

  getInitials(user: any): string {
    if (!user) return '?';
    const name = user.name || user.fullName || user.userName || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  viewTask(task: ProjectItemTask): void {
    this.router.navigate(['/tasks', task.id]);
  }

  openCreateTaskModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newTask = {
      title: '',
      description: '',
      priority: TaskPriority.Normal,
      dueDate: ''
    };
  }

  createTask(): void {
    // This would need project context - for now just close modal
    // In real implementation, you'd need to select a project
    this.closeCreateModal();
  }
}
