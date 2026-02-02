
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../core/services/settings.service';
import { CompanyPackagesService } from '../../../core/services/company-packages.service';
import { RolesService } from '../../../core/services/roles.service';
import { CompanySettings, CompanyPackage, Role, Permission, CatalogItem } from '../../../shared/interfaces';
import { CatalogService } from '../../../core/services/catalog.service';
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

                       <!-- Allow Locations -->
                       <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ 'allowLocations' | translate }}</span>
                          <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" [(ngModel)]="settings.allowLocations" class="sr-only peer">
                             <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                       </div>

                       <!-- Allow HR -->
                       <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ 'allowHR' | translate }}</span>
                          <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" [(ngModel)]="settings.allowHR" class="sr-only peer">
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

               <!-- SECTION: Master Setup (Super Admin ONLY) -->
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
                   <div class="flex items-center justify-between mb-8">
                      <div class="flex items-center space-x-4">
                         <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0022 10V3l-7 3-7-3v7c0 1.259.231 2.464.653 3.571"></path>
                            </svg>
                         </div>
                         <div>
                            <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Master Structure Setup</h3>
                            <p class="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Global Definition</p>
                         </div>
                      </div>
                      <div class="flex space-x-2">
                        <button (click)="openPermissionModal()" class="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                           + {{ 'addPermission' | translate }}
                        </button>
                        <button (click)="openRoleModal()" class="px-5 py-3 rounded-xl bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                           + {{ 'addRole' | translate }}
                        </button>
                      </div>
                   </div>

                   <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <!-- Roles List (Master) -->
                      <div class="space-y-4">
                         <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Master Roles</h4>
                         <div class="space-y-3">
                            @for (role of companyRoles; track role.id) {
                            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 flex items-center justify-between group/role hover:border-indigo-500/30 transition-all">
                               <div>
                                  <h5 class="font-bold text-slate-900 dark:text-white text-sm">{{ role.name }}</h5>
                                  <p class="text-[10px] text-slate-500 font-medium">{{ role.description || 'Global System Role' }}</p>
                               </div>
                               <div class="flex space-x-1 opacity-0 group-hover/role:opacity-100 transition-opacity">
                                  <button (click)="openRoleModal(role)" class="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all">
                                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                  </button>
                                  <button (click)="deleteRole(role.id)" class="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all">
                                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  </button>
                               </div>
                            </div>
                            }
                         </div>
                      </div>

                      <!-- Permissions List (Master) -->
                      <div class="space-y-4">
                         <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Master Permissions</h4>
                         <div class="flex flex-wrap gap-2">
                            @for (perm of companyPermissions; track perm.id) {
                            <div class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center space-x-3 group/perm hover:border-indigo-500/50 transition-all shadow-sm">
                               <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300">{{ perm.name }}</span>
                               <button (click)="deletePermission(perm.id)" class="p-1 rounded-md text-slate-300 hover:text-red-500 transition-colors">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                               </button>
                            </div>
                            }
                         </div>
                      </div>
                   </div>
               </div>
            </section>
            }

            <!-- SECTION 2: MODULE CONFIGURATION (Company Admin ONLY) -->
            @if (isOnlyCompanyAdmin) {
            <section class="space-y-8">
                <!-- Operations Config -->
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                   <div class="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl"></div>
                   <div class="flex items-center space-x-4 mb-8">
                      <div class="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
                         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                         </svg>
                      </div>
                      <div>
                         <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'dailyOperations' | translate }}</h3>
                         <p class="text-[10px] text-fuchsia-500 font-bold uppercase tracking-widest">{{ 'systemAutomation' | translate }}</p>
                      </div>
                   </div>

                   <div class="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div>
                         <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ 'autoCloseDay' | translate }}</span>
                         <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{{ 'autoCloseDesc' | translate }}</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" [(ngModel)]="settings.autoCloseDay" class="sr-only peer">
                         <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-500 transition-all"></div>
                      </label>
                   </div>
                </div>

                <!-- General Items Catalog (Company Admin) -->
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                   <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
                   <div class="flex items-center justify-between mb-8">
                      <div class="flex items-center space-x-4">
                         <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                         </div>
                         <div>
                            <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'generalCatalog' | translate }}</h3>
                            <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">{{ 'manageCatalog' | translate }}</p>
                         </div>
                      </div>
                      <button (click)="openCatalogModal()" class="px-6 py-3 rounded-2xl bg-cyan-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all">
                         + {{ 'addItem' | translate }}
                      </button>
                   </div>

                   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      @for (item of catalogItems; track item.id) {
                      <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 hover:border-cyan-500/50 transition-all group/catalogItem">
                         <div class="flex justify-between items-start mb-4">
                            <div>
                               <div class="flex items-center space-x-2 mb-1">
                                  <span class="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 text-[8px] font-black uppercase tracking-widest">{{ item.category || 'Other' }}</span>
                                  @if (item.projectId) {
                                     <span class="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest">Project #{{item.projectId}}</span>
                                  } @else {
                                     <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">{{ 'companyGlobal' | translate }}</span>
                                  }
                               </div>
                               <h4 class="font-bold text-slate-900 dark:text-white">{{ item.name }}</h4>
                               <p class="text-[10px] text-slate-500 font-medium">{{ item.unit }} • {{ item.defaultRate | currency }}</p>
                            </div>
                            <div class="flex space-x-1 opacity-0 group-hover/catalogItem:opacity-100 transition-opacity">
                               <button (click)="openCatalogModal(item)" class="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-500 transition-all">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                               </button>
                               <button (click)="deleteCatalogItem(item.id)" class="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                               </button>
                            </div>
                         </div>
                         <p class="text-[11px] text-slate-500 line-clamp-2 italic">{{ item.description || 'No description provided' }}</p>
                      </div>
                      } @empty {
                         <div class="col-span-full py-12 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem]">
                            <p class="text-slate-400 font-bold text-sm uppercase tracking-widest">{{ 'noCatalogItems' | translate }}</p>
                         </div>
                      }
                   </div>
                </div>

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
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                  <select [(ngModel)]="packageForm.variationCalculation" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold text-slate-900 dark:text-white appearance-none">
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

      <!-- Role Modal -->
      @if (showRoleModal) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-6">
               {{ (selectedRole ? 'editRole' : 'addRole') | translate }}
            </h2>

            <div class="space-y-4">
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'roleName' | translate }}</label>
                  <input type="text" [(ngModel)]="roleForm.name" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold">
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'roleDesc' | translate }}</label>
                  <textarea [(ngModel)]="roleForm.description" rows="2" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-medium"></textarea>
               </div>
            </div>

            <div class="flex space-x-4 mt-8">
               <button (click)="showRoleModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="saveRole()" class="flex-1 py-4 rounded-2xl bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                  {{ 'common.save' | translate }}
               </button>
            </div>
         </div>
      </div>
      }

      <!-- Role-Permission Linking Modal (Company Admin ONLY) -->
      @if (showLinkModal) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ 'linkPermissionsTo' | translate }}</h2>
            <p class="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest mb-8">{{ selectedRole?.name }}</p>

            <div class="space-y-6">
               <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">{{ 'selectPermissions' | translate }}</label>
                  <div class="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                     @for (perm of companyPermissions; track perm.id) {
                     <button 
                        (click)="togglePermissionInMapping(perm)"
                        [class.ring-2]="isPermissionSelectedInMapping(perm.id)"
                        [class.ring-fuchsia-500]="isPermissionSelectedInMapping(perm.id)"
                        [class.bg-white]="!isPermissionSelectedInMapping(perm.id)"
                        [class.dark:bg-slate-800]="!isPermissionSelectedInMapping(perm.id)"
                        [class.bg-fuchsia-500/5]="isPermissionSelectedInMapping(perm.id)"
                        class="p-4 rounded-xl text-left transition-all border border-slate-200 dark:border-white/5 hover:border-fuchsia-500/30 group/p">
                        <div class="flex items-center justify-between">
                           <span class="text-xs font-bold text-slate-900 dark:text-white">{{ perm.name }}</span>
                           @if (isPermissionSelectedInMapping(perm.id)) {
                              <svg class="w-4 h-4 text-fuchsia-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                           }
                        </div>
                     </button>
                     }
                  </div>
               </div>
            </div>

            <div class="flex space-x-4 mt-8">
               <button (click)="showLinkModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="saveLink()" class="flex-1 py-4 rounded-2xl bg-fuchsia-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-fuchsia-500/20">
                  {{ 'common.save' | translate }}
               </button>
            </div>
         </div>
      </div>
      }

      <!-- Catalog Modal -->
      @if (showCatalogModal) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-6">
               {{ (selectedCatalogItem ? 'editItem' : 'addItem') | translate }}
            </h2>

            <div class="grid grid-cols-2 gap-4">
               <div class="col-span-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'itemName' | translate }}</label>
                  <input type="text" [(ngModel)]="catalogForm.name" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold">
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'itemUnit' | translate }}</label>
                  <input type="text" [(ngModel)]="catalogForm.unit" placeholder="e.g. m3, Ton, LS" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold">
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'itemRate' | translate }}</label>
                  <input type="number" [(ngModel)]="catalogForm.defaultRate" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold">
               </div>
               <div class="col-span-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'itemCategory' | translate }}</label>
                  <select [(ngModel)]="catalogForm.category" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold appearance-none">
                     <option value="Preliminaries">Preliminaries</option>
                     <option value="Labor">Labor</option>
                     <option value="Material">Material</option>
                     <option value="Equipment">Equipment</option>
                     <option value="Other">Other</option>
                  </select>
               </div>
               <div class="col-span-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assignment</label>
                  <div class="flex space-x-2">
                     <button (click)="catalogForm.projectId = undefined" 
                             [class.bg-cyan-500]="!catalogForm.projectId"
                             [class.text-white]="!catalogForm.projectId"
                             [class.bg-slate-100]="catalogForm.projectId"
                             [class.dark:bg-slate-800]="catalogForm.projectId"
                             class="flex-1 py-3 rounded-xl font-bold text-[10px] uppercase transition-all">
                        {{ 'companyGlobal' | translate }}
                     </button>
                     <div class="flex-1 relative">
                        <input type="number" [(ngModel)]="catalogForm.projectId" placeholder="Project ID"
                               class="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-950 font-bold text-[10px] outline-none">
                        @if (catalogForm.projectId) {
                           <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-amber-500 uppercase">{{ 'projectSpecific' | translate }}</span>
                        }
                     </div>
                  </div>
               </div>
            </div>

            <div class="flex space-x-4 mt-8">
               <button (click)="showCatalogModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="saveCatalogItem()" class="flex-1 py-4 rounded-2xl bg-cyan-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                  {{ 'common.save' | translate }}
               </button>
            </div>
         </div>
      </div>
      }

      <!-- Permission Modal -->
      @if (showPermissionModal) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-6">{{ 'addPermission' | translate }}</h2>

            <div class="space-y-4">
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'permissionName' | translate }}</label>
                  <input type="text" [(ngModel)]="permissionForm.name" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-bold">
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'permissionDesc' | translate }}</label>
                  <textarea [(ngModel)]="permissionForm.description" rows="2" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-medium"></textarea>
               </div>
            </div>

            <div class="flex space-x-4 mt-8">
               <button (click)="showPermissionModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="savePermission()" class="flex-1 py-4 rounded-2xl bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20">
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
   companyRoles: Role[] = [];
   companyPermissions: Permission[] = [];
   catalogItems: CatalogItem[] = [];

   showPackageModal = false;
   showRoleModal = false;
   showPermissionModal = false;
   showLinkModal = false;
   showCatalogModal = false;

   selectedPackage?: CompanyPackage;
   selectedRole?: Role;
   selectedCatalogItem?: CatalogItem;

   packageForm: Partial<CompanyPackage> = {
      name: '',
      description: '',
      price: 0,
      includedItemsDescription: '',
      variationCalculation: 'AddFullCost'
   };

   roleForm: Partial<Role> = {
      name: '',
      description: ''
   };

   permissionForm: Partial<Permission> = {
      name: '',
      description: ''
   };

   catalogForm: Partial<CatalogItem> = {
      name: '',
      unit: '',
      defaultRate: 0,
      category: 'Other'
   };

   linkForm: Permission[] = [];

   constructor(
      private settingsService: SettingsService,
      private packageService: CompanyPackagesService,
      private rolesService: RolesService,
      private catalogService: CatalogService,
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
      this.loadRolesAndPermissions();
      this.loadCatalogItems();
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

   loadRolesAndPermissions() {
      this.rolesService.getRoles().subscribe(roles => this.companyRoles = roles);
      this.rolesService.getPermissions().subscribe(perms => this.companyPermissions = perms);
   }

   loadCatalogItems() {
      this.catalogService.getCatalogItems().subscribe(items => this.catalogItems = items);
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

   // Roles Management
   openRoleModal(role?: Role) {
      this.selectedRole = role;
      if (role) {
         this.roleForm = { ...role, permissions: [...(role.permissions || [])] };
      } else {
         this.roleForm = { name: '', description: '', permissions: [] };
      }
      this.showRoleModal = true;
   }

   saveRole() {
      if (this.selectedRole) {
         this.rolesService.updateRole(this.selectedRole.id, this.roleForm).subscribe(() => {
            this.loadRolesAndPermissions();
            this.showRoleModal = false;
         });
      } else {
         this.rolesService.createRole(this.roleForm).subscribe(() => {
            this.loadRolesAndPermissions();
            this.showRoleModal = false;
         });
      }
   }

   deleteRole(id: number) {
      if (confirm('Delete this role?')) {
         this.rolesService.deleteRole(id).subscribe(() => this.loadRolesAndPermissions());
      }
   }

   // Permissions Management
   openPermissionModal() {
      this.permissionForm = { name: '', description: '' };
      this.showPermissionModal = true;
   }

   savePermission() {
      this.rolesService.createPermission(this.permissionForm).subscribe(() => {
         this.loadRolesAndPermissions();
         this.showPermissionModal = false;
      });
   }

   deletePermission(id: number) {
      if (confirm('Delete this permission? It will be removed from all roles.')) {
         this.rolesService.deletePermission(id).subscribe(() => this.loadRolesAndPermissions());
      }
   }

   // Linking UI (Company Admin)
   openLinkModal(role: Role) {
      this.selectedRole = role;
      this.linkForm = [...(role.permissions || [])];
      this.showLinkModal = true;
   }

   saveLink() {
      if (this.selectedRole) {
         this.rolesService.updateRole(this.selectedRole.id, { permissions: this.linkForm }).subscribe(() => {
            this.loadRolesAndPermissions();
            this.showLinkModal = false;
         });
      }
   }

   isPermissionSelectedInMapping(permissionId: number): boolean {
      return this.linkForm.some(p => p.id === permissionId);
   }

   togglePermissionInMapping(permission: Permission) {
      const index = this.linkForm.findIndex(p => p.id === permission.id);
      if (index === -1) {
         this.linkForm.push(permission);
      } else {
         this.linkForm.splice(index, 1);
      }
   }

   // Catalog Management
   openCatalogModal(item?: CatalogItem) {
      this.selectedCatalogItem = item;
      if (item) {
         this.catalogForm = { ...item };
      } else {
         this.catalogForm = { name: '', unit: '', defaultRate: 0, category: 'Other' };
      }
      this.showCatalogModal = true;
   }

   saveCatalogItem() {
      if (this.selectedCatalogItem) {
         this.catalogService.updateCatalogItem(this.selectedCatalogItem.id, this.catalogForm).subscribe(() => {
            this.loadCatalogItems();
            this.showCatalogModal = false;
         });
      } else {
         this.catalogService.addCatalogItem(this.catalogForm).subscribe(() => {
            this.loadCatalogItems();
            this.showCatalogModal = false;
         });
      }
   }

   deleteCatalogItem(id: number) {
      if (confirm('Delete this item from catalog?')) {
         this.catalogService.deleteCatalogItem(id).subscribe(() => this.loadCatalogItems());
      }
   }
}
