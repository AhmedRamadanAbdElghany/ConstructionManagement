import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import {
  MessagingService,
  PublicCompanyDetailDto,
  PortfolioItemDto,
  StartConversationRequest,
  MessagingStatusDto
} from '../../../core/services/messaging.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RequestInspectionDialogComponent } from '../../client/client-inspections/request-inspection-dialog.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, RequestInspectionDialogComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      @if (!isLoading && company) {
        <!-- Hero Section -->
        <div class="relative h-64 bg-gradient-to-br from-indigo-500 to-purple-600">
          @if (company.logoUrl) {
            <img [src]="company.logoUrl" [alt]="company.name" class="w-full h-full object-cover opacity-30">
          }
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          <!-- Back Button -->
          <a routerLink="/companies" class="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/20 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            {{ 'companies.back' | translate }}
          </a>
          
          <!-- Company Info Overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <div class="max-w-7xl mx-auto flex items-end gap-6">
              <div class="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center">
                @if (company.logoUrl) {
                  <img [src]="company.logoUrl" [alt]="company.name" class="w-16 h-16 object-contain">
                } @else {
                  <span class="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                    {{ company.name.charAt(0) }}
                  </span>
                }
              </div>
              <div class="flex-1">
                <h1 class="text-3xl font-black text-white mb-2 tracking-tight">{{ company.name }}</h1>
                @if (company.address) {
                  <p class="text-white/80 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {{ company.address }}
                  </p>
                }
              </div>
              <div class="flex items-center gap-3">
                <!-- Request Inspection Button -->
                <button 
                  (click)="showRequestInspection = true"
                  class="px-6 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  {{ 'inspections.request.title' | translate }}
                </button>

                <!-- Follow Button -->
                @if (company.isFollowedByCurrentUser) {
                  <button 
                    (click)="unfollowCompany()"
                    class="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm font-bold hover:bg-white/20 transition-colors">
                    {{ 'companies.unfollow' | translate }}
                  </button>
                } @else {
                  <button 
                    (click)="followCompany()"
                    class="px-6 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors">
                    {{ 'companies.follow' | translate }}
                  </button>
                }
                
                <!-- Message Button -->
                @if (canMessage) {
                  <button 
                    (click)="openMessageDialog()"
                    class="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    {{ 'companies.send_message' | translate }}
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-7xl mx-auto p-6">
          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5">
              <div class="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{{ company.followerCount }}</div>
              <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'companies.followers' | translate }}</div>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5">
              <div class="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{{ company.portfolioItemCount }}</div>
              <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'companies.projects' | translate }}</div>
            </div>
            @if (company.contactEmail) {
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5">
                <div class="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">{{ company.contactEmail }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'companies.email' | translate }}</div>
              </div>
            }
            @if (company.contactPhone) {
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5">
                <div class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ company.contactPhone }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'companies.phone' | translate }}</div>
              </div>
            }
          </div>

          <!-- Portfolio Section -->
          <div class="mb-10">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              {{ 'companies.portfolio' | translate }}
            </h2>

            @if (company.portfolioCategories && company.portfolioCategories.length > 0) {
              <!-- Category Filter -->
              <div class="flex flex-wrap gap-2 mb-6">
                <button 
                  (click)="selectedCategory = null"
                  class="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                  [ngClass]="selectedCategory === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'">
                  {{ 'companies.all_categories' | translate }}
                </button>
                @for (category of company.portfolioCategories; track category.id) {
                  <button 
                    (click)="selectedCategory = category.id"
                    class="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    [ngClass]="selectedCategory === category.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'">
                    {{ category.name }} ({{ category.itemCount }})
                  </button>
                }
              </div>
            }

            @if (filteredPortfolio.length > 0) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (item of filteredPortfolio; track item.id) {
                  <div class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                    @if (item.fileUrl) {
                      <div class="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                        @if (item.fileType?.startsWith('image/')) {
                          <img [src]="item.fileUrl" [alt]="item.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                        } @else {
                          <div class="w-full h-full flex items-center justify-center">
                            <svg class="w-16 h-16 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                          </div>
                        }
                      </div>
                    }
                    <div class="p-6">
                      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ item.name }}</h3>
                      @if (item.description) {
                        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{{ item.description }}</p>
                      }
                      <div class="flex flex-wrap gap-2 text-xs text-slate-400">
                        @if (item.categoryName) {
                          <span class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{{ item.categoryName }}</span>
                        }
                        @if (item.completionDate) {
                          <span class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{{ item.completionDate | date:'mediumDate' }}</span>
                        }
                        @if (item.location) {
                          <span class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{{ item.location }}</span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                {{ 'companies.no_portfolio' | translate }}
              </div>
            }
          </div>
        </div>
      }

      <!-- Message Dialog -->
      @if (showMessageDialog) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl">
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-4">
              {{ 'companies.send_message_to' | translate }} {{ company?.name }}
            </h3>
            
            <div class="mb-4">
              <textarea 
                [(ngModel)]="messageContent"
                rows="4"
                [placeholder]="'companies.message_placeholder' | translate"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none">
              </textarea>
            </div>

            <!-- File Attachments -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {{ 'companies.attachments' | translate }}
              </label>
              <input 
                type="file"
                multiple
                (change)="onFileSelect($event)"
                class="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50"
              />
              @if (selectedFiles.length > 0) {
                <div class="mt-2 text-xs text-slate-500">
                  {{ selectedFiles.length }} {{ 'companies.files_selected' | translate }}
                </div>
              }
            </div>

            @if (errorMessage) {
              <div class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {{ errorMessage }}
              </div>
            }

            <div class="flex items-center justify-end gap-3">
              <button 
                (click)="closeMessageDialog()"
                class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {{ 'common.cancel' | translate }}
              </button>
              <button 
                (click)="sendMessage()"
                [disabled]="!messageContent.trim() || isSending"
                class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isSending) {
                  <span class="flex items-center gap-2">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {{ 'common.sending' | translate }}
                  </span>
                } @else {
                  {{ 'common.send' | translate }}
                }
              </button>
            </div>
          </div>
        </div>
      }
      <!-- Request Inspection Dialog -->
      @if (showRequestInspection && company) {
        <app-request-inspection-dialog 
          [companyIds]="[company.id]" 
          [companyName]="company.name"
          (close)="showRequestInspection = false"
          (success)="onRequestSuccess()">
        </app-request-inspection-dialog>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CompanyDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private messagingService = inject(MessagingService);
  private i18nService = inject(I18nService);

  company: PublicCompanyDetailDto | null = null;
  isLoading = false;
  selectedCategory: number | null = null;

  // Message dialog
  showMessageDialog = false;
  messageContent = '';
  selectedFiles: File[] = [];
  isSending = false;
  errorMessage = '';

  // Inspection Request
  showRequestInspection = false;

  // Messaging restriction
  messagingStatus: MessagingStatusDto | null = null;
  isRestricted = false;
  canMessage = true;

  ngOnInit() {
    this.loadMessagingStatus();
    this.route.params.subscribe(params => {
      const companyId = +params['id'];
      if (companyId) {
        this.loadCompany(companyId);
      }
    });

    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const companyId = this.company?.id;
        if (companyId) {
          this.loadCompany(companyId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredPortfolio(): PortfolioItemDto[] {
    if (!this.company) return [];
    if (!this.selectedCategory) return this.company.portfolioItems;
    return this.company.portfolioItems.filter(item => item.categoryId === this.selectedCategory);
  }

  loadMessagingStatus() {
    this.messagingService.getMessagingStatus().subscribe({
      next: (status) => {
        this.messagingStatus = status;
        this.isRestricted = status.isRestricted;
        this.updateCanMessage();
      },
      error: (error) => {
        console.error('Error loading messaging status:', error);
      }
    });
  }

  updateCanMessage() {
    if (!this.isRestricted) {
      this.canMessage = true;
      return;
    }

    if (!this.company || !this.messagingStatus) {
      this.canMessage = false;
      return;
    }

    // Worker can only message their own company
    if (this.messagingStatus.isWorker) {
      this.canMessage = this.company.id === this.messagingStatus.userCompanyId;
      return;
    }

    // Unverified owner can only message SuperAdmin
    if (this.messagingStatus.isUnverifiedCompanyOwner) {
      this.canMessage = this.company.id === this.messagingStatus.superAdminCompanyId;
      return;
    }

    this.canMessage = false;
  }

  loadCompany(companyId: number) {
    this.isLoading = true;
    this.messagingService.getCompanyDetail(companyId).subscribe({
      next: (company) => {
        this.company = company;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading company:', error);
        this.isLoading = false;
      }
    });
  }

  followCompany() {
    if (!this.company) return;
    this.messagingService.followCompany(this.company.id).subscribe({
      next: () => {
        if (this.company) {
          this.company.isFollowedByCurrentUser = true;
          this.company.followerCount++;
        }
      },
      error: (error) => {
        console.error('Error following company:', error);
      }
    });
  }

  unfollowCompany() {
    if (!this.company) return;
    this.messagingService.unfollowCompany(this.company.id).subscribe({
      next: () => {
        if (this.company) {
          this.company.isFollowedByCurrentUser = false;
          this.company.followerCount--;
        }
      },
      error: (error) => {
        console.error('Error unfollowing company:', error);
      }
    });
  }

  openMessageDialog() {
    this.showMessageDialog = true;
    this.messageContent = '';
    this.selectedFiles = [];
    this.errorMessage = '';
  }

  closeMessageDialog() {
    this.showMessageDialog = false;
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
    if (!this.company || !this.messageContent.trim()) return;

    this.isSending = true;
    this.errorMessage = '';

    const request: StartConversationRequest = {
      companyId: this.company.id,
      message: this.messageContent.trim()
    };

    this.messagingService.startConversation(request, this.selectedFiles).subscribe({
      next: () => {
        this.isSending = false;
        this.closeMessageDialog();
        // Show success message or navigate to messages
      },
      error: (error) => {
        this.isSending = false;
        this.errorMessage = error.error?.message || 'Failed to send message. Please try again.';
      }
    });
  }

  onRequestSuccess() {
    this.showRequestInspection = false;
    // Potentially navigate or show a success toast
    alert('Inspection request submitted successfully!');
  }
}
