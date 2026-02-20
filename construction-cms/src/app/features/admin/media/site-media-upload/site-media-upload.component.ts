import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { SiteMediaService, SiteMediaDto, UploadMediaRequest } from '../../../../core/services/site-media.service';
import { ProjectItemService } from '../../../../core/services/project-item.service';
import { ProjectItem } from '../../../../shared/interfaces';
import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-site-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Upload Site Media</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Upload photos and videos for your project</p>
          </div>
        </div>

        <!-- Upload Form -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 mb-8">
          <div class="space-y-6">
            <!-- Project Item Selection -->
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'site_media.project_item' | translate }}</label>
              <select [(ngModel)]="uploadForm.itemId" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select an item (optional)</option>
                @for (item of projectItems; track item.id) {
                  <option [value]="item.id">{{ item.itemName }}</option>
                }
              </select>
            </div>

            <!-- Media Type -->
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Media Type *</label>
              <select [(ngModel)]="uploadForm.mediaType" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select media type</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
              <textarea [(ngModel)]="uploadForm.description" 
                        rows="3"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                        placeholder="Add a description for this media..."></textarea>
            </div>

            <!-- File Upload -->
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">File *</label>
              <div class="relative">
                <input type="file" 
                       (change)="onFileSelected($event)"
                       accept="image/*,video/*"
                       class="hidden"
                       id="fileInput">
                <label for="fileInput" 
                       class="flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all">
                  @if (selectedFile) {
                    <div class="flex flex-col items-center">
                      <div class="w-16 h-16 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                        <svg class="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedFile.name }}</div>
                      <div class="text-xs text-slate-400 mt-1">{{ formatFileSize(selectedFile.size) }}</div>
                    </div>
                  } @else {
                    <div class="flex flex-col items-center">
                      <div class="w-16 h-16 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-3">
                        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                      </div>
                      <div class="text-sm font-bold text-slate-600 dark:text-slate-400">Click to upload</div>
                      <div class="text-xs text-slate-400 mt-1">or drag and drop</div>
                    </div>
                  }
                </label>
              </div>
            </div>

            <!-- Source Type -->
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Source Type</label>
              <select [(ngModel)]="uploadForm.sourceType" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select source type</option>
                <option value="DailyLog">Daily Log</option>
                <option value="Inspection">Inspection</option>
                <option value="Meeting">Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <!-- Upload Button -->
            <button (click)="uploadMedia()" 
                    [disabled]="isUploading || !selectedFile || !uploadForm.mediaType"
                    class="w-full px-8 py-4 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              @if (isUploading) {
                <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              } @else {
                Upload Media
              }
            </button>
          </div>
        </div>

        <!-- Recent Uploads -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-lg font-black text-slate-900 dark:text-white">Recent Uploads</h2>
          </div>
          <div class="p-6">
            @if (recentUploads.length === 0) {
              <div class="text-center py-12">
                <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="text-sm font-bold text-slate-400">No recent uploads</div>
                <div class="text-xs text-slate-400 mt-1">Upload your first media file to get started</div>
              </div>
            } @else {
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @for (media of recentUploads; track media.id) {
                  <div class="relative group rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 aspect-square">
                    @if (media.mediaType === 'image') {
                      <img [src]="media.fileUrl" [alt]="media.description || media.fileName" class="w-full h-full object-cover">
                    } @else {
                      <div class="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-white/10">
                        <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    }
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div class="absolute bottom-0 left-0 right-0 p-3">
                        <div class="text-[10px] font-black text-white uppercase tracking-widest mb-1">{{ media.statusName }}</div>
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
  `,
  styles: []
})
export class SiteMediaUploadComponent implements OnInit, OnDestroy {
  projectItems: ProjectItem[] = [];
  recentUploads: SiteMediaDto[] = [];
  selectedFile: File | null = null;
  isUploading: boolean = false;
  projectId: number = 1; // TODO: Get from route or service

  uploadForm: Omit<UploadMediaRequest, 'file'> = {
    itemId: undefined,
    mediaType: '',
    description: '',
    sourceType: ''
  };

  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  constructor(
    private siteMediaService: SiteMediaService,
    private projectItemService: ProjectItemService
  ) { }

  ngOnInit(): void {
    this.loadProjectItems();
    this.loadRecentUploads();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadProjectItems();
        this.loadRecentUploads();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjectItems(): void {
    this.projectItemService.getItemsByProject(this.projectId).subscribe({
      next: (items: ProjectItem[]) => {
        this.projectItems = items;
      },
      error: (error: unknown) => {
        console.error('Error loading project items:', error);
      }
    });
  }

  loadRecentUploads(): void {
    this.siteMediaService.getMediaForProject(this.projectId, undefined, 'Pending').subscribe({
      next: (media) => {
        this.recentUploads = media.slice(0, 8); // Show last 8 uploads
      },
      error: (error) => {
        console.error('Error loading recent uploads:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadMedia(): void {
    if (!this.selectedFile || !this.uploadForm.mediaType) {
      alert('Please select a file and media type');
      return;
    }

    this.isUploading = true;
    const request: UploadMediaRequest = {
      ...this.uploadForm,
      file: this.selectedFile
    };

    this.siteMediaService.uploadMedia(this.projectId, request).subscribe({
      next: () => {
        this.isUploading = false;
        this.selectedFile = null;
        this.uploadForm = {
          itemId: undefined,
          mediaType: '',
          description: '',
          sourceType: ''
        } as Omit<UploadMediaRequest, 'file'>;
        this.loadRecentUploads();
        alert('Media uploaded successfully!');
      },
      error: (error) => {
        console.error('Error uploading media:', error);
        this.isUploading = false;
        alert('Failed to upload media');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
