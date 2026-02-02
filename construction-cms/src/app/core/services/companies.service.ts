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
        return this.http.get<Company[]>(this.apiUrl);
    }

    getCompany(id: number): Observable<Company> {
        return this.http.get<Company>(`${this.apiUrl}/${id}`);
    }

    createCompany(request: any): Observable<Company> {
        return this.http.post<Company>(this.apiUrl, request);
    }

    updateCompany(id: number, request: any): Observable<Company> {
        return this.http.put<Company>(`${this.apiUrl}/${id}`, request);
    }

    deleteCompany(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
