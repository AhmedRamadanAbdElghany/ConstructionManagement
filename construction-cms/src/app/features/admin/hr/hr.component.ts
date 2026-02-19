import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { User, Role, Permission } from '../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { RolesService } from '../../../core/services/roles.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { HrService, AttendanceDto, LeaveRequestDto, LeaveTypeDto, CertificationDto, PayrollDto, LeaveRequestStatus, AttendanceStatus, TeamMemberDto } from '../../../core/services/hr.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-hr',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'hr.title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'hr.manage_team_subtitle' | translate }}</p>
          </div>
          <div class="flex space-x-3">
            @if (activeTab === 'attendance') {
               @if (!todayAttendance || todayAttendance.status === 'Absent') {
                  <button (click)="checkIn()" class="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-95">
                    {{ 'hr.check_in' | translate }}
                  </button>
               } @else if (!todayAttendance.checkOut) {
                  <button (click)="checkOut()" class="px-6 py-3 rounded-2xl bg-rose-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30 active:scale-95">
                    {{ 'hr.check_out' | translate }}
                  </button>
               }
            }
            @if (activeTab === 'payroll' && isAdmin) {
               <button (click)="processPayroll()" class="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 active:scale-95">
                 {{ 'hr.process_payroll' | translate }}
               </button>
            }
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-2 p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl mb-8 w-fit border border-slate-200 dark:border-white/5">
          <button (click)="activeTab = 'team'" 
                  [class.bg-white]="activeTab === 'team'"
                  [class.dark:bg-slate-800]="activeTab === 'team'"
                  [class.text-cyan-600]="activeTab === 'team'"
                  [class.shadow-md]="activeTab === 'team'"
                  class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-cyan-500 text-slate-500 dark:text-slate-400">
            {{ 'hr.team_members' | translate }}
          </button>
          <button (click)="activeTab = 'attendance'; loadAttendances()" 
                  [class.bg-white]="activeTab === 'attendance'"
                  [class.dark:bg-slate-800]="activeTab === 'attendance'"
                  [class.text-cyan-600]="activeTab === 'attendance'"
                  [class.shadow-md]="activeTab === 'attendance'"
                  class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-cyan-500 text-slate-500 dark:text-slate-400">
            {{ 'hr.attendance' | translate }}
          </button>
          <button (click)="activeTab = 'leave'; loadLeaveRequests()" 
                  [class.bg-white]="activeTab === 'leave'"
                  [class.dark:bg-slate-800]="activeTab === 'leave'"
                  [class.text-cyan-600]="activeTab === 'leave'"
                  [class.shadow-md]="activeTab === 'leave'"
                  class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-cyan-500 text-slate-500 dark:text-slate-400">
            {{ 'hr.leave_requests' | translate }}
          </button>
          <button (click)="activeTab = 'payroll'; loadPayrolls()" 
                  [class.bg-white]="activeTab === 'payroll'"
                  [class.dark:bg-slate-800]="activeTab === 'payroll'"
                  [class.text-cyan-600]="activeTab === 'payroll'"
                  [class.shadow-md]="activeTab === 'payroll'"
                  class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-cyan-500 text-slate-500 dark:text-slate-400">
            {{ 'hr.payroll' | translate }}
          </button>
          <button (click)="activeTab = 'certifications'; loadCertifications()" 
                  [class.bg-white]="activeTab === 'certifications'"
                  [class.dark:bg-slate-800]="activeTab === 'certifications'"
                  [class.text-cyan-600]="activeTab === 'certifications'"
                  [class.shadow-md]="activeTab === 'certifications'"
                  class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-cyan-500 text-slate-500 dark:text-slate-400">
            {{ 'hr.certifications' | translate }}
          </button>
        </div>

        <!-- Content Area -->
        @if (activeTab === 'team') {
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{{ users.length }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-nowrap">{{ 'hr.total_users' | translate }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{{ workingCount }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-nowrap">{{ 'hr.working' | translate }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{{ absentCount }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-nowrap">{{ 'hr.absent' | translate }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{{ totalSalary | currency:'USD':'symbol':'1.0-0' }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-nowrap">{{ 'hr.total_payroll' | translate }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Table -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden mb-8 transition-all">
            <div class="p-8 border-b border-slate-100 dark:border-white/5">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{{ 'hr.team_members' | translate }}</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50">
                    <th class="px-8 py-5 font-bold">{{ 'hr.name' | translate }}</th>
                    <th class="px-8 py-5 font-bold">{{ 'hr.role' | translate }}</th>
                    <th class="px-8 py-5 font-bold">{{ 'hr.status' | translate }}</th>
                    <th class="px-8 py-5 font-bold">{{ 'hr.salary' | translate }}</th>
                    <th class="px-8 py-5 font-bold">{{ 'hr.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="text-slate-600 dark:text-slate-300">
                  @for (user of users; track user.id) {
                    <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td class="px-8 py-5">
                        <div class="flex items-center space-x-4">
                          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                            {{ user.fullName.charAt(0) }}
                          </div>
                          <div>
                            <p class="text-base font-bold text-slate-900 dark:text-white tracking-tight">{{ user.fullName }}</p>
                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{{ user.email }}</p>
                            @if (user.reportsToId) {
                              <p class="text-[9px] text-indigo-500 font-bold uppercase tracking-tighter mt-1 italic">{{ 'hr.reports_to' | translate }}: {{ getUserName(user.reportsToId) }}</p>
                            }
                          </div>
                        </div>
                      </td>
                      <td class="px-8 py-5">
                        <span class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
                              [ngClass]="{
                                'bg-purple-500/10 text-purple-600 dark:text-purple-400': user.role === 'SuperAdmin',
                                'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400': user.role === 'CompanyAdmin',
                                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': user.role === 'CompanyUser',
                                'bg-slate-500/10 text-slate-600 dark:text-slate-400': user.role === 'NormalUser'
                              }">
                          {{ 'sidebar.role_' + (user.role === 'SuperAdmin' ? 'super' : user.role === 'CompanyAdmin' ? 'admin' : user.role === 'CompanyUser' ? 'worker' : 'client') | translate }}
                        </span>
                      </td>
                      <td class="px-8 py-5">
                        <div class="flex items-center space-x-3">
                          <span class="w-2.5 h-2.5 rounded-full"
                                [ngClass]="{
                                  'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]': user.status === 'Working',
                                  'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]': user.status === 'Absent',
                                  'bg-slate-400': user.status === 'Client'
                                }">
                          </span>
                          <span class="text-sm font-bold uppercase tracking-widest"
                                [ngClass]="{
                                  'text-emerald-600 dark:text-emerald-400': user.status === 'Working',
                                  'text-rose-600 dark:text-rose-400': user.status === 'Absent',
                                  'text-slate-500': user.status === 'Client'
                                }">
                            {{ (user.status === 'Working' ? 'hr.working' : user.status === 'Absent' ? 'hr.absent' : 'sidebar.role_client') | translate }}
                          </span>
                        </div>
                      </td>
                      <td class="px-8 py-5">
                        @if (user.salary > 0) {
                          <p class="text-base font-bold text-slate-900 dark:text-white tracking-tight">{{ user.salary | currency:'USD':'symbol':'1.0-0' }}</p>
                        } @else {
                          <span class="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">{{ 'common.not_available' | translate }}</span>
                        }
                      </td>
                      <td class="px-8 py-5">
                        <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            (click)="openNotes(user)" 
                            class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-cyan-500 transition-all active:scale-90"
                             [title]="'hr.view_notes' | translate">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (activeTab === 'attendance') {
           <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all p-8">
              <div class="flex items-center justify-between mb-8">
                 <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{{ 'hr.attendance' | translate }}</h2>
                 <input type="date" [(ngModel)]="attendanceDate" (change)="loadAttendances()" class="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-sm font-bold">
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50">
                      <th class="px-8 py-5 font-bold">{{ 'hr.name' | translate }}</th>
                      <th class="px-8 py-5 font-bold">{{ 'hr.check_in' | translate }}</th>
                      <th class="px-8 py-5 font-bold">{{ 'hr.check_out' | translate }}</th>
                      <th class="px-8 py-5 font-bold">{{ 'hr.status' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600 dark:text-slate-300">
                    @for (att of attendances; track att.id) {
                      <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td class="px-8 py-5 font-bold">{{ att.userFullName }}</td>
                        <td class="px-8 py-5 font-bold">{{ att.checkIn | date:'shortTime' }}</td>
                        <td class="px-8 py-5 font-bold">{{ att.checkOut | date:'shortTime' }}</td>
                        <td class="px-8 py-5">
                           <span class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                 [ngClass]="{
                                   'bg-emerald-500/10 text-emerald-600': att.status === 'Present',
                                   'bg-amber-500/10 text-amber-600': att.status === 'Late',
                                   'bg-rose-500/10 text-rose-600': att.status === 'Absent'
                                 }">
                             {{ att.status }}
                           </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
           </div>
        }

        @if (activeTab === 'leave') {
           <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all p-8">
              <div class="flex items-center justify-between mb-8">
                 <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{{ 'hr.leave_requests' | translate }}</h2>
                 <button (click)="openLeaveRequestModal()" class="px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest">{{ 'hr.request_leave' | translate }}</button>
              </div>

              <div class="grid grid-cols-1 gap-4">
                 @for (req of leaveRequests; track req.id) {
                    <div class="p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] hover:shadow-lg transition-all">
                       <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center space-x-4">
                             <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">
                                {{ req.userFullName.charAt(0) }}
                             </div>
                             <div>
                                <h3 class="font-bold text-slate-900 dark:text-white">{{ req.userFullName }}</h3>
                                <p class="text-xs text-slate-500 font-bold uppercase tracking-tight">{{ req.leaveTypeName }}</p>
                             </div>
                          </div>
                          <span class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                [ngClass]="{
                                  'bg-amber-500/10 text-amber-600': req.status === 'Pending',
                                  'bg-emerald-500/10 text-emerald-600': req.status === 'Approved',
                                  'bg-rose-500/10 text-rose-600': req.status === 'Rejected'
                                }">
                             {{ req.status }}
                          </span>
                       </div>
                       <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <div class="flex space-x-6">
                             <span>{{ req.startDate | date }} - {{ req.endDate | date }}</span>
                             <span>{{ req.totalDays }} {{ 'hr.total_days' | translate }}</span>
                          </div>
                          @if (req.status === 'Pending' && isAdmin) {
                             <div class="flex space-x-2">
                                <button (click)="reviewLeave(req.id, true)" class="text-emerald-500 hover:text-emerald-600">{{ 'hr.approve' | translate }}</button>
                                <button (click)="reviewLeave(req.id, false)" class="text-rose-500 hover:text-rose-600">{{ 'hr.reject' | translate }}</button>
                             </div>
                          }
                       </div>
                    </div>
                 }
              </div>
           </div>
        }

        @if (activeTab === 'payroll') {
           <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all p-8">
              <div class="flex items-center justify-between mb-8">
                 <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{{ 'hr.payroll' | translate }}</h2>
                 <div class="flex space-x-4">
                    <select [(ngModel)]="payrollMonth" (change)="loadPayrolls()" class="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-sm font-bold">
                       @for (m of months; track m) {
                          <option [value]="m">{{ m }}</option>
                       }
                    </select>
                    <select [(ngModel)]="payrollYear" (change)="loadPayrolls()" class="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-sm font-bold">
                       @for (y of [2024, 2025, 2026]; track y) {
                          <option [value]="y">{{ y }}</option>
                       }
                    </select>
                 </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50">
                      <th class="px-8 py-5 font-bold">{{ 'hr.name' | translate }}</th>
                      <th class="px-8 py-5 font-bold">{{ 'hr.base_salary' | translate }}</th>
                      <th class="px-8 py-5 font-bold">{{ 'hr.deductions' | translate }}</th>
                      <th class="px-8 py-5 font-bold">{{ 'hr.net_salary' | translate }}</th>
                      <th class="px-8 py-5 font-bold">{{ 'hr.status' | translate }}</th>
                      <th class="px-8 py-5 font-bold">{{ 'hr.actions' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600 dark:text-slate-300">
                    @for (p of payrolls; track p.id) {
                      <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td class="px-8 py-5 font-bold">{{ p.userFullName }}</td>
                        <td class="px-8 py-5 font-bold">{{ p.baseSalary | currency:'USD' }}</td>
                        <td class="px-8 py-5 font-bold text-rose-500">- {{ p.deductions | currency:'USD' }}</td>
                        <td class="px-8 py-5 font-bold text-slate-900 dark:text-white">{{ p.netSalary | currency:'USD' }}</td>
                        <td class="px-8 py-5">
                           <span class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                 [ngClass]="{
                                   'bg-emerald-500/10 text-emerald-600': p.isPaid,
                                   'bg-amber-500/10 text-amber-600': !p.isPaid
                                 }">
                             {{ (p.isPaid ? 'hr.paid' : 'hr.pending') | translate }}
                           </span>
                        </td>
                        <td class="px-8 py-5">
                           @if (!p.isPaid && isAdmin) {
                              <button (click)="markAsPaid(p.id)" class="text-cyan-500 hover:text-cyan-600 font-bold uppercase text-xs tracking-widest">{{ 'hr.pay' | translate }}</button>
                           }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
           </div>
        }

        @if (activeTab === 'certifications') {
           <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all p-8">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'hr.certifications' | translate }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 @for (cert of certifications; track cert.id) {
                    <div class="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-3xl border border-slate-100 dark:border-white/5 relative group">
                       <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 mb-4">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                       </div>
                       <h3 class="font-bold text-slate-900 dark:text-white text-lg tracking-tight mb-1">{{ cert.name }}</h3>
                       <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{{ cert.issuingAuthority }}</p>
                       <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-4 border-t border-slate-100 dark:border-white/5">
                          <span>EXP: {{ cert.expiryDate | date:'mediumDate' }}</span>
                          @if (cert.isVerified) {
                             <span class="text-emerald-500">{{ 'hr.verified' | translate }}</span>
                          }
                       </div>
                    </div>
                 }
              </div>
           </div>
        }

      </div>
    </div>

    <!-- Notes Drawer -->
    @if (selectedUserForNotes) {
      <div class="fixed inset-0 bg-black/40 z-40" (click)="selectedUserForNotes = null"></div>
      <div class="fixed inset-y-0 right-0 w-96 bg-slate-800 shadow-2xl z-50 border-l border-slate-700/50 transform transition-transform duration-300">
        <div class="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">{{ 'hr.notes_for' | translate }} {{ selectedUserForNotes.fullName }}</h3>
          <button (click)="selectedUserForNotes = null" 
                  class="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <textarea 
            class="w-full h-64 px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
            [value]="selectedUserForNotes.notes || ('hr.no_notes_available' | translate)"
            readonly>
          </textarea>
          <p class="text-xs text-slate-500 mt-4">{{ 'hr.notes_readonly_hint' | translate }}</p>
        </div>
      </div>
    }
  `
})
export class HrComponent implements OnInit {
  activeTab: 'team' | 'attendance' | 'leave' | 'certifications' | 'payroll' = 'team';
  users: TeamMemberDto[] = [];
  selectedUserForNotes: TeamMemberDto | null = null;

  // HR Data
  attendances: AttendanceDto[] = [];
  todayAttendance: AttendanceDto | null = null;
  attendanceDate: string = new Date().toISOString().split('T')[0];

  leaveRequests: LeaveRequestDto[] = [];
  leaveTypes: LeaveTypeDto[] = [];

  certifications: CertificationDto[] = [];

  // Payroll Data
  payrolls: PayrollDto[] = [];
  payrollMonth: number = new Date().getMonth() + 1;
  payrollYear: number = new Date().getFullYear();
  months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Dynamic role-permission matrix
  companyRoles: Role[] = [];
  allPermissions: Permission[] = [];
  isLoadingMatrix = true;

  isAdmin = false;

  private destroyRef = inject(DestroyRef);
  private hrService = inject(HrService);
  private rolesService = inject(RolesService);
  private authService = inject(AuthService);
  private i18nService = inject(I18nService);

  ngOnInit() {
    this.checkAdminStatus();
    this.loadRolesAndPermissions();
    this.loadTeamMembers();
    this.loadTodayAttendance();

    this.i18nService.onLanguageChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadRolesAndPermissions();
      });
  }

  get workingCount(): number {
    return this.users.filter(u => u.status === 'Working').length;
  }

  get absentCount(): number {
    return this.users.filter(u => u.status === 'Absent').length;
  }

  get totalSalary(): number {
    return this.users.reduce((sum, u) => sum + (u.salary || 0), 0);
  }

  private checkAdminStatus() {
    const user = this.authService.getCurrentUser();
    const role = user?.role;
    this.isAdmin = role === 'CompanyAdmin' || role === 'SuperAdmin';
  }

  private loadTeamMembers() {
    this.hrService.getTeamMembers().subscribe({
      next: (data) => this.users = data,
      error: (err) => {
        console.error('Failed to load team members:', err);
        this.users = [];
      }
    });
  }

  loadAttendances() {
    this.hrService.getAttendances(this.attendanceDate).subscribe({
      next: (data) => this.attendances = data,
      error: (err) => {
        console.error('Failed to load attendances:', err);
        this.attendances = [];
      }
    });
  }

  private loadTodayAttendance() {
    this.hrService.getTodayAttendance().subscribe({
      next: (att) => this.todayAttendance = att,
      error: () => this.todayAttendance = null
    });
  }

  checkIn() {
    this.hrService.checkIn({}).subscribe({
      next: () => {
        this.loadTodayAttendance();
        this.loadAttendances();
      },
      error: (err) => {
        console.error('Check-in failed:', err);
        alert('Check-in failed. Please try again.');
      }
    });
  }

  checkOut() {
    this.hrService.checkOut({}).subscribe({
      next: () => {
        this.loadTodayAttendance();
        this.loadAttendances();
      },
      error: (err) => {
        console.error('Check-out failed:', err);
        alert('Check-out failed. Please try again.');
      }
    });
  }

  loadLeaveRequests() {
    this.hrService.getLeaveRequests().subscribe({
      next: (data) => this.leaveRequests = data,
      error: (err) => {
        console.error('Failed to load leave requests:', err);
        this.leaveRequests = [];
      }
    });
  }

  loadCertifications() {
    this.hrService.getCertifications().subscribe({
      next: (data) => this.certifications = data,
      error: (err) => {
        console.error('Failed to load certifications:', err);
        this.certifications = [];
      }
    });
  }

  loadPayrolls() {
    this.hrService.getPayrolls(this.payrollMonth, this.payrollYear).subscribe({
      next: (data) => this.payrolls = data,
      error: (err) => {
        console.error('Failed to load payrolls:', err);
        this.payrolls = [];
      }
    });
  }

  processPayroll() {
    this.hrService.processPayroll(this.payrollMonth, this.payrollYear).subscribe({
      next: () => this.loadPayrolls(),
      error: (err) => {
        console.error('Failed to process payroll:', err);
        alert('Failed to process payroll. Please try again.');
      }
    });
  }

  markAsPaid(id: number) {
    this.hrService.markAsPaid(id).subscribe({
      next: () => this.loadPayrolls(),
      error: (err) => {
        console.error('Failed to mark as paid:', err);
        alert('Failed to mark as paid. Please try again.');
      }
    });
  }

  reviewLeave(id: number, approved: boolean) {
    const reason = approved ? null : prompt('Enter rejection reason:');
    if (!approved && !reason) return;

    this.hrService.reviewLeaveRequest(id, {
      status: approved ? LeaveRequestStatus.Approved : LeaveRequestStatus.Rejected,
      rejectionReason: reason
    }).subscribe({
      next: () => this.loadLeaveRequests(),
      error: (err) => {
        console.error('Failed to review leave request:', err);
        alert('Failed to review leave request. Please try again.');
      }
    });
  }

  openLeaveRequestModal() {
    alert('Leave request modal would open here.');
  }

  private loadRolesAndPermissions(): void {
    this.isLoadingMatrix = true;
    const currentUser = this.authService.getCurrentUser();
    const companyId = currentUser?.companyId;

    if (!companyId) {
      this.isLoadingMatrix = false;
      return;
    }

    this.rolesService.getRoles(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (roles) => {
          this.companyRoles = roles || [];
          this.isLoadingMatrix = false;
        },
        error: () => this.isLoadingMatrix = false
      });

    this.rolesService.getPermissions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (permissions) => {
          this.allPermissions = permissions || [];
        }
      });
  }

  getPermissionTranslationKey(permissionName: string): string {
    const key = permissionName.toLowerCase().replace(/ /g, '_');
    return `hr.permission_${key}`;
  }

  hasPermission(role: Role, permissionId: number): boolean {
    if (!role.permissions) return false;
    return role.permissions.some(p => p.id === permissionId);
  }

  getUserName(id: number): string {
    const u = this.users.find(x => x.id === id);
    return u ? u.fullName : 'Unknown';
  }

  openNotes(user: TeamMemberDto) {
    this.selectedUserForNotes = user;
  }
}
