import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafetyService, SafetyIncident, SafetyTraining, SafetyDashboard } from '../../../core/services/safety.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-safety',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-500 font-['Outfit']">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-premium-fade">
          <div class="space-y-6">
            <div class="space-y-1">
              <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{{ 'safety.title' | translate }}</h1>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">Security & Compliance Control Center</p>
            </div>
            
            <div class="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-[1.5rem] w-fit border border-slate-200 dark:border-white/5 shadow-inner">
              <button (click)="activeTab = 'dashboard'" 
                      [class.bg-white]="activeTab === 'dashboard'" 
                      [class.dark:bg-slate-800]="activeTab === 'dashboard'"
                      [class.text-indigo-600]="activeTab === 'dashboard'"
                      [class.dark:text-white]="activeTab === 'dashboard'"
                      [class.shadow-xl]="activeTab === 'dashboard'"
                      class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-300 hover:text-slate-600 dark:hover:text-slate-200">
                  {{ 'safety.tabs.overview' | translate }}
              </button>
              <button (click)="activeTab = 'incidents'" 
                      [class.bg-white]="activeTab === 'incidents'" 
                      [class.dark:bg-slate-800]="activeTab === 'incidents'"
                      [class.text-rose-600]="activeTab === 'incidents'"
                      [class.dark:text-white]="activeTab === 'incidents'"
                      [class.shadow-xl]="activeTab === 'incidents'"
                      class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-300 hover:text-slate-600 dark:hover:text-slate-200">
                  {{ 'safety.tabs.incidents' | translate }}
              </button>
              <button (click)="activeTab = 'inspections'" 
                      [class.bg-white]="activeTab === 'inspections'" 
                      [class.dark:bg-slate-800]="activeTab === 'inspections'"
                      [class.text-amber-600]="activeTab === 'inspections'"
                      [class.dark:text-white]="activeTab === 'inspections'"
                      [class.shadow-xl]="activeTab === 'inspections'"
                      class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-300 hover:text-slate-600 dark:hover:text-slate-200">
                  {{ 'safety.tabs.inspections' | translate }}
              </button>
              <button (click)="activeTab = 'trainings'" 
                      [class.bg-white]="activeTab === 'trainings'" 
                      [class.dark:bg-slate-800]="activeTab === 'trainings'"
                      [class.text-violet-600]="activeTab === 'trainings'"
                      [class.dark:text-white]="activeTab === 'trainings'"
                      [class.shadow-xl]="activeTab === 'trainings'"
                      class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-300 hover:text-slate-600 dark:hover:text-slate-200">
                  {{ 'safety.tabs.trainings' | translate }}
              </button>
            </div>
          </div>

          <button (click)="openIncidentModal()"
                  class="group relative overflow-hidden px-10 py-5 rounded-[2rem] bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-1 active:scale-95 transition-all">
            <span class="relative z-10 flex items-center">
              <svg class="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              {{ 'safety.incident.report_new' | translate }}
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>

        <!-- Dashboard Tab -->
        @if (activeTab === 'dashboard') {
        <div class="space-y-12">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 hover:shadow-rose-500/10 transition-all duration-500 animate-premium-fade" style="animation-delay: 100ms">
              <div class="flex items-center justify-between mb-8">
                <div class="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-500">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-black text-rose-500 uppercase tracking-widest block">{{ 'common.this_month' | translate }}</span>
                  <div class="flex items-center justify-end gap-1 mt-1">
                    <div class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-premium-pulse"></div>
                    <span class="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Critical</span>
                  </div>
                </div>
              </div>
              <h3 class="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ dashboard?.incidentsThisMonth || 0 }}</h3>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'safety.stats.incidents_this_month' | translate }}</p>
            </div>

            <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 hover:shadow-amber-500/10 transition-all duration-500 animate-premium-fade" style="animation-delay: 200ms">
              <div class="flex items-center justify-between mb-8">
                <div class="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest block">{{ 'safety.stats.pass_rate' | translate }}</span>
                  <div class="mt-1 h-1.5 w-16 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full" [style.width.%]="dashboard?.averagePassRate || 0"></div>
                  </div>
                </div>
              </div>
              <h3 class="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ dashboard?.averagePassRate || 0 }}%</h3>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'safety.safety_inspections' | translate }}</p>
            </div>

            <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 hover:shadow-emerald-500/10 transition-all duration-500 animate-premium-fade" style="animation-delay: 300ms">
              <div class="flex items-center justify-between mb-8">
                <div class="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">{{ 'common.completed' | translate }}</span>
                  <span class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Active Week</span>
                </div>
              </div>
              <h3 class="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ dashboard?.trainingsCompleted || 0 }}</h3>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'safety.stats.trainings_completed' | translate }}</p>
            </div>

            <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 hover:shadow-violet-500/10 transition-all duration-500 animate-premium-fade" style="animation-delay: 400ms">
              <div class="flex items-center justify-between mb-8">
                <div class="w-16 h-16 rounded-[1.5rem] bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform duration-500">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-black text-violet-500 uppercase tracking-widest block">{{ 'common.upcoming' | translate }}</span>
                  <span class="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Q1 Phase</span>
                </div>
              </div>
              <h3 class="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ dashboard?.upcomingTrainings || 0 }}</h3>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'safety.stats.upcoming_trainings' | translate }}</p>
            </div>
          </div>

          <!-- Recent Incidents & Upcoming Trainings -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Recent Incidents -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 animate-premium-fade" style="animation-delay: 500ms">
              <div class="flex items-center justify-between mb-10">
                <div class="space-y-1">
                  <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'safety.recent_incidents' | translate }}</h3>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Security Feed</p>
                </div>
                <button (click)="activeTab = 'incidents'" class="px-6 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-500 hover:text-rose-500 transition-all uppercase tracking-widest border border-slate-100 dark:border-white/5 shadow-sm">{{ 'common.view_all' | translate }}</button>
              </div>
              <div class="space-y-6">
                @for (incident of dashboard?.recentIncidents; track incident.id; let i = $index) {
                <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 hover:border-rose-500/20 transition-all group animate-premium-slide-up"
                     [style.animation-delay]="(i * 50 + 600) + 'ms'">
                  <div class="flex items-start justify-between">
                    <div class="space-y-3">
                      <div class="flex items-center gap-3">
                        <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset" 
                              [class.bg-rose-500/10]="incident.severityName === 'High'"
                              [class.text-rose-600]="incident.severityName === 'High'"
                              [class.ring-rose-500/20]="incident.severityName === 'High'"
                              [class.bg-amber-500/10]="incident.severityName === 'Medium'"
                              [class.text-amber-600]="incident.severityName === 'Medium'"
                              [class.ring-amber-500/20]="incident.severityName === 'Medium'"
                              [class.bg-emerald-500/10]="incident.severityName === 'Low'"
                              [class.text-emerald-600]="incident.severityName === 'Low'"
                              [class.ring-emerald-500/20]="incident.severityName === 'Low'">
                          {{ incident.severityName }}
                        </span>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{{ incident.incidentDate | date:'shortDate' }}</span>
                      </div>
                      <h4 class="text-base font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">{{ incident.title }}</h4>
                      <div class="flex items-center gap-2 opacity-60">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ incident.location || ('safety.incident.location' | translate) }}</p>
                      </div>
                    </div>
                    <span class="px-3 py-1.5 rounded-xl bg-slate-200/50 dark:bg-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-300/30 dark:border-white/5">
                      {{ incident.investigationStatusName }}
                    </span>
                  </div>
                </div>
                }
                @if (!dashboard?.recentIncidents?.length) {
                <div class="flex flex-col items-center justify-center py-20 opacity-20">
                   <svg class="w-20 h-20 text-slate-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{{ 'safety.no_incidents' | translate }}</p>
                </div>
                }
              </div>
            </div>

            <!-- Upcoming Trainings -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 animate-premium-fade" style="animation-delay: 600ms">
              <div class="flex items-center justify-between mb-10">
                <div class="space-y-1">
                  <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'safety.upcoming_trainings' | translate }}</h3>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Learning & Growth</p>
                </div>
                <button (click)="activeTab = 'trainings'" class="px-6 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-500 hover:text-violet-500 transition-all uppercase tracking-widest border border-slate-100 dark:border-white/5 shadow-sm">{{ 'common.view_all' | translate }}</button>
              </div>
              <div class="space-y-6">
                @for (training of dashboard?.upcomingTrainingsList; track training.id; let i = $index) {
                <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 hover:border-violet-500/20 transition-all group animate-premium-slide-up"
                     [style.animation-delay]="(i * 50 + 700) + 'ms'">
                  <div class="flex items-start justify-between">
                    <div class="space-y-3">
                      <div class="flex items-center gap-3">
                         <span class="px-3 py-1 rounded-lg bg-violet-500/10 text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest border border-violet-500/10">
                           {{ training.trainingType }}
                         </span>
                         <span class="text-[10px] font-black text-rose-500 uppercase tracking-widest">{{ training.scheduledDate | date:'mediumDate' }}</span>
                      </div>
                      <h4 class="text-base font-black text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">{{ training.title }}</h4>
                      <div class="flex items-center gap-4 opacity-70">
                        <div class="flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span class="text-[10px] font-black text-slate-500 tracking-tight">{{ training.durationMinutes }} min</span>
                        </div>
                        @if (training.requiresCertification) {
                          <div class="flex items-center gap-1.5 text-emerald-500">
                             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                             <span class="text-[9px] font-black uppercase tracking-tight">Certification</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                }
                @if (!dashboard?.upcomingTrainingsList?.length) {
                <div class="flex flex-col items-center justify-center py-20 opacity-20">
                   <svg class="w-20 h-20 text-slate-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l-9-5 9-5 9 5-9 5z"></path></svg>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{{ 'safety.no_trainings' | translate }}</p>
                </div>
                }
              </div>
            </div>
          </div>
        </div>
        }

        <!-- Incidents Tab -->
        @if (activeTab === 'incidents') {
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden animate-premium-fade">
          <div class="p-10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'safety.incident_reports' | translate }}</h3>
            <button (click)="openIncidentModal()" class="px-8 py-4 rounded-[1.5rem] bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all">
              + {{ 'safety.incident.new' | translate }}
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-950/50">
                  <th class="px-10 py-6">{{ 'common.date' | translate }}</th>
                  <th class="px-10 py-6">{{ 'common.title' | translate }}</th>
                  <th class="px-10 py-6">{{ 'safety.incident.severity' | translate }}</th>
                  <th class="px-10 py-6">{{ 'safety.incident.location' | translate }}</th>
                  <th class="px-10 py-6">{{ 'common.status' | translate }}</th>
                  <th class="px-10 py-6 text-right">{{ 'common.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="text-slate-600 dark:text-slate-300">
                @for (incident of incidents; track incident.id; let i = $index) {
                <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-premium-fade"
                    [style.animation-delay]="(i * 30 + 200) + 'ms'">
                  <td class="px-10 py-6">
                    <span class="text-sm font-black text-slate-900 dark:text-white tracking-tight">{{ incident.incidentDate | date:'mediumDate' }}</span>
                  </td>
                  <td class="px-10 py-6">
                    <span class="text-sm font-black text-slate-600 dark:text-slate-400 group-hover:text-rose-600 transition-colors">{{ incident.title }}</span>
                  </td>
                  <td class="px-10 py-6">
                    <span class="px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset" 
                          [class.bg-rose-500/10]="incident.severityName === 'High'"
                          [class.text-rose-600]="incident.severityName === 'High'"
                          [class.ring-rose-500/20]="incident.severityName === 'High'"
                          [class.bg-amber-500/10]="incident.severityName === 'Medium'"
                          [class.text-amber-600]="incident.severityName === 'Medium'"
                          [class.ring-amber-500/20]="incident.severityName === 'Medium'"
                          [class.bg-emerald-500/10]="incident.severityName === 'Low'"
                          [class.text-emerald-600]="incident.severityName === 'Low'"
                          [class.ring-emerald-500/20]="incident.severityName === 'Low'">
                      {{ incident.severityName }}
                    </span>
                  </td>
                  <td class="px-10 py-6">
                    <div class="flex items-center gap-2 opacity-60">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <span class="text-[10px] font-black uppercase tracking-widest">{{ incident.location || '-' }}</span>
                    </div>
                  </td>
                  <td class="px-10 py-6">
                    <span class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-white/10">
                      {{ incident.investigationStatusName }}
                    </span>
                  </td>
                  <td class="px-10 py-6 text-right">
                    <button (click)="viewIncident(incident)" class="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-white transition-all shadow-sm group/btn">
                      <svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        }

        <!-- Trainings Tab -->
        @if (activeTab === 'trainings') {
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 animate-premium-fade">
          <div class="flex items-center justify-between mb-10">
            <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'safety.training_records' | translate }}</h3>
            <button class="px-8 py-4 rounded-[1.5rem] bg-violet-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all">
              + {{ 'safety.training.schedule' | translate }}
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (training of trainings; track training.id; let i = $index) {
            <div class="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 hover:border-violet-500/30 transition-all group animate-premium-fade shadow-sm"
                 [style.animation-delay]="(i * 50 + 200) + 'ms'">
              <div class="flex items-start justify-between mb-6">
                <span class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset" 
                      [class.bg-violet-500/10]="training.statusName === 'Scheduled'"
                      [class.text-violet-600]="training.statusName === 'Scheduled'"
                      [class.ring-violet-500/20]="training.statusName === 'Scheduled'"
                      [class.bg-emerald-500/10]="training.statusName === 'Completed'"
                      [class.text-emerald-600]="training.statusName === 'Completed'"
                      [class.ring-emerald-500/20]="training.statusName === 'Completed'"
                      [class.bg-amber-500/10]="training.statusName === 'InProgress'"
                      [class.text-amber-600]="training.statusName === 'InProgress'"
                      [class.ring-amber-500/20]="training.statusName === 'InProgress'">
                  {{ training.statusName }}
                </span>
                <div class="flex items-center gap-1.5 opacity-60">
                   <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ training.durationMinutes }} min</span>
                </div>
              </div>
              <h4 class="text-lg font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-violet-600 transition-colors">{{ training.title }}</h4>
              <p class="text-xs font-medium text-slate-500 mb-6 leading-relaxed">{{ training.description || training.trainingType }}</p>
              
              <div class="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Schedule</span>
                  <span class="text-[10px] font-black text-slate-900 dark:text-white tracking-tight">{{ training.scheduledDate | date:'mediumDate' }}</span>
                </div>
                @if (training.certificationExpiryDate) {
                  <div class="flex items-center justify-between text-amber-500">
                    <span class="text-[9px] font-black uppercase tracking-widest">{{ 'safety.training.expires' | translate }}</span>
                    <span class="text-[10px] font-black tracking-tight">{{ training.certificationExpiryDate | date:'mediumDate' }}</span>
                  </div>
                }
                <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-center">
                  <span class="px-4 py-1.5 rounded-xl bg-violet-500/10 text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest border border-violet-500/10">
                    {{ training.requiresCertification ? ('safety.training.certified' | translate) : ('common.training' | translate) }}
                  </span>
                </div>
              </div>
            </div>
            }
            @if (!trainings.length) {
            <div class="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
              <svg class="w-20 h-20 text-slate-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{{ 'safety.no_training_records' | translate }}</p>
            </div>
            }
          </div>
        </div>
        }

        <!-- Inspections Tab -->
        @if (activeTab === 'inspections') {
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 animate-premium-fade">
          <div class="flex items-center justify-between mb-10">
            <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'safety.inspections' | translate }}</h3>
            <button class="px-8 py-4 rounded-[1.5rem] bg-amber-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all">
              + {{ 'safety.inspection.new' | translate }}
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="col-span-full py-32 flex flex-col items-center justify-center opacity-20 text-center">
              <div class="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-8">
                 <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{{ 'safety.no_inspections' | translate }}</p>
            </div>
          </div>
        </div>
        }

        <!-- Incident Modal -->
        @if (showIncidentModal) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-premium-fade" style="animation-duration: 300ms">
          <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] dark:shadow-none relative border border-slate-200 dark:border-white/10 overflow-hidden animate-premium-slide-up">
            <div class="p-10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div class="space-y-1">
                <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'safety.incident.report_new' | translate }}</h2>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">Security Incident Protocol</p>
              </div>
              <button (click)="showIncidentModal = false" class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm flex items-center justify-center">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div class="p-10 space-y-8">
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'safety.incident.title' | translate }}</label>
                <input type="text" [(ngModel)]="incidentForm.title" [placeholder]="'safety.incident.title_placeholder' | translate"
                       class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all shadow-inner">
              </div>
              
              <div class="grid grid-cols-2 gap-8">
                <div class="space-y-3">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'safety.incident.severity' | translate }}</label>
                  <div class="relative group">
                    <select [(ngModel)]="incidentForm.severity" class="w-full appearance-none px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none transition-all shadow-inner pr-12 focus:border-rose-500">
                      <option [value]="1">{{ 'safety.severity.low' | translate }}</option>
                      <option [value]="2">{{ 'safety.severity.medium' | translate }}</option>
                      <option [value]="3">{{ 'safety.severity.high' | translate }}</option>
                      <option [value]="4">{{ 'safety.severity.critical' | translate }}</option>
                    </select>
                    <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-rose-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div class="space-y-3">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'safety.incident.date' | translate }}</label>
                  <input type="date" [(ngModel)]="incidentForm.incidentDate"
                         class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all shadow-inner">
                </div>
              </div>
              
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'safety.incident.location' | translate }}</label>
                <input type="text" [(ngModel)]="incidentForm.location" [placeholder]="'safety.incident.location_placeholder' | translate"
                       class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all shadow-inner">
              </div>
              
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'common.description' | translate }}</label>
                <textarea [(ngModel)]="incidentForm.description" rows="3" [placeholder]="'safety.incident.description_placeholder' | translate"
                          class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none resize-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all shadow-inner"></textarea>
              </div>
              
              <div class="flex items-center gap-4 p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                <label class="flex items-center gap-4 cursor-pointer group">
                  <div class="relative w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 flex items-center justify-center transition-all group-hover:border-rose-500 shadow-sm">
                    <input type="checkbox" [(ngModel)]="incidentForm.requiredMedicalAttention" class="absolute inset-0 opacity-0 cursor-pointer z-10">
                    <svg *ngIf="incidentForm.requiredMedicalAttention" class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span class="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{{ 'safety.incident.medical_attention' | translate }}</span>
                </label>
              </div>

              <div class="flex gap-4 pt-4">
                <button (click)="showIncidentModal = false" 
                        class="flex-1 py-5 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 hover:text-rose-500 shadow-sm border border-slate-200 dark:border-white/5 transition-all duration-300">
                  {{ 'common.cancel' | translate }}
                </button>
                <button (click)="submitIncident()" 
                        class="flex-[2] py-5 rounded-[1.5rem] bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_16px_32px_-8px_rgba(225,29,72,0.3)] hover:shadow-[0_20px_40px_-8px_rgba(225,29,72,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300">
                  {{ 'safety.incident.submit' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
        }
        }
      </div>
    </div>
  `
})
export class SafetyComponent implements OnInit, OnDestroy {
  activeTab: 'dashboard' | 'incidents' | 'inspections' | 'trainings' = 'dashboard';
  dashboard?: SafetyDashboard;
  incidents: SafetyIncident[] = [];
  trainings: SafetyTraining[] = [];

  showIncidentModal = false;
  incidentForm: any = {
    title: '',
    severity: 1,
    incidentDate: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    requiredMedicalAttention: false,
    involvedPersons: [],
    witnesses: []
  };

  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  constructor(private safetyService: SafetyService) {
    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboard();
        this.loadIncidents();
        this.loadTrainings();
      });
  }

  ngOnInit() {
    this.loadDashboard();
    this.loadIncidents();
    this.loadTrainings();
  }

  loadDashboard() {
    this.safetyService.getDashboardStats().subscribe(d => this.dashboard = d);
  }

  loadIncidents() {
    this.safetyService.getIncidents().subscribe(i => this.incidents = i);
  }

  loadTrainings() {
    this.safetyService.getTrainings().subscribe(t => this.trainings = t);
  }

  openIncidentModal() {
    this.incidentForm = {
      title: '',
      severity: 1,
      incidentDate: new Date().toISOString().split('T')[0],
      location: '',
      description: '',
      requiredMedicalAttention: false,
      involvedPersons: [],
      witnesses: []
    };
    this.showIncidentModal = true;
  }

  viewIncident(incident: SafetyIncident) {
    console.log('View incident:', incident);
  }

  submitIncident() {
    if (this.incidentForm.title) {
      this.safetyService.createIncident(this.incidentForm).subscribe(newIncident => {
        this.incidents.unshift(newIncident);
        this.showIncidentModal = false;
        this.loadDashboard();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
