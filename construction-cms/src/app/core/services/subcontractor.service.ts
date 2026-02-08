import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subcontractor {
    id: number;
    companyId?: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
    contactPerson?: string;
    notes?: string;
    tradeSpecialty?: string;
    licenseNumber?: string;
    insurancePolicyNumber?: string;
    insuranceExpiryDate?: Date;
    currentBalance?: number;
    totalPaid?: number;
    totalInvoiced?: number;
    retentionPercentage?: number;
    isActive: boolean;
    isApproved: boolean;
    approvalDate?: Date;
    averageRating?: number;
    totalProjectsCompleted?: number;
    totalProjectsOngoing?: number;
    ratingGrade?: string;
}

export interface SubcontractorContract {
    id: number;
    subcontractorId: number;
    subcontractorName?: string;
    projectId?: number;
    projectName?: string;
    contractNumber: string;
    title: string;
    description?: string;
    contractType: string;
    scopeOfWork: string;
    contractAmount: number;
    retentionAmount?: number;
    status: string;
    startDate: Date;
    plannedEndDate?: Date;
    actualEndDate?: Date;
    completionPercentage?: number;
}

export interface SubcontractorPayment {
    id: number;
    subcontractorId: number;
    subcontractorName?: string;
    contractId?: number;
    paymentNumber: string;
    paymentType: string;
    amount: number;
    retentionDeducted?: number;
    netPayment?: number;
    status: string;
    invoiceDate: Date;
    dueDate?: Date;
    paymentDate?: Date;
}

export interface SubcontractorRating {
    id: number;
    subcontractorId: number;
    subcontractorName?: string;
    evaluatorName: string;
    evaluationDate: Date;
    qualityOfWork: number;
    timeliness: number;
    communication: number;
    professionalism: number;
    safetyCompliance: number;
    budgetAdherence: number;
    overallRating: number;
    ratingGrade: string;
    strengths?: string;
    weaknesses?: string;
    recommendations?: string;
    wouldRecommend: boolean;
    isFinalized: boolean;
}

export interface SubcontractorSummary {
    totalSubcontractors: number;
    activeSubcontractors: number;
    pendingApproval: number;
    expiringInsurance: number;
    totalOutstandingBalance: number;
    averageRating: number;
}

export interface CreateSubcontractorRequest {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
    contactPerson?: string;
    notes?: string;
    tradeSpecialty?: string;
    licenseNumber?: string;
    insurancePolicyNumber?: string;
    insuranceExpiryDate?: Date;
    retentionPercentage?: number;
}

export interface UpdateSubcontractorRequest {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
    contactPerson?: string;
    notes?: string;
    tradeSpecialty?: string;
    licenseNumber?: string;
    insurancePolicyNumber?: string;
    insuranceExpiryDate?: Date;
    retentionPercentage?: number;
    isActive?: boolean;
}

export interface ApproveSubcontractorRequest {
    approvedBy: number;
    notes?: string;
}

export interface CreateContractRequest {
    subcontractorId: number;
    projectId?: number;
    contractNumber: string;
    title: string;
    description?: string;
    contractType: string;
    scopeOfWork: string;
    contractAmount: number;
    retentionAmount?: number;
    startDate: Date;
    plannedEndDate?: Date;
}

export interface UpdateContractRequest {
    title?: string;
    description?: string;
    scopeOfWork?: string;
    contractAmount?: number;
    retentionAmount?: number;
    plannedEndDate?: Date;
}

export interface ContractStatusUpdateRequest {
    status: string;
    actualEndDate?: Date;
    completionPercentage?: number;
}

export interface CreatePaymentRequest {
    subcontractorId: number;
    contractId?: number;
    paymentNumber: string;
    paymentType: string;
    amount: number;
    retentionDeducted?: number;
    invoiceDate: Date;
    dueDate?: Date;
}

export interface UpdatePaymentStatusRequest {
    status: string;
    paymentDate?: Date;
}

export interface CreateRatingRequest {
    subcontractorId: number;
    evaluatorName: string;
    qualityOfWork: number;
    timeliness: number;
    communication: number;
    professionalism: number;
    safetyCompliance: number;
    budgetAdherence: number;
    strengths?: string;
    weaknesses?: string;
    recommendations?: string;
    wouldRecommend: boolean;
}

export interface RatingSummaryDto {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { grade: string; count: number }[];
    averageScores: {
        qualityOfWork: number;
        timeliness: number;
        communication: number;
        professionalism: number;
        safetyCompliance: number;
        budgetAdherence: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class SubcontractorService {
    private apiUrl = 'api/subcontractor';

    constructor(private http: HttpClient) { }

    // --- Subcontractor Endpoints ---

    getSubcontractors(): Observable<Subcontractor[]> {
        return this.http.get<Subcontractor[]>(this.apiUrl);
    }

    getSummary(): Observable<SubcontractorSummary> {
        return this.http.get<SubcontractorSummary>(`${this.apiUrl}/summary`);
    }

    getTopRated(count: number = 5): Observable<Subcontractor[]> {
        return this.http.get<Subcontractor[]>(`${this.apiUrl}/top-rated?count=${count}`);
    }

    getByTrade(trade: string): Observable<Subcontractor[]> {
        return this.http.get<Subcontractor[]>(`${this.apiUrl}/by-trade/${trade}`);
    }

    getExpiringInsurance(daysAhead: number = 30): Observable<Subcontractor[]> {
        return this.http.get<Subcontractor[]>(`${this.apiUrl}/expiring-insurance?daysAhead=${daysAhead}`);
    }

    getSubcontractor(id: number): Observable<Subcontractor> {
        return this.http.get<Subcontractor>(`${this.apiUrl}/${id}`);
    }

    createSubcontractor(request: CreateSubcontractorRequest): Observable<Subcontractor> {
        return this.http.post<Subcontractor>(this.apiUrl, request);
    }

    updateSubcontractor(id: number, request: UpdateSubcontractorRequest): Observable<Subcontractor> {
        return this.http.put<Subcontractor>(`${this.apiUrl}/${id}`, request);
    }

    deleteSubcontractor(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    approveSubcontractor(id: number, request: ApproveSubcontractorRequest): Observable<Subcontractor> {
        return this.http.post<Subcontractor>(`${this.apiUrl}/${id}/approve`, request);
    }

    // --- Contract Endpoints ---

    getActiveContracts(): Observable<SubcontractorContract[]> {
        return this.http.get<SubcontractorContract[]>(`${this.apiUrl}/contracts/active`);
    }

    getAllContracts(): Observable<SubcontractorContract[]> {
        return this.http.get<SubcontractorContract[]>(`${this.apiUrl}/contracts`);
    }

    getContracts(subcontractorId: number): Observable<SubcontractorContract[]> {
        return this.http.get<SubcontractorContract[]>(`${this.apiUrl}/${subcontractorId}/contracts`);
    }

    getContract(id: number): Observable<SubcontractorContract> {
        return this.http.get<SubcontractorContract>(`${this.apiUrl}/contract/${id}`);
    }

    createContract(request: CreateContractRequest): Observable<SubcontractorContract> {
        return this.http.post<SubcontractorContract>(`${this.apiUrl}/contracts`, request);
    }

    updateContract(id: number, request: UpdateContractRequest): Observable<SubcontractorContract> {
        return this.http.put<SubcontractorContract>(`${this.apiUrl}/contract/${id}`, request);
    }

    deleteContract(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/contract/${id}`);
    }

    updateContractStatus(id: number, request: ContractStatusUpdateRequest): Observable<SubcontractorContract> {
        return this.http.patch<SubcontractorContract>(`${this.apiUrl}/contract/${id}/status`, request);
    }

    // --- Payment Endpoints ---

    getPendingPayments(): Observable<SubcontractorPayment[]> {
        return this.http.get<SubcontractorPayment[]>(`${this.apiUrl}/payments/pending`);
    }

    getAllPayments(): Observable<SubcontractorPayment[]> {
        return this.http.get<SubcontractorPayment[]>(`${this.apiUrl}/payments`);
    }

    getPayments(subcontractorId: number): Observable<SubcontractorPayment[]> {
        return this.http.get<SubcontractorPayment[]>(`${this.apiUrl}/${subcontractorId}/payments`);
    }

    getPayment(id: number): Observable<SubcontractorPayment> {
        return this.http.get<SubcontractorPayment>(`${this.apiUrl}/payment/${id}`);
    }

    createPayment(request: CreatePaymentRequest): Observable<SubcontractorPayment> {
        return this.http.post<SubcontractorPayment>(`${this.apiUrl}/payments`, request);
    }

    updatePaymentStatus(id: number, request: UpdatePaymentStatusRequest): Observable<SubcontractorPayment> {
        return this.http.patch<SubcontractorPayment>(`${this.apiUrl}/payment/${id}/status`, request);
    }

    // --- Rating Endpoints ---

    getAllRatings(): Observable<SubcontractorRating[]> {
        return this.http.get<SubcontractorRating[]>(`${this.apiUrl}/ratings`);
    }

    getRatings(subcontractorId: number): Observable<SubcontractorRating[]> {
        return this.http.get<SubcontractorRating[]>(`${this.apiUrl}/${subcontractorId}/ratings`);
    }

    getRatingSummary(subcontractorId: number): Observable<RatingSummaryDto> {
        return this.http.get<RatingSummaryDto>(`${this.apiUrl}/${subcontractorId}/ratings/summary`);
    }

    getRating(id: number): Observable<SubcontractorRating> {
        return this.http.get<SubcontractorRating>(`${this.apiUrl}/rating/${id}`);
    }

    createRating(request: CreateRatingRequest): Observable<SubcontractorRating> {
        return this.http.post<SubcontractorRating>(`${this.apiUrl}/ratings`, request);
    }

    finalizeRating(id: number): Observable<SubcontractorRating> {
        return this.http.post<SubcontractorRating>(`${this.apiUrl}/rating/${id}/finalize`, {});
    }
}
