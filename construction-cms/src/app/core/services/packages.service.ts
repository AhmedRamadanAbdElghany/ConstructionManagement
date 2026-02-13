import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Package } from './../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class PackagesService {
    private apiUrl = 'api/packages';

    constructor(private http: HttpClient) { }

    getAllPackages(): Observable<Package[]> {
        return this.http.get<Package[]>(this.apiUrl);
    }

    getPackageById(id: number): Observable<Package | undefined> {
        return this.http.get<Package>(`${this.apiUrl}/${id}`);
    }

    createPackage(pkg: Omit<Package, 'id'>): Observable<Package> {
        return this.http.post<Package>(this.apiUrl, pkg);
    }

    updatePackage(id: number, pkg: Partial<Package>): Observable<Package | undefined> {
        return this.http.put<Package>(`${this.apiUrl}/${id}`, pkg);
    }

    deletePackage(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    }
}
