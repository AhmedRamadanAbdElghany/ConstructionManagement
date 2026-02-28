import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LocationTrackingService, GeofenceEventDto, GeofenceEventHistoryDto, ZoneType, GeofenceEventType } from '../../../../core/services/location-tracking.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-geofence-events',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="p-6 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Geofence Events</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Real-time alerts and activity logs for all tracking zones</p>
          </div>
          <div class="flex gap-2">
            <button class="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-700 dark:text-slate-300">
              <svg class="w-4 h-4 inline-block mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export log
            </button>
            <button (click)="loadEvents()" class="p-2.5 bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 hover:bg-cyan-600 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Search Worker</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input type="text" class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-900 dark:text-white" placeholder="Search by name">
            </div>
          </div>
          
          <div class="flex-1 min-w-[150px]">
             <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">From Date</label>
             <input type="date" [(ngModel)]="fromDate" class="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-900 dark:text-white">
          </div>
          <div class="flex-1 min-w-[150px]">
             <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">To Date</label>
             <input type="date" [(ngModel)]="toDate" class="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-900 dark:text-white">
          </div>
          
          <button (click)="applyFilters()" class="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            Apply
          </button>
        </div>

        <!-- Activity Feed -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
          
          @if (isLoading) {
             <app-loading-spinner [centered]="true"></app-loading-spinner>
          } @else if (!history || history.events.length === 0) {
             <div class="py-16 text-center">
                 <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                     </svg>
                 </div>
                 <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">No Events Found</h3>
                 <p class="text-xs text-slate-500">Try adjusting your filters or date range.</p>
             </div>
          } @else {
             <div class="relative border-l border-slate-200 dark:border-slate-800 ml-4 lg:ml-8 space-y-12">
               @for (event of history.events; track event.id) {
               <div class="relative pl-8 sm:pl-10 pb-6 group">
                  <!-- Timeline indicator line -->
                  <div class="absolute -left-px top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-800 group-last:hidden"></div>
                  
                  <!-- Timeline Dot -->
                  <div class="absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-900"
                       [class.bg-emerald-500]="event.eventType === 0"
                       [class.bg-amber-500]="event.eventType === 1"
                       [class.bg-rose-500]="event.eventType === 2">
                  </div>
                  
                  <div class="flex flex-col sm:flex-row gap-4 justify-between sm:items-start group-hover:-translate-y-0.5 transition-transform duration-300">
                    <div class="grid grid-cols-[auto_1fr] gap-4">
                      <!-- Avatar -->
                      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-black shrink-0 ring-1 ring-cyan-500/30">
                          {{ event.userName.charAt(0) }}
                      </div>
                      
                      <!-- Info -->
                      <div>
                          <p class="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                            <span class="font-black text-slate-900 dark:text-white">{{ event.userName }}</span>
                            @if (event.eventType === 0) {
                              entered 
                            } @else if (event.eventType === 1) {
                              exited 
                            } @else {
                              <span class="text-rose-500 font-bold">exceeded exit duration</span> at
                            } 
                            zone 
                            <span class="font-black text-slate-900 dark:text-white hover:text-cyan-500 cursor-pointer transition-colors">{{ event.zoneName }}</span>
                          </p>
                          <div class="flex flex-wrap items-center mt-2.5 gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <span class="flex items-center">
                                 <svg class="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                 </svg>
                                 {{ event.eventTime | date:'medium' }}
                              </span>
                              @if (event.durationMinutes) {
                                <span class="flex items-center text-amber-600 dark:text-amber-500">
                                   <svg class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                   </svg>
                                   Duration: {{ event.durationMinutes }}m
                                </span>
                              }
                          </div>
                          @if (event.notes) {
                            <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-700/50">
                                {{ event.notes }}
                            </div>
                          }
                      </div>
                    </div>

                    <!-- Badge -->
                    <div class="shrink-0 flex items-center pl-[64px] sm:pl-0">
                      <span class="inline-flex items-center px-2.5 py-1 text-[10px] uppercase font-black tracking-widest rounded-lg border shadow-sm"
                            [ngClass]="{
                              'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20': event.eventType === 0,
                              'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20': event.eventType === 1,
                              'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20': event.eventType === 2
                            }">
                         <svg *ngIf="event.eventType === 0" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                         <svg *ngIf="event.eventType === 1" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                         <svg *ngIf="event.eventType === 2" class="w-3 h-3 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                         {{ event.eventType === 0 ? 'Entered' : event.eventType === 1 ? 'Exited' : 'Exceeded Exit Limit' }}
                      </span>
                    </div>
                  </div>
               </div>
               }
             </div>
             
             <!-- Pagination -->
             @if (history.totalCount > history.pageSize) {
               <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                 <p class="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                   Showing {{ ((page - 1) * pageSize) + 1 }} to {{ Math.min(page * pageSize, history.totalCount) }} of {{ history.totalCount }}
                 </p>
                 <div class="flex gap-2 w-full sm:w-auto">
                   <button [disabled]="page === 1" (click)="prevPage()" class="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors">Previous</button>
                   <button [disabled]="page * pageSize >= history.totalCount" (click)="nextPage()" class="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors">Next</button>
                 </div>
               </div>
             }
          }
        </div>
      </div>
    </div>
  `
})
export class GeofenceEvents implements OnInit {
  private geofenceService = inject(LocationTrackingService);

  history: GeofenceEventHistoryDto | null = null;
  isLoading = true;

  // Filters
  zoneId?: number;
  userId?: number;
  fromDate?: string;
  toDate?: string;
  page = 1;
  pageSize = 50;

  Math = Math;

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    this.geofenceService.getGeofenceEvents(this.zoneId, this.userId, undefined, undefined, this.page, this.pageSize).subscribe({
      next: (data: GeofenceEventHistoryDto) => {
        this.history = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load events', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.page = 1;
    this.loadEvents();
  }

  nextPage() {
    this.page++;
    this.loadEvents();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadEvents();
    }
  }
}
