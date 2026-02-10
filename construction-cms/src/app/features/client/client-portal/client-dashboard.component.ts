import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClientPortalService, ClientDashboard, ClientProjectSummary, ClientPaymentSummary, ClientMessage, ClientActivity } from '../../../core/services/client-portal.service';
import { AuthService } from '../../../core/services/auth.service';

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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <!-- Projects -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-indigo-500/30 transition-all">
            <div class="flex items-center justify-between mb-6">
              <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shadow-inner">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ 'client_portal.active_projects' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ dashboard?.projects?.length || 0 }}</h3>
          </div>

          <!-- Payments -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-emerald-500/30 transition-all">
            <div class="flex items-center justify-between mb-6">
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ 'client_portal.pending_payment' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.pendingAmount || 0) }}</h3>
          </div>

          <!-- Messages -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-amber-500/30 transition-all">
            <div class="flex items-center justify-between mb-6">
              <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-inner">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">{{ 'client_portal.unread_messages' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ dashboard?.unreadMessagesCount || 0 }}</h3>
          </div>

          <!-- Change Orders -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-purple-500/30 transition-all">
            <div class="flex items-center justify-between mb-6">
              <div class="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform shadow-inner">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <span class="text-[10px] font-black text-purple-500 uppercase tracking-widest">{{ 'client_portal.pending_change_orders' | translate }}</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ dashboard?.pendingChangeOrdersCount || 0 }}</h3>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <!-- Left Column: Projects & Payments -->
          <div class="lg:col-span-2 space-y-10">
            
            <!-- Projects Hub -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
               <div class="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                  <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'client_portal.your_projects' | translate }}</h2>
                  <a routerLink="/client-portal/projects" class="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">View All</a>
               </div>
               
               <div class="p-4">
                 @for (project of dashboard?.projects; track project.projectId) {
                    <div class="group mx-2 my-2 p-6 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                       <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div class="flex-1">
                            <h3 class="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{{ project.projectName }}</h3>
                            <div class="flex items-center gap-4 text-slate-400">
                               <span class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                                 <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                 {{ project.location || 'N/A' }}
                               </span>
                               <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                                     [ngClass]="{
                                       'bg-emerald-500/10 text-emerald-500': project.status === 'Active',
                                       'bg-amber-500/10 text-amber-500': project.status === 'Pending',
                                       'bg-rose-500/10 text-rose-500': project.status === 'Delayed'
                                     }">
                                 {{ project.status }}
                               </span>
                            </div>
                         </div>
                         
                         <div class="w-full md:w-48">
                            <div class="flex items-center justify-between mb-2">
                               <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ project.progressPercentage }}% {{ 'common.completed' | translate }}</span>
                            </div>
                            <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000" [style.width.%]="project.progressPercentage"></div>
                            </div>
                         </div>

                         <a [routerLink]="['/client-portal/projects', project.projectId]" 
                            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all active:scale-95">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
                         </a>
                       </div>
                    </div>
                 } @empty {
                   <div class="text-center py-20 opacity-40">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em]">{{ 'client_portal.no_projects' | translate }}</p>
                   </div>
                 }
               </div>
            </div>

            <!-- Payment Breakdown -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl p-10">
               <div class="flex items-center justify-between mb-10">
                  <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'client_portal.payment_summary' | translate }}</h2>
                  <a routerLink="/client-portal/payments" class="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Full Ledger</a>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                     <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client_portal.total_invoiced' | translate }}</p>
                     <p class="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.totalInvoiced || 0) }}</p>
                  </div>
                  <div class="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                     <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">{{ 'client_portal.total_paid' | translate }}</p>
                     <p class="text-2xl font-black text-emerald-600 tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.totalPaid || 0) }}</p>
                  </div>
                  <div class="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10">
                     <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">{{ 'client_portal.pending_payment' | translate }}</p>
                     <p class="text-2xl font-black text-amber-600 tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.pendingAmount || 0) }}</p>
                  </div>
                  <div class="p-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/10">
                     <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">{{ 'client_portal.overdue' | translate }}</p>
                     <p class="text-2xl font-black text-rose-600 tracking-tighter">{{ formatCurrency(dashboard?.paymentSummary?.overdueAmount || 0) }}</p>
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
export class ClientDashboardComponent implements OnInit {
  private clientPortalService = inject(ClientPortalService);
  private authService = inject(AuthService);

  dashboard?: ClientDashboard;
  clientUser: any;

  ngOnInit() {
    this.clientUser = this.authService.getCurrentUser();
    this.loadDashboard();
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
