import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DailyLogsService, DailyLogDto, CreateDailyLogRequest, CloseDailyLogRequest, ReopenDailyLogRequest } from '../../../../core/services/daily-logs.service';
import { ProjectItemService } from '../../../../core/services/project-item.service';
import { ProjectItem } from '../../../../shared/interfaces';

@Component({
  selector: 'app-daily-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Daily Logs</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Track daily progress on project items</p>
          </div>
          <button (click)="openCreateModal()" 
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            + Create Log
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Logs</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ dailyLogs.length }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Open Logs</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ openLogsCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Closed Logs</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ closedLogsCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Completion</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ averageCompletion | number:'1.0-0' }}%</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Daily Logs Table -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-black text-slate-900 dark:text-white">Logs History</h2>
              <div class="flex items-center space-x-4">
                <select [(ngModel)]="selectedItemId" 
                        (change)="loadDailyLogs()"
                        class="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                  <option value="">All Items</option>
                  @for (item of projectItems; track item.id) {
                    <option [value]="item.id">{{ item.itemName }}</option>
                  }
                </select>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-white/5">
                  <th class="px-6 py-4 text-left">Date</th>
                  <th class="px-6 py-4 text-left">Item</th>
                  <th class="px-6 py-4 text-center">Status</th>
                  <th class="px-6 py-4 text-right">Completion</th>
                  <th class="px-6 py-4 text-left">Notes</th>
                  <th class="px-6 py-4 text-left">Closed By</th>
                  <th class="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 dark:divide-white/[0.02]">
                @for (log of filteredLogs; track log.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td class="px-6 py-4">
                      <div class="text-sm font-bold text-slate-900 dark:text-white">{{ log.logDate | date:'MMM d, yyyy' }}</div>
                      <div class="text-[10px] text-slate-400 font-black uppercase mt-1">{{ log.createdAt | date:'shortTime' }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm font-bold text-slate-900 dark:text-white">{{ log.itemName || 'Item #' + log.itemId }}</div>
                      <div class="text-[10px] text-slate-400 font-black uppercase mt-1">ID: {{ log.itemId }}</div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span [class]="'px-3 py-1 rounded-full text-[10px] font-black uppercase ' + getStatusClass(log)">
                        {{ log.isClosed ? 'Closed' : 'Open' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end space-x-2">
                        <div class="w-16 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div class="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                               [style.width.%]="log.completionPercentage || 0">
                          </div>
                        </div>
                        <span class="text-[10px] font-black text-slate-400">{{ (log.completionPercentage || 0) | number:'1.0-0' }}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{{ log.notes || '-' }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-slate-600 dark:text-slate-400">{{ log.closedByUserName || '-' }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center space-x-2">
                        @if (!log.isClosed) {
                          <button (click)="openCloseModal(log)" 
                                  class="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                                  title="Close Log">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </button>
                        } @else {
                          <button (click)="openReopenModal(log)" 
                                  class="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                                  title="Reopen Log">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
                @if (filteredLogs.length === 0) {
                  <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center">
                        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                          </svg>
                        </div>
                        <div class="text-sm font-bold text-slate-400">No daily logs found</div>
                        <div class="text-xs text-slate-400 mt-1">Create your first daily log to get started</div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Log Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Create Daily Log</h3>
          </div>
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'daily_log.project_item' | translate }} *</label>
              <select [(ngModel)]="selectedCreateItemId" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select an item</option>
                @for (item of projectItems; track item.id) {
                  <option [value]="item.id">{{ item.itemName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'daily_log.log_date_required' | translate }}</label>
              <input type="date" 
                     [(ngModel)]="createFormData.logDate" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeCreateModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="createDailyLog()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all">
              Create
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Close Log Modal -->
    @if (showCloseModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Close Daily Log</h3>
          </div>
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completion Percentage *</label>
              <input type="number" 
                     [(ngModel)]="closeFormData.completionPercentage" 
                     min="0" max="100"
                     class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                     placeholder="0-100">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</label>
              <textarea [(ngModel)]="closeFormData.notes" 
                        rows="3"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                        placeholder="Add notes about today's progress..."></textarea>
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeCloseModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="closeDailyLog()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
              Close Log
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Reopen Log Modal -->
    @if (showReopenModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Reopen Daily Log</h3>
          </div>
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason *</label>
              <textarea [(ngModel)]="reopenFormData.reason" 
                        rows="3"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                        placeholder="Why do you need to reopen this log?"></textarea>
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeReopenModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="reopenDailyLog()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all">
              Reopen
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class DailyLogsComponent implements OnInit {
  dailyLogs: DailyLogDto[] = [];
  filteredLogs: DailyLogDto[] = [];
  projectItems: ProjectItem[] = [];
  selectedItemId: number | null = null;
  projectId: number = 1; // TODO: Get from route or service

  // Create Modal
  showCreateModal: boolean = false;
  selectedCreateItemId: number | null = null;
  createFormData: CreateDailyLogRequest = {
    logDate: new Date().toISOString().split('T')[0]
  };

  // Close Modal
  showCloseModal: boolean = false;
  closingLog: DailyLogDto | null = null;
  closeFormData: CloseDailyLogRequest = {
    completionPercentage: 0,
    notes: ''
  };

  // Reopen Modal
  showReopenModal: boolean = false;
  reopeningLog: DailyLogDto | null = null;
  reopenFormData: ReopenDailyLogRequest = {
    reason: ''
  };

  constructor(
    private dailyLogsService: DailyLogsService,
    private projectItemService: ProjectItemService
  ) { }

  ngOnInit(): void {
    this.loadProjectItems();
    this.loadDailyLogs();
  }

  loadProjectItems(): void {
    this.projectItemService.getItemsByProject(this.projectId).subscribe({
      next: (items: ProjectItem[]) => {
        this.projectItems = items;
      },
      error: (error: any) => {
        console.error('Error loading project items:', error);
      }
    });
  }

  loadDailyLogs(): void {
    if (this.selectedItemId) {
      this.dailyLogsService.getDailyLogHistory(this.selectedItemId).subscribe({
        next: (logs) => {
          this.dailyLogs = logs;
          this.filterLogs();
        },
        error: (error) => {
          console.error('Error loading daily logs:', error);
        }
      });
    } else {
      // Load logs for all items
      this.filteredLogs = [];
      this.projectItems.forEach(item => {
        this.dailyLogsService.getDailyLogHistory(item.id).subscribe({
          next: (logs) => {
            this.dailyLogs = [...this.dailyLogs, ...logs];
            this.filterLogs();
          },
          error: (error: any) => {
            console.error('Error loading daily logs for item:', error);
          }
        });
      });
    }
  }

  filterLogs(): void {
    if (!this.selectedItemId) {
      this.filteredLogs = this.dailyLogs;
    } else {
      this.filteredLogs = this.dailyLogs.filter(log => log.itemId === this.selectedItemId);
    }
  }

  get openLogsCount(): number {
    return this.dailyLogs.filter(log => !log.isClosed).length;
  }

  get closedLogsCount(): number {
    return this.dailyLogs.filter(log => log.isClosed).length;
  }

  get averageCompletion(): number {
    const closedLogs = this.dailyLogs.filter(log => log.isClosed && log.completionPercentage);
    if (closedLogs.length === 0) return 0;
    const sum = closedLogs.reduce((acc, log) => acc + (log.completionPercentage || 0), 0);
    return sum / closedLogs.length;
  }

  getStatusClass(log: DailyLogDto): string {
    if (log.isClosed) {
      return 'bg-emerald-500/10 text-emerald-600';
    }
    return 'bg-amber-500/10 text-amber-600';
  }

  // Create Modal Methods
  openCreateModal(): void {
    this.createFormData = {
      logDate: new Date().toISOString().split('T')[0]
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createDailyLog(): void {
    if (!this.selectedCreateItemId || !this.createFormData.logDate) {
      alert('Please fill in all required fields');
      return;
    }

    this.dailyLogsService.createOrGetDailyLog(this.selectedCreateItemId, this.createFormData).subscribe({
      next: () => {
        this.loadDailyLogs();
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Error creating daily log:', error);
        alert('Failed to create daily log');
      }
    });
  }

  // Close Modal Methods
  openCloseModal(log: DailyLogDto): void {
    this.closingLog = log;
    this.closeFormData = {
      completionPercentage: 0,
      notes: ''
    };
    this.showCloseModal = true;
  }

  closeCloseModal(): void {
    this.showCloseModal = false;
    this.closingLog = null;
  }

  closeDailyLog(): void {
    if (!this.closingLog) return;

    this.dailyLogsService.closeDailyLog(
      this.closingLog.itemId,
      this.closingLog.logDate,
      this.closeFormData
    ).subscribe({
      next: () => {
        this.loadDailyLogs();
        this.closeCloseModal();
      },
      error: (error) => {
        console.error('Error closing daily log:', error);
        alert('Failed to close daily log');
      }
    });
  }

  // Reopen Modal Methods
  openReopenModal(log: DailyLogDto): void {
    this.reopeningLog = log;
    this.reopenFormData = {
      reason: ''
    };
    this.showReopenModal = true;
  }

  closeReopenModal(): void {
    this.showReopenModal = false;
    this.reopeningLog = null;
  }

  reopenDailyLog(): void {
    if (!this.reopeningLog || !this.reopenFormData.reason) {
      alert('Please provide a reason for reopening');
      return;
    }

    this.dailyLogsService.reopenClosedDay(
      this.reopeningLog.itemId,
      this.reopeningLog.logDate,
      this.reopenFormData
    ).subscribe({
      next: () => {
        this.loadDailyLogs();
        this.closeReopenModal();
      },
      error: (error) => {
        console.error('Error reopening daily log:', error);
        alert('Failed to reopen daily log');
      }
    });
  }
}
