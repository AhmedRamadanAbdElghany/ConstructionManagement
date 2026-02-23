import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface NearbyVendor {
    id: number;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    distance: number;
    averageRating: number;
    totalOrders: number;
    productCount: number;
    categories: string[];
}

@Component({
    selector: 'app-nearby-vendors',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
    template: `
    <div class="nearby-page">
      <!-- Header -->
      <div class="page-header">
        <h1>{{ 'MARKETPLACE.NEARBY_VENDORS' | translate }}</h1>
        <p>{{ 'MARKETPLACE.NEARBY_SUBTITLE' | translate }}</p>
      </div>

      <!-- Location Search -->
      <div class="location-section">
        <div class="location-controls">
          <div class="radius-selector">
            <label>{{ 'MARKETPLACE.SEARCH_RADIUS' | translate }}</label>
            <div class="radius-options">
              @for (radius of radiusOptions; track radius) {
                <button 
                  class="radius-btn"
                  [class.active]="selectedRadius() === radius"
                  (click)="selectRadius(radius)">
                  {{ radius }} km
                </button>
              }
            </div>
          </div>
          
          <div class="custom-radius">
            <label>{{ 'MARKETPLACE.CUSTOM_RADIUS' | translate }}</label>
            <div class="radius-input">
              <input type="number" 
                     [(ngModel)]="customRadius" 
                     min="0.1" 
                     max="100" 
                     step="0.1" />
              <span>km</span>
              <button (click)="applyCustomRadius()">{{ 'MARKETPLACE.APPLY' | translate }}</button>
            </div>
          </div>

          <button class="location-btn" (click)="getCurrentLocation()">
            <i class="pi pi-map-marker"></i>
            {{ 'MARKETPLACE.USE_MY_LOCATION' | translate }}
          </button>
        </div>

        <!-- Manual Location Input -->
        <div class="manual-location">
          <p>{{ 'MARKETPLACE.OR_ENTER_LOCATION' | translate }}</p>
          <div class="location-inputs">
            <input type="number" 
                   [(ngModel)]="manualLatitude" 
                   [placeholder]="'MARKETPLACE.LATITUDE' | translate"
                   step="0.0001" />
            <input type="number" 
                   [(ngModel)]="manualLongitude" 
                   [placeholder]="'MARKETPLACE.LONGITUDE' | translate"
                   step="0.0001" />
            <button (click)="searchByCoordinates()">{{ 'MARKETPLACE.SEARCH' | translate }}</button>
          </div>
        </div>
      </div>

      <!-- Current Location Display -->
      @if (currentLocation()) {
        <div class="current-location">
          <i class="pi pi-map-marker"></i>
          <span>{{ 'MARKETPLACE.YOUR_LOCATION' | translate }}: {{ currentLocation()?.lat | number:'1.4-4' }}, {{ currentLocation()?.lng | number:'1.4-4' }}</span>
        </div>
      }

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <i class="pi pi-spinner pi-spin"></i>
          <p>{{ 'MARKETPLACE.SEARCHING' | translate }}</p>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="error-state">
          <i class="pi pi-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button (click)="retrySearch()">{{ 'MARKETPLACE.RETRY' | translate }}</button>
        </div>
      }

      <!-- Vendors Grid -->
      @if (!loading() && !error() && vendors().length > 0) {
        <div class="results-info">
          {{ vendors().length }} {{ 'MARKETPLACE.VENDORS_FOUND' | translate }}
          {{ 'MARKETPLACE.WITHIN' | translate }} {{ selectedRadius() }} km
        </div>

        <div class="vendors-grid">
          @for (vendor of vendors(); track vendor.id) {
            <div class="vendor-card" (click)="goToVendor(vendor.id)">
              <div class="vendor-header">
                <div class="vendor-avatar">
                  <i class="pi pi-building"></i>
                </div>
                <div class="vendor-info">
                  <h3>{{ vendor.name }}</h3>
                  <p class="address">{{ vendor.address }}</p>
                </div>
              </div>

              <div class="distance-badge">
                <i class="pi pi-map-marker"></i>
                {{ vendor.distance | number:'1.1-1' }} km
              </div>

              <div class="vendor-stats">
                <div class="stat">
                  <i class="pi pi-star"></i>
                  <span>{{ vendor.averageRating | number:'1.0-1' }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-shopping-cart"></i>
                  <span>{{ vendor.totalOrders }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-box"></i>
                  <span>{{ vendor.productCount }}</span>
                </div>
              </div>

              @if (vendor.categories && vendor.categories.length > 0) {
                <div class="vendor-categories">
                  @for (category of vendor.categories.slice(0, 3); track category) {
                    <span class="category-tag">{{ category }}</span>
                  }
                  @if (vendor.categories.length > 3) {
                    <span class="more-categories">+{{ vendor.categories.length - 3 }}</span>
                  }
                </div>
              }

              <div class="vendor-actions">
                <button class="view-btn" (click)="goToVendor(vendor.id); $event.stopPropagation()">
                  <i class="pi pi-eye"></i>
                  {{ 'MARKETPLACE.VIEW' | translate }}
                </button>
                <button class="directions-btn" (click)="getDirections(vendor); $event.stopPropagation()">
                  <i class="pi pi-directions"></i>
                  {{ 'MARKETPLACE.DIRECTIONS' | translate }}
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && !error() && vendors().length === 0 && hasSearched()) {
        <div class="empty-state">
          <i class="pi pi-building"></i>
          <h2>{{ 'MARKETPLACE.NO_VENDORS_FOUND' | translate }}</h2>
          <p>{{ 'MARKETPLACE.NO_VENDORS_MSG' | translate }}</p>
          <div class="suggestions">
            <p>{{ 'MARKETPLACE.TRY_SUGGESTIONS' | translate }}</p>
            <ul>
              <li>{{ 'MARKETPLACE.INCREASE_RADIUS' | translate }}</li>
              <li>{{ 'MARKETPLACE.CHECK_LOCATION' | translate }}</li>
              <li>{{ 'MARKETPLACE.SEARCH_DIFFERENT_AREA' | translate }}</li>
            </ul>
          </div>
        </div>
      }

      <!-- Initial State -->
      @if (!loading() && !error() && vendors().length === 0 && !hasSearched()) {
        <div class="initial-state">
          <i class="pi pi-map"></i>
          <h2>{{ 'MARKETPLACE.FIND_NEARBY_VENDORS' | translate }}</h2>
          <p>{{ 'MARKETPLACE.FIND_NEARBY_MSG' | translate }}</p>
          <button class="start-btn" (click)="getCurrentLocation()">
            <i class="pi pi-location-arrow"></i>
            {{ 'MARKETPLACE.START_SEARCH' | translate }}
          </button>
        </div>
      }
    </div>
  `,
    styles: [`
    .nearby-page {
      min-height: 100vh;
      background: #f9fafb;
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      color: #1e3a5f;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: #6b7280;
    }

    .location-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .location-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      align-items: flex-end;
    }

    .radius-selector label, .custom-radius label {
      display: block;
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .radius-options {
      display: flex;
      gap: 0.5rem;
    }

    .radius-btn {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .radius-btn:hover {
      border-color: #f59e0b;
    }

    .radius-btn.active {
      background: #f59e0b;
      border-color: #f59e0b;
      color: white;
    }

    .radius-input {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .radius-input input {
      width: 80px;
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .radius-input button {
      padding: 0.5rem 1rem;
      background: #1e3a5f;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .location-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    .location-btn:hover {
      background: #d97706;
    }

    .manual-location {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .manual-location p {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.75rem;
    }

    .location-inputs {
      display: flex;
      gap: 0.5rem;
    }

    .location-inputs input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .location-inputs button {
      padding: 0.5rem 1.5rem;
      background: #1e3a5f;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .current-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #d1fae5;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      color: #059669;
    }

    .loading-state, .error-state, .empty-state, .initial-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 40vh;
      background: white;
      border-radius: 16px;
      padding: 3rem;
    }

    .loading-state i, .error-state i, .empty-state i, .initial-state i {
      font-size: 3rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .error-state i {
      color: #ef4444;
    }

    .error-state button, .start-btn {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .results-info {
      margin-bottom: 1rem;
      color: #6b7280;
    }

    .vendors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .vendor-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      position: relative;
    }

    .vendor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .vendor-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .vendor-avatar {
      width: 50px;
      height: 50px;
      background: #f0f9ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vendor-avatar i {
      font-size: 1.25rem;
      color: #1e3a5f;
    }

    .vendor-info h3 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .vendor-info .address {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .distance-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      background: #f59e0b;
      color: white;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .vendor-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .stat i {
      color: #f59e0b;
    }

    .vendor-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .category-tag {
      font-size: 0.75rem;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .more-categories {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .vendor-actions {
      display: flex;
      gap: 0.5rem;
    }

    .view-btn, .directions-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .view-btn {
      background: #1e3a5f;
      color: white;
      border: none;
    }

    .view-btn:hover {
      background: #2d5a87;
    }

    .directions-btn {
      background: transparent;
      border: 1px solid #e5e7eb;
      color: #6b7280;
    }

    .directions-btn:hover {
      border-color: #f59e0b;
      color: #f59e0b;
    }

    .empty-state h2, .initial-state h2 {
      margin-bottom: 0.5rem;
    }

    .empty-state p, .initial-state p {
      color: #6b7280;
      text-align: center;
    }

    .suggestions {
      margin-top: 1.5rem;
      text-align: left;
    }

    .suggestions p {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .suggestions ul {
      list-style: disc;
      padding-left: 1.5rem;
    }

    .suggestions li {
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .start-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .location-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .location-inputs {
        flex-direction: column;
      }

      .vendors-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NearbyVendorsComponent implements OnInit {
    private http = inject(HttpClient);
    private router = inject(Router);
    protected translate = inject(TranslateService);

    loading = signal(false);
    error = signal<string | null>(null);
    vendors = signal<NearbyVendor[]>([]);
    hasSearched = signal(false);

    currentLocation = signal<{ lat: number; lng: number } | null>(null);
    selectedRadius = signal(10);
    customRadius = 10;
    manualLatitude: number | null = null;
    manualLongitude: number | null = null;

    radiusOptions = [1, 5, 10, 25, 50];

    private get apiUrl(): string {
        return (window as any).__API_URL__ || 'https://localhost:7001/api';
    }

    ngOnInit(): void {
        // Try to get location automatically
        this.getCurrentLocation();
    }

    getCurrentLocation(): void {
        this.loading.set(true);
        this.error.set(null);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    this.currentLocation.set({ lat, lng });
                    this.searchVendors(lat, lng);
                },
                (error) => {
                    this.loading.set(false);
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            this.error.set('MARKETPLACE.LOCATION_PERMISSION_DENIED');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            this.error.set('MARKETPLACE.LOCATION_UNAVAILABLE');
                            break;
                        case error.TIMEOUT:
                            this.error.set('MARKETPLACE.LOCATION_TIMEOUT');
                            break;
                        default:
                            this.error.set('MARKETPLACE.LOCATION_ERROR');
                    }
                }
            );
        } else {
            this.loading.set(false);
            this.error.set('MARKETPLACE.GEOLOCATION_NOT_SUPPORTED');
        }
    }

    selectRadius(radius: number): void {
        this.selectedRadius.set(radius);
        this.customRadius = radius;

        const location = this.currentLocation();
        if (location) {
            this.searchVendors(location.lat, location.lng);
        }
    }

    applyCustomRadius(): void {
        if (this.customRadius >= 0.1 && this.customRadius <= 100) {
            this.selectedRadius.set(this.customRadius);

            const location = this.currentLocation();
            if (location) {
                this.searchVendors(location.lat, location.lng);
            }
        }
    }

    searchByCoordinates(): void {
        if (this.manualLatitude && this.manualLongitude) {
            this.currentLocation.set({ lat: this.manualLatitude, lng: this.manualLongitude });
            this.searchVendors(this.manualLatitude, this.manualLongitude);
        }
    }

    private searchVendors(lat: number, lng: number): void {
        this.loading.set(true);
        this.error.set(null);
        this.hasSearched.set(true);

        const radius = this.selectedRadius();
        const url = `${this.apiUrl}/marketplace/vendors/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radius}`;

        this.http.get<NearbyVendor[]>(url).subscribe({
            next: (vendors) => {
                // Sort by distance
                const sorted = (vendors || []).sort((a, b) => a.distance - b.distance);
                this.vendors.set(sorted);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error searching vendors:', error);
                this.error.set('MARKETPLACE.SEARCH_ERROR');
                this.loading.set(false);
            }
        });
    }

    retrySearch(): void {
        const location = this.currentLocation();
        if (location) {
            this.searchVendors(location.lat, location.lng);
        } else {
            this.getCurrentLocation();
        }
    }

    goToVendor(vendorId: number): void {
        this.router.navigate(['/marketplace/vendors', vendorId]);
    }

    getDirections(vendor: NearbyVendor): void {
        if (vendor.latitude && vendor.longitude) {
            const location = this.currentLocation();
            if (location) {
                window.open(
                    `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${vendor.latitude},${vendor.longitude}`,
                    '_blank'
                );
            } else {
                window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`,
                    '_blank'
                );
            }
        } else if (vendor.address) {
            window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.address)}`,
                '_blank'
            );
        }
    }
}
