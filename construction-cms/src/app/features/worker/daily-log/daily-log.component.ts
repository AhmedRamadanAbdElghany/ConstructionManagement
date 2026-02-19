import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { BOQItem, DailyLog, SiteMedia } from '../../../shared/interfaces';
import { AuthService } from '../../../core/services/auth.service';
import { DailyLogsService } from '../../../core/services/daily-logs.service';
import { I18nService } from '../../../core/i18n/i18n.service';

interface WorkTask {
  id: number;
  boqItemId: number;
  boqItemName: string;
  assignedQuantity: number;
  unit: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Approved' | 'Rejected';
  notes?: string;
  photos: string[];
}

@Component({
  selector: 'app-daily-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header with Date Navigation -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">{{ 'daily_log.title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'daily_log.subtitle' | translate }}</p>
          </div>
          
          <!-- Date Navigation -->
          <div class="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
            <button (click)="navigateDay(-1)" class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:text-white transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="px-6 py-3 text-center min-w-[200px]">
               <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'daily_log.selected_date' | translate }}</p>
              <input type="date" [(ngModel)]="selectedDateString" (change)="onDateChange()" 
                     class="bg-transparent text-sm font-black text-indigo-600 dark:text-indigo-400 border-none outline-none text-center cursor-pointer">
            </div>
            
            <button (click)="navigateDay(1)" class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:text-white transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            <button (click)="goToToday()" class="px-5 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
               {{ 'daily_log.today' | translate }}
            </button>
          </div>
        </div>

        <!-- Status Banner -->
        <div class="mb-8 p-4 rounded-2xl flex items-center justify-between"
             [ngClass]="{
               'bg-emerald-500/10 border border-emerald-500/20': !isDayClosed,
               'bg-rose-500/10 border border-rose-500/20': isDayClosed
             }">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 [ngClass]="isDayClosed ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'">
              {{ isDayClosed ? '🔒' : '🟢' }}
            </div>
            <div>
              <p class="text-sm font-black" [ngClass]="isDayClosed ? 'text-rose-600' : 'text-emerald-600'">
                {{ isDayClosed ? ('daily_log.day_locked' | translate) : ('daily_log.day_open' | translate) }}
              </p>
              <p class="text-xs text-slate-500">{{ selectedDate | date:'fullDate' }}</p>
            </div>
          </div>
          
          @if (isDayClosed && canReopenDay) {
            <button (click)="openReopenModal()" class="px-6 py-3 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all">
              {{ 'daily_log.reopen_day' | translate }}
            </button>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content - Today's Tasks -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Assigned Tasks Card -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                  <span class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-lg">📋</span>
                  {{ 'daily_log.tasks_for_day' | translate }}
                </h2>
                <span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                  {{ assignedTasks.length }} {{ 'daily_log.items' | translate }}
                </span>
              </div>

              <div class="space-y-6">
                @for (task of assignedTasks; track task.id) {
                  <div class="p-6 rounded-[2rem] border-2 transition-all hover:shadow-lg"
                       [ngClass]="{
                         'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5': task.status === 'Pending',
                         'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20': task.status === 'InProgress',
                         'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20': task.status === 'Completed' || task.status === 'Approved',
                         'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20': task.status === 'Rejected'
                       }">
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ task.boqItemName }}</h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {{ 'daily_log.target' | translate }}: {{ task.assignedQuantity }} {{ task.unit }}
                        </p>
                      </div>
                      <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest"
                            [ngClass]="{
                              'bg-slate-200 text-slate-600': task.status === 'Pending',
                              'bg-amber-500 text-white': task.status === 'InProgress',
                              'bg-emerald-500 text-white': task.status === 'Completed' || task.status === 'Approved',
                              'bg-rose-500 text-white': task.status === 'Rejected'
                            }">
                        {{ 'common.' + (task.status === 'InProgress' ? 'work_in_progress' : task.status.toLowerCase()) | translate }}
                      </span>
                    </div>

                    <!-- Photo Upload for Task -->
                    <div class="mb-4">
                       <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'daily_log.site_photos' | translate }} ({{ task.photos.length }})</p>
                      <div class="flex gap-2 flex-wrap">
                        @for (photo of task.photos; track photo) {
                          <div class="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                            <img [src]="photo" class="w-full h-full object-cover">
                          </div>
                        }
                        @if (!isDayClosed) {
                          <label class="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
                            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <input type="file" accept="image/*" class="hidden" (change)="uploadTaskPhoto(task, $event)">
                          </label>
                        }
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    @if (!isDayClosed) {
                      <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                        @if (task.status === 'Pending') {
                          <button (click)="startTask(task)" class="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                            {{ 'daily_log.start_work' | translate }}
                          </button>
                        }
                        @if (task.status === 'InProgress') {
                          <button (click)="completeTask(task)" class="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                            {{ 'daily_log.mark_complete' | translate }}
                          </button>
                        }
                        @if (canApprove && task.status === 'Completed') {
                          <button (click)="approveTask(task)" class="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                            {{ 'common.approved' | translate }}
                          </button>
                          <button (click)="rejectTask(task)" class="flex-1 py-3 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all">
                            {{ 'common.rejected' | translate }}
                          </button>
                        }
                      </div>
                    }
                  </div>
                }

                @if (assignedTasks.length === 0) {
                  <div class="text-center py-16 text-slate-400">
                    <p class="text-4xl mb-4 opacity-40">📭</p>
                    <p class="text-sm font-black uppercase tracking-widest">{{ 'daily_log.no_entries_yet' | translate }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Add New Entry (if day is open and user has permission) -->
            @if (!isDayClosed && canAddEntry) {
              <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl">
                <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                  <span class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg">➕</span>
                  {{ 'daily_log.progress_entry' | translate }}
                </h2>

                <form [formGroup]="dailyLogForm" (ngSubmit)="submitDailyLog()" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'daily_log.boq_item' | translate }}</label>
                      <select formControlName="boqItemId" 
                              class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white">
                        <option value="">{{ 'daily_log.select_item' | translate }}</option>
                        @for (item of boqItems; track item.id) {
                          <option [value]="item.id">{{ item.description }} ({{ item.unit }})</option>
                        }
                      </select>
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'daily_log.quantity' | translate }}</label>
                      <input type="number" formControlName="quantity" min="0"
                             class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white"
                             placeholder="0">
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'daily_log.notes' | translate }}</label>
                    <textarea formControlName="notes" rows="3"
                              class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white resize-none"
                              [placeholder]="'daily_log.notes_hint' | translate"></textarea>
                  </div>

                  <button type="submit" [disabled]="dailyLogForm.invalid"
                          class="w-full py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30">
                    {{ 'daily_log.submit' | translate }}
                  </button>
                </form>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="space-y-8">
            <!-- Day Summary -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl">
               <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">{{ 'daily_log.today_summary' | translate }}</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                   <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'daily_log.total_tasks' | translate }}</span>
                  <span class="text-xl font-black text-slate-900 dark:text-white">{{ assignedTasks.length }}</span>
                </div>
                <div class="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                   <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{{ 'projects.completed' | translate }}</span>
                  <span class="text-xl font-black text-emerald-600">{{ getTaskCount('Completed') + getTaskCount('Approved') }}</span>
                </div>
                <div class="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10">
                   <span class="text-[9px] font-black text-amber-600 uppercase tracking-widest">{{ 'daily_log.work_in_progress' | translate }}</span>
                  <span class="text-xl font-black text-amber-600">{{ getTaskCount('InProgress') }}</span>
                </div>
              </div>
            </div>

            <!-- Close Day Action -->
            @if (!isDayClosed && isToday) {
              <div class="bg-gradient-to-br from-rose-600 to-pink-700 rounded-[3rem] p-8 text-white shadow-2xl shadow-rose-500/20">
                 <h3 class="text-lg font-black uppercase tracking-tight mb-4">{{ 'daily_log.close_day_title' | translate }}</h3>
                 <p class="text-sm font-medium text-white/70 mb-6">{{ 'daily_log.close_day_desc' | translate }}</p>
                <button (click)="closeDay()" 
                        [disabled]="assignedTasks.length === 0"
                        class="w-full py-4 rounded-2xl bg-white text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50">
                   {{ 'daily_log.close_day' | translate }}
                </button>
              </div>
            }

            <!-- Recent History -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl">
               <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">{{ 'daily_log.recent_days' | translate }}</h3>
              <div class="space-y-3">
                @for (day of recentDays; track day.date) {
                  <button (click)="selectDate(day.date)" 
                          class="w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
                          [ngClass]="isSameDay(day.date, selectedDate) ? 'bg-indigo-500 text-white' : 'bg-slate-50 dark:bg-slate-800/50'">
                    <p class="text-sm font-black">{{ day.date | date:'EEE, MMM d' }}</p>
                    <p class="text-[10px] font-bold uppercase tracking-widest mt-1"
                       [ngClass]="isSameDay(day.date, selectedDate) ? 'text-indigo-200' : 'text-slate-400'">
                      {{ day.taskCount }} {{ 'daily_log.tasks_label' | translate }} · {{ day.isClosed ? ('daily_log.day_locked' | translate) : ('daily_log.day_open' | translate) }}
                    </p>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reopen Modal -->
      @if (showReopenModal) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">{{ 'daily_log.reopen_closed_day' | translate }}</h2>
            <p class="text-sm text-slate-500 mb-8">{{ 'daily_log.reopen_desc' | translate }}</p>
            
            <div class="space-y-6 mb-8">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'daily_log.reopen_reason' | translate }}</label>
                <textarea [(ngModel)]="reopenReason" rows="3"
                          class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white resize-none"
                          [placeholder]="'daily_log.reopen_hint' | translate"></textarea>
              </div>
              
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'daily_log.notify_roles' | translate }}</label>
                <div class="flex flex-wrap gap-2">
                  @for (role of projectRoles; track role.id) {
                    <button (click)="toggleRoleNotification(role.id)"
                            class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all"
                            [ngClass]="selectedNotifyRoles.includes(role.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'">
                      {{ role.name }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <div class="flex gap-4">
              <button (click)="closeReopenModal()" class="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="confirmReopenDay()" [disabled]="!reopenReason" class="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50">
                {{ 'daily_log.reopen_day' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DailyLogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  dailyLogForm: FormGroup;
  boqItems: BOQItem[] = [];
  assignedTasks: WorkTask[] = [];
  selectedDate = new Date();
  selectedDateString = '';
  isDayClosed = false;

  // Permission flags
  canApprove = false;
  canReopenDay = false;
  canAddEntry = false;

  // Reopen modal
  showReopenModal = false;
  reopenReason = '';
  selectedNotifyRoles: number[] = [];
  projectRoles = [
    { id: 1, name: 'Project Manager' },
    { id: 2, name: 'Site Engineer' },
    { id: 3, name: 'Supervisor' },
    { id: 4, name: 'Quality Control' }
  ];

  // Recent days history
  recentDays: { date: Date; taskCount: number; isClosed: boolean }[] = [];

  get isToday(): boolean {
    return this.isSameDay(this.selectedDate, new Date());
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dailyLogsService: DailyLogsService
  ) {
    this.dailyLogForm = this.fb.group({
      boqItemId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.selectedDateString = this.formatDateForInput(this.selectedDate);
    this.loadData();
    this.loadRecentDays();
    this.checkPermissions();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
        this.loadRecentDays();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    // TODO: Implement BOQ items API
    this.boqItems = [];
    this.loadTasksForDate(this.selectedDate);
  }

  loadTasksForDate(date: Date) {
    // Load daily logs from backend for the selected date
    const dateStr = this.formatDateForInput(date);
    this.dailyLogsService.getDailyLogHistory(1).subscribe(logs => {
      // Map daily logs to work tasks
      this.assignedTasks = logs.map(log => ({
        id: log.id,
        boqItemId: log.itemId || 0,
        boqItemName: log.itemName || 'Unknown Task',
        assignedQuantity: log.completionPercentage || 0,
        unit: 'm³',
        status: log.isClosed ? 'Completed' : 'InProgress',
        photos: []
      }));

      // Check if day is closed
      const closedLog = logs.find(l => l.isClosed);
      this.isDayClosed = !!closedLog && date < new Date(new Date().setHours(0, 0, 0, 0)) && !this.isToday;
    });
  }

  loadRecentDays() {
    const today = new Date();
    this.recentDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      this.recentDays.push({
        date: d,
        taskCount: Math.floor(Math.random() * 5) + 1,
        isClosed: i > 0
      });
    }
  }

  checkPermissions() {
    const role = this.authService.getCurrentUser()?.role;
    // In a real app, these would be fetched from the backend based on the user's project-specific permissions
    this.canApprove = role === 'CompanyAdmin' || role === 'SuperAdmin';
    this.canReopenDay = role === 'CompanyAdmin' || role === 'SuperAdmin';
    // All workers can add entries by default; this can be restricted per project role
    this.canAddEntry = role === 'CompanyUser' || role === 'CompanyAdmin' || role === 'SuperAdmin';
  }

  // Date Navigation
  navigateDay(delta: number) {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    this.selectedDate = newDate;
    this.selectedDateString = this.formatDateForInput(newDate);
    this.loadTasksForDate(newDate);
  }

  goToToday() {
    this.selectedDate = new Date();
    this.selectedDateString = this.formatDateForInput(this.selectedDate);
    this.loadTasksForDate(this.selectedDate);
  }

  onDateChange() {
    this.selectedDate = new Date(this.selectedDateString);
    this.loadTasksForDate(this.selectedDate);
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.selectedDateString = this.formatDateForInput(date);
    this.loadTasksForDate(date);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.toDateString() === d2.toDateString();
  }

  // Task Actions
  startTask(task: WorkTask) {
    task.status = 'InProgress';
  }

  completeTask(task: WorkTask) {
    task.status = 'Completed';
  }

  approveTask(task: WorkTask) {
    task.status = 'Approved';
  }

  rejectTask(task: WorkTask) {
    task.status = 'Rejected';
  }

  uploadTaskPhoto(task: WorkTask, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        task.photos.push(e.target?.result as string);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  getTaskCount(status: string): number {
    return this.assignedTasks.filter(t => t.status === status).length;
  }

  submitDailyLog() {
    if (this.dailyLogForm.valid) {
      const newTask: WorkTask = {
        id: Date.now(),
        boqItemId: Number(this.dailyLogForm.value.boqItemId),
        boqItemName: this.boqItems.find(i => i.id === Number(this.dailyLogForm.value.boqItemId))?.description || 'Unknown',
        assignedQuantity: this.dailyLogForm.value.quantity,
        unit: this.boqItems.find(i => i.id === Number(this.dailyLogForm.value.boqItemId))?.unit || '',
        status: 'Pending',
        notes: this.dailyLogForm.value.notes,
        photos: []
      };
      this.assignedTasks.push(newTask);
      this.dailyLogForm.reset();
    }
  }

  closeDay() {
    if (confirm('Are you sure you want to close this day? This will lock all entries.')) {
      this.isDayClosed = true;
    }
  }

  // Reopen Modal
  openReopenModal() {
    this.showReopenModal = true;
    this.reopenReason = '';
    this.selectedNotifyRoles = [];
  }

  closeReopenModal() {
    this.showReopenModal = false;
  }

  toggleRoleNotification(roleId: number) {
    const idx = this.selectedNotifyRoles.indexOf(roleId);
    if (idx > -1) {
      this.selectedNotifyRoles.splice(idx, 1);
    } else {
      this.selectedNotifyRoles.push(roleId);
    }
  }

  confirmReopenDay() {
    if (this.reopenReason) {
      // In a real app, this would call the backend API
      console.log('Reopening day with reason:', this.reopenReason, 'Notifying roles:', this.selectedNotifyRoles);
      this.isDayClosed = false;
      this.showReopenModal = false;
      alert('Day reopened successfully! Selected roles have been notified.');
    }
  }
}