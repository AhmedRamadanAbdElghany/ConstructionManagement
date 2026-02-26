import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MessagingService, ConversationDetailDto, CompanyMessageDto, SendMessageRequest, CanSendMessageResult } from '../../../core/services/messaging.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      @if (!isLoading && conversation) {
        <!-- Header -->
        <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 sticky top-0 z-10">
          <div class="max-w-4xl mx-auto p-4">
            <div class="flex items-center gap-4">
              <a routerLink="/messages" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <svg class="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </a>
              
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h1 class="text-lg font-black text-slate-900 dark:text-white">
                    @if (conversation.isCompanyOwner) {
                      {{ conversation.initiatorName }}
                    } @else {
                      {{ conversation.companyName }}
                    }
                  </h1>
                  <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                        [ngClass]="{
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400': conversation.status === 'Pending',
                          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400': conversation.status === 'Approved',
                          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': conversation.status === 'Blocked'
                        }">
                    {{ conversation.status }}
                  </span>
                </div>
                @if (!conversation.isCompanyOwner && conversation.companyName) {
                  <p class="text-sm text-slate-500">{{ conversation.companyName }}</p>
                }
              </div>

              <!-- Company Owner Actions -->
              @if (conversation.isCompanyOwner) {
                <div class="flex items-center gap-2">
                  @if (conversation.status === 'Pending') {
                    <button 
                      (click)="approveConversation()"
                      class="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors">
                      {{ 'messages.approve' | translate }}
                    </button>
                  }
                  @if (conversation.status !== 'Blocked') {
                    <button 
                      (click)="blockConversation()"
                      class="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                      {{ 'messages.block' | translate }}
                    </button>
                  }
                  @if (conversation.status === 'Blocked') {
                    <button 
                      (click)="unblockConversation()"
                      class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      {{ 'messages.unblock' | translate }}
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div class="max-w-4xl mx-auto p-4">
          <!-- Status Banner -->
          @if (conversation.status === 'Pending' && !conversation.isCompanyOwner) {
            <div class="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 class="font-bold text-amber-800 dark:text-amber-200">{{ 'messages.pending_title' | translate }}</h4>
                  <p class="text-sm text-amber-600 dark:text-amber-400">{{ 'messages.pending_desc' | translate }}</p>
                </div>
              </div>
            </div>
          }

          @if (conversation.status === 'Blocked') {
            <div class="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
                <div>
                  <h4 class="font-bold text-red-800 dark:text-red-200">{{ 'messages.blocked_title' | translate }}</h4>
                  <p class="text-sm text-red-600 dark:text-red-400">{{ 'messages.blocked_desc' | translate }}</p>
                </div>
              </div>
            </div>
          }

          <!-- Messages List -->
          <div class="space-y-4 mb-6">
            @for (message of conversation.messages; track message.id) {
              <div 
                class="flex gap-3"
                [ngClass]="{ 'flex-row-reverse': !message.isFromCompany }">
                
                <!-- Avatar -->
                <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold"
                     [ngClass]="message.isFromCompany ? 'bg-indigo-500' : 'bg-slate-500'">
                  {{ message.senderName.charAt(0) }}
                </div>
                
                <!-- Message Content -->
                <div class="flex-1 max-w-[70%]">
                  <div class="flex items-center gap-2 mb-1"
                       [ngClass]="{ 'flex-row-reverse': !message.isFromCompany }">
                    <span class="text-sm font-bold text-slate-900 dark:text-white">
                      {{ message.senderName }}
                    </span>
                    <span class="text-xs text-slate-400">
                      {{ formatDateTime(message.createdAt) }}
                    </span>
                  </div>
                  
                  <div class="p-4 rounded-2xl"
                       [ngClass]="message.isFromCompany 
                         ? 'bg-indigo-50 dark:bg-indigo-900/20 rounded-tl-none' 
                         : 'bg-slate-100 dark:bg-slate-800 rounded-tr-none'">
                    <p class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ message.content }}</p>
                    
                    <!-- Attachments -->
                    @if (message.attachments && message.attachments.length > 0) {
                      <div class="mt-3 space-y-2">
                        @for (attachment of message.attachments; track attachment.id) {
                          <div class="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-black/10">
                            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                            </svg>
                            <span class="text-sm text-slate-600 dark:text-slate-400 truncate flex-1">
                              {{ attachment.originalFileName }}
                            </span>
                            <span class="text-xs text-slate-400">
                              {{ formatFileSize(attachment.fileSize) }}
                            </span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  
                  <!-- Read Status -->
                  @if (!message.isFromCompany && message.isRead) {
                    <div class="text-xs text-slate-400 mt-1 text-right">
                      {{ 'messages.read' | translate }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Reply Box -->
          @if (canSend?.canSend) {
            <div class="sticky bottom-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl p-4">
              <div class="flex items-end gap-4">
                <div class="flex-1">
                  <textarea 
                    [(ngModel)]="replyContent"
                    rows="2"
                    [placeholder]="'messages.reply_placeholder' | translate"
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none">
                  </textarea>
                  
                  <!-- File Attachments -->
                  <div class="mt-2">
                    <input 
                      type="file"
                      multiple
                      (change)="onFileSelect($event)"
                      class="text-xs text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-600 dark:file:text-indigo-400"
                    />
                    @if (selectedFiles.length > 0) {
                      <span class="text-xs text-slate-400 ml-2">
                        {{ selectedFiles.length }} {{ 'messages.files_selected' | translate }}
                      </span>
                    }
                  </div>
                </div>
                
                <button 
                  (click)="sendReply()"
                  [disabled]="!replyContent.trim() || isSending"
                  class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  @if (isSending) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  }
                  {{ 'messages.send' | translate }}
                </button>
              </div>
              
              <!-- Error Message -->
              @if (errorMessage) {
                <div class="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                  <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
                </div>
              }
            </div>
          }

          <!-- Cannot Send Message -->
          @if (canSend && !canSend.canSend) {
            <div class="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 text-center">
              <p class="text-slate-500 dark:text-slate-400">{{ canSend.reason }}</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ConversationDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private messagingService = inject(MessagingService);
  private i18nService = inject(I18nService);
  private authService = inject(AuthService);

  conversation: ConversationDetailDto | null = null;
  isLoading = false;
  canSend: CanSendMessageResult | null = null;
  errorMessage: string | null = null;

  // Reply
  replyContent = '';
  selectedFiles: File[] = [];
  isSending = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const conversationId = +params['id'];
      if (conversationId) {
        this.loadConversation(conversationId);
      }
    });

    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const conversationId = this.conversation?.id;
        if (conversationId) {
          this.loadConversation(conversationId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConversation(conversationId: number) {
    this.isLoading = true;
    const userId = 0; // Will be determined by the service from the token

    this.messagingService.getConversation(conversationId).subscribe({
      next: (conversation) => {
        this.conversation = conversation;
        this.isLoading = false;
        this.checkCanSend(conversationId);
      },
      error: (error) => {
        console.error('Error loading conversation:', error);
        this.isLoading = false;
      }
    });
  }

  checkCanSend(conversationId: number) {
    const isSuperAdmin = this.authService.getCurrentUser()?.roles?.includes('SuperAdmin');

    this.messagingService.canSendMessage(conversationId).subscribe({
      next: (result) => {
        // SuperAdmin can ALWAYS send messages unless the conversation is blocked by a more severe reason
        if (isSuperAdmin && !result.canSend && result.reason?.toLowerCase().includes('participant')) {
          this.canSend = { canSend: true };
          return;
        }
        this.canSend = result;
      },
      error: (error) => {
        console.error('Error checking can send:', error);
        if (isSuperAdmin) {
          this.canSend = { canSend: true };
          return;
        }
        this.canSend = { canSend: false, reason: 'Unable to determine send permission' };
      }
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  sendReply() {
    if (!this.conversation || !this.replyContent.trim()) return;

    this.isSending = true;
    this.errorMessage = null;
    const request: SendMessageRequest = {
      content: this.replyContent.trim()
    };

    this.messagingService.sendMessage(this.conversation.id, request, this.selectedFiles).subscribe({
      next: (message) => {
        this.conversation?.messages.push(message);
        this.replyContent = '';
        this.selectedFiles = [];
        this.isSending = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending = false;
        // Extract error message from response
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to send message. Please try again.';
        }
      }
    });
  }

  approveConversation() {
    if (!this.conversation) return;

    this.messagingService.approveConversation(this.conversation.id).subscribe({
      next: () => {
        if (this.conversation) {
          this.conversation.status = 'Approved';
          this.checkCanSend(this.conversation.id);
        }
      },
      error: (error) => {
        console.error('Error approving conversation:', error);
      }
    });
  }

  blockConversation() {
    if (!this.conversation) return;

    this.messagingService.blockConversation(this.conversation.id).subscribe({
      next: () => {
        if (this.conversation) {
          this.conversation.status = 'Blocked';
          this.canSend = { canSend: false, reason: 'Conversation has been blocked' };
        }
      },
      error: (error) => {
        console.error('Error blocking conversation:', error);
      }
    });
  }

  unblockConversation() {
    if (!this.conversation) return;

    this.messagingService.unblockConversation(this.conversation.id).subscribe({
      next: () => {
        if (this.conversation) {
          this.conversation.status = 'Approved';
          this.checkCanSend(this.conversation.id);
        }
      },
      error: (error) => {
        console.error('Error unblocking conversation:', error);
      }
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
