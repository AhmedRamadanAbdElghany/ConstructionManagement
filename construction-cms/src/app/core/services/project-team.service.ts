import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeamMemberDto {
    id: number;
    projectId: number;
    projectName?: string;
    userId: number;
    userName?: string;
    reportsToUserId?: number;
    reportsToUserName?: string;
    teamId: number;
    roleId?: number;
    roleName?: string;
    assignedAt: string;
    companyId?: number;
}

export interface ProjectRoleDto {
    id: number;
    projectId: number;
    projectName?: string;
    roleName: string;
    description?: string;
    createdAt: string;
    companyId?: number;
}

export interface AddTeamMemberRequest {
    userId: number;
    reportsToUserId?: number;
}

export interface CreateProjectRoleRequest {
    roleName: string;
    description?: string;
}

export interface AssignProjectRoleRequest {
    projectRoleId: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProjectTeamService {
    private apiUrl = 'api/projects';

    constructor(private http: HttpClient) { }

    // GET: api/projects/{projectId}/team
    getTeam(projectId: number): Observable<TeamMemberDto[]> {
        return this.http.get<TeamMemberDto[]>(`${this.apiUrl}/${projectId}/team`);
    }

    // GET: api/projects/{projectId}/team/roles
    getRoles(projectId: number): Observable<ProjectRoleDto[]> {
        return this.http.get<ProjectRoleDto[]>(`${this.apiUrl}/${projectId}/team/roles`);
    }

    // POST: api/projects/{projectId}/team/members
    addTeamMember(projectId: number, request: AddTeamMemberRequest): Observable<{ teamId: number }> {
        return this.http.post<{ teamId: number }>(`${this.apiUrl}/${projectId}/team/members`, request);
    }

    // POST: api/projects/{projectId}/team/roles
    createRole(projectId: number, request: CreateProjectRoleRequest): Observable<{ roleId: number }> {
        return this.http.post<{ roleId: number }>(`${this.apiUrl}/${projectId}/team/roles`, request);
    }

    // POST: api/projects/{projectId}/team/{teamId}/assign-role
    assignRole(teamId: number, request: AssignProjectRoleRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/${teamId}/assign-role`, request);
    }
}
