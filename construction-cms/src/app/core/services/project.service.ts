import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private apiUrl = 'api/projects';

    // Dummy Data
    private dummyProjects: Project[] = [
        {
            id: 1,
            name: 'Residential Tower Dubai',
            status: 'Active',
            progress: 65,
            cashFlow: { earned: 1200000, collected: 900000 },
            location: { lat: 25.2048, lng: 55.2708, address: 'Downtown Dubai, UAE' },
            startDate: '2024-01-15T00:00:00Z',
            endDate: '2025-06-30T00:00:00Z',
            packageId: 2 // Pro
        },
        {
            id: 2,
            name: 'Commercial Mall Cairo',
            status: 'Delayed',
            progress: 30,
            cashFlow: { earned: 500000, collected: 300000 },
            location: { lat: 30.0444, lng: 31.2357, address: 'New Cairo, Egypt' },
            startDate: '2024-03-01T00:00:00Z',
            endDate: '2025-12-31T00:00:00Z',
            packageId: 1 // Free
        },
        {
            id: 3,
            name: 'Villa Complex Riyadh',
            status: 'Active',
            progress: 45,
            cashFlow: { earned: 850000, collected: 650000 },
            location: { lat: 24.7136, lng: 46.6753, address: 'Al Olaya District, Riyadh' },
            startDate: '2024-02-01T00:00:00Z',
            endDate: '2025-08-15T00:00:00Z',
            packageId: 3 // Premium
        }
    ];

    constructor(private http: HttpClient) { }

    getMyProjects(): Observable<Project[]> {
        // return this.http.get<Project[]>(`${this.apiUrl}/my-projects`);
        return of(this.dummyProjects);
    }

    getProjectById(id: number): Observable<Project | undefined> {
        // return this.http.get<Project>(`${this.apiUrl}/${id}`);
        const project = this.dummyProjects.find(p => p.id === id);
        return of(project);
    }

    createProject(request: CreateProjectRequest): Observable<Project> {
        // return this.http.post<Project>(this.apiUrl, request);

        const newProject: Project = {
            id: this.dummyProjects.length + 1,
            name: request.projectName,
            status: 'Active', // Default
            progress: 0,
            cashFlow: { earned: 0, collected: 0 },
            startDate: request.startDate || new Date().toISOString(),
            endDate: request.endDate,
            packageId: 1 // Default to Free or based on logic
        };
        this.dummyProjects.push(newProject);
        return of(newProject);
    }

    updateProject(id: number, request: UpdateProjectRequest): Observable<Project | undefined> {
        // return this.http.put<Project>(`${this.apiUrl}/${id}`, request);

        const index = this.dummyProjects.findIndex(p => p.id === id);
        if (index !== -1) {
            const updatedProject = { ...this.dummyProjects[index] };
            if (request.projectName) updatedProject.name = request.projectName;
            if (request.startDate) updatedProject.startDate = request.startDate;
            if (request.endDate) updatedProject.endDate = request.endDate;

            this.dummyProjects[index] = updatedProject;
            return of(updatedProject);
        }
        return of(undefined);
    }

    closeProject(id: number): Observable<boolean> {
        // return this.http.put<void>(`${this.apiUrl}/${id}/close`, {}).pipe(map(() => true));

        const index = this.dummyProjects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.dummyProjects[index].status = 'Completed';
            return of(true);
        }
        return of(false);
    }
}
