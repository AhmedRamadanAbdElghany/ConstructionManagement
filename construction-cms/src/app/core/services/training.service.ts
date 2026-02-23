import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Training Program DTOs ─────────────────────────────────────────────────────

export interface TrainingProgramDto {
    id: number;
    title: string;
    description?: string;
    code?: string;
    categoryId: number;
    categoryName: string;
    type: string;
    deliveryMethod: string;
    durationHours?: number;
    durationMinutes?: number;
    contentUrl?: string;
    provider?: string;
    instructor?: string;
    isMandatory: boolean;
    isCertification: boolean;
    certificationValidityMonths?: number;
    passingScore?: number;
    maxAttempts: number;
    cost?: number;
    isActive: boolean;
    companyId?: number;
    enrollmentCount: number;
    completionCount: number;
    materials: TrainingMaterialDto[];
    upcomingSessions: TrainingSessionDto[];
}

export interface CreateTrainingProgramRequest {
    title: string;
    description?: string;
    code?: string;
    categoryId: number;
    type: string;
    deliveryMethod: string;
    durationHours?: number;
    durationMinutes?: number;
    contentUrl?: string;
    provider?: string;
    instructor?: string;
    isMandatory: boolean;
    isCertification: boolean;
    certificationValidityMonths?: number;
    passingScore?: number;
    maxAttempts: number;
    cost?: number;
}

export interface UpdateTrainingProgramRequest {
    title: string;
    description?: string;
    code?: string;
    categoryId: number;
    type: string;
    deliveryMethod: string;
    durationHours?: number;
    durationMinutes?: number;
    contentUrl?: string;
    provider?: string;
    instructor?: string;
    isMandatory: boolean;
    isCertification: boolean;
    certificationValidityMonths?: number;
    passingScore?: number;
    maxAttempts: number;
    cost?: number;
    isActive: boolean;
}

// ── Training Category DTOs ────────────────────────────────────────────────────

export interface TrainingCategoryDto {
    id: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    parentCategoryId?: number;
    parentCategoryName?: string;
    programCount: number;
    subCategories: TrainingCategoryDto[];
}

export interface CreateTrainingCategoryRequest {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    parentCategoryId?: number;
}

export interface UpdateTrainingCategoryRequest {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    parentCategoryId?: number;
}

// ── Training Session DTOs ─────────────────────────────────────────────────────

export interface TrainingSessionDto {
    id: number;
    trainingProgramId: number;
    trainingTitle: string;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    virtualMeetingUrl?: string;
    maxParticipants: number;
    currentParticipants: number;
    availableSpots: number;
    instructor?: string;
    status: string;
    notes?: string;
    isUserEnrolled?: boolean;
}

export interface CreateTrainingSessionRequest {
    trainingProgramId: number;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    virtualMeetingUrl?: string;
    maxParticipants: number;
    instructor?: string;
    notes?: string;
}

export interface UpdateTrainingSessionRequest {
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    virtualMeetingUrl?: string;
    maxParticipants: number;
    instructor?: string;
    status: string;
    notes?: string;
}

// ── Training Enrollment DTOs ──────────────────────────────────────────────────

export interface TrainingEnrollmentDto {
    id: number;
    trainingProgramId: number;
    trainingTitle: string;
    trainingCode: string;
    categoryName: string;
    userId: number;
    userName: string;
    userAvatar?: string;
    sessionId?: number;
    sessionTitle?: string;
    status: string;
    enrolledAt: string;
    startedAt?: string;
    completedAt?: string;
    dueDate?: string;
    score?: number;
    passed: boolean;
    attempts: number;
    timeSpentMinutes?: number;
    notes?: string;
    certificateNumber?: string;
    certificateIssuedAt?: string;
    certificateExpiresAt?: string;
    certificateUrl?: string;
    progressPercentage: number;
}

export interface EnrollUserRequest {
    trainingProgramId: number;
    userId: number;
    sessionId?: number;
    dueDate?: string;
    notes?: string;
}

export interface BulkEnrollRequest {
    trainingProgramId: number;
    userIds: number[];
    sessionId?: number;
    dueDate?: string;
}

export interface UpdateEnrollmentRequest {
    dueDate?: string;
    notes?: string;
}

export interface RecordProgressRequest {
    enrollmentId: number;
    moduleName: string;
    moduleOrder: number;
    progressPercentage: number;
    timeSpentMinutes?: number;
}

export interface CompleteTrainingRequest {
    enrollmentId: number;
    score?: number;
    passed: boolean;
    notes?: string;
}

// ── Training Material DTOs ────────────────────────────────────────────────────

export interface TrainingMaterialDto {
    id: number;
    trainingProgramId: number;
    title: string;
    description?: string;
    type: string;
    filePath?: string;
    contentUrl?: string;
    durationMinutes?: number;
    order: number;
    isRequired: boolean;
    isActive: boolean;
}

export interface CreateTrainingMaterialRequest {
    trainingProgramId: number;
    title: string;
    description?: string;
    type: string;
    filePath?: string;
    contentUrl?: string;
    durationMinutes?: number;
    order: number;
    isRequired: boolean;
}

// ── Quiz DTOs ─────────────────────────────────────────────────────────────────

export interface TrainingQuizDto {
    id: number;
    trainingProgramId: number;
    title: string;
    description?: string;
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    isActive: boolean;
    questionCount: number;
    questions: QuizQuestionDto[];
}

export interface QuizQuestionDto {
    id: number;
    quizId: number;
    questionText: string;
    questionType: string;
    explanation?: string;
    points: number;
    order: number;
    answers: QuizAnswerDto[];
}

export interface QuizAnswerDto {
    id: number;
    questionId: number;
    answerText: string;
    isCorrect: boolean;
    order: number;
}

export interface CreateQuizRequest {
    trainingProgramId: number;
    title: string;
    description?: string;
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    questions: CreateQuizQuestionRequest[];
}

export interface CreateQuizQuestionRequest {
    questionText: string;
    questionType: string;
    explanation?: string;
    points: number;
    order: number;
    answers: CreateQuizAnswerRequest[];
}

export interface CreateQuizAnswerRequest {
    answerText: string;
    isCorrect: boolean;
    order: number;
}

export interface SubmitQuizRequest {
    enrollmentId: number;
    quizId: number;
    responses: QuizResponseRequest[];
}

export interface QuizResponseRequest {
    questionId: number;
    selectedAnswerId?: number;
    textResponse?: string;
}

export interface QuizAttemptResultDto {
    attemptId: number;
    score: number;
    passed: boolean;
    attemptNumber: number;
    remainingAttempts: number;
    questionResults: QuestionResultDto[];
}

export interface QuestionResultDto {
    questionId: number;
    questionText: string;
    selectedAnswerId?: number;
    selectedAnswerText?: string;
    correctAnswerId: number;
    correctAnswerText: string;
    isCorrect: boolean;
    pointsEarned: number;
    pointsPossible: number;
    explanation?: string;
}

// ── Reports DTOs ──────────────────────────────────────────────────────────────

export interface TrainingDashboardDto {
    totalPrograms: number;
    activeEnrollments: number;
    completedThisMonth: number;
    overdueTrainings: number;
    upcomingSessions: number;
    averageCompletionRate: number;
    mandatoryTrainings: TrainingProgramDto[];
    upcomingSessionList: TrainingSessionDto[];
    categoryStats: CategoryStatsDto[];
}

export interface CategoryStatsDto {
    categoryName: string;
    programCount: number;
    enrollmentCount: number;
    completionCount: number;
    completionRate: number;
}

export interface UserTrainingSummaryDto {
    userId: number;
    userName: string;
    totalEnrollments: number;
    completedCount: number;
    inProgressCount: number;
    overdueCount: number;
    completionRate: number;
    activeEnrollments: TrainingEnrollmentDto[];
    certifications: CertificationDto[];
}

export interface CertificationDto {
    id: number;
    trainingTitle: string;
    certificateNumber: string;
    issuedAt: string;
    expiresAt?: string;
    isValid: boolean;
    certificateUrl?: string;
}

export interface TrainingComplianceReportDto {
    totalRequired: number;
    completed: number;
    pending: number;
    overdue: number;
    complianceRate: number;
    userCompliance: UserComplianceDto[];
}

export interface UserComplianceDto {
    userId: number;
    userName: string;
    department?: string;
    requiredTrainings: number;
    completedTrainings: number;
    overdueTrainings: number;
    complianceRate: number;
    overdueDetails: TrainingEnrollmentDto[];
}

@Injectable({
    providedIn: 'root'
})
export class TrainingService {
    private http = inject(HttpClient);
    private baseUrl = '/api/training';

    // ── Training Programs ───────────────────────────────────────────────────────

    getPrograms(categoryId?: number, mandatory?: boolean, companyId?: number): Observable<TrainingProgramDto[]> {
        let params = new HttpParams();
        if (categoryId) params = params.set('categoryId', categoryId.toString());
        if (mandatory !== undefined) params = params.set('mandatory', mandatory.toString());
        if (companyId) params = params.set('companyId', companyId.toString());
        return this.http.get<TrainingProgramDto[]>(`${this.baseUrl}/programs`, { params });
    }

    getProgram(id: number): Observable<TrainingProgramDto> {
        return this.http.get<TrainingProgramDto>(`${this.baseUrl}/programs/${id}`);
    }

    createProgram(request: CreateTrainingProgramRequest, companyId?: number): Observable<TrainingProgramDto> {
        let params = new HttpParams();
        if (companyId) params = params.set('companyId', companyId.toString());
        return this.http.post<TrainingProgramDto>(`${this.baseUrl}/programs`, request, { params });
    }

    updateProgram(id: number, request: UpdateTrainingProgramRequest): Observable<TrainingProgramDto> {
        return this.http.put<TrainingProgramDto>(`${this.baseUrl}/programs/${id}`, request);
    }

    deleteProgram(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/programs/${id}`);
    }

    // ── Training Categories ─────────────────────────────────────────────────────

    getCategories(companyId?: number): Observable<TrainingCategoryDto[]> {
        let params = new HttpParams();
        if (companyId) params = params.set('companyId', companyId.toString());
        return this.http.get<TrainingCategoryDto[]>(`${this.baseUrl}/categories`, { params });
    }

    getCategory(id: number): Observable<TrainingCategoryDto> {
        return this.http.get<TrainingCategoryDto>(`${this.baseUrl}/categories/${id}`);
    }

    createCategory(request: CreateTrainingCategoryRequest, companyId?: number): Observable<TrainingCategoryDto> {
        let params = new HttpParams();
        if (companyId) params = params.set('companyId', companyId.toString());
        return this.http.post<TrainingCategoryDto>(`${this.baseUrl}/categories`, request, { params });
    }

    updateCategory(id: number, request: UpdateTrainingCategoryRequest): Observable<TrainingCategoryDto> {
        return this.http.put<TrainingCategoryDto>(`${this.baseUrl}/categories/${id}`, request);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
    }

    // ── Training Sessions ───────────────────────────────────────────────────────

    getSessions(programId?: number, fromDate?: string, toDate?: string): Observable<TrainingSessionDto[]> {
        let params = new HttpParams();
        if (programId) params = params.set('programId', programId.toString());
        if (fromDate) params = params.set('fromDate', fromDate);
        if (toDate) params = params.set('toDate', toDate);
        return this.http.get<TrainingSessionDto[]>(`${this.baseUrl}/sessions`, { params });
    }

    getSession(id: number): Observable<TrainingSessionDto> {
        return this.http.get<TrainingSessionDto>(`${this.baseUrl}/sessions/${id}`);
    }

    createSession(request: CreateTrainingSessionRequest): Observable<TrainingSessionDto> {
        return this.http.post<TrainingSessionDto>(`${this.baseUrl}/sessions`, request);
    }

    updateSession(id: number, request: UpdateTrainingSessionRequest): Observable<TrainingSessionDto> {
        return this.http.put<TrainingSessionDto>(`${this.baseUrl}/sessions/${id}`, request);
    }

    deleteSession(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
    }

    enrollInSession(sessionId: number): Observable<TrainingSessionDto> {
        return this.http.post<TrainingSessionDto>(`${this.baseUrl}/sessions/${sessionId}/enroll`, {});
    }

    // ── Enrollments ─────────────────────────────────────────────────────────────

    getEnrollments(userId?: number, programId?: number, status?: string): Observable<TrainingEnrollmentDto[]> {
        let params = new HttpParams();
        if (userId) params = params.set('userId', userId.toString());
        if (programId) params = params.set('programId', programId.toString());
        if (status) params = params.set('status', status);
        return this.http.get<TrainingEnrollmentDto[]>(`${this.baseUrl}/enrollments`, { params });
    }

    getEnrollment(id: number): Observable<TrainingEnrollmentDto> {
        return this.http.get<TrainingEnrollmentDto>(`${this.baseUrl}/enrollments/${id}`);
    }

    getMyEnrollments(): Observable<TrainingEnrollmentDto[]> {
        return this.http.get<TrainingEnrollmentDto[]>(`${this.baseUrl}/my-enrollments`);
    }

    enrollUser(request: EnrollUserRequest): Observable<TrainingEnrollmentDto> {
        return this.http.post<TrainingEnrollmentDto>(`${this.baseUrl}/enroll`, request);
    }

    bulkEnroll(request: BulkEnrollRequest): Observable<TrainingEnrollmentDto[]> {
        return this.http.post<TrainingEnrollmentDto[]>(`${this.baseUrl}/enroll/bulk`, request);
    }

    updateEnrollment(id: number, request: UpdateEnrollmentRequest): Observable<TrainingEnrollmentDto> {
        return this.http.put<TrainingEnrollmentDto>(`${this.baseUrl}/enrollments/${id}`, request);
    }

    cancelEnrollment(id: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/enrollments/${id}/cancel`, {});
    }

    startTraining(id: number): Observable<TrainingEnrollmentDto> {
        return this.http.post<TrainingEnrollmentDto>(`${this.baseUrl}/enrollments/${id}/start`, {});
    }

    recordProgress(request: RecordProgressRequest): Observable<TrainingEnrollmentDto> {
        return this.http.post<TrainingEnrollmentDto>(`${this.baseUrl}/enrollments/progress`, request);
    }

    completeTraining(request: CompleteTrainingRequest): Observable<TrainingEnrollmentDto> {
        return this.http.post<TrainingEnrollmentDto>(`${this.baseUrl}/enrollments/complete`, request);
    }

    // ── Materials ───────────────────────────────────────────────────────────────

    getMaterials(programId: number): Observable<TrainingMaterialDto[]> {
        return this.http.get<TrainingMaterialDto[]>(`${this.baseUrl}/programs/${programId}/materials`);
    }

    createMaterial(request: CreateTrainingMaterialRequest): Observable<TrainingMaterialDto> {
        return this.http.post<TrainingMaterialDto>(`${this.baseUrl}/materials`, request);
    }

    deleteMaterial(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/materials/${id}`);
    }

    // ── Quizzes ─────────────────────────────────────────────────────────────────

    getQuiz(quizId: number): Observable<TrainingQuizDto> {
        return this.http.get<TrainingQuizDto>(`${this.baseUrl}/quizzes/${quizId}`);
    }

    createQuiz(request: CreateQuizRequest): Observable<TrainingQuizDto> {
        return this.http.post<TrainingQuizDto>(`${this.baseUrl}/quizzes`, request);
    }

    submitQuiz(request: SubmitQuizRequest): Observable<QuizAttemptResultDto> {
        return this.http.post<QuizAttemptResultDto>(`${this.baseUrl}/quizzes/submit`, request);
    }

    getQuizAttempts(enrollmentId: number, quizId: number): Observable<QuizAttemptResultDto[]> {
        return this.http.get<QuizAttemptResultDto[]>(`${this.baseUrl}/enrollments/${enrollmentId}/quizzes/${quizId}/attempts`);
    }

    // ── Certificates ────────────────────────────────────────────────────────────

    generateCertificate(enrollmentId: number): Observable<{ certificateUrl: string }> {
        return this.http.post<{ certificateUrl: string }>(`${this.baseUrl}/enrollments/${enrollmentId}/certificate`, {});
    }

    validateCertificate(certificateNumber: string): Observable<{ isValid: boolean }> {
        return this.http.get<{ isValid: boolean }>(`${this.baseUrl}/certificates/validate/${certificateNumber}`);
    }

    getMyCertifications(): Observable<CertificationDto[]> {
        return this.http.get<CertificationDto[]>(`${this.baseUrl}/my-certifications`);
    }

    // ── Reports ─────────────────────────────────────────────────────────────────

    getDashboard(companyId?: number): Observable<TrainingDashboardDto> {
        let params = new HttpParams();
        if (companyId) params = params.set('companyId', companyId.toString());
        return this.http.get<TrainingDashboardDto>(`${this.baseUrl}/dashboard`, { params });
    }

    getUserSummary(userId: number): Observable<UserTrainingSummaryDto> {
        return this.http.get<UserTrainingSummaryDto>(`${this.baseUrl}/users/${userId}/summary`);
    }

    getComplianceReport(companyId?: number, roleId?: number): Observable<TrainingComplianceReportDto> {
        let params = new HttpParams();
        if (companyId) params = params.set('companyId', companyId.toString());
        if (roleId) params = params.set('roleId', roleId.toString());
        return this.http.get<TrainingComplianceReportDto>(`${this.baseUrl}/compliance`, { params });
    }

    getOverdueUsers(companyId?: number): Observable<UserComplianceDto[]> {
        let params = new HttpParams();
        if (companyId) params = params.set('companyId', companyId.toString());
        return this.http.get<UserComplianceDto[]>(`${this.baseUrl}/overdue`, { params });
    }
}
