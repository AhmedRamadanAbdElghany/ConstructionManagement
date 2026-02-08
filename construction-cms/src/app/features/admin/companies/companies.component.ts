import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompaniesService } from '../../../core/services/companies.service';
import { PackagesService } from '../../../core/services/packages.service';
import { Package, Company } from '../../../shared/interfaces';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="companies-container p-8 animate-in fade-in duration-700 h-full overflow-y-auto">
      <!-- Header Area -->
      <div class="header-section mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <div>
          <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Enterprise Companies</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage and onboard organizations within the STRUC platform</p>
        </div>
        <button (click)="openCreateModal()" 
                class="group bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white px-10 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-1 active:scale-95">
          <span class="text-2xl font-light group-hover:rotate-90 transition-transform duration-500">+</span>
          <span class="font-bold tracking-wide">Register Company</span>
        </button>
      </div>

      <!-- Companies Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        <div *ngFor="let company of companies" 
             class="company-card group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
          
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r" [ngClass]="company.isActive ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-orange-500'"></div>
          
          <div class="p-8">
            <div class="flex justify-between items-start mb-6">
              <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
                {{ company.name.charAt(0) }}
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button (click)="openEditModal(company)" class="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button (click)="deleteCompany(company.id)" class="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>

            <h3 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">{{ company.name }}</h3>
            <div class="flex items-center gap-3 mb-6">
              <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                    [ngClass]="company.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                {{ company.isActive ? 'Operational' : 'Suspended' }}
              </span>
              <span class="text-slate-400 text-xs font-bold uppercase tracking-tighter">Package: {{ getPackageName(company.packageId) }}</span>
            </div>

            <div class="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
               <div class="flex justify-between text-sm">
                <span class="text-slate-500 font-medium">Allowed Methods</span>
                <div class="flex gap-1.5">
                  <span *ngIf="company.settings?.allowMeasured" class="w-2 h-2 rounded-full bg-blue-500" title="Measured"></span>
                  <span *ngIf="company.settings?.allowSupervision" class="w-2 h-2 rounded-full bg-purple-500" title="Supervision"></span>
                  <span *ngIf="company.settings?.allowPackages" class="w-2 h-2 rounded-full bg-orange-500" title="Packages"></span>
                </div>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 font-medium">Delay Notifications</span>
                <span class="font-bold" [ngClass]="company.settings?.enableDelayNotification ? 'text-emerald-500' : 'text-slate-300'">{{ company.settings?.enableDelayNotification ? 'Active' : 'Disabled' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 font-medium">Photo Review Flow</span>
                <span class="font-bold text-slate-700 dark:text-slate-300">{{ company.settings?.requirePhotoReview ? 'Enabled' : 'Disabled' }}</span>
              </div>
            </div>
          </div>
          
          <div class="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 flex justify-end items-center border-t border-slate-50 dark:border-slate-800">
            <a [routerLink]="['/admin/companies', company.id]" class="text-indigo-600 dark:text-indigo-400 text-xs font-black hover:underline tracking-widest uppercase">View Company Details &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Quick Edit Modal (Basic Identity & Features) -->
      <div *ngIf="showModal" class="modal-backdrop fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-300">
        <div class="modal-content bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform animate-in zoom-in-95 duration-500 border border-white/20">
          
          <!-- Modal Header -->
          <div class="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <div>
              <h2 class="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{{ isEdit ? 'Quick Config' : 'New Onboarding' }}</h2>
              <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage organization identity and core feature-set</p>
            </div>
            <button (click)="closeModal()" class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center shadow-lg border border-slate-100">
              <span class="text-3xl">&times;</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body flex-1 overflow-y-auto p-10 overscroll-contain custom-scrollbar">
            <form [formGroup]="companyForm" class="space-y-12">
              <!-- Basic Info -->
              <section>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company Trade Name</label>
                    <input formControlName="name" placeholder="e.g., Al-Massa Construction" 
                           class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white">
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Package</label>
                    <select formControlName="packageId" 
                            class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white appearance-none cursor-pointer">
                      <option *ngFor="let pkg of packages" [value]="pkg.id" class="text-slate-900 dark:text-white dark:bg-slate-900">{{ pkg.name }}</option>
                    </select>
                  </div>
                </div>
              </section>

              <!-- Admin Architecture (Only for New Onboarding) -->
              <section *ngIf="!isEdit" class="pt-6">
                <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                   <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                   Primary Administrator Architecture
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Admin Full Name</label>
                    <input formControlName="adminName" placeholder="e.g., Omar Mokhtar" 
                           class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white">
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Admin Corporate Email</label>
                    <input formControlName="adminEmail" type="email" placeholder="admin@organization.com" 
                           class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white">
                    <p class="text-[9px] text-slate-400 font-bold uppercase mt-2 italic px-1">Note: A temporary password 'Construction@2026' will be assigned automatically.</p>
                  </div>
                </div>
              </section>

               <!-- Unified Feature Management -->
               <section class="pt-6 space-y-10">
                 <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                   <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                   {{ 'companyFeatures.title' | translate }}
                 </h3>

                 <!-- Core Platform Features -->
                 <div class="space-y-4">
                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span class="w-1 h-1 rounded-full bg-blue-500"></span> {{ 'companyFeatures.infrastructure' | translate }}
                    </h4>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                        <div (click)="toggleFormControl('enableUserManagement')" 
                             [ngClass]="companyForm.get('enableUserManagement')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">👥</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.userManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableProjectManagement')" 
                             [ngClass]="companyForm.get('enableProjectManagement')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🏗️</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.projectManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableAccessControl')" 
                             [ngClass]="companyForm.get('enableAccessControl')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🔐</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.accessControl' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableNotifications')" 
                             [ngClass]="companyForm.get('enableNotifications')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🔔</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.notifications' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableAnalytics')" 
                             [ngClass]="companyForm.get('enableAnalytics')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📈</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.analytics' | translate }}</span>
                        </div>
                    </div>
                 </div>

                 <!-- Site Operations -->
                 <div class="space-y-4">
                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span class="w-1 h-1 rounded-full bg-emerald-500"></span> {{ 'companyFeatures.operations' | translate }}
                    </h4>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                        <div (click)="toggleFormControl('enableDailyLogs')" 
                             [ngClass]="companyForm.get('enableDailyLogs')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📝</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.dailyLogs' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableSiteMedia')" 
                             [ngClass]="companyForm.get('enableSiteMedia')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📸</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.siteMedia' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableBOQManagement')" 
                             [ngClass]="companyForm.get('enableBOQManagement')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📊</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.boqManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableDocumentManagement')" 
                             [ngClass]="companyForm.get('enableDocumentManagement')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📁</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.documentManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableDesignManagement')" 
                             [ngClass]="companyForm.get('enableDesignManagement')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🎨</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.designManagement' | translate }}</span>
                        </div>
                    </div>
                 </div>

                 <!-- Supply Chain & Assets -->
                 <div class="space-y-4">
                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span class="w-1 h-1 rounded-full bg-violet-500"></span> {{ 'companyFeatures.supply' | translate }}
                    </h4>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div (click)="toggleFormControl('enableInventoryManagement')" 
                             [ngClass]="companyForm.get('enableInventoryManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📦</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.inventoryManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableEquipmentManagement')" 
                             [ngClass]="companyForm.get('enableEquipmentManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🚜</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.equipmentManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableVendorManagement')" 
                             [ngClass]="companyForm.get('enableVendorManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🏪</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.vendorManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableSubcontractorManagement')" 
                             [ngClass]="companyForm.get('enableSubcontractorManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🤝</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.subcontractorManagement' | translate }}</span>
                        </div>
                    </div>
                 </div>

                 <!-- Governance & Workforce -->
                 <div class="space-y-4">
                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span class="w-1 h-1 rounded-full bg-amber-500"></span> {{ 'companyFeatures.governance' | translate }}
                    </h4>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                        <div (click)="toggleFormControl('enableFinancialManagement')" 
                             [ngClass]="companyForm.get('enableFinancialManagement')?.value ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">💰</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.financialManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableHRManagement')" 
                             [ngClass]="companyForm.get('enableHRManagement')?.value ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">👔</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.hrManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableQualityControl')" 
                             [ngClass]="companyForm.get('enableQualityControl')?.value ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:text-rose-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">✅</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.qualityControl' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableSafetyManagement')" 
                             [ngClass]="companyForm.get('enableSafetyManagement')?.value ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:text-rose-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🦺</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.safetyManagement' | translate }}</span>
                        </div>
                        <div (click)="toggleFormControl('enableClientPortal')" 
                             [ngClass]="companyForm.get('enableClientPortal')?.value ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🏢</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">{{ 'companyFeatures.clientPortal' | translate }}</span>
                        </div>
                    </div>
                 </div>
               </section>

                <!-- Inventory Configuration -->
                <section class="pt-6" *ngIf="companyForm.get('enableInventoryManagement')?.value">
                  <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                    Inventory Configuration
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <!-- Material Request Approval -->
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('requireMaterialRequestApproval')?.value ? 'border-violet-500 bg-violet-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div class="flex items-center justify-between mb-4">
                           <span class="font-black text-[10px] uppercase tracking-widest">Material Request Approval</span>
                           <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" formControlName="requireMaterialRequestApproval" class="sr-only peer">
                             <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                           </label>
                        </div>
                        <input formControlName="materialRequestApproverRole" placeholder="Approver Role"
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-xl outline-none text-xs font-bold">
                     </div>
                     <!-- Multi Warehouse -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableMultiWarehouse')?.value ? 'border-violet-500 bg-violet-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Multi Warehouse</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Enable multiple warehouses</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableMultiWarehouse" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                     </div>
                     <!-- Stock Alerts -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableStockAlerts')?.value ? 'border-violet-500 bg-violet-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Stock Alerts</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Enable low stock notifications</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableStockAlerts" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                     </div>
                     <!-- Low Stock Threshold -->
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('defaultLowStockThreshold')?.value ? 'border-violet-500 bg-violet-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <span class="font-black text-[10px] uppercase tracking-widest block mb-4">Low Stock Threshold</span>
                        <input type="number" formControlName="defaultLowStockThreshold" 
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-xl outline-none text-xs font-bold">
                     </div>
                  </div>
                </section>

                <!-- Equipment Configuration -->
                <section class="pt-6" *ngIf="companyForm.get('enableEquipmentManagement')?.value">
                  <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Equipment Configuration
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <!-- Maintenance Scheduling -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentMaintenanceScheduling')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Maintenance Scheduling</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Enable scheduled maintenance</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableEquipmentMaintenanceScheduling" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                     </div>
                     <!-- Utilization Tracking -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentUtilizationTracking')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Utilization Tracking</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Track equipment usage hours</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableEquipmentUtilizationTracking" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                     </div>
                     <!-- GPS Tracking -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentGPSTracking')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">GPS Tracking</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Track equipment location</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableEquipmentGPSTracking" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                     </div>
                     <!-- Billing Integration -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentBilling')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Billing Integration</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Equipment rental billing</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableEquipmentBilling" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                     </div>
                     <!-- Maintenance Alert Threshold -->
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('equipmentMaintenanceAlertThreshold')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <span class="font-black text-[10px] uppercase tracking-widest block mb-4">Maintenance Alert (Hours)</span>
                        <input type="number" formControlName="equipmentMaintenanceAlertThreshold" 
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-600 rounded-xl outline-none text-xs font-bold">
                     </div>
                  </div>
                </section>



               <!-- Daily Log Policy -->
               <section class="pt-6">
                 <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                   <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                   Daily Log Policy
                 </h3>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div (click)="toggleFormControl('allowAddProgressEntry')" 
                         [ngClass]="companyForm.get('allowAddProgressEntry')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'"
                         class="p-6 border-2 rounded-3xl cursor-pointer transition-all flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm">📝</div>
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Log Progress</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Allow Workers to Log</p>
                        </div>
                    </div>
                    <div (click)="toggleFormControl('allowReopenClosedDay')" 
                         [ngClass]="companyForm.get('allowReopenClosedDay')?.value ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:text-rose-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'"
                         class="p-6 border-2 rounded-3xl cursor-pointer transition-all flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm">🔓</div>
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Reopen Day</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Unlock Closed Logs</p>
                        </div>
                    </div>
                    <div (click)="toggleFormControl('autoCloseDay')" 
                         [ngClass]="companyForm.get('autoCloseDay')?.value ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 dark:text-indigo-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'"
                         class="p-6 border-2 rounded-3xl cursor-pointer transition-all flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm">⏰</div>
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Auto Close</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Schedule-based Locking</p>
                        </div>
                    </div>
                 </div>
               </section>

               <!-- Reviews & Visibility -->
               <section class="pt-6 pb-4">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <!-- Governance -->
                    <div>
                       <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                         <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                         Governance & Reviews
                       </h3>
                       <div class="space-y-4">
                          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                             <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Require Photo Approval</span>
                             <label class="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" formControlName="requirePhotoReview" class="sr-only peer">
                               <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                             </label>
                          </div>
                          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                             <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Require Invoice Approval</span>
                             <label class="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" formControlName="enableInvoiceReview" class="sr-only peer">
                               <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                             </label>
                          </div>
                       </div>
                    </div>
                    <!-- Client Edge -->
                    <div>
                       <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                         <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                         Client Visibility
                       </h3>
                       <div class="space-y-4">
                          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                             <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Share Financial Status</span>
                             <label class="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" formControlName="clientCanSeeFinancials" class="sr-only peer">
                               <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                             </label>
                          </div>
                          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                             <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Share Site Media</span>
                             <label class="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" formControlName="clientCanSeeMedia" class="sr-only peer">
                               <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                             </label>
                          </div>
                          <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                             <span class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Share BOQ Details</span>
                             <label class="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" formControlName="clientCanSeeBOQ" class="sr-only peer">
                               <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                             </label>
                          </div>
                       </div>
                    </div>
                 </div>
               </section>

              <div class="pt-10 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="isActive" class="sr-only peer">
                      <div class="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">Organizational Operation Status</span>
                  </div>
                  <div *ngIf="isEdit" class="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    Live Configuration Sync
                  </div>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex gap-4 shrink-0">
            <button (click)="closeModal()" class="flex-1 py-4 text-slate-500 font-black hover:bg-white dark:hover:bg-slate-700/50 rounded-2xl transition-all border border-slate-200 dark:border-white/5 uppercase tracking-widest text-[10px]">Abandon Changes</button>
            <button (click)="saveCompany()" [disabled]="companyForm.invalid"
                    class="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest text-[10px] disabled:opacity-40">
              {{ isEdit ? 'Commit Configuration' : 'Authorize & Onboard' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #f8fafc; height: 100vh; width: 100%; }
    .company-card:hover { transform: translateY(-8px); border-color: #4f46e520; }
    
    /* Scrollbar behavior fixes */
    .modal-body::-webkit-scrollbar {
      width: 8px;
    }
    .modal-body::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.02);
      border-radius: 10px;
    }
    .modal-body::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
      background-clip: content-box;
    }

    .custom-scrollbar-page::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar-page::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  `]
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  packages: Package[] = [];
  showModal = false;
  isEdit = false;
  selectedCompanyId: number | null = null;
  selectedCompany: Company | null = null;
  companyForm: FormGroup;

  constructor(
    private companiesService: CompaniesService,
    private packagesService: PackagesService,
    private fb: FormBuilder
  ) {
    this.companyForm = this.fb.group({
      adminName: [''],
      adminEmail: [''],

      // Feature Toggles (entity-level)
      enableUserManagement: [true],
      enableProjectManagement: [true],
      enableBOQManagement: [true],
      enableDailyLogs: [true],
      enableSiteMedia: [true],
      enableEquipmentManagement: [false],
      enableInventoryManagement: [false],
      enableQualityControl: [false],
      enableSafetyManagement: [false],
      enableSubcontractorManagement: [false],
      enableFinancialManagement: [true],
      enableAnalytics: [true],
      enableNotifications: [true],
      enableDocumentManagement: [false],
      enableDesignManagement: [false],
      enableClientPortal: [false],
      enableAccessControl: [true],
      enableHRManagement: [false],
      enableVendorManagement: [false]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.companiesService.getCompanies().subscribe((data: Company[]) => this.companies = data);
    this.packagesService.getAllPackages().subscribe((data: Package[]) => this.packages = data);
  }

  getPackageName(id?: number): string {
    return this.packages.find(p => p.id === id)?.name || 'Basic';
  }

  openCreateModal() {
    this.isEdit = false;
    this.selectedCompanyId = null;
    this.selectedCompany = null;
    this.companyForm.reset({
      adminName: '',
      adminEmail: '',

      // Feature Toggles
      enableUserManagement: true,
      enableProjectManagement: true,
      enableBOQManagement: true,
      enableDailyLogs: true,
      enableSiteMedia: true,
      enableEquipmentManagement: false,
      enableInventoryManagement: false,
      enableQualityControl: false,
      enableSafetyManagement: false,
      enableSubcontractorManagement: false,
      enableFinancialManagement: true,
      enableAnalytics: true,
      enableNotifications: true,
      enableDocumentManagement: false,
      enableDesignManagement: false,
      enableClientPortal: false,
      enableAccessControl: true,
      enableHRManagement: false,
      enableVendorManagement: false
    });

    this.companyForm.get('adminName')?.setValidators([Validators.required, Validators.minLength(3)]);
    this.companyForm.get('adminEmail')?.setValidators([Validators.required, Validators.email]);
    this.companyForm.get('adminName')?.updateValueAndValidity();
    this.companyForm.get('adminEmail')?.updateValueAndValidity();

    this.showModal = true;
  }

  openEditModal(company: Company) {
    this.isEdit = true;
    this.selectedCompanyId = company.id;
    this.selectedCompany = company;

    this.companyForm.patchValue({
      name: company.name,
      packageId: company.packageId,
      isActive: company.isActive,

      // Feature Toggles from entity
      enableUserManagement: company.enableUserManagement,
      enableProjectManagement: company.enableProjectManagement,
      enableBOQManagement: company.enableBOQManagement,
      enableDailyLogs: company.enableDailyLogs,
      enableSiteMedia: company.enableSiteMedia,
      enableEquipmentManagement: company.enableEquipmentManagement,
      enableInventoryManagement: company.enableInventoryManagement,
      enableQualityControl: company.enableQualityControl,
      enableSafetyManagement: company.enableSafetyManagement,
      enableSubcontractorManagement: company.enableSubcontractorManagement,
      enableFinancialManagement: company.enableFinancialManagement,
      enableAnalytics: company.enableAnalytics,
      enableNotifications: company.enableNotifications,
      enableDocumentManagement: company.enableDocumentManagement,
      enableDesignManagement: company.enableDesignManagement,
      enableClientPortal: company.enableClientPortal,
      enableAccessControl: company.enableAccessControl,
      enableHRManagement: company.enableHRManagement,
      enableVendorManagement: company.enableVendorManagement
    });

    if (company.settings) {
      this.companyForm.patchValue({
        enableDelayNotification: company.settings.enableDelayNotification,
        requirePhotoReview: company.settings.requirePhotoReview,
        clientCanSeeFinancials: company.settings.clientCanSeeFinancials,
        allowPackages: company.settings.allowPackages,
        allowLocations: company.settings.allowLocations,
        allowHR: company.settings.allowHR,
        enableInventoryManagement: company.settings.enableInventoryManagement,
        enableEquipmentManagement: company.settings.enableEquipmentManagement,
        enableEquipmentMaintenanceScheduling: company.settings.enableEquipmentMaintenanceScheduling,
        enableEquipmentUtilizationTracking: company.settings.enableEquipmentUtilizationTracking,
        enableEquipmentGPSTracking: company.settings.enableEquipmentGPSTracking,
        enableEquipmentBilling: company.settings.enableEquipmentBilling,
        equipmentMaintenanceAlertThreshold: company.settings.equipmentMaintenanceAlertThreshold,
        requireMaterialRequestApproval: company.settings.requireMaterialRequestApproval,
        materialRequestApproverRole: company.settings.materialRequestApproverRole,
        enableMultiWarehouse: company.settings.enableMultiWarehouse,
        enableStockAlerts: company.settings.enableStockAlerts,
        defaultLowStockThreshold: company.settings.defaultLowStockThreshold,
        allowAddProgressEntry: company.settings.allowAddProgressEntry,
        allowReopenClosedDay: company.settings.allowReopenClosedDay,
        autoCloseDay: company.settings.autoCloseDay,
        enableInvoiceReview: company.settings.enableInvoiceReview,
        clientCanSeeMedia: company.settings.clientCanSeeMedia,
        clientCanSeeBOQ: company.settings.clientCanSeeBOQ
      });
    }

    this.companyForm.get('adminName')?.clearValidators();
    this.companyForm.get('adminEmail')?.clearValidators();
    this.companyForm.get('adminName')?.updateValueAndValidity();
    this.companyForm.get('adminEmail')?.updateValueAndValidity();

    this.showModal = true;
  }

  saveCompany() {
    if (this.companyForm.valid) {
      const payload = { ...this.companyForm.value };
      payload.packageId = Number(payload.packageId);

      if (this.isEdit && this.selectedCompanyId) {
        this.companiesService.updateCompany(this.selectedCompanyId, payload).subscribe(() => {
          this.loadData();
          this.closeModal();
        });
      } else {
        this.companiesService.createCompany(payload).subscribe(() => {
          this.loadData();
          this.closeModal();
        });
      }
    }
  }

  deleteCompany(id: number) {
    if (confirm('Critical: This will permanently delete the organization and all its data. Continue?')) {
      this.companiesService.deleteCompany(id).subscribe(() => this.loadData());
    }
  }

  closeModal() {
    this.showModal = false;
  }

  toggleFormControl(name: string) {
    const control = this.companyForm.get(name);
    if (control) {
      control.setValue(!control.value);
    }
  }
}