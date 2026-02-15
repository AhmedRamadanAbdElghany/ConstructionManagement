import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats, SuperAdminStats, CompanySubscription, RecentActivity, SuperAdminActivity } from '../../../core/services/dashboard.service';
import { Project, WorkerPerformance } from '../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        @if (!isPending) {
        <div class="mb-8 text-nowrap overflow-hidden">
          <div class="flex items-center space-x-2 mb-2">
            <span class="px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center border border-indigo-500/20">
              <span class="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              {{ isSuperAdmin ? ('dashboard.platform_management' | translate) : ('dashboard.live' | translate) }}
            </span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {{ 'dashboard.welcome' | translate }}, {{ currentUser.fullName }}! <span class="text-indigo-500">🏢</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">{{ isSuperAdmin ? ('dashboard.revenue_analytics' | translate) : ('dashboard.overview_subtitle' | translate) }}</p>
        </div>
        }

        <!-- ──────────────────────────────────────────────────────────────────
             PENDING APPROVAL VIEW (New Company Registrants)
             ────────────────────────────────────────────────────────────────── -->
        @if (isPending) {
          <div class="max-w-4xl mx-auto py-12 px-4">
            <!-- Welcome Header -->
            <div class="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h2 class="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                Welcome to <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">STRUCT</span>, {{ firstName }}! 🚀
              </h2>
              <p class="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                We're excited to have you on board. Your professional workspace is being prepared to deliver a premium management experience.
              </p>
            </div>

            <!-- Modern Progress Tracker -->
            <div class="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-200 dark:border-white/5 shadow-3xl relative overflow-hidden mb-12 group transition-all duration-500 hover:shadow-cyan-500/10">
              <div class="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-colors"></div>
              
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-16 px-4">
                   <h3 class="text-xs font-black text-cyan-500 uppercase tracking-[0.3em]">Activation Progress</h3>
                   <div class="px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                     Live Status: Auditing
                   </div>
                </div>

                <!-- Stepper -->
                <div class="relative flex justify-between items-start">
                  <!-- Progress Line Background -->
                  <div class="absolute top-8 left-[10%] right-[10%] h-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <!-- Active Line -->
                   <div class="absolute top-8 left-[10%] w-[55%] h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full shadow-lg shadow-cyan-500/30"></div>

                  <!-- Step 1: Created -->
                  <div class="relative z-20 flex flex-col items-center w-1/4">
                    <div class="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p class="mt-4 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Created</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mt-1 italic tracking-widest">Completed</p>
                  </div>

                  <!-- Step 2: Verification -->
                  <div class="relative z-20 flex flex-col items-center w-1/4">
                    <div class="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <p class="mt-4 text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Verification</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mt-1 italic tracking-widest">Verified</p>
                  </div>

                  <!-- Step 3: Admin Audit -->
                  <div class="relative z-20 flex flex-col items-center w-1/4">
                    <div class="w-20 h-20 -mt-2 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/40 ring-4 ring-white dark:ring-slate-950 transition-all group-hover:scale-110">
                      <div class="flex flex-col items-center">
                        <svg class="w-10 h-10 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                    </div>
                    <p class="mt-4 text-sm font-black text-cyan-500 uppercase tracking-widest">Audit</p>
                    <p class="text-[10px] text-cyan-500/60 font-black uppercase mt-1 tracking-widest">In Progress</p>
                  </div>

                  <!-- Step 4: Activation -->
                  <div class="relative z-20 flex flex-col items-center w-1/4 opacity-40">
                    <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-white/5 transition-transform group-hover:scale-105">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <p class="mt-4 text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-wider">Activation</p>
                  </div>
                </div>

                <div class="mt-20 p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-left flex items-start gap-6">
                  <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 text-cyan-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h4 class="text-base font-black text-slate-900 dark:text-white mb-2 leading-none uppercase tracking-wide">What happens next?</h4>
                    <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                      Our compliance team is reviewing your company documents and registration details. This typically takes <span class="text-cyan-500 font-bold">1-2 business days</span>. You will receive an email and a system notification as soon as your professional dashboard is unlocked.
                    </p>
                  </div>
                </div>
              </div>
            </div>


          </div>
        }
        
        <!-- ──────────────────────────────────────────────────────────────────
             SUPER ADMIN DASHBOARD
             ────────────────────────────────────────────────────────────────── -->
        @else if (isSuperAdmin) {
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
                   <span class="text-emerald-500 text-sm font-black">+4 {{ 'common.new' | translate }}</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ saStats.totalCompanies }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.global_companies' | translate }}</p>
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
                   <span class="text-emerald-500 text-sm font-black">93% {{ 'project_detail.health_score' | translate }}</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ saStats.activeSubscriptions }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.active_licenses' | translate }}</p>
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
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.mrr' | translate }}</p>
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
                  <span class="px-2 py-1 bg-rose-500 text-white rounded text-[10px] font-black tracking-tighter uppercase animate-pulse">{{ 'dashboard.action_required' | translate }}</span>
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ saStats.pendingOnboardings }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.pending_onboardings' | translate }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Subscription Growth Chart -->
            <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="flex items-center justify-between mb-8">
                 <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{{ 'dashboard.revenue_analytics' | translate }}</h2>
                <div class="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                  <button class="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black shadow-sm">{{ 'dashboard.monthly' | translate }}</button>
                  <button class="px-4 py-2 rounded-lg text-slate-400 text-xs font-black uppercase">{{ 'dashboard.yearly' | translate }}</button>
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
                <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{{ 'dashboard.system_activity' | translate }}</h2>
              </div>
              
              <div class="space-y-6">
                @for (act of saActivities; track act.id) {
                  <div class="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-100/50">
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
                }
              </div>
            </div>
          </div>

          <!-- Active Subscriptions Table -->
          <div class="mt-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'dashboard.active_subscriptions' | translate }}</h2>
              <a routerLink="/admin/companies" class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:translate-x-1 transition-transform inline-flex items-center">
                {{ 'dashboard.manage_orgs' | translate }} 
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
              </a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30">
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.organization' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.license_plan' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.billing_status' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.next_payment' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'dashboard.mrr_share' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                  @for (sub of subscriptions; track sub.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td class="px-8 py-6 font-black text-slate-900 dark:text-white">{{ sub.companyName }}</td>
                      <td class="px-8 py-6">
                        <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">{{ sub.plan }}</span>
                      </td>
                      <td class="px-8 py-6">
                        <span class="text-xs font-bold" [ngClass]="sub.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'">{{ 'projects.' + sub.status.toLowerCase() | translate }}</span>
                      </td>
                      <td class="px-8 py-6 text-sm text-slate-500 font-medium">{{ sub.nextPayment }}</td>
                      <td class="px-8 py-6">
                        <span class="font-black text-slate-800 dark:text-slate-200">{{ sub.amount | currency }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } 
        
        <!-- ──────────────────────────────────────────────────────────────────
             CLIENT DASHBOARD (NormalUser / Apartment Owner)
             ────────────────────────────────────────────────────────────────── -->
        @else if (isClient) {
          @if (isUnassignedClient) {
            <div class="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div class="text-center mb-16">
                <div class="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/20 rotate-3">
                  <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Your Construction Journey Starts Here</h2>
                <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                  Join a professional company to manage your project, or explore our curated list of suppliers and partners nearby.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <!-- Find a Firm -->
                <a routerLink="/browse-firms" class="group bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-cyan-500/10 transition-all duration-500 text-left relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
                  <div class="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase">Browse Verified Firms</h3>
                  <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">Find the perfect partner for your construction or renovation needs. Compare portfolios and reviews.</p>
                  <span class="text-cyan-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">Explore Firms <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="3" d="M9 5l7 7-7 7"/></svg></span>
                </a>

                <!-- Find Suppliers -->
                <a routerLink="/admin/vendors/discovery" class="group bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 text-left relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
                  <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  </div>
                  <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase">Nearby Suppliers</h3>
                  <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">Source materials directly from local vendors. Get the best prices on cement, steel, and more.</p>
                  <span class="text-indigo-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">Find Suppliers <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="3" d="M9 5l7 7-7 7"/></svg></span>
                </a>
              </div>
            </div>
          } @else {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <!-- Left Side: Financial Status & Progress -->
            <div class="lg:col-span-4 space-y-8">
              <!-- Payment Doughnut Card -->
              <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
                
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-10 flex items-center gap-2">
                  <span class="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-sm">💳</span>
                  {{ 'dashboard.investment_status' | translate }}
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
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{{ 'daily_log.remaining' | translate }}</p>
                    <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ (clientStats.totalPaid / clientStats.totalContract * 100) | number:'1.0-0' }}%</p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span class="text-xs font-black text-slate-500 uppercase tracking-widest">{{ 'dashboard.total_paid' | translate }}</span>
                    </div>
                    <span class="text-sm font-black text-slate-900 dark:text-white">{{ clientStats.totalPaid | currency }}</span>
                  </div>
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                      <span class="text-xs font-black text-slate-500 uppercase tracking-widest">{{ 'daily_log.remaining' | translate }}</span>
                    </div>
                    <span class="text-sm font-black text-slate-900 dark:text-white">{{ (clientStats.totalContract - clientStats.totalPaid) | currency }}</span>
                  </div>
                </div>
              </div>

              <!-- Project Health Card -->
              <div class="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                <h3 class="text-lg font-black uppercase tracking-widest mb-8 opacity-80">{{ 'dashboard.unit_progress' | translate }}</h3>
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
                    <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{{ 'dashboard.portfolio_momentum' | translate }}</h3>
                    <p class="text-xs text-slate-500 font-medium mt-1">{{ 'dashboard.momentum_desc' | translate }}</p>
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
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'dashboard.milestones' | translate }}</h3>
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
                              <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{{ 'dashboard.verified_audit' | translate }}</span>
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
        }

        <!-- ──────────────────────────────────────────────────────────────────
             WORKER DASHBOARD (CompanyUser)
             ────────────────────────────────────────────────────────────────── -->
        @else if (isWorker) {
          <div class="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            <!-- Worker Top Section: Profile & Metrics -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
               
               <!-- Profile Card -->
               <div class="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-colors"></div>
                  
                  <div class="relative flex flex-col items-center">
                    <div class="relative mb-6">
                      <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 p-1 shadow-lg group-hover:scale-105 transition-transform duration-500">
                        <div class="w-full h-full bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden">
                           <span class="text-4xl">👷‍♂️</span>
                        </div>
                      </div>
                      <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    </div>

                    <div class="text-center mb-8">
                      <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ currentUser?.fullName }}</h2>
                      <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        {{ 'sidebar.role_' + (currentUser?.role === 'SuperAdmin' ? 'super' : (currentUser?.role === 'CompanyAdmin' && currentUser?.userType === 2) ? 'owner' : currentUser?.role === 'CompanyAdmin' ? 'admin' : currentUser?.role === 'CompanyUser' ? 'worker' : 'client') | translate }}
                      </p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 w-full pt-6 border-t border-slate-100 dark:border-white/5">
                      <div class="text-center">
                        <p class="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">{{ 'dashboard.efficiency' | translate }}</p>
                        <p class="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">94<span class="text-xs ml-0.5">%</span></p>
                      </div>
                      <div class="text-center border-l border-slate-100 dark:border-white/5">
                        <p class="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">{{ 'sidebar.projects' | translate }}</p>
                        <p class="text-2xl font-black text-slate-900 dark:text-white leading-none">{{ workerProjectStats?.active }}<span class="text-xs text-slate-400 dark:text-slate-600 ml-0.5">/{{ workerProjectStats?.totalProjects }}</span></p>
                      </div>
                    </div>
                  </div>
               </div>

               <!-- Status & Actions -->
               <div class="lg:col-span-8 flex flex-col gap-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    <!-- Productivity Status -->
                    <div class="bg-indigo-600 dark:bg-indigo-900/40 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between group shadow-lg shadow-indigo-600/10">
                      <div class="absolute top-0 right-0 p-8">
                        <div class="flex items-end gap-1 h-6">
                          @for (i of [1,2,3,4,5]; track i) {
                            <div class="w-1 bg-white/40 dark:bg-white/20 rounded-full animate-pulse" [style.height.px]="10 + (i * 3)" [style.animationDelay.ms]="i * 150"></div>
                          }
                        </div>
                      </div>
                      
                      <div>
                        <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{{ 'dashboard.operations_status' | translate }}</p>
                        <h3 class="text-2xl font-black text-white leading-tight mb-2">{{ 'dashboard.productivity_optimal' | translate }}</h3>
                        <p class="text-white/40 text-xs font-medium">{{ 'dashboard.team_interaction' | translate }}: <span class="text-white/80 font-bold">{{ 'dashboard.interaction_high' | translate }}</span></p>
                      </div>

                      <div class="flex items-center gap-3">
                        <div class="flex -space-x-2">
                          @for (i of [1,2,3]; track i) {
                            <div class="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-[10px]">👤</div>
                          }
                        </div>
                        <span class="text-[10px] font-black text-white/60 uppercase tracking-widest">+12 {{ 'sidebar.role_worker' | translate }}</span>
                      </div>
                    </div>

                    <!-- Quick Actions Grid -->
                    <div class="grid grid-cols-1 gap-4">
                      <a routerLink="/worker/daily-log" class="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all group flex items-center justify-between shadow-sm">
                        <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                          </div>
                          <div>
                            <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'dashboard.log_today' | translate }}</p>
                            <p class="text-[10px] text-slate-500 font-medium">{{ 'dashboard.live' | translate }}</p>
                          </div>
                        </div>
                        <svg class="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
                      </a>
                      
                      <a routerLink="/worker/personal-hr" class="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5 hover:border-cyan-500/50 transition-all group flex items-center justify-between shadow-sm">
                        <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          <div>
                            <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'dashboard.finance_vacation' | translate }}</p>
                            <p class="text-[10px] text-slate-500 font-medium">HR Center</p>
                          </div>
                        </div>
                        <svg class="w-5 h-5 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
                      </a>
                    </div>
                  </div>
               </div>
            </div>

            <!-- Warning Banner -->
            @if (workerProjectStats?.causedDelayCount > 0) {
              <div class="bg-rose-500/5 dark:bg-rose-500/10 rounded-3xl p-6 border border-rose-500/20 shadow-sm overflow-hidden relative group">
                 <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div class="flex items-center gap-5">
                       <div class="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
                          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                       </div>
                       <div>
                          <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-0.5">{{ 'dashboard.attention' | translate }}: {{ 'dashboard.urgent_intervention' | translate }}</h3>
                          <p class="text-rose-600 dark:text-rose-500 text-xs font-bold">{{ 'dashboard.intervention_desc' | translate }}</p>
                       </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                       @for (item of workerProjectStats?.projects; track item.project.id) {
                         @if (item.causedDelay) {
                           <div class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-rose-500/10 flex items-center gap-2">
                             <div class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                             <span class="text-xs font-black text-slate-800 dark:text-white uppercase">{{ item.project.name }}</span>
                           </div>
                         }
                       }
                    </div>
                 </div>
              </div>
            }

            <!-- Projects Grid -->
            <div class="space-y-6 pt-2">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ 'dashboard.strategic_portfolio' | translate }}</h3>
                  <p class="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{{ 'dashboard.worker_projects_status' | translate }}</p>
                </div>
                <div class="flex gap-2">
                   <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 shadow-sm cursor-pointer hover:text-indigo-500 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
                   </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (item of workerProjectStats?.projects; track item.project.id) {
                  <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-lg hover:shadow-xl transition-all duration-300 group/item overflow-hidden">
                    <div class="p-6">
                       <div class="flex items-start justify-between mb-6">
                          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg group-hover/item:scale-105 transition-transform"
                               [ngClass]="{
                                 'bg-indigo-500': item.project.status === 'Active',
                                 'bg-emerald-500': item.project.status === 'Completed',
                                 'bg-rose-500': item.project.status === 'Delayed'
                               }">
                            {{ item.project.name.charAt(0) }}
                          </div>
                          @if(item.causedDelay) {
                            <span class="px-2 py-1 rounded bg-rose-500 text-white text-[10px] font-black uppercase shadow-lg animate-bounce">!</span>
                          }
                       </div>

                       <div class="mb-6">
                          <h4 class="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate mb-1">{{ item.project.name }}</h4>
                          <div class="flex items-center gap-2">
                             <span class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">{{ item.role }}</span>
                             <span class="text-[10px] font-bold text-slate-400 flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                {{ item.project.location?.address?.split(',')[0] }}
                             </span>
                          </div>
                       </div>

                       <div class="space-y-2">
                          <div class="flex justify-between items-end">
                             <p class="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{{ 'dashboard.progress' | translate }}</p>
                             <p class="text-sm font-black text-slate-900 dark:text-white">{{ item.project.progress }}%</p>
                          </div>
                          <div class="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                             <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000 group-hover/item:brightness-110" [style.width.%]="item.project.progress"></div>
                          </div>
                       </div>
                    </div>

                    <div class="px-6 py-4 bg-slate-50 dark:bg-transparent border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                       <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ item.project.endDate | date:'MMM yyyy' }}</span>
                       <button [routerLink]="['/admin/projects', item.project.id]" class="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
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
                         [ngClass]="{ 
                           'bg-emerald-500/10 text-emerald-500': activity.type === 'success', 
                           'bg-cyan-500/10 text-cyan-500': activity.type === 'info', 
                           'bg-amber-500/10 text-amber-500': activity.type === 'warning',
                           'bg-rose-500/10 text-rose-500': activity.type === 'danger' || activity.type === 'error'
                         }">
                      <span class="text-xl">
                        @if (activity.type === 'success') { ✓ }
                        @else if (activity.type === 'warning' || activity.type === 'danger' || activity.type === 'error') { ⚠️ }
                        @else { ℹ️ }
                      </span>
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
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ 'dashboard.direct_reports_activity' | translate }}</span>
              </div>
              
              <div class="h-64 flex items-end justify-between px-4 gap-8">
                @for (worker of workerPerformance; track worker.userId) {
                  <div class="flex-1 flex flex-col items-center group/bar cursor-pointer h-full relative">
                    <!-- Tooltip -->
                    <div class="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none mb-2 z-10 whitespace-nowrap">
                      {{ worker.approvedItems }} {{ 'common.approved' | translate }} • {{ worker.rejectedItems }} {{ 'common.rejected' | translate }}
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
                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ worker.efficiency }}% {{ 'dashboard.eff' | translate }}</p>
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
                  @for (p of projects; track p.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td class="px-8 py-6 font-black text-slate-900 dark:text-white">{{ p.name }}</td>
                      <td class="px-8 py-6"><span class="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-black tracking-widest">{{ 'projects.' + p.status.toLowerCase() | translate }}</span></td>
                      <td class="px-8 py-6 font-bold">{{ p.progress }}%</td>
                      <td class="px-8 py-6 font-black text-emerald-500 tracking-tight">{{ p.cashFlow.earned | currency }}</td>
                    </tr>
                  }
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
    
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(0.98); }
    }
    .animate-pulse-slow {
      animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
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

  get isPending(): boolean {
    return this.currentUser?.userType === 2 && !this.currentUser?.companyId;
  }

  get isUnassignedClient(): boolean {
    return this.isClient && this.stats.activeProjects === 0;
  }

  get firstName(): string {
    return this.currentUser?.fullName?.split(' ')[0] || 'Member';
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

  recentActivities: RecentActivity[] = [];

  saActivities: SuperAdminActivity[] = [];

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    console.log('Dashboard Initialized', this.currentUser);
    if (this.isPending) return;

    if (this.isSuperAdmin) {
      this.loadSuperAdminView();
    } else if (this.isWorker) {
      this.loadWorkerView();
    } else {
      this.loadStandardView();
    }
  }

  loadSuperAdminView() {
    this.dashboardService.getSuperAdminStats().subscribe(stats => {
      this.saStats = stats;
    });
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
    this.dashboardService.getCompanySubscriptions().subscribe(subs => {
      this.subscriptions = subs;
    });
    this.dashboardService.getSuperAdminActivities().subscribe(activities => {
      this.saActivities = activities;
    });
  }

  loadWorkerView() {
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
    this.dashboardService.getRecentActivities().subscribe(activities => {
      this.recentActivities = activities;
    });
  }

  loadStandardView() {
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
    this.dashboardService.getRecentActivities().subscribe(activities => {
      this.recentActivities = activities;
    });
  }
}
