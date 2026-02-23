import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Evaluation Criteria ───────────────────────────────────────────────────────

export interface EvaluationCriteriaDto {
    id: number;
    name: string;
    description?: string;
    category: string;
    maxScore: number;
    weight: number;
    isActive: boolean;
    companyId?: number;
}

export interface CreateEvaluationCriteriaRequest {
    name: string;
    description?: string;
    category: string;
    maxScore: number;
    weight: number;
}

export interface UpdateEvaluationCriteriaRequest {
    name: string;
    description?: string;
    category: string;
    maxScore: number;
    weight: number;
    isActive: boolean;
}

// ── Evaluation Periods ────────────────────────────────────────────────────────

export interface EvaluationPeriodDto {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    type: string;
    selfAssessmentDue: string;
    managerAssessmentDue: string;
    status: string;
    companyId?: number;
    evaluationCount: number;
    completedCount: number;
}

export interface CreateEvaluationPeriodRequest {
    name: string;
    startDate: string;
    endDate: string;
    type: string;
    selfAssessmentDue?: string;
    managerAssessmentDue?: string;
}

export interface UpdateEvaluationPeriodRequest {
    name: string;
    startDate: string;
    endDate: string;
    type: string;
    selfAssessmentDue: string;
    managerAssessmentDue: string;
    status: string;
}

// ── Performance Evaluations ───────────────────────────────────────────────────

export interface EvaluationCriteriaScoreDto {
    id: number;
    criteriaId: number;
    criteriaName: string;
    category: string;
    maxScore: number;
    weight: number;
    managerScore?: number;
    selfScore?: number;
    managerComments?: string;
    selfComments?: string;
}

export interface EvaluationGoalDto {
    id: number;
    description: string;
    targetDate: string;
    status: string;
    progress: number;
    comments?: string;
    isCarryOver: boolean;
}

export interface PeerFeedbackDto {
    id: number;
    evaluationId: number;
    reviewerId?: number;
    reviewerName?: string;
    overallRating: number;
    strengths?: string;
    areasForImprovement?: string;
    comments?: string;
    isAnonymous: boolean;
    submittedAt: string;
}

export interface PerformanceEvaluationDto {
    id: number;
    periodId: number;
    periodName: string;
    employeeId: number;
    employeeName: string;
    employeeAvatar?: string;
    employeePosition?: string;
    managerId: number;
    managerName: string;
    projectId?: number;
    overallScore: number;
    selfAssessmentScore?: number;
    status: string;
    selfAssessmentComments?: string;
    managerComments?: string;
    goalsAchieved?: string;
    goalsForNextPeriod?: string;
    areasForImprovement?: string;
    trainingRecommendations?: string;
    acknowledgedAt?: string;
    acknowledgmentComments?: string;
    completedAt?: string;
    createdAt: string;
    criteriaScores: EvaluationCriteriaScoreDto[];
    goals: EvaluationGoalDto[];
    peerFeedbacks: PeerFeedbackDto[];
}

export interface CreatePerformanceEvaluationRequest {
    periodId: number;
    employeeId: number;
    managerId: number;
    projectId?: number;
}

export interface CriteriaScoreRequest {
    criteriaId: number;
    score: number;
    comments?: string;
}

export interface SelfAssessmentRequest {
    overallScore: number;
    comments?: string;
    goalsAchieved?: string;
    goalsForNextPeriod?: string;
    areasForImprovement?: string;
    criteriaScores: CriteriaScoreRequest[];
}

export interface ManagerAssessmentRequest {
    overallScore: number;
    comments?: string;
    trainingRecommendations?: string;
    criteriaScores: CriteriaScoreRequest[];
}

export interface AcknowledgmentRequest {
    comments?: string;
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export interface CreateGoalRequest {
    evaluationId: number;
    description: string;
    targetDate: string;
    isCarryOver: boolean;
}

export interface UpdateGoalRequest {
    description: string;
    targetDate: string;
    status: string;
    progress: number;
    comments?: string;
}

// ── Peer Feedback ─────────────────────────────────────────────────────────────

export interface CreatePeerFeedbackRequest {
    overallRating: number;
    strengths?: string;
    areasForImprovement?: string;
    comments?: string;
    isAnonymous: boolean;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface PerformanceDistributionDto {
    range: string;
    count: number;
    percentage: number;
}

export interface TopPerformerDto {
    employeeId: number;
    employeeName: string;
    position?: string;
    score: number;
}

export interface CategoryAverageDto {
    category: string;
    averageScore: number;
    maxPossibleScore: number;
}

export interface PerformanceReportDto {
    periodName: string;
    totalEmployees: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    averageScore: number;
    scoreDistribution: PerformanceDistributionDto[];
    topPerformers: TopPerformerDto[];
    categoryAverages: CategoryAverageDto[];
}

export interface PerformanceHistoryItemDto {
    periodName: string;
    periodStart: string;
    periodEnd: string;
    score: number;
    managerComments?: string;
}

export interface EmployeePerformanceHistoryDto {
    employeeId: number;
    employeeName: string;
    history: PerformanceHistoryItemDto[];
}

@Injectable({
    providedIn: 'root'
})
export class PerformanceEvaluationService {
    private http = inject(HttpClient);
    private apiUrl = '/api/performanceevaluations';

    // ── Evaluation Criteria ─────────────────────────────────────────────────────

    getCriteria(companyId?: number): Observable<EvaluationCriteriaDto[]> {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        return this.http.get<EvaluationCriteriaDto[]>(`${this.apiUrl}/criteria`, { params });
    }

    createCriteria(request: CreateEvaluationCriteriaRequest, companyId?: number): Observable<EvaluationCriteriaDto> {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        return this.http.post<EvaluationCriteriaDto>(`${this.apiUrl}/criteria`, request, { params });
    }

    updateCriteria(id: number, request: UpdateEvaluationCriteriaRequest): Observable<EvaluationCriteriaDto> {
        return this.http.put<EvaluationCriteriaDto>(`${this.apiUrl}/criteria/${id}`, request);
    }

    deleteCriteria(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/criteria/${id}`);
    }

    // ── Evaluation Periods ──────────────────────────────────────────────────────

    getPeriods(companyId?: number): Observable<EvaluationPeriodDto[]> {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        return this.http.get<EvaluationPeriodDto[]>(`${this.apiUrl}/periods`, { params });
    }

    getPeriod(id: number): Observable<EvaluationPeriodDto> {
        return this.http.get<EvaluationPeriodDto>(`${this.apiUrl}/periods/${id}`);
    }

    createPeriod(request: CreateEvaluationPeriodRequest, companyId?: number): Observable<EvaluationPeriodDto> {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        return this.http.post<EvaluationPeriodDto>(`${this.apiUrl}/periods`, request, { params });
    }

    updatePeriod(id: number, request: UpdateEvaluationPeriodRequest): Observable<EvaluationPeriodDto> {
        return this.http.put<EvaluationPeriodDto>(`${this.apiUrl}/periods/${id}`, request);
    }

    activatePeriod(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/periods/${id}/activate`, {});
    }

    closePeriod(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/periods/${id}/close`, {});
    }

    // ── Evaluations ─────────────────────────────────────────────────────────────

    getEvaluations(
        periodId?: number,
        employeeId?: number,
        managerId?: number,
        status?: string
    ): Observable<PerformanceEvaluationDto[]> {
        let params = new HttpParams();
        if (periodId) params = params.set('periodId', periodId.toString());
        if (employeeId) params = params.set('employeeId', employeeId.toString());
        if (managerId) params = params.set('managerId', managerId.toString());
        if (status) params = params.set('status', status);
        return this.http.get<PerformanceEvaluationDto[]>(this.apiUrl, { params });
    }

    getEvaluation(id: number): Observable<PerformanceEvaluationDto> {
        return this.http.get<PerformanceEvaluationDto>(`${this.apiUrl}/${id}`);
    }

    createEvaluation(request: CreatePerformanceEvaluationRequest): Observable<PerformanceEvaluationDto> {
        return this.http.post<PerformanceEvaluationDto>(this.apiUrl, request);
    }

    startSelfAssessment(id: number): Observable<PerformanceEvaluationDto> {
        return this.http.post<PerformanceEvaluationDto>(`${this.apiUrl}/${id}/start-self-assessment`, {});
    }

    submitSelfAssessment(id: number, request: SelfAssessmentRequest): Observable<PerformanceEvaluationDto> {
        return this.http.post<PerformanceEvaluationDto>(`${this.apiUrl}/${id}/submit-self-assessment`, request);
    }

    submitManagerAssessment(id: number, request: ManagerAssessmentRequest): Observable<PerformanceEvaluationDto> {
        return this.http.post<PerformanceEvaluationDto>(`${this.apiUrl}/${id}/submit-manager-assessment`, request);
    }

    acknowledgeEvaluation(id: number, request: AcknowledgmentRequest): Observable<PerformanceEvaluationDto> {
        return this.http.post<PerformanceEvaluationDto>(`${this.apiUrl}/${id}/acknowledge`, request);
    }

    deleteEvaluation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // ── Goals ───────────────────────────────────────────────────────────────────

    addGoal(request: CreateGoalRequest): Observable<EvaluationGoalDto> {
        return this.http.post<EvaluationGoalDto>(`${this.apiUrl}/goals`, request);
    }

    updateGoal(goalId: number, request: UpdateGoalRequest): Observable<EvaluationGoalDto> {
        return this.http.put<EvaluationGoalDto>(`${this.apiUrl}/goals/${goalId}`, request);
    }

    deleteGoal(goalId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/goals/${goalId}`);
    }

    // ── Peer Feedback ───────────────────────────────────────────────────────────

    getPeerFeedback(evaluationId: number): Observable<PeerFeedbackDto[]> {
        return this.http.get<PeerFeedbackDto[]>(`${this.apiUrl}/${evaluationId}/peer-feedback`);
    }

    submitPeerFeedback(evaluationId: number, request: CreatePeerFeedbackRequest): Observable<PeerFeedbackDto> {
        return this.http.post<PeerFeedbackDto>(`${this.apiUrl}/${evaluationId}/peer-feedback`, request);
    }

    // ── Reports ─────────────────────────────────────────────────────────────────

    getReport(periodId: number): Observable<PerformanceReportDto> {
        return this.http.get<PerformanceReportDto>(`${this.apiUrl}/reports/${periodId}`);
    }

    getEmployeeHistory(employeeId: number, count?: number): Observable<EmployeePerformanceHistoryDto> {
        let params = new HttpParams();
        if (count) {
            params = params.set('count', count.toString());
        }
        return this.http.get<EmployeePerformanceHistoryDto>(`${this.apiUrl}/history/${employeeId}`, { params });
    }

    getTopPerformers(periodId: number, count: number = 10): Observable<TopPerformerDto[]> {
        let params = new HttpParams().set('count', count.toString());
        return this.http.get<TopPerformerDto[]>(`${this.apiUrl}/top-performers/${periodId}`, { params });
    }
}
