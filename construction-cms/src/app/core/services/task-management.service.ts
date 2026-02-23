import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Types
export enum TaskStatus {
    Pending = 0,
    InProgress = 1,
    ReadyForReview = 2,
    RevisionRequested = 3,
    Approved = 4,
    Rejected = 5,
    OnHold = 6,
    Cancelled = 7
}

export enum TaskPriority {
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3
}

export enum MediaType {
    Photo = 0,
    Video = 1,
    Document = 2
}

export enum ReviewStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    RevisionRequested = 3
}

export enum ConfirmationStatus {
    Pending = 0,
    Confirmed = 1,
    PartiallyConfirmed = 2,
    Rejected = 3,
    ForcedStart = 4
}

export interface ProjectItemTask {
    id: number;
    companyId?: number;
    projectId: number;
    projectItemId: number;
    taskNumber: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedToUserId?: number;
    assignedToUser?: any;
    createdByUserId: number;
    createdByUser?: any;
    scheduledStartDate?: Date;
    scheduledEndDate?: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    progressPercentage: number;
    requiresPreStartConfirmation: boolean;
    preStartConfirmationHours: number;
    preStartConfirmationStatus: ConfirmationStatus;
    preStartConfirmedAt?: Date;
    preStartConfirmedByUserId?: number;
    preStartConfirmationNotes?: string;
    reviewedByUserId?: number;
    reviewedAt?: Date;
    location?: string;
    internalNotes?: string;
    attachments?: ProjectItemTaskAttachment[];
    reviews?: ProjectItemTaskReview[];
    history?: ProjectItemTaskHistory[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProjectItemTaskAttachment {
    id: number;
    projectItemTaskId: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    contentType: string;
    mediaType: MediaType;
    thumbnailPath?: string;
    videoDurationSeconds?: number;
    imageWidth?: number;
    imageHeight?: number;
    caption?: string;
    description?: string;
    uploadedByUserId: number;
    uploadedByUser?: any;
    uploadedAt: Date;
    reviewStatus: ReviewStatus;
    reviewedByUserId?: number;
    reviewedAt?: Date;
    reviewComments?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    isBeforePhoto: boolean;
    isAfterPhoto: boolean;
    sortOrder: number;
}

export interface ProjectItemTaskReview {
    id: number;
    projectItemTaskId: number;
    reviewType: number;
    previousStatus: TaskStatus;
    newStatus: TaskStatus;
    reviewerUserId: number;
    reviewerUser?: any;
    reviewedAt: Date;
    comments?: string;
    revisionInstructions?: string;
    rejectionReason?: string;
    attachmentId?: number;
    qualityRating?: number;
    meetsQualityStandards?: boolean;
    meetsSafetyStandards?: boolean;
    requiresFollowUp: boolean;
    followUpDate?: Date;
}

export interface ProjectItemTaskHistory {
    id: number;
    projectItemTaskId: number;
    action: number;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    changedByUserId: number;
    changedByUser?: any;
    changedAt: Date;
    notes?: string;
}

// Request DTOs
export interface CreateTaskRequest {
    projectId: number;
    projectItemId: number;
    title: string;
    description?: string;
    assignedToUserId?: number;
    priority?: TaskPriority;
    dueDate?: Date;
    scheduledStartDate?: Date;
    scheduledEndDate?: Date;
    estimatedHours?: number;
    requiresPreStartConfirmation?: boolean;
    preStartConfirmationHours?: number;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    assignedToUserId?: number;
    priority?: TaskPriority;
    dueDate?: Date;
    scheduledStartDate?: Date;
    scheduledEndDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    progressPercentage?: number;
    internalNotes?: string;
}

export interface AddAttachmentRequest {
    fileName: string;
    filePath: string;
    fileSize: number;
    contentType: string;
    mediaType: MediaType;
    caption?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    isBeforePhoto?: boolean;
    isAfterPhoto?: boolean;
}

export interface TaskSearchRequest {
    searchTerm?: string;
    projectId?: number;
    projectItemId?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToUserId?: number;
    dueDateFrom?: Date;
    dueDateTo?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class TaskManagementService {
    private apiUrl = 'api/tasks';

    constructor(private http: HttpClient) { }

    // Task CRUD
    createTask(request: CreateTaskRequest): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(this.apiUrl, request);
    }

    getTask(id: number): Observable<ProjectItemTask> {
        return this.http.get<ProjectItemTask>(`${this.apiUrl}/${id}`);
    }

    getTasksByProject(projectId: number): Observable<ProjectItemTask[]> {
        return this.http.get<ProjectItemTask[]>(`${this.apiUrl}/project/${projectId}`);
    }

    getTasksByProjectItem(projectItemId: number): Observable<ProjectItemTask[]> {
        return this.http.get<ProjectItemTask[]>(`${this.apiUrl}/project-item/${projectItemId}`);
    }

    getMyTasks(): Observable<ProjectItemTask[]> {
        return this.http.get<ProjectItemTask[]>(`${this.apiUrl}/my-tasks`);
    }

    getOverdueTasks(): Observable<ProjectItemTask[]> {
        return this.http.get<ProjectItemTask[]>(`${this.apiUrl}/overdue`);
    }

    getTasksDueSoon(days: number = 3): Observable<ProjectItemTask[]> {
        return this.http.get<ProjectItemTask[]>(`${this.apiUrl}/due-soon`, { params: { days } });
    }

    updateTask(id: number, request: UpdateTaskRequest): Observable<ProjectItemTask> {
        return this.http.put<ProjectItemTask>(`${this.apiUrl}/${id}`, request);
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Task Workflow
    startTask(id: number): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/start`, {});
    }

    submitForReview(id: number, notes?: string): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/submit-review`, { notes });
    }

    approveTask(id: number, comments?: string, qualityRating?: number): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/approve`, { comments, qualityRating });
    }

    rejectTask(id: number, rejectionReason?: string): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/reject`, { rejectionReason });
    }

    requestRevision(id: number, revisionInstructions: string): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/request-revision`, { revisionInstructions });
    }

    putTaskOnHold(id: number, reason?: string): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/hold`, { reason });
    }

    resumeTask(id: number, notes?: string): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/resume`, { notes });
    }

    cancelTask(id: number, reason?: string): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/cancel`, { reason });
    }

    // Task Assignment
    assignTask(id: number, assignedToUserId: number): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/assign`, { assignedToUserId });
    }

    // Pre-Start Confirmation
    confirmPreStart(id: number, notes?: string): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/confirm-pre-start`, { notes });
    }

    authorizeForcedStart(id: number, reason: string): Observable<ProjectItemTask> {
        return this.http.post<ProjectItemTask>(`${this.apiUrl}/${id}/authorize-forced-start`, { reason });
    }

    // Attachments
    addAttachment(taskId: number, request: AddAttachmentRequest): Observable<ProjectItemTaskAttachment> {
        return this.http.post<ProjectItemTaskAttachment>(`${this.apiUrl}/${taskId}/attachments`, request);
    }

    getAttachments(taskId: number): Observable<ProjectItemTaskAttachment[]> {
        return this.http.get<ProjectItemTaskAttachment[]>(`${this.apiUrl}/${taskId}/attachments`);
    }

    deleteAttachment(attachmentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/attachments/${attachmentId}`);
    }

    // History
    getTaskHistory(taskId: number): Observable<ProjectItemTaskHistory[]> {
        return this.http.get<ProjectItemTaskHistory[]>(`${this.apiUrl}/${taskId}/history`);
    }

    // Statistics
    getTaskStatusCounts(projectId: number): Observable<{ [key: number]: number }> {
        return this.http.get<{ [key: number]: number }>(`${this.apiUrl}/stats/project/${projectId}/status-counts`);
    }

    // Search
    searchTasks(request: TaskSearchRequest): Observable<ProjectItemTask[]> {
        const params: any = {};
        if (request.searchTerm) params.searchTerm = request.searchTerm;
        if (request.projectId) params.projectId = request.projectId;
        if (request.projectItemId) params.projectItemId = request.projectItemId;
        if (request.status !== undefined) params.status = request.status;
        if (request.priority !== undefined) params.priority = request.priority;
        if (request.assignedToUserId) params.assignedToUserId = request.assignedToUserId;
        if (request.dueDateFrom) params.dueDateFrom = request.dueDateFrom.toISOString();
        if (request.dueDateTo) params.dueDateTo = request.dueDateTo.toISOString();

        return this.http.get<ProjectItemTask[]>(`${this.apiUrl}/search`, { params });
    }

    // Bulk Operations
    bulkAssign(taskIds: number[], assignedToUserId: number): Observable<ProjectItemTask[]> {
        return this.http.post<ProjectItemTask[]>(`${this.apiUrl}/bulk/assign`, { taskIds, assignedToUserId });
    }

    // Helper Methods
    getStatusLabel(status: TaskStatus): string {
        const labels = {
            [TaskStatus.Pending]: 'Pending',
            [TaskStatus.InProgress]: 'In Progress',
            [TaskStatus.ReadyForReview]: 'Ready for Review',
            [TaskStatus.RevisionRequested]: 'Revision Requested',
            [TaskStatus.Approved]: 'Approved',
            [TaskStatus.Rejected]: 'Rejected',
            [TaskStatus.OnHold]: 'On Hold',
            [TaskStatus.Cancelled]: 'Cancelled'
        };
        return labels[status] || 'Unknown';
    }

    getStatusColor(status: TaskStatus): string {
        const colors = {
            [TaskStatus.Pending]: 'bg-gray-100 text-gray-800',
            [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800',
            [TaskStatus.ReadyForReview]: 'bg-yellow-100 text-yellow-800',
            [TaskStatus.RevisionRequested]: 'bg-orange-100 text-orange-800',
            [TaskStatus.Approved]: 'bg-green-100 text-green-800',
            [TaskStatus.Rejected]: 'bg-red-100 text-red-800',
            [TaskStatus.OnHold]: 'bg-purple-100 text-purple-800',
            [TaskStatus.Cancelled]: 'bg-gray-100 text-gray-600'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getPriorityLabel(priority: TaskPriority): string {
        const labels = {
            [TaskPriority.Low]: 'Low',
            [TaskPriority.Normal]: 'Normal',
            [TaskPriority.High]: 'High',
            [TaskPriority.Critical]: 'Critical'
        };
        return labels[priority] || 'Normal';
    }

    getPriorityColor(priority: TaskPriority): string {
        const colors = {
            [TaskPriority.Low]: 'bg-gray-100 text-gray-800',
            [TaskPriority.Normal]: 'bg-blue-100 text-blue-800',
            [TaskPriority.High]: 'bg-orange-100 text-orange-800',
            [TaskPriority.Critical]: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    }
}
