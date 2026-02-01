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
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ 'projects.title' | translate }}</h1>
            <p class="text-slate-400">Manage your construction projects</p>
          </div>
          <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {{ 'projects.create_new' | translate }}
          </button>
        </div>

        <!-- Filters -->
        <div class="flex items-center space-x-4 mb-6">
          <div class="flex space-x-2 bg-slate-800/50 rounded-xl p-1">
            <button 
              (click)="filterStatus = 'all'"
              [class.bg-cyan-500]="filterStatus === 'all'"
              [class.text-white]="filterStatus === 'all'"
              [class.text-slate-400]="filterStatus !== 'all'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all">
              All Projects
            </button>
            <button 
              (click)="filterStatus = 'Active'"
              [class.bg-cyan-500]="filterStatus === 'Active'"
              [class.text-white]="filterStatus === 'Active'"
              [class.text-slate-400]="filterStatus !== 'Active'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all">
              Active
            </button>
            <button 
              (click)="filterStatus = 'Completed'"
              [class.bg-emerald-500]="filterStatus === 'Completed'"
              [class.text-white]="filterStatus === 'Completed'"
              [class.text-slate-400]="filterStatus !== 'Completed'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all">
              Completed
            </button>
            <button 
              (click)="filterStatus = 'Delayed'"
              [class.bg-amber-500]="filterStatus === 'Delayed'"
              [class.text-white]="filterStatus === 'Delayed'"
              [class.text-slate-400]="filterStatus !== 'Delayed'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all">
              Delayed
            </button>
          </div>
          <div class="flex-1"></div>
          <div class="flex space-x-2">
            <button 
              (click)="viewMode = 'grid'"
              [class.bg-cyan-500/20]="viewMode === 'grid'"
              [class.text-cyan-400]="viewMode === 'grid'"
              [class.text-slate-400]="viewMode !== 'grid'"
              class="p-2 rounded-lg transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </button>
            <button 
              (click)="viewMode = 'list'"
              [class.bg-cyan-500/20]="viewMode === 'list'"
              [class.text-cyan-400]="viewMode === 'list'"
              [class.text-slate-400]="viewMode !== 'list'"
              class="p-2 rounded-lg transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Grid View -->
        @if (viewMode === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (project of filteredProjects; track project.id) {
              <div class="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                <!-- Card Header -->
                <div class="p-6">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {{ project.name.charAt(0) }}
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{{ project.name }}</h3>
                        <p class="text-sm text-slate-400 flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          </svg>
                          {{ project.location?.address }}
                        </p>
                      </div>
                    </div>
                    <span class="px-3 py-1.5 rounded-lg text-xs font-medium"
                          [ngClass]="{
                            'bg-cyan-500/20 text-cyan-400': project.status === 'Active',
                            'bg-emerald-500/20 text-emerald-400': project.status === 'Completed',
                            'bg-amber-500/20 text-amber-400': project.status === 'Delayed'
                          }">
                      {{ project.status }}
                    </span>
                  </div>

                  <!-- Progress -->
                  <div class="mb-4">
                    <div class="flex justify-between text-sm mb-2">
                      <span class="text-slate-400">{{ 'projects.progress' | translate }}</span>
                      <span class="text-white font-medium">{{ project.progress }}%</span>
                    </div>
                    <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500"
                           [ngClass]="{
                             'bg-gradient-to-r from-cyan-500 to-blue-500': project.status === 'Active',
                             'bg-gradient-to-r from-emerald-500 to-green-500': project.status === 'Completed',
                             'bg-gradient-to-r from-amber-500 to-orange-500': project.status === 'Delayed'
                           }"
                           [style.width.%]="project.progress">
                      </div>
                    </div>
                  </div>

                  <!-- Cash Flow -->
                  <div class="p-4 rounded-xl bg-slate-700/30 mb-4">
                    <h4 class="text-sm font-medium text-slate-400 mb-3">{{ 'projects.cash_flow' | translate }}</h4>
                    <div class="flex justify-between">
                      <div>
                        <p class="text-xs text-slate-500">{{ 'projects.earned' | translate }}</p>
                        <p class="text-lg font-bold text-emerald-400">{{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-xs text-slate-500">{{ 'projects.collected' | translate }}</p>
                        <p class="text-lg font-bold text-cyan-400">{{ project.cashFlow.collected | currency:'USD':'symbol':'1.0-0' }}</p>
                      </div>
                    </div>
                    <!-- Mini Sparkline -->
                    <div class="mt-3 flex items-end space-x-1 h-8">
                      @for (bar of sparklineData; track $index) {
                        <div 
                          class="flex-1 bg-gradient-to-t from-cyan-600/50 to-cyan-400/50 rounded-t transition-all duration-300 hover:from-cyan-500 hover:to-cyan-300"
                          [style.height.%]="bar">
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Action -->
                  <a [routerLink]="['/admin/projects', project.id]" 
                     class="flex items-center justify-center w-full py-3 rounded-xl bg-cyan-500/10 text-cyan-400 font-medium hover:bg-cyan-500/20 transition-colors">
                    <span>{{ 'projects.view_details' | translate }}</span>
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
            }
          </div>
        }

        <!-- List View -->
        @if (viewMode === 'list') {
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="text-left text-slate-400 text-sm bg-slate-800/50">
                  <th class="px-6 py-4 font-medium">Project</th>
                  <th class="px-6 py-4 font-medium">Status</th>
                  <th class="px-6 py-4 font-medium">Progress</th>
                  <th class="px-6 py-4 font-medium">Earned</th>
                  <th class="px-6 py-4 font-medium">Collected</th>
                  <th class="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody class="text-white">
                @for (project of filteredProjects; track project.id) {
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
                          <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                               [style.width.%]="project.progress">
                          </div>
                        </div>
                        <span class="text-sm text-slate-400">{{ project.progress }}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-emerald-400 font-medium">
                      {{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-6 py-4 text-cyan-400 font-medium">
                      {{ project.cashFlow.collected | currency:'USD':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-6 py-4">
                      <a [routerLink]="['/admin/projects', project.id]" 
                         class="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors inline-flex items-center">
                        View
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
