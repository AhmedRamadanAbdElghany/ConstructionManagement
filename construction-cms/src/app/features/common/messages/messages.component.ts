import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MessagingService, ConversationDto, MessagingStatusDto, MessagableUserDto } from '../../../core/services/messaging.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
              {{ 'messages.title' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              {{ 'messages.subtitle' | translate }}
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Message User Button (Company Owners Only) -->
            @if (isCompanyOwner && !isRestricted) {
              <button 
                (click)="openUserSearchModal()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                {{ 'messages.message_user' | translate }}
              </button>
            }
            
            <!-- Unread Count -->
            @if (unreadCount > 0) {
              <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span class="font-bold">{{ unreadCount }} {{ 'messages.unread' | translate }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Restriction Notice for Unverified Owners -->
        @if (isRestricted) {
          <div class="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div class="flex-1">
                <h4 class="font-bold text-amber-700 dark:text-amber-400">{{ 'messages.restricted_title' | translate }}</h4>
                <p class="text-sm text-amber-600 dark:text-amber-300">{{ 'messages.restricted_desc' | translate }}</p>
                <button 
                  (click)="openStartConversationModal()"
                  class="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  {{ 'messages.start_conversation_admin' | translate }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Loading State -->
        @if (isLoading || isStatusLoading) {
          <app-loading-spinner containerClass="py-20"></app-loading-spinner>
        }

        <!-- Tabs -->
        @if (!isLoading && !isStatusLoading && availableTabs.length > 1) {
          <div class="mb-6 flex flex-wrap gap-2">
            @for (tab of availableTabs; track tab.key) {
              <button
                (click)="setActiveTab(tab.key)"
                class="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                [ngClass]="{
                  'bg-indigo-600 text-white': activeTab === tab.key,
                  'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700': activeTab !== tab.key
                }">
                {{ tab.label | translate }}
              </button>
            }
          </div>
        }

        <!-- Conversations List -->
        @if (!isLoading && !isStatusLoading && filteredConversations.length > 0) {
          <div class="space-y-4">
            @for (conversation of filteredConversations; track conversation.id) {
              <a 
                [routerLink]="['/messages', conversation.id]"
                class="block group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all">
                
                <div class="p-6">
                  <div class="flex items-start gap-4">
                    <!-- Avatar -->
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                      @if (conversation.isCompanyOwner) {
                        {{ conversation.initiatorName.charAt(0) }}
                      } @else {
                        {{ conversation.companyName.charAt(0) }}
                      }
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <h3 class="text-lg font-black text-slate-900 dark:text-white truncate">
                            @if (conversation.isCompanyOwner) {
                              {{ conversation.initiatorName }}
                            } @else {
                              {{ conversation.companyName }}
                            }
                          </h3>
                          
                          <!-- Status Badge -->
                          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                                [ngClass]="{
                                  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400': conversation.status === 'Pending',
                                  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400': conversation.status === 'Approved',
                                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': conversation.status === 'Blocked'
                                }">
                            {{ conversation.status }}
                          </span>
                        </div>
                        
                        <span class="text-xs text-slate-400">
                          {{ conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : formatDateTime(conversation.createdAt) }}
                        </span>
                      </div>
                      
                      <!-- Last Message Preview -->
                      @if (conversation.lastMessage) {
                        <p class="text-sm text-slate-500 dark:text-slate-400 truncate mb-2">
                          @if (conversation.lastMessage.isFromCompany) {
                            <span class="text-indigo-600 dark:text-indigo-400 font-medium">{{ 'messages.company_reply' | translate }}:</span>
                          }
                          {{ conversation.lastMessage.content }}
                        </p>
                      }
                      
                      <!-- Meta Info -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 text-xs text-slate-400">
                          @if (!conversation.isCompanyOwner) {
                            <span class="flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                              {{ conversation.companyName }}
                            </span>
                          }
                          
                          @if (conversation.lastMessage; as msg) {
                            @if (msg.attachments && msg.attachments.length > 0) {
                              <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                </svg>
                                {{ msg.attachments.length }}
                              </span>
                            }
                          }
                        </div>
                        
                        <!-- Unread Badge -->
                        @if (conversation.unreadCount > 0) {
                          <span class="px-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold">
                            {{ conversation.unreadCount }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading && !isStatusLoading && filteredConversations.length === 0 && conversations.length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <svg class="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {{ 'messages.no_messages' | translate }}
            </h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
              @if (isRestricted) {
                {{ 'messages.restricted_empty_desc' | translate }}
              } @else {
                {{ 'messages.no_messages_desc' | translate }}
              }
            </p>
            @if (isRestricted) {
              <div class="flex flex-col sm:flex-row gap-3">
                <button 
                  (click)="openStartConversationModal()"
                  class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  {{ 'messages.start_conversation_admin' | translate }}
                </button>
              </div>
            } @else {
              <a routerLink="/companies" class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {{ 'messages.browse_companies' | translate }}
              </a>
            }
          </div>
        }
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
                <span class="text-sm text-indigo-700 dark:text-indigo-300">{{ 'messages.messaging_superadmin' | translate }}</span>
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
              (click)="startConversationWithSuperAdmin()"
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

    <!-- User Search Modal (Company Owners Only) -->
    @if (showUserSearchModal) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-black text-slate-900 dark:text-white">{{ 'messages.message_client_worker' | translate }}</h3>
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
                  <option value="Client">{{ 'messages.clients' | translate }}</option>
                  <option value="Worker">{{ 'messages.workers' | translate }}</option>
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
  superAdminCompanyId: number | null = null;
  isCompanyOwner = false;

  // Tab state
  activeTab: string = 'all';
  availableTabs: { key: string; label: string }[] = [];

  // Messagable users for company owners
  messagableUsers: MessagableUserDto[] = [];
  isLoadingUsers = false;
  showUserSearchModal = false;
  userSearchQuery = '';
  selectedUserType = '';
  selectedUser: MessagableUserDto | null = null;
  messageToUser = '';

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
      this.isCompanyOwner = currentUser.userType === 2 ||
        currentUser.roles?.includes('CompanyAdmin') ||
        currentUser.roles?.includes('SuperAdmin');
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
        this.superAdminCompanyId = status.superAdminCompanyId ?? null;
        this.isStatusLoading = false;
      },
      error: (error) => {
        console.error('Error loading messaging status:', error);
        this.isStatusLoading = false;
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
    // Determine which tabs should be visible based on user type and conversations
    this.availableTabs = [];

    // Check if user is SuperAdmin
    const isSuperAdmin = this.authService.getCurrentUser()?.roles?.includes('SuperAdmin');

    // SuperAdmin sees all tabs
    if (isSuperAdmin) {
      this.availableTabs.push({ key: 'all', label: 'messages.tabs.all' });
      this.availableTabs.push({ key: 'Company', label: 'messages.tabs.companies' });
      this.availableTabs.push({ key: 'Worker', label: 'messages.tabs.workers' });
      this.availableTabs.push({ key: 'Client', label: 'messages.tabs.clients' });
      this.availableTabs.push({ key: 'SuperAdmin', label: 'messages.tabs.superadmin' });
      return;
    }

    // Always show "All" tab if there are conversations
    if (this.conversations.length > 0) {
      this.availableTabs.push({ key: 'all', label: 'messages.tabs.all' });
    }

    // Check which conversation types exist
    const hasCompanyConversations = this.conversations.some(c => c.conversationType === 'Company');
    const hasWorkerConversations = this.conversations.some(c => c.conversationType === 'Worker');
    const hasClientConversations = this.conversations.some(c => c.conversationType === 'Client');
    const hasSuperAdminConversations = this.conversations.some(c => c.conversationType === 'SuperAdmin');

    // Add tabs based on conversation types and user permissions
    if (hasCompanyConversations) {
      this.availableTabs.push({ key: 'Company', label: 'messages.tabs.companies' });
    }

    // Workers tab - visible for company owners who can message workers
    if (hasWorkerConversations || (this.isCompanyOwner && !this.isRestricted)) {
      this.availableTabs.push({ key: 'Worker', label: 'messages.tabs.workers' });
    }

    // Clients tab - visible for company owners who can message clients
    if (hasClientConversations || (this.isCompanyOwner && !this.isRestricted)) {
      this.availableTabs.push({ key: 'Client', label: 'messages.tabs.clients' });
    }

    // SuperAdmin tab - always visible if there are SuperAdmin conversations or user is restricted
    if (hasSuperAdminConversations || this.isRestricted) {
      this.availableTabs.push({ key: 'SuperAdmin', label: 'messages.tabs.superadmin' });
    }

    // Set default tab based on user type
    if (this.isRestricted && hasSuperAdminConversations) {
      this.activeTab = 'SuperAdmin';
    } else if (this.availableTabs.length > 0 && !this.availableTabs.find(t => t.key === this.activeTab)) {
      this.activeTab = this.availableTabs[0].key;
    }
  }

  get filteredConversations(): ConversationDto[] {
    if (this.activeTab === 'all') {
      return this.conversations;
    }
    return this.conversations.filter(c => c.conversationType === this.activeTab);
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

  startConversationWithSuperAdmin() {
    if (!this.newMessage.trim()) {
      this.errorMessage = 'Please enter a message.';
      return;
    }

    if (!this.superAdminCompanyId) {
      this.errorMessage = 'SuperAdmin company not found. Please contact support.';
      return;
    }

    this.isSending = true;
    this.errorMessage = '';

    this.messagingService.startConversation({
      companyId: this.superAdminCompanyId,
      message: this.newMessage.trim()
    }).subscribe({
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
