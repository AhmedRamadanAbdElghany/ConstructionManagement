import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Project, User, DailyLog, ProjectItem, CompanySettings, ProjectSettings, Role, Transaction, ProjectBill, ClientPayment, ProjectActivity, UpdateProjectRequest } from '../../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { PhaseService, Phase } from '../../../../core/services/phase.service';
import { ProjectService } from '../../../../core/services/project.service';
import { ProjectTeamService, TeamMemberDto } from '../../../../core/services/project-team.service';
import { DailyLogsService, DailyLogDto } from '../../../../core/services/daily-logs.service';
import { ProjectItemService } from '../../../../core/services/project-item.service';
import { TransactionsService, TransactionDto } from '../../../../core/services/transactions.service';
import { InvoicesService } from '../../../../core/services/invoices.service';
import { RolesService } from '../../../../core/services/roles.service';
import { DesignService } from '../../../../core/services/design.service';
import { VendorService } from '../../../../core/services/vendor.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { PhaseNodeComponent } from '../../project-hierarchy/phase-node.component';
import { ProjectItemProgressNodeComponent } from '../../project-hierarchy/project-item-progress-node.component';
import { DesignsTabComponent } from './designs-tab.component';
import { map } from 'rxjs/operators';

@Component({
   selector: 'app-project-detail',
   standalone: true,
   imports: [CommonModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule, PhaseNodeComponent, ProjectItemProgressNodeComponent, DesignsTabComponent], // Added FormsModule and ReactiveFormsModule
   template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      @if (project) {
        <div class="max-w-7xl mx-auto">
          <!-- Hero Header -->
          <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 rounded-[2.5rem] p-8 mb-8 overflow-hidden shadow-2xl shadow-slate-900/20 border border-white/5">
            <div class="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
            <div class="relative z-10">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-5">
                  <a routerLink="/admin/projects" class="p-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                  </a>
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-cyan-500/30 ring-2 ring-white/20">
                    {{ project.name.charAt(0) }}
                  </div>
                  <div>
                    <h1 class="text-3xl font-black text-white tracking-tight uppercase mb-1">{{ project.name }}</h1>
                    <div class="flex items-center space-x-3">
                      <p class="text-white/50 font-medium flex items-center text-sm">
                        <svg class="w-4 h-4 mr-1.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        </svg>
                        {{ project.location?.address || 'Main Site' }}
                      </p>
                      <span class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border"
                            [ngClass]="{
                              'bg-cyan-500/20 text-cyan-300 border-cyan-500/30': project.status === 'Active',
                              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30': project.status === 'Completed',
                              'bg-rose-500/20 text-rose-300 border-rose-500/30': project.status === 'Delayed'
                            }">
                        {{ 'projects.' + project.status.toLowerCase() | translate }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <!-- Health Score -->
                  <div class="flex items-center space-x-3 bg-white/10 backdrop-blur-xl rounded-2xl p-3 pr-5 border border-white/10">
                    <div class="relative w-10 h-10 flex items-center justify-center">
                      <svg class="w-full h-full transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="3" fill="transparent" class="text-white/10" />
                        <circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="3" fill="transparent" stroke-dasharray="100.5" stroke-dashoffset="10.05" class="text-emerald-400" />
                      </svg>
                      <span class="absolute text-[9px] font-black text-white">98</span>
                    </div>
                    <div>
                      <p class="text-[9px] font-black text-white/40 uppercase tracking-widest">{{ 'project_detail.health_score' | translate }}</p>
                      <p class="text-xs font-black text-emerald-400 uppercase">{{ 'project_detail.excellent' | translate }}</p>
                    </div>
                  </div>
                  <!-- Delete -->
                  <button (click)="deleteProject()" class="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white/50 hover:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 transition-all group">
                    <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none group hover:border-cyan-500/30 transition-all">
               <div class="flex items-center justify-between mb-3">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'dashboard.progress' | translate }}</p>
                 <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                   </svg>
                 </div>
               </div>
              <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ project.progress }}%</p>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none group hover:border-emerald-500/30 transition-all">
               <div class="flex items-center justify-between mb-3">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.earned' | translate }}</p>
                 <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                   </svg>
                 </div>
               </div>
              <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none group hover:border-cyan-500/30 transition-all">
               <div class="flex items-center justify-between mb-3">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.collected' | translate }}</p>
                 <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                   </svg>
                 </div>
               </div>
              <p class="text-3xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">{{ totalCollected | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none group hover:border-indigo-500/30 transition-all">
               <div class="flex items-center justify-between mb-3">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'project_detail.team_size' | translate }}</p>
                 <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                   </svg>
                 </div>
               </div>
              <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ teamMembers.length }}</p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            @for (tab of [
              { key: 'designs', label: 'project_detail.designs' },
              { key: 'phases', label: 'project_detail.phases_hierarchy' },
              { key: 'items', label: 'project_detail.items_progress' },
              { key: 'timeline', label: 'project_detail.timeline' },
              { key: 'team', label: 'project_detail.team_management' },
              { key: 'bills', label: 'sidebar.bills' },
              { key: 'payments', label: 'project_detail.client_payments' },
              { key: 'finances', label: 'project_detail.financial_overview' },
              { key: 'history', label: 'project_detail.activity_logs' },
              { key: 'settings', label: 'projects.ops_logic' }
            ]; track tab.key) {
              <button 
                (click)="setActiveTab(tab.key)"
                [ngClass]="{
                  'bg-gradient-to-r from-cyan-600 to-indigo-700 text-white border-transparent shadow-lg shadow-cyan-500/20': activeTab === tab.key,
                  'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-white/5 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-white/10': activeTab !== tab.key
                }"
                class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm whitespace-nowrap">
                {{ tab.label | translate }}
              </button>
            }
          </div>


          <!-- Designs Tab -->
          @if (activeTab === 'designs' && project) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all animate-in fade-in duration-500">
               <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                  <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'designs.title' | translate }}</h3>
                  <div class="flex items-center space-x-4">
                     @if (isDesignsInitialized) {
                        <button (click)="useGlobalDesignTemplate()" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                             {{ 'project_detail.switch_global' | translate }}
                        </button>
                        <button (click)="resetDesigns()" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                             {{ 'project_detail.start_over' | translate }}
                        </button>
                     }
                  </div>
               </div>
               <div class="p-8">
                  @if (!isDesignsInitialized) {
                      <div class="py-16 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.02]">
                           <div class="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 opacity-50">
                              <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                           </div>
                            <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Initialize Project Designs</h3>
                           <p class="text-slate-500 text-sm font-bold max-w-md mx-auto mb-10">Choose how you want to manage design categories for this project.</p>
                           
                           <div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-8">
                              <button (click)="useGlobalDesignTemplate()" class="w-full sm:w-80 p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border-2 border-cyan-500/20 hover:border-cyan-500 text-left transition-all hover:scale-[1.02] active:scale-98 group">
                                 <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-600 mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                 </div>
                                  <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{{ 'project_detail.global_template' | translate }}</h4>
                                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Import company standard categories</p>
                              </button>

                              <button (click)="startEmptyDesigns()" class="w-full sm:w-80 p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 hover:border-emerald-500 text-left transition-all hover:scale-[1.02] active:scale-98 group">
                                 <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                 </div>
                                  <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Empty Designs</h4>
                                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Build project-specific categories</p>
                              </button>
                           </div>
                      </div>
                  } @else {
                     <app-designs-tab [projectId]="project.id" [companyId]="project.companyId"></app-designs-tab>
                  }
               </div>
            </div>
          }

          <!-- Timeline Tab -->
          @if (activeTab === 'timeline') {
            <div class="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl transition-all">
                <div class="flex items-center justify-between mb-8">
                  <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.timeline' | translate }}</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 border-l-8 border-l-cyan-500 shadow-sm">
                    <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{{ 'project_detail.start_date' | translate }}</p>
                    <p class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ project.startDate | date:'fullDate' }}</p>
                  </div>
                  <div class="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 border-l-8 border-l-indigo-500 shadow-sm">
                    <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{{ 'project_detail.end_date' | translate }}</p>
                    <p class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ project.endDate ? (project.endDate | date:'fullDate') : 'Not Set' }}</p>
                  </div>
                  <div class="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 border-l-8 border-l-emerald-500 shadow-sm">
                     <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{{ 'personal_hr.duration' | translate }}</p>
                     <p class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ calculateDuration() }} {{ 'personal_hr.business_days' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Operational Logic (Settings) Tab -->
          @if (activeTab === 'settings') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <!-- Daily Log Controls -->
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl h-fit">
                  <div class="flex items-center space-x-4 mb-10">
                    <div class="w-14 h-14 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                       <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                    </div>
                    <div>
                       <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'projects.ops_logic' | translate }}</h3>
                       <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure automated behaviors</p>
                    </div>
                  </div>

                  @if (companySettings?.allowLocations) {
                    <div class="p-8 mb-8 rounded-[2.5rem] bg-slate-950 dark:bg-white text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group border border-white/5">
                      <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      </div>
                      <div class="relative z-10">
                        <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">Site Logistics & Positioning</p>
                        
                        <div class="space-y-8">
                           <!-- Physical Address -->
                           <div class="space-y-2">
                              <label class="text-[9px] font-black uppercase tracking-widest opacity-50">Physical Site Address</label>
                              <input type="text" [(ngModel)]="editForm.address" (change)="updateProject()"
                                     class="w-full bg-transparent border-b border-white/20 dark:border-slate-900/10 py-3 text-xl font-black outline-none focus:border-cyan-400 transition-colors uppercase tracking-tight"
                                     placeholder="ENTER COMPLETE SITE ADDRESS...">
                           </div>

                           <!-- GPS Coordinates -->
                           <div class="grid grid-cols-2 gap-10">
                             <div class="space-y-2">
                               <label class="text-[9px] font-black uppercase tracking-widest opacity-50">Latitude</label>
                               <input type="number" [(ngModel)]="editForm.lat" (change)="updateProject()" step="any"
                                      class="w-full bg-transparent border-b border-white/20 dark:border-slate-900/10 py-3 text-2xl font-black outline-none focus:border-cyan-400 transition-colors">
                             </div>
                             <div class="space-y-2">
                               <label class="text-[9px] font-black uppercase tracking-widest opacity-50">Longitude</label>
                               <input type="number" [(ngModel)]="editForm.lng" (change)="updateProject()" step="any"
                                      class="w-full bg-transparent border-b border-white/20 dark:border-slate-900/10 py-3 text-2xl font-black outline-none focus:border-cyan-400 transition-colors">
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  }

                  <div class="space-y-6">
                    @if (companySettings?.delayNotificationSendEmail) {
                      <div class="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 transition-all hover:border-cyan-500/30">
                        <div>
                           <p class="text-slate-900 dark:text-white font-black text-base uppercase tracking-tight mb-1">{{ 'project_detail.email_notifications' | translate }}</p>
                          <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                             {{ projectSettings?.delayNotificationSendEmail === null ? ('project_detail.inherited_from_company' | translate) : ('project_detail.local_override' | translate) }}
                          </p>
                        </div>
                        <div class="flex items-center space-x-4">
                          @if (projectSettings?.delayNotificationSendEmail !== null) {
                             <button (click)="resetEmailNotify()" class="px-4 py-2 rounded-xl bg-rose-500/10 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">Reset</button>
                          }
                          <button (click)="toggleEmailNotify()" 
                                  [class.bg-cyan-500]="projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail"
                                  [class.bg-slate-300]="!(projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail)"
                                  [class.dark:bg-slate-800]="!(projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail)"
                                  class="w-16 h-8 rounded-full relative transition-all shadow-inner">
                            <span [class.translate-x-8]="projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail"
                                  [class.translate-x-1]="!(projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail)"
                                  class="absolute left-0 top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform"></span>
                          </button>
                        </div>
                      </div>
                    }

                    @if (companySettings?.autoCloseDay) {
                    <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 space-y-6 transition-all hover:border-fuchsia-500/30">
                      <div class="flex items-center justify-between">
                        <div>
                           <p class="text-slate-900 dark:text-white font-black text-base uppercase tracking-tight mb-1">{{ 'project_detail.auto_close_logs' | translate }}</p>
                          <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                             {{ projectSettings?.autoCloseDay === null ? ('project_detail.inherited_from_company' | translate) : ('project_detail.local_override' | translate) }}
                          </p>
                        </div>
                        <div class="flex items-center space-x-4">
                          @if (projectSettings?.autoCloseDay !== null) {
                             <button (click)="resetAutoClose()" class="px-4 py-2 rounded-xl bg-rose-500/10 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">Reset</button>
                          }
                          <button (click)="toggleAutoClose()" 
                                  [class.bg-fuchsia-500]="projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay"
                                  [class.bg-slate-300]="!(projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay)"
                                  [class.dark:bg-slate-800]="!(projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay)"
                                  class="w-16 h-8 rounded-full relative transition-all shadow-inner">
                            <span [class.translate-x-8]="projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay"
                                  [class.translate-x-1]="!(projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay)"
                                  class="absolute left-0 top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform"></span>
                          </button>
                        </div>
                      </div>

                      @if (projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay) {
                        <div class="pt-6 border-t border-slate-200 dark:border-white/5 animate-in slide-in-from-top-4 duration-300">
                          <div class="flex items-center justify-between mb-4">
                             <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.close_time' | translate }}</p>
                            @if (projectSettings?.autoCloseDayTime !== null) {
                               <button (click)="resetAutoCloseTime()" class="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400">Default</button>
                            }
                          </div>
                          <input type="time" [ngModel]="projectSettings?.autoCloseDayTime ?? companySettings?.autoCloseDayTime"
                                 (ngModelChange)="updateAutoCloseTime($event)"
                                 class="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xl font-black outline-none focus:ring-4 focus:ring-fuchsia-500/20 transition-all shadow-inner">
                        </div>
                      }
                    </div>
                    }
                    @if (companySettings?.allowAddProgressEntry) {
                    <div class="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 transition-all hover:border-emerald-500/30">
                      <div>
                         <p class="text-slate-900 dark:text-white font-black text-base uppercase tracking-tight mb-1">{{ 'project_detail.allow_add_progress' | translate }}</p>
                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                           {{ projectSettings?.allowAddProgressEntry === null ? ('project_detail.inherited_from_company' | translate) : ('project_detail.local_override' | translate) }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-4">
                        @if (projectSettings?.allowAddProgressEntry !== null) {
                           <button (click)="resetProgressEntry()" class="px-4 py-2 rounded-xl bg-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm">Reset</button>
                        }
                        <button (click)="toggleProgressEntry()" 
                                [class.bg-emerald-500]="projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry"
                                [class.bg-slate-300]="!(projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry)"
                                [class.dark:bg-slate-800]="!(projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry)"
                                class="w-16 h-8 rounded-full relative transition-all shadow-inner">
                          <span [class.translate-x-8]="projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry"
                                [class.translate-x-1]="!(projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry)"
                                class="absolute left-0 top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform"></span>
                          </button>
                        </div>
                    </div>
                    }
                  </div>
               </div>

               <!-- Governance & Governance Status -->
               <div class="space-y-8">
                  <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl">
                    <div class="flex items-center space-x-4 mb-10">
                       <div class="w-14 h-14 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944V12.5m-8.618-6.516L12 12.5m0 0l8.618-6.516"></path></svg>
                       </div>
                       <div>
                          <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.governance_visibility' | translate }}</h3>
                          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Access & Approval Rules</p>
                       </div>
                    </div>

                    <div class="space-y-8">
                       <!-- Approvals Section -->
                       <div class="space-y-4">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Execution Assurance</p>
                          
                          @if (companySettings?.requirePhotoReview) {
                            <div class="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                              <div>
                                 <p class="text-slate-900 dark:text-white font-black text-base uppercase tracking-tight mb-1">{{ 'project_detail.photo_approval' | translate }}</p>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{{ projectSettings?.requirePhotoReview === null ? 'Inherited' : 'Override' }}</p>
                              </div>
                              <div class="flex items-center space-x-4">
                                @if (projectSettings?.requirePhotoReview !== null) {
                                   <button (click)="resetPhotoReview()" class="text-[9px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-500/20">Reset</button>
                                }
                                <button (click)="togglePhotoReview()" 
                                        [class.bg-orange-500]="projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview"
                                        [class.bg-slate-300] ="!(projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview)"
                                        [class.dark:bg-slate-800]="!(projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview)"
                                        class="w-14 h-7 rounded-full relative transition-all shadow-inner">
                                  <span [class.translate-x-7]="projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview"
                                        [class.translate-x-1]="!(projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview)"
                                        class="absolute left-0 top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform"></span>
                                </button>
                              </div>
                            </div>
                          }

                          @if (companySettings?.enableInvoiceReview) {
                            <div class="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                              <div>
                                 <p class="text-slate-900 dark:text-white font-black text-base uppercase tracking-tight mb-1">{{ 'project_detail.invoice_approval' | translate }}</p>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{{ projectSettings?.enableInvoiceReview === null ? 'Inherited' : 'Override' }}</p>
                              </div>
                              <div class="flex items-center space-x-4">
                                @if (projectSettings?.enableInvoiceReview !== null) {
                                   <button (click)="resetInvoiceReview()" class="text-[9px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-500/20">Reset</button>
                                }
                                <button (click)="toggleInvoiceReview()" 
                                        [class.bg-orange-500]="projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview"
                                        [class.bg-slate-300] ="!(projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview)"
                                        [class.dark:bg-slate-800]="!(projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview)"
                                        class="w-14 h-7 rounded-full relative transition-all shadow-inner">
                                  <span [class.translate-x-7]="projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview"
                                        [class.translate-x-1]="!(projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview)"
                                        class="absolute left-0 top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform"></span>
                                </button>
                              </div>
                            </div>
                          }
                       </div>

                       <!-- Client Portal Section -->
                       @if (companySettings?.clientCanSeeFinancials || companySettings?.clientCanSeeMedia || companySettings?.clientCanSeeProjectItems) {
                        <div class="space-y-4 pt-8 border-t border-slate-200 dark:border-white/10">
                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{{ 'project_detail.client_portal_visibility' | translate }}</p>
                          
                          @if (companySettings?.clientCanSeeFinancials) {
                            <div class="flex items-center justify-between p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/[0.02] border border-blue-500/10">
                              <div>
                                 <p class="text-blue-900 dark:text-blue-400 font-black text-sm uppercase tracking-tight mb-1">{{ 'project_detail.financial_status' | translate }}</p>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{{ projectSettings?.clientCanSeeFinancials === null ? 'Inherited' : 'Override' }}</p>
                              </div>
                              <div class="flex items-center space-x-4">
                                <button (click)="toggleClientFinancials()" 
                                        [class.bg-blue-500]="projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials"
                                        [class.bg-slate-300] ="!(projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials)"
                                        [class.dark:bg-slate-800]="!(projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials)"
                                        class="w-14 h-7 rounded-full relative transition-all shadow-inner">
                                  <span [class.translate-x-7]="projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials"
                                        [class.translate-x-1]="!(projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials)"
                                        class="absolute left-0 top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform"></span>
                                </button>
                              </div>
                            </div>
                          }

                          @if (companySettings?.clientCanSeeMedia) {
                            <div class="flex items-center justify-between p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/[0.02] border border-blue-500/10">
                              <div>
                                 <p class="text-blue-900 dark:text-blue-400 font-black text-sm uppercase tracking-tight mb-1">{{ 'daily_log.site_photos' | translate }}</p>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{{ projectSettings?.clientCanSeeMedia === null ? 'Inherited' : 'Override' }}</p>
                              </div>
                              <div class="flex items-center space-x-4">
                                <button (click)="toggleClientMedia()" 
                                        [class.bg-blue-500]="projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia"
                                        [class.bg-slate-300] ="!(projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia)"
                                        [class.dark:bg-slate-800]="!(projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia)"
                                        class="w-14 h-7 rounded-full relative transition-all shadow-inner">
                                  <span [class.translate-x-7]="projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia"
                                        [class.translate-x-1]="!(projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia)"
                                        class="absolute left-0 top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform"></span>
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                       }
                    </div>
                  </div>
               </div>
            </div>
          }

          <!-- Team Tab -->
          @if (activeTab === 'team') {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
              <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-950/20">
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.team_members' | translate }}</h3>
                <button (click)="showAddMemberModal = true" class="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  {{ 'project_detail.add_member' | translate }}
                </button>
              </div>
              <div class="divide-y divide-slate-100 dark:divide-white/5">
                @for (member of teamMembers; track member.id) {
                  <div class="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <div class="flex items-center space-x-4">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                        {{ member.fullName.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ member.fullName }}</p>
                        <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{{ member.email }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-6">
                      <div class="flex flex-col items-end">
                        <div class="flex items-center">
                          <span class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                [ngClass]="{
                                  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/10': (roleOverrides[member.id] || member.role) === 'CompanyAdmin',
                                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10': (roleOverrides[member.id] || member.role) === 'CompanyUser',
                                  'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/10': !['CompanyAdmin', 'CompanyUser'].includes(roleOverrides[member.id] || member.role)
                                }">
                            {{ roleOverrides[member.id] || member.role }}
                          </span>
                          @if (roleOverrides[member.id]) {
                            <div class="ml-3 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
                              <span class="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                               <span class="text-[8px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-tighter">{{ 'project_detail.override' | translate }}</span>
                            </div>
                          }
                        </div>
                      </div>
                      <button 
                        (click)="openRoleModal(member)"
                        class="px-5 py-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center">
                        <svg class="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                         {{ 'project_detail.change_role' | translate }}
                      </button>
                      <button class="p-3 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Activity Tab -->
          @if (activeTab === 'history') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <!-- Activity Feed -->
              <div class="lg:col-span-2 space-y-4">
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8">
                   <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'project_detail.pulse_activity' | translate }}</h3>
                  <div class="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent dark:before:from-white/10 dark:before:to-transparent">
                    @for (activity of activities; track activity.id) {
                      <div class="relative flex items-start group">
                        <div class="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white dark:border-slate-900 transition-all group-hover:scale-110"
                             [ngClass]="{
                               'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20': activity.type === 'Log',
                               'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20': activity.type === 'Finance',
                               'bg-purple-500 text-white shadow-lg shadow-purple-500/20': activity.type === 'Team',
                               'bg-amber-500 text-white shadow-lg shadow-amber-500/20': activity.type === 'Setting',
                               'bg-rose-500 text-white shadow-lg shadow-rose-500/20': activity.type === 'Media'
                             }">
                          @if (activity.type === 'Log') { <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> }
                          @if (activity.type === 'Finance') { <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> }
                          @if (activity.type === 'Team') { <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> }
                          @if (activity.type === 'Setting') { <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> }
                        </div>
                        <div class="flex-1 ml-16 bg-slate-50 dark:bg-white/[0.02] rounded-3xl p-6 border border-slate-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-white/5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                          <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-black text-slate-900 dark:text-white">{{ activity.userName }}</span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ activity.timestamp | date:'shortTime' }}</span>
                          </div>
                          <p class="text-sm font-black text-slate-600 dark:text-cyan-400 mb-1">{{ activity.action }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{{ activity.details }}</p>
                          @if (activity.timestamp) {
                            <p class="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ activity.timestamp | date:'longDate' }}</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Secondary Section: Daily Logs Summary -->
              <div class="space-y-6">
                <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20">
                   <h4 class="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-6">{{ 'project_detail.historical_logs' | translate }}</h4>
                  <div class="space-y-3">
                     @for (log of dailyLogs.slice(0, 5); track log.id) {
                       <div (click)="openLogDetails(log)" class="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                         <div class="flex flex-col">
                            <span class="text-xs font-bold">{{ log.date | date:'mediumDate' }}</span>
                             <span class="text-[8px] font-black uppercase opacity-60 tracking-widest mt-0.5">{{ log.isClosed ? ('project_detail.verified_sealed' | translate) : ('project_detail.draft' | translate) }}</span>
                         </div>
                         <div class="flex items-center space-x-2">
                            <span class="px-2 py-1 rounded-lg bg-white/10 text-[9px] font-black uppercase">{{ log.items.length }} Items</span>
                            <svg class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
                         </div>
                       </div>
                     }
                  </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8">
                   <h4 class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6">{{ 'dashboard.quick_stats' | translate }}</h4>
                  <div class="space-y-6">
                    <div>
                      <div class="flex items-center justify-between mb-2">
                         <span class="text-[10px] font-black text-slate-400 uppercase">{{ 'project_detail.log_accuracy' | translate }}</span>
                        <span class="text-sm font-black text-slate-900 dark:text-white">94%</span>
                      </div>
                      <div class="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500" style="width: 94%"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] font-black text-slate-400 uppercase">Approval Speed</span>
                        <span class="text-sm font-black text-slate-900 dark:text-white">2.4h</span>
                      </div>
                      <div class="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-cyan-500" style="width: 70%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

           <!-- Project Items Tab -->
           @if (activeTab === 'items') {
             <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all animate-in fade-in duration-500">
               <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                 <div>
                      <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.items_progress_dashboard' | translate }}</h3>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{{ 'project_detail.items_progress_desc' | translate }}</p>
                 </div>
                 <div class="flex items-center space-x-6">
                    <div class="text-right">
                        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{{ 'project_detail.total_project_value' | translate }}</div>
                       <div class="text-lg font-black text-emerald-600 dark:text-emerald-400">{{ totalProjectValue | currency:'USD' }}</div>
                    </div>
                 </div>
               </div>
               <div class="p-8">
                  <div class="space-y-4">
                     @for (phase of projectPhases; track phase.id) {
                        <app-project-item-progress-node 
                            [node]="phase" 
                            [parentTotalMoney]="totalProjectValue">
                        </app-project-item-progress-node>
                     } @empty {
                        <div class="py-20 text-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/5">
                           <div class="w-16 h-16 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 opacity-50">
                              <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                           </div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'project_detail.init_hierarchy' | translate }}</p>
                            <p class="text-xs text-slate-400">{{ 'project_detail.hierarchy_required_desc' | translate }}</p>
                        </div>
                     }
                  </div>
               </div>
             </div>
           }

           <!-- Phases Tab -->
           @if (activeTab === 'phases') {
             <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all animate-in fade-in duration-500">
               <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                  <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.phase_hierarchy_title' | translate }}</h3>
                 <div class="flex items-center space-x-4">
                    @if (isPhasesInitialized) {
                        <button (click)="useGlobalTemplate()" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                             {{ 'project_detail.switch_global' | translate }}
                        </button>
                        <button (click)="resetHierarchy()" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                             {{ 'project_detail.start_over' | translate }}
                        </button>
                        <button (click)="openPhaseModal()" class="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                            {{ 'HR.add_worker' | translate }}
                        </button>
                    }
                 </div>
               </div>
               <div class="p-8">
                  @if (!isPhasesInitialized) {
                      <div class="py-16 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.02]">
                           <div class="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 opacity-50">
                              <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                           </div>
                            <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{{ 'project_detail.init_hierarchy' | translate }}</h3>
                           <p class="text-slate-500 text-sm font-bold max-w-md mx-auto mb-10">Choose how you want to structure your project phases and tasks.</p>
                           
                           <div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-8">
                              <button (click)="useGlobalTemplate()" class="w-full sm:w-80 p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border-2 border-cyan-500/20 hover:border-cyan-500 text-left transition-all hover:scale-[1.02] active:scale-98 group">
                                 <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-600 mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                                 </div>
                                  <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{{ 'project_detail.global_template' | translate }}</h4>
                                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{{ 'project_detail.import_standard' | translate }}</p>
                              </button>

                              <button (click)="startEmptyHierarchy()" class="w-full sm:w-80 p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 hover:border-emerald-500 text-left transition-all hover:scale-[1.02] active:scale-98 group">
                                 <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                 </div>
                                  <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{{ 'project_detail.empty_hierarchy' | translate }}</h4>
                                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{{ 'project_detail.build_from_scratch' | translate }}</p>
                              </button>
                           </div>
                      </div>
                  } @else {
                      <div class="space-y-4">
                         @for (phase of projectPhases; track phase.id) {
                         <app-phase-node 
                             [node]="phase"
                             [loadingMap]="loadingPhases"
                             (onAddChild)="openPhaseModal(undefined, $event)"
                             (onEdit)="openPhaseModal($event)"
                             (onDelete)="deletePhase($event)"
                             (onMoveUp)="movePhase($event, -1)"
                             (onMoveDown)="movePhase($event, 1)"
                             (onAddItems)="openItemModal($event)"
                             (onEditItem)="openItemModal($event.phase, $event.item)"
                             (onDeleteItem)="onDeleteItem($event)">
                         </app-phase-node>
                         } @empty {
                             <div class="py-16 text-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/5">
                                 <p class="text-slate-400 font-black uppercase tracking-widest text-[10px]">Your hierarchy is empty. Use the 'Add Phase' button above.</p>
                             </div>
                         }
                      </div>
                  }
               </div>
             </div>
           }

          <!-- Finances Tab -->
          @if (activeTab === 'finances' && project) {
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
               <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <!-- Sidebar: Configuration -->
                  <div class="space-y-6">
                     <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl">
                        <div class="flex items-center space-x-3 mb-8">
                           <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                           </div>
                            <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.billing_parameters' | translate }}</h4>
                        </div>
                        
                        <div class="space-y-6">
                           <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                               <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'projects.financial_model' | translate }}</p>
                              <p class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ project.calculationMethod || 'Measured' }}</p>
                           </div>

                           <div class="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                               <p class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">{{ 'projects.contract_cost' | translate }}</p>
                              <p class="text-lg font-black text-slate-900 dark:text-white">{{ (project.totalContractValue || 0) | currency }}</p>
                           </div>

                           <div class="grid grid-cols-1 gap-4">
                              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                                  <p class="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">{{ 'projects.extra_fees' | translate }}</p>
                                 <p class="text-xs font-black text-slate-900 dark:text-white">{{ (project.extraFees || 0) | currency }}</p>
                              </div>
                              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                                  <p class="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">{{ 'projects.deducted' | translate }}</p>
                                 <p class="text-xs font-black text-slate-900 dark:text-white">{{ (project.deductedAmount || 0) | currency }}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <!-- Main Area: Data -->
                  <div class="lg:col-span-3 space-y-8">
                     <!-- Dashboard -->
                     <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                           <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                            <p class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">{{ 'project_detail.total_earned' | translate }}</p>
                           <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ project.cashFlow.earned | currency }}</h3>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                           <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
                           <p class="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-4">Collected</p>
                           <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ totalCollected | currency }}</h3>
                        </div>
                        <div class="p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all border"
                             [class.bg-slate-900]="(totalCollected - project.cashFlow.earned) < 0"
                             [class.bg-white]="(totalCollected - project.cashFlow.earned) >= 0"
                             [class.dark:bg-slate-900]="(totalCollected - project.cashFlow.earned) >= 0"
                             [class.text-white]="(totalCollected - project.cashFlow.earned) < 0"
                             [class.border-transparent]="(totalCollected - project.cashFlow.earned) < 0"
                             [class.border-slate-200]="(totalCollected - project.cashFlow.earned) >= 0"
                             [class.dark:border-white/5]="(totalCollected - project.cashFlow.earned) >= 0">
                           <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>
                           <p class="text-[10px] font-black uppercase tracking-widest mb-4" [class.text-slate-400]="(totalCollected - project.cashFlow.earned) < 0" [class.text-rose-500]="(totalCollected - project.cashFlow.earned) >= 0">Net Flow</p>
                           <h3 class="text-3xl font-black tracking-tight" [class.text-rose-400]="(totalCollected - project.cashFlow.earned) < 0" [class.text-rose-500]="(totalCollected - project.cashFlow.earned) >= 0">
                              {{ (totalCollected - project.cashFlow.earned) | currency }}
                           </h3>
                        </div>
                     </div>

                     <!-- Transaction Ledger -->
                     <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                        <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                           <div>
                              <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Transaction Ledger</h3>
                              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Full financial data stream</p>
                           </div>
                           <div class="flex items-center space-x-3">
                              <button class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-cyan-500 transition-all shadow-sm">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                              </button>
                              <button class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-cyan-500 transition-all shadow-sm">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                              </button>
                           </div>
                        </div>
                        <div class="overflow-x-auto">
                           <table class="w-full text-left border-collapse">
                              <thead>
                                 <tr class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                 </tr>
                              </thead>
                              <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                                 @for (trans of transactions; track trans.id) {
                                    <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                       <td class="px-8 py-6">
                                          <p class="text-sm font-bold text-slate-900 dark:text-white">{{ trans.date | date:'MMM dd, yyyy' }}</p>
                                          <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reference #{{ trans.id }}</p>
                                       </td>
                                       <td class="px-8 py-6">
                                          <p class="text-sm font-black text-slate-700 dark:text-slate-300">{{ trans.description }}</p>
                                       </td>
                                       <td class="px-8 py-6">
                                          <span class="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                                [class.bg-emerald-500/10]="trans.type === 'Income'"
                                                [class.text-emerald-600]="trans.type === 'Income'"
                                                [class.dark:text-emerald-400]="trans.type === 'Income'"
                                                [class.bg-rose-500/10]="trans.type === 'Expense'"
                                                [class.text-rose-600]="trans.type === 'Expense'"
                                                [class.dark:text-rose-400]="trans.type === 'Expense'">
                                             {{ trans.type }}
                                          </span>
                                       </td>
                                       <td class="px-8 py-6 text-right">
                                          <p class="text-base font-black" 
                                             [class.text-emerald-600]="trans.type === 'Income'" 
                                             [class.dark:text-emerald-400]="trans.type === 'Income'"
                                             [class.text-rose-600]="trans.type === 'Expense'"
                                             [class.dark:text-rose-400]="trans.type === 'Expense'">
                                             {{ trans.type === 'Income' ? '+' : '-' }}{{ trans.amount | currency }}
                                          </p>
                                       </td>
                                    </tr>
                                 } @empty {
                                    <tr>
                                       <td colspan="5" class="px-8 py-24 text-center">
                                          <div class="w-16 h-16 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                                             <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                          </div>
                                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No financial movements tracked for this identity</p>
                                       </td>
                                    </tr>
                                 }
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          }
 
          <!-- Bills Tab -->
          @if (activeTab === 'bills' && project) {
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                  <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                     <div>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Project Billing Ledger</h3>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit of all project invoices and claims</p>
                     </div>
                     <button (click)="showAddBillModal = true" class="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                        Create New Bill
                     </button>
                  </div>
                  <div class="overflow-x-auto">
                     <table class="w-full text-left border-collapse">
                        <thead>
                           <tr class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Date</th>
                              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill Reference</th>
                              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Trail</th>
                              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                           @for (bill of bills; track bill.id) {
                              <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                 <td class="px-8 py-6">
                                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ bill.date | date:'MMM dd, yyyy' }}</p>
                                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{{ bill.date | date:'h:mm a' }}</p>
                                 </td>
                                 <td class="px-8 py-6">
                                    <div class="flex items-center space-x-3">
                                       <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                       </div>
                                       <div>
                                          <div class="flex items-center space-x-2">
                                             <p class="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{{ bill.billNumber }}</p>
                                             @if (bill.photoUrl) {
                                                <a [href]="bill.photoUrl" target="_blank" class="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all">
                                                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                </a>
                                             }
                                          </div>
                                          @if (bill.notes) {
                                             <p class="text-[9px] text-rose-500 font-bold mt-1 italic">Note: {{ bill.notes }}</p>
                                          }
                                       </div>
                                    </div>
                                 </td>
                                 <td class="px-8 py-6 text-right">
                                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ bill.amount | currency }}</p>
                                 </td>
                                  <td class="px-8 py-6">
                                     <span class="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center"
                                           [ngClass]="{
                                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': bill.status === 'Approved',
                                              'bg-rose-500/10 text-rose-600 dark:text-rose-400': bill.status === 'Rejected',
                                              'bg-amber-500/10 text-amber-600 dark:text-amber-400': bill.status === 'Pending'
                                           }">
                                        <span class="w-1.5 h-1.5 rounded-full mr-2 opacity-70"
                                              [class.bg-emerald-500]="bill.status === 'Approved'"
                                              [class.bg-rose-500]="bill.status === 'Rejected'"
                                              [class.bg-amber-500]="bill.status === 'Pending'"></span>
                                        {{ bill.status }}
                                     </span>
                                  </td>
                                 <td class="px-8 py-6">
                                    @if (bill.actionBy) {
                                       <div class="flex items-center space-x-3">
                                          <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                                             {{ bill.actionBy.charAt(0) }}
                                          </div>
                                          <div>
                                             <p class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{{ bill.actionBy }}</p>
                                             <p class="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{{ bill.actionAt | date:'MMM dd, h:mm a' }}</p>
                                          </div>
                                       </div>
                                    } @else {
                                       <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Awaiting Action</p>
                                    }
                                 </td>
                              </tr>
                           } @empty {
                              <tr>
                                 <td colspan="5" class="px-8 py-24 text-center">
                                    <div class="w-16 h-16 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 opacity-50">
                                       <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No project bills identified in this cycle</p>
                                 </td>
                              </tr>
                           }
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          }

          <!-- Client Payments Tab -->
          @if (activeTab === 'payments' && project) {
             <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                   <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                      <div>
                         <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue Registry</h3>
                         <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Official client payment records</p>
                      </div>
                      <div class="flex items-center space-x-3">
                         <div class="px-6 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Total Collected</p>
                            <p class="text-sm font-black text-slate-900 dark:text-white">{{ totalCollected | currency }}</p>
                         </div>
                         <button (click)="showAddPaymentModal = true" class="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                            Add Client Payment
                         </button>
                      </div>
                   </div>
                   <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                         <thead>
                            <tr class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                               <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Date</th>
                               <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method & Reference</th>
                               <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                               <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                               <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                            @for (payment of clientPayments; track payment.id) {
                               <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                  <td class="px-8 py-6">
                                     <p class="text-sm font-bold text-slate-900 dark:text-white">{{ payment.date | date:'MMM dd, yyyy' }}</p>
                                     <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{{ payment.date | date:'h:mm a' }}</p>
                                  </td>
                                  <td class="px-8 py-6">
                                     <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                           @if (payment.method === 'Bank Transfer') {
                                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                                           } @else if (payment.method === 'Cash') {
                                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                           } @else {
                                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                           }
                                        </div>
                                        <div>
                                           <p class="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{{ payment.method }}</p>
                                           <p class="text-[9px] text-cyan-500 font-bold uppercase tracking-widest mt-0.5">Ref: {{ payment.referenceNumber }}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td class="px-8 py-6 text-right">
                                     <p class="text-base font-black text-emerald-600 dark:text-emerald-400">+{{ payment.amount | currency }}</p>
                                  </td>
                                   <td class="px-8 py-6">
                                      <div class="flex items-center space-x-2">
                                         <span class="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center"
                                               [ngClass]="{
                                                 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': payment.status === 'Received',
                                                 'bg-amber-500/10 text-amber-600 dark:text-amber-400': payment.status === 'Pending',
                                                 'bg-rose-500/10 text-rose-600 dark:text-rose-400': payment.status === 'Bounced'
                                               }">
                                            {{ payment.status }}
                                         </span>
                                         @if (payment.photoUrl) {
                                            <a [href]="payment.photoUrl" target="_blank" class="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all shadow-sm">
                                               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            </a>
                                         }
                                      </div>
                                   </td>
                                   <td class="px-8 py-6">
                                      @if (payment.actionBy) {
                                         <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                                               {{ payment.actionBy.charAt(0) }}
                                            </div>
                                            <p class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{{ payment.actionBy }}</p>
                                         </div>
                                      } @else {
                                         <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic opacity-50">System</p>
                                      }
                                   </td>
                               </tr>
                            } @empty {
                               <tr>
                                  <td colspan="5" class="px-8 py-24 text-center">
                                     <div class="w-16 h-16 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 opacity-50">
                                        <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                     </div>
                                     <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No client payments identified in this cycle</p>
                                  </td>
                               </tr>
                            }
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          }

          <!-- Full Project Edit Modal -->
          @if (showEditModal) {
            <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
               <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
                  <!-- Modal Header -->
                  <div class="p-10 pb-6 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                     <div>
                        <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Project Master Control</h2>
                        <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-1">Configure all identity, financial and system parameters</p>
                     </div>
                     <button (click)="showEditModal = false" class="p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:scale-110 active:scale-95 group">
                        <svg class="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>

                  <!-- Modal Body (Scrollable) -->
                  <div class="p-10 space-y-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
                     <!-- 1. Identification -->
                     <div class="space-y-6">
                        <div class="flex items-center space-x-3 mb-2">
                           <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-bold text-xs italic">01</div>
                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification & Location</p>
                        </div>
                        <div class="grid grid-cols-1 gap-5">
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-cyan-500">Project Title</label>
                              <input type="text" [(ngModel)]="editForm.name" 
                                     class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all">
                           </div>

                        </div>
                        
                        <div class="grid grid-cols-2 gap-5">
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.mobilization_date' | translate }}</label>
                              <input type="date" [(ngModel)]="editForm.startDate" 
                                     class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-xs outline-none focus:border-cyan-500">
                           </div>
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.anticipated_handover' | translate }}</label>
                              <input type="date" [(ngModel)]="editForm.endDate" 
                                     class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-xs outline-none focus:border-cyan-500">
                           </div>
                        </div>


                     </div>

                      <!-- 2. Financial Config -->
                      <div class="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
                         <div class="flex items-center space-x-3 mb-2">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs italic">02</div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Engineering</p>
                         </div>

                         <!-- Live Data Context -->
                         <div class="grid grid-cols-3 gap-3 mb-6">
                            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                               <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Earned</p>
                               <p class="text-xs font-black text-slate-900 dark:text-white">{{ project.cashFlow.earned | currency }}</p>
                            </div>
                            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                               <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Collected</p>
                               <p class="text-xs font-black text-slate-900 dark:text-white">{{ totalCollected | currency }}</p>
                            </div>
                            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 text-center">
                               <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Flow</p>
                               <p class="text-xs font-black" [class.text-rose-500]="(totalCollected - project.cashFlow.earned) < 0" [class.text-emerald-500]="(totalCollected - project.cashFlow.earned) >= 0">
                                  {{ (totalCollected - project.cashFlow.earned) | currency }}
                               </p>
                            </div>
                         </div>

                         <div class="relative group">
                           <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Billing Method</label>
                           <select [(ngModel)]="editForm.calculationMethod" class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer">
                              <option value="Measured">Measured (Remeasurement)</option>
                              <option value="Supervision">Supervision (Percentage)</option>
                              <option value="Packages">Lump Sum (Packages)</option>
                           </select>
                        </div>

                        @if (editForm.calculationMethod === 'Measured') {
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-emerald-500">Contractual Value</label>
                              <div class="relative">
                                 <span class="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                                 <input type="number" [(ngModel)]="editForm.totalContractValue" 
                                        class="w-full p-5 pl-10 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                              </div>
                           </div>
                        }

                        <div class="grid grid-cols-2 gap-5">
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Adjustment: Extra Fees</label>
                              <input type="number" [(ngModel)]="editForm.extraFees" 
                                     class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-amber-600 font-bold text-sm outline-none focus:border-amber-500">
                           </div>
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Adjustment: Deductions</label>
                              <input type="number" [(ngModel)]="editForm.deductedAmount" 
                                     class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-rose-600 font-bold text-sm outline-none focus:border-rose-500">
                           </div>
                        </div>
                     </div>

                     <!-- 3. System Automation -->
                     <div class="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
                        <div class="flex items-center space-x-3 mb-2">
                           <div class="w-8 h-8 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 font-bold text-xs italic">03</div>
                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Governance & Automation</p>
                        </div>
                        
                        <div class="grid grid-cols-1 gap-4">
                           <div class="p-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:bg-white dark:hover:bg-white/5 transition-all">
                              <div>
                                 <p class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Auto-close Daily Logs</p>
                                 <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Force midnight finalization for this project</p>
                              </div>
                              <label class="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" [(ngModel)]="editForm.autoCloseDay" class="sr-only peer">
                                 <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-500 transition-all shadow-inner"></div>
                              </label>
                           </div>

                           @if (companySettings?.delayNotificationSendEmail) {
                              <div class="p-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:bg-white dark:hover:bg-white/5 transition-all">
                                 <div>
                                    <p class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Email Pulse</p>
                                    <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time status alerts for stakeholders</p>
                                 </div>
                                 <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="editForm.delayNotificationSendEmail" class="sr-only peer">
                                    <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 transition-all shadow-inner"></div>
                                 </label>
                              </div>
                           }
                        </div>
                     </div>
                  </div>

                  <!-- Modal Footer -->
                  <div class="p-10 pt-6 flex space-x-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-white/5 shrink-0">
                     <button (click)="showEditModal = false" class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-slate-800 text-slate-500 font-black text-[11px] uppercase tracking-widest border border-slate-200 dark:border-white/5 shadow-sm hover:bg-slate-50 transition-all">Exit without Saving</button>
                     <button (click)="updateProject(); showEditModal = false" [disabled]="!isEditFormValid" class="flex-[2] py-5 rounded-[1.5rem] bg-slate-900 dark:bg-cyan-500 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale">Commit Configurations</button>
                  </div>
               </div>
            </div>
          }

          <!-- Role Assignment Modal -->
          @if (showRoleModal && userToEdit) {
            <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
               <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
                  <div class="p-10 pb-6 text-center">
                     <div class="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-500 to-indigo-600 mx-auto flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-purple-500/20 mb-6">
                        {{ userToEdit.fullName.charAt(0) }}
                     </div>
                     <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ userToEdit.fullName }}</h3>
                     <p class="text-[10px] text-purple-500 font-bold uppercase tracking-widest mt-1">Assign Strategic Project Role</p>
                  </div>

                  <div class="p-10 pt-0 space-y-3">
                     @for (role of availableRoles; track role.id) {
                        <button 
                           (click)="updateUserRole(role.name)"
                           class="w-full p-5 rounded-[1.5rem] text-left transition-all border group relative overflow-hidden"
                           [class.bg-purple-600]="(roleOverrides[userToEdit.id] || userToEdit.role) === role.name"
                           [class.text-white]="(roleOverrides[userToEdit.id] || userToEdit.role) === role.name"
                           [class.border-transparent]="(roleOverrides[userToEdit.id] || userToEdit.role) === role.name"
                           [class.bg-slate-100]="(roleOverrides[userToEdit.id] || userToEdit.role) !== role.name"
                           [class.dark:bg-slate-800/50]="(roleOverrides[userToEdit.id] || userToEdit.role) !== role.name"
                           [class.text-slate-900]="(roleOverrides[userToEdit.id] || userToEdit.role) !== role.name"
                           [class.dark:text-white]="(roleOverrides[userToEdit.id] || userToEdit.role) !== role.name"
                           [class.border-slate-200]="(roleOverrides[userToEdit.id] || userToEdit.role) !== role.name"
                           [class.dark:border-white/5]="(roleOverrides[userToEdit.id] || userToEdit.role) !== role.name"
                           [class.hover:border-purple-500/50]="(roleOverrides[userToEdit.id] || userToEdit.role) !== role.name"
                        >
                           <div class="flex items-center justify-between relative z-10">
                              <div>
                                 <p class="font-black text-sm uppercase tracking-tight transition-colors">{{ role.name }}</p>
                                 <p class="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1 transition-colors">{{ role.description }}</p>
                              </div>
                              @if ((roleOverrides[userToEdit.id] || userToEdit.role) === role.name) {
                                 <svg class="w-5 h-5 text-white animate-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                              }
                           </div>
                        </button>
                     }
                  </div>

                  <div class="p-10 pt-4 flex space-x-4 shrink-0">
                     <button (click)="showRoleModal = false" class="w-full py-5 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[11px] uppercase tracking-widest">Close Selection</button>
                  </div>
               </div>
            </div>
          }

          <!-- Add Project Item Modal -->
          @if (showAddItemModal) {
            <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
               <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
                  <div class="p-10 pb-6 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                     <div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                           {{ selectedProjectItem ? 'Configure Item Dates' : 'Add Project Item' }}
                        </h3>
                        <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-1">
                           {{ selectedProjectItem ? 'Update schedule for ' + selectedProjectItem.itemName : 'New work item definition' }}
                        </p>
                     </div>
                     <button (click)="showAddItemModal = false" class="p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                        <svg class="w-5 h-5 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>

                  <div class="p-10 pt-6 space-y-6">
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <input type="text" [(ngModel)]="itemForm.description" placeholder="e.g. Excavation Works"
                               class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all">
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div class="relative group">
                           <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit</label>
                           <select [(ngModel)]="itemForm.unit" 
                                   class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none appearance-none">
                              <option value="">Select Unit</option>
                              <option value="m³">m³ (Cubic Meter)</option>
                              <option value="m²">m² (Square Meter)</option>
                              <option value="m">m (Meter)</option>
                              <option value="ton">Ton</option>
                              <option value="kg">kg (Kilogram)</option>
                              <option value="pcs">Pieces</option>
                              <option value="L.S.">Lump Sum</option>
                           </select>
                        </div>
                        <div class="relative group">
                           <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Quantity</label>
                           <input type="number" [(ngModel)]="itemForm.totalQuantity" 
                                  class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                        </div>
                     </div>
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Rate ($)</label>
                        <input type="number" [(ngModel)]="itemForm.rate" 
                               class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                     </div>
                      <div class="grid grid-cols-2 gap-4">
                         <div class="relative group">
                            <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.start_date' | translate }}</label>
                            <input type="date" [(ngModel)]="itemForm.startDate" 
                                   class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                         </div>
                         <div class="relative group">
                            <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.end_date' | translate }}</label>
                            <input type="date" [(ngModel)]="itemForm.endDate" 
                                   class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                         </div>
                      </div>
                     @if (itemForm.totalQuantity > 0 && itemForm.rate > 0) {
                        <div class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                           <p class="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Estimated Total Value</p>
                           <p class="text-xl font-black text-emerald-600">{{ itemForm.totalQuantity * itemForm.rate | currency:'USD' }}</p>
                        </div>
                     }
                  </div>

                   <div class="p-10 pt-4 flex space-x-4 shrink-0 bg-slate-50/50 dark:bg-white/5">
                      <button (click)="showAddItemModal = false" class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-slate-800 text-slate-500 font-black text-[11px] uppercase tracking-widest border border-slate-200 dark:border-white/5">Cancel</button>
                      <button (click)="addProjectItem()" [disabled]="!itemForm.description || !itemForm.unit || itemForm.totalQuantity <= 0 || isSavingItem" class="flex-[2] py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3">
                         @if (isSavingItem) {
                            <svg class="animate-spin h-4 w-4 text-white dark:text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                               <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processing...</span>
                         } @else {
                            <span>{{ selectedProjectItem ? 'Update Configuration' : 'Add Item' }}</span>
                         }
                      </button>
                   </div>
               </div>
            </div>
          }

          <!-- Add Bill Modal -->
          @if (showAddBillModal) {
            <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
               <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
                  <div class="p-10 pb-6 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                     <div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create New Bill</h3>
                        <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-1">Register official invoice</p>
                     </div>
                     <button (click)="showAddBillModal = false" class="p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                        <svg class="w-5 h-5 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>

                  <div class="p-10 pt-6 space-y-6">
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bill Reference Number</label>
                        <input type="text" [(ngModel)]="billForm.billNumber" 
                               class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all">
                     </div>
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</label>
                        <input type="number" [(ngModel)]="billForm.amount" 
                               class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all">
                     </div>
                      <div class="relative group">
                         <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.date' | translate }}</label>
                         <input type="date" [(ngModel)]="billForm.date" 
                                class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-cyan-500">
                      </div>
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                        <textarea [(ngModel)]="billForm.notes" 
                                  class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-cyan-500"></textarea>
                     </div>
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bill Photo</label>
                        <div class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 border-dashed flex flex-col items-center justify-center text-center group-hover:border-cyan-500/50 transition-colors cursor-pointer relative">
                           <input type="file" (change)="onFileSelected($event, 'bill')" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                           @if (!billForm.photoUrl) {
                              <div class="space-y-2">
                                 <svg class="w-8 h-8 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                 <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Click to Upload Image</p>
                              </div>
                           }
                           @if (billForm.photoUrl) {
                              <div class="relative z-20 w-full">
                                 <img [src]="billForm.photoUrl" class="h-32 mx-auto rounded-xl shadow-lg object-contain bg-white dark:bg-black/20">
                                 <p class="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-2">Image Selected</p>
                              </div>
                           }
                        </div>
                     </div>
                  </div>

                  <div class="p-10 pt-4 flex space-x-4 shrink-0 bg-slate-50/50 dark:bg-white/5">
                     <button (click)="showAddBillModal = false" class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-slate-800 text-slate-500 font-black text-[11px] uppercase tracking-widest border border-slate-200 dark:border-white/5">Cancel</button>
                     <button (click)="addBill()" [disabled]="!billForm.billNumber || billForm.amount <= 0" class="flex-[2] py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">Create Bill</button>
                  </div>
               </div>
            </div>
          }

          <!-- Add Payment Modal -->
          @if (showAddPaymentModal) {
            <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
               <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
                  <div class="p-10 pb-6 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                     <div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Register Payment</h3>
                        <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Official revenue entry</p>
                     </div>
                     <button (click)="showAddPaymentModal = false" class="p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                        <svg class="w-5 h-5 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>

                  <div class="p-10 pt-6 space-y-5 overflow-y-auto max-h-[60vh] custom-scrollbar">
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount Received</label>
                        <input type="number" [(ngModel)]="paymentForm.amount" 
                               class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-emerald-600 font-black text-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                         <div class="relative group">
                            <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
                            <select [(ngModel)]="paymentForm.method" 
                                    class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none appearance-none">
                               <option value="Bank Transfer">Bank Transfer</option>
                               <option value="Cash">Cash</option>
                               <option value="Cheque">Cheque</option>
                            </select>
                         </div>
                         <div class="relative group">
                            <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reference #</label>
                            <input type="text" [(ngModel)]="paymentForm.referenceNumber" 
                                   class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                         </div>
                      </div>

                       <div class="relative group">
                          <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ 'common.date_received' | translate }}</label>
                          <input type="date" [(ngModel)]="paymentForm.date" 
                                 class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                       </div>

                      <div class="relative group">
                         <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Accepted By</label>
                         <input type="text" [(ngModel)]="paymentForm.actionBy" placeholder="Full name of staff"
                                class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                      </div>

                      <div class="relative group">
                         <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Proof</label>
                         <div class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 border-dashed flex flex-col items-center justify-center text-center group-hover:border-emerald-500/50 transition-colors cursor-pointer relative">
                           <input type="file" (change)="onFileSelected($event, 'payment')" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                           <div class="spacing-y-2" *ngIf="!paymentForm.photoUrl">
                              <svg class="w-8 h-8 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Upload Receipt / Cheque</p>
                           </div>
                           <div *ngIf="paymentForm.photoUrl" class="relative z-20 w-full">
                              <img [src]="paymentForm.photoUrl" class="h-32 mx-auto rounded-xl shadow-lg object-contain bg-white dark:bg-black/20">
                              <p class="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-2">Proof Attached</p>
                           </div>
                        </div>
                      </div>
                  </div>

                  <div class="p-10 pt-4 flex space-x-4 shrink-0 bg-slate-50/50 dark:bg-white/5">
                     <button (click)="showAddPaymentModal = false" class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-slate-800 text-slate-500 font-black text-[11px] uppercase tracking-widest border border-slate-200 dark:border-white/5">Cancel</button>
                     <button (click)="addPayment()" [disabled]="paymentForm.amount <= 0 || (paymentForm.method !== 'Cash' && !paymentForm.referenceNumber)" class="flex-[2] py-5 rounded-[1.5rem] bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">Confirm Payment</button>
                  </div>
               </div>
            </div>
          }

          <!-- Add Member Modal -->
          @if (showAddMemberModal) {
            <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
               <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
                  <div class="p-10 pb-6 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                     <div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Add Team Participant</h3>
                        <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-1">Select from company pool</p>
                     </div>
                     <button (click)="showAddMemberModal = false" class="p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                        <svg class="w-5 h-5 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>

                  <div class="p-10 pt-6 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                     @for (user of availableToJoin; track user.id) {
                        <button 
                           (click)="toggleMemberSelection(user.id)"
                           class="w-full p-5 rounded-[1.5rem] text-left transition-all border flex items-center space-x-4 group relative overflow-hidden"
                           [class.bg-white]="!selectedNewMembers.has(user.id)"
                           [class.dark:bg-white/5]="!selectedNewMembers.has(user.id)"
                           [class.border-slate-100]="!selectedNewMembers.has(user.id)"
                           [class.dark:border-white/5]="!selectedNewMembers.has(user.id)"
                           [class.bg-cyan-500/10]="selectedNewMembers.has(user.id)"
                           [class.border-cyan-500/50]="selectedNewMembers.has(user.id)"
                        >
                           <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all"
                                [class.bg-slate-100]="!selectedNewMembers.has(user.id)"
                                [class.dark:bg-white/5]="!selectedNewMembers.has(user.id)"
                                [class.text-slate-400]="!selectedNewMembers.has(user.id)"
                                [class.bg-cyan-500]="selectedNewMembers.has(user.id)"
                                [class.text-white]="selectedNewMembers.has(user.id)"
                                [class.scale-110]="selectedNewMembers.has(user.id)">
                              @if (selectedNewMembers.has(user.id)) {
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                              } @else {
                                {{ user.fullName.charAt(0) }}
                              }
                           </div>
                           <div class="flex-1">
                              <div class="flex items-center space-x-2">
                                <p class="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">{{ user.fullName }}</p>
                                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-white/5">{{ user.role }}</span>
                              </div>
                              <div class="flex items-center space-x-2 mt-1 opacity-60">
                                 <span class="text-[9px] font-bold text-slate-400">{{ user.email }}</span>
                              </div>
                           </div>
                        </button>
                     } @empty {
                        <div class="text-center py-16">
                           <div class="w-20 h-10 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                              <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                           </div>
                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed text-center">The entire company pool is currently assigned to this project identity.</p>
                        </div>
                     }
                  </div>

                  <div class="p-10 pt-4 flex space-x-4 shrink-0 bg-slate-50/50 dark:bg-white/5">
                     <button (click)="showAddMemberModal = false; selectedNewMembers.clear()" class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-slate-800 text-slate-500 font-black text-[11px] uppercase tracking-widest border border-slate-200 dark:border-white/5">Cancel</button>
                     <button (click)="addSelectedMembers()" [disabled]="selectedNewMembers.size === 0" class="flex-[2] py-5 rounded-[1.5rem] bg-cyan-500 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95">Add {{ selectedNewMembers.size }} Participants</button>
                  </div>
               </div>
            </div>
          }

          <!-- Phase Modal -->
          @if (showPhaseModal) {
            <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
               <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
                  <div class="p-10 pb-6 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-white/5">
                     <div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                           {{ selectedPhase ? 'Edit Phase' : 'Add Phase' }}
                        </h3>
                     </div>
                     <button (click)="showPhaseModal = false" class="p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                        <svg class="w-5 h-5 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>

                  <div class="p-10 pt-6 space-y-6">
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Phase Name</label>
                        <input type="text" [(ngModel)]="phaseForm.name" 
                               class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-cyan-500">
                     </div>
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea [(ngModel)]="phaseForm.description" rows="3"
                                  class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-cyan-500"></textarea>
                     </div>
                  </div>

                  <div class="p-10 pt-4 flex space-x-4 shrink-0 bg-slate-50/30 dark:bg-slate-950/20">
                     <button (click)="showPhaseModal = false" class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-slate-800 text-slate-500 font-black text-[11px] uppercase tracking-widest border border-slate-200 dark:border-white/5">Cancel</button>
                     <button (click)="savePhase()" [disabled]="!phaseForm.name || isSaving" class="flex-[2] py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3">
                        @if (isSaving) {
                           <svg class="animate-spin h-4 w-4 text-white dark:text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           <span>Saving...</span>
                        } @else {
                           <span>Save Phase</span>
                        }
                     </button>
                  </div>
               </div>
            </div>
          }

          @if (showLogModal && selectedLog) {
             <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xl animate-in fade-in duration-500">
                <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
                   <!-- Modal Header -->
                   <div class="p-10 pb-8 flex items-center justify-between bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                      <div>
                         <div class="flex items-center space-x-3 mb-1">
                            <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Official Record</span>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ selectedLog.date | date:'fullDate' }}</span>
                         </div>
                         <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Execution Log</h3>
                      </div>
                      <button (click)="showLogModal = false" class="p-5 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                         <svg class="w-6 h-6 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                   </div>

                   <!-- Log Summary & Value -->
                   <div class="px-10 py-6 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                      <div class="flex items-center space-x-8">
                         <div>
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Items</p>
                            <p class="text-xl font-black text-slate-900 dark:text-white">{{ selectedLog.items.length }}</p>
                         </div>
                         <div class="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                         <div>
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p class="text-xs font-black text-emerald-500 uppercase">Sealed & Verified</p>
                         </div>
                      </div>
                      <div class="text-right">
                         <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Daily Value</p>
                         <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ getLogTotalExecution(selectedLog) | currency:'USD' }}</p>
                      </div>
                   </div>

                   <!-- Items List -->
                   <div class="p-10 flex-1 overflow-y-auto max-h-[400px]">
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Activity Breakdown</h4>
                      <div class="space-y-4">
                         @for (item of selectedLog.items; track item.id) {
                            <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 group hover:border-cyan-500/30 transition-all">
                               <div class="flex items-start justify-between">
                                  <div class="flex-1">
                                     <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{{ getProjectItemName(item.projectItemId) }}</p>
                                     <p class="text-xs text-slate-500 font-medium leading-relaxed italic">"{{ item.notes || 'No comments provided' }}"</p>
                                  </div>
                                  <div class="text-right ml-6">
                                     <p class="text-xs font-black text-emerald-600 dark:text-cyan-400">{{ item.quantity }} <span class="text-[8px] opacity-60">Units</span></p>
                                     <div class="mt-2 h-1 w-16 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div class="h-full bg-emerald-500" style="width: 100%"></div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         }
                      </div>
                   </div>

                   <!-- Actions -->
                   <div class="p-10 bg-slate-50 dark:bg-white/5 flex gap-4">
                      <button (click)="showLogModal = false" class="flex-1 py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95">Close Master Record</button>
                      <button class="p-5 rounded-[1.5rem] bg-indigo-500 text-white font-black hover:scale-110 transition-all shadow-xl shadow-indigo-500/20">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                      </button>
                   </div>
               </div>
            </div>
           }
        </div>
      }

     </div>
   `
})
export class ProjectDetailComponent implements OnInit {
   project: any | undefined;
   activeTab: 'timeline' | 'team' | 'history' | 'items' | 'finances' | 'bills' | 'payments' | 'phases' | 'designs' | 'settings' = 'designs';
   teamMembers: any[] = [];
   companyUsers: User[] = [];
   dailyLogs: any[] = [];
   projectItems: ProjectItem[] = [];
   activities: any[] = [];

   get totalCollected(): number {
      return (this.clientPayments as any[]).reduce((sum, p) => sum + p.amount, 0);
   }

   transactions: any[] = [];
   bills: any[] = [];
   clientPayments: any[] = [];

   get totalProjectValue(): number {
      return this.projectItems.reduce((sum, item) => sum + ((item.agreedQuantity || 0) * (item.unitPrice || 0)), 0);
   }

   // Daily Log View Logic (at the end of template context conceptually, but physically before properties)


   setActiveTab(key: any) {
      this.activeTab = key;
   }

   // Edit State
   showEditModal = false;
   companySettings: any | undefined;
   projectSettings: any | undefined;
   // Role Change Modal State
   showRoleModal = false;
   showAddMemberModal = false;
   availableRoles: Role[] = [];
   userToEdit: any | null = null;
   roleOverrides: any = {};
   selectedNewMembers: Set<number> = new Set();

   // Add Bill/Payment Modal State
   showAddBillModal = false;
   showAddPaymentModal = false;
   showAddItemModal = false;
   isSavingItem = false;
   selectedProjectItem: ProjectItem | null = null;
   itemForm: any = {
      description: '',
      unit: '',
      totalQuantity: 0,
      rate: 0,
      startDate: null as string | null,
      endDate: null as string | null
   };

   billForm: any = {
      billNumber: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
      photoUrl: ''
   };

   paymentForm: any = {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'Bank Transfer' as 'Bank Transfer' | 'Cash' | 'Cheque',
      referenceNumber: '',
      notes: '',
      photoUrl: '',
      actionBy: ''
   };
   editForm: any = {
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
      autoCloseDay: null as boolean | null,
      autoCloseDayTime: null as string | null,
      allowAddProgressEntry: null as boolean | null,
      allowReopenClosedDay: null as boolean | null,
      delayNotificationSendEmail: null as boolean | null
   };

   // Daily Log View State
   showLogModal = false;
   selectedLog: any | null = null;

   constructor(
      private route: ActivatedRoute,
      private projectService: ProjectService,
      private projectTeamService: ProjectTeamService,
      private dailyLogsService: DailyLogsService,
      private projectItemService: ProjectItemService,
      private transactionsService: TransactionsService,
      private invoicesService: InvoicesService,
      private rolesService: RolesService,
      private authService: AuthService,
      private settingsService: SettingsService,
      private phaseService: PhaseService,
      private designService: DesignService,
      private vendorService: VendorService,
      private dashboardService: DashboardService
   ) { }

   ngOnInit() {
      const projectId = Number(this.route.snapshot.paramMap.get('id'));
      if (projectId) {
         this.projectService.getProjectById(projectId).subscribe(project => {
            this.project = project;
         });

         this.projectTeamService.getTeam(projectId).subscribe(users => {
            this.teamMembers = users;
         });

         this.dailyLogsService.getDailyLogHistory(projectId).subscribe(logs => {
            this.dailyLogs = logs;
         });

         this.projectItemService.getItemsByProject(projectId).subscribe((items: ProjectItem[]) => {
            this.projectItems = items;
            this.loadProjectPhases(projectId); // Reload to pick up item date and money aggregation
         });

         this.transactionsService.getTransactions(projectId).subscribe(trans => {
            this.transactions = trans;
         });

         this.settingsService.getCompanySettings().subscribe(settings => {
            this.companySettings = settings;
         });

         this.settingsService.getProjectSettings(projectId).subscribe(settings => {
            this.projectSettings = settings;
         });

         this.rolesService.getRoles().subscribe(roles => {
            this.availableRoles = roles;
         });

         // Fetch Vendor Bills
         this.vendorService.getInvoicesByProject(projectId).subscribe((bills: any[]) => {
            this.bills = bills.map(b => ({
               id: b.id,
               projectId: b.projectId,
               billNumber: b.invoiceNumber,
               amount: b.amount,
               date: b.invoiceDate,
               status: b.approvalStatus,
               actionBy: b.approvedByUserName,
               notes: b.notes,
               photoUrl: b.photoUrl
            }));
         });

         // Fetch Client Payments
         this.invoicesService.getInvoices({ projectId }).subscribe((result) => {
            this.clientPayments = result.items.map(p => ({
               id: p.id,
               projectId: p.projectId,
               amount: p.netAmount,
               date: p.invoiceDate,
               method: 'Bank Transfer', // Default for now
               status: p.status,
               actionBy: p.createdByFullName
            }));
         });

         this.dashboardService.getProjectActivities(projectId).subscribe((acts: any[]) => {
            this.activities = acts.map(a => ({
               id: a.id,
               projectId,
               userId: 0,
               userName: 'System',
               type: this.mapActivityType(a.type),
               action: a.message.split(': ')[0],
               details: a.message.split(': ')[1] || a.message,
               timestamp: a.timestamp
            }));
         });

         this.checkDesignsInitialization(projectId);
      }
   }

   private mapActivityType(backendType: string): string {
      switch (backendType) {
         case 'success': return 'Log';
         case 'warning': return 'Setting';
         case 'danger': return 'Media'; // Or something else
         default: return 'Finance';
      }
   }

   get isEditFormValid(): boolean {
      const f = this.editForm;
      if (!f.name || !f.address || !f.startDate || !f.endDate) return false;
      if (this.companySettings?.allowLocations && (f.lat === null || f.lng === null)) return false;
      if (f.calculationMethod === 'Measured' && (!f.totalContractValue || f.totalContractValue <= 0)) return false;
      if (f.extraFees > 0 && !f.extraFeesDescription) return false;
      return true;
   }

   get editValidationErrors(): string[] {
      const f = this.editForm;
      const errors: string[] = [];
      if (!f.name) errors.push('Name');
      if (!f.address) errors.push('Address');
      if (!f.startDate) errors.push('Start Date');
      if (!f.endDate) errors.push('End Date');
      if (this.companySettings?.allowLocations && (f.lat === null || f.lng === null)) errors.push('GPS Coordinates');
      if (f.calculationMethod === 'Measured' && (!f.totalContractValue || f.totalContractValue <= 0)) errors.push('Total Value');
      if (f.extraFees > 0 && !f.extraFeesDescription) errors.push('Fee Reason');
      return errors;
   }

   openEditModal() {
      if (!this.project) return;
      this.editForm = {
         name: this.project.name,
         address: this.project.location?.address || '',
         startDate: this.project.startDate,
         endDate: this.project.endDate || '',
         calculationMethod: (this.project as any).calculationMethod || 'Measured',
         totalContractValue: (this.project as any).totalContractValue || 0,
         supervisionPercentage: (this.project as any).supervisionPercentage || 0,
         useCompanyPercentage: (this.project as any).useCompanyPercentage ?? true,
         packageId: this.project.packageId || null,
         extraFees: (this.project as any).extraFees || 0,
         extraFeesDescription: (this.project as any).extraFeesDescription || '',
         deductedAmount: (this.project as any).deductedAmount || 0,
         deductedAmountDescription: (this.project as any).deductedAmountDescription || '',
         lat: this.project.location?.lat ?? null,
         lng: this.project.location?.lng ?? null,
         autoCloseDay: this.projectSettings?.autoCloseDay ?? null,
         autoCloseDayTime: this.projectSettings?.autoCloseDayTime ?? null,
         allowAddProgressEntry: this.projectSettings?.allowAddProgressEntry ?? null,
         allowReopenClosedDay: this.projectSettings?.allowReopenClosedDay ?? null,
         delayNotificationSendEmail: this.projectSettings?.delayNotificationSendEmail ?? null
      };
      this.showEditModal = true;
   }

   updateProject() {
      if (!this.project || !this.isEditFormValid) return;

      const request: UpdateProjectRequest = {
         projectName: this.editForm.name,
         description: this.editForm.address,
         startDate: this.editForm.startDate,
         endDate: this.editForm.endDate || undefined, // Send undefined if empty string
         totalContractValue: this.editForm.totalContractValue,
         generalManagerUserId: this.project.generalManagerUserId
      };

      this.projectService.updateProject(this.project.id, request).subscribe({
         next: () => {
            // In a real app, this would call a service - NOW IT DOES!
            this.project.name = this.editForm.name;
            this.project.location = {
               ...this.project.location,
               address: this.editForm.address,
               lat: Number(this.editForm.lat) || 0,
               lng: Number(this.editForm.lng) || 0
            };
            this.project.startDate = this.editForm.startDate;
            this.project.endDate = this.editForm.endDate;

            // Update extended properties
            Object.assign(this.project, {
               calculationMethod: this.editForm.calculationMethod,
               totalContractValue: this.editForm.totalContractValue,
               extraFees: this.editForm.extraFees,
               extraFeesDescription: this.editForm.extraFeesDescription,
               deductedAmount: this.editForm.deductedAmount,
               deductedAmountDescription: this.editForm.deductedAmountDescription
            });

            // Update settings if changed
            if (this.projectSettings) {
               this.projectSettings.autoCloseDay = this.editForm.autoCloseDay;
               this.projectSettings.autoCloseDayTime = this.editForm.autoCloseDayTime;
               this.projectSettings.allowAddProgressEntry = this.editForm.allowAddProgressEntry;
               this.projectSettings.allowReopenClosedDay = this.editForm.allowReopenClosedDay;
               this.projectSettings.delayNotificationSendEmail = this.editForm.delayNotificationSendEmail;
               this.saveProjectSettings();
            }

            console.log('Project updated:', this.project);
            this.showEditModal = false;
         },
         error: (err) => console.error('Failed to update project', err)
      });
   }

   deleteProject() {
      if (!this.project) return;
      // Removed browser confirm per user request
      console.log('Project deleted (local):', this.project.id);
      window.history.back();
   }


   openRoleModal(user: any) {
      this.userToEdit = user;
      this.showRoleModal = true;
   }

   updateUserRole(roleName: string) {
      if (!this.userToEdit) return;
      this.roleOverrides[this.userToEdit.id] = roleName;
      this.showRoleModal = false;
   }

   get availableToJoin(): User[] {
      return this.companyUsers.filter(u => !this.teamMembers.some(tm => tm.id === u.id));
   }

   toggleMemberSelection(userId: number) {
      if (this.selectedNewMembers.has(userId)) {
         this.selectedNewMembers.delete(userId);
      } else {
         this.selectedNewMembers.add(userId);
      }
   }

   addSelectedMembers() {
      const toAdd = this.companyUsers.filter(u => this.selectedNewMembers.has(u.id));
      this.teamMembers.push(...toAdd);
      this.selectedNewMembers.clear();
      this.showAddMemberModal = false;
   }

   addBill() {
      if (!this.project) return;
      const newBill: any = {
         id: Math.floor(Math.random() * 10000),
         projectId: this.project.id,
         billNumber: this.billForm.billNumber,
         amount: this.billForm.amount,
         date: new Date(this.billForm.date).toISOString(),
         status: 'Pending',
         notes: this.billForm.notes,
         photoUrl: this.billForm.photoUrl
      };
      this.bills.unshift(newBill);
      this.showAddBillModal = false;
      this.resetBillForm();
   }

   resetBillForm() {
      this.billForm = {
         billNumber: '',
         amount: 0,
         date: new Date().toISOString().split('T')[0],
         notes: '',
         photoUrl: ''
      };
   }

   addPayment() {
      if (!this.project) return;
      const newPayment: any = {
         id: Math.floor(Math.random() * 10000),
         projectId: this.project.id,
         amount: this.paymentForm.amount,
         date: new Date(this.paymentForm.date).toISOString(),
         method: this.paymentForm.method,
         referenceNumber: this.paymentForm.referenceNumber,
         status: 'Received',
         notes: this.paymentForm.notes,
         photoUrl: this.paymentForm.photoUrl,
         actionBy: this.paymentForm.actionBy || 'Admin'
      };
      this.clientPayments.unshift(newPayment);
      this.showAddPaymentModal = false;
      this.resetPaymentForm();
   }

   resetPaymentForm() {
      this.paymentForm = {
         amount: 0,
         date: new Date().toISOString().split('T')[0],
         method: 'Bank Transfer',
         referenceNumber: '',
         notes: '',
         photoUrl: '',
         actionBy: ''
      };
   }

   addProjectItem() {
      if (!this.project) return;
      const projectId = this.project.id;
      this.isSavingItem = true;

      const operation = this.selectedProjectItem
         ? this.projectItemService.updateItem(projectId, this.selectedProjectItem.id, this.itemForm)
         : this.projectItemService.createItem(projectId, { ...this.itemForm, phaseId: this.selectedPhase?.id });

      operation.subscribe({
         next: () => {
            this.projectItemService.getItemsByProject(projectId).subscribe((items: ProjectItem[]) => {
               this.projectItems = items;
               this.loadProjectPhases(projectId);
               this.showAddItemModal = false;
               this.isSavingItem = false;
               this.resetItemForm();
            });
         },
         error: () => this.isSavingItem = false
      });
   }

   resetItemForm() {
      this.itemForm = {
         description: '',
         unit: '',
         totalQuantity: 0,
         rate: 0,
         startDate: null,
         endDate: null
      } as any;
   }

   deleteProjectItem(id: number) {
      if (confirm('Are you sure you want to delete this project item?')) {
         this.projectItems = this.projectItems.filter(item => item.id !== id);
      }
   }

   approveBill(id: number) {
      const bill = this.bills.find(b => b.id === id);
      if (bill) {
         bill.status = 'Approved';
         bill.actionBy = 'Admin';
         bill.actionAt = new Date().toISOString();
      }
   }

   rejectBill(id: number) {
      const bill = this.bills.find(b => b.id === id);
      if (bill) {
         bill.status = 'Rejected';
         bill.actionBy = 'Admin';
         bill.actionAt = new Date().toISOString();
      }
   }

   deleteBill(id: number) {
      if (confirm('Are you sure you want to delete this bill?')) {
         this.bills = this.bills.filter(bill => bill.id !== id);
      }
   }

   deletePayment(id: number) {
      if (confirm('Are you sure you want to delete this payment?')) {
         this.clientPayments = this.clientPayments.filter(p => p.id !== id);
      }
   }

   onFileSelected(event: any, type: 'bill' | 'payment') {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (e: any) => {
            if (type === 'bill') {
               this.billForm.photoUrl = e.target.result;
            } else {
               this.paymentForm.photoUrl = e.target.result;
            }
         };
         reader.readAsDataURL(file);
      }
   }



   calculateDuration(): number {
      if (!this.project) return 0;
      const start = new Date(this.project.startDate);
      const end = this.project.endDate ? new Date(this.project.endDate) : new Date();
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
   }

   toggleAutoClose() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.autoCloseDay ?? this.companySettings.autoCloseDay;
      this.projectSettings.autoCloseDay = !current;
      this.saveProjectSettings();
   }

   resetAutoClose() {
      if (!this.projectSettings) return;
      this.projectSettings.autoCloseDay = null;
      this.saveProjectSettings();
   }

   toggleEmailNotify() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.delayNotificationSendEmail ?? this.companySettings.delayNotificationSendEmail;
      this.projectSettings.delayNotificationSendEmail = !current;
      this.saveProjectSettings();
   }

   resetEmailNotify() {
      if (!this.projectSettings) return;
      this.projectSettings.delayNotificationSendEmail = null;
      this.saveProjectSettings();
   }

   saveProjectSettings() {
      if (!this.projectSettings || !this.project) return;
      this.settingsService.updateProjectSettings(this.project.id, this.projectSettings as any).subscribe();
   }

   toggleProgressEntry() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.allowAddProgressEntry ?? this.companySettings.allowAddProgressEntry;
      this.projectSettings.allowAddProgressEntry = !current;
      this.saveProjectSettings();
   }

   resetProgressEntry() {
      if (!this.projectSettings) return;
      this.projectSettings.allowAddProgressEntry = null;
      this.saveProjectSettings();
   }

   toggleReopenDay() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.allowReopenClosedDay ?? this.companySettings.allowReopenClosedDay;
      this.projectSettings.allowReopenClosedDay = !current;
      this.saveProjectSettings();
   }

   resetReopenDay() {
      if (!this.projectSettings) return;
      this.projectSettings.allowReopenClosedDay = null;
      this.saveProjectSettings();
   }

   updateAutoCloseTime(time: string) {
      if (!this.projectSettings) return;
      this.projectSettings.autoCloseDayTime = time;
      this.saveProjectSettings();
   }

   resetAutoCloseTime() {
      if (!this.projectSettings) return;
      this.projectSettings.autoCloseDayTime = null;
      this.saveProjectSettings();
   }

   toggleClientFinancials() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.clientCanSeeFinancials ?? this.companySettings.clientCanSeeFinancials;
      this.projectSettings.clientCanSeeFinancials = !current;
      this.saveProjectSettings();
   }

   resetClientFinancials() {
      if (!this.projectSettings) return;
      this.projectSettings.clientCanSeeFinancials = null;
      this.saveProjectSettings();
   }

   toggleClientMedia() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.clientCanSeeMedia ?? this.companySettings.clientCanSeeMedia;
      this.projectSettings.clientCanSeeMedia = !current;
      this.saveProjectSettings();
   }

   resetClientMedia() {
      if (!this.projectSettings) return;
      this.projectSettings.clientCanSeeMedia = null;
      this.saveProjectSettings();
   }

   toggleClientProjectItems() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.clientCanSeeProjectItems ?? this.companySettings.clientCanSeeProjectItems;
      this.projectSettings.clientCanSeeProjectItems = !current;
      this.saveProjectSettings();
   }

   resetClientProjectItems() {
      if (!this.projectSettings) return;
      this.projectSettings.clientCanSeeProjectItems = null;
      this.saveProjectSettings();
   }

   togglePhotoReview() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.requirePhotoReview ?? this.companySettings.requirePhotoReview;
      this.projectSettings.requirePhotoReview = !current;
      this.saveProjectSettings();
   }

   resetPhotoReview() {
      if (!this.projectSettings) return;
      this.projectSettings.requirePhotoReview = null;
      this.saveProjectSettings();
   }

   toggleInvoiceReview() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.enableInvoiceReview ?? this.companySettings.enableInvoiceReview;
      this.projectSettings.enableInvoiceReview = !current;
      this.saveProjectSettings();
   }

   resetInvoiceReview() {
      if (!this.projectSettings) return;
      this.projectSettings.enableInvoiceReview = null;
      this.saveProjectSettings();
   }

   // --- Designs Logic ---
   isDesignsInitialized = false;

   checkDesignsInitialization(projectId: number) {
      this.designService.getCategoryTree(projectId).subscribe(categories => {
         if (categories.length > 0) {
            this.isDesignsInitialized = true;
         }
      });
   }

   startEmptyDesigns() {
      this.isDesignsInitialized = true;
   }

   useGlobalDesignTemplate() {
      if (!this.project) return;
      this.designService.getCompanyTemplates(this.project.companyId).subscribe(templates => {
         if (templates.length === 0) {
            alert('No global templates found. Create some in company settings first.');
            return;
         }

         const message = 'Import global design categories? This will enable project-specific designs.';
         if (confirm(message)) {
            // Pick the first template or show a picker. For simplicity, we'll use the service's importTemplate if it supports a default.
            // But wait, our DesignService has importTemplate(projectId, templateId).
            // We'll use the first one if available.
            this.designService.importTemplate(this.project.id, templates[0].id).subscribe(() => {
               this.isDesignsInitialized = true;
               // Reload page or force refresh designs tab if needed
               window.location.reload();
            });
         }
      });
   }

   resetDesigns() {
      if (!this.project) return;
      if (confirm('Are you sure you want to clear all design categories? Folders and their contents will be permanently removed.')) {
         this.designService.clearCategories(this.project.id).subscribe(() => {
            this.isDesignsInitialized = false;
            window.location.reload();
         });
      }
   }

   // --- Phases Logic ---
   projectPhases: Phase[] = [];
   loadingPhases: { [key: number]: string } = {};
   isPhasesInitialized = false;
   isSaving = false;
   isSavingProjectItem = false;
   showPhaseModal = false;
   selectedPhase?: Phase;
   parentPhase?: Phase;
   phaseForm: any = { name: '', description: '', order: 0 };

   loadProjectPhases(projectId: number) {
      this.phaseService.getProjectPhases(projectId).subscribe(phases => {
         this.projectPhases = phases;
         // If there are already phases in the DB, consider it initialized
         if (phases.length > 0) this.isPhasesInitialized = true;
      });
   }

   startEmptyHierarchy() {
      this.isPhasesInitialized = true;
   }

   useGlobalTemplate() {
      if (!this.project) return;
      const message = this.projectPhases.length > 0
         ? 'This will delete your current project hierarchy and reset it to company defaults. Continue?'
         : 'Import company default phase hierarchy?';

      if (confirm(message)) {
         const init = () => {
            this.phaseService.initializeProjectPhasesFromDefaults(this.project!.id, this.project!.companyId).subscribe(() => {
               this.loadProjectPhases(this.project!.id);
               this.isPhasesInitialized = true;
            });
         };

         if (this.projectPhases.length > 0) {
            this.phaseService.clearProjectPhases(this.project.id).subscribe(() => {
               this.projectPhases = [];
               init();
            });
         } else {
            init();
         }
      }
   }

   resetHierarchy() {
      if (!this.project) return;
      if (confirm('Are you sure you want to clear all phases and start over? This will remove all existing phases and their items.')) {
         this.phaseService.clearProjectPhases(this.project.id).subscribe(() => {
            this.projectPhases = [];
            this.isPhasesInitialized = false;
            this.loadProjectPhases(this.project!.id); // Should return empty
         });
      }
   }

   openPhaseModal(phase?: Phase, parent?: Phase) {
      this.selectedPhase = phase;
      this.parentPhase = parent;
      if (phase) {
         this.phaseForm = { name: phase.name, description: phase.description, order: phase.order };
      } else {
         this.phaseForm = { name: '', description: '', order: parent ? (parent.children?.length || 0) : this.projectPhases.length };
      }
      this.showPhaseModal = true;
   }

   openItemModal(phase: Phase, item?: ProjectItem) {
      this.selectedPhase = phase;
      this.selectedProjectItem = item || null;
      if (item) {
         this.itemForm = {
            description: item.itemName,
            unit: item.unit,
            totalQuantity: item.agreedQuantity,
            rate: item.unitPrice,
            startDate: item.startDate || null,
            endDate: item.endDate || null
         } as any;
      } else {
         this.resetItemForm();
      }
      this.showAddItemModal = true;
   }

   savePhase() {
      if (!this.project) return;
      this.isSaving = true;
      if (this.selectedPhase) {
         this.phaseService.updatePhase(this.selectedPhase.id, this.phaseForm).subscribe({
            next: () => {
               if (this.project) this.loadProjectPhases(this.project.id);
               this.showPhaseModal = false;
               this.isSaving = false;
            },
            error: () => this.isSaving = false
         });
      } else {
         const request = {
            ...this.phaseForm,
            parentPhaseId: this.parentPhase?.id
         };
         this.phaseService.createProjectPhase(this.project.id, request).subscribe({
            next: () => {
               if (this.project) this.loadProjectPhases(this.project.id);
               this.showPhaseModal = false;
               this.isSaving = false;
            },
            error: () => this.isSaving = false
         });
      }
   }

   deletePhase(id: number) {
      if (confirm('Delete this phase? All descendants and associated items will be removed.')) {
         this.loadingPhases[id] = 'deleting';
         this.phaseService.deletePhase(id).subscribe({
            next: () => {
               if (this.project) this.loadProjectPhases(this.project.id);
               delete this.loadingPhases[id];
            },
            error: () => delete this.loadingPhases[id]
         });
      }
   }

   onDeleteItem(event: { phase: Phase, itemId: number }) {
      this.deleteProjectItem(event.itemId);
   }

   movePhase(id: number, direction: number) {
      if (!this.project) return;
      this.loadingPhases[id] = direction > 0 ? 'moving-down' : 'moving-up';
      this.phaseService.reorderPhase(id, direction).subscribe({
         next: () => {
            this.loadProjectPhases(this.project!.id);
            delete this.loadingPhases[id];
         },
         error: () => delete this.loadingPhases[id]
      });
   }

   openLogDetails(log: any) {
      this.selectedLog = log;
      this.showLogModal = true;
   }

   getProjectItemName(id: number): string {
      return this.projectItems.find(i => i.id === id)?.itemName || 'Unknown Item';
   }

   getLogTotalExecution(log: DailyLog): number {
      return log.items.reduce((sum, item) => {
         const projectItem = this.projectItems.find(b => b.id === item.projectItemId);
         return sum + (item.quantity * (projectItem?.unitPrice || 0));
      }, 0);
   }
}
