import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TrainingService, TrainingProgramDto, TrainingEnrollmentDto, TrainingDashboardDto } from '../../../core/services/training.service';

@Component({
    selector: 'app-training',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ 'training.title' | translate }}</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">{{ 'training.subtitle' | translate }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'training.total_programs' | translate }}</div>
          <div class="text-2xl font-bold text-cyan-500">{{ dashboard().totalPrograms }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'training.active_enrollments' | translate }}</div>
          <div class="text-2xl font-bold text-amber-500">{{ dashboard().activeEnrollments }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'training.completed_this_month' | translate }}</div>
          <div class="text-2xl font-bold text-green-500">{{ dashboard().completedThisMonth }}</div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ 'training.overdue_trainings' | translate }}</div>
          <div class="text-2xl font-bold text-red-500">{{ dashboard().overdueTrainings }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="border-b border-slate-200 dark:border-slate-700">
          <nav class="flex -mb-px">
            <button (click)="activeTab.set('programs')" 
                    [class.border-cyan-500]="activeTab() === 'programs'"
                    [class.text-cyan-600]="activeTab() === 'programs'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'training.programs' | translate }}
            </button>
            <button (click)="activeTab.set('enrollments')" 
                    [class.border-cyan-500]="activeTab() === 'enrollments'"
                    [class.text-cyan-600]="activeTab() === 'enrollments'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'training.enrollments' | translate }}
            </button>
            <button (click)="activeTab.set('sessions')" 
                    [class.border-cyan-500]="activeTab() === 'sessions'"
                    [class.text-cyan-600]="activeTab() === 'sessions'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'training.sessions' | translate }}
            </button>
            <button (click)="activeTab.set('compliance')" 
                    [class.border-cyan-500]="activeTab() === 'compliance'"
                    [class.text-cyan-600]="activeTab() === 'compliance'"
                    class="px-6 py-4 text-sm font-medium border-b-2 transition-colors">
              {{ 'training.compliance' | translate }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          @switch (activeTab()) {
            @case ('programs') {
              <div class="space-y-4">
                @if (programs().length === 0) {
                  <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                    {{ 'training.no_programs' | translate }}
                  </div>
                } @else {
                  @for (program of programs(); track program.id) {
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                          </svg>
                        </div>
                        <div>
                          <div class="font-medium text-slate-900 dark:text-white">{{ program.title }}</div>
                          <div class="text-sm text-slate-500 dark:text-slate-400">{{ program.categoryName }}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="text-sm text-slate-500 dark:text-slate-400">{{ program.enrollmentCount }} {{ 'training.enrolled' | translate }}</span>
                        @if (program.isMandatory) {
                          <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {{ 'training.mandatory' | translate }}
                          </span>
                        }
                      </div>
                    </div>
                  }
                }
              </div>
            }
            @case ('enrollments') {
              <div class="space-y-4">
                @if (enrollments().length === 0) {
                  <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                    {{ 'training.no_enrollments' | translate }}
                  </div>
                } @else {
                  @for (enrollment of enrollments(); track enrollment.id) {
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                          <span class="text-cyan-600 dark:text-cyan-400 font-medium">{{ enrollment.userName?.charAt(0) || 'U' }}</span>
                        </div>
                        <div>
                          <div class="font-medium text-slate-900 dark:text-white">{{ enrollment.userName }}</div>
                          <div class="text-sm text-slate-500 dark:text-slate-400">{{ enrollment.trainingTitle }}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="w-24 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div class="bg-cyan-500 h-2 rounded-full" [style.width.%]="enrollment.progressPercentage"></div>
                        </div>
                        <span class="text-sm text-slate-500 dark:text-slate-400">{{ enrollment.progressPercentage }}%</span>
                        <span [class]="getEnrollmentStatusClass(enrollment.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ 'training.status_' + enrollment.status.toLowerCase() | translate }}
                        </span>
                      </div>
                    </div>
                  }
                }
              </div>
            }
            @case ('sessions') {
              <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                {{ 'training.sessions_management' | translate }}
              </div>
            }
            @case ('compliance') {
              <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                {{ 'training.compliance_report' | translate }}
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class TrainingComponent implements OnInit {
    private trainingService = inject(TrainingService);

    activeTab = signal<'programs' | 'enrollments' | 'sessions' | 'compliance'>('programs');
    programs = signal<TrainingProgramDto[]>([]);
    enrollments = signal<TrainingEnrollmentDto[]>([]);
    dashboard = signal<TrainingDashboardDto>({
        totalPrograms: 0,
        activeEnrollments: 0,
        completedThisMonth: 0,
        overdueTrainings: 0,
        upcomingSessions: 0,
        averageCompletionRate: 0,
        mandatoryTrainings: [],
        upcomingSessionList: [],
        categoryStats: []
    });

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.trainingService.getDashboard().subscribe({
            next: (data) => this.dashboard.set(data)
        });
        this.trainingService.getPrograms().subscribe({
            next: (data) => this.programs.set(data)
        });
        this.trainingService.getEnrollments().subscribe({
            next: (data) => this.enrollments.set(data)
        });
    }

    getEnrollmentStatusClass(status: string): string {
        switch (status) {
            case 'InProgress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    }
}
