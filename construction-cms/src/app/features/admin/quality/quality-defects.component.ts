import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QualityService } from '../../../core/services/quality.service';
import { QualityDefect } from '../../../shared/interfaces';

@Component({
    selector: 'app-quality-defects',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ 'admin.quality_defects' | translate }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.quality_defects_desc' | translate }}
            </p>
          </div>
          <div class="flex gap-4">
            <button (click)="openCreateModal()" class="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              {{ 'admin.new_defect' | translate }}
            </button>
            <button (click)="exportDefects()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
              {{ 'admin.export' | translate }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Filters -->
        @if (!isLoading) {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 mb-8">
            <div class="flex flex-col md:flex-row gap-6">
              <div class="flex-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.search' | translate }}
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="searchTerm"
                  (input)="filterDefects()"
                  placeholder="{{ 'admin.search_defects' | translate }}"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }}
                </label>
                <select 
                  [(ngModel)]="projectFilter"
                  (change)="filterDefects()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all_projects' | translate }}</option>
                  @for (project of availableProjects; track project.id) {
                    <option [value]="project.id">{{ project.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.status' | translate }}
                </label>
                <select 
                  [(ngModel)]="statusFilter"
                  (change)="filterDefects()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="Open">{{ 'admin.open' | translate }}</option>
                  <option value="In Progress">{{ 'admin.in_progress' | translate }}</option>
                  <option value="Verified">{{ 'admin.verified' | translate }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.severity' | translate }}
                </label>
                <select 
                  [(ngModel)]="severityFilter"
                  (change)="filterDefects()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="High">{{ 'admin.high' | translate }}</option>
                  <option value="Medium">{{ 'admin.medium' | translate }}</option>
                  <option value="Low">{{ 'admin.low' | translate }}</option>
                </select>
              </div>
            </div>
          </div>
        }

        <!-- Defects List -->
        @if (!isLoading) {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50 dark:bg-slate-950/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.date' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.project' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.location' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.description' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.severity' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.status' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.actions' | translate }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for (defect of filteredDefects; track defect.id) {
                    <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ formatDate(defect.reportedDate) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">
                          {{ defect.projectName || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ defect.location || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ defect.description || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [ngClass]="defect.severity === 'High' 
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' 
                            : defect.severity === 'Medium' 
                            ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' 
                            : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ defect.severity }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [ngClass]="defect.status === 'Verified'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : defect.status === 'In Progress' 
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                            : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ defect.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button 
                            (click)="viewDetails(defect)"
                            class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            {{ 'admin.view' | translate }}
                          </button>
                          <button 
                            (click)="resolveDefect(defect)"
                            [disabled]="defect.status === 'Verified'"
                            class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ 'admin.resolve' | translate }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (filteredDefects.length === 0) {
                    <tr>
                      <td colspan="8" class="px-6 py-12 text-center">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                          {{ 'admin.no_defects_found' | translate }}
                        </p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Create Defect Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
              {{ 'admin.new_defect' | translate }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.new_defect_desc' | translate }}
            </p>
          </div>
          <form (ngSubmit)="createDefect()" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newDefect.projectId"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_project' | translate }}</option>
                  @for (project of availableProjects; track project.id) {
                    <option [value]="project.id">{{ project.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.severity' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newDefect.severity"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_severity' | translate }}</option>
                  <option value="Critical">Critical</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.location' | translate }} *
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="newDefect.location"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.description' | translate }} *
                </label>
                <textarea 
                  [(ngModel)]="newDefect.description"
                  rows="3"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                ></textarea>
              </div>
            </div>
            <div class="flex gap-4 justify-end">
              <button 
                type="button"
                (click)="closeCreateModal()"
                class="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                {{ 'admin.cancel' | translate }}
              </button>
              <button 
                type="submit"
                [disabled]="isSubmitting"
                class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/20">
                @if (isSubmitting) {
                  <span class="flex items-center gap-2">
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ 'admin.creating' | translate }}
                  </span>
                } @else {
                  {{ 'admin.create' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
    styles: [`
    :host ::ng-deep select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  `]
})
export class QualityDefectsComponent implements OnInit {
    private qualityService = inject(QualityService);

    defects: QualityDefect[] = [];
    filteredDefects: QualityDefect[] = [];
    availableProjects: any[] = [];

    searchTerm = '';
    projectFilter = '';
    statusFilter = '';
    severityFilter = '';

    showCreateModal = false;
    newDefect: any = {};

    isLoading = false;
    isSubmitting = false;

    ngOnInit() {
        this.loadDefects();
        this.loadAvailableProjects();
    }

    loadDefects() {
        this.isLoading = true;
        this.qualityService.getDefects().subscribe({
            next: (data: any) => {
                this.defects = data;
                this.filteredDefects = data;
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error loading defects:', error);
                this.isLoading = false;
            }
        });
    }

    loadAvailableProjects() {
        // Mock data - replace with actual API call
        this.availableProjects = [
            { id: 1, name: 'Project Alpha' },
            { id: 2, name: 'Project Beta' },
            { id: 3, name: 'Project Gamma' }
        ];
    }

    filterDefects() {
        this.filteredDefects = this.defects.filter(defect => {
            const matchesSearch = !this.searchTerm ||
                defect.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                defect.location?.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesProject = !this.projectFilter || defect.projectId === parseInt(this.projectFilter);
            const matchesStatus = !this.statusFilter || defect.status === this.statusFilter;
            const matchesSeverity = !this.severityFilter || defect.severity === this.severityFilter;
            return matchesSearch && matchesProject && matchesStatus && matchesSeverity;
        });
    }

    openCreateModal() {
        this.showCreateModal = true;
        this.newDefect = {};
    }

    closeCreateModal() {
        this.showCreateModal = false;
        this.newDefect = {};
    }

    createDefect() {
        if (!this.newDefect.projectId || !this.newDefect.severity || !this.newDefect.location || !this.newDefect.description) {
            return;
        }

        this.isSubmitting = true;
        this.qualityService.createDefect(this.newDefect).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeCreateModal();
                this.loadDefects();
            },
            error: (error: any) => {
                console.error('Error creating defect:', error);
                this.isSubmitting = false;
            }
        });
    }

    resolveDefect(defect: QualityDefect) {
        console.log('Resolve defect:', defect);
    }

    viewDetails(defect: QualityDefect) {
        console.log('View details:', defect);
    }

    exportDefects() {
        console.log('Export defects');
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString();
    }
}
