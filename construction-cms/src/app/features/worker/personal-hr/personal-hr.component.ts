import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { HrService, LeaveRequestDto, PayrollDto, UserHRStatsDto, LeaveTypeDto } from '../../../core/services/hr.service';

@Component({
  selector: 'app-personal-hr',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500 font-['Outfit']">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-premium-fade">
          <div class="space-y-1">
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-4 uppercase">
              <span class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-xl shadow-indigo-500/20">👤</span>
              {{ 'personal_hr.title' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight italic opacity-80">{{ 'personal_hr.subtitle' | translate }}</p>
          </div>
          <div class="flex items-center gap-3">
             <div class="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-500">
               <span class="text-[9px] font-black uppercase tracking-[0.2em] block leading-none mb-1 opacity-40">{{ 'dashboard.status' | translate }}</span>
               <span class="text-xs font-black text-emerald-500 uppercase tracking-widest">{{ 'personal_hr.active_associate' | translate }}</span>
             </div>
          </div>
        </div>

        <!-- Metric Engine -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <!-- Monthly Compensation -->
          <div class="premium-card group animate-premium-fade" style="animation-delay: 100ms">
            <div class="flex items-center justify-between mb-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500/20 to-blue-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">💰</div>
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl opacity-60">{{ 'personal_hr.financial_label' | translate }}</div>
            </div>
            <p class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{{ monthlySalary | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'personal_hr.monthly_compensation' | translate }}</p>
          </div>
 
          <!-- Leave Allowance -->
          <div class="premium-card group animate-premium-fade" style="animation-delay: 200ms">
            <div class="flex items-center justify-between mb-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/20 to-teal-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">📅</div>
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl opacity-60">{{ 'personal_hr.allowance_label' | translate }}</div>
            </div>
            <p class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{{ annualLeaveDays }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'personal_hr.annual_leave_remaining' | translate }}</p>
          </div>
 
          <!-- Active Requests -->
          <div class="premium-card group animate-premium-fade" style="animation-delay: 300ms">
            <div class="flex items-center justify-between mb-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">⏳</div>
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl opacity-60">{{ 'dashboard.pending' | translate }}</div>
            </div>
            <p class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{{ pendingRequests }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'personal_hr.awaiting_authorization' | translate }}</p>
          </div>
 
          <!-- Utilization -->
          <div class="premium-card group animate-premium-fade" style="animation-delay: 400ms">
            <div class="flex items-center justify-between mb-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-purple-500/20 to-fuchsia-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">📊</div>
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl opacity-60">{{ 'personal_hr.work_days_label' | translate }}</div>
            </div>
            <p class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{{ workDaysThisMonth }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'personal_hr.cycle_performance' | translate }}</p>
          </div>
        </div>

        <!-- Navigation Hub -->
        <div class="flex items-center space-x-2 bg-slate-200/50 dark:bg-white/5 rounded-[2rem] p-2 mb-10 w-fit backdrop-blur-md">
          <button (click)="activeTab = 'salary'"
                  [class.bg-white]="activeTab === 'salary'"
                  [class.dark:bg-slate-800]="activeTab === 'salary'"
                  [class.shadow-xl]="activeTab === 'salary'"
                  [class.text-indigo-600]="activeTab === 'salary'"
                  [class.dark:text-white]="activeTab === 'salary'"
                  class="px-10 py-4 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-widest transition-all text-slate-400">
            {{ 'personal_hr.financial_ledger' | translate }}
          </button>
          <button (click)="activeTab = 'vacation'"
                  [class.bg-white]="activeTab === 'vacation'"
                  [class.dark:bg-slate-800]="activeTab === 'vacation'"
                  [class.shadow-xl]="activeTab === 'vacation'"
                  [class.text-indigo-600]="activeTab === 'vacation'"
                  [class.dark:text-white]="activeTab === 'vacation'"
                  class="px-10 py-4 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-widest transition-all text-slate-400 hover:text-slate-600">
            {{ 'personal_hr.leave_architecture' | translate }}
          </button>
        </div>

        <!-- Viewport -->
        <main class="animate-in slide-in-from-bottom-5 duration-700">
          <!-- Ledger View -->
          @if (activeTab === 'salary') {
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5">
              <div class="px-10 py-10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                   <h2 class="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{{ 'personal_hr.salary_breakdown' | translate }}</h2>
                   <p class="text-xs text-slate-500 font-medium">{{ 'personal_hr.salary_desc' | translate }}</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-white/5 outline-none cursor-pointer hover:bg-slate-50 transition-colors">📄</div>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left bg-slate-50/30 dark:bg-slate-950/40 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <th class="px-10 py-6 italic">{{ 'personal_hr.billing_period' | translate }}</th>
                      <th class="px-10 py-6">{{ 'personal_hr.base_salary' | translate }}</th>
                      <th class="px-10 py-6">{{ 'personal_hr.bonus_reward' | translate }}</th>
                      <th class="px-10 py-6 text-rose-500">{{ 'personal_hr.deductions' | translate }}</th>
                      <th class="px-10 py-6">{{ 'personal_hr.net_dispersion' | translate }}</th>
                      <th class="px-10 py-6">{{ 'personal_hr.audit_status' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    @for (record of salaryHistory; track record.id; let i = $index) {
                      <tr class="group hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-all animate-premium-fade" [style.animation-delay]="(i * 50 + 100) + 'ms'">
                        <td class="px-10 py-8">
                           <p class="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 transition-colors">{{ getMonthName(record.month, record.year) }}</p>
                        </td>
                        <td class="px-10 py-8 text-sm font-bold text-slate-600 dark:text-slate-400 capitalize">{{ record.baseSalary | currency:'USD' }}</td>
                        <td class="px-10 py-8 text-sm font-black text-emerald-500">+{{ record.bonuses | currency:'USD' }}</td>
                        <td class="px-10 py-8 text-sm font-black text-rose-500">-{{ record.deductions | currency:'USD' }}</td>
                        <td class="px-10 py-8">
                           <span class="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{{ record.netSalary | currency:'USD' }}</span>
                        </td>
                        <td class="px-10 py-8">
                          <span class="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all"
                                [ngClass]="{
                                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10': record.isPaid,
                                  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10': !record.isPaid
                                }">
                            {{ (record.isPaid ? 'common.paid' : 'common.pending') | translate }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Leave Architecture View -->
          @if (activeTab === 'vacation') {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <!-- Form -->
              <div class="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-2xl h-fit">
                <div class="mb-10">
                   <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{{ 'personal_hr.init_leave_request' | translate }}</h2>
                   <p class="text-xs text-slate-500 mt-1">{{ 'personal_hr.leave_request_desc' | translate }}</p>
                </div>
                
                <form [formGroup]="vacationForm" (ngSubmit)="submitVacationRequest()" class="space-y-8">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{{ 'personal_hr.leave_archetype' | translate }}</label>
                    <div class="relative">
                      <select formControlName="leaveTypeId" 
                              class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white appearance-none cursor-pointer">
                        @for (lt of leaveTypes; track lt.id) {
                          <option [value]="lt.id">{{ lt.name }}</option>
                        }
                      </select>
                      <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">⌄</div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{{ 'personal_hr.commencement' | translate }}</label>
                      <input type="date" formControlName="startDate" 
                             class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white">
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{{ 'personal_hr.conclusion' | translate }}</label>
                      <input type="date" formControlName="endDate" 
                             class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white">
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{{ 'personal_hr.justification' | translate }}</label>
                    <textarea formControlName="reason" rows="4"
                              class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white resize-none"
                              [placeholder]="'personal_hr.reasoning_hint' | translate"></textarea>
                  </div>

                  <button type="submit" [disabled]="vacationForm.invalid"
                          class="w-full py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale">
                    {{ 'personal_hr.execute_request' | translate }}
                  </button>
                </form>
              </div>

              <!-- History -->
              <div class="lg:col-span-8 space-y-6">
                @for (request of vacationRequests; track request.id) {
                  <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-xl transition-all hover:scale-[1.01] hover:shadow-2xl group relative overflow-hidden">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div class="flex items-center gap-6">
                         <div class="w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center border-2 bg-indigo-50 border-indigo-100 text-indigo-600">
                           <span class="text-2xl">🌴</span>
                           <span class="text-[8px] font-bold uppercase tracking-tighter mt-1">{{ request.leaveTypeName }}</span>
                         </div>
                         <div>
                            <p class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                              {{ request.startDate | date:'MMM d, y' }} &mdash; {{ request.endDate | date:'MMM d, y' }}
                            </p>
                            <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                              {{ 'personal_hr.duration' | translate }}: <span class="text-indigo-600 dark:text-indigo-400 capitalize">{{ request.totalDays }} {{ 'personal_hr.business_days' | translate }}</span>
                            </p>
                            @if (request.reason) {
                              <p class="text-xs italic text-slate-500 mt-4 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">"{{ request.reason }}"</p>
                            }
                         </div>
                       </div>
                       
                       <div class="flex items-center gap-4">
                          <span class="px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all"
                                [ngClass]="{
                                  'bg-emerald-500/10 text-emerald-600 border-emerald-500/10': request.status === 'Approved',
                                  'bg-amber-500/10 text-amber-600 border-amber-500/10': request.status === 'Pending',
                                  'bg-rose-500/10 text-rose-600 border-rose-500/10': request.status === 'Rejected'
                                }">
                            {{ 'dashboard.status' | translate }}: {{ request.status }}
                          </span>
                       </div>
                    </div>
                  </div>
                }

                @if (vacationRequests.length === 0) {
                  <div class="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200 dark:border-white/5">
                     <p class="text-4xl mb-6 grayscale opacity-40">📭</p>
                     <p class="text-lg font-bold text-slate-400 uppercase tracking-widest">{{ 'personal_hr.no_leave_records' | translate }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .premium-card {
      @apply bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden;
    }
    .premium-card:after {
      content: ''; @apply absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent translate-y-full transition-transform duration-700;
    }
    .premium-card:hover:after { @apply translate-y-0; }
  `]
})
export class PersonalHrComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);
  private hrService = inject(HrService);

  activeTab: 'salary' | 'vacation' = 'salary';
  vacationForm: FormGroup;
  vacationRequests: LeaveRequestDto[] = [];
  leaveTypes: LeaveTypeDto[] = [];

  monthlySalary = 0;
  annualLeaveDays = 21;
  usedLeaveDays = 0;
  pendingRequests = 0;
  workDaysThisMonth = 0;

  salaryHistory: PayrollDto[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.vacationForm = this.fb.group({
      leaveTypeId: [1, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['']
    });
  }

  ngOnInit() {
    this.loadHRStats();
    this.loadPayrollHistory();
    this.loadLeaveRequests();
    this.loadLeaveTypes();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadHRStats();
        this.loadPayrollHistory();
        this.loadLeaveRequests();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHRStats() {
    this.hrService.getMyHRStats().subscribe({
      next: (stats: UserHRStatsDto) => {
        this.monthlySalary = stats.monthlySalary;
        this.annualLeaveDays = stats.annualLeaveDays;
        this.usedLeaveDays = stats.usedLeaveDays;
        this.pendingRequests = stats.pendingRequests;
        this.workDaysThisMonth = stats.workDaysThisMonth;
      },
      error: (err) => {
        console.error('Failed to load HR stats:', err);
      }
    });
  }

  private loadPayrollHistory() {
    this.hrService.getMyPayrollHistory().subscribe({
      next: (data: PayrollDto[]) => {
        this.salaryHistory = data;
      },
      error: (err) => {
        console.error('Failed to load payroll history:', err);
        this.salaryHistory = [];
      }
    });
  }

  private loadLeaveRequests() {
    this.hrService.getLeaveRequests().subscribe({
      next: (data: LeaveRequestDto[]) => {
        this.vacationRequests = data;
        this.pendingRequests = data.filter(r => r.status === 'Pending').length;
      },
      error: (err) => {
        console.error('Failed to load leave requests:', err);
        this.vacationRequests = [];
      }
    });
  }

  private loadLeaveTypes() {
    this.hrService.getLeaveTypes().subscribe({
      next: (data: LeaveTypeDto[]) => {
        this.leaveTypes = data;
      },
      error: (err) => {
        console.error('Failed to load leave types:', err);
        this.leaveTypes = [];
      }
    });
  }

  submitVacationRequest() {
    if (this.vacationForm.valid) {
      const request = {
        leaveTypeId: this.vacationForm.value.leaveTypeId,
        startDate: this.vacationForm.value.startDate,
        endDate: this.vacationForm.value.endDate,
        reason: this.vacationForm.value.reason
      };

      this.hrService.createLeaveRequest(request).subscribe({
        next: () => {
          this.vacationForm.reset({ leaveTypeId: 1 });
          this.loadLeaveRequests();
          this.loadHRStats();
          alert('Leave request submitted successfully!');
        },
        error: (err) => {
          console.error('Failed to submit leave request:', err);
          alert('Failed to submit leave request. Please try again.');
        }
      });
    }
  }

  calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  getMonthName(month: number, year: number): string {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}
