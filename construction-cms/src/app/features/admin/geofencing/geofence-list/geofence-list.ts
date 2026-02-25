import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationTrackingService, GeofenceZoneDto, UpdateGeofenceZoneRequest } from '../../../../core/services/location-tracking.service';

@Component({
  selector: 'app-geofence-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, FormsModule],
  template: `
    <div class="p-6 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Geofence Zones</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Manage virtual perimeters for your locations</p>
          </div>
          <div class="flex items-center gap-3">
            <a routerLink="../map" 
               class="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-xl shadow-slate-900/20 dark:shadow-none hover:scale-105 active:scale-95 transition-all">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
              </svg>
              Create Zone
            </a>
          </div>
        </div>

        <!-- Zones Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (zone of zones; track zone.id) {
            <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
              
              <!-- Status Indicator -->
              <div class="absolute top-6 right-6 flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-widest" [class.text-emerald-500]="zone.isActive" [class.text-slate-400]="!zone.isActive">
                  {{ zone.isActive ? 'Active' : 'Inactive' }}
                </span>
                <button (click)="toggleZoneStatus(zone)" 
                        class="w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        [ngClass]="zone.isActive ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-700'">
                  <span class="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm"
                        [ngClass]="zone.isActive ? 'left-6 -translate-x-1' : 'left-1'"></span>
                </button>
              </div>

              <!-- Icon -->
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center mb-6 ring-1 ring-cyan-500/20">
                <svg class="w-7 h-7 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>

              <!-- Content -->
              <div class="mb-6">
                <h3 class="text-lg font-black text-slate-900 dark:text-white mb-1 truncate">{{ zone.name }}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px]">{{ zone.description || 'No description provided' }}</p>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-white/5">
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ zone.zoneType === 0 ? 'Circle' : 'Polygon' }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Workers</p>
                  <div class="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                    <svg class="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    {{ zone.assignedWorkerCount }}
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between mt-2 pt-4 border-t border-slate-100 dark:border-white/5">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" 
                        title="Alert on Entry" *ngIf="zone.alertOnEntry">ENTRY</span>
                  <span class="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Alert on Exit" *ngIf="zone.alertOnExit">EXIT</span>
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="viewZone(zone)" class="p-2 rounded-xl text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors tooltip-wrapper">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button (click)="deleteZone(zone)" class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
              <div class="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                <svg class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">No Geofences Yet</h3>
              <p class="text-slate-500 max-w-md mx-auto mb-8">Virtual perimeters allow you to track when workers enter or leave designated areas.</p>
              <a routerLink="../map" class="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30">
                Create Your First Zone
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class GeofenceList implements OnInit {
  private geofenceService = inject(LocationTrackingService);
  zones: GeofenceZoneDto[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadZones();
  }

  loadZones() {
    this.isLoading = true;
    this.geofenceService.getZones().subscribe({
      next: (data) => {
        this.zones = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading zones', err);
        this.isLoading = false;
      }
    });
  }

  toggleZoneStatus(zone: GeofenceZoneDto) {
    const request: UpdateGeofenceZoneRequest = {
      name: zone.name,
      description: zone.description,
      isActive: !zone.isActive,
      alertOnEntry: zone.alertOnEntry,
      alertOnExit: zone.alertOnExit,
      allowedExitDurationMinutes: zone.allowedExitDurationMinutes
    };

    this.geofenceService.updateZone(zone.id, request).subscribe({
      next: (updated) => {
        const index = this.zones.findIndex((z: GeofenceZoneDto) => z.id === zone.id);
        if (index > -1) {
          this.zones[index] = updated;
        }
      },
      error: (err) => console.error('Error updating zone', err)
    });
  }

  deleteZone(zone: GeofenceZoneDto) {
    if (confirm(`Are you sure you want to delete the zone "${zone.name}"?`)) {
      this.geofenceService.deleteZone(zone.id).subscribe({
        next: () => {
          this.zones = this.zones.filter((z: GeofenceZoneDto) => z.id !== zone.id);
        },
        error: (err) => console.error('Error deleting zone', err)
      });
    }
  }

  viewZone(zone: GeofenceZoneDto) {
    // Navigate to map with zone ID to display it and edit
    // implementation varies based on specific needs
  }
}
