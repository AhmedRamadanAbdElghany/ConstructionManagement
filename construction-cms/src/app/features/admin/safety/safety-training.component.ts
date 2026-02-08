import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SafetyService } from '../../../core/services/safety.service';
import { SafetyTraining } from '../../../shared/interfaces';

@Component({
  selector: 'app-safety-training',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ 'admin.safety_training' | translate }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.safety_training_desc' | translate }}
            </p>
          </div>
          <div class="flex gap-4">
            <button (click)="openCreateModal()" class="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              {{ 'admin.new_training' | translate }}
            </button>
            <button (click)="exportTraining()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
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
                  (input)="filterTraining()"
                  placeholder="{{ 'admin.search_training' | translate }}"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.training_type' | translate }}
                </label>
                <select 
                  [(ngModel)]="typeFilter"
                  (change)="filterTraining()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="Induction">Induction</option>
                  <option value="Toolbox">Toolbox Talk</option>
                  <option value="Equipment">Equipment Safety</option>
                  <option value="Emergency">Emergency Response</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.status' | translate }}
                </label>
                <select 
                  [(ngModel)]="statusFilter"
                  (change)="filterTraining()"
                  class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.all' | translate }}</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        }

        <!-- Training List -->
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
                      {{ 'admin.training_type' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.title' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.instructor' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.attendees' | translate }}
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
                  @for (training of filteredTraining; track training.id) {
                    <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ formatDate(training.trainingDate) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ training.trainingType || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">
                          {{ training.title || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ training.trainer || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ training.attendees.length || 0 }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span
                          [ngClass]="training.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : training.status === 'Scheduled'
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ training.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button 
                            (click)="viewDetails(training)"
                            class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            {{ 'admin.view' | translate }}
                          </button>
                          <button 
                            (click)="startTraining(training)"
                            [disabled]="training.status !== 'Scheduled'"
                            class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ 'admin.start' | translate }}
                          </button>
                          <button
                            (click)="completeTraining(training)"
                            [disabled]="training.status !== 'Scheduled'"
                            class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ 'admin.complete' | translate }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (filteredTraining.length === 0) {
                    <tr>
                      <td colspan="8" class="px-6 py-12 text-center">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                          {{ 'admin.no_training_found' | translate }}
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

    <!-- Create Training Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
              {{ 'admin.new_training' | translate }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.new_training_desc' | translate }}
            </p>
          </div>
          <form (ngSubmit)="createTraining()" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.training_type' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newTraining.trainingType"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_type' | translate }}</option>
                  <option value="Induction">Induction</option>
                  <option value="Toolbox">Toolbox Talk</option>
                  <option value="Equipment">Equipment Safety</option>
                  <option value="Emergency">Emergency Response</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.title' | translate }} *
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="newTraining.title"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.instructor' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newTraining.instructorId"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_instructor' | translate }}</option>
                  @for (instructor of availableInstructors; track instructor.id) {
                    <option [value]="instructor.id">{{ instructor.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.scheduled_date' | translate }} *
                </label>
                <input 
                  type="date" 
                  [(ngModel)]="newTraining.scheduledDate"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.duration_hours' | translate }} *
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="newTraining.duration"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {{ 'admin.description' | translate }}
              </label>
              <textarea 
                [(ngModel)]="newTraining.description"
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
export class SafetyTrainingComponent implements OnInit {
  private safetyService = inject(SafetyService);

  training: SafetyTraining[] = [];
  filteredTraining: SafetyTraining[] = [];
  availableInstructors: any[] = [];

  searchTerm = '';
  typeFilter = '';
  statusFilter = '';

  showCreateModal = false;
  newTraining: any = {};

  isLoading = false;
  isSubmitting = false;

  ngOnInit() {
    this.loadTraining();
    this.loadAvailableInstructors();
  }

  loadTraining() {
    this.isLoading = true;
    this.safetyService.getTrainings().subscribe({
      next: (data: any) => {
        this.training = data;
        this.filteredTraining = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading training:', error);
        this.isLoading = false;
      }
    });
  }

  loadAvailableInstructors() {
    // Mock data - replace with actual API call
    this.availableInstructors = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Bob Johnson' }
    ];
  }

  filterTraining() {
    this.filteredTraining = this.training.filter(t => {
      const matchesSearch = !this.searchTerm ||
        t.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.trainer?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.typeFilter || t.trainingType === this.typeFilter;
      const matchesStatus = !this.statusFilter || t.status === this.statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newTraining = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newTraining = {};
  }

  createTraining() {
    if (!this.newTraining.trainingType || !this.newTraining.title || !this.newTraining.instructorId || !this.newTraining.scheduledDate || !this.newTraining.duration) {
      return;
    }

    this.isSubmitting = true;
    this.safetyService.createTraining(this.newTraining).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeCreateModal();
        this.loadTraining();
      },
      error: (error: any) => {
        console.error('Error creating training:', error);
        this.isSubmitting = false;
      }
    });
  }

  startTraining(training: SafetyTraining) {
    console.log('Start training:', training);
  }

  completeTraining(training: SafetyTraining) {
    console.log('Complete training:', training);
  }

  viewDetails(training: SafetyTraining) {
    console.log('View details:', training);
  }

  exportTraining() {
    console.log('Export training');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
