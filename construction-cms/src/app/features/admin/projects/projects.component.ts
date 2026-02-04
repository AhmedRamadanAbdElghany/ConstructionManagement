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
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'projects.subtitle' | translate }}</p>
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
              {{ 'projects.all' | translate }}
            </button>
            <button 
              (click)="filterStatus = 'Active'"
              [class.bg-cyan-500/10]="filterStatus === 'Active'"
              [class.text-cyan-600]="filterStatus === 'Active'"
              [class.text-slate-500]="filterStatus !== 'Active'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ 'projects.active' | translate }}
            </button>
            <button 
              (click)="filterStatus = 'Completed'"
              [class.bg-emerald-500/10]="filterStatus === 'Completed'"
              [class.text-emerald-600]="filterStatus === 'Completed'"
              [class.text-slate-500]="filterStatus !== 'Completed'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ 'projects.completed' | translate }}
            </button>
            <button 
              (click)="filterStatus = 'Delayed'"
              [class.bg-rose-500/10]="filterStatus === 'Delayed'"
              [class.text-rose-600]="filterStatus === 'Delayed'"
              [class.text-slate-500]="filterStatus !== 'Delayed'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ 'projects.delayed' | translate }}
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
                      {{ 'projects.' + project.status.toLowerCase() | translate }}
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
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'projects.earned' | translate }}</p>
                           <p class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}</p>
                        </div>
                        <div class="text-right">
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'projects.collected' | translate }}</p>
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
                  <th class="px-8 py-5">{{ 'sidebar.projects' | translate | slice:0:-1 }}</th>
                  <th class="px-8 py-5">{{ 'dashboard.status' | translate }}</th>
                  <th class="px-8 py-5">{{ 'dashboard.progress' | translate }}</th>
                  <th class="px-8 py-5">{{ 'projects.earned' | translate }}</th>
                  <th class="px-8 py-5">{{ 'projects.collected' | translate }}</th>
                  <th class="px-8 py-5">{{ 'dashboard.action' | translate }}</th>
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
                        {{ 'projects.' + project.status.toLowerCase() | translate }}
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
                        {{ 'dashboard.view' | translate }}
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
            <h3 class="text-xl font-bold text-white mb-2">{{ 'projects.no_projects' | translate }}</h3>
            <p class="text-slate-400">{{ 'projects.no_projects_desc' | translate }}</p>
          </div>
        }
      </div>

      <!-- Create Project Modal -->
      @if (showCreateModal) {
       <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500">
          <div class="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[3.5rem] shadow-[0_32px_120px_-15px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
             
             <!-- Decorative Background elements -->
             <div class="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
             <div class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

             <!-- Modal Header (Premium fixed header) -->
             <div class="p-10 pb-6 flex items-center justify-between shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 relative z-10">
                <div class="flex items-center space-x-5">
                   <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-cyan-500/20 ring-1 ring-white/20">
                      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                   </div>
                   <div>
                      <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{{ 'projects.create_title' | translate }}</h2>
                      <div class="flex items-center space-x-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{{ 'projects.create_subtitle' | translate }}</p>
                      </div>
                   </div>
                </div>
                <button (click)="showCreateModal = false" class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-sm active:scale-95 group">
                   <svg class="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>

             <!-- Modal Body (Optimized Scroll View) -->
             <div class="p-10 overflow-y-auto grow custom-scrollbar relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   
                   <!-- Left Primary Column (Operational Wing) -->
                   <div class="lg:col-span-6 space-y-10">
                      
                      <!-- Identity & Logistics -->
                      <div class="p-8 rounded-[2.5rem] bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                         <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg class="w-24 h-24 text-cyan-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                         </div>

                         <div class="flex items-center space-x-3 mb-8">
                             <p class="text-[11px] font-black text-cyan-500 uppercase tracking-[0.3em]">{{ 'projects.identity' | translate }}</p>
                            <div class="h-px flex-1 bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
                         </div>

                         <div class="space-y-5">
                            <div class="relative group/field">
                               <input type="text" [(ngModel)]="createForm.name" placeholder=" "
                                      class="peer w-full p-5 pt-7 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-sm shadow-inner">
                               <label class="absolute left-5 top-5 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-rose-500 pointer-events-none">{{ 'projects.project_title' | translate }}</label>
                            </div>

                            <div class="relative group/field">
                               <input type="text" [(ngModel)]="createForm.address" placeholder=" "
                                      class="peer w-full p-5 pt-7 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-sm shadow-inner">
                               <label class="absolute left-5 top-5 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-cyan-500 pointer-events-none">{{ 'projects.site_address' | translate }}</label>
                            </div>

                            <div class="grid grid-cols-2 gap-5">
                               <div class="relative group/field">
                                  <input type="date" [(ngModel)]="createForm.startDate"
                                         class="w-full p-5 pt-7 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-xs shadow-inner">
                                  <label class="absolute left-5 top-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.kickoff_date' | translate }}</label>
                               </div>
                               <div class="relative group/field">
                                  <input type="date" [(ngModel)]="createForm.endDate"
                                         class="w-full p-5 pt-7 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-xs shadow-inner">
                                  <label class="absolute left-5 top-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.handover_target' | translate }}</label>
                               </div>
                            </div>

                            @if (companySettings?.allowLocations) {
                               <div class="grid grid-cols-2 gap-5 pt-2">
                                  <div class="relative group/field">
                                     <input type="number" [(ngModel)]="createForm.lat" step="any" placeholder="0.0000"
                                            class="w-full p-5 pt-7 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-xs shadow-inner">
                                     <label class="absolute left-5 top-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.gps_lat' | translate }}</label>
                                  </div>
                                  <div class="relative group/field">
                                     <input type="number" [(ngModel)]="createForm.lng" step="any" placeholder="0.0000"
                                            class="w-full p-5 pt-7 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-cyan-500/50 outline-none font-bold text-slate-900 dark:text-white transition-all text-xs shadow-inner">
                                     <label class="absolute left-5 top-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.gps_lng' | translate }}</label>
                                  </div>
                               </div>
                            }
                         </div>
                      </div>

                      <!-- Operational Settings (Moved here for better balance) -->
                      <div class="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 shadow-lg relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg class="w-20 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                         </div>

                         <div class="flex items-center space-x-3 mb-8">
                             <p class="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">{{ 'projects.ops_logic' | translate }}</p>
                            <div class="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
                         </div>

                         <div class="grid grid-cols-2 gap-4">
                            <!-- Toggle Card -->
                            <div (click)="createForm.allowAddProgressEntry = !createForm.allowAddProgressEntry"
                                 [class]="createForm.allowAddProgressEntry ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-white/5'"
                                 class="p-4 rounded-2xl border transition-all cursor-pointer group/toggle">
                               <div class="flex items-center justify-between mb-2">
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                                  <div class="w-2 h-2 rounded-full" [class]="createForm.allowAddProgressEntry ? 'bg-white animate-pulse' : 'bg-slate-300'"></div>
                               </div>
                               <p class="text-[9px] font-black uppercase tracking-widest">{{ 'projects.enable_logging' | translate }}</p>
                            </div>

                            <div (click)="createForm.allowReopenClosedDay = !createForm.allowReopenClosedDay"
                                 [class]="createForm.allowReopenClosedDay ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-white/5'"
                                 class="p-4 rounded-2xl border transition-all cursor-pointer group/toggle">
                               <div class="flex items-center justify-between mb-2">
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                                  <div class="w-2 h-2 rounded-full" [class]="createForm.allowReopenClosedDay ? 'bg-white animate-pulse' : 'bg-slate-300'"></div>
                               </div>
                               <p class="text-[9px] font-black uppercase tracking-widest">{{ 'projects.reopen_days' | translate }}</p>
                            </div>

                            <div (click)="createForm.autoCloseDay = !createForm.autoCloseDay"
                                 [class]="createForm.autoCloseDay ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-white/5'"
                                 class="p-4 rounded-2xl border transition-all cursor-pointer group/toggle">
                               <div class="flex items-center justify-between mb-2">
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                  <div class="w-2 h-2 rounded-full" [class]="createForm.autoCloseDay ? 'bg-white animate-pulse' : 'bg-slate-300'"></div>
                               </div>
                               <p class="text-[9px] font-black uppercase tracking-widest">{{ 'projects.auto_locking' | translate }}</p>
                            </div>

                            <div [class.opacity-40]="!createForm.autoCloseDay" class="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 transition-all">
                               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'projects.close_time' | translate }}</p>
                               <input type="time" [(ngModel)]="createForm.autoCloseDayTime" [disabled]="!createForm.autoCloseDay"
                                      class="w-full bg-transparent text-slate-900 dark:text-white font-black text-sm outline-none cursor-pointer">
                            </div>
                         </div>
                      </div>
                   </div>

                   <!-- Right Column (Financial Wing) -->
                   <div class="lg:col-span-6 space-y-10">

                      <!-- Calculation Hub -->
                      <div class="p-8 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
                         <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>
                         </div>

                         <div class="flex items-center space-x-3 mb-8">
                            <p class="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em]">{{ 'projects.financial_model' | translate }}</p>
                            <div class="h-px flex-1 bg-gradient-to-r from-rose-500/20 to-transparent"></div>
                         </div>

                         <div class="space-y-8">
                            <!-- Premium Switcher -->
                            <div class="flex p-2 rounded-[1.5rem] bg-white/10 dark:bg-slate-900/10 border border-white/5">
                               @for (method of calculationMethods; track method) {
                                  <button (click)="createForm.calculationMethod = method"
                                          [class]="createForm.calculationMethod === method ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl scale-100' : 'text-white/50 dark:text-slate-500 hover:text-white hover:bg-white/5 scale-95'"
                                          class="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">{{ 'projects.' + method.toLowerCase() | translate }}</button>
                               }
                            </div>

                            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                               @if (createForm.calculationMethod === 'Measured') {
                                  <div class="p-6 rounded-3xl bg-white/5 border border-white/10">
                                     <label class="text-[10px] font-black uppercase tracking-widest block mb-4 opacity-60">{{ 'projects.contract_cost' | translate }}</label>
                                     <div class="relative group/val">
                                        <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-cyan-500 group-focus-within/val:scale-125 transition-transform">$</span>
                                        <input type="number" [(ngModel)]="createForm.totalContractValue"
                                               class="w-full p-6 pl-12 rounded-2xl bg-white/10 border border-white/10 focus:border-cyan-500/50 outline-none font-black text-2xl text-white transition-all shadow-inner">
                                     </div>
                                  </div>
                               }

                               @if (createForm.calculationMethod === 'Supervision') {
                                  <div class="space-y-4">
                                     <div (click)="createForm.useCompanyPercentage = !createForm.useCompanyPercentage"
                                          [class]="createForm.useCompanyPercentage ? 'bg-cyan-500 border-transparent' : 'bg-white/5 border-white/10'"
                                          class="flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer">
                                        <div>
                                           <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{{ 'projects.company_default' | translate }}</p>
                                           <p class="text-[9px] text-slate-400 font-bold">{{ 'projects.configured_at' | translate }} {{ (companySettings?.defaultSupervisionPercentage || 0) }}%</p>
                                        </div>
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" [attr.d]="createForm.useCompanyPercentage ? 'M5 13l4 4L19 7' : 'M12 4v16m8-8H4'"></path></svg>
                                        </div>
                                     </div>

                                     @if (!createForm.useCompanyPercentage) {
                                        <div class="p-6 rounded-3xl bg-white/5 border border-white/10 animate-in zoom-in-95 duration-300">
                                           <label class="text-[10px] font-black uppercase tracking-widest block mb-4 opacity-60">{{ 'projects.custom_override' | translate }}</label>
                                           <div class="relative">
                                              <span class="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-cyan-400">%</span>
                                              <input type="number" [(ngModel)]="createForm.supervisionPercentage"
                                                     class="w-full p-6 rounded-2xl bg-white/10 border border-white/10 focus:border-cyan-500 outline-none font-black text-2xl text-white">
                                           </div>
                                        </div>
                                     }
                                  </div>
                               }

                               @if (createForm.calculationMethod === 'Packages') {
                                  <div class="p-6 rounded-3xl bg-white/5 border border-white/10">
                                     <label class="text-[10px] font-black uppercase tracking-widest block mb-4 opacity-60">{{ 'projects.service_package' | translate }}</label>
                                     <div class="relative">
                                        <select [(ngModel)]="createForm.packageId"
                                                class="w-full p-6 pr-12 rounded-2xl bg-white/10 border border-white/10 focus:border-cyan-500 outline-none font-black text-lg text-white appearance-none cursor-pointer">
                                           <option [ngValue]="null" class="text-slate-900">{{ 'projects.select_package' | translate }}</option>
                                           @for (pkg of availablePackages; track pkg.id) {
                                              <option [value]="pkg.id" class="text-slate-900">{{ pkg.name }} — {{ pkg.price | currency }}</option>
                                           }
                                        </select>
                                        <svg class="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                                     </div>
                                  </div>
                               }
                            </div>
                         </div>
                      </div>

                      <!-- Adjustments & Overlays -->
                      <div class="p-8 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/10 shadow-lg relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg class="w-24 h-24 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                         </div>

                         <div class="flex items-center space-x-3 mb-8">
                             <p class="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em]">{{ 'projects.financial_overlays' | translate }}</p>
                            <div class="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
                         </div>

                         <div class="space-y-6">
                            <div class="grid grid-cols-12 gap-4">
                               <div class="col-span-4">
                                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{{ 'projects.extra_fees' | translate }}</label>
                                  <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>
                                    <input type="number" [(ngModel)]="createForm.extraFees"
                                           class="w-full p-4 pl-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 outline-none font-black text-sm text-slate-900 dark:text-white">
                                  </div>
                               </div>
                               <div class="col-span-8">
                                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{{ 'projects.reason' | translate }}</label>
                                  <input type="text" [(ngModel)]="createForm.extraFeesDescription"
                                         placeholder="Infrastructure, insurance, etc..."
                                         class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 outline-none font-bold text-sm text-slate-900 dark:text-white transition-all focus:ring-4 focus:ring-emerald-500/5">
                               </div>
                            </div>

                            <div class="grid grid-cols-12 gap-4">
                               <div class="col-span-4">
                                  <label class="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-2">{{ 'projects.deducted' | translate }}</label>
                                  <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold">$</span>
                                    <input type="number" [(ngModel)]="createForm.deductedAmount"
                                           class="w-full p-4 pl-8 rounded-2xl bg-white dark:bg-slate-950 border border-rose-500/10 outline-none font-black text-sm text-rose-500">
                                  </div>
                               </div>
                               <div class="col-span-8">
                                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{{ 'projects.deduction_reason' | translate }}</label>
                                  <input type="text" [(ngModel)]="createForm.deductedAmountDescription"
                                         placeholder="Down payment, security, etc..."
                                         class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 outline-none font-bold text-sm text-slate-900 dark:text-white transition-all focus:ring-4 focus:ring-rose-500/5">
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- Floating Audit (Validation Summary) -->
             @if (!isFormValid) {
                <div class="mx-10 mb-6 p-6 rounded-3xl bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
                   <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                         <div class="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                         </div>
                         <div>
                             <p class="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">{{ 'projects.audit_pending' | translate }}</p>
                            <div class="flex flex-wrap gap-2">
                               @for (error of validationErrors; track error) {
                                  <span class="px-3 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-rose-500/20">{{ error }}</span>
                               }
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             }

             <!-- Modal Footer (Premium Actions) -->
             <div class="p-10 shrink-0 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 relative z-10 flex items-center justify-between">
                <div class="text-left hidden md:block">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'projects.creation_status' | translate }}</p>
                   <p class="text-xs font-black text-slate-900 dark:text-white" [class.text-rose-500]="!isFormValid">{{ isFormValid ? ('projects.verified_config' | translate) : ('projects.incomplete_fields' | translate) }}</p>
                </div>

                <div class="flex space-x-6 w-full md:w-auto">
                   <button (click)="showCreateModal = false" class="px-10 py-5 rounded-[1.5rem] text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/5 transition-all active:scale-95">{{ 'projects.discard' | translate }}</button>
                   <button (click)="createProject()"
                           [disabled]="!isFormValid"
                           class="flex items-center space-x-3 px-12 py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group">
                      <span>{{ 'projects.establish' | translate }}</span>
                      <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                   </button>
                </div>
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
  calculationMethods: ('Measured' | 'Supervision' | 'Packages')[] = ['Measured', 'Supervision', 'Packages'];

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
    lng: 0 as number | null,
    // Daily Log Overrides
    allowAddProgressEntry: true,
    allowReopenClosedDay: false,
    autoCloseDay: false,
    autoCloseDayTime: '18:00'
  };

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
      lng: null,
      // Initialize with Company Defaults
      allowAddProgressEntry: this.companySettings?.allowAddProgressEntry ?? true,
      allowReopenClosedDay: this.companySettings?.allowReopenClosedDay ?? false,
      autoCloseDay: this.companySettings?.autoCloseDay ?? false,
      autoCloseDayTime: this.companySettings?.autoCloseDayTime ?? '18:00'
    };
    this.showCreateModal = true;
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
      }
    });
  }
}
