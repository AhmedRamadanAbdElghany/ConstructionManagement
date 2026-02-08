import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SafetyChecklist {
    id: number;
    name: string;
    description?: string;
    category: number;
    categoryName: string;
    isActive: boolean;
    itemsCount: number;
    createdAt: Date;
}

export interface SafetyChecklistItem {
    id: number;
    safetyChecklistId: number;
    description: string;
    orderIndex: number;
    isCritical: boolean;
    complianceStandard?: string;
}

export interface SafetyInspection {
    id: number;
    safetyChecklistId: number;
    safetyChecklistName: string;
    projectId?: number;
    projectName?: string;
    inspectorUserId: number;
    inspectorName: string;
    inspectionDate: Date;
    location?: string;
    totalItems: number;
    passedItems: number;
    failedItems: number;
    naItems: number;
    passRate: number;
    notes?: string;
    requiresFollowUp: boolean;
    followUpNotes?: string;
    followUpDate?: Date;
    createdAt: Date;
}

export interface SafetyIncident {
    id: number;
    projectId?: number;
    projectName?: string;
    reportedByUserId?: number;
    reporterName?: string;
    severity: number;
    severityName: string;
    title: string;
    description: string;
    incidentDate: string | Date;
    location?: string;
    involvedPersons: string[];
    witnesses: string[];
    immediateActions?: string;
    requiredMedicalAttention: boolean;
    estimatedCost: number;
    investigationStatus: number;
    investigationStatusName: string;
    rootCauseAnalysis?: string;
    correctiveActions?: string;
    followUpDate?: Date;
    createdAt: Date;
}

export interface SafetyTraining {
    id: number;
    title: string;
    description?: string;
    trainingType: string;
    scheduledDate: Date;
    completedDate?: Date;
    status: number;
    statusName: string;
    trainerName?: string;
    durationMinutes: number;
    requiresCertification: boolean;
    certificationExpiryDate?: Date;
    maxParticipants?: number;
    currentParticipants: number;
    createdAt: Date;
}

export interface SafetyCompliance {
    id: number;
    projectId: number;
    projectName: string;
    complianceDate: Date;
    standardName: string;
    description?: string;
    isCompliant: boolean;
    nonComplianceNotes?: string;
    nextReviewDate?: Date;
    createdAt: Date;
}

export interface SafetyDashboard {
    totalChecklists: number;
    totalInspections: number;
    totalIncidents: number;
    totalTrainings: number;
    averagePassRate: number;
    inspectionsThisMonth: number;
    inspectionsPassed: number;
    inspectionsFailed: number;
    incidentsThisMonth: number;
    criticalIncidents: number;
    pendingInvestigations: number;
    trainingsCompleted: number;
    upcomingTrainings: number;
    expiringCertifications: number;
    recentIncidents: SafetyIncident[];
    recentInspections: SafetyInspection[];
    upcomingTrainingsList: SafetyTraining[];
}

export interface CreateSafetyChecklistRequest {
    name: string;
    description?: string;
    category: number;
}

export interface UpdateSafetyChecklistRequest {
    name?: string;
    description?: string;
    category?: number;
    isActive?: boolean;
}

export interface CreateSafetyChecklistItemRequest {
    safetyChecklistId: number;
    description: string;
    orderIndex: number;
    isCritical: boolean;
    complianceStandard?: string;
}

export interface CreateSafetyInspectionRequest {
    safetyChecklistId: number;
    projectId?: number;
    inspectorUserId: number;
    inspectionDate: Date;
    location?: string;
    notes?: string;
}

export interface CreateSafetyIncidentRequest {
    projectId?: number;
    reportedByUserId?: number;
    severity: number;
    title: string;
    description: string;
    incidentDate: Date;
    location?: string;
    involvedPersons: string[];
    witnesses: string[];
    immediateActions?: string;
    requiredMedicalAttention: boolean;
    estimatedCost: number;
}

export interface UpdateSafetyIncidentRequest {
    title?: string;
    description?: string;
    location?: string;
    involvedPersons?: string[];
    witnesses?: string[];
    immediateActions?: string;
    requiredMedicalAttention?: boolean;
    estimatedCost?: number;
    investigationStatus?: number;
    rootCauseAnalysis?: string;
    correctiveActions?: string;
    followUpDate?: Date;
}

export interface CreateSafetyTrainingRequest {
    title: string;
    description?: string;
    trainingType: string;
    scheduledDate: Date;
    trainerName?: string;
    durationMinutes: number;
    requiresCertification: boolean;
    certificationExpiryDate?: Date;
    maxParticipants?: number;
}

export interface UpdateSafetyTrainingRequest {
    title?: string;
    description?: string;
    trainingType?: string;
    scheduledDate?: Date;
    trainerName?: string;
    durationMinutes?: number;
    requiresCertification?: boolean;
    certificationExpiryDate?: Date;
    maxParticipants?: number;
}

export interface CompleteTrainingRequest {
    completedDate: Date;
    notes?: string;
}

export interface CreateSafetyComplianceRequest {
    projectId: number;
    standardName: string;
    description?: string;
    complianceDate: Date;
    nextReviewDate?: Date;
}

export interface InvestigationUpdateRequest {
    rootCauseAnalysis: string;
    correctiveActions: string;
}

export interface ComplianceNoteRequest {
    notes: string;
}

@Injectable({
    providedIn: 'root'
})
export class SafetyService {
    private apiUrl = 'api/safety';

    constructor(private http: HttpClient) { }

    // --- Safety Checklists ---

    getChecklists(): Observable<SafetyChecklist[]> {
        return this.http.get<SafetyChecklist[]>(`${this.apiUrl}/checklists`);
    }

    getChecklistById(id: number): Observable<SafetyChecklist> {
        return this.http.get<SafetyChecklist>(`${this.apiUrl}/checklists/${id}`);
    }

    createChecklist(request: CreateSafetyChecklistRequest): Observable<SafetyChecklist> {
        return this.http.post<SafetyChecklist>(`${this.apiUrl}/checklists`, request);
    }

    updateChecklist(id: number, request: UpdateSafetyChecklistRequest): Observable<SafetyChecklist> {
        return this.http.put<SafetyChecklist>(`${this.apiUrl}/checklists/${id}`, request);
    }

    deleteChecklist(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/checklists/${id}`);
    }

    getChecklistItems(id: number): Observable<SafetyChecklistItem[]> {
        return this.http.get<SafetyChecklistItem[]>(`${this.apiUrl}/checklists/${id}/items`);
    }

    addChecklistItem(request: CreateSafetyChecklistItemRequest): Observable<SafetyChecklistItem> {
        return this.http.post<SafetyChecklistItem>(`${this.apiUrl}/checklists/items`, request);
    }

    updateChecklistItem(itemId: number, request: CreateSafetyChecklistItemRequest): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/checklists/items/${itemId}`, request);
    }

    deleteChecklistItem(itemId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/checklists/items/${itemId}`);
    }

    // --- Safety Inspections ---

    getInspections(queryParams?: any): Observable<SafetyInspection[]> {
        return this.http.get<SafetyInspection[]>(`${this.apiUrl}/inspections`, { params: queryParams });
    }

    getInspectionById(id: number): Observable<SafetyInspection> {
        return this.http.get<SafetyInspection>(`${this.apiUrl}/inspections/${id}`);
    }

    createInspection(request: CreateSafetyInspectionRequest): Observable<SafetyInspection> {
        return this.http.post<SafetyInspection>(`${this.apiUrl}/inspections`, request);
    }

    updateInspection(id: number, request: CreateSafetyInspectionRequest): Observable<SafetyInspection> {
        return this.http.put<SafetyInspection>(`${this.apiUrl}/inspections/${id}`, request);
    }

    deleteInspection(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/inspections/${id}`);
    }

    getInspectionsByProject(projectId: number): Observable<SafetyInspection[]> {
        return this.http.get<SafetyInspection[]>(`${this.apiUrl}/inspections/project/${projectId}`);
    }

    getDashboardStats(): Observable<SafetyDashboard> {
        return this.http.get<SafetyDashboard>(`${this.apiUrl}/safety/dashboard`);
    }

    // --- Safety Incidents ---

    getIncidents(queryParams?: any): Observable<SafetyIncident[]> {
        return this.http.get<SafetyIncident[]>(`${this.apiUrl}/incidents`, { params: queryParams });
    }

    getIncidentById(id: number): Observable<SafetyIncident> {
        return this.http.get<SafetyIncident>(`${this.apiUrl}/incidents/${id}`);
    }

    createIncident(request: CreateSafetyIncidentRequest): Observable<SafetyIncident> {
        return this.http.post<SafetyIncident>(`${this.apiUrl}/incidents`, request);
    }

    updateIncident(id: number, request: UpdateSafetyIncidentRequest): Observable<SafetyIncident> {
        return this.http.put<SafetyIncident>(`${this.apiUrl}/incidents/${id}`, request);
    }

    deleteIncident(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/incidents/${id}`);
    }

    getIncidentsByProject(projectId: number): Observable<SafetyIncident[]> {
        return this.http.get<SafetyIncident[]>(`${this.apiUrl}/incidents/project/${projectId}`);
    }

    getCriticalIncidents(): Observable<SafetyIncident[]> {
        return this.http.get<SafetyIncident[]>(`${this.apiUrl}/incidents/critical`);
    }

    updateInvestigation(id: number, request: InvestigationUpdateRequest): Observable<SafetyIncident> {
        return this.http.put<SafetyIncident>(`${this.apiUrl}/incidents/${id}/investigation`, request);
    }

    // --- Safety Training ---

    getTrainings(queryParams?: any): Observable<SafetyTraining[]> {
        return this.http.get<SafetyTraining[]>(`${this.apiUrl}/trainings`, { params: queryParams });
    }

    getTrainingById(id: number): Observable<SafetyTraining> {
        return this.http.get<SafetyTraining>(`${this.apiUrl}/trainings/${id}`);
    }

    createTraining(request: CreateSafetyTrainingRequest): Observable<SafetyTraining> {
        return this.http.post<SafetyTraining>(`${this.apiUrl}/trainings`, request);
    }

    updateTraining(id: number, request: UpdateSafetyTrainingRequest): Observable<SafetyTraining> {
        return this.http.put<SafetyTraining>(`${this.apiUrl}/trainings/${id}`, request);
    }

    deleteTraining(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/trainings/${id}`);
    }

    completeTraining(id: number, request: CompleteTrainingRequest): Observable<SafetyTraining> {
        return this.http.post<SafetyTraining>(`${this.apiUrl}/trainings/${id}/complete`, request);
    }

    addParticipant(id: number, userId: number): Observable<SafetyTraining> {
        return this.http.post<SafetyTraining>(`${this.apiUrl}/trainings/${id}/participants/${userId}`, {});
    }

    removeParticipant(id: number, userId: number): Observable<SafetyTraining> {
        return this.http.delete<SafetyTraining>(`${this.apiUrl}/trainings/${id}/participants/${userId}`);
    }

    getUpcomingTrainings(): Observable<SafetyTraining[]> {
        return this.http.get<SafetyTraining[]>(`${this.apiUrl}/trainings/upcoming`);
    }

    getExpiringCertifications(daysAhead: number = 30): Observable<SafetyTraining[]> {
        return this.http.get<SafetyTraining[]>(`${this.apiUrl}/trainings/expiring?daysAhead=${daysAhead}`);
    }

    // --- Safety Compliance ---

    getComplianceRecords(projectId: number): Observable<SafetyCompliance[]> {
        return this.http.get<SafetyCompliance[]>(`${this.apiUrl}/compliance/${projectId}`);
    }

    getComplianceRecord(id: number): Observable<SafetyCompliance> {
        return this.http.get<SafetyCompliance>(`${this.apiUrl}/compliance/record/${id}`);
    }

    createComplianceRecord(request: CreateSafetyComplianceRequest): Observable<SafetyCompliance> {
        return this.http.post<SafetyCompliance>(`${this.apiUrl}/compliance`, request);
    }

    updateComplianceRecord(id: number, request: CreateSafetyComplianceRequest): Observable<SafetyCompliance> {
        return this.http.put<SafetyCompliance>(`${this.apiUrl}/compliance/record/${id}`, request);
    }

    deleteComplianceRecord(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/compliance/record/${id}`);
    }

    markAsCompliant(id: number, request: ComplianceNoteRequest): Observable<SafetyCompliance> {
        return this.http.put<SafetyCompliance>(`${this.apiUrl}/compliance/record/${id}/compliant`, request);
    }

    markAsNonCompliant(id: number, request: ComplianceNoteRequest): Observable<SafetyCompliance> {
        return this.http.put<SafetyCompliance>(`${this.apiUrl}/compliance/record/${id}/non-compliant`, request);
    }
}
