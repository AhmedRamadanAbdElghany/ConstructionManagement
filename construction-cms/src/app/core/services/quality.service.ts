import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QualityStandard {
    id: number;
    name: string;
    description?: string;
    category: string;
    standardCode?: string;
    criteria?: string;
    acceptanceCriteria?: string;
    isActive: boolean;
}

export interface QualityInspection {
    id: number;
    projectId?: number;
    phaseId?: number;
    projectName?: string;
    phaseName?: string;
    inspectionNumber: string;
    title: string;
    description?: string;
    inspectionType: string;
    status: string;
    scheduledDate: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    inspectorName?: string;
    location?: string;
    overallResult?: string;
    score: number;
    totalItems: number;
    passedItems: number;
    failedItems: number;
}

export interface Defect {
    id: number;
    projectId?: number;
    phaseId?: number;
    projectName?: string;
    phaseName?: string;
    defectNumber: string;
    title: string;
    description?: string;
    category: string;
    severity: string;
    status: string;
    priority: string;
    location?: string;
    element?: string;
    reportedBy: string;
    reportedDate: Date;
    targetResolutionDate?: Date;
    actualResolutionDate?: Date;
    assignedTo?: string;
    rootCause?: string;
    correctiveAction?: string;
    estimatedCost: number;
    actualCost: number;
    isSafetyRelated: boolean;
    requiresRebork: boolean;
}

export interface PunchListItem {
    id: number;
    projectId?: number;
    phaseId?: number;
    projectName?: string;
    phaseName?: string;
    itemNumber: string;
    description: string;
    location?: string;
    area?: string;
    category: string;
    priority: string;
    status: string;
    assignedTo?: string;
    dueDate?: Date;
    completedDate?: Date;
    isSafetyItem: boolean;
    requiresReinspection: boolean;
    costEstimate: number;
    actualCost: number;
}

export interface QualityStatistics {
    totalInspections: number;
    completedInspections: number;
    scheduledInspections: number;
    totalDefects: number;
    openDefects: number;
    resolvedDefects: number;
    criticalDefects: number;
    majorDefects: number;
    minorDefects: number;
    totalPunchListItems: number;
    pendingPunchListItems: number;
    completedPunchListItems: number;
    averageInspectionScore: number;
    defectResolutionRate: number;
    punchListCompletionRate: number;
}

export interface CreateQualityStandardRequest {
    name: string;
    description?: string;
    category: string;
    standardCode?: string;
    criteria?: string;
    acceptanceCriteria?: string;
    isActive?: boolean;
}

export interface UpdateQualityStandardRequest {
    name?: string;
    description?: string;
    category?: string;
    standardCode?: string;
    criteria?: string;
    acceptanceCriteria?: string;
    isActive?: boolean;
}

export interface CreateQualityInspectionRequest {
    projectId?: number;
    phaseId?: number;
    title: string;
    description?: string;
    inspectionType: string;
    scheduledDate: Date;
    location?: string;
}

export interface UpdateQualityInspectionRequest {
    title?: string;
    description?: string;
    scheduledDate?: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    location?: string;
}

export interface CompleteInspectionRequest {
    overallResult: string;
    score: number;
    notes?: string;
}

export interface UpdateInspectionItemResultRequest {
    itemId: number;
    result: string;
    notes?: string;
}

export interface CreateDefectRequest {
    projectId?: number;
    phaseId?: number;
    title: string;
    description?: string;
    category: string;
    severity: string;
    priority: string;
    location?: string;
    element?: string;
    estimatedCost?: number;
    isSafetyRelated?: boolean;
    requiresRebork?: boolean;
}

export interface UpdateDefectRequest {
    title?: string;
    description?: string;
    category?: string;
    severity?: string;
    priority?: string;
    location?: string;
    element?: string;
    estimatedCost?: number;
    actualCost?: number;
}

export interface AssignDefectRequest {
    assignedTo: number;
    targetResolutionDate?: Date;
}

export interface ResolveDefectRequest {
    correctiveAction?: string;
    actualCost?: number;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class QualityService {
    private apiUrl = 'api/quality';

    constructor(private http: HttpClient) { }

    // Helper function to build HttpParams
    private buildParams(params: { [key: string]: any }): HttpParams {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                httpParams = httpParams.set(key, params[key].toString());
            }
        });
        return httpParams;
    }

    // --- Quality Standards ---

    getQualityStandards(companyId?: number): Observable<QualityStandard[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<QualityStandard[]>(`${this.apiUrl}/standards`, { params });
    }

    getQualityStandardById(id: number, companyId?: number): Observable<QualityStandard> {
        const params = this.buildParams({ companyId });
        return this.http.get<QualityStandard>(`${this.apiUrl}/standards/${id}`, { params });
    }

    createQualityStandard(request: CreateQualityStandardRequest, companyId?: number): Observable<QualityStandard> {
        const params = this.buildParams({ companyId });
        return this.http.post<QualityStandard>(`${this.apiUrl}/standards`, request, { params });
    }

    updateQualityStandard(id: number, request: UpdateQualityStandardRequest, companyId?: number): Observable<QualityStandard> {
        const params = this.buildParams({ companyId });
        return this.http.put<QualityStandard>(`${this.apiUrl}/standards/${id}`, request, { params });
    }

    deleteQualityStandard(id: number, companyId?: number): Observable<void> {
        const params = this.buildParams({ companyId });
        return this.http.delete<void>(`${this.apiUrl}/standards/${id}`, { params });
    }

    getQualityStandardsByCategory(category: string, companyId?: number): Observable<QualityStandard[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<QualityStandard[]>(`${this.apiUrl}/standards/category/${category}`, { params });
    }

    // --- Quality Inspections ---

    getInspections(companyId?: number, projectId?: number, phaseId?: number, status?: string): Observable<QualityInspection[]> {
        const params = this.buildParams({ companyId, projectId, phaseId, status });
        return this.http.get<QualityInspection[]>(`${this.apiUrl}/inspections`, { params });
    }

    getInspectionById(id: number, companyId?: number): Observable<QualityInspection> {
        const params = this.buildParams({ companyId });
        return this.http.get<QualityInspection>(`${this.apiUrl}/inspections/${id}`, { params });
    }

    createInspection(request: CreateQualityInspectionRequest, companyId?: number): Observable<QualityInspection> {
        const params = this.buildParams({ companyId });
        return this.http.post<QualityInspection>(`${this.apiUrl}/inspections`, request, { params });
    }

    updateInspection(id: number, request: UpdateQualityInspectionRequest, companyId?: number): Observable<QualityInspection> {
        const params = this.buildParams({ companyId });
        return this.http.put<QualityInspection>(`${this.apiUrl}/inspections/${id}`, request, { params });
    }

    deleteInspection(id: number, companyId?: number): Observable<void> {
        const params = this.buildParams({ companyId });
        return this.http.delete<void>(`${this.apiUrl}/inspections/${id}`, { params });
    }

    startInspection(id: number, companyId?: number): Observable<QualityInspection> {
        const params = this.buildParams({ companyId });
        return this.http.post<QualityInspection>(`${this.apiUrl}/inspections/${id}/start`, {}, { params });
    }

    completeInspection(id: number, request: CompleteInspectionRequest, companyId?: number): Observable<QualityInspection> {
        const params = this.buildParams({ companyId });
        return this.http.post<QualityInspection>(`${this.apiUrl}/inspections/complete`, request, { params });
    }

    updateInspectionItemResult(id: number, request: UpdateInspectionItemResultRequest, companyId?: number): Observable<any> {
        const params = this.buildParams({ companyId });
        return this.http.put(`${this.apiUrl}/inspections/items/result`, request, { params });
    }

    getUpcomingInspections(companyId?: number, days: number = 7): Observable<QualityInspection[]> {
        const params = this.buildParams({ companyId, days });
        return this.http.get<QualityInspection[]>(`${this.apiUrl}/inspections/upcoming`, { params });
    }

    getRecentInspections(companyId?: number, count: number = 10): Observable<QualityInspection[]> {
        const params = this.buildParams({ companyId, count });
        return this.http.get<QualityInspection[]>(`${this.apiUrl}/inspections/recent`, { params });
    }

    // --- Defects ---

    getDefects(companyId?: number, projectId?: number, phaseId?: number, status?: string, severity?: string): Observable<Defect[]> {
        const params = this.buildParams({ companyId, projectId, phaseId, status, severity });
        return this.http.get<Defect[]>(`${this.apiUrl}/defects`, { params });
    }

    getDefectById(id: number, companyId?: number): Observable<Defect> {
        const params = this.buildParams({ companyId });
        return this.http.get<Defect>(`${this.apiUrl}/defects/${id}`, { params });
    }

    createDefect(request: CreateDefectRequest, companyId?: number): Observable<Defect> {
        const params = this.buildParams({ companyId });
        return this.http.post<Defect>(`${this.apiUrl}/defects`, request, { params });
    }

    updateDefect(id: number, request: UpdateDefectRequest, companyId?: number): Observable<Defect> {
        const params = this.buildParams({ companyId });
        return this.http.put<Defect>(`${this.apiUrl}/defects/${id}`, request, { params });
    }

    deleteDefect(id: number, companyId?: number): Observable<void> {
        const params = this.buildParams({ companyId });
        return this.http.delete<void>(`${this.apiUrl}/defects/${id}`, { params });
    }

    assignDefect(id: number, request: AssignDefectRequest, companyId?: number): Observable<Defect> {
        const params = this.buildParams({ companyId });
        return this.http.post<Defect>(`${this.apiUrl}/defects/assign`, request, { params });
    }

    resolveDefect(id: number, request: ResolveDefectRequest, companyId?: number): Observable<Defect> {
        const params = this.buildParams({ companyId });
        return this.http.post<Defect>(`${this.apiUrl}/defects/resolve`, request, { params });
    }

    closeDefect(id: number, companyId?: number, closureNotes?: string): Observable<Defect> {
        const params = this.buildParams({ companyId });
        return this.http.post<Defect>(`${this.apiUrl}/defects/${id}/close`, { closureNotes }, { params });
    }

    reopenDefect(id: number, companyId?: number, reason?: string): Observable<Defect> {
        const params = this.buildParams({ companyId });
        return this.http.post<Defect>(`${this.apiUrl}/defects/${id}/reopen`, reason, { params });
    }

    getOpenDefects(companyId?: number, projectId?: number): Observable<Defect[]> {
        const params = this.buildParams({ companyId, projectId });
        return this.http.get<Defect[]>(`${this.apiUrl}/defects/open`, { params });
    }

    getOverdueDefects(companyId?: number): Observable<Defect[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<Defect[]>(`${this.apiUrl}/defects/overdue`, { params });
    }

    getCriticalDefects(companyId?: number): Observable<Defect[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<Defect[]>(`${this.apiUrl}/defects/critical`, { params });
    }

    getSafetyRelatedDefects(companyId?: number): Observable<Defect[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<Defect[]>(`${this.apiUrl}/defects/safety`, { params });
    }

    getStatistics(companyId?: number): Observable<QualityStatistics> {
        const params = this.buildParams({ companyId });
        return this.http.get<QualityStatistics>(`${this.apiUrl}/statistics`, { params });
    }

    getPunchListItems(companyId?: number): Observable<PunchListItem[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<PunchListItem[]>(`${this.apiUrl}/punch-list`, { params });
    }
}
