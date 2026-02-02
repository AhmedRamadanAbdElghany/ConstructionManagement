
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../core/services/settings.service';
import { CompanyPackagesService } from '../../../core/services/company-packages.service';
import { CompanySettings, CompanyPackage } from '../../../shared/interfaces';
import { AuthService } from '../../../core/auth/auth.service';

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
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'companyTitle' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'companySubtitle' | translate }}</p>
          </div>
          <button 
            (click)="saveSettings()"
            [disabled]="loading || !isDirty"
            class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
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
          <div class="space-y-12">
            
            <!-- SECTION 1: PLATFORM MODULES (Super Admin View ONLY) -->
            @if (isSuperAdmin) {
            <section class="space-y-8">
              <!-- Modules Card -->
              <div class="space-y-6">
                 <div class="flex items-center space-x-4 mb-2">
                   <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                     </svg>
                   </div>
                   <div>
                     <h2 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{{ 'modules' | translate }}</h2>
                     <p class="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Platform Control</p>
                   </div>
                 </div>

                 <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <!-- Allow Measured -->
                       <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ 'allowMeasured' | translate }}</span>
                          <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" [(ngModel)]="settings.allowMeasured" class="sr-only peer">
                             <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                       </div>

                       <!-- Allow Supervision -->
                       <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ 'allowSupervision' | translate }}</span>
                          <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" [(ngModel)]="settings.allowSupervision" class="sr-only peer">
                             <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                       </div>

                       <!-- Allow Packages -->
                       <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ 'allowPackages' | translate }}</span>
                          <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" [(ngModel)]="settings.allowPackages" class="sr-only peer">
                             <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Client Visibility -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                 <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'clientPortal' | translate }}</h2>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    @for (opt of [{k:'clientCanSeeFinancials', l:'seeFinancials'}, {k:'clientCanSeeMedia', l:'seeMedia'}, {k:'clientCanSeeBOQ', l:'seeBoq'}]; track opt.k) {
                    <div (click)="toggleOption(opt.k)" 
                         [class.ring-2]="getOptionValue(opt.k)"
                         [class.ring-indigo-500]="getOptionValue(opt.k)"
                         class="cursor-pointer p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-center transition-all">
                       <p class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{{ opt.l | translate }}</p>
                    </div>
                    }
                 </div>
              </div>

              <!-- Notifications & Delays -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                 <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'delayAndNotifications' | translate }}</h2>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                       <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ 'enableDelayAlerts' | translate }}</span>
                       <input type="checkbox" [(ngModel)]="settings.enableDelayNotification" class="w-12 h-6 rounded-full accent-indigo-500 cursor-pointer">
                    </div>
                    <div class="space-y-1 transition-opacity" [class.opacity-40]="!settings.enableDelayNotification">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'notificationInterval' | translate }}</label>
                       <input type="number" [(ngModel)]="settings.delayNotificationIntervalDays" 
                              [disabled]="!settings.enableDelayNotification"
                              class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border-none outline-none font-bold disabled:cursor-not-allowed">
                    </div>
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 transition-opacity" [class.opacity-40]="!settings.enableDelayNotification">
                       <span class="text-xs font-black text-slate-700 dark:text-slate-300">Send Email</span>
                       <input type="checkbox" [(ngModel)]="settings.delayNotificationSendEmail" 
                              [disabled]="!settings.enableDelayNotification"
                              class="w-12 h-6 rounded-full accent-indigo-500 transition-all disabled:cursor-not-allowed">
                    </div>
                     <div class="space-y-1 transition-opacity" [class.opacity-40]="!settings.enableDelayNotification">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'gracePeriod' | translate }}</label>
                       <input type="number" [(ngModel)]="settings.delayGracePeriodDays" 
                              [disabled]="!settings.enableDelayNotification"
                              class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border-none outline-none font-bold disabled:cursor-not-allowed">
                    </div>
                 </div>
              </div>

              <!-- Media & Invoices -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                 <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Media & Invoices</h2>
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                       <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">Photo Upload</span>
                       <input type="checkbox" [(ngModel)]="settings.enablePhotoUpload" class="w-5 h-5 accent-indigo-500">
                    </div>
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                       <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">Photo Review</span>
                       <input type="checkbox" [(ngModel)]="settings.requirePhotoReview" class="w-5 h-5 accent-indigo-500">
                    </div>
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                       <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">Inv. Review</span>
                       <input type="checkbox" [(ngModel)]="settings.enableInvoiceReview" class="w-5 h-5 accent-indigo-500">
                    </div>
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                       <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">Inv. Aggregation</span>
                       <input type="checkbox" [(ngModel)]="settings.enableInvoiceAggregation" class="w-5 h-5 accent-indigo-500">
                    </div>
                 </div>
              </div>
            </section>
            }

            <!-- SECTION 2: MODULE CONFIGURATION (Company Admin ONLY) -->
            @if (isOnlyCompanyAdmin) {
            <section class="space-y-8">
               <!-- Supervision Config -->
               @if (settings.allowSupervision) {
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
                  <div class="flex items-center space-x-4 mb-6">
                     <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                     </div>
                     <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'supervision' | translate }}</h3>
                  </div>

                  <div class="space-y-2 max-w-md">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'defaultSupervisionPercentage' | translate }}</label>
                    <div class="relative">
                       <input type="number" [(ngModel)]="settings.defaultSupervisionPercentage" 
                              class="w-full px-5 py-4 pl-5 pr-12 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 shadow-inner">
                       <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                    </div>
                  </div>
               </div>
               }

               <!-- Package Management -->
               @if (settings.allowPackages) {
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                  <div class="flex items-center justify-between mb-8">
                     <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                           </svg>
                        </div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'packagesManagement' | translate }}</h3>
                     </div>
                     <button (click)="openPackageModal()" class="px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all">
                        {{ 'common.add_new' | translate }}
                     </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     @for (pkg of companyPackages; track pkg.id) {
                     <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 relative group/pkg hover:border-amber-500/50 transition-all">
                        <div class="flex justify-between items-start mb-4">
                           <div>
                              <h3 class="font-bold text-slate-900 dark:text-white">{{ pkg.name }}</h3>
                              <p class="text-amber-500 font-black text-sm">{{ pkg.price | currency }}</p>
                           </div>
                           <div class="flex space-x-2">
                              <button (click)="openPackageModal(pkg)" class="p-2 rounded-xl text-slate-400 hover:text-amber-500 transition-colors">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              <button (click)="deletePackage(pkg.id)" class="p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                           </div>
                        </div>
                        <p class="text-xs text-slate-500 line-clamp-2">{{ pkg.description }}</p>
                     </div>
                     } @empty {
                        <p class="col-span-full py-8 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">{{ 'noPackages' | translate }}</p>
                     }
                  </div>
               </div>
               }
            </section>
            }
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center py-20 animate-pulse">
            <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mb-4"></div>
            <div class="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-2"></div>
          </div>
        }
      </div>

      <!-- Package Modal (Shared Logic) -->
      @if (showPackageModal) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-6">
               {{ (selectedPackage ? 'editPackage' : 'addPackage') | translate }}
            </h2>

            <div class="space-y-4">
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'packageName' | translate }}</label>
                  <input type="text" [(ngModel)]="packageForm.name" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold">
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'packagePrice' | translate }}</label>
                  <input type="number" [(ngModel)]="packageForm.price" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold">
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'packageDesc' | translate }}</label>
                  <textarea [(ngModel)]="packageForm.description" rows="3" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-medium"></textarea>
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'variationCalc' | translate }}</label>
                  <select [(ngModel)]="packageForm.variationCalculation" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold">
                     <option value="AddFullCost">Add Full Cost</option>
                     <option value="AddDifference">Add Difference</option>
                  </select>
               </div>
            </div>

            <div class="flex space-x-4 mt-8">
               <button (click)="showPackageModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="savePackage()" class="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20">
                  {{ 'common.save' | translate }}
               </button>
            </div>
         </div>
      </div>
      }
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
   private originalSettings?: string;
   loading = false;

   companyPackages: CompanyPackage[] = [];
   showPackageModal = false;
   selectedPackage?: CompanyPackage;
   packageForm: Partial<CompanyPackage> = {
      name: '',
      description: '',
      price: 0,
      includedItemsDescription: '',
      variationCalculation: 'AddFullCost'
   };

   constructor(
      private settingsService: SettingsService,
      private packageService: CompanyPackagesService,
      private authService: AuthService
   ) { }

   get isSuperAdmin(): boolean {
      return this.authService.getCurrentUser()?.role === 'SuperAdmin';
   }

   get isCompanyAdmin(): boolean {
      const role = this.authService.getCurrentUser()?.role;
      return role === 'CompanyAdmin' || role === 'SuperAdmin';
   }

   get isOnlyCompanyAdmin(): boolean {
      return this.authService.getCurrentUser()?.role === 'CompanyAdmin';
   }

   get isDirty(): boolean {
      if (!this.settings || !this.originalSettings) return false;
      return JSON.stringify(this.settings) !== this.originalSettings;
   }

   ngOnInit() {
      this.loadSettings();
      // Assuming companyId 1 or fetching from context
      this.loadPackages(1);
   }

   loadSettings() {
      this.settingsService.getCompanySettings().subscribe(s => {
         this.settings = s;
         this.originalSettings = JSON.stringify(s);
      });
   }

   loadPackages(companyId: number) {
      this.packageService.getPackages(companyId).subscribe(pkgs => this.companyPackages = pkgs);
   }

   saveSettings() {
      if (!this.settings) return;
      this.loading = true;
      this.settingsService.updateCompanySettings(this.settings).subscribe({
         next: (updated) => {
            this.settings = updated;
            this.originalSettings = JSON.stringify(updated);
            this.loading = false;
         },
         error: () => this.loading = false
      });
   }

   toggleOption(key: string) {
      if (this.settings) {
         (this.settings as any)[key] = !(this.settings as any)[key];
      }
   }

   getOptionValue(key: string): boolean {
      return !!this.settings && (this.settings as any)[key];
   }

   openPackageModal(pkg?: CompanyPackage) {
      this.selectedPackage = pkg;
      if (pkg) {
         this.packageForm = { ...pkg };
      } else {
         this.packageForm = {
            name: '',
            description: '',
            price: 0,
            includedItemsDescription: '',
            variationCalculation: 'AddFullCost'
         };
      }
      this.showPackageModal = true;
   }

   savePackage() {
      const companyId = 1; // Placeholder
      if (this.selectedPackage) {
         this.packageService.updatePackage(this.selectedPackage.id, this.packageForm).subscribe(() => {
            this.loadPackages(companyId);
            this.showPackageModal = false;
         });
      } else {
         this.packageService.createPackage(this.packageForm as any).subscribe(() => {
            this.loadPackages(companyId);
            this.showPackageModal = false;
         });
      }
   }

   deletePackage(id: number) {
      if (confirm('Are you sure?')) {
         this.packageService.deletePackage(id).subscribe(() => this.loadPackages(1));
      }
   }
}
