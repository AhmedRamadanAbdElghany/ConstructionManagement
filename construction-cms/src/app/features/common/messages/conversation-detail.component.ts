import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MessagingService, ConversationDetailDto, SendMessageRequest, CanSendMessageResult } from '../../../core/services/messaging.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex flex-col items-center justify-center py-40 animate-premium-fade">
          <div class="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8 shadow-2xl shadow-indigo-500/20"></div>
          <p class="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">
            Retrieving Transmission
          </p>
        </div>
      }

      @if (!isLoading && conversation) {
        <!-- Header -->
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-50">
          <div class="max-w-5xl mx-auto p-4 md:p-8">
            <div class="flex items-center gap-8">
              <a routerLink="/messages" class="group flex items-center justify-center w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-white text-slate-500 hover:text-white dark:hover:text-slate-900 transition-all duration-500 shadow-sm">
                <svg class="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path>
                </svg>
              </a>
              
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-1">
                  <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase tabular-nums">
                    {{ conversation.companyName }}
                  </h1>
                  <span class="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm"
                        [ngClass]="{
                          'bg-amber-500/10 text-amber-500 border-amber-500/20': conversation.status === 'Pending',
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': conversation.status === 'Approved',
                          'bg-rose-500/10 text-rose-500 border-rose-500/20': conversation.status === 'Blocked'
                        }">
                    {{ conversation.status }}
                  </span>
                </div>
                <p class="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest ltr:ml-1 rtl:mr-1">
                  Private Secure Communication
                </p>
              </div>

              <!-- Company Owner Actions -->
              @if (conversation.isCompanyOwner) {
                <div class="flex items-center gap-3">
                  @if (conversation.status === 'Pending') {
                    <button 
                      (click)="approveConversation()"
                      class="px-8 py-4 rounded-2xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/30 hover:-translate-y-1">
                      {{ 'messages.approve' | translate }}
                    </button>
                  }
                  @if (conversation.status !== 'Blocked') {
                    <button 
                      (click)="blockConversation()"
                      class="px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-rose-500 border border-rose-500/20 text-[11px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-black/[0.02]">
                      {{ 'messages.block' | translate }}
                    </button>
                  }
                  @if (conversation.status === 'Blocked') {
                    <button 
                      (click)="unblockConversation()"
                      class="px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl">
                      {{ 'messages.unblock' | translate }}
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="max-w-5xl mx-auto p-4 md:p-12 pb-48">
          <!-- Status Banner -->
          @if (conversation.status === 'Pending' && !conversation.isCompanyOwner) {
            <div class="mb-16 p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-amber-500/20 relative overflow-hidden group">
              <div class="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              <div class="relative z-10 flex items-center gap-8">
                <div class="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 animate-pulse">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight uppercase">{{ 'messages.pending_title' | translate }}</h4>
                  <p class="text-slate-500 dark:text-slate-400 font-bold text-[13px] uppercase tracking-wider">{{ 'messages.pending_desc' | translate }}</p>
                </div>
              </div>
            </div>
          }

          @if (conversation.status === 'Blocked') {
            <div class="mb-16 p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-rose-500/20 relative overflow-hidden group">
              <div class="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              <div class="relative z-10 flex items-center gap-8">
                <div class="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 flex items-center justify-center text-rose-500 flex-shrink-0">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight uppercase">{{ 'messages.blocked_title' | translate }}</h4>
                  <p class="text-slate-500 dark:text-slate-400 font-bold text-[13px] uppercase tracking-wider">{{ 'messages.blocked_desc' | translate }}</p>
                </div>
              </div>
            </div>
          }

          <!-- Messages List -->
          <div class="space-y-20">
            @for (group of groupedMessages; track group.date) {
              <div class="relative py-8">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="w-full border-t border-slate-200 dark:border-white/5"></div>
                </div>
                <div class="relative flex justify-center">
                  <span class="px-8 py-2.5 rounded-full bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-white/5 shadow-sm">
                    {{ group.date }}
                  </span>
                </div>
              </div>

              <div class="space-y-12">
                @for (message of group.messages; track message.id) {
                  <div 
                    class="flex gap-6 group animate-in fade-in slide-in-from-bottom-6 duration-700"
                    [ngClass]="{ 'flex-row-reverse': !message.isFromCompany }"
                    [style.animation-delay]="($index * 100) + 'ms'">
                    
                    <!-- Avatar -->
                    <div class="w-16 h-16 rounded-[2rem] flex-shrink-0 flex items-center justify-center text-white text-2xl font-black shadow-2xl transition-transform group-hover:scale-110 duration-500"
                         [ngClass]="message.isFromCompany ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-slate-900 dark:bg-white dark:text-slate-900 shadow-black/10'">
                      {{ message.senderName.charAt(0) }}
                    </div>
                    
                    <!-- Message Content -->
                    <div class="flex-1 max-w-[85%] sm:max-w-[70%]">
                      <div class="flex items-center gap-4 mb-3 px-2"
                           [ngClass]="{ 'flex-row-reverse': !message.isFromCompany }">
                        <span class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                          {{ message.senderName }}
                        </span>
                        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {{ formatTime(message.createdAt) }}
                        </span>
                      </div>
                      
                      <div class="relative group/bubble p-8 rounded-[3rem] shadow-2xl transition-all duration-500"
                           [ngClass]="message.isFromCompany 
                             ? 'bg-white dark:bg-slate-900 rounded-tl-none border border-slate-100 dark:border-white/5 shadow-black/[0.02]' 
                             : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/20 group-hover:bg-indigo-700'">
                        
                        <p class="text-base leading-relaxed whitespace-pre-wrap font-bold"
                           [ngClass]="message.isFromCompany ? 'text-slate-700 dark:text-slate-300' : 'text-white'">{{ message.content }}</p>
                        
                        <!-- Attachments -->
                        @if (message.attachments && message.attachments.length > 0) {
                          <div class="mt-8 grid grid-cols-1 gap-3">
                            @for (attachment of message.attachments; track attachment.id) {
                              <a [href]="attachment.fileUrl" target="_blank" class="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-500/5 hover:bg-slate-500/10 transition-all border border-transparent hover:border-slate-500/10">
                                <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-sm border border-white/10">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                  </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="text-xs font-black uppercase tracking-widest truncate" [ngClass]="message.isFromCompany ? 'text-slate-600 dark:text-slate-400' : 'text-white'">
                                    {{ attachment.originalFileName }}
                                  </div>
                                  <div class="text-[10px] font-black opacity-50 uppercase tracking-widest" [ngClass]="message.isFromCompany ? 'text-slate-400' : 'text-slate-100'">
                                    {{ formatFileSize(attachment.fileSize) }}
                                  </div>
                                </div>
                                <svg class="w-5 h-5 opacity-0 group-hover/bubble:opacity-100 transition-opacity" [ngClass]="message.isFromCompany ? 'text-indigo-500' : 'text-white'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                              </a>
                            }
                          </div>
                        }
                      </div>
                      
                      <!-- Read Status -->
                      @if (!message.isFromCompany && message.isRead) {
                        <div class="flex items-center justify-end gap-2 mt-4 px-3">
                           <span class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] tabular-nums">Delivered & Read</span>
                           <div class="flex text-indigo-500">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                             </svg>
                           </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Reply Area Wrapper -->
          <div class="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-8 z-50">
            @if (canSend?.canSend) {
              <div class="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)] p-5 md:p-8 group transition-all duration-700 focus-within:-translate-y-4">
                <!-- Dropdown Shadow effect -->
                <div class="absolute inset-0 bg-indigo-500/5 rounded-[3.5rem] blur-[80px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 -z-10"></div>
                
                <div class="flex items-end gap-6">
                  <div class="flex-1">
                    <textarea 
                      [(ngModel)]="replyContent"
                      rows="1"
                      [placeholder]="'messages.reply_placeholder' | translate"
                      class="w-full px-8 py-5 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none text-[15px] font-bold leading-relaxed max-h-[200px] transition-all">
                    </textarea>
                    
                    <div class="mt-4 flex items-center gap-6 px-4">
                      <label class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-white text-slate-500 hover:text-white dark:hover:text-slate-900 transition-all cursor-pointer group/upload">
                        <svg class="w-5 h-5 transition-transform group-hover/upload:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                        </svg>
                        <span class="text-[10px] font-black uppercase tracking-widest">Attach Files</span>
                        <input type="file" multiple (change)="onFileSelect($event)" class="hidden" />
                      </label>
                      
                      @if (selectedFiles.length > 0) {
                        <div class="flex items-center gap-4 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 animate-in zoom-in duration-300">
                          <span class="text-[10px] font-black uppercase tracking-widest tabular-nums">{{ selectedFiles.length }} Active Attachments</span>
                          <button (click)="selectedFiles = []" class="hover:scale-110 transition-transform">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                  
                  <button 
                    (click)="sendReply()"
                    [disabled]="!replyContent.trim() || isSending"
                    class="h-[60px] md:px-12 rounded-[2.5rem] bg-indigo-600 text-white font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] active:scale-95 group/send hover:-translate-y-2">
                    <span class="hidden md:inline text-xs">Transmit</span>
                    @if (isSending) {
                      <div class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    } @else {
                      <svg class="w-5 h-5 group-hover/send:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    }
                  </button>
                </div>
                
                @if (errorMessage) {
                  <div class="mt-6 p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest text-center animate-in shake duration-500">
                    {{ errorMessage }}
                  </div>
                }
              </div>
            }

            @if (canSend && !canSend.canSend) {
              <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[3rem] p-8 text-center border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden group">
                <div class="absolute inset-0 bg-slate-500/[0.02] -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms]"></div>
                <div class="flex items-center justify-center gap-4 text-slate-400 dark:text-slate-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <p class="font-black uppercase tracking-[0.3em] text-[10px]">{{ canSend.reason }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
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
    const isSystemAdmin = this.authService.getCurrentUser()?.roles?.includes('SystemAdmin');

    this.messagingService.canSendMessage(conversationId).subscribe({
      next: (result) => {
        if (isSystemAdmin && !result.canSend && result.reason?.toLowerCase().includes('participant')) {
          this.canSend = { canSend: true };
          return;
        }
        this.canSend = result;
      },
      error: (error) => {
        console.error('Error checking can send:', error);
        if (isSystemAdmin) {
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

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  get groupedMessages() {
    if (!this.conversation) return [];

    const groups: { date: string, messages: any[] }[] = [];
    this.conversation.messages.forEach(msg => {
      const date = this.formatDate(msg.createdAt);
      let group = groups.find(g => g.date === date);
      if (!group) {
        group = { date, messages: [] };
        groups.push(group);
      }
      group.messages.push(msg);
    });
    return groups;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

