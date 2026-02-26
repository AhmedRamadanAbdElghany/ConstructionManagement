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
    <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 transition-colors duration-500 font-['Outfit']">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-premium-fade">
          <div class="space-y-2">
            <h1 class="text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
              {{ 'tasks.board_title' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-lg italic opacity-75">
              {{ 'tasks.board_subtitle' | translate }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button (click)="openCreateTaskModal()" 
              class="group relative px-10 py-5 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden flex items-center gap-3">
              <span class="relative z-10 font-black uppercase tracking-[0.2em] text-xs">{{ 'tasks.new_task' | translate }}</span>
              <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div class="group bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade hover:-translate-y-2 transition-all duration-500" style="animation-delay: 100ms">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{{ 'tasks.total_tasks' | translate }}</p>
                <p class="text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{{ stats.total }}</p>
              </div>
              <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-slate-500/10 to-slate-600/10 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ring-1 ring-slate-500/20">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="group bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade hover:-translate-y-2 transition-all duration-500" style="animation-delay: 200ms">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{{ 'tasks.in_progress' | translate }}</p>
                <p class="text-4xl font-black text-blue-600 dark:text-blue-400 mt-1 tracking-tight">{{ stats.inProgress }}</p>
              </div>
              <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ring-1 ring-blue-500/20">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="group bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade hover:-translate-y-2 transition-all duration-500" style="animation-delay: 300ms">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{{ 'tasks.ready_for_review' | translate }}</p>
                <p class="text-4xl font-black text-amber-600 dark:text-amber-400 mt-1 tracking-tight">{{ stats.readyForReview }}</p>
              </div>
              <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ring-1 ring-amber-500/20">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="group bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade hover:-translate-y-2 transition-all duration-500" style="animation-delay: 400ms">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] opacity-60">{{ 'tasks.overdue' | translate }}</p>
                <p class="text-4xl font-black text-rose-600 mt-1 tracking-tight">{{ stats.overdue }}</p>
              </div>
              <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-rose-500/10 to-pink-600/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ring-1 ring-rose-500/20 animate-premium-pulse">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 animate-premium-fade" style="animation-delay: 500ms">
          <div class="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none w-fit">
            <button (click)="filterStatus = null; applyFilters()" 
              [class.bg-gradient-to-r]="filterStatus === null"
              [class.from-indigo-600]="filterStatus === null"
              [class.to-blue-700]="filterStatus === null"
              [class.text-white]="filterStatus === null"
              [class.shadow-xl]="filterStatus === null"
              [class.shadow-indigo-500/30]="filterStatus === null"
              class="px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 text-slate-400 hover:text-indigo-600 active:scale-95">
              {{ 'tasks.all' | translate }}
            </button>
            <button *ngFor="let status of statusOptions" (click)="filterStatus = status.value; applyFilters()"
              [class.bg-gradient-to-r]="filterStatus === status.value"
              [class.from-indigo-600]="filterStatus === status.value"
              [class.to-blue-700]="filterStatus === status.value"
              [class.text-white]="filterStatus === status.value"
              [class.shadow-xl]="filterStatus === status.value"
              [class.shadow-indigo-500/30]="filterStatus === status.value"
              class="px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 text-slate-400 hover:text-indigo-600 active:scale-95">
              {{ status.label }}
            </button>
          </div>

          <div class="relative group w-full md:w-auto">
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()"
              [placeholder]="'tasks.search_placeholder' | translate"
              class="w-full md:w-80 px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl shadow-slate-200/40 dark:shadow-none outline-none">
            <div class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div class="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-premium-fade" style="animation-delay: 600ms">
          <!-- Pending Column -->
          <div class="bg-slate-50/50 dark:bg-white/[0.02] rounded-[3rem] p-6 border border-slate-200/60 dark:border-white/5 shadow-inner">
            <div class="flex items-center justify-between mb-8 px-4">
              <div class="flex items-center space-x-3">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.5)]"></div>
                <h3 class="font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-[0.2em]">{{ 'tasks.pending' | translate }}</h3>
              </div>
              <span class="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-slate-200 dark:ring-white/5">{{ getTasksByStatus(TaskStatus.Pending).length }}</span>
            </div>
            <div class="space-y-6">
              <div *ngFor="let task of getTasksByStatus(TaskStatus.Pending); let i = index" 
                (click)="viewTask(task)"
                class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200/60 dark:border-white/5 hover:-translate-y-2 group animate-premium-fade"
                [style.animation-delay]="(i * 50 + 700) + 'ms'">
                <div class="flex items-start justify-between mb-6">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{{ task.taskNumber }}</span>
                  <span [class]="getPriorityClass(task.priority)" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ring-current">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <h4 class="font-black text-slate-900 dark:text-white text-lg mb-2 line-clamp-2 leading-none tracking-tight group-hover:text-indigo-600 transition-colors">{{ task.title }}</h4>
                <p *ngIf="task.description" class="text-slate-500 dark:text-slate-400 text-[11px] mb-6 line-clamp-2 font-medium italic opacity-75">{{ task.description }}</p>
                <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <div *ngIf="task.dueDate" class="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ task.dueDate | date:'shortDate' }}
                  </div>
                  <div *ngIf="task.assignedToUser" class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-xl shadow-indigo-500/20 ring-2 ring-white dark:ring-slate-900">
                    {{ getInitials(task.assignedToUser) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="bg-indigo-50/30 dark:bg-indigo-500/[0.02] rounded-[3rem] p-6 border border-indigo-100/50 dark:border-indigo-500/10 shadow-inner">
            <div class="flex items-center justify-between mb-8 px-4">
              <div class="flex items-center space-x-3">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-premium-pulse"></div>
                <h3 class="font-black text-indigo-700 dark:text-indigo-300 text-xs uppercase tracking-[0.2em]">{{ 'tasks.in_progress' | translate }}</h3>
              </div>
              <span class="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-500/20">{{ getTasksByStatus(TaskStatus.InProgress).length }}</span>
            </div>
            <div class="space-y-6">
              <div *ngFor="let task of getTasksByStatus(TaskStatus.InProgress); let i = index" 
                (click)="viewTask(task)"
                class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-indigo-200/60 dark:border-indigo-500/10 hover:-translate-y-2 group animate-premium-fade"
                [style.animation-delay]="(i * 50 + 750) + 'ms'">
                <div class="flex items-start justify-between mb-6">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{{ task.taskNumber }}</span>
                  <span [class]="getPriorityClass(task.priority)" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ring-current">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <h4 class="font-black text-slate-900 dark:text-white text-lg mb-2 line-clamp-2 leading-none tracking-tight group-hover:text-blue-600 transition-colors">{{ task.title }}</h4>
                <p *ngIf="task.description" class="text-slate-500 dark:text-slate-400 text-[11px] mb-6 line-clamp-2 font-medium italic opacity-75">{{ task.description }}</p>
                
                <div class="mb-8">
                  <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                    <span class="opacity-60">{{ 'tasks.progress' | translate }}</span>
                    <span class="text-blue-600">{{ task.progressPercentage }}%</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-200 dark:ring-white/5">
                    <div class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full transition-all duration-1000 animate-premium-shimmer" [style.width.%]="task.progressPercentage"></div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <div *ngIf="task.dueDate" class="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ task.dueDate | date:'shortDate' }}
                  </div>
                  <div *ngIf="task.assignedToUser" class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-xl shadow-blue-500/20 ring-2 ring-white dark:ring-slate-900">
                    {{ getInitials(task.assignedToUser) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ready for Review Column -->
          <div class="bg-amber-50/30 dark:bg-amber-500/[0.02] rounded-[3rem] p-6 border border-amber-100/50 dark:border-amber-500/10 shadow-inner">
            <div class="flex items-center justify-between mb-8 px-4">
              <div class="flex items-center space-x-3">
                <div class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
                <h3 class="font-black text-amber-700 dark:text-amber-300 text-xs uppercase tracking-[0.2em]">{{ 'tasks.ready_for_review' | translate }}</h3>
              </div>
              <span class="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-amber-200 dark:ring-amber-500/20">{{ getTasksByStatus(TaskStatus.ReadyForReview).length }}</span>
            </div>
            <div class="space-y-6">
              <div *ngFor="let task of getTasksByStatus(TaskStatus.ReadyForReview); let i = index" 
                (click)="viewTask(task)"
                class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-amber-200/60 dark:border-amber-500/10 hover:-translate-y-2 group animate-premium-fade"
                [style.animation-delay]="(i * 50 + 800) + 'ms'">
                <div class="flex items-start justify-between mb-6">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{{ task.taskNumber }}</span>
                  <span [class]="getPriorityClass(task.priority)" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ring-current">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <h4 class="font-black text-slate-900 dark:text-white text-lg mb-2 line-clamp-2 leading-none tracking-tight group-hover:text-amber-600 transition-colors">{{ task.title }}</h4>
                <p *ngIf="task.description" class="text-slate-500 dark:text-slate-400 text-[11px] mb-6 line-clamp-2 font-medium italic opacity-75">{{ task.description }}</p>
                <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <div *ngIf="task.dueDate" class="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ task.dueDate | date:'shortDate' }}
                  </div>
                  <div *ngIf="task.assignedToUser" class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-black shadow-xl shadow-amber-500/20 ring-2 ring-white dark:ring-slate-900">
                    {{ getInitials(task.assignedToUser) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Approved Column -->
          <div class="bg-emerald-50/30 dark:bg-emerald-500/[0.02] rounded-[3rem] p-6 border border-emerald-100/50 dark:border-emerald-500/10 shadow-inner">
            <div class="flex items-center justify-between mb-8 px-4">
              <div class="flex items-center space-x-3">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                <h3 class="font-black text-emerald-700 dark:text-emerald-300 text-xs uppercase tracking-[0.2em]">{{ 'tasks.approved' | translate }}</h3>
              </div>
              <span class="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-500/20">{{ getTasksByStatus(TaskStatus.Approved).length }}</span>
            </div>
            <div class="space-y-6">
              <div *ngFor="let task of getTasksByStatus(TaskStatus.Approved); let i = index" 
                (click)="viewTask(task)"
                class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-emerald-200/60 dark:border-emerald-500/10 hover:-translate-y-2 group animate-premium-fade"
                [style.animation-delay]="(i * 50 + 850) + 'ms'">
                <div class="flex items-start justify-between mb-6">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">{{ task.taskNumber }}</span>
                  <span class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400">
                    {{ 'tasks.completed' | translate }}
                  </span>
                </div>
                <h4 class="font-black text-slate-900 dark:text-white text-lg mb-2 line-clamp-2 leading-none tracking-tight group-hover:text-emerald-600 transition-colors">{{ task.title }}</h4>
                <p *ngIf="task.description" class="text-slate-500 dark:text-slate-400 text-[11px] mb-6 line-clamp-2 font-medium italic opacity-75">{{ task.description }}</p>
                <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <div *ngIf="task.actualEndDate" class="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {{ task.actualEndDate | date:'shortDate' }}
                  </div>
                  <div *ngIf="task.assignedToUser" class="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-black shadow-xl shadow-emerald-500/20 ring-2 ring-white dark:ring-slate-900">
                    {{ getInitials(task.assignedToUser) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Task Modal -->
        <div *ngIf="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-premium-fade">
          <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200/60 dark:border-white/5 transform transition-all">
            <div class="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">{{ 'tasks.create_task' | translate }}</h2>
                  <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">Initialize new project item workflow</p>
                </div>
                <button (click)="closeCreateModal()" class="p-4 rounded-[1.25rem] bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all hover:rotate-90">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="p-10 space-y-8">
              <div class="group relative">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4 transition-colors group-focus-within:text-indigo-500">{{ 'tasks.title' | translate }} *</label>
                <input type="text" [(ngModel)]="newTask.title" 
                  class="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none">
              </div>
              <div class="group relative">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4 transition-colors group-focus-within:text-indigo-500">{{ 'tasks.description' | translate }}</label>
                <textarea [(ngModel)]="newTask.description" rows="4"
                  class="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none resize-none"></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="group relative">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4 transition-colors group-focus-within:text-indigo-500">{{ 'tasks.priority' | translate }}</label>
                  <div class="relative">
                    <select [(ngModel)]="newTask.priority" 
                      class="appearance-none w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none cursor-pointer pr-16">
                      <option [ngValue]="0">{{ 'tasks.low' | translate }}</option>
                      <option [ngValue]="1">{{ 'tasks.normal' | translate }}</option>
                      <option [ngValue]="2">{{ 'tasks.high' | translate }}</option>
                      <option [ngValue]="3">{{ 'tasks.critical' | translate }}</option>
                    </select>
                    <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-500">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div class="group relative">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4 transition-colors group-focus-within:text-indigo-500">{{ 'tasks.due_date' | translate }}</label>
                  <input type="date" [(ngModel)]="newTask.dueDate" 
                    class="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none">
                </div>
              </div>
            </div>
            <div class="p-10 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-end gap-4 bg-slate-50/30 dark:bg-white/[0.01]">
              <button (click)="closeCreateModal()" class="px-10 py-5 rounded-[2rem] bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm ring-1 ring-slate-200 dark:ring-white/5 active:scale-95">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="createTask()" [disabled]="!newTask.title"
                class="group relative px-10 py-5 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="relative z-10">{{ 'tasks.create' | translate }}</span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
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
