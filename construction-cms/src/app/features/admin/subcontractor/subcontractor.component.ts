import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SubcontractorService, Subcontractor, SubcontractorContract, SubcontractorPayment, SubcontractorRating, SubcontractorSummary } from '../../../core/services/subcontractor.service';

@Component({
  selector: 'app-subcontractor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{{ 'subcontractors.title' | translate }}</h1>
            <div class="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-fit">
              <button (click)="activeTab = 'list'" 
                      [class.bg-white]="activeTab === 'list'" 
                      [class.shadow-sm]="activeTab === 'list'"
                      [class.text-slate-900]="activeTab === 'list'"
                      [class.dark:bg-slate-700]="activeTab === 'list'"
                      [class.dark:text-white]="activeTab === 'list'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'subcontractors.list' | translate }}
              </button>
              <button (click)="activeTab = 'contracts'" 
                      [class.bg-white]="activeTab === 'contracts'" 
                      [class.shadow-sm]="activeTab === 'contracts'"
                      [class.text-slate-900]="activeTab === 'contracts'"
                      [class.dark:bg-slate-700]="activeTab === 'contracts'"
                      [class.dark:text-white]="activeTab === 'contracts'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'subcontractors.contracts' | translate }}
              </button>
              <button (click)="activeTab = 'payments'" 
                      [class.bg-white]="activeTab === 'payments'" 
                      [class.shadow-sm]="activeTab === 'payments'"
                      [class.text-slate-900]="activeTab === 'payments'"
                      [class.dark:bg-slate-700]="activeTab === 'payments'"
                      [class.dark:text-white]="activeTab === 'payments'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'subcontractors.payments' | translate }}
              </button>
            </div>
          </div>

          <button (click)="openAddModal()" 
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {{ 'subcontractors.add_subcontractor' | translate }}
          </button>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-indigo-500/30 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ 'subcontractors.total' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.totalSubcontractors || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-emerald-500/30 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ 'subcontractors.active' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.activeSubcontractors || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-amber-500/30 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">{{ 'subcontractors.pending' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.pendingApproval || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-rose-500/30 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-rose-500 uppercase tracking-widest">{{ 'subcontractors.expiring' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.expiringInsurance || 0 }}</h3>
          </div>
        </div>

        <!-- Content Tabs -->
        @if (activeTab === 'list') {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
             <!-- Filters -->
             <div class="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
                <div class="flex-1 relative">
                  <input type="text" [(ngModel)]="searchTerm"
                         class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                         placeholder="Search partners by name...">
                  <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <div class="flex gap-4">
                  <select [(ngModel)]="filterTrade"
                          class="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer">
                    <option value="">All Trades</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Steel">Steel</option>
                  </select>
                  <select [(ngModel)]="filterStatus"
                          class="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
             </div>

             <!-- Partners Table -->
             <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-slate-50 dark:bg-slate-950/50">
                    <tr>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.name' | translate }}</th>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.trade' | translate }}</th>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.rating' | translate }}</th>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.projects' | translate }}</th>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.status' | translate }}</th>
                      <th class="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.actions' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    @for (sub of filteredSubcontractors; track sub.id) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td class="px-8 py-5">
                          <div class="flex items-center space-x-4">
                             <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-500 font-black group-hover:scale-110 transition-transform">
                               {{ sub.name.substring(0, 1) }}
                             </div>
                             <div>
                               <p class="text-sm font-black text-slate-900 dark:text-white">{{ sub.name }}</p>
                               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ sub.licenseNumber || 'No License' }}</p>
                             </div>
                          </div>
                        </td>
                        <td class="px-8 py-5">
                          <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{{ sub.tradeSpecialty }}</span>
                        </td>
                        <td class="px-8 py-5">
                          <div class="flex items-center space-x-2">
                             <div class="flex text-amber-400">
                                @for (star of [1,2,3,4,5]; track star) {
                                  <svg class="w-3 h-3" [class.fill-current]="star <= (sub.averageRating || 0)" [class.text-slate-200]="star > (sub.averageRating || 0)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                  </svg>
                                }
                             </div>
                             <span class="text-[10px] font-black text-slate-400 tracking-tighter">{{ (sub.averageRating ?? 0).toFixed(1) }}</span>
                          </div>
                        </td>
                        <td class="px-8 py-5">
                          <div class="flex flex-col">
                             <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ sub.totalProjectsCompleted || 0 }} {{ 'projects.completed' | translate }}</span>
                             <span class="text-[10px] font-bold text-slate-400 italic">{{ sub.totalProjectsOngoing || 0 }} {{ 'projects.active' | translate }}</span>
                          </div>
                        </td>
                        <td class="px-8 py-5">
                          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                                [ngClass]="sub.isApproved ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'">
                            {{ sub.isApproved ? ('common.approved' | translate) : ('common.pending' | translate) }}
                          </span>
                        </td>
                        <td class="px-8 py-5 text-right">
                          <div class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                             <button class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                             </button>
                             @if (!sub.isApproved) {
                               <button (click)="approveSubcontractor(sub)" class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-500/20 transition-all">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                               </button>
                             }
                             <button (click)="openEditModal(sub)" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                             </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="px-8 py-20 text-center">
                          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.no_subcontractors' | translate }}</p>
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
            @for (contract of contracts; track contract.id) {
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                 <div class="flex justify-between items-start mb-6">
                    <div class="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest">{{ contract.contractType }}</div>
                    <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                          [ngClass]="{
                            'bg-emerald-500/10 text-emerald-500': contract.status === 'Active',
                            'bg-blue-500/10 text-blue-500': contract.status === 'Completed',
                            'bg-amber-500/10 text-amber-500': contract.status === 'Draft'
                          }">
                      {{ contract.status }}
                    </span>
                 </div>
                 <h4 class="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{{ contract.title }}</h4>
                 <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{{ contract.projectName }}</p>
                 
                 <div class="space-y-4 mb-8">
                    <div class="flex justify-between items-center text-xs">
                       <span class="font-bold text-slate-500 uppercase tracking-widest">{{ 'subcontractors.amount' | translate }}</span>
                       <span class="font-black text-slate-900 dark:text-white">{{ contract.contractAmount | currency }}</span>
                    </div>
                    <div class="space-y-2">
                       <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span class="text-slate-500">{{ 'subcontractors.completion' | translate }}</span>
                          <span class="text-indigo-500">{{ contract.completionPercentage }}%</span>
                       </div>
                       <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" [style.width.%]="contract.completionPercentage"></div>
                       </div>
                    </div>
                 </div>

                 <div class="flex gap-2">
                    <button class="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Details</button>
                    <button class="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all">Add Payment</button>
                 </div>
              </div>
            }
          </div>
        }

        <!-- Payments Tab -->
        @if (activeTab === 'payments') {
           <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-slate-50 dark:bg-slate-950/50">
                    <tr>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.payment_no' | translate }}</th>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.name' | translate }}</th>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.amount' | translate }}</th>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.net_amount' | translate }}</th>
                      <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.status' | translate }}</th>
                      <th class="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.actions' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    @for (payment of filteredPayments; track payment.id) {
                      <tr>
                        <td class="px-8 py-5">
                          <span class="text-sm font-black text-slate-900 dark:text-white">{{ payment.paymentNumber }}</span>
                        </td>
                        <td class="px-8 py-5">
                          <span class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ payment.subcontractorName }}</span>
                        </td>
                        <td class="px-8 py-5">
                          <span class="text-sm font-black text-slate-900 dark:text-white">{{ payment.amount | currency }}</span>
                        </td>
                        <td class="px-8 py-5">
                          <span class="text-sm font-black text-indigo-500">{{ payment.netPayment | currency }}</span>
                        </td>
                        <td class="px-8 py-5">
                          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                [ngClass]="{
                                  'bg-emerald-500/10 text-emerald-500': payment.status === 'Paid',
                                  'bg-blue-500/10 text-blue-500': payment.status === 'Approved',
                                  'bg-amber-500/10 text-amber-500': payment.status === 'Pending'
                                }">
                            {{ payment.status }}
                          </span>
                        </td>
                        <td class="px-8 py-5 text-right">
                           @if (payment.status === 'Pending') {
                             <button (click)="approvePayment(payment)" class="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all mr-2">Approve</button>
                           }
                           @if (payment.status === 'Approved') {
                             <button (click)="markAsPaid(payment)" class="px-4 py-2 rounded-xl bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">Mark Paid</button>
                           }
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
    @if (showAddModal) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative border border-slate-200 dark:border-white/5">
          <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'subcontractors.add_subcontractor' | translate }}</h2>
            <button (click)="showAddModal = false" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white transition-all">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'subcontractors.name' | translate }}</label>
                 <input type="text" [(ngModel)]="newSubcontractor.name" 
                        class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all">
               </div>
               <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'subcontractors.trade' | translate }}</label>
                 <select [(ngModel)]="newSubcontractor.tradeSpecialty" 
                         class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none appearance-none">
                    <option value="">Select Trade</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC">HVAC</option>
                 </select>
               </div>
            </div>
            <button (click)="saveSubcontractor()" 
                    class="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
              {{ 'subcontractors.save' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class SubcontractorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
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

  constructor(private subcontractorService: SubcontractorService) { }

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
