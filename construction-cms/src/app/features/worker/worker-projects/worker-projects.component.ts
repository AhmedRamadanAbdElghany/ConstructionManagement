import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-worker-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="mb-10">
          <div class="flex items-center space-x-2 mb-3">
            <span class="px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center border border-indigo-500/20">
              <span class="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              {{ 'sidebar.my_projects' | translate | uppercase }}
            </span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {{ 'sidebar.my_projects' | translate }} <span class="text-indigo-500">📁</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'worker.assigned_projects' | translate }}</p>
        </div>

        <!-- Loading State -->
        @if (loading) {
          <div class="flex justify-center items-center h-64">
            <div class="relative">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse shadow-lg shadow-indigo-500/30"></div>
              <div class="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-ping opacity-20"></div>
            </div>
          </div>
        }

        <!-- Projects Grid -->
        @if (!loading) {
          @if (projects.length === 0) {
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-white/5 shadow-xl text-center">
              <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <span class="text-4xl">📭</span>
              </div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{{ 'worker.no_projects_assigned' | translate }}</h3>
              <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'worker.no_projects_desc' | translate }}</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (project of projects; track project.id) {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden group">
                  <!-- Project Header -->
                  <div class="p-6 border-b border-slate-100 dark:border-white/5">
                    <div class="flex items-start justify-between mb-4">
                      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                        <span class="text-white text-xl">🏗️</span>
                      </div>
                      <span [class]="getStatusClass(project.status)"
                            class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {{ project.status || 'Active' }}
                      </span>
                    </div>
                    <h3 class="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">{{ project.name }}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{{ project.description }}</p>
                  </div>

                  <!-- Progress Bar -->
                  <div class="px-6 py-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'worker.progress' | translate }}</span>
                      <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">{{ project.progressPercentage || 0 }}%</span>
                    </div>
                    <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div [style.width.%]="project.progressPercentage || 0"
                           class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"></div>
                    </div>
                  </div>

                  <!-- Project Info -->
                  <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
                    <div class="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'worker.start_date' | translate }}</p>
                        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ project.startDate | date:'MMM d, y' }}</p>
                      </div>
                      <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'worker.end_date' | translate }}</p>
                        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ project.endDate | date:'MMM d, y' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="p-4 border-t border-slate-100 dark:border-white/5">
                    <a [routerLink]="['/admin/projects', project.id]"
                       class="w-full py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                      <span>{{ 'projects.view_details' | translate }}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class WorkerProjectsComponent implements OnInit {
  projects: any[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    const user = this.authService.getCurrentUser();
    if (user?.companyId) {
      this.projectService.getMyProjects().subscribe({
        next: (projects: any[]) => {
          this.projects = projects;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading projects:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'inprogress':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'onhold':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
    }
  }
}
