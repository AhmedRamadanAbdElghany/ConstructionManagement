import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingRequestsService, CompanyRequest, JoinRequest } from '../../../core/services/pending-requests.service';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PackagesService } from '../../../core/services/packages.service';
import { Package } from '../../../shared/interfaces';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div class="space-y-1">
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-4">
              <span class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">⏳</span>
              {{ 'sidebar.pending_requests' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'pending_requests.subtitle' | translate }}</p>
          </div>
        </div>

        <!-- Navigation Hub -->
        <div class="flex items-center space-x-2 bg-slate-200/50 dark:bg-white/5 rounded-[2rem] p-2 mb-10 w-fit backdrop-blur-md">
          @if (isSuperAdmin()) {
            <button (click)="activeTab = 'companies'"
                    [class.bg-white]="activeTab === 'companies'"
                    [class.dark:bg-slate-800]="activeTab === 'companies'"
                    [class.shadow-xl]="activeTab === 'companies'"
                    [class.text-amber-600]="activeTab === 'companies'"
                    [class.dark:text-white]="activeTab === 'companies'"
                    class="px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all">
              {{ 'pending_requests.company_requests' | translate }}
              <span class="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px]">{{ companyRequests().length }}</span>
            </button>
          }

          @if (isCompanyAdmin()) {
            <button (click)="activeTab = 'joins'"
                    [class.bg-white]="activeTab === 'joins'"
                    [class.dark:bg-slate-800]="activeTab === 'joins'"
                    [class.shadow-xl]="activeTab === 'joins'"
                    [class.text-amber-600]="activeTab === 'joins'"
                    [class.dark:text-white]="activeTab === 'joins'"
                    class="px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-slate-600">
              {{ 'pending_requests.join_requests' | translate }}
              <span class="ml-2 px-2 py-0.5 rounded-full bg-slate-400 text-white text-[9px]">{{ joinRequests().length }}</span>
            </button>
          }
        </div>

        <!-- Viewport -->
        <main class="animate-in slide-in-from-bottom-5 duration-700">
          @if (activeTab === 'companies') {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (request of companyRequests(); track request.id) {
                <div class="premium-card group">
                  <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">🏢</div>
                      <div>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ request.companyName }}</h3>
                        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ request.userFullName }} ({{ request.userEmail }})</p>
                      </div>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase">{{ request.status }}</span>
                  </div>
                  
                  <div class="space-y-4 mb-8">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-bold uppercase tracking-widest">{{ 'pending_requests.business_id' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ request.businessId || 'N/A' }}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-bold uppercase tracking-widest">{{ 'pending_requests.request_date' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ request.createdAt | date:'medium' }}</span>
                    </div>
                    @if (request.notes) {
                      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 italic text-xs text-slate-500">
                        "{{ request.notes }}"
                      </div>
                    }
                  </div>

                  <div class="flex gap-4">
                    <button (click)="approveCompany(request.id)" [disabled]="processingId === request.id" class="flex-1 py-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed border border-slate-700">
                      @if (processingId === request.id && processingAction === 'approve') {
                        <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                      }
                      {{ 'pending_requests.approve_default' | translate }}
                    </button>
                    <button (click)="openConfigModal(request)" [disabled]="processingId === request.id" class="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {{ 'pending_requests.configure_approve' | translate }}
                    </button>
                    <button (click)="rejectCompany(request.id)" [disabled]="processingId === request.id" class="flex-1 py-4 rounded-xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
                      @if (processingId === request.id && processingAction === 'reject') {
                        <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      }
                      {{ 'pending_requests.reject' | translate }}
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/5">
                   <p class="text-4xl mb-4 opacity-30">📭</p>
                   <p class="text-slate-400 font-black uppercase tracking-widest">{{ 'pending_requests.no_company_requests' | translate }}</p>
                </div>
              }
            </div>
          }

          @if (activeTab === 'joins') {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (request of joinRequests(); track request.id) {
                <div class="premium-card group">
                  <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">👤</div>
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ request.userFullName }}</h3>
                          @if (request.requestedRole) {
                            <span class="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                  [ngClass]="{
                                    'bg-blue-500/10 text-blue-600 dark:text-blue-400': request.requestedRole === 'NormalUser',
                                    'bg-amber-500/10 text-amber-600 dark:text-amber-400': request.requestedRole === 'Worker',
                                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': request.requestedRole === 'Engineer',
                                    'bg-purple-500/10 text-purple-600 dark:text-purple-400': request.requestedRole === 'InventoryOwner'
                                  }">
                              {{ request.requestedRole === 'NormalUser' ? 'User' : request.requestedRole === 'InventoryOwner' ? 'Inventory' : request.requestedRole }}
                            </span>
                          }
                        </div>
                        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ request.userEmail }}</p>
                      </div>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-[9px] font-black uppercase">{{ request.status }}</span>
                  </div>
                  
                  <div class="space-y-4 mb-8">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-bold uppercase tracking-widest">{{ 'pending_requests.target_company' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ request.companyName }}</span>
                    </div>
                    @if (request.requestedRole) {
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-400 font-bold uppercase tracking-widest">Requested Role</span>
                        <span class="px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest"
                              [ngClass]="{
                                'bg-blue-500/10 text-blue-600': request.requestedRole === 'NormalUser',
                                'bg-amber-500/10 text-amber-600': request.requestedRole === 'Worker',
                                'bg-emerald-500/10 text-emerald-600': request.requestedRole === 'Engineer',
                                'bg-purple-500/10 text-purple-600': request.requestedRole === 'InventoryOwner'
                              }">
                          {{ request.requestedRole === 'NormalUser' ? 'Normal User' : request.requestedRole === 'InventoryOwner' ? 'Inventory Owner' : request.requestedRole }}
                        </span>
                      </div>
                    }
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-bold uppercase tracking-widest">{{ 'pending_requests.request_date' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ request.createdAt | date:'medium' }}</span>
                    </div>
                    @if (request.message) {
                      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 italic text-xs text-slate-500">
                        "{{ request.message }}"
                      </div>
                    }
                  </div>

                  <div class="flex gap-4">
                    <button (click)="approveJoin(request.id)" [disabled]="processingId === request.id" class="flex-1 py-4 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
                      @if (processingId === request.id && processingAction === 'approve') {
                        <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                      }
                      {{ 'pending_requests.approve' | translate }}
                    </button>
                    <button (click)="rejectJoin(request.id)" [disabled]="processingId === request.id" class="flex-1 py-4 rounded-xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
                      @if (processingId === request.id && processingAction === 'reject') {
                        <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      }
                      {{ 'pending_requests.reject' | translate }}
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/5">
                   <p class="text-4xl mb-4 opacity-30">📭</p>
                   <p class="text-slate-400 font-black uppercase tracking-widest">{{ 'pending_requests.no_join_requests' | translate }}</p>
                </div>
              }
            </div>
          }
        </main>
      </div>

      <!-- Configuration Modal -->
      @if (showConfigModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div class="bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10 custom-scrollbar">
            <button (click)="closeConfigModal()" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
            
            <div class="mb-10">
              <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">{{ 'pending_requests.configure_company' | translate }}</h3>
              <p class="text-slate-500 font-medium text-xs">{{ 'pending_requests.configure_subtitle' | translate }} - {{ selectedRequest?.companyName }}</p>
            </div>

            <form [formGroup]="configForm" class="space-y-12">
              <!-- Basic Identity -->
              <section>
                <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Identity & Subscription
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Trade Name</label>
                    <input formControlName="name" 
                           class="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all font-bold text-lg text-slate-900 dark:text-white">
                  </div>
                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Package</label>
                    <select formControlName="packageId" 
                            class="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all font-bold text-lg appearance-none text-slate-900 dark:text-white">
                      @for (pkg of packages(); track pkg.id) {
                        <option [ngValue]="pkg.id">{{ pkg.name }}</option>
                      }
                    </select>
                  </div>
                </div>
              </section>

              <!-- Financial Logic -->
              <section>
                <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full bg-teal-500"></span>
                  Project Financial Logic
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div (click)="toggleFormControl('allowMeasured')"
                       [ngClass]="configForm.get('allowMeasured')?.value ? 'border-teal-500 bg-teal-50/40 text-teal-900 dark:text-teal-100' : 'border-slate-100 dark:border-white/5 text-slate-300 opacity-60 grayscale'"
                       class="p-6 border-2 rounded-3xl cursor-pointer transition-all flex items-center space-x-4 hover:scale-[1.02]">
                      <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm">📏</div>
                      <div>
                         <span class="font-black text-[10px] uppercase tracking-widest block">Measured</span>
                         <p class="text-[8px] font-bold uppercase opacity-60">Bill of Quantities</p>
                      </div>
                  </div>
                  <div (click)="toggleFormControl('allowSupervision')"
                       [ngClass]="configForm.get('allowSupervision')?.value ? 'border-teal-500 bg-teal-50/40 text-teal-900 dark:text-teal-100' : 'border-slate-100 dark:border-white/5 text-slate-300 opacity-60 grayscale'"
                       class="p-6 border-2 rounded-3xl cursor-pointer transition-all flex items-center space-x-4 hover:scale-[1.02]">
                      <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm">👁️</div>
                      <div>
                         <span class="font-black text-[10px] uppercase tracking-widest block">Supervision</span>
                         <p class="text-[8px] font-bold uppercase opacity-60">Cost Plus / Percentage</p>
                      </div>
                  </div>
                  <div (click)="toggleFormControl('allowPackages')"
                       [ngClass]="configForm.get('allowPackages')?.value ? 'border-teal-500 bg-teal-50/40 text-teal-900 dark:text-teal-100' : 'border-slate-100 dark:border-white/5 text-slate-300 opacity-60 grayscale'"
                       class="p-6 border-2 rounded-3xl cursor-pointer transition-all flex items-center space-x-4 hover:scale-[1.02]">
                      <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm">📦</div>
                      <div>
                         <span class="font-black text-[10px] uppercase tracking-widest block">Packages</span>
                         <p class="text-[8px] font-bold uppercase opacity-60">Fixed Price Services</p>
                      </div>
                  </div>
                </div>
              </section>

              <!-- Unified Feature Management -->
              <section class="space-y-10">
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
                    @for (feature of coreFeatures; track feature.key) {
                      <div (click)="toggleFormControl(feature.key)" 
                           [ngClass]="configForm.get(feature.key)?.value ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:text-blue-100' : 'border-slate-100 dark:border-white/5 text-slate-300 opacity-60 grayscale'"
                           class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                          <span class="text-xl mb-1">{{ feature.icon }}</span>
                          <span class="font-black text-[9px] uppercase tracking-tighter">{{ feature.label }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Site Operations -->
                <div class="space-y-4">
                  <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span class="w-1 h-1 rounded-full bg-emerald-500"></span> Site Operations
                  </h4>
                  <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                    @for (feature of siteFeatures; track feature.key) {
                      <div (click)="toggleFormControl(feature.key)" 
                           [ngClass]="configForm.get(feature.key)?.value ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-white/5 text-slate-300 opacity-60 grayscale'"
                           class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                          <span class="text-xl mb-1">{{ feature.icon }}</span>
                          <span class="font-black text-[9px] uppercase tracking-tighter">{{ feature.label }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Supply Chain & Assets -->
                <div class="space-y-4">
                  <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span class="w-1 h-1 rounded-full bg-violet-500"></span> Supply Chain & Assets
                  </h4>
                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    @for (feature of supplyFeatures; track feature.key) {
                      <div (click)="toggleFormControl(feature.key)" 
                           [ngClass]="configForm.get(feature.key)?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-white/5 text-slate-300 opacity-60 grayscale'"
                           class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                          <span class="text-xl mb-1">{{ feature.icon }}</span>
                          <span class="font-black text-[9px] uppercase tracking-tighter">{{ feature.label }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Governance & Workforce -->
                <div class="space-y-4">
                  <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span class="w-1 h-1 rounded-full bg-amber-500"></span> Governance & Workforce
                  </h4>
                  <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                    @for (feature of workforceFeatures; track feature.key) {
                      <div (click)="toggleFormControl(feature.key)" 
                           [ngClass]="configForm.get(feature.key)?.value ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-100 dark:border-white/5 text-slate-300 opacity-60 grayscale'"
                           class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center hover:scale-[1.02]">
                          <span class="text-xl mb-1">{{ feature.icon }}</span>
                          <span class="font-black text-[9px] uppercase tracking-tighter">{{ feature.label }}</span>
                      </div>
                    }
                  </div>
                </div>
              </section>

              <!-- Footer Actions -->
              <div class="pt-10 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-4">
                <button type="button" (click)="closeConfigModal()" class="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  {{ 'common.cancel' | translate }}
                </button>
                <button (click)="approveWithConfig()" [disabled]="processingId === selectedRequest?.id" class="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3">
                  @if (processingId === selectedRequest?.id) {
                    <svg class="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  }
                  {{ 'pending_requests.save_approve' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Success Toast -->
      @if (showSuccess()) {
        <div class="fixed bottom-8 right-8 z-[110] bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/30 animate-in slide-in-from-bottom-4 duration-500 flex items-center space-x-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span>{{ successMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .premium-card {
      @apply bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500;
    }
  `]
})
export class PendingRequestsComponent implements OnInit {
  private service = inject(PendingRequestsService);
  private authService = inject(AuthService);

  fb = inject(FormBuilder);
  packagesService = inject(PackagesService);

  isSuperAdmin = computed(() => this.authService.hasRole('SuperAdmin'));
  isCompanyAdmin = computed(() => this.authService.hasRole('CompanyAdmin'));

  activeTab: 'companies' | 'joins' = 'companies';
  processingId: number | null = null;
  processingAction: 'approve' | 'reject' | '' = '';
  companyRequests = signal<CompanyRequest[]>([]);
  joinRequests = signal<JoinRequest[]>([]);
  packages = signal<Package[]>([]);

  showSuccess = signal(false);
  successMessage = signal('');

  showConfigModal = false;
  selectedRequest: CompanyRequest | null = null;
  configForm!: FormGroup;

  coreFeatures = [
    { key: 'enableUserManagement', label: 'User Mgmt', icon: '👥' },
    { key: 'enableProjectManagement', label: 'Projects', icon: '🏗️' },
    { key: 'enableAccessControl', label: 'Access Control', icon: '🔐' },
    { key: 'enableNotifications', label: 'Notifications', icon: '🔔' },
    { key: 'enableAnalytics', label: 'Analytics', icon: '📈' },
  ];

  siteFeatures = [
    { key: 'enableDailyLogs', label: 'Daily Logs', icon: '📝' },
    { key: 'enableSiteMedia', label: 'Site Media', icon: '📸' },
    { key: 'enableBOQManagement', label: 'BOQ Mgmt', icon: '📊' },
    { key: 'enableDocumentManagement', label: 'Documents', icon: '📁' },
    { key: 'enableDesignManagement', label: 'Design QA', icon: '🎨' },
  ];

  supplyFeatures = [
    { key: 'enableInventoryManagement', label: 'Inventory', icon: '📦' },
    { key: 'enableEquipmentManagement', label: 'Equipment', icon: '🚜' },
    { key: 'enableVendorManagement', label: 'Vendors', icon: '🏪' },
    { key: 'enableSubcontractorManagement', label: 'Subcontractors', icon: '🤝' },
  ];

  workforceFeatures = [
    { key: 'enableFinancialManagement', label: 'Financials', icon: '💰' },
    { key: 'enableHRManagement', label: 'HR Mgmt', icon: '👔' },
    { key: 'enableQualityControl', label: 'Quality', icon: '✅' },
    { key: 'enableSafetyManagement', label: 'Safety', icon: '🦺' },
    { key: 'enableClientPortal', label: 'Client Portal', icon: '🏢' },
  ];

  ngOnInit(): void {
    this.initConfigForm();
    this.loadData();
    this.loadPackages();
  }

  initConfigForm() {
    this.configForm = this.fb.group({
      name: ['', Validators.required],
      packageId: [1, Validators.required],
      isActive: [true],

      // Feature Toggles
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
      enableVendorManagement: [false],

      // Settings
      enableDelayNotification: [true],
      requirePhotoReview: [true],
      clientCanSeeFinancials: [false],
      allowMeasured: [true],
      allowSupervision: [true],
      allowPackages: [false],
      allowLocations: [true],
      allowHR: [true],

      requireMaterialRequestApproval: [true],
      materialRequestApproverRole: [''],
      enableMultiWarehouse: [false],
      enableStockAlerts: [true],
      defaultLowStockThreshold: [10],

      enableEquipmentMaintenanceScheduling: [true],
      enableEquipmentUtilizationTracking: [true],
      enableEquipmentGpsTracking: [false],
      enableEquipmentRentalBilling: [true],
      equipmentMaintenanceAlertThreshold: [50],

      allowAddProgressEntry: [true],
      allowReopenClosedDay: [false],
      autoCloseDay: [false],

      enableInvoiceReview: [true],
      clientCanSeeMedia: [true],
      clientCanSeeBOQ: [true],
    });
  }

  loadPackages() {
    this.packagesService.getAllPackages().subscribe(pkgs => this.packages.set(pkgs));
  }

  loadData() {
    if (this.isSuperAdmin()) {
      this.activeTab = 'companies';
      this.service.getPendingCompanyRequests().subscribe(reqs => this.companyRequests.set(reqs));
    }

    if (this.isCompanyAdmin()) {
      this.activeTab = 'joins';
      this.service.getPendingJoinRequests().subscribe(reqs => this.joinRequests.set(reqs));
    }
  }

  openConfigModal(request: CompanyRequest) {
    this.selectedRequest = request;
    this.configForm.patchValue({
      name: request.companyName
    });
    this.showConfigModal = true;
  }

  closeConfigModal() {
    this.showConfigModal = false;
    this.selectedRequest = null;
  }

  toggleFormControl(name: string) {
    const ctrl = this.configForm.get(name);
    if (ctrl) {
      ctrl.setValue(!ctrl.value);
    }
  }

  approveWithConfig() {
    if (!this.selectedRequest) return;

    this.processingId = this.selectedRequest.id;
    this.processingAction = 'approve';

    const config = this.configForm.value;

    this.service.approveCompanyRequest(this.selectedRequest.id, { config }).subscribe({
      next: () => {
        this.processingId = null;
        this.processingAction = '';
        this.showConfigModal = false;
        this.loadData();
      },
      error: () => {
        this.processingId = null;
        this.processingAction = '';
      }
    });
  }

  approveCompany(id: number) {
    this.processingId = id;
    this.processingAction = 'approve';
    this.service.approveCompanyRequest(id).subscribe({
      next: () => { this.processingId = null; this.processingAction = ''; this.loadData(); },
      error: () => { this.processingId = null; this.processingAction = ''; }
    });
  }

  rejectCompany(id: number) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.processingId = id;
      this.processingAction = 'reject';
      this.service.rejectCompanyRequest(id, reason).subscribe({
        next: () => { this.processingId = null; this.processingAction = ''; this.loadData(); },
        error: () => { this.processingId = null; this.processingAction = ''; }
      });
    }
  }

  approveJoin(id: number) {
    this.processingId = id;
    this.processingAction = 'approve';
    this.service.approveJoinRequest(id).subscribe({
      next: () => {
        this.processingId = null;
        this.processingAction = '';
        this.triggerSuccess('Request approved successfully');
        this.loadData();
      },
      error: () => { this.processingId = null; this.processingAction = ''; }
    });
  }

  rejectJoin(id: number) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.processingId = id;
      this.processingAction = 'reject';
      this.service.rejectJoinRequest(id, reason).subscribe({
        next: () => {
          this.processingId = null;
          this.processingAction = '';
          this.triggerSuccess('Request rejected');
          this.loadData();
        },
        error: () => { this.processingId = null; this.processingAction = ''; }
      });
    }
  }

  private triggerSuccess(msg: string) {
    this.successMessage.set(msg);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 4000);
  }
}
