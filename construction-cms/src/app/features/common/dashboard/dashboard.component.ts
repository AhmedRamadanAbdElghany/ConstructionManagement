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
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center space-x-2 mb-2">
            <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center">
              <span class="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
              {{ 'dashboard.live' | translate }}
            </span>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">
            {{ 'dashboard.welcome' | translate }}, {{ currentUser.fullName }}! 👋
          </h1>
          <p class="text-slate-400">{{ 'dashboard.overview_subtitle' | translate }}</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Active Projects -->
          <div class="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 group hover:border-cyan-500/30 transition-all duration-300">
            <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <span class="text-emerald-400 text-sm font-medium flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  +12%
                </span>
              </div>
              <p class="text-4xl font-bold text-white mb-1">{{ stats.activeProjects }}</p>
              <p class="text-slate-400 text-sm">{{ 'dashboard.active_projects' | translate }}</p>
            </div>
          </div>

          <!-- Completed Projects -->
          <div class="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 group hover:border-emerald-500/30 transition-all duration-300">
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <p class="text-4xl font-bold text-white mb-1">{{ stats.completedProjects }}</p>
              <p class="text-slate-400 text-sm">{{ 'dashboard.completed_projects' | translate }}</p>
            </div>
          </div>

          <!-- Delayed Projects -->
          <div class="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 group hover:border-amber-500/30 transition-all duration-300">
            <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                @if (stats.delayedProjects > 0) {
                  <span class="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium">
                    {{ 'dashboard.attention' | translate }}
                  </span>
                }
              </div>
              <p class="text-4xl font-bold text-white mb-1">{{ stats.delayedProjects }}</p>
              <p class="text-slate-400 text-sm">{{ 'dashboard.delayed_projects' | translate }}</p>
            </div>
          </div>

          <!-- Total Revenue -->
          <div class="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 group hover:border-purple-500/30 transition-all duration-300">
            <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span class="text-emerald-400 text-sm font-medium flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  +23%
                </span>
              </div>
              <p class="text-4xl font-bold text-white mb-1">{{ stats.totalRevenue / 1000000 | number:'1.1-1' }}M</p>
              <p class="text-slate-400 text-sm">{{ 'dashboard.total_revenue' | translate }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Cash Flow Chart -->
          <div class="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white">{{ 'dashboard.cash_flow_overview' | translate }}</h2>
              <div class="flex space-x-2">
                <button class="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-medium">{{ 'dashboard.monthly' | translate }}</button>
                <button class="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-400 text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors">{{ 'dashboard.yearly' | translate }}</button>
              </div>
            </div>
            
            <!-- Chart Placeholder -->
            <div class="relative h-72">
              <div class="absolute inset-0 flex items-end justify-between px-2">
                @for (month of chartData; track $index) {
                  <div class="flex-1 mx-1 flex flex-col items-center">
                    <div class="w-full flex space-x-1 items-end" style="height: 200px;">
                      <div 
                        class="flex-1 bg-gradient-to-t from-emerald-600/50 to-emerald-400/50 rounded-t-lg transition-all duration-500 hover:from-emerald-500 hover:to-emerald-300"
                        [style.height.%]="month.earned">
                      </div>
                      <div 
                        class="flex-1 bg-gradient-to-t from-cyan-600/50 to-cyan-400/50 rounded-t-lg transition-all duration-500 hover:from-cyan-500 hover:to-cyan-300"
                        [style.height.%]="month.collected">
                      </div>
                    </div>
                    <span class="text-xs text-slate-500 mt-2">{{ month.label }}</span>
                  </div>
                }
              </div>
            </div>
            
            <!-- Legend -->
            <div class="flex items-center justify-center space-x-6 mt-4">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span class="text-sm text-slate-400">{{ 'dashboard.earned' | translate }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span class="text-sm text-slate-400">{{ 'dashboard.collected' | translate }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white">{{ 'dashboard.recent_activity' | translate }}</h2>
              <a routerLink="/notifications" class="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">{{ 'dashboard.view_all' | translate }}</a>
            </div>
            
            <div class="space-y-4">
              @for (activity of recentActivities; track activity.id) {
                <div class="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                       [ngClass]="{
                         'bg-emerald-500/20': activity.type === 'success',
                         'bg-cyan-500/20': activity.type === 'info',
                         'bg-amber-500/20': activity.type === 'warning'
                       }">
                    @switch (activity.type) {
                      @case ('success') {
                        <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      }
                      @case ('info') {
                        <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      }
                      @case ('warning') {
                        <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                      }
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-white">{{ activity.message }}</p>
                    <p class="text-xs text-slate-500 mt-1">{{ activity.time }}</p>
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
