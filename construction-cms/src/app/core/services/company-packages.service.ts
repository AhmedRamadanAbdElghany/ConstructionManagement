
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CompanyPackage } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class CompanyPackagesService {
    private apiUrl = 'api/companies';

    constructor(private http: HttpClient) { }

    getPackages(companyId: number): Observable<CompanyPackage[]> {
        return this.http.get<CompanyPackage[]>(`${this.apiUrl}/${companyId}/packages`);
    }

    createPackage(pkg: Omit<CompanyPackage, 'id'>): Observable<CompanyPackage> {
        // If pkg has companyId, use the specific endpoint
        if (pkg.companyId) {
            return this.http.post<CompanyPackage>(`${this.apiUrl}/${pkg.companyId}/packages`, pkg);
        }
        // Fallback or error if companyId is missing for admin creation
        return this.http.post<CompanyPackage>(`${this.apiUrl}/packages`, pkg);
    }

    updatePackage(id: number, pkg: Partial<CompanyPackage>): Observable<CompanyPackage> {
        return this.http.put<CompanyPackage>(`${this.apiUrl}/packages/${id}`, pkg);
    }

    deletePackage(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/packages/${id}`);
    }
}
