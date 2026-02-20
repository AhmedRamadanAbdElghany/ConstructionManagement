import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LocationTrackingService, CompanyLocationSettingsDto, UpdateLocationSettingsRequest, TodayLocationSummaryDto, WorkerLocationStatusDto, TrackingMode, LocationType, LocationRequestStatus } from '../../../core/services/location-tracking.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-location-tracking',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">{{ 'LOCATION_TRACKING.TITLE' | translate }}</h1>

        <!-- Settings Section -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">{{ 'LOCATION_TRACKING.SETTINGS' | translate }}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center">
                    <input type="checkbox" id="enabled" [(ngModel)]="settings.isLocationTrackingEnabled"
                        class="h-4 w-4 text-blue-600 rounded border-gray-300">
                    <label for="enabled" class="ml-2 block text-sm text-gray-900">
                        {{ 'LOCATION_TRACKING.ENABLE_TRACKING' | translate }}
                    </label>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'LOCATION_TRACKING.TRACKING_MODE' | translate }}
                    </label>
                    <select [(ngModel)]="settings.trackingMode" class="w-full border rounded px-3 py-2">
                        <option [value]="0">{{ 'LOCATION_TRACKING.MODE_START_END' | translate }}</option>
                        <option [value]="1">{{ 'LOCATION_TRACKING.MODE_RANDOM' | translate }}</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'LOCATION_TRACKING.WORKING_HOURS_START' | translate }}
                    </label>
                    <input type="time" [(ngModel)]="settings.workingHoursStart" class="w-full border rounded px-3 py-2">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'LOCATION_TRACKING.WORKING_HOURS_END' | translate }}
                    </label>
                    <input type="time" [(ngModel)]="settings.workingHoursEnd" class="w-full border rounded px-3 py-2">
                </div>

                <div *ngIf="settings.trackingMode === 1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'LOCATION_TRACKING.RANDOM_CHECKS_COUNT' | translate }}
                    </label>
                    <input type="number" [(ngModel)]="settings.randomCheckCount" min="1" max="10"
                        class="w-full border rounded px-3 py-2">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'LOCATION_TRACKING.EXPIRATION_MINUTES' | translate }}
                    </label>
                    <input type="number" [(ngModel)]="settings.requestExpirationMinutes" min="5" max="120"
                        class="w-full border rounded px-3 py-2">
                </div>

                <div class="flex items-center">
                    <input type="checkbox" id="reminders" [(ngModel)]="settings.sendReminders"
                        class="h-4 w-4 text-blue-600 rounded border-gray-300">
                    <label for="reminders" class="ml-2 block text-sm text-gray-900">
                        {{ 'LOCATION_TRACKING.SEND_REMINDERS' | translate }}
                    </label>
                </div>

                <div *ngIf="settings.sendReminders">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'LOCATION_TRACKING.REMINDER_DELAY' | translate }}
                    </label>
                    <input type="number" [(ngModel)]="settings.reminderDelayMinutes" min="1" max="60"
                        class="w-full border rounded px-3 py-2">
                </div>
            </div>

            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'LOCATION_TRACKING.WORKING_DAYS' | translate }}
                </label>
                <div class="flex flex-wrap gap-2">
                    <ng-container *ngFor="let day of daysOfWeek; let i = index">
                        <label class="inline-flex items-center">
                            <input type="checkbox" [checked]="settings.workingDays.includes(i + 1)"
                                (change)="toggleWorkingDay(i + 1)" class="h-4 w-4 text-blue-600 rounded border-gray-300">
                            <span class="ml-2 text-sm">{{ day }}</span>
                        </label>
                    </ng-container>
                </div>
            </div>

            <div class="mt-6">
                <button (click)="saveSettings()" [disabled]="saving"
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                    <span *ngIf="saving">{{ 'COMMON.SAVING' | translate }}</span>
                    <span *ngIf="!saving">{{ 'COMMON.SAVE' | translate }}</span>
                </button>
            </div>
        </div>

        <!-- Today's Summary -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold">{{ 'LOCATION_TRACKING.TODAY_SUMMARY' | translate }}</h2>
                <button (click)="refreshSummary()" class="text-blue-600 hover:text-blue-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 rounded-lg p-4 text-center">
                    <div class="text-3xl font-bold text-blue-600">{{ summary?.totalWorkers || 0 }}</div>
                    <div class="text-sm text-gray-600">{{ 'LOCATION_TRACKING.TOTAL_WORKERS' | translate }}</div>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                    <div class="text-3xl font-bold text-green-600">{{ summary?.workersWithStartLocation || 0 }}</div>
                    <div class="text-sm text-gray-600">{{ 'LOCATION_TRACKING.STARTED_WORK' | translate }}</div>
                </div>
                <div class="bg-yellow-50 rounded-lg p-4 text-center">
                    <div class="text-3xl font-bold text-yellow-600">{{ summary?.workersWithEndLocation || 0 }}</div>
                    <div class="text-sm text-gray-600">{{ 'LOCATION_TRACKING.ENDED_WORK' | translate }}</div>
                </div>
                <div class="bg-red-50 rounded-lg p-4 text-center">
                    <div class="text-3xl font-bold text-red-600">{{ summary?.workersPendingStart || 0 }}</div>
                    <div class="text-sm text-gray-600">{{ 'LOCATION_TRACKING.PENDING_START' | translate }}</div>
                </div>
            </div>

            <!-- Workers List -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {{ 'LOCATION_TRACKING.WORKER' | translate }}
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {{ 'LOCATION_TRACKING.START_LOCATION' | translate }}
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {{ 'LOCATION_TRACKING.END_LOCATION' | translate }}
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {{ 'LOCATION_TRACKING.RANDOM_CHECKS' | translate }}
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {{ 'LOCATION_TRACKING.LAST_LOCATION' | translate }}
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {{ 'LOCATION_TRACKING.ACTIONS' | translate }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let worker of summary?.workers || []">
                            <td class="px-4 py-3 whitespace-nowrap">
                                <div class="font-medium text-gray-900">{{ worker.userName }}</div>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                                <span *ngIf="worker.hasSubmittedStartLocation" class="text-green-600">✓</span>
                                <span *ngIf="!worker.hasSubmittedStartLocation" class="text-gray-400">-</span>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                                <span *ngIf="worker.hasSubmittedEndLocation" class="text-green-600">✓</span>
                                <span *ngIf="!worker.hasSubmittedEndLocation" class="text-gray-400">-</span>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                                {{ worker.randomChecksCompleted }} / {{ worker.randomChecksExpected }}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                <span *ngIf="worker.lastLocationTime">
                                    {{ worker.lastLocationTime | date:'short' }}
                                </span>
                                <span *ngIf="!worker.lastLocationTime">-</span>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                                <button (click)="requestLocation(worker.userId)" 
                                    class="text-blue-600 hover:text-blue-800 text-sm">
                                    {{ 'LOCATION_TRACKING.REQUEST_LOCATION' | translate }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Request Location Modal -->
        <div *ngIf="showRequestModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">{{ 'LOCATION_TRACKING.REQUEST_LOCATION_TITLE' | translate }}</h3>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'LOCATION_TRACKING.EXPIRES_IN' | translate }}
                    </label>
                    <input type="number" [(ngModel)]="requestExpiresIn" min="5" max="120"
                        class="w-full border rounded px-3 py-2">
                    <span class="text-sm text-gray-500">{{ 'LOCATION_TRACKING.MINUTES' | translate }}</span>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'LOCATION_TRACKING.NOTES' | translate }}
                    </label>
                    <textarea [(ngModel)]="requestNotes" rows="3"
                        class="w-full border rounded px-3 py-2"></textarea>
                </div>

                <div class="flex justify-end gap-2">
                    <button (click)="closeRequestModal()" 
                        class="px-4 py-2 border rounded hover:bg-gray-50">
                        {{ 'COMMON.CANCEL' | translate }}
                    </button>
                    <button (click)="sendLocationRequest()" [disabled]="sendingRequest"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        {{ 'LOCATION_TRACKING.SEND_REQUEST' | translate }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: []
})
export class LocationTrackingComponent implements OnInit {
    private locationService = inject(LocationTrackingService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    settings: CompanyLocationSettingsDto = {
        id: 0,
        isLocationTrackingEnabled: false,
        trackingMode: TrackingMode.StartEnd,
        workingHoursStart: '08:00',
        workingHoursEnd: '17:00',
        randomCheckCount: 3,
        workingDays: [1, 2, 3, 4, 5],
        requirePhoto: false,
        requestExpirationMinutes: 30,
        sendReminders: true,
        reminderDelayMinutes: 10
    };

    summary: TodayLocationSummaryDto | null = null;
    saving = false;
    showRequestModal = false;
    selectedWorkerId: number | null = null;
    requestExpiresIn = 30;
    requestNotes = '';
    sendingRequest = false;

    daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    ngOnInit(): void {
        this.loadSettings();
        this.loadSummary();
    }

    loadSettings(): void {
        this.locationService.getSettings().subscribe({
            next: (settings) => {
                this.settings = settings;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load settings:', err)
        });
    }

    loadSummary(): void {
        this.locationService.getTodaySummary().subscribe({
            next: (summary) => {
                this.summary = summary;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load summary:', err)
        });
    }

    refreshSummary(): void {
        this.loadSummary();
    }

    toggleWorkingDay(day: number): void {
        const index = this.settings.workingDays.indexOf(day);
        if (index > -1) {
            this.settings.workingDays.splice(index, 1);
        } else {
            this.settings.workingDays.push(day);
        }
    }

    saveSettings(): void {
        this.saving = true;
        const request: UpdateLocationSettingsRequest = {
            isLocationTrackingEnabled: this.settings.isLocationTrackingEnabled,
            trackingMode: this.settings.trackingMode,
            workingHoursStart: this.settings.workingHoursStart,
            workingHoursEnd: this.settings.workingHoursEnd,
            randomCheckCount: this.settings.randomCheckCount,
            workingDays: this.settings.workingDays,
            requirePhoto: this.settings.requirePhoto,
            requestExpirationMinutes: this.settings.requestExpirationMinutes,
            sendReminders: this.settings.sendReminders,
            reminderDelayMinutes: this.settings.reminderDelayMinutes
        };

        this.locationService.updateSettings(request).subscribe({
            next: (updated) => {
                this.settings = updated;
                this.saving = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to save settings:', err);
                this.saving = false;
            }
        });
    }

    requestLocation(userId: number): void {
        this.selectedWorkerId = userId;
        this.showRequestModal = true;
    }

    closeRequestModal(): void {
        this.showRequestModal = false;
        this.selectedWorkerId = null;
        this.requestNotes = '';
    }

    sendLocationRequest(): void {
        if (!this.selectedWorkerId) return;

        this.sendingRequest = true;
        this.locationService.createLocationRequest({
            userIds: [this.selectedWorkerId],
            expiresInMinutes: this.requestExpiresIn,
            notes: this.requestNotes
        }).subscribe({
            next: () => {
                this.sendingRequest = false;
                this.closeRequestModal();
                this.refreshSummary();
            },
            error: (err) => {
                console.error('Failed to send request:', err);
                this.sendingRequest = false;
            }
        });
    }
}
