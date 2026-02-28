import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MessagingService, PublicCompanyDto, MessagingStatusDto } from '../../../core/services/messaging.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RequestInspectionDialogComponent } from '../../client/client-inspections/request-inspection-dialog.component';
import { CompanyAnnouncementsDialogComponent } from './company-announcements-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-companies-browse',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, RequestInspectionDialogComponent, CompanyAnnouncementsDialogComponent, LoadingSpinnerComponent],
  template: `
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
              {{ 'companies.browse' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              {{ 'companies.browse_subtitle' | translate }}
            </p>
          </div>
          
          <!-- Search & Selection -->
          <div class="flex items-center gap-4">
            @if (selectedIds.size > 0) {
              <button (click)="openBulkRequest()" 
                class="px-6 py-3 rounded-xl bg-amber-500 text-white font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 animate-in zoom-in duration-300">
                {{ 'inspections.request.bulk_title' | translate:{count: selectedIds.size} }}
              </button>
              <button (click)="selectedIds.clear()" class="text-slate-400 hover:text-rose-500 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            }
            <div class="relative group">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                [placeholder]="'companies.search_placeholder' | translate"
                class="w-72 px-4 py-3 pl-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:border-slate-300 dark:group-hover:border-white/10"
              />
              <svg class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              @if (searchQuery && companies.length > 0) {
                <span class="absolute -bottom-6 right-2 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-in fade-in slide-in-from-top-1 duration-300">
                  {{ companies.length }} {{ 'common.found' | translate | lowercase }}
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <app-loading-spinner [centered]="true"></app-loading-spinner>
          </div>
        }

        <!-- Companies Grid -->
        @if (!isLoading && companies.length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (company of companies; track company.id) {
              <div 
                [routerLink]="['/companies', company.id]"
                [class.ring-4]="selectedIds.has(company.id)"
                [class.ring-amber-500/50]="selectedIds.has(company.id)"
                class="group flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden relative animate-premium-fade"
                [style.animation-delay]="($index * 100) + 'ms'">
                
                <!-- Selection Overlay -->
                <div (click)="toggleSelection(company.id, $event)" 
                  class="absolute top-4 left-4 z-20 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                  [class.bg-amber-500]="selectedIds.has(company.id)"
                  [class.text-white]="selectedIds.has(company.id)">
                  @if (selectedIds.has(company.id)) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  } @else {
                    <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  }
                </div>
                
                <!-- Company Logo/Header -->
                <div class="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                  @if (company.logoUrl) {
                    <img [src]="company.logoUrl" [alt]="company.name" class="w-full h-full object-cover opacity-50">
                  }
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  <!-- Action Buttons Over Hero -->
                  <div class="absolute top-4 right-4 flex gap-2">
                    <button 
                      (click)="toggleFollow(company, $event)"
                      [title]="(company.isFollowedByCurrentUser ? 'companies.unfollow' : 'companies.follow') | translate"
                      class="p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 transform active:scale-95"
                      [ngClass]="company.isFollowedByCurrentUser ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/20 text-white hover:bg-white/30'">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                    @if (canMessageCompany(company)) {
                      <button 
                        (click)="openMessageDialog(company, $event)"
                        [title]="'companies.send_message' | translate"
                        class="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-300 transform active:scale-95">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                      </button>
                    } @else {
                      <button disabled 
                              class="p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white/50 opacity-60 cursor-not-allowed transition-all duration-300"
                              [title]="'messages.approval_required_tooltip' | translate"
                              (click)="$event.stopPropagation()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </button>
                    }
                    <button 
                      (click)="openAnnouncements(company, $event)"
                      [title]="'browse_firms.view_announcements' | translate"
                      class="p-2.5 rounded-xl bg-sky-500/80 backdrop-blur-md text-white hover:bg-sky-500 transition-all duration-300 transform active:scale-95">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                      </svg>
                    </button>
                    <button 
                      (click)="openRequestInspection(company, $event)"
                      [title]="'inspections.request.title' | translate"
                      class="p-2.5 rounded-xl bg-amber-500/80 backdrop-blur-md text-white hover:bg-amber-500 transition-all duration-300 transform active:scale-95">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Company Info -->
                <div class="p-6 -mt-8 relative flex-1 flex flex-col">
                  <div class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center mb-4">
                    @if (company.logoUrl) {
                      <img [src]="company.logoUrl" [alt]="company.name" class="w-10 h-10 object-contain">
                    } @else {
                      <span class="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {{ company.name.charAt(0) }}
                      </span>
                    }
                  </div>
                  
                  <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">{{ company.name }}</h3>
                  
                  @if (company.address) {
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {{ company.address }}
                    </p>
                  }
                  
                  <!-- Stats -->
                  <div class="mt-auto flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-white/5">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      {{ company.followerCount }} {{ 'companies.followers' | translate }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                      {{ company.portfolioItemCount }} {{ 'companies.projects' | translate }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading && companies.length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center animate-premium-scale">
            <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <svg class="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {{ 'companies.no_companies' | translate }}
            </h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {{ 'companies.no_companies_desc' | translate }}
            </p>
          </div>
        }
      </div>

      <!-- Message Dialog -->
      @if (showMessageDialog) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-white/10 transform transition-all scale-100 opacity-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {{ 'companies.send_message_to' | translate }} {{ selectedCompany?.name }}
              </h3>
              <button 
                (click)="closeMessageDialog()"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  {{ 'messages.your_message' | translate }}
                </label>
                <textarea 
                  [(ngModel)]="messageContent"
                  rows="4"
                  [placeholder]="'companies.message_placeholder' | translate"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all">
                </textarea>
              </div>

              <!-- File Attachments -->
              <div>
                <label class="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  {{ 'companies.attachments' | translate }}
                </label>
                <div class="relative group">
                  <input 
                    type="file"
                    multiple
                    (change)="onFileSelect($event)"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div class="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 group-hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center text-center">
                    <svg class="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <span class="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {{ selectedFiles.length > 0 ? selectedFiles.length + ' ' + ('companies.files_selected' | translate) : ('common.upload' | translate) }}
                    </span>
                  </div>
                </div>
              </div>

              @if (errorMessage) {
                <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-bold">
                  {{ errorMessage }}
                </div>
              }

              <div class="flex items-center justify-end gap-3 pt-4">
                <button 
                  (click)="closeMessageDialog()"
                  class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  {{ 'common.cancel' | translate }}
                </button>
                <button 
                  (click)="sendMessage()"
                  [disabled]="!messageContent.trim() || isSending"
                  class="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
                  @if (isSending) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {{ 'common.sending' | translate }}
                  } @else {
                    {{ 'common.send' | translate }}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Request Inspection Dialog -->
      @if (showRequestInspection && (selectedCompany || selectedIds.size > 0)) {
        <app-request-inspection-dialog 
          [companyIds]="getActiveCompanyIds()" 
          [companyName]="getActiveCompanyName()"
          (close)="closeRequestInspection()"
          (success)="onRequestSuccess()">
        </app-request-inspection-dialog>
      }

      <!-- Announcements Dialog -->
      @if (showAnnouncementsDialog && selectedCompany) {
        <app-company-announcements-dialog
          [companyId]="selectedCompany.id"
          [companyName]="selectedCompany.name"
          (close)="closeAnnouncements()">
        </app-company-announcements-dialog>
      }
  `
})
export class CompaniesBrowseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private messagingService = inject(MessagingService);
  private i18nService = inject(I18nService);
  private router = inject(Router);
  private authService = inject(AuthService);

  companies: PublicCompanyDto[] = [];
  isLoading = false;
  searchQuery = '';
  private searchTimeout: any;

  // Message dialog state
  showMessageDialog = false;
  selectedCompany: PublicCompanyDto | null = null;
  messageContent = '';
  selectedFiles: File[] = [];
  isSending = false;
  errorMessage = '';

  // Messaging restriction
  messagingStatus: MessagingStatusDto | null = null;
  isRestricted = false;
  superAdminCompanyId: number | null = null;
  // Inspection Request
  showRequestInspection = false;
  selectedIds: Set<number> = new Set();

  // Announcements
  showAnnouncementsDialog = false;

  ngOnInit() {
    this.loadMessagingStatus();
    this.loadCompanies();

    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadCompanies();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadMessagingStatus() {
    this.messagingService.getMessagingStatus().subscribe({
      next: (status) => {
        this.messagingStatus = status;
        this.isRestricted = status.isRestricted;
        this.superAdminCompanyId = status.superAdminCompanyId ?? null;
      },
      error: (error) => {
        console.error('Error loading messaging status:', error);
      }
    });
  }

  canMessageCompany(company: PublicCompanyDto): boolean {
    if (!this.isRestricted) return true;
    if (!this.messagingStatus) return false;

    // Worker can only message their own company
    if (this.messagingStatus.isWorker) {
      return company.id === this.messagingStatus.userCompanyId;
    }

    // Unverified owner can only message SuperAdmin
    if (this.messagingStatus.isUnverifiedCompanyOwner) {
      return company.id === this.superAdminCompanyId;
    }

    return false;
  }

  loadCompanies() {
    this.isLoading = true;
    this.messagingService.getCompanies(this.searchQuery).subscribe({
      next: (companies) => {
        // Get user's current company ID to filter out
        const userCompany = this.authService.getSelectedCompany();
        const userCompanyId = userCompany?.companyId;

        // Filter out the virtual 'System Administration' company and user's own company
        // We use both name check and ID check if available for robustness
        this.companies = companies.filter(c =>
          c.name !== 'System Administration' &&
          c.id !== this.superAdminCompanyId &&
          c.id !== userCompanyId
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.isLoading = false;
      }
    });
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadCompanies();
    }, 300);
  }

  toggleFollow(company: PublicCompanyDto, event: Event) {
    event.stopPropagation();
    if (company.isFollowedByCurrentUser) {
      this.messagingService.unfollowCompany(company.id).subscribe({
        next: () => {
          company.isFollowedByCurrentUser = false;
          company.followerCount--;
        },
        error: (err) => console.error('Error unfollowing:', err)
      });
    } else {
      this.messagingService.followCompany(company.id).subscribe({
        next: () => {
          company.isFollowedByCurrentUser = true;
          company.followerCount++;
        },
        error: (err) => console.error('Error following:', err)
      });
    }
  }

  openMessageDialog(company: PublicCompanyDto, event: Event) {
    event.stopPropagation();
    this.selectedCompany = company;
    this.showMessageDialog = true;
    this.messageContent = '';
    this.selectedFiles = [];
    this.errorMessage = '';
  }

  closeMessageDialog() {
    this.showMessageDialog = false;
    this.selectedCompany = null;
    this.messageContent = '';
    this.selectedFiles = [];
    this.errorMessage = '';
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  sendMessage() {
    if (!this.selectedCompany || !this.messageContent.trim()) return;

    this.isSending = true;
    this.errorMessage = '';

    this.messagingService.startConversation({
      companyId: this.selectedCompany.id,
      message: this.messageContent.trim()
    }, this.selectedFiles).subscribe({
      next: (conversation) => {
        this.isSending = false;
        this.closeMessageDialog();
        // Navigate to the new conversation
        this.router.navigate(['/messages', conversation.id]);
      },
      error: (error) => {
        this.isSending = false;
        this.errorMessage = error.error?.message || 'Failed to send message. Please try again.';
      }
    });
  }

  openRequestInspection(company: PublicCompanyDto, event: Event) {
    event.stopPropagation();
    this.selectedCompany = company;
    this.showRequestInspection = true;
  }

  openBulkRequest() {
    this.selectedCompany = null;
    this.showRequestInspection = true;
  }

  openAnnouncements(company: PublicCompanyDto, event: Event) {
    event.stopPropagation();
    this.selectedCompany = company;
    this.showAnnouncementsDialog = true;
  }

  closeAnnouncements() {
    this.showAnnouncementsDialog = false;
    if (!this.showMessageDialog && !this.showRequestInspection) {
      this.selectedCompany = null;
    }
  }

  toggleSelection(id: number, event: Event) {
    event.stopPropagation();
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  getActiveCompanyIds(): number[] {
    if (this.selectedCompany) return [this.selectedCompany.id];
    return Array.from(this.selectedIds);
  }

  getActiveCompanyName(): string {
    if (this.selectedCompany) return this.selectedCompany.name;
    return `${this.selectedIds.size} Companies`;
  }

  closeRequestInspection() {
    this.showRequestInspection = false;
    this.selectedCompany = null;
  }

  onRequestSuccess() {
    this.showRequestInspection = false;
    this.selectedCompany = null;
    this.selectedIds.clear();
    alert('Inspection request(s) submitted successfully!');
  }
}
