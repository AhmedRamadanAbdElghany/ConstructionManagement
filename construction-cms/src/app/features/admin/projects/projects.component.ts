import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { Project, CatalogItem, User, CompanyPackage, CompanySettings } from '../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../core/services/catalog.service';
import { SettingsService } from '../../../core/services/settings.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'projects.title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Manage and track your construction projects</p>
          </div>
          <button (click)="openCreateModal()" class="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center group">
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

      <!-- Create Project Modal -->
      @if (showCreateModal) {
       <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">
             <!-- Modal Header (Fixed) -->
             <div class="p-8 pb-4 flex items-center justify-between shrink-0 border-b border-slate-50 dark:border-white/5">
                <div>
                   <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'projects.create_new' | translate }}</h2>
                   <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Setup Configuration</p>
                </div>
                <button (click)="showCreateModal = false" class="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                   <svg class="w-6 h-6 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>

             <!-- Modal Body (Scrollable) -->
             <div class="p-8 overflow-y-auto grow custom-scrollbar">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <!-- Left Column: Operations & Info -->
                   <div class="space-y-8">
                      <!-- General Info Section -->
                      <div class="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                         <p class="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">Project Identity</p>
                         <div>
                            <input type="text" [(ngModel)]="createForm.name" placeholder="Project Name" 
                                   class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-sm">
                         </div>
                         <div>
                            <input type="text" [(ngModel)]="createForm.address" placeholder="Location Address" 
                                   class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-sm">
                         </div>
                         <div class="grid grid-cols-2 gap-4">
                            <div class="relative">
                               <label class="absolute -top-2 left-4 px-2 bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-widest">Start</label>
                               <input type="date" [(ngModel)]="createForm.startDate" 
                                      class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-xs">
                            </div>
                            <div class="relative">
                               <label class="absolute -top-2 left-4 px-2 bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-widest">Target End</label>
                               <input type="date" [(ngModel)]="createForm.endDate" 
                                      class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-xs">
                            </div>
                         </div>

                         @if (companySettings?.allowLocations) {
                            <div class="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                               <div class="relative">
                                  <label class="absolute -top-2 left-4 px-2 bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-widest">Latitude</label>
                                  <input type="number" [(ngModel)]="createForm.lat" step="any" placeholder="0.0000"
                                         class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-xs">
                               </div>
                               <div class="relative">
                                  <label class="absolute -top-2 left-4 px-2 bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-widest">Longitude</label>
                                  <input type="number" [(ngModel)]="createForm.lng" step="any" placeholder="0.0000"
                                         class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-xs">
                               </div>
                            </div>
                         }
                      </div>

                      <!-- Financial Logic Section -->
                      <div class="space-y-6 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                         <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Calculation Method</p>
                         
                         <!-- Method Switcher -->
                         <div class="flex p-1.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                            <button (click)="createForm.calculationMethod = 'Measured'" 
                                    [class]="createForm.calculationMethod === 'Measured' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'"
                                    class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Measured</button>
                            <button (click)="createForm.calculationMethod = 'Supervision'" 
                                    [class]="createForm.calculationMethod === 'Supervision' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'"
                                    class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Supervision</button>
                            <button (click)="createForm.calculationMethod = 'Packages'" 
                                    [class]="createForm.calculationMethod === 'Packages' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'"
                                    class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Packages</button>
                         </div>

                         <!-- Dynamic Fields based on Method -->
                         @if (createForm.calculationMethod === 'Measured') {
                            <div class="animate-in slide-in-from-top-2 duration-300">
                               <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Project Cost (Measured Value)</label>
                               <div class="relative">
                                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                  <input type="number" [(ngModel)]="createForm.totalContractValue" 
                                         class="w-full p-4 pl-10 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all">
                               </div>
                            </div>
                         }

                         @if (createForm.calculationMethod === 'Supervision') {
                            <div class="space-y-4 animate-in slide-in-from-top-2 duration-300">
                               <div class="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5">
                                  <div>
                                     <p class="text-xs font-bold text-slate-900 dark:text-white">Use Company Default %</p>
                                     <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Current standard: {{ companySettings?.defaultSupervisionPercentage }}%</p>
                                  </div>
                                  <button (click)="createForm.useCompanyPercentage = !createForm.useCompanyPercentage" 
                                          [class]="createForm.useCompanyPercentage ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-800'"
                                          class="w-12 h-6 rounded-full relative transition-colors">
                                     <div [class]="createForm.useCompanyPercentage ? 'translate-x-7' : 'translate-x-1'"
                                          class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                                  </button>
                               </div>
                               
                               @if (!createForm.useCompanyPercentage) {
                                  <div class="animate-in zoom-in-95 duration-200">
                                     <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Project Supervision Override %</label>
                                     <div class="relative">
                                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                        <input type="number" [(ngModel)]="createForm.supervisionPercentage" 
                                               class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-rose-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all">
                                     </div>
                                  </div>
                               }
                            </div>
                         }

                         @if (createForm.calculationMethod === 'Packages') {
                            <div class="animate-in slide-in-from-top-2 duration-300">
                               <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contract Package</label>
                               <select [(ngModel)]="createForm.packageId" 
                                       class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 outline-none font-bold text-slate-900 dark:text-white transition-all appearance-none cursor-pointer">
                                  <option [ngValue]="null">Select a package...</option>
                                  @for (pkg of availablePackages; track pkg.id) {
                                     <option [value]="pkg.id">{{ pkg.name }} - {{ pkg.price | currency }}</option>
                                  }
                               </select>
                            </div>
                         }
                      </div>
                   </div>

                   <!-- Right Column: Special Items & BOQ -->
                   <div class="space-y-8">
                      <!-- Mandatory Adjustments Section -->
                      <div class="space-y-6 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                         <p class="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Financial Adjustments</p>
                         
                         <!-- Extra Fees -->
                         <div class="space-y-3">
                            <div class="grid grid-cols-3 gap-2">
                               <div class="col-span-1 relative z-10">
                                  <label class="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">Extra Fees</label>
                                  <input type="number" [(ngModel)]="createForm.extraFees" 
                                         class="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-black text-sm text-slate-900 dark:text-white">
                               </div>
                               <div class="col-span-2">
                                  <label class="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">Fee Description</label>
                                  <input type="text" [(ngModel)]="createForm.extraFeesDescription" 
                                         [placeholder]="createForm.extraFees > 0 ? 'Description Required...' : 'Reason for extra fees'"
                                         [class.border-rose-500]="createForm.extraFees > 0 && !createForm.extraFeesDescription"
                                         class="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-xs text-slate-900 dark:text-white transition-all">
                               </div>
                            </div>
                         </div>

                         <!-- Deducted Amount -->
                         <div class="space-y-3">
                            <div class="grid grid-cols-3 gap-2">
                               <div class="col-span-1 relative z-10">
                                  <label class="text-[8px] font-black text-rose-500/70 uppercase tracking-[0.15em] block mb-1">Deducted</label>
                                  <input type="number" [(ngModel)]="createForm.deductedAmount" 
                                         class="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-rose-500/10 dark:border-rose-500/10 focus:border-rose-500/50 outline-none font-black text-sm text-rose-500 dark:text-rose-400">
                               </div>
                               <div class="col-span-2">
                                  <label class="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">Deduction Reason</label>
                                  <input type="text" [(ngModel)]="createForm.deductedAmountDescription" 
                                         [placeholder]="createForm.deductedAmount > 0 ? 'Description Required...' : 'Reason for deduction'"
                                         [class.border-rose-500]="createForm.deductedAmount > 0 && !createForm.deductedAmountDescription"
                                         class="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-rose-500/50 outline-none font-bold text-xs text-slate-900 dark:text-white transition-all">
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Catalog Items Section (Condensed) -->
                      <div class="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                         <div class="flex items-center justify-between mb-4">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial BOQ Template</label>
                            <button (click)="toggleAllCatalog(true)" class="text-[9px] font-black text-cyan-500 uppercase hover:underline">Reset All</button>
                         </div>
                         <div class="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            @for (item of catalogItems; track item.id) {
                               <label class="flex items-center space-x-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all">
                                  <div class="relative flex items-center">
                                     <input type="checkbox" [checked]="isCatalogItemSelected(item.id)" (change)="toggleCatalogItem(item)"
                                            class="w-4 h-4 rounded-md border-2 border-slate-200 dark:border-slate-800 appearance-none checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer">
                                  </div>
                                  <div class="flex-1 min-w-0">
                                     <p class="text-[11px] font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</p>
                                     <p class="text-[8px] text-slate-400 font-black tracking-widest">{{ item.unit }}</p>
                                  </div>
                               </label>
                            }
                         </div>
                         
                         <!-- List of already added Custom Items -->
                         @if (customProjectItems.length > 0) {
                            <div class="mt-4 space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                               <p class="text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-2">Project-Specific Items</p>
                               @for (item of customProjectItems; track item.id) {
                                  <div class="flex items-center justify-between p-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                                     <div class="flex-1 min-w-0">
                                        <p class="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 truncate">{{ item.name }}</p>
                                        <p class="text-[8px] text-cyan-500/60 font-black uppercase">{{ item.unit }}</p>
                                     </div>
                                     <button (click)="removeCustomItem(item.id)" class="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                     </button>
                                  </div>
                               }
                            </div>
                         }
                         <div class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center space-x-2">
                            <input #cName type="text" placeholder="Add Custom Item..." 
                                   class="flex-1 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg text-[10px] outline-none font-bold text-slate-900 dark:text-white">
                            <input #cUnit type="text" placeholder="Unit" 
                                   class="w-16 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg text-[10px] outline-none font-bold text-center text-slate-900 dark:text-white">
                            <button (click)="addCustomItem(cName.value, cUnit.value); cName.value=''; cUnit.value=''" 
                                    class="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-cyan-500 dark:hover:bg-cyan-500 transition-all">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- Validation Feedback (Fixed above footer) -->
             @if (!isFormValid) {
                <div class="px-8 py-3 bg-rose-500/5 border-t border-rose-500/10 shrink-0">
                   <div class="flex items-center space-x-2 mb-1">
                      <svg class="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                      <span class="text-[9px] font-black text-rose-500 uppercase tracking-widest">Missing Required Information:</span>
                   </div>
                   <div class="flex flex-wrap gap-2">
                      @for (error of validationErrors; track error) {
                         <span class="text-[8px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase">{{ error }}</span>
                      }
                   </div>
                </div>
             }

             <!-- Modal Footer (Fixed) -->
             <div class="p-8 pt-6 flex space-x-4 shrink-0 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <button (click)="showCreateModal = false" class="flex-1 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5">
                   {{ 'common.cancel' | translate }}
                </button>
                <button (click)="createProject()" 
                        [disabled]="!isFormValid"
                        [class.opacity-40]="!isFormValid"
                        [class.grayscale]="!isFormValid"
                        class="flex-[2] py-4 rounded-2xl bg-slate-900 dark:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed">
                   Confirm & Create Project
                </button>
             </div>
          </div>
       </div>
      }
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  catalogItems: CatalogItem[] = [];
  filterStatus: 'all' | 'Active' | 'Completed' | 'Delayed' = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  sparklineData = [30, 50, 40, 70, 60, 80, 90];

  // Create Project State
  showCreateModal = false;
  companySettings?: CompanySettings;
  availablePackages: CompanyPackage[] = [];

  createForm = {
    name: '',
    address: '',
    startDate: '',
    endDate: '',
    calculationMethod: 'Measured' as 'Measured' | 'Supervision' | 'Packages',
    totalContractValue: 0,
    supervisionPercentage: 0,
    useCompanyPercentage: true,
    packageId: null as number | null,
    extraFees: 0,
    extraFeesDescription: '',
    deductedAmount: 0,
    deductedAmountDescription: '',
    lat: 0 as number | null,
    lng: 0 as number | null
  };
  selectedCatalogItems: CatalogItem[] = [];
  customProjectItems: CatalogItem[] = [];

  get filteredProjects(): Project[] {
    if (this.filterStatus === 'all') {
      return this.projects;
    }
    return this.projects.filter(p => p.status === this.filterStatus);
  }

  get isFormValid(): boolean {
    const f = this.createForm;
    // Basic Info
    if (!f.name || !f.address || !f.startDate || !f.endDate) return false;

    // Location
    if (this.companySettings?.allowLocations) {
      if (f.lat === null || f.lng === null) return false;
    }

    // Calculation Method
    if (f.calculationMethod === 'Measured' && (!f.totalContractValue || f.totalContractValue <= 0)) return false;
    if (f.calculationMethod === 'Packages' && !f.packageId) return false;

    // Financial Adjustments
    if (f.extraFees > 0 && !f.extraFeesDescription) return false;
    if (f.deductedAmount > 0 && !f.deductedAmountDescription) return false;

    return true;
  }

  get validationErrors(): string[] {
    const f = this.createForm;
    const errors: string[] = [];

    if (!f.name) errors.push('Project Name');
    if (!f.address) errors.push('Location Address');
    if (!f.startDate) errors.push('Start Date');
    if (!f.endDate) errors.push('Target End Date');

    if (this.companySettings?.allowLocations) {
      if (f.lat === null || f.lng === null) errors.push('GPS Coordinates (Lat/Lng)');
    }

    if (f.calculationMethod === 'Measured' && (!f.totalContractValue || f.totalContractValue <= 0)) {
      errors.push('Total Project Cost');
    }

    if (f.calculationMethod === 'Packages' && !f.packageId) {
      errors.push('Contract Package selection');
    }

    if (f.extraFees > 0 && !f.extraFeesDescription) errors.push('Extra Fees Description');
    if (f.deductedAmount > 0 && !f.deductedAmountDescription) errors.push('Deduction Reason (وصف الخصم)');

    return errors;
  }

  isCatalogItemSelected(id: number): boolean {
    return !!this.selectedCatalogItems.find(i => i.id === id);
  }

  constructor(
    private mockDataService: MockDataService,
    private catalogService: CatalogService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.mockDataService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
    this.catalogService.getCatalogItems().subscribe(items => {
      this.catalogItems = items;
    });
    this.settingsService.getCompanySettings().subscribe(settings => {
      this.companySettings = settings;
    });
    this.settingsService.getCompanyPackages().subscribe(packages => {
      this.availablePackages = packages;
    });
  }

  openCreateModal() {
    this.createForm = {
      name: '',
      address: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      calculationMethod: 'Measured',
      totalContractValue: 0,
      supervisionPercentage: this.companySettings?.defaultSupervisionPercentage || 0,
      useCompanyPercentage: true,
      packageId: null,
      extraFees: 0,
      extraFeesDescription: '',
      deductedAmount: 0,
      deductedAmountDescription: '',
      lat: null,
      lng: null
    };
    // Pre-select ALL catalog items by default as requested
    this.selectedCatalogItems = [...this.catalogItems];
    this.customProjectItems = [];
    this.showCreateModal = true;
  }

  toggleCatalogItem(item: CatalogItem) {
    const index = this.selectedCatalogItems.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.selectedCatalogItems = this.selectedCatalogItems.filter(i => i.id !== item.id);
    } else {
      this.selectedCatalogItems = [...this.selectedCatalogItems, { ...item }];
    }
  }

  toggleAllCatalog(select: boolean) {
    if (select) {
      this.selectedCatalogItems = [...this.catalogItems];
    } else {
      this.selectedCatalogItems = [];
    }
  }

  addCustomItem(name: string, unit: string) {
    if (!name || !unit) return;
    const newItem: CatalogItem = {
      id: -Math.floor(Math.random() * 10000), // Negative ID for temp items
      name,
      unit,
      defaultRate: 0,
      category: 'Other'
    };
    this.customProjectItems = [...this.customProjectItems, newItem];
  }

  removeCustomItem(id: number) {
    this.customProjectItems = this.customProjectItems.filter(i => i.id !== id);
  }

  createProject() {
    const isExtraFeesValid = !this.createForm.extraFees || (this.createForm.extraFees > 0 && this.createForm.extraFeesDescription);
    const isDeductionsValid = !this.createForm.deductedAmount || (this.createForm.deductedAmount > 0 && this.createForm.deductedAmountDescription);

    if (!isExtraFeesValid || !isDeductionsValid) {
      alert('Please provide descriptions for extra fees or deductions.');
      return;
    }

    const newProject: Project = {
      id: Math.max(0, ...this.projects.map(p => p.id)) + 1,
      name: this.createForm.name,
      status: 'Active',
      progress: 0,
      cashFlow: { earned: 0, collected: 0 },
      location: {
        lat: Number(this.createForm.lat) || 0,
        lng: Number(this.createForm.lng) || 0,
        address: this.createForm.address
      },
      startDate: this.createForm.startDate,
      endDate: this.createForm.endDate,
      packageId: this.createForm.calculationMethod === 'Packages' ? Number(this.createForm.packageId) : undefined
    };

    this.projects.unshift(newProject);
    this.showCreateModal = false;

    // Combine Catalog and Custom items for the final BOQ initialization
    const allInitialItems = [...this.selectedCatalogItems, ...this.customProjectItems];
    console.log('Project created with config:', {
      project: newProject,
      calculation: {
        method: this.createForm.calculationMethod,
        value: this.createForm.calculationMethod === 'Measured' ? this.createForm.totalContractValue :
          this.createForm.calculationMethod === 'Supervision' ? (this.createForm.useCompanyPercentage ? 'Default' : this.createForm.supervisionPercentage) :
            this.createForm.packageId
      },
      adjustments: {
        extra: { amount: this.createForm.extraFees, desc: this.createForm.extraFeesDescription },
        deducted: { amount: this.createForm.deductedAmount, desc: this.createForm.deductedAmountDescription }
      },
      initialBOQ: allInitialItems
    });
  }
}
