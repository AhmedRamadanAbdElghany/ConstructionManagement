import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ProjectProfitability, ItemProfitability } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ProfitabilityService {
    private apiUrl = 'api/projects'; // Base path needs project ID

    // Dummy Data
    private mockProjectProfitability: { [key: number]: ProjectProfitability } = {
        1: {
            projectId: 1,
            totalEstimatedBudget: 1500000,
            totalSpent: 900000,
            totalProfit: 600000,
            profitPercentage: 40,
            itemsCount: 15
        },
        2: {
            projectId: 2,
            totalEstimatedBudget: 500000,
            totalSpent: 550000,
            totalProfit: -50000,
            profitPercentage: -10,
            itemsCount: 8
        }
    };

    private mockItemProfitability: { [key: number]: ItemProfitability[] } = {
        1: [
            { boqItemId: 1, itemName: 'Excavation', estimatedBudget: 200000, totalSpent: 180000, currentProfit: 20000, profitPercentage: 10 },
            { boqItemId: 2, itemName: 'Foundation', estimatedBudget: 500000, totalSpent: 450000, currentProfit: 50000, profitPercentage: 10 }
        ],
        2: [
            { boqItemId: 3, itemName: 'Brick Work', estimatedBudget: 100000, totalSpent: 120000, currentProfit: -20000, profitPercentage: -20 }
        ]
    };

    constructor(private http: HttpClient) { }

    getProjectProfitability(projectId: number): Observable<ProjectProfitability | undefined> {
        // return this.http.get<ProjectProfitability>(`${this.apiUrl}/${projectId}/profitability`);
        return of(this.mockProjectProfitability[projectId]);
    }

    getItemProfitability(projectId: number, boqItemId: number): Observable<ItemProfitability | undefined> {
        // return this.http.get<ItemProfitability>(`${this.apiUrl}/${projectId}/profitability/item/${boqItemId}`);

        // In dummy mode, we filter by boqItemId from the mock list
        const items = this.mockItemProfitability[projectId];
        const item = items?.find(i => i.boqItemId === boqItemId);
        return of(item);
    }
}
