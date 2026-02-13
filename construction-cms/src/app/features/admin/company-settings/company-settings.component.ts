
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../core/services/settings.service';
import { CompanyPackagesService } from '../../../core/services/company-packages.service';
import { RolesService } from '../../../core/services/roles.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { PhaseService } from '../../../core/services/phase.service';
import { ProjectHierarchyComponent } from '../project-hierarchy/project-hierarchy.component';
import { CompanySettings, CompanyPackage, Role, Permission, CatalogItem } from '../../../shared/interfaces';

@Component({
   selector: 'app-company-settings',
   standalone: true,
   imports: [CommonModule, FormsModule, TranslateModule, ProjectHierarchyComponent],
   template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <!-- Page Title & Tabs -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Configurations</h1>
            <div class="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-fit">
              <button (click)="activeTab = 'settings'" 
                      [class.bg-white]="activeTab === 'settings'" 
                      [class.shadow-sm]="activeTab === 'settings'"
                      [class.text-slate-900]="activeTab === 'settings'"
                      [class.dark:bg-slate-700]="activeTab === 'settings'"
                      [class.dark:text-white]="activeTab === 'settings'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  Settings
              </button>
              <button (click)="activeTab = 'roles'" 
                      [class.bg-white]="activeTab === 'roles'" 
                      [class.shadow-sm]="activeTab === 'roles'"
                      [class.text-slate-900]="activeTab === 'roles'"
                      [class.dark:bg-slate-700]="activeTab === 'roles'"
                      [class.dark:text-white]="activeTab === 'roles'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  Roles & Permissions
              </button>
              <button (click)="activeTab = 'hierarchy'" 
                      [class.bg-white]="activeTab === 'hierarchy'" 
                      [class.shadow-sm]="activeTab === 'hierarchy'"
                      [class.text-slate-900]="activeTab === 'hierarchy'"
                      [class.dark:bg-slate-700]="activeTab === 'hierarchy'"
                      [class.dark:text-white]="activeTab === 'hierarchy'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  Phases
              </button>
            </div>
          </div>

          @if (activeTab === 'settings') {
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
          }
        </div>

        @if (activeTab === 'settings') {

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

                       <!-- Allow Add Progress Entry -->
                       <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <div>
                             <span class="text-xs font-black text-slate-700 dark:text-slate-300 block">Progress Entry</span>
                             <span class="text-[8px] text-slate-400">Workers can log progress</span>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" [(ngModel)]="settings.allowAddProgressEntry" class="sr-only peer">
                             <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                       </div>

                       <!-- Allow Reopen Closed Day -->
                       <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <div>
                             <span class="text-xs font-black text-slate-700 dark:text-slate-300 block">Reopen Closed Day</span>
                             <span class="text-[8px] text-slate-400">Admins can unlock days</span>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" [(ngModel)]="settings.allowReopenClosedDay" class="sr-only peer">
                             <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                       </div>

                       <!-- Auto Close Day -->
                       <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <div>
                             <span class="text-xs font-black text-slate-700 dark:text-slate-300 block">Auto Close Day</span>
                             <span class="text-[8px] text-slate-400">Auto-lock at scheduled time</span>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" [(ngModel)]="settings.autoCloseDay" class="sr-only peer">
                             <div class="w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                       </div>
                    </div>

                    <!-- Auto Close Time (only shown if Auto Close is enabled) -->
                    @if (settings.autoCloseDay) {
                    <div class="mt-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                       <label class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-2">Default Auto Close Time</label>
                       <input type="time" [(ngModel)]="settings.autoCloseDayTime" 
                              class="w-full max-w-xs px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 text-slate-900 dark:text-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10">
                       <p class="text-[9px] text-slate-500 mt-2">Company Admin can override this per project</p>
                    </div>
                    }
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

              <!-- Daily Log Settings (Super Admin) -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                 <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Daily Log Settings</h2>
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                       <div>
                          <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase block">Progress Entry</span>
                          <span class="text-[8px] text-slate-400">Allow workers to add progress</span>
                       </div>
                       <input type="checkbox" [(ngModel)]="settings.allowAddProgressEntry" class="w-5 h-5 accent-indigo-500">
                    </div>
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                       <div>
                          <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase block">Reopen Closed</span>
                          <span class="text-[8px] text-slate-400">Allow reopening days</span>
                       </div>
                       <input type="checkbox" [(ngModel)]="settings.allowReopenClosedDay" class="w-5 h-5 accent-indigo-500">
                    </div>
                    <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                       <div>
                          <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase block">Auto Close</span>
                          <span class="text-[8px] text-slate-400">Close day automatically</span>
                       </div>
                       <input type="checkbox" [(ngModel)]="settings.autoCloseDay" class="w-5 h-5 accent-indigo-500">
                    </div>
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 transition-opacity" [class.opacity-40]="!settings.autoCloseDay">
                       <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase block mb-2">Close Time</span>
                       <input type="time" [(ngModel)]="settings.autoCloseDayTime" 
                              [disabled]="!settings.autoCloseDay"
                              class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs outline-none disabled:cursor-not-allowed">
                    </div>
                 </div>
              </div>

               <!-- SECTION: Master Setup (Super Admin ONLY) -->
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                   <div class="flex items-center justify-between mb-8 relative z-10">
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
                                 <button (click)="openRoleModal(role)" [disabled]="isDeletingRoleId === role.id" class="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                 </button>
                                 <button (click)="deleteRole(role.id)" [disabled]="isDeletingRoleId === role.id" class="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center">
                                    @if (isDeletingRoleId === role.id) {
                                       <svg class="animate-spin w-3.5 h-3.5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                       </svg>
                                    } @else {
                                       <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    }
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

            <!-- Inventory Settings Section -->
             @if (isSuperAdmin || settings.enableInventoryManagement) {
             <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <!-- Header -->
                <div class="flex items-center justify-between mb-8 relative z-10">
                   <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                      </div>
                      <div>
                         <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Inventory Management</h3>
                         <p class="text-[10px] text-violet-500 font-bold uppercase tracking-widest">Module Settings</p>
                      </div>
                   </div>
                   @if (!settings.enableInventoryManagement) {
                      <span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">Disabled</span>
                   } @else {
                      <span class="px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-[10px] font-black uppercase tracking-widest">Active</span>
                   }
                </div>

                @if (isSuperAdmin) {
                <div class="flex items-center justify-between p-4 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 mb-6">
                   <div>
                      <span class="text-xs font-black text-violet-700 dark:text-violet-300 uppercase block">Enable Inventory Module</span>
                      <span class="text-[8px] text-violet-500">Control whether inventory management is active</span>
                   </div>
                   <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" [(ngModel)]="settings.enableInventoryManagement" class="sr-only peer">
                      <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-violet-500"></div>
                   </label>
                </div>
                }

                @if (settings.enableInventoryManagement) {
                <div class="space-y-4 animate-in slide-in-from-top-2 duration-300">
                   <!-- Require Approval -->
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div>
                         <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase block">Require Material Approval</span>
                         <span class="text-[9px] text-slate-400 font-medium">Requests need manager sign-off</span>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" [(ngModel)]="settings.requireMaterialRequestApproval" class="sr-only peer">
                         <div class="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                      </label>
                   </div>
                   <!-- Stock Alerts -->
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div>
                         <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase block">Enable Stock Alerts</span>
                         <span class="text-[9px] text-slate-400 font-medium">Notify on low inventory levels</span>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" [(ngModel)]="settings.enableStockAlerts" class="sr-only peer">
                         <div class="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                      </label>
                   </div>
                </div>
                }
             </div>
             }

            <!-- Equipment Management Settings Section -->
             @if (isSuperAdmin || settings.enableEquipmentManagement) {
             <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div class="flex items-center justify-between mb-8 relative z-10">
                   <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                      </div>
                      <div>
                         <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Equipment Management</h3>
                         <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Asset tracking & Maintenance</p>
                      </div>
                   </div>
                      @if (!settings.enableEquipmentManagement) {
                      <span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">Disabled</span>
                   } @else {
                      <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Active</span>
                   }
                </div>

                @if (isSuperAdmin) {
                <div class="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-6">
                   <div>
                      <span class="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase block">Enable Equipment Module</span>
                      <span class="text-[8px] text-emerald-500">Control asset tracking and billing</span>
                   </div>
                   <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" [(ngModel)]="settings.enableEquipmentManagement" class="sr-only peer">
                      <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                   </label>
                </div>
                }

                @if (settings.enableEquipmentManagement) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div>
                        <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase block">GPS Tracking</span>
                        <span class="text-[9px] text-slate-400 font-medium">Real-time location updates</span>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" [(ngModel)]="settings.enableEquipmentGpsTracking" class="sr-only peer">
                         <div class="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div>
                        <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase block">Rental Billing</span>
                        <span class="text-[9px] text-slate-400 font-medium">Track costs for rented gear</span>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" [(ngModel)]="settings.enableEquipmentRentalBilling" class="sr-only peer">
                         <div class="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div>
                        <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase block">Utilization</span>
                        <span class="text-[9px] text-slate-400 font-medium">Track usage hours</span>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" [(ngModel)]="settings.enableEquipmentUtilizationTracking" class="sr-only peer">
                         <div class="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div>
                         <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase block">Maintenance Alert</span>
                         <span class="text-[9px] text-slate-400 font-medium">Days before service due</span>
                      </div>
                      <input type="number" [(ngModel)]="settings.maintenanceReminderDays" class="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold text-xs text-center">
                   </div>
                </div>
                }
             </div>
             }

            <!-- Safety Management Settings Section -->
            @if (isSuperAdmin || settings.enableSafetyManagement) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
               <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <div class="flex items-center justify-between mb-8 relative z-10">
                  <div class="flex items-center space-x-4">
                     <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                     </div>
                     <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Safety Management</h3>
                        <p class="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Compliance & Incident Control</p>
                     </div>
                  </div>
               </div>

               @if (isSuperAdmin) {
               <div class="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 mb-4">
                  <div>
                     <span class="text-xs font-black text-amber-700 dark:text-amber-300 uppercase block">Enable Safety Module</span>
                     <span class="text-[8px] text-amber-500">Control safety protocols and reporting</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" [(ngModel)]="settings.enableSafetyManagement" class="sr-only peer">
                     <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
               </div>
               }

               @if (settings.enableSafetyManagement) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Require Training</span>
                      <input type="checkbox" [(ngModel)]="settings.requireSafetyTraining" class="w-5 h-5 accent-amber-500">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Incident Escalation</span>
                      <input type="checkbox" [(ngModel)]="settings.enableIncidentEscalation" class="w-5 h-5 accent-amber-500">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Inspection Frequency (Days)</span>
                      <input type="number" [(ngModel)]="settings.safetyInspectionFrequencyDays" class="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold text-xs">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Reporting Window (Hours)</span>
                      <input type="number" [(ngModel)]="settings.incidentReportingHours" class="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold text-xs">
                   </div>
                </div>
               }
            </div>
            }

            <!-- Subcontractor Management Settings Section -->
            @if (isSuperAdmin || settings.enableSubcontractorManagement) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
               <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <div class="flex items-center justify-between mb-8 relative z-10">
                  <div class="flex items-center space-x-4">
                     <div class="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                     </div>
                     <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Subcontractor Management</h3>
                        <p class="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Partner Performance & Compliance</p>
                     </div>
                  </div>
               </div>

               @if (isSuperAdmin) {
               <div class="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 mb-4">
                  <div>
                     <span class="text-xs font-black text-rose-700 dark:text-rose-300 uppercase block">Enable Subcontractor Module</span>
                     <span class="text-[8px] text-rose-500">Manage external labor and contracts</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" [(ngModel)]="settings.enableSubcontractorManagement" class="sr-only peer">
                     <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
               </div>
               }

               @if (settings.enableSubcontractorManagement) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Require Contract Mapping</span>
                      <input type="checkbox" [(ngModel)]="settings.requireSubcontractorContract" class="w-5 h-5 accent-rose-500">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Enable Partner Ratings</span>
                      <input type="checkbox" [(ngModel)]="settings.enableSubcontractorRatings" class="w-5 h-5 accent-rose-500">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Min Rating Threshold</span>
                      <input type="number" [(ngModel)]="settings.minimumRatingThreshold" class="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold text-xs">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Insurance Warning (Days)</span>
                      <input type="number" [(ngModel)]="settings.subcontractorInsuranceWarningDays" class="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold text-xs">
                   </div>
                </div>
               }
            </div>
            }

            <!-- Quality Control Settings Section -->
            @if (isSuperAdmin || settings.enableQualityControl) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
               <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <div class="flex items-center justify-between mb-8 relative z-10">
                  <div class="flex items-center space-x-4">
                     <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                     </div>
                     <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Quality Control</h3>
                        <p class="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Inspection & Defect Mitigation</p>
                     </div>
                  </div>
               </div>

               @if (isSuperAdmin) {
               <div class="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-4">
                  <div>
                     <span class="text-xs font-black text-blue-700 dark:text-blue-300 uppercase block">Enable Quality Module</span>
                     <span class="text-[8px] text-blue-500">Control quality standards and punch lists</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" [(ngModel)]="settings.enableQualityControl" class="sr-only peer">
                     <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
               </div>
               }

               @if (settings.enableQualityControl) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Defect Tracking</span>
                      <input type="checkbox" [(ngModel)]="settings.defectTrackingEnabled" class="w-5 h-5 accent-blue-500">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Auto Escalate Critical</span>
                      <input type="checkbox" [(ngModel)]="settings.autoEscalateCriticalDefects" class="w-5 h-5 accent-blue-500">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Pass Score (%)</span>
                      <input type="number" [(ngModel)]="settings.qualityScoreThreshold" class="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold text-xs">
                   </div>
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Fix Window (Hours)</span>
                      <input type="number" [(ngModel)]="settings.defectResponseHours" class="w-20 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold text-xs">
                   </div>
                </div>
               }
            </div>
            }

            <!-- Analytics & Reporting Settings Section -->
            @if (isSuperAdmin || settings.enableAnalytics) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <div class="flex items-center justify-between mb-8">
                  <div class="flex items-center space-x-4">
                     <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                     </div>
                     <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Analytics & Intelligence</h3>
                        <p class="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Data Insights & Forecasting</p>
                     </div>
                  </div>
               </div>

               @if (isSuperAdmin) {
               <div class="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-4">
                  <div>
                     <span class="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase block">Enable Advanced Analytics</span>
                     <span class="text-[8px] text-indigo-500">Allow detailed reporting and AI insights</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" [(ngModel)]="settings.enableAnalytics" class="sr-only peer">
                     <div class="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
               </div>
               }

               @if (settings.enableAnalytics) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Enable Scheduled Reports</span>
                      <input type="checkbox" [(ngModel)]="settings.enableAnalyticsReporting" class="w-5 h-5 accent-indigo-500">
                   </div>
                </div>
               }
            </div>
            }

            <!-- SECTION 2: MODULE CONFIGURATION (Company Admin ONLY) -->
            @if (isOnlyCompanyAdmin) {
            <section class="space-y-8">
                <!-- General Items Catalog (Company Admin) -->
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 relative overflow-hidden group">
                   <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                   <div class="flex items-center justify-between mb-8 relative z-10">
                      <div class="flex items-center space-x-4">
                         <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                         </div>
                          <div>
                             <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Catalog</h3>
                             <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Master Items for Projects</p>
                          </div>
                      </div>
                      <button (click)="openCatalogModal()" class="px-6 py-3 rounded-2xl bg-cyan-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all">
                         + {{ 'addItem' | translate }}
                      </button>
                   </div>

                   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      @for (item of catalogItems; track item.id) {
                      <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 hover:border-cyan-500/50 transition-all group/catalogItem">
                         <div class="flex justify-between items-start mb-4">
                            <div>
                               <div class="flex items-center space-x-2 mb-1">
                                   @if (item.projectId) {
                                      <span class="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest">Project #{{item.projectId}}</span>
                                   } @else {
                                      <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">{{ 'companyGlobal' | translate }}</span>
                                   }
                                </div>
                               <h4 class="font-bold text-slate-900 dark:text-white">{{ item.name }}</h4>
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
                   <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
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
                  <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div class="flex items-center justify-between mb-8 relative z-10">
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
                               <button (click)="deletePackage(pkg.id)" [disabled]="isDeletingPackageId === pkg.id" class="p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center">
                                  @if (isDeletingPackageId === pkg.id) {
                                     <svg class="animate-spin w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                     </svg>
                                  } @else {
                                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  }
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
        }

        @if (activeTab === 'roles') {
           <div class="space-y-12">
              <section class="space-y-8">
                  <div class="flex items-center justify-between mb-2">
                     <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0022 10V3l-7 3-7-3v7c0 1.259.231 2.464.653 3.571"></path>
                           </svg>
                        </div>
                        <div>
                           <h2 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Roles & Permissions</h2>
                           <p class="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Access Control Management</p>
                        </div>
                     </div>
                     <button (click)="openRoleModal()" class="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                        + Add Role
                     </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     @for (role of companyRoles; track role.id) {
                     <div class="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl hover:border-indigo-500/50 transition-all group/role">
                        <div class="flex justify-between items-start mb-4">
                           <div>
                              <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ role.name }}</h4>
                              <p class="text-[10px] text-slate-500 font-medium">{{ role.description || 'No description' }}</p>
                           </div>
                            <div class="flex space-x-1">
                               <button (click)="openLinkModal(role)" [disabled]="isDeletingRoleId === role.id" title="Manage Permissions" class="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-fuchsia-500 transition-all">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                               </button>
                               <button (click)="openRoleModal(role)" [disabled]="isDeletingRoleId === role.id" title="Edit Role" class="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                               </button>
                               <button (click)="deleteRole(role.id)" [disabled]="isDeletingRoleId === role.id" title="Delete Role" class="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center">
                                  @if (isDeletingRoleId === role.id) {
                                     <svg class="animate-spin w-3.5 h-3.5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                     </svg>
                                  } @else {
                                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  }
                               </button>
                            </div>
                        </div>
                        
                        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                           <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Permissions</p>
                           <div class="flex flex-wrap gap-1">
                              @for (perm of role.permissions; track perm.id) {
                                 <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[8px] font-bold">{{ perm.name }}</span>
                              } @empty {
                                 <span class="text-[8px] text-slate-400 italic">No permissions assigned</span>
                              }
                           </div>
                        </div>
                     </div>
                     }
                  </div>
              </section>
           </div>
        }

        @if (activeTab === 'hierarchy') {
           <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden">
              <app-project-hierarchy></app-project-hierarchy>
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
                     <option value="Differential">Add Difference</option>
                  </select>
               </div>
            </div>

            <div class="flex space-x-4 mt-8">
               <button (click)="showPackageModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="savePackage()" [disabled]="!packageForm.name || isSavingPackage" class="flex-[2] py-4 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                  @if (isSavingPackage) {
                     <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>Processing...</span>
                  } @else {
                     <span>{{ 'common.save' | translate }}</span>
                  }
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

                  <div class="flex space-x-4 pt-10">
                     <button (click)="showRoleModal = false" class="flex-1 py-6 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        {{ 'common.cancel' | translate }}
                     </button>
                     <button (click)="saveRole()" [disabled]="!roleForm.name || isSavingRole" class="flex-[2] py-6 rounded-[2.5rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl disabled:opacity-30 transition-all hover:scale-105 flex items-center justify-center space-x-3">
                        @if (isSavingRole) {
                           <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           <span>Processing...</span>
                        } @else {
                           <span>{{ (selectedRole ? 'common.update' : 'common.save') | translate }}</span>
                        }
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
               <!-- Search & Filter -->
               <div class="relative">
                  <input type="text" [(ngModel)]="permissionSearch" placeholder="Search permissions..." 
                         class="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold outline-none focus:ring-2 focus:ring-fuchsia-500/20 transition-all">
                  <svg class="absolute left-3 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </div>

               <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <span>{{ availablePermissionsForLinking.length }} Permissions Available</span>
                  <div class="flex space-x-2">
                     <button (click)="selectAllPermissions()" class="hover:text-fuchsia-500 transition-colors">Select All</button>
                     <span>/</span>
                     <button (click)="deselectAllPermissions()" class="hover:text-slate-600 transition-colors">None</button>
                  </div>
               </div>

               <div class="p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                  @for (group of permissionGroups; track group.name) {
                     @if (group.permissions.length > 0) {
                        <div class="mb-4 last:mb-0">
                           <h3 class="sticky top-0 bg-slate-50 dark:bg-slate-950/95 backdrop-blur-sm py-2 px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 mb-2 z-10">
                              {{ group.name }}
                              <span class="ml-2 px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[8px]">{{ group.permissions.length }}</span>
                           </h3>
                           <div class="grid grid-cols-1 gap-2">
                              @for (perm of group.permissions; track perm.id) {
                              <button 
                                 (click)="togglePermissionInMapping(perm)"
                                 [class.bg-fuchsia-500]="isPermissionSelectedInMapping(perm.id)"
                                 [class.text-white]="isPermissionSelectedInMapping(perm.id)"
                                 [class.bg-white]="!isPermissionSelectedInMapping(perm.id)"
                                 [class.dark:bg-slate-900]="!isPermissionSelectedInMapping(perm.id)"
                                 [class.text-slate-600]="!isPermissionSelectedInMapping(perm.id)"
                                 [class.dark:text-slate-300]="!isPermissionSelectedInMapping(perm.id)"
                                 class="p-3 rounded-xl text-left transition-all border border-slate-200 dark:border-white/5 hover:border-fuchsia-500/50 group/p flex items-center justify-between shadow-sm">
                                 <div class="flex flex-col">
                                    <span class="text-xs font-bold">{{ perm.name }}</span>
                                    <span class="text-[9px] opacity-70 font-medium">{{ perm.desc || 'No description' }}</span>
                                 </div>
                                 @if (isPermissionSelectedInMapping(perm.id)) {
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                 }
                              </button>
                              }
                           </div>
                        </div>
                     }
                  }
               </div>
            </div>

            <div class="flex space-x-4 mt-8">
               <button (click)="showLinkModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="saveLink()" [disabled]="isSavingRole" class="flex-[2] py-4 rounded-2xl bg-fuchsia-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-fuchsia-500/20 flex items-center justify-center space-x-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                  @if (isSavingRole) {
                     <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>Processing...</span>
                  } @else {
                     <span>{{ 'common.save' | translate }}</span>
                  }
               </button>
            </div>
         </div>
      </div>
      }

      <!-- Catalog Modal -->
      @if (showCatalogModal) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
         <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] shadow-2xl p-12 relative overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
            <div class="flex items-center justify-between mb-10">
               <div>
                  <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                     {{ (selectedCatalogItem ? 'EDIT ITEM' : 'CREATE NEW ITEM') }}
                  </h2>
                  <p class="text-[10px] text-cyan-500 font-black uppercase tracking-widest mt-2">Company Global Catalog</p>
               </div>
               <button (click)="showCatalogModal = false" class="p-4 rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm group">
                  <svg class="w-6 h-6 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>

            <div class="space-y-6">
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Item Name</label>
                  <input type="text" [(ngModel)]="catalogForm.name" placeholder="Enter item name..."
                         class="w-full p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 outline-none font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-cyan-500/10 transition-all">
               </div>

               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Description</label>
                  <textarea [(ngModel)]="catalogForm.description" rows="3" placeholder="Optional details..."
                            class="w-full p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 outline-none font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-cyan-500/10 transition-all"></textarea>
               </div>
            </div>

            <div class="flex space-x-4 mt-12 bg-slate-50/50 dark:bg-white/5 -mx-12 -mb-12 p-12 pt-8">
               <button (click)="showCatalogModal = false" 
                       class="flex-1 py-6 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="saveCatalogItem()" [disabled]="!catalogForm.name || isSavingCatalog" 
                       class="flex-[2] py-6 rounded-[2.5rem] bg-cyan-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-cyan-500/20 disabled:opacity-30 transition-all hover:scale-105 flex items-center justify-center space-x-3">
                  @if (isSavingCatalog) {
                     <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>{{ 'common.processing' | translate }}</span>
                  } @else {
                     <span>{{ (selectedCatalogItem ? 'common.update' : 'common.save') | translate }}</span>
                  }
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
                  <textarea [(ngModel)]="permissionForm.desc" rows="2" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none outline-none font-medium"></textarea>
               </div>
            </div>

            <div class="flex space-x-4 mt-8">
               <button (click)="showPermissionModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  {{ 'common.cancel' | translate }}
               </button>
               <button (click)="savePermission()" [disabled]="!permissionForm.name || isSavingPermission" class="flex-[2] py-4 rounded-2xl bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                  @if (isSavingPermission) {
                     <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>Processing...</span>
                  } @else {
                     <span>{{ 'common.save' | translate }}</span>
                  }
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
   activeTab: 'settings' | 'roles' | 'hierarchy' | 'catalog' = 'settings';
   settings?: CompanySettings;
   private originalSettings?: string;
   isCreatingGlobal = false;
   loading = false;

   companyPackages: CompanyPackage[] = [];
   isSavingPackage = false;
   isDeletingPackageId: number | null = null;
   isSavingRole = false;
   isDeletingRoleId: number | null = null;
   isSavingPermission = false;
   isDeletingPermissionId: number | null = null;
   isSavingCatalog = false;
   isDeletingCatalogId: number | null = null;
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
      desc: ''
   };

   catalogForm: Partial<CatalogItem> = {
      name: '',
      description: '',
      unit: 'm2',
      defaultRate: 0,
      category: 'Material'
   };

   linkForm: Permission[] = [];

   constructor(
      private settingsService: SettingsService,
      private packageService: CompanyPackagesService,
      private rolesService: RolesService,
      private catalogService: CatalogService,
      private phaseService: PhaseService,
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
      return this.isCompanyAdmin;
   }

   get isDirty(): boolean {
      if (!this.settings || !this.originalSettings) return false;
      return JSON.stringify(this.settings) !== this.originalSettings;
   }

   ngOnInit() {
      this.loadSettings();
      const companyId = this.authService.getCurrentUser()?.companyId || 1;
      this.loadPackages(companyId);
      this.loadRolesAndPermissions(companyId);
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

   loadRolesAndPermissions(companyId?: number) {
      this.rolesService.getRoles(companyId).subscribe(roles => this.companyRoles = roles);
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
      const companyId = this.authService.getCurrentUser()?.companyId || 1;
      this.isSavingPackage = true;
      if (this.selectedPackage) {
         this.packageService.updatePackage(this.selectedPackage.id, this.packageForm).subscribe({
            next: () => {
               this.loadPackages(companyId);
               this.showPackageModal = false;
               this.isSavingPackage = false;
            },
            error: () => this.isSavingPackage = false
         });
      } else {
         this.packageService.createPackage(this.packageForm as any).subscribe({
            next: () => {
               this.loadPackages(companyId);
               this.showPackageModal = false;
               this.isSavingPackage = false;
            },
            error: () => this.isSavingPackage = false
         });
      }
   }

   deletePackage(id: number) {
      if (confirm('Are you sure?')) {
         this.isDeletingPackageId = id;
         const companyId = this.authService.getCurrentUser()?.companyId || 1;
         this.packageService.deletePackage(id).subscribe({
            next: () => {
               this.loadPackages(companyId);
               this.isDeletingPackageId = null;
            },
            error: () => this.isDeletingPackageId = null
         });
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
      this.isSavingRole = true;
      const companyId = this.authService.getCurrentUser()?.companyId || 1;
      if (this.selectedRole) {
         this.rolesService.updateRole(this.selectedRole.id, this.roleForm).subscribe({
            next: () => {
               this.loadRolesAndPermissions(companyId);
               this.showRoleModal = false;
               this.isSavingRole = false;
            },
            error: () => this.isSavingRole = false
         });
      } else {
         this.rolesService.createRole({ ...this.roleForm, companyId }).subscribe({
            next: () => {
               this.loadRolesAndPermissions(companyId);
               this.showRoleModal = false;
               this.isSavingRole = false;
            },
            error: () => this.isSavingRole = false
         });
      }
   }

   deleteRole(id: number) {
      if (confirm('Delete this role?')) {
         this.isDeletingRoleId = id;
         const companyId = this.authService.getCurrentUser()?.companyId || 1;
         this.rolesService.deleteRole(id).subscribe({
            next: () => {
               this.loadRolesAndPermissions(companyId);
               this.isDeletingRoleId = null;
            },
            error: () => this.isDeletingRoleId = null
         });
      }
   }

   // Permissions Management
   openPermissionModal() {
      this.permissionForm = { name: '', desc: '' };
      this.showPermissionModal = true;
   }

   savePermission() {
      this.isSavingPermission = true;
      this.rolesService.createPermission(this.permissionForm).subscribe({
         next: () => {
            const companyId = this.authService.getCurrentUser()?.companyId || 1;
            this.loadRolesAndPermissions(companyId);
            this.showPermissionModal = false;
            this.isSavingPermission = false;
         },
         error: () => this.isSavingPermission = false
      });
   }

   deletePermission(id: number) {
      if (confirm('Delete this permission? It will be removed from all roles.')) {
         this.isDeletingPermissionId = id;
         const companyId = this.authService.getCurrentUser()?.companyId || 1;
         this.rolesService.deletePermission(id).subscribe({
            next: () => {
               this.loadRolesAndPermissions(companyId);
               this.isDeletingPermissionId = null;
            },
            error: () => this.isDeletingPermissionId = null
         });
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
         this.isSavingRole = true;
         this.rolesService.updateRole(this.selectedRole.id, { permissions: this.linkForm }).subscribe({
            next: () => {
               const companyId = this.authService.getCurrentUser()?.companyId || 1;
               this.loadRolesAndPermissions(companyId);
               this.showLinkModal = false;
               this.isSavingRole = false;
            },
            error: () => this.isSavingRole = false
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

   permissionSearch = '';

   get availablePermissionsForLinking(): Permission[] {
      let perms = this.companyPermissions;

      // Filter out System.* permissions for non-SuperAdmins
      if (!this.isSuperAdmin) {
         perms = perms.filter(p => !p.name.startsWith('System.'));
      }

      // Filter by search query
      if (this.permissionSearch) {
         const query = this.permissionSearch.toLowerCase();
         perms = perms.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.desc && p.desc.toLowerCase().includes(query))
         );
      }

      return perms;
   }

   get permissionGroups() {
      const groups: { [key: string]: Permission[] } = {};
      const perms = this.availablePermissionsForLinking;

      perms.forEach(p => {
         const prefix = p.name.includes('.') ? p.name.split('.')[0] : 'Other';
         if (!groups[prefix]) groups[prefix] = [];
         groups[prefix].push(p);
      });

      return Object.keys(groups).sort().map(name => ({
         name,
         permissions: groups[name]
      }));
   }

   selectAllPermissions() {
      this.availablePermissionsForLinking.forEach(p => {
         if (!this.isPermissionSelectedInMapping(p.id)) {
            this.linkForm.push(p);
         }
      });
   }

   deselectAllPermissions() {
      const availableIds = new Set(this.availablePermissionsForLinking.map(p => p.id));
      this.linkForm = this.linkForm.filter(p => !availableIds.has(p.id));
   }

   // Catalog Management
   openCatalogModal(item?: CatalogItem, isGlobal = false) {
      this.selectedCatalogItem = item;
      this.isCreatingGlobal = isGlobal;
      if (item) {
         this.catalogForm = { ...item };
      } else {
         this.catalogForm = { name: '', description: '' };
      }
      this.showCatalogModal = true;
   }

   saveCatalogItem() {
      this.isSavingCatalog = true;
      if (this.selectedCatalogItem) {
         this.catalogService.updateCatalogItem(this.selectedCatalogItem.id, this.catalogForm).subscribe({
            next: () => {
               this.loadCatalogItems();
               this.showCatalogModal = false;
               this.isSavingCatalog = false;
            },
            error: () => this.isSavingCatalog = false
         });
      } else {
         this.catalogService.addCatalogItem(this.catalogForm).subscribe({
            next: () => {
               this.loadCatalogItems();
               this.showCatalogModal = false;
               this.isSavingCatalog = false;
            },
            error: () => this.isSavingCatalog = false
         });
      }
   }

   deleteCatalogItem(id: number) {
      if (confirm('Delete this item from catalog?')) {
         this.isDeletingCatalogId = id;
         this.catalogService.deleteCatalogItem(id).subscribe({
            next: () => {
               this.loadCatalogItems();
               this.isDeletingCatalogId = null;
            },
            error: () => this.isDeletingCatalogId = null
         });
      }
   }
}
