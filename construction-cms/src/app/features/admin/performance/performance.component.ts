import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PerformanceEvaluationService, EvaluationPeriodDto, PerformanceEvaluationDto } from '../../../core/services/performance-evaluation.service';

@Component({
    selector: 'app-performance',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ 'performance.title' | translate }}</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">{{ 'performance.subtitle' | translate }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'performance.active_periods' | translate }}</div>
          <div class="text-2xl font-bold text-cyan-500">{{ activePeriods() }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'performance.pending_reviews' | translate }}</div>
          <div class="text-2xl font-bold text-amber-500">{{ pendingReviews() }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'performance.completed_reviews' | translate }}</div>
          <div class="text-2xl font-bold text-green-500">{{ completedReviews() }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'performance.avg_score' | translate }}</div>
          <div class="text-2xl font-bold text-purple-500">{{ averageScore() | number:'1.1' }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="border-b border-slate-200 dark:border-slate-700">
          <nav class="flex -mb-px">
            <button (click)="activeTab.set('periods')" 
                    [class.border-cyan-500]="activeTab() === 'periods'"
                    [class.text-cyan-600]="activeTab() === 'periods'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'performance.periods' | translate }}
            </button>
            <button (click)="activeTab.set('evaluations')" 
                    [class.border-cyan-500]="activeTab() === 'evaluations'"
                    [class.text-cyan-600]="activeTab() === 'evaluations'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'performance.evaluations' | translate }}
            </button>
            <button (click)="activeTab.set('criteria')" 
                    [class.border-cyan-500]="activeTab() === 'criteria'"
                    [class.text-cyan-600]="activeTab() === 'criteria'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'performance.criteria' | translate }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          @switch (activeTab()) {
            @case ('periods') {
              <div class="space-y-4">
                @if (periods().length === 0) {
                  <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                    {{ 'performance.no_periods' | translate }}
                  </div>
                } @else {
                  @for (period of periods(); track period.id) {
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div>
                        <div class="font-medium text-slate-900 dark:text-white">{{ period.name }}</div>
                        <div class="text-sm text-slate-500 dark:text-slate-400">{{ period.startDate | date:'mediumDate' }} - {{ period.endDate | date:'mediumDate' }}</div>
                      </div>
                      <div class="flex items-center gap-4">
                        <span [class]="getPeriodStatusClass(period.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ 'performance.status_' + period.status.toLowerCase() | translate }}
                        </span>
                      </div>
                    </div>
                  }
                }
              </div>
            }
            @case ('evaluations') {
              <div class="space-y-4">
                @if (evaluations().length === 0) {
                  <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                    {{ 'performance.no_evaluations' | translate }}
                  </div>
                } @else {
                  @for (evaluation of evaluations(); track evaluation.id) {
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <span class="text-purple-600 dark:text-purple-400 font-medium">{{ evaluation.employeeName?.charAt(0) || 'U' }}</span>
                        </div>
                        <div>
                          <div class="font-medium text-slate-900 dark:text-white">{{ evaluation.employeeName }}</div>
                          <div class="text-sm text-slate-500 dark:text-slate-400">{{ evaluation.periodName }}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-4">
                        @if (evaluation.overallScore !== undefined) {
                          <div class="text-lg font-bold text-cyan-500">{{ evaluation.overallScore | number:'1.1' }}</div>
                        }
                        <span [class]="getEvaluationStatusClass(evaluation.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ 'performance.status_' + evaluation.status.toLowerCase() | translate }}
                        </span>
                      </div>
                    </div>
                  }
                }
              </div>
            }
            @case ('criteria') {
              <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                {{ 'performance.criteria_management' | translate }}
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class PerformanceComponent implements OnInit {
    private performanceService = inject(PerformanceEvaluationService);

    activeTab = signal<'periods' | 'evaluations' | 'criteria'>('periods');
    periods = signal<EvaluationPeriodDto[]>([]);
    evaluations = signal<PerformanceEvaluationDto[]>([]);

    activePeriods = signal(0);
    pendingReviews = signal(0);
    completedReviews = signal(0);
    averageScore = signal(0);

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.performanceService.getPeriods().subscribe({
            next: (data) => {
                this.periods.set(data);
                this.activePeriods.set(data.filter(p => p.status === 'Active').length);
            }
        });
        this.performanceService.getEvaluations().subscribe({
            next: (data) => {
                this.evaluations.set(data);
                this.pendingReviews.set(data.filter(e => e.status === 'Pending').length);
                this.completedReviews.set(data.filter(e => e.status === 'Completed').length);
                const completed = data.filter(e => e.overallScore !== undefined);
                if (completed.length > 0) {
                    const avg = completed.reduce((sum, e) => sum + (e.overallScore || 0), 0) / completed.length;
                    this.averageScore.set(avg);
                }
            }
        });
    }

    getPeriodStatusClass(status: string): string {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Closed': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    }

    getEvaluationStatusClass(status: string): string {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'InProgress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    }
}
