import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectItem, CreateProjectItemRequest, UpdateProjectItemRequest } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ProjectItemService {
    private apiUrl = 'api/projects';

    constructor(private http: HttpClient) { }

    getItemsByProject(projectId: number): Observable<ProjectItem[]> {
        return this.http.get<ProjectItem[]>(`${this.apiUrl}/${projectId}/items`);
    }

    getItemById(projectId: number, itemId: number): Observable<ProjectItem> {
        return this.http.get<ProjectItem>(`${this.apiUrl}/${projectId}/items/${itemId}`);
    }

    createItem(projectId: number, request: CreateProjectItemRequest): Observable<{ itemId: number }> {
        return this.http.post<{ itemId: number }>(`${this.apiUrl}/${projectId}/items`, request);
    }

    updateItem(projectId: number, itemId: number, request: UpdateProjectItemRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${projectId}/items/${itemId}`, request);
    }

    deleteItem(projectId: number, itemId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${projectId}/items/${itemId}`);
    }
}
