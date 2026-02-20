import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Enums
export enum TrackingMode {
    StartEnd = 0,
    RandomInterval = 1
}

export enum LocationType {
    StartOfDay = 0,
    EndOfDay = 1,
    RandomCheck = 2,
    OnDemand = 3
}

export enum LocationRequestStatus {
    Pending = 0,
    Fulfilled = 1,
    Expired = 2,
    Cancelled = 3
}

export enum LocationRequestType {
    OnDemand = 0,
    RandomScheduled = 1,
    StartReminder = 2,
    EndReminder = 3
}

export enum ZoneType {
    Circle = 0,
    Polygon = 1
}

export enum GeofenceEventType {
    Entry = 0,
    Exit = 1,
    ExtendedExit = 2,
    Return = 3
}

// DTOs
export interface CompanyLocationSettingsDto {
    id: number;
    isLocationTrackingEnabled: boolean;
    trackingMode: TrackingMode;
    workingHoursStart: string;
    workingHoursEnd: string;
    randomCheckCount: number;
    workingDays: number[];
    requirePhoto: boolean;
    requestExpirationMinutes: number;
    sendReminders: boolean;
    reminderDelayMinutes: number;
}

export interface UpdateLocationSettingsRequest {
    isLocationTrackingEnabled: boolean;
    trackingMode: TrackingMode;
    workingHoursStart: string;
    workingHoursEnd: string;
    randomCheckCount: number;
    workingDays: number[];
    requirePhoto: boolean;
    requestExpirationMinutes: number;
    sendReminders: boolean;
    reminderDelayMinutes: number;
}

export interface WorkerLocationDto {
    id: number;
    userId: number;
    userName: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    locationType: LocationType;
    photoUrl?: string;
    notes?: string;
    recordedAt: Date;
    createdAt: Date;
}

export interface SubmitLocationRequest {
    latitude: number;
    longitude: number;
    accuracy?: number;
    locationType: LocationType;
    requestId?: number;
    photoBase64?: string;
    notes?: string;
    deviceInfo?: string;
}

export interface PendingLocationRequestDto {
    requestId: number;
    targetId: number;
    requestType: LocationRequestType;
    expiresAt?: Date;
    notes?: string;
    createdAt: Date;
    isExpired: boolean;
}

export interface WorkerLocationHistoryDto {
    locations: WorkerLocationDto[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface LocationRequestTargetDto {
    userId: number;
    userName: string;
    status: LocationRequestStatus;
    location?: WorkerLocationDto;
    fulfilledAt?: Date;
}

export interface LocationRequestDto {
    id: number;
    requestType: LocationRequestType;
    status: LocationRequestStatus;
    scheduledFor?: Date;
    expiresAt?: Date;
    notes?: string;
    requestedByUserId: number;
    requestedByUserName: string;
    createdAt: Date;
    targets: LocationRequestTargetDto[];
}

export interface RequestLocationRequest {
    userIds: number[];
    expiresInMinutes?: number;
    notes?: string;
}

export interface WorkerLocationStatusDto {
    userId: number;
    userName: string;
    hasSubmittedStartLocation: boolean;
    hasSubmittedEndLocation: boolean;
    randomChecksCompleted: number;
    randomChecksExpected: number;
    lastLocationTime?: Date;
    lastLocation?: WorkerLocationDto;
    pendingRequests: PendingLocationRequestDto[];
}

export interface TodayLocationSummaryDto {
    date: Date;
    totalWorkers: number;
    workersWithStartLocation: number;
    workersWithEndLocation: number;
    workersPendingStart: number;
    workersPendingEnd: number;
    workers: WorkerLocationStatusDto[];
}

// Geofencing DTOs
export interface GeofenceZoneDto {
    id: number;
    projectId?: number;
    projectName?: string;
    name: string;
    description?: string;
    zoneType: ZoneType;
    centerLatitude?: number;
    centerLongitude?: number;
    radiusMeters?: number;
    polygonGeoJson?: string;
    isActive: boolean;
    alertOnEntry: boolean;
    alertOnExit: boolean;
    allowedExitDurationMinutes?: number;
    assignedWorkerCount: number;
    createdAt: Date;
}

export interface CreateGeofenceZoneRequest {
    projectId?: number;
    name: string;
    description?: string;
    zoneType: ZoneType;
    centerLatitude?: number;
    centerLongitude?: number;
    radiusMeters?: number;
    polygonGeoJson?: string;
    alertOnEntry: boolean;
    alertOnExit: boolean;
    allowedExitDurationMinutes?: number;
}

export interface UpdateGeofenceZoneRequest {
    name: string;
    description?: string;
    isActive: boolean;
    alertOnEntry: boolean;
    alertOnExit: boolean;
    allowedExitDurationMinutes?: number;
}

export interface WorkerZoneAssignmentDto {
    assignmentId: number;
    zoneId: number;
    zoneName: string;
    userId: number;
    userName: string;
    assignedAt: Date;
    assignedByName: string;
    isActive: boolean;
}

export interface AssignWorkersToZoneRequest {
    userIds: number[];
}

export interface WorkerAssignedZoneDto {
    zoneId: number;
    zoneName: string;
    isCurrentlyInside: boolean;
}

export interface GeofenceEventDto {
    id: number;
    userId: number;
    userName: string;
    zoneId: number;
    zoneName: string;
    eventType: GeofenceEventType;
    eventTime: Date;
    durationMinutes?: number;
    isAlerted: boolean;
    latitude: number;
    longitude: number;
    notes?: string;
}

export interface GeofenceEventHistoryDto {
    events: GeofenceEventDto[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface WorkerZoneStatusDto {
    userId: number;
    userName: string;
    assignedZones: WorkerAssignedZoneDto[];
    isInsideZone: boolean;
    currentZoneId?: number;
    currentZoneName?: string;
    lastLocationTime?: Date;
    lastLatitude?: number;
    lastLongitude?: number;
    exitTime?: Date;
    minutesOutside?: number;
    isOverdue: boolean;
}

export interface WorkersZoneSummaryDto {
    lastUpdated: Date;
    totalWorkers: number;
    workersInsideZone: number;
    workersOutsideZone: number;
    workersOverdue: number;
    workers: WorkerZoneStatusDto[];
}

@Injectable({
    providedIn: 'root'
})
export class LocationTrackingService {
    private apiUrl = '/api';  // Uses proxy configuration

    constructor(private http: HttpClient) { }

    // Company Settings
    getSettings(): Observable<CompanyLocationSettingsDto> {
        return this.http.get<CompanyLocationSettingsDto>(`${this.apiUrl}/location-tracking/settings`);
    }

    updateSettings(request: UpdateLocationSettingsRequest): Observable<CompanyLocationSettingsDto> {
        return this.http.put<CompanyLocationSettingsDto>(`${this.apiUrl}/location-tracking/settings`, request);
    }

    // Worker Location Submission
    submitLocation(request: SubmitLocationRequest): Observable<WorkerLocationDto> {
        return this.http.post<WorkerLocationDto>(`${this.apiUrl}/location-tracking/submit`, request);
    }

    getMyPendingRequests(): Observable<PendingLocationRequestDto[]> {
        return this.http.get<PendingLocationRequestDto[]>(`${this.apiUrl}/location-tracking/my-pending-requests`);
    }

    getMyHistory(fromDate?: Date, toDate?: Date, page: number = 1, pageSize: number = 20): Observable<WorkerLocationHistoryDto> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (fromDate) params = params.set('fromDate', fromDate.toISOString());
        if (toDate) params = params.set('toDate', toDate.toISOString());

        return this.http.get<WorkerLocationHistoryDto>(`${this.apiUrl}/location-tracking/my-history`, { params });
    }

    // Admin Location Management
    createLocationRequest(request: RequestLocationRequest): Observable<LocationRequestDto> {
        return this.http.post<LocationRequestDto>(`${this.apiUrl}/location-tracking/requests`, request);
    }

    getLocationRequests(fromDate?: Date, toDate?: Date, status?: number): Observable<LocationRequestDto[]> {
        let params = new HttpParams();
        if (fromDate) params = params.set('fromDate', fromDate.toISOString());
        if (toDate) params = params.set('toDate', toDate.toISOString());
        if (status !== undefined) params = params.set('status', status.toString());

        return this.http.get<LocationRequestDto[]>(`${this.apiUrl}/location-tracking/requests`, { params });
    }

    cancelLocationRequest(requestId: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/location-tracking/requests/${requestId}`);
    }

    getTodaySummary(): Observable<TodayLocationSummaryDto> {
        return this.http.get<TodayLocationSummaryDto>(`${this.apiUrl}/location-tracking/today-summary`);
    }

    getWorkerHistory(userId: number, fromDate?: Date, toDate?: Date, page: number = 1, pageSize: number = 20): Observable<WorkerLocationHistoryDto> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (fromDate) params = params.set('fromDate', fromDate.toISOString());
        if (toDate) params = params.set('toDate', toDate.toISOString());

        return this.http.get<WorkerLocationHistoryDto>(`${this.apiUrl}/location-tracking/workers/${userId}/history`, { params });
    }

    getWorkerStatus(userId: number): Observable<WorkerLocationStatusDto> {
        return this.http.get<WorkerLocationStatusDto>(`${this.apiUrl}/location-tracking/workers/${userId}/status`);
    }

    // Geofencing - Zone Management
    getZones(activeOnly?: boolean): Observable<GeofenceZoneDto[]> {
        let params = new HttpParams();
        if (activeOnly !== undefined) params = params.set('activeOnly', activeOnly.toString());
        return this.http.get<GeofenceZoneDto[]>(`${this.apiUrl}/geofence/zones`, { params });
    }

    getZone(zoneId: number): Observable<GeofenceZoneDto> {
        return this.http.get<GeofenceZoneDto>(`${this.apiUrl}/geofence/zones/${zoneId}`);
    }

    createZone(request: CreateGeofenceZoneRequest): Observable<GeofenceZoneDto> {
        return this.http.post<GeofenceZoneDto>(`${this.apiUrl}/geofence/zones`, request);
    }

    updateZone(zoneId: number, request: UpdateGeofenceZoneRequest): Observable<GeofenceZoneDto> {
        return this.http.put<GeofenceZoneDto>(`${this.apiUrl}/geofence/zones/${zoneId}`, request);
    }

    deleteZone(zoneId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/geofence/zones/${zoneId}`);
    }

    // Geofencing - Worker Assignments
    assignWorkers(zoneId: number, request: AssignWorkersToZoneRequest): Observable<WorkerZoneAssignmentDto[]> {
        return this.http.post<WorkerZoneAssignmentDto[]>(`${this.apiUrl}/geofence/zones/${zoneId}/workers`, request);
    }

    removeWorker(zoneId: number, userId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/geofence/zones/${zoneId}/workers/${userId}`);
    }

    getZoneWorkers(zoneId: number): Observable<WorkerZoneAssignmentDto[]> {
        return this.http.get<WorkerZoneAssignmentDto[]>(`${this.apiUrl}/geofence/zones/${zoneId}/workers`);
    }

    getMyZones(): Observable<WorkerAssignedZoneDto[]> {
        return this.http.get<WorkerAssignedZoneDto[]>(`${this.apiUrl}/geofence/my-zones`);
    }

    getWorkerZones(userId: number): Observable<WorkerAssignedZoneDto[]> {
        return this.http.get<WorkerAssignedZoneDto[]>(`${this.apiUrl}/geofence/workers/${userId}/zones`);
    }

    // Geofencing - Events
    getGeofenceEvents(zoneId?: number, userId?: number, fromDate?: Date, toDate?: Date, page: number = 1, pageSize: number = 50): Observable<GeofenceEventHistoryDto> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (zoneId) params = params.set('zoneId', zoneId.toString());
        if (userId) params = params.set('userId', userId.toString());
        if (fromDate) params = params.set('fromDate', fromDate.toISOString());
        if (toDate) params = params.set('toDate', toDate.toISOString());

        return this.http.get<GeofenceEventHistoryDto>(`${this.apiUrl}/geofence/events`, { params });
    }

    getTodayGeofenceEvents(zoneId?: number): Observable<GeofenceEventDto[]> {
        let params = new HttpParams();
        if (zoneId) params = params.set('zoneId', zoneId.toString());
        return this.http.get<GeofenceEventDto[]>(`${this.apiUrl}/geofence/events/today`, { params });
    }

    // Geofencing - Worker Status
    getWorkersZoneStatus(): Observable<WorkersZoneSummaryDto> {
        return this.http.get<WorkersZoneSummaryDto>(`${this.apiUrl}/geofence/workers/status`);
    }

    getWorkerZoneStatus(userId: number): Observable<WorkerZoneStatusDto> {
        return this.http.get<WorkerZoneStatusDto>(`${this.apiUrl}/geofence/workers/${userId}/status`);
    }

    getMyZoneStatus(): Observable<WorkerZoneStatusDto> {
        return this.http.get<WorkerZoneStatusDto>(`${this.apiUrl}/geofence/my-status`);
    }
}
