import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Project } from '../../../shared/interfaces';
import { ProjectService } from '../../../core/services/project.service';
import { SiteMediaService, SiteMediaDto } from '../../../core/services/site-media.service';
import { ClientPortalService } from '../../../core/services/client-portal.service';

@Component({
  selector: 'app-client-projects',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">{{ 'client.my_projects' | translate }}</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'client.projects_subtitle' | translate }}</p>
        </div>

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          @for (project of projects; track project.id) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all group relative">
              <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-colors"></div>
              
              <!-- Project Header -->
              <div class="p-8 border-b border-slate-100 dark:border-white/5 relative">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h2 class="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{{ project.name }}</h2>
                    <p class="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                      <svg class="w-4 h-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {{ project.location?.address }}
                    </p>
                  </div>
                  <span class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all"
                        [ngClass]="{
                          'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/10': project.status === 'Active',
                          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10': project.status === 'Completed',
                          'bg-amber-500/20 text-amber-400': project.status === 'Delayed'
                        }">
                    {{ project.status }}
                  </span>
                </div>

                <!-- Progress Bar -->
                <div class="mb-6 mt-4">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{{ 'client.overall_progress' | translate }}</span>
                    <span class="text-sm font-black text-slate-900 dark:text-cyan-400">{{ project.progress }}%</span>
                  </div>
                  <div class="h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-200 dark:border-white/5">
                    <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                         [style.width.%]="project.progress">
                    </div>
                  </div>
                </div>

                <!-- Timeline Info -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <p class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{{ 'client.start_date' | translate }}</p>
                    <p class="text-sm font-black text-slate-900 dark:text-white tracking-tight">{{ project.startDate | date:'mediumDate' }}</p>
                  </div>
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <p class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{{ 'client.expected_end' | translate }}</p>
                    <p class="text-sm font-black text-slate-900 dark:text-white tracking-tight">{{ project.endDate ? (project.endDate | date:'mediumDate') : 'In Progress' }}</p>
                  </div>
                </div>
              </div>

              <!-- Site Media Gallery -->
              <div class="p-6">
                <h3 class="text-lg font-semibold text-white mb-4">{{ 'client.site_photos' | translate }}</h3>
                <div class="grid grid-cols-3 gap-2">
                  @for (media of getProjectMedia(project.id); track media.id) {
                    <div class="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                      <img [src]="media.fileUrl" [alt]="'Site photo'" 
                           class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                        </svg>
                      </div>
                      <!-- Status Badge -->
                      <div class="absolute top-2 right-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium"
                              [ngClass]="{
                                'bg-emerald-500/90 text-white': media.status === 'Approved',
                                'bg-amber-500/90 text-white': media.status === 'Pending',
                                'bg-red-500/90 text-white': media.status === 'Rejected'
                              }">
                          {{ media.status }}
                        </span>
                      </div>
                    </div>
                  }
                  @if (getProjectMedia(project.id).length === 0) {
                    <div class="col-span-3 py-8 text-center text-slate-400">
                      <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p>{{ 'client.no_photos_yet' | translate }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Recent Updates -->
              <div class="px-6 pb-6">
                <h3 class="text-lg font-semibold text-white mb-4">{{ 'client.recent_updates' | translate }}</h3>
                <div class="space-y-3">
                  @for (update of recentUpdates; track update.date) {
                    <div class="flex items-start space-x-3 p-3 rounded-xl bg-slate-700/20">
                      <div class="w-2 h-2 rounded-full bg-cyan-500 mt-2 flex-shrink-0"></div>
                      <div>
                        <p class="text-white text-sm">{{ update.message }}</p>
                        <p class="text-xs text-slate-500 mt-1">{{ update.date }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        @if (projects.length === 0) {
          <div class="text-center py-20">
            <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
              <svg class="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ 'client.no_projects' | translate }}</h3>
            <p class="text-slate-400">{{ 'client.no_projects_desc' | translate }}</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ClientProjectsComponent implements OnInit {
  projects: Project[] = [];
  siteMedia: SiteMediaDto[] = [];

  recentUpdates = [
    { message: 'Foundation work completed - Phase 1', date: '2 days ago' },
    { message: 'Steel structure delivery on schedule', date: '5 days ago' },
    { message: 'Site inspection passed successfully', date: '1 week ago' },
  ];

  constructor(private projectService: ProjectService, private siteMediaService: SiteMediaService) { }

  ngOnInit() {
    this.projectService.getMyProjects().subscribe(projects => {
      this.projects = projects;
    });

    // Load media for all projects
    this.siteMediaService.getMediaForProject(1).subscribe(media => {
      this.siteMedia = media;
    });
  }

  getProjectMedia(projectId: number): SiteMediaDto[] {
    return this.siteMedia.filter(m => m.projectId === projectId);
  }
}
