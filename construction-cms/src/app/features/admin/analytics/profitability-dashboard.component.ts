import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService, FinancialAnalytics, ProjectFinancialSummary } from '../../../core/services/analytics.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
    selector: 'app-profitability-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './profitability-dashboard.component.html',
    styleUrls: ['./profitability-dashboard.component.scss']
})
export class ProfitabilityDashboardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private analyticsService = inject(AnalyticsService);
    private i18nService = inject(I18nService);

    financialAnalytics: FinancialAnalytics | null = null;
    projectSummaries: ProjectFinancialSummary[] = [];
    isLoading = false;
    selectedPeriod = '30';

    ngOnInit() {
        this.loadFinancialAnalytics();

        // Subscribe to language changes to refresh data
        this.i18nService.onLanguageChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.loadFinancialAnalytics();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadFinancialAnalytics() {
        this.isLoading = true;
        const days = parseInt(this.selectedPeriod);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        this.analyticsService.getFinancialAnalytics(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        ).subscribe({
            next: (data) => {
                this.financialAnalytics = data;
                this.loadProjectSummaries(startDate, endDate);
            },
            error: (error) => {
                console.error('Error loading financial analytics:', error);
                this.isLoading = false;
            }
        });
    }

    loadProjectSummaries(startDate: Date, endDate: Date) {
        this.analyticsService.getProjectFinancialSummaries(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        ).subscribe({
            next: (data) => {
                this.projectSummaries = data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading project summaries:', error);
                this.isLoading = false;
            }
        });
    }

    formatCurrency(value: number): string {
        return this.analyticsService.formatCurrency(value);
    }

    formatPercentage(value: number): string {
        return this.analyticsService.formatPercentage(value);
    }
}
