import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QualityService, QualityInspection, Defect, PunchListItem, QualityStatistics } from '../../../core/services/quality.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-quality',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 md:p-10 transition-colors duration-500 font-['Outfit']">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16 animate-premium-fade">
          <div class="space-y-8">
            <div class="space-y-2">
              <h1 class="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{{ 'quality.title' | translate }}</h1>
              <div class="flex items-center gap-3">
                <div class="w-12 h-1 bg-indigo-500 rounded-full"></div>
                <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] opacity-70">Control & Standards Excellence</p>
              </div>
            </div>
            
            <div class="flex p-2 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] w-fit border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-white/50 dark:ring-white/5">
              <button (click)="activeTab = 'inspections'" 
                      [class.bg-white]="activeTab === 'inspections'" 
                      [class.dark:bg-slate-800]="activeTab === 'inspections'"
                      [class.text-indigo-600]="activeTab === 'inspections'"
                      [class.dark:text-white]="activeTab === 'inspections'"
                      [class.shadow-2xl]="activeTab === 'inspections'"
                      [class.scale-105]="activeTab === 'inspections'"
                      class="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-500 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95">
                  {{ 'quality.tabs.inspections' | translate }}
              </button>
              <button (click)="activeTab = 'defects'" 
                      [class.bg-white]="activeTab === 'defects'" 
                      [class.dark:bg-slate-800]="activeTab === 'defects'"
                      [class.text-rose-600]="activeTab === 'defects'"
                      [class.dark:text-white]="activeTab === 'defects'"
                      [class.shadow-2xl]="activeTab === 'defects'"
                      [class.scale-105]="activeTab === 'defects'"
                      class="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-500 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95">
                  {{ 'quality.tabs.defects' | translate }}
              </button>
              <button (click)="activeTab = 'punchlist'" 
                      [class.bg-white]="activeTab === 'punchlist'" 
                      [class.dark:bg-slate-800]="activeTab === 'punchlist'"
                      [class.text-amber-600]="activeTab === 'punchlist'"
                      [class.dark:text-white]="activeTab === 'punchlist'"
                      [class.shadow-2xl]="activeTab === 'punchlist'"
                      [class.scale-105]="activeTab === 'punchlist'"
                      class="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-500 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95">
                  {{ 'quality.tabs.punchlist' | translate }}
              </button>
              <button (click)="activeTab = 'standards'" 
                      [class.bg-white]="activeTab === 'standards'" 
                      [class.dark:bg-slate-800]="activeTab === 'standards'"
                      [class.text-violet-600]="activeTab === 'standards'"
                      [class.dark:text-white]="activeTab === 'standards'"
                      [class.shadow-2xl]="activeTab === 'standards'"
                      [class.scale-105]="activeTab === 'standards'"
                      class="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all duration-500 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95">
                  {{ 'quality.tabs.standards' | translate }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <button (click)="activeTab = 'defects'"
                    class="group relative overflow-hidden px-8 py-5 rounded-[2.25rem] bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-[0.25em] border border-slate-200/60 dark:border-white/10 shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all">
              <span class="relative z-10 flex items-center">
                <svg class="w-5 h-5 mr-3 text-rose-500 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                {{ 'quality.defect.title' | translate }}
              </span>
            </button>
            <button (click)="activeTab = 'inspections'"
                    class="group relative overflow-hidden px-10 py-5 rounded-[2.25rem] bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-95 transition-all">
              <span class="relative z-10 flex items-center">
                <svg class="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ 'quality.inspection.title' | translate }}
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-20">
          <div (click)="activeTab = 'inspections'" class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-10 hover:shadow-indigo-500/20 cursor-pointer transition-all duration-500 animate-premium-fade ring-1 ring-inset ring-transparent hover:ring-indigo-500/20" style="animation-delay: 100ms">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-indigo-500/30">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{{ statistics?.totalInspections || 0 }}</h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'quality.stats.total_inspections' | translate }}</p>
            <div class="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg class="w-16 h-16 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
          </div>

          <div (click)="activeTab = 'defects'" class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-10 hover:shadow-rose-500/20 cursor-pointer transition-all duration-500 animate-premium-fade ring-1 ring-inset ring-transparent hover:ring-rose-500/20" style="animation-delay: 200ms">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all shadow-lg shadow-rose-500/30">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{{ statistics?.openDefects || 0 }}</h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'quality.stats.open_defects' | translate }}</p>
            <div class="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg class="w-16 h-16 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            </div>
          </div>

          <div (click)="activeTab = 'defects'" class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-10 hover:shadow-amber-500/20 cursor-pointer transition-all duration-500 animate-premium-fade ring-1 ring-inset ring-transparent hover:ring-amber-500/20" style="animation-delay: 300ms">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-all shadow-lg shadow-amber-500/30">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{{ statistics?.criticalDefects || 0 }}</h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'quality.stats.critical' | translate }}</p>
            <div class="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg class="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
          </div>

          <div (click)="activeTab = 'punchlist'" class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-10 hover:shadow-emerald-500/20 cursor-pointer transition-all duration-500 animate-premium-fade ring-1 ring-inset ring-transparent hover:ring-emerald-500/20" style="animation-delay: 400ms">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-emerald-500/30">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{{ statistics?.pendingPunchListItems || 0 }}</h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'quality.stats.punch_list' | translate }}</p>
            <div class="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg class="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
          </div>

          <div class="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-10 hover:shadow-violet-500/20 transition-all duration-500 animate-premium-fade ring-1 ring-inset ring-transparent hover:ring-violet-500/20" style="animation-delay: 500ms">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-all shadow-lg shadow-violet-500/30">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{{ statistics ? statistics.averageInspectionScore.toFixed(1) : '0.0' }}%</h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{{ 'quality.stats.avg_score' | translate }}</p>
            <div class="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg class="w-16 h-16 text-violet-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 15.66z"/></svg>
            </div>
          </div>
        </div>

      <!-- Inspections Tab -->
      <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden animate-premium-fade" *ngIf="activeTab === 'inspections'">
        <div class="p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/50 dark:bg-white/[0.02]">
          <div class="flex flex-wrap items-center gap-6">
            <div class="relative group min-w-[320px]">
              <svg class="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" [(ngModel)]="inspectionSearch" [placeholder]="'common.search' | translate"
                     class="w-full pl-14 pr-8 py-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-white/10 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm">
            </div>
            <div class="flex items-center gap-4">
              <select [(ngModel)]="inspectionStatusFilter" class="px-8 py-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-white/10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer pr-12 relative">
                <option value="">{{ 'common.all_status' | translate }}</option>
                <option value="Scheduled">{{ 'quality.inspection.scheduled' | translate }}</option>
                <option value="InProgress">{{ 'quality.inspection.in_progress' | translate }}</option>
                <option value="Completed">{{ 'common.completed' | translate }}</option>
              </select>
            </div>
          </div>
          <button class="group relative px-10 py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all overflow-hidden">
            <span class="relative z-10">+ {{ 'quality.inspection.new' | translate }}</span>
            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-white/5">
                <th class="px-10 py-8">{{ 'quality.inspection.number' | translate }}</th>
                <th class="px-10 py-8">{{ 'common.title' | translate }}</th>
                <th class="px-10 py-8">{{ 'common.project' | translate }}</th>
                <th class="px-10 py-8">{{ 'common.status' | translate }}</th>
                <th class="px-10 py-8">{{ 'common.date' | translate }}</th>
                <th class="px-10 py-8">{{ 'quality.inspection.score' | translate }}</th>
                <th class="px-10 py-8 text-right">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody class="text-slate-600 dark:text-slate-300">
              <tr *ngFor="let inspection of filteredInspections; let i = index" 
                  class="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all duration-300 group animate-premium-fade"
                  [style.animation-delay]="(i * 30 + 100) + 'ms'">
                <td class="px-10 py-8">
                  <span class="text-xs font-black text-slate-400 uppercase tracking-widest opacity-60">{{ inspection.inspectionNumber }}</span>
                </td>
                <td class="px-10 py-8">
                  <div class="space-y-2">
                    <span class="text-sm font-black text-slate-900 dark:text-white tracking-tight block group-hover:text-indigo-600 transition-colors">{{ inspection.title }}</span>
                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/5 text-[9px] font-black text-indigo-500 uppercase tracking-widest">{{ inspection.inspectionType }}</span>
                  </div>
                </td>
                <td class="px-10 py-8">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-400 opacity-40"></div>
                    <span class="text-xs font-black text-slate-500 tracking-tight uppercase tracking-widest">{{ inspection.projectName }}</span>
                  </div>
                </td>
                <td class="px-10 py-8">
                  <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ring-current" 
                        [class.bg-indigo-500/10]="inspection.status === 'Scheduled'"
                        [class.text-indigo-600]="inspection.status === 'Scheduled'"
                        [class.bg-amber-500/10]="inspection.status === 'InProgress'"
                        [class.text-amber-600]="inspection.status === 'InProgress'"
                        [class.bg-emerald-500/10]="inspection.status === 'Completed'"
                        [class.text-emerald-600]="inspection.status === 'Completed'">
                    {{ inspection.status }}
                  </span>
                </td>
                <td class="px-10 py-8">
                  <span class="text-xs font-black text-slate-400 tracking-tight uppercase">{{ inspection.scheduledDate | date:'mediumDate' }}</span>
                </td>
                <td class="px-10 py-8">
                  <div class="flex flex-col gap-2" *ngIf="inspection.score > 0">
                    <div class="flex items-end justify-between">
                      <span class="text-[10px] font-black" 
                            [class.text-emerald-600]="inspection.score >= 90"
                            [class.text-amber-600]="inspection.score < 90 && inspection.score >= 70"
                            [class.text-rose-600]="inspection.score < 70">{{ inspection.score }}%</span>
                    </div>
                    <div class="w-24 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                       <div class="h-full rounded-full transition-all duration-1000 group-hover:brightness-110" 
                            [class.bg-gradient-to-r]="true"
                            [class.from-emerald-400]="inspection.score >= 90"
                            [class.to-emerald-600]="inspection.score >= 90"
                            [class.from-amber-400]="inspection.score < 90 && inspection.score >= 70"
                            [class.to-amber-600]="inspection.score < 90 && inspection.score >= 70"
                            [class.from-rose-400]="inspection.score < 70"
                            [class.to-rose-600]="inspection.score < 70"
                            [style.width.%]="inspection.score"></div>
                    </div>
                  </div>
                  <span *ngIf="inspection.score === 0" class="text-slate-300 font-black">-</span>
                </td>
                <td class="px-10 py-8 text-right">
                  <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button class="p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all shadow-xl ring-1 ring-slate-100 dark:ring-white/5 hover:-translate-y-1 active:scale-90 group/btn" (click)="viewInspection(inspection)">
                      <svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button *ngIf="inspection.status === 'Scheduled'" class="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white hover:brightness-110 shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-90 transition-all" (click)="startInspection(inspection)">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Defects Tab -->
      <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden animate-premium-fade" *ngIf="activeTab === 'defects'">
        <div class="p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/50 dark:bg-white/[0.02]">
          <div class="flex flex-wrap items-center gap-6">
            <div class="relative group min-w-[320px]">
              <svg class="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" [(ngModel)]="defectSearch" [placeholder]="'quality.defect.search_placeholder' | translate"
                     class="w-full pl-14 pr-8 py-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-white/10 text-sm font-black outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all shadow-sm">
            </div>
            <div class="flex items-center gap-4">
              <select [(ngModel)]="defectStatusFilter" class="px-8 py-4 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-white/10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-rose-500 transition-all shadow-sm appearance-none cursor-pointer pr-12 relative text-rose-600 dark:text-rose-400">
                <option value="">{{ 'quality.defect.all_status' | translate }}</option>
                <option value="Open">{{ 'quality.defect.open' | translate }}</option>
                <option value="InProgress">{{ 'quality.defect.in_progress' | translate }}</option>
                <option value="Resolved">{{ 'quality.defect.resolved' | translate }}</option>
              </select>
            </div>
          </div>
          <button class="group relative px-10 py-5 rounded-[2rem] bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all overflow-hidden">
            <span class="relative z-10">+ {{ 'quality.defect.report' | translate }}</span>
            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-white/5">
                <th class="px-10 py-8">{{ 'quality.defect.number' | translate }}</th>
                <th class="px-10 py-8">{{ 'common.title' | translate }}</th>
                <th class="px-10 py-8">{{ 'quality.defect.severity' | translate }}</th>
                <th class="px-10 py-8">{{ 'common.status' | translate }}</th>
                <th class="px-10 py-8 text-right">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody class="text-slate-600 dark:text-slate-300">
              <tr *ngFor="let defect of filteredDefects; let i = index" 
                  class="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all duration-300 group animate-premium-fade"
                  [class.bg-rose-500/[0.02]]="defect.isSafetyRelated"
                  [style.animation-delay]="(i * 30 + 100) + 'ms'">
                <td class="px-10 py-8">
                  <span class="text-xs font-black text-slate-400 uppercase tracking-widest opacity-60">{{ defect.defectNumber }}</span>
                </td>
                <td class="px-10 py-8">
                  <div class="space-y-2">
                    <div class="flex items-center gap-3">
                       <span class="text-sm font-black text-slate-900 dark:text-white tracking-tight group-hover:text-rose-600 transition-colors uppercase">{{ defect.title }}</span>
                       <div *ngIf="defect.isSafetyRelated" class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500 text-[8px] text-white font-black animate-pulse shadow-lg shadow-rose-500/20">
                          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          SAFETY
                       </div>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-500/5 text-[9px] font-black text-rose-500 uppercase tracking-widest">{{ defect.category }}</span>
                  </div>
                </td>
                <td class="px-10 py-8">
                  <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ring-current" 
                        [class.bg-rose-500/10]="defect.severity === 'Critical' || defect.severity === 'Major'"
                        [class.text-rose-600]="defect.severity === 'Critical' || defect.severity === 'Major'"
                        [class.bg-amber-500/10]="defect.severity === 'Minor'"
                        [class.text-amber-600]="defect.severity === 'Minor'">
                    {{ defect.severity }}
                  </span>
                </td>
                <td class="px-10 py-8">
                  <span class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/10 shadow-sm opacity-60">
                    {{ defect.status }}
                  </span>
                </td>
                <td class="px-10 py-8 text-right">
                  <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button class="p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all shadow-xl ring-1 ring-slate-100 dark:ring-white/5 hover:-translate-y-1 active:scale-90 group/btn" (click)="viewDefect(defect)">
                      <svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button *ngIf="defect.status === 'Open'" class="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white hover:brightness-110 shadow-xl shadow-rose-500/20 hover:-translate-y-1 active:scale-90 transition-all" (click)="assignDefect(defect)">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Punch List Tab -->
      <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-12 animate-premium-fade" *ngIf="activeTab === 'punchlist'">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
          <div class="space-y-2">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ 'quality.tabs.punchlist' | translate }}</h3>
            <div class="flex items-center gap-2 opacity-60">
               <div class="w-8 h-0.5 bg-amber-500 rounded-full"></div>
               <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Final Completion Tracking</p>
            </div>
          </div>
          <div class="relative group min-w-[320px]">
            <svg class="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" [(ngModel)]="punchListSearch" [placeholder]="'quality.punchlist.search_placeholder' | translate"
                   class="w-full pl-14 pr-8 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-white/10 text-sm font-black outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-inner">
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div *ngFor="let item of filteredPunchListItems; let i = index" 
               class="relative p-10 rounded-[3rem] bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 hover:border-amber-500/40 transition-all duration-500 group animate-premium-fade shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-2 ring-1 ring-inset ring-transparent hover:ring-amber-500/20"
               [style.animation-delay]="(i * 50 + 100) + 'ms'">
            <div class="flex items-start justify-between mb-8">
              <span class="px-3 py-1 rounded-lg bg-amber-500/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ item.itemNumber }}</span>
              <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ring-current" 
                    [class.bg-amber-500/10]="item.status === 'Pending' || item.status === 'InProgress'"
                    [class.text-amber-600]="item.status === 'Pending' || item.status === 'InProgress'"
                    [class.bg-emerald-500/10]="item.status === 'Completed' || item.status === 'Verified' || item.status === 'Accepted'"
                    [class.text-emerald-600]="item.status === 'Completed' || item.status === 'Verified' || item.status === 'Accepted'">
                {{ item.status }}
              </span>
            </div>
            
            <h4 class="text-lg font-black text-slate-900 dark:text-white mb-6 tracking-tight group-hover:text-amber-600 transition-colors leading-tight">{{ item.description }}</h4>
            
            <div class="grid grid-cols-2 gap-4 mb-8">
               <div class="space-y-1 opacity-60">
                 <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                 <div class="flex items-center gap-2">
                   <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   <span class="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{{ item.location }}</span>
                 </div>
               </div>
               <div class="space-y-1 opacity-60">
                 <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                 <div class="flex items-center gap-2">
                   <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                   <span class="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{{ item.category }}</span>
                 </div>
               </div>
            </div>

            <div class="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mb-8 group-hover:bg-amber-500/5 transition-colors">
              <span class="px-3 py-1.5 rounded-lg bg-rose-500 text-[8px] font-black text-white uppercase tracking-widest shadow-lg shadow-rose-500/20">{{ item.priority }}</span>
              <div class="text-right">
                <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Deadline</p>
                <p class="text-[10px] font-black tracking-tight uppercase" [class.text-rose-600]="isOverdue(item)" [class.text-slate-600]="!isOverdue(item)">
                  {{ item.dueDate | date:'mediumDate' }}
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <button class="flex-1 py-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all" *ngIf="item.status === 'Pending'" (click)="startPunchItem(item)">Start Mission</button>
              <button class="flex-1 py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all" *ngIf="item.status === 'InProgress'" (click)="completePunchItem(item)">Mark Complete</button>
              <button class="flex-1 py-4 rounded-2xl bg-white dark:bg-slate-700 text-slate-600 dark:text-white font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-white/10 active:scale-95 transition-all shadow-lg" *ngIf="item.status === 'Completed'" (click)="verifyPunchItem(item)">Verify</button>
            </div>

            <div class="absolute -bottom-2 -right-2 w-20 h-20 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>
          </div>
        </div>
      </div>

      <!-- Standards Tab -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 animate-premium-fade" *ngIf="activeTab === 'standards'">
        <div class="group relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-12 hover:shadow-violet-500/20 transition-all duration-700 hover:-translate-y-2 ring-1 ring-inset ring-transparent hover:ring-violet-500/20 overflow-hidden">
          <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl shadow-violet-500/30">
             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h4 class="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter leading-none">Structural</h4>
          <ul class="space-y-6">
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-violet-500 mt-2 shadow-lg shadow-violet-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Concrete strength verification</span>
            </li>
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-violet-500 mt-2 shadow-lg shadow-violet-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Steel reinforcement placement</span>
            </li>
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-violet-500 mt-2 shadow-lg shadow-violet-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Foundation alignment</span>
            </li>
          </ul>
          <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div class="group relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-12 hover:shadow-amber-500/20 transition-all duration-700 hover:-translate-y-2 ring-1 ring-inset ring-transparent hover:ring-amber-500/20 overflow-hidden">
          <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-xl shadow-amber-500/30">
             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h4 class="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter leading-none">Electrical</h4>
          <ul class="space-y-6">
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-amber-500 mt-2 shadow-lg shadow-amber-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Wiring gauge compliance</span>
            </li>
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-amber-500 mt-2 shadow-lg shadow-amber-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Connection torque verification</span>
            </li>
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-amber-500 mt-2 shadow-lg shadow-amber-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Ground resistance testing</span>
            </li>
          </ul>
          <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
        </div>

        <div class="group relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-12 hover:shadow-indigo-500/20 transition-all duration-700 hover:-translate-y-2 ring-1 ring-inset ring-transparent hover:ring-indigo-500/20 overflow-hidden">
          <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl shadow-indigo-500/30">
             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
          <h4 class="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter leading-none">Plumbing</h4>
          <ul class="space-y-6">
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-indigo-500 mt-2 shadow-lg shadow-indigo-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Pressure testing</span>
            </li>
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-indigo-500 mt-2 shadow-lg shadow-indigo-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Pipe slope verification</span>
            </li>
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-indigo-500 mt-2 shadow-lg shadow-indigo-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Joint integrity inspection</span>
            </li>
          </ul>
          <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div class="group relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-12 hover:shadow-emerald-500/20 transition-all duration-700 hover:-translate-y-2 ring-1 ring-inset ring-transparent hover:ring-emerald-500/20 overflow-hidden">
          <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-xl shadow-emerald-500/30">
             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          </div>
          <h4 class="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter leading-none">Finishing</h4>
          <ul class="space-y-6">
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-emerald-500 mt-2 shadow-lg shadow-emerald-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Surface flatness tolerance</span>
            </li>
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-emerald-500 mt-2 shadow-lg shadow-emerald-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Paint adhesion testing</span>
            </li>
            <li class="flex items-start gap-4 group/item">
              <div class="w-2 h-2 rounded-full bg-emerald-500 mt-2 shadow-lg shadow-emerald-500/50 group-hover/item:scale-150 transition-transform"></div>
              <span class="text-sm font-black text-slate-500 dark:text-slate-400 leading-tight tracking-tight uppercase opacity-80 group-hover/item:opacity-100 transition-opacity">Tile lippage limits</span>
            </li>
          </ul>
          <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <!-- Modals would go here -->
    </div>
  `,
  styles: [``]
})
export class QualityComponent implements OnInit {
  activeTab = 'inspections';
  statistics: QualityStatistics | null = null;

  inspections: QualityInspection[] = [];
  defects: Defect[] = [];
  punchListItems: PunchListItem[] = [];

  // Filters
  inspectionSearch = '';
  inspectionStatusFilter = '';
  inspectionTypeFilter = '';

  defectSearch = '';
  defectStatusFilter = '';
  defectSeverityFilter = '';

  punchListSearch = '';
  punchListStatusFilter = '';

  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  constructor(private qualityService: QualityService) {
    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.qualityService.getStatistics().subscribe(stats => this.statistics = stats);
    this.qualityService.getInspections().subscribe(inspections => this.inspections = inspections);
    this.qualityService.getDefects().subscribe(defects => this.defects = defects);
    this.qualityService.getPunchListItems().subscribe(items => this.punchListItems = items);
  }

  get filteredInspections(): QualityInspection[] {
    return this.inspections.filter(i => {
      const matchesSearch = !this.inspectionSearch ||
        i.title.toLowerCase().includes(this.inspectionSearch.toLowerCase()) ||
        i.inspectionNumber.toLowerCase().includes(this.inspectionSearch.toLowerCase());
      const matchesStatus = !this.inspectionStatusFilter || i.status === this.inspectionStatusFilter;
      const matchesType = !this.inspectionTypeFilter || i.inspectionType === this.inspectionTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  get filteredDefects(): Defect[] {
    return this.defects.filter(d => {
      const matchesSearch = !this.defectSearch ||
        d.title.toLowerCase().includes(this.defectSearch.toLowerCase()) ||
        d.defectNumber.toLowerCase().includes(this.defectSearch.toLowerCase());
      const matchesStatus = !this.defectStatusFilter || d.status === this.defectStatusFilter;
      const matchesSeverity = !this.defectSeverityFilter || d.severity === this.defectSeverityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }

  get filteredPunchListItems(): PunchListItem[] {
    return this.punchListItems.filter(p => {
      const matchesSearch = !this.punchListSearch ||
        p.description.toLowerCase().includes(this.punchListSearch.toLowerCase()) ||
        p.itemNumber.toLowerCase().includes(this.punchListSearch.toLowerCase());
      const matchesStatus = !this.punchListStatusFilter || p.status === this.punchListStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getDefectStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getPunchListStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  isOverdue(item: PunchListItem): boolean {
    return item.dueDate ? new Date(item.dueDate) < new Date() : false;
  }

  viewInspection(inspection: QualityInspection): void {
    console.log('View inspection:', inspection);
  }

  startInspection(inspection: QualityInspection): void {
    console.log('Start inspection:', inspection);
  }

  viewDefect(defect: Defect): void {
    console.log('View defect:', defect);
  }

  assignDefect(defect: Defect): void {
    console.log('Assign defect:', defect);
  }

  startPunchItem(item: PunchListItem): void {
    console.log('Start punch item:', item);
  }

  completePunchItem(item: PunchListItem): void {
    console.log('Complete punch item:', item);
  }

  verifyPunchItem(item: PunchListItem): void {
    console.log('Verify punch item:', item);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
