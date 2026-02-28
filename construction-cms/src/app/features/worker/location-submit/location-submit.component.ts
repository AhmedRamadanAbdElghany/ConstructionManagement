import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LocationTrackingService, PendingLocationRequestDto, WorkerLocationDto, LocationType, SubmitLocationRequest, WorkerZoneStatusDto } from '../../../core/services/location-tracking.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-worker-location',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="p-6 max-w-lg mx-auto">
        <h1 class="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{{ 'LOCATION_TRACKING.MY_LOCATION' | translate }}</h1>

        <!-- Pending Requests Alert -->
        <div *ngIf="pendingRequests.length > 0" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-yellow-700 font-medium">
                        {{ 'LOCATION_TRACKING.PENDING_REQUESTS' | translate }}: {{ pendingRequests.length }}
                    </p>
                    <div *ngFor="let request of pendingRequests" class="mt-2">
                        <button (click)="fulfillRequest(request)" 
                            class="text-sm text-yellow-800 underline hover:no-underline">
                            {{ 'LOCATION_TRACKING.SUBMIT_FOR_REQUEST' | translate }} 
                            ({{ request.createdAt | date:'short' }})
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Geofence Status Card -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">{{ 'GEOFENCING.MY_STATUS' | translate }}</h2>
            
            <div *ngIf="loadingGeofence" class="flex justify-center py-4">
                <svg class="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
            </div>

            <div *ngIf="!loadingGeofence && geofenceStatus">
                <!-- Current Status Badge -->
                <div class="flex items-center justify-between p-4 rounded-lg mb-4" 
                    [class.bg-green-100]="geofenceStatus.isInsideZone"
                    [class.bg-red-100]="!geofenceStatus.isInsideZone">
                    <div>
                        <p class="text-sm font-medium text-gray-700">{{ 'GEOFENCING.STATUS' | translate }}</p>
                        <p class="text-xl font-bold" [class.text-green-700]="geofenceStatus.isInsideZone" [class.text-red-700]="!geofenceStatus.isInsideZone">
                            {{ (geofenceStatus.isInsideZone ? 'GEOFENCING.INSIDE' : 'GEOFENCING.OUTSIDE') | translate }}
                        </p>
                    </div>
                    <div class="text-right" *ngIf="geofenceStatus.currentZoneName">
                        <p class="text-sm font-medium text-gray-700">{{ 'GEOFENCING.ZONE' | translate }}</p>
                        <p class="text-lg font-semibold text-gray-800">{{ geofenceStatus.currentZoneName }}</p>
                    </div>
                </div>

                <!-- Overdue Alert -->
                <div *ngIf="geofenceStatus.isOverdue" class="mb-4 p-3 bg-red-600 text-white rounded-lg flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <span class="font-medium">{{ 'GEOFENCING.OVERDUE' | translate }}! ({{ geofenceStatus.minutesOutside }} {{ 'LOCATION_TRACKING.MINUTES' | translate }})</span>
                </div>

                <!-- Assigned Zones List -->
                <div>
                    <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ 'GEOFENCING.ASSIGNED_ZONES' | translate }}</h3>
                    <div *ngIf="geofenceStatus.assignedZones.length === 0" class="text-sm text-gray-400 italic">
                        {{ 'GEOFENCING.NO_ASSIGNED_ZONES' | translate }}
                    </div>
                    <ul class="space-y-2">
                        <li *ngFor="let azone of geofenceStatus.assignedZones" class="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                            <span class="font-medium">{{ azone.zoneName }}</span>
                            <span class="px-2 py-0.5 rounded text-xs" 
                                [class.bg-green-100]="azone.isCurrentlyInside" 
                                [class.text-green-700]="azone.isCurrentlyInside"
                                [class.bg-gray-100]="!azone.isCurrentlyInside"
                                [class.text-gray-500]="!azone.isCurrentlyInside">
                                {{ (azone.isCurrentlyInside ? 'GEOFENCING.INSIDE' : 'GEOFENCING.OUTSIDE') | translate }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div *ngIf="!loadingGeofence && !geofenceStatus" class="text-center text-gray-500 py-4">
                {{ 'GEOFENCING.NO_ASSIGNED_ZONES' | translate }}
            </div>
        </div>

        <!-- Location Submission Card -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">{{ 'LOCATION_TRACKING.SUBMIT_LOCATION' | translate }}</h2>

            <!-- Location Type Selection -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'LOCATION_TRACKING.LOCATION_TYPE' | translate }}
                </label>
                <div class="grid grid-cols-2 gap-2">
                    <button (click)="locationType = 0" 
                        [class.bg-blue-600]="locationType === 0"
                        [class.text-white]="locationType === 0"
                        [class.bg-gray-100]="locationType !== 0"
                        class="px-4 py-2 rounded border text-sm font-medium">
                        {{ 'LOCATION_TRACKING.START_OF_DAY' | translate }}
                    </button>
                    <button (click)="locationType = 1"
                        [class.bg-blue-600]="locationType === 1"
                        [class.text-white]="locationType === 1"
                        [class.bg-gray-100]="locationType !== 1"
                        class="px-4 py-2 rounded border text-sm font-medium">
                        {{ 'LOCATION_TRACKING.END_OF_DAY' | translate }}
                    </button>
                </div>
            </div>

            <!-- Current Location Display -->
            <div *ngIf="currentPosition" class="mb-4 p-3 bg-gray-50 rounded">
                <div class="flex items-center gap-2 text-sm">
                    <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-600">{{ 'LOCATION_TRACKING.LOCATION_ACQUIRED' | translate }}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    {{ currentPosition.coords.latitude.toFixed(6) }}, {{ currentPosition.coords.longitude.toFixed(6) }}
                    <span *ngIf="currentPosition.coords.accuracy">
                        (±{{ currentPosition.coords.accuracy.toFixed(0) }}m)
                    </span>
                </div>
            </div>

            <!-- Get Location Button -->
            <div class="mb-4">
                <button (click)="getCurrentLocation()" [disabled]="gettingLocation"
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    <svg *ngIf="gettingLocation" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <svg *ngIf="!gettingLocation" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span *ngIf="gettingLocation">{{ 'LOCATION_TRACKING.GETTING_LOCATION' | translate }}</span>
                    <span *ngIf="!gettingLocation">{{ 'LOCATION_TRACKING.GET_LOCATION' | translate }}</span>
                </button>
            </div>

            <!-- Notes -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ 'LOCATION_TRACKING.NOTES' | translate }} ({{ 'COMMON.OPTIONAL' | translate }})
                </label>
                <textarea [(ngModel)]="notes" rows="2"
                    class="w-full border rounded px-3 py-2"
                    [placeholder]="'LOCATION_TRACKING.NOTES_PLACEHOLDER' | translate"></textarea>
            </div>

            <!-- Submit Button -->
            <button (click)="submitLocation()" 
                [disabled]="!currentPosition || submitting"
                class="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="submitting">{{ 'LOCATION_TRACKING.SUBMITTING' | translate }}</span>
                <span *ngIf="!submitting">{{ 'LOCATION_TRACKING.SUBMIT' | translate }}</span>
            </button>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">
                {{ errorMessage }}
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="mt-4 p-3 bg-green-50 text-green-700 rounded text-sm">
                {{ successMessage }}
            </div>
        </div>

        <!-- Recent Submissions -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">{{ 'LOCATION_TRACKING.RECENT_SUBMISSIONS' | translate }}</h2>
            
            <div *ngIf="recentLocations.length === 0" class="text-gray-500 text-center py-4">
                {{ 'LOCATION_TRACKING.NO_SUBMISSIONS' | translate }}
            </div>

            <div *ngIf="recentLocations.length > 0" class="space-y-3">
                <div *ngFor="let loc of recentLocations" class="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                        <div class="font-medium text-sm">
                            {{ getLocationTypeLabel(loc.locationType) }}
                        </div>
                        <div class="text-xs text-gray-500">
                            {{ loc.recordedAt | date:'medium' }}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">
                            {{ loc.latitude.toFixed(4) }}, {{ loc.longitude.toFixed(4) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: []
})
export class WorkerLocationComponent implements OnInit {
    private locationService = inject(LocationTrackingService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    pendingRequests: PendingLocationRequestDto[] = [];
    recentLocations: WorkerLocationDto[] = [];
    currentPosition: GeolocationPosition | null = null;
    locationType: LocationType = LocationType.StartOfDay;
    notes = '';
    selectedRequestId: number | null = null;

    gettingLocation = false;
    submitting = false;
    errorMessage = '';
    successMessage = '';

    geofenceStatus: WorkerZoneStatusDto | null = null;
    loadingGeofence = false;

    ngOnInit(): void {
        this.loadPendingRequests();
        this.loadRecentLocations();
        this.loadGeofenceStatus();
    }

    loadGeofenceStatus(): void {
        this.loadingGeofence = true;
        this.locationService.getMyZoneStatus().subscribe({
            next: (status) => {
                this.geofenceStatus = status;
                this.loadingGeofence = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load geofence status:', err);
                this.loadingGeofence = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadPendingRequests(): void {
        this.locationService.getMyPendingRequests().subscribe({
            next: (requests) => {
                this.pendingRequests = requests.filter(r => !r.isExpired);
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load pending requests:', err)
        });
    }

    loadRecentLocations(): void {
        this.locationService.getMyHistory().subscribe({
            next: (history) => {
                this.recentLocations = history.locations;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load history:', err)
        });
    }

    getCurrentLocation(): void {
        this.errorMessage = '';
        this.gettingLocation = true;

        if (!navigator.geolocation) {
            this.errorMessage = 'Geolocation is not supported by your browser';
            this.gettingLocation = false;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.currentPosition = position;
                this.gettingLocation = false;
                this.cdr.detectChanges();
            },
            (error) => {
                this.gettingLocation = false;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        this.errorMessage = 'Location permission denied. Please enable location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        this.errorMessage = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        this.errorMessage = 'Location request timed out.';
                        break;
                    default:
                        this.errorMessage = 'An unknown error occurred.';
                }
                this.cdr.detectChanges();
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );
    }

    fulfillRequest(request: PendingLocationRequestDto): void {
        this.selectedRequestId = request.requestId;
        this.locationType = LocationType.OnDemand;
        this.getCurrentLocation();
    }

    submitLocation(): void {
        if (!this.currentPosition) return;

        this.submitting = true;
        this.errorMessage = '';
        this.successMessage = '';

        const request: SubmitLocationRequest = {
            latitude: this.currentPosition.coords.latitude,
            longitude: this.currentPosition.coords.longitude,
            accuracy: this.currentPosition.coords.accuracy,
            locationType: this.locationType,
            requestId: this.selectedRequestId ?? undefined,
            notes: this.notes || undefined,
            deviceInfo: navigator.userAgent
        };

        this.locationService.submitLocation(request).subscribe({
            next: (location) => {
                this.submitting = false;
                this.successMessage = 'Location submitted successfully!';
                this.currentPosition = null;
                this.notes = '';
                this.selectedRequestId = null;
                this.locationType = LocationType.StartOfDay;

                // Remove fulfilled request from pending
                if (request.requestId) {
                    this.pendingRequests = this.pendingRequests.filter(r => r.requestId !== request.requestId);
                }

                // Add to recent locations
                this.recentLocations.unshift(location);
                if (this.recentLocations.length > 10) {
                    this.recentLocations.pop();
                }

                this.cdr.detectChanges();
                this.loadGeofenceStatus(); // Refresh status after submission

                // Clear success message after 3 seconds
                setTimeout(() => {
                    this.successMessage = '';
                    this.cdr.detectChanges();
                }, 3000);
            },
            error: (err) => {
                this.submitting = false;
                this.errorMessage = err.error?.message || 'Failed to submit location';
                this.cdr.detectChanges();
            }
        });
    }

    getLocationTypeLabel(type: LocationType): string {
        switch (type) {
            case LocationType.StartOfDay:
                return 'Start of Day';
            case LocationType.EndOfDay:
                return 'End of Day';
            case LocationType.RandomCheck:
                return 'Random Check';
            case LocationType.OnDemand:
                return 'On-Demand';
            default:
                return 'Unknown';
        }
    }
}
