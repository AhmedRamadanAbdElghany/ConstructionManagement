import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SafetyService } from '../../../core/services/safety.service';
import { SafetyIncident } from '../../../shared/interfaces';

@Component({
  selector: 'app-safety-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ 'admin.safety_incidents' | translate }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.safety_incidents_desc' | translate }}
            </p>
          </div>
          <div class="flex gap-4">
            <button (click)="openCreateModal()" class="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              {{ 'admin.report_incident' | translate }}
            </button>
            <button (click)="exportIncidents()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
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
                  (input)="filterIncidents()"
                  placeholder="{{ 'admin.search_incidents' | translate }}"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }}
                </label>
                <select 
                  [(ngModel)]="projectFilter"
                  (change)="filterIncidents()"
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
                  {{ 'admin.severity' | translate }}
                </label>
                <select 
                  [(ngModel)]="severityFilter"
                  (change)="filterIncidents()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="Critical">{{ 'admin.critical' | translate }}</option>
                  <option value="Major">{{ 'admin.major' | translate }}</option>
                  <option value="Minor">{{ 'admin.minor' | translate }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.status' | translate }}
                </label>
                <select 
                  [(ngModel)]="statusFilter"
                  (change)="filterIncidents()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="Open">{{ 'admin.open' | translate }}</option>
                  <option value="Investigating">{{ 'admin.investigating' | translate }}</option>
                  <option value="Resolved">{{ 'admin.resolved' | translate }}</option>
                  <option value="Closed">{{ 'admin.closed' | translate }}</option>
                </select>
              </div>
            </div>
          </div>
        }

        <!-- Incidents List -->
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
                  @for (incident of filteredIncidents; track incident.id) {
                    <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ formatDate(incident.incidentDate) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">
                          {{ incident.projectName || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ incident.location || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ incident.description || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [ngClass]="incident.severity === 'Critical' 
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' 
                            : incident.severity === 'Major' 
                            ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' 
                            : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ incident.severity }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [ngClass]="incident.status === 'Closed'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : incident.status === 'Investigating' 
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                            : incident.status === 'Resolved' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                            : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ incident.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button 
                            (click)="viewDetails(incident)"
                            class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            {{ 'admin.view' | translate }}
                          </button>
                          <button 
                            (click)="closeIncident(incident)"
                            [disabled]="incident.status === 'Closed' || incident.status === 'Resolved'"
                            class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ 'admin.close' | translate }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (filteredIncidents.length === 0) {
                    <tr>
                      <td colspan="8" class="px-6 py-12 text-center">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                          {{ 'admin.no_incidents_found' | translate }}
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

    <!-- Create Incident Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
              {{ 'admin.report_incident' | translate }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.report_incident_desc' | translate }}
            </p>
          </div>
          <form (ngSubmit)="createIncident()" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newIncident.projectId"
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
                  [(ngModel)]="newIncident.severity"
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
                  [(ngModel)]="newIncident.location"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.description' | translate }} *
                </label>
                <textarea 
                  [(ngModel)]="newIncident.description"
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
export class SafetyIncidentsComponent implements OnInit {
  private safetyService = inject(SafetyService);

  incidents: SafetyIncident[] = [];
  filteredIncidents: SafetyIncident[] = [];
  availableProjects: any[] = [];

  searchTerm = '';
  projectFilter = '';
  severityFilter = '';
  statusFilter = '';

  showCreateModal = false;
  newIncident: any = {};

  isLoading = false;
  isSubmitting = false;

  ngOnInit() {
    this.loadIncidents();
    this.loadAvailableProjects();
  }

  loadIncidents() {
    this.isLoading = true;
    this.safetyService.getIncidents().subscribe({
      next: (data: any) => {
        this.incidents = data;
        this.filteredIncidents = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading incidents:', error);
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

  filterIncidents() {
    this.filteredIncidents = this.incidents.filter(incident => {
      const matchesSearch = !this.searchTerm ||
        incident.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        incident.location?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesProject = !this.projectFilter || incident.projectId === parseInt(this.projectFilter);
      const matchesSeverity = !this.severityFilter || incident.severity === this.severityFilter;
      const matchesStatus = !this.statusFilter || incident.status === this.statusFilter;
      return matchesSearch && matchesProject && matchesSeverity && matchesStatus;
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newIncident = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newIncident = {};
  }

  createIncident() {
    if (!this.newIncident.projectId || !this.newIncident.severity || !this.newIncident.location || !this.newIncident.description) {
      return;
    }

    this.isSubmitting = true;
    this.safetyService.createIncident(this.newIncident).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeCreateModal();
        this.loadIncidents();
      },
      error: (error: any) => {
        console.error('Error creating incident:', error);
        this.isSubmitting = false;
      }
    });
  }

  closeIncident(incident: SafetyIncident) {
    console.log('Close incident:', incident);
  }

  viewDetails(incident: SafetyIncident) {
    console.log('View details:', incident);
  }

  exportIncidents() {
    console.log('Export incidents');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
