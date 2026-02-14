import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PhaseItem {
    id: number;
    name: string;
    description?: string;
    unit?: string;
    totalQuantity: number;
    executedQuantity: number;
    rate: number;
    startDate?: Date;
    endDate?: Date;
}

export interface Phase {
    id: number;
    name: string;
    description?: string;
    order: number;
    parentPhaseId?: number;
    isLeaf: boolean;
    startDate?: Date;
    endDate?: Date;
    totalMoney?: number;
    executedMoney?: number;
    children?: Phase[];
    items?: PhaseItem[];
}

export interface CreatePhaseRequest {
    name: string;
    description?: string;
    parentPhaseId?: number;
    order?: number;
}

export interface UpdatePhaseRequest {
    name?: string;
    description?: string;
    order?: number;
}

@Injectable({
    providedIn: 'root'
})
export class PhaseService {
    private apiUrl = 'api';

    constructor(private http: HttpClient) { }

    // --- Project Phases ---

    getProjectPhases(projectId: number): Observable<Phase[]> {
        return this.http.get<Phase[]>(`${this.apiUrl}/projects/${projectId}/phases`);
    }

    createProjectPhase(projectId: number, request: CreatePhaseRequest): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(`${this.apiUrl}/projects/${projectId}/phases`, request);
    }

    updatePhase(phaseId: number, request: UpdatePhaseRequest): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/phases/${phaseId}`, request);
    }

    deletePhase(phaseId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/phases/${phaseId}`);
    }

    reorderPhase(id: number, direction: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/phases/${id}/reorder?direction=${direction}`, {});
    }

    // --- Company Default Phases (Templates) ---

    getDefaultPhases(companyId: number): Observable<Phase[]> {
        return this.http.get<Phase[]>(`${this.apiUrl}/companies/${companyId}/default-phases`);
    }

    createDefaultPhase(companyId: number, request: CreatePhaseRequest): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(`${this.apiUrl}/companies/${companyId}/default-phases`, request);
    }

    updateDefaultPhase(defaultPhaseId: number, request: UpdatePhaseRequest): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/default-phases/${defaultPhaseId}`, request);
    }

    deleteDefaultPhase(defaultPhaseId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/default-phases/${defaultPhaseId}`);
    }

    clearDefaultPhases(companyId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/companies/${companyId}/default-phases/clear`);
    }

    reorderDefaultPhase(id: number, direction: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/default-phases/${id}/reorder?direction=${direction}`, {});
    }

    addItemsToDefaultPhase(id: number, catalogItemIds: number[]): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/default-phases/${id}/items`, catalogItemIds);
    }

    deleteDefaultPhaseItem(defaultPhaseId: number, itemId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/default-phases/${defaultPhaseId}/items/${itemId}`);
    }

    // --- Initialize Project Phases from Company Defaults ---

    initializeProjectPhasesFromDefaults(projectId: number, companyId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/projects/${projectId}/phases/initialize-from-defaults`, { companyId });
    }

    clearProjectPhases(projectId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}/phases`);
    }
}
