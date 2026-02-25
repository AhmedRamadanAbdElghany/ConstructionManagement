import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VendorService, Vendor, CreateVendorRequest } from '../../../../core/services/vendor.service';

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">{{ 'inventory_dashboard.store_settings' | translate }}</h1>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center h-48">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
        <button (click)="loadProfile()" class="ml-4 text-red-800 underline">{{ 'inventory_dashboard.retry' | translate }}</button>
      </div>
      
      <div *ngIf="!loading && !error && profile" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4">{{ 'inventory_dashboard.store_profile' | translate }}</h2>
          
          <form (ngSubmit)="saveProfile()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'vendors.name' | translate }} *</label>
              <input [(ngModel)]="profileForm.name" name="name" type="text" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'vendors.phone' | translate }}</label>
                <input [(ngModel)]="profileForm.phone" name="phone" type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'vendors.email' | translate }}</label>
                <input [(ngModel)]="profileForm.email" name="email" type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'vendors.address' | translate }}</label>
              <input [(ngModel)]="profileForm.address" name="address" type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'vendors.contact_person' | translate }}</label>
                <input [(ngModel)]="profileForm.contactPerson" name="contactPerson" type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'inventory_dashboard.tax_number' | translate }}</label>
                <input [(ngModel)]="profileForm.taxNumber" name="taxNumber" type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'vendors.vendor_type' | translate }}</label>
              <select [(ngModel)]="profileForm.vendorType" name="vendorType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{{ 'vendors.select_type' | translate }}</option>
                <option value="Materials">{{ 'vendors.type_cement' | translate }}</option>
                <option value="Equipment">{{ 'inventory_dashboard.equipment_supplier' | translate }}</option>
                <option value="Services">{{ 'inventory_dashboard.services_provider' | translate }}</option>
                <option value="General">{{ 'vendors.type_other' | translate }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'vendors.notes' | translate }}</label>
              <textarea [(ngModel)]="profileForm.notes" name="notes" rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            
            <div *ngIf="profileError" class="text-red-600 text-sm">{{ profileError }}</div>
            <div *ngIf="profileSuccess" class="text-green-600 text-sm">{{ profileSuccess }}</div>
            
            <div class="flex justify-end">
              <button type="submit" [disabled]="savingProfile" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {{ savingProfile ? ('common.processing' | translate) : ('common.save' | translate) }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Location Settings -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4">{{ 'inventory_dashboard.store_location' | translate }}</h2>
          
          <!-- Warning Banner -->
          <div *ngIf="!hasLocation" class="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded mb-4">
            <div class="flex items-start">
              <svg class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <strong>Location not set!</strong>
                <p class="text-sm mt-1">Without a set location, your store will not appear in "Nearby" searches by companies looking for vendors.</p>
              </div>
            </div>
          </div>
          
          <!-- Current Location Display -->
          <div class="mb-4">
            <div class="text-sm text-gray-500 mb-1">Current Coordinates</div>
            <div *ngIf="profile && profile.latitude != null && profile.longitude != null" class="font-mono text-sm bg-gray-50 p-2 rounded">
              Lat: {{ profile.latitude.toFixed(6) }}, Lng: {{ profile.longitude.toFixed(6) }}
            </div>
            <div *ngIf="!hasLocation" class="text-gray-400 italic">Not set</div>
          </div>
          
          <!-- Manual Coordinate Input -->
          <div class="space-y-4 mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input [(ngModel)]="locationForm.latitude" name="latitude" type="number" step="0.000001"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 30.044420">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input [(ngModel)]="locationForm.longitude" name="longitude" type="number" step="0.000001"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 31.235712">
              </div>
            </div>
            
            <button type="button" (click)="useCurrentLocation()" class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Use My Current Location
            </button>
          </div>
          
          <!-- Map Placeholder -->
          <div class="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
            <div *ngIf="hasLocation" class="text-center">
              <svg class="h-12 w-12 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              <p class="text-sm text-gray-600">Location set</p>
              <p class="text-xs text-gray-500">Map integration coming soon</p>
            </div>
            <div *ngIf="!hasLocation" class="text-center text-gray-500">
              <svg class="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              <p>Set your location to appear in nearby searches</p>
            </div>
          </div>
          
          <div *ngIf="locationError" class="text-red-600 text-sm mb-4">{{ locationError }}</div>
          <div *ngIf="locationSuccess" class="text-green-600 text-sm mb-4">{{ locationSuccess }}</div>
          
          <div class="flex justify-end">
            <button (click)="saveLocation()" [disabled]="savingLocation" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {{ savingLocation ? 'Saving...' : 'Save Location' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Visibility Status -->
      <div *ngIf="!loading && !error && profile" class="mt-6 bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Visibility Settings</h2>
        
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Public Visibility</div>
            <div class="text-sm text-gray-500">When enabled, your store will appear in vendor searches by companies.</div>
          </div>
          <div class="flex items-center gap-2">
            <span [class]="profile.isPublic ? 'text-green-600' : 'text-gray-400'" class="text-sm font-medium">
              {{ profile.isPublic ? 'Visible' : 'Hidden' }}
            </span>
            <div class="relative">
              <button (click)="toggleVisibility()" [disabled]="savingVisibility"
                [class]="profile.isPublic ? 'bg-blue-600' : 'bg-gray-300'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
                <span [class]="profile.isPublic ? 'translate-x-6' : 'translate-x-1'" 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="!profile.isPublic" class="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <strong>Note:</strong> Your store is currently hidden. Companies cannot find your store in searches.
        </div>
      </div>
    </div>
  `
})
export class StoreSettingsComponent implements OnInit {
  profile: Vendor | null = null;
  loading = true;
  error: string | null = null;

  profileForm: CreateVendorRequest = {
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    contactPerson: '',
    notes: '',
    vendorType: ''
  };

  locationForm = {
    latitude: 0,
    longitude: 0
  };

  savingProfile = false;
  savingLocation = false;
  savingVisibility = false;

  profileError: string | null = null;
  profileSuccess: string | null = null;
  locationError: string | null = null;
  locationSuccess: string | null = null;

  constructor(private vendorService: VendorService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.vendorService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.profileForm = {
          name: data.name,
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          taxNumber: data.taxNumber || '',
          contactPerson: data.contactPerson || '',
          notes: data.notes || '',
          vendorType: data.vendorType || ''
        };
        this.locationForm = {
          latitude: data.latitude || 0,
          longitude: data.longitude || 0
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. Please try again.';
        this.loading = false;
      }
    });
  }

  get hasLocation(): boolean {
    return this.profile?.latitude != null && this.profile?.longitude != null &&
      this.profile.latitude !== 0 && this.profile.longitude !== 0;
  }

  saveProfile(): void {
    this.profileError = null;
    this.profileSuccess = null;

    if (!this.profileForm.name) {
      this.profileError = 'Store name is required.';
      return;
    }

    this.savingProfile = true;

    this.vendorService.updateMyProfile(this.profileForm).subscribe({
      next: (data) => {
        this.profile = data;
        this.savingProfile = false;
        this.profileSuccess = 'Profile updated successfully!';
        setTimeout(() => this.profileSuccess = null, 3000);
      },
      error: (err) => {
        console.error('Error saving profile:', err);
        this.profileError = 'Failed to save profile. Please try again.';
        this.savingProfile = false;
      }
    });
  }

  useCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationForm.latitude = position.coords.latitude;
          this.locationForm.longitude = position.coords.longitude;
          this.locationError = null;
        },
        (error) => {
          console.error('Geolocation error:', error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.locationError = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              this.locationError = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              this.locationError = 'Location request timed out.';
              break;
            default:
              this.locationError = 'Failed to get current location.';
          }
        }
      );
    } else {
      this.locationError = 'Geolocation is not supported by your browser.';
    }
  }

  saveLocation(): void {
    this.locationError = null;
    this.locationSuccess = null;

    if (!this.locationForm.latitude || !this.locationForm.longitude) {
      this.locationError = 'Please enter both latitude and longitude.';
      return;
    }

    this.savingLocation = true;

    this.vendorService.updateLocation(this.locationForm.latitude, this.locationForm.longitude).subscribe({
      next: () => {
        if (this.profile) {
          this.profile.latitude = this.locationForm.latitude;
          this.profile.longitude = this.locationForm.longitude;
        }
        this.savingLocation = false;
        this.locationSuccess = 'Location updated successfully!';
        setTimeout(() => this.locationSuccess = null, 3000);
      },
      error: (err) => {
        console.error('Error saving location:', err);
        this.locationError = 'Failed to save location. Please try again.';
        this.savingLocation = false;
      }
    });
  }

  toggleVisibility(): void {
    if (!this.profile) return;

    this.savingVisibility = true;

    this.vendorService.toggleVisibility().subscribe({
      next: (updatedVendor) => {
        this.profile = updatedVendor;
        this.savingVisibility = false;
      },
      error: (err) => {
        console.error('Error toggling visibility:', err);
        this.savingVisibility = false;
        // Optionally show error toast
      }
    });
  }
}
