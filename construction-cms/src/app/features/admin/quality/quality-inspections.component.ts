import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QualityService } from '../../../core/services/quality.service';
import { QualityInspection, QualityChecklistItem } from '../../../shared/interfaces';

@Component({
    selector: 'app-quality-inspections',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ 'admin.quality_inspections' | translate }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.quality_inspections_desc' | translate }}
            </p>
          </div>
          <div class="flex gap-4">
            <button (click)="openCreateModal()" class="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              {{ 'admin.new_inspections' | translate }}
            </button>
            <button (click)="exportInspections()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
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
                  (input)="filterInspections()"
                  placeholder="{{ 'admin.search_inspections' | translate }}"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }}
                </label>
                <select 
                  [(ngModel)]="projectFilter"
                  (change)="filterInspections()"
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
                  (change)="filterInspections()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="Scheduled">{{ 'admin.scheduled' | translate }}</option>
                  <option value="In Progress">{{ 'admin.in_progress' | translate }}</option>
                  <option value="Completed">{{ 'admin.completed' | translate }}</option>
                  <option value="Cancelled">{{ 'admin.cancelled' | translate }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.inspection_type' | translate }}
                </label>
                <select 
                  [(ngModel)]="typeFilter"
                  (change)="filterInspections()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="Initial">{{ 'admin.initial' | translate }}</option>
                  <option value="Progress">{{ 'admin.progress' | translate }}</option>
                  <option value="Final">{{ 'admin.final' | translate }}</option>
                </select>
              </div>
            </div>
          </div>
        }

        <!-- Inspections List -->
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
                      {{ 'admin.inspection_type' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.location' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.inspector' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.score' | translate }}
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
                  @for (inspection of filteredInspections; track inspection.id) {
                    <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ formatDate(inspection.scheduledDate) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">
                          {{ inspection.projectName || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ inspection.inspectionType || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ inspection.location || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ inspection.inspectorName || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">
                          {{ inspection.score || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [ngClass]="inspection.status === 'Completed' 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : inspection.status === 'In Progress' 
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                            : inspection.status === 'Scheduled' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                            : 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ inspection.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button 
                            (click)="viewDetails(inspection)"
                            class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            {{ 'admin.view' | translate }}
                          </button>
                          <button 
                            (click)="startInspection(inspection)"
                            [disabled]="inspection.status !== 'Scheduled'"
                            class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ 'admin.start' | translate }}
                          </button>
                          <button 
                            (click)="completeInspection(inspection)"
                            [disabled]="inspection.status !== 'In Progress'"
                            class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ 'admin.complete' | translate }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (filteredInspections.length === 0) {
                    <tr>
                      <td colspan="9" class="px-6 py-12 text-center">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                          {{ 'admin.no_inspections_found' | translate }}
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

    <!-- Create Inspection Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
              {{ 'admin.new_inspections' | translate }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.new_inspections_desc' | translate }}
            </p>
          </div>
          <form (ngSubmit)="createInspection()" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newInspection.projectId"
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
                  {{ 'admin.inspection_type' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newInspection.inspectionType"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_type' | translate }}</option>
                  <option value="Initial">Initial</option>
                  <option value="Progress">Progress</option>
                  <option value="Final">Final</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.location' | translate }} *
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="newInspection.location"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.scheduled_date' | translate }} *
                </label>
                <input 
                  type="date" 
                  [(ngModel)]="newInspection.scheduledDate"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.inspector' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newInspection.inspectorId"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_inspector' | translate }}</option>
                  @for (inspector of availableInspectors; track inspector.id) {
                    <option [value]="inspector.id">{{ inspector.name }}</option>
                  }
                </select>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {{ 'admin.notes' | translate }}
              </label>
              <textarea 
                [(ngModel)]="newInspection.notes"
                rows="3"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              ></textarea>
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
export class QualityInspectionsComponent implements OnInit {
    private qualityService = inject(QualityService);

    inspections: QualityInspection[] = [];
    filteredInspections: QualityInspection[] = [];
    availableProjects: any[] = [];
    availableInspectors: any[] = [];

    searchTerm = '';
    projectFilter = '';
    statusFilter = '';
    typeFilter = '';

    showCreateModal = false;
    newInspection: any = {};

    isLoading = false;
    isSubmitting = false;

    ngOnInit() {
        this.loadInspections();
        this.loadAvailableProjects();
        this.loadAvailableInspectors();
    }

    loadInspections() {
        this.isLoading = true;
        this.qualityService.getInspections().subscribe({
            next: (data: any) => {
                this.inspections = data;
                this.filteredInspections = data;
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error loading inspections:', error);
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

    loadAvailableInspectors() {
        // Mock data - replace with actual API call
        this.availableInspectors = [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' },
            { id: 3, name: 'Bob Johnson' }
        ];
    }

    filterInspections() {
        this.filteredInspections = this.inspections.filter(inspection => {
            const matchesSearch = !this.searchTerm ||
                inspection.location?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                inspection.inspectorName?.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesProject = !this.projectFilter || inspection.projectId === parseInt(this.projectFilter);
            const matchesStatus = !this.statusFilter || inspection.status === this.statusFilter;
            const matchesType = !this.typeFilter || inspection.inspectionType === this.typeFilter;
            return matchesSearch && matchesProject && matchesStatus && matchesType;
        });
    }

    openCreateModal() {
        this.showCreateModal = true;
        this.newInspection = {};
    }

    closeCreateModal() {
        this.showCreateModal = false;
        this.newInspection = {};
    }

    createInspection() {
        if (!this.newInspection.projectId || !this.newInspection.inspectionType || !this.newInspection.scheduledDate || !this.newInspection.inspectorId) {
            return;
        }

        this.isSubmitting = true;
        this.qualityService.createInspection(this.newInspection).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeCreateModal();
                this.loadInspections();
            },
            error: (error: any) => {
                console.error('Error creating inspection:', error);
                this.isSubmitting = false;
            }
        });
    }

    startInspection(inspection: QualityInspection) {
        console.log('Start inspection:', inspection);
    }

    completeInspection(inspection: QualityInspection) {
        console.log('Complete inspection:', inspection);
    }

    viewDetails(inspection: QualityInspection) {
        console.log('View details:', inspection);
    }

    exportInspections() {
        console.log('Export inspections');
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString();
    }
}
