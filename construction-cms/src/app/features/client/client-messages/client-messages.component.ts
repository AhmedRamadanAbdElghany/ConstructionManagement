import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ClientPortalService, ClientMessage } from '../../../core/services/client-portal.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-client-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">{{ 'client.messages' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'client.messages_subtitle' | translate }}</p>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
              <div class="flex flex-col px-3">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                <select [(ngModel)]="selectedStatus" (change)="loadMessages()" class="bg-transparent border-none text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none cursor-pointer">
                  <option value="">All</option>
                  <option value="open">Open</option>
                  <option value="inprogress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <a routerLink="/client-portal/messages/new" class="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
              {{ 'client.new_message' | translate }}
            </a>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <app-loading-spinner [centered]="true"></app-loading-spinner>
          </div>
        }

        <!-- Messages List -->
        @if (!isLoading && messages.length > 0) {
          <div class="space-y-4">
            @for (message of messages; track message.id) {
              <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                   [routerLink]="['/client-portal/messages', message.id]"
                   [class.unread]="message.isUnread">
                <div class="p-8">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                           [ngClass]="{
                             'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500': message.messageType === 'Inquiry',
                             'bg-amber-50 dark:bg-amber-500/10 text-amber-500': message.messageType === 'Request',
                             'bg-rose-50 dark:bg-rose-500/10 text-rose-500': message.messageType === 'Complaint'
                           }">
                        {{ getMessageIcon(message.messageType) }}
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          @if (message.companyName) {
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {{ message.companyName }}
                            </span>
                          }
                        </div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white mb-1">{{ message.subject }}</h3>
                        <div class="flex items-center gap-3">
                          @if (message.projectName) {
                            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                              {{ message.projectName }}
                            </span>
                          }
                          <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ formatDateTime(message.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 text-slate-500"
                            [ngClass]="{
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10': message.status === 'Resolved',
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10': message.status === 'In Progress',
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/10': message.status === 'Open'
                            }">
                        {{ message.status }}
                      </span>
                      <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                            [ngClass]="{
                              'bg-rose-500/10 text-rose-600 dark:text-rose-400': message.priority === 'Urgent',
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400': message.priority === 'High',
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400': message.priority === 'Medium' || message.priority === 'Low'
                            }">
                        {{ message.priority }}
                      </span>
                      @if (message.isUnread) {
                        <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
                      }
                    </div>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{{ message.content }}</p>
                  <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      @if (message.assignedToName) {
                        <span>
                          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          {{ message.assignedToName }}
                        </span>
                      }
                      <span>
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        {{ message.repliesCount }} {{ 'client.replies' | translate }}
                      </span>
                      <span>
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                        </svg>
                        {{ message.attachmentsCount }} {{ 'client.attachments' | translate }}
                      </span>
                    </div>
                    <button class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                      {{ 'client.view_details' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading && messages.length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <svg class="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'client.no_messages' | translate }}</h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
              {{ 'client.no_messages_desc' | translate }}
            </p>
            <a routerLink="/client-portal/messages/new" class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              {{ 'client.send_first_message' | translate }}
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .unread {
      border-left: 4px solid #6366f1;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    :host ::ng-deep select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  `]
})
export class ClientMessagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private clientPortalService = inject(ClientPortalService);
  private route = inject(ActivatedRoute);
  private i18nService = inject(I18nService);

  messages: ClientMessage[] = [];
  isLoading = false;
  selectedStatus = '';

  ngOnInit() {
    this.loadMessages();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMessages();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMessages() {
    this.isLoading = true;
    const status = this.selectedStatus || undefined;
    this.clientPortalService.getClientMessages(status).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoading = false;
      }
    });
  }

  getMessageIcon(messageType: string): string {
    switch (messageType) {
      case 'Inquiry': return '❓';
      case 'Request': return '📋';
      case 'Complaint': return '⚠️';
      default: return '💬';
    }
  }

  formatDateTime(dateString: string): string {
    return this.clientPortalService.formatDateTime(dateString);
  }
}
