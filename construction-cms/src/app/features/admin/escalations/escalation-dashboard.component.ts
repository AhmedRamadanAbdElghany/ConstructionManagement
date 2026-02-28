import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EscalationService,
  ProjectItemEscalation,
  EscalationType,
  EscalationSeverity,
  EscalationStatus,
  CreateEscalationRequest
} from '../../../core/services/escalation.service';

@Component({
  selector: 'app-escalation-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-500 pb-20">
      <div class="max-w-7xl mx-auto animate-premium-fade">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div class="header-left">
            <h1 class="premium-heading mb-4">{{ 'escalations.title' | translate }}</h1>
            <p class="premium-subheading mb-0">{{ 'escalations.subtitle' | translate }}</p>
          </div>
          <button (click)="openCreateModal()" 
            class="premium-button-primary !px-8 !py-4 shadow-xl shadow-rose-500/20 flex items-center gap-3">
             <span class="text-xl leading-none">+</span>
            {{ 'escalations.new_escalation' | translate }}
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          @for (stat of [
            {label: 'escalations.total', value: stats.total, icon: '📋', color: 'indigo'},
            {label: 'escalations.open', value: stats.open, icon: '🔥', color: 'rose'},
            {label: 'escalations.in_progress', value: stats.inProgress, icon: '⏳', color: 'blue'},
            {label: 'escalations.critical', value: stats.critical, icon: '⚠️', color: 'amber'},
            {label: 'escalations.resolved', value: stats.resolved, icon: '✅', color: 'emerald'}
          ]; track stat.label; let i = $index) {
            <div class="premium-card-stack group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative cursor-default" [style.animation-delay]="(i * 100) + 'ms'">
              <div class="absolute -top-10 -right-10 w-32 h-32 bg-{{stat.color}}-500/5 rounded-full blur-3xl group-hover:bg-{{stat.color}}-500/10 transition-colors"></div>
              <div class="flex items-center gap-6">
                <div class="w-14 h-14 rounded-2xl bg-{{stat.color}}-500/10 text-{{stat.color}}-600 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {{ stat.icon }}
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{{ stat.label | translate }}</p>
                  <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ stat.value }}</h3>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Filters Hub -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
           <div class="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900/50 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 w-fit overflow-x-auto no-scrollbar">
            <button (click)="filterStatus = null; applyFilters()" 
                    [class]="filterStatus === null ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-lg shadow-slate-900/20 dark:shadow-white/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap">
                {{ 'escalations.all' | translate }}
            </button>
            <button (click)="filterStatus = EscalationStatus.Open; applyFilters()" 
                    [class]="filterStatus === EscalationStatus.Open ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap">
                {{ 'escalations.open' | translate }}
            </button>
            <button (click)="filterStatus = EscalationStatus.InProgress; applyFilters()" 
                    [class]="filterStatus === EscalationStatus.InProgress ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap">
                {{ 'escalations.in_progress' | translate }}
            </button>
             <button (click)="filterStatus = EscalationStatus.Resolved; applyFilters()" 
                    [class]="filterStatus === EscalationStatus.Resolved ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                    class="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap">
                {{ 'escalations.resolved' | translate }}
            </button>
          </div>

          <div class="relative group w-full md:w-80">
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()"
              [placeholder]="'escalations.search_placeholder' | translate"
              class="premium-input !pl-14">
            <div class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Table Card -->
        <div class="premium-card-stack !p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'escalations.escalation_id' | translate }}</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'escalations.title' | translate }}</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'escalations.type' | translate }}</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'escalations.severity' | translate }}</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'escalations.status' | translate }}</th>
                  <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{{ 'escalations.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-white/5">
                @for (escalation of filteredEscalations; track escalation.id; let i = $index) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group animate-premium-fade" [style.animation-delay]="(i * 50) + 'ms'">
                    <td class="px-8 py-6 font-black text-sm text-slate-900 dark:text-white">#{{ escalation.id }}</td>
                    <td class="px-8 py-6">
                      <p class="font-black text-sm text-slate-900 dark:text-white leading-tight mb-1">{{ escalation.title }}</p>
                      <p class="text-[10px] font-medium text-slate-500 line-clamp-1 italic">{{ escalation.description || 'No description provided' }}</p>
                    </td>
                    <td class="px-8 py-6">
                      <span [class]="getTypeClass(escalation.escalationType)" class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {{ getTypeLabel(escalation.escalationType) }}
                      </span>
                    </td>
                    <td class="px-8 py-6">
                       <span [class]="getSeverityClass(escalation.severity)" class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {{ getSeverityLabel(escalation.severity) }}
                      </span>
                    </td>
                    <td class="px-8 py-6">
                      <span [class]="getStatusClass(escalation.status)" class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {{ getStatusLabel(escalation.status) }}
                      </span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all" (click)="viewEscalation(escalation)">
                          👁
                        </button>
                        @if (escalation.status === EscalationStatus.Open) {
                          <button class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all font-black text-xs" (click)="acknowledgeEscalation(escalation)">
                            ✓
                          </button>
                        } @else if (escalation.status === EscalationStatus.InProgress) {
                          <button class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all font-black text-xs" (click)="openResolveModal(escalation)">
                            🏁
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-8 py-24 text-center">
                      <div class="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-4xl mx-auto mb-6 opacity-40">📭</div>
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-40">{{ 'escalations.no_escalations' | translate }}</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modals -->
        @if (showResolveModal) {
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-premium-fade">
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-white/5 transform transition-all">
              <div class="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'escalations.resolve_escalation' | translate }}</h2>
              </div>
              <div class="p-10 space-y-8">
                <div class="group">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'escalations.resolution' | translate }} *</label>
                  <textarea [(ngModel)]="resolutionData.resolution" rows="4" class="premium-input !rounded-[1.5rem] resize-none"></textarea>
                </div>
                <div class="group">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'escalations.resolution_notes' | translate }}</label>
                  <textarea [(ngModel)]="resolutionData.resolutionNotes" rows="2" class="premium-input !rounded-[1.5rem] resize-none"></textarea>
                </div>
              </div>
              <div class="p-10 border-t border-slate-100 dark:border-white/5 flex justify-end gap-4 bg-slate-50/30 dark:bg-white/[0.01]">
                <button (click)="closeResolveModal()" class="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                  {{ 'common.cancel' | translate }}
                </button>
                <button (click)="resolveEscalation()" [disabled]="!resolutionData.resolution" class="premium-button-primary !px-8 !py-4 disabled:opacity-50">
                  {{ 'escalations.resolve' | translate }}
                </button>
              </div>
            </div>
          </div>
        }

        @if (showCreateModal) {
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-premium-fade">
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-white/5 transform transition-all">
              <div class="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'escalations.create_escalation' | translate }}</h2>
              </div>
              <div class="p-10 space-y-8">
                <div class="group">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'escalations.title' | translate }} *</label>
                  <input type="text" [(ngModel)]="newEscalation.title" class="premium-input">
                </div>
                <div class="group">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'escalations.description' | translate }}</label>
                  <textarea [(ngModel)]="newEscalation.description" rows="3" class="premium-input !rounded-[1.5rem] resize-none"></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="group">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'escalations.type' | translate }}</label>
                    <select [(ngModel)]="newEscalation.escalationType" class="premium-input appearance-none">
                      <option [ngValue]="0">Pre-Start Not Confirmed</option>
                      <option [ngValue]="1">Materials Not Ready</option>
                      <option [ngValue]="2">Forced Start Required</option>
                      <option [ngValue]="3">Issue During Execution</option>
                      <option [ngValue]="4">No Start Today</option>
                      <option [ngValue]="5">Delay Predicted</option>
                      <option [ngValue]="6">Quality Issue</option>
                      <option [ngValue]="7">Safety Concern</option>
                      <option [ngValue]="8">Resource Conflict</option>
                    </select>
                  </div>
                  <div class="group">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-4">{{ 'escalations.severity' | translate }}</label>
                    <select [(ngModel)]="newEscalation.severity" class="premium-input appearance-none">
                      <option [ngValue]="0">Low</option>
                      <option [ngValue]="1">Medium</option>
                      <option [ngValue]="2">High</option>
                      <option [ngValue]="3">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="p-10 border-t border-slate-100 dark:border-white/5 flex justify-end gap-4 bg-slate-50/30 dark:bg-white/[0.01]">
                <button (click)="closeCreateModal()" class="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                  {{ 'common.cancel' | translate }}
                </button>
                <button (click)="createEscalation()" [disabled]="!newEscalation.title" class="premium-button-primary !px-8 !py-4 shadow-xl shadow-rose-500/20">
                  {{ 'escalations.create' | translate }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EscalationDashboardComponent implements OnInit {
  private escalationService = inject(EscalationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  escalations: ProjectItemEscalation[] = [];
  filteredEscalations: ProjectItemEscalation[] = [];
  searchTerm = '';
  filterStatus: EscalationStatus | null = null;

  showResolveModal = false;
  showCreateModal = false;
  selectedEscalation: ProjectItemEscalation | null = null;
  resolutionData = {
    resolution: '',
    resolutionNotes: ''
  };

  newEscalation = {
    title: '',
    description: '',
    escalationType: EscalationType.IssueDuringExecution,
    severity: EscalationSeverity.Medium,
    projectId: 0
  };

  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    critical: 0,
    resolved: 0
  };

  EscalationStatus = EscalationStatus;
  EscalationType = EscalationType;
  EscalationSeverity = EscalationSeverity;

  ngOnInit(): void {
    this.loadEscalations();
  }

  loadEscalations(): void {
    this.escalationService.getMyEscalations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (escalations) => {
          this.escalations = escalations;
          this.applyFilters();
          this.calculateStats();
        },
        error: (error) => {
          console.error('Error loading escalations:', error);
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.escalations];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(term) ||
        (e.description?.toLowerCase().includes(term) ?? false)
      );
    }

    if (this.filterStatus !== null) {
      filtered = filtered.filter(e => e.status === this.filterStatus);
    }

    this.filteredEscalations = filtered;
  }

  calculateStats(): void {
    this.stats.total = this.escalations.length;
    this.stats.open = this.escalations.filter(e => e.status === EscalationStatus.Open || e.status === EscalationStatus.Acknowledged).length;
    this.stats.inProgress = this.escalations.filter(e => e.status === EscalationStatus.InProgress).length;
    this.stats.critical = this.escalations.filter(e => e.severity === EscalationSeverity.Critical && e.status !== EscalationStatus.Resolved && e.status !== EscalationStatus.Closed).length;
    this.stats.resolved = this.escalations.filter(e => e.status === EscalationStatus.Resolved || e.status === EscalationStatus.Closed).length;
  }

  // Actions
  acknowledgeEscalation(escalation: ProjectItemEscalation): void {
    this.escalationService.acknowledge(escalation.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadEscalations();
        },
        error: (error) => {
          console.error('Error acknowledging escalation:', error);
        }
      });
  }

  startProgress(escalation: ProjectItemEscalation): void {
    this.escalationService.startProgress(escalation.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadEscalations();
        },
        error: (error) => {
          console.error('Error starting progress:', error);
        }
      });
  }

  openResolveModal(escalation: ProjectItemEscalation): void {
    this.selectedEscalation = escalation;
    this.resolutionData = {
      resolution: '',
      resolutionNotes: ''
    };
    this.showResolveModal = true;
  }

  closeResolveModal(): void {
    this.showResolveModal = false;
    this.selectedEscalation = null;
  }

  resolveEscalation(): void {
    if (!this.selectedEscalation) return;

    this.escalationService.resolve(this.selectedEscalation.id, this.resolutionData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeResolveModal();
          this.loadEscalations();
        },
        error: (error) => {
          console.error('Error resolving escalation:', error);
        }
      });
  }

  viewEscalation(escalation: ProjectItemEscalation): void {
    this.router.navigate(['/escalations', escalation.id]);
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newEscalation = {
      title: '',
      description: '',
      escalationType: EscalationType.IssueDuringExecution,
      severity: EscalationSeverity.Medium,
      projectId: 0
    };
  }

  createEscalation(): void {
    // This would need project context - for now just close modal
    this.closeCreateModal();
  }

  // Helper methods
  getTypeLabel(type: EscalationType): string {
    return this.escalationService.getEscalationTypeLabel(type);
  }

  getTypeClass(type: EscalationType): string {
    return this.escalationService.getEscalationTypeColor(type);
  }

  getSeverityLabel(severity: EscalationSeverity): string {
    return this.escalationService.getSeverityLabel(severity);
  }

  getSeverityClass(severity: EscalationSeverity): string {
    return this.escalationService.getSeverityColor(severity);
  }

  getStatusLabel(status: EscalationStatus): string {
    return this.escalationService.getStatusLabel(status);
  }

  getStatusClass(status: EscalationStatus): string {
    return this.escalationService.getStatusColor(status);
  }

  getInitials(user: any): string {
    if (!user) return '?';
    const name = user.name || user.fullName || user.userName || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
