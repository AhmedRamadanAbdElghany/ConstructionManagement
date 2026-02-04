import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockDataService } from '../../../../core/mock/mock-data.service';
import { Project, User, DailyLog, BOQItem, CompanySettings, ProjectSettings, Role, Transaction, ProjectBill, ClientPayment, ProjectActivity } from '../../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { PhaseService, Phase } from '../../../../core/services/phase.service';
import { PhaseNodeComponent } from '../../project-hierarchy/phase-node.component';
import { BoqProgressNodeComponent } from '../../project-hierarchy/boq-progress-node.component';
import { map } from 'rxjs/operators';

@Component({
   selector: 'app-project-detail',
   standalone: true,
   imports: [CommonModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule, PhaseNodeComponent, BoqProgressNodeComponent], // Added FormsModule and ReactiveFormsModule
   template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      @if (project) {
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="flex items-start justify-between mb-10">
            <div>
              <div class="flex items-center space-x-4 mb-3">
                <a routerLink="/admin/projects" class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </a>
                <div class="flex items-center space-x-2">
                   <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{{ project.name }}</h1>
                   <div class="flex space-x-2">
                      <button (click)="openEditModal()" class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-cyan-500 transition-all shadow-sm group">
                         <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                         </svg>
                      </button>
                      <button (click)="deleteProject()" class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-rose-500 transition-all shadow-sm group">
                         <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                   </div>
                </div>
                <span class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all mt-3 inline-block"
                      [ngClass]="{
                        'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/10': project.status === 'Active',
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10': project.status === 'Completed',
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10': project.status === 'Delayed'
                      }">
                  {{ 'projects.' + project.status.toLowerCase() | translate }}
                </span>
              </div>
              <p class="text-slate-500 dark:text-slate-400 font-medium flex items-center ml-14">
                <svg class="w-4 h-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                {{ project.location?.address }}
              </p>
            </div>
            <div class="flex items-center space-x-6 bg-white dark:bg-slate-900 rounded-2xl p-2 pr-6 border border-slate-200 dark:border-white/5 shadow-sm">
               <div class="relative w-12 h-12 flex items-center justify-center">
                  <svg class="w-full h-full transform -rotate-90">
                     <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" class="text-slate-100 dark:text-slate-800" />
                     <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" stroke-dasharray="125.6" stroke-dashoffset="12.56" class="text-emerald-500" />
                  </svg>
                  <span class="absolute text-[10px] font-black text-slate-900 dark:text-white">98%</span>
               </div>
               <div>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'project_detail.health_score' | translate }}</p>
                   <p class="text-sm font-black text-emerald-500 uppercase tracking-tight">{{ 'project_detail.excellent' | translate }}</p>
               </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
               <p class="text-sm text-slate-400 mb-1">{{ 'dashboard.progress' | translate }}</p>
              <div class="flex items-center justify-between">
                <p class="text-3xl font-bold text-white">{{ project.progress }}%</p>
                <div class="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
               <p class="text-sm text-slate-400 mb-1">{{ 'projects.earned' | translate }}</p>
              <p class="text-3xl font-bold text-emerald-400">{{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
               <p class="text-sm text-slate-400 mb-1">{{ 'projects.collected' | translate }}</p>
              <p class="text-3xl font-bold text-cyan-400">{{ totalCollected | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
               <p class="text-sm text-slate-400 mb-1">{{ 'project_detail.team_size' | translate }}</p>
              <p class="text-3xl font-bold text-white">{{ teamMembers.length }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mb-8">
            <button 
              (click)="activeTab = 'timeline'"
              [class.bg-slate-900]="activeTab === 'timeline'"
              [class.dark:bg-white]="activeTab === 'timeline'"
              [class.text-white]="activeTab === 'timeline'"
              [class.dark:text-slate-900]="activeTab === 'timeline'"
              [class.bg-white]="activeTab !== 'timeline'"
              [class.dark:bg-slate-900]="activeTab !== 'timeline'"
              [class.text-slate-500]="activeTab !== 'timeline'"
              [class.border-transparent]="activeTab === 'timeline'"
              [class.border-slate-200]="activeTab !== 'timeline'"
              [class.dark:border-white/5]="activeTab !== 'timeline'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
              {{ 'project_detail.timeline_settings' | translate }}
            </button>
            <button 
              (click)="activeTab = 'team'"
              [class.bg-slate-900]="activeTab === 'team'"
              [class.dark:bg-white]="activeTab === 'team'"
              [class.text-white]="activeTab === 'team'"
              [class.dark:text-slate-900]="activeTab === 'team'"
              [class.bg-white]="activeTab !== 'team'"
              [class.dark:bg-slate-900]="activeTab !== 'team'"
              [class.text-slate-500]="activeTab !== 'team'"
              [class.border-transparent]="activeTab === 'team'"
              [class.border-slate-200]="activeTab !== 'team'"
              [class.dark:border-white/5]="activeTab !== 'team'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
              {{ 'project_detail.team_management' | translate }}
            </button>
            <button 
              (click)="activeTab = 'history'"
              [class.bg-slate-900]="activeTab === 'history'"
              [class.dark:bg-white]="activeTab === 'history'"
              [class.text-white]="activeTab === 'history'"
              [class.dark:text-slate-900]="activeTab === 'history'"
              [class.bg-white]="activeTab !== 'history'"
              [class.dark:bg-slate-900]="activeTab !== 'history'"
              [class.text-slate-500]="activeTab !== 'history'"
              [class.border-transparent]="activeTab === 'history'"
              [class.border-slate-200]="activeTab !== 'history'"
              [class.dark:border-white/5]="activeTab !== 'history'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
               {{ 'project_detail.activity_logs' | translate }}
            </button>
            <button 
              (click)="activeTab = 'boq'"
              [class.bg-slate-900]="activeTab === 'boq'"
              [class.dark:bg-white]="activeTab === 'boq'"
              [class.text-white]="activeTab === 'boq'"
              [class.dark:text-slate-900]="activeTab === 'boq'"
              [class.bg-white]="activeTab !== 'boq'"
              [class.dark:bg-slate-900]="activeTab !== 'boq'"
              [class.text-slate-500]="activeTab !== 'boq'"
              [class.border-transparent]="activeTab === 'boq'"
              [class.border-slate-200]="activeTab !== 'boq'"
              [class.dark:border-white/5]="activeTab !== 'boq'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
               {{ 'project_detail.boq_progress' | translate }}
            </button>
            <button 
              (click)="activeTab = 'finances'"
              [class.bg-slate-900]="activeTab === 'finances'"
              [class.dark:bg-white]="activeTab === 'finances'"
              [class.text-white]="activeTab === 'finances'"
              [class.dark:text-slate-900]="activeTab === 'finances'"
              [class.bg-white]="activeTab !== 'finances'"
              [class.dark:bg-slate-900]="activeTab !== 'finances'"
              [class.text-slate-500]="activeTab !== 'finances'"
              [class.border-transparent]="activeTab === 'finances'"
              [class.border-slate-200]="activeTab !== 'finances'"
              [class.dark:border-white/5]="activeTab !== 'finances'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
               {{ 'project_detail.financial_overview' | translate }}
            </button>
            <button 
              (click)="activeTab = 'bills'"
              [class.bg-slate-900]="activeTab === 'bills'"
              [class.dark:bg-white]="activeTab === 'bills'"
              [class.text-white]="activeTab === 'bills'"
              [class.dark:text-slate-900]="activeTab === 'bills'"
              [class.bg-white]="activeTab !== 'bills'"
              [class.dark:bg-slate-900]="activeTab !== 'bills'"
              [class.text-slate-500]="activeTab !== 'bills'"
              [class.border-transparent]="activeTab === 'bills'"
              [class.border-slate-200]="activeTab !== 'bills'"
              [class.dark:border-white/5]="activeTab !== 'bills'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
               {{ 'sidebar.bills' | translate }}
            </button>
            <button 
              (click)="activeTab = 'phases'"
              [class.bg-slate-900]="activeTab === 'phases'"
              [class.dark:bg-white]="activeTab === 'phases'"
              [class.text-white]="activeTab === 'phases'"
              [class.dark:text-slate-900]="activeTab === 'phases'"
              [class.bg-white]="activeTab !== 'phases'"
              [class.dark:bg-slate-900]="activeTab !== 'phases'"
              [class.text-slate-500]="activeTab !== 'phases'"
              [class.border-transparent]="activeTab === 'phases'"
              [class.border-slate-200]="activeTab !== 'phases'"
              [class.dark:border-white/5]="activeTab !== 'phases'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
               {{ 'project_detail.phases_hierarchy' | translate }}
            </button>
            <button 
              (click)="activeTab = 'payments'"
              [class.bg-slate-900]="activeTab === 'payments'"
              [class.dark:bg-white]="activeTab === 'payments'"
              [class.text-white]="activeTab === 'payments'"
              [class.dark:text-slate-900]="activeTab === 'payments'"
              [class.bg-white]="activeTab !== 'payments'"
              [class.dark:bg-slate-900]="activeTab !== 'payments'"
              [class.text-slate-500]="activeTab !== 'payments'"
              [class.border-transparent]="activeTab === 'payments'"
              [class.border-slate-200]="activeTab !== 'payments'"
              [class.dark:border-white/5]="activeTab !== 'payments'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
               {{ 'project_detail.client_payments' | translate }}
            </button>
          </div>

          <!-- Timeline Tab -->
          @if (activeTab === 'timeline') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl transition-all">
                <div class="flex items-center justify-between mb-8">
                  <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.timeline_settings' | translate }}</h3>
                </div>
                <div class="space-y-6">
                  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{{ 'project_detail.start_date' | translate }}</p>
                    <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ project.startDate | date:'fullDate' }}</p>
                  </div>
                  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{{ 'project_detail.end_date' | translate }}</p>
                    <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ project.endDate ? (project.endDate | date:'fullDate') : 'Not Set' }}</p>
                  </div>
                  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                     <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{{ 'personal_hr.duration' | translate }}</p>
                     <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ calculateDuration() }} {{ 'personal_hr.business_days' | translate }}</p>
                  </div>
                </div>
              </div>
              <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                @if (companySettings?.delayNotificationSendEmail || companySettings?.autoCloseDay || companySettings?.allowAddProgressEntry || companySettings?.allowReopenClosedDay || 
                    companySettings?.clientCanSeeFinancials || companySettings?.clientCanSeeMedia || companySettings?.clientCanSeeBOQ || 
                    companySettings?.requirePhotoReview || companySettings?.enableInvoiceReview) {
                 <h3 class="text-lg font-bold text-white mb-6">{{ 'sidebar.settings' | translate }}</h3>
                <div class="space-y-4">
                  <!-- Email Settings (Only if allowed by company) -->
                  @if (companySettings?.delayNotificationSendEmail) {
                    <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                      <div>
                         <p class="text-white font-medium">{{ 'project_detail.email_notifications' | translate }}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                           {{ projectSettings?.delayNotificationSendEmail === null ? ('project_detail.inherited_from_company' | translate) : ('project_detail.local_override' | translate) }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-3">
                        @if (projectSettings?.delayNotificationSendEmail !== null) {
                           <button (click)="resetEmailNotify()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                        }
                        <button (click)="toggleEmailNotify()" 
                                [class.bg-cyan-500]="projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail"
                                [class.bg-slate-600]="!(projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail)"
                                class="w-12 h-6 rounded-full relative transition-all">
                          <span [class.right-1]="projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail"
                                [class.left-1]="!(projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail)"
                                class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"></span>
                        </button>
                      </div>
                    </div>
                  }

                  <!-- Auto Close Day Settings -->
                  @if (companySettings?.autoCloseDay) {
                  <div class="p-4 rounded-xl bg-slate-700/30 space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                         <p class="text-white font-medium">{{ 'project_detail.auto_close_logs' | translate }}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                           {{ projectSettings?.autoCloseDay === null ? ('project_detail.inherited_from_company' | translate) : ('project_detail.local_override' | translate) }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-3">
                        @if (projectSettings?.autoCloseDay !== null) {
                           <button (click)="resetAutoClose()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                        }
                        <button (click)="toggleAutoClose()" 
                                [class.bg-fuchsia-500]="projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay"
                                [class.bg-slate-600]="!(projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay)"
                                class="w-12 h-6 rounded-full relative transition-all">
                          <span [class.right-1]="projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay"
                                [class.left-1]="!(projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay)"
                                class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"></span>
                        </button>
                      </div>
                    </div>

                    @if (projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay) {
                      <div class="pt-4 border-t border-slate-600/30">
                        <div class="flex items-center justify-between">
                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'projects.close_time' | translate }}</p>
                          @if (projectSettings?.autoCloseDayTime !== null) {
                             <button (click)="resetAutoCloseTime()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                          }
                        </div>
                        <input type="time" [ngModel]="projectSettings?.autoCloseDayTime ?? companySettings?.autoCloseDayTime"
                               (ngModelChange)="updateAutoCloseTime($event)"
                               class="w-full mt-2 p-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-bold outline-none">
                      </div>
                    }
                  </div>
                  }

                  <!-- Log Progress Settings -->
                  @if (companySettings?.allowAddProgressEntry) {
                  <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                    <div>
                       <p class="text-white font-medium">{{ 'project_detail.allow_add_progress' | translate }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                         {{ projectSettings?.allowAddProgressEntry === null ? ('project_detail.inherited_from_company' | translate) : ('project_detail.local_override' | translate) }}
                      </p>
                    </div>
                    <div class="flex items-center space-x-3">
                      @if (projectSettings?.allowAddProgressEntry !== null) {
                         <button (click)="resetProgressEntry()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                      }
                      <button (click)="toggleProgressEntry()" 
                              [class.bg-cyan-500]="projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry"
                              [class.bg-slate-600]="!(projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry)"
                              class="w-12 h-6 rounded-full relative transition-all">
                        <span [class.right-1]="projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry"
                              [class.left-1]="!(projectSettings?.allowAddProgressEntry ?? companySettings?.allowAddProgressEntry)"
                              class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"></span>
                      </button>
                    </div>
                  </div>
                  }

                  <!-- Reopen Settings -->
                  @if (companySettings?.allowReopenClosedDay) {
                  <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                    <div>
                       <p class="text-white font-medium">{{ 'project_detail.allow_reopen_day' | translate }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                         {{ projectSettings?.allowReopenClosedDay === null ? ('project_detail.inherited_from_company' | translate) : ('project_detail.local_override' | translate) }}
                      </p>
                    </div>
                    <div class="flex items-center space-x-3">
                      @if (projectSettings?.allowReopenClosedDay !== null) {
                         <button (click)="resetReopenDay()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                      }
                      <button (click)="toggleReopenDay()" 
                              [class.bg-emerald-500]="projectSettings?.allowReopenClosedDay ?? companySettings?.allowReopenClosedDay"
                              [class.bg-slate-600]="!(projectSettings?.allowReopenClosedDay ?? companySettings?.allowReopenClosedDay)"
                              class="w-12 h-6 rounded-full relative transition-all">
                        <span [class.right-1]="projectSettings?.allowReopenClosedDay ?? companySettings?.allowReopenClosedDay"
                              [class.left-1]="!(projectSettings?.allowReopenClosedDay ?? companySettings?.allowReopenClosedDay)"
                              class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"></span>
                      </button>
                    </div>
                  </div>
                  }

                  <!-- Governance Overrides -->
                  @if (companySettings?.requirePhotoReview || companySettings?.enableInvoiceReview) {
                    <div class="pt-4 mt-2 border-t border-white/5">
                       <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{{ 'project_detail.governance_reviews' | translate }}</p>
                      <div class="space-y-3">
                        @if (companySettings?.requirePhotoReview) {
                          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                            <div>
                               <p class="text-white text-xs font-bold">{{ 'project_detail.photo_approval' | translate }}</p>
                              <p class="text-[8px] text-slate-400 font-bold uppercase">{{ projectSettings?.requirePhotoReview === null ? 'Inherited' : 'Override' }}</p>
                            </div>
                            <div class="flex items-center space-x-3">
                              @if (projectSettings?.requirePhotoReview !== null) {
                                 <button (click)="resetPhotoReview()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                              }
                              <button (click)="togglePhotoReview()" 
                                      [class.bg-orange-500]="projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview"
                                      [class.bg-slate-600]="!(projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview)"
                                      class="w-10 h-5 rounded-full relative transition-all">
                                <span [class.right-1]="projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview"
                                      [class.left-1]="!(projectSettings?.requirePhotoReview ?? companySettings?.requirePhotoReview)"
                                      class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"></span>
                              </button>
                            </div>
                          </div>
                        }

                        @if (companySettings?.enableInvoiceReview) {
                          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                            <div>
                               <p class="text-white text-xs font-bold">{{ 'project_detail.invoice_approval' | translate }}</p>
                              <p class="text-[8px] text-slate-400 font-bold uppercase">{{ projectSettings?.enableInvoiceReview === null ? 'Inherited' : 'Override' }}</p>
                            </div>
                            <div class="flex items-center space-x-3">
                              @if (projectSettings?.enableInvoiceReview !== null) {
                                 <button (click)="resetInvoiceReview()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                              }
                              <button (click)="toggleInvoiceReview()" 
                                      [class.bg-orange-500]="projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview"
                                      [class.bg-slate-600]="!(projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview)"
                                      class="w-10 h-5 rounded-full relative transition-all">
                                <span [class.right-1]="projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview"
                                      [class.left-1]="!(projectSettings?.enableInvoiceReview ?? companySettings?.enableInvoiceReview)"
                                      class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"></span>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Client Visibility Overrides -->
                  @if (companySettings?.clientCanSeeFinancials || companySettings?.clientCanSeeMedia || companySettings?.clientCanSeeBOQ) {
                    <div class="pt-4 mt-2 border-t border-white/5">
                       <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{{ 'project_detail.client_portal_visibility' | translate }}</p>
                      <div class="space-y-3">
                        @if (companySettings?.clientCanSeeFinancials) {
                          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                            <div>
                               <p class="text-white text-xs font-bold">{{ 'project_detail.financial_status' | translate }}</p>
                              <p class="text-[8px] text-slate-400 font-bold uppercase">{{ projectSettings?.clientCanSeeFinancials === null ? 'Inherited' : 'Override' }}</p>
                            </div>
                            <div class="flex items-center space-x-3">
                              @if (projectSettings?.clientCanSeeFinancials !== null) {
                                 <button (click)="resetClientFinancials()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                              }
                              <button (click)="toggleClientFinancials()" 
                                      [class.bg-blue-500]="projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials"
                                      [class.bg-slate-600]="!(projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials)"
                                      class="w-10 h-5 rounded-full relative transition-all">
                                <span [class.right-1]="projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials"
                                      [class.left-1]="!(projectSettings?.clientCanSeeFinancials ?? companySettings?.clientCanSeeFinancials)"
                                      class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"></span>
                              </button>
                            </div>
                          </div>
                        }

                        @if (companySettings?.clientCanSeeMedia) {
                          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                            <div>
                               <p class="text-white text-xs font-bold">{{ 'daily_log.site_photos' | translate }}</p>
                              <p class="text-[8px] text-slate-400 font-bold uppercase">{{ projectSettings?.clientCanSeeMedia === null ? 'Inherited' : 'Override' }}</p>
                            </div>
                            <div class="flex items-center space-x-3">
                              @if (projectSettings?.clientCanSeeMedia !== null) {
                                 <button (click)="resetClientMedia()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                              }
                              <button (click)="toggleClientMedia()" 
                                      [class.bg-blue-500]="projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia"
                                      [class.bg-slate-600]="!(projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia)"
                                      class="w-10 h-5 rounded-full relative transition-all">
                                <span [class.right-1]="projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia"
                                      [class.left-1]="!(projectSettings?.clientCanSeeMedia ?? companySettings?.clientCanSeeMedia)"
                                      class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"></span>
                              </button>
                            </div>
                          </div>
                        }

                        @if (companySettings?.clientCanSeeBOQ) {
                          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                            <div>
                               <p class="text-white text-xs font-bold">{{ 'project_detail.boq_details' | translate }}</p>
                              <p class="text-[8px] text-slate-400 font-bold uppercase">{{ projectSettings?.clientCanSeeBOQ === null ? 'Inherited' : 'Override' }}</p>
                            </div>
                            <div class="flex items-center space-x-3">
                              @if (projectSettings?.clientCanSeeBOQ !== null) {
                                 <button (click)="resetClientBOQ()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">{{ 'common.reset' | translate }}</button>
                              }
                              <button (click)="toggleClientBOQ()" 
                                      [class.bg-blue-500]="projectSettings?.clientCanSeeBOQ ?? companySettings?.clientCanSeeBOQ"
                                      [class.bg-slate-600]="!(projectSettings?.clientCanSeeBOQ ?? companySettings?.clientCanSeeBOQ)"
                                      class="w-10 h-5 rounded-full relative transition-all">
                                <span [class.right-1]="projectSettings?.clientCanSeeBOQ ?? companySettings?.clientCanSeeBOQ"
                                      [class.left-1]="!(projectSettings?.clientCanSeeBOQ ?? companySettings?.clientCanSeeBOQ)"
                                      class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"></span>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
                }
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

           <!-- BOQ Tab (Renamed to Project Progress & BOQ) -->
           @if (activeTab === 'boq') {
             <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all animate-in fade-in duration-500">
               <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                 <div>
                     <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.boq_progress_dashboard' | translate }}</h3>
                     <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{{ 'project_detail.boq_progress_desc' | translate }}</p>
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
                        <app-boq-progress-node 
                            [node]="phase" 
                            [parentTotalMoney]="totalProjectValue">
                        </app-boq-progress-node>
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
                             (onAddChild)="openPhaseModal(undefined, $event)"
                             (onEdit)="openPhaseModal($event)"
                             (onDelete)="deletePhase($event)"
                             (onAddItems)="openItemModal($event)"
                             (onEditItem)="openItemModal($event.phase, $event.item)">
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
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-cyan-500">Site Physical Address</label>
                              <input type="text" [(ngModel)]="editForm.address" 
                                     class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all">
                           </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-5">
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobilization Date</label>
                              <input type="date" [(ngModel)]="editForm.startDate" 
                                     class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-xs outline-none focus:border-cyan-500">
                           </div>
                           <div class="relative group">
                              <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Anticipated Handover</label>
                              <input type="date" [(ngModel)]="editForm.endDate" 
                                     class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-xs outline-none focus:border-cyan-500">
                           </div>
                        </div>

                        @if (companySettings?.allowLocations) {
                           <div class="grid grid-cols-2 gap-5 p-6 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl">
                              <div class="relative">
                                 <label class="text-[8px] font-black uppercase opacity-50 mb-1 block">Latitude</label>
                                 <input type="number" [(ngModel)]="editForm.lat" 
                                        class="w-full bg-transparent border-b border-white/20 dark:border-slate-900/20 py-2 font-black text-lg focus:border-cyan-400 outline-none">
                              </div>
                              <div class="relative">
                                 <label class="text-[8px] font-black uppercase opacity-50 mb-1 block">Longitude</label>
                                 <input type="number" [(ngModel)]="editForm.lng" 
                                        class="w-full bg-transparent border-b border-white/20 dark:border-slate-900/20 py-2 font-black text-lg focus:border-cyan-400 outline-none">
                              </div>
                           </div>
                        }
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

          <!-- Add BOQ Item Modal -->
          @if (showAddBoqModal) {
            <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
               <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
                  <div class="p-10 pb-6 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                     <div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                           {{ selectedBoqItem ? 'Configure Item Dates' : 'Add BOQ Item' }}
                        </h3>
                        <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-1">
                           {{ selectedBoqItem ? 'Update schedule for ' + selectedBoqItem.description : 'New work item definition' }}
                        </p>
                     </div>
                     <button (click)="showAddBoqModal = false" class="p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                        <svg class="w-5 h-5 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>

                  <div class="p-10 pt-6 space-y-6">
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <input type="text" [(ngModel)]="boqForm.description" placeholder="e.g. Excavation Works"
                               class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all">
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div class="relative group">
                           <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit</label>
                           <select [(ngModel)]="boqForm.unit" 
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
                           <input type="number" [(ngModel)]="boqForm.totalQuantity" 
                                  class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                        </div>
                     </div>
                     <div class="relative group">
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Rate ($)</label>
                        <input type="number" [(ngModel)]="boqForm.rate" 
                               class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div class="relative group">
                           <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                           <input type="date" [(ngModel)]="boqForm.startDate" 
                                  class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                        </div>
                        <div class="relative group">
                           <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                           <input type="date" [(ngModel)]="boqForm.endDate" 
                                  class="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm outline-none">
                        </div>
                     </div>
                     @if (boqForm.totalQuantity > 0 && boqForm.rate > 0) {
                        <div class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                           <p class="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Estimated Total Value</p>
                           <p class="text-xl font-black text-emerald-600">{{ boqForm.totalQuantity * boqForm.rate | currency:'USD' }}</p>
                        </div>
                     }
                  </div>

                  <div class="p-10 pt-4 flex space-x-4 shrink-0 bg-slate-50/50 dark:bg-white/5">
                     <button (click)="showAddBoqModal = false" class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-slate-800 text-slate-500 font-black text-[11px] uppercase tracking-widest border border-slate-200 dark:border-white/5">Cancel</button>
                     <button (click)="addBoqItem()" [disabled]="!boqForm.description || !boqForm.unit || boqForm.totalQuantity <= 0" class="flex-[2] py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">{{ selectedBoqItem ? 'Update Configuration' : 'Add Item' }}</button>
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
                        <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</label>
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
                         <label class="absolute -top-2 left-5 px-2 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Received</label>
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
                     <button (click)="savePhase()" [disabled]="!phaseForm.name" class="flex-[2] py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">Save Phase</button>
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
                                     <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{{ getBoqItemName(item.boqItemId) }}</p>
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
   project: Project | undefined;
   activeTab: 'timeline' | 'team' | 'history' | 'boq' | 'finances' | 'bills' | 'payments' | 'phases' = 'timeline';
   teamMembers: User[] = [];
   companyUsers: User[] = [];
   dailyLogs: DailyLog[] = [];
   boqItems: BOQItem[] = [];
   activities: ProjectActivity[] = [];

   get totalCollected(): number {
      return this.clientPayments.reduce((sum, p) => sum + p.amount, 0);
   }

   transactions: Transaction[] = [];
   bills: ProjectBill[] = [];
   clientPayments: ClientPayment[] = [];

   get totalProjectValue(): number {
      return this.boqItems.reduce((sum, item) => sum + (item.totalQuantity * item.rate), 0);
   }

   // Daily Log View Logic (at the end of template context conceptually, but physically before properties)


   // Edit State
   showEditModal = false;
   companySettings: CompanySettings | undefined;
   projectSettings: ProjectSettings | undefined;
   // Role Change Modal State
   showRoleModal = false;
   showAddMemberModal = false;
   availableRoles: Role[] = [];
   userToEdit: User | null = null;
   roleOverrides: { [userId: number]: string } = {};
   selectedNewMembers: Set<number> = new Set();

   // Add Bill/Payment Modal State
   showAddBillModal = false;
   showAddPaymentModal = false;
   showAddBoqModal = false;
   selectedBoqItem: BOQItem | null = null;

   boqForm = {
      description: '',
      unit: '',
      totalQuantity: 0,
      rate: 0,
      startDate: null as string | null,
      endDate: null as string | null
   };

   billForm = {
      billNumber: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
      photoUrl: ''
   };

   paymentForm = {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'Bank Transfer' as 'Bank Transfer' | 'Cash' | 'Cheque',
      referenceNumber: '',
      notes: '',
      photoUrl: '',
      actionBy: ''
   };


   editForm = {
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
   selectedLog: DailyLog | null = null;

   constructor(
      private route: ActivatedRoute,
      private mockDataService: MockDataService,
      private authService: AuthService,
      private settingsService: SettingsService,
      private phaseService: PhaseService
   ) { }

   ngOnInit() {
      const projectId = Number(this.route.snapshot.paramMap.get('id'));
      if (projectId) {
         this.mockDataService.getProjects().subscribe(projects => {
            this.project = projects.find(p => p.id === projectId);
         });

         this.mockDataService.getUsers().subscribe(users => {
            const potentialMembers = users.filter(u => u.role === 'CompanyUser' || u.role === 'CompanyAdmin');
            this.companyUsers = potentialMembers;
            this.teamMembers = potentialMembers.slice(0, 3); // Mocking that some are already members
         });

         this.mockDataService.getDailyLogs(projectId).subscribe(logs => {
            // Enriching logs for better historical demo
            this.dailyLogs = logs.map(l => ({
               ...l,
               items: l.items.length > 0 ? l.items : [
                  { id: Math.random(), boqItemId: 9001 + Math.floor(Math.random() * 5), quantity: 5 + Math.floor(Math.random() * 20), notes: 'Regular progress as per schedule.' },
                  { id: Math.random(), boqItemId: 9001 + Math.floor(Math.random() * 5), quantity: 2 + Math.floor(Math.random() * 10), notes: 'Verified by site engineer.' }
               ]
            }));
         });

         this.mockDataService.getBOQItems(projectId).subscribe(items => {
            // For demo, ensure we have some items linked to phases with dates and varied progress
            const basePhaseId = projectId * 10000;
            this.boqItems = [
               ...items,
               // Mobilization (Completed)
               { id: 9001, projectId, phaseId: basePhaseId + 101, description: 'توريد مكاتب مهندسين ومجهزة', unit: 'Unit', totalQuantity: 2, executedQuantity: 2, rate: 5000, startDate: '2024-03-01', endDate: '2024-03-05' },
               { id: 9002, projectId, phaseId: basePhaseId + 102, description: 'تركيب عداد مياه مؤقت للموقع', unit: 'Unit', totalQuantity: 1, executedQuantity: 1, rate: 2500, startDate: '2024-03-02', endDate: '2024-03-04' },

               // Excavation (Completed)
               { id: 9006, projectId, phaseId: basePhaseId + 2, description: 'أعمال حفر الموقع العام', unit: 'm3', totalQuantity: 1200, executedQuantity: 1200, rate: 45, startDate: '2024-03-05', endDate: '2024-03-10' },

               // Concrete - Plain (Processing)
               { id: 9003, projectId, phaseId: basePhaseId + 301, description: 'صب خرسانة عادية للقواعد العادية', unit: 'm3', totalQuantity: 150, executedQuantity: 120, rate: 300, startDate: '2024-03-10', endDate: '2024-03-12' },

               // Concrete - Reinforced (Pending/Partial)
               { id: 9004, projectId, phaseId: basePhaseId + 302, description: 'حديد تسليح القواعد المسلحة والسملات', unit: 'Ton', totalQuantity: 12, executedQuantity: 3, rate: 45000, startDate: '2024-03-14', endDate: '2024-03-18' },
               { id: 9005, projectId, phaseId: basePhaseId + 302, description: 'نجارة مسلحة وصب خرسانة جاهزة', unit: 'm3', totalQuantity: 280, executedQuantity: 0, rate: 1200, startDate: '2024-03-15', endDate: '2024-03-22' }
            ];
            this.loadProjectPhases(projectId); // Reload to pick up item date and money aggregation
         });

         this.mockDataService.getTransactions(projectId).subscribe(trans => {
            this.transactions = trans;
         });

         this.settingsService.getCompanySettings().subscribe(settings => {
            this.companySettings = settings;
         });

         this.settingsService.getProjectSettings(projectId).subscribe(settings => {
            this.projectSettings = settings;
         });



         this.mockDataService.getRoles().subscribe(roles => {
            this.availableRoles = roles;
         });

         this.mockDataService.getBills(projectId).subscribe(bills => {
            this.bills = bills;
         });

         this.mockDataService.getClientPayments(projectId).subscribe(payments => {
            this.clientPayments = payments;
         });

         // Mock Activities
         this.activities = [
            { id: 1, projectId, userId: 1, userName: 'Ahmed Ramadan', type: 'Log', action: 'Daily Log Sealed', details: 'Phase 1 - Concrete pouring for foundation was verified and closed.', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 2, projectId, userId: 2, userName: 'Sarah Khalil', type: 'Finance', action: 'New Invoice Issued', details: 'Client Bill #2026-004 for $15,000 has been sent for approval.', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, projectId, userId: 1, userName: 'Ahmed Ramadan', type: 'Team', action: 'Assigned New Engineer', details: 'Basem Ali was added to the project as a Company User.', timestamp: new Date(Date.now() - 172800000).toISOString() },
            { id: 4, projectId, userId: 3, userName: 'System Bot', type: 'Setting', action: 'Auto-Close Enabled', details: 'Project was updated to automatically close daily logs at 18:00.', timestamp: new Date(Date.now() - 259200000).toISOString() },
            { id: 5, projectId, userId: 2, userName: 'Sarah Khalil', type: 'Media', action: 'Site Photos Uploaded', details: '4 New photos of the electrical installations were added to the site media.', timestamp: new Date(Date.now() - 432000000).toISOString() }
         ];
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

      // In a real app, this would call a service
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
   }

   deleteProject() {
      if (!this.project) return;
      // Removed browser confirm per user request
      console.log('Project deleted (local):', this.project.id);
      window.history.back();
   }


   openRoleModal(user: User) {
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
      const newBill: ProjectBill = {
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
      const newPayment: ClientPayment = {
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

   addBoqItem() {
      if (!this.project) return;

      if (this.selectedBoqItem) {
         // Find and update the existing item in the array
         const index = this.boqItems.findIndex(i => i.id === this.selectedBoqItem!.id);
         if (index !== -1) {
            this.boqItems[index] = {
               ...this.boqItems[index],
               description: this.boqForm.description,
               unit: this.boqForm.unit,
               totalQuantity: this.boqForm.totalQuantity,
               rate: this.boqForm.rate,
               startDate: this.boqForm.startDate || undefined,
               endDate: this.boqForm.endDate || undefined
            };
         }
      } else {
         const newItem: BOQItem = {
            id: Math.floor(Math.random() * 10000),
            projectId: this.project.id,
            phaseId: this.selectedPhase?.id, // Link to phase if adding from hierarchy
            description: this.boqForm.description,
            unit: this.boqForm.unit,
            totalQuantity: this.boqForm.totalQuantity,
            executedQuantity: 0,
            rate: this.boqForm.rate,
            startDate: this.boqForm.startDate || undefined,
            endDate: this.boqForm.endDate || undefined
         } as any;
         this.boqItems.push(newItem);
      }

      this.showAddBoqModal = false;
      this.resetBoqForm();
      // Refresh phases to show new item if we have a project ID
      if (this.project) this.loadProjectPhases(this.project.id);
   }

   resetBoqForm() {
      this.boqForm = {
         description: '',
         unit: '',
         totalQuantity: 0,
         rate: 0,
         startDate: null,
         endDate: null
      } as any;
   }

   deleteBoqItem(id: number) {
      if (confirm('Are you sure you want to delete this BOQ item?')) {
         this.boqItems = this.boqItems.filter(item => item.id !== id);
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
      this.settingsService.updateProjectSettings(this.project.id, this.projectSettings).subscribe();
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

   toggleClientBOQ() {
      if (!this.projectSettings || !this.companySettings) return;
      const current = this.projectSettings.clientCanSeeBOQ ?? this.companySettings.clientCanSeeBOQ;
      this.projectSettings.clientCanSeeBOQ = !current;
      this.saveProjectSettings();
   }

   resetClientBOQ() {
      if (!this.projectSettings) return;
      this.projectSettings.clientCanSeeBOQ = null;
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

   // --- Phases Logic ---
   projectPhases: Phase[] = [];
   isPhasesInitialized = false;
   showPhaseModal = false;
   selectedPhase?: Phase;
   parentPhase?: Phase;
   phaseForm: any = { name: '', description: '', order: 0 };

   loadProjectPhases(projectId: number) {
      this.phaseService.getProjectPhases(projectId, this.boqItems).subscribe(phases => {
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
         this.phaseService.initializeProjectPhasesFromDefaults(this.project.id, 1).subscribe(() => {
            if (this.project) {
               this.loadProjectPhases(this.project.id);
               this.isPhasesInitialized = true;
            }
         });
      }
   }

   resetHierarchy() {
      if (confirm('Are you sure you want to clear all phases and start over with an empty hierarchy?')) {
         // In a real app, delete all phases for this project
         this.projectPhases = [];
         this.isPhasesInitialized = true;
         // If we had a service method to clear, we'd call it here
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

   openItemModal(phase: Phase, item?: BOQItem) {
      this.selectedPhase = phase;
      this.selectedBoqItem = item || null;
      if (item) {
         this.boqForm = {
            description: item.description,
            unit: item.unit,
            totalQuantity: item.totalQuantity,
            rate: item.rate,
            startDate: item.startDate || null,
            endDate: item.endDate || null
         } as any;
      } else {
         this.resetBoqForm();
      }
      this.showAddBoqModal = true;
   }

   savePhase() {
      if (!this.project) return;
      if (this.selectedPhase) {
         this.phaseService.updatePhase(this.selectedPhase.id, this.phaseForm).subscribe(() => {
            if (this.project) this.loadProjectPhases(this.project.id);
            this.showPhaseModal = false;
         });
      } else {
         const request = {
            ...this.phaseForm,
            parentPhaseId: this.parentPhase?.id
         };
         this.phaseService.createProjectPhase(this.project.id, request).subscribe(() => {
            if (this.project) this.loadProjectPhases(this.project.id);
            this.showPhaseModal = false;
         });
      }
   }

   deletePhase(id: number) {
      if (confirm('Delete this phase?')) {
         if (this.project) this.phaseService.deletePhase(id).subscribe(() => this.loadProjectPhases(this.project!.id));
      }
   }

   openLogDetails(log: DailyLog) {
      this.selectedLog = log;
      this.showLogModal = true;
   }

   getBoqItemName(id: number): string {
      return this.boqItems.find(i => i.id === id)?.description || 'Unknown Item';
   }

   getLogTotalExecution(log: DailyLog): number {
      return log.items.reduce((sum, item) => {
         const boq = this.boqItems.find(b => b.id === item.boqItemId);
         return sum + (item.quantity * (boq?.rate || 0));
      }, 0);
   }
}
