
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
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{{ 'inventory.title' | translate }}</h1>
            <div class="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit border border-slate-200 dark:border-white/5">
              <button (click)="activeTab = 'materials'" 
                      [class.bg-white]="activeTab === 'materials'" 
                      [class.dark:bg-slate-800]="activeTab === 'materials'"
                      [class.text-slate-900]="activeTab === 'materials'"
                      [class.dark:text-white]="activeTab === 'materials'"
                      [class.shadow-xl]="activeTab === 'materials'"
                      class="px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 transition-all duration-300 hover:text-slate-700 dark:hover:text-slate-300">
                  {{ 'inventory.tabs.materials' | translate }}
              </button>
              <button (click)="activeTab = 'warehouses'" 
                      [class.bg-white]="activeTab === 'warehouses'" 
                      [class.dark:bg-slate-800]="activeTab === 'warehouses'"
                      [class.text-slate-900]="activeTab === 'warehouses'"
                      [class.dark:text-white]="activeTab === 'warehouses'"
                      [class.shadow-xl]="activeTab === 'warehouses'"
                      class="px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 transition-all duration-300 hover:text-slate-700 dark:hover:text-slate-300">
                  {{ 'inventory.tabs.warehouses' | translate }}
              </button>
              <button (click)="activeTab = 'requests'" 
                      [class.bg-white]="activeTab === 'requests'" 
                      [class.dark:bg-slate-800]="activeTab === 'requests'"
                      [class.text-slate-900]="activeTab === 'requests'"
                      [class.dark:text-white]="activeTab === 'requests'"
                      [class.shadow-xl]="activeTab === 'requests'"
                      class="px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 transition-all duration-300 hover:text-slate-700 dark:hover:text-slate-300">
                  {{ 'inventory.tabs.requests' | translate }}
              </button>
            </div>
          </div>
          <button (click)="openAddModal()" 
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            + Add New
          </button>
        </div>

        @if (activeTab === 'materials') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (material of materials; track material.id) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 group">
               <div class="flex items-start justify-between mb-4">
                 <div class="flex items-center space-x-3">
                   <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                     </svg>
                   </div>
                   <div>
                     <h3 class="font-bold text-slate-900 dark:text-white">{{ material.name }}</h3>
                     <span class="text-xs text-violet-500 font-medium uppercase">{{ material.category }}</span>
                   </div>
                 </div>
                 <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase" 
                       [class.bg-green-500/10]="material.quantity > material.reorderPoint"
                       [class.text-green-500]="material.quantity > material.reorderPoint"
                       [class.bg-amber-500/10]="material.quantity <= material.reorderPoint"
                       [class.text-amber-500]="material.quantity <= material.reorderPoint">
                   {{ material.quantity > material.reorderPoint ? 'In Stock' : 'Low Stock' }}
                 </span>
               </div>
               
               <div class="grid grid-cols-3 gap-4 mb-4">
                 <div class="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                   <p class="text-[10px] text-slate-400 uppercase tracking-widest">Stock</p>
                   <p class="text-lg font-black text-slate-900 dark:text-white">{{ material.quantity }}</p>
                   <p class="text-[8px] text-slate-500">{{ material.unit }}</p>
                 </div>
                 <div class="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                   <p class="text-[10px] text-slate-400 uppercase tracking-widest">Price</p>
                   <p class="text-lg font-black text-slate-900 dark:text-white">{{ material.unitPrice | currency }}</p>
                 </div>
                 <div class="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                   <p class="text-[10px] text-slate-400 uppercase tracking-widest">Reorder</p>
                   <p class="text-lg font-black text-slate-900 dark:text-white">{{ material.reorderPoint }}</p>
                 </div>
               </div>
               
               <div class="flex space-x-2">
                 <button class="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase hover:bg-violet-500 hover:text-white transition-all">
                   Edit
                 </button>
                 <button class="flex-1 py-3 rounded-xl bg-violet-500 text-white font-bold text-xs uppercase shadow-lg shadow-violet-500/20 hover:bg-violet-600 transition-all">
                   Request
                 </button>
               </div>
            </div>
            }
          </div>
        }

        @if (activeTab === 'warehouses') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (warehouse of warehouses; track warehouse.id) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
               <div class="flex items-start justify-between mb-4">
                 <div class="flex items-center space-x-3">
                   <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                     </svg>
                   </div>
                   <div>
                     <h3 class="font-bold text-slate-900 dark:text-white">{{ warehouse.name }}</h3>
                     <p class="text-xs text-slate-500">{{ warehouse.location }}</p>
                   </div>
                 </div>
                 @if (warehouse.isMain) {
                   <span class="px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-black uppercase">Main</span>
                 }
               </div>
               
               <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 mb-4">
                 <div class="flex justify-between items-center">
                   <span class="text-xs text-slate-400 uppercase tracking-widest">Stock</span>
                   <span class="text-xl font-black text-violet-500">{{ getWarehouseStock(warehouse.id) }}</span>
                 </div>
               </div>
               
               <div class="flex space-x-2">
                 <button class="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase hover:bg-violet-500 hover:text-white transition-all">
                   Edit
                 </button>
                 <button class="flex-1 py-3 rounded-xl bg-violet-500 text-white font-bold text-xs uppercase shadow-lg shadow-violet-500/20 hover:bg-violet-600 transition-all">
                   View
                 </button>
               </div>
            </div>
            }
            
            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all group">
              <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white transition-all">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <p class="font-bold text-slate-600 dark:text-slate-400">Add Warehouse</p>
            </div>
          </div>
        }

        @if (activeTab === 'requests') {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50 dark:bg-slate-950/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested By</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (request of materialRequests; track request.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-6 py-4">
                      <p class="font-bold text-slate-900 dark:text-white">{{ request.materialName }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-slate-600 dark:text-slate-400">{{ request.requestedBy }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm">{{ request.quantity }}</span>
                    </td>
                    <td class="-4">
                      <p class="px-6 pytext-sm text-slate-500">{{ request.requestDate }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                            [class.bg-amber-500/10]="request.status === 'Pending'"
                            [class.text-amber-500]="request.status === 'Pending'"
                            [class.bg-green-500/10]="request.status === 'Approved'"
                            [class.text-green-500]="request.status === 'Approved'"
                            [class.bg-red-500/10]="request.status === 'Rejected'"
                            [class.text-red-500]="request.status === 'Rejected'">
                        {{ request.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      @if (request.status === 'Pending') {
                        <button (click)="approveRequest(request)" class="px-4 py-2 rounded-xl bg-green-500 text-white font-bold text-xs uppercase shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all mr-2">
                          Approve
                        </button>
                        <button (click)="rejectRequest(request)" class="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs uppercase shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">
                          Reject
                        </button>
                      } @else {
                        <span class="text-xs text-slate-400">Completed</span>
                      }
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
