import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ClientPortalService, ClientDashboard, ClientProjectSummary, ClientPaymentSummary, ClientMessage, ClientActivity } from '../../../core/services/client-portal.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div class="space-y-2">
            <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ 'client_portal.welcome' | translate }}, <span class="text-indigo-600 dark:text-indigo-400">{{ clientUser?.fullName || 'Client' }}</span>
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">{{ 'client_portal.overview' | translate }}</p>
          </div>
          <div class="flex items-center gap-4">
             <a routerLink="/client-portal/messages" 
                class="px-8 py-4 rounded-[2rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
               <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
               {{ 'client_portal.new_message' | translate }}
             </a>
             <a routerLink="/client-portal/change-orders"
                class="px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center">
               <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
               {{ 'client_portal.change_request' | translate }}
             </a>
          </div>
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <!-- Projects -->
          <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl p-6 group hover:-translate-y-1 transition-all duration-300">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            
            <div class="flex items-center justify-between mb-4 relative z-10">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <span class="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{{ 'client_portal.active_projects' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10">{{ dashboard?.projects?.length || 0 }}</h3>
            <p class="text-xs text-slate-400 font-medium mt-1">In Progress</p>
          </div>

          <!-- Payments -->
          <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl p-6 group hover:-translate-y-1 transition-all duration-300">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>

            <div class="flex items-center justify-between mb-4 relative z-10">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">{{ 'client_portal.pending_payment' | translate }}</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10">{{ formatCurrency(dashboard?.paymentSummary?.pendingAmount || 0) }}</h3>
            <p class="text-xs text-slate-400 font-medium mt-1">Total Outstanding</p>
          </div>

          <!-- Messages -->
          <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl p-6 group hover:-translate-y-1 transition-all duration-300">
             <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>

            <div class="flex items-center justify-between mb-4 relative z-10">
              <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest">{{ 'client_portal.unread_messages' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10">{{ dashboard?.unreadMessagesCount || 0 }}</h3>
            <p class="text-xs text-slate-400 font-medium mt-1">Unread</p>
          </div>

          <!-- Change Orders -->
          <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl p-6 group hover:-translate-y-1 transition-all duration-300">
             <div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>

            <div class="flex items-center justify-between mb-4 relative z-10">
              <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <span class="text-[10px] font-black text-purple-500 dark:text-purple-400 uppercase tracking-widest">{{ 'client_portal.pending_change_orders' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10">{{ dashboard?.pendingChangeOrdersCount || 0 }}</h3>
             <p class="text-xs text-slate-400 font-medium mt-1">Pending Approval</p>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Column: Projects & Payments -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Projects Hub -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
               <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-sm">
                  <div class="flex items-center gap-3">
                     <div class="w-2 h-8 rounded-full bg-indigo-500"></div>
                     <h2 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'client_portal.your_projects' | translate }}</h2>
                  </div>
                  <a routerLink="/client-portal/projects" class="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:border-indigo-500 transition-colors shadow-sm">View All</a>
               </div>
               
               <div class="p-6 space-y-4">
                 @for (project of dashboard?.projects; track project.projectId) {
                    <div class="group relative overflow-hidden bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 hover:border-indigo-500/30">
                       <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       
                       <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                               <h3 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ project.projectName }}</h3>
                               <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                                     [ngClass]="{
                                       'bg-emerald-500/10 text-emerald-600 border-emerald-500/20': project.status === 'Active',
                                       'bg-amber-500/10 text-amber-600 border-amber-500/20': project.status === 'Pending',
                                       'bg-rose-500/10 text-rose-600 border-rose-500/20': project.status === 'Delayed'
                                     }">
                                 {{ project.status }}
                               </span>
                            </div>
                            
                            <div class="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                               <span class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                                 <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                 {{ project.location || 'N/A' }}
                               </span>
                            </div>
                         </div>
                         
                         <div class="w-full md:w-56 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                            <div class="flex items-center justify-between mb-2">
                               <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                               <span class="text-xs font-black text-slate-900 dark:text-white">{{ project.progressPercentage }}%</span>
                            </div>
                            <div class="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                               <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/30" [style.width.%]="project.progressPercentage"></div>
                            </div>
                         </div>

                         <a [routerLink]="['/client-portal/projects', project.projectId]" 
                            class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 dark:hover:bg-indigo-600 transition-all active:scale-95 shadow-lg">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                         </a>
                       </div>
                    </div>
                 } @empty {
                   <div class="flex flex-col items-center justify-center py-20 text-center">
                      <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      </div>
                      <p class="text-slate-500 dark:text-slate-400 font-bold">{{ 'client_portal.no_projects' | translate }}</p>
                   </div>
                 }
               </div>
            </div>

            <!-- Payment Breakdown -->
            <div class="bg-indigo-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
               <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
               <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

               <div class="relative z-10 p-8">
                  <div class="flex items-center justify-between mb-8">
                     <div>
                        <h2 class="text-xl font-black text-white uppercase tracking-tight">{{ 'client_portal.payment_summary' | translate }}</h2>
                        <p class="text-indigo-200 text-xs font-medium mt-1">Financial Overview</p>
                     </div>
                     <a routerLink="/client-portal/payments" class="px-5 py-2.5 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10">Full Ledger</a>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div class="p-5 rounded-[1.5rem] bg-indigo-950/50 border border-indigo-500/20 backdrop-blur-sm">
                        <p class="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">{{ 'client_portal.total_invoiced' | translate }}</p>
                        <p class="text-2xl font-black text-white tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.totalInvoiced || 0) }}</p>
                     </div>
                     <div class="p-5 rounded-[1.5rem] bg-indigo-950/50 border border-indigo-500/20 backdrop-blur-sm">
                        <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{{ 'client_portal.total_paid' | translate }}</p>
                        <p class="text-2xl font-black text-emerald-400 tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.totalPaid || 0) }}</p>
                     </div>
                     <div class="p-5 rounded-[1.5rem] bg-indigo-950/50 border border-indigo-500/20 backdrop-blur-sm">
                        <p class="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">{{ 'client_portal.pending_payment' | translate }}</p>
                        <p class="text-2xl font-black text-amber-400 tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.pendingAmount || 0) }}</p>
                     </div>
                     <div class="p-5 rounded-[1.5rem] bg-indigo-950/50 border border-indigo-500/20 backdrop-blur-sm">
                        <p class="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{{ 'client_portal.overdue' | translate }}</p>
                        <p class="text-2xl font-black text-rose-400 tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.overdueAmount || 0) }}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Right Column: Messages & Activity -->
          <div class="space-y-10">
            
            <!-- Quick Link Cards -->
            <div class="grid grid-cols-2 gap-4">
               <a routerLink="/client-portal/documents" class="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all text-center">
                  <div class="w-10 h-10 rounded-xl bg-white/20 mx-auto flex items-center justify-center mb-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest leading-tight">{{ 'client_portal.project_documents' | translate }}</p>
               </a>
               <a routerLink="/client-portal/settings" class="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl hover:scale-105 active:scale-95 transition-all text-center">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-3">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <p class="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-tight">{{ 'client_portal.account_settings' | translate }}</p>
               </a>
            </div>

            <!-- Recent Messages -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl p-8">
               <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8">{{ 'client_portal.recent_messages' | translate }}</h3>
               
               <div class="space-y-6">
                 @for (msg of dashboard?.recentMessages; track msg.id) {
                    <div class="flex items-start gap-4">
                       <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg"
                            [ngClass]="msg.isUnread ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'">
                         {{ msg.isUnread ? '📩' : '✉️' }}
                       </div>
                       <div class="flex-1 min-w-0">
                          <p class="text-xs font-black text-slate-900 dark:text-white truncate">{{ msg.subject }}</p>
                          <p class="text-[10px] text-slate-400 font-medium truncate mt-0.5">{{ msg.content }}</p>
                          <p class="text-[8px] font-black uppercase text-indigo-500 mt-2 tracking-widest">{{ msg.createdAt | date:'shortTime' }}</p>
                       </div>
                    </div>
                 } @empty {
                   <div class="text-center py-10 opacity-30">
                      <p class="text-[10px] font-black uppercase tracking-widest">{{ 'client_portal.no_messages' | translate }}</p>
                   </div>
                 }
               </div>
            </div>

            <!-- Activity Log -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl p-8">
               <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8">{{ 'client_portal.recent_activity' | translate }}</h3>
               
               <div class="space-y-8 relative">
                 <div class="absolute left-[19px] top-2 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                 
                 @for (activity of dashboard?.recentActivities; track activity.createdAt) {
                    <div class="relative pl-12">
                       <div class="absolute left-0 top-0 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 flex items-center justify-center z-10">
                          <div class="w-2.5 h-2.5 rounded-full"
                               [ngClass]="{
                                 'bg-emerald-500': activity.activityType === 'Payment',
                                 'bg-indigo-500': activity.activityType === 'Document',
                                 'bg-amber-500': activity.activityType === 'Message',
                                 'bg-purple-500': activity.activityType === 'Update'
                               }"></div>
                       </div>
                       <p class="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-snug">{{ activity.description }}</p>
                       <p class="text-[8px] font-black uppercase text-slate-400 mt-1 tracking-widest">{{ activity.createdAt | date:'MMM d, h:mm a' }}</p>
                    </div>
                 }
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private clientPortalService = inject(ClientPortalService);
  private authService = inject(AuthService);
  private i18nService = inject(I18nService);

  dashboard?: ClientDashboard;
  clientUser: any;

  ngOnInit() {
    this.clientUser = this.authService.getCurrentUser();
    this.loadDashboard();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboard();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard() {
    this.clientPortalService.getClientDashboard().subscribe((data: ClientDashboard) => {
      this.dashboard = data;
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('paid') || s.includes('approved') || s.includes('completed')) return 'success';
    if (s.includes('pending') || s.includes('progress') || s.includes('review')) return 'warning';
    if (s.includes('delayed') || s.includes('overdue') || s.includes('rejected')) return 'danger';
    return 'info';
  }
}
