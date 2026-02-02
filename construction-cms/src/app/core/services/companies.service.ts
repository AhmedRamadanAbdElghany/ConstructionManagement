import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Company } from '../../shared/interfaces';


@Injectable({
    providedIn: 'root'
})
export class CompaniesService {
    private apiUrl = 'api/admin/companies';

    // Dummy Data for demonstration
    private mockCompanies: Company[] = [
        {
            id: 1,
            name: 'Al-Massa Construction',
            isActive: true,
            packageId: 3,
            settings: {
                allowMeasured: true,
                allowSupervision: true,
                allowPackages: true,
                enableDelayNotification: true,
                requirePhotoReview: true,
                clientCanSeeFinancials: true
            }
        },
        {
            id: 2,
            name: 'BuildIt Solutions',
            isActive: true,
            packageId: 2,
            settings: {
                allowMeasured: true,
                allowSupervision: false,
                allowPackages: false,
                enableDelayNotification: true,
                requirePhotoReview: false,
                clientCanSeeFinancials: false
            }
        },
        {
            id: 3,
            name: 'Skyline Architects',
            isActive: false,
            packageId: 1,
            settings: {
                allowMeasured: false,
                allowSupervision: true,
                allowPackages: false,
                enableDelayNotification: false,
                requirePhotoReview: true,
                clientCanSeeFinancials: false
            }
        },
        {
            id: 4,
            name: 'Urban Development Group',
            isActive: true,
            packageId: 3,
            settings: {
                allowMeasured: true,
                allowSupervision: true,
                allowPackages: false,
                enableDelayNotification: true,
                requirePhotoReview: true,
                clientCanSeeFinancials: false
            }
        }
    ];

    constructor(private http: HttpClient) { }

    getCompanies(): Observable<Company[]> {
        // Return mock data with a small delay for realism
        return of([...this.mockCompanies]).pipe(delay(300));
    }

    getCompany(id: number): Observable<Company> {
        const company = this.mockCompanies.find(c => c.id === id);
        if (company) return of({ ...company }).pipe(delay(200));
        throw new Error('Company not found');
    }

    createCompany(request: any): Observable<Company> {
        const newId = this.mockCompanies.length > 0 ? Math.max(...this.mockCompanies.map(c => c.id)) + 1 : 1;
        const newCompany: Company = {
            id: newId,
            name: request.name,
            isActive: true,
            packageId: Number(request.packageId),
            settings: { ...request }
        };
        this.mockCompanies.push(newCompany);
        return of(newCompany).pipe(delay(400));
    }

    updateCompany(id: number, request: any): Observable<Company> {
        const idx = this.mockCompanies.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.mockCompanies[idx] = {
                ...this.mockCompanies[idx],
                name: request.name,
                isActive: request.isActive,
                packageId: Number(request.packageId),
                settings: { ...request }
            };
            return of(this.mockCompanies[idx]).pipe(delay(400));
        }
        throw new Error('Company not found');
    }

    deleteCompany(id: number): Observable<any> {
        const idx = this.mockCompanies.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.mockCompanies.splice(idx, 1);
            return of({ success: true }).pipe(delay(300));
        }
        throw new Error('Company not found');
    }
}
