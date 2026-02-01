import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanySettings, ProjectSettings } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private apiUrl = 'api'; // Usually proxy handles this or absolute URL is used

    constructor(private http: HttpClient) { }

    getCompanySettings(): Observable<CompanySettings> {
        return this.http.get<CompanySettings>(`${this.apiUrl}/company-settings`);
    }

    updateCompanySettings(settings: Partial<CompanySettings>): Observable<CompanySettings> {
        return this.http.put<CompanySettings>(`${this.apiUrl}/company-settings`, settings);
    }

    getProjectSettings(projectId: number): Observable<ProjectSettings> {
        return this.http.get<ProjectSettings>(`${this.apiUrl}/projects/${projectId}/settings`);
    }

    updateProjectSettings(projectId: number, settings: Partial<ProjectSettings>): Observable<ProjectSettings> {
        return this.http.put<ProjectSettings>(`${this.apiUrl}/projects/${projectId}/settings`, settings);
    }
}
