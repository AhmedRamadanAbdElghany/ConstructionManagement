import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { Project } from '../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'projects.title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Manage and track your construction projects</p>
          </div>
          <button class="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center group">
            <svg class="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {{ 'projects.create_new' | translate }}
          </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div class="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-1.5 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <button 
              (click)="filterStatus = 'all'"
              [class.bg-slate-900]="filterStatus === 'all'"
              [class.dark:bg-white]="filterStatus === 'all'"
              [class.text-white]="filterStatus === 'all'"
              [class.dark:text-slate-950]="filterStatus === 'all'"
              [class.text-slate-500]="filterStatus !== 'all'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              All
            </button>
            <button 
              (click)="filterStatus = 'Active'"
              [class.bg-cyan-500/10]="filterStatus === 'Active'"
              [class.text-cyan-600]="filterStatus === 'Active'"
              [class.text-slate-500]="filterStatus !== 'Active'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Active
            </button>
            <button 
              (click)="filterStatus = 'Completed'"
              [class.bg-emerald-500/10]="filterStatus === 'Completed'"
              [class.text-emerald-600]="filterStatus === 'Completed'"
              [class.text-slate-500]="filterStatus !== 'Completed'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Completed
            </button>
            <button 
              (click)="filterStatus = 'Delayed'"
              [class.bg-rose-500/10]="filterStatus === 'Delayed'"
              [class.text-rose-600]="filterStatus === 'Delayed'"
              [class.text-slate-500]="filterStatus !== 'Delayed'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Delayed
            </button>
          </div>

          <div class="flex items-center space-x-4">
             <div class="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-1.5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <button 
                  (click)="viewMode = 'grid'"
                  [class.bg-slate-100]="viewMode === 'grid'"
                  [class.dark:bg-slate-800]="viewMode === 'grid'"
                  [class.text-cyan-600]="viewMode === 'grid'"
                  [class.text-slate-400]="viewMode !== 'grid'"
                  class="p-2.5 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </button>
                <button 
                  (click)="viewMode = 'list'"
                  [class.bg-slate-100]="viewMode === 'list'"
                  [class.dark:bg-slate-800]="viewMode === 'list'"
                  [class.text-cyan-600]="viewMode === 'list'"
                  [class.text-slate-400]="viewMode !== 'list'"
                  class="p-2.5 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                  </svg>
                </button>
             </div>
          </div>
        </div>

        <!-- Grid View -->
        @if (viewMode === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (project of filteredProjects; track project.id) {
              <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-cyan-500/30 transition-all duration-300 overflow-hidden relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-colors"></div>
                
                <div class="p-8">
                  <div class="flex items-start justify-between mb-8">
                    <div class="flex items-center space-x-4">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">
                        {{ project.name.charAt(0) }}
                      </div>
                      <div>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors uppercase leading-none mb-2 tracking-tight">{{ project.name }}</h3>
                        <p class="text-xs text-slate-400 font-bold flex items-center uppercase tracking-widest">
                          <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          </svg>
                          {{ project.location?.address || 'Main Site' }}
                        </p>
                      </div>
                    </div>
                    <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          [ngClass]="{
                            'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400': project.status === 'Active',
                            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': project.status === 'Completed',
                            'bg-rose-500/10 text-rose-600 dark:text-rose-400': project.status === 'Delayed'
                          }">
                      {{ project.status }}
                    </span>
                  </div>

                  <!-- Progress -->
                  <div class="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 shadow-inner transition-all">
                    <div class="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                      <span class="text-slate-400">{{ 'projects.progress' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ project.progress }}%</span>
                    </div>
                    <div class="h-2.5 bg-white dark:bg-slate-900 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-200 dark:border-white/5">
                      <div class="h-full rounded-full transition-all duration-1000"
                           [ngClass]="{
                             'bg-gradient-to-r from-cyan-500 to-blue-500': project.status === 'Active',
                             'bg-gradient-to-r from-emerald-500 to-green-500': project.status === 'Completed',
                             'bg-gradient-to-r from-rose-500 to-orange-500': project.status === 'Delayed'
                           }"
                           [style.width.%]="project.progress">
                      </div>
                    </div>
                  </div>

                  <!-- Mini Sparkline for Cash Flow -->
                  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 mb-8">
                     <div class="flex justify-between mb-4">
                        <div>
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Earned</p>
                           <p class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}</p>
                        </div>
                        <div class="text-right">
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Collected</p>
                           <p class="text-sm font-black text-cyan-600 dark:text-cyan-400">{{ project.cashFlow.collected | currency:'USD':'symbol':'1.0-0' }}</p>
                        </div>
                     </div>
                     <div class="flex items-end justify-between gap-1 h-8">
                        @for (val of sparklineData; track $index) {
                          <div class="flex-1 rounded-t-sm transition-all duration-300 bg-cyan-500/20 hover:bg-cyan-500" [style.height.%]="val"></div>
                        }
                     </div>
                  </div>

                  <a [routerLink]="['/admin/projects', project.id]" 
                     class="flex items-center justify-center w-full py-4 rounded-2xl bg-slate-100 dark:bg-white text-slate-900 dark:text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-white transition-all group/btn shadow-sm">
                    <span>{{ 'projects.view_details' | translate }}</span>
                    <svg class="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </a>
                </div>
              </div>
            }
          </div>
        }

        <!-- List View -->
        @if (viewMode === 'list') {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
            <table class="w-full">
              <thead>
                <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                  <th class="px-8 py-5">Project</th>
                  <th class="px-8 py-5">Status</th>
                  <th class="px-8 py-5">Progress</th>
                  <th class="px-8 py-5">Earned</th>
                  <th class="px-8 py-5">Collected</th>
                  <th class="px-8 py-5">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                @for (project of filteredProjects; track project.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td class="px-8 py-6">
                      <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                          {{ project.name.charAt(0) }}
                        </div>
                        <div>
                          <p class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ project.name }}</p>
                          <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ project.location?.address }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-8 py-6">
                      <span class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all"
                            [ngClass]="{
                              'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/10': project.status === 'Active',
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10': project.status === 'Completed',
                              'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10': project.status === 'Delayed'
                            }">
                        {{ project.status }}
                      </span>
                    </td>
                    <td class="px-8 py-6">
                      <div class="flex items-center space-x-4">
                        <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                          <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                               [style.width.%]="project.progress">
                          </div>
                        </div>
                        <span class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ project.progress }}%</span>
                      </div>
                    </td>
                    <td class="px-8 py-6 text-emerald-600 dark:text-emerald-400 text-base font-black tracking-tight">
                      {{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-8 py-6 text-cyan-600 dark:text-cyan-400 text-base font-black tracking-tight">
                      {{ project.cashFlow.collected | currency:'USD':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-8 py-6">
                      <a [routerLink]="['/admin/projects', project.id]" 
                         class="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center w-fit">
                        View
                        <svg class="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (filteredProjects.length === 0) {
          <div class="text-center py-20">
            <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
              <svg class="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">No Projects Found</h3>
            <p class="text-slate-400">No projects match the current filter.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filterStatus: 'all' | 'Active' | 'Completed' | 'Delayed' = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  sparklineData = [30, 50, 40, 70, 60, 80, 90];

  get filteredProjects(): Project[] {
    if (this.filterStatus === 'all') {
      return this.projects;
    }
    return this.projects.filter(p => p.status === this.filterStatus);
  }

  constructor(private mockDataService: MockDataService) { }

  ngOnInit() {
    this.mockDataService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }
}
