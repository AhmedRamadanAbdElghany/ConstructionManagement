import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LocationTrackingService, WorkersZoneSummaryDto, WorkerZoneStatusDto } from '../../../../core/services/location-tracking.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
   selector: 'app-worker-zone-status',
   standalone: true,
   imports: [CommonModule, TranslateModule, FormsModule, RouterModule, LoadingSpinnerComponent],
   template: `
    <div class="p-6 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Worker Zone Status</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Real-time overview of workers within geofenced areas</p>
          </div>
          <div class="flex items-center gap-3">
             <button (click)="loadStatus()" [disabled]="isLoading" class="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                <svg class="w-4 h-4 inline-block mr-1.5 align-text-bottom" [class.animate-spin]="isLoading" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
             </button>
             <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                Last updated<br>
                <span class="text-slate-600 dark:text-slate-300">{{ (summary?.lastUpdated | date:'mediumTime') || 'Never' }}</span>
             </div>
          </div>
        </div>

        @if (isLoading && !summary) {
          <app-loading-spinner [centered]="true"></app-loading-spinner>
        } @else if (summary) {
           <!-- Summary Cards -->
           <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between group">
                 <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
                    <svg class="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                 </div>
                 <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Workers</p>
                    <p class="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{{ summary.totalWorkers }}</p>
                 </div>
              </div>
              
              <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-6 rounded-[2rem] border border-emerald-200 dark:border-emerald-500/10 shadow-xl shadow-emerald-500/10 dark:shadow-none flex flex-col justify-between group">
                 <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/10 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
                    <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-1">Inside Zone</p>
                    <p class="text-3xl font-black text-emerald-700 dark:text-emerald-400 leading-none tracking-tight">{{ summary.workersInsideZone }} <span class="text-sm font-bold opacity-50 ml-1 tracking-normal items-center">/ {{ summary.totalWorkers }}</span></p>
                 </div>
              </div>
              
              <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 p-6 rounded-[2rem] border border-amber-200 dark:border-amber-500/10 shadow-xl shadow-amber-500/10 dark:shadow-none flex flex-col justify-between group">
                 <div class="w-12 h-12 rounded-2xl bg-amber-500/20 dark:bg-amber-500/10 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
                    <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                 </div>
                 <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70 mb-1">Outside Zone</p>
                    <p class="text-3xl font-black text-amber-700 dark:text-amber-400 leading-none tracking-tight">{{ summary.workersOutsideZone }}</p>
                 </div>
              </div>
              
              <div class="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 p-6 rounded-[2rem] border border-rose-200 dark:border-rose-500/10 shadow-xl shadow-rose-500/10 dark:shadow-none flex flex-col justify-between group">
                 <div class="w-12 h-12 rounded-2xl bg-rose-500/20 dark:bg-rose-500/10 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
                    <svg class="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-rose-600/70 dark:text-rose-400/70 mb-1">Overdue Exits</p>
                    <p class="text-3xl font-black text-rose-700 dark:text-rose-400 leading-none tracking-tight">{{ summary.workersOverdue }}</p>
                 </div>
              </div>
           </div>

           <!-- Filters -->
           <div class="flex gap-2">
              <button (click)="filterStatus = 'all'" [class.bg-slate-900]="filterStatus === 'all'" [class.text-white]="filterStatus === 'all'" [class.bg-white]="filterStatus !== 'all'" [class.text-slate-600]="filterStatus !== 'all'" class="px-5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm dark:bg-slate-800 dark:text-slate-300">All Workers</button>
              <button (click)="filterStatus = 'inside'" [class.bg-emerald-500]="filterStatus === 'inside'" [class.text-white]="filterStatus === 'inside'" [class.bg-white]="filterStatus !== 'inside'" [class.text-slate-600]="filterStatus !== 'inside'" class="px-5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm dark:bg-slate-800 dark:text-slate-300">Inside Zone</button>
              <button (click)="filterStatus = 'outside'" [class.bg-amber-500]="filterStatus === 'outside'" [class.text-white]="filterStatus === 'outside'" [class.bg-white]="filterStatus !== 'outside'" [class.text-slate-600]="filterStatus !== 'outside'" class="px-5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm dark:bg-slate-800 dark:text-slate-300">Outside Zone</button>
              <button (click)="filterStatus = 'overdue'" [class.bg-rose-500]="filterStatus === 'overdue'" [class.text-white]="filterStatus === 'overdue'" [class.bg-white]="filterStatus !== 'overdue'" [class.text-slate-600]="filterStatus !== 'overdue'" class="px-5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm dark:bg-slate-800 dark:text-slate-300">Overdue</button>
           </div>

           <!-- Worker Status Grid -->
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (worker of filteredWorkers; track worker.userId) {
                 <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-all group"
                      [ngClass]="{
                         'border-emerald-200 dark:border-emerald-500/20': worker.isInsideZone && !worker.isOverdue,
                         'border-slate-200 dark:border-white/5': !worker.isInsideZone && !worker.isOverdue,
                         'border-rose-300 dark:border-rose-500/30': worker.isOverdue
                      }">
                    
                    <div class="flex items-start justify-between mb-6">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-inner"
                               [ngClass]="{
                                  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400': worker.isInsideZone && !worker.isOverdue,
                                  'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400': !worker.isInsideZone && !worker.isOverdue,
                                  'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400': worker.isOverdue
                               }">
                             {{ worker.userName.charAt(0) }}
                          </div>
                          <div>
                             <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[140px]" [title]="worker.userName">{{ worker.userName }}</h3>
                             <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                               @if (worker.isInsideZone) {
                                 <span class="text-emerald-600 dark:text-emerald-400 flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> INSIDE</span>
                               } @else if (worker.isOverdue) {
                                 <span class="text-rose-500 flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span> OVERDUE</span>
                               } @else {
                                 <span class="text-amber-500 flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> OUTSIDE</span>
                               }
                             </p>
                          </div>
                       </div>
                       <button class="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-500 transition-colors tooltip-wrapper" title="View History">
                           <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       </button>
                    </div>

                    <div class="space-y-4">
                       @if (worker.currentZoneId) {
                         <div>
                            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current / Last Zone</p>
                            <div class="flex items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                               <svg class="w-4 h-4 text-cyan-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                               </svg>
                               {{ worker.currentZoneName }}
                            </div>
                         </div>
                       }
                       
                       <div class="grid grid-cols-2 gap-4">
                          <div>
                             <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Update</p>
                             <p class="text-sm font-medium text-slate-900 dark:text-white">{{ worker.lastLocationTime ? (worker.lastLocationTime | date:'shortTime') : 'Never' }}</p>
                          </div>
                          @if (!worker.isInsideZone && worker.minutesOutside) {
                          <div>
                             <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1" [class.text-rose-400]="worker.isOverdue">Time Outside</p>
                             <p class="text-sm font-medium text-slate-900 dark:text-white" [class.text-rose-600]="worker.isOverdue">{{ worker.minutesOutside }} mins</p>
                          </div>
                          }
                       </div>

                       <!-- Assigned Zones List Mini -->
                       @if (worker.assignedZones && worker.assignedZones.length > 0) {
                         <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Assigned Zones</p>
                            <div class="flex flex-wrap gap-1.5">
                               @for (zone of worker.assignedZones; track zone.zoneId) {
                                  <span class="px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border"
                                        [ngClass]="zone.isCurrentlyInside ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'">
                                     {{ zone.zoneName }}
                                  </span>
                               }
                            </div>
                         </div>
                       }
                    </div>
                 </div>
              } @empty {
                 <div class="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                    <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">No Workers Found</h3>
                    <p class="text-xs text-slate-500">No workers match the selected filter criteria.</p>
                 </div>
              }
           </div>
        }
      </div>
    </div>
  `
})
export class WorkerZoneStatus implements OnInit, OnDestroy {
   private geofenceService = inject(LocationTrackingService);

   summary: WorkersZoneSummaryDto | null = null;
   isLoading = true;
   filterStatus: 'all' | 'inside' | 'outside' | 'overdue' = 'all';
   private refreshInterval: any;

   ngOnInit() {
      this.loadStatus();
      // Auto refresh every 30 seconds
      this.refreshInterval = setInterval(() => {
         this.loadStatus(true);
      }, 30000);
   }

   ngOnDestroy() {
      if (this.refreshInterval) {
         clearInterval(this.refreshInterval);
      }
   }

   loadStatus(silent = false) {
      if (!silent) this.isLoading = true;
      this.geofenceService.getWorkersZoneStatus().subscribe({
         next: (data: WorkersZoneSummaryDto) => {
            this.summary = data;
            this.isLoading = false;
         },
         error: (err: any) => {
            console.error('Failed to load status', err);
            this.isLoading = false;
         }
      });
   }

   get filteredWorkers(): WorkerZoneStatusDto[] {
      if (!this.summary?.workers) return [];

      switch (this.filterStatus) {
         case 'inside':
            return this.summary.workers.filter((w: WorkerZoneStatusDto) => w.isInsideZone);
         case 'outside':
            return this.summary.workers.filter((w: WorkerZoneStatusDto) => !w.isInsideZone);
         case 'overdue':
            return this.summary.workers.filter((w: WorkerZoneStatusDto) => w.isOverdue);
         case 'all':
         default:
            return this.summary.workers;
      }
   }
}
