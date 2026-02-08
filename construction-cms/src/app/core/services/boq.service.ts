import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BOQItem, CreateBOQItemRequest, UpdateBOQItemRequest } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class BOQService {
    private apiUrl = 'api/projects'; // items are nested under projects

    constructor(private http: HttpClient) { }

    getItems(projectId: number): Observable<BOQItem[]> {
        return this.http.get<BOQItem[]>(`${this.apiUrl}/${projectId}/items`);
    }

    getItemById(projectId: number, itemId: number): Observable<BOQItem> {
        return this.http.get<BOQItem>(`${this.apiUrl}/${projectId}/items/${itemId}`);
    }

    createItem(projectId: number, request: CreateBOQItemRequest): Observable<{ itemId: number }> {
        return this.http.post<{ itemId: number }>(`${this.apiUrl}/${projectId}/items`, request);
    }

    updateItem(projectId: number, itemId: number, request: UpdateBOQItemRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${projectId}/items/${itemId}`, request);
    }
}
