import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, User } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 transition-colors duration-500">
      <!-- Header -->
      <div class="max-w-5xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 class="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          {{ 'profile.title' | translate }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">
          {{ 'profile.subtitle' | translate }}
        </p>
      </div>

      <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Sidebar / Profile Card -->
        <div class="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
          <div class="bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <!-- Premium Cover Decor -->
            <div class="h-40 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 relative overflow-hidden">
              <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,1),transparent)]"></div>
              <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl"></div>
            </div>

            <!-- Avatar Section -->
            <div class="flex flex-col items-center -mt-20 px-10 pb-10 relative z-10">
              <div class="group relative">
                <div class="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-5xl font-black ring-[12px] ring-white dark:ring-slate-900 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  {{ user?.fullName?.charAt(0)?.toUpperCase() || 'U' }}
                </div>
                <div class="absolute -right-2 -bottom-2 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 dark:border-white/5 cursor-pointer hover:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                </div>
              </div>

              <h2 class="mt-8 text-3xl font-black text-slate-900 dark:text-white tracking-tight text-center leading-tight">
                {{ user?.fullName || 'User' }}
              </h2>
              <p class="text-slate-400 dark:text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">
                {{ user?.email || '' }}
              </p>

              <div class="mt-6 w-full pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                <div class="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-white/[0.02]">
                  <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ 'profile.role' | translate }}</span>
                  <span class="px-4 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-wider">
                    {{ user?.role || 'User' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-white/[0.02]">
                  <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ 'profile.status' | translate }}</span>
                  <span class="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    {{ 'profile.active' | translate }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          <!-- Personal Info Section -->
          <div class="bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div class="p-10 pb-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
              <div class="flex items-center gap-5">
                <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <svg class="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div>
                  <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {{ 'profile.personal_info' | translate }}
                  </h3>
                  <p class="text-slate-400 dark:text-slate-500 font-medium">
                    {{ 'profile.personal_info_desc' | translate }}
                  </p>
                </div>
              </div>
              
              <button 
                (click)="toggleEdit()"
                class="group flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-300"
                [ngClass]="editing ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30'">
                <svg *ngIf="!editing" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                <svg *ngIf="editing" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                {{ editing ? ('common.cancel' | translate) : ('profile.edit' | translate) }}
              </button>
            </div>

            <div class="p-10 space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Name Input -->
                <div class="space-y-3">
                  <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                    {{ 'profile.full_name' | translate }}
                  </label>
                  <div class="relative group">
                    <input 
                      [disabled]="!editing"
                      [(ngModel)]="editForm.fullName"
                      type="text" 
                      class="w-full h-16 px-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent text-slate-900 dark:text-white font-bold outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500/30 focus:shadow-[0_0_20px_rgba(99,102,241,0.05)] disabled:opacity-70 disabled:cursor-not-allowed cursor-text">
                    <div *ngIf="editing" class="absolute inset-y-0 right-6 flex items-center">
                      <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <!-- Email Display (Read only) -->
                <div class="space-y-3">
                  <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                    {{ 'profile.email' | translate }}
                  </label>
                  <div class="w-full h-16 px-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent text-slate-500 dark:text-slate-400 font-bold flex items-center opacity-70">
                    {{ user?.email }}
                    <svg class="w-4 h-4 ml-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                </div>
              </div>

              <!-- Save Button (Only when editing) -->
              <div *ngIf="editing" class="pt-6 animate-in slide-in-from-bottom-2 duration-300">
                <button 
                  (click)="updateProfile()"
                  [disabled]="loading"
                  class="group relative w-full md:w-auto px-12 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-slate-900/20 dark:shadow-white/10">
                  <div *ngIf="!loading" class="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span class="relative z-10 flex items-center justify-center gap-3">
                    <svg *ngIf="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {{ (loading ? 'common.loading' : 'common.save') | translate }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Security Section -->
          <div class="bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div class="p-10 pb-8 flex items-center gap-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
              <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <div>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {{ 'profile.security' | translate }}
                </h3>
                <p class="text-slate-400 dark:text-slate-500 font-medium">
                  {{ 'profile.security_desc' | translate }}
                </p>
              </div>
            </div>

            <div class="p-10 space-y-8">
              <!-- Change Password Collapsible -->
              <div class="group/item">
                <button 
                  (click)="showPasswordForm = !showPasswordForm"
                  class="w-full flex items-center justify-between p-8 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-transparent hover:border-amber-500/30 transition-all duration-300">
                  <div class="flex items-center gap-6">
                    <div class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                    </div>
                    <div class="text-left">
                      <p class="text-lg font-black text-slate-900 dark:text-white">{{ 'profile.change_password' | translate }}</p>
                      <p class="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">{{ 'profile.change_password_desc' | translate }}</p>
                    </div>
                  </div>
                  <svg 
                    class="w-6 h-6 text-slate-300 transition-transform duration-500" 
                    [class.rotate-180]="showPasswordForm"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                <!-- Password Form Content -->
                <div *ngIf="showPasswordForm" class="mt-6 p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-8 animate-in slide-in-from-top-4 duration-500">
                   <div class="space-y-6">
                     <!-- Current Password -->
                     <div class="space-y-3">
                       <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Current Password</label>
                       <div class="relative">
                         <input [(ngModel)]="passwordForm.currentPassword" [type]="showCurrentPassword ? 'text' : 'password'" class="w-full h-16 px-8 pr-16 rounded-3xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-amber-500/30 focus:shadow-xl outline-none transition-all dark:text-white font-bold">
                         <button type="button" (click)="showCurrentPassword = !showCurrentPassword" class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">
                           <svg *ngIf="!showCurrentPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                           <svg *ngIf="showCurrentPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.413m1.854-1.423A9.92 9.92 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.413m-1.854 1.423a3 3 0 00-4.243-4.243m4.243 4.243L3 3" />
                           </svg>
                         </button>
                       </div>
                     </div>
                     <!-- New Password -->
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div class="space-y-3">
                         <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">New Password</label>
                         <div class="relative">
                           <input [(ngModel)]="passwordForm.newPassword" [type]="showNewPassword ? 'text' : 'password'" class="w-full h-16 px-8 pr-16 rounded-3xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-amber-500/30 focus:shadow-xl outline-none transition-all dark:text-white font-bold">
                           <button type="button" (click)="showNewPassword = !showNewPassword" class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">
                             <svg *ngIf="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                             </svg>
                             <svg *ngIf="showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.413m1.854-1.423A9.92 9.92 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.413m-1.854 1.423a3 3 0 00-4.243-4.243m4.243 4.243L3 3" />
                             </svg>
                           </button>
                         </div>
                       </div>
                       <div class="space-y-3">
                         <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Confirm Password</label>
                         <div class="relative">
                           <input [(ngModel)]="passwordForm.confirmPassword" [type]="showConfirmPassword ? 'text' : 'password'" class="w-full h-16 px-8 pr-16 rounded-3xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-amber-500/30 focus:shadow-xl outline-none transition-all dark:text-white font-bold">
                           <button type="button" (click)="showConfirmPassword = !showConfirmPassword" class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">
                             <svg *ngIf="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                             </svg>
                             <svg *ngIf="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.413m1.854-1.423A9.92 9.92 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.413m-1.854 1.423a3 3 0 00-4.243-4.243m4.243 4.243L3 3" />
                             </svg>
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div class="flex flex-col sm:flex-row gap-4 pt-4">
                     <button 
                        (click)="changePassword()"
                        [disabled]="loadingPassword"
                        class="px-10 h-16 bg-amber-500 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                        <span class="flex items-center gap-3">
                          <svg *ngIf="loadingPassword" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Update Password
                        </span>
                     </button>
                     <button 
                        (click)="showPasswordForm = false"
                        class="px-10 h-16 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
                        Cancel
                     </button>
                   </div>
                </div>
              </div>

              <!-- Two-Factor (Waitlist Style) -->
              <div class="p-8 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 opacity-60 grayscale scale-[0.98] origin-left">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-6">
                    <div class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center">
                      <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <div>
                      <p class="text-lg font-black text-slate-900 dark:text-white">{{ 'profile.two_factor' | translate }}</p>
                      <span class="inline-block mt-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">{{ 'profile.coming_soon' | translate }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Toasts -->
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-4">
       <div *ngIf="message" class="px-8 py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl animate-in slide-in-from-bottom-5 duration-500 flex items-center gap-4">
         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
         {{ message }}
       </div>
       <div *ngIf="error" class="px-8 py-5 rounded-[2rem] bg-rose-500 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl animate-in slide-in-from-bottom-5 duration-500 flex items-center gap-4">
         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
         {{ error }}
       </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);

    user: User | null = null;
    editing = false;
    loading = false;
    loadingPassword = false;
    showPasswordForm = false;
    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;

    message = '';
    error = '';

    editForm = {
        fullName: ''
    };

    passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    ngOnInit() {
        this.loadUser();
    }

    loadUser() {
        this.user = this.authService.getCurrentUser();
        if (this.user) {
            this.editForm.fullName = this.user.fullName;
        }
    }

    toggleEdit() {
        this.editing = !this.editing;
        if (!this.editing && this.user) {
            this.editForm.fullName = this.user.fullName;
        }
    }

    updateProfile() {
        if (!this.editForm.fullName.trim()) return;

        this.loading = true;
        this.authService.updateProfile(this.editForm.fullName)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (res) => {
                    this.showFeedback('success', res.message);
                    this.editing = false;
                    this.loadUser();
                },
                error: (err) => {
                    this.showFeedback('error', err.error?.message || 'Failed to update profile');
                }
            });
    }

    changePassword() {
        const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showFeedback('error', 'Please fill all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showFeedback('error', 'New passwords do not match');
            return;
        }

        this.loadingPassword = true;
        this.authService.changePassword(this.passwordForm)
            .pipe(finalize(() => this.loadingPassword = false))
            .subscribe({
                next: (res) => {
                    this.showFeedback('success', res.message);
                    this.showPasswordForm = false;
                    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
                },
                error: (err) => {
                    this.showFeedback('error', err.error?.message || 'Failed to change password');
                }
            });
    }

    private showFeedback(type: 'success' | 'error', text: string) {
        if (type === 'success') {
            this.message = text;
            setTimeout(() => this.message = '', 4000);
        } else {
            this.error = text;
            setTimeout(() => this.error = '', 4000);
        }
    }
}
