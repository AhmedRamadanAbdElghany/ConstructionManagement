import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
    unreadCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    private apiUrl = 'api/notifications';

    // Signal for unread count
    unreadCount = signal(0);

    constructor(private http: HttpClient) { }

    // GET: api/notifications
    getNotifications(unreadOnly: boolean = false): Observable<NotificationDto[]> {
        return this.http.get<NotificationDto[]>(`${this.apiUrl}?unreadOnly=${unreadOnly}`);
    }

    // GET: api/notifications/unread-count
    getUnreadCount(): Observable<UnreadCountResponse> {
        return this.http.get<UnreadCountResponse>(`${this.apiUrl}/unread-count`);
    }

    // Refresh count signal
    refreshUnreadCount(): void {
        this.getUnreadCount().subscribe({
            next: (res: any) => {
                // Handle both camelCase and PascalCase from backend
                const count = res.unreadCount ?? res.UnreadCount ?? 0;
                this.unreadCount.set(count);
            },
            error: (err) => console.error('Failed to refresh unread count', err)
        });
    }

    // POST: api/notifications/{notificationId}/read
    markAsRead(notificationId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
            tap(() => this.refreshUnreadCount())
        );
    }

    // POST: api/notifications/read-all
    markAllAsRead(): Observable<any> {
        return this.http.post(`${this.apiUrl}/read-all`, {}).pipe(
            tap(() => this.refreshUnreadCount())
        );
    }
}
