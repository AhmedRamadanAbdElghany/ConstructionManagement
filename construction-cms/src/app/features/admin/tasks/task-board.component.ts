import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TaskManagementService,
  ProjectItemTask,
  TaskStatus,
  TaskPriority
} from '../../../core/services/task-management.service';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-500 pb-20">
      <div class="max-w-7xl mx-auto animate-premium-fade">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div class="header-left">
            <h1 class="premium-heading mb-4">{{ 'tasks.board_title' | translate }}</h1>
            <p class="premium-subheading mb-0">{{ 'tasks.board_subtitle' | translate }}</p>
          </div>
          <button (click)="openCreateTaskModal()" 
            class="premium-button-primary !px-8 !py-4 shadow-xl shadow-indigo-500/20 flex items-center gap-3">
             <span class="text-xl leading-none">+</span>
            {{ 'tasks.new_task' | translate }}
          </button>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          @for (stat of [
            {label: 'tasks.total_tasks', value: stats.total, icon: '📋', color: 'slate'},
            {label: 'tasks.in_progress', value: stats.inProgress, icon: '⚡', color: 'blue'},
            {label: 'tasks.ready_for_review', value: stats.readyForReview, icon: '🔎', color: 'amber'},
            {label: 'tasks.overdue', value: stats.overdue, icon: '🚨', color: 'rose'}
          ]; track stat.label; let i = $index) {
            <div class="premium-card-stack group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative cursor-default" [style.animation-delay]="(i * 100) + 'ms'">
               <div class="flex items-center gap-6">
                <div class="w-14 h-14 rounded-2xl bg-{{stat.color}}-500/10 text-{{stat.color}}-600 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {{ stat.icon }}
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{{ stat.label | translate }}</p>
                  <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ stat.value }}</h3>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Filters Hub -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div class="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900/50 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 w-fit overflow-x-auto no-scrollbar">
            <button (click)="filterStatus = null; applyFilters()" 
                    [class]="filterStatus === null ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-lg shadow-slate-900/20 dark:shadow-white/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap">
                {{ 'tasks.all' | translate }}
            </button>
            @for (status of statusOptions; track status.value) {
              <button (click)="filterStatus = status.value; applyFilters()" 
                      [class]="filterStatus === status.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                      class="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap">
                  {{ status.label }}
              </button>
            }
          </div>

          <div class="relative group w-full md:w-80">
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()"
              [placeholder]="'tasks.search_placeholder' | translate"
              class="premium-input !pl-14">
            <div class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Pending Column -->
          <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between px-6 mb-2">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <h3 class="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">{{ 'tasks.pending' | translate }}</h3>
              </div>
              <span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">{{ getTasksByStatus(TaskStatus.Pending).length }}</span>
            </div>
            
            <div class="space-y-6">
              @for (task of getTasksByStatus(TaskStatus.Pending); track task.id; let i = $index) {
                <div (click)="viewTask(task)" 
                     class="premium-card-stack !p-6 group hover:scale-[1.02] cursor-pointer transition-all duration-500 animate-premium-fade"
                     [style.animation-delay]="(i * 50) + 'ms'">
                  <div class="flex items-start justify-between mb-4">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">#{{ task.taskNumber }}</span>
                    <span [class]="getPriorityClass(task.priority)" class="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ring-current">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>
                  <h4 class="font-black text-slate-900 dark:text-white text-sm mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{{ task.title }}</h4>
                  <p class="text-[10px] font-medium text-slate-500 line-clamp-2 italic mb-6">{{ task.description || 'No description' }}</p>
                  
                  <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       ⏳ {{ task.dueDate | date:'shortDate' }}
                    </div>
                    @if (task.assignedToUser) {
                      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-[9px] font-black">
                        {{ getInitials(task.assignedToUser) }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between px-6 mb-2">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                <h3 class="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">{{ 'tasks.in_progress' | translate }}</h3>
              </div>
              <span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">{{ getTasksByStatus(TaskStatus.InProgress).length }}</span>
            </div>

            <div class="space-y-6">
              @for (task of getTasksByStatus(TaskStatus.InProgress); track task.id; let i = $index) {
                 <div (click)="viewTask(task)" 
                     class="premium-card-stack !p-6 group hover:scale-[1.02] cursor-pointer transition-all duration-500 border-l-4 border-l-blue-500 animate-premium-fade"
                     [style.animation-delay]="(i * 50) + 'ms'">
                  <div class="flex items-start justify-between mb-4">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">#{{ task.taskNumber }}</span>
                    <span class="text-blue-600 dark:text-blue-400 text-[10px] font-black">{{ task.progressPercentage }}%</span>
                  </div>
                  <h4 class="font-black text-slate-900 dark:text-white text-sm mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{{ task.title }}</h4>
                  
                  <div class="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-6">
                    <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" [style.width.%]="task.progressPercentage"></div>
                  </div>

                  <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                       ⏳ {{ task.dueDate | date:'shortDate' }}
                    </div>
                    @if (task.assignedToUser) {
                      <div class="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white text-[9px] font-black">
                        {{ getInitials(task.assignedToUser) }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Review Column -->
          <div class="flex flex-col gap-6">
             <div class="flex items-center justify-between px-6 mb-2">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <h3 class="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">{{ 'tasks.ready_for_review' | translate }}</h3>
              </div>
              <span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">{{ getTasksByStatus(TaskStatus.ReadyForReview).length }}</span>
            </div>

            <div class="space-y-6">
              @for (task of getTasksByStatus(TaskStatus.ReadyForReview); track task.id; let i = $index) {
                <div (click)="viewTask(task)" 
                     class="premium-card-stack !p-6 group hover:scale-[1.02] cursor-pointer transition-all duration-500 border-l-4 border-l-amber-500 animate-premium-fade"
                     [style.animation-delay]="(i * 50) + 'ms'">
                  <div class="flex items-start justify-between mb-4">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">#{{ task.taskNumber }}</span>
                    <span [class]="getPriorityClass(task.priority)" class="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ring-1 ring-inset ring-current">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>
                  <h4 class="font-black text-slate-900 dark:text-white text-sm mb-6 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">{{ task.title }}</h4>
                  
                  <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                       🔎 IN REVIEW
                    </div>
                    @if (task.assignedToUser) {
                      <div class="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white text-[9px] font-black">
                        {{ getInitials(task.assignedToUser) }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Approved Column -->
          <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between px-6 mb-2">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <h3 class="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">{{ 'tasks.approved' | translate }}</h3>
              </div>
              <span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">{{ getTasksByStatus(TaskStatus.Approved).length }}</span>
            </div>

            <div class="space-y-6">
              @for (task of getTasksByStatus(TaskStatus.Approved); track task.id; let i = $index) {
                <div (click)="viewTask(task)" 
                     class="premium-card-stack !p-6 group hover:scale-[1.02] cursor-pointer transition-all duration-500 bg-emerald-500/5 border-l-4 border-l-emerald-500 animate-premium-fade"
                     [style.animation-delay]="(i * 50) + 'ms'">
                  <div class="flex items-start justify-between mb-4">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">#{{ task.taskNumber }}</span>
                    <span class="text-emerald-500 text-[10px] font-black">COMPLETED</span>
                  </div>
                  <h4 class="font-black text-slate-900 dark:text-white text-sm mb-6 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors line-through opacity-50">{{ task.title }}</h4>
                  
                  <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                       ✅ {{ task.actualEndDate | date:'shortDate' }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Create Modal -->
        @if (showCreateModal) {
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-premium-fade">
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-white/5 transform transition-all">
              <div class="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'tasks.create_task' | translate }}</h2>
              </div>
              <div class="p-10 space-y-8">
                <div class="group">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'tasks.title' | translate }} *</label>
                  <input type="text" [(ngModel)]="newTask.title" class="premium-input">
                </div>
                <div class="group">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'tasks.description' | translate }}</label>
                  <textarea [(ngModel)]="newTask.description" rows="4" class="premium-input !rounded-[1.5rem] resize-none"></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="group">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'tasks.priority' | translate }}</label>
                    <select [(ngModel)]="newTask.priority" class="premium-input appearance-none">
                      <option [ngValue]="0">{{ 'tasks.low' | translate }}</option>
                      <option [ngValue]="1">{{ 'tasks.normal' | translate }}</option>
                      <option [ngValue]="2">{{ 'tasks.high' | translate }}</option>
                      <option [ngValue]="3">{{ 'tasks.critical' | translate }}</option>
                    </select>
                  </div>
                  <div class="group">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'tasks.due_date' | translate }}</label>
                    <input type="date" [(ngModel)]="newTask.dueDate" class="premium-input">
                  </div>
                </div>
              </div>
              <div class="p-10 border-t border-slate-100 dark:border-white/5 flex justify-end gap-4 bg-slate-50/30 dark:bg-white/[0.01]">
                <button (click)="closeCreateModal()" class="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                  {{ 'common.cancel' | translate }}
                </button>
                <button (click)="createTask()" [disabled]="!newTask.title" class="premium-button-primary !px-8 !py-4 shadow-xl shadow-indigo-500/20">
                  {{ 'tasks.create' | translate }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TaskBoardComponent implements OnInit {
  private taskService = inject(TaskManagementService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

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
