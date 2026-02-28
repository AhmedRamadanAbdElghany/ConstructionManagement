import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LocationTrackingService, CompanyLocationSettingsDto, UpdateLocationSettingsRequest, TodayLocationSummaryDto, WorkerLocationStatusDto, TrackingMode, LocationType, LocationRequestStatus } from '../../../core/services/location-tracking.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-location-tracking',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-500 pb-32">
      <div class="max-w-7xl mx-auto animate-premium-fade">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div class="header-left">
            <h1 class="premium-heading mb-4">{{ 'LOCATION_TRACKING.TITLE' | translate }}</h1>
            <p class="premium-subheading mb-0">{{ 'LOCATION_TRACKING.SUBTITLE' | translate }}</p>
          </div>
          <div class="flex gap-4">
             <button class="premium-button-ghost bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5" (click)="refreshSummary()">
              <span class="mr-2">↺</span> {{ 'COMMON.REFRESH' | translate }}
            </button>
            <button class="premium-button-primary" (click)="saveSettings()" [disabled]="saving">
              @if (saving) {
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              }
              {{ 'COMMON.SAVE' | translate }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Main Settings -->
          <div class="lg:col-span-2 space-y-12">
            <!-- Global Toggle -->
            <section class="animate-premium-fade delay-100">
              <div class="premium-card-stack group hover:border-indigo-500/30 transition-all border-2 border-transparent">
                <div class="flex items-center justify-between p-4">
                  <div class="flex items-center gap-6">
                    <div class="w-16 h-16 rounded-[2rem] bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                      📍
                    </div>
                    <div>
                      <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ 'LOCATION_TRACKING.ENABLE_TRACKING' | translate }}</h2>
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Master Control for Worker Location Services</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="settings.isLocationTrackingEnabled" class="sr-only peer">
                    <div class="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-500 shadow-inner"></div>
                  </label>
                </div>
              </div>
            </section>

            <!-- Operational hours & Modes -->
            <section class="animate-premium-fade delay-200">
               <div class="flex items-center gap-4 mb-8">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-lg font-black shadow-inner">⏰</div>
                <h2 class="premium-section-title mb-0">{{ 'LOCATION_TRACKING.WORKING_HOURS' | translate }}</h2>
              </div>
              
              <div class="premium-card-stack">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div class="space-y-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'LOCATION_TRACKING.WORKING_HOURS_START' | translate }}</label>
                    <input type="time" [(ngModel)]="settings.workingHoursStart" class="premium-input">
                  </div>
                  <div class="space-y-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'LOCATION_TRACKING.WORKING_HOURS_END' | translate }}</label>
                    <input type="time" [(ngModel)]="settings.workingHoursEnd" class="premium-input">
                  </div>
                </div>

                <div class="mt-12 p-8 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                   <div class="flex items-center justify-between mb-8">
                     <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'LOCATION_TRACKING.TRACKING_MODE' | translate }}</h3>
                     <span class="premium-badge">{{ settings.trackingMode === 0 ? 'START/END' : 'RANDOM' }} Mode</span>
                   </div>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div (click)="settings.trackingMode = 0" 
                          [class]="settings.trackingMode === 0 ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-white/5'"
                          class="p-6 rounded-3xl border-2 cursor-pointer transition-all hover:scale-[1.02] group">
                        <div class="flex items-center gap-4 mb-4">
                           <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🏁</div>
                           <p class="text-xs font-black uppercase tracking-widest">{{ 'LOCATION_TRACKING.MODE_START_END' | translate }}</p>
                        </div>
                        <p class="text-[10px] text-slate-400 font-medium leading-relaxed">Workers submit location ONLY when starting and ending their shifts.</p>
                     </div>
                     <div (click)="settings.trackingMode = 1" 
                          [class]="settings.trackingMode === 1 ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-white/5'"
                          class="p-6 rounded-3xl border-2 cursor-pointer transition-all hover:scale-[1.02] group">
                        <div class="flex items-center gap-4 mb-4">
                           <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🎲</div>
                           <p class="text-xs font-black uppercase tracking-widest">{{ 'LOCATION_TRACKING.MODE_RANDOM' | translate }}</p>
                        </div>
                        <p class="text-[10px] text-slate-400 font-medium leading-relaxed">System requests periodic location checks throughout the day at random intervals.</p>
                     </div>
                   </div>

                   @if (settings.trackingMode === 1) {
                     <div class="mt-8 space-y-4 animate-premium-fade">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'LOCATION_TRACKING.RANDOM_CHECKS_COUNT' | translate }}</label>
                        <input type="number" [(ngModel)]="settings.randomCheckCount" min="1" max="10" class="premium-input" placeholder="3">
                     </div>
                   }
                </div>
              </div>
            </section>

            <!-- Working Days -->
            <section class="animate-premium-fade delay-300">
               <div class="flex items-center gap-4 mb-8">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg font-black shadow-inner">📅</div>
                <h2 class="premium-section-title mb-0">{{ 'LOCATION_TRACKING.WORKING_DAYS' | translate }}</h2>
              </div>
              <div class="premium-card-stack">
                <div class="flex flex-wrap gap-3">
                  @for (day of daysOfWeek; let i = $index; track day) {
                    <button (click)="toggleWorkingDay(i + 1)"
                            [class]="settings.workingDays.includes(i + 1) ? 'bg-indigo-600 text-white border-transparent shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/5'"
                            class="px-6 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                      {{ day }}
                    </button>
                  }
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar: Summary -->
          <div class="space-y-8">
            <div class="premium-card-stack h-full relative overflow-hidden">
               <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
               <div class="flex items-center justify-between mb-8 relative z-10">
                 <h3 class="premium-section-title mb-0">{{ 'LOCATION_TRACKING.TODAY_SUMMARY' | translate }}</h3>
                 <button (click)="refreshSummary()" class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors">↺</button>
               </div>

               <div class="grid grid-cols-2 gap-4 mb-10 relative z-10">
                 <div class="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 transition-all hover:scale-105">
                    <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{{ 'LOCATION_TRACKING.TOTAL_WORKERS' | translate }}</p>
                    <p class="text-3xl font-black text-blue-600 tracking-tighter">{{ summary?.totalWorkers || 0 }}</p>
                 </div>
                 <div class="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 transition-all hover:scale-105">
                    <p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Active Now</p>
                    <p class="text-3xl font-black text-emerald-600 tracking-tighter">{{ summary?.workersWithStartLocation || 0 }}</p>
                 </div>
               </div>

                <div class="space-y-4 relative z-10">
                  @for (worker of summary?.workers || []; track worker.userId; let i = $index) {
                    <div class="flex flex-col p-6 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 group hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 animate-premium-fade" [style.animation-delay]="(i * 100) + 'ms'">
                       <div class="flex items-center justify-between mb-6">
                         <div class="flex items-center gap-4">
                           <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                             {{ worker.userName.charAt(0) }}
                           </div>
                           <div>
                              <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{{ worker.userName }}</p>
                              <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Field Personnel</span>
                           </div>
                         </div>
                         <div class="flex gap-2">
                            <button (click)="requestLocation(worker.userId)" 
                                    class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all group/btn"
                                    title="Request Live Location">
                              <span class="group-hover/btn:scale-110 transition-transform">📡</span>
                            </button>
                         </div>
                       </div>

                       <div class="grid grid-cols-2 gap-4">
                          <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                             <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Shift Status</p>
                             <div class="flex items-center gap-2">
                               <div [class]="worker.hasSubmittedStartLocation ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300 dark:bg-slate-700'" class="w-2 h-2 rounded-full"></div>
                               <span class="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase">{{ worker.hasSubmittedStartLocation ? 'Started' : 'Pending' }}</span>
                               <div [class]="worker.hasSubmittedEndLocation ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-slate-300 dark:bg-slate-700'" class="w-2 h-2 rounded-full ml-2"></div>
                               <span class="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase">{{ worker.hasSubmittedEndLocation ? 'Ended' : '' }}</span>
                             </div>
                          </div>
                          <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                             <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Random Checks</p>
                             <div class="flex items-center justify-between">
                               <span class="text-xs font-black text-slate-900 dark:text-white">{{ worker.randomChecksCompleted }}/{{ worker.randomChecksExpected }}</span>
                               <div class="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-2 overflow-hidden">
                                  <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" [style.width.%]="(worker.randomChecksCompleted / (worker.randomChecksExpected || 1)) * 100"></div>
                               </div>
                             </div>
                          </div>
                       </div>

                       @if (worker.lastLocationTime) {
                         <div class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Check-in</span>
                            <span class="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase">{{ worker.lastLocationTime | date:'shortTime' }}</span>
                         </div>
                       }
                    </div>
                  } @empty {
                    <div class="py-12 text-center opacity-40">
                       <p class="text-[10px] font-black uppercase tracking-widest">No active workers today</p>
                    </div>
                  }
                </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Modal -->
      @if (showRequestModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-premium-fade">
           <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative overflow-hidden">
              <div class="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
              
              <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">{{ 'LOCATION_TRACKING.REQUEST_LOCATION_TITLE' | translate }}</h2>
              
              <div class="space-y-8 mb-10">
                <div class="space-y-3">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'LOCATION_TRACKING.EXPIRES_IN' | translate }} (Min)</label>
                  <input type="number" [(ngModel)]="requestExpiresIn" min="5" max="120" class="premium-input">
                </div>
                <div class="space-y-3">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'LOCATION_TRACKING.NOTES' | translate }}</label>
                  <textarea [(ngModel)]="requestNotes" rows="3" class="premium-input resize-none" placeholder="Enter reason for location verification..."></textarea>
                </div>
              </div>

              <div class="flex gap-4">
                <button (click)="closeRequestModal()" class="flex-1 py-4 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  {{ 'COMMON.CANCEL' | translate }}
                </button>
                <button (click)="sendLocationRequest()" [disabled]="sendingRequest" 
                        class="flex-[2] py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50 transition-all">
                  {{ 'LOCATION_TRACKING.SEND_REQUEST' | translate }}
                </button>
              </div>
           </div>
        </div>
      }
    </div>
    `,
    styles: []
})
export class LocationTrackingComponent implements OnInit {
    private locationService = inject(LocationTrackingService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    settings: CompanyLocationSettingsDto = {
        id: 0,
        isLocationTrackingEnabled: false,
        trackingMode: TrackingMode.StartEnd,
        workingHoursStart: '08:00',
        workingHoursEnd: '17:00',
        randomCheckCount: 3,
        workingDays: [1, 2, 3, 4, 5],
        requirePhoto: false,
        requestExpirationMinutes: 30,
        sendReminders: true,
        reminderDelayMinutes: 10
    };

    summary: TodayLocationSummaryDto | null = null;
    saving = false;
    showRequestModal = false;
    selectedWorkerId: number | null = null;
    requestExpiresIn = 30;
    requestNotes = '';
    sendingRequest = false;

    daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    ngOnInit(): void {
        this.loadSettings();
        this.loadSummary();
    }

    loadSettings(): void {
        this.locationService.getSettings().subscribe({
            next: (settings) => {
                this.settings = settings;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load settings:', err)
        });
    }

    loadSummary(): void {
        this.locationService.getTodaySummary().subscribe({
            next: (summary) => {
                this.summary = summary;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load summary:', err)
        });
    }

    refreshSummary(): void {
        this.loadSummary();
    }

    toggleWorkingDay(day: number): void {
        const index = this.settings.workingDays.indexOf(day);
        if (index > -1) {
            this.settings.workingDays.splice(index, 1);
        } else {
            this.settings.workingDays.push(day);
        }
    }

    saveSettings(): void {
        this.saving = true;
        const request: UpdateLocationSettingsRequest = {
            isLocationTrackingEnabled: this.settings.isLocationTrackingEnabled,
            trackingMode: this.settings.trackingMode,
            workingHoursStart: this.settings.workingHoursStart,
            workingHoursEnd: this.settings.workingHoursEnd,
            randomCheckCount: this.settings.randomCheckCount,
            workingDays: this.settings.workingDays,
            requirePhoto: this.settings.requirePhoto,
            requestExpirationMinutes: this.settings.requestExpirationMinutes,
            sendReminders: this.settings.sendReminders,
            reminderDelayMinutes: this.settings.reminderDelayMinutes
        };

        this.locationService.updateSettings(request).subscribe({
            next: (updated) => {
                this.settings = updated;
                this.saving = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to save settings:', err);
                this.saving = false;
            }
        });
    }

    requestLocation(userId: number): void {
        this.selectedWorkerId = userId;
        this.showRequestModal = true;
    }

    closeRequestModal(): void {
        this.showRequestModal = false;
        this.selectedWorkerId = null;
        this.requestNotes = '';
    }

    sendLocationRequest(): void {
        if (!this.selectedWorkerId) return;

        this.sendingRequest = true;
        this.locationService.createLocationRequest({
            userIds: [this.selectedWorkerId],
            expiresInMinutes: this.requestExpiresIn,
            notes: this.requestNotes
        }).subscribe({
            next: () => {
                this.sendingRequest = false;
                this.closeRequestModal();
                this.refreshSummary();
            },
            error: (err) => {
                console.error('Failed to send request:', err);
                this.sendingRequest = false;
            }
        });
    }
}
