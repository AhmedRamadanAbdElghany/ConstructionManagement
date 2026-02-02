import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BOQItem, CreateBOQItemRequest, UpdateBOQItemRequest } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class BOQService {
    private apiUrl = 'api/projects'; // items are nested under projects

    // Dummy Data
    private dummyBOQItems: { [key: number]: BOQItem[] } = {
        1: [
            { id: 1, projectId: 1, description: 'Excavation Works', unit: 'm³', totalQuantity: 5000, executedQuantity: 4500, rate: 50 },
            { id: 2, projectId: 1, description: 'Concrete Foundation', unit: 'm³', totalQuantity: 2000, executedQuantity: 1200, rate: 300 }
        ],
        2: [
            { id: 3, projectId: 2, description: 'Brick Works', unit: 'm²', totalQuantity: 1000, executedQuantity: 200, rate: 80 }
        ]
    };

    constructor(private http: HttpClient) { }

    getItems(projectId: number): Observable<BOQItem[]> {
        // return this.http.get<BOQItem[]>(`${this.apiUrl}/${projectId}/items`);
        return of(this.dummyBOQItems[projectId] || []);
    }

    getItemById(projectId: number, itemId: number): Observable<BOQItem | undefined> {
        // return this.http.get<BOQItem>(`${this.apiUrl}/${projectId}/items/${itemId}`);
        const items = this.dummyBOQItems[projectId];
        return of(items?.find(i => i.id === itemId));
    }

    createItem(projectId: number, request: CreateBOQItemRequest): Observable<BOQItem> {
        // return this.http.post<BOQItem>(`${this.apiUrl}/${projectId}/items`, request);

        if (!this.dummyBOQItems[projectId]) {
            this.dummyBOQItems[projectId] = [];
        }

        const newItem: BOQItem = {
            id: Math.floor(Math.random() * 1000) + 100, // random ID
            projectId: projectId,
            description: request.itemName, // Mapping CreateRequest properties to BOQItem interface
            unit: request.unit || '',
            totalQuantity: request.agreedQuantity || 0,
            executedQuantity: 0,
            rate: request.unitPrice || 0
            // Note: BOQItem interface in frontend is simplified compared to Backend's full entity
        };

        this.dummyBOQItems[projectId].push(newItem);
        return of(newItem);
    }

    updateItem(projectId: number, itemId: number, request: UpdateBOQItemRequest): Observable<BOQItem | undefined> {
        // return this.http.put<BOQItem>(`${this.apiUrl}/${projectId}/items/${itemId}`, request);

        const items = this.dummyBOQItems[projectId];
        const index = items?.findIndex(i => i.id === itemId);

        if (index !== undefined && index !== -1) {
            const item = items[index];
            if (request.itemName) item.description = request.itemName; // Mapping name to description as per interface
            // Other fields in UpdateBOQItemRequest like Status, StartDate are not in simple BOQItem interface yet

            items[index] = item;
            return of(item);
        }
        return of(undefined);
    }
}
