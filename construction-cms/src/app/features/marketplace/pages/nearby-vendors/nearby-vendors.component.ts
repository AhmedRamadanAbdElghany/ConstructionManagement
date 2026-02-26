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
    <div class="nearby-page-premium">
      <!-- Premium Header -->
      <div class="page-header-premium">
        <div class="header-main">
          <div class="header-icon">
            <i class="pi pi-map-marker"></i>
            <div class="icon-pulse"></div>
          </div>
          <div class="header-text">
            <h1>{{ 'MARKETPLACE.FIND_NEARBY' | translate }}</h1>
            <p>{{ 'MARKETPLACE.NEARBY_SUBTITLE' | translate }}</p>
          </div>
        </div>
      </div>

      <div class="premium-shell">
        <!-- Glass Location Controls -->
        <div class="location-card-glass">
            <div class="controls-grid">
              <!-- Radius Control -->
              <div class="control-group">
                <label class="premium-label">{{ 'MARKETPLACE.SEARCH_RADIUS' | translate }}</label>
                <div class="radius-button-strip">
                  @for (radius of radiusOptions; track radius) {
                    <button 
                      class="radius-toggle"
                      [class.active]="selectedRadius() === radius"
                      (click)="selectRadius(radius)">
                      {{ radius }}<span>km</span>
                    </button>
                  }
                </div>
              </div>
              
              <!-- Custom Radius -->
              <div class="control-group">
                <label class="premium-label">{{ 'MARKETPLACE.CUSTOM_RADIUS' | translate }}</label>
                <div class="custom-radius-input">
                  <div class="input-glow-wrapper">
                    <input type="number" 
                           [(ngModel)]="customRadius" 
                           min="0.1" 
                           max="100" 
                           step="0.1" />
                    <span class="unit-tag">km</span>
                  </div>
                  <button class="apply-btn-premium" (click)="applyCustomRadius()">
                    <i class="pi pi-check"></i>
                  </button>
                </div>
              </div>

              <!-- Quick Action -->
              <div class="control-group action-group">
                <button class="location-btn-premium" (click)="getCurrentLocation()" [disabled]="loading()">
                  <i class="pi" [class.pi-map-marker]="!loading()" [class.pi-spinner]="loading()" [class.pi-spin]="loading()"></i>
                  <span>{{ 'MARKETPLACE.USE_MY_LOCATION' | translate }}</span>
                </button>
              </div>
            </div>

            <div class="divider-glass">
              <span>{{ 'MARKETPLACE.OR_ENTER_LOCATION' | translate }}</span>
            </div>

            <!-- Coordinate Search -->
            <div class="coordinate-inputs">
              <div class="coord-field">
                <i class="pi pi-compass"></i>
                <input type="number" 
                       [(ngModel)]="manualLatitude" 
                       [placeholder]="'MARKETPLACE.LATITUDE' | translate"
                       step="0.0001" />
              </div>
              <div class="coord-field">
                <i class="pi pi-compass"></i>
                <input type="number" 
                       [(ngModel)]="manualLongitude" 
                       [placeholder]="'MARKETPLACE.LONGITUDE' | translate"
                       step="0.0001" />
              </div>
              <button class="coord-search-btn" (click)="searchByCoordinates()">
                <i class="pi pi-search"></i>
              </button>
            </div>
        </div>

        <!-- Feedback Messages -->
        <div class="feedback-container">
          @if (currentLocation()) {
            <div class="location-badge-premium animate-fade-in">
              <i class="pi pi-check-circle"></i>
              <span>{{ 'MARKETPLACE.YOUR_LOCATION' | translate }}: <strong>{{ currentLocation()?.lat | number:'1.4-4' }}, {{ currentLocation()?.lng | number:'1.4-4' }}</strong></span>
            </div>
          }

          @if (error()) {
            <div class="error-glass animate-shake">
              <i class="pi pi-exclamation-triangle"></i>
              <div class="error-content">
                <p>{{ error() }}</p>
                <button (click)="retrySearch()">{{ 'MARKETPLACE.RETRY' | translate }}</button>
              </div>
            </div>
          }
        </div>

        <!-- Results Section -->
        @if (!loading() && !error() && vendors().length > 0) {
          <div class="results-meta">
            <span class="count-pill">
              <strong>{{ vendors().length }}</strong> {{ 'MARKETPLACE.VENDORS_FOUND' | translate }}
            </span>
            <span class="range-pill">
              {{ 'MARKETPLACE.WITHIN' | translate }} <strong>{{ selectedRadius() }}</strong> km
            </span>
          </div>

          <div class="vendors-grid-premium">
            @for (vendor of vendors(); track vendor.id) {
              <div class="vendor-glass-card group" (click)="goToVendor(vendor.id)">
                <div class="card-glow"></div>
                
                <div class="card-top">
                  <div class="vendor-profile-box">
                    <div class="portrait-container">
                      <i class="pi pi-building"></i>
                    </div>
                    <div class="vendor-details">
                      <h3>{{ vendor.name }}</h3>
                      <p class="vendor-address-small">
                        <i class="pi pi-map-marker"></i>
                        {{ vendor.address || 'MARKETPLACE.NO_ADDRESS' | translate }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="distance-chip">
                    <span class="val">{{ vendor.distance | number:'1.1-1' }}</span>
                    <span class="unit">km</span>
                  </div>
                </div>

                <div class="card-stats-row">
                  <div class="mini-stat">
                    <i class="pi pi-star-fill"></i>
                    <span>{{ vendor.averageRating | number:'1.0-1' }}</span>
                  </div>
                  <div class="mini-stat">
                    <i class="pi pi-shopping-bag"></i>
                    <span>{{ vendor.totalOrders }}</span>
                  </div>
                  <div class="mini-stat">
                    <i class="pi pi-box"></i>
                    <span>{{ vendor.productCount }}</span>
                  </div>
                </div>

                @if (vendor.categories && vendor.categories.length > 0) {
                  <div class="card-tags">
                    @for (category of vendor.categories.slice(0, 2); track category) {
                      <span class="premium-tag">{{ category }}</span>
                    }
                    @if (vendor.categories.length > 2) {
                      <span class="more-tag">+{{ vendor.categories.length - 2 }}</span>
                    }
                  </div>
                }

                <div class="card-actions-premium">
                  <button class="primary-action-btn" (click)="goToVendor(vendor.id); $event.stopPropagation()">
                    <span>{{ 'MARKETPLACE.VIEW' | translate }}</span>
                    <i class="pi pi-chevron-right"></i>
                  </button>
                  <button class="secondary-action-btn" (click)="getDirections(vendor); $event.stopPropagation()" [title]="'MARKETPLACE.DIRECTIONS' | translate">
                    <i class="pi pi-directions"></i>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- States -->
        <div class="status-containers">
            @if (loading()) {
              <div class="state-placeholder animate-pulse">
                <div class="spinner-premium"></div>
                <h2>{{ 'MARKETPLACE.SEARCHING' | translate }}</h2>
                <p>Curating the best suppliers near you...</p>
              </div>
            }

            @if (!loading() && !error() && vendors().length === 0 && hasSearched()) {
              <div class="state-placeholder glass-state">
                <div class="state-icon error"><i class="pi pi-search-minus"></i></div>
                <h2>{{ 'MARKETPLACE.NO_VENDORS_FOUND' | translate }}</h2>
                <p>{{ 'MARKETPLACE.NO_VENDORS_MSG' | translate }}</p>
                <div class="suggestions-premium">
                  <h6>{{ 'MARKETPLACE.TRY_SUGGESTIONS' | translate }}</h6>
                  <ul>
                    <li><i class="pi pi-plus"></i> {{ 'MARKETPLACE.INCREASE_RADIUS' | translate }}</li>
                    <li><i class="pi pi-map"></i> {{ 'MARKETPLACE.CHECK_LOCATION' | translate }}</li>
                  </ul>
                </div>
              </div>
            }

            @if (!loading() && !error() && vendors().length === 0 && !hasSearched()) {
              <div class="initial-discover-premium">
                <div class="discover-bg"></div>
                <div class="discover-content">
                  <div class="radar-box">
                    <div class="radar-circle"></div>
                    <div class="radar-circle delay-1"></div>
                    <div class="radar-circle delay-2"></div>
                    <i class="pi pi-compass"></i>
                  </div>
                  <h2>{{ 'MARKETPLACE.FIND_NEARBY' | translate }}</h2>
                  <p>{{ 'MARKETPLACE.FIND_NEARBY_MSG' | translate }}</p>
                  <button class="main-discover-btn" (click)="getCurrentLocation()">
                    <span>{{ 'MARKETPLACE.START_SEARCH' | translate }}</span>
                    <i class="pi pi-search"></i>
                  </button>
                </div>
              </div>
            }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nearby-page-premium {
      min-height: 100vh;
      background: var(--app-bg);
      color: var(--app-text);
      padding-bottom: 6rem;
      transition: all 0.3s ease;
    }

    .premium-shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Header */
    .page-header-premium {
      background: linear-gradient(to bottom, var(--card-bg), var(--app-bg));
      padding: 4rem 2rem;
      margin-bottom: -60px;
      text-align: center;
      position: relative;
    }

    .header-main {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .header-icon {
      width: 72px;
      height: 72px;
      background: rgba(14, 165, 233, 0.1);
      border: 1px solid rgba(14, 165, 233, 0.2);
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.25rem;
      color: var(--accent-blue);
      position: relative;
    }

    .icon-pulse {
      position: absolute;
      inset: -8px;
      background: var(--accent-blue);
      border-radius: 22px;
      opacity: 0.1;
      animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.1; }
      50% { transform: scale(1.15); opacity: 0.2; }
    }

    .header-text h1 {
      font-size: 3rem;
      font-weight: 950;
      letter-spacing: -0.04em;
      margin-bottom: 0.5rem;
      color: var(--app-text);
    }

    :host-context(.dark) .header-text h1 {
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-text p {
      color: var(--muted-text);
      font-size: 1.1rem;
      font-weight: 500;
    }

    /* Location Card Glass */
    .location-card-glass {
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 3rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 20;
    }

    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 3rem;
      align-items: flex-end;
    }

    .premium-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted-text);
      margin-bottom: 1.25rem;
    }

    .radius-button-strip {
      display: flex;
      background: var(--input-bg);
      padding: 6px;
      border-radius: 18px;
      border: 1px solid var(--glass-border);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }

    .radius-toggle {
      flex: 1;
      padding: 12px;
      border: none;
      background: transparent;
      color: var(--muted-text);
      font-weight: 800;
      font-size: 0.95rem;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 3px;
    }

    .radius-toggle span { font-size: 0.75rem; font-weight: 600; opacity: 0.6; }

    .radius-toggle.active {
      background: var(--accent-blue);
      color: white;
      box-shadow: 0 8px 16px rgba(14, 165, 233, 0.3);
      transform: translateY(-1px);
    }

    .radius-toggle.active span { opacity: 0.9; }

    .radius-toggle:hover:not(.active) {
      background: var(--glass-border);
      color: var(--app-text);
    }

    .custom-radius-input {
      display: flex;
      gap: 1rem;
    }

    .input-glow-wrapper {
      position: relative;
      flex: 1;
    }

    .input-glow-wrapper input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 18px;
      padding: 14px 45px 14px 20px;
      color: var(--app-text);
      font-weight: 800;
      outline: none;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .input-glow-wrapper input:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
    }

    .unit-tag {
      position: absolute;
      right: 18px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--muted-text);
    }

    .apply-btn-premium {
      width: 52px;
      height: 52px;
      border-radius: 18px;
      background: var(--input-bg);
      color: var(--app-text);
      border: 1px solid var(--glass-border);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .apply-btn-premium:hover {
      background: var(--accent-blue);
      color: white;
      border-color: transparent;
      transform: scale(1.05) rotate(90deg);
    }

    .location-btn-premium {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      padding: 16px;
      border-radius: 20px;
      background: linear-gradient(135deg, #0ea5e9, #2563eb);
      color: white;
      border: none;
      font-weight: 900;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(14, 165, 233, 0.3);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .location-btn-premium:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(14, 165, 233, 0.4);
      filter: brightness(1.1);
    }

    .location-btn-premium:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .divider-glass {
      display: flex;
      align-items: center;
      margin: 3rem 0;
      color: var(--muted-text);
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.2em;
    }

    .divider-glass::before, .divider-glass::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--glass-border);
    }

    .divider-glass span { padding: 0 2rem; }

    .coordinate-inputs {
      display: flex;
      gap: 1rem;
    }

    .coord-field {
      flex: 1;
      position: relative;
    }

    .coord-field i {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted-text);
      font-size: 1.1rem;
    }

    .coord-field input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 18px;
      padding: 14px 18px 14px 50px;
      color: var(--app-text);
      outline: none;
      font-weight: 700;
      transition: all 0.3s ease;
    }

    .coord-field input:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
    }

    .coord-search-btn {
      width: 56px;
      border-radius: 18px;
      background: var(--input-bg);
      color: var(--muted-text);
      border: 1px solid var(--glass-border);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .coord-search-btn:hover {
      background: var(--accent-blue);
      color: white;
      border-color: transparent;
      transform: scale(1.05);
    }

    /* Feedback */
    .feedback-container { margin: 2rem 0; }

    .location-badge-premium {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 12px 24px;
      border-radius: 100px;
      color: #10b981;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .error-glass {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      padding: 1.5rem;
      border-radius: 20px;
      color: #ef4444;
      font-weight: 600;
    }

    /* Results */
    .results-meta {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .count-pill, .range-pill {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      padding: 10px 20px;
      border-radius: 14px;
      font-size: 0.9rem;
      color: var(--muted-text);
      font-weight: 600;
    }

    .count-pill strong, .range-pill strong { color: var(--app-text); font-weight: 900; }

    /* Vendors Grid */
    .vendors-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2.5rem;
    }

    .vendor-glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      padding: 2.25rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    }

    .vendor-glass-card:hover {
      background: var(--card-bg);
      border-color: var(--accent-blue);
      transform: translateY(-10px);
      box-shadow: 0 30px 60px rgba(0,0,0,0.08);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .vendor-profile-box {
      display: flex;
      gap: 1.5rem;
    }

    .portrait-container {
      width: 64px;
      height: 64px;
      background: var(--input-bg);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-blue);
      font-size: 1.75rem;
      border: 1px solid var(--glass-border);
      transition: all 0.3s ease;
    }

    .vendor-glass-card:hover .portrait-container {
      background: var(--accent-blue);
      color: white;
      border-color: transparent;
      transform: rotate(-5deg) scale(1.1);
    }

    .vendor-details h3 {
      font-size: 1.4rem;
      font-weight: 900;
      color: var(--app-text);
      margin-bottom: 0.4rem;
      letter-spacing: -0.02em;
    }

    .vendor-address-small {
      font-size: 0.9rem;
      color: var(--muted-text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .distance-chip {
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      padding: 8px 14px;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 65px;
      transition: all 0.3s ease;
    }

    .vendor-glass-card:hover .distance-chip {
      background: var(--accent-blue);
      border-color: transparent;
      transform: scale(1.05);
    }

    .distance-chip .val { font-size: 1.25rem; font-weight: 950; color: var(--accent-blue); line-height: 1; transition: color 0.3s ease; }
    .distance-chip .unit { font-size: 0.7rem; font-weight: 800; color: var(--muted-text); text-transform: uppercase; margin-top: 4px; transition: color 0.3s ease; }

    .vendor-glass-card:hover .distance-chip .val,
    .vendor-glass-card:hover .distance-chip .unit { color: white; }

    .card-stats-row {
      display: flex;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 22px;
      padding: 14px;
      margin-bottom: 1.75rem;
      transition: all 0.3s ease;
    }

    .vendor-glass-card:hover .card-stats-row {
      background: var(--card-bg);
      border-color: rgba(14, 165, 233, 0.1);
    }

    .mini-stat {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-size: 1rem;
      font-weight: 800;
      color: var(--app-text);
    }

    .mini-stat i { color: var(--accent-amber); font-size: 0.9rem; }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-bottom: 2.5rem;
    }

    .premium-tag {
      font-size: 0.75rem;
      font-weight: 850;
      text-transform: uppercase;
      padding: 6px 12px;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      color: var(--muted-text);
      letter-spacing: 0.05em;
    }

    .more-tag { font-size: 0.8rem; color: var(--muted-text); font-weight: 800; align-self: center; }

    .card-actions-premium {
      display: flex;
      gap: 1rem;
    }

    .primary-action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: #1e293b;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 14px;
      border-radius: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .vendor-glass-card:hover .primary-action-btn {
      background: #0ea5e9;
      box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2);
      border-color: #0ea5e9;
    }

    .secondary-action-btn {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #64748b;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .secondary-action-btn:hover {
      background: #f59e0b;
      color: white;
      border-color: #f59e0b;
      box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);
    }

    /* States */
    .status-containers { margin-top: 5rem; }

    .state-placeholder {
      text-align: center;
      padding: 5rem;
      background: rgba(30, 41, 59, 0.2);
      border-radius: 40px;
      border: 1px dashed rgba(255, 255, 255, 0.05);
    }

    .spinner-premium {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(14, 165, 233, 0.1);
      border-top-color: #0ea5e9;
      border-radius: 50%;
      margin: 0 auto 2rem;
      animation: spin 1s infinite linear;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .initial-discover-premium {
      position: relative;
      height: 500px;
      border-radius: 40px;
      background: #0f172a;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .discover-bg {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.05) 0%, transparent 70%);
    }

    .radar-box {
      width: 120px;
      height: 120px;
      margin: 0 auto 2.5rem;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0ea5e9;
      font-size: 3rem;
    }

    .radar-circle {
      position: absolute;
      inset: 0;
      border: 2px solid #0ea5e9;
      border-radius: 50%;
      opacity: 0;
      animation: radar 3s infinite;
    }

    .radar-circle.delay-1 { animation-delay: 1s; }
    .radar-circle.delay-2 { animation-delay: 2s; }

    @keyframes radar {
      0% { transform: scale(0.5); opacity: 0.5; }
      100% { transform: scale(2.5); opacity: 0; }
    }

    .main-discover-btn {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      padding: 16px 40px;
      background: linear-gradient(135deg, #0ea5e9, #2563eb);
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 1.1rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 20px 40px rgba(14, 165, 233, 0.3);
      transition: all 0.3s ease;
    }

    .main-discover-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(14, 165, 233, 0.4);
    }

    @media (max-width: 768px) {
      .premium-shell { padding: 0 1rem; }
      .controls-grid { grid-template-columns: 1fr; gap: 1.5rem; }
      .coordinate-inputs { flex-direction: column; }
      .header-text h1 { font-size: 2rem; }
      .location-card-glass { padding: 1.5rem; border-radius: 24px; }
      .vendors-grid-premium { grid-template-columns: 1fr; }
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
