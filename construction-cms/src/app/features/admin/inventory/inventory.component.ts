
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
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500 font-['Outfit']">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-premium-fade">
          <div class="space-y-1">
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase drop-shadow-sm">
              {{ 'inventory.title' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium italic opacity-80">
              Manage items, warehouses, and requests
            </p>
          </div>
          <button (click)="openAddModal()" 
                  class="px-10 py-5 rounded-[2rem] bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 active:scale-95 transition-all">
            + {{ 'common.add_new' | translate }}
          </button>
        </div>

        <!-- Premium Tabs -->
        <div class="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-[1.5rem] mb-10 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none w-fit animate-premium-fade" style="animation-delay: 100ms">
          <button (click)="activeTab = 'materials'" 
                  [class.bg-gradient-to-r]="activeTab === 'materials'"
                  [class.from-violet-600]="activeTab === 'materials'"
                  [class.to-indigo-700]="activeTab === 'materials'"
                  [class.text-white]="activeTab === 'materials'"
                  [class.shadow-lg]="activeTab === 'materials'"
                  [class.shadow-violet-500/20]="activeTab === 'materials'"
                  class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-violet-500">
            {{ 'inventory.tabs.materials' | translate }}
          </button>
          <button (click)="activeTab = 'warehouses'" 
                  [class.bg-gradient-to-r]="activeTab === 'warehouses'"
                  [class.from-violet-600]="activeTab === 'warehouses'"
                  [class.to-indigo-700]="activeTab === 'warehouses'"
                  [class.text-white]="activeTab === 'warehouses'"
                  [class.shadow-lg]="activeTab === 'warehouses'"
                  [class.shadow-violet-500/20]="activeTab === 'warehouses'"
                  class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-violet-500">
            {{ 'inventory.tabs.warehouses' | translate }}
          </button>
          <button (click)="activeTab = 'requests'" 
                  [class.bg-gradient-to-r]="activeTab === 'requests'"
                  [class.from-violet-600]="activeTab === 'requests'"
                  [class.to-indigo-700]="activeTab === 'requests'"
                  [class.text-white]="activeTab === 'requests'"
                  [class.shadow-lg]="activeTab === 'requests'"
                  [class.shadow-violet-500/20]="activeTab === 'requests'"
                  class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-violet-500">
            {{ 'inventory.tabs.requests' | translate }}
          </button>
        </div>

        @if (activeTab === 'materials') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (material of materials; track material.id; let i = $index) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 hover:shadow-violet-500/10 transition-all duration-500 group animate-premium-fade"
                 [style.animation-delay]="(i * 50 + 200) + 'ms'">
               <div class="flex items-start justify-between mb-8">
                 <div class="flex items-center space-x-5">
                   <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-violet-500/10 to-indigo-600/10 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-500 shadow-inner ring-1 ring-violet-500/10">
                     <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                     </svg>
                   </div>
                   <div>
                     <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ material.name }}</h3>
                     <span class="text-[10px] text-violet-500 font-black uppercase tracking-widest opacity-80">{{ material.category }}</span>
                   </div>
                 </div>
                 <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset" 
                       [class.bg-emerald-500/10]="material.quantity > material.reorderPoint"
                       [class.text-emerald-600]="material.quantity > material.reorderPoint"
                       [class.ring-emerald-500/20]="material.quantity > material.reorderPoint"
                       [class.bg-amber-500/10]="material.quantity <= material.reorderPoint"
                       [class.text-amber-600]="material.quantity <= material.reorderPoint"
                       [class.ring-amber-500/20]="material.quantity <= material.reorderPoint">
                   {{ material.quantity > material.reorderPoint ? 'In Stock' : 'Low Stock' }}
                 </span>
               </div>
               
               <div class="grid grid-cols-3 gap-4 mb-8">
                 <div class="text-center p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors duration-500">
                   <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Stock</p>
                   <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{{ material.quantity }}</p>
                   <p class="text-[8px] text-slate-500 font-bold uppercase mt-1">{{ material.unit }}</p>
                 </div>
                 <div class="text-center p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors duration-500">
                   <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Price</p>
                   <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{{ material.unitPrice | currency:'USD':'symbol':'1.2-2' }}</p>
                 </div>
                 <div class="text-center p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors duration-500">
                   <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Reorder</p>
                   <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{{ material.reorderPoint }}</p>
                 </div>
               </div>
               
               <div class="flex gap-3">
                 <button class="flex-1 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 hover:text-violet-600 shadow-sm border border-slate-200 dark:border-white/5 transition-all duration-300">
                   Edit
                 </button>
                 <button class="flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all duration-300">
                   Request
                 </button>
               </div>
            </div>
            }
          </div>
        }

        @if (activeTab === 'warehouses') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (warehouse of warehouses; track warehouse.id; let i = $index) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 hover:shadow-violet-500/10 transition-all duration-500 group animate-premium-fade"
                 [style.animation-delay]="(i * 50 + 200) + 'ms'">
               <div class="flex items-start justify-between mb-8">
                 <div class="flex items-center space-x-5">
                   <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-violet-500/10 to-indigo-600/10 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-500 shadow-inner ring-1 ring-violet-500/10">
                     <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                     </svg>
                   </div>
                   <div>
                     <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{{ warehouse.name }}</h3>
                     <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60 italic">{{ warehouse.location }}</p>
                   </div>
                 </div>
                 @if (warehouse.isMain) {
                   <span class="px-4 py-2 rounded-xl bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 ring-1 ring-violet-400">Main</span>
                 }
               </div>
               
               <div class="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors duration-500 mb-8">
                 <div class="flex justify-between items-center">
                   <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Stock</span>
                   <span class="text-2xl font-black text-violet-600 group-hover:scale-110 transition-transform duration-500">{{ getWarehouseStock(warehouse.id) }}</span>
                 </div>
               </div>
               
               <div class="flex gap-3">
                 <button class="flex-1 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 hover:text-violet-600 shadow-sm border border-slate-200 dark:border-white/5 transition-all duration-300">
                   Edit
                 </button>
                 <button class="flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all duration-300">
                   View
                 </button>
               </div>
            </div>
            }
            
            <div (click)="openAddModal()" 
                 class="bg-slate-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500/50 hover:bg-white dark:hover:bg-white/5 transition-all duration-500 group animate-premium-fade"
                 [style.animation-delay]="(warehouses.length * 50 + 200) + 'ms'">
              <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-inner">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <p class="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px] group-hover:text-violet-500 transition-colors">Add Warehouse</p>
            </div>
          </div>
        }

        @if (activeTab === 'requests') {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all animate-premium-fade" style="animation-delay: 200ms">
            <div class="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'inventory.tabs.requests' | translate }}</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50">
                    <th class="px-8 py-6">{{ 'inventory.material' | translate }}</th>
                    <th class="px-8 py-6">{{ 'inventory.requested_by' | translate }}</th>
                    <th class="px-8 py-6">{{ 'inventory.quantity' | translate }}</th>
                    <th class="px-8 py-6">{{ 'inventory.date' | translate }}</th>
                    <th class="px-8 py-6">{{ 'inventory.status' | translate }}</th>
                    <th class="px-8 py-6 text-right">{{ 'inventory.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="text-slate-600 dark:text-slate-300">
                  @for (request of materialRequests; track request.id; let i = $index) {
                  <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-premium-fade"
                      [style.animation-delay]="(i * 30 + 400) + 'ms'">
                    <td class="px-8 py-6">
                      <p class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ request.materialName }}</p>
                    </td>
                    <td class="px-8 py-6">
                      <div class="flex items-center gap-3">
                         <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 font-black text-sm border border-slate-200 dark:border-white/5">
                            {{ request.requestedBy.charAt(0) }}
                         </div>
                         <p class="text-sm font-bold text-slate-600 dark:text-slate-400">{{ request.requestedBy }}</p>
                      </div>
                    </td>
                    <td class="px-8 py-6">
                      <span class="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 font-black text-sm shadow-sm ring-1 ring-indigo-500/20">{{ request.quantity }}</span>
                    </td>
                    <td class="px-8 py-6">
                      <p class="text-sm font-black text-slate-500 uppercase tracking-tighter">{{ request.requestDate | date:'mediumDate' }}</p>
                    </td>
                    <td class="px-8 py-6">
                      <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset"
                            [ngClass]="{
                              'bg-amber-500/10 text-amber-600 ring-amber-500/20': request.status === 'Pending',
                              'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20': request.status === 'Approved',
                              'bg-rose-500/10 text-rose-600 ring-rose-500/20': request.status === 'Rejected'
                            }">
                        {{ request.status | translate }}
                      </span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <div class="flex justify-end gap-2">
                        @if (request.status === 'Pending') {
                          <button (click)="approveRequest(request)" 
                                  class="px-6 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-black uppercase text-[9px] tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                            Approve
                          </button>
                          <button (click)="rejectRequest(request)" 
                                  class="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 font-black uppercase text-[9px] tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            Reject
                          </button>
                        } @else {
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-60">Completed</span>
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
