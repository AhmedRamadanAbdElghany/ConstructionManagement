import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService } from '../../../../core/services/announcement.service';
import { CompanyAnnouncement, AnnouncementType } from '../../../../core/models/announcement.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-company-announcements-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-8">
      <!-- Header Actions -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Announcements Manager</h2>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Create and manage company-wide updates and offers.</p>
        </div>
        <button (click)="openCreateModal()" 
          class="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          New Announcement
        </button>
      </div>

      <!-- Announcements Grid -->
      @if (loading) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Announcements...</p>
        </div>
      } @else if (announcements.length === 0) {
        <div class="text-center py-20 rounded-[3rem] bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700">
           <div class="w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 mx-auto mb-6">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
           </div>
           <h3 class="text-lg font-black text-slate-400">No Announcements Created</h3>
           <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">Start by creating your first announcement or special offer.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (ann of announcements; track ann.id) {
            <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden transition-all hover:shadow-2xl hover:border-indigo-500/30">
               @if (ann.imageUrl) {
                 <img [src]="ann.imageUrl" class="w-full h-48 object-cover border-b border-slate-100 dark:border-white/5" alt="Announcement">
               }
               <div class="p-8">
                 <div class="flex items-center justify-between mb-4">
                    <span [class]="ann.type === 'Offer' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'"
                      class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {{ ann.type }}
                    </span>
                    <div class="flex items-center gap-2">
                      <button (click)="openEditModal(ann)" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button (click)="deleteAnnouncement(ann.id)" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                 </div>
                 <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">{{ ann.title }}</h3>
                 <p class="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-4">{{ ann.content }}</p>
                 <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                   <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                     Published: {{ (ann.publishedAt | date:'shortDate') || 'Draft' }}
                   </span>
                   <span [class]="ann.isPublished ? 'text-emerald-500' : 'text-slate-400'" class="text-[10px] font-black uppercase tracking-widest">
                     {{ ann.isPublished ? 'Active' : 'Draft' }}
                   </span>
                 </div>
               </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal) {
      <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
        <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-[0.98] duration-300 border border-white/10">
          
          <!-- Modal Header -->
          <div class="p-8 pb-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ editingAnnouncement ? 'Edit Announcement' : 'New Announcement' }}
            </h2>
            <button (click)="showModal = false" class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all text-slate-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
            <!-- Title -->
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Announcement Title</label>
              <input [(ngModel)]="annForm.title" type="text" placeholder="Special Offer or System Update..."
                class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all">
            </div>

            <!-- Content -->
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Content Details</label>
              <textarea [(ngModel)]="annForm.content" rows="4" placeholder="Write the details here..."
                class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"></textarea>
            </div>

            <!-- Grid: Type & Image -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Announcement Type</label>
                <select [(ngModel)]="annForm.type"
                  class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer">
                  <option [value]="AnnouncementType.General">General Update</option>
                  <option [value]="AnnouncementType.Offer">Special Offer</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Banner Image</label>
                <input (change)="onFileSelected($event)" type="file" accept="image/*"
                  class="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer">
              </div>
            </div>

            <!-- Toggle: Published -->
            <div class="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-200 dark:border-white/5">
               <div>
                  <h4 class="text-sm font-black text-slate-900 dark:text-white tracking-tight">Post Immediately</h4>
                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">If off, it will be saved as draft.</p>
               </div>
               <button (click)="annForm.isPublished = !annForm.isPublished"
                 [class]="annForm.isPublished ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'"
                 class="w-14 h-8 rounded-full border-2 transition-all relative p-1">
                 <div [class]="annForm.isPublished ? 'translate-x-6' : 'translate-x-0'" class="w-5 h-5 bg-white rounded-full shadow-sm transition-transform"></div>
               </button>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-8 pt-4 flex justify-end space-x-4 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button (click)="showModal = false" class="px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-800 dark:hover:text-white transition-all">
              Cancel
            </button>
            <button (click)="saveAnnouncement()" [disabled]="submitting"
              class="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
              @if (submitting) {
                <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              }
              {{ editingAnnouncement ? 'Update Notification' : 'Launch Announcement' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CompanyAnnouncementsManagerComponent implements OnInit {
    private announcementService = inject(AnnouncementService);
    private authService = inject(AuthService);

    public AnnouncementType = AnnouncementType;

    announcements: CompanyAnnouncement[] = [];
    loading = true;
    submitting = false;
    companyId: number | null = null;

    // Modal state
    showModal = false;
    editingAnnouncement: CompanyAnnouncement | null = null;
    annForm = {
        title: '',
        content: '',
        type: AnnouncementType.General,
        isPublished: true,
        image: null as File | null
    };

    ngOnInit() {
        const user = this.authService.getCurrentUser();
        this.companyId = user?.companyId || null;
        if (this.companyId) {
            this.loadAnnouncements();
        }
    }

    loadAnnouncements() {
        if (!this.companyId) return;
        this.loading = true;
        this.announcementService.getCompanyAnnouncements(this.companyId).subscribe({
            next: (data) => {
                this.announcements = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    openCreateModal() {
        this.editingAnnouncement = null;
        this.annForm = {
            title: '',
            content: '',
            type: AnnouncementType.General,
            isPublished: true,
            image: null
        };
        this.showModal = true;
    }

    openEditModal(ann: CompanyAnnouncement) {
        this.editingAnnouncement = ann;
        this.annForm = {
            title: ann.title,
            content: ann.content,
            type: ann.type,
            isPublished: ann.isPublished,
            image: null
        };
        this.showModal = true;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.annForm.image = file;
        }
    }

    saveAnnouncement() {
        if (!this.annForm.title || !this.annForm.content) {
            alert('Please fill in both title and content.');
            return;
        }

        this.submitting = true;
        if (this.editingAnnouncement) {
            this.announcementService.updateAnnouncement(this.editingAnnouncement.id, {
                title: this.annForm.title,
                content: this.annForm.content,
                type: this.annForm.type,
                isPublished: this.annForm.isPublished,
                image: this.annForm.image || undefined
            }).subscribe({
                next: () => {
                    this.submitting = false;
                    this.showModal = false;
                    this.loadAnnouncements();
                },
                error: () => this.submitting = false
            });
        } else {
            this.announcementService.createAnnouncement({
                title: this.annForm.title,
                content: this.annForm.content,
                type: this.annForm.type,
                isPublished: this.annForm.isPublished,
                image: this.annForm.image || undefined
            }).subscribe({
                next: () => {
                    this.submitting = false;
                    this.showModal = false;
                    this.loadAnnouncements();
                },
                error: () => this.submitting = false
            });
        }
    }

    deleteAnnouncement(id: number) {
        if (confirm('Are you sure you want to delete this announcement?')) {
            this.announcementService.deleteAnnouncement(id).subscribe({
                next: () => this.loadAnnouncements()
            });
        }
    }
}
