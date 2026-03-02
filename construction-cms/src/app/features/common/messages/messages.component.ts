import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MessagingService, ConversationDto, MessagingStatusDto, MessagableUserDto } from '../../../core/services/messaging.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-10 transition-colors duration-500 overflow-x-hidden">
      <div class="max-w-6xl mx-auto">
        <!-- Header Section -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-20 animate-premium-fade">
          <div class="space-y-6">
            <div class="flex items-center gap-6">
              <div class="w-20 h-20 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative group overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div class="absolute inset-0 bg-indigo-400 blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-700 scale-150"></div>
                <svg class="w-10 h-10 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-4">
                  <h1 class="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase tabular-nums">
                    {{ 'messages.title' | translate }}
                  </h1>
                  @if (unreadCount > 0) {
                    <div class="px-5 py-2 rounded-2xl bg-rose-500 text-white text-[10px] font-black shadow-[0_10px_25px_rgba(244,63,94,0.4)] animate-bounce mt-1 tracking-widest uppercase">
                      {{ unreadCount }} New
                    </div>
                  }
                </div>
                <p class="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] ltr:ml-1 rtl:mr-1">
                  {{ 'messages.subtitle' | translate }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex flex-wrap items-center gap-6">
            @if ((isCompanyOwner || isSystemAdmin) && !isRestricted) {
              <button 
                (click)="openUserSearchModal()"
                class="group relative flex items-center gap-4 px-10 py-5 rounded-[2.2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.2em] hover:border-emerald-500/30 transition-all shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:-translate-y-2 active:scale-95 overflow-hidden">
                <div class="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-700 relative z-10">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
                <span class="relative z-10">{{ 'messages.message_user' | translate }}</span>
              </button>
            }

            @if (!isSystemAdmin) {
              <button 
                (click)="openStartConversationModal()"
                class="group relative flex items-center gap-4 px-12 py-5 rounded-[2.2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:-translate-y-2 active:scale-95 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ 'messages.contact_admin' | translate }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div class="group relative p-10 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl shadow-indigo-500/[0.03] transition-all duration-700 hover:-translate-y-2 hover:shadow-indigo-500/[0.1]">
            <div class="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-1000 text-indigo-500">
              <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
            <div class="relative z-10">
              <div class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">{{ 'messages.total_conversations' | translate }}</div>
              <div class="text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{{ conversations.length }}</div>
            </div>
          </div>

          <div class="group relative p-10 rounded-[3.5rem] bg-indigo-600 border border-indigo-500 shadow-2xl shadow-indigo-600/30 transition-all duration-700 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div class="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-25 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 text-white">
              <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M18 7c0-1.1-.9-2-2-2h-3V2h-2v3H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
            </div>
            <div class="relative z-10">
              <div class="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-4">{{ 'messages.unread_messages' | translate }}</div>
              <div class="text-6xl font-black text-white tracking-tighter tabular-nums leading-none">{{ unreadCount }}</div>
            </div>
          </div>

          @if (isVerifiedCompanyOwner) {
            <div class="group relative p-10 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl shadow-indigo-500/[0.03] transition-all duration-700 hover:-translate-y-2 hover:shadow-indigo-500/[0.1]">
              <div class="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-1000 text-amber-500">
                <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              </div>
              <div class="relative z-10">
                <div class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">{{ 'messages.pending_requests' | translate }}</div>
                <div class="text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{{ getPendingConversationsCount() }}</div>
              </div>
            </div>
          } @else {
             <div class="group relative p-10 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl shadow-indigo-500/[0.03] transition-all duration-700 hover:-translate-y-2 hover:shadow-indigo-500/[0.1]">
              <div class="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 text-emerald-500">
                <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 13h-2V7h2v6zm0 4h-2v-2h2v2z"/></svg>
              </div>
              <div class="relative z-10">
                <div class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">{{ 'messages.platform_status' | translate }}</div>
                <div class="text-3xl font-black text-emerald-500 tracking-tight uppercase group-hover:scale-105 origin-left transition-transform duration-700">{{ 'messages.operational' | translate }}</div>
              </div>
            </div>
          }
        </div>

        <!-- Toolbar Section -->
        <div class="flex flex-col xl:flex-row items-stretch xl:items-center gap-6 mb-12">
          <!-- Search -->
          <div class="flex-1 relative group">
            <div class="absolute inset-0 bg-indigo-500/5 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
            <div class="relative flex items-center">
              <div class="absolute left-8 flex items-center justify-center pointer-events-none z-10">
                <svg class="w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 group-focus-within:scale-110 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input 
                type="text"
                [(ngModel)]="conversationSearchQuery"
                [placeholder]="'messages.search_placeholder' | translate"
                class="w-full pl-20 pr-8 py-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 focus:border-indigo-500/30 text-slate-900 dark:text-white placeholder-slate-400 text-base font-bold shadow-xl shadow-black/[0.01] transition-all outline-none"
              />
            </div>
          </div>

          <!-- Tabs -->
          @if (availableTabs.length > 1) {
            <div class="p-2 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl shadow-black/[0.01] flex items-center overflow-x-auto no-scrollbar">
              @for (tab of availableTabs; track tab.key) {
                <button
                  (click)="setActiveTab(tab.key)"
                  class="relative px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 whitespace-nowrap"
                  [ngClass]="{
                    'bg-slate-900 dark:bg-indigo-600 text-white shadow-2xl': activeTab === tab.key,
                    'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800': activeTab !== tab.key
                  }">
                  {{ tab.label | translate }}
                  @if (tab.unreadCount > 0) {
                    <span class="px-2.5 py-1 rounded-xl text-[9px] font-black min-w-6 h-6 flex items-center justify-center transition-colors"
                          [ngClass]="activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'">
                      {{ tab.unreadCount }}
                    </span>
                  }
                </button>
              }
            </div>
          }
        </div>

        <!-- Restriction Notice -->
        @if (isRestricted) {
          <div class="mb-12 p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-amber-500/20 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
              <div class="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 animate-pulse">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight uppercase">{{ 'messages.restricted_title' | translate }}</h4>
                <p class="text-slate-500 dark:text-slate-400 font-bold text-[13px] uppercase tracking-wider">{{ 'messages.restricted_desc' | translate }}</p>
              </div>
              <button 
                (click)="openStartConversationModal()"
                class="px-10 py-5 rounded-2xl bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-1 active:scale-95 whitespace-nowrap">
                {{ 'messages.start_conversation_admin' | translate }}
              </button>
            </div>
          </div>
        }

        <!-- Content Area -->
        <div class="space-y-8">
          <!-- Loading State -->
          @if (isLoading || isStatusLoading) {
            <div class="flex flex-col items-center justify-center py-32 animate-pulse">
              <div class="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-indigo-500/20"></div>
              <p class="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
                {{ 'messages.loading_conversations' | translate }}
              </p>
            </div>
          } @else {
            <!-- Conversations List -->
            @if (filteredConversations.length > 0) {
              <div class="grid grid-cols-1 gap-6">
                @for (conversation of filteredConversations; track conversation.id) {
                  <a 
                    [routerLink]="['/messages', conversation.id]"
                    class="group relative flex flex-col md:flex-row md:items-center gap-8 p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-indigo-500/[0.02] hover:shadow-indigo-500/[0.08] hover:border-indigo-500/20 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8"
                    [style.animation-delay]="($index * 100) + 'ms'">
                    
                    <!-- Avatar Area -->
                    <div class="relative flex-shrink-0 mx-auto md:mx-0">
                      <div class="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-4xl font-black group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent group-hover:from-indigo-500/20"></div>
                        {{ conversation.companyName.charAt(0) }}
                      </div>
                      @if (conversation.unreadCount > 0) {
                        <div class="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-rose-500 border-4 border-white dark:border-slate-900 shadow-xl z-10 flex items-center justify-center text-white text-[10px] font-black">
                          {{ conversation.unreadCount }}
                        </div>
                      }
                      <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-white">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                      </div>
                    </div>
                    
                    <!-- Info Area -->
                    <div class="flex-1 min-w-0 text-center md:text-left">
                      <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-full md:max-w-md group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase">
                          {{ conversation.companyName }}
                        </h3>
                        
                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border"
                              [ngClass]="{
                                'bg-amber-500/10 text-amber-500 border-amber-500/20': conversation.status === 'Pending',
                                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': conversation.status === 'Approved',
                                'bg-rose-500/10 text-rose-500 border-rose-500/20': conversation.status === 'Blocked'
                              }">
                          {{ conversation.status }}
                        </span>
                      </div>

                      @if (conversation.lastMessage) {
                        <p class="text-slate-500 dark:text-slate-400 text-base font-bold line-clamp-2 mb-4 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                          @if (conversation.lastMessage.isFromCompany) {
                            <span class="text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] tracking-widest ltr:mr-2 rtl:ml-2">
                              {{ 'messages.company_reply' | translate }}:
                            </span>
                          }
                          {{ conversation.lastMessage.content }}
                        </p>
                      }

                      <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/5">
                          <svg class="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          {{ conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : formatDateTime(conversation.createdAt) }}
                        </div>
                        @if (conversation.lastMessage?.attachments?.length) {
                          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-200/50 dark:border-indigo-500/20">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                            </svg>
                            {{ conversation.lastMessage?.attachments?.length }} Attachments
                          </div>
                        }
                      </div>
                    </div>
                    
                    <!-- Action Area -->
                    <div class="flex-shrink-0 flex items-center justify-center">
                      <div class="w-16 h-16 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] transition-all duration-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                      </div>
                    </div>
                  </a>
                }
              </div>
            }

            <!-- Global Empty State -->
            @if (filteredConversations.length === 0 && !isLoading && !isStatusLoading) {
              <div class="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in duration-1000">
                <div class="relative mb-16">
                  <div class="absolute inset-0 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
                  <div class="w-64 h-64 rounded-[5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.05)] flex items-center justify-center relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
                    <svg class="w-32 h-32 text-slate-100 dark:text-slate-800 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <div class="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-indigo-600/10 blur-2xl"></div>
                  </div>
                  <div class="absolute -bottom-8 -right-8 w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] animate-bounce stagger-1">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                </div>
                
                <h3 class="text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase tabular-nums leading-none">
                  Clean Slate
                </h3>
                <p class="text-slate-400 dark:text-slate-500 max-w-lg mx-auto leading-relaxed mb-16 text-[14px] font-bold uppercase tracking-[0.3em] px-4">
                  @if (isRestricted) {
                    {{ 'messages.restricted_empty_desc' | translate }}
                  } @else {
                    {{ 'messages.no_messages_desc' | translate }}
                  }
                </p>
                
                <div class="flex flex-col sm:flex-row items-center gap-8">
                  @if (!isSystemAdmin && (isRestricted || isCompanyOwner)) {
                    <button 
                      (click)="openStartConversationModal()"
                      class="px-12 py-6 rounded-[2.2rem] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:-translate-y-2 active:translate-y-0 transition-all duration-500">
                      {{ 'messages.start_conversation_admin' | translate }}
                    </button>
                  }
                  
                  @if (!isRestricted) {
                    <a routerLink="/companies" class="px-12 py-6 rounded-[2.2rem] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 dark:hover:bg-slate-800 shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:-translate-y-2 transition-all duration-500">
                      {{ 'messages.browse_companies' | translate }}
                    </a>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>

    <!-- Start Conversation Modal -->
    @if (showStartConversationModal) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <!-- Modal Header -->
          <div class="p-6 border-b border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-black text-slate-900 dark:text-white">{{ 'messages.new_conversation' | translate }}</h3>
              <button 
                (click)="closeStartConversationModal()"
                class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6">
            <div class="mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm text-indigo-700 dark:text-indigo-300">{{ 'messages.messaging_SystemAdmin' | translate }}</span>
              </div>
            </div>

            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {{ 'messages.your_message' | translate }}
            </label>
            <textarea 
              [(ngModel)]="newMessage"
              rows="5"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              [placeholder]="'messages.message_placeholder' | translate">
            </textarea>

            @if (errorMessage) {
              <div class="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button 
              (click)="closeStartConversationModal()"
              class="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
              {{ 'common.cancel' | translate }}
            </button>
            <button 
              (click)="startConversationWithSystemAdmin()"
              [disabled]="!newMessage.trim() || isSending"
              class="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
              @if (isSending) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              }
              {{ 'messages.send_message' | translate }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- User Search Modal -->
    @if (showUserSearchModal) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-black text-slate-900 dark:text-white">
                @if (isSystemAdmin) {
                  {{ 'messages.search_system_users' | translate }}
                } @else {
                  {{ 'messages.message_client_worker' | translate }}
                }
              </h3>
              <button 
                (click)="closeUserSearchModal()"
                class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto flex-1">
            @if (!selectedUser) {
              <!-- Search and Filter -->
              <div class="mb-4 flex flex-col sm:flex-row gap-3">
                <div class="flex-1">
                  <input 
                    type="text"
                    [(ngModel)]="userSearchQuery"
                    [placeholder]="'messages.search_users' | translate"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                </div>
                <select 
                  [(ngModel)]="selectedUserType"
                  (change)="filterUsers()"
                  class="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  <option value="">{{ 'messages.all_users' | translate }}</option>
                  @if (isSystemAdmin) {
                    <option value="CompanyOwner">{{ 'messages.company_owners' | translate }}</option>
                    <option value="SystemAdmin">{{ 'messages.system_admins' | translate }}</option>
                  } @else {
                    <option value="Client">{{ 'messages.clients' | translate }}</option>
                    <option value="Worker">{{ 'messages.workers' | translate }}</option>
                  }
                </select>
              </div>

              <!-- Loading State -->
              @if (isLoadingUsers) {
                <app-loading-spinner containerClass="py-10"></app-loading-spinner>
              }

              <!-- Users List -->
              @if (!isLoadingUsers && filteredUsers.length > 0) {
                <div class="space-y-3">
                  @for (user of filteredUsers; track user.id) {
                    <button 
                      (click)="selectUser(user)"
                      class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left flex items-center gap-4">
                      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                        {{ user.name.charAt(0) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <h4 class="font-bold text-slate-900 dark:text-white truncate">{{ user.name }}</h4>
                          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                                [ngClass]="{
                                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': user.userType === 'NormalUser',
                                  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400': user.userType === 'Worker'
                                }">
                            {{ user.userType }}
                          </span>
                        </div>
                        <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ user.email }}</p>
                      </div>
                      @if (user.hasExistingConversation) {
                        <span class="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          {{ 'messages.existing_conversation' | translate }}
                        </span>
                      }
                    </button>
                  }
                </div>
              }

              <!-- Empty State -->
              @if (!isLoadingUsers && filteredUsers.length === 0) {
                <div class="text-center py-10">
                  <svg class="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <p class="text-slate-500 dark:text-slate-400">{{ 'messages.no_users_found' | translate }}</p>
                </div>
              }
            } @else {
              <!-- Selected User - Compose Message -->
              <button 
                (click)="goBackToUserList()"
                class="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                {{ 'messages.back_to_list' | translate }}
              </button>

              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black">
                    {{ selectedUser.name.charAt(0) }}
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">{{ selectedUser.name }}</h4>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedUser.userType }}</p>
                  </div>
                </div>
              </div>

              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'messages.your_message' | translate }}
              </label>
              <textarea 
                [(ngModel)]="messageToUser"
                rows="5"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                [placeholder]="'messages.message_placeholder' | translate">
              </textarea>

              @if (errorMessage) {
                <div class="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                  <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
                </div>
              }
            }
          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 flex-shrink-0">
            @if (!selectedUser) {
              <button 
                (click)="closeUserSearchModal()"
                class="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
                {{ 'common.cancel' | translate }}
              </button>
            } @else {
              <button 
                (click)="goBackToUserList()"
                class="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
                {{ 'common.cancel' | translate }}
              </button>
              <button 
                (click)="startConversationWithUser()"
                [disabled]="!messageToUser.trim() || isSending"
                class="px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                @if (isSending) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                {{ 'messages.send_message' | translate }}
              </button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class MessagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private messagingService = inject(MessagingService);
  private i18nService = inject(I18nService);
  private router = inject(Router);
  private authService = inject(AuthService);

  conversations: ConversationDto[] = [];
  isLoading = false;
  isStatusLoading = true;
  unreadCount = 0;
  messagingStatus: MessagingStatusDto | null = null;
  isRestricted = false;
  SystemAdminUserId: number | null = null;
  isCompanyOwner = false;
  isSystemAdmin = false;

  // Tab & Search state
  activeTab: string = 'all';
  conversationSearchQuery: string = '';
  availableTabs: { key: string; label: string; unreadCount: number }[] = [];

  // Messagable users for company owners
  messagableUsers: MessagableUserDto[] = [];
  isLoadingUsers = false;
  showUserSearchModal = false;
  userSearchQuery = '';
  selectedUserType = '';
  selectedUser: MessagableUserDto | null = null;
  messageToUser = '';

  get isVerifiedCompanyOwner(): boolean {
    const currentUser = this.authService.getCurrentUser();
    const isSystemAdmin = currentUser?.roles?.includes('SystemAdmin');
    return this.isCompanyOwner && !isSystemAdmin && !this.isRestricted && this.messagingStatus?.isUnverifiedCompanyOwner === false;
  }

  // Modal state
  showStartConversationModal = false;
  newMessage = '';
  isSending = false;
  errorMessage = '';

  ngOnInit() {
    this.loadMessagingStatus();
    this.loadConversations();
    this.loadUnreadCount();
    this.checkIfCompanyOwner();

    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadConversations();
      });
  }

  checkIfCompanyOwner() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // userType 2 = CompanyOwner based on backend enum
      this.isSystemAdmin = currentUser.roles?.includes('SystemAdmin') || currentUser.userType === 4; // 4 = SystemAdmin
      this.isCompanyOwner = currentUser.userType === 2 ||
        currentUser.roles?.includes('CompanyAdmin') ||
        this.isSystemAdmin;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMessagingStatus() {
    this.isStatusLoading = true;
    this.messagingService.getMessagingStatus().subscribe({
      next: (status) => {
        this.messagingStatus = status;
        this.isRestricted = status.isRestricted;
        this.SystemAdminUserId = status.SystemAdminUserId ?? null;
        this.isStatusLoading = false;
        // Re-update tabs now that we have the SystemAdminCompanyId
        this.updateAvailableTabs();
      },
      error: (error) => {
        console.error('Error loading messaging status:', error);
        this.isStatusLoading = false;
        this.updateAvailableTabs();
      }
    });
  }

  loadConversations() {
    this.isLoading = true;
    this.messagingService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.updateAvailableTabs();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.isLoading = false;
      }
    });
  }

  updateAvailableTabs() {
    const tabs = [
      { key: 'all', label: 'messages.tabs.all', unreadCount: 0 },
      { key: 'unread', label: 'messages.unread_messages', unreadCount: this.unreadCount }
    ];

    if (this.isVerifiedCompanyOwner) {
      tabs.push({ key: 'pending', label: 'messages.pending_requests', unreadCount: this.getPendingConversationsCount() });
    }

    this.availableTabs = tabs;
  }

  getPendingConversationsCount(): number {
    return this.conversations?.filter(c => c.status === 'Pending').length || 0;
  }

  get filteredConversations(): ConversationDto[] {
    let filtered = this.conversations;

    // Filter by tab
    if (this.activeTab === 'unread') {
      filtered = filtered.filter(c => c.unreadCount > 0);
    } else if (this.activeTab === 'pending') {
      filtered = filtered.filter(c => c.status === 'Pending');
    }

    // Filter by search query
    if (this.conversationSearchQuery.trim()) {
      const query = this.conversationSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.companyName?.toLowerCase().includes(query) ||
        c.initiatorName?.toLowerCase().includes(query) ||
        c.lastMessage?.content?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  setActiveTab(tabKey: string) {
    this.activeTab = tabKey;
  }

  loadUnreadCount() {
    this.messagingService.getUnreadCount().subscribe({
      next: (result) => {
        this.unreadCount = result.count;
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  openStartConversationModal() {
    this.showStartConversationModal = true;
    this.newMessage = '';
    this.errorMessage = '';
  }

  closeStartConversationModal() {
    this.showStartConversationModal = false;
    this.newMessage = '';
    this.errorMessage = '';
  }

  startConversationWithSystemAdmin() {
    if (!this.newMessage.trim()) {
      this.errorMessage = 'Please enter a message.';
      return;
    }

    this.isSending = true;
    this.errorMessage = '';

    // Use the new SystemAdmin conversation endpoint
    this.messagingService.startSystemAdminConversation(this.newMessage.trim()).subscribe({
      next: (conversation) => {
        this.isSending = false;
        this.closeStartConversationModal();
        // Navigate to the conversation
        this.router.navigate(['/messages', conversation.id]);
      },
      error: (error) => {
        this.isSending = false;
        console.error('Error starting conversation:', error);
        this.errorMessage = error.error?.message || 'Failed to start conversation. Please try again.';
      }
    });
  }

  // ── Company to User Messaging ─────────────────────────────────────────────────

  openUserSearchModal() {
    this.showUserSearchModal = true;
    this.loadMessagableUsers();
  }

  closeUserSearchModal() {
    this.showUserSearchModal = false;
    this.selectedUser = null;
    this.messageToUser = '';
    this.userSearchQuery = '';
    this.selectedUserType = '';
    this.errorMessage = '';
  }

  loadMessagableUsers() {
    this.isLoadingUsers = true;
    this.messagingService.getMessagableUsers(this.selectedUserType || undefined).subscribe({
      next: (users) => {
        this.messagableUsers = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading messagable users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  filterUsers() {
    this.loadMessagableUsers();
  }

  get filteredUsers(): MessagableUserDto[] {
    if (!this.userSearchQuery.trim()) {
      return this.messagableUsers;
    }
    const query = this.userSearchQuery.toLowerCase();
    return this.messagableUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.userType.toLowerCase().includes(query)
    );
  }

  selectUser(user: MessagableUserDto) {
    if (user.hasExistingConversation && user.existingConversationId) {
      // Navigate to existing conversation
      this.router.navigate(['/messages', user.existingConversationId]);
      this.closeUserSearchModal();
    } else {
      this.selectedUser = user;
    }
  }

  goBackToUserList() {
    this.selectedUser = null;
    this.messageToUser = '';
    this.errorMessage = '';
  }

  startConversationWithUser() {
    if (!this.selectedUser) return;

    if (!this.messageToUser.trim()) {
      this.errorMessage = 'Please enter a message.';
      return;
    }

    this.isSending = true;
    this.errorMessage = '';

    this.messagingService.startConversationWithUser({
      targetUserId: this.selectedUser.id,
      message: this.messageToUser.trim()
    }).subscribe({
      next: (conversation) => {
        this.isSending = false;
        this.closeUserSearchModal();
        // Navigate to the conversation
        this.router.navigate(['/messages', conversation.id]);
      },
      error: (error) => {
        this.isSending = false;
        console.error('Error starting conversation with user:', error);
        this.errorMessage = error.error?.message || 'Failed to start conversation. Please try again.';
      }
    });
  }
}
