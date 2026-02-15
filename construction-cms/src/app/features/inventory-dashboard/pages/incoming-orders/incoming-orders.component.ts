import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService, VendorInvoice } from '../../../../core/services/vendor.service';

@Component({
  selector: 'app-incoming-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <span class="px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center border border-blue-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                B2B SALES
              </span>
            </div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Incoming Orders</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Manage purchase requests from construction companies</p>
          </div>
          
          <div class="relative group">
            <select [(ngModel)]="statusFilter" (change)="filterOrders()" 
              class="appearance-none px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 min-w-[180px]">
              <option value="">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div class="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (loading) {
          <div class="flex justify-center items-center h-64">
            <div class="relative">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse shadow-lg shadow-blue-500/30"></div>
              <div class="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-ping opacity-20"></div>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (error) {
          <div class="bg-rose-500/5 dark:bg-rose-500/10 rounded-3xl p-8 border border-rose-500/20 shadow-sm mb-8 flex items-center gap-6">
            <div class="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Failed to Load Orders</h3>
              <p class="text-sm text-rose-600 dark:text-rose-400 font-medium">{{ error }}</p>
            </div>
            <button (click)="loadOrders()" class="ml-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all">Retry</button>
          </div>
        }

        @if (!loading && !error) {
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <!-- Total Orders -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Orders</p>
              <div class="flex items-end justify-between">
                <span class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ orders.length }}</span>
                <span class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl">📦</span>
              </div>
            </div>

            <!-- Pending Orders -->
            <div class="bg-amber-500 rounded-3xl p-6 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden group">
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Pending Review</p>
              <div class="flex items-end justify-between">
                <span class="text-4xl font-black tracking-tighter">{{ getPendingCount() }}</span>
                <span class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">⏳</span>
              </div>
            </div>

            <!-- Approved Orders -->
            <div class="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Approved</p>
              <div class="flex items-end justify-between">
                <span class="text-4xl font-black tracking-tighter">{{ getApprovedCount() }}</span>
                <span class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">✅</span>
              </div>
            </div>

            <!-- Total Order Value -->
            <div class="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Order Value</p>
              <div class="flex items-end justify-between">
                <span class="text-3xl font-black tracking-tighter">{{ getTotalValue() | currency:'EGP':'EGP ':'1.0-0' }}</span>
                <span class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">💰</span>
              </div>
            </div>
          </div>

          <!-- Orders Table -->
          @if (filteredOrders.length > 0) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30">
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Order Info</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Company & Project</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Items</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    @for (order of filteredOrders; track order.id) {
                      <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td class="px-8 py-6">
                           <div class="flex flex-col">
                             <span class="font-black text-slate-900 dark:text-white">{{ order.invoiceNumber }}</span>
                             <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ order.invoiceDate | date:'MMM d, y' }}</span>
                           </div>
                        </td>
                        <td class="px-8 py-6">
                          <div class="flex flex-col">
                            <span class="text-sm font-black text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{{ order.createdByUserName || 'Construction Co.' }}</span>
                            <span class="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{{ order.projectName || 'General Project' }}</span>
                          </div>
                        </td>
                        <td class="px-8 py-6">
                           <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">
                            {{ order.materialType || 'General Material' }}
                          </span>
                        </td>
                        <td class="px-8 py-6">
                          <span class="text-lg font-black text-blue-600 tracking-tighter">{{ order.amount | currency:'EGP':'EGP ':'1.0-0' }}</span>
                        </td>
                        <td class="px-8 py-6">
                          <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border" [ngClass]="getStatusBadgeClass(order.approvalStatus)">
                            {{ order.approvalStatus }}
                          </span>
                        </td>
                        <td class="px-8 py-6">
                          <button (click)="viewOrderDetails(order)" class="group/btn relative px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95 shadow-sm overflow-hidden">
                             <span class="relative z-10 flex items-center gap-2">
                               DETAILS
                               <svg class="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M9 5l7 7-7 7"></path></svg>
                             </span>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          } @else {
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="w-24 h-24 mx-auto mb-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-4xl shadow-inner group transition-all duration-500 hover:scale-110">
                📫
              </div>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase">No Orders Inbox</h3>
              <p class="text-slate-500 dark:text-slate-400 font-medium italic">New orders from construction companies will appear here.</p>
            </div>
          }
        }

        <!-- ═══════════ ORDER DETAILS MODAL ═══════════ -->
        @if (selectedOrder) {
          <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4 transition-all duration-300 animate-in fade-in">
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-3xl border border-white/20 animate-in zoom-in-95 duration-300">
              <!-- Modal Header -->
              <div class="relative px-10 py-12 bg-gradient-to-br from-slate-800 to-slate-950 text-white">
                <button (click)="selectedOrder = null" class="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex items-center gap-8">
                  <div class="w-24 h-24 rounded-[2.5rem] bg-white/10 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl border border-white/10">
                     <span class="text-[10px] font-black uppercase tracking-tighter opacity-60">PRICE</span>
                     <span class="text-2xl font-black tracking-tighter">EGP</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-3 mb-2">
                      <span class="px-3 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-black tracking-widest">{{ selectedOrder.invoiceNumber }}</span>
                      <span class="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-[10px] font-black tracking-widest">{{ selectedOrder.approvalStatus | uppercase }}</span>
                    </div>
                    <h2 class="text-4xl font-black tracking-tight mb-1">{{ selectedOrder.amount | currency:'EGP':'EGP ':'1.0-0' }}</h2>
                    <p class="text-slate-400 font-black tracking-widest uppercase text-xs">{{ selectedOrder.materialType || 'General Material Purchase' }}</p>
                  </div>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="px-12 py-12">
                 <div class="grid grid-cols-2 gap-x-12 gap-y-10 mb-12">
                    <div>
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Customer Entity</p>
                       <p class="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">{{ selectedOrder.createdByUserName || 'Company Partner' }}</p>
                       <p class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {{ selectedOrder.projectName || 'Designated Project' }}
                       </p>
                    </div>
                    <div>
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Request Date</p>
                       <p class="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">{{ selectedOrder.invoiceDate | date:'MMMM d, y' }}</p>
                       <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Submission Timestamp</p>
                    </div>
                    <div class="col-span-2">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Request Scope / Description</p>
                       <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 italic text-slate-600 dark:text-slate-400 font-medium">
                          {{ selectedOrder.description || 'No specific description provided with this request.' }}
                       </div>
                    </div>
                 </div>

                 <!-- Footer Details -->
                 <div class="flex flex-wrap gap-4 items-center justify-between pt-10 border-t border-slate-100 dark:border-white/5">
                    @if (selectedOrder.fileUrl) {
                      <a [href]="selectedOrder.fileUrl" target="_blank" class="flex items-center gap-4 group cursor-pointer">
                        <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div>
                           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attached Document</p>
                           <p class="text-xs font-black text-blue-600 group-hover:underline uppercase tracking-tight">{{ selectedOrder.originalFileName || 'View Invoice Copy' }}</p>
                        </div>
                      </a>
                    }

                    <div class="flex gap-4 ml-auto">
                        <button (click)="selectedOrder = null" class="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/30 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all">
                          CLOSE VIEW
                        </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class IncomingOrdersComponent implements OnInit {
  orders: VendorInvoice[] = [];
  filteredOrders: VendorInvoice[] = [];
  loading = true;
  error: string | null = null;
  statusFilter = '';
  selectedOrder: VendorInvoice | null = null;

  constructor(private vendorService: VendorService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.vendorService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.filteredOrders = [...this.orders];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    if (!this.statusFilter) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(o =>
        o.approvalStatus?.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }
  }

  getStatusBadgeClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'approved') return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    if (s === 'rejected') return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    if (s === 'pending') return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  }

  getPendingCount(): number {
    return this.orders.filter(o => o.approvalStatus?.toLowerCase() === 'pending').length;
  }

  getApprovedCount(): number {
    return this.orders.filter(o => o.approvalStatus?.toLowerCase() === 'approved').length;
  }

  getTotalValue(): number {
    return this.orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  }

  viewOrderDetails(order: VendorInvoice): void {
    this.selectedOrder = order;
  }
}
