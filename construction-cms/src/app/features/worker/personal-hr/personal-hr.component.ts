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
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-premium-fade">
          <div class="space-y-1">
            <h1 class="text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase drop-shadow-sm">{{ 'personal_hr.title' | translate }}</h1>
            <div class="flex items-center gap-2 opacity-60">
               <div class="w-10 h-1 bg-indigo-500 rounded-full"></div>
               <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{{ 'personal_hr.subtitle' | translate }}</p>
            </div>
          </div>
          <div class="px-8 py-4 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/20">👤</div>
            <div>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">{{ 'personal_hr.employee_id' | translate }}</p>
              <p class="text-sm font-black text-slate-900 dark:text-white uppercase transition-colors hover:text-indigo-600">EMP-2024-0892</p>
            </div>
          </div>
        </div>

        <!-- Metric Engine -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <!-- Monthly Compensation -->
          <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-indigo-500/10 group animate-premium-fade" style="animation-delay: 100ms">
            <div class="flex items-center justify-between mb-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">💰</div>
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl opacity-60">{{ 'personal_hr.financial_label' | translate }}</div>
            </div>
            <p class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter leading-none">{{ monthlySalary | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'personal_hr.monthly_compensation' | translate }}</p>
          </div>
 
          <!-- Leave Allowance -->
          <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-emerald-500/10 group animate-premium-fade" style="animation-delay: 200ms">
            <div class="flex items-center justify-between mb-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">📅</div>
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl opacity-60">{{ 'personal_hr.allowance_label' | translate }}</div>
            </div>
            <p class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter leading-none">{{ annualLeaveDays }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'personal_hr.annual_leave_remaining' | translate }}</p>
          </div>
 
          <!-- Active Requests -->
          <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-amber-500/10 group animate-premium-fade" style="animation-delay: 300ms">
            <div class="flex items-center justify-between mb-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 text-amber-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">⏳</div>
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl opacity-60">{{ 'dashboard.pending' | translate }}</div>
            </div>
            <p class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter leading-none">{{ pendingRequests }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'personal_hr.awaiting_authorization' | translate }}</p>
          </div>
 
          <!-- Utilization -->
          <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-purple-500/10 group animate-premium-fade" style="animation-delay: 400ms">
            <div class="flex items-center justify-between mb-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-purple-500/10 text-purple-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">📊</div>
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl opacity-60">{{ 'personal_hr.work_days_label' | translate }}</div>
            </div>
            <p class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter leading-none">{{ workDaysThisMonth }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'personal_hr.cycle_performance' | translate }}</p>
          </div>
        </div>

        <!-- Navigation Hub -->
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-3 border border-slate-200/60 dark:border-white/5 shadow-2xl mb-12 flex flex-wrap gap-2 animate-premium-fade">
          <button (click)="activeTab = 'salary'" 
                  class="flex-1 min-w-[200px] py-6 px-10 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-4 group"
                  [ngClass]="activeTab === 'salary' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xl shadow-slate-400/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'">
            <span class="text-xl group-hover:rotate-12 transition-transform">📊</span>
            {{ 'personal_hr.financial_ledger' | translate }}
          </button>
          <button (click)="activeTab = 'vacation'" 
                  class="flex-1 min-w-[200px] py-6 px-10 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-4 group"
                  [ngClass]="activeTab === 'vacation' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xl shadow-slate-400/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'">
            <span class="text-xl group-hover:rotate-12 transition-transform">🏖️</span>
            {{ 'personal_hr.leave_architecture' | translate }}
          </button>
        </div>

        <!-- Viewport -->
        <main class="animate-in slide-in-from-bottom-5 duration-700">
          <!-- Ledger View -->
          @if (activeTab === 'salary') {
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl overflow-hidden animate-premium-fade">
              <div class="p-10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                 <div class="space-y-1">
                   <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ 'personal_hr.salary_breakdown' | translate }}</h2>
                   <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-60">{{ 'personal_hr.salary_desc' | translate }}</p>
                 </div>
                 <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl shadow-inner">📄</div>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-slate-50/50 dark:bg-white/[0.01]">
                      <th class="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{{ 'personal_hr.billing_period' | translate }}</th>
                      <th class="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'personal_hr.base_salary' | translate }}</th>
                      <th class="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'personal_hr.bonus_reward' | translate }}</th>
                      <th class="px-10 py-6 text-right text-[10px] font-black text-rose-500 uppercase tracking-widest">{{ 'personal_hr.deductions' | translate }}</th>
                      <th class="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'personal_hr.net_dispersion' | translate }}</th>
                      <th class="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'personal_hr.audit_status' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-white/5 font-black text-sm">
                    @for (record of salaryHistory; track record.id; let i = $index) {
                      <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group animate-premium-fade" [style.animation-delay]="(i * 50) + 'ms'">
                        <td class="px-10 py-8 text-slate-900 dark:text-white uppercase tracking-tight">{{ getMonthName(record.month, record.year) }}</td>
                        <td class="px-10 py-8 text-right text-slate-500">{{ record.baseSalary | currency:'USD' }}</td>
                        <td class="px-10 py-8 text-right text-emerald-600">+{{ record.bonuses | currency:'USD' }}</td>
                        <td class="px-10 py-8 text-right text-rose-600">-{{ record.deductions | currency:'USD' }}</td>
                        <td class="px-10 py-8 text-right text-lg text-indigo-600 dark:text-indigo-400 tracking-tighter">
                           {{ record.netSalary | currency:'USD' }}
                        </td>
                        <td class="px-10 py-8 text-center">
                          <span class="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all"
                                [ngClass]="{
                                  'bg-emerald-500/10 text-emerald-600 border-emerald-500/10': record.isPaid,
                                  'bg-amber-500/10 text-amber-600 border-amber-500/10': !record.isPaid
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
              <div class="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200/60 dark:border-white/5 shadow-2xl h-fit">
                <div class="space-y-1 mb-10">
                   <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                     <span class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl shadow-inner">📝</span>
                     {{ 'personal_hr.init_leave_request' | translate }}
                   </h2>
                   <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-16 opacity-60">Architect New Time-Off</p>
                </div>
                
                <form [formGroup]="vacationForm" (ngSubmit)="submitVacationRequest()" class="space-y-8">
                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'personal_hr.leave_archetype' | translate }}</label>
                    <div class="relative group">
                      <select formControlName="leaveTypeId" 
                              class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/50 rounded-[1.5rem] outline-none font-black text-sm text-slate-950 dark:text-white appearance-none cursor-pointer transition-all">
                        @for (lt of leaveTypes; track lt.id) {
                          <option [value]="lt.id">{{ lt.name }}</option>
                        }
                      </select>
                      <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">⌄</div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'personal_hr.commencement' | translate }}</label>
                      <input type="date" formControlName="startDate" 
                             class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/50 rounded-[1.5rem] outline-none font-black text-sm text-slate-950 dark:text-white transition-all">
                    </div>
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'personal_hr.conclusion' | translate }}</label>
                      <input type="date" formControlName="endDate" 
                             class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/50 rounded-[1.5rem] outline-none font-black text-sm text-slate-950 dark:text-white transition-all">
                    </div>
                  </div>

                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'personal_hr.justification' | translate }}</label>
                    <textarea formControlName="reason" rows="4"
                              class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/50 rounded-[1.5rem] outline-none font-black text-sm text-slate-950 dark:text-white resize-none transition-all"
                              [placeholder]="'personal_hr.reasoning_hint' | translate"></textarea>
                  </div>

                  <button type="submit" [disabled]="vacationForm.invalid"
                          class="group relative w-full py-6 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 overflow-hidden">
                    <span class="relative z-10">{{ 'personal_hr.execute_request' | translate }}</span>
                    <div class="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
                </form>
              </div>

              <!-- History -->
              <div class="lg:col-span-8 space-y-8">
                @for (request of vacationRequests; track request.id; let i = $index) {
                  <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200/60 dark:border-white/5 shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:shadow-indigo-500/10 group relative overflow-hidden animate-premium-fade"
                       [style.animation-delay]="(i * 100) + 'ms'">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
                       <div class="flex items-center gap-8">
                         <div class="w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center border-4 bg-slate-50 dark:bg-white/5 border-white dark:border-slate-800 text-indigo-600 shadow-xl group-hover:rotate-3 transition-transform">
                            <span class="text-3xl">🌴</span>
                         </div>
                         <div class="space-y-1">
                            <p class="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                              {{ request.startDate | date:'MMM d, y' }} — {{ request.endDate | date:'MMM d, y' }}
                            </p>
                            <div class="flex items-center gap-3">
                               <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{{ request.leaveTypeName }}</span>
                               <div class="w-1 h-1 rounded-full bg-slate-300"></div>
                               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 {{ request.totalDays }} {{ 'personal_hr.business_days' | translate }}
                               </p>
                            </div>
                         </div>
                       </div>
                       
                       <div class="flex items-center gap-4">
                          <span class="px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] shadow-lg ring-1 ring-inset"
                                [ngClass]="{
                                  'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20': request.status === 'Approved',
                                  'bg-amber-500/10 text-amber-600 ring-amber-500/20': request.status === 'Pending',
                                  'bg-rose-500/10 text-rose-600 ring-rose-500/20': request.status === 'Rejected'
                                }">
                            {{ request.status | translate }}
                          </span>
                       </div>
                    </div>
                    
                    @if (request.reason) {
                      <div class="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                        <p class="text-xs font-medium text-slate-500 leading-relaxed italic">"{{ request.reason }}"</p>
                      </div>
                    }
                  </div>
                }

                @if (vacationRequests.length === 0) {
                  <div class="bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] p-24 text-center border-2 border-dashed border-slate-100 dark:border-white/5">
                     <div class="text-6xl mb-8 animate-premium-pulse">EMPTY</div>
                     <p class="text-sm font-black text-slate-400 uppercase tracking-[0.3em] opacity-40">{{ 'personal_hr.no_leave_records' | translate }}</p>
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
