import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LocationTrackingService, CreateGeofenceZoneRequest, ZoneType, GeofenceZoneDto } from '../../../../core/services/location-tracking.service';

declare const L: any;

@Component({
  selector: 'app-geofence-map',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'GEOFENCING.CREATE_ZONE' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'GEOFENCING.ZONE_SUBTITLE' | translate }}</p>
          </div>
          <a routerLink="../list" class="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
             {{ 'COMMON.CANCEL' | translate }}
          </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <!-- Form Section -->
           <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none order-2 lg:order-1">
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'GEOFENCING.ZONE_DETAILS' | translate }}</h2>
              
              <form (ngSubmit)="saveZone()" #zoneForm="ngForm" class="space-y-6">
                 <div>
                    <label class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">{{ 'GEOFENCING.ZONE_NAME' | translate }} *</label>
                    <input type="text" [(ngModel)]="zone.name" name="name" required
                           class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-inner">
                 </div>

                 <div>
                    <label class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">{{ 'GEOFENCING.DESCRIPTION' | translate }}</label>
                    <textarea [(ngModel)]="zone.description" name="description" rows="3"
                           class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-inner"></textarea>
                 </div>

                 <div>
                    <label class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">{{ 'GEOFENCING.ZONE_TYPE' | translate }}</label>
                    <div class="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                       <button type="button" [class.bg-white]="zone.zoneType === 0" [class.dark:bg-slate-700]="zone.zoneType === 0" [class.shadow]="zone.zoneType === 0" (click)="setZoneType(0)" class="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all text-slate-700 dark:text-slate-300">{{ 'GEOFENCING.CIRCLE' | translate }}</button>
                       <button type="button" [class.bg-white]="zone.zoneType === 1" [class.dark:bg-slate-700]="zone.zoneType === 1" [class.shadow]="zone.zoneType === 1" (click)="setZoneType(1)" class="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all text-slate-700 dark:text-slate-300">{{ 'GEOFENCING.POLYGON' | translate }}</button>
                    </div>
                 </div>

                 @if (zone.zoneType === 0) {
                   <div>
                      <label class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">{{ 'GEOFENCING.RADIUS' | translate }}</label>
                      <input type="number" [(ngModel)]="zone.radiusMeters" (ngModelChange)="updateCircleRadius()" name="radiusMeters" min="10" max="5000"
                             class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-inner">
                      <p class="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest flex items-center">
                         <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         {{ 'GEOFENCING.MAP_HINT_CIRCLE' | translate }}
                      </p>
                   </div>
                 } @else {
                   <div class="px-4 py-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold flex items-start">
                      <svg class="w-4 h-4 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      {{ 'GEOFENCING.MAP_HINT_POLYGON' | translate }}
                   </div>
                 }

                 <div class="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                    <h3 class="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">{{ 'GEOFENCING.ALERT_CONFIG' | translate }}</h3>
                    
                    <label class="flex items-center group cursor-pointer">
                       <div class="relative flex items-center justify-center w-6 h-6 mr-3">
                          <input type="checkbox" [(ngModel)]="zone.alertOnEntry" name="alertOnEntry" class="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all appearance-none cursor-pointer">
                          <svg class="absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" [class.opacity-100]="zone.alertOnEntry"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <span class="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-cyan-500 transition-colors">{{ 'GEOFENCING.ALERT_ON_ENTRY' | translate }}</span>
                    </label>

                    <label class="flex items-center group cursor-pointer">
                       <div class="relative flex items-center justify-center w-6 h-6 mr-3">
                          <input type="checkbox" [(ngModel)]="zone.alertOnExit" name="alertOnExit" class="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all appearance-none cursor-pointer">
                          <svg class="absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" [class.opacity-100]="zone.alertOnExit"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <span class="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-cyan-500 transition-colors">{{ 'GEOFENCING.ALERT_ON_EXIT' | translate }}</span>
                    </label>

                    @if (zone.alertOnExit) {
                      <div class="pl-9 pl-9 transition-all">
                         <label class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">{{ 'GEOFENCING.ALLOWED_EXIT_DURATION' | translate }}</label>
                         <input type="number" [(ngModel)]="zone.allowedExitDurationMinutes" name="allowedExitDurationMinutes" min="0" max="480"
                                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-inner">
                      </div>
                    }
                 </div>

                 <button type="submit" [disabled]="!zoneForm.valid || saving || !isAreaValid"
                         class="w-full py-4 mt-8 rounded-xl bg-cyan-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/30 hover:bg-cyan-600 active:scale-95 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 flex justify-center items-center">
                    @if (saving) {
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ 'GEOFENCING.CREATING' | translate }}...
                    } @else {
                      {{ 'GEOFENCING.CREATE_ZONE' | translate }}
                    }
                 </button>
              </form>
           </div>
           
           <!-- Map Preview -->
           <div class="lg:col-span-2 order-1 lg:order-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group/map p-[2px] min-h-[500px]">
              <div #mapContainer id="geofence-map" class="w-full h-full rounded-[2.4rem] grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-700 min-h-[500px]"></div>
              
              <div class="absolute top-6 left-6 right-6 flex justify-between pointer-events-none z-[400]">
                 <div class="px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-white/10 text-white font-bold text-xs uppercase tracking-widest ml-12">
                    @if (zone.zoneType === 0) {
                      <span *ngIf="!zone.centerLatitude">{{ 'GEOFENCING.MAP_CENTER_HINT' | translate }}</span>
                      <span *ngIf="zone.centerLatitude" class="text-cyan-400">{{ 'GEOFENCING.CENTER_SET' | translate }} ({{ 'GEOFENCING.RADIUS' | translate }}: {{ zone.radiusMeters }}m)</span>
                    } @else {
                      <span *ngIf="polygonPoints.length === 0">{{ 'GEOFENCING.MAP_POLY_START_HINT' | translate }}</span>
                      <span *ngIf="polygonPoints.length > 0 && polygonPoints.length < 3">{{ 'GEOFENCING.MAP_POLY_MORE_POINTS' | translate }}</span>
                      <span *ngIf="polygonPoints.length >= 3" class="text-cyan-400">{{ 'GEOFENCING.POLY_VALID' | translate }}</span>
                    }
                 </div>
                 <button (click)="clearMap()" class="pointer-events-auto px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-rose-600 transition-colors uppercase tracking-widest">
                    {{ 'GEOFENCING.CLEAR_MAP' | translate }}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    #geofence-map { z-index: 0; }
  `]
})
export class GeofenceMap implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private map: any;
  private circleLayer: any;
  private polygonLayer: any;
  private mapClickListener: any;

  zone: CreateGeofenceZoneRequest = {
    name: '',
    description: '',
    zoneType: 0,
    radiusMeters: 50,
    alertOnEntry: false,
    alertOnExit: true,
    allowedExitDurationMinutes: 30
  };

  saving = false;
  polygonPoints: [number, number][] = [];

  private geofenceService = inject(LocationTrackingService);
  private router = inject(Router);

  get isAreaValid(): boolean {
    if (this.zone.zoneType === 0) return !!this.zone.centerLatitude;
    return this.polygonPoints.length >= 3; // Basic validation for polygon
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.loadLeaflet();
  }

  setZoneType(type: ZoneType) {
    this.zone.zoneType = type;
    this.clearMap();
  }

  private loadLeaflet() {
    if (typeof L !== 'undefined') {
      this.initMap();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      this.initMap();
    };
    document.body.appendChild(script);
  }

  private initMap() {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map('geofence-map').setView([25.2048, 55.2708], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.mapClickListener = this.map.on('click', (e: any) => this.onMapClick(e));
  }

  private onMapClick(e: any) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (this.zone.zoneType === 0) {
      this.zone.centerLatitude = lat;
      this.zone.centerLongitude = lng;
      this.drawCircle();
    } else {
      this.polygonPoints.push([lat, lng]);
      this.drawPolygon();
    }
  }

  updateCircleRadius() {
    if (this.zone.centerLatitude) {
      this.drawCircle();
    }
  }

  private drawCircle() {
    if (this.circleLayer) this.map.removeLayer(this.circleLayer);

    this.circleLayer = L.circle([this.zone.centerLatitude, this.zone.centerLongitude], {
      color: '#06b6d4',
      fillColor: '#06b6d4',
      fillOpacity: 0.2,
      radius: this.zone.radiusMeters
    }).addTo(this.map);
  }

  private drawPolygon() {
    if (this.polygonLayer) this.map.removeLayer(this.polygonLayer);

    // Draw polygon
    this.polygonLayer = L.polygon(this.polygonPoints, {
      color: '#06b6d4',
      fillColor: '#06b6d4',
      fillOpacity: 0.2,
      weight: 3
    }).addTo(this.map);

    // generate geojson
    if (this.polygonPoints.length >= 3) {
      const geoJsonArr = this.polygonPoints.map(p => [p[1], p[0]]); // GeoJSON uses LNG, LAT
      // Close loop
      geoJsonArr.push([...geoJsonArr[0]]);

      const geoJson = {
        type: "Polygon",
        coordinates: [geoJsonArr]
      };
      this.zone.polygonGeoJson = JSON.stringify(geoJson);
    }
  }

  clearMap() {
    if (this.circleLayer) this.map.removeLayer(this.circleLayer);
    if (this.polygonLayer) this.map.removeLayer(this.polygonLayer);
    this.zone.centerLatitude = undefined;
    this.zone.centerLongitude = undefined;
    this.zone.polygonGeoJson = undefined;
    this.polygonPoints = [];
  }

  saveZone() {
    if (!this.isAreaValid) return;

    this.saving = true;
    this.geofenceService.createZone(this.zone).subscribe({
      next: (data: GeofenceZoneDto) => {
        this.saving = false;
        this.router.navigate(['../list']);
      },
      error: (err: any) => {
        console.error('Save error', err);
        this.saving = false;
      }
    });
  }
}
