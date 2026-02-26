import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { CompanyAnnouncement } from '../../../core/models/announcement.model';

@Component({
  selector: 'app-company-announcements-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-white/10 transform transition-all scale-100 flex flex-col max-h-[85vh] overflow-hidden">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
               {{ companyName }}
            </h3>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
               {{ 'companies.announcements' | translate }}
            </p>
          </div>
          <button 
            (click)="close.emit()"
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-4 pt-2">
          @if (isLoading) {
            <div class="space-y-6">
              @for (i of [1,2]; track i) {
                <div class="bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden">
                  <div class="h-40 w-full skeleton-base opacity-50"></div>
                  <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center">
                      <div class="h-4 w-24 skeleton-base"></div>
                      <div class="h-4 w-16 skeleton-base"></div>
                    </div>
                    <div class="h-7 w-3/4 skeleton-base"></div>
                    <div class="space-y-2">
                      <div class="h-4 w-full skeleton-base"></div>
                      <div class="h-4 w-2/3 skeleton-base"></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else if (announcements.length === 0) {
            <div class="text-center py-16 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 animate-premium-scale">
              <div class="w-20 h-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </div>
              <h4 class="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                 {{ 'companies.no_announcements' | translate }}
              </h4>
            </div>
          } @else {
            <div class="space-y-6">
              @for (ann of announcements; track ann.id) {
                <div 
                  class="group bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden transition-all hover:shadow-xl relative animate-premium-fade"
                  [style.animation-delay]="($index * 100) + 'ms'">
                  
                  @if (ann.imageUrl) {
                    <div class="h-48 w-full bg-slate-100 dark:bg-slate-900 relative">
                       <img [src]="ann.imageUrl" class="w-full h-full object-cover">
                       <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                    </div>
                  }
                  
                  <div class="p-6">
                    <div class="flex items-center justify-between mb-3">
                       <span [class]="ann.type === 'Offer' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'"
                         class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                         {{ ann.type === 'Offer' ? ('inspections.request.special_offer' | translate | uppercase) : 'UPDATE' }}
                       </span>
                       <span class="text-xs font-bold text-slate-400">
                         {{ ann.publishedAt | date:'mediumDate' }}
                       </span>
                    </div>
                    
                    <h4 class="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                       {{ ann.title }}
                    </h4>
                    
                    <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                       {{ ann.content }}
                    </p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CompanyAnnouncementsDialogComponent implements OnInit {
  @Input({ required: true }) companyId!: number;
  @Input({ required: true }) companyName!: string;
  @Output() close = new EventEmitter<void>();

  private announcementService = inject(AnnouncementService);

  announcements: CompanyAnnouncement[] = [];
  isLoading = true;

  ngOnInit() {
    this.announcementService.getCompanyAnnouncements(this.companyId).subscribe({
      next: (data: CompanyAnnouncement[]) => {
        // Since we are viewing as public, we should only see published ones.
        // The service already filters out unpublished ones for non-owners, but we ensure it here just in case.
        this.announcements = data.filter((a: CompanyAnnouncement) => a.isPublished);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading announcements', err);
        this.isLoading = false;
      }
    });
  }
}
