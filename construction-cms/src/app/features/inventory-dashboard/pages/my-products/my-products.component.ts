import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  VendorService,
  VendorProduct,
  CreateVendorProductRequest,
  UpdateVendorProductRequest
} from '../../../../core/services/vendor.service';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <span class="px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center border border-blue-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                {{ 'inventory_dashboard.catalog' | translate | uppercase }}
              </span>
            </div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'inventory_dashboard.my_products' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'inventory_dashboard.manage_inventory' | translate }}</p>
          </div>
          <button (click)="openAddModal()" class="group relative px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95">
            <span class="relative z-10 flex items-center gap-2">
              <svg class="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
              {{ 'inventory_dashboard.add_product' | translate }}
            </span>
          </button>
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
              <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{{ 'inventory_dashboard.failed_load' | translate }}</h3>
              <p class="text-sm text-rose-600 dark:text-rose-400 font-medium">{{ error }}</p>
            </div>
            <button (click)="loadProducts()" class="ml-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all">{{ 'inventory_dashboard.retry' | translate }}</button>
          </div>
        }

        <!-- Products Table -->
        @if (!loading && !error && products.length > 0) {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30">
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'inventory_dashboard.product_info' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'inventory_dashboard.category' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'inventory_dashboard.stock_status' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'inventory_dashboard.pricing' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'inventory_dashboard.status' | translate }}</th>
                    <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{{ 'inventory_dashboard.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                  @for (product of products; track product.id) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td class="px-8 py-6">
                        <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                            📦
                          </div>
                          <div>
                            <p class="font-black text-slate-900 dark:text-white leading-tight">{{ product.name }}</p>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ product.unit || 'Units' }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-8 py-6">
                        <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 uppercase">
                          {{ product.category || 'General' }}
                        </span>
                      </td>
                      <td class="px-8 py-6">
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center gap-2">
                             <span class="text-lg font-black text-slate-900 dark:text-white">{{ product.quantityInStock }}</span>
                             <span class="text-[10px] text-slate-400 font-bold tracking-tighter">{{ product.unit || 'units' }}</span>
                          </div>
                          <div class="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div class="h-full rounded-full transition-all duration-1000" 
                                  [ngClass]="getStockBarClass(product)"
                                  [style.width.%]="getStockPercent(product)"></div>
                          </div>
                        </div>
                      </td>
                      <td class="px-8 py-6">
                        <div class="flex flex-col">
                           <span class="text-sm font-black text-blue-600">{{ product.price | currency:'EGP':'EGP ':'1.0-0' }}</span>
                           <span class="text-[10px] text-slate-400 font-bold italic">Cost: {{ product.purchasePrice | currency:'EGP':'EGP ':'1.0-0' }}</span>
                        </div>
                      </td>
                      <td class="px-8 py-6">
                        <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                              [ngClass]="product.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-white/5'">
                          {{ product.isActive ? 'Active' : 'Hidden' }}
                        </span>
                      </td>
                      <td class="px-8 py-6">
                        <div class="flex items-center gap-2">
                          <button (click)="editProduct(product)" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all shadow-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button (click)="confirmDelete(product)" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else if (!loading && !error) {
          <!-- Empty State -->
          <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-16 text-center border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div class="w-24 h-24 mx-auto mb-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shadow-inner group hover:scale-110 transition-all duration-500">
              <svg class="w-12 h-12 text-slate-300 dark:text-slate-600 transition-colors group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase">No Products Found</h3>
            <p class="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-sm mx-auto italic">Your storefront is currently empty. Add your first product to start taking orders.</p>
            <button (click)="openAddModal()" class="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
              + Add First Product
            </button>
          </div>
        }

        <!-- ═══════════ ADD/EDIT MODAL ═══════════ -->
        @if (showAddModal || editingProduct) {
          <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300 animate-in fade-in">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-3xl border border-white/20 animate-in zoom-in-95 duration-300">
              <!-- Modal Header -->
              <div class="relative px-8 py-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <button (click)="closeModal()" class="absolute top-8 right-8 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex items-center gap-6">
                  <div class="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-2xl">
                    {{ editingProduct ? '📝' : '✨' }}
                  </div>
                  <div>
                    <h2 class="text-3xl font-black tracking-tight mb-1">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
                    <p class="text-blue-100 font-medium opacity-80">{{ editingProduct ? 'Update product details and pricing' : 'Create a new item in your store catalog' }}</p>
                  </div>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="px-10 py-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <form (ngSubmit)="saveProduct()" id="productForm" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Name (Full Width) -->
                  <div class="md:col-span-2">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Product Name *</label>
                    <input [(ngModel)]="formData.name" name="name" type="text" required placeholder="Enter product name"
                      class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold text-slate-800 dark:text-white">
                  </div>

                  <!-- Category -->
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Category</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">🏷️</div>
                      <input [(ngModel)]="formData.category" name="category" type="text" placeholder="e.g. Finishing"
                        class="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold text-slate-800 dark:text-white">
                    </div>
                  </div>

                  <!-- Unit -->
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Unit of Measure</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">📏</div>
                      <input [(ngModel)]="formData.unit" name="unit" type="text" placeholder="e.g. kg, m2, pcs"
                        class="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold text-slate-800 dark:text-white">
                    </div>
                  </div>

                  <!-- Selling Price -->
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Selling Price (EGP) *</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-blue-500 font-black">£</div>
                      <input [(ngModel)]="formData.price" name="price" type="number" step="0.01" required min="1"
                        class="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-black text-lg text-blue-600">
                    </div>
                  </div>

                  <!-- Cost Price -->
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Purchase Cost (EGP)</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 font-black">£</div>
                      <input [(ngModel)]="formData.purchasePrice" name="purchasePrice" type="number" step="0.01"
                        class="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold text-slate-800 dark:text-white">
                    </div>
                  </div>

                  <!-- Initial Stock -->
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Initial Stock Quantity</label>
                    <input [(ngModel)]="formData.quantityInStock" name="quantityInStock" type="number" step="0.01"
                      class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold text-slate-800 dark:text-white">
                  </div>

                  <!-- Low Stock Alert -->
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Low Stock Alert Level</label>
                    <input [(ngModel)]="formData.lowStockThreshold" name="lowStockThreshold" type="number" step="0.01"
                      class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold text-slate-800 dark:text-white">
                  </div>

                  <!-- Description (Full Width) -->
                  <div class="md:col-span-2">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Product Description</label>
                    <textarea [(ngModel)]="formData.description" name="description" rows="3" placeholder="Describe your product..."
                      class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-slate-800 dark:text-white resize-none"></textarea>
                  </div>

                  <!-- Active Toggle -->
                  @if (editingProduct) {
                    <div class="md:col-span-2 flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl">
                       <label class="relative inline-flex items-center cursor-pointer">
                        <input [(ngModel)]="formData.isActive" name="isActive" type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                      <div>
                         <p class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Public Visibility</p>
                         <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Show this product to customers</p>
                      </div>
                    </div>
                  }
                </form>
              </div>

              <!-- Modal Footer -->
              <div class="px-8 py-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-white/5 flex justify-end gap-4">
                <button type="button" (click)="closeModal()" class="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit" form="productForm" [disabled]="saving" class="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3">
                  @if (saving) {
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  } @else {
                    {{ editingProduct ? 'Update Product' : 'Create Product' }}
                  }
                </button>
              </div>
            </div>
          </div>
        }

        <!-- ═══════════ DELETE MODAL ═══════════ -->
        @if (deletingProduct) {
          <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 w-full max-w-sm text-center border border-white/20 animate-in zoom-in-95 duration-200">
              <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-3xl">⚠️</div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">Delete Product?</h2>
              <p class="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed italic">Are you sure you want to delete <span class="text-slate-900 dark:text-white font-black not-italic">"{{ deletingProduct.name }}"</span>? This action is permanent.</p>
              <div class="grid grid-cols-2 gap-4">
                <button (click)="deletingProduct = null" class="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button (click)="deleteProduct()" [disabled]="deleting" class="px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all">
                   {{ deleting ? '...' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class MyProductsComponent implements OnInit {
  products: VendorProduct[] = [];
  loading = true;
  error: string | null = null;

  showAddModal = false;
  editingProduct: VendorProduct | null = null;
  deletingProduct: VendorProduct | null = null;
  saving = false;
  deleting = false;
  formError: string | null = null;

  formData = {
    name: '',
    category: '',
    price: 0,
    unit: '',
    quantityInStock: 0,
    lowStockThreshold: 0,
    purchasePrice: 0,
    description: '',
    isActive: true
  };

  constructor(private vendorService: VendorService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.vendorService.getMyProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  getStockPercent(product: VendorProduct): number {
    if (product.quantityInStock <= 0) return 0;
    if (product.quantityInStock > 100) return 100;
    return product.quantityInStock;
  }

  getStockBarClass(product: VendorProduct): string {
    if (product.quantityInStock <= 0) return 'bg-rose-500';
    if (product.quantityInStock <= product.lowStockThreshold) return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  openAddModal(): void {
    this.closeModal();
    this.showAddModal = true;
  }

  editProduct(product: VendorProduct): void {
    this.editingProduct = product;
    this.formData = {
      name: product.name,
      category: product.category || '',
      price: product.price,
      unit: product.unit || '',
      quantityInStock: product.quantityInStock,
      lowStockThreshold: product.lowStockThreshold,
      purchasePrice: product.purchasePrice,
      description: product.description || '',
      isActive: product.isActive
    };
  }

  saveProduct(): void {
    this.formError = null;

    if (!this.formData.name || this.formData.price <= 0) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    this.saving = true;

    if (this.editingProduct) {
      // Update existing product
      const request: UpdateVendorProductRequest = {
        name: this.formData.name,
        category: this.formData.category || undefined,
        price: this.formData.price,
        unit: this.formData.unit || undefined,
        quantityInStock: this.formData.quantityInStock,
        lowStockThreshold: this.formData.lowStockThreshold,
        purchasePrice: this.formData.purchasePrice,
        description: this.formData.description || undefined,
        isActive: this.formData.isActive
      };

      this.vendorService.updateMyProduct(this.editingProduct.id, request).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.formError = 'Failed to update product. Please try again.';
          this.saving = false;
        }
      });
    } else {
      // Add new product
      const request: CreateVendorProductRequest = {
        name: this.formData.name,
        category: this.formData.category || undefined,
        price: this.formData.price,
        unit: this.formData.unit || undefined,
        description: this.formData.description || undefined,
        quantityInStock: this.formData.quantityInStock,
        lowStockThreshold: this.formData.lowStockThreshold,
        purchasePrice: this.formData.purchasePrice
      };

      this.vendorService.addMyProduct(request).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error adding product:', err);
          this.formError = 'Failed to add product. Please try again.';
          this.saving = false;
        }
      });
    }
  }

  confirmDelete(product: VendorProduct): void {
    this.deletingProduct = product;
  }

  deleteProduct(): void {
    if (!this.deletingProduct) return;

    this.deleting = true;

    this.vendorService.deleteProduct(this.deletingProduct.id).subscribe({
      next: () => {
        this.deleting = false;
        this.deletingProduct = null;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.deleting = false;
      }
    });
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingProduct = null;
    this.formError = null;
    this.formData = {
      name: '',
      category: '',
      price: 0,
      unit: '',
      quantityInStock: 0,
      lowStockThreshold: 0,
      purchasePrice: 0,
      description: '',
      isActive: true
    };
  }
}
