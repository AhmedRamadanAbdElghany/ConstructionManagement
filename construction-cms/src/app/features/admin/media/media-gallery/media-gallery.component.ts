import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { SiteMediaService, SiteMediaDto } from '../../../../core/services/site-media.service';
import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Media Gallery</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Browse all approved media for your project</p>
          </div>
          <div class="flex items-center space-x-4">
            <select [(ngModel)]="filterMediaType" 
                    (change)="loadMedia()"
                    class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
            <select [(ngModel)]="filterStatus" 
                    (change)="loadMedia()"
                    class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <input type="text" 
                   [(ngModel)]="searchTerm"
                   (keyup.enter)="loadMedia()"
                   placeholder="Search media..."
                   class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Media</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ allMedia.length }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Images</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ imageCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Videos</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ videoCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Size</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ totalSizeFormatted }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4H4c-2.21 0-4-1.79-4-4V7a4 4 0 014-4h2v2h-3V7a4 4 0 00-4-4H4c-2.21 0-4-1.79-4-4V7a4 4 0 014-4h2v2h-3z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Media Gallery Grid -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-lg font-black text-slate-900 dark:text-white">Gallery</h2>
          </div>
          <div class="p-6">
            @if (filteredMedia.length === 0) {
              <div class="text-center py-12">
                <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="text-sm font-bold text-slate-400">No media found</div>
                <div class="text-xs text-slate-400 mt-1">Try adjusting your filters</div>
              </div>
            } @else {
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                @for (media of filteredMedia; track media.id) {
                  <div class="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 aspect-square cursor-pointer hover:shadow-xl hover:shadow-violet-500/10 transition-all"
                       (click)="openMediaViewer(media)">
                    <!-- Media Preview -->
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
                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div class="absolute bottom-0 left-0 right-0 p-3">
                        <div class="text-[10px] font-black text-white uppercase tracking-widest mb-1">{{ media.fileName }}</div>
                        <div class="text-xs text-white/80">{{ media.uploadedDate | date:'short' }}</div>
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

    <!-- Media Viewer Modal -->
    @if (showMediaViewer) {
      <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white">{{ selectedMedia?.fileName }}</h3>
              <div class="text-sm text-slate-400 mt-1">{{ formatFileSize(selectedMedia?.fileSize || 0) }}</div>
            </div>
            <button (click)="closeMediaViewer()" 
                    class="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="flex-1 overflow-auto p-6">
            @if (selectedMedia?.mediaType === 'image') {
              <img [src]="selectedMedia?.fileUrl" [alt]="selectedMedia?.description || selectedMedia?.fileName || ''" class="max-w-full max-h-[60vh] object-contain mx-auto rounded-xl">
            } @else {
              <div class="w-full h-[60vh] flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-xl">
                <video [src]="selectedMedia?.fileUrl" controls class="max-w-full max-h-full rounded-xl"></video>
              </div>
            }
          </div>
          
          <!-- Footer -->
          <div class="p-6 border-t border-slate-100 dark:border-white/5">
            <div class="grid grid-cols-2 gap-4">
              @if (selectedMedia?.description) {
                <div class="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</div>
                  <div class="text-sm text-slate-900 dark:text-white">{{ selectedMedia!.description }}</div>
                </div>
              }
              <div class="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Uploaded By</div>
                <div class="text-sm text-slate-900 dark:text-white">{{ selectedMedia?.uploadedByUserName || 'Unknown' }}</div>
              </div>
              <div class="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</div>
                <div class="text-sm text-slate-900 dark:text-white">{{ selectedMedia?.uploadedDate | date:'medium' }}</div>
              </div>
              <div class="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</div>
                <span [class]="'px-3 py-1 rounded-full text-[10px] font-black uppercase ' + getStatusClass(selectedMedia!)">
                  {{ selectedMedia?.statusName }}
                </span>
              </div>
            </div>
            @if (selectedMedia?.itemName) {
              <div class="mt-4 bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'site_media.project_item' | translate }}</div>
                <div class="text-sm text-slate-900 dark:text-white">{{ selectedMedia!.itemName }}</div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class MediaGalleryComponent implements OnInit, OnDestroy {
  allMedia: SiteMediaDto[] = [];
  filteredMedia: SiteMediaDto[] = [];
  filterMediaType: string = '';
  filterStatus: string = '';
  searchTerm: string = '';
  projectId: number = 1; // TODO: Get from route or service

  // Media Viewer
  showMediaViewer: boolean = false;
  selectedMedia: SiteMediaDto | null = null;

  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  constructor(private siteMediaService: SiteMediaService) { }

  ngOnInit(): void {
    this.loadMedia();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMedia();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMedia(): void {
    this.siteMediaService.getMediaForProject(this.projectId, undefined, this.filterStatus || undefined).subscribe({
      next: (media) => {
        this.allMedia = media;
        this.filterMedia();
      },
      error: (error) => {
        console.error('Error loading media:', error);
      }
    });
  }

  filterMedia(): void {
    this.filteredMedia = this.allMedia.filter(media => {
      const typeMatch = !this.filterMediaType || media.mediaType === this.filterMediaType;
      const statusMatch = !this.filterStatus || media.status === this.filterStatus;
      const searchMatch = !this.searchTerm ||
        media.fileName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (media.description && media.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return typeMatch && statusMatch && searchMatch;
    });
  }

  get imageCount(): number {
    return this.allMedia.filter(m => m.mediaType === 'image').length;
  }

  get videoCount(): number {
    return this.allMedia.filter(m => m.mediaType === 'video').length;
  }

  get totalSize(): number {
    return this.allMedia.reduce((sum, media) => sum + media.fileSize, 0);
  }

  get totalSizeFormatted(): string {
    return this.formatFileSize(this.totalSize);
  }

  getStatusClass(media: SiteMediaDto): string {
    if (media.status === 'Approved') {
      return 'bg-emerald-500/10 text-emerald-600';
    }
    if (media.status === 'Rejected') {
      return 'bg-red-500/10 text-red-600';
    }
    return 'bg-amber-500/10 text-amber-600';
  }

  openMediaViewer(media: SiteMediaDto): void {
    this.selectedMedia = media;
    this.showMediaViewer = true;
  }

  closeMediaViewer(): void {
    this.showMediaViewer = false;
    this.selectedMedia = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
