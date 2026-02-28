import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { EquipmentService, CreateEquipmentAssignmentRequest, ReturnEquipmentRequest } from '../../../core/services/equipment.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-equipment-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ 'admin.equipment_assignments' | translate }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.equipment_assignments_desc' | translate }}
            </p>
          </div>
          <button (click)="openCreateModal()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
            {{ 'admin.new_assignment' | translate }}
          </button>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <app-loading-spinner [centered]="true"></app-loading-spinner>
          </div>
        }

        <!-- Assignments List -->
        @if (!isLoading) {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
            <!-- Filters -->
            <div class="p-6 border-b border-slate-100 dark:border-white/5">
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {{ 'admin.search' | translate }}
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="searchTerm"
                    (input)="filterAssignments()"
                    placeholder="{{ 'admin.search_assignments' | translate }}"
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {{ 'admin.status' | translate }}
                  </label>
                  <select 
                    [(ngModel)]="statusFilter"
                    (change)="filterAssignments()"
                    class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">{{ 'admin.all' | translate }}</option>
                    <option value="Active">{{ 'admin.active' | translate }}</option>
                    <option value="Completed">{{ 'admin.completed' | translate }}</option>
                    <option value="Cancelled">{{ 'admin.cancelled' | translate }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Assignments Table -->
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50 dark:bg-slate-950/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.equipment' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.project' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.assigned_to' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.start_date' | translate }}
                    </th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {{ 'admin.end_date' | translate }}
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
                  @for (assignment of filteredAssignments; track assignment.id) {
                    <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td class="px-6 py-4">
                        <div>
                          <span class="text-sm font-black text-slate-900 dark:text-white block">
                            {{ assignment.equipmentName }}
                          </span>
                          <span class="text-xs text-slate-500 dark:text-slate-400">
                            {{ assignment.equipmentSerialNumber }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ assignment.projectName || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ assignment.assignedToUserName || '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ formatDate(assignment.startDate) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                          {{ assignment.endDate ? formatDate(assignment.endDate) : '-' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [ngClass]="assignment.status === 'Active' 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : assignment.status === 'Completed' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                            : 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ assignment.statusName || assignment.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          @if (assignment.status === 'Active') {
                            <button 
                              (click)="openReturnModal(assignment)"
                              class="px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-colors">
                              {{ 'admin.return' | translate }}
                            </button>
                          }
                          <button 
                            (click)="viewDetails(assignment)"
                            class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            {{ 'admin.view' | translate }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (filteredAssignments.length === 0) {
                    <tr>
                      <td colspan="7" class="px-6 py-12 text-center">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                          {{ 'admin.no_assignments_found' | translate }}
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

    <!-- Create Assignment Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
              {{ 'admin.new_assignment' | translate }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.new_assignment_desc' | translate }}
            </p>
          </div>
          <form (ngSubmit)="createAssignment()" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.equipment' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newAssignment.equipmentId"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_equipment' | translate }}</option>
                  @for (equipment of availableEquipment; track equipment.id) {
                    <option [value]="equipment.id">{{ equipment.name }} ({{ equipment.serialNumber }})</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.project' | translate }}
                </label>
                <select 
                  [(ngModel)]="newAssignment.projectId"
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
                  {{ 'admin.assigned_to' | translate }}
                </label>
                <select 
                  [(ngModel)]="newAssignment.assignedToUserId"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_user' | translate }}</option>
                  @for (user of availableUsers; track user.id) {
                    <option [value]="user.id">{{ user.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.assignment_type' | translate }} *
                </label>
                <select 
                  [(ngModel)]="newAssignment.assignmentType"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">{{ 'admin.select_type' | translate }}</option>
                  <option value="Project">Project</option>
                  <option value="Rental">Rental</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.start_date' | translate }} *
                </label>
                <input 
                  type="date" 
                  [(ngModel)]="newAssignment.startDate"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {{ 'admin.end_date' | translate }}
                </label>
                <input 
                  type="date" 
                  [(ngModel)]="newAssignment.endDate"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {{ 'admin.purpose' | translate }}
              </label>
              <textarea 
                [(ngModel)]="newAssignment.purpose"
                rows="3"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              ></textarea>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {{ 'admin.notes' | translate }}
              </label>
              <textarea 
                [(ngModel)]="newAssignment.notes"
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

    <!-- Return Equipment Modal -->
    @if (showReturnModal && selectedAssignment) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-xl">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
              {{ 'admin.return_equipment' | translate }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ selectedAssignment.equipmentName }}
            </p>
          </div>
          <form (ngSubmit)="returnEquipment()" class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {{ 'admin.condition_at_return' | translate }}
              </label>
              <select 
                [(ngModel)]="returnRequest.conditionAtReturn"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {{ 'admin.fuel_level' | translate }}
              </label>
              <input 
                type="number" 
                [(ngModel)]="returnRequest.fuelLevelAtReturn"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {{ 'admin.operating_hours' | translate }}
              </label>
              <input 
                type="number" 
                [(ngModel)]="returnRequest.operatingHoursAtReturn"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {{ 'admin.notes' | translate }}
              </label>
              <textarea 
                [(ngModel)]="returnRequest.notes"
                rows="3"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              ></textarea>
            </div>
            <div class="flex gap-4 justify-end">
              <button 
                type="button"
                (click)="closeReturnModal()"
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
                    {{ 'admin.processing' | translate }}
                  </span>
                } @else {
                  {{ 'admin.return' | translate }}
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
export class EquipmentAssignmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private equipmentService = inject(EquipmentService);
  private i18nService = inject(I18nService);

  assignments: any[] = [];
  filteredAssignments: any[] = [];
  availableEquipment: any[] = [];
  availableProjects: any[] = [];
  availableUsers: any[] = [];

  searchTerm = '';
  statusFilter = '';

  showCreateModal = false;
  showReturnModal = false;
  selectedAssignment: any = null;

  newAssignment: Partial<CreateEquipmentAssignmentRequest> = {};
  returnRequest: Partial<ReturnEquipmentRequest> = {};

  isLoading = false;
  isSubmitting = false;

  ngOnInit() {
    this.loadAssignments();
    this.loadAvailableEquipment();
    this.loadAvailableProjects();
    this.loadAvailableUsers();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAssignments();
        this.loadAvailableEquipment();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssignments() {
    this.isLoading = true;
    this.equipmentService.getAssignments().subscribe({
      next: (data: any) => {
        this.assignments = data;
        this.filteredAssignments = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading assignments:', error);
        this.isLoading = false;
      }
    });
  }

  loadAvailableEquipment() {
    this.equipmentService.getAvailableEquipment().subscribe({
      next: (data: any) => {
        this.availableEquipment = data;
      },
      error: (error: any) => {
        console.error('Error loading equipment:', error);
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

  loadAvailableUsers() {
    // Mock data - replace with actual API call
    this.availableUsers = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Bob Johnson' }
    ];
  }

  filterAssignments() {
    this.filteredAssignments = this.assignments.filter(assignment => {
      const matchesSearch = !this.searchTerm ||
        assignment.equipmentName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        assignment.projectName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || assignment.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newAssignment = {};
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newAssignment = {};
  }

  createAssignment() {
    if (!this.newAssignment.equipmentId || !this.newAssignment.assignmentType || !this.newAssignment.startDate) {
      return;
    }

    this.isSubmitting = true;
    this.equipmentService.createAssignment(this.newAssignment as CreateEquipmentAssignmentRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeCreateModal();
        this.loadAssignments();
      },
      error: (error: any) => {
        console.error('Error creating assignment:', error);
        this.isSubmitting = false;
      }
    });
  }

  openReturnModal(assignment: any) {
    this.selectedAssignment = assignment;
    this.returnRequest = {};
    this.showReturnModal = true;
  }

  closeReturnModal() {
    this.showReturnModal = false;
    this.selectedAssignment = null;
    this.returnRequest = {};
  }

  returnEquipment() {
    if (!this.selectedAssignment) return;

    this.isSubmitting = true;
    this.equipmentService.returnEquipment(this.selectedAssignment.id, this.returnRequest as ReturnEquipmentRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeReturnModal();
        this.loadAssignments();
      },
      error: (error: any) => {
        console.error('Error returning equipment:', error);
        this.isSubmitting = false;
      }
    });
  }

  viewDetails(assignment: any) {
    console.log('View details:', assignment);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
