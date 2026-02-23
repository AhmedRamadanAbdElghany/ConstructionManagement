import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Types
export enum EscalationType {
    PreStartNotConfirmed = 0,
    MaterialsNotReady = 1,
    ForcedStartRequired = 2,
    IssueDuringExecution = 3,
    NoStartToday = 4,
    DelayPredicted = 5,
    QualityIssue = 6,
    SafetyConcern = 7,
    ResourceConflict = 8
}

export enum EscalationSeverity {
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

export enum EscalationStatus {
    Open = 0,
    Acknowledged = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4,
    Escalated = 5
}

export interface ProjectItemEscalation {
    id: number;
    companyId?: number;
    projectId: number;
    projectItemId?: number;
    taskId?: number;
    escalationType: EscalationType;
    severity: EscalationSeverity;
    status: EscalationStatus;
    title: string;
    description?: string;
    affectedUserId?: number;
    affectedUser?: any;
    assignedToUserId?: number;
    assignedToUser?: any;
    createdByUserId: number;
    createdByUser?: any;
    dueDate?: Date;
    acknowledgedAt?: Date;
    acknowledgedByUserId?: number;
    resolvedAt?: Date;
    resolvedByUserId?: number;
    resolution?: string;
    resolutionNotes?: string;
    escalatedToUserId?: number;
    escalatedAt?: Date;
    escalationReason?: string;
    project?: any;
    projectItem?: any;
    task?: any;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface TaskNotification {
    id: number;
    companyId?: number;
    userId: number;
    user?: any;
    taskId?: number;
    task?: any;
    escalationId?: number;
    escalation?: any;
    notificationType: number;
    title: string;
    message: string;
    isRead: boolean;
    readAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
    deliveryChannel: number;
    emailAddress?: string;
    phoneNumber?: string;
    pushToken?: string;
    actionUrl?: string;
    actionText?: string;
    priority: number;
    expiresAt?: Date;
    createdAt?: Date;
}

// Request DTOs
export interface CreateEscalationRequest {
    projectId: number;
    projectItemId?: number;
    taskId?: number;
    escalationType: EscalationType;
    severity: EscalationSeverity;
    title: string;
    description?: string;
    affectedUserId?: number;
    assignedToUserId?: number;
    dueDate?: Date;
}

export interface UpdateEscalationRequest {
    severity?: EscalationSeverity;
    assignedToUserId?: number;
    dueDate?: Date;
    description?: string;
}

export interface AcknowledgeEscalationRequest {
    notes?: string;
}

export interface ResolveEscalationRequest {
    resolution: string;
    resolutionNotes?: string;
}

export interface EscalateRequest {
    escalatedToUserId: number;
    reason: string;
}

export interface EscalationSearchRequest {
    searchTerm?: string;
    projectId?: number;
    status?: EscalationStatus;
    severity?: EscalationSeverity;
    escalationType?: EscalationType;
    assignedToUserId?: number;
    dueDateFrom?: Date;
    dueDateTo?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class EscalationService {
    private apiUrl = 'api/escalations';

    constructor(private http: HttpClient) { }

    // Escalation CRUD
    createEscalation(request: CreateEscalationRequest): Observable<ProjectItemEscalation> {
        return this.http.post<ProjectItemEscalation>(this.apiUrl, request);
    }

    getEscalation(id: number): Observable<ProjectItemEscalation> {
        return this.http.get<ProjectItemEscalation>(`${this.apiUrl}/${id}`);
    }

    getEscalationsByProject(projectId: number): Observable<ProjectItemEscalation[]> {
        return this.http.get<ProjectItemEscalation[]>(`${this.apiUrl}/project/${projectId}`);
    }

    getMyEscalations(): Observable<ProjectItemEscalation[]> {
        return this.http.get<ProjectItemEscalation[]>(`${this.apiUrl}/my-escalations`);
    }

    getOpenEscalations(): Observable<ProjectItemEscalation[]> {
        return this.http.get<ProjectItemEscalation[]>(`${this.apiUrl}/open`);
    }

    getCriticalEscalations(): Observable<ProjectItemEscalation[]> {
        return this.http.get<ProjectItemEscalation[]>(`${this.apiUrl}/critical`);
    }

    getOverdueEscalations(): Observable<ProjectItemEscalation[]> {
        return this.http.get<ProjectItemEscalation[]>(`${this.apiUrl}/overdue`);
    }

    updateEscalation(id: number, request: UpdateEscalationRequest): Observable<ProjectItemEscalation> {
        return this.http.put<ProjectItemEscalation>(`${this.apiUrl}/${id}`, request);
    }

    deleteEscalation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Escalation Workflow
    acknowledge(id: number, request?: AcknowledgeEscalationRequest): Observable<ProjectItemEscalation> {
        return this.http.post<ProjectItemEscalation>(`${this.apiUrl}/${id}/acknowledge`, request || {});
    }

    startProgress(id: number, notes?: string): Observable<ProjectItemEscalation> {
        return this.http.post<ProjectItemEscalation>(`${this.apiUrl}/${id}/start-progress`, { notes });
    }

    resolve(id: number, request: ResolveEscalationRequest): Observable<ProjectItemEscalation> {
        return this.http.post<ProjectItemEscalation>(`${this.apiUrl}/${id}/resolve`, request);
    }

    close(id: number, notes?: string): Observable<ProjectItemEscalation> {
        return this.http.post<ProjectItemEscalation>(`${this.apiUrl}/${id}/close`, { notes });
    }

    escalate(id: number, request: EscalateRequest): Observable<ProjectItemEscalation> {
        return this.http.post<ProjectItemEscalation>(`${this.apiUrl}/${id}/escalate`, request);
    }

    // Assignment
    assignEscalation(id: number, assignedToUserId: number): Observable<ProjectItemEscalation> {
        return this.http.post<ProjectItemEscalation>(`${this.apiUrl}/${id}/assign`, { assignedToUserId });
    }

    // Statistics
    getEscalationCounts(): Observable<{ [key: number]: number }> {
        return this.http.get<{ [key: number]: number }>(`${this.apiUrl}/stats/counts`);
    }

    getEscalationStatsByProject(projectId: number): Observable<{
        total: number;
        open: number;
        resolved: number;
        critical: number;
        overdue: number;
    }> {
        return this.http.get<{
            total: number;
            open: number;
            resolved: number;
            critical: number;
            overdue: number;
        }>(`${this.apiUrl}/stats/project/${projectId}`);
    }

    // Search
    searchEscalations(request: EscalationSearchRequest): Observable<ProjectItemEscalation[]> {
        const params: any = {};
        if (request.searchTerm) params.searchTerm = request.searchTerm;
        if (request.projectId) params.projectId = request.projectId;
        if (request.status !== undefined) params.status = request.status;
        if (request.severity !== undefined) params.severity = request.severity;
        if (request.escalationType !== undefined) params.escalationType = request.escalationType;
        if (request.assignedToUserId) params.assignedToUserId = request.assignedToUserId;
        if (request.dueDateFrom) params.dueDateFrom = request.dueDateFrom.toISOString();
        if (request.dueDateTo) params.dueDateTo = request.dueDateTo.toISOString();

        return this.http.get<ProjectItemEscalation[]>(`${this.apiUrl}/search`, { params });
    }

    // Helper Methods
    getEscalationTypeLabel(type: EscalationType): string {
        const labels = {
            [EscalationType.PreStartNotConfirmed]: 'Pre-Start Not Confirmed',
            [EscalationType.MaterialsNotReady]: 'Materials Not Ready',
            [EscalationType.ForcedStartRequired]: 'Forced Start Required',
            [EscalationType.IssueDuringExecution]: 'Issue During Execution',
            [EscalationType.NoStartToday]: 'No Start Today',
            [EscalationType.DelayPredicted]: 'Delay Predicted',
            [EscalationType.QualityIssue]: 'Quality Issue',
            [EscalationType.SafetyConcern]: 'Safety Concern',
            [EscalationType.ResourceConflict]: 'Resource Conflict'
        };
        return labels[type] || 'Unknown';
    }

    getEscalationTypeColor(type: EscalationType): string {
        const colors = {
            [EscalationType.PreStartNotConfirmed]: 'bg-yellow-100 text-yellow-800',
            [EscalationType.MaterialsNotReady]: 'bg-orange-100 text-orange-800',
            [EscalationType.ForcedStartRequired]: 'bg-red-100 text-red-800',
            [EscalationType.IssueDuringExecution]: 'bg-red-100 text-red-800',
            [EscalationType.NoStartToday]: 'bg-purple-100 text-purple-800',
            [EscalationType.DelayPredicted]: 'bg-orange-100 text-orange-800',
            [EscalationType.QualityIssue]: 'bg-yellow-100 text-yellow-800',
            [EscalationType.SafetyConcern]: 'bg-red-100 text-red-800',
            [EscalationType.ResourceConflict]: 'bg-blue-100 text-blue-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    }

    getSeverityLabel(severity: EscalationSeverity): string {
        const labels = {
            [EscalationSeverity.Low]: 'Low',
            [EscalationSeverity.Medium]: 'Medium',
            [EscalationSeverity.High]: 'High',
            [EscalationSeverity.Critical]: 'Critical'
        };
        return labels[severity] || 'Medium';
    }

    getSeverityColor(severity: EscalationSeverity): string {
        const colors = {
            [EscalationSeverity.Low]: 'bg-gray-100 text-gray-800',
            [EscalationSeverity.Medium]: 'bg-blue-100 text-blue-800',
            [EscalationSeverity.High]: 'bg-orange-100 text-orange-800',
            [EscalationSeverity.Critical]: 'bg-red-100 text-red-800'
        };
        return colors[severity] || 'bg-gray-100 text-gray-800';
    }

    getStatusLabel(status: EscalationStatus): string {
        const labels = {
            [EscalationStatus.Open]: 'Open',
            [EscalationStatus.Acknowledged]: 'Acknowledged',
            [EscalationStatus.InProgress]: 'In Progress',
            [EscalationStatus.Resolved]: 'Resolved',
            [EscalationStatus.Closed]: 'Closed',
            [EscalationStatus.Escalated]: 'Escalated'
        };
        return labels[status] || 'Unknown';
    }

    getStatusColor(status: EscalationStatus): string {
        const colors = {
            [EscalationStatus.Open]: 'bg-red-100 text-red-800',
            [EscalationStatus.Acknowledged]: 'bg-yellow-100 text-yellow-800',
            [EscalationStatus.InProgress]: 'bg-blue-100 text-blue-800',
            [EscalationStatus.Resolved]: 'bg-green-100 text-green-800',
            [EscalationStatus.Closed]: 'bg-gray-100 text-gray-600',
            [EscalationStatus.Escalated]: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }
}
