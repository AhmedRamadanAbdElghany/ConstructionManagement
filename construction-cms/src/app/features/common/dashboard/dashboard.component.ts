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
             CLIENT DASHBOARD (NormalUser / Apartment Owner)
             ────────────────────────────────────────────────────────────────── -->
        @else if (isClient) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <!-- Left Side: Financial Status & Progress -->
            <div class="lg:col-span-4 space-y-8">
              <!-- Payment Doughnut Card -->
              <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
                
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-10 flex items-center gap-2">
                  <span class="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-sm">💳</span>
                  Investment Status
                </h3>

                <div class="relative w-64 h-64 mx-auto mb-10">
                  <!-- SVG Doughnut Chart -->
                  <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <!-- Background Circle -->
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" stroke-width="12" class="text-slate-100 dark:text-slate-800/50" />
                    <!-- Progress Circle -->
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#cyanGradient)" stroke-width="12" 
                            stroke-dasharray="251.2" 
                            [attr.stroke-dashoffset]="251.2 * (1 - clientStats.totalPaid / clientStats.totalContract)"
                            stroke-linecap="round" 
                            class="transition-all duration-1000 ease-out" />
                    
                    <defs>
                      <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#06b6d4" />
                        <stop offset="100%" stop-color="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <!-- Center Overlay -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Paid</p>
                    <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ (clientStats.totalPaid / clientStats.totalContract * 100) | number:'1.0-0' }}%</p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Total Paid</span>
                    </div>
                    <span class="text-sm font-black text-slate-900 dark:text-white">{{ clientStats.totalPaid | currency }}</span>
                  </div>
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                      <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Remaining</span>
                    </div>
                    <span class="text-sm font-black text-slate-900 dark:text-white">{{ (clientStats.totalContract - clientStats.totalPaid) | currency }}</span>
                  </div>
                </div>
              </div>

              <!-- Project Health Card -->
              <div class="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                <h3 class="text-lg font-black uppercase tracking-widest mb-8 opacity-80">Unit Progress</h3>
                <div class="flex items-end gap-4 mb-4">
                  <span class="text-6xl font-black tracking-tighter">{{ clientStats.projectProgress }}%</span>
                  <span class="mb-2 text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Phase 3: Finishing</span>
                </div>
                <div class="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                   <div class="h-full bg-white transition-all duration-1000" [style.width.%]="clientStats.projectProgress"></div>
                </div>
                <p class="mt-6 text-sm font-medium text-white/70 italic">"{{ clientStats.currentStatusNote }}"</p>
              </div>
            </div>

            <!-- Right Side: Project Portfolio & Milestones -->
            <div class="lg:col-span-8 space-y-8">
              <!-- Projects Activity Chart -->
              <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
                <div class="flex items-center justify-between mb-10">
                  <div>
                    <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Portfolio Momentum</h3>
                    <p class="text-xs text-slate-500 font-medium mt-1">Monthly completion velocity of your apartment complex</p>
                  </div>
                  <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">📈</div>
                </div>

                <div class="h-64 flex items-end justify-between gap-6 px-4">
                  @for (data of chartData.slice(6); track data.label) {
                    <div class="flex-1 flex flex-col items-center group/bar cursor-pointer h-full relative">
                      <div class="relative w-full flex items-end justify-center h-full pb-6">
                        <div class="w-full max-w-[24px] bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-2xl transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/10 group-hover/bar:brightness-110 group-hover/bar:scale-x-110"
                             [style.height.%]="data.collected + 10">
                             <div class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-black">{{ data.collected + 10 }}%</div>
                        </div>
                      </div>
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{{ data.label }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Real Estate Milestones -->
              <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl relative">
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Executive Milestones</h3>
                <div class="space-y-6">
                  @for (m of clientStats.milestones; track m.label) {
                    <div class="flex gap-6 p-6 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors border border-transparent hover:border-slate-100">
                      <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <span class="text-2xl">{{ m.done ? '✅' : '🕙' }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                          <h4 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ m.label }}</h4>
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ m.date }}</span>
                        </div>
                        <p class="text-sm text-slate-500 font-medium leading-relaxed">{{ m.desc }}</p>
                        @if (m.done) {
                          <div class="mt-4 flex items-center gap-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                             <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified by Site Audit</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ──────────────────────────────────────────────────────────────────
             WORKER DASHBOARD (CompanyUser)
             ────────────────────────────────────────────────────────────────── -->
        @else if (isWorker) {
          <div class="space-y-8">
            <!-- Profile Welcome & Quick Stats -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <!-- Profile Card -->
              <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative flex flex-col items-center text-center">
                  <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl shadow-indigo-500/30 mb-6 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <div class="w-full h-full bg-white dark:bg-slate-900 rounded-[20px] flex items-center justify-center overflow-hidden">
                       <span class="text-4xl">👷‍♂️</span>
                    </div>
                  </div>
                  <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ currentUser?.fullName }}</h2>
                  <span class="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">
                    {{ currentUser?.role }}
                  </span>
                  
                  <div class="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                    <div class="text-center flex flex-col items-center">
                      <p class="text-2xl font-black text-slate-900 dark:text-white">{{ workerProjectStats?.totalProjects }}</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-1 max-w-[100px]">{{ 'dashboard.assigned_projects' | translate }}</p>
                    </div>
                    <div class="text-center flex flex-col items-center">
                      <p class="text-2xl font-black text-rose-500">{{ workerProjectStats?.delayed }}</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-1 max-w-[100px]">{{ 'dashboard.involved_delayed' | translate }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Main Stats Grid -->
              <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <!-- Delayed Responsibility Warning -->
                 @if (workerProjectStats?.causedDelayCount > 0) {
                   <div class="md:col-span-2 bg-gradient-to-r from-rose-500 to-orange-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-rose-500/30">
                      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                      <div class="relative flex items-center justify-between">
                        <div>
                          <div class="flex items-center space-x-3 mb-2">
                             <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">⚠️</span>
                             <span class="text-xs font-black uppercase tracking-widest opacity-90">{{ 'dashboard.caused_delays' | translate }}</span>
                          </div>
                          <h3 class="text-3xl font-black mb-1">{{ workerProjectStats?.causedDelayCount }} Projects Impacted</h3>
                          <p class="text-sm font-medium opacity-80 max-w-md">Attention required: Some projects are delayed due to tasks assigned to you. Please review standard operating procedures.</p>
                        </div>
                        <div class="hidden md:block">
                           <button class="px-6 py-3 rounded-2xl bg-white text-rose-600 text-sm font-black uppercase tracking-wide hover:bg-rose-50 transition-colors shadow-lg">
                             View Details
                           </button>
                        </div>
                      </div>
                   </div>
                 }

                 <!-- Active Projects Card -->
                 <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 relative group hover:border-emerald-500/30 transition-all">
                    <div class="flex items-center justify-between mb-8">
                      <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <span class="text-4xl font-black text-slate-900 dark:text-white">{{ workerProjectStats?.active }}</span>
                    </div>
                    <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Active Projects</p>
                    <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                       <div class="bg-emerald-500 h-full rounded-full transition-all duration-1000" [style.width.%]="workerProjectStats?.totalProjects ? (workerProjectStats?.active / workerProjectStats?.totalProjects) * 100 : 0"></div>
                    </div>
                 </div>

                 <!-- Completed Projects Card -->
                 <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 relative group hover:border-blue-500/30 transition-all">
                    <div class="flex items-center justify-between mb-8">
                      <div class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span class="text-4xl font-black text-slate-900 dark:text-white">{{ workerProjectStats?.completed }}</span>
                    </div>
                    <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Completed Projects</p>
                     <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                       <div class="bg-blue-500 h-full rounded-full" [style.width.%]="(workerProjectStats?.completed / (workerProjectStats?.totalProjects || 1)) * 100"></div>
                    </div>
                 </div>
              </div>
            </div>

            <!-- Enhanced Projects List -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden p-8">
              <div class="flex items-center justify-between mb-8">
                 <div>
                    <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{{ 'dashboard.worker_projects_status' | translate }}</h2>
                    <p class="text-sm text-slate-500 font-medium">Detailed status overview of all your assigned projects</p>
                 </div>
                 <div class="flex space-x-2">
                    <span class="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-widest">Filter: All</span>
                 </div>
              </div>
              
              <div class="grid grid-cols-1 gap-4">
                @for (item of workerProjectStats?.projects; track item.project.id) {
                  <div class="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
                    <div class="flex items-center space-x-6">
                      <div class="relative">
                         <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                              [ngClass]="{
                                'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30': item.project.status === 'Active',
                                'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30': item.project.status === 'Completed',
                                'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30': item.project.status === 'Delayed'
                              }">
                           {{ item.project.name.charAt(0) }}
                         </div>
                         @if(item.causedDelay) {
                           <div class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px] animate-bounce">!</div>
                         }
                      </div>
                      
                      <div>
                        <h4 class="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-500 transition-colors">{{ item.project.name }}</h4>
                        <div class="flex items-center space-x-3">
                           <span class="text-xs text-slate-500 font-bold uppercase tracking-wide bg-white dark:bg-white/10 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5">{{ item.role }}</span>
                           <span class="text-xs text-slate-400 font-medium flex items-center">
                             <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                             {{ item.project.location?.address || 'Site Location' }}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 md:mt-0 flex items-center space-x-6 pl-22 md:pl-0">
                      <!-- Progress Bar -->
                      <div class="flex flex-col w-32">
                         <div class="flex justify-between mb-1">
                            <span class="text-[10px] uppercase font-bold text-slate-400">Progress</span>
                            <span class="text-[10px] font-black text-slate-700 dark:text-slate-300">{{ item.project.progress }}%</span>
                         </div>
                         <div class="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full bg-indigo-500 rounded-full" [style.width.%]="item.project.progress"></div>
                         </div>
                      </div>

                      <div class="flex flex-col items-end min-w-[120px]">
                        @if (item.causedDelay) {
                          <span class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 mb-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                            <span class="text-[10px] font-black uppercase tracking-widest">Delay Cause</span>
                          </span>
                        } @else {
                           <span class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/5 dark:border-white/5 dark:text-slate-400 mb-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span class="text-[10px] font-black uppercase tracking-widest">On Track</span>
                          </span>
                        }
                        
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Due: {{ item.project.endDate | date:'mediumDate' }}
                        </span>
                      </div>
                      
                      <button class="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
        
        <!-- ──────────────────────────────────────────────────────────────────
             STANDARD DASHBOARD (Admin/Worker fallback)
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

          <!-- Worker Performance Chart -->
          @if (workerPerformance.length > 0) {
            <div class="mt-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none p-8">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'dashboard.team_performance' | translate }}</h2>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Direct Reports Activity</span>
              </div>
              
              <div class="h-64 flex items-end justify-between px-4 gap-8">
                @for (worker of workerPerformance; track worker.userId) {
                  <div class="flex-1 flex flex-col items-center group/bar cursor-pointer h-full relative">
                    <!-- Tooltip -->
                    <div class="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none mb-2 z-10 whitespace-nowrap">
                      {{ worker.approvedItems }} Approved • {{ worker.rejectedItems }} Rejected
                    </div>

                    <div class="relative w-full flex items-end justify-center space-x-2 h-full pb-6">
                      <!-- Approved Bar -->
                      <div class="w-full max-w-[20px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-1000 ease-out shadow-lg hover:brightness-110" 
                           [style.height.%]="(worker.approvedItems / (worker.approvedItems + worker.rejectedItems + 10)) * 100">
                      </div>
                      <!-- Rejected Bar -->
                      <div class="w-full max-w-[20px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-xl transition-all duration-1000 delay-75 shadow-lg hover:brightness-110" 
                           [style.height.%]="(worker.rejectedItems / (worker.approvedItems + worker.rejectedItems + 10)) * 100">
                      </div>
                    </div>
                    
                    <div class="text-center">
                      <p class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter truncate max-w-[80px]">{{ worker.userName }}</p>
                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ worker.efficiency }}% Eff.</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

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
  delayedProjectsStats: { managerName: string, count: number }[] = [];
  workerProjectStats: any;

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

  get isClient(): boolean {
    return this.currentUser?.role === 'NormalUser';
  }

  get isWorker(): boolean {
    return this.currentUser?.role === 'CompanyUser';
  }

  clientStats = {
    totalContract: 250000,
    totalPaid: 185000,
    projectProgress: 74,
    currentStatusNote: 'Plumbing rough-in completed. Interior masonry workflow initiating next week.',
    milestones: [
      { label: 'Structural Shell', date: 'Oct 2025', desc: 'Main frame and slab casting finalized for all floors.', done: true },
      { label: 'Exterior Glazing', date: 'Dec 2025', desc: 'Installation of high-efficiency thermal windows and glass facades.', done: true },
      { label: 'MEP Infrastructure', date: 'Jan 2026', desc: 'Mechanical, electrical and plumbing arterial systems integration.', done: true },
      { label: 'Finishing Phase', date: 'March 2026', desc: 'Execution of premium tiling, paintwork and fixture installation.', done: false }
    ]
  };

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
    console.log('Dashboard Initialized', this.currentUser);
    if (this.isSuperAdmin) {
      this.loadSuperAdminView();
    } else if (this.isWorker) {
      this.loadWorkerView();
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

  loadWorkerView() {
    this.mockDataService.getWorkerProjectStats(this.currentUser.id).subscribe(stats => {
      this.workerProjectStats = stats;
    });
  }

  loadStandardView() {
    this.mockDataService.getProjects().subscribe(projects => {
      this.projects = projects;
    });

    this.mockDataService.getWorkerPerformance().subscribe(perf => {
      this.workerPerformance = perf;
    });

    this.mockDataService.getDelayedProjectsStats().subscribe(stats => {
      this.delayedProjectsStats = stats;
    });

    this.mockDataService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });

    /* if (this.currentUser?.role === 'CompanyAdmin') {
      this.mockDataService.getWorkerPerformance().subscribe(perf => {
        this.workerPerformance = perf;
      });
    } */
  }
}
