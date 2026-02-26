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
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-premium-fade">
          <div class="space-y-1">
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase drop-shadow-sm">{{ 'hr.title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium italic opacity-80">{{ 'hr.manage_team_subtitle' | translate }}</p>
          </div>
          <div class="flex space-x-3">
            @if (activeTab === 'attendance') {
               @if (!todayAttendance || todayAttendance.status === 'Absent') {
                  <button (click)="checkIn()" class="px-8 py-4 rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase tracking-widest text-[10px] hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                    {{ 'hr.check_in' | translate }}
                  </button>
               } @else if (!todayAttendance.checkOut) {
                  <button (click)="checkOut()" class="px-8 py-4 rounded-[1.5rem] bg-gradient-to-r from-rose-500 to-orange-600 text-white font-black uppercase tracking-widest text-[10px] hover:brightness-110 shadow-lg shadow-rose-500/20 active:scale-95 transition-all">
                    {{ 'hr.check_out' | translate }}
                  </button>
               }
            }
            @if (activeTab === 'payroll' && isAdmin) {
               <button (click)="processPayroll()" class="px-8 py-4 rounded-[1.5rem] bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black uppercase tracking-widest text-[10px] hover:brightness-110 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                 {{ 'hr.process_payroll' | translate }}
               </button>
            }
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-[1.5rem] mb-10 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none w-fit animate-premium-fade" style="animation-delay: 100ms">
          <button (click)="activeTab = 'team'" 
                  [class.bg-gradient-to-r]="activeTab === 'team'"
                  [class.from-indigo-600]="activeTab === 'team'"
                  [class.to-blue-700]="activeTab === 'team'"
                  [class.text-white]="activeTab === 'team'"
                  [class.shadow-lg]="activeTab === 'team'"
                  [class.shadow-indigo-500/20]="activeTab === 'team'"
                  class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-indigo-500">
            {{ 'hr.team_members' | translate }}
          </button>
          <button (click)="activeTab = 'attendance'; loadAttendances()" 
                  [class.bg-gradient-to-r]="activeTab === 'attendance'"
                  [class.from-indigo-600]="activeTab === 'attendance'"
                  [class.to-blue-700]="activeTab === 'attendance'"
                  [class.text-white]="activeTab === 'attendance'"
                  [class.shadow-lg]="activeTab === 'attendance'"
                  [class.shadow-indigo-500/20]="activeTab === 'attendance'"
                  class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-indigo-500">
            {{ 'hr.attendance' | translate }}
          </button>
          <button (click)="activeTab = 'leave'; loadLeaveRequests()" 
                  [class.bg-gradient-to-r]="activeTab === 'leave'"
                  [class.from-indigo-600]="activeTab === 'leave'"
                  [class.to-blue-700]="activeTab === 'leave'"
                  [class.text-white]="activeTab === 'leave'"
                  [class.shadow-lg]="activeTab === 'leave'"
                  [class.shadow-indigo-500/20]="activeTab === 'leave'"
                  class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-indigo-500">
            {{ 'hr.leave_requests' | translate }}
          </button>
          <button (click)="activeTab = 'payroll'; loadPayrolls()" 
                  [class.bg-gradient-to-r]="activeTab === 'payroll'"
                  [class.from-indigo-600]="activeTab === 'payroll'"
                  [class.to-blue-700]="activeTab === 'payroll'"
                  [class.text-white]="activeTab === 'payroll'"
                  [class.shadow-lg]="activeTab === 'payroll'"
                  [class.shadow-indigo-500/20]="activeTab === 'payroll'"
                  class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-indigo-500">
            {{ 'hr.payroll' | translate }}
          </button>
          <button (click)="activeTab = 'certifications'; loadCertifications()" 
                  [class.bg-gradient-to-r]="activeTab === 'certifications'"
                  [class.from-indigo-600]="activeTab === 'certifications'"
                  [class.to-blue-700]="activeTab === 'certifications'"
                  [class.text-white]="activeTab === 'certifications'"
                  [class.shadow-lg]="activeTab === 'certifications'"
                  [class.shadow-indigo-500/20]="activeTab === 'certifications'"
                  class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-indigo-500">
            {{ 'hr.certifications' | translate }}
          </button>
        </div>

        <!-- Content Area -->
        @if (activeTab === 'team') {
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-premium-fade" style="animation-delay: 200ms">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">{{ users.length }}</p>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'hr.total_users' | translate }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-premium-fade" style="animation-delay: 300ms">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">{{ workingCount }}</p>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'hr.working' | translate }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-premium-fade" style="animation-delay: 400ms">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-rose-500/20 to-orange-600/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">{{ absentCount }}</p>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'hr.absent' | translate }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-premium-fade" style="animation-delay: 500ms">
              <div class="flex items-center space-x-6">
                <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-amber-500/20 to-yellow-600/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">{{ totalSalary | currency:'USD':'symbol':'1.0-0' }}</p>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'hr.total_payroll' | translate }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Table -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden mb-10 transition-all animate-premium-fade" style="animation-delay: 600ms">
            <div class="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'hr.team_members' | translate }}</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50">
                    <th class="px-8 py-6">{{ 'hr.name' | translate }}</th>
                    <th class="px-8 py-6">{{ 'hr.role' | translate }}</th>
                    <th class="px-8 py-6">{{ 'hr.status' | translate }}</th>
                    <th class="px-8 py-6">{{ 'hr.salary' | translate }}</th>
                    <th class="px-8 py-6">{{ 'hr.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="text-slate-600 dark:text-slate-300">
                  @for (user of users; track user.id; let i = $index) {
                    <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-premium-fade"
                        [style.animation-delay]="(i * 30 + 700) + 'ms'">
                      <td class="px-8 py-6">
                        <div class="flex items-center space-x-5">
                          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            {{ user.fullName.charAt(0) }}
                          </div>
                          <div>
                            <p class="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{{ user.fullName }}</p>
                            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">{{ user.email }}</p>
                            @if (user.reportsToId) {
                              <p class="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                                <span class="w-1 h-1 rounded-full bg-indigo-500"></span>
                                {{ 'hr.reports_to' | translate }}: {{ getUserName(user.reportsToId) }}
                              </p>
                            }
                          </div>
                        </div>
                      </td>
                      <td class="px-8 py-6">
                        <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm"
                               [ngClass]="{
                                 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400': user.role === 'SuperAdmin',
                                 'bg-blue-500/10 text-blue-600 dark:text-blue-400': user.role === 'CompanyAdmin',
                                 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': user.role === 'CompanyUser',
                                 'bg-slate-500/10 text-slate-600 dark:text-slate-400': user.role === 'NormalUser'
                               }">
                          {{ 'sidebar.role_' + (user.role === 'SuperAdmin' ? 'super' : user.role === 'CompanyAdmin' ? 'admin' : user.role === 'CompanyUser' ? 'worker' : 'client') | translate }}
                        </span>
                      </td>
                      <td class="px-8 py-6">
                        <div class="flex items-center space-x-3">
                          <div class="relative flex h-2.5 w-2.5">
                            @if (user.status === 'Working') {
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            }
                            <span class="relative inline-flex rounded-full h-2.5 w-2.5"
                                  [ngClass]="{
                                    'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]': user.status === 'Working',
                                    'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]': user.status === 'Absent',
                                    'bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.5)]': user.status === 'Client'
                                  }">
                            </span>
                          </div>
                          <span class="text-[10px] font-black uppercase tracking-widest"
                                [ngClass]="{
                                  'text-emerald-600 dark:text-emerald-400': user.status === 'Working',
                                  'text-rose-600 dark:text-rose-400': user.status === 'Absent',
                                  'text-slate-500': user.status === 'Client'
                                }">
                            {{ (user.status === 'Working' ? 'hr.working' : user.status === 'Absent' ? 'hr.absent' : 'sidebar.role_client') | translate }}
                          </span>
                        </div>
                      </td>
                      <td class="px-8 py-6">
                        @if (user.salary > 0) {
                          <p class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ user.salary | currency:'USD':'symbol':'1.0-0' }}</p>
                        } @else {
                          <span class="text-slate-300 font-black text-[9px] uppercase tracking-[0.2em] italic leading-none">{{ 'common.not_available' | translate }}</span>
                        }
                      </td>
                      <td class="px-8 py-6">
                        <div class="flex items-center space-x-2">
                          <button 
                            (click)="openNotes(user)" 
                            class="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-white/10 shadow-sm transition-all active:scale-95 group/btn"
                             [title]="'hr.view_notes' | translate">
                            <svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
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
           <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all p-8 animate-premium-fade" style="animation-delay: 200ms">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                 <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'hr.attendance' | translate }}</h2>
                 <div class="relative group mt-4 md:mt-0">
                    <input type="date" [(ngModel)]="attendanceDate" (change)="loadAttendances()" 
                           class="w-full md:w-auto px-8 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-black focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md">
                 </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50">
                      <th class="px-8 py-6">{{ 'hr.name' | translate }}</th>
                      <th class="px-8 py-6">{{ 'hr.check_in' | translate }}</th>
                      <th class="px-8 py-6">{{ 'hr.check_out' | translate }}</th>
                      <th class="px-8 py-6">{{ 'hr.status' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600 dark:text-slate-300">
                    @for (att of attendances; track att.id; let i = $index) {
                      <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-premium-fade"
                          [style.animation-delay]="(i * 30 + 300) + 'ms'">
                        <td class="px-8 py-6 font-black text-slate-900 dark:text-white">{{ att.userFullName }}</td>
                        <td class="px-8 py-6">
                           <div class="flex items-center gap-2 font-black text-indigo-600 dark:text-indigo-400">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             {{ att.checkIn | date:'shortTime' }}
                           </div>
                        </td>
                        <td class="px-8 py-6">
                           <div class="flex items-center gap-2 font-black text-slate-500">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             {{ att.checkOut ? (att.checkOut | date:'shortTime') : '--:--' }}
                           </div>
                        </td>
                        <td class="px-8 py-6">
                           <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm"
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
           <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all p-8 animate-premium-fade" style="animation-delay: 200ms">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                 <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'hr.leave_requests' | translate }}</h2>
                 <button (click)="openLeaveRequestModal()" 
                         class="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black uppercase tracking-widest text-[10px] hover:brightness-110 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                   {{ 'hr.request_leave' | translate }}
                 </button>
              </div>

              <div class="grid grid-cols-1 gap-6">
                 @for (req of leaveRequests; track req.id; let i = $index) {
                    <div class="p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:shadow-xl transition-all animate-premium-fade group"
                         [style.animation-delay]="(i * 50 + 300) + 'ms'">
                       <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                          <div class="flex items-center space-x-5">
                             <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                {{ req.userFullName.charAt(0) }}
                             </div>
                             <div>
                                <h3 class="text-lg font-black text-slate-900 dark:text-white leading-none mb-1">{{ req.userFullName }}</h3>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">{{ req.leaveTypeName }}</p>
                             </div>
                          </div>
                          <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg"
                                [ngClass]="{
                                  'bg-amber-500 shadow-amber-500/20 text-white': req.status === 'Pending',
                                  'bg-emerald-500 shadow-emerald-500/20 text-white': req.status === 'Approved',
                                  'bg-rose-500 shadow-rose-500/20 text-white': req.status === 'Rejected'
                                }">
                             {{ req.status }}
                          </span>
                       </div>
                       <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <div class="flex items-center gap-6">
                             <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-200"></span> {{ req.startDate | date }} - {{ req.endDate | date }}</span>
                             <span class="flex items-center gap-2 text-indigo-500"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> {{ req.totalDays }} {{ 'hr.total_days' | translate }}</span>
                          </div>
                          @if (req.status === 'Pending' && isAdmin) {
                             <div class="flex gap-3">
                                <button (click)="reviewLeave(req.id, true)" class="px-6 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">{{ 'hr.approve' | translate }}</button>
                                <button (click)="reviewLeave(req.id, false)" class="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all">{{ 'hr.reject' | translate }}</button>
                             </div>
                          }
                       </div>
                    </div>
                 }
              </div>
           </div>
        }

        @if (activeTab === 'payroll') {
           <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all p-8 animate-premium-fade" style="animation-delay: 200ms">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                 <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'hr.payroll' | translate }}</h2>
                 <div class="flex flex-wrap items-center gap-4">
                    <div class="relative group">
                       <select [(ngModel)]="payrollMonth" (change)="loadPayrolls()" 
                               class="appearance-none px-8 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-black focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md cursor-pointer pr-12">
                          @for (m of months; track m) {
                             <option [value]="m">{{ m }}</option>
                          }
                       </select>
                       <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                       </div>
                    </div>
                    <div class="relative group">
                       <select [(ngModel)]="payrollYear" (change)="loadPayrolls()" 
                               class="appearance-none px-8 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-black focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md cursor-pointer pr-12">
                          @for (y of [2024, 2025, 2026]; track y) {
                             <option [value]="y">{{ y }}</option>
                          }
                       </select>
                       <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                       </div>
                    </div>
                 </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50">
                      <th class="px-8 py-6">{{ 'hr.name' | translate }}</th>
                      <th class="px-8 py-6">{{ 'hr.base_salary' | translate }}</th>
                      <th class="px-8 py-6">{{ 'hr.deductions' | translate }}</th>
                      <th class="px-8 py-6">{{ 'hr.net_salary' | translate }}</th>
                      <th class="px-8 py-6">{{ 'hr.status' | translate }}</th>
                      <th class="px-8 py-6">{{ 'hr.actions' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600 dark:text-slate-300">
                    @for (p of payrolls; track p.id; let i = $index) {
                      <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-premium-fade"
                          [style.animation-delay]="(i * 30 + 300) + 'ms'">
                        <td class="px-8 py-6 font-black text-slate-900 dark:text-white leading-none">{{ p.userFullName }}</td>
                        <td class="px-8 py-6 font-black text-slate-600">{{ p.baseSalary | currency:'USD' }}</td>
                        <td class="px-8 py-6 font-black text-rose-500/80 bg-rose-500/5">- {{ p.deductions | currency:'USD' }}</td>
                        <td class="px-8 py-6 font-black text-slate-900 dark:text-white text-lg tracking-tight">{{ p.netSalary | currency:'USD' }}</td>
                        <td class="px-8 py-6">
                           <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm"
                                 [ngClass]="{
                                   'bg-emerald-500/10 text-emerald-600': p.isPaid,
                                   'bg-amber-500/10 text-amber-600': !p.isPaid
                                 }">
                             {{ (p.isPaid ? 'hr.paid' : 'hr.pending') | translate }}
                           </span>
                        </td>
                        <td class="px-8 py-6">
                           @if (!p.isPaid && isAdmin) {
                               <button (click)="markAsPaid(p.id)" class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-black uppercase text-[9px] tracking-widest hover:brightness-110 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                                 {{ 'hr.pay' | translate }}
                               </button>
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
           <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all p-8 animate-premium-fade" style="animation-delay: 200ms">
              <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-10">{{ 'hr.certifications' | translate }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 @for (cert of certifications; track cert.id; let i = $index) {
                    <div class="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 relative group animate-premium-fade"
                         [style.animation-delay]="(i * 50 + 300) + 'ms'">
                       <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 shadow-inner ring-1 ring-cyan-500/10">
                          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                       </div>
                       <h3 class="font-black text-slate-900 dark:text-white text-xl tracking-tight leading-tight mb-2">{{ cert.name }}</h3>
                       <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-6 opacity-60">{{ cert.issuingAuthority }}</p>
                       <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-6 border-t border-slate-200 dark:border-white/5">
                          <div class="flex items-center gap-2 text-slate-500">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             EXP: {{ cert.expiryDate | date:'mediumDate' }}
                          </div>
                          @if (cert.isVerified) {
                             <span class="px-3 py-1 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400">{{ 'hr.verified' | translate }}</span>
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
