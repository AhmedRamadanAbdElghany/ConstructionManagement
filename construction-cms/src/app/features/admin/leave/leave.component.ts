import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LeaveManagementService, LeaveRequest, LeaveBalance, LeaveType } from '../../../core/services/leave-management.service';

@Component({
    selector: 'app-leave',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ 'leave.title' | translate }}</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">{{ 'leave.subtitle' | translate }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'leave.pending_requests' | translate }}</div>
          <div class="text-2xl font-bold text-amber-500">{{ pendingCount() }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'leave.approved_this_month' | translate }}</div>
          <div class="text-2xl font-bold text-green-500">{{ approvedCount() }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'leave.total_balance' | translate }}</div>
          <div class="text-2xl font-bold text-blue-500">{{ totalBalance() }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'leave.on_leave_today' | translate }}</div>
          <div class="text-2xl font-bold text-purple-500">{{ onLeaveToday() }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="border-b border-slate-200 dark:border-slate-700">
          <nav class="flex -mb-px">
            <button (click)="activeTab.set('requests')" 
                    [class.border-cyan-500]="activeTab() === 'requests'"
                    [class.text-cyan-600]="activeTab() === 'requests'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'leave.requests' | translate }}
            </button>
            <button (click)="activeTab.set('balances')" 
                    [class.border-cyan-500]="activeTab() === 'balances'"
                    [class.text-cyan-600]="activeTab() === 'balances'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'leave.balances' | translate }}
            </button>
            <button (click)="activeTab.set('types')" 
                    [class.border-cyan-500]="activeTab() === 'types'"
                    [class.text-cyan-600]="activeTab() === 'types'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'leave.types' | translate }}
            </button>
            <button (click)="activeTab.set('calendar')" 
                    [class.border-cyan-500]="activeTab() === 'calendar'"
                    [class.text-cyan-600]="activeTab() === 'calendar'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'leave.calendar' | translate }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          @switch (activeTab()) {
            @case ('requests') {
              <div class="space-y-4">
                @if (requests().length === 0) {
                  <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                    {{ 'leave.no_requests' | translate }}
                  </div>
                } @else {
                  @for (request of requests(); track request.id) {
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                          <span class="text-cyan-600 dark:text-cyan-400 font-medium">{{ request.userName?.charAt(0) || 'U' }}</span>
                        </div>
                        <div>
                          <div class="font-medium text-slate-900 dark:text-white">{{ request.userName }}</div>
                          <div class="text-sm text-slate-500 dark:text-slate-400">{{ request.leaveTypeName }}</div>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm text-slate-500 dark:text-slate-400">{{ request.startDate | date:'mediumDate' }} - {{ request.endDate | date:'mediumDate' }}</div>
                        <span [class]="getStatusClass(request.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ 'leave.status_' + request.status.toLowerCase() | translate }}
                        </span>
                      </div>
                      @if (request.status === 'Pending') {
                        <div class="flex gap-2">
                          <button (click)="approveRequest(request.id)" class="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                            {{ 'leave.approve' | translate }}
                          </button>
                          <button (click)="rejectRequest(request.id)" class="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                            {{ 'leave.reject' | translate }}
                          </button>
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            }
            @case ('balances') {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-700">
                      <th class="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'leave.employee' | translate }}</th>
                      <th class="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'leave.type' | translate }}</th>
                      <th class="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'leave.available' | translate }}</th>
                      <th class="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">{{ 'leave.used' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (balance of balances(); track balance.id) {
                      <tr class="border-b border-slate-100 dark:border-slate-700/50">
                        <td class="py-3 px-4 text-slate-900 dark:text-white">{{ balance.userName }}</td>
                        <td class="py-3 px-4 text-center">{{ balance.leaveTypeName }}</td>
                        <td class="py-3 px-4 text-center">{{ balance.availableDays }}</td>
                        <td class="py-3 px-4 text-center">{{ balance.usedDays }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            @case ('types') {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (type of leaveTypes(); track type.id) {
                  <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div [style.background-color]="type.colorCode" class="w-3 h-3 rounded-full"></div>
                        <span class="font-medium text-slate-900 dark:text-white">{{ type.name }}</span>
                      </div>
                      <span class="text-sm text-slate-500 dark:text-slate-400">{{ type.defaultDaysPerYear }} {{ 'leave.days' | translate }}</span>
                    </div>
                    @if (type.description) {
                      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ type.description }}</p>
                    }
                  </div>
                }
              </div>
            }
            @case ('calendar') {
              <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                {{ 'leave.calendar_coming_soon' | translate }}
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class LeaveComponent implements OnInit {
    private leaveService = inject(LeaveManagementService);

    activeTab = signal<'requests' | 'balances' | 'types' | 'calendar'>('requests');
    requests = signal<LeaveRequest[]>([]);
    balances = signal<LeaveBalance[]>([]);
    leaveTypes = signal<LeaveType[]>([]);

    pendingCount = signal(0);
    approvedCount = signal(0);
    totalBalance = signal(0);
    onLeaveToday = signal(0);

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.leaveService.getLeaveRequests({}).subscribe({
            next: (data) => {
                this.requests.set(data);
                this.pendingCount.set(data.filter(r => r.status === 'Pending').length);
                this.approvedCount.set(data.filter(r => r.status === 'Approved').length);
            }
        });
        this.leaveService.getTeamLeaveBalances(0).subscribe({
            next: (data) => {
                this.balances.set(data);
                this.totalBalance.set(data.reduce((sum, b) => sum + b.availableDays, 0));
            }
        });
        this.leaveService.getLeaveTypes().subscribe({
            next: (data) => this.leaveTypes.set(data)
        });
    }

    approveRequest(id: number): void {
        this.leaveService.approveLeaveRequest(id, {}).subscribe(() => {
            this.loadDashboardData();
        });
    }

    rejectRequest(id: number): void {
        this.leaveService.rejectLeaveRequest(id, { reason: 'Rejected' }).subscribe(() => {
            this.loadDashboardData();
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    }
}
