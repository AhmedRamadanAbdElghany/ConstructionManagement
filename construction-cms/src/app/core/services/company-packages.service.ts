
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CompanyPackage } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class CompanyPackagesService {
    private apiUrl = 'api/company-packages';

    // Mock data for initial development
    private dummyPackages: CompanyPackage[] = [
        {
            id: 1,
            companyId: 1,
            name: "Silver Finishing",
            description: "Economic finishing package.",
            price: 2500,
            includedItemsDescription: "Flooring, Painting, Standard Bathroom",
            variationCalculation: "AddFullCost"
        },
        {
            id: 2,
            companyId: 1,
            name: "Gold Finishing",
            description: "Premium finishing package.",
            price: 5000,
            includedItemsDescription: "Porcelain, Spotlights, Premium Bathroom",
            variationCalculation: "AddDifference"
        }
    ];

    constructor(private http: HttpClient) { }

    getPackages(companyId: number): Observable<CompanyPackage[]> {
        // return this.http.get<CompanyPackage[]>(`${this.apiUrl}/${companyId}`);
        return of(this.dummyPackages);
    }

    createPackage(pkg: Omit<CompanyPackage, 'id'>): Observable<CompanyPackage> {
        // return this.http.post<CompanyPackage>(this.apiUrl, pkg);
        const newPkg = { ...pkg, id: this.dummyPackages.length + 1 } as CompanyPackage;
        this.dummyPackages.push(newPkg);
        return of(newPkg);
    }

    updatePackage(id: number, pkg: Partial<CompanyPackage>): Observable<CompanyPackage> {
        // return this.http.put<CompanyPackage>(`${this.apiUrl}/${id}`, pkg);
        const index = this.dummyPackages.findIndex(p => p.id === id);
        if (index > -1) {
            this.dummyPackages[index] = { ...this.dummyPackages[index], ...pkg };
            return of(this.dummyPackages[index]);
        }
        throw new Error("Package not found");
    }

    deletePackage(id: number): Observable<void> {
        // return this.http.delete<void>(`${this.apiUrl}/${id}`);
        const index = this.dummyPackages.findIndex(p => p.id === id);
        if (index > -1) {
            this.dummyPackages.splice(index, 1);
        }
        return of(void 0);
    }
}
