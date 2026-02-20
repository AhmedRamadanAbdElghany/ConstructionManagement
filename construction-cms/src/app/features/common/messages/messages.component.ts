import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MessagingService, ConversationDto } from '../../../core/services/messaging.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
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

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Conversations List -->
        @if (!isLoading && conversations.length > 0) {
          <div class="space-y-4">
            @for (conversation of conversations; track conversation.id) {
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
        @if (!isLoading && conversations.length === 0) {
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
              {{ 'messages.no_messages_desc' | translate }}
            </p>
            <a routerLink="/companies" class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              {{ 'messages.browse_companies' | translate }}
            </a>
          </div>
        }
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private messagingService = inject(MessagingService);
    private i18nService = inject(I18nService);

    conversations: ConversationDto[] = [];
    isLoading = false;
    unreadCount = 0;

    ngOnInit() {
        this.loadConversations();
        this.loadUnreadCount();

        this.i18nService.onLanguageChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.loadConversations();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadConversations() {
        this.isLoading = true;
        this.messagingService.getConversations().subscribe({
            next: (conversations) => {
                this.conversations = conversations;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading conversations:', error);
                this.isLoading = false;
            }
        });
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
}
