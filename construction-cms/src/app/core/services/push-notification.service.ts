import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Device Token DTOs
export interface RegisterDeviceRequest {
    deviceToken: string;
    platform: string; // Web, Android, iOS
    deviceName?: string;
}

export interface DeviceTokenDto {
    id: number;
    platform: string;
    deviceName?: string;
    lastUsedAt: Date;
    isActive: boolean;
}

// Push Notification DTOs
export interface SendPushNotificationRequest {
    userIds: number[];
    title: string;
    body: string;
    icon?: string;
    image?: string;
    link?: string;
    data?: Record<string, string>;
    notificationType?: string;
    notificationId?: number;
}

export interface PushResultDto {
    success: boolean;
    message: string;
    successCount: number;
    failureCount: number;
    errors?: string[];
}

export interface PushNotificationLogDto {
    id: number;
    title: string;
    body: string;
    status: string;
    errorMessage?: string;
    sentAt: Date;
    openedAt?: Date;
    deviceName?: string;
}

export interface PushNotificationSettingsDto {
    enablePushNotifications: boolean;
    notifyOnPaymentReceived: boolean;
    notifyOnInvoiceApproval: boolean;
    notifyOnProjectUpdate: boolean;
    notifyOnTaskAssignment: boolean;
    notifyOnLocationAlert: boolean;
    notifyOnMessage: boolean;
    notifyOnApprovalRequest: boolean;
    notifyOnDelayAlert: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {
    private apiUrl = '/api/push-notifications';

    constructor(private http: HttpClient) { }

    // Device Management
    registerDevice(request: RegisterDeviceRequest): Observable<DeviceTokenDto> {
        return this.http.post<DeviceTokenDto>(`${this.apiUrl}/devices/register`, request);
    }

    getDevices(): Observable<DeviceTokenDto[]> {
        return this.http.get<DeviceTokenDto[]>(`${this.apiUrl}/devices`);
    }

    unregisterDevice(deviceToken: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/devices/${encodeURIComponent(deviceToken)}`);
    }

    // Send Push Notifications (Admin)
    sendPush(request: SendPushNotificationRequest): Observable<PushResultDto> {
        return this.http.post<PushResultDto>(`${this.apiUrl}/send`, request);
    }

    // History
    getHistory(count: number = 50): Observable<PushNotificationLogDto[]> {
        return this.http.get<PushNotificationLogDto[]>(`${this.apiUrl}/history`, {
            params: { count: count.toString() }
        });
    }

    // Unread Count
    getUnreadCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
    }

    // Mark as Opened
    markAsOpened(pushLogId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${pushLogId}/opened`, {});
    }

    // Settings
    getSettings(): Observable<PushNotificationSettingsDto> {
        return this.http.get<PushNotificationSettingsDto>(`${this.apiUrl}/settings`);
    }

    updateSettings(settings: PushNotificationSettingsDto): Observable<PushNotificationSettingsDto> {
        return this.http.put<PushNotificationSettingsDto>(`${this.apiUrl}/settings`, settings);
    }

    // Test Push
    testPush(): Observable<PushResultDto> {
        return this.http.post<PushResultDto>(`${this.apiUrl}/test`, {});
    }
}
