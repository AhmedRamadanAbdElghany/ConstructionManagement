import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ClientPortalService, DailyReportList, DailyReportDetail, DailyReportFilter, ClientProjectSummary } from '../../../core/services/client-portal.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-client-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase animate-in fade-in slide-in-from-left duration-700">
              {{ 'reports.title' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed animate-in fade-in slide-in-from-left duration-1000">
              {{ 'reports.subtitle' | translate }}
            </p>
          </div>

          <!-- Glassmorphism Filters -->
          <div class="flex flex-wrap items-center gap-3 p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white dark:border-white/5 shadow-2xl animate-in fade-in slide-in-from-right duration-700">
            <div class="relative">
               <select [(ngModel)]="selectedProjectId" (change)="loadReports()" 
                       class="h-12 pl-12 pr-10 bg-white dark:bg-slate-800 rounded-2xl border-none text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:ring-2 ring-indigo-500 outline-none cursor-pointer shadow-sm appearance-none">
                 <option [ngValue]="undefined">{{ 'reports.filter_project' | translate }}</option>
                 @for (project of projects; track project.projectId) {
                    <option [ngValue]="project.projectId">{{ project.projectName }}{{ project.companyName ? ' (' + project.companyName + ')' : '' }}</option>
                 }
               </select>
               <div class="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">🏗️</div>
               <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
               </div>
            </div>
            <button (click)="isFilterExpanded = !isFilterExpanded" 
                    [class.bg-indigo-600]="isFilterExpanded" [class.text-white]="isFilterExpanded"
                    class="h-12 px-6 flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                <span>{{ 'common.filter' | translate }}</span>
            </button>
          </div>
        </div>

        @if (isFilterExpanded) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
           <div class="flex flex-col gap-2">
             <label class="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">{{ 'common.search' | translate }}</label>
             <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="loadReports()" [placeholder]="'reports.search_placeholder' | translate" 
                    class="h-12 px-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border-none text-sm font-medium focus:ring-2 ring-indigo-500">
           </div>
           <div class="flex flex-col gap-2">
             <label class="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">{{ 'reports.date_range' | translate }} (From)</label>
             <input type="date" [(ngModel)]="fromDate" (change)="loadReports()" class="h-12 px-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border-none text-sm font-medium focus:ring-2 ring-indigo-500">
           </div>
           <div class="flex flex-col gap-2">
             <label class="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">{{ 'reports.date_range' | translate }} (To)</label>
             <input type="date" [(ngModel)]="toDate" (change)="loadReports()" class="h-12 px-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border-none text-sm font-medium focus:ring-2 ring-indigo-500">
           </div>
        </div>
        }

        @if (isLoading) {
          <div class="flex flex-col items-center justify-center py-24 space-y-6">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-slate-500 font-black uppercase tracking-[0.2em] animate-pulse">{{ 'common.loading' | translate }}...</p>
          </div>
        } @else if (reports.length === 0) {
          <div class="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10 text-center">
            <div class="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-6">🏜️</div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ 'reports.no_results' | translate }}</h3>
            <p class="text-slate-500 dark:text-slate-400">{{ 'reports.no_reports_desc' | translate }}</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (report of reports; track report.projectId + report.reportDate) {
              <div (click)="viewDetails(report)" 
                   class="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10"></div>
                <div class="flex items-start justify-between mb-8 relative z-10">
                  <div>
                    <span class="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1 block">
                      {{ report.companyName ? report.companyName + ' • ' : '' }}{{ report.reportDate | date:'mediumDate' }}
                    </span>
                    <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 transition-colors">{{ report.projectName }}</h3>
                  </div>
                  <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">📊</div>
                </div>
                <div class="space-y-4 mb-8">
                  <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span class="text-slate-400">{{ 'reports.items_worked' | translate }}</span>
                    <span class="text-slate-900 dark:text-white">{{ report.itemsCount }}</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span class="text-slate-400">{{ 'reports.progress' | translate }}</span>
                      <span class="text-indigo-600">{{ report.averageProgress | number:'1.0-1' }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000 origin-left" [style.width.%]="report.averageProgress"></div>
                    </div>
                  </div>
                </div>
                @if (report.summary) {
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 mb-8">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'reports.quick_summary' | translate }}</p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">{{ report.summary }}</p>
                  </div>
                }
                <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <div class="flex items-center gap-2">
                    @if (report.hasPhotos) { <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> }
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ report.hasPhotos ? 'Site Photos Available' : 'No Media' }}</span>
                  </div>
                  <div class="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Detail Modal -->
      @if (showDetails) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" (click)="closeDetails()"></div>
          <div class="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
            <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{{ selectedReport?.projectName }}</h2>
                <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  {{ selectedReport?.companyName ? selectedReport?.companyName + ' • ' : '' }}{{ selectedReport?.reportDate | date:'longDate' }}
                </p>
              </div>
              <button (click)="closeDetails()" class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
              @if (isLoadingDetails) {
                <div class="flex flex-col items-center justify-center py-20"><div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading...</p></div>
              } @else {
                <div class="space-y-8">
                  @for (log of selectedReport?.logs; track log.itemId) {
                    <div class="p-8 bg-slate-50 dark:bg-slate-950/40 rounded-[2rem] border border-slate-100 dark:border-white/5">
                      <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                        <div>
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Item Description</span>
                          <h4 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ log.itemName }}</h4>
                        </div>
                        <div class="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-right">Progress</span>
                          <span class="text-xl font-black text-indigo-600">{{ log.progressPercentage }}%</span>
                        </div>
                      </div>
                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="space-y-6">
                          @if (log.progressNotes) {
                            <div>
                               <h5 class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Work Log</h5>
                               <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-white/5">{{ log.progressNotes }}</p>
                            </div>
                          }
                          @if (log.issues) {
                            <div>
                               <h5 class="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-3 ml-2 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Remark</h5>
                               <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed bg-rose-50/20 dark:bg-rose-500/5 p-6 rounded-2xl border border-rose-100 dark:border-white/5">{{ log.issues }}</p>
                            </div>
                          }
                        </div>
                        <div>
                          <h5 class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Site Evidence</h5>
                          @if (log.photoUrls.length) {
                            <div class="grid grid-cols-2 gap-3">
                              @for (photo of log.photoUrls; track photo) {
                                <div class="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow hover:scale-[1.02] transition-transform cursor-zoom-in">
                                  <img [src]="photo" class="w-full h-full object-cover">
                                </div>
                              }
                            </div>
                          } @else { <div class="h-32 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-slate-400 italic text-[10px]">No photos captured</div> }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            <div class="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-white/5 flex gap-4 no-print">
               <button class="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">Download Full PDF</button>
               <button (click)="window.print()" class="h-12 px-8 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all shadow-sm">Print</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; }
      .bg-slate-50, .dark\:bg-slate-950 { background: white !important; }
      .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
    }
  `]
})
export class ClientReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private clientPortalService = inject(ClientPortalService);
  private i18nService = inject(I18nService);
  window = window;

  reports: DailyReportList[] = [];
  projects: ClientProjectSummary[] = [];
  isLoading = false;
  isFilterExpanded = false;

  selectedProjectId?: number = undefined;
  fromDate?: string;
  toDate?: string;
  searchTerm: string = '';

  selectedReport?: DailyReportDetail;
  showDetails = false;
  isLoadingDetails = false;

  ngOnInit() {
    this.loadProjects();
    this.loadReports();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadProjects();
        this.loadReports();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects() {
    this.clientPortalService.getClientProjects().subscribe({
      next: (projects) => this.projects = projects,
      error: (err) => console.error('Error fetching projects:', err)
    });
  }

  loadReports() {
    this.isLoading = true;
    const filter: DailyReportFilter = {
      projectId: this.selectedProjectId,
      fromDate: this.fromDate,
      toDate: this.toDate,
      searchTerm: this.searchTerm
    };
    this.clientPortalService.getDailyReports(filter).subscribe({
      next: (reports) => { this.reports = reports; this.isLoading = false; },
      error: (err) => { console.error('Error loading reports:', err); this.isLoading = false; }
    });
  }

  viewDetails(report: DailyReportList) {
    this.isLoadingDetails = true;
    this.showDetails = true;
    this.clientPortalService.getDailyReportDetails(report.projectId, report.reportDate).subscribe({
      next: (details) => { this.selectedReport = details; this.isLoadingDetails = false; },
      error: (err) => { console.error('Error loading report details:', err); this.isLoadingDetails = false; this.showDetails = false; }
    });
  }

  closeDetails() { this.showDetails = false; this.selectedReport = undefined; }
}
