import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DailyLogDto {
    id: number;
    itemId: number;
    itemName?: string;
    logDate: string;
    isClosed: boolean;
    completionPercentage?: number;
    notes?: string;
    closedByUserId?: number;
    closedByUserName?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateDailyLogRequest {
    logDate: string;
}

export interface CloseDailyLogRequest {
    completionPercentage: number;
    notes?: string;
}

export interface ReopenDailyLogRequest {
    reason: string;
    notifyRoleIds?: number[];
}

@Injectable({
    providedIn: 'root'
})
export class DailyLogsService {
    private apiUrl = 'api/items';

    constructor(private http: HttpClient) { }

    // POST: api/items/{itemId}/dailylogs
    createOrGetDailyLog(itemId: number, request: CreateDailyLogRequest): Observable<{ dailyLogId: number }> {
        return this.http.post<{ dailyLogId: number }>(`${this.apiUrl}/${itemId}/dailylogs`, request);
    }

    // PUT: api/items/{itemId}/dailylogs/{logDate}/close
    closeDailyLog(itemId: number, logDate: string, request: CloseDailyLogRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${itemId}/dailylogs/${logDate}/close`, request);
    }

    // GET: api/items/{itemId}/dailylogs/history
    getDailyLogHistory(itemId: number): Observable<DailyLogDto[]> {
        return this.http.get<DailyLogDto[]>(`${this.apiUrl}/${itemId}/dailylogs/history`);
    }

    // PUT: api/items/{itemId}/dailylogs/{logDate}/reopen
    reopenClosedDay(itemId: number, logDate: string, request: ReopenDailyLogRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${itemId}/dailylogs/${logDate}/reopen`, request);
    }
}
