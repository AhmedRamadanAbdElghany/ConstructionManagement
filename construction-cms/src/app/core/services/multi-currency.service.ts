import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Currency DTOs ─────────────────────────────────────────────────────────────

export interface CurrencyDto {
    id: number;
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
    isActive: boolean;
    isDefault: boolean;
    formatPattern?: string;
}

export interface CreateCurrencyRequest {
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
    isDefault: boolean;
    formatPattern?: string;
}

export interface UpdateCurrencyRequest {
    name: string;
    symbol: string;
    decimalPlaces: number;
    isActive: boolean;
    formatPattern?: string;
}

// ── Exchange Rate DTOs ────────────────────────────────────────────────────────

export interface ExchangeRateDto {
    id: number;
    fromCurrencyId: number;
    fromCurrencyCode: string;
    fromCurrencySymbol: string;
    toCurrencyId: number;
    toCurrencyCode: string;
    toCurrencySymbol: string;
    rate: number;
    effectiveDate: string;
    expiryDate?: string;
    source?: string;
    isActive: boolean;
}

export interface CreateExchangeRateRequest {
    fromCurrencyId: number;
    toCurrencyId: number;
    rate: number;
    effectiveDate: string;
    expiryDate?: string;
    source?: string;
}

export interface UpdateExchangeRateRequest {
    rate: number;
    effectiveDate: string;
    expiryDate?: string;
    isActive: boolean;
}

export interface BulkExchangeRateRequest {
    baseCurrencyId: number;
    rates: ExchangeRateEntry[];
}

export interface ExchangeRateEntry {
    currencyCode: string;
    rate: number;
}

export interface ExchangeRateHistoryDto {
    fromCurrency: string;
    toCurrency: string;
    history: RateHistoryEntry[];
}

export interface RateHistoryEntry {
    date: string;
    rate: number;
    source?: string;
}

// ── Currency Conversion DTOs ──────────────────────────────────────────────────

export interface ConvertCurrencyRequest {
    amount: number;
    fromCurrencyId: number;
    toCurrencyId: number;
    asOfDate?: string;
}

export interface ConvertCurrencyResponse {
    originalAmount: number;
    originalCurrency: string;
    originalCurrencySymbol: string;
    convertedAmount: number;
    targetCurrency: string;
    targetCurrencySymbol: string;
    appliedRate: number;
    rateEffectiveDate: string;
    formattedOriginal: string;
    formattedConverted: string;
}

export interface MultiCurrencyAmountDto {
    amount: number;
    currencyId: number;
    currencyCode: string;
    currencySymbol: string;
    baseCurrencyAmount?: number;
    baseCurrencyCode?: string;
    appliedRate?: number;
    formatted: string;
    formattedInBaseCurrency?: string;
}

// ── Company Currency Settings DTOs ────────────────────────────────────────────

export interface CompanyCurrencySettingsDto {
    companyId: number;
    baseCurrencyId: number;
    baseCurrencyCode: string;
    baseCurrencySymbol: string;
    multiCurrencyEnabled: boolean;
    autoUpdateRates: boolean;
    rateUpdateFrequencyHours: number;
    preferredRateSource?: string;
    lastRateUpdate?: string;
    roundingMethod: string;
    roundingPrecision: number;
    enabledCurrencies: CurrencyDto[];
}

export interface UpdateCompanyCurrencySettingsRequest {
    baseCurrencyId: number;
    multiCurrencyEnabled: boolean;
    autoUpdateRates: boolean;
    rateUpdateFrequencyHours: number;
    preferredRateSource?: string;
    roundingMethod: string;
    roundingPrecision: number;
    enabledCurrencyIds: number[];
}

// ── Project Currency Budget DTOs ──────────────────────────────────────────────

export interface ProjectCurrencyBudgetDto {
    id: number;
    projectId: number;
    currencyId: number;
    currencyCode: string;
    currencySymbol: string;
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    isPrimary: boolean;
    formattedBudget: string;
    formattedSpent: string;
    formattedRemaining: string;
}

export interface CreateProjectCurrencyBudgetRequest {
    projectId: number;
    currencyId: number;
    budgetAmount: number;
    isPrimary: boolean;
}

export interface UpdateProjectCurrencyBudgetRequest {
    budgetAmount: number;
    isPrimary: boolean;
}

// ── Currency Report DTOs ──────────────────────────────────────────────────────

export interface CurrencySummaryDto {
    currencyCode: string;
    currencySymbol: string;
    totalAmount: number;
    totalInBaseCurrency: number;
    currentRate: number;
    transactionCount: number;
    formattedTotal: string;
    formattedTotalInBaseCurrency: string;
}

export interface MultiCurrencyReportDto {
    companyId: number;
    baseCurrencyCode: string;
    reportDate: string;
    currencySummaries: CurrencySummaryDto[];
    grandTotalInBaseCurrency: number;
    formattedGrandTotal: string;
}

export interface CurrencyConversionLogDto {
    id: number;
    companyId: number;
    fromCurrencyId: number;
    toCurrencyId: number;
    originalAmount: number;
    convertedAmount: number;
    appliedRate: number;
    entityType: string;
    entityId: number;
    convertedAt: string;
    convertedByUserId: number;
}

@Injectable({
    providedIn: 'root'
})
export class MultiCurrencyService {
    private http = inject(HttpClient);
    private baseUrl = '/api/currencies';

    // ── Currency Management ─────────────────────────────────────────────────────

    getCurrencies(): Observable<CurrencyDto[]> {
        return this.http.get<CurrencyDto[]>(this.baseUrl);
    }

    getCurrency(id: number): Observable<CurrencyDto> {
        return this.http.get<CurrencyDto>(`${this.baseUrl}/${id}`);
    }

    getCurrencyByCode(code: string): Observable<CurrencyDto> {
        return this.http.get<CurrencyDto>(`${this.baseUrl}/code/${code}`);
    }

    createCurrency(request: CreateCurrencyRequest): Observable<CurrencyDto> {
        return this.http.post<CurrencyDto>(this.baseUrl, request);
    }

    updateCurrency(id: number, request: UpdateCurrencyRequest): Observable<CurrencyDto> {
        return this.http.put<CurrencyDto>(`${this.baseUrl}/${id}`, request);
    }

    deleteCurrency(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    setDefaultCurrency(id: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${id}/set-default`, {});
    }

    // ── Exchange Rates ──────────────────────────────────────────────────────────

    getAllExchangeRates(): Observable<ExchangeRateDto[]> {
        return this.http.get<ExchangeRateDto[]>(`${this.baseUrl}/rates`);
    }

    getExchangeRate(fromCurrencyId: number, toCurrencyId: number, asOfDate?: string): Observable<ExchangeRateDto> {
        let params = new HttpParams();
        if (asOfDate) params = params.set('asOfDate', asOfDate);
        return this.http.get<ExchangeRateDto>(`${this.baseUrl}/rates/${fromCurrencyId}/${toCurrencyId}`, { params });
    }

    getExchangeRatesForCurrency(currencyId: number): Observable<ExchangeRateDto[]> {
        return this.http.get<ExchangeRateDto[]>(`${this.baseUrl}/${currencyId}/rates`);
    }

    setExchangeRate(request: CreateExchangeRateRequest): Observable<ExchangeRateDto> {
        return this.http.post<ExchangeRateDto>(`${this.baseUrl}/rates`, request);
    }

    bulkSetExchangeRates(request: BulkExchangeRateRequest): Observable<ExchangeRateDto[]> {
        return this.http.post<ExchangeRateDto[]>(`${this.baseUrl}/rates/bulk`, request);
    }

    updateExchangeRate(id: number, request: UpdateExchangeRateRequest): Observable<ExchangeRateDto> {
        return this.http.put<ExchangeRateDto>(`${this.baseUrl}/rates/${id}`, request);
    }

    deleteExchangeRate(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/rates/${id}`);
    }

    getExchangeRateHistory(
        fromCurrencyId: number,
        toCurrencyId: number,
        startDate: string,
        endDate: string
    ): Observable<ExchangeRateHistoryDto> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<ExchangeRateHistoryDto>(
            `${this.baseUrl}/rates/history/${fromCurrencyId}/${toCurrencyId}`,
            { params }
        );
    }

    fetchLatestRates(baseCurrencyId: number, source?: string): Observable<ExchangeRateDto[]> {
        let params = new HttpParams();
        if (source) params = params.set('source', source);
        return this.http.post<ExchangeRateDto[]>(`${this.baseUrl}/rates/fetch/${baseCurrencyId}`, {}, { params });
    }

    // ── Currency Conversion ─────────────────────────────────────────────────────

    convert(request: ConvertCurrencyRequest): Observable<ConvertCurrencyResponse> {
        return this.http.post<ConvertCurrencyResponse>(`${this.baseUrl}/convert`, request);
    }

    convertToBaseCurrency(companyId: number, request: ConvertCurrencyRequest): Observable<ConvertCurrencyResponse> {
        let params = new HttpParams().set('companyId', companyId.toString());
        return this.http.post<ConvertCurrencyResponse>(`${this.baseUrl}/convert-to-base`, request, { params });
    }

    formatAmount(currencyId: number, amount: number): Observable<string> {
        return this.http.get(`${this.baseUrl}/format/${currencyId}/${amount}`, { responseType: 'text' });
    }

    // ── Company Settings ────────────────────────────────────────────────────────

    getCompanySettings(companyId: number): Observable<CompanyCurrencySettingsDto> {
        return this.http.get<CompanyCurrencySettingsDto>(`${this.baseUrl}/company/${companyId}/settings`);
    }

    updateCompanySettings(companyId: number, request: UpdateCompanyCurrencySettingsRequest): Observable<CompanyCurrencySettingsDto> {
        return this.http.put<CompanyCurrencySettingsDto>(`${this.baseUrl}/company/${companyId}/settings`, request);
    }

    enableMultiCurrency(companyId: number, baseCurrencyId: number): Observable<CompanyCurrencySettingsDto> {
        let params = new HttpParams().set('baseCurrencyId', baseCurrencyId.toString());
        return this.http.post<CompanyCurrencySettingsDto>(`${this.baseUrl}/company/${companyId}/enable`, {}, { params });
    }

    // ── Project Budget ──────────────────────────────────────────────────────────

    getProjectBudgets(projectId: number): Observable<ProjectCurrencyBudgetDto[]> {
        return this.http.get<ProjectCurrencyBudgetDto[]>(`${this.baseUrl}/project/${projectId}/budgets`);
    }

    createProjectBudget(request: CreateProjectCurrencyBudgetRequest): Observable<ProjectCurrencyBudgetDto> {
        return this.http.post<ProjectCurrencyBudgetDto>(`${this.baseUrl}/project/budgets`, request);
    }

    updateProjectBudget(id: number, request: UpdateProjectCurrencyBudgetRequest): Observable<ProjectCurrencyBudgetDto> {
        return this.http.put<ProjectCurrencyBudgetDto>(`${this.baseUrl}/project/budgets/${id}`, request);
    }

    deleteProjectBudget(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/project/budgets/${id}`);
    }

    // ── Reports ─────────────────────────────────────────────────────────────────

    getCurrencySummary(companyId: number, asOfDate?: string): Observable<MultiCurrencyReportDto> {
        let params = new HttpParams();
        if (asOfDate) params = params.set('asOfDate', asOfDate);
        return this.http.get<MultiCurrencyReportDto>(`${this.baseUrl}/company/${companyId}/summary`, { params });
    }

    getConversionLogs(
        companyId: number,
        startDate?: string,
        endDate?: string,
        currencyId?: number
    ): Observable<CurrencyConversionLogDto[]> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        if (currencyId) params = params.set('currencyId', currencyId.toString());
        return this.http.get<CurrencyConversionLogDto[]>(`${this.baseUrl}/company/${companyId}/conversion-logs`, { params });
    }
}
