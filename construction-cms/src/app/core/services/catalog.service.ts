import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogItem } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class CatalogService {
    private apiUrl = 'api/catalog';
    private http = inject(HttpClient);

    getCatalogItems(projectId?: number): Observable<CatalogItem[]> {
        let params = new HttpParams();
        if (projectId) {
            params = params.set('projectId', projectId.toString());
        }
        return this.http.get<CatalogItem[]>(this.apiUrl, { params });
    }

    getCatalogItem(id: number): Observable<CatalogItem> {
        return this.http.get<CatalogItem>(`${this.apiUrl}/${id}`);
    }

    addCatalogItem(item: Partial<CatalogItem>): Observable<CatalogItem> {
        return this.http.post<CatalogItem>(this.apiUrl, item);
    }

    updateCatalogItem(id: number, item: Partial<CatalogItem>): Observable<CatalogItem> {
        return this.http.put<CatalogItem>(`${this.apiUrl}/${id}`, item);
    }

    deleteCatalogItem(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getCatalogCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/categories`);
    }

    getCatalogItemsByCategory(category: string, projectId?: number): Observable<CatalogItem[]> {
        let params = new HttpParams().set('category', category);
        if (projectId) {
            params = params.set('projectId', projectId.toString());
        }
        return this.http.get<CatalogItem[]>(`${this.apiUrl}/by-category`, { params });
    }

    searchCatalogItems(query: string, projectId?: number): Observable<CatalogItem[]> {
        let params = new HttpParams().set('query', query);
        if (projectId) {
            params = params.set('projectId', projectId.toString());
        }
        return this.http.get<CatalogItem[]>(`${this.apiUrl}/search`, { params });
    }
}
