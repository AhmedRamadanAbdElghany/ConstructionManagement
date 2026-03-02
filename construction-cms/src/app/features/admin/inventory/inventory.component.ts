
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface Material {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  reorderPoint: number;
  warehouseId: number;
}

interface Warehouse {
  id: number;
  name: string;
  location: string;
  isMain: boolean;
}

interface MaterialRequest {
  id: number;
  materialName: string;
  requestedBy: string;
  quantity: number;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 transition-colors duration-500 font-['Outfit']">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-premium-fade">
          <div class="space-y-4">
            <h1 class="premium-heading mb-0">
              {{ 'inventory.title' | translate }}
            </h1>
            <p class="premium-subheading mb-0">
              {{ 'inventory.subtitle' | translate }}
            </p>
          </div>
          <button (click)="openAddModal()" 
                  class="group relative px-10 py-5 rounded-[2.5rem] bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden">
            <span class="relative z-10">+ {{ 'common.add_new' | translate }}</span>
            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>

        <!-- Premium Tabs -->
        <div class="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-[2.5rem] mb-12 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none w-fit animate-premium-fade" style="animation-delay: 100ms">
          <button (click)="activeTab = 'materials'" 
                  [class.bg-gradient-to-r]="activeTab === 'materials'"
                  [class.from-violet-600]="activeTab === 'materials'"
                  [class.to-indigo-700]="activeTab === 'materials'"
                  [class.text-white]="activeTab === 'materials'"
                  [class.shadow-xl]="activeTab === 'materials'"
                  [class.shadow-violet-500/30]="activeTab === 'materials'"
                  class="px-10 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 text-slate-500 dark:text-slate-400 hover:text-violet-600 active:scale-95">
            {{ 'inventory.tabs.materials' | translate }}
          </button>
          <button (click)="activeTab = 'warehouses'" 
                  [class.bg-gradient-to-r]="activeTab === 'warehouses'"
                  [class.from-violet-600]="activeTab === 'warehouses'"
                  [class.to-indigo-700]="activeTab === 'warehouses'"
                  [class.text-white]="activeTab === 'warehouses'"
                  [class.shadow-xl]="activeTab === 'warehouses'"
                  [class.shadow-violet-500/30]="activeTab === 'warehouses'"
                  class="px-10 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 text-slate-500 dark:text-slate-400 hover:text-violet-600 active:scale-95">
            {{ 'inventory.tabs.warehouses' | translate }}
          </button>
          <button (click)="activeTab = 'requests'" 
                  [class.bg-gradient-to-r]="activeTab === 'requests'"
                  [class.from-violet-600]="activeTab === 'requests'"
                  [class.to-indigo-700]="activeTab === 'requests'"
                  [class.text-white]="activeTab === 'requests'"
                  [class.shadow-xl]="activeTab === 'requests'"
                  [class.shadow-violet-500/30]="activeTab === 'requests'"
                  class="px-10 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 text-slate-500 dark:text-slate-400 hover:text-violet-600 active:scale-95">
            {{ 'inventory.tabs.requests' | translate }}
          </button>
        </div>

        @if (activeTab === 'materials') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (material of materials; track material.id; let i = $index) {
            <div class="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-10 hover:shadow-violet-500/20 hover:-translate-y-2 transition-all duration-500 animate-premium-fade"
                 [style.animation-delay]="(i * 50 + 200) + 'ms'">
               <div class="flex items-start justify-between mb-10">
                 <div class="flex items-center space-x-6">
                   <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-violet-500/10 to-indigo-600/10 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner ring-1 ring-violet-500/20">
                     <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                     </svg>
                   </div>
                   <div>
                     <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ material.name }}</h3>
                     <span class="px-3 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-[10px] text-violet-600 dark:text-violet-400 font-black uppercase tracking-widest">{{ material.category }}</span>
                   </div>
                 </div>
                 <span class="px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ring-1 ring-inset whitespace-nowrap" 
                       [class.bg-emerald-500/10]="material.quantity > material.reorderPoint"
                       [class.text-emerald-600]="material.quantity > material.reorderPoint"
                       [class.ring-emerald-500/20]="material.quantity > material.reorderPoint"
                       [class.bg-amber-500/10]="material.quantity <= material.reorderPoint"
                       [class.text-amber-600]="material.quantity <= material.reorderPoint"
                       [class.ring-amber-500/20]="material.quantity <= material.reorderPoint">
                   {{ (material.quantity > material.reorderPoint ? 'common.active' : 'inventory.low_stock') | translate }}
                 </span>
               </div>
               
               <div class="grid grid-cols-3 gap-4 mb-10">
                 <div class="text-center p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors duration-500 shadow-sm">
                   <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 opacity-60">Stock</p>
                   <p class="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{{ material.quantity }}</p>
                   <p class="text-[9px] text-slate-500 font-bold uppercase">{{ material.unit }}</p>
                 </div>
                 <div class="text-center p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors duration-500 shadow-sm">
                   <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 opacity-60">Price</p>
                   <p class="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{{ material.unitPrice | currency }}</p>
                   <p class="text-[9px] text-slate-500 font-bold uppercase">USD</p>
                 </div>
                 <div class="text-center p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors duration-500 shadow-sm">
                   <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 opacity-60">Reorder</p>
                   <p class="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{{ material.reorderPoint }}</p>
                   <p class="text-[9px] text-slate-500 font-bold uppercase">Limit</p>
                 </div>
               </div>
               
               <div class="flex gap-4">
                 <button class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 transition-all duration-300 active:scale-95">
                   {{ 'common.edit' | translate }}
                 </button>
                 <button class="flex-1 py-5 rounded-[1.5rem] bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-500/30 hover:brightness-110 hover:-translate-y-1 transition-all duration-300 active:scale-95">
                   {{ 'common.request' | translate }}
                 </button>
               </div>
            </div>
            }
          </div>
        }

        @if (activeTab === 'warehouses') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (warehouse of warehouses; track warehouse.id; let i = $index) {
            <div class="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none p-10 hover:shadow-violet-500/20 hover:-translate-y-2 transition-all duration-500 animate-premium-fade"
                 [style.animation-delay]="(i * 50 + 200) + 'ms'">
               <div class="flex items-start justify-between mb-10">
                 <div class="flex items-center space-x-6">
                   <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-violet-500/10 to-indigo-600/10 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner ring-1 ring-violet-500/20">
                     <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                     </svg>
                   </div>
                   <div>
                     <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ warehouse.name }}</h3>
                     <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest opacity-60 italic leading-tight">{{ warehouse.location }}</p>
                   </div>
                 </div>
                 @if (warehouse.isMain) {
                   <span class="px-5 py-2 rounded-[1rem] bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-500/30 ring-1 ring-violet-400">Main</span>
                 }
               </div>
               
               <div class="p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-all duration-500 mb-10 shadow-sm relative overflow-hidden">
                 <div class="flex justify-between items-center relative z-10">
                   <span class="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em]">Aggregate Stock</span>
                   <span class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-indigo-700 group-hover:scale-110 transition-transform duration-500">{{ getWarehouseStock(warehouse.id) }}</span>
                 </div>
                 <div class="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 w-full opacity-20"></div>
               </div>
               
               <div class="flex gap-4">
                 <button class="flex-1 py-5 rounded-[1.5rem] bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/5 transition-all duration-300 active:scale-95">
                   {{ 'common.edit' | translate }}
                 </button>
                 <button class="flex-1 py-5 rounded-[1.5rem] bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-500/30 hover:brightness-110 hover:-translate-y-1 transition-all duration-300 active:scale-95">
                   {{ 'common.details' | translate }}
                 </button>
               </div>
            </div>
            }
            
            <div (click)="openAddModal()" 
                 class="bg-white/30 dark:bg-white/[0.02] rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-10 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500/50 hover:bg-white dark:hover:bg-white/5 transition-all duration-500 group animate-premium-fade shadow-sm"
                 [style.animation-delay]="(warehouses.length * 50 + 200) + 'ms'">
              <div class="w-24 h-24 rounded-full bg-white dark:bg-white/5 flex items-center justify-center mb-8 group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-indigo-700 group-hover:text-white group-hover:scale-110 group-hover:rotate-90 transition-all duration-700 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-white/5">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <p class="font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[11px] group-hover:text-violet-600 transition-colors">Register Warehouse</p>
            </div>
          </div>
        }

        @if (activeTab === 'requests') {
          <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all animate-premium-fade" style="animation-delay: 200ms">
            <div class="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02] flex items-center justify-between">
              <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'inventory.tabs.requests' | translate }}</h2>
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-amber-500 animate-premium-pulse"></span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Processing</span>
              </div>
            </div>
            <div class="overflow-x-auto px-6">
              <table class="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr class="text-left text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th class="px-8 py-4">{{ 'inventory.material' | translate }}</th>
                    <th class="px-8 py-4">{{ 'inventory.requested_by' | translate }}</th>
                    <th class="px-8 py-4">{{ 'inventory.quantity' | translate }}</th>
                    <th class="px-8 py-4">{{ 'inventory.date' | translate }}</th>
                    <th class="px-8 py-4">{{ 'inventory.status' | translate }}</th>
                    <th class="px-8 py-4 text-right">{{ 'inventory.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="text-slate-600 dark:text-slate-300">
                  @for (request of materialRequests; track request.id; let i = $index) {
                  <tr class="group bg-slate-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/5 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1 animate-premium-fade"
                      [style.animation-delay]="(i * 30 + 400) + 'ms'">
                    <td class="px-8 py-8 first:rounded-l-[2rem]">
                      <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ request.materialName }}</p>
                      </div>
                    </td>
                    <td class="px-8 py-8">
                      <div class="flex items-center gap-4">
                         <div class="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black text-lg border border-slate-200 dark:border-white/5 shadow-inner group-hover:rotate-12 transition-transform">
                            {{ request.requestedBy.charAt(0) }}
                         </div>
                         <div>
                           <p class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ request.requestedBy }}</p>
                           <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Logistics Officer</p>
                         </div>
                      </div>
                    </td>
                    <td class="px-8 py-8">
                      <span class="px-5 py-2.5 rounded-[1.25rem] bg-indigo-500/10 text-indigo-600 font-black text-sm shadow-sm ring-1 ring-indigo-500/20 whitespace-nowrap">{{ request.quantity }} Items</span>
                    </td>
                    <td class="px-8 py-8">
                      <div class="flex flex-col">
                        <p class="text-[11px] font-black text-slate-500 uppercase tracking-tighter">{{ request.requestDate | date:'mediumDate' }}</p>
                        <p class="text-[9px] text-slate-400 font-bold uppercase opacity-60 italic">{{ request.requestDate | date:'shortTime' }}</p>
                      </div>
                    </td>
                    <td class="px-8 py-8">
                      <span class="px-5 py-2.5 rounded-[1.25rem] text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset whitespace-nowrap"
                            [ngClass]="{
                              'bg-amber-500/10 text-amber-600 ring-amber-500/20': request.status === 'Pending',
                              'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20': request.status === 'Approved',
                              'bg-rose-500/10 text-rose-600 ring-rose-500/20': request.status === 'Rejected'
                            }">
                        {{ request.status | translate }}
                      </span>
                    </td>
                    <td class="px-8 py-8 text-right last:rounded-r-[2rem]">
                      <div class="flex justify-end gap-3">
                        @if (request.status === 'Pending') {
                          <button (click)="approveRequest(request)" 
                                  class="px-8 py-3 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest hover:brightness-110 hover:-translate-y-0.5 shadow-xl shadow-emerald-500/20 transition-all active:scale-95">
                            Approve
                          </button>
                          <button (click)="rejectRequest(request)" 
                                  class="px-8 py-3 rounded-2xl bg-white dark:bg-slate-800 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/10 shadow-lg shadow-slate-200/50 dark:shadow-none border border-rose-100 dark:border-rose-500/20 transition-all active:scale-95">
                            Reject
                          </button>
                        } @else {
                          <div class="flex items-center space-x-3 opacity-60">
                            <span class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Processed</span>
                            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class InventoryComponent implements OnInit {
  activeTab: 'materials' | 'warehouses' | 'requests' = 'materials';

  materials: Material[] = [
    { id: 1, name: 'Cement Portland', category: 'Construction', unit: 'bags', quantity: 250, unitPrice: 12.50, reorderPoint: 50, warehouseId: 1 },
    { id: 2, name: 'Steel Rebar 12mm', category: 'Steel', unit: 'pieces', quantity: 500, unitPrice: 8.75, reorderPoint: 100, warehouseId: 1 },
    { id: 3, name: 'Sand', category: 'Aggregates', unit: 'm3', quantity: 45, unitPrice: 35.00, reorderPoint: 20, warehouseId: 2 },
    { id: 4, name: 'Gravel', category: 'Aggregates', unit: 'm3', quantity: 30, unitPrice: 28.00, reorderPoint: 15, warehouseId: 2 },
    { id: 5, name: 'Concrete Blocks', category: 'Masonry', unit: 'pieces', quantity: 1200, unitPrice: 2.50, reorderPoint: 200, warehouseId: 1 },
    { id: 6, name: 'Electrical Wire', category: 'Electrical', unit: 'meters', quantity: 800, unitPrice: 1.25, reorderPoint: 100, warehouseId: 3 },
  ];

  warehouses: Warehouse[] = [
    { id: 1, name: 'Main Warehouse', location: 'Cairo Industrial Zone', isMain: true },
    { id: 2, name: 'Secondary Storage', location: 'Giza Compound', isMain: false },
    { id: 3, name: 'Electrical Depot', location: 'New Cairo', isMain: false },
  ];

  materialRequests: MaterialRequest[] = [
    { id: 1, materialName: 'Cement Portland', requestedBy: 'Ahmed Hassan', quantity: 50, requestDate: '2024-01-15', status: 'Pending' },
    { id: 2, materialName: 'Steel Rebar 12mm', requestedBy: 'Mohamed Ali', quantity: 200, requestDate: '2024-01-14', status: 'Approved' },
    { id: 3, materialName: 'Sand', requestedBy: 'Ibrahim', quantity: 15, requestDate: '2024-01-13', status: 'Pending' },
    { id: 4, materialName: 'Electrical Wire', requestedBy: 'Hassan', quantity: 300, requestDate: '2024-01-12', status: 'Rejected' },
  ];

  ngOnInit() { }

  getWarehouseStock(warehouseId: number): number {
    return this.materials
      .filter(m => m.warehouseId === warehouseId)
      .reduce((sum, m) => sum + m.quantity, 0);
  }

  openAddModal() {
    console.log('Open add modal for:', this.activeTab);
  }

  approveRequest(request: MaterialRequest) {
    request.status = 'Approved';
  }

  rejectRequest(request: MaterialRequest) {
    request.status = 'Rejected';
  }
}
