import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QualityService } from '../../../core/services/quality.service';
import { PunchListItem } from '../../../shared/interfaces';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-quality-punchlist',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ 'admin.punchlist' | translate }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.punchlist_desc' | translate }}
            </p>
          </div>
          <div class="flex gap-4">
            <button (click)="openCreateModal()" class="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              {{ 'admin.new_item' | translate }}
            </button>
            <button (click)="exportPunchlist()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
              {{ 'admin.export' | translate }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <app-loading-spinner [centered]="true"></app-loading-spinner>
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
                  (input)="filterPunchlist()"
                  placeholder="{{ 'admin.search_punchlist' | translate }}"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }}
                </label>
                <select 
                  [(ngModel)]="projectFilter"
                  (change)="filterPunchlist()"
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
                  (change)="filterPunchlist()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="Open">{{ 'admin.open' | translate }}</option>
                  <option value="In Progress">{{ 'admin.in_progress' | translate }}</option>
                  <option value="Completed">{{ 'admin.completed' | translate }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.priority' | translate }}
                </label>
                <select 
                  [(ngModel)]="priorityFilter"
                  (change)="filterPunchlist()"
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

        <!-- Punchlist Items -->
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
                      {{ 'admin.priority' | translate }}
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
                  @for (item of filteredPunchlist; track item.id) {
                    <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ formatDate(item.dueDate || item.completedDate) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">
                          {{ item.projectName || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ item.location || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ item.description || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [ngClass]="item.priority === 'High' 
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' 
                            : item.priority === 'Medium' 
                            ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' 
                            : 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ item.priority }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [ngClass]="item.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : item.status === 'In Progress' 
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                            : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ item.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button 
                            (click)="viewDetails(item)"
                            class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            {{ 'admin.view' | translate }}
                          </button>
                          <button 
                            (click)="completeItem(item)"
                            [disabled]="item.status === 'Completed'"
                            class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ 'admin.complete' | translate }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (filteredPunchlist.length === 0) {
                    <tr>
                      <td colspan="8" class="px-6 py-12 text-center">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                          {{ 'admin.no_items_found' | translate }}
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

    <!-- Create Item Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
              {{ 'admin.new_item' | translate }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.new_item_desc' | translate }}
            </p>
          </div>
          <form (ngSubmit)="createItem()" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newItem.projectId"
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
                  {{ 'admin.priority' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newItem.priority"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_priority' | translate }}</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.location' | translate }} *
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="newItem.location"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div class="md:col-span-2">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.description' | translate }} *
                </label>
                <textarea 
                  [(ngModel)]="newItem.description"
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
export class QualityPunchlistComponent implements OnInit {
  private qualityService = inject(QualityService);

  punchlist: PunchListItem[] = [];
  filteredPunchlist: PunchListItem[] = [];
  availableProjects: any[] = [];

  searchTerm = '';
  projectFilter = '';
  statusFilter = '';
  priorityFilter = '';

  showCreateModal = false;
  newItem: any = {};

  isLoading = false;
  isSubmitting = false;

  ngOnInit() {
    this.loadPunchlist();
    this.loadAvailableProjects();
  }

  loadPunchlist() {
    this.isLoading = true;
    this.qualityService.getPunchListItems().subscribe({
      next: (data: any) => {
        this.punchlist = data;
        this.filteredPunchlist = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading punchlist:', error);
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

  filterPunchlist() {
    this.filteredPunchlist = this.punchlist.filter(item => {
      const matchesSearch = !this.searchTerm ||
        item.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesProject = !this.projectFilter || item.projectId === parseInt(this.projectFilter);
      const matchesStatus = !this.statusFilter || item.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || item.priority === this.priorityFilter;
      return matchesSearch && matchesProject && matchesStatus && matchesPriority;
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newItem = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newItem = {};
  }

  createItem() {
    // TODO: Implement create functionality when API endpoint is available
    console.log('Create item:', this.newItem);
    this.closeCreateModal();
  }

  completeItem(item: PunchListItem) {
    console.log('Complete item:', item);
  }

  viewDetails(item: PunchListItem) {
    console.log('View details:', item);
  }

  exportPunchlist() {
    console.log('Export punchlist');
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }
}
