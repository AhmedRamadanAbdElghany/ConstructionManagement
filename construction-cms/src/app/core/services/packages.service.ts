import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Package } from './../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class PackagesService {
    private apiUrl = 'api/packages';

    // Dummy Data for development/mocking
    private dummyPackages: Package[] = [
        {
            id: 1,
            name: 'Free',
            description: 'Starter plan for small projects',
            price: 0,
            maxTeamMembers: 5,
            maxDailyPhotos: 20,
            maxBOQItems: 50,
            allowAdvancedReports: false,
            allowCustomBranding: false,
            allowAIAssistance: false
        },
        {
            id: 2,
            name: 'Pro',
            description: 'Professional tracking with more resources',
            price: 1500,
            maxTeamMembers: 20,
            maxDailyPhotos: 100,
            maxBOQItems: 200,
            allowAdvancedReports: true,
            allowCustomBranding: false,
            allowAIAssistance: false
        },
        {
            id: 3,
            name: 'Premium',
            description: 'Full enterprise features with AI support',
            price: 5000,
            maxTeamMembers: 100,
            maxDailyPhotos: 500,
            maxBOQItems: 1000,
            allowAdvancedReports: true,
            allowCustomBranding: true,
            allowAIAssistance: true
        }
    ];

    constructor(private http: HttpClient) { }

    getAllPackages(): Observable<Package[]> {
        // return this.http.get<Package[]>(this.apiUrl);
        return of(this.dummyPackages);
    }

    getPackageById(id: number): Observable<Package | undefined> {
        // return this.http.get<Package>(`${this.apiUrl}/${id}`);
        const pkg = this.dummyPackages.find(p => p.id === id);
        return of(pkg);
    }

    createPackage(pkg: Omit<Package, 'id'>): Observable<Package> {
        // return this.http.post<Package>(this.apiUrl, pkg);

        const newPackage: Package = { ...pkg, id: this.dummyPackages.length + 1 };
        this.dummyPackages.push(newPackage);
        return of(newPackage);
    }

    updatePackage(id: number, pkg: Partial<Package>): Observable<Package | undefined> {
        // return this.http.put<Package>(`${this.apiUrl}/${id}`, pkg);

        const index = this.dummyPackages.findIndex(p => p.id === id);
        if (index !== -1) {
            this.dummyPackages[index] = { ...this.dummyPackages[index], ...pkg };
            return of(this.dummyPackages[index]);
        }
        return of(undefined);
    }

    deletePackage(id: number): Observable<boolean> {
        // return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(map(() => true));

        const index = this.dummyPackages.findIndex(p => p.id === id);
        if (index !== -1) {
            this.dummyPackages.splice(index, 1);
            return of(true);
        }
        return of(false);
    }
}
