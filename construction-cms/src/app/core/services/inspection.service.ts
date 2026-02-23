import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}

// Paged result
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Types for Inspection feature
export interface InspectionRequest {
    id: number;
    companyId?: number;
    companyName: string;
    clientUserId: number;
    clientName: string;
    propertyType: number;
    propertyTypeName: string;
    title: string;
    description?: string;
    approximateArea: number;
    address: string;
    latitude?: number;
    longitude?: number;
    status: number;
    statusName: string;
    inspectionFee?: number;
    currency?: string;
    scheduledDate?: Date;
    scheduledTimeStart?: string;
    scheduledTimeEnd?: string;
    actualStartTime?: Date;
    actualEndTime?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt?: Date;
    timeSlots: InspectionTimeSlot[];
    quotes: InspectionQuote[];
    session?: InspectionSession;
    documents: InspectionDocument[];
    payment?: InspectionPayment;
    workRequest?: InspectionWorkRequest;
    review?: InspectionReview;
    costEstimate?: InspectionCostEstimate;
    teamMembers: InspectionTeamMember[];
}

export interface InspectionRequestList {
    id: number;
    companyId?: number;
    companyName: string;
    clientName: string;
    propertyType: number;
    propertyTypeName: string;
    title: string;
    address: string;
    status: number;
    statusName: string;
    inspectionFee?: number;
    scheduledDate?: Date;
    createdAt: Date;
}

export interface InspectionTimeSlot {
    id: number;
    proposedBy: number;
    proposedByName?: string;
    date: Date;
    timeStart: string;
    timeEnd: string;
    isSelected: boolean;
    isAvailable: boolean;
    notes?: string;
}

export interface InspectionQuote {
    id: number;
    companyUserId: number;
    companyUserName: string;
    amount: number;
    currency: string;
    description?: string;
    validUntil: Date;
    terms?: string;
    status: number;
    statusName: string;
    respondedAt?: Date;
    rejectionReason?: string;
}

export interface InspectionSession {
    id: number;
    verificationCode: string;
    codeGeneratedAt?: Date;
    codeExpiresAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    companyUserId: number;
    companyUserName: string;
    startMethod: number;
    notes?: string;
}

export interface InspectionDocument {
    id: number;
    type: number;
    typeName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    description?: string;
    uploadedAt: Date;
    uploadedByName: string;
}

export interface InspectionPayment {
    id: number;
    amount: number;
    currency: string;
    status: number;
    statusName: string;
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: Date;
}

export interface InspectionWorkRequest {
    id: number;
    status: number;
    statusName: string;
    message?: string;
    companyResponse?: string;
    respondedAt?: Date;
    convertedToProjectId?: number;
}

export interface InspectionReview {
    id: number;
    rating: number;
    comment?: string;
    isPublic: boolean;
    companyResponse?: string;
    companyRespondedAt?: Date;
}

export interface InspectionCostEstimate {
    id: number;
    totalEstimatedCost: number;
    currency: string;
    summary?: string;
    terms?: string;
    validUntil?: Date;
    items: CostEstimateItem[];
}

export interface CostEstimateItem {
    id: number;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    displayOrder: number;
}

export interface InspectionTeamMember {
    id: number;
    userId: number;
    userName: string;
    role: string;
    isPrimary: boolean;
    assignedAt: Date;
    assignedByName: string;
}

export interface InspectionChecklistTemplate {
    id: number;
    name: string;
    description?: string;
    propertyType?: number;
    isActive: boolean;
    items: InspectionChecklistItem[];
}

export interface InspectionChecklistItem {
    id: number;
    question: string;
    description?: string;
    responseType: string;
    isRequired: boolean;
    displayOrder: number;
    options?: string;
}

export interface InspectionAnalytics {
    totalInspections: number;
    completedInspections: number;
    pendingInspections: number;
    cancelledInspections: number;
    averageRating: number;
    totalRevenue: number;
    conversionRate: number;
    inspectionsByStatus: { status: string; count: number }[];
    inspectionsByPropertyType: { type: string; count: number }[];
    revenueByMonth: { month: string; amount: number }[];
}

// Request DTOs
export interface CreateInspectionRequest {
    companyId?: number;
    propertyType: number;
    propertyTypeName?: string;
    title: string;
    description?: string;
    approximateArea: number;
    address: string;
    latitude?: number;
    longitude?: number;
    timeSlots?: CreateTimeSlot[];
    customFields?: { [key: string]: string };
}

export interface CreateTimeSlot {
    date: Date;
    timeStart: string;
    timeEnd: string;
    notes?: string;
}

export interface UpdateInspectionRequest {
    propertyType: number;
    propertyTypeName?: string;
    title: string;
    description?: string;
    approximateArea: number;
    address: string;
    latitude?: number;
    longitude?: number;
}

export interface CreateQuote {
    amount: number;
    currency: string;
    description?: string;
    validUntil: Date;
    terms?: string;
}

export interface UploadDocument {
    type: number;
    description?: string;
    file: File;
}

export interface CreatePayment {
    amount: number;
    currency: string;
    paymentMethod: string;
}

export interface CreateWorkRequest {
    message?: string;
}

export interface CreateReview {
    rating: number;
    comment?: string;
    isPublic: boolean;
}

export interface CreateCostEstimate {
    totalEstimatedCost: number;
    currency: string;
    summary?: string;
    terms?: string;
    validUntil?: Date;
    items: CreateCostEstimateItem[];
}

export interface CreateCostEstimateItem {
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    notes?: string;
    displayOrder: number;
}

export interface CreateChecklistTemplate {
    name: string;
    description?: string;
    propertyType?: number;
    items: CreateChecklistItem[];
}

export interface CreateChecklistItem {
    question: string;
    description?: string;
    responseType: string;
    isRequired: boolean;
    displayOrder: number;
    options?: string;
}

export interface InspectionFilter {
    status?: number;
    propertyType?: number;
    companyId?: number;
    clientUserId?: number;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
    page?: number;
    pageSize?: number;
}

@Injectable({
    providedIn: 'root'
})
export class InspectionService {
    private apiUrl = '/api/inspections';

    constructor(private http: HttpClient) { }

    // Inspection Request CRUD
    getInspections(filter?: InspectionFilter): Observable<ApiResponse<PagedResult<InspectionRequestList>>> {
        let params = new HttpParams();

        if (filter) {
            if (filter.status !== undefined) params = params.set('status', filter.status.toString());
            if (filter.propertyType !== undefined) params = params.set('propertyType', filter.propertyType.toString());
            if (filter.companyId) params = params.set('companyId', filter.companyId.toString());
            if (filter.clientUserId) params = params.set('clientUserId', filter.clientUserId.toString());
            if (filter.fromDate) params = params.set('fromDate', filter.fromDate.toISOString());
            if (filter.toDate) params = params.set('toDate', filter.toDate.toISOString());
            if (filter.search) params = params.set('search', filter.search);
            if (filter.page) params = params.set('page', filter.page.toString());
            if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
        }

        return this.http.get<ApiResponse<PagedResult<InspectionRequestList>>>(this.apiUrl, { params });
    }

    getInspectionById(id: number): Observable<ApiResponse<InspectionRequest>> {
        return this.http.get<ApiResponse<InspectionRequest>>(`${this.apiUrl}/${id}`);
    }

    createInspection(request: CreateInspectionRequest): Observable<ApiResponse<InspectionRequest>> {
        return this.http.post<ApiResponse<InspectionRequest>>(this.apiUrl, request);
    }

    updateInspection(id: number, request: UpdateInspectionRequest): Observable<ApiResponse<InspectionRequest>> {
        return this.http.put<ApiResponse<InspectionRequest>>(`${this.apiUrl}/${id}`, request);
    }

    cancelInspection(id: number, reason: string): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${id}/cancel`, { reason });
    }

    // Time Slots
    addTimeSlot(inspectionId: number, slot: CreateTimeSlot): Observable<ApiResponse<InspectionTimeSlot>> {
        return this.http.post<ApiResponse<InspectionTimeSlot>>(`${this.apiUrl}/${inspectionId}/time-slots`, slot);
    }

    selectTimeSlot(inspectionId: number, slotId: number): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/time-slots/${slotId}/select`, {});
    }

    // Quotes
    getQuotes(inspectionId: number): Observable<ApiResponse<InspectionQuote[]>> {
        return this.http.get<ApiResponse<InspectionQuote[]>>(`${this.apiUrl}/${inspectionId}/quotes`);
    }

    createQuote(inspectionId: number, quote: CreateQuote): Observable<ApiResponse<InspectionQuote>> {
        return this.http.post<ApiResponse<InspectionQuote>>(`${this.apiUrl}/${inspectionId}/quotes`, quote);
    }

    acceptQuote(inspectionId: number, quoteId: number): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/quotes/${quoteId}/accept`, {});
    }

    rejectQuote(inspectionId: number, quoteId: number, reason: string): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/quotes/${quoteId}/reject`, { reason });
    }

    // Session Management
    generateQRCode(inspectionId: number): Observable<ApiResponse<{ code: string; expiresAt: Date }>> {
        return this.http.post<ApiResponse<{ code: string; expiresAt: Date }>>(`${this.apiUrl}/${inspectionId}/session/qrcode`, {});
    }

    startInspection(inspectionId: number, verificationCode: string): Observable<ApiResponse<InspectionSession>> {
        return this.http.post<ApiResponse<InspectionSession>>(`${this.apiUrl}/${inspectionId}/session/start`, { verificationCode });
    }

    completeInspection(inspectionId: number, notes?: string): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/session/complete`, { notes });
    }

    // Documents
    getDocuments(inspectionId: number): Observable<ApiResponse<InspectionDocument[]>> {
        return this.http.get<ApiResponse<InspectionDocument[]>>(`${this.apiUrl}/${inspectionId}/documents`);
    }

    uploadDocument(inspectionId: number, data: UploadDocument): Observable<ApiResponse<InspectionDocument>> {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('type', data.type.toString());
        if (data.description) formData.append('description', data.description);

        return this.http.post<ApiResponse<InspectionDocument>>(`${this.apiUrl}/${inspectionId}/documents`, formData);
    }

    deleteDocument(inspectionId: number, documentId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/documents/${documentId}`);
    }

    // Payments
    getPayment(inspectionId: number): Observable<ApiResponse<InspectionPayment>> {
        return this.http.get<ApiResponse<InspectionPayment>>(`${this.apiUrl}/${inspectionId}/payment`);
    }

    createPayment(inspectionId: number, payment: CreatePayment): Observable<ApiResponse<InspectionPayment>> {
        return this.http.post<ApiResponse<InspectionPayment>>(`${this.apiUrl}/${inspectionId}/payment`, payment);
    }

    // Work Requests
    getWorkRequest(inspectionId: number): Observable<ApiResponse<InspectionWorkRequest>> {
        return this.http.get<ApiResponse<InspectionWorkRequest>>(`${this.apiUrl}/${inspectionId}/work-request`);
    }

    createWorkRequest(inspectionId: number, request: CreateWorkRequest): Observable<ApiResponse<InspectionWorkRequest>> {
        return this.http.post<ApiResponse<InspectionWorkRequest>>(`${this.apiUrl}/${inspectionId}/work-request`, request);
    }

    respondToWorkRequest(inspectionId: number, accept: boolean, response?: string): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/work-request/respond`, { accept, response });
    }

    convertToProject(inspectionId: number): Observable<ApiResponse<{ projectId: number }>> {
        return this.http.post<ApiResponse<{ projectId: number }>>(`${this.apiUrl}/${inspectionId}/work-request/convert`, {});
    }

    // Reviews
    getReview(inspectionId: number): Observable<ApiResponse<InspectionReview>> {
        return this.http.get<ApiResponse<InspectionReview>>(`${this.apiUrl}/${inspectionId}/review`);
    }

    createReview(inspectionId: number, review: CreateReview): Observable<ApiResponse<InspectionReview>> {
        return this.http.post<ApiResponse<InspectionReview>>(`${this.apiUrl}/${inspectionId}/review`, review);
    }

    respondToReview(inspectionId: number, response: string): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/review/respond`, { response });
    }

    // Cost Estimates
    getCostEstimate(inspectionId: number): Observable<ApiResponse<InspectionCostEstimate>> {
        return this.http.get<ApiResponse<InspectionCostEstimate>>(`${this.apiUrl}/${inspectionId}/cost-estimate`);
    }

    createCostEstimate(inspectionId: number, estimate: CreateCostEstimate): Observable<ApiResponse<InspectionCostEstimate>> {
        return this.http.post<ApiResponse<InspectionCostEstimate>>(`${this.apiUrl}/${inspectionId}/cost-estimate`, estimate);
    }

    // Chat
    getChatMessages(inspectionId: number): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${inspectionId}/chat`);
    }

    sendChatMessage(inspectionId: number, message: string, attachment?: File): Observable<ApiResponse<any>> {
        if (attachment) {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('attachment', attachment);
            return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${inspectionId}/chat`, formData);
        }
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${inspectionId}/chat`, { message });
    }

    // Checklists
    getChecklistTemplates(): Observable<ApiResponse<InspectionChecklistTemplate[]>> {
        return this.http.get<ApiResponse<InspectionChecklistTemplate[]>>(`${this.apiUrl}/checklist-templates`);
    }

    createChecklistTemplate(template: CreateChecklistTemplate): Observable<ApiResponse<InspectionChecklistTemplate>> {
        return this.http.post<ApiResponse<InspectionChecklistTemplate>>(`${this.apiUrl}/checklist-templates`, template);
    }

    getChecklistResponses(inspectionId: number): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${inspectionId}/checklist-responses`);
    }

    submitChecklistResponse(inspectionId: number, responses: { itemId: number; value: string; notes?: string }[]): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/checklist-responses`, { responses });
    }

    // Team Management
    getTeamMembers(inspectionId: number): Observable<ApiResponse<InspectionTeamMember[]>> {
        return this.http.get<ApiResponse<InspectionTeamMember[]>>(`${this.apiUrl}/${inspectionId}/team`);
    }

    addTeamMember(inspectionId: number, userId: number, role: string, isPrimary: boolean): Observable<ApiResponse<InspectionTeamMember>> {
        return this.http.post<ApiResponse<InspectionTeamMember>>(`${this.apiUrl}/${inspectionId}/team`, { userId, role, isPrimary });
    }

    removeTeamMember(inspectionId: number, memberId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/team/${memberId}`);
    }

    // Signatures
    getSignatures(inspectionId: number): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${inspectionId}/signatures`);
    }

    addSignature(inspectionId: number, signatureData: string, signerName: string, signerRole: string): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${inspectionId}/signatures`, { signatureData, signerName, signerRole });
    }

    // Audio Notes
    getAudioNotes(inspectionId: number): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${inspectionId}/audio-notes`);
    }

    uploadAudioNote(inspectionId: number, audioFile: File, description?: string): Observable<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('audio', audioFile);
        if (description) formData.append('description', description);
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${inspectionId}/audio-notes`, formData);
    }

    // Reports
    generateReport(inspectionId: number): Observable<ApiResponse<{ filePath: string; fileName: string }>> {
        return this.http.post<ApiResponse<{ filePath: string; fileName: string }>>(`${this.apiUrl}/${inspectionId}/report`, {});
    }

    getReport(inspectionId: number): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${inspectionId}/report`);
    }

    // Analytics
    getAnalytics(fromDate?: Date, toDate?: Date): Observable<ApiResponse<InspectionAnalytics>> {
        let params = new HttpParams();
        if (fromDate) params = params.set('fromDate', fromDate.toISOString());
        if (toDate) params = params.set('toDate', toDate.toISOString());
        return this.http.get<ApiResponse<InspectionAnalytics>>(`${this.apiUrl}/analytics`, { params });
    }

    // Reschedule
    requestReschedule(inspectionId: number, proposedDate: Date, proposedTimeStart: string, proposedTimeEnd: string, reason?: string): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${inspectionId}/reschedule`, {
            proposedDate,
            proposedTimeStart,
            proposedTimeEnd,
            reason
        });
    }

    respondToReschedule(inspectionId: number, rescheduleId: number, accept: boolean, notes?: string): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${inspectionId}/reschedule/${rescheduleId}/respond`, { accept, notes });
    }

    // Recurring Inspections
    getRecurringSchedules(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/recurring`);
    }

    createRecurringSchedule(schedule: any): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/recurring`, schedule);
    }

    updateRecurringSchedule(id: number, schedule: any): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/recurring/${id}`, schedule);
    }

    deleteRecurringSchedule(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/recurring/${id}`);
    }
}
