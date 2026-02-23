import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Enums
export enum ReportFormat {
    Excel = 0,
    Pdf = 1,
    Csv = 2
}

export enum CashFlowGrouping {
    Daily = 0,
    Weekly = 1,
    Monthly = 2,
    Quarterly = 3,
    Yearly = 4
}

export enum ProfitLossGrouping {
    ByProject = 0,
    ByCategory = 1,
    ByPhase = 2,
    ByMonth = 3
}

// Request DTOs
export interface FinancialReportRequest {
    companyId: number;
    startDate: Date | string;
    endDate: Date | string;
    format?: ReportFormat;
    language?: string;
}

export interface ProjectFinancialReportRequest extends FinancialReportRequest {
    projectId: number;
    includeTransactions?: boolean;
    includeInvoices?: boolean;
    includeClientPayments?: boolean;
    includeProfitability?: boolean;
}

export interface CashFlowReportRequest extends FinancialReportRequest {
    grouping?: CashFlowGrouping;
    projectIds?: number[];
}

export interface ProfitLossReportRequest extends FinancialReportRequest {
    grouping?: ProfitLossGrouping;
}

export interface TaxReportRequest extends FinancialReportRequest {
    taxType?: string;
}

// Data DTOs
export interface FinancialReportData {
    reportTitle: string;
    companyName: string;
    generatedAt: Date;
    startDate: Date;
    endDate: Date;
    currency: string;
    language: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    revenueItems: RevenueItem[];
    expenseItems: ExpenseItem[];
    cashFlowItems: CashFlowItem[];
}

export interface ProjectFinancialReportData extends FinancialReportData {
    projectId: number;
    projectName: string;
    projectStatus: string;
    projectBudget: number;
    budgetUsed: number;
    budgetRemaining: number;
    budgetUtilizationPercent: number;
    transactions: ProjectTransactionItem[];
    invoices: ProjectInvoiceItem[];
    clientPayments: ProjectClientPaymentItem[];
    profitabilityByPhase: ProjectProfitabilityItem[];
}

export interface CashFlowReportData {
    reportTitle: string;
    companyName: string;
    generatedAt: Date;
    startDate: Date;
    endDate: Date;
    currency: string;
    openingBalance: number;
    totalInflows: number;
    totalOutflows: number;
    netCashFlow: number;
    closingBalance: number;
    periods: CashFlowPeriod[];
}

export interface ProfitLossReportData {
    reportTitle: string;
    companyName: string;
    generatedAt: Date;
    startDate: Date;
    endDate: Date;
    currency: string;
    grossRevenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    grossProfitMargin: number;
    operatingExpenses: number;
    operatingIncome: number;
    operatingMargin: number;
    otherIncome: number;
    otherExpenses: number;
    netIncome: number;
    netProfitMargin: number;
    revenueByCategory: RevenueCategory[];
    expensesByCategory: ExpenseCategory[];
    projectSummaries: ProjectProfitSummary[];
}

// Item DTOs
export interface RevenueItem {
    date: Date;
    source: string;
    description: string;
    projectName?: string;
    amount: number;
    reference?: string;
}

export interface ExpenseItem {
    date: Date;
    category: string;
    description: string;
    projectName?: string;
    amount: number;
    vendor?: string;
    reference?: string;
    status?: string;
}

export interface CashFlowItem {
    date: Date;
    type: string;
    category: string;
    description: string;
    amount: number;
    runningBalance: number;
}

export interface CashFlowPeriod {
    periodLabel: string;
    startDate: Date;
    endDate: Date;
    openingBalance: number;
    inflows: number;
    outflows: number;
    netCashFlow: number;
    closingBalance: number;
    details: CashFlowDetail[];
}

export interface CashFlowDetail {
    date: Date;
    description: string;
    type: string;
    amount: number;
}

export interface ProjectTransactionItem {
    date: Date;
    type: string;
    description: string;
    itemName?: string;
    amount: number;
    status: string;
    approvedBy?: string;
}

export interface ProjectInvoiceItem {
    id: number;
    date: Date;
    invoiceNumber: string;
    vendor?: string;
    amount: number;
    status: string;
    category?: string;
}

export interface ProjectClientPaymentItem {
    id: number;
    date: Date;
    paymentNumber: string;
    amount: number;
    paymentMethod: string;
    status: string;
    notes?: string;
}

export interface ProjectProfitabilityItem {
    phaseName: string;
    budgetedAmount: number;
    actualCost: number;
    variance: number;
    variancePercent: number;
    progressPercent: number;
}

export interface RevenueCategory {
    categoryName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
}

export interface ExpenseCategory {
    categoryName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
}

export interface ProjectProfitSummary {
    projectId: number;
    projectName: string;
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
}

@Injectable({
    providedIn: 'root'
})
export class FinancialReportService {
    private apiUrl = '/api/financial-reports';

    constructor(private http: HttpClient) { }

    // Financial Report
    generateFinancialReport(request: FinancialReportRequest): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/financial`, request, {
            responseType: 'blob'
        });
    }

    getFinancialReportPreview(request: FinancialReportRequest): Observable<FinancialReportData> {
        return this.http.post<FinancialReportData>(`${this.apiUrl}/financial/preview`, request);
    }

    // Project Financial Report
    generateProjectFinancialReport(request: ProjectFinancialReportRequest): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/project`, request, {
            responseType: 'blob'
        });
    }

    getProjectFinancialReportPreview(request: ProjectFinancialReportRequest): Observable<ProjectFinancialReportData> {
        return this.http.post<ProjectFinancialReportData>(`${this.apiUrl}/project/preview`, request);
    }

    // Cash Flow Report
    generateCashFlowReport(request: CashFlowReportRequest): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/cash-flow`, request, {
            responseType: 'blob'
        });
    }

    getCashFlowReportPreview(request: CashFlowReportRequest): Observable<CashFlowReportData> {
        return this.http.post<CashFlowReportData>(`${this.apiUrl}/cash-flow/preview`, request);
    }

    // Profit & Loss Report
    generateProfitLossReport(request: ProfitLossReportRequest): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/profit-loss`, request, {
            responseType: 'blob'
        });
    }

    getProfitLossReportPreview(request: ProfitLossReportRequest): Observable<ProfitLossReportData> {
        return this.http.post<ProfitLossReportData>(`${this.apiUrl}/profit-loss/preview`, request);
    }

    // Tax Report
    generateTaxReport(request: TaxReportRequest): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/tax`, request, {
            responseType: 'blob'
        });
    }

    // Helper to download blob as file
    downloadFile(blob: Blob, fileName: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
