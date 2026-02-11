import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company, Package } from '../../../../shared/interfaces';
import { PackagesService } from '../../../../core/services/packages.service';
import { RolesService } from '../../../../core/services/roles.service';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
      <div class="max-w-7xl mx-auto">
        <!-- Breadcrumbs & Actions -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div class="flex items-center gap-6">
            <button routerLink="/admin/companies" class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <a routerLink="/admin/companies" class="hover:text-indigo-600 transition-colors">Organizations</a>
                <span>/</span>
                <span class="text-indigo-600">{{ company?.name }}</span>
              </div>
              <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                <span class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">{{ company?.name?.charAt(0) }}</span>
                {{ company?.name }}
              </h1>
            </div>
          </div>
          <div class="flex items-center gap-3">
             <button routerLink="/admin/companies" class="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
               Back to Grid
             </button>
             <button class="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
               Primary Action
             </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex bg-white dark:bg-slate-900 rounded-[2rem] p-2 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 overflow-x-auto custom-scrollbar">
          <button *ngFor="let tab of tabs" 
                  (click)="activeTab = tab.id"
                  [class.bg-slate-900]="activeTab === tab.id"
                  [class.text-white]="activeTab === tab.id"
                  [class.dark:bg-white]="activeTab === tab.id"
                  [class.dark:text-slate-900]="activeTab === tab.id"
                  class="flex-1 px-8 py-4 rounded-[1.5rem] text-[11px] font-[900] uppercase tracking-[0.2em] transition-all whitespace-nowrap"
                  [ngClass]="activeTab === tab.id ? '' : 'text-slate-500 hover:text-indigo-600'">
            {{ tab.label }}
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none min-h-[600px]">
          
          <!-- TAB 1: IDENTITY & CONFIG -->
          <div *ngIf="activeTab === 'identity'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form [formGroup]="companyForm" class="space-y-12">
                <!-- Basic Info -->
                <section>
                  <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Identity & Association
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Trade Name</label>
                      <input formControlName="name" placeholder="e.g., Al-Massa Construction" 
                             class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all font-bold text-lg text-slate-900 dark:text-white">
                    </div>
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Package</label>
                      <select formControlName="packageId" 
                              class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all font-bold text-lg appearance-none text-slate-900 dark:text-white">
                        <option *ngFor="let pkg of packages" [value]="pkg.id" class="text-slate-900 dark:text-white dark:bg-slate-900">{{ pkg.name }}</option>
                      </select>
                    </div>
                  </div>
                </section>

               <!-- Unified Feature Management -->
               <section class="pt-6 space-y-10">
                 <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                   <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                   Platform Features
                 </h3>

                 <!-- Core Platform Features -->
                 <div class="space-y-4">
                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span class="w-1 h-1 rounded-full bg-blue-500"></span> Infrastructure & Core
                    </h4>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                        <div (click)="toggleFormControl('enableUserManagement')" 
                             [ngClass]="companyForm.get('enableUserManagement')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">👥</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">User Mgmt</span>
                        </div>
                        <div (click)="toggleFormControl('enableProjectManagement')" 
                             [ngClass]="companyForm.get('enableProjectManagement')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🏗️</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Projects</span>
                        </div>
                        <div (click)="toggleFormControl('enableAccessControl')" 
                             [ngClass]="companyForm.get('enableAccessControl')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🔐</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Access Control</span>
                        </div>
                        <div (click)="toggleFormControl('enableNotifications')" 
                             [ngClass]="companyForm.get('enableNotifications')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🔔</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Notifications</span>
                        </div>
                        <div (click)="toggleFormControl('enableAnalytics')" 
                             [ngClass]="companyForm.get('enableAnalytics')?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📈</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Analytics</span>
                        </div>
                    </div>
                 </div>

                 <!-- Site Operations -->
                 <div class="space-y-4">
                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span class="w-1 h-1 rounded-full bg-emerald-500"></span> Site Operations
                    </h4>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                        <div (click)="toggleFormControl('enableDailyLogs')" 
                             [ngClass]="companyForm.get('enableDailyLogs')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📝</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Daily Logs</span>
                        </div>
                        <div (click)="toggleFormControl('enableSiteMedia')" 
                             [ngClass]="companyForm.get('enableSiteMedia')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📸</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Site Media</span>
                        </div>
                        <div (click)="toggleFormControl('enableBOQManagement')" 
                             [ngClass]="companyForm.get('enableBOQManagement')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📊</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">BOQ Mgmt</span>
                        </div>
                        <div (click)="toggleFormControl('enableDocumentManagement')" 
                             [ngClass]="companyForm.get('enableDocumentManagement')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📁</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Documents</span>
                        </div>
                        <div (click)="toggleFormControl('enableDesignManagement')" 
                             [ngClass]="companyForm.get('enableDesignManagement')?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🎨</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Design QA</span>
                        </div>
                    </div>
                 </div>

                 <!-- Supply Chain & Assets -->
                 <div class="space-y-4">
                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span class="w-1 h-1 rounded-full bg-violet-500"></span> Supply Chain & Assets
                    </h4>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div (click)="toggleFormControl('enableInventoryManagement')" 
                             [ngClass]="companyForm.get('enableInventoryManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">📦</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Inventory</span>
                        </div>
                        <div (click)="toggleFormControl('enableEquipmentManagement')" 
                             [ngClass]="companyForm.get('enableEquipmentManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🚜</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Equipment</span>
                        </div>
                        <div (click)="toggleFormControl('enableVendorManagement')" 
                             [ngClass]="companyForm.get('enableVendorManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🏪</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Vendors</span>
                        </div>
                        <div (click)="toggleFormControl('enableSubcontractorManagement')" 
                             [ngClass]="companyForm.get('enableSubcontractorManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🤝</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Subcontractors</span>
                        </div>
                    </div>
                 </div>

                 <!-- Governance & Workforce -->
                 <div class="space-y-4">
                    <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span class="w-1 h-1 rounded-full bg-amber-500"></span> Governance & Workforce
                    </h4>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                        <div (click)="toggleFormControl('enableFinancialManagement')" 
                             [ngClass]="companyForm.get('enableFinancialManagement')?.value ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">💰</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Financials</span>
                        </div>
                        <div (click)="toggleFormControl('enableHRManagement')" 
                             [ngClass]="companyForm.get('enableHRManagement')?.value ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">👔</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">HR Mgmt</span>
                        </div>
                        <div (click)="toggleFormControl('enableQualityControl')" 
                             [ngClass]="companyForm.get('enableQualityControl')?.value ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:text-rose-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">✅</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Quality</span>
                        </div>
                        <div (click)="toggleFormControl('enableSafetyManagement')" 
                             [ngClass]="companyForm.get('enableSafetyManagement')?.value ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:text-rose-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🦺</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Safety</span>
                        </div>
                        <div (click)="toggleFormControl('enableClientPortal')" 
                             [ngClass]="companyForm.get('enableClientPortal')?.value ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-100 dark:border-slate-800 text-slate-300 opacity-60 grayscale'"
                             class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                            <span class="text-xl mb-1">🏢</span>
                            <span class="font-black text-[9px] uppercase tracking-tighter">Client Portal</span>
                        </div>
                    </div>
                 </div>
               </section>

                <!-- Inventory Configuration -->
                <section class="pt-6" *ngIf="companyForm.get('enableInventoryManagement')?.value">
                  <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <span class="w-2 h-2 rounded-full bg-violet-500"></span>
                    Inventory Configuration
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <!-- Material Request Approval -->
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('requireMaterialRequestApproval')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
                        <div class="flex items-center justify-between mb-4">
                           <span class="font-black text-[10px] uppercase tracking-widest">Material Request Approval</span>
                           <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" formControlName="requireMaterialRequestApproval" class="sr-only peer">
                             <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                           </label>
                        </div>
                        <input formControlName="materialRequestApproverRole" placeholder="Approver Role"
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-violet-500 rounded-xl outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400">
                     </div>
                     <!-- Multi Warehouse -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableMultiWarehouse')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
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
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableStockAlerts')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
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
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('defaultLowStockThreshold')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
                        <span class="font-black text-[10px] uppercase tracking-widest block mb-4">Low Stock Threshold</span>
                        <input type="number" formControlName="defaultLowStockThreshold" 
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-violet-500 rounded-xl outline-none text-xs font-bold text-slate-900 dark:text-white">
                     </div>
                  </div>
                </section>

                <!-- Equipment Configuration -->
                <section class="pt-6" *ngIf="companyForm.get('enableEquipmentManagement')?.value">
                  <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Equipment Configuration
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <!-- Maintenance Scheduling -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentMaintenanceScheduling')?.value ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
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
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentUtilizationTracking')?.value ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
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
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentGPSTracking')?.value ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
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
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentBilling')?.value ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
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
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('equipmentMaintenanceAlertThreshold')?.value ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'">
                        <span class="font-black text-[10px] uppercase tracking-widest block mb-4">Maintenance Alert (Hours)</span>
                        <input type="number" formControlName="equipmentMaintenanceAlertThreshold" 
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-600 rounded-xl outline-none text-xs font-bold text-slate-900 dark:text-white">
                     </div>
                  </div>
                </section>

               <!-- Daily Log Policy -->
               <section class="pt-6">
                 <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                   <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
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
                       <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                         <span class="w-2 h-2 rounded-full bg-orange-500"></span>
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
                       <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                         <span class="w-2 h-2 rounded-full bg-blue-500"></span>
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

                <div class="pt-10 border-t border-slate-50 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="isActive" class="sr-only peer">
                      <div class="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span class="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Company Active Status</span>
                  </div>
                  <button (click)="saveChanges()" class="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Sync Configurations</button>
                </div>
              </form>
          </div>

          <!-- TAB 2: BILLING & SUBS -->
          <div *ngIf="activeTab === 'billing'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
               <div class="lg:col-span-2 bg-gradient-to-br from-indigo-700 to-blue-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
                 <div class="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-2">Platform Subscription MRR</p>
                      <h3 class="text-6xl font-black tracking-tighter mb-8">$5,240<span class="text-lg font-medium text-indigo-300">.00</span></h3>
                    </div>
                    <div class="flex flex-wrap gap-4 mt-auto">
                      <div class="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <p class="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Billing Interval</p>
                        <p class="font-bold">Monthly Recurring</p>
                      </div>
                      <div class="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <p class="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Next Renewal</p>
                        <p class="font-bold">March 15, 2024</p>
                      </div>
                      <div class="px-6 py-4 bg-emerald-500 rounded-2xl shadow-lg">
                        <p class="text-[9px] font-black text-white/80 uppercase tracking-widest mb-1">Payment Status</p>
                        <p class="font-black">✓ Good Standing</p>
                      </div>
                    </div>
                 </div>
                 <div class="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                 <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
               </div>

               <div class="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-10 border border-slate-100 flex flex-col justify-center items-center text-center">
                 <div class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-3xl mb-6">💳</div>
                 <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Payout Method</h4>
                 <p class="text-xs text-slate-500 mb-6 font-medium">VISA ending in •••• 4422</p>
                 <button class="w-full py-4 rounded-2xl border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">Update Card Details</button>
               </div>
             </div>

             <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 px-4 flex items-center gap-3">
               <span class="w-2 h-2 rounded-full bg-slate-300"></span>
               Invoicing History
             </h3>
             <div class="rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden">
                <table class="w-full text-left">
                  <tr class="bg-slate-50/50 dark:bg-white/5">
                    <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Date</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Ref</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Paid</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Collection Status</th>
                    <th class="px-8 py-6"></th>
                  </tr>
                  <tr *ngFor="let bill of bills" class="border-t border-slate-50 dark:border-white/5 hover:bg-slate-50/30 transition-all group">
                    <td class="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{{ bill.date }}</td>
                    <td class="px-8 py-6 text-sm font-black text-slate-800 dark:text-slate-200">{{ bill.desc }}</td>
                    <td class="px-8 py-6 text-sm font-black text-indigo-600">{{ bill.amount | currency }}</td>
                    <td class="px-8 py-6">
                      <span class="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">Settled</span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <button class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 justify-end">
                        View Invoice <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </button>
                    </td>
                  </tr>
                </table>
             </div>
          </div>

          <!-- TAB 3: USERS & ACCESS -->
          <div *ngIf="activeTab === 'users'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex justify-between items-center mb-10 px-4">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Accountability Directory
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 font-medium">{{ users.length }} active user identities across this organization</p>
                </div>
                <button (click)="showOnboardModal = true" class="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all">Onboard Personnel</button>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div *ngFor="let user of users" class="p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] relative group hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl transition-all h-fit">
                  <div class="flex items-center gap-5 mb-8">
                    <div class="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/20 group-hover:bg-slate-900 group-hover:dark:bg-white group-hover:dark:text-indigo-600 transition-colors">{{ user.name.charAt(0) }}</div>
                    <div>
                      <h4 class="text-xl font-black text-slate-900 dark:text-white leading-tight italic">{{ user.name }}</h4>
                      <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{{ user.email }}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-6">
                    <div>
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Organizational Scope</label>
                      <div class="relative">
                        <select [(ngModel)]="user.role" class="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest outline-none shadow-sm appearance-none cursor-pointer focus:border-indigo-500 text-slate-900 dark:text-white">
                          <option *ngFor="let r of roles" [value]="r.name">{{ r.name }}</option>
                        </select>
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">⌄</div>
                      </div>
                      <div *ngIf="user.reportsToId" class="mt-3 flex items-center gap-2 px-1">
                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-tighter italic">Reports to:</span>
                        <span class="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{{ getUserName(user.reportsToId) }}</span>
                      </div>
                    </div>
                    
                     <div class="flex items-center justify-between pt-4 border-t border-slate-100/50">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Login: {{ user.lastLogin }}</span>
                        <div class="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <button (click)="impersonateUser(user)" class="text-indigo-600 font-black text-[9px] uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-600 transition-all flex items-center gap-1">
                             <span class="text-xs">👤</span> Impersonate
                           </button>
                           <button (click)="terminateSession(user)" class="text-rose-500 font-black text-[9px] uppercase tracking-widest border-b-2 border-transparent hover:border-rose-500 transition-all">
                             Terminate
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
             </div>

             <!-- Onboard Personnel Modal -->
             <div *ngIf="showOnboardModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
                   <button (click)="showOnboardModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                   
                   <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">Onboard Personnel</h3>
                   <p class="text-slate-500 font-medium text-xs mb-10">Assign a new digital identity to this organization's workforce.</p>

                   <form [formGroup]="onboardForm" (ngSubmit)="onboardPersonnel()" class="space-y-6">
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input formControlName="name" placeholder="John Doe" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                      </div>
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
                        <input formControlName="email" type="email" placeholder="john@company.com" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Duty Role</label>
                          <select formControlName="role" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold appearance-none text-slate-900 dark:text-white">
                             <option *ngFor="let r of roles" [value]="r.name">{{ r.name }}</option>
                          </select>
                        </div>
                        <div class="space-y-2">
                          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directly Reports To</label>
                          <select formControlName="reportsToId" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold appearance-none text-slate-900 dark:text-white">
                             <option [ngValue]="null">Top Level / None</option>
                              <option *ngFor="let u of users" [value]="u.id">{{ u.name }}</option>
                          </select>
                        </div>
                      </div>

                      <div class="pt-6 flex gap-4">
                         <button type="button" (click)="showOnboardModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                         <button type="submit" [disabled]="onboardForm.invalid" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40">Finalize Onboarding</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>

          <!-- TAB 4: PRIVILEGE STRUCTURE -->
          <div *ngIf="activeTab === 'roles'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex flex-col lg:flex-row gap-10">
                <!-- Sidebar: Roles -->
                <div class="w-full lg:w-1/3">
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Available Archetypes</h3>
                  <div class="space-y-3">
                    <div *ngFor="let role of roles" 
                         (click)="selectedRole = role"
                         [class.bg-indigo-600]="selectedRole?.id === role.id"
                         [class.border-indigo-600]="selectedRole?.id === role.id"
                         [class.text-white]="selectedRole?.id === role.id"
                         [class.shadow-2xl]="selectedRole?.id === role.id"
                         [class.shadow-indigo-500/30]="selectedRole?.id === role.id"
                         class="p-6 border border-slate-100 rounded-[2rem] cursor-pointer transition-all hover:scale-[1.02] flex justify-between items-center group">
                      <div>
                        <p class="font-black text-sm uppercase mb-1" [class.text-indigo-600]="selectedRole?.id !== role.id">{{ role.name }}</p>
                        <p class="text-[10px] font-medium opacity-60 italic">{{ role.desc }}</p>
                      </div>
                       <div class="flex items-center gap-3">
                         <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                           <button (click)="$event.stopPropagation(); openEditRole(role)" class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all">✎</button>
                           <button (click)="$event.stopPropagation(); deleteRole(role.id)" class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">×</button>
                         </div>
                         <span *ngIf="selectedRole?.id === role.id" class="text-xl">&rarr;</span>
                       </div>
                    </div>
                    <button (click)="showRoleModal = true" class="w-full py-6 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all">+ Define Custom Archetype</button>
                  </div>
                </div>

                <!-- Add Role Modal -->
                <div *ngIf="showRoleModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                   <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
                      <button (click)="showRoleModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                      
                      <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">New Archetype</h3>
                      <p class="text-slate-500 dark:text-slate-400 font-medium text-xs mb-10">Define a new identity model with specific platform duties.</p>

                      <form [formGroup]="roleAddForm" (ngSubmit)="addRole()" class="space-y-6">
                         <div class="space-y-2">
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archetype Name</label>
                           <input formControlName="name" placeholder="e.g., Regional Manager" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                         </div>
                         <div class="space-y-2">
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Description</label>
                           <textarea formControlName="desc" placeholder="Briefly describe the responsibilities..." rows="3" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white resize-none"></textarea>
                         </div>

                         <div class="pt-6 flex gap-4">
                            <button type="button" (click)="showRoleModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                            <button type="submit" [disabled]="roleAddForm.invalid" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all disabled:opacity-40">Initialize Archetype</button>
                         </div>
                      </form>
                   </div>
                </div>

                <!-- Main Content: Privilege Matrix -->
                <div class="flex-1 bg-slate-50 dark:bg-white/5 rounded-[3.5rem] p-10 border border-slate-100">
                  <div *ngIf="selectedRole" class="animate-in fade-in slide-in-from-right-4 duration-500">
                     <div class="flex justify-between items-center mb-10">
                        <div>
                          <h4 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{{ selectedRole.name }} Scope</h4>
                          <p class="text-xs text-slate-500 mt-2 font-medium">Fine-tune the security boundaries for this identity archetypes</p>
                        </div>
                        <div class="flex gap-4">
                          <button class="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-rose-500 hover:scale-110 transition-all border border-slate-100 italic font-black">DEL</button>
                        </div>
                     </div>

                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div *ngFor="let perm of permissions" 
                             (click)="toggleRolePermission(perm.name)"
                             class="p-5 bg-white dark:bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer group hover:border-indigo-300 transition-all"
                             [class.border-indigo-200]="selectedRole.perms.includes(perm.name)"
                             [class.bg-indigo-50/20]="selectedRole.perms.includes(perm.name)">
                          <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shadow-inner">{{ getPermIcon(perm.name) }}</div>
                            <div>
                              <p class="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-tight mb-0.5">{{ perm.name }}</p>
                              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{{ perm.desc }}</p>
                            </div>
                          </div>
                          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                               [class.bg-indigo-600]="selectedRole.perms.includes(perm.name)"
                               [class.border-indigo-600]="selectedRole.perms.includes(perm.name)"
                               [class.border-slate-200]="!selectedRole.perms.includes(perm.name)">
                             <span *ngIf="selectedRole.perms.includes(perm.name)" class="text-white text-[10px]">✓</span>
                          </div>
                        </div>
                     </div>
                  </div>
                  <div *ngIf="!selectedRole" class="h-full flex flex-col items-center justify-center text-center opacity-40 italic">
                     <span class="text-8xl mb-6">🛡️</span>
                     <p class="font-black text-slate-400 uppercase tracking-widest">Select an archetype to modify its matrix</p>
                  </div>
                </div>
             </div>
          </div>

          <!-- TAB 5: PLATFORM CAPABILITIES -->
          <div *ngIf="activeTab === 'perms'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex justify-between items-center mb-10 px-4">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                    Permission Architecture
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 font-medium">Global capability definitions for the platform engine</p>
                </div>
                <button (click)="showPermModal = true" class="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Define Capability</button>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div *ngFor="let perm of permissions" class="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:scale-105 transition-all relative overflow-hidden group border-b-8 border-b-indigo-500">
                  <button (click)="deletePerm(perm.name)" class="absolute top-6 right-6 w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                    <span class="text-xl">&times;</span>
                  </button>
                  
                  <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mb-6 shadow-inner">{{ getPermIcon(perm.name) }}</div>
                  <h4 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3 italic">{{ perm.name }}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{{ perm.desc }}</p>
                  
                  <div class="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                     <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Platform Core</span>
                     <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div class="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-10 transition-opacity text-6xl">🛡️</div>
               </div>
             </div>

             <!-- Add Permission Modal -->
             <div *ngIf="showPermModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
                   <button (click)="showPermModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                   
                   <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">New Capability</h3>
                   <p class="text-slate-500 dark:text-slate-400 font-medium text-xs mb-10">Define a new functional boundary for the system architecture.</p>

                   <form [formGroup]="permForm" (ngSubmit)="addPermission()" class="space-y-6">
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Key (e.g., Asset.Audit)</label>
                        <input formControlName="name" placeholder="Entity.Action" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                      </div>
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Description</label>
                        <textarea formControlName="desc" placeholder="Explain what this capability allows..." rows="3" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white resize-none"></textarea>
                      </div>

                      <div class="pt-6 flex gap-4">
                         <button type="button" (click)="showPermModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                         <button type="submit" [disabled]="permForm.invalid" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all disabled:opacity-40">Register Engine Capability</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>

          <!-- TAB 6: OPERATIONAL PROJECTS -->
          <div *ngIf="activeTab === 'projects'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex justify-between items-center mb-10 px-4">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    Portfolio Breakdown
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 font-medium">{{ projects.length }} active ventures under this organization</p>
                </div>
                <button (click)="showProjectModal = true" class="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all">Launch New Project</button>
             </div>

             <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div *ngFor="let proj of projects" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div class="flex justify-between items-start mb-8">
                    <div class="flex items-center gap-5">
                      <div class="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">🏙️</div>
                      <div>
                        <h4 class="text-2xl font-black text-slate-900 dark:text-white leading-tight italic">{{ proj.name }}</h4>
                        <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">In Progress</span>
                      </div>
                    </div>
                    <div class="text-right">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Value</p>
                       <p class="text-2xl font-black text-indigo-600 tracking-tighter">{{ proj.money | currency:'USD':'symbol':'1.0-0' }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4 pt-8 border-t border-slate-50 dark:border-white/5">
                    <div class="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl text-center hover:bg-indigo-50 transition-colors">
                       <p class="text-2xl mb-1">📸</p>
                       <p class="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">{{ proj.photos }}</p>
                       <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Media Assets</p>
                    </div>
                    <div class="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl text-center hover:bg-amber-50 transition-colors">
                       <p class="text-2xl mb-1">👷</p>
                       <p class="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">{{ proj.workers }}</p>
                       <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Force</p>
                    </div>
                    <div class="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl text-center hover:bg-emerald-50 transition-colors">
                       <p class="text-2xl mb-1">📊</p>
                       <p class="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">{{ proj.status }}%</p>
                       <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Progression</p>
                    </div>
                  </div>

                  <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
               </div>
             </div>

             <!-- Launch Project Modal -->
             <div *ngIf="showProjectModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
                   <button (click)="showProjectModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                   
                   <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">Launch Venture</h3>
                   <p class="text-slate-500 dark:text-slate-400 font-medium text-xs mb-10">Initialize a new project portfolio entry for this organization.</p>

                   <form [formGroup]="projectForm" (ngSubmit)="launchProject()" class="space-y-6">
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
                        <input formControlName="name" placeholder="e.g., Al-Massa Tower" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                      </div>
                      
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Value (USD)</label>
                        <div class="relative">
                          <span class="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                          <input type="number" formControlName="money" placeholder="0.00" class="w-full p-5 pl-10 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-indigo-600">
                        </div>
                      </div>

                      <div class="pt-6 flex gap-4">
                         <button type="button" (click)="showProjectModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                         <button type="submit" [disabled]="projectForm.invalid" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all disabled:opacity-40">Initialize Portfolio Asset</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CompanyDetailComponent implements OnInit {
  company: Company | null = null;
  packages: Package[] = [];
  companyForm: FormGroup;
  activeTab = 'identity';
  selectedRole: any = null;
  showOnboardModal = false;
  onboardForm: FormGroup;
  showPermModal = false;
  permForm: FormGroup;
  showRoleModal = false;
  roleAddForm: FormGroup;
  editingRole: any = null;
  showProjectModal = false;
  projectForm: FormGroup;

  tabs = [
    { id: 'identity', label: 'Identity & Config' },
    { id: 'billing', label: 'Billing & Subs' },
    { id: 'projects', label: 'Projects' },
    { id: 'users', label: 'Users & Access' },
    { id: 'roles', label: 'Privilege Structure' },
    { id: 'perms', label: 'Platform Capabilities' }
  ];


  bills: any[] = [];

  users: any[] = [];

  roles: any[] = [];

  permissions: any[] = [];

  projects: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private companiesService: CompaniesService,
    private packagesService: PackagesService,
    private rolesService: RolesService,
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      packageId: [1, Validators.required],
      isActive: [true],

      // Feature Toggles
      enableUserManagement: [true],
      enableProjectManagement: [true],
      enableBOQManagement: [true],
      enableDailyLogs: [true],
      enableSiteMedia: [true],
      enableEquipmentManagement: [true],
      enableInventoryManagement: [true],
      enableQualityControl: [true],
      enableSafetyManagement: [true],
      enableSubcontractorManagement: [true],
      enableFinancialManagement: [true],
      enableAnalytics: [true],
      enableNotifications: [true],
      enableDocumentManagement: [true],
      enableDesignManagement: [true],
      enableClientPortal: [true],
      enableAccessControl: [true],
      enableHRManagement: [true],
      enableVendorManagement: [true],

      // Settings
      enableDelayNotification: [true],
      requirePhotoReview: [true],
      clientCanSeeFinancials: [true],
      allowPackages: [true],
      allowLocations: [true],
      allowHR: [true],
      enableEquipmentMaintenanceScheduling: [true],
      enableEquipmentUtilizationTracking: [true],
      enableEquipmentGPSTracking: [true],
      enableEquipmentBilling: [true],
      equipmentMaintenanceAlertThreshold: [50],
      requireMaterialRequestApproval: [true],
      materialRequestApproverRole: [''],
      enableMultiWarehouse: [true],
      enableStockAlerts: [true],
      defaultLowStockThreshold: [10],
      allowAddProgressEntry: [true],
      allowReopenClosedDay: [true],
      autoCloseDay: [true],
      enableInvoiceReview: [true],
      clientCanSeeMedia: [true],
      clientCanSeeBOQ: [true],

      // Legacy but kept for compatibility if needed, though mostly covered by new settings
      allowMeasured: [true],
      allowSupervision: [true],
    });

    this.onboardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['CompanyUser', Validators.required],
      reportsToId: [null]
    });

    this.permForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]*\.[A-Z][a-zA-Z]*$/)]],
      desc: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.roleAddForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      desc: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      money: [0, [Validators.required, Validators.min(1000)]]
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.companiesService.getCompanies().subscribe(companies => {
        this.company = companies.find(c => c.id === id) || null;
        if (this.company) {
          this.initForm(this.company);
        }
      });
    }

    this.packagesService.getAllPackages().subscribe(pkgs => this.packages = pkgs);

    // Load roles and permissions from backend
    this.rolesService.getPermissions().subscribe(perms => {
      this.permissions = perms;
    });

    const companyId = Number(this.route.snapshot.paramMap.get('id'));
    this.rolesService.getRoles(companyId).subscribe(roleData => {
      this.roles = roleData;
      if (this.roles.length > 0) {
        this.selectedRole = this.roles[0];
      }
    });

    // Load projects from backend
    this.projectService.getMyProjects().subscribe(projData => {
      this.projects = projData;
    });
  }

  initForm(company: Company) {
    this.companyForm.patchValue({
      name: company.name,
      packageId: company.packageId,
      isActive: company.isActive
    });

    if (company.settings) {
      this.companyForm.patchValue({
        enableDelayNotification: company.settings.enableDelayNotification,
        requirePhotoReview: company.settings.requirePhotoReview,
        clientCanSeeFinancials: company.settings.clientCanSeeFinancials,
        allowMeasured: company.settings.allowMeasured,
        allowSupervision: company.settings.allowSupervision,
        allowPackages: company.settings.allowPackages,

        // Patch new settings
        allowLocations: company.settings.allowLocations,
        allowHR: company.settings.allowHR,
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
      // Ensure any other matching settings are patched
      this.companyForm.patchValue(company.settings);

      // Patch Feature Toggles if they exist on the company object (assuming they are mapped)
      this.companyForm.patchValue(company);
    }
  }

  toggleFormControl(name: string) {
    const control = this.companyForm.get(name);
    if (control) {
      control.setValue(!control.value);
    }
  }

  saveChanges() {
    if (this.companyForm.valid && this.company) {
      this.companiesService.updateCompany(this.company.id, this.companyForm.value).subscribe(() => {
        alert('Configurations synced successfully!');
      });
    }
  }

  getPermIcon(name: string): string {
    if (name.includes('Project')) return '🏗️';
    if (name.includes('User')) return '👥';
    if (name.includes('Finance')) return '💰';
    if (name.includes('Daily')) return '📝';
    return '🛡️';
  }

  toggleRolePermission(permName: string) {
    if (!this.selectedRole) return;
    const index = this.selectedRole.perms.indexOf(permName);
    if (index > -1) {
      this.selectedRole.perms.splice(index, 1);
    } else {
      this.selectedRole.perms.push(permName);
    }
  }

  addPermission() {
    if (this.permForm.valid) {
      if (this.permissions.some(p => p.name === this.permForm.value.name)) {
        alert('This capability key already exists in the engine architecture.');
        return;
      }
      this.rolesService.createPermission(this.permForm.value).subscribe(() => {
        this.rolesService.getPermissions().subscribe(perms => {
          this.permissions = perms;
        });
        this.permForm.reset();
        this.showPermModal = false;
      });
    }
  }

  deletePerm(permName: string) {
    if (confirm(`CRITICAL: Removing '${permName}' will revoke this capability from ALL roles and companies. This cannot be undone. Proceed?`)) {
      const perm = this.permissions.find(p => p.name === permName);
      if (perm) {
        this.rolesService.deletePermission(perm.id).subscribe(() => {
          this.permissions = this.permissions.filter(p => p.name !== permName);
          // Clean up roles that had this permission
          this.roles.forEach(role => {
            role.perms = role.perms.filter((p: string) => p !== permName);
          });
        });
      }
    }
  }

  openEditRole(role: any) {
    this.editingRole = role;
    this.roleAddForm.patchValue({
      name: role.name,
      desc: role.desc
    });
    this.showRoleModal = true;
  }

  deleteRole(id: number) {
    if (confirm('CRITICAL: Removing this role will revoke access for all associated personnel in this organization. Proceed?')) {
      this.rolesService.deleteRole(id).subscribe(() => {
        this.roles = this.roles.filter(r => r.id !== id);
        if (this.selectedRole?.id === id) {
          this.selectedRole = this.roles.length > 0 ? this.roles[0] : null;
        }
      });
    }
  }

  addRole() {
    if (this.roleAddForm.valid) {
      if (this.editingRole) {
        this.rolesService.updateRole(this.editingRole.id, this.roleAddForm.value).subscribe(() => {
          this.editingRole.name = this.roleAddForm.value.name;
          this.editingRole.desc = this.roleAddForm.value.desc;
          this.editingRole = null;
          this.roleAddForm.reset();
          this.showRoleModal = false;
        });
      } else {
        this.rolesService.createRole(this.roleAddForm.value).subscribe((response: any) => {
          const newRole = {
            id: response.roleId,
            ...this.roleAddForm.value,
            perms: [] as string[]
          };
          this.roles.push(newRole);
          this.selectedRole = newRole; // Automatically select the new role for permission mapping
          this.roleAddForm.reset();
          this.showRoleModal = false;
        });
      }
    }
  }

  launchProject() {
    if (this.projectForm.valid) {
      this.projectService.createProject(this.projectForm.value).subscribe((response: any) => {
        const newProj = {
          id: response.projectId,
          ...this.projectForm.value,
          photos: 0,
          workers: 0,
          status: 0
        };
        this.projects.unshift(newProj);
        this.projectForm.reset({ money: 0 });
        this.showProjectModal = false;
        alert(`Venture '${newProj.name}' has been successfully launched in the operational portfolio.`);
      });
    }
  }

  onboardPersonnel() {
    if (this.onboardForm.valid) {
      // TODO: Implement user creation via backend service
      // For now, just add to local array
      const newUser = {
        id: Math.max(...this.users.map(u => u.id)) + 1,
        ...this.onboardForm.value,
        lastLogin: 'Never'
      };
      this.users.push(newUser);
      this.onboardForm.reset({ role: 'CompanyUser', reportsToId: null });
      this.showOnboardModal = false;
    }
  }

  terminateSession(user: any) {
    if (confirm(`Are you sure you want to terminate the active session for ${user.name} ? They will be forced to log in again.`)) {
      user.lastLogin = 'Terminated';
      alert(`Session for ${user.name} has been revoked.`);
    }
  }

  impersonateUser(user: any) {
    const confirmMsg = `CRITICAL ACTION: You are about to impersonate ${user.name} (${user.role}).\n\nYou will view the platform exactly as they do including their data permissions and project access.Proceed ? `;
    if (confirm(confirmMsg)) {
      // In a real app, this would trigger a state change in AuthService or a cookie switch
      alert(`Switching session to ${user.name}... Redirecting to Dashboard.`);
      // Mock redirection
      window.location.href = '/dashboard?impersonating=' + user.id;
    }
  }

  getUserName(id: number): string {
    return this.users.find(u => u.id === id)?.name || 'Unknown Manager';
  }
}
