import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationDto {
    id: number;
    userId: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
    actionUrl?: string;
    priority?: string;
}

export interface UnreadCountResponse {
    UnreadCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    private apiUrl = 'api/notifications';

    constructor(private http: HttpClient) { }

    // GET: api/notifications
    getNotifications(unreadOnly: boolean = false): Observable<NotificationDto[]> {
        return this.http.get<NotificationDto[]>(`${this.apiUrl}?unreadOnly=${unreadOnly}`);
    }

    // GET: api/notifications/unread-count
    getUnreadCount(): Observable<UnreadCountResponse> {
        return this.http.get<UnreadCountResponse>(`${this.apiUrl}/unread-count`);
    }

    // POST: api/notifications/{notificationId}/read
    markAsRead(notificationId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${notificationId}/read`, {});
    }

    // POST: api/notifications/read-all
    markAllAsRead(): Observable<any> {
        return this.http.post(`${this.apiUrl}/read-all`, {});
    }
}
