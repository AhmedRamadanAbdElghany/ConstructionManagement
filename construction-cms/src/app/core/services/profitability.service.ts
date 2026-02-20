import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectProfitability, ItemProfitability } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ProfitabilityService {
    private apiUrl = 'api/projects';

    constructor(private http: HttpClient) { }

    getProjectProfitability(projectId: number): Observable<ProjectProfitability> {
        return this.http.get<ProjectProfitability>(`${this.apiUrl}/${projectId}/profitability`);
    }

    getItemProfitability(projectId: number, projectItemId: number): Observable<ItemProfitability> {
        return this.http.get<ItemProfitability>(`${this.apiUrl}/${projectId}/profitability/item/${projectItemId}`);
    }
}
