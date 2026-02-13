import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private apiUrl = 'api/projects';

    constructor(private http: HttpClient) { }

    private mapDtoToProject(dto: any): Project {
        return {
            id: dto.id || dto.Id || dto.projectID || dto.ProjectID,
            name: dto.projectName || dto.ProjectName,
            // Backend currently maps 'Description' to address in CreateProject logic
            location: {
                address: dto.description || dto.Description || '',
                lat: 0,
                lng: 0
            },
            status: (dto.isClosed || dto.IsClosed) ? 'Completed' : 'Active', // Simple status mapping
            progress: 0,
            cashFlow: {
                earned: 0,
                collected: 0
            },
            // Maintain other properties if needed or add them to the interface
        } as Project;
    }

    getMyProjects(): Observable<Project[]> {
        return this.http.get<any[]>(`${this.apiUrl}/my-projects`).pipe(
            map(dtos => dtos.map(dto => this.mapDtoToProject(dto)))
        );
    }

    getProjectById(id: number): Observable<Project> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(dto => this.mapDtoToProject(dto))
        );
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
