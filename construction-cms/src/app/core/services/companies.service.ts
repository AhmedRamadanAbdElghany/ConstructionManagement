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
                allowLocations: true,
                allowHR: true,
                allowAddProgressEntry: true,
                allowReopenClosedDay: true,
                autoCloseDay: true,
                autoCloseDayTime: '18:00',
                enableDelayNotification: true,
                requirePhotoReview: true,
                enableInvoiceReview: true,
                clientCanSeeFinancials: true,
                clientCanSeeMedia: true,
                clientCanSeeBOQ: true
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
                allowLocations: true,
                allowHR: true,
                allowAddProgressEntry: true,
                allowReopenClosedDay: false,
                autoCloseDay: false,
                enableDelayNotification: true,
                requirePhotoReview: false,
                enableInvoiceReview: false,
                clientCanSeeFinancials: false,
                clientCanSeeMedia: true,
                clientCanSeeBOQ: false
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
                allowLocations: false,
                allowHR: false,
                allowAddProgressEntry: false,
                allowReopenClosedDay: false,
                autoCloseDay: false,
                enableDelayNotification: false,
                requirePhotoReview: true,
                enableInvoiceReview: false,
                clientCanSeeFinancials: false,
                clientCanSeeMedia: false,
                clientCanSeeBOQ: false
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
                allowLocations: true,
                allowHR: true,
                allowAddProgressEntry: true,
                allowReopenClosedDay: true,
                autoCloseDay: false,
                enableDelayNotification: true,
                requirePhotoReview: true,
                enableInvoiceReview: true,
                clientCanSeeFinancials: false,
                clientCanSeeMedia: true,
                clientCanSeeBOQ: true
            }
        },
        {
            id: 5,
            name: 'Saudi General Contracting',
            isActive: true,
            packageId: 3,
            settings: {
                allowMeasured: true,
                allowSupervision: true,
                allowPackages: true,
                allowLocations: true,
                allowHR: true,
                allowAddProgressEntry: true,
                allowReopenClosedDay: true,
                autoCloseDay: true,
                autoCloseDayTime: '17:00',
                enableDelayNotification: true,
                requirePhotoReview: true,
                enableInvoiceReview: true,
                clientCanSeeFinancials: true,
                clientCanSeeMedia: true,
                clientCanSeeBOQ: true
            }
        },
        {
            id: 6,
            name: 'Red Sea Developers',
            isActive: true,
            packageId: 2,
            settings: {
                allowMeasured: true,
                allowSupervision: true,
                allowPackages: false,
                allowLocations: true,
                allowHR: true,
                allowAddProgressEntry: true,
                allowReopenClosedDay: false,
                autoCloseDay: false,
                enableDelayNotification: true,
                requirePhotoReview: false,
                enableInvoiceReview: false,
                clientCanSeeFinancials: true,
                clientCanSeeMedia: true,
                clientCanSeeBOQ: true
            }
        },
        {
            id: 7,
            name: 'Palm Construction',
            isActive: true,
            packageId: 1,
            settings: {
                allowMeasured: true,
                allowSupervision: false,
                allowPackages: false,
                allowLocations: true,
                allowHR: false,
                allowAddProgressEntry: true,
                allowReopenClosedDay: false,
                autoCloseDay: false,
                enableDelayNotification: false,
                requirePhotoReview: false,
                enableInvoiceReview: false,
                clientCanSeeFinancials: false,
                clientCanSeeMedia: false,
                clientCanSeeBOQ: false
            }
        },
        {
            id: 8,
            name: 'Future City Builders',
            isActive: true,
            packageId: 3,
            settings: {
                allowMeasured: true,
                allowSupervision: true,
                allowPackages: true,
                allowLocations: true,
                allowHR: true,
                allowAddProgressEntry: true,
                allowReopenClosedDay: true,
                autoCloseDay: true,
                autoCloseDayTime: '18:00',
                enableDelayNotification: true,
                requirePhotoReview: true,
                enableInvoiceReview: true,
                clientCanSeeFinancials: true,
                clientCanSeeMedia: true,
                clientCanSeeBOQ: true
            }
        },
        {
            id: 9,
            name: 'Desert Rock Ltd',
            isActive: true,
            packageId: 2,
            settings: {
                allowMeasured: true,
                allowSupervision: true,
                allowPackages: false,
                allowLocations: true,
                allowHR: true,
                allowAddProgressEntry: true,
                allowReopenClosedDay: false,
                autoCloseDay: false,
                enableDelayNotification: true,
                requirePhotoReview: true,
                enableInvoiceReview: true,
                clientCanSeeFinancials: false,
                clientCanSeeMedia: true,
                clientCanSeeBOQ: false
            }
        },
        {
            id: 10,
            name: 'Nile Valley Projects',
            isActive: true,
            packageId: 3,
            settings: {
                allowMeasured: true,
                allowSupervision: true,
                allowPackages: true,
                allowLocations: true,
                allowHR: true,
                allowAddProgressEntry: true,
                allowReopenClosedDay: true,
                autoCloseDay: true,
                autoCloseDayTime: '18:30',
                enableDelayNotification: true,
                requirePhotoReview: true,
                enableInvoiceReview: true,
                clientCanSeeFinancials: true,
                clientCanSeeMedia: true,
                clientCanSeeBOQ: true
            }
        }
    ];

    constructor(private http: HttpClient) { }

    getCompanies(): Observable<Company[]> {
        // Return mock data for now
        return of(this.mockCompanies).pipe(delay(500));
        // return this.http.get<Company[]>(this.apiUrl);
    }

    getCompany(id: number): Observable<Company> {
        const company = this.mockCompanies.find(c => c.id === id);
        return of(company!).pipe(delay(300));
        // return this.http.get<Company>(`${this.apiUrl}/${id}`);
    }

    createCompany(request: any): Observable<Company> {
        const newId = Math.max(...this.mockCompanies.map(c => c.id)) + 1;
        const newCompany: Company = {
            id: newId,
            name: request.name,
            isActive: request.isActive,
            packageId: request.packageId,
            settings: {
                allowMeasured: request.allowMeasured,
                allowSupervision: request.allowSupervision,
                allowPackages: request.allowPackages,
                allowLocations: request.allowLocations,
                allowHR: request.allowHR,
                allowAddProgressEntry: request.allowAddProgressEntry,
                allowReopenClosedDay: request.allowReopenClosedDay,
                autoCloseDay: request.autoCloseDay,
                enableInvoiceReview: request.enableInvoiceReview,
                enableDelayNotification: request.enableDelayNotification,
                requirePhotoReview: request.requirePhotoReview,
                clientCanSeeFinancials: request.clientCanSeeFinancials,
                clientCanSeeMedia: request.clientCanSeeMedia,
                clientCanSeeBOQ: request.clientCanSeeBOQ
            }
        };
        this.mockCompanies.push(newCompany);
        return of(newCompany).pipe(delay(500));
        // return this.http.post<Company>(this.apiUrl, request);
    }

    updateCompany(id: number, request: any): Observable<Company> {
        const index = this.mockCompanies.findIndex(c => c.id === id);
        if (index > -1) {
            this.mockCompanies[index] = {
                ...this.mockCompanies[index],
                name: request.name,
                packageId: request.packageId,
                isActive: request.isActive,
                settings: {
                    ...this.mockCompanies[index]?.settings,
                    allowMeasured: request.allowMeasured,
                    allowSupervision: request.allowSupervision,
                    allowPackages: request.allowPackages,
                    allowLocations: request.allowLocations,
                    allowHR: request.allowHR,
                    allowAddProgressEntry: request.allowAddProgressEntry,
                    allowReopenClosedDay: request.allowReopenClosedDay,
                    autoCloseDay: request.autoCloseDay,
                    enableInvoiceReview: request.enableInvoiceReview,
                    enableDelayNotification: request.enableDelayNotification,
                    requirePhotoReview: request.requirePhotoReview,
                    clientCanSeeFinancials: request.clientCanSeeFinancials,
                    clientCanSeeMedia: request.clientCanSeeMedia,
                    clientCanSeeBOQ: request.clientCanSeeBOQ
                }
            };
            return of(this.mockCompanies[index]).pipe(delay(500));
        }
        return of(null as any);
        // return this.http.put<Company>(`${this.apiUrl}/${id}`, request);
    }

    deleteCompany(id: number): Observable<any> {
        this.mockCompanies = this.mockCompanies.filter(c => c.id !== id);
        return of({ success: true }).pipe(delay(500));
        // return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
