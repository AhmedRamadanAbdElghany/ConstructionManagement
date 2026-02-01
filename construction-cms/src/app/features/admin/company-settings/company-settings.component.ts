import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../core/services/settings.service';
import { CompanySettings } from '../../../shared/interfaces';

@Component({
    selector: 'app-company-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'settings.company_title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'settings.company_subtitle' | translate }}</p>
          </div>
          <button 
            (click)="saveSettings()"
            [disabled]="loading"
            class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center disabled:opacity-50">
            @if (loading) {
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            }
            {{ 'common.save' | translate }}
          </button>
        </div>

        @if (settings) {
          <div class="space-y-8">
            
            <!-- Delay Notifications -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
               <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl"></div>
               <div class="flex items-center space-x-4 mb-8">
                  <div class="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                     </svg>
                  </div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'settings.delay_notifications' | translate }}</h2>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                     <span class="text-sm font-black text-slate-700 dark:text-slate-300">{{ 'settings.enable_delay' | translate }}</span>
                     <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="settings.enableDelayNotification" class="sr-only peer">
                        <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                     </label>
                  </div>

                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                     <span class="text-sm font-black text-slate-700 dark:text-slate-300">{{ 'settings.one_time_only' | translate }}</span>
                     <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="settings.delayNotificationIsOneTimeOnly" class="sr-only peer">
                        <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                     </label>
                  </div>

                  <div class="space-y-2">
                     <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'settings.notification_interval' | translate }}</label>
                     <input type="number" [(ngModel)]="settings.delayNotificationIntervalDays" 
                            class="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/50 outline-none transition-all shadow-sm">
                  </div>

                  <div class="space-y-2">
                     <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'settings.grace_period' | translate }}</label>
                     <input type="number" [(ngModel)]="settings.delayGracePeriodDays" 
                            class="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/50 outline-none transition-all shadow-sm">
                  </div>
               </div>
            </div>

            <!-- Media & Photos -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
               <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
               <div class="flex items-center space-x-4 mb-8">
                  <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                     </svg>
                  </div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'settings.media_photos' | translate }}</h2>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                     <span class="text-sm font-black text-slate-700 dark:text-slate-300">{{ 'settings.enable_photos' | translate }}</span>
                     <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="settings.enablePhotoUpload" class="sr-only peer">
                        <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500"></div>
                     </label>
                  </div>

                  <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                     <span class="text-sm font-black text-slate-700 dark:text-slate-300">{{ 'settings.require_review' | translate }}</span>
                     <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="settings.requirePhotoReview" class="sr-only peer">
                        <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500"></div>
                     </label>
                  </div>

                  <div class="space-y-2">
                     <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'settings.approver_role' | translate }}</label>
                     <select [(ngModel)]="settings.photoApproverRole" 
                            class="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm outline-none transition-all appearance-none cursor-pointer shadow-sm">
                        <option value="SuperAdmin">Super Admin</option>
                        <option value="CompanyAdmin">Company Admin</option>
                        <option value="SiteManager">Site Manager</option>
                        <option value="MediaReviewer">Media Reviewer</option>
                     </select>
                  </div>

                  <div class="space-y-2">
                     <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'settings.max_photos' | translate }}</label>
                     <input type="number" [(ngModel)]="settings.maxPhotosPerUpload" 
                            class="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm outline-none transition-all shadow-sm">
                  </div>
               </div>
            </div>

            <!-- Client Visibility -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
               <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
               <div class="flex items-center space-x-4 mb-8">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                     </svg>
                  </div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'settings.client_visibility' | translate }}</h2>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div (click)="settings.clientCanSeeFinancials = !settings.clientCanSeeFinancials" 
                       [class.ring-2]="settings.clientCanSeeFinancials"
                       [class.ring-indigo-500]="settings.clientCanSeeFinancials"
                       class="cursor-pointer p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 text-center shadow-sm">
                     <div class="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg"
                          [class.bg-indigo-500]="settings.clientCanSeeFinancials"
                          [class.text-white]="settings.clientCanSeeFinancials"
                          [class.bg-white]="!settings.clientCanSeeFinancials"
                          [class.dark:bg-slate-800]="!settings.clientCanSeeFinancials"
                          [class.text-slate-400]="!settings.clientCanSeeFinancials">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                     </div>
                     <p class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{{ 'settings.see_financials' | translate }}</p>
                  </div>

                  <div (click)="settings.clientCanSeeMedia = !settings.clientCanSeeMedia"
                       [class.ring-2]="settings.clientCanSeeMedia"
                       [class.ring-indigo-500]="settings.clientCanSeeMedia"
                       class="cursor-pointer p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 text-center shadow-sm">
                     <div class="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg"
                          [class.bg-indigo-500]="settings.clientCanSeeMedia"
                          [class.text-white]="settings.clientCanSeeMedia"
                          [class.bg-white]="!settings.clientCanSeeMedia"
                          [class.dark:bg-slate-800]="!settings.clientCanSeeMedia"
                          [class.text-slate-400]="!settings.clientCanSeeMedia">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                     </div>
                     <p class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{{ 'settings.see_media' | translate }}</p>
                  </div>

                  <div (click)="settings.clientCanSeeBOQ = !settings.clientCanSeeBOQ"
                       [class.ring-2]="settings.clientCanSeeBOQ"
                       [class.ring-indigo-500]="settings.clientCanSeeBOQ"
                       class="cursor-pointer p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 text-center shadow-sm">
                     <div class="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg"
                          [class.bg-indigo-500]="settings.clientCanSeeBOQ"
                          [class.text-white]="settings.clientCanSeeBOQ"
                          [class.bg-white]="!settings.clientCanSeeBOQ"
                          [class.dark:bg-slate-800]="!settings.clientCanSeeBOQ"
                          [class.text-slate-400]="!settings.clientCanSeeBOQ">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                     </div>
                     <p class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{{ 'settings.see_boq' | translate }}</p>
                  </div>
               </div>
            </div>

            <!-- Calculations -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
               <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
               <div class="flex items-center space-x-4 mb-8">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                     </svg>
                  </div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'settings.calculations' | translate }}</h2>
               </div>

               <div class="space-y-4">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'settings.money_method' | translate }}</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <button (click)="settings.defaultMoneyCalculationMethod = 'Measured'"
                             [class.bg-emerald-500]="settings.defaultMoneyCalculationMethod === 'Measured'"
                             [class.text-white]="settings.defaultMoneyCalculationMethod === 'Measured'"
                             [class.bg-white]="settings.defaultMoneyCalculationMethod !== 'Measured'"
                             [class.dark:bg-slate-800]="settings.defaultMoneyCalculationMethod !== 'Measured'"
                             [class.text-slate-500]="settings.defaultMoneyCalculationMethod !== 'Measured'"
                             class="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-sm">
                        {{ 'settings.measured' | translate }}
                     </button>
                     <button (click)="settings.defaultMoneyCalculationMethod = 'Supervision'"
                             [class.bg-emerald-500]="settings.defaultMoneyCalculationMethod === 'Supervision'"
                             [class.text-white]="settings.defaultMoneyCalculationMethod === 'Supervision'"
                             [class.bg-white]="settings.defaultMoneyCalculationMethod !== 'Supervision'"
                             [class.dark:bg-slate-800]="settings.defaultMoneyCalculationMethod !== 'Supervision'"
                             [class.text-slate-500]="settings.defaultMoneyCalculationMethod !== 'Supervision'"
                             class="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-sm">
                        {{ 'settings.supervision' | translate }}
                     </button>
                     <button (click)="settings.defaultMoneyCalculationMethod = 'Mixed'"
                             [class.bg-emerald-500]="settings.defaultMoneyCalculationMethod === 'Mixed'"
                             [class.text-white]="settings.defaultMoneyCalculationMethod === 'Mixed'"
                             [class.bg-white]="settings.defaultMoneyCalculationMethod !== 'Mixed'"
                             [class.dark:bg-slate-800]="settings.defaultMoneyCalculationMethod !== 'Mixed'"
                             [class.text-slate-500]="settings.defaultMoneyCalculationMethod !== 'Mixed'"
                             class="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-sm">
                        {{ 'settings.mixed' | translate }}
                     </button>
                  </div>
               </div>
            </div>

          </div>
        } @else {
          <div class="flex flex-col items-center justify-center py-20 animate-pulse">
            <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mb-4"></div>
            <div class="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-2"></div>
            <div class="w-32 h-3 bg-slate-100 dark:bg-slate-900 rounded-full"></div>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `]
})
export class CompanySettingsComponent implements OnInit {
    settings?: CompanySettings;
    loading = false;

    constructor(private settingsService: SettingsService) { }

    ngOnInit() {
        this.loadSettings();
    }

    loadSettings() {
        this.settingsService.getCompanySettings().subscribe(s => this.settings = s);
    }

    saveSettings() {
        if (!this.settings) return;
        this.loading = true;
        this.settingsService.updateCompanySettings(this.settings).subscribe({
            next: (updated) => {
                this.settings = updated;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}
