import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { AuthService } from '../../../core/auth/auth.service';
import { VacationRequest } from '../../../shared/interfaces';

@Component({
  selector: 'app-personal-hr',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">{{ 'personal_hr.title' | translate }}</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'personal_hr.subtitle' | translate }}</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group overflow-hidden relative">
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-colors"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-6">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ monthlySalary | currency:'USD':'symbol':'1.0-0' }}</p>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">{{ 'personal_hr.monthly_salary' | translate }}</p>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group overflow-hidden relative">
            <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-colors"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-6">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
            <p class="text-3xl font-bold text-white">{{ annualLeaveDays }}</p>
            <p class="text-sm text-slate-400">{{ 'personal_hr.annual_leave_remaining' | translate }}</p>
          </div>

          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div class="flex items-center justify-between mb-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-white">{{ pendingRequests }}</p>
            <p class="text-sm text-slate-400">{{ 'personal_hr.pending_requests' | translate }}</p>
          </div>

          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div class="flex items-center justify-between mb-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-white">{{ workDaysThisMonth }}</p>
            <p class="text-sm text-slate-400">{{ 'personal_hr.work_days_this_month' | translate }}</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-2 mb-6">
          <button 
            (click)="activeTab = 'salary'"
            [class.bg-cyan-500]="activeTab === 'salary'"
            [class.text-white]="activeTab === 'salary'"
            [class.bg-slate-700/50]="activeTab !== 'salary'"
            [class.text-slate-400]="activeTab !== 'salary'"
            class="px-6 py-3 rounded-xl text-sm font-medium transition-all">
            {{ 'personal_hr.salary_history' | translate }}
          </button>
          <button 
            (click)="activeTab = 'vacation'"
            [class.bg-cyan-500]="activeTab === 'vacation'"
            [class.text-white]="activeTab === 'vacation'"
            [class.bg-slate-700/50]="activeTab !== 'vacation'"
            [class.text-slate-400]="activeTab !== 'vacation'"
            class="px-6 py-3 rounded-xl text-sm font-medium transition-all">
            {{ 'personal_hr.vacation_requests' | translate }}
          </button>
        </div>

        <!-- Salary Tab -->
        @if (activeTab === 'salary') {
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
            <div class="px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-950/20">
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'personal_hr.salary_breakdown' | translate }}</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                    <th class="px-8 py-5">{{ 'personal_hr.month' | translate }}</th>
                    <th class="px-8 py-5">{{ 'personal_hr.basic_salary' | translate }}</th>
                    <th class="px-8 py-5">{{ 'personal_hr.bonus' | translate }}</th>
                    <th class="px-8 py-5">{{ 'personal_hr.deductions' | translate }}</th>
                    <th class="px-8 py-5">{{ 'personal_hr.net_salary' | translate }}</th>
                    <th class="px-8 py-5">{{ 'personal_hr.status' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                  @for (record of salaryHistory; track record.month) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td class="px-8 py-6 text-sm font-black text-slate-900 dark:text-white tracking-tight">{{ record.month }}</td>
                      <td class="px-8 py-6 text-sm font-black text-slate-600 dark:text-slate-300">{{ record.basicSalary | currency:'USD' }}</td>
                      <td class="px-8 py-6 text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">+{{ record.bonus | currency:'USD' }}</td>
                      <td class="px-8 py-6 text-sm font-black text-rose-600 dark:text-rose-400 tracking-tight">-{{ record.deductions | currency:'USD' }}</td>
                      <td class="px-8 py-6 text-base font-black text-cyan-600 dark:text-cyan-400 tracking-tight">{{ record.netSalary | currency:'USD' }}</td>
                      <td class="px-8 py-6">
                        <span class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all"
                              [ngClass]="{
                                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10': record.status === 'Paid',
                                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10': record.status === 'Pending'
                              }">
                          {{ record.status }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Vacation Tab -->
        @if (activeTab === 'vacation') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- New Request Form -->
            <div class="lg:col-span-1 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 class="text-xl font-bold text-white mb-6">{{ 'personal_hr.new_request' | translate }}</h2>
              
              <form [formGroup]="vacationForm" (ngSubmit)="submitVacationRequest()" class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'personal_hr.leave_type' | translate }}</label>
                  <select formControlName="type" 
                          class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors">
                    <option value="Annual">{{ 'personal_hr.annual_leave' | translate }}</option>
                    <option value="Sick">{{ 'personal_hr.sick_leave' | translate }}</option>
                    <option value="Emergency">{{ 'personal_hr.emergency_leave' | translate }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'personal_hr.start_date' | translate }}</label>
                  <input type="date" formControlName="startDate" 
                         class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors">
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'personal_hr.end_date' | translate }}</label>
                  <input type="date" formControlName="endDate" 
                         class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors">
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'personal_hr.reason' | translate }}</label>
                  <textarea formControlName="reason" rows="3"
                            class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                            placeholder="Optional reason for leave..."></textarea>
                </div>

                <button 
                  type="submit"
                  [disabled]="vacationForm.invalid"
                  class="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ 'personal_hr.submit_request' | translate }}
                </button>
              </form>
            </div>

            <!-- Request History -->
            <div class="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 class="text-xl font-bold text-white mb-6">{{ 'personal_hr.request_history' | translate }}</h2>
              
              <div class="space-y-4">
                @for (request of vacationRequests; track request.id) {
                  <div class="p-4 rounded-xl bg-slate-700/30 border-l-4 transition-colors"
                       [class.border-emerald-500]="request.status === 'Approved'"
                       [class.border-amber-500]="request.status === 'Pending'"
                       [class.border-red-500]="request.status === 'Rejected'">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="flex items-center space-x-3 mb-2">
                          <span class="px-3 py-1 rounded-lg text-xs font-medium"
                                [ngClass]="{
                                  'bg-cyan-500/20 text-cyan-400': request.type === 'Annual',
                                  'bg-purple-500/20 text-purple-400': request.type === 'Sick',
                                  'bg-red-500/20 text-red-400': request.type === 'Emergency'
                                }">
                            {{ request.type }}
                          </span>
                          <span class="text-white font-medium">
                            {{ request.startDate | date:'mediumDate' }} - {{ request.endDate | date:'mediumDate' }}
                          </span>
                        </div>
                        <p class="text-sm text-slate-400">
                          {{ calculateDays(request.startDate, request.endDate) }} days requested
                        </p>
                      </div>
                      <span class="px-4 py-2 rounded-xl text-sm font-medium"
                            [ngClass]="{
                              'bg-emerald-500/20 text-emerald-400': request.status === 'Approved',
                              'bg-amber-500/20 text-amber-400': request.status === 'Pending',
                              'bg-red-500/20 text-red-400': request.status === 'Rejected'
                            }">
                        {{ request.status }}
                      </span>
                    </div>
                  </div>
                }

                @if (vacationRequests.length === 0) {
                  <div class="text-center py-12 text-slate-400">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p>No vacation requests yet</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PersonalHrComponent implements OnInit {
  activeTab: 'salary' | 'vacation' = 'salary';
  vacationForm: FormGroup;
  vacationRequests: VacationRequest[] = [];

  monthlySalary = 3500;
  annualLeaveDays = 18;
  pendingRequests = 1;
  workDaysThisMonth = 22;

  salaryHistory = [
    { month: 'January 2024', basicSalary: 3500, bonus: 500, deductions: 150, netSalary: 3850, status: 'Paid' },
    { month: 'December 2023', basicSalary: 3500, bonus: 1000, deductions: 150, netSalary: 4350, status: 'Paid' },
    { month: 'November 2023', basicSalary: 3500, bonus: 0, deductions: 150, netSalary: 3350, status: 'Paid' },
    { month: 'October 2023', basicSalary: 3500, bonus: 250, deductions: 150, netSalary: 3600, status: 'Paid' },
    { month: 'September 2023', basicSalary: 3500, bonus: 0, deductions: 200, netSalary: 3300, status: 'Paid' },
  ];

  constructor(
    private fb: FormBuilder,
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {
    this.vacationForm = this.fb.group({
      type: ['Annual', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['']
    });
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.monthlySalary = currentUser.salary;

    this.mockDataService.getAllVacationRequests().subscribe(requests => {
      this.vacationRequests = requests;
      this.pendingRequests = requests.filter(r => r.status === 'Pending').length;
    });
  }

  submitVacationRequest() {
    if (this.vacationForm.valid) {
      const newRequest = {
        userId: this.authService.getCurrentUser().id,
        type: this.vacationForm.value.type,
        startDate: this.vacationForm.value.startDate,
        endDate: this.vacationForm.value.endDate,
        status: 'Pending' as const,
        reason: this.vacationForm.value.reason
      };

      this.mockDataService.addVacationRequest(newRequest).subscribe(request => {
        this.vacationRequests.unshift(request);
        this.pendingRequests++;
        this.vacationForm.reset({ type: 'Annual' });
        alert('Vacation request submitted successfully!');
      });
    }
  }

  calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
}
