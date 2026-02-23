import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================================
// Employee Documents Management Types
// ============================================================================

export interface EmployeeDocumentCategory {
    id: number;
    companyId?: number;
    name: string;
    description?: string;
    hasExpiry: boolean;
    expiryAlertDays?: number;
    isRequired: boolean;
    displayOrder: number;
    isActive: boolean;
    documentCount: number;
}

export interface EmployeeDocument {
    id: number;
    companyId?: number;
    employeeId: number;
    employeeName: string;
    categoryId: number;
    categoryName: string;
    documentName: string;
    description?: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    issueDate?: Date;
    expiryDate?: Date;
    status: string;
    isVerified: boolean;
    verifiedByUserId?: number;
    verifiedByName?: string;
    verifiedAt?: Date;
    uploadedByUserId: number;
    uploadedByName: string;
    createdAt: Date;
    versionCount: number;
    isExpiringSoon: boolean;
    daysUntilExpiry?: number;
}

export interface DocumentVersion {
    id: number;
    version: number;
    fileName: string;
    fileSize: number;
    changeNotes?: string;
    uploadedByName: string;
    uploadedAt: Date;
}

export interface DocumentExpiryAlert {
    id: number;
    documentId: number;
    documentName: string;
    employeeId: number;
    employeeName: string;
    expiryDate: Date;
    daysUntilExpiry: number;
    alertType: string;
    isSent: boolean;
    sentAt?: Date;
}

export interface ExpiringDocumentsReport {
    totalExpiring: number;
    expiringIn7Days: number;
    expiringIn30Days: number;
    expired: number;
    documents: DocumentExpiryAlert[];
}

// ============================================================================
// Worker Self-Service Types
// ============================================================================

export interface WorkerProfileUpdateRequest {
    id: number;
    companyId?: number;
    workerId: number;
    workerName: string;
    fieldName: string;
    oldValue?: string;
    newValue?: string;
    status: string;
    reviewedByUserId?: number;
    reviewedByName?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
    createdAt: Date;
}

export interface EmergencyContact {
    id: number;
    companyId?: number;
    userId: number;
    name: string;
    relationship: string;
    phoneNumber: string;
    alternativePhone?: string;
    email?: string;
    address?: string;
    isPrimary: boolean;
}

export interface BankAccount {
    id: number;
    companyId?: number;
    userId: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    iban?: string;
    branchCode?: string;
    isActive: boolean;
}

export interface WorkerProfile {
    userId: number;
    name: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    profilePicture?: string;
    emergencyContacts: EmergencyContact[];
    bankAccounts: BankAccount[];
    pendingRequests: WorkerProfileUpdateRequest[];
}

// ============================================================================
// Employee Onboarding Types
// ============================================================================

export interface OnboardingTemplate {
    id: number;
    companyId?: number;
    name: string;
    description?: string;
    departmentId?: number;
    departmentName?: string;
    roleId?: number;
    roleName?: string;
    estimatedDays: number;
    isActive: boolean;
    taskCount: number;
    createdByName: string;
    createdAt: Date;
}

export interface OnboardingTaskTemplate {
    id: number;
    onboardingTemplateId: number;
    title: string;
    description?: string;
    category: string;
    order: number;
    estimatedDays: number;
    isRequired: boolean;
    assignedToRole?: string;
}

export interface OnboardingProcess {
    id: number;
    companyId?: number;
    employeeId: number;
    employeeName: string;
    templateId: number;
    templateName: string;
    startDate: Date;
    targetCompletionDate?: Date;
    completedAt?: Date;
    status: string;
    progress: number;
    assignedToUserId: number;
    assignedToName: string;
    tasks: OnboardingTask[];
}

export interface OnboardingTask {
    id: number;
    onboardingProcessId: number;
    title: string;
    description?: string;
    category: string;
    order: number;
    status: string;
    dueDate?: Date;
    completedAt?: Date;
    completedByUserId?: number;
    completedByName?: string;
    notes?: string;
    requiredDocuments: OnboardingTaskDocument[];
}

export interface OnboardingTaskDocument {
    id: number;
    documentName: string;
    isRequired: boolean;
    isUploaded: boolean;
    filePath?: string;
    uploadedAt?: Date;
}

export interface OnboardingDashboard {
    totalInProgress: number;
    completedThisMonth: number;
    overdue: number;
    averageCompletionDays: number;
    recentProcesses: OnboardingProcess[];
}

// ============================================================================
// Disciplinary Actions Types
// ============================================================================

export interface DisciplinaryActionType {
    id: number;
    companyId?: number;
    name: string;
    description?: string;
    severityLevel: number;
    points?: number;
    validityPeriodDays?: number;
    isActive: boolean;
    usageCount: number;
}

export interface DisciplinaryAction {
    id: number;
    companyId?: number;
    employeeId: number;
    employeeName: string;
    actionTypeId: number;
    actionTypeName: string;
    severityLevel: number;
    reason: string;
    description?: string;
    incidentDate: Date;
    issueDate: Date;
    issuedByUserId: number;
    issuedByName: string;
    status: string;
    expiryDate?: Date;
    documentPath?: string;
    hasAppeal: boolean;
    createdAt: Date;
}

export interface DisciplinaryAppeal {
    id: number;
    disciplinaryActionId: number;
    reason: string;
    submittedAt: Date;
    status: string;
    reviewedByUserId?: number;
    reviewedByName?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
}

export interface EmployeeDisciplinaryRecord {
    id: number;
    employeeId: number;
    employeeName: string;
    totalPoints: number;
    activeWarnings: number;
    lastWarningDate?: Date;
    nextExpiryDate?: Date;
    recentActions: DisciplinaryAction[];
}

export interface DisciplinaryDashboard {
    totalActiveActions: number;
    pendingAppeals: number;
    actionsThisMonth: number;
    expiringThisMonth: number;
    recentActions: DisciplinaryAction[];
}

// ============================================================================
// Skills Matrix Types
// ============================================================================

export interface SkillCategory {
    id: number;
    companyId?: number;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    skillCount: number;
}

export interface Skill {
    id: number;
    companyId?: number;
    categoryId: number;
    categoryName: string;
    name: string;
    description?: string;
    measurementCriteria?: string;
    isActive: boolean;
    employeeCount: number;
}

export interface CompetencyLevel {
    id: number;
    companyId?: number;
    name: string;
    level: number;
    description?: string;
    points: number;
}

export interface EmployeeSkill {
    id: number;
    companyId?: number;
    employeeId: number;
    employeeName: string;
    skillId: number;
    skillName: string;
    categoryName: string;
    competencyLevelId: number;
    competencyLevelName: string;
    competencyLevel: number;
    assessedAt: Date;
    assessedByName: string;
    expiryDate?: Date;
    notes?: string;
    certificationId?: number;
    certificationName?: string;
}

export interface SkillRequirement {
    id: number;
    companyId?: number;
    entityType: string;
    entityId: number;
    entityName?: string;
    skillId: number;
    skillName: string;
    minimumCompetencyLevelId: number;
    minimumCompetencyLevelName: string;
    minimumLevel: number;
    isRequired: boolean;
    numberOfPeople?: number;
}

export interface SkillGapAnalysis {
    id: number;
    companyId?: number;
    employeeId: number;
    employeeName: string;
    skillId: number;
    skillName: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    recommendedTraining?: string;
    analyzedAt: Date;
}

export interface EmployeeSkillsProfile {
    employeeId: number;
    employeeName: string;
    totalSkills: number;
    averageLevel: number;
    skills: EmployeeSkill[];
    gaps: SkillGapAnalysis[];
}

export interface SkillsMatrixDashboard {
    totalSkills: number;
    totalCategories: number;
    totalAssessments: number;
    employeesWithSkills: number;
    identifiedGaps: number;
    categories: SkillCategory[];
    topGaps: SkillGapAnalysis[];
}

// ============================================================================
// Employee Documents Service
// ============================================================================

@Injectable({
    providedIn: 'root'
})
export class EmployeeDocumentService {
    private apiUrl = '/api/employeedocuments';

    constructor(private http: HttpClient) { }

    // Categories
    getCategories(): Observable<EmployeeDocumentCategory[]> {
        return this.http.get<EmployeeDocumentCategory[]>(`${this.apiUrl}/categories`);
    }

    getCategory(id: number): Observable<EmployeeDocumentCategory> {
        return this.http.get<EmployeeDocumentCategory>(`${this.apiUrl}/categories/${id}`);
    }

    createCategory(request: Partial<EmployeeDocumentCategory>): Observable<EmployeeDocumentCategory> {
        return this.http.post<EmployeeDocumentCategory>(`${this.apiUrl}/categories`, request);
    }

    updateCategory(id: number, request: Partial<EmployeeDocumentCategory>): Observable<EmployeeDocumentCategory> {
        return this.http.put<EmployeeDocumentCategory>(`${this.apiUrl}/categories/${id}`, request);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
    }

    // Documents
    getDocuments(employeeId?: number, categoryId?: number, status?: string): Observable<EmployeeDocument[]> {
        const params: any = {};
        if (employeeId) params.employeeId = employeeId;
        if (categoryId) params.categoryId = categoryId;
        if (status) params.status = status;
        return this.http.get<EmployeeDocument[]>(this.apiUrl, { params });
    }

    getDocument(id: number): Observable<EmployeeDocument> {
        return this.http.get<EmployeeDocument>(`${this.apiUrl}/${id}`);
    }

    uploadDocument(formData: FormData): Observable<EmployeeDocument> {
        return this.http.post<EmployeeDocument>(this.apiUrl, formData);
    }

    updateDocument(id: number, request: Partial<EmployeeDocument>): Observable<EmployeeDocument> {
        return this.http.put<EmployeeDocument>(`${this.apiUrl}/${id}`, request);
    }

    deleteDocument(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    uploadNewVersion(id: number, formData: FormData): Observable<EmployeeDocument> {
        return this.http.post<EmployeeDocument>(`${this.apiUrl}/${id}/versions`, formData);
    }

    getVersions(id: number): Observable<DocumentVersion[]> {
        return this.http.get<DocumentVersion[]>(`${this.apiUrl}/${id}/versions`);
    }

    verifyDocument(id: number, request: { isVerified: boolean; notes?: string }): Observable<EmployeeDocument> {
        return this.http.post<EmployeeDocument>(`${this.apiUrl}/${id}/verify`, request);
    }

    downloadDocument(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
    }

    // Expiry Alerts
    getExpiringDocuments(daysThreshold: number = 30): Observable<DocumentExpiryAlert[]> {
        return this.http.get<DocumentExpiryAlert[]>(`${this.apiUrl}/expiring`, { params: { daysThreshold } });
    }

    getExpiryReport(): Observable<ExpiringDocumentsReport> {
        return this.http.get<ExpiringDocumentsReport>(`${this.apiUrl}/expiry-report`);
    }
}

// ============================================================================
// Worker Self-Service
// ============================================================================

@Injectable({
    providedIn: 'root'
})
export class WorkerSelfServiceService {
    private apiUrl = '/api/workerselfservice';

    constructor(private http: HttpClient) { }

    // Profile
    getProfile(): Observable<WorkerProfile> {
        return this.http.get<WorkerProfile>(`${this.apiUrl}/profile`);
    }

    requestProfileUpdate(request: { fieldName: string; newValue?: string }): Observable<WorkerProfileUpdateRequest> {
        return this.http.post<WorkerProfileUpdateRequest>(`${this.apiUrl}/profile/update-request`, request);
    }

    getPendingProfileUpdates(): Observable<WorkerProfileUpdateRequest[]> {
        return this.http.get<WorkerProfileUpdateRequest[]>(`${this.apiUrl}/profile/pending-updates`);
    }

    reviewProfileUpdate(id: number, request: { approve: boolean; notes?: string }): Observable<WorkerProfileUpdateRequest> {
        return this.http.post<WorkerProfileUpdateRequest>(`${this.apiUrl}/profile/update-requests/${id}/review`, request);
    }

    // Emergency Contacts
    getEmergencyContacts(): Observable<EmergencyContact[]> {
        return this.http.get<EmergencyContact[]>(`${this.apiUrl}/emergency-contacts`);
    }

    addEmergencyContact(request: Partial<EmergencyContact>): Observable<EmergencyContact> {
        return this.http.post<EmergencyContact>(`${this.apiUrl}/emergency-contacts`, request);
    }

    updateEmergencyContact(id: number, request: Partial<EmergencyContact>): Observable<EmergencyContact> {
        return this.http.put<EmergencyContact>(`${this.apiUrl}/emergency-contacts/${id}`, request);
    }

    deleteEmergencyContact(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/emergency-contacts/${id}`);
    }

    setPrimaryEmergencyContact(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/emergency-contacts/${id}/set-primary`, {});
    }

    // Bank Accounts
    getBankAccounts(): Observable<BankAccount[]> {
        return this.http.get<BankAccount[]>(`${this.apiUrl}/bank-accounts`);
    }

    addBankAccount(request: Partial<BankAccount>): Observable<BankAccount> {
        return this.http.post<BankAccount>(`${this.apiUrl}/bank-accounts`, request);
    }

    updateBankAccount(id: number, request: Partial<BankAccount>): Observable<BankAccount> {
        return this.http.put<BankAccount>(`${this.apiUrl}/bank-accounts/${id}`, request);
    }

    deleteBankAccount(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/bank-accounts/${id}`);
    }

    setActiveBankAccount(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/bank-accounts/${id}/set-active`, {});
    }
}

// ============================================================================
// Employee Onboarding Service
// ============================================================================

@Injectable({
    providedIn: 'root'
})
export class EmployeeOnboardingService {
    private apiUrl = '/api/employeeonboarding';

    constructor(private http: HttpClient) { }

    // Templates
    getTemplates(isActive?: boolean): Observable<OnboardingTemplate[]> {
        const params: any = {};
        if (isActive !== undefined) params.isActive = isActive;
        return this.http.get<OnboardingTemplate[]>(`${this.apiUrl}/templates`, { params });
    }

    getTemplate(id: number): Observable<OnboardingTemplate> {
        return this.http.get<OnboardingTemplate>(`${this.apiUrl}/templates/${id}`);
    }

    createTemplate(request: Partial<OnboardingTemplate>): Observable<OnboardingTemplate> {
        return this.http.post<OnboardingTemplate>(`${this.apiUrl}/templates`, request);
    }

    updateTemplate(id: number, request: Partial<OnboardingTemplate>): Observable<OnboardingTemplate> {
        return this.http.put<OnboardingTemplate>(`${this.apiUrl}/templates/${id}`, request);
    }

    deleteTemplate(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/templates/${id}`);
    }

    // Task Templates
    getTaskTemplates(templateId: number): Observable<OnboardingTaskTemplate[]> {
        return this.http.get<OnboardingTaskTemplate[]>(`${this.apiUrl}/templates/${templateId}/tasks`);
    }

    addTaskTemplate(templateId: number, request: Partial<OnboardingTaskTemplate>): Observable<OnboardingTaskTemplate> {
        return this.http.post<OnboardingTaskTemplate>(`${this.apiUrl}/templates/${templateId}/tasks`, request);
    }

    updateTaskTemplate(id: number, request: Partial<OnboardingTaskTemplate>): Observable<OnboardingTaskTemplate> {
        return this.http.put<OnboardingTaskTemplate>(`${this.apiUrl}/task-templates/${id}`, request);
    }

    deleteTaskTemplate(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/task-templates/${id}`);
    }

    reorderTaskTemplates(templateId: number, taskIds: number[]): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/templates/${templateId}/tasks/reorder`, taskIds);
    }

    // Processes
    getProcesses(status?: string, employeeId?: number): Observable<OnboardingProcess[]> {
        const params: any = {};
        if (status) params.status = status;
        if (employeeId) params.employeeId = employeeId;
        return this.http.get<OnboardingProcess[]>(`${this.apiUrl}/processes`, { params });
    }

    getProcess(id: number): Observable<OnboardingProcess> {
        return this.http.get<OnboardingProcess>(`${this.apiUrl}/processes/${id}`);
    }

    startOnboarding(request: Partial<OnboardingProcess>): Observable<OnboardingProcess> {
        return this.http.post<OnboardingProcess>(`${this.apiUrl}/processes`, request);
    }

    completeOnboarding(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/processes/${id}/complete`, {});
    }

    // Tasks
    getProcessTasks(processId: number): Observable<OnboardingTask[]> {
        return this.http.get<OnboardingTask[]>(`${this.apiUrl}/processes/${processId}/tasks`);
    }

    updateTaskStatus(taskId: number, request: Partial<OnboardingTask>): Observable<OnboardingTask> {
        return this.http.put<OnboardingTask>(`${this.apiUrl}/tasks/${taskId}`, request);
    }

    uploadTaskDocument(taskId: number, request: { documentName: string; filePath: string }): Observable<OnboardingTask> {
        return this.http.post<OnboardingTask>(`${this.apiUrl}/tasks/${taskId}/documents`, request);
    }

    // Dashboard
    getDashboard(): Observable<OnboardingDashboard> {
        return this.http.get<OnboardingDashboard>(`${this.apiUrl}/dashboard`);
    }
}

// ============================================================================
// Disciplinary Actions Service
// ============================================================================

@Injectable({
    providedIn: 'root'
})
export class DisciplinaryActionService {
    private apiUrl = '/api/disciplinaryactions';

    constructor(private http: HttpClient) { }

    // Action Types
    getActionTypes(isActive?: boolean): Observable<DisciplinaryActionType[]> {
        const params: any = {};
        if (isActive !== undefined) params.isActive = isActive;
        return this.http.get<DisciplinaryActionType[]>(`${this.apiUrl}/types`, { params });
    }

    getActionType(id: number): Observable<DisciplinaryActionType> {
        return this.http.get<DisciplinaryActionType>(`${this.apiUrl}/types/${id}`);
    }

    createActionType(request: Partial<DisciplinaryActionType>): Observable<DisciplinaryActionType> {
        return this.http.post<DisciplinaryActionType>(`${this.apiUrl}/types`, request);
    }

    updateActionType(id: number, request: Partial<DisciplinaryActionType>): Observable<DisciplinaryActionType> {
        return this.http.put<DisciplinaryActionType>(`${this.apiUrl}/types/${id}`, request);
    }

    deleteActionType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/types/${id}`);
    }

    // Actions
    getActions(employeeId?: number, status?: string): Observable<DisciplinaryAction[]> {
        const params: any = {};
        if (employeeId) params.employeeId = employeeId;
        if (status) params.status = status;
        return this.http.get<DisciplinaryAction[]>(this.apiUrl, { params });
    }

    getAction(id: number): Observable<DisciplinaryAction> {
        return this.http.get<DisciplinaryAction>(`${this.apiUrl}/${id}`);
    }

    createAction(request: Partial<DisciplinaryAction>): Observable<DisciplinaryAction> {
        return this.http.post<DisciplinaryAction>(this.apiUrl, request);
    }

    updateAction(id: number, request: Partial<DisciplinaryAction>): Observable<DisciplinaryAction> {
        return this.http.put<DisciplinaryAction>(`${this.apiUrl}/${id}`, request);
    }

    deleteAction(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    attachDocument(id: number, documentPath: string): Observable<DisciplinaryAction> {
        return this.http.post<DisciplinaryAction>(`${this.apiUrl}/${id}/attach-document`, { documentPath });
    }

    // Appeals
    submitAppeal(actionId: number, request: { reason: string }): Observable<DisciplinaryAppeal> {
        return this.http.post<DisciplinaryAppeal>(`${this.apiUrl}/${actionId}/appeal`, request);
    }

    reviewAppeal(appealId: number, request: { approve: boolean; notes?: string }): Observable<DisciplinaryAppeal> {
        return this.http.post<DisciplinaryAppeal>(`${this.apiUrl}/appeals/${appealId}/review`, request);
    }

    getPendingAppeals(): Observable<DisciplinaryAppeal[]> {
        return this.http.get<DisciplinaryAppeal[]>(`${this.apiUrl}/appeals/pending`);
    }

    // Records
    getEmployeeRecord(employeeId: number): Observable<EmployeeDisciplinaryRecord> {
        return this.http.get<EmployeeDisciplinaryRecord>(`${this.apiUrl}/records/employee/${employeeId}`);
    }

    getEmployeeRecords(): Observable<EmployeeDisciplinaryRecord[]> {
        return this.http.get<EmployeeDisciplinaryRecord[]>(`${this.apiUrl}/records`);
    }

    // Dashboard
    getDashboard(): Observable<DisciplinaryDashboard> {
        return this.http.get<DisciplinaryDashboard>(`${this.apiUrl}/dashboard`);
    }
}

// ============================================================================
// Skills Matrix Service
// ============================================================================

@Injectable({
    providedIn: 'root'
})
export class SkillsMatrixService {
    private apiUrl = '/api/skillsmatrix';

    constructor(private http: HttpClient) { }

    // Categories
    getCategories(isActive?: boolean): Observable<SkillCategory[]> {
        const params: any = {};
        if (isActive !== undefined) params.isActive = isActive;
        return this.http.get<SkillCategory[]>(`${this.apiUrl}/categories`, { params });
    }

    getCategory(id: number): Observable<SkillCategory> {
        return this.http.get<SkillCategory>(`${this.apiUrl}/categories/${id}`);
    }

    createCategory(request: Partial<SkillCategory>): Observable<SkillCategory> {
        return this.http.post<SkillCategory>(`${this.apiUrl}/categories`, request);
    }

    updateCategory(id: number, request: Partial<SkillCategory>): Observable<SkillCategory> {
        return this.http.put<SkillCategory>(`${this.apiUrl}/categories/${id}`, request);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
    }

    // Skills
    getSkills(categoryId?: number, isActive?: boolean): Observable<Skill[]> {
        const params: any = {};
        if (categoryId) params.categoryId = categoryId;
        if (isActive !== undefined) params.isActive = isActive;
        return this.http.get<Skill[]>(`${this.apiUrl}/skills`, { params });
    }

    getSkill(id: number): Observable<Skill> {
        return this.http.get<Skill>(`${this.apiUrl}/skills/${id}`);
    }

    createSkill(request: Partial<Skill>): Observable<Skill> {
        return this.http.post<Skill>(`${this.apiUrl}/skills`, request);
    }

    updateSkill(id: number, request: Partial<Skill>): Observable<Skill> {
        return this.http.put<Skill>(`${this.apiUrl}/skills/${id}`, request);
    }

    deleteSkill(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/skills/${id}`);
    }

    // Competency Levels
    getCompetencyLevels(): Observable<CompetencyLevel[]> {
        return this.http.get<CompetencyLevel[]>(`${this.apiUrl}/competency-levels`);
    }

    createCompetencyLevel(request: Partial<CompetencyLevel>): Observable<CompetencyLevel> {
        return this.http.post<CompetencyLevel>(`${this.apiUrl}/competency-levels`, request);
    }

    updateCompetencyLevel(id: number, request: Partial<CompetencyLevel>): Observable<CompetencyLevel> {
        return this.http.put<CompetencyLevel>(`${this.apiUrl}/competency-levels/${id}`, request);
    }

    deleteCompetencyLevel(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/competency-levels/${id}`);
    }

    // Employee Skills
    getEmployeeSkills(employeeId: number): Observable<EmployeeSkill[]> {
        return this.http.get<EmployeeSkill[]>(`${this.apiUrl}/employee/${employeeId}/skills`);
    }

    getEmployeeSkill(id: number): Observable<EmployeeSkill> {
        return this.http.get<EmployeeSkill>(`${this.apiUrl}/employee-skills/${id}`);
    }

    assessEmployeeSkill(request: Partial<EmployeeSkill>): Observable<EmployeeSkill> {
        return this.http.post<EmployeeSkill>(`${this.apiUrl}/employee-skills`, request);
    }

    updateEmployeeSkill(id: number, request: Partial<EmployeeSkill>): Observable<EmployeeSkill> {
        return this.http.put<EmployeeSkill>(`${this.apiUrl}/employee-skills/${id}`, request);
    }

    deleteEmployeeSkill(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/employee-skills/${id}`);
    }

    getEmployeeSkillsProfile(employeeId: number): Observable<EmployeeSkillsProfile> {
        return this.http.get<EmployeeSkillsProfile>(`${this.apiUrl}/employee/${employeeId}/profile`);
    }

    // Skill Requirements
    getSkillRequirements(entityType: string, entityId: number): Observable<SkillRequirement[]> {
        return this.http.get<SkillRequirement[]>(`${this.apiUrl}/requirements/${entityType}/${entityId}`);
    }

    addSkillRequirement(request: Partial<SkillRequirement>): Observable<SkillRequirement> {
        return this.http.post<SkillRequirement>(`${this.apiUrl}/requirements`, request);
    }

    deleteSkillRequirement(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/requirements/${id}`);
    }

    // Gap Analysis
    getSkillGaps(employeeId?: number): Observable<SkillGapAnalysis[]> {
        const params: any = {};
        if (employeeId) params.employeeId = employeeId;
        return this.http.get<SkillGapAnalysis[]>(`${this.apiUrl}/gaps`, { params });
    }

    analyzeEmployeeGaps(employeeId: number): Observable<SkillGapAnalysis[]> {
        return this.http.post<SkillGapAnalysis[]>(`${this.apiUrl}/analyze/employee/${employeeId}`, {});
    }

    analyzeProjectGaps(projectId: number): Observable<SkillGapAnalysis[]> {
        return this.http.post<SkillGapAnalysis[]>(`${this.apiUrl}/analyze/project/${projectId}`, {});
    }

    // Dashboard
    getDashboard(): Observable<SkillsMatrixDashboard> {
        return this.http.get<SkillsMatrixDashboard>(`${this.apiUrl}/dashboard`);
    }

    // Bulk Operations
    bulkAssessSkills(employeeId: number, requests: Partial<EmployeeSkill>[]): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/employee/${employeeId}/bulk-assess`, requests);
    }

    findEmployeesWithSkill(skillId: number, minimumLevel: number = 1): Observable<EmployeeSkill[]> {
        return this.http.get<EmployeeSkill[]>(`${this.apiUrl}/skills/${skillId}/employees`, { params: { minimumLevel } });
    }
}
