import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { Project } from '../../../shared/interfaces';
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
        <div class="mb-8">
          <div class="flex items-center space-x-2 mb-2">
            <span class="px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center border border-cyan-500/20">
              <span class="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse"></span>
              {{ 'dashboard.live' | translate }}
            </span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {{ 'dashboard.welcome' | translate }}, {{ currentUser.fullName }}! <span class="text-cyan-500">👋</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'dashboard.overview_subtitle' | translate }}</p>
        </div>

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
                <span class="text-emerald-500 dark:text-emerald-400 text-sm font-black flex items-center">
                  +12%
                </span>
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
                  <span class="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-500/20">
                    {{ 'dashboard.attention' | translate }}
                  </span>
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
                <span class="text-emerald-500 dark:text-emerald-400 text-sm font-black flex items-center">
                  +23%
                </span>
              </div>
              <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.totalRevenue / 1000000 | number:'1.1-1' }}M</p>
              <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'dashboard.total_revenue' | translate }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Cash Flow Chart -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{{ 'dashboard.cash_flow_overview' | translate }}</h2>
              <div class="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                <button class="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black shadow-sm">{{ 'dashboard.monthly' | translate }}</button>
                <button class="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-black transition-colors">{{ 'dashboard.yearly' | translate }}</button>
              </div>
            </div>
            
            <div class="h-80 flex items-end justify-between px-4 gap-4 mt-8">
              @for (month of chartData; track month.label) {
                <div class="flex-1 flex flex-col items-center group/bar cursor-pointer h-full relative">
                  <div class="relative w-full flex items-end justify-center space-x-1.5 h-full pb-6">
                    <!-- Tooltip -->
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 pointer-events-none z-20 whitespace-nowrap shadow-2xl backdrop-blur-xl">
                      <div class="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">{{ month.label }} Analytics</div>
                      <div class="text-xs text-white font-bold">Earned: {{ month.earned }}%</div>
                      <div class="text-xs text-slate-400 font-bold">Collected: {{ month.collected }}%</div>
                    </div>
                    
                    <!-- Bars -->
                    <div class="w-full max-w-[12px] bg-gradient-to-t from-cyan-600 via-cyan-400 to-cyan-300 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_20px_rgba(34,211,238,0.1)] group-hover/bar:shadow-[0_0_30px_rgba(34,211,238,0.4)] group-hover/bar:brightness-110"
                         [style.height.%]="month.earned"></div>
                    <div class="w-full max-w-[12px] bg-gradient-to-t from-blue-700 via-blue-500 to-blue-300 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-75 shadow-[0_0_20px_rgba(37,99,235,0.1)] group-hover/bar:shadow-[0_0_30px_rgba(37,99,235,0.4)] group-hover/bar:brightness-110"
                         [style.height.%]="month.collected"></div>
                  </div>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 group-hover/bar:text-slate-900 dark:group-hover/bar:text-slate-200 transition-colors">{{ month.label }}</span>
                </div>
              }
            </div>
            
            <!-- Legend -->
            <div class="flex items-center justify-center space-x-8 mt-10 pt-6 border-t border-slate-100 dark:border-white/5">
              <div class="flex items-center space-x-3 group/legend cursor-default">
                <div class="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/20 group-hover/legend:scale-125 transition-transform"></div>
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ 'dashboard.earned' | translate }}</span>
              </div>
              <div class="flex items-center space-x-3 group/legend cursor-default">
                <div class="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20 group-hover/legend:scale-125 transition-transform"></div>
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ 'dashboard.collected' | translate }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{{ 'dashboard.recent_activity' | translate }}</h2>
              <a routerLink="/notifications" class="text-cyan-500 text-xs font-black uppercase tracking-widest hover:text-cyan-600 transition-colors">{{ 'dashboard.view_all' | translate }}</a>
            </div>
            
            <div class="space-y-4">
              @for (activity of recentActivities; track activity.id) {
                <div class="flex items-start space-x-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer group/item border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform shadow-inner p-2"
                       [ngClass]="{
                         'bg-emerald-500/10 text-emerald-500': activity.type === 'success',
                         'bg-cyan-500/10 text-cyan-500': activity.type === 'info',
                         'bg-rose-500/10 text-rose-500': activity.type === 'warning'
                       }">
                    @switch (activity.type) {
                      @case ('success') {
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      }
                      @case ('info') {
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      }
                      @case ('warning') {
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      }
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 dark:text-white group-hover/item:text-cyan-600 dark:group-hover/item:text-cyan-400 transition-colors leading-snug">{{ activity.message }}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{{ activity.time }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Projects Table -->
        <div class="mt-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <div class="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">{{ 'dashboard.projects_overview' | translate }}</h2>
            <a routerLink="/admin/projects" class="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors flex items-center">
              {{ 'dashboard.view_all_projects' | translate }}
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-slate-400 text-sm bg-slate-800/50">
                  <th class="px-6 py-4 font-medium">{{ 'dashboard.project_name' | translate }}</th>
                  <th class="px-6 py-4 font-medium">{{ 'dashboard.status' | translate }}</th>
                  <th class="px-6 py-4 font-medium">{{ 'dashboard.progress' | translate }}</th>
                  <th class="px-6 py-4 font-medium">{{ 'dashboard.cash_flow' | translate }}</th>
                  <th class="px-6 py-4 font-medium">{{ 'dashboard.action' | translate }}</th>
                </tr>
              </thead>
              <tbody class="text-white">
                @for (project of projects; track project.id) {
                  <tr class="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {{ project.name.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-medium">{{ project.name }}</p>
                          <p class="text-sm text-slate-400">{{ project.location?.address }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1.5 rounded-lg text-xs font-medium"
                            [ngClass]="{
                              'bg-cyan-500/20 text-cyan-400': project.status === 'Active',
                              'bg-emerald-500/20 text-emerald-400': project.status === 'Completed',
                              'bg-amber-500/20 text-amber-400': project.status === 'Delayed'
                            }">
                        {{ project.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center space-x-3">
                        <div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                          <div class="h-full rounded-full transition-all duration-500"
                               [ngClass]="{
                                 'bg-gradient-to-r from-cyan-500 to-blue-500': project.status === 'Active',
                                 'bg-gradient-to-r from-emerald-500 to-green-500': project.status === 'Completed',
                                 'bg-gradient-to-r from-amber-500 to-orange-500': project.status === 'Delayed'
                               }"
                               [style.width.%]="project.progress">
                          </div>
                        </div>
                        <span class="text-sm text-slate-400">{{ project.progress }}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm">
                        <p class="text-emerald-400">+{{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}</p>
                        <p class="text-slate-400">{{ project.cashFlow.collected | currency:'USD':'symbol':'1.0-0' }} collected</p>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <a [routerLink]="['/admin/projects', project.id]" 
                         class="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors inline-flex items-center">
                        {{ 'dashboard.view' | translate }}
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  projects: Project[] = [];
  stats = {
    activeProjects: 0,
    completedProjects: 0,
    delayedProjects: 0,
    totalRevenue: 0
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
    { id: 4, type: 'success', message: 'Daily log submitted for Residential Tower', time: '2 hours ago' },
    { id: 5, type: 'info', message: 'Team member added to Shopping Center Kuwait', time: '3 hours ago' }
  ];

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.mockDataService.getProjects().subscribe(projects => {
      this.projects = projects;
    });

    this.mockDataService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
  }
}
