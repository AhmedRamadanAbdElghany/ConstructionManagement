import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VendorService, Vendor, VendorProduct, CreateVendorProductRequest } from '../../../core/services/vendor.service';
import * as L from 'leaflet';

@Component({
    selector: 'app-vendor-storefront',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {{ 'vendors.storefront_title' | translate }}
            <span *ngIf="vendor?.isPublic" class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Public</span>
            <span *ngIf="!vendor?.isPublic" class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Private</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400">{{ 'vendors.storefront_desc' | translate }}</p>
        </div>
        <div class="flex gap-3">
          <button (click)="onSaveProfile()" [disabled]="saving"
                  class="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2">
            @if (saving) { <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
            {{ 'common.save_changes' | translate }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile & Location -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              {{ 'vendors.basic_info' | translate }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">{{ 'vendors.name' | translate }}</label>
                <input type="text" [(ngModel)]="vendor.name" class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 transition-all" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">{{ 'vendors.phone' | translate }}</label>
                <input type="text" [(ngModel)]="vendor.phone" class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 transition-all" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">{{ 'vendors.address' | translate }}</label>
                <input type="text" [(ngModel)]="vendor.address" class="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 transition-all" />
              </div>
              <div class="flex items-center gap-2 md:col-span-2 mt-2">
                <input type="checkbox" id="isPublic" [(ngModel)]="vendor.isPublic" class="w-5 h-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500">
                <label for="isPublic" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {{ 'vendors.make_profile_public' | translate }}
                  <span class="block text-xs text-slate-500 font-normal">If checked, you'll appear on the discovery map for companies.</span>
                </label>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col">
            <h3 class="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {{ 'vendors.set_location' | translate }}
            </h3>
            <p class="text-xs text-slate-500 mb-4">{{ 'vendors.location_hint' | translate }}</p>
            <div id="store-map" class="flex-1 rounded-2xl border border-slate-100 dark:border-slate-800 z-0"></div>
          </div>
        </div>

        <!-- Products List -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              {{ 'vendors.product_catalog' | translate }}
            </h3>
            <button (click)="showAddProductModal = true" class="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-cyan-600 rounded-xl transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>

          <div class="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            @for (prod of products; track prod.id) {
              <div class="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-cyan-500 transition-all">
                <div class="flex justify-between items-start mb-1">
                  <h4 class="font-bold text-slate-900 dark:text-white">{{ prod.name }}</h4>
                  <button (click)="onDeleteProduct(prod.id)" class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{{ prod.category }}</p>
                <div class="flex justify-between items-end">
                  <span class="text-xs font-black text-emerald-600 dark:text-emerald-400">{{ prod.price | currency:'EGP' }}</span>
                  <span class="text-[10px] items-center py-1 px-2 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                    per {{ prod.unit }}
                  </span>
                </div>
              </div>
            } @empty {
              <div class="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <p class="text-sm text-slate-400">No products added yet</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Add Product Modal -->
      @if (showAddProductModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 transform transition-all">
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-6">{{ 'vendors.add_product' | translate }}</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">{{ 'common.name' | translate }}</label>
                <input type="text" [(ngModel)]="newProduct.name" class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 transition-all" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">{{ 'vendors.price' | translate }}</label>
                  <input type="number" [(ngModel)]="newProduct.price" class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">{{ 'vendors.unit' | translate }}</label>
                  <input type="text" [(ngModel)]="newProduct.unit" placeholder="e.g. Ton" class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">{{ 'vendors.category' | translate }}</label>
                <select [(ngModel)]="newProduct.category" class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-cyan-500 transition-all">
                  <option value="Cement">Cement</option>
                  <option value="Steel">Steel</option>
                  <option value="Sand">Sand</option>
                  <option value="Aggregate">Aggregate</option>
                  <option value="Bricks">Bricks</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>
            </div>

            <div class="flex gap-4 mt-8">
              <button (click)="showAddProductModal = false" class="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 transition-all">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="onAddProduct()" [disabled]="!newProduct.name" class="flex-1 px-4 py-3 rounded-2xl bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/30 hover:bg-cyan-600 transition-all disabled:opacity-50">
                {{ 'common.add' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    #store-map { height: 100%; width: 100%; border-radius: 1rem; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
  `]
})
export class VendorStorefrontComponent implements OnInit, AfterViewInit, OnDestroy {
    private map!: L.Map;
    private marker?: L.Marker;

    vendor: any = {
        name: '',
        phone: '',
        address: '',
        latitude: 30.0444,
        longitude: 31.2357,
        isPublic: false
    };
    products: VendorProduct[] = [];

    newProduct: CreateVendorProductRequest = {
        name: '',
        category: 'Cement',
        price: 0,
        unit: 'Ton',
        description: ''
    };

    saving = false;
    showAddProductModal = false;

    constructor(private vendorService: VendorService) { }

    ngOnInit() {
        this.loadProfile();
    }

    ngAfterViewInit() {
        this.initMap();
    }

    ngOnDestroy() {
        if (this.map) this.map.remove();
    }

    private initMap() {
        this.map = L.map('store-map', {
            zoomControl: true,
            attributionControl: false
        }).setView([this.vendor.latitude || 30.0444, this.vendor.longitude || 31.2357], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        const icon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });

        this.marker = L.marker([this.vendor.latitude || 30.0444, this.vendor.longitude || 31.2357], {
            icon,
            draggable: true
        }).addTo(this.map);

        this.marker.on('dragend', (e: any) => {
            const pos = e.target.getLatLng();
            this.vendor.latitude = pos.lat;
            this.vendor.longitude = pos.lng;
        });

        this.map.on('click', (e: L.LeafletMouseEvent) => {
            this.marker?.setLatLng(e.latlng);
            this.vendor.latitude = e.latlng.lat;
            this.vendor.longitude = e.latlng.lng;
        });
    }

    loadProfile() {
        this.vendorService.getMyProfile().subscribe({
            next: (v) => {
                this.vendor = v;
                if (this.map && v.latitude && v.longitude) {
                    this.map.setView([v.latitude, v.longitude], 13);
                    this.marker?.setLatLng([v.latitude, v.longitude]);
                }
                this.loadProducts(v.id);
            },
            error: (err) => console.error('Error loading profile', err)
        });
    }

    loadProducts(vendorId: number) {
        this.vendorService.getVendorProducts(vendorId).subscribe({
            next: (p) => this.products = p,
            error: (err) => console.error('Error loading products', err)
        });
    }

    onSaveProfile() {
        this.saving = true;
        this.vendorService.updateMyProfile(this.vendor).subscribe({
            next: (v) => {
                this.vendor = v;
                this.saving = false;
                alert('Profile saved successfully!');
            },
            error: (err) => {
                console.error('Save error', err);
                this.saving = false;
            }
        });
    }

    onAddProduct() {
        if (!this.newProduct.name || !this.vendor.id) return;
        this.vendorService.addProduct(this.vendor.id, this.newProduct).subscribe({
            next: (p) => {
                this.products.push(p);
                this.showAddProductModal = false;
                this.newProduct = { name: '', category: 'Cement', price: 0, unit: 'Ton', description: '' };
            },
            error: (err) => console.error('Add product error', err)
        });
    }

    onDeleteProduct(id: number) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        this.vendorService.deleteProduct(id).subscribe({
            next: () => this.products = this.products.filter(p => p.id !== id),
            error: (err) => console.error('Delete product error', err)
        });
    }
}
