import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { SiteMediaService, SiteMediaDto, ReviewMediaRequest } from '../../../../core/services/site-media.service';
import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-site-media-review',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Media Review</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Review and approve/reject uploaded media</p>
          </div>
          <div class="flex items-center space-x-4">
            <select [(ngModel)]="filterStatus" 
                    (change)="loadPendingMedia()"
                    class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select [(ngModel)]="filterMediaType" 
                    (change)="loadPendingMedia()"
                    class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Review</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ pendingCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3v-4l3 3m-9 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Approved Today</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ approvedTodayCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rejected Today</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ rejectedTodayCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Reviewed</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ totalReviewedCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Media Review List -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-lg font-black text-slate-900 dark:text-white">Pending Media</h2>
          </div>
          <div class="p-6">
            @if (filteredMedia.length === 0) {
              <div class="text-center py-12">
                <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="text-sm font-bold text-slate-400">No pending media to review</div>
                <div class="text-xs text-slate-400 mt-1">All media has been reviewed</div>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (media of filteredMedia; track media.id) {
                  <div class="bg-slate-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                    <!-- Media Preview -->
                    <div class="relative aspect-video">
                      @if (media.mediaType === 'image') {
                        <img [src]="media.fileUrl" [alt]="media.description || media.fileName" class="w-full h-full object-cover">
                      } @else {
                        <div class="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-white/10">
                          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      }
                      <!-- Status Badge -->
                      <div class="absolute top-3 right-3">
                        <span [class]="'px-3 py-1 rounded-full text-[10px] font-black uppercase ' + getStatusClass(media)">
                          {{ media.statusName }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Media Info -->
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-3">
                        <div>
                          <div class="text-sm font-bold text-slate-900 dark:text-white">{{ media.fileName }}</div>
                          @if (media.itemName) {
                            <div class="text-xs text-slate-400 mt-1">Item: {{ media.itemName }}</div>
                          }
                        </div>
                        <div class="text-xs text-slate-400">{{ formatFileSize(media.fileSize) }}</div>
                      </div>
                      @if (media.description) {
                        <div class="text-sm text-slate-600 dark:text-slate-400 mb-3">{{ media.description }}</div>
                      }
                      <div class="flex items-center justify-between text-xs text-slate-400">
                        <div>Uploaded by: {{ media.uploadedByUserName || 'Unknown' }}</div>
                        <div>{{ media.uploadedDate | date:'short' }}</div>
                      </div>
                      
                      <!-- Action Buttons -->
                      <div class="flex items-center space-x-2 mt-4">
                        <button (click)="openApproveModal(media)" 
                                class="flex-1 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-colors">
                          Approve
                        </button>
                        <button (click)="openRejectModal(media)" 
                                class="flex-1 px-4 py-2 rounded-xl bg-red-500/10 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-colors">
                          Reject
                        </button>
                        <button (click)="viewMedia(media)" 
                                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    @if (showApproveModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Approve Media</h3>
          </div>
          <div class="p-8 space-y-6">
            <div class="flex items-center space-x-4">
              @if (selectedMedia?.mediaType === 'image') {
                <img [src]="selectedMedia?.fileUrl" [alt]="selectedMedia?.description || selectedMedia?.fileName" class="w-24 h-24 rounded-xl object-cover">
              } @else {
                <div class="w-24 h-24 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                  <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </div>
              }
              <div>
                <div class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedMedia?.fileName }}</div>
                <div class="text-xs text-slate-400 mt-1">{{ formatFileSize(selectedMedia?.fileSize || 0) }}</div>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes (Optional)</label>
              <textarea [(ngModel)]="approveNotes" 
                        rows="3"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                        placeholder="Add approval notes..."></textarea>
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeApproveModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="approveMedia()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
              Approve
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Reject Modal -->
    @if (showRejectModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Reject Media</h3>
          </div>
          <div class="p-8 space-y-6">
            <div class="flex items-center space-x-4">
              @if (selectedMedia?.mediaType === 'image') {
                <img [src]="selectedMedia?.fileUrl" [alt]="selectedMedia?.description || selectedMedia?.fileName" class="w-24 h-24 rounded-xl object-cover">
              } @else {
                <div class="w-24 h-24 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                  <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </div>
              }
              <div>
                <div class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedMedia?.fileName }}</div>
                <div class="text-xs text-slate-400 mt-1">{{ formatFileSize(selectedMedia?.fileSize || 0) }}</div>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rejection Reason *</label>
              <select [(ngModel)]="rejectForm.rejectionType" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50">
                <option value="">Select reason</option>
                <option value="Inappropriate">Inappropriate Content</option>
                <option value="PoorQuality">Poor Quality</option>
                <option value="WrongCategory">Wrong Category</option>
                <option value="Duplicate">Duplicate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Additional Notes</label>
              <textarea [(ngModel)]="rejectForm.rejectionReason" 
                        rows="3"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                        placeholder="Provide more details..."></textarea>
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeRejectModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="rejectMedia()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">
              Reject
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class SiteMediaReviewComponent implements OnInit, OnDestroy {
  pendingMedia: SiteMediaDto[] = [];
  filteredMedia: SiteMediaDto[] = [];
  filterStatus: string = '';
  filterMediaType: string = '';
  projectId: number = 1; // TODO: Get from route or service

  // Approve Modal
  showApproveModal: boolean = false;
  selectedMedia: SiteMediaDto | null = null;
  approveNotes: string = '';

  // Reject Modal
  showRejectModal: boolean = false;
  rejectForm: ReviewMediaRequest = {
    status: 'Rejected',
    rejectionType: '',
    rejectionReason: ''
  };

  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  constructor(private siteMediaService: SiteMediaService) { }

  ngOnInit(): void {
    this.loadPendingMedia();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadPendingMedia();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPendingMedia(): void {
    this.siteMediaService.getMediaForProject(this.projectId, undefined, this.filterStatus || undefined).subscribe({
      next: (media) => {
        this.pendingMedia = media;
        this.filterMedia();
      },
      error: (error) => {
        console.error('Error loading pending media:', error);
      }
    });
  }

  filterMedia(): void {
    this.filteredMedia = this.pendingMedia.filter(media => {
      const statusMatch = !this.filterStatus || media.status === this.filterStatus;
      const typeMatch = !this.filterMediaType || media.mediaType === this.filterMediaType;
      return statusMatch && typeMatch;
    });
  }

  get pendingCount(): number {
    return this.pendingMedia.filter(m => m.status === 'Pending').length;
  }

  get approvedTodayCount(): number {
    const today = new Date().toDateString();
    return this.pendingMedia.filter(m =>
      m.status === 'Approved' &&
      new Date(m.approvedDate || '').toDateString() === today
    ).length;
  }

  get rejectedTodayCount(): number {
    const today = new Date().toDateString();
    return this.pendingMedia.filter(m =>
      m.status === 'Rejected' &&
      new Date(m.approvedDate || '').toDateString() === today
    ).length;
  }

  get totalReviewedCount(): number {
    return this.pendingMedia.filter(m => m.status !== 'Pending').length;
  }

  getStatusClass(media: SiteMediaDto): string {
    if (media.status === 'Pending') {
      return 'bg-amber-500/10 text-amber-600';
    }
    if (media.status === 'Approved') {
      return 'bg-emerald-500/10 text-emerald-600';
    }
    return 'bg-red-500/10 text-red-600';
  }

  // Approve Modal Methods
  openApproveModal(media: SiteMediaDto): void {
    this.selectedMedia = media;
    this.approveNotes = '';
    this.showApproveModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedMedia = null;
    this.approveNotes = '';
  }

  approveMedia(): void {
    if (!this.selectedMedia) return;

    const request: ReviewMediaRequest = {
      status: 'Approved',
      rejectionReason: this.approveNotes
    };

    this.siteMediaService.reviewMedia(this.selectedMedia.id, request).subscribe({
      next: () => {
        this.loadPendingMedia();
        this.closeApproveModal();
        alert('Media approved successfully!');
      },
      error: (error) => {
        console.error('Error approving media:', error);
        alert('Failed to approve media');
      }
    });
  }

  // Reject Modal Methods
  openRejectModal(media: SiteMediaDto): void {
    this.selectedMedia = media;
    this.rejectForm = {
      status: 'Rejected',
      rejectionType: '',
      rejectionReason: ''
    };
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedMedia = null;
    this.rejectForm = {
      status: 'Rejected',
      rejectionType: '',
      rejectionReason: ''
    };
  }

  rejectMedia(): void {
    if (!this.selectedMedia || !this.rejectForm.rejectionType) {
      alert('Please select a rejection reason');
      return;
    }

    this.siteMediaService.reviewMedia(this.selectedMedia.id, this.rejectForm).subscribe({
      next: () => {
        this.loadPendingMedia();
        this.closeRejectModal();
        alert('Media rejected successfully!');
      },
      error: (error) => {
        console.error('Error rejecting media:', error);
        alert('Failed to reject media');
      }
    });
  }

  viewMedia(media: SiteMediaDto): void {
    if (media.fileUrl) {
      window.open(media.fileUrl, '_blank');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
