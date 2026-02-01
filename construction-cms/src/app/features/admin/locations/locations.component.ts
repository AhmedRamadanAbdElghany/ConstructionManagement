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
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'locations.title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'locations.subtitle' | translate }}</p>
          </div>
          <div class="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-1.5 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <button 
              (click)="filterStatus = 'all'"
              [class.bg-slate-900]="filterStatus === 'all'"
              [class.dark:bg-white]="filterStatus === 'all'"
              [class.text-white]="filterStatus === 'all'"
              [class.dark:text-slate-950]="filterStatus === 'all'"
              [class.text-slate-500]="filterStatus !== 'all'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ 'locations.all' | translate }}
            </button>
            <button 
              (click)="filterStatus = 'Active'"
              [class.bg-cyan-500/10]="filterStatus === 'Active'"
              [class.text-cyan-600]="filterStatus === 'Active'"
              [class.text-slate-500]="filterStatus !== 'Active'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ 'locations.active' | translate }}
            </button>
            <button 
              (click)="filterStatus = 'Delayed'"
              [class.bg-rose-500/10]="filterStatus === 'Delayed'"
              [class.text-rose-600]="filterStatus === 'Delayed'"
              [class.text-slate-500]="filterStatus !== 'Delayed'"
              class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ 'locations.delayed' | translate }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Map Container -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group/map overflow-hidden">
             <div #mapContainer id="map" class="h-[550px] w-full transition-all duration-700 grayscale-[0.3] hover:grayscale-0 contrast-[1.1]"></div>
          </div>

          <!-- Project List -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col">
            <h2 class="text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">{{ 'locations.project_list' | translate }}</h2>
            <div class="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              @for (project of filteredProjects; track project.id) {
                <div 
                  (click)="selectProject(project)"
                  class="p-5 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  [class.bg-slate-100]="selectedProject?.id === project.id"
                  [class.dark:bg-slate-800]="selectedProject?.id === project.id"
                  [class.border-cyan-500/50]="selectedProject?.id === project.id">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-slate-900 dark:text-white font-black group-hover:text-cyan-500 transition-colors uppercase tracking-tight text-sm">{{ project.name }}</h3>
                    <span class="w-2.5 h-2.5 rounded-full shadow-lg"
                          [ngClass]="{
                            'bg-cyan-500 shadow-cyan-500/50': project.status === 'Active',
                            'bg-emerald-500 shadow-emerald-500/50': project.status === 'Completed',
                            'bg-rose-500 shadow-rose-500/50': project.status === 'Delayed'
                          }">
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center mb-4">
                    <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    </svg>
                    {{ project.location?.address }}
                  </p>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                      <span class="text-slate-500 dark:text-slate-400">Progress</span>
                      <span class="text-cyan-600 dark:text-cyan-400 font-black">{{ project.progress }}%</span>
                    </div>
                    <div class="h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-200 dark:border-white/5">
                      <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                           [style.width.%]="project.progress">
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Worker Tracking Section -->
        <div class="mt-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'locations.worker_tracking' | translate }}</h2>
            <div class="flex items-center space-x-4">
              <input type="date" 
                     class="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-inner">
              <button class="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                {{ 'locations.view_history' | translate }}
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            @for (worker of workers; track worker.id) {
              <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-white/[0.03] transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none text-center">
                <div class="relative inline-block mb-4">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform ring-4 ring-white dark:ring-slate-900">
                    {{ worker.fullName.charAt(0) }}
                  </div>
                  <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow-lg"
                        [ngClass]="{
                          'bg-emerald-500': worker.status === 'Working',
                          'bg-slate-300 dark:bg-slate-700': worker.status !== 'Working'
                        }">
                  </span>
                </div>
                <p class="text-slate-900 dark:text-white font-black text-xs truncate uppercase tracking-tight group-hover:text-cyan-500 transition-colors">{{ worker.fullName }}</p>
                <div class="mt-2">
                  @if (worker.status === 'Working') {
                    <span class="inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      {{ 'locations.online' | translate }}
                    </span>
                  } @else {
                    <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{{ 'locations.offline' | translate }}</span>
                  }
                </div>
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
