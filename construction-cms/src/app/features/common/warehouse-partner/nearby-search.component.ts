import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService, NearbySearchRequest } from '../../../core/services/location.service';

interface NearbyUser {
    id: number;
    fullName: string;
    specialization?: string;
    city?: string;
    district?: string;
    averageRating?: number;
    totalReviews?: number;
    distance: number;
}

@Component({
    selector: 'app-nearby-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="nearby-search-container">
      <h2>Search Nearby</h2>
      
      <div class="filters">
        <div class="filter-group">
          <label>User Type</label>
          <select [(ngModel)]="selectedUserType">
            <option [value]="0">All</option>
            <option [value]="4">Warehouse Owner</option>
            <option [value]="5">Engineer</option>
            <option [value]="6">Subcontractor</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Specialization</label>
          <select [(ngModel)]="selectedSpecialization">
            <option value="">All</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="general_construction">General Construction</option>
            <option value="carpentry">Carpentry</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Radius (km)</label>
          <input type="number" [(ngModel)]="radiusKm" min="1" max="100">
        </div>
        
        <button (click)="search()">Search</button>
      </div>
      
      <div class="results" *ngIf="results.length > 0">
        <div *ngFor="let user of results" class="user-card">
          <div class="user-info">
            <h3>{{ user.fullName }}</h3>
            <p *ngIf="user.specialization">{{ user.specialization }}</p>
            <p *ngIf="user.city">{{ user.city }} - {{ user.district }}</p>
            <div class="rating" *ngIf="user.averageRating">
              <span>{{ user.averageRating | number:'1.1-1' }}/5</span>
              <span>({{ user.totalReviews }} reviews)</span>
            </div>
            <p class="distance">{{ user.distance | number:'1.1-1' }} km away</p>
          </div>
          <button (click)="viewProfile(user)">View Profile</button>
        </div>
      </div>
      
      <div class="no-results" *ngIf="results.length === 0 && searched">
        No results found
      </div>
    </div>
  `,
    styles: [`
    .nearby-search-container {
      padding: 20px;
    }
    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .user-card {
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .rating {
      color: #ffc107;
    }
    .distance {
      color: #666;
      font-size: 0.9em;
    }
  `]
})
export class NearbySearchComponent implements OnInit {
    currentLat = 0;
    currentLng = 0;
    selectedUserType = 0;
    selectedSpecialization = '';
    radiusKm = 10;
    results: NearbyUser[] = [];
    searched = false;

    constructor(private locationService: LocationService) { }

    ngOnInit() {
        this.getCurrentLocation();
    }

    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLat = position.coords.latitude;
                    this.currentLng = position.coords.longitude;
                },
                (error: any) => {
                    console.error('Error getting location:', error);
                    this.currentLat = 30.0444;
                    this.currentLng = 31.2357;
                }
            );
        }
    }

    search() {
        const request: NearbySearchRequest = {
            latitude: this.currentLat,
            longitude: this.currentLng,
            radiusKm: this.radiusKm,
            userType: this.selectedUserType > 0 ? this.selectedUserType : undefined,
            specialization: this.selectedSpecialization || undefined,
            page: 1,
            pageSize: 20
        };

        this.locationService.searchNearby(request).subscribe({
            next: (users: any[]) => {
                this.results = users.map((user: any) => ({
                    ...user,
                    distance: this.calculateDistance(
                        this.currentLat,
                        this.currentLng,
                        user.latitude || 0,
                        user.longitude || 0
                    )
                }));
                this.searched = true;
            },
            error: (error: any) => {
                console.error('Error searching nearby:', error);
                this.searched = true;
            }
        });
    }

    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    viewProfile(user: NearbyUser) {
        console.log('View profile:', user);
    }
}
