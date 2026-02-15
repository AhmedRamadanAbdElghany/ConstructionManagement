import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VendorService, PublicVendor, VendorSearchRequest, VendorProduct } from '../../../core/services/vendor.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../shared/interfaces';
import * as L from 'leaflet';

@Component({
  selector: 'app-vendor-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <!-- Search Bar -->
      <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 shadow-sm z-10">
        <div class="max-w-7xl mx-auto mb-4 flex justify-between items-center">
           <div>
               <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Suppliers & Material</h1>
               <p class="text-xs text-slate-500 font-medium">Search for raw materials, check prices, and find best vendors</p>
           </div>
           
           <!-- View Toggle -->
           <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button (click)="viewMode = 'list'" 
                      [class.bg-white]="viewMode === 'list'"
                      [class.shadow-sm]="viewMode === 'list'"
                      class="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                      [ngClass]="viewMode === 'list' ? 'text-slate-900 dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                 List
              </button>
              <button (click)="viewMode = 'map'; map.invalidateSize()"
                      [class.bg-white]="viewMode === 'map'"
                      [class.shadow-sm]="viewMode === 'map'"
                      class="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                      [ngClass]="viewMode === 'map' ? 'text-slate-900 dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                 Map
              </button>
           </div>
        </div>

        <div class="max-w-7xl mx-auto flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-[300px] relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input type="text" [(ngModel)]="searchRequest.material" (keyup.enter)="onSearch()"
                   placeholder="{{ 'vendors.search_placeholder' | translate }}"
                   class="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" />
          </div>
          
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ 'vendors.radius' | translate }}</label>
            <select [(ngModel)]="searchRequest.radiusKm" (change)="onSearch()"
                    class="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 py-2 px-3 text-sm focus:ring-2 focus:ring-cyan-500">
              <option [value]="10">10 km</option>
              <option [value]="50">50 km</option>
              <option [value]="100">100 km</option>
              <option [value]="500">500 km</option>
              <option [value]="10000">Everywhere</option>
            </select>
          </div>

          <button (click)="onSearch()" 
                  class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {{ 'common.search' | translate }}
          </button>

          @if (myProjects.length > 0) {
            <div class="flex items-center gap-2 ml-auto">
              <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Search near project</label>
              <select [(ngModel)]="searchRequest.projectId" (change)="onProjectSelect()"
                      class="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 py-2 px-3 text-sm focus:ring-2 focus:ring-cyan-500">
                <option [ngValue]="undefined">Near My Location</option>
                @for (p of myProjects; track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
          }
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- List View -->
        <div *ngIf="viewMode === 'list'" class="w-full h-full overflow-y-auto p-6">
            <div class="max-w-7xl mx-auto">
                <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                        <h2 class="text-lg font-black text-slate-800 dark:text-white">{{ allProducts.length }} Products Found</h2>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                                <tr>
                                    <th class="px-6 py-4">Product Name</th>
                                    <th class="px-6 py-4">Category</th>
                                    <th class="px-6 py-4">Price</th>
                                    <th class="px-6 py-4">Quantity In Stock</th>
                                    <th class="px-6 py-4">Vendor</th>
                                    <th class="px-6 py-4">Sold Orders</th>
                                    <th class="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                @for (product of allProducts; track product.id) {
                                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                      <td class="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                          {{ product.name }}
                                          <div class="text-[10px] text-slate-400 font-normal mt-0.5" *ngIf="product.description">{{ product.description }}</div>
                                      </td>
                                      <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                                          <span class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold">{{ product.category || 'N/A' }}</span>
                                      </td>
                                      <td class="px-6 py-4">
                                          <span class="font-black text-emerald-600 dark:text-emerald-400 text-base">{{ product.price | currency:'EGP' }}</span>
                                          <span class="text-slate-400 text-xs"> / {{ product.unit }}</span>
                                      </td>
                                      <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                                          <span class="font-bold">{{ product.quantityInStock }}</span>
                                      </td>
                                      <td class="px-6 py-4">
                                          <div class="flex flex-col">
                                              <span class="font-bold text-slate-800 dark:text-slate-200">{{ product.vendorName }}</span>
                                              <span class="text-[10px] text-slate-500 flex items-center gap-1">
                                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                                  {{ product.vendorDistance ? product.vendorDistance.toFixed(1) + ' km' : 'N/A' }}
                                              </span>
                                          </div>
                                      </td>
                                      <td class="px-6 py-4">
                                          <div class="flex items-center gap-2">
                                              <div class="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-black text-xs">
                                                  {{ product.salesCount || 0 }}
                                              </div>
                                              <span class="text-xs text-slate-500 font-bold">Orders</span>
                                          </div>
                                      </td>
                                      <td class="px-6 py-4 text-right">
                                          <button (click)="zoomToVendor({latitude: product.latitude, longitude: product.longitude, name: product.vendorName, id: product.vendorId})" 
                                                  class="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                                              View Vendor
                                          </button>
                                      </td>
                                  </tr>
                                } @empty {
                                    <tr>
                                        <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                                            No products found. Try changing your search filters.
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Map View -->
        <div [class.hidden]="viewMode !== 'map'" class="flex w-full h-full">
            <!-- Sidebar Results -->
            <div class="w-full lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-[5]">
              <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 class="font-bold text-slate-800 dark:text-white">{{ results.length }} Vendors Found</h2>
                <button (click)="locateMe()" class="p-2 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors" title="My Location">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
    
              <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                @if (loading) {
                  <div class="flex flex-col items-center justify-center py-12 space-y-3">
                    <div class="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-slate-400 text-sm animate-pulse">{{ 'common.loading' | translate }}...</p>
                  </div>
                } @else {
                  @for (vendor of results; track vendor.id) {
                    <div (click)="zoomToVendor(vendor)"
                         class="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-cyan-500 dark:hover:border-cyan-500/50 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
                      <div class="absolute top-0 left-0 w-1 h-full bg-cyan-500 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                      
                      <div class="flex justify-between items-start mb-2">
                        <div class="flex flex-col">
                          <h3 class="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">{{ vendor.name }}</h3>
                          <div class="flex items-center gap-2 mt-1">
                            @if (vendor.isRegistered) {
                              <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wider">Registered</span>
                            } @else {
                              <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wider">Unregistered</span>
                            }
                            <span class="text-[9px] font-bold text-slate-400">{{ vendor.invoiceCount }} Orders</span>
                          </div>
                        </div>
                        @if (vendor.distanceKm) {
                          <span class="text-[10px] font-bold py-1 px-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 uppercase">
                            {{ vendor.distanceKm | number:'1.1-1' }} km
                          </span>
                        }
                      </div>
    
                      <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {{ vendor.address || 'No address provided' }}
                      </p>
    
                      <div class="space-y-1.5 mb-3">
                        @for (prod of vendor.topProducts; track prod.id) {
                          <div class="flex justify-between items-center text-[11px] py-1 px-2 rounded bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                            <span class="text-slate-700 dark:text-slate-300">{{ prod.name }}</span>
                            <div class="flex gap-2 items-center">
                                <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ prod.price | currency:'EGP' }} / {{ prod.unit }}</span>
                                <span class="text-[9px] font-bold text-cyan-500 bg-cyan-50 px-1 rounded">{{ prod.salesCount || 0 }} sold</span>
                            </div>
                          </div>
                        }
                      </div>
    
                      <div class="flex gap-2">
                        <button class="flex-1 py-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900 rounded-lg border border-cyan-100 dark:border-cyan-900/50 hover:bg-cyan-500 hover:text-white transition-all">
                          Details
                        </button>
                        <button (click)="viewInvoices(vendor); $event.stopPropagation()" class="flex-1 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-100 transition-all">
                          Invoices
                        </button>
                      </div>
                    </div>
                  } @empty {
                    <div class="text-center py-20">
                      <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p class="text-slate-500 dark:text-slate-400">{{ 'vendors.no_results_found' | translate }}</p>
                      <button (click)="searchRequest.radiusKm = 10000; onSearch()" class="mt-4 text-sm text-cyan-500 font-bold hover:underline">
                        Search Everywhere
                      </button>
                    </div>
                  }
                }
              </div>
            </div>
    
            <!-- Map Area -->
            <div id="map" class="flex-1 relative bg-slate-100 dark:bg-slate-900">
              <!-- Map Overlay Controls -->
              <div class="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button (click)="zoomIn()" class="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors text-slate-700 dark:text-slate-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </button>
                <button (click)="zoomOut()" class="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors text-slate-700 dark:text-slate-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    #map { height: 100%; border-radius: 0; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
  `]
})
export class VendorDiscoveryComponent implements OnInit, OnDestroy, AfterViewInit {
  map!: L.Map;
  private markers: L.Marker[] = [];
  private userMarker?: L.CircleMarker;
  private projectMarker?: L.Marker;

  loading = false;
  searchRequest: VendorSearchRequest = {
    radiusKm: 50,
    material: ''
  };
  results: PublicVendor[] = [];
  myProjects: Project[] = [];

  viewMode: 'map' | 'list' = 'list'; // Default to list view as requested
  allProducts: any[] = []; // Flattened products for table

  constructor(
    private vendorService: VendorService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.initDefaultLocation();
    this.loadProjects();
    // Default radius to 10000 (Everywhere)
    this.searchRequest.radiusKm = 10000;
    // Trigger search immediately without waiting for location
    this.onSearch();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([30.0444, 31.2357], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('locationfound', (e) => this.onLocationFound(e));
    // Removed this.locateMe() to prevent auto-prompt
  }

  private initDefaultLocation() {
    this.searchRequest.latitude = 30.0444;
    this.searchRequest.longitude = 31.2357;
  }

  locateMe() {
    if (this.map) {
      this.map.locate({ setView: true, maxZoom: 14 });
    }
  }

  onLocationFound(e: L.LocationEvent) {
    this.searchRequest.latitude = e.latlng.lat;
    this.searchRequest.longitude = e.latlng.lng;

    if (this.map) {
      if (this.userMarker) {
        this.userMarker.setLatLng(e.latlng);
      } else {
        try {
          this.userMarker = L.circleMarker(e.latlng, {
            radius: 8,
            fillColor: '#06b6d4',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(this.map).bindPopup("You are here");
        } catch (error) {
          console.warn("Map not ready for marker");
        }
      }
    }

    this.onSearch();
  }

  loadProjects() {
    this.projectService.getMyProjects().subscribe(projects => {
      this.myProjects = projects;
    });
  }

  onProjectSelect() {
    if (!this.searchRequest.projectId) {
      if (this.projectMarker) {
        this.projectMarker.remove();
        this.projectMarker = undefined;
      }
      this.locateMe();
    } else {
      const project = this.myProjects.find(p => p.id === Number(this.searchRequest.projectId));
      if (project && project.location?.lat && project.location?.lng) {
        this.searchRequest.latitude = project.location.lat;
        this.searchRequest.longitude = project.location.lng;
        if (this.map) this.map.setView([project.location.lat, project.location.lng], 13);

        if (this.map) {
          if (this.projectMarker) {
            this.projectMarker.setLatLng([project.location.lat, project.location.lng]);
          } else {
            const projectIcon = L.divIcon({
              html: `
                  <div class="w-10 h-10 rounded-full bg-cyan-500 border-4 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-cyan-500/30">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                `,
              className: '',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });
            this.projectMarker = L.marker([project.location.lat, project.location.lng], { icon: projectIcon })
              .addTo(this.map)
              .bindPopup(`<b>Project: ${project.name}</b>`);
          }
          this.projectMarker.openPopup();
        }
      }
      this.onSearch();
    }
  }

  onSearch() {
    this.loading = true;
    this.vendorService.searchVendors(this.searchRequest).subscribe({
      next: (data) => {
        this.results = data;

        // Flatten products for table view
        this.allProducts = [];
        this.results.forEach(vendor => {
          if (vendor.topProducts) {
            vendor.topProducts.forEach(product => {
              this.allProducts.push({
                ...product,
                vendorName: vendor.name,
                vendorId: vendor.id,
                vendorDistance: vendor.distanceKm,
                vendorAddress: vendor.address,
                latitude: vendor.latitude,
                longitude: vendor.longitude // Carry over coordinates
              });
            });
          }
        });

        // Ensure sales count desc sort for table
        this.allProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));

        this.updateMarkers();
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error', err);
        this.loading = false;
      }
    });
  }

  private updateMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    this.results.forEach(vendor => {
      if (vendor.latitude && vendor.longitude) {
        const m = L.marker([vendor.latitude, vendor.longitude], { icon })
          .addTo(this.map)
          .bindPopup(`
            <div class="p-2">
              <h4 class="font-bold text-slate-900">${vendor.name}</h4>
              <p class="text-xs text-slate-500">${vendor.vendorType || ''}</p>
              <div class="mt-2 text-xs font-bold text-cyan-600">
                ${vendor.distanceKm ? vendor.distanceKm.toFixed(1) : '0.0'} km away
              </div>
            </div>
          `);
        this.markers.push(m);
      }
    });

    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  zoomToVendor(vendor: any) {
    if (this.viewMode === 'list') {
      this.viewMode = 'map';
      // Allow time for map to show
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
        this.flyToVendor(vendor);
      }, 100);
    } else {
      this.flyToVendor(vendor);
    }
  }

  private flyToVendor(vendor: PublicVendor) {
    if (vendor.latitude && vendor.longitude && this.map) {
      this.map.flyTo([vendor.latitude, vendor.longitude], 15);
      const marker = this.markers.find(m => {
        const latLng = m.getLatLng();
        return latLng.lat === vendor.latitude && latLng.lng === vendor.longitude;
      });
      if (marker) marker.openPopup();
    }
  }

  zoomIn() { if (this.map) this.map.zoomIn(); }
  zoomOut() { if (this.map) this.map.zoomOut(); }

  viewInvoices(vendor: PublicVendor) {
    console.log('Viewing invoices for', vendor.name);
  }
}
