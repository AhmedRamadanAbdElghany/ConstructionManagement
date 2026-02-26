import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SubcontractorService, Subcontractor, SubcontractorContract, SubcontractorPayment, SubcontractorRating, SubcontractorSummary } from '../../../core/services/subcontractor.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-subcontractor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500 font-['Outfit']">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-premium-fade">
          <div class="space-y-1">
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase drop-shadow-sm">
              {{ 'subcontractors.title' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium italic opacity-80">
              Manage partnerships, contracts, and settlements
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="flex p-1.5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <button (click)="activeTab = 'list'" 
                      [class.bg-gradient-to-r]="activeTab === 'list'"
                      [class.from-indigo-600]="activeTab === 'list'"
                      [class.to-blue-700]="activeTab === 'list'"
                      [class.text-white]="activeTab === 'list'"
                      [class.shadow-lg]="activeTab === 'list'"
                      class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-indigo-500">
                  {{ 'subcontractors.list' | translate }}
              </button>
              <button (click)="activeTab = 'contracts'" 
                      [class.bg-gradient-to-r]="activeTab === 'contracts'"
                      [class.from-indigo-600]="activeTab === 'contracts'"
                      [class.to-blue-700]="activeTab === 'contracts'"
                      [class.text-white]="activeTab === 'contracts'"
                      [class.shadow-lg]="activeTab === 'contracts'"
                      class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-indigo-500">
                  {{ 'subcontractors.contracts' | translate }}
              </button>
              <button (click)="activeTab = 'payments'" 
                      [class.bg-gradient-to-r]="activeTab === 'payments'"
                      [class.from-indigo-600]="activeTab === 'payments'"
                      [class.to-blue-700]="activeTab === 'payments'"
                      [class.text-white]="activeTab === 'payments'"
                      [class.shadow-lg]="activeTab === 'payments'"
                      class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-indigo-500">
                  {{ 'subcontractors.payments' | translate }}
              </button>
            </div>
            <button (click)="openAddModal()" 
                    class="px-10 py-5 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-95 transition-all">
              + {{ 'subcontractors.add_subcontractor' | translate }}
            </button>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 group hover:border-indigo-500/30 transition-all animate-premium-fade" style="animation-delay: 200ms">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-indigo-500/10">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-60">{{ 'subcontractors.total' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{{ summary?.totalSubcontractors || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 group hover:border-emerald-500/30 transition-all animate-premium-fade" style="animation-delay: 300ms">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-emerald-500/10">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-60">{{ 'subcontractors.active' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{{ summary?.activeSubcontractors || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 group hover:border-amber-500/30 transition-all animate-premium-fade" style="animation-delay: 400ms">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-amber-500/10">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest opacity-60">{{ 'subcontractors.pending' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{{ summary?.pendingApproval || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 group hover:border-rose-500/30 transition-all animate-premium-fade" style="animation-delay: 500ms">
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-rose-500/10">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-rose-500 uppercase tracking-widest opacity-60">{{ 'subcontractors.expiring' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{{ summary?.expiringInsurance || 0 }}</h3>
          </div>
        </div>
        </div>

        <!-- Content Tabs -->
        @if (activeTab === 'list') {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden animate-premium-fade" style="animation-delay: 600ms">
             <!-- Filters -->
             <div class="p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-6 bg-slate-50/50 dark:bg-white/[0.02]">
                <div class="flex-1 relative group">
                  <input type="text" [(ngModel)]="searchTerm"
                         class="w-full pl-14 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black italic outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                         placeholder="Search partners by name...">
                  <svg class="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <div class="flex gap-4">
                  <div class="relative group">
                    <select [(ngModel)]="filterTrade"
                            class="appearance-none px-10 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] outline-none cursor-pointer focus:border-indigo-500 transition-all shadow-sm pr-12">
                      <option value="">All Trades</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Concrete">Concrete</option>
                      <option value="Steel">Steel</option>
                    </select>
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  <div class="relative group">
                    <select [(ngModel)]="filterStatus"
                            class="appearance-none px-10 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] outline-none cursor-pointer focus:border-indigo-500 transition-all shadow-sm pr-12">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
             </div>

             <!-- Partners Table -->
             <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-950/50">
                      <th class="px-10 py-6">{{ 'subcontractors.name' | translate }}</th>
                      <th class="px-10 py-6">{{ 'subcontractors.trade' | translate }}</th>
                      <th class="px-10 py-6">{{ 'subcontractors.rating' | translate }}</th>
                      <th class="px-10 py-6">{{ 'subcontractors.projects' | translate }}</th>
                      <th class="px-10 py-6">{{ 'subcontractors.status' | translate }}</th>
                      <th class="px-10 py-6 text-right">{{ 'subcontractors.actions' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600 dark:text-slate-300">
                    @for (sub of filteredSubcontractors; track sub.id; let i = $index) {
                      <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-premium-fade"
                          [style.animation-delay]="(i * 30 + 700) + 'ms'">
                        <td class="px-10 py-6">
                          <div class="flex items-center space-x-5">
                             <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                               {{ sub.name.substring(0, 1) }}
                             </div>
                             <div>
                               <p class="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">{{ sub.name }}</p>
                               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{{ sub.licenseNumber || 'UNLICENSED' }}</p>
                             </div>
                          </div>
                        </td>
                        <td class="px-10 py-6">
                          <span class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/5">{{ sub.tradeSpecialty }}</span>
                        </td>
                        <td class="px-10 py-6">
                          <div class="flex items-center space-x-3">
                             <div class="flex text-amber-500 gap-0.5">
                                @for (star of [1,2,3,4,5]; track star) {
                                  <svg class="w-3.5 h-3.5" [class.fill-current]="star <= (sub.averageRating || 0)" [class.text-slate-200]="star > (sub.averageRating || 0)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                  </svg>
                                }
                             </div>
                             <span class="text-[11px] font-black text-slate-900 dark:text-white tracking-tight">{{ (sub.averageRating ?? 0).toFixed(1) }}</span>
                          </div>
                        </td>
                        <td class="px-10 py-6">
                          <div class="flex flex-col gap-1">
                             <div class="flex items-center gap-2">
                               <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                               <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{{ sub.totalProjectsCompleted || 0 }} {{ 'projects.completed' | translate }}</span>
                             </div>
                             <div class="flex items-center gap-2 opacity-60">
                               <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                               <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ sub.totalProjectsOngoing || 0 }} {{ 'projects.active' | translate }}</span>
                             </div>
                          </div>
                        </td>
                        <td class="px-10 py-6">
                          <span class="px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg ring-1 ring-inset"
                                [ngClass]="sub.isApproved ? 'bg-emerald-500 shadow-emerald-500/10 text-white ring-emerald-400' : 'bg-amber-500 shadow-amber-500/10 text-white ring-amber-400'">
                            {{ sub.isApproved ? ('common.approved' | translate) : ('common.pending' | translate) }}
                          </span>
                        </td>
                        <td class="px-10 py-6 text-right">
                          <div class="flex items-center justify-end gap-2">
                             <button class="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-white/10 shadow-sm transition-all active:scale-95 group/btn" [title]="'common.view' | translate">
                               <svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                             </button>
                             @if (!sub.isApproved) {
                               <button (click)="approveSubcontractor(sub)" class="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95 group/btn" [title]="'common.approve' | translate">
                                 <svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                               </button>
                             }
                             <button (click)="openEditModal(sub)" class="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-white/10 shadow-sm transition-all active:scale-95 group/btn" [title]="'common.edit' | translate">
                               <svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                             </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="px-10 py-32 text-center">
                          <div class="flex flex-col items-center justify-center opacity-40">
                             <svg class="w-20 h-20 text-slate-300 dark:text-slate-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                             <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{{ 'subcontractors.no_subcontractors' | translate }}</p>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
          </div>
        }

        <!-- Contracts Tab -->
        @if (activeTab === 'contracts') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (contract of contracts; track contract.id; let i = $index) {
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 hover:shadow-indigo-500/10 transition-all duration-500 group animate-premium-fade"
                   [style.animation-delay]="(i * 50 + 200) + 'ms'">
                 <div class="flex justify-between items-start mb-8">
                    <div class="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/10 shadow-sm">{{ contract.contractType }}</div>
                    <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset"
                          [ngClass]="{
                            'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20': contract.status === 'Active',
                            'bg-blue-500/10 text-blue-600 ring-blue-500/20': contract.status === 'Completed',
                            'bg-amber-500/10 text-amber-600 ring-amber-500/20': contract.status === 'Draft'
                          }">
                      {{ contract.status }}
                    </span>
                 </div>
                 
                 <div class="mb-8">
                   <h4 class="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">{{ contract.title }}</h4>
                   <div class="flex items-center gap-2">
                     <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                     <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{{ contract.projectName }}</p>
                   </div>
                 </div>
                 
                 <div class="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mb-8">
                    <div class="flex justify-between items-center mb-6">
                       <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.amount' | translate }}</span>
                       <span class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ contract.contractAmount | currency }}</span>
                    </div>
                    <div class="space-y-3">
                       <div class="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span class="text-slate-400">{{ 'subcontractors.completion' | translate }}</span>
                          <span class="text-indigo-500">{{ contract.completionPercentage }}%</span>
                       </div>
                       <div class="h-3 w-full bg-slate-200 dark:bg-slate-950/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div class="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full shadow-lg shadow-indigo-500/30 group-hover:animate-premium-pulse transition-all duration-1000" [style.width.%]="contract.completionPercentage"></div>
                       </div>
                    </div>
                 </div>

                 <div class="flex gap-4">
                    <button class="flex-1 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-white/5 transition-all duration-300">
                      Details
                    </button>
                    <button class="flex-1 py-4 rounded-[1.5rem] bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all duration-300">
                      Add Payment
                    </button>
                 </div>
              </div>
            }
          </div>
        }

        <!-- Payments Tab -->
        @if (activeTab === 'payments') {
           <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden animate-premium-fade" style="animation-delay: 200ms">
              <div class="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'subcontractors.payments' | translate }}</h2>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-950/50">
                      <th class="px-10 py-6">{{ 'subcontractors.payment_no' | translate }}</th>
                      <th class="px-10 py-6">{{ 'subcontractors.name' | translate }}</th>
                      <th class="px-10 py-6">{{ 'subcontractors.amount' | translate }}</th>
                      <th class="px-10 py-6">{{ 'subcontractors.net_amount' | translate }}</th>
                      <th class="px-10 py-6">{{ 'subcontractors.status' | translate }}</th>
                      <th class="px-10 py-6 text-right">{{ 'subcontractors.actions' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600 dark:text-slate-300">
                    @for (payment of filteredPayments; track payment.id; let i = $index) {
                      <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-premium-fade"
                          [style.animation-delay]="(i * 30 + 400) + 'ms'">
                        <td class="px-10 py-6">
                          <span class="text-sm font-black text-slate-900 dark:text-white tracking-tight">{{ payment.paymentNumber }}</span>
                        </td>
                        <td class="px-10 py-6">
                          <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-80">{{ payment.subcontractorName }}</p>
                        </td>
                        <td class="px-10 py-6">
                          <span class="text-sm font-black text-slate-600 dark:text-slate-400">{{ payment.amount | currency }}</span>
                        </td>
                        <td class="px-10 py-6">
                          <span class="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{{ payment.netPayment | currency }}</span>
                        </td>
                        <td class="px-10 py-6">
                          <span class="px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset"
                                [ngClass]="{
                                  'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20': payment.status === 'Paid',
                                  'bg-blue-500/10 text-blue-600 ring-blue-500/20': payment.status === 'Approved',
                                  'bg-amber-500/10 text-amber-600 ring-amber-500/20': payment.status === 'Pending'
                                }">
                            {{ payment.status }}
                          </span>
                        </td>
                        <td class="px-10 py-6 text-right">
                          <div class="flex justify-end gap-3">
                            @if (payment.status === 'Pending') {
                              <button (click)="approvePayment(payment)" class="px-8 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95">Approve</button>
                            }
                            @if (payment.status === 'Approved') {
                              <button (click)="markAsPaid(payment)" class="px-8 py-3 rounded-xl bg-blue-500/10 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-95">Mark Paid</button>
                            }
                            <button class="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-500 hover:bg-white transition-all shadow-sm">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
           </div>
        }
      </div>
    </div>

    <!-- Add/Edit Modal (Partial Implementation for brevity) -->
    <!-- Add/Edit Modal -->
    @if (showAddModal) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-premium-fade" style="animation-duration: 300ms">
        <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] dark:shadow-none relative border border-slate-200 dark:border-white/10 overflow-hidden animate-premium-slide-up">
          <div class="p-10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div class="space-y-1">
              <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'subcontractors.add_subcontractor' | translate }}</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">Partner Information</p>
            </div>
            <button (click)="showAddModal = false" class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm flex items-center justify-center">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-10 space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div class="space-y-3">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'subcontractors.name' | translate }}</label>
                 <div class="relative group">
                   <input type="text" [(ngModel)]="newSubcontractor.name" 
                          class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner">
                 </div>
               </div>
               <div class="space-y-3">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'subcontractors.trade' | translate }}</label>
                 <div class="relative group">
                   <select [(ngModel)]="newSubcontractor.tradeSpecialty" 
                           class="w-full appearance-none px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none transition-all shadow-inner pr-12 focus:border-indigo-500">
                      <option value="">Select Trade</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Concrete">Concrete</option>
                      <option value="Steel">Steel</option>
                   </select>
                   <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                   </div>
                 </div>
               </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div class="space-y-3">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">License Number</label>
                 <input type="text" [(ngModel)]="newSubcontractor.licenseNumber" 
                        class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner">
               </div>
               <div class="space-y-3">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Person</label>
                 <input type="text" [(ngModel)]="newSubcontractor.contactPerson" 
                        class="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner">
               </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button (click)="showAddModal = false" 
                      class="flex-1 py-5 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 hover:text-rose-500 shadow-sm border border-slate-200 dark:border-white/5 transition-all duration-300">
                Discard
              </button>
              <button (click)="saveSubcontractor()" 
                      class="flex-[2] py-5 rounded-[1.5rem] bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_16px_32px_-8px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_40px_-8px_rgba(79,70,229,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300">
                {{ 'subcontractors.save' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class SubcontractorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);
  activeTab = 'list';
  searchTerm = '';
  filterTrade = '';
  filterStatus = '';
  paymentFilter = 'all';
  showAddModal = false;

  summary: SubcontractorSummary | null = null;
  subcontractors: Subcontractor[] = [];
  contracts: SubcontractorContract[] = [];
  payments: SubcontractorPayment[] = [];
  ratings: SubcontractorRating[] = [];

  newSubcontractor: Partial<Subcontractor> = {
    name: '',
    tradeSpecialty: ''
  };

  constructor(private subcontractorService: SubcontractorService) {
    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    forkJoin({
      summary: this.subcontractorService.getSummary(),
      subs: this.subcontractorService.getSubcontractors(),
      contracts: this.subcontractorService.getAllContracts(),
      payments: this.subcontractorService.getAllPayments(),
      ratings: this.subcontractorService.getAllRatings()
    }).pipe(takeUntil(this.destroy$)).subscribe(results => {
      this.summary = results.summary;
      this.subcontractors = results.subs;
      this.contracts = results.contracts;
      this.payments = results.payments;
      this.ratings = results.ratings;
    });
  }

  get filteredSubcontractors(): Subcontractor[] {
    return this.subcontractors.filter(sub => {
      const matchesSearch = !this.searchTerm ||
        sub.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesTrade = !this.filterTrade || sub.tradeSpecialty === this.filterTrade;
      const matchesStatus = !this.filterStatus ||
        (this.filterStatus === 'active' && sub.isActive) ||
        (this.filterStatus === 'pending' && !sub.isApproved) ||
        (this.filterStatus === 'inactive' && !sub.isActive);
      return matchesSearch && matchesTrade && matchesStatus;
    });
  }

  get filteredPayments(): SubcontractorPayment[] {
    if (this.paymentFilter === 'all') return this.payments;
    return this.payments.filter(p => p.status.toLowerCase() === this.paymentFilter);
  }

  openAddModal() {
    this.newSubcontractor = { name: '', tradeSpecialty: '' };
    this.showAddModal = true;
  }

  openEditModal(sub: Subcontractor) {
    this.newSubcontractor = { ...sub };
    this.showAddModal = true;
  }

  saveSubcontractor() {
    if (!this.newSubcontractor.name) return;

    const obs = (this.newSubcontractor as any).id
      ? this.subcontractorService.updateSubcontractor((this.newSubcontractor as any).id, this.newSubcontractor as any)
      : this.subcontractorService.createSubcontractor(this.newSubcontractor as any);

    obs.subscribe(() => {
      this.showAddModal = false;
      this.loadData();
    });
  }

  approveSubcontractor(sub: Subcontractor) {
    this.subcontractorService.approveSubcontractor(sub.id, { approvedBy: 1 }).subscribe(() => {
      this.loadData();
    });
  }

  approvePayment(payment: SubcontractorPayment) {
    this.subcontractorService.updatePaymentStatus(payment.id, { status: 'Approved' }).subscribe(() => {
      this.loadData();
    });
  }

  markAsPaid(payment: SubcontractorPayment) {
    this.subcontractorService.updatePaymentStatus(payment.id, { status: 'Paid', paymentDate: new Date() }).subscribe(() => {
      this.loadData();
    });
  }
}
