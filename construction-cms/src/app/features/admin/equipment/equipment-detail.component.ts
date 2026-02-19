import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentAssignment, EquipmentMaintenance } from '../../../shared/interfaces';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button (click)="goBack()" class="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-2">
              &larr; {{ 'admin.back' | translate }}
            </button>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ equipment?.name || 'Loading...' }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ equipment?.type }} - {{ equipment?.serialNumber }}
            </p>
          </div>
          <div class="flex gap-4">
            <button (click)="editEquipment()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors">
              {{ 'admin.edit' | translate }}
            </button>
            <button (click)="deleteEquipment()" class="px-6 py-3 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-colors">
              {{ 'admin.delete' | translate }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Equipment Details -->
        @if (!isLoading && equipment) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <!-- Main Info -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Status Card -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-xl font-black text-slate-900 dark:text-white">
                    {{ 'admin.equipment_status' | translate }}
                  </h2>
                  <span 
                    [ngClass]="equipment.status === 'Active' 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : equipment.status === 'Maintenance' 
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'"
                    class="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                    {{ equipment.status }}
                  </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.purchase_date' | translate }}
                    </p>
                    <span class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ formatDate(equipment.purchaseDate) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.purchase_cost' | translate }}
                    </p>
                    <span class="text-sm font-black text-slate-900 dark:text-white">
                      {{ formatCurrency(equipment.purchaseCost) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.current_value' | translate }}
                    </p>
                    <span class="text-sm font-black text-slate-900 dark:text-white">
                      {{ formatCurrency(equipment.currentValue) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.depreciation' | translate }}
                    </p>
                    <span class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ equipment.depreciation }}%
                    </span>
                  </div>
                </div>
              </div>

              <!-- Specifications -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white mb-6">
                  {{ 'admin.specifications' | translate }}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.manufacturer' | translate }}
                    </p>
                    <span class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ equipment.manufacturer }}
                    </span>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.model' | translate }}
                    </p>
                    <span class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ equipment.model }}
                    </span>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.year' | translate }}
                    </p>
                    <span class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ equipment.year }}
                    </span>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.capacity' | translate }}
                    </p>
                    <span class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ equipment.capacity }}
                    </span>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.fuel_type' | translate }}
                    </p>
                    <span class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ equipment.fuelType }}
                    </span>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {{ 'admin.location' | translate }}
                    </p>
                    <span class="text-sm font-medium text-slate-900 dark:text-white">
                      {{ equipment.location }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Maintenance History -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                <div class="p-8 border-b border-slate-100 dark:border-white/5">
                  <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
                    {{ 'admin.maintenance_history' | translate }}
                  </h2>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    {{ 'admin.maintenance_history_desc' | translate }}
                  </p>
                </div>
                <div class="p-6 space-y-4">
                  @for (maintenance of maintenanceHistory; track maintenance.id) {
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                      <div class="flex items-start justify-between mb-2">
                        <div>
                          <span class="text-sm font-black text-slate-900 dark:text-white block mb-1">
                            {{ maintenance.maintenanceType }}
                          </span>
                          <span class="text-xs text-slate-500 dark:text-slate-400">
                            {{ formatDate(maintenance.completedDate || maintenance.scheduledDate) }}
                          </span>
                        </div>
                        <span 
                          [ngClass]="maintenance.status === 'Completed' 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'"
                          class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {{ maintenance.status }}
                        </span>
                      </div>
                      <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {{ maintenance.description }}
                      </p>
                      <div class="flex items-center gap-4">
                        <span class="text-xs text-slate-500 dark:text-slate-400">
                          {{ 'admin.cost' | translate }}: {{ formatCurrency(maintenance.cost) }}
                        </span>
                        <span class="text-xs text-slate-500 dark:text-slate-400">
                          {{ 'admin.performed_by' | translate }}: {{ maintenance.performedBy }}
                        </span>
                      </div>
                    </div>
                  }
                  @if (maintenanceHistory.length === 0) {
                    <div class="text-center py-8">
                      <p class="text-sm text-slate-500 dark:text-slate-400">
                        {{ 'admin.no_maintenance_records' | translate }}
                      </p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-8">
              <!-- Utilization Stats -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white mb-6">
                  {{ 'admin.utilization' | translate }}
                </h2>
                <div class="space-y-6">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-slate-600 dark:text-slate-400">
                        {{ 'admin.operating_hours' | translate }}
                      </span>
                      <span class="text-sm font-black text-slate-900 dark:text-white">
                        {{ equipment.operatingHours }}
                      </span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        [style.width.%]="(equipment.operatingHours / 10000) * 100"
                        class="h-2 rounded-full bg-indigo-600"
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-slate-600 dark:text-slate-400">
                        {{ 'admin.utilization_rate' | translate }}
                      </span>
                      <span class="text-sm font-black text-slate-900 dark:text-white">
                        {{ equipment.utilizationRate }}%
                      </span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        [style.width.%]="equipment.utilizationRate"
                        [ngClass]="equipment.utilizationRate >= 80 ? 'bg-emerald-600' : equipment.utilizationRate >= 60 ? 'bg-amber-600' : 'bg-rose-600'"
                        class="h-2 rounded-full transition-all"
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-slate-600 dark:text-slate-400">
                        {{ 'admin.fuel_consumed' | translate }}
                      </span>
                      <span class="text-sm font-black text-slate-900 dark:text-white">
                        {{ equipment.fuelConsumed }}L
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Current Assignment -->
              @if (currentAssignment) {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                  <h2 class="text-xl font-black text-slate-900 dark:text-white mb-6">
                    {{ 'admin.current_assignment' | translate }}
                  </h2>
                  <div class="space-y-4">
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                        {{ 'admin.project' | translate }}
                      </p>
                      <span class="text-sm font-medium text-slate-900 dark:text-white">
                        {{ currentAssignment.projectName }}
                      </span>
                    </div>
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                        {{ 'admin.assigned_date' | translate }}
                      </p>
                      <span class="text-sm text-slate-600 dark:text-slate-400">
                        {{ formatDate(currentAssignment.assignedDate) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                        {{ 'admin.operating_hours' | translate }}
                      </p>
                      <span class="text-sm font-medium text-slate-900 dark:text-white">
                        {{ currentAssignment.operatingHours }}
                      </span>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 text-center">
                  <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 0118.364 5.636m0 12.728L12 21m-6.364-6.364m0 0l-6.364 6.364"></path>
                  </svg>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    {{ 'admin.not_assigned' | translate }}
                  </p>
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
export class EquipmentDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private equipmentService = inject(EquipmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private i18nService = inject(I18nService);

  equipment: any = null;
  maintenanceHistory: EquipmentMaintenance[] = [];
  currentAssignment: EquipmentAssignment | null = null;
  isLoading = false;
  private equipmentId: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.equipmentId = parseInt(id);
      this.loadEquipment(this.equipmentId);
    }

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.equipmentId) {
          this.loadEquipment(this.equipmentId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEquipment(id: number) {
    this.isLoading = true;
    this.equipmentService.getEquipment(id).subscribe({
      next: (data) => {
        this.equipment = data;
        this.loadMaintenanceHistory(id);
        this.loadCurrentAssignment(id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading equipment:', error);
        this.isLoading = false;
      }
    });
  }

  loadMaintenanceHistory(equipmentId: number) {
    this.equipmentService.getMaintenancesByEquipment(equipmentId).subscribe({
      next: (data: any) => {
        this.maintenanceHistory = data;
      },
      error: (error: any) => {
        console.error('Error loading maintenance history:', error);
      }
    });
  }

  loadCurrentAssignment(equipmentId: number) {
    this.equipmentService.getAssignmentsByEquipment(equipmentId).subscribe({
      next: (data: any) => {
        this.currentAssignment = data.find((a: any) => a.status === 'Active') || null;
      },
      error: (error: any) => {
        console.error('Error loading assignments:', error);
      }
    });
  }

  editEquipment() {
    this.router.navigate(['/admin/equipment', this.equipment.id, 'edit']);
  }

  deleteEquipment() {
    if (confirm('Are you sure you want to delete this equipment?')) {
      this.equipmentService.deleteEquipment(this.equipment.id).subscribe({
        next: () => {
          this.router.navigate(['/admin/equipment']);
        },
        error: (error) => {
          console.error('Error deleting equipment:', error);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/equipment']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
