import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService, ReportDefinition, ExecuteReportRequest } from '../../../core/services/analytics.service';
import { ReportFilter, ReportGenerationRequest, GeneratedReport } from '../../../shared/interfaces';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-reports-generation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ 'admin.reports_generation' | translate }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.reports_generation_desc' | translate }}
            </p>
          </div>
          <button (click)="resetFilters()" class="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            {{ 'admin.reset_filters' | translate }}
          </button>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Report Builder -->
        @if (!isLoading) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Report Selection -->
            <div class="lg:col-span-1">
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                <div class="p-8 border-b border-slate-100 dark:border-white/5">
                  <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
                    {{ 'admin.select_report' | translate }}
                  </h2>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    {{ 'admin.select_report_desc' | translate }}
                  </p>
                </div>
                <div class="p-6 space-y-3 max-h-[600px] overflow-y-auto">
                  @for (report of reportDefinitions; track report.id) {
                    <button 
                      (click)="selectReport(report)"
                      [ngClass]="selectedReport?.id === report.id 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500'"
                      class="w-full p-4 rounded-xl border-2 transition-all text-left">
                      <div class="flex items-start justify-between">
                        <div>
                          <span class="text-sm font-black block mb-1">{{ report.name }}</span>
                          <span class="text-xs opacity-70">{{ report.description }}</span>
                        </div>
                        <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/20">
                          {{ report.category }}
                        </span>
                      </div>
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Report Configuration -->
            <div class="lg:col-span-2">
              @if (selectedReport) {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                  <div class="p-8 border-b border-slate-100 dark:border-white/5">
                    <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
                      {{ 'admin.configure_report' | translate }}
                    </h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      {{ selectedReport.name }}
                    </p>
                  </div>
                  <div class="p-8 space-y-8">
                    <!-- Date Range -->
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        {{ 'admin.date_range' | translate }}
                      </label>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                            {{ 'admin.start_date' | translate }}
                          </label>
                          <input 
                            type="date" 
                            [(ngModel)]="filters.startDate"
                            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          >
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                            {{ 'admin.end_date' | translate }}
                          </label>
                          <input 
                            type="date" 
                            [(ngModel)]="filters.endDate"
                            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          >
                        </div>
                      </div>
                    </div>

                    <!-- Project Filter -->
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        {{ 'admin.project_filter' | translate }}
                      </label>
                      <select 
                        [(ngModel)]="filters.projectId"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="">{{ 'admin.all_projects' | translate }}</option>
                        @for (project of availableProjects; track project.id) {
                          <option [value]="project.id">{{ project.name }}</option>
                        }
                      </select>
                    </div>

                    <!-- Output Format -->
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        {{ 'admin.output_format' | translate }}
                      </label>
                      <div class="grid grid-cols-3 gap-4">
                        @for (format of outputFormats; track format.value) {
                          <button 
                            (click)="selectedFormat = format.value"
                            [ngClass]="selectedFormat === format.value 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500'"
                            class="p-4 rounded-xl border-2 transition-all text-center">
                            <span class="text-2xl mb-2 block">{{ format.icon }}</span>
                            <span class="text-xs font-black uppercase tracking-widest">{{ format.label }}</span>
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Generate Button -->
                    <div class="flex gap-4">
                      <button 
                        (click)="generateReport()"
                        [disabled]="isGenerating"
                        class="flex-1 px-8 py-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20">
                        @if (isGenerating) {
                          <span class="flex items-center justify-center gap-2">
                            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {{ 'admin.generating' | translate }}
                          </span>
                        } @else {
                          {{ 'admin.generate_report' | translate }}
                        }
                      </button>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-12 text-center">
                  <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">
                    {{ 'admin.select_report_to_start' | translate }}
                  </h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    {{ 'admin.select_report_to_start_desc' | translate }}
                  </p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Generated Reports -->
        @if (generatedReports && generatedReports.length > 0) {
          <div class="mt-10">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-6">
              {{ 'admin.recent_reports' | translate }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (report of generatedReports; track report.id) {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 hover:shadow-2xl transition-shadow">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <span class="text-sm font-black text-slate-900 dark:text-white block mb-1">{{ report.name }}</span>
                      <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(report.generatedAt) }}</span>
                    </div>
                    <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      {{ report.format }}
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      (click)="downloadReport(report)"
                      class="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                      {{ 'admin.download' | translate }}
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  `]
})
export class ReportsGenerationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private analyticsService = inject(AnalyticsService);
  private i18nService = inject(I18nService);

  reportDefinitions: ReportDefinition[] = [];
  selectedReport: ReportDefinition | null = null;
  availableProjects: { id: string; name: string }[] = [];
  generatedReports: GeneratedReport[] = [];

  filters: any = {};
  selectedFormat = 'pdf';
  outputFormats = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'excel', label: 'Excel', icon: '📊' },
    { value: 'csv', label: 'CSV', icon: '📋' }
  ];

  isLoading = false;
  isGenerating = false;

  ngOnInit() {
    this.loadReportDefinitions();
    this.loadAvailableProjects();
    this.loadGeneratedReports();
    this.setDefaultDateRange();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadReportDefinitions();
        this.loadAvailableProjects();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReportDefinitions() {
    this.isLoading = true;
    this.analyticsService.getReportDefinitions().subscribe({
      next: (data) => {
        this.reportDefinitions = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading report definitions:', error);
        this.isLoading = false;
      }
    });
  }

  loadAvailableProjects() {
    // Mock data - replace with actual API call when available
    this.availableProjects = [
      { id: '1', name: 'Project Alpha' },
      { id: '2', name: 'Project Beta' },
      { id: '3', name: 'Project Gamma' }
    ];
  }

  loadGeneratedReports() {
    // Mock data - replace with actual API call when available
    this.generatedReports = [];
  }

  selectReport(report: ReportDefinition) {
    this.selectedReport = report;
    this.filters = {};
    this.setDefaultDateRange();
  }

  setDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    this.filters.startDate = startDate.toISOString().split('T')[0];
    this.filters.endDate = endDate.toISOString().split('T')[0];
  }

  resetFilters() {
    this.selectedReport = null;
    this.filters = {};
    this.selectedFormat = 'pdf';
    this.setDefaultDateRange();
  }

  generateReport() {
    if (!this.selectedReport) return;

    this.isGenerating = true;

    const request: ExecuteReportRequest = {
      reportDefinitionId: this.selectedReport.id,
      startDate: this.filters.startDate,
      endDate: this.filters.endDate,
      parameters: JSON.stringify(this.filters),
      format: this.selectedFormat
    };

    this.analyticsService.executeAndExportReport(request).subscribe({
      next: (response) => {
        this.isGenerating = false;
        if (response.success && response.fileContent) {
          // Download the file
          const blob = response.fileContent;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.fileName || `${this.selectedReport?.name}.${this.selectedFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // Add to generated reports
          this.generatedReports.unshift({
            id: Date.now().toString(),
            name: this.selectedReport?.name || 'Report',
            format: this.selectedFormat,
            generatedAt: new Date().toISOString(),
            status: 'Completed',
            downloadUrl: response.filePath
          });
        }
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.isGenerating = false;
      }
    });
  }

  downloadReport(report: GeneratedReport) {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
