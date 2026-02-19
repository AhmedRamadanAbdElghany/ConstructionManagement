import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PendingRequestsService, PublicCompany, JoinRequest } from '../../../core/services/pending-requests.service';
import { AuthService } from '../../../core/services/auth.service';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { CompanyAnnouncement } from '../../../core/models/announcement.model';
import { CompanyPortfolioComponent } from '../../admin/company-settings/company-portfolio/company-portfolio.component';

@Component({
  selector: 'app-browse-firms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, CompanyPortfolioComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{{ 'browse_firms.title' | translate }}</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'browse_firms.subtitle' | translate }}</p>
        </div>

        <!-- Search -->
        <div class="mb-12">
          <div class="relative max-w-md">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input [(ngModel)]="searchQuery" type="text" placeholder="{{ 'browse_firms.search_placeholder' | translate }}"
                   class="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all shadow-sm" />
          </div>
        </div>

        <!-- Approved Companies (My Companies) -->
        @if (approvedCompanies.length > 0) {
          <div class="mb-12">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-1 h-6 rounded-full bg-emerald-500"></div>
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'browse_firms.my_active_companies' | translate }}</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (req of approvedCompanies; track req.id) {
                <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                  
                  <div class="relative z-10">
                    <div class="flex items-center justify-between mb-6">
                      <div class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl">
                        {{ req.companyName.charAt(0) }}
                      </div>
                      <span class="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20">
                        {{ 'browse_firms.active_member' | translate }}
                      </span>
                    </div>
                    
                    <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">{{ req.companyName }}</h3>
                    <p class="text-xs text-slate-400 font-medium mb-6">Joined {{ req.createdAt | date:'mediumDate' }}</p>
                    
                    <a routerLink="/client-portal/dashboard" class="flex items-center justify-center w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition-all shadow-lg shadow-emerald-500/10">
                      {{ 'browse_firms.go_to_dashboard' | translate }}
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Pending Requests -->
        @if (pendingRequests.length > 0) {
          <div class="mb-12">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-1 h-6 rounded-full bg-amber-500"></div>
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'browse_firms.pending_approval' | translate }}</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (req of pendingRequests; track req.id) {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-amber-200 dark:border-amber-500/20 shadow-xl p-8 relative overflow-hidden">
                   <div class="absolute inset-0 bg-amber-50/50 dark:bg-amber-900/5"></div>
                   
                   <div class="relative z-10 flex flex-col h-full">
                     <div class="flex items-center justify-between mb-6">
                        <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-lg">
                          {{ req.companyName.charAt(0) }}
                        </div>
                        <span class="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-500/20">
                          {{ 'browse_firms.pending' | translate }}
                        </span>
                     </div>
                     
                     <h3 class="text-lg font-black text-slate-900 dark:text-white mb-1">{{ req.companyName }}</h3>
                     <p class="text-xs text-slate-500 dark:text-slate-400 mb-6 flex-grow">{{ 'browse_firms.request_sent_on' | translate }} {{ req.createdAt | date:'mediumDate' }}</p>
                     
                     <div class="w-full py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-amber-200 dark:border-amber-500/20 text-center">
                        <span class="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{{ 'browse_firms.waiting_for_admin' | translate }}</span>
                     </div>
                   </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Available Companies -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-6 rounded-full bg-indigo-500"></div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'browse_firms.available_firms' | translate }}</h2>
          </div>

          @if (filteredAvailableCompanies.length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (company of filteredAvailableCompanies; track company.id) {
                <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
                  
                  <div class="p-8 relative z-10">
                    <div class="flex items-start justify-between mb-6">
                      @if (company.logoUrl) {
                        <img [src]="company.logoUrl" class="w-14 h-14 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5" alt="{{ company.name }} logo">
                      } @else {
                        <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                          {{ company.name.charAt(0) }}
                        </div>
                      }
                      
                      <button (click)="toggleSubscription(company)" 
                        [class]="company.isSubscribed ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'"
                        class="px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        @if (company.isSubscribed) {
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                          {{ 'browse_firms.subscribed' | translate }}
                        } @else {
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                          {{ 'browse_firms.subscribe' | translate }}
                        }
                      </button>
                    </div>
                    
                    <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ company.name }}</h3>
                    
                    <div class="flex items-center gap-4 mb-6">
                       <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         {{ company.completedProjectsCount }} {{ 'browse_firms.done' | translate }}
                       </span>
                       <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                         {{ company.subscriberCount }} {{ 'browse_firms.subs' | translate }}
                       </span>
                    </div>

                    @if (company.address) {
                      <p class="text-xs text-slate-400 font-bold flex items-center uppercase tracking-widest mb-6">
                         <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                         <span class="truncate">{{ company.address }}</span>
                      </p>
                    } @else {
                      <p class="text-xs text-slate-400 font-medium mb-6">{{ 'browse_firms.location_not_specified' | translate }}</p>
                    }

                    <div class="flex flex-col gap-2">
                      <div class="flex gap-2">
                         <button (click)="openPortfolio(company)" 
                           class="flex-1 flex items-center justify-center py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-indigo-600 transition-all">
                           {{ 'browse_firms.view_work' | translate }}
                         </button>
                         <button (click)="openJoinModal(company)"
                           class="flex-1 flex items-center justify-center py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all">
                           {{ 'browse_firms.join_request' | translate }}
                         </button>
                      </div>
                      <button (click)="openAnnouncementsModal(company)"
                        class="w-full py-3 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                        {{ 'browse_firms.view_announcements' | translate }}
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else if (!loading) {
            <div class="text-center py-20 rounded-[3rem] bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700">
               <p class="text-slate-400 font-bold">{{ 'common.no_results' | translate }}</p>
            </div>
          }
        </div>

        @if (loading) {
          <div class="text-center py-20">
            <svg class="animate-spin h-10 w-10 mx-auto text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-slate-400 font-black uppercase tracking-widest text-sm">{{ 'common.loading' | translate }}...</p>
          </div>
        }
      </div>

      <!-- Join Request Modal -->
      @if (showJoinModal && selectedCompany) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-[0.98] duration-300 border border-white/10">
            
            <!-- Modal Header -->
            <div class="p-8 pb-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">
                  {{ selectedCompany.name.charAt(0) }}
                </div>
                <div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'browse_firms.join_request' | translate }}</h2>
                  <p class="text-xs text-slate-400 font-bold">{{ 'browse_firms.to' | translate }}: {{ selectedCompany.name }}</p>
                </div>
              </div>
              <button (click)="showJoinModal = false" class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-8 space-y-6">
              <!-- Message -->
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{{ 'browse_firms.message_optional' | translate }}</label>
                <textarea [(ngModel)]="joinForm.message" rows="3" placeholder="{{ 'browse_firms.join_message_placeholder' | translate }}"
                  class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"></textarea>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-8 pt-4 flex justify-end space-x-4 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button (click)="showJoinModal = false" class="px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-800 dark:hover:text-white transition-all">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="submitJoinRequest()" [disabled]="isSubmitting"
                class="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                @if (isSubmitting) {
                  <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                }
                {{ isSubmitting ? ('common.sending' | translate) : ('common.send_request' | translate) }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Portfolio Modal -->
      @if (showPortfolioModal && selectedPortfolioCompany) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div class="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-[0.98] duration-300 border border-white/10">
            
            <!-- Modal Header -->
            <div class="p-8 pb-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">
                  {{ selectedPortfolioCompany.name.charAt(0) }}
                </div>
                <div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ selectedPortfolioCompany.name }}</h2>
                  <p class="text-xs text-slate-400 font-bold">{{ 'browse_firms.portfolio_work_offerings' | translate }}</p>
                </div>
              </div>
              <button (click)="showPortfolioModal = false" class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/50 dark:bg-slate-950/30">
               <app-company-portfolio [companyId]="selectedPortfolioCompany.id" [readOnly]="true"></app-company-portfolio>
            </div>
          </div>
        </div>
      }

      <!-- Announcements Modal -->
      @if (showAnnouncementsModal && selectedAnnouncementsCompany) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div class="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-[0.98] duration-300 border border-white/10">
            
            <!-- Modal Header -->
            <div class="p-8 pb-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                </div>
                <div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'browse_firms.announcements' | translate }}</h2>
                  <p class="text-xs text-slate-400 font-bold">{{ 'browse_firms.from_company' | translate: { name: selectedAnnouncementsCompany.name } }}</p>
                </div>
              </div>
              <button (click)="showAnnouncementsModal = false" class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/50 dark:bg-slate-950/30">
               @if (announcementsLoading) {
                 <div class="flex flex-col items-center justify-center h-full py-20">
                    <svg class="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="text-slate-400 font-black uppercase tracking-widest text-xs">{{ 'browse_firms.fetching_announcements' | translate }}</p>
                 </div>
               } @else if (announcements.length === 0) {
                 <div class="flex flex-col items-center justify-center h-full py-20 text-center">
                    <div class="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 mb-6">
                       <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                    </div>
                    <h3 class="text-lg font-black text-slate-400">{{ 'browse_firms.no_announcements_yet' | translate }}</h3>
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">{{ 'browse_firms.no_announcements_desc' | translate }}</p>
                 </div>
               } @else {
                 <div class="space-y-6">
                   @for (announcement of announcements; track announcement.id) {
                     <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none animate-in slide-in-from-bottom-4 duration-500">
                        @if (announcement.imageUrl) {
                          <img [src]="announcement.imageUrl" class="w-full h-48 object-cover border-b border-slate-100 dark:border-white/5" alt="Announcement image">
                        }
                        <div class="p-8">
                          <div class="flex items-center justify-between mb-4">
                            <span [class]="announcement.type === 'Offer' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30'"
                              class="px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest">
                              {{ announcement.type }}
                            </span>
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {{ announcement.publishedAt | date:'mediumDate' }}
                            </span>
                          </div>
                          
                          <h3 class="text-xl font-black text-slate-900 dark:text-white mb-4">{{ announcement.title }}</h3>
                          <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{{ announcement.content }}</p>
                        </div>
                     </div>
                   }
                 </div>
               }
            </div>
          </div>
        </div>
      }

      <!-- Success Toast -->
      @if (showSuccess) {
        <div class="fixed bottom-8 right-8 z-[70] bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>{{ successMessage }}</span>
        </div>
      }
    </div>
  `
})
export class BrowseFirmsComponent implements OnInit {
  private service = inject(PendingRequestsService);
  private authService = inject(AuthService);
  private announcementService = inject(AnnouncementService);

  // Data Sources
  allCompanies: PublicCompany[] = [];
  allRequests: JoinRequest[] = [];

  // Categorized Lists
  approvedCompanies: JoinRequest[] = [];
  pendingRequests: JoinRequest[] = [];
  availableCompanies: PublicCompany[] = [];

  searchQuery = '';
  loading = true;

  // Modal State
  showJoinModal = false;
  selectedCompany: PublicCompany | null = null;
  isSubmitting = false;
  showSuccess = false;

  joinForm = {
    requestedRole: 'NormalUser',
    message: ''
  };

  // Portfolio Modal
  showPortfolioModal = false;
  selectedPortfolioCompany: PublicCompany | null = null;

  // Announcements Modal
  showAnnouncementsModal = false;
  selectedAnnouncementsCompany: PublicCompany | null = null;
  announcements: CompanyAnnouncement[] = [];
  announcementsLoading = false;

  successMessage = 'Request Sent Successfully!';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // Fetch both datasets
    // In a real app, use forkJoin here
    this.service.getPublicCompanies().subscribe({
      next: (companies) => {
        this.allCompanies = companies;
        this.checkDataLoaded();
      },
      error: () => this.loading = false
    });

    this.service.getMyJoinRequests().subscribe({
      next: (requests) => {
        this.allRequests = requests;
        this.checkDataLoaded();
      },
      error: () => this.loading = false
    });
  }

  checkDataLoaded() {
    // Organize data ONLY when both are (potentially) loaded
    // Simple check: if we have arrays (even empty), processed them.
    // Ideally use forkJoin to wait for both.
    this.processCategories();
    this.loading = false;
  }

  processCategories() {
    // 1. Approved
    this.approvedCompanies = this.allRequests.filter(r => r.status === 'Approved');

    // 2. Pending
    this.pendingRequests = this.allRequests.filter(r => r.status === 'Pending');

    // 3. Available (All Companies excluding those I have requests for)
    // Create a set of company IDs from my requests
    const myCompanyIds = new Set(this.allRequests.map(r => r.companyId));

    this.availableCompanies = this.allCompanies.filter(c => !myCompanyIds.has(c.id));
  }

  get filteredAvailableCompanies(): PublicCompany[] {
    if (!this.searchQuery.trim()) return this.availableCompanies;
    const q = this.searchQuery.toLowerCase();
    return this.availableCompanies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  }

  openPortfolio(company: PublicCompany) {
    this.selectedPortfolioCompany = company;
    this.showPortfolioModal = true;
  }

  openJoinModal(company: PublicCompany) {
    this.selectedCompany = company;
    const user = this.authService.getCurrentUser();
    // Use the role name from the user object if available, otherwise fallback to User
    const role = user?.role || 'User';
    this.joinForm = { requestedRole: role, message: '' };
    this.showJoinModal = true;
  }

  submitJoinRequest() {
    if (!this.selectedCompany) return;
    this.isSubmitting = true;

    this.service.submitJoinRequest(this.selectedCompany.id, this.joinForm.message, this.joinForm.requestedRole).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.showJoinModal = false;

        // Add to local requests list
        this.allRequests.push(result);

        // Re-process categories to update UI immediately
        this.processCategories();

        this.successMessage = 'Request Sent Successfully!';
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || 'Failed to send request.';
        alert(msg);
      }
    });
  }

  toggleSubscription(company: PublicCompany) {
    if (company.isSubscribed) {
      this.announcementService.unsubscribe(company.id).subscribe({
        next: () => {
          company.isSubscribed = false;
          company.subscriberCount--;
          this.successMessage = 'Unsubscribed from company updates';
          this.showSuccess = true;
          setTimeout(() => this.showSuccess = false, 3000);
        }
      });
    } else {
      this.announcementService.subscribe(company.id).subscribe({
        next: () => {
          company.isSubscribed = true;
          company.subscriberCount++;
          this.successMessage = 'Subscribed to company updates!';
          this.showSuccess = true;
          setTimeout(() => this.showSuccess = false, 3000);
        }
      });
    }
  }

  openAnnouncementsModal(company: PublicCompany) {
    this.selectedAnnouncementsCompany = company;
    this.showAnnouncementsModal = true;
    this.announcementsLoading = true;
    this.announcements = [];

    this.announcementService.getCompanyAnnouncements(company.id).subscribe({
      next: (data) => {
        this.announcements = data;
        this.announcementsLoading = false;
      },
      error: () => {
        this.announcementsLoading = false;
      }
    });
  }
}
