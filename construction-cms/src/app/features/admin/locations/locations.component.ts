import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { Project, User } from '../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';

declare const L: any;

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ 'locations.title' | translate }}</h1>
            <p class="text-slate-400">{{ 'locations.subtitle' | translate }}</p>
          </div>
          <div class="flex space-x-2">
            <button 
              (click)="filterStatus = 'all'"
              [class.bg-cyan-500]="filterStatus === 'all'"
              [class.text-white]="filterStatus === 'all'"
              [class.bg-slate-700/50]="filterStatus !== 'all'"
              [class.text-slate-400]="filterStatus !== 'all'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all">
              {{ 'locations.all' | translate }}
            </button>
            <button 
              (click)="filterStatus = 'Active'"
              [class.bg-cyan-500]="filterStatus === 'Active'"
              [class.text-white]="filterStatus === 'Active'"
              [class.bg-slate-700/50]="filterStatus !== 'Active'"
              [class.text-slate-400]="filterStatus !== 'Active'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all">
              {{ 'locations.active' | translate }}
            </button>
            <button 
              (click)="filterStatus = 'Delayed'"
              [class.bg-amber-500]="filterStatus === 'Delayed'"
              [class.text-white]="filterStatus === 'Delayed'"
              [class.bg-slate-700/50]="filterStatus !== 'Delayed'"
              [class.text-slate-400]="filterStatus !== 'Delayed'"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all">
              {{ 'locations.delayed' | translate }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Map Container -->
          <div class="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div #mapContainer id="map" class="h-[500px] w-full"></div>
          </div>

          <!-- Project List -->
          <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <h2 class="text-xl font-bold text-white mb-4">{{ 'locations.project_list' | translate }}</h2>
            <div class="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              @for (project of filteredProjects; track project.id) {
                <div 
                  (click)="selectProject(project)"
                  class="p-4 rounded-xl cursor-pointer transition-all"
                  [class.bg-cyan-500/20]="selectedProject?.id === project.id"
                  [class.border-cyan-500/50]="selectedProject?.id === project.id"
                  [class.bg-slate-700/30]="selectedProject?.id !== project.id"
                  [class.border-transparent]="selectedProject?.id !== project.id"
                  [class.border]="true">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-white font-medium">{{ project.name }}</h3>
                    <span class="w-3 h-3 rounded-full"
                          [ngClass]="{
                            'bg-cyan-500': project.status === 'Active',
                            'bg-emerald-500': project.status === 'Completed',
                            'bg-amber-500': project.status === 'Delayed'
                          }">
                    </span>
                  </div>
                  <p class="text-sm text-slate-400 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    </svg>
                    {{ project.location?.address }}
                  </p>
                  <div class="mt-2 flex items-center justify-between">
                    <span class="text-xs text-slate-500">Progress</span>
                    <span class="text-xs text-cyan-400">{{ project.progress }}%</span>
                  </div>
                  <div class="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                         [style.width.%]="project.progress">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Worker Tracking Section -->
        <div class="mt-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">{{ 'locations.worker_tracking' | translate }}</h2>
            <div class="flex items-center space-x-4">
              <input type="date" 
                     class="px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors">
              <button class="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-colors">
                {{ 'locations.view_history' | translate }}
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            @for (worker of workers; track worker.id) {
              <div class="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer text-center">
                <div class="relative inline-block mb-3">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {{ worker.fullName.charAt(0) }}
                  </div>
                  <span class="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-800"
                        [ngClass]="{
                          'bg-emerald-500': worker.status === 'Working',
                          'bg-slate-400': worker.status !== 'Working'
                        }">
                  </span>
                </div>
                <p class="text-white font-medium text-sm truncate">{{ worker.fullName }}</p>
                <p class="text-xs mt-1"
                   [class.text-emerald-400]="worker.status === 'Working'"
                   [class.text-slate-400]="worker.status !== 'Working'">
                  @if (worker.status === 'Working') {
                    <span class="flex items-center justify-center">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                      {{ 'locations.online' | translate }}
                    </span>
                  } @else {
                    {{ 'locations.offline' | translate }}
                  }
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    #map {
      z-index: 0;
    }
  `]
})
export class LocationsComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  projects: Project[] = [];
  workers: User[] = [];
  filterStatus: 'all' | 'Active' | 'Completed' | 'Delayed' = 'all';
  selectedProject: Project | null = null;
  private map: any;

  get filteredProjects(): Project[] {
    if (this.filterStatus === 'all') {
      return this.projects;
    }
    return this.projects.filter(p => p.status === this.filterStatus);
  }

  constructor(private mockDataService: MockDataService) { }

  ngOnInit() {
    this.mockDataService.getProjects().subscribe(projects => {
      this.projects = projects;
      if (this.map && projects.length > 0) {
        this.addMarkersToMap();
      }
    });

    this.mockDataService.getUsers().subscribe(users => {
      this.workers = users.filter(u => u.role === 'CompanyUser');
    });
  }

  ngAfterViewInit() {
    this.loadLeaflet();
  }

  private loadLeaflet() {
    // Check if Leaflet is already loaded
    if (typeof L !== 'undefined') {
      this.initMap();
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      this.initMap();
    };
    document.body.appendChild(script);
  }

  private initMap() {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement).setView([25.2048, 55.2708], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    if (this.projects.length > 0) {
      this.addMarkersToMap();
    }
  }

  private addMarkersToMap() {
    if (!this.map) return;

    this.projects.forEach(project => {
      if (project.location) {
        const markerColor = project.status === 'Active' ? '#06b6d4' :
          project.status === 'Completed' ? '#10b981' : '#f59e0b';

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 30px; 
            height: 30px; 
            background: ${markerColor}; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });

        L.marker([project.location.lat, project.location.lng], { icon: customIcon })
          .addTo(this.map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 5px;">${project.name}</h3>
              <p style="color: #666; margin-bottom: 5px;">${project.location.address}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="background: ${markerColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${project.status}</span>
                <span style="font-weight: bold;">${project.progress}%</span>
              </div>
            </div>
          `);
      }
    });
  }

  selectProject(project: Project) {
    this.selectedProject = project;
    if (this.map && project.location) {
      this.map.flyTo([project.location.lat, project.location.lng], 12, {
        duration: 1.5
      });
    }
  }
}
