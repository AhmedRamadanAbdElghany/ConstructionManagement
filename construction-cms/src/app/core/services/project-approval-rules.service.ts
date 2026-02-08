import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApprovalRuleDto {
    id: number;
    projectId: number;
    projectName?: string;
    ruleType: string;
    ruleTypeName: string;
    entityType: string;
    entityTypeName: string;
    thresholdAmount?: number;
    requireApproval: boolean;
    approverRoleId?: number;
    approverRoleName?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateApprovalRuleRequest {
    ruleType: string;
    entityType: string;
    thresholdAmount?: number;
    approverRoleId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProjectApprovalRulesService {
    private apiUrl = 'api/projects';

    constructor(private http: HttpClient) { }

    // GET: api/projects/{projectId}/approval-rules
    getRules(projectId: number): Observable<ApprovalRuleDto[]> {
        return this.http.get<ApprovalRuleDto[]>(`${this.apiUrl}/${projectId}/approval-rules`);
    }

    // GET: api/projects/{projectId}/approval-rules/{ruleId}
    getRuleById(projectId: number, ruleId: number): Observable<ApprovalRuleDto> {
        return this.http.get<ApprovalRuleDto>(`${this.apiUrl}/${projectId}/approval-rules/${ruleId}`);
    }

    // POST: api/projects/{projectId}/approval-rules
    createRule(projectId: number, request: CreateApprovalRuleRequest): Observable<{ ruleId: number }> {
        return this.http.post<{ ruleId: number }>(`${this.apiUrl}/${projectId}/approval-rules`, request);
    }
}
