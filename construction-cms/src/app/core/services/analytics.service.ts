import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardSummary {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    delayedProjects: number;
    averageProgress: number;
    projectHealthScore: number;
    totalRevenue: number;
    totalCosts: number;
    grossProfit: number;
    profitMargin: number;
    pendingInvoices: number;
    overduePayments: number;
    laborUtilization: number;
    equipmentUtilization: number;
    activeWorkers: number;
    openPositions: number;
    qualityScore: number;
    openDefects: number;
    safetyIncidents: number;
    safetyScore: number;
    revenueTrend?: TrendDataPoint[];
    progressTrend?: TrendDataPoint[];
    costTrend?: TrendDataPoint[];
}

export interface TrendDataPoint {
    period: string;
    date: string;
    value: number;
    label?: string;
}

export interface FinancialAnalytics {
    totalRevenue: number;
    totalCosts: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    operatingMargin: number;
    invoicedAmount: number;
    collectedAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    collectionRate: number;
    laborCosts: number;
    materialCosts: number;
    equipmentCosts: number;
    subcontractorCosts: number;
    overheadCosts: number;
    projectSummaries?: ProjectFinancialSummary[];
    monthlyRevenue?: FinancialTrendData[];
    monthlyCosts?: FinancialTrendData[];
    monthlyProfit?: FinancialTrendData[];
    currentRatio: number;
    debtToEquity: number;
    returnOnInvestment: number;
}

export interface ProjectFinancialSummary {
    projectId: number;
    projectName: string;
    budget: number;
    actualCost: number;
    variance: number;
    invoiced: number;
    collected: number;
    pending: number;
    revenue: number;
    profit: number;
    profitMargin: number;
    costPerformanceIndex: number;
    schedulePerformanceIndex: number;
}

export interface FinancialTrendData {
    year: number;
    month: number;
    monthName: string;
    amount: number;
    cumulative: number;
    percentageChange: number;
}

export interface ResourceAnalytics {
    totalWorkers: number;
    activeWorkers: number;
    totalLaborHours: number;
    averageUtilization: number;
    productivityIndex: number;
    laborCostPerHour: number;
    totalLaborCost: number;
    totalEquipment: number;
    activeEquipment: number;
    equipmentUtilization: number;
    equipmentCost: number;
    maintenanceCost: number;
    projectResources?: ProjectResourceSummary[];
    utilizationTrend?: ResourceTrendData[];
    productivityTrend?: ResourceTrendData[];
    topWorkers?: WorkerPerformance[];
    topEquipment?: EquipmentPerformance[];
}

export interface ProjectResourceSummary {
    projectId: number;
    projectName: string;
    workerCount: number;
    laborHours: number;
    utilizationRate: number;
    laborCost: number;
    equipmentCount: number;
    equipmentHours: number;
    equipmentUtilization: number;
    equipmentCost: number;
}

export interface ResourceTrendData {
    date: string;
    period: string;
    value: number;
    target: number;
}

export interface WorkerPerformance {
    workerId: string;
    workerName: string;
    role: string;
    hoursWorked: number;
    productivity: number;
    qualityScore: number;
    tasksCompleted: number;
}

export interface EquipmentPerformance {
    equipmentId: number;
    equipmentName: string;
    type: string;
    utilizationRate: number;
    operatingHours: number;
    maintenanceHours: number;
    downtimeHours: number;
    costPerHour: number;
}

export interface KPIDashboard {
    kpis: KPIDefinition[];
    recentResults: KPIResult[];
    categorySummary: KPISummaryByCategory[];
    alerts: KPIAlert[];
}

export interface KPIDefinition {
    id: number;
    name: string;
    description: string;
    category: string;
    metricType: string;
    currentValue: number;
    targetValue?: string;
    status: string;
    variance: number;
    trend: string;
    displayFormat: string;
    displayPrecision: number;
}

export interface KPIResult {
    id: number;
    kpiDefinitionId: number;
    kpiName: string;
    date: string;
    value: number;
    targetValue?: string;
    status: string;
    variance: number;
}

export interface KPISummaryByCategory {
    category: string;
    totalKPIs: number;
    onTarget: number;
    warning: number;
    critical: number;
    averageValue: number;
    averageTarget: number;
}

export interface KPIAlert {
    id: number;
    kpiDefinitionId: number;
    kpiName: string;
    alertType: string;
    message: string;
    currentValue: number;
    threshold: string;
    createdAt: string;
}

export interface ChartData {
    chartType: string;
    title: string;
    datasets: ChartDataset[];
    labels: ChartLabel[];
    options?: ChartOptions;
}

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth: number;
    fill: boolean;
    backgroundColors?: string[];
    borderColors?: string[];
}

export interface ChartLabel {
    label: string;
    value?: string;
}

export interface ChartOptions {
    responsive: boolean;
    maintainAspectRatio: boolean;
    legendPosition?: string;
    showLegend: boolean;
    showLabels: boolean;
    xAxisTitle?: string;
    yAxisTitle?: string;
    yAxisMin?: number;
    yAxisMax?: number;
}

export interface ReportDefinition {
    id: number;
    companyId: number;
    name: string;
    description: string;
    reportType: string;
    category: string;
    isPublic: boolean;
    isScheduled: boolean;
    scheduleFrequency?: string;
    lastRunAt?: string;
    runCount: number;
    createdBy: string;
    createdAt: string;
}

export interface CreateReportDefinitionRequest {
    name: string;
    description: string;
    reportType: string;
    category: string;
    configuration: string;
    columns: string;
    filters: string;
    groupBy: string;
    sortBy: string;
    sortOrder: string;
    isPublic: boolean;
    isScheduled: boolean;
    scheduleFrequency?: string;
    scheduleCron?: string;
}

export interface ExecuteReportRequest {
    reportDefinitionId: number;
    startDate?: string;
    endDate?: string;
    parameters: string;
    format: string;
    page?: number;
    pageSize?: number;
}

export interface ReportDataResult {
    data: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    executionTimeMs: number;
    columns?: ReportColumnInfo[];
}

export interface ReportColumnInfo {
    name: string;
    displayName: string;
    dataType: string;
    isNullable: boolean;
    isVisible: boolean;
    sortOrder: number;
    format?: string;
    width?: number;
}

export interface ExportResult {
    success: boolean;
    filePath?: string;
    fileName?: string;
    contentType?: string;
    fileContent?: Blob;
    fileSize: number;
    errorMessage?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private apiUrl = 'api/analytics';
    private http = inject(HttpClient);

    // Dashboard
    getDashboardSummary(startDate?: string, endDate?: string): Observable<DashboardSummary> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard`, { params });
    }

    // Financial Analytics
    getFinancialAnalytics(startDate?: string, endDate?: string): Observable<FinancialAnalytics> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<FinancialAnalytics>(`${this.apiUrl}/financial`, { params });
    }

    getProjectFinancialSummaries(startDate?: string, endDate?: string): Observable<ProjectFinancialSummary[]> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<ProjectFinancialSummary[]>(`${this.apiUrl}/financial/project-summaries`, { params });
    }

    getFinancialTrends(period: string = 'Monthly', periods: number = 12): Observable<FinancialTrendData[]> {
        const params = new HttpParams()
            .set('period', period)
            .set('periods', periods.toString());
        return this.http.get<FinancialTrendData[]>(`${this.apiUrl}/financial/trends`, { params });
    }

    // Resource Analytics
    getResourceAnalytics(startDate?: string, endDate?: string): Observable<ResourceAnalytics> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<ResourceAnalytics>(`${this.apiUrl}/resources`, { params });
    }

    getProjectResourceUtilization(startDate?: string, endDate?: string): Observable<ProjectResourceSummary[]> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<ProjectResourceSummary[]>(`${this.apiUrl}/resources/project-utilization`, { params });
    }

    getWorkerPerformance(topN: number = 10, startDate?: string, endDate?: string): Observable<WorkerPerformance[]> {
        let params = new HttpParams().set('topN', topN.toString());
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<WorkerPerformance[]>(`${this.apiUrl}/resources/worker-performance`, { params });
    }

    getEquipmentPerformance(topN: number = 10): Observable<EquipmentPerformance[]> {
        const params = new HttpParams().set('topN', topN.toString());
        return this.http.get<EquipmentPerformance[]>(`${this.apiUrl}/resources/equipment-performance`, { params });
    }

    // KPI Analytics
    getKPIDashboard(): Observable<KPIDashboard> {
        return this.http.get<KPIDashboard>(`${this.apiUrl}/kpi`);
    }

    getKPIDefinitions(): Observable<KPIDefinition[]> {
        return this.http.get<KPIDefinition[]>(`${this.apiUrl}/kpi/definitions`);
    }

    getKPIResults(kpiDefinitionId: number, periods: number = 12): Observable<KPIResult[]> {
        const params = new HttpParams().set('periods', periods.toString());
        return this.http.get<KPIResult[]>(`${this.apiUrl}/kpi/${kpiDefinitionId}/results`, { params });
    }

    calculateKPIResults(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/kpi/calculate`, {});
    }

    // Chart Data
    getChartData(chartType: string, dataSource: string, startDate?: string, endDate?: string): Observable<ChartData> {
        let params = new HttpParams()
            .set('chartType', chartType)
            .set('dataSource', dataSource);
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<ChartData>(`${this.apiUrl}/charts/${chartType}`, { params });
    }

    getRevenueChartData(periods: number = 12): Observable<ChartData> {
        const params = new HttpParams().set('periods', periods.toString());
        return this.http.get<ChartData>(`${this.apiUrl}/charts/revenue`, { params });
    }

    getProjectProgressChartData(): Observable<ChartData> {
        return this.http.get<ChartData>(`${this.apiUrl}/charts/project-progress`);
    }

    getResourceUtilizationChartData(): Observable<ChartData> {
        return this.http.get<ChartData>(`${this.apiUrl}/charts/resource-utilization`);
    }

    getCostBreakdownChartData(): Observable<ChartData> {
        return this.http.get<ChartData>(`${this.apiUrl}/charts/cost-breakdown`);
    }

    // Report Definitions
    getReportDefinitions(): Observable<ReportDefinition[]> {
        return this.http.get<ReportDefinition[]>(`${this.apiUrl}/reports`);
    }

    getReportDefinition(reportId: number): Observable<ReportDefinition> {
        return this.http.get<ReportDefinition>(`${this.apiUrl}/reports/${reportId}`);
    }

    createReportDefinition(request: CreateReportDefinitionRequest): Observable<ReportDefinition> {
        return this.http.post<ReportDefinition>(`${this.apiUrl}/reports`, request);
    }

    updateReportDefinition(reportId: number, request: Partial<CreateReportDefinitionRequest>): Observable<ReportDefinition> {
        return this.http.put<ReportDefinition>(`${this.apiUrl}/reports/${reportId}`, request);
    }

    deleteReportDefinition(reportId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/reports/${reportId}`);
    }

    // Report Execution
    executeReport(request: ExecuteReportRequest): Observable<ReportDataResult> {
        return this.http.post<ReportDataResult>(`${this.apiUrl}/reports/execute`, request);
    }

    executeAndExportReport(request: ExecuteReportRequest): Observable<ExportResult> {
        return this.http.post<ExportResult>(`${this.apiUrl}/reports/export`, request);
    }

    getReportExecutionHistory(reportDefinitionId: number, count: number = 10): Observable<any[]> {
        const params = new HttpParams().set('count', count.toString());
        return this.http.get<any[]>(`${this.apiUrl}/reports/${reportDefinitionId}/executions`, { params });
    }

    // Export utilities
    downloadReport(request: ExecuteReportRequest): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/reports/export`, request, {
            responseType: 'blob'
        });
    }

    // Helper methods for formatting
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    formatPercentage(value: number, precision: number = 1): string {
        return `${value.toFixed(precision)}%`;
    }

    formatNumber(value: number, precision: number = 0): string {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        }).format(value);
    }

    formatCompactNumber(value: number): string {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
    }

    getStatusColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'ontarget':
            case 'success':
            case 'passed':
                return '#10B981';
            case 'warning':
                return '#F59E0B';
            case 'critical':
            case 'failed':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    }
}
