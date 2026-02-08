import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private apiUrl = 'api/projects';

    constructor(private http: HttpClient) { }

    getMyProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${this.apiUrl}/my-projects`);
    }

    getProjectById(id: number): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl}/${id}`);
    }

    createProject(request: CreateProjectRequest): Observable<{ projectId: number }> {
        return this.http.post<{ projectId: number }>(this.apiUrl, request);
    }

    updateProject(id: number, request: UpdateProjectRequest): Observable<string> {
        return this.http.put<string>(`${this.apiUrl}/${id}`, request);
    }

    closeProject(id: number): Observable<string> {
        return this.http.put<string>(`${this.apiUrl}/${id}/close`, {});
    }
}
