import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  VendorService,
  VendorProduct,
  VendorTransaction,
  CreateVendorTransactionRequest
} from '../../../../core/services/vendor.service';

@Component({
  selector: 'app-sales-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <span class="px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center border border-emerald-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                OPERATIONS
              </span>
            </div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sales & Activity Log</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Track your transactions and inventory movements</p>
          </div>
          <div class="flex gap-3">
            <button (click)="showRecordSaleModal = true" class="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 transition-all active:scale-95">
              + Record Sale
            </button>
            <button (click)="showAddStockModal = true" class="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95">
              + Add Stock
            </button>
          </div>
        </div>

        <!-- Loading State -->
        @if (loading) {
          <div class="flex justify-center items-center h-64">
            <div class="relative">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 animate-pulse shadow-lg shadow-emerald-500/30"></div>
              <div class="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 animate-ping opacity-20"></div>
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
              <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Failed to Load</h3>
              <p class="text-sm text-rose-600 dark:text-rose-400 font-medium">{{ error }}</p>
            </div>
            <button (click)="loadData()" class="ml-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all">Retry</button>
          </div>
        }

        @if (!loading && !error) {
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <!-- Total Sales Card -->
            <div class="bg-emerald-600 dark:bg-emerald-900/40 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Sales</p>
              <div class="flex items-end justify-between">
                <span class="text-4xl font-black tracking-tighter">{{ getSalesCount() }}</span>
                <span class="text-xl">📈</span>
              </div>
            </div>

            <!-- Total Revenue Card -->
            <div class="bg-blue-600 dark:bg-blue-900/40 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Revenue</p>
              <div class="flex items-end justify-between">
                <span class="text-3xl font-black tracking-tighter">{{ getSalesRevenue() | currency:'EGP':'EGP ':'1.0-0' }}</span>
                <span class="text-xl">💰</span>
              </div>
            </div>

            <!-- Stock Purchases Card -->
            <div class="bg-indigo-600 dark:bg-indigo-900/40 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Stock Purchases</p>
              <div class="flex items-end justify-between">
                <span class="text-4xl font-black tracking-tighter">{{ getPurchasesCount() }}</span>
                <span class="text-xl">📥</span>
              </div>
            </div>

            <!-- Total Transactions Card -->
            <div class="bg-slate-800 dark:bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group border border-white/5">
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <p class="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Activities</p>
              <div class="flex items-end justify-between">
                <span class="text-4xl font-black tracking-tighter">{{ transactions.length }}</span>
                <span class="text-xl">📋</span>
              </div>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="flex flex-wrap gap-2 mb-6">
            @for (tab of ['All', 'Sale', 'Purchase', 'Adjustment']; track tab) {
              <button (click)="applyFilter(tab === 'All' ? '' : tab)" 
                [ngClass]="(filterType === (tab === 'All' ? '' : tab)) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5'"
                class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                {{ tab }}
              </button>
            }
          </div>

          <!-- Transactions Table -->
          @if (filteredTransactions.length > 0) {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30">
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Transaction</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Product</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Qty & Price</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Total Amount</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Reference/Notes</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Date</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    @for (txn of filteredTransactions; track txn.id) {
                      <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td class="px-8 py-6">
                          <span [class]="getTypeBadgeClass(txn.transactionType)" class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border">
                            {{ txn.transactionType }}
                          </span>
                        </td>
                        <td class="px-8 py-6">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                              {{ txn.transactionType === 'Sale' ? '📤' : '📥' }}
                            </div>
                            <span class="font-black text-slate-900 dark:text-white">{{ txn.productName }}</span>
                          </div>
                        </td>
                        <td class="px-8 py-6">
                          <div class="flex flex-col">
                            <span class="text-sm font-bold" [ngClass]="txn.transactionType === 'Sale' || txn.transactionType === 'Loss' ? 'text-rose-500' : 'text-emerald-500'">
                              {{ txn.transactionType === 'Sale' || txn.transactionType === 'Loss' ? '-' : '+' }}{{ txn.quantity }}
                            </span>
                            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">@ {{ txn.unitPrice | currency:'EGP':'EGP ':'1.0-0' }}</span>
                          </div>
                        </td>
                        <td class="px-8 py-6">
                          <span class="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{{ txn.totalAmount | currency:'EGP':'EGP ':'1.0-0' }}</span>
                        </td>
                        <td class="px-8 py-6">
                          <div class="flex flex-col">
                            <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ txn.referenceNumber || '-' }}</span>
                            <span class="text-[10px] text-slate-400 italic truncate max-w-[150px]">{{ txn.notes || 'No notes' }}</span>
                          </div>
                        </td>
                        <td class="px-8 py-6">
                          <span class="text-sm text-slate-500 font-medium">{{ txn.transactionDate | date:'MMM d, y' }}</span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          } @else {
            <!-- Empty State -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="w-24 h-24 mx-auto mb-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-4xl shadow-inner group transition-all duration-500 hover:scale-110">
                🔍
              </div>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase">No Transactions</h3>
              <p class="text-slate-500 dark:text-slate-400 font-medium italic">We couldn't find any activities matching your filter.</p>
            </div>
          }
        }

        <!-- ═══════════ RECORD SALE MODAL ═══════════ -->
        @if (showRecordSaleModal) {
          <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300 animate-in fade-in">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-3xl border border-white/20 animate-in zoom-in-95 duration-300">
              <div class="relative px-8 py-10 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                <button (click)="closeSaleModal()" class="absolute top-8 right-8 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex items-center gap-6">
                  <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-2xl">📤</div>
                  <div>
                    <h2 class="text-2xl font-black tracking-tight mb-1">Record Sale</h2>
                    <p class="text-emerald-100 text-sm font-medium opacity-80">Mark a product as sold to a customer</p>
                  </div>
                </div>
              </div>

              <div class="px-8 py-8">
                <form (ngSubmit)="recordSale()" class="space-y-6">
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Select Product *</label>
                    <select [(ngModel)]="saleForm.vendorProductId" name="product" required
                      class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all font-bold text-slate-800 dark:text-white">
                      <option value="0" disabled>Select from your catalog</option>
                      @for (p of products; track p.id) {
                        <option [ngValue]="p.id">
                          {{ p.name }} (Stock: {{ p.quantityInStock }})
                        </option>
                      }
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Quantity *</label>
                      <input [(ngModel)]="saleForm.quantity" name="quantity" type="number" step="0.01" required min="0.01"
                        class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all font-black">
                    </div>
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Unit Price (EGP) *</label>
                      <input [(ngModel)]="saleForm.unitPrice" name="unitPrice" type="number" step="0.01" required min="0"
                        class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all font-black text-emerald-600">
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Reference Number</label>
                    <input [(ngModel)]="saleForm.referenceNumber" name="referenceNumber" type="text" placeholder="e.g. Receipt #1234"
                      class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all font-medium">
                  </div>
                  
                  @if (selectedProduct && saleForm.quantity > 0) {
                    <div class="px-5 py-4 rounded-2xl" [ngClass]="saleForm.quantity > selectedProduct.quantityInStock ? 'bg-rose-50 dark:bg-rose-500/10 border border-rose-100' : 'bg-slate-50 dark:bg-slate-950 border border-slate-100'">
                      @if (saleForm.quantity > selectedProduct.quantityInStock) {
                        <div class="flex items-center gap-3 text-rose-600">
                          <span class="text-lg">⚠️</span>
                          <div>
                            <p class="text-xs font-black uppercase tracking-tight">Stock Warning</p>
                            <p class="text-[10px] font-bold">Only {{ selectedProduct.quantityInStock }} available.</p>
                          </div>
                        </div>
                      } @else {
                        <div class="flex items-center justify-between text-slate-500">
                          <span class="text-xs font-bold uppercase tracking-widest">Post-Sale Stock</span>
                          <span class="font-black text-slate-900 dark:text-emerald-500">{{ selectedProduct.quantityInStock - saleForm.quantity | number:'1.0-1' }}</span>
                        </div>
                      }
                    </div>
                  }

                  <div class="flex justify-end gap-3 pt-4">
                    <button type="button" (click)="closeSaleModal()" class="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                      Cancel
                    </button>
                    <button type="submit" [disabled]="saving" class="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3">
                      {{ saving ? 'Recording...' : 'Record Sale' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        }

        <!-- ═══════════ ADD STOCK MODAL ═══════════ -->
        @if (showAddStockModal) {
          <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300 animate-in fade-in">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-3xl border border-white/20 animate-in zoom-in-95 duration-300">
              <div class="relative px-8 py-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <button (click)="closeStockModal()" class="absolute top-8 right-8 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex items-center gap-6">
                  <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-2xl">📥</div>
                  <div>
                    <h2 class="text-2xl font-black tracking-tight mb-1">Add Stock</h2>
                    <p class="text-blue-100 text-sm font-medium opacity-80">Update inventory for a product purchase</p>
                  </div>
                </div>
              </div>

              <div class="px-8 py-8">
                <form (ngSubmit)="addStock()" class="space-y-6">
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Select Product *</label>
                    <select [(ngModel)]="stockForm.vendorProductId" name="product" required
                      class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold text-slate-800 dark:text-white">
                      <option value="0" disabled>Select from your catalog</option>
                      @for (p of products; track p.id) {
                        <option [ngValue]="p.id">
                          {{ p.name }} (Current: {{ p.quantityInStock }})
                        </option>
                      }
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">New Quantity *</label>
                      <input [(ngModel)]="stockForm.quantity" name="quantity" type="number" step="0.01" required min="0.01"
                        class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-black text-blue-600">
                    </div>
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Cost Per Unit (EGP) *</label>
                      <input [(ngModel)]="stockForm.unitPrice" name="unitPrice" type="number" step="0.01" required min="0"
                        class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold">
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Purchase Reference</label>
                    <input [(ngModel)]="stockForm.referenceNumber" name="referenceNumber" type="text" placeholder="e.g. Supplier Invoice #abc"
                      class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium">
                  </div>

                  <div class="flex justify-end gap-3 pt-4">
                    <button type="button" (click)="closeStockModal()" class="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                      Cancel
                    </button>
                    <button type="submit" [disabled]="saving" class="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3">
                      {{ saving ? 'Saving...' : 'Add Stock' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SalesLogComponent implements OnInit {
  transactions: VendorTransaction[] = [];
  filteredTransactions: VendorTransaction[] = [];
  products: VendorProduct[] = [];
  loading = true;
  error: string | null = null;
  filterType = '';

  showRecordSaleModal = false;
  showAddStockModal = false;
  saving = false;
  formError: string | null = null;

  saleForm = {
    vendorProductId: 0,
    quantity: 0,
    unitPrice: 0,
    referenceNumber: '',
    notes: ''
  };

  stockForm = {
    vendorProductId: 0,
    quantity: 0,
    unitPrice: 0,
    referenceNumber: '',
    notes: ''
  };

  constructor(private vendorService: VendorService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    Promise.all([
      firstValueFrom(this.vendorService.getMyTransactions()),
      firstValueFrom(this.vendorService.getMyProducts())
    ]).then(([transactions, products]) => {
      this.transactions = transactions || [];
      this.products = products || [];
      this.filteredTransactions = [...this.transactions];
      this.loading = false;
    }).catch(err => {
      console.error('Error loading data:', err);
      this.error = 'Failed to load data. Please try again.';
      this.loading = false;
    });
  }

  get selectedProduct(): VendorProduct | undefined {
    return this.products.find(p => p.id === this.saleForm.vendorProductId);
  }

  filterTransactions(): void {
    if (!this.filterType) {
      this.filteredTransactions = [...this.transactions];
    } else {
      this.filteredTransactions = this.transactions.filter(t => t.transactionType === this.filterType);
    }
  }

  applyFilter(type: string): void {
    this.filterType = type;
    this.filterTransactions();
  }

  getTypeBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'Sale': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      'Purchase': 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      'Adjustment': 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      'InitialStock': 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      'Return': 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
      'Loss': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
    };
    return classes[type] || 'bg-slate-50 text-slate-600 border-slate-100';
  }

  getSalesCount(): number {
    return this.transactions.filter(t => t.transactionType === 'Sale').length;
  }

  getSalesRevenue(): number {
    return this.transactions
      .filter(t => t.transactionType === 'Sale')
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  }

  getPurchasesCount(): number {
    return this.transactions.filter(t => t.transactionType === 'Purchase').length;
  }

  recordSale(): void {
    this.formError = null;

    if (!this.saleForm.vendorProductId || this.saleForm.quantity <= 0 || this.saleForm.unitPrice <= 0) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    this.saving = true;

    const request: CreateVendorTransactionRequest = {
      vendorProductId: this.saleForm.vendorProductId,
      transactionType: 'Sale',
      quantity: this.saleForm.quantity,
      unitPrice: this.saleForm.unitPrice,
      referenceNumber: this.saleForm.referenceNumber || undefined,
      notes: this.saleForm.notes || undefined
    };

    this.vendorService.recordTransaction(request).subscribe({
      next: () => {
        this.saving = false;
        this.closeSaleModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error recording sale:', err);
        this.formError = 'Failed to record sale. Please try again.';
        this.saving = false;
      }
    });
  }

  addStock(): void {
    this.formError = null;

    if (!this.stockForm.vendorProductId || this.stockForm.quantity <= 0 || this.stockForm.unitPrice <= 0) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    this.saving = true;

    const request: CreateVendorTransactionRequest = {
      vendorProductId: this.stockForm.vendorProductId,
      transactionType: 'Purchase',
      quantity: this.stockForm.quantity,
      unitPrice: this.stockForm.unitPrice,
      referenceNumber: this.stockForm.referenceNumber || undefined,
      notes: this.stockForm.notes || undefined
    };

    this.vendorService.recordTransaction(request).subscribe({
      next: () => {
        this.saving = false;
        this.closeStockModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error adding stock:', err);
        this.formError = 'Failed to add stock. Please try again.';
        this.saving = false;
      }
    });
  }

  closeSaleModal(): void {
    this.showRecordSaleModal = false;
    this.formError = null;
    this.saleForm = {
      vendorProductId: 0,
      quantity: 0,
      unitPrice: 0,
      referenceNumber: '',
      notes: ''
    };
  }

  closeStockModal(): void {
    this.showAddStockModal = false;
    this.formError = null;
    this.stockForm = {
      vendorProductId: 0,
      quantity: 0,
      unitPrice: 0,
      referenceNumber: '',
      notes: ''
    };
  }
}
