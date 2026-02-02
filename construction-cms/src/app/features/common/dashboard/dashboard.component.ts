import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { Project, WorkerPerformance } from '../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8 text-nowrap overflow-hidden">
          <div class="flex items-center space-x-2 mb-2">
            <span class="px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center border border-indigo-500/20">
              <span class="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              {{ isSuperAdmin ? 'Platform Management' : ('dashboard.live' | translate) }}
            </span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {{ 'dashboard.welcome' | translate }}, {{ currentUser.fullName }}! <span class="text-indigo-500">🏢</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">{{ isSuperAdmin ? 'Enterprise Platform Performance & Subscriptions' : ('dashboard.overview_subtitle' | translate) }}</p>
        </div>

        <!-- ──────────────────────────────────────────────────────────────────
             SUPER ADMIN DASHBOARD
             ────────────────────────────────────────────────────────────────── -->
        @if (isSuperAdmin) {
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Companies -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-indigo-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <span class="text-emerald-500 text-sm font-black">+4 new</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ saStats.totalCompanies }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Global Companies</p>
              </div>
            </div>

            <!-- Active Subs -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <span class="text-emerald-500 text-sm font-black">93% Health</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ saStats.activeSubscriptions }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Active Licenses</p>
              </div>
            </div>

            <!-- MRR -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-amber-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span class="text-emerald-500 text-sm font-black">+18% MoM</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ saStats.monthlyRecurringRevenue / 1000 | number:'1.0-0' }}K</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Monthly Revenue (MRR)</p>
              </div>
            </div>

            <!-- Pending -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-rose-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span class="px-2 py-1 bg-rose-500 text-white rounded text-[10px] font-black tracking-tighter uppercase animate-pulse">Action Required</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ saStats.pendingOnboardings }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Pending Onboardings</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Subscription Growth Chart -->
            <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Enterprise Revenue Analytics</h2>
                <div class="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                  <button class="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black shadow-sm">Monthly</button>
                  <button class="px-4 py-2 rounded-lg text-slate-400 text-xs font-black uppercase">Annual</button>
                </div>
              </div>
              
              <div class="h-80 flex items-end justify-between px-4 gap-4 mt-8">
                @for (month of chartData; track month.label) {
                  <div class="flex-1 flex flex-col items-center group/bar cursor-pointer h-full relative">
                    <div class="relative w-full flex items-end justify-center h-full pb-6">
                      <div class="w-full max-w-[16px] bg-gradient-to-t from-indigo-700 via-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 ease-out shadow-lg group-hover/bar:brightness-125"
                           [style.height.%]="month.earned"></div>
                    </div>
                    <span class="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">{{ month.label }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Platform Activity -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">System Activity</h2>
              </div>
              
              <div class="space-y-6">
                <div *ngFor="let act of saActivities" class="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-100/50">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" 
                       [ngClass]="act.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'">
                    <span class="text-xl">{{ act.status === 'success' ? '✓' : '⚡' }}</span>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ act.company }}</h4>
                    <p class="text-xs text-slate-500 mt-0.5 leading-snug">{{ act.action }}</p>
                    <span class="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mt-2 block">{{ act.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Subscriptions Table -->
          <div class="mt-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Company Subscriptions</h2>
              <a routerLink="/admin/companies" class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:translate-x-1 transition-transform inline-flex items-center">
                MANAGE ORGANIZATIONS 
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
              </a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30">
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Organization</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">License Plan</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Billing Status</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Next Payment</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">MRR Share</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                  <tr *ngFor="let sub of subscriptions" class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td class="px-8 py-6 font-black text-slate-900 dark:text-white">{{ sub.companyName }}</td>
                    <td class="px-8 py-6">
                      <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">{{ sub.plan }}</span>
                    </td>
                    <td class="px-8 py-6">
                      <span class="text-xs font-bold" [ngClass]="sub.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'">{{ sub.status }}</span>
                    </td>
                    <td class="px-8 py-6 text-sm text-slate-500 font-medium">{{ sub.nextPayment }}</td>
                    <td class="px-8 py-6">
                      <span class="font-black text-slate-800 dark:text-slate-200">{{ sub.amount | currency }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        } 
        
        <!-- ──────────────────────────────────────────────────────────────────
             STANDARD DASHBOARD (Admin/Worker)
             ────────────────────────────────────────────────────────────────── -->
        @else {
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Active Projects -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-cyan-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <span class="text-emerald-500 dark:text-emerald-400 text-sm font-black flex items-center">+12%</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.activeProjects }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.active_projects' | translate }}</p>
              </div>
            </div>

            <!-- Completed Projects -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.completedProjects }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.completed_projects' | translate }}</p>
              </div>
            </div>

            <!-- Delayed Projects -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-rose-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/15 transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  @if (stats.delayedProjects > 0) {
                    <span class="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-500/20">{{ 'dashboard.attention' | translate }}</span>
                  }
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.delayedProjects }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.delayed_projects' | translate }}</p>
              </div>
            </div>

            <!-- Total Revenue -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-indigo-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span class="text-emerald-500 dark:text-emerald-400 text-sm font-black flex items-center">+23%</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.totalRevenue / 1000000 | number:'1.1-1' }}M</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.total_revenue' | translate }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Project Cash Flow -->
            <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{{ 'dashboard.cash_flow_overview' | translate }}</h2>
              </div>
              <div class="h-80 flex items-end justify-between px-4 gap-4 mt-8">
                @for (month of chartData; track month.label) {
                  <div class="flex-1 flex flex-col items-center group/bar cursor-pointer h-full relative">
                    <div class="relative w-full flex items-end justify-center space-x-1.5 h-full pb-6">
                      <div class="w-full max-w-[12px] bg-gradient-to-t from-cyan-600 via-cyan-400 to-cyan-300 rounded-full transition-all duration-1000 ease-out shadow-lg" [style.height.%]="month.earned"></div>
                      <div class="w-full max-w-[12px] bg-gradient-to-t from-blue-700 via-blue-500 to-blue-300 rounded-full transition-all duration-1000 delay-75 shadow-lg" [style.height.%]="month.collected"></div>
                    </div>
                    <span class="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">{{ month.label }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{{ 'dashboard.recent_activity' | translate }}</h2>
              </div>
              <div class="space-y-4">
                @for (activity of recentActivities; track activity.id) {
                  <div class="flex items-start space-x-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all border border-transparent">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner p-2"
                         [ngClass]="{ 'bg-emerald-500/10 text-emerald-500': activity.type === 'success', 'bg-cyan-500/10 text-cyan-500': activity.type === 'info', 'bg-rose-500/10 text-rose-500': activity.type === 'warning' }">
                      <span class="text-xl">!</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-800 dark:text-white leading-snug">{{ activity.message }}</p>
                      <p class="text-[11px] text-slate-500 font-black uppercase mt-1">{{ activity.time }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Component Tables (Worker Perf & Projects) omitted for brevity in template but logic remains -->
          <!-- Projects Table - Reusable part -->
          <div class="mt-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
             <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'dashboard.projects_overview' | translate }}</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead><tr class="text-left bg-slate-50/50 dark:bg-slate-950/30">
                  <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.project_name' | translate }}</th>
                  <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.status' | translate }}</th>
                  <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.progress' | translate }}</th>
                  <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.cash_flow' | translate }}</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                  <tr *ngFor="let p of projects" class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td class="px-8 py-6 font-black text-slate-900 dark:text-white">{{ p.name }}</td>
                    <td class="px-8 py-6"><span class="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-black tracking-widest">{{ p.status }}</span></td>
                    <td class="px-8 py-6 font-bold">{{ p.progress }}%</td>
                    <td class="px-8 py-6 font-black text-emerald-500 tracking-tight">{{ p.cashFlow.earned | currency }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  projects: Project[] = [];
  workerPerformance: WorkerPerformance[] = [];

  // Standard Admin Stats
  stats = {
    activeProjects: 0,
    completedProjects: 0,
    delayedProjects: 0,
    totalRevenue: 0
  };

  // Super Admin Stats
  saStats = {
    totalCompanies: 0,
    activeSubscriptions: 0,
    monthlyRecurringRevenue: 0,
    pendingOnboardings: 0
  };

  subscriptions: any[] = [];

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === 'SuperAdmin';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'CompanyAdmin' || this.currentUser?.role === 'SuperAdmin';
  }

  chartData = [
    { label: 'Jan', earned: 45, collected: 35 },
    { label: 'Feb', earned: 55, collected: 45 },
    { label: 'Mar', earned: 65, collected: 50 },
    { label: 'Apr', earned: 70, collected: 60 },
    { label: 'May', earned: 80, collected: 70 },
    { label: 'Jun', earned: 75, collected: 65 },
    { label: 'Jul', earned: 85, collected: 80 },
    { label: 'Aug', earned: 90, collected: 75 },
    { label: 'Sep', earned: 95, collected: 85 },
    { label: 'Oct', earned: 100, collected: 90 },
    { label: 'Nov', earned: 88, collected: 82 },
    { label: 'Dec', earned: 92, collected: 88 }
  ];

  recentActivities = [
    { id: 1, type: 'success', message: 'Payment received for Dubai Tower Project', time: '2 minutes ago' },
    { id: 2, type: 'info', message: 'New BOQ item added to Villa Complex', time: '15 minutes ago' },
    { id: 3, type: 'warning', message: 'Commercial Mall Cairo is behind schedule', time: '1 hour ago' },
  ];

  saActivities = [
    { company: 'Al-Massa Construction', action: 'Upgraded to Enterprise Tier', time: '10 MIN AGO', status: 'success' },
    { company: 'BuildIt Solutions', action: 'Monthly payment processed successfully', time: '1 HOUR AGO', status: 'success' },
    { company: 'Skyline Architects', action: 'Subscription canceled', time: '3 HOURS AGO', status: 'danger' },
    { company: 'Urban Development', action: 'New organization onboarded', time: '5 HOURS AGO', status: 'success' },
  ];

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    if (this.isSuperAdmin) {
      this.loadSuperAdminView();
    } else {
      this.loadStandardView();
    }
  }

  loadSuperAdminView() {
    this.mockDataService.getSuperAdminStats().subscribe(stats => {
      this.saStats = stats;
    });
    this.mockDataService.getCompanySubscriptions().subscribe(subs => {
      this.subscriptions = subs;
    });
  }

  loadStandardView() {
    this.mockDataService.getProjects().subscribe(projects => {
      this.projects = projects;
    });

    this.mockDataService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });

    if (this.currentUser?.role === 'CompanyAdmin') {
      this.mockDataService.getWorkerPerformance().subscribe(perf => {
        this.workerPerformance = perf;
      });
    }
  }
}
