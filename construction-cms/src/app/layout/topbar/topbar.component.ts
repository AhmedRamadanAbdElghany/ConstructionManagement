import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/theme/theme.service';
import { NotificationsService, NotificationDto } from '../../core/services/notifications.service';
import { MessagingService, ConversationDto } from '../../core/services/messaging.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent, TranslateModule],
  template: `
    <header class="h-20 bg-white/80 dark:bg-slate-950/50 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 sticky top-0 z-[60] transition-colors duration-300">
      <!-- Search -->
      <div class="flex-1 max-w-2xl">
        <div class="relative group">
          <div class="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          <div class="relative">
            <svg class="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              [placeholder]="'topbar.search_placeholder' | translate"
              class="w-full ltr:pl-14 ltr:pr-6 rtl:pr-14 rtl:pl-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500/30 dark:focus:bg-slate-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none text-sm font-medium">
          </div>
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex items-center gap-4">
        <!-- Company Switcher -->
        @if (authService.getAllCompanies().length > 0) {
          <div class="relative">
            <button 
              (click)="toggleCompanySelector()"
              class="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-all active:scale-95 shadow-lg group">
              <div class="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div class="hidden lg:block ltr:text-left rtl:text-right max-w-[150px]">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{{ 'topbar.current_company' | translate }}</p>
                <p class="text-xs font-black text-slate-900 dark:text-white truncate">{{ authService.getSelectedCompany()?.companyName || '---' }}</p>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" [class.rotate-180]="showCompanySelector" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            @if (showCompanySelector) {
              <div class="absolute ltr:left-0 rtl:right-0 top-[calc(100%+12px)] w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-3xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div class="p-6 pb-2">
                  <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{{ 'topbar.switch_company' | translate }}</h3>
                </div>
                
                <!-- Active Companies -->
                @if (authService.getActiveCompanies().length > 0) {
                  <div class="px-4 pt-2 pb-1">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ 'common.active' | translate }}</p>
                  </div>
                  <div class="p-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    @for (company of authService.getActiveCompanies(); track company.companyId) {
                      <button 
                        (click)="selectCompany(company)"
                        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group/item relative"
                        [class.bg-cyan-500/5]="company.companyId === authService.getSelectedCompany()?.companyId"
                        [class.hover:bg-slate-50]="company.companyId !== authService.getSelectedCompany()?.companyId"
                        [class.dark:hover:bg-white/[0.03]]="company.companyId !== authService.getSelectedCompany()?.companyId">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black"
                             [ngClass]="company.companyId === authService.getSelectedCompany()?.companyId ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover/item:text-cyan-500'">
                          {{ company.companyName.charAt(0) }}
                        </div>
                        <div class="flex-1 ltr:text-left rtl:text-right min-w-0">
                          <p class="text-sm font-bold truncate transition-colors"
                             [class.text-cyan-600]="company.companyId === authService.getSelectedCompany()?.companyId"
                             [class.text-slate-700]="company.companyId !== authService.getSelectedCompany()?.companyId"
                             [class.dark:text-slate-300]="company.companyId !== authService.getSelectedCompany()?.companyId">
                            {{ company.companyName }}
                          </p>
                          <p class="text-[10px] text-slate-400 font-medium lowercase italic">{{ company.role }}</p>
                        </div>
                        @if (company.companyId === authService.getSelectedCompany()?.companyId) {
                          <div class="w-2 h-2 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"></div>
                        }
                        <!-- Hide from list button -->
                        <button 
                          (click)="toggleCompanyDraftStatus($event, company)"
                          class="absolute ltr:right-2 rtl:left-2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-amber-500/20"
                          [title]="'company.hide_from_list' | translate">
                          <svg class="w-3 h-3 text-slate-400 hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                          </svg>
                        </button>
                      </button>
                    }
                  </div>
                }
                
                <!-- Draft Companies -->
                @if (authService.getDraftCompanies().length > 0) {
                  <div class="px-4 pt-3 pb-1 border-t border-slate-100 dark:border-white/5 mt-2">
                    <p class="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{{ 'common.hidden' | translate }}</p>
                  </div>
                  <div class="p-2 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    @for (company of authService.getDraftCompanies(); track company.companyId) {
                      <button 
                        (click)="restoreCompanyFromDraft($event, company)"
                        class="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group/item bg-amber-500/5 hover:bg-amber-500/10">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black bg-amber-100 dark:bg-amber-900/30 text-amber-500">
                          {{ company.companyName.charAt(0) }}
                        </div>
                        <div class="flex-1 ltr:text-left rtl:text-right min-w-0">
                          <p class="text-sm font-bold truncate text-amber-700 dark:text-amber-400">
                            {{ company.companyName }}
                          </p>
                          <p class="text-[10px] text-amber-500/70 font-medium">{{ company.role }}</p>
                        </div>
                        <!-- Restore button -->
                        <div class="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center" [title]="'company.restore' | translate">
                          <svg class="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                        </div>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Theme Toggle -->
        <button 
          (click)="themeService.toggleTheme()"
          class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all active:scale-90 overflow-hidden relative group shadow-lg">
          <div class="relative w-6 h-6">
             <svg *ngIf="themeService.currentTheme() === 'dark'" class="w-6 h-6 transform transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"></path>
             </svg>
             <svg *ngIf="themeService.currentTheme() === 'light'" class="w-6 h-6 transform transition-transform group-hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
             </svg>
          </div>
        </button>

        <!-- Language Switcher -->
        <app-language-switcher></app-language-switcher>

        <!-- Notifications -->
        <div class="relative">
          <button 
            (click)="toggleNotifications()"
            class="group relative w-12 h-12 rounded-2xl transition-all active:scale-90 shadow-lg border flex items-center justify-center transition-all duration-300"
            [ngClass]="{
              'bg-white dark:bg-slate-800 text-cyan-500 border-white dark:border-slate-700 shadow-xl shadow-cyan-500/10': showNotifications,
              'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-cyan-500': !showNotifications
            }">
            <svg class="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            @if (notificationsService.unreadCount() > 0) {
              <span class="absolute -top-1 ltr:-right-1 rtl:-left-1 w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-rose-500/25 ring-2 ring-white dark:ring-slate-950">
                {{ notificationsService.unreadCount() > 9 ? '9+' : notificationsService.unreadCount() }}
              </span>
            }
          </button>

          <!-- Notifications Dropdown -->
          @if (showNotifications) {
            <div class="absolute ltr:right-0 rtl:left-0 top-[calc(100%+16px)] w-[400px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-3xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div class="p-8 pb-4 flex items-center justify-between">
                <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'topbar.notifications' | translate }}</h3>
                <button (click)="markAllRead()" class="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-cyan-500 dark:text-cyan-400 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  {{ 'topbar.mark_all_read' | translate }}
                </button>
              </div>
              <div class="max-h-[360px] overflow-y-auto px-4 space-y-2 mb-4 custom-scrollbar">
                @for (notification of notifications; track notification.id) {
                    <div 
                      class="group p-5 rounded-[1.5rem] transition-all cursor-pointer border border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                      [class.bg-cyan-500/5]="!notification.isRead">
                      <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-[1rem] flex items-center justify-center flex-shrink-0 shadow-inner"
                             [ngClass]="{
                               'bg-amber-500/10 text-amber-500': notification.type === 'warning' || notification.type === 'ProjectDelay' || notification.type === 'ItemDelay',
                               'bg-cyan-500/10 text-cyan-400': notification.type === 'info' || notification.type === 'General',
                               'bg-emerald-500/10 text-emerald-500': notification.type === 'success' || notification.type === 'ApprovalGranted' || notification.type === 'PaymentReceived',
                               'bg-rose-500/10 text-rose-500': notification.type === 'error' || notification.type === 'ApprovalRejected' || notification.type === 'BudgetOverrun'
                             }">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            @if (notification.type === 'warning' || notification.type === 'ProjectDelay' || notification.type === 'ItemDelay') { <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> }
                            @if (notification.type === 'info' || notification.type === 'General') { <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> }
                            @if (notification.type === 'success' || notification.type === 'ApprovalGranted' || notification.type === 'PaymentReceived') { <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> }
                            @if (notification.type === 'error' || notification.type === 'ApprovalRejected' || notification.type === 'BudgetOverrun') { <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path> }
                          </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between mb-1">
                             <p class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" [class.font-black]="!notification.isRead">{{ notification.message }}</p>
                             @if (!notification.isRead) { <span class="w-2 h-2 rounded-full bg-cyan-500"></span> }
                          </div>
                          <p class="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{{ getTimeAgo(notification.createdAt) }}</p>
                        </div>
                      </div>
                    </div>
                }
              </div>
              <div class="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-white/5">
                <a routerLink="/notifications" 
                   (click)="showNotifications = false"
                   class="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <span>{{ 'topbar.view_all_notifications' | translate }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5-5 5"></path></svg>
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Messages -->
        <div class="relative">
          <button 
            (click)="toggleMessages()"
            class="group relative w-12 h-12 rounded-2xl transition-all active:scale-90 shadow-lg border flex items-center justify-center transition-all duration-300"
            [ngClass]="{
              'bg-white dark:bg-slate-800 text-indigo-600 border-white dark:border-slate-700 shadow-xl shadow-indigo-500/10': showMessages,
              'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-indigo-600': !showMessages
            }">
            <svg class="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            @if (unreadMessagesCount > 0) {
              <span class="absolute -top-1 ltr:-right-1 rtl:-left-1 w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-rose-500/25 ring-2 ring-white dark:ring-slate-950">
                {{ unreadMessagesCount > 9 ? '9+' : unreadMessagesCount }}
              </span>
            }
          </button>

          <!-- Messages Dropdown -->
          @if (showMessages) {
            <div class="absolute ltr:right-0 rtl:left-0 top-[calc(100%+16px)] w-[400px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-3xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div class="p-8 pb-4 flex items-center justify-between">
                <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'sidebar.messages' | translate }}</h3>
                <a routerLink="/messages" (click)="showMessages = false" class="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest hover:underline transition-all">
                  {{ 'topbar.view_all_messages' | translate }}
                </a>
              </div>
              <div class="max-h-[360px] overflow-y-auto px-4 space-y-2 mb-4 custom-scrollbar">
                @if (conversations.length === 0) {
                  <div class="p-10 text-center">
                    <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                    </div>
                    <p class="text-sm font-bold text-slate-500 dark:text-slate-400">No recent messages</p>
                  </div>
                } @else {
                  @for (conv of conversations; track conv.id) {
                    <div 
                      (click)="goToConversation(conv.id)"
                      class="group p-5 rounded-[1.5rem] transition-all cursor-pointer border border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                      [class.bg-indigo-500/5]="conv.unreadCount > 0">
                      <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-[1rem] flex items-center justify-center flex-shrink-0 shadow-inner bg-indigo-500/10 text-indigo-600 font-black text-lg">
                          @if (conv.companyLogo || conv.initiatorAvatar) {
                            <img [src]="conv.companyLogo || conv.initiatorAvatar" class="w-full h-full rounded-[1rem] object-cover">
                          } @else {
                            {{ (conv.companyName || conv.initiatorName).charAt(0) }}
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between mb-1">
                             <p class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate" [class.font-black]="conv.unreadCount > 0">
                               {{ conv.companyName || conv.initiatorName }}
                             </p>
                             @if (conv.unreadCount > 0) { <span class="w-2 h-2 rounded-full bg-indigo-500"></span> }
                          </div>
                          <p class="text-xs text-slate-500 dark:text-slate-400 truncate mb-1" [class.font-bold]="conv.unreadCount > 0">
                            {{ conv.lastMessage?.content || 'Started a conversation' }}
                          </p>
                          <p class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{{ getTimeAgo(conv.lastMessageAt || conv.createdAt) }}</p>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>
              <div class="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-white/5">
                <a routerLink="/messages" 
                   (click)="showMessages = false"
                   class="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <span>{{ 'topbar.view_all_messages' | translate }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5-5 5"></path></svg>
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Divider -->
        <div class="w-px h-8 bg-slate-200 dark:bg-white/5"></div>

        <!-- User Profile -->
        <div class="relative">
          <button 
            (click)="toggleProfile()"
            class="group flex items-center gap-4 p-1.5 ltr:pr-5 rtl:pl-5 rounded-[1.5rem] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-all active:scale-95 shadow-lg">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white ring-2 ring-white/10 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform overflow-hidden font-black">
               {{ authService.getCurrentUser()?.fullName?.charAt(0) || '' }}
            </div>
            <div class="hidden md:block ltr:text-left rtl:text-right min-w-max">
              <p class="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{{ authService.getCurrentUser()?.fullName || '' }}</p>
              <p class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none">
                {{ (isPending ? 'sidebar.role_owner' : isInventoryOwner ? 'sidebar.role_inventory_owner' : 'sidebar.role_' + (authService.getCurrentUser()?.role === 'SystemAdmin' ? 'super' :
                   authService.getCurrentUser()?.role === 'CompanyAdmin' ? 'admin' :
                   authService.getCurrentUser()?.role === 'CompanyUser' ? 'worker' : 'client')) | translate }}
              </p>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <!-- Profile Dropdown -->
          @if (showProfile) {
            <div class="fixed ltr:right-8 rtl:left-8 top-[84px] w-72 bg-white dark:bg-slate-900 rounded-[2rem] shadow-3xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div class="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20">
                <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ authService.getCurrentUser()?.fullName || '' }}</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 font-bold break-all">{{ authService.getCurrentUser()?.email || '' }}</p>
              </div>
              <div class="p-3 space-y-1">
                <a (click)="goToProfile()" class="flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.03] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group/item cursor-pointer">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover/item:bg-cyan-500 transition-colors">
                    <svg class="w-5 h-5 text-slate-400 group-hover/item:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <span class="text-sm font-bold">{{ 'topbar.profile' | translate }}</span>
                </a>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-white/5">
                <button 
                  (click)="confirmLogout()"
                  class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-rose-500 bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-white transition-all group/item shadow-inner">
                  <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center group-hover/item:bg-white/20 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  </div>
                  <span class="text-[11px] font-black uppercase tracking-widest">{{ 'topbar.logout' | translate }}</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>

    <!-- Logout Confirmation Modal -->
    @if (showLogoutConfirmation) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" (click)="showLogoutConfirmation = false"></div>
        
        <!-- Modal Card -->
        <div class="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div class="p-10 pt-12 flex flex-col items-center text-center">
            <!-- Icon -->
            <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white mb-8 shadow-2xl shadow-rose-500/40 animate-bounce-subtle">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>

            <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {{ 'logout_confirm.title' | translate }}
            </h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-10 px-4">
              {{ 'logout_confirm.subtitle' | translate }}
            </p>

            <div class="grid grid-cols-1 w-full gap-4">
              <button 
                (click)="logout()"
                class="group relative h-16 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
                <div class="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="relative z-10">{{ 'logout_confirm.confirm' | translate }}</span>
              </button>
              
              <button 
                (click)="showLogoutConfirmation = false"
                class="h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                {{ 'logout_confirm.cancel' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Overlay to close dropdowns -->
    @if (showNotifications || showProfile || showCompanySelector || showMessages) {
      <div 
        class="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm transition-all animate-in fade-in duration-300"
        (click)="closeDropdowns()">
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
    .shadow-3xl { box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.5); }
    @keyframes bounce-subtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
  `]
})
export class TopbarComponent implements OnInit, OnDestroy {
  showNotifications = false;
  showProfile = false;
  showCompanySelector = false;
  showLogoutConfirmation = false;
  showMessages = false;
  notifications: NotificationDto[] = [];
  conversations: ConversationDto[] = [];
  private destroy$ = new Subject<void>();

  private router = inject(Router);
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public notificationsService = inject(NotificationsService);
  public messagingService = inject(MessagingService);
  private translateService = inject(TranslateService);

  // Messages unread count
  unreadMessagesCount = 0;

  get isInventoryOwner(): boolean {
    return this.authService.getCurrentUser()?.userType === 3;
  }

  get isPending(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.userType === 2 && !user?.companyId;
  }

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadMessagesCount();

    // Reload notifications when language changes to get localized messages
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  loadUnreadMessagesCount() {
    this.messagingService.getUnreadCount().subscribe({
      next: (result: any) => {
        this.unreadMessagesCount = result.count ?? 0;
      },
      error: (error) => {
        console.error('Error loading unread messages count:', error);
        this.unreadMessagesCount = 0;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications() {
    this.notificationsService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
  }

  closeDropdowns() {
    this.showNotifications = false;
    this.showProfile = false;
    this.showCompanySelector = false;
    this.showMessages = false;
  }

  toggleMessages() {
    this.showMessages = !this.showMessages;
    this.showNotifications = false;
    this.showProfile = false;
    this.showCompanySelector = false;
    if (this.showMessages) {
      this.loadRecentConversations();
    }
  }

  loadRecentConversations() {
    this.messagingService.getConversations().subscribe({
      next: (data) => {
        this.conversations = data.slice(0, 5);
      },
      error: (err) => console.error('Failed to load conversations', err)
    });
  }

  goToConversation(conversationId: number) {
    this.showMessages = false;
    this.router.navigate(['/messages', conversationId]);
  }

  toggleCompanySelector() {
    this.showCompanySelector = !this.showCompanySelector;
    this.showNotifications = false;
    this.showProfile = false;
  }

  selectCompany(company: any) {
    this.authService.selectCompany(company);
    this.showCompanySelector = false;
    // Force reload to ensure all components refresh with the new X-Company-ID context
    window.location.reload();
  }

  toggleCompanyDraftStatus(event: Event, company: any) {
    event.stopPropagation();
    const companyUserId = company.id || company.companyId;
    this.authService.toggleCompanyDraftStatus(companyUserId, true).subscribe({
      next: () => {
        this.authService.refreshCompanyAssociations().subscribe();
        // Close dropdown and reload
        this.showCompanySelector = false;
      },
      error: (err) => {
        console.error('Failed to hide company:', err);
      }
    });
  }

  restoreCompanyFromDraft(event: Event, company: any) {
    event.stopPropagation();
    const companyUserId = company.id || company.companyId;
    this.authService.toggleCompanyDraftStatus(companyUserId, false).subscribe({
      next: () => {
        this.authService.refreshCompanyAssociations().subscribe();
        // Close dropdown and reload
        this.showCompanySelector = false;
      },
      error: (err) => {
        console.error('Failed to restore company:', err);
      }
    });
  }

  markAllRead() {
    this.notificationsService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    // Ensure UTC interpretation if no timezone info is present
    const isIsoNoTz = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(timestamp);
    const then = new Date(isIsoNoTz ? timestamp + 'Z' : timestamp);

    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (isNaN(then.getTime())) return timestamp;

    if (diffMins < 1) return this.translateService.instant('common.just_now');
    if (diffMins < 60) return this.translateService.instant('common.minutes_ago', { count: diffMins });
    if (diffHours < 24) return this.translateService.instant('common.hours_ago', { count: diffHours });
    if (diffDays < 7) return this.translateService.instant('common.days_ago', { count: diffDays });
    return then.toLocaleDateString();
  }

  goToProfile() {
    this.showProfile = false;
    this.router.navigate(['/profile']);
  }

  confirmLogout() {
    this.showLogoutConfirmation = true;
    this.showProfile = false;
  }

  logout() {
    this.authService.logout();
    this.showLogoutConfirmation = false;
    this.router.navigate(['/auth/login']);
  }
}

