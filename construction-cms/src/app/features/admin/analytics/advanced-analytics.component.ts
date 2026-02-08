import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService, ChartData, KPIDashboard } from '../../../core/services/analytics.service';

@Component({
    selector: 'app-advanced-analytics',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              {{ 'admin.advanced_analytics' | translate }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ 'admin.advanced_analytics_desc' | translate }}
            </p>
          </div>
          <div class="flex gap-4">
            <button (click)="refreshAll()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
              {{ 'admin.refresh' | translate }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Analytics Dashboard -->
        @if (!isLoading) {
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {{ 'admin.total_kpis' | translate }}
              </p>
              <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {{ kpiDashboard?.kpis?.length || 0 }}
              </span>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {{ 'admin.on_target' | translate }}
              </p>
              <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                {{ kpiDashboard?.categorySummary?.[0]?.onTarget || 0 }}
              </span>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {{ 'admin.warning' | translate }}
              </p>
              <span class="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tighter">
                {{ kpiDashboard?.categorySummary?.[0]?.warning || 0 }}
              </span>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {{ 'admin.critical' | translate }}
              </p>
              <span class="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">
                {{ kpiDashboard?.categorySummary?.[0]?.critical || 0 }}
              </span>
            </div>
          </div>

          <!-- KPI Alerts -->
          @if (kpiDashboard && kpiDashboard.alerts && kpiDashboard.alerts.length > 0) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden mb-10">
              <div class="p-8 border-b border-slate-100 dark:border-white/5">
                <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
                  {{ 'admin.kpi_alerts' | translate }}
                </h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ 'admin.kpi_alerts_desc' | translate }}
                </p>
              </div>
              <div class="p-6 space-y-4">
                @for (alert of kpiDashboard!.alerts; track alert.id) {
                  <div 
                    [ngClass]="alert.alertType === 'Critical' 
                      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' 
                      : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'"
                    class="p-4 rounded-xl border-2">
                    <div class="flex items-start justify-between">
                      <div>
                        <span class="text-sm font-black text-slate-900 dark:text-white block mb-1">
                          {{ alert.kpiName }}
                        </span>
                        <span class="text-xs text-slate-600 dark:text-slate-400 block mb-2">
                          {{ alert.message }}
                        </span>
                        <div class="flex items-center gap-4">
                          <span class="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {{ 'admin.current' | translate }}: <span class="font-black">{{ alert.currentValue }}</span>
                          </span>
                          <span class="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {{ 'admin.threshold' | translate }}: <span class="font-black">{{ alert.threshold }}</span>
                          </span>
                        </div>
                      </div>
                      <span 
                        [ngClass]="alert.alertType === 'Critical' 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-amber-600 text-white'"
                        class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        {{ alert.alertType }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Custom Query Builder -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden mb-10">
            <div class="p-8 border-b border-slate-100 dark:border-white/5">
              <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
                {{ 'admin.custom_query_builder' | translate }}
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ 'admin.custom_query_builder_desc' | translate }}
              </p>
            </div>
            <div class="p-8 space-y-6">
              <!-- Data Source Selection -->
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  {{ 'admin.data_source' | translate }}
                </label>
                <select 
                  [(ngModel)]="queryConfig.dataSource"
                  (change)="loadChartData()"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="revenue">{{ 'admin.revenue' | translate }}</option>
                  <option value="costs">{{ 'admin.costs' | translate }}</option>
                  <option value="profit">{{ 'admin.profit' | translate }}</option>
                  <option value="projects">{{ 'admin.projects' | translate }}</option>
                  <option value="resources">{{ 'admin.resources' | translate }}</option>
                </select>
              </div>

              <!-- Chart Type Selection -->
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  {{ 'admin.chart_type' | translate }}
                </label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  @for (chartType of chartTypes; track chartType.value) {
                    <button 
                      (click)="queryConfig.chartType = chartType.value; loadChartData()"
                      [ngClass]="queryConfig.chartType === chartType.value 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500'"
                      class="p-4 rounded-xl border-2 transition-all text-center">
                      <span class="text-2xl mb-2 block">{{ chartType.icon }}</span>
                      <span class="text-xs font-black uppercase tracking-widest">{{ chartType.label }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Date Range -->
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  {{ 'admin.date_range' | translate }}
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {{ 'admin.start_date' | translate }}
                    </label>
                    <input 
                      type="date" 
                      [(ngModel)]="queryConfig.startDate"
                      (change)="loadChartData()"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {{ 'admin.end_date' | translate }}
                    </label>
                    <input 
                      type="date" 
                      [(ngModel)]="queryConfig.endDate"
                      (change)="loadChartData()"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                  </div>
                </div>
              </div>

              <!-- Chart Preview -->
              @if (chartData) {
                <div class="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-8">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white mb-6">
                    {{ chartData.title }}
                  </h3>
                  <div class="space-y-4">
                    @for (dataset of chartData.datasets; track dataset.label) {
                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {{ dataset.label }}
                          </span>
                          <span class="text-sm font-black text-slate-900 dark:text-white">
                            {{ dataset.data[0] | number }}
                          </span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                          <div 
                            [style.width.%]="(dataset.data[0] / 100) * 100"
                            [style.background-color]="dataset.borderColor"
                            class="h-3 rounded-full transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- KPI Results -->
          @if (kpiDashboard && kpiDashboard.recentResults && kpiDashboard.recentResults.length > 0) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
              <div class="p-8 border-b border-slate-100 dark:border-white/5">
                <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">
                  {{ 'admin.recent_kpi_results' | translate }}
                </h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ 'admin.recent_kpi_results_desc' | translate }}
                </p>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-slate-50 dark:bg-slate-950/50">
                    <tr>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {{ 'admin.kpi' | translate }}
                      </th>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {{ 'admin.date' | translate }}
                      </th>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {{ 'admin.value' | translate }}
                      </th>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {{ 'admin.target' | translate }}
                      </th>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {{ 'admin.status' | translate }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (result of kpiDashboard!.recentResults; track result.id) {
                      <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                        <td class="px-6 py-4">
                          <span class="text-sm font-black text-slate-900 dark:text-white">
                            {{ result.kpiName }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span class="text-sm text-slate-600 dark:text-slate-400">
                            {{ formatDate(result.date) }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span class="text-sm font-black text-slate-900 dark:text-white">
                            {{ result.value }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span class="text-sm text-slate-600 dark:text-slate-400">
                            {{ result.targetValue }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span 
                            [ngClass]="result.status === 'OnTarget' 
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                              : result.status === 'Warning' 
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                              : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'"
                            class="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                            {{ result.status }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
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
export class AdvancedAnalyticsComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);

    kpiDashboard: KPIDashboard | null = null;
    chartData: ChartData | null = null;

    queryConfig = {
        dataSource: 'revenue',
        chartType: 'line',
        startDate: '',
        endDate: ''
    };

    chartTypes = [
        { value: 'line', label: 'Line', icon: '📈' },
        { value: 'bar', label: 'Bar', icon: '📊' },
        { value: 'pie', label: 'Pie', icon: '🥧' },
        { value: 'area', label: 'Area', icon: '📉' }
    ];

    isLoading = false;

    ngOnInit() {
        this.loadKPIDashboard();
        this.setDefaultDateRange();
        this.loadChartData();
    }

    loadKPIDashboard() {
        this.isLoading = true;
        this.analyticsService.getKPIDashboard().subscribe({
            next: (data) => {
                this.kpiDashboard = data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading KPI dashboard:', error);
                this.isLoading = false;
            }
        });
    }

    loadChartData() {
        this.analyticsService.getChartData(
            this.queryConfig.chartType,
            this.queryConfig.dataSource,
            this.queryConfig.startDate,
            this.queryConfig.endDate
        ).subscribe({
            next: (data) => {
                this.chartData = data;
            },
            error: (error) => {
                console.error('Error loading chart data:', error);
            }
        });
    }

    setDefaultDateRange() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        this.queryConfig.startDate = startDate.toISOString().split('T')[0];
        this.queryConfig.endDate = endDate.toISOString().split('T')[0];
    }

    refreshAll() {
        this.loadKPIDashboard();
        this.loadChartData();
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString();
    }
}
